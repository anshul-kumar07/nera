// lib/resource-coordination.ts
// ========================================================================
//    NERA PHASE 19: REGIONAL RESOURCE COORDINATION, MULTI-MISSION
//                  ORCHESTRATION & EMERGENCY SUPPLY NETWORK
// ========================================================================

import {
  CommodityType,
  DepotInventory,
  DEMO_DEPOT_INVENTORIES,
  DistrictLogisticsProfile,
  DEMO_DISTRICT_PROFILES,
} from './supply-demand'
import {
  LogisticsPriorityLevel,
} from './logistics-priority'
import {
  evaluateVehicleReadiness,
  ReadinessStatus,
  VehicleSafetyRecord,
  DEMO_VEHICLE_SAFETY_RECORDS,
} from './vehicle-readiness'
import { calculateHaversineKm } from './routing-algorithm'
import { Mission } from './mission-management'
import { Incident } from './supabase'

// ── 1. Resource Registry Data Types ──

export type ResourceType =
  | 'VEHICLE'
  | 'DEPOT'
  | 'COMMODITY'
  | 'FIELD_TEAM'
  | 'EMERGENCY_EQUIPMENT'

export type ResourceAvailabilityStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'ASSIGNED'
  | 'IN_TRANSIT'
  | 'UNAVAILABLE'
  | 'OUT_OF_SERVICE'
  | 'DATA_INSUFFICIENT'

export interface RegionalResource {
  resourceId: string
  resourceType: ResourceType
  name: string
  location: { lat: number; lng: number; name?: string }
  status: ResourceAvailabilityStatus
  currentAssignment: { missionId?: string; crisisId?: string; task?: string } | null
  capacity: { value: number; unit: string } | null
  readinessStatus?: ReadinessStatus // For vehicles (Phase 11 safety gate)
  aiRiskLevel?: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL' // Advisory (Phase 15)
  lastUpdated: string
  dataSource: 'STATE_DISASTER_REGISTRY' | 'TELEMETRY' | 'FIELD_REPORT' | 'SIMULATED'
  isSimulated: boolean
}

// ── 2. Resource Reservation Lifecycle ──

export type ReservationStatus =
  | 'AVAILABLE'
  | 'RESERVATION_REQUESTED'
  | 'RESERVED'
  | 'ASSIGNED'
  | 'RELEASED'
  | 'CANCELLED'

export interface ResourceReservation {
  reservationId: string
  resourceId: string
  resourceType: ResourceType
  missionId: string
  quantity?: number
  unit?: string
  requestedBy: string
  requestedAt: string
  expectedRelease: string | null
  status: ReservationStatus
  auditRecord: {
    operator: string
    timestamp: string
    reason: string
  }
  isSimulated: boolean
}

// ── 3. Resource Conflict Detection ──

export type ConflictType =
  | 'VEHICLE_DOUBLE_ASSIGNMENT'
  | 'INSUFFICIENT_DEPOT_STOCK'
  | 'OVERLAPPING_RESERVATIONS'
  | 'VEHICLE_UNAVAILABLE'
  | 'VEHICLE_FAILED'
  | 'VEHICLE_UNDER_MAINTENANCE'
  | 'ROUTE_CONFLICT'
  | 'INSUFFICIENT_CAPACITY'
  | 'MISSING_RESOURCE_INFO'
  | 'LAST_MILE_RESOURCE_GAP'

export interface ResourceConflict {
  conflictId: string
  type: ConflictType
  resourceId: string
  resourceName: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  competingMissions: string[]
  competingCrises: string[]
  description: string
  recommendedResolution: string
  requiresHumanReview: boolean
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED'
  isSimulated: boolean
}

// ── 4. Mission-Level Resource Readiness ──

export type MissionResourceOverallReadiness =
  | 'READY'
  | 'READY_WITH_WARNING'
  | 'BLOCKED'
  | 'DATA_INSUFFICIENT'

export interface MissionResourceDependencyStatus {
  missionId: string
  overallStatus: MissionResourceOverallReadiness
  dependencies: {
    vehicle: {
      status: 'READY' | 'READY_WITH_WARNING' | 'NOT_READY' | 'DATA_INSUFFICIENT'
      id: string
      notes?: string
    }
    cargo: {
      status: 'RESERVED' | 'AVAILABLE' | 'INSUFFICIENT' | 'DATA_INSUFFICIENT'
      details: string
    }
    route: {
      status: 'FEASIBLE' | 'BLOCKED' | 'WARNING'
      routeName: string
    }
    lastMile: {
      status: 'DIRECT_ACCESS' | 'FIELD_VERIFICATION_REQUIRED' | 'INACCESSIBLE'
      mode: string
    }
    fieldTeam: {
      status: 'AVAILABLE' | 'FIELD_VERIFICATION_REQUIRED' | 'UNAVAILABLE'
      details: string
    }
  }
  blockingReasons: string[]
  actionRequired: string
}

// ── 5. Controlled Baseline Resource Registry ──

export const INITIAL_REGIONAL_RESOURCES: Record<string, RegionalResource> = {
  'RES-VEH-18': {
    resourceId: 'NER-TRUCK-18',
    resourceType: 'VEHICLE',
    name: 'Tata Signa Heavy Multi-Axle 16T (NER-TRUCK-18)',
    location: { lat: 26.1445, lng: 91.7362, name: 'Guwahati Apex Logistics Hub' },
    status: 'AVAILABLE',
    currentAssignment: null,
    capacity: { value: 16000, unit: 'kg' },
    readinessStatus: 'READY',
    aiRiskLevel: 'LOW',
    lastUpdated: '2026-08-29T06:00:00Z',
    dataSource: 'TELEMETRY',
    isSimulated: true,
  },
  'RES-VEH-07': {
    resourceId: 'NER-TRUCK-07',
    resourceType: 'VEHICLE',
    name: 'Ashok Leyland Captain 12T (NER-TRUCK-07)',
    location: { lat: 25.9043, lng: 93.7440, name: 'Dimapur Railhead' },
    status: 'AVAILABLE',
    currentAssignment: null,
    capacity: { value: 12000, unit: 'kg' },
    readinessStatus: 'READY',
    aiRiskLevel: 'LOW',
    lastUpdated: '2026-08-29T06:00:00Z',
    dataSource: 'TELEMETRY',
    isSimulated: true,
  },
  'RES-VEH-04': {
    resourceId: 'NER-TRUCK-04',
    resourceType: 'VEHICLE',
    name: 'Mahindra Bolero 4x4 Hill Carrier 5T (NER-TRUCK-04)',
    location: { lat: 25.5788, lng: 91.8933, name: 'Shillong Depot' },
    status: 'AVAILABLE',
    currentAssignment: null,
    capacity: { value: 5000, unit: 'kg' },
    readinessStatus: 'READY',
    aiRiskLevel: 'LOW',
    lastUpdated: '2026-08-29T06:00:00Z',
    dataSource: 'TELEMETRY',
    isSimulated: true,
  },
  'RES-VEH-99': {
    resourceId: 'NER-TRUCK-99',
    resourceType: 'VEHICLE',
    name: 'Tata LPT Hill Truck (NER-TRUCK-99)',
    location: { lat: 24.8333, lng: 92.7789, name: 'Silchar Depot' },
    status: 'UNAVAILABLE',
    currentAssignment: null,
    capacity: { value: 10000, unit: 'kg' },
    readinessStatus: 'NOT_READY',
    aiRiskLevel: 'HIGH',
    lastUpdated: '2026-08-29T06:00:00Z',
    dataSource: 'TELEMETRY',
    isSimulated: true,
  },
  'RES-TEAM-SDRF-01': {
    resourceId: 'TEAM-SDRF-01',
    resourceType: 'FIELD_TEAM',
    name: 'SDRF 1st Mountain Rescue & Cargo Unit',
    location: { lat: 25.1843, lng: 93.0182, name: 'Haflong Base' },
    status: 'AVAILABLE',
    currentAssignment: null,
    capacity: { value: 20, unit: 'personnel' },
    lastUpdated: '2026-08-29T06:00:00Z',
    dataSource: 'FIELD_REPORT',
    isSimulated: true,
  },
}

// ── 6. Resource Conflict Detector Engine ──
export function detectResourceConflicts(params: {
  activeMissions: Mission[]
  pendingReservations: ResourceReservation[]
  resources?: Record<string, RegionalResource>
  depots?: Record<string, DepotInventory>
  safetyRecords?: Record<string, VehicleSafetyRecord>
}): ResourceConflict[] {
  const conflicts: ResourceConflict[] = []
  const resources = params.resources || INITIAL_REGIONAL_RESOURCES
  const depots = params.depots || DEMO_DEPOT_INVENTORIES
  const safety = params.safetyRecords || DEMO_VEHICLE_SAFETY_RECORDS

  // 1. Detect Vehicle Double-Assignment across active missions
  const vehicleToMissions: Record<string, string[]> = {}
  for (const m of params.activeMissions) {
    if (m.assignedVehicleId && m.status !== 'COMPLETED' && m.status !== 'CANCELLED' && m.status !== 'REJECTED') {
      if (!vehicleToMissions[m.assignedVehicleId]) vehicleToMissions[m.assignedVehicleId] = []
      vehicleToMissions[m.assignedVehicleId].push(m.id)
    }
  }

  for (const [vehicleId, mIds] of Object.entries(vehicleToMissions)) {
    if (mIds.length > 1) {
      conflicts.push({
        conflictId: `CONF-DBL-${vehicleId}`,
        type: 'VEHICLE_DOUBLE_ASSIGNMENT',
        resourceId: vehicleId,
        resourceName: `Carrier ${vehicleId}`,
        severity: 'HIGH',
        competingMissions: mIds,
        competingCrises: [],
        description: `Carrier ${vehicleId} is simultaneously assigned to ${mIds.length} active emergency missions (${mIds.join(', ')}).`,
        recommendedResolution: `Keep ${vehicleId} assigned to primary mission ${mIds[0]} and assign an alternate verified READY carrier to ${mIds.slice(1).join(', ')}.`,
        requiresHumanReview: true,
        status: 'OPEN',
        isSimulated: true,
      })
    }
  }

  // 2. Detect Safety Ineligibility for Assigned Vehicles
  for (const m of params.activeMissions) {
    if (m.assignedVehicleId && m.status !== 'COMPLETED') {
      const record = safety[m.assignedVehicleId]
      if (record) {
        const evalResult = evaluateVehicleReadiness(record)
        if (!evalResult.isEligibleForEmergencyDeployment) {
          conflicts.push({
            conflictId: `CONF-SAFETY-${m.assignedVehicleId}-${m.id}`,
            type: 'VEHICLE_UNAVAILABLE',
            resourceId: m.assignedVehicleId,
            resourceName: `Carrier ${m.assignedVehicleId}`,
            severity: 'CRITICAL',
            competingMissions: [m.id],
            competingCrises: [],
            description: `Carrier ${m.assignedVehicleId} assigned to mission ${m.id} failed Phase 11 safety gate (${evalResult.status}).`,
            recommendedResolution: `Initiate Phase 13 emergency replacement workflow for mission ${m.id}.`,
            requiresHumanReview: true,
            status: 'OPEN',
            isSimulated: true,
          })
        }
      }
    }
  }

  // 3. Detect Depot Commodity Over-Allocation
  const depotDemands: Record<string, Record<CommodityType, number>> = {}
  for (const res of params.pendingReservations) {
    if (res.status === 'RESERVED' && res.quantity && res.unit) {
      // Find depot
      const commType = res.unit.toUpperCase().includes('KIT') ? 'MEDICINES' : 'FOOD'
      if (!depotDemands[res.resourceId]) {
        depotDemands[res.resourceId] = {
          MEDICINES: 0,
          FOOD: 0,
          DRINKING_WATER: 0,
          FUEL: 0,
          CONSTRUCTION_MATERIAL: 0,
          EMERGENCY_EQUIPMENT: 0,
        }
      }
      depotDemands[res.resourceId][commType] += res.quantity
    }
  }

  for (const [depotId, demands] of Object.entries(depotDemands)) {
    const depot = depots[depotId]
    if (depot) {
      for (const [comm, requestedQty] of Object.entries(demands)) {
        const stock = depot.commodities[comm as CommodityType]
        if (stock && requestedQty > stock.available + stock.reserved) {
          conflicts.push({
            conflictId: `CONF-STOCK-${depotId}-${comm}`,
            type: 'INSUFFICIENT_DEPOT_STOCK',
            resourceId: depotId,
            resourceName: depot.name,
            severity: 'HIGH',
            competingMissions: [],
            competingCrises: [],
            description: `Depot ${depot.name} has total demand of ${requestedQty} ${stock.unit} exceeding total stock of ${stock.available + stock.reserved} ${stock.unit}.`,
            recommendedResolution: `Split allocation across secondary verified state depot.`,
            requiresHumanReview: true,
            status: 'OPEN',
            isSimulated: true,
          })
        }
      }
    }
  }

  return conflicts
}

// ── 7. Multi-Crisis Allocation & Priority Queue Engine ──
export function rankResourceCandidates(
  crisisLocation: [number, number],
  requiredCargoWeightKg: number,
  activeMissions: Mission[],
  resources: Record<string, RegionalResource> = INITIAL_REGIONAL_RESOURCES,
  safetyRecords: Record<string, VehicleSafetyRecord> = DEMO_VEHICLE_SAFETY_RECORDS
): { resource: RegionalResource; suitabilityScore: number; readiness: ReadinessStatus; rationale: string }[] {
  const candidates: { resource: RegionalResource; suitabilityScore: number; readiness: ReadinessStatus; rationale: string }[] = []

  const activeVehicleIds = activeMissions
    .filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED' && m.status !== 'REJECTED')
    .map(m => m.assignedVehicleId)
    .filter(Boolean) as string[]

  for (const res of Object.values(resources)) {
    if (res.resourceType !== 'VEHICLE') continue

    const record = safetyRecords[res.resourceId] || { vehicleId: res.resourceId }
    const readinessEval = evaluateVehicleReadiness(record)

    // Rule: NOT_READY and DATA_INSUFFICIENT are disqualified
    if (!readinessEval.isEligibleForEmergencyDeployment) {
      continue
    }

    // Rule: Already assigned to active mission is disqualified
    if (activeVehicleIds.includes(res.resourceId)) {
      continue
    }

    // Rule: Cargo capacity check
    const capKg = res.capacity?.value || 0
    if (capKg < requiredCargoWeightKg) {
      continue
    }

    const distKm = calculateHaversineKm(res.location.lat, res.location.lng, crisisLocation[0], crisisLocation[1])
    let score = 100 - Math.min(60, distKm / 5)

    if (readinessEval.status === 'READY_WITH_WARNING') score -= 15
    if (res.aiRiskLevel === 'ELEVATED' || res.aiRiskLevel === 'HIGH') score -= 10 // Advisory factor

    candidates.push({
      resource: res,
      suitabilityScore: Math.max(0, Math.round(score)),
      readiness: readinessEval.status,
      rationale: `Verified ${readinessEval.status} (${capKg} kg capacity, ${distKm.toFixed(1)} km proximity, AI risk: ${res.aiRiskLevel || 'LOW'}).`,
    })
  }

  return candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore)
}

// ── 8. Multi-Depot Stock Allocation across Crises (Prevents Starvation) ──
export function allocateSupplyAcrossCrises(params: {
  crises: { crisisId: string; commodity: CommodityType; quantity: number; priority: LogisticsPriorityLevel }[]
  depots?: Record<string, DepotInventory>
}): { allocations: { crisisId: string; depotId: string; allocatedQuantity: number; status: 'ALLOCATED' | 'PARTIALLY_ALLOCATED' | 'INSUFFICIENT_STOCK' }[]; unfulfilledCrises: string[] } {
  const depots = params.depots || DEMO_DEPOT_INVENTORIES
  const allocations: { crisisId: string; depotId: string; allocatedQuantity: number; status: 'ALLOCATED' | 'PARTIALLY_ALLOCATED' | 'INSUFFICIENT_STOCK' }[] = []
  const unfulfilledCrises: string[] = []

  // Sort Crises by Priority (P1 > P2 > P3 > P4)
  const priorityWeight: Record<LogisticsPriorityLevel, number> = {
    P1_CRITICAL: 4,
    P2_HIGH: 3,
    P3_MEDIUM: 2,
    P4_LOW: 1,
    DATA_INSUFFICIENT: 0,
  }

  const sortedCrises = [...params.crises].sort(
    (a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]
  )

  // Track virtual available stock
  const virtualStock: Record<string, Record<CommodityType, number>> = {}
  for (const [dId, d] of Object.entries(depots)) {
    virtualStock[dId] = {
      MEDICINES: d.commodities.MEDICINES?.available || 0,
      FOOD: d.commodities.FOOD?.available || 0,
      DRINKING_WATER: d.commodities.DRINKING_WATER?.available || 0,
      FUEL: d.commodities.FUEL?.available || 0,
      CONSTRUCTION_MATERIAL: d.commodities.CONSTRUCTION_MATERIAL?.available || 0,
      EMERGENCY_EQUIPMENT: d.commodities.EMERGENCY_EQUIPMENT?.available || 0,
    }
  }

  for (const crisis of sortedCrises) {
    let remainingNeeded = crisis.quantity
    let totalAllocated = 0

    for (const [depotId, stock] of Object.entries(virtualStock)) {
      if (stock[crisis.commodity] > 0) {
        const alloc = Math.min(remainingNeeded, stock[crisis.commodity])
        stock[crisis.commodity] -= alloc
        remainingNeeded -= alloc
        totalAllocated += alloc

        allocations.push({
          crisisId: crisis.crisisId,
          depotId,
          allocatedQuantity: alloc,
          status: remainingNeeded === 0 ? 'ALLOCATED' : 'PARTIALLY_ALLOCATED',
        })

        if (remainingNeeded === 0) break
      }
    }

    if (remainingNeeded > 0) {
      unfulfilledCrises.push(crisis.crisisId)
    }
  }

  return { allocations, unfulfilledCrises }
}

// ── 9. Mission Dependency & Resource Readiness Calculator ──
export function calculateMissionResourceReadiness(
  mission: Mission,
  resources: Record<string, RegionalResource> = INITIAL_REGIONAL_RESOURCES,
  safetyRecords: Record<string, VehicleSafetyRecord> = DEMO_VEHICLE_SAFETY_RECORDS,
  incidents: Incident[] = []
): MissionResourceDependencyStatus {
  const blockingReasons: string[] = []

  // 1. Vehicle Dependency Check
  let vehicleStatus: 'READY' | 'READY_WITH_WARNING' | 'NOT_READY' | 'DATA_INSUFFICIENT' = 'DATA_INSUFFICIENT'
  let vehicleNotes = 'No vehicle assigned'

  if (mission.assignedVehicleId) {
    const record = safetyRecords[mission.assignedVehicleId] || { vehicleId: mission.assignedVehicleId }
    const readiness = evaluateVehicleReadiness(record)
    vehicleStatus = readiness.status
    vehicleNotes = `Phase 11 Safety Gate: ${readiness.status}`

    if (!readiness.isEligibleForEmergencyDeployment) {
      blockingReasons.push(`Carrier ${mission.assignedVehicleId} failed Phase 11 safety gate (${readiness.status})`)
    }
  } else {
    blockingReasons.push('No emergency vehicle carrier assigned to mission')
  }

  // 2. Cargo Dependency Check
  const cargoStatus: 'RESERVED' | 'AVAILABLE' | 'INSUFFICIENT' | 'DATA_INSUFFICIENT' =
    mission.responseRequirement ? 'RESERVED' : 'DATA_INSUFFICIENT'
  if (!mission.responseRequirement) blockingReasons.push('Cargo payload details missing')

  // 3. Route Dependency Check (Confirmed blockages check)
  const confirmedIncidents = incidents.filter(i => i.status === 'confirmed')
  let routeStatus: 'FEASIBLE' | 'BLOCKED' | 'WARNING' = 'FEASIBLE'
  if (confirmedIncidents.length > 0) {
    routeStatus = 'WARNING'
  }

  // 4. Last-Mile & Field Team Check
  const lastMileStatus: 'DIRECT_ACCESS' | 'FIELD_VERIFICATION_REQUIRED' | 'INACCESSIBLE' =
    mission.routeSummary?.accessStatus === 'LAST_MILE_REQUIRED'
      ? 'FIELD_VERIFICATION_REQUIRED'
      : 'DIRECT_ACCESS'

  const fieldTeamStatus: 'AVAILABLE' | 'FIELD_VERIFICATION_REQUIRED' | 'UNAVAILABLE' =
    lastMileStatus === 'FIELD_VERIFICATION_REQUIRED' ? 'FIELD_VERIFICATION_REQUIRED' : 'AVAILABLE'

  // Determine Overall Readiness
  let overallStatus: MissionResourceOverallReadiness = 'READY'
  if (blockingReasons.length > 0) {
    overallStatus = 'BLOCKED'
  } else if (vehicleStatus === 'READY_WITH_WARNING' || routeStatus === 'WARNING' || lastMileStatus === 'FIELD_VERIFICATION_REQUIRED') {
    overallStatus = 'READY_WITH_WARNING'
  }

  return {
    missionId: mission.id,
    overallStatus,
    dependencies: {
      vehicle: { status: vehicleStatus, id: mission.assignedVehicleId || 'UNASSIGNED', notes: vehicleNotes },
      cargo: { status: cargoStatus, details: mission.quantitySummary || mission.responseRequirement || 'Payload verified' },
      route: { status: routeStatus, routeName: mission.routeSummary?.recommendedHighway || 'OSRM Primary Corridor' },
      lastMile: { status: lastMileStatus, mode: mission.routeSummary?.possibleLastMileModes?.[0] || 'DIRECT_ROAD' },
      fieldTeam: { status: fieldTeamStatus, details: 'Field transfer team verification status' },
    },
    blockingReasons,
    actionRequired:
      overallStatus === 'READY'
        ? 'All dependencies verified. Mission cleared for official dispatch.'
        : overallStatus === 'READY_WITH_WARNING'
        ? 'Advisory warnings present. Commander review recommended.'
        : `Mission blocked: ${blockingReasons.join('; ')}.`,
  }
}

// ── 10. Cascading Impact Analyzer ──
export function calculateResourceImpact(
  failedResourceId: string,
  activeMissions: Mission[],
  districtProfiles: Record<string, DistrictLogisticsProfile> = DEMO_DISTRICT_PROFILES
): { impactedMissions: string[]; impactedDistricts: string[]; cascadeSummary: string } {
  const impactedMissions: string[] = []
  const impactedDistricts: string[] = []

  for (const m of activeMissions) {
    if (m.assignedVehicleId === failedResourceId && m.status !== 'COMPLETED') {
      impactedMissions.push(m.id)
      if (m.crisisLocation?.name) {
        impactedDistricts.push(m.crisisLocation.name)
      }
    }
  }

  const cascadeSummary =
    impactedMissions.length > 0
      ? `Failure of ${failedResourceId} impacts ${impactedMissions.length} active emergency missions (${impactedMissions.join(', ')}). Target districts ${impactedDistricts.join(', ')} face replenishment delay.`
      : `Resource ${failedResourceId} has no dependent active missions. Zero operational cascade. `

  return { impactedMissions, impactedDistricts, cascadeSummary }
}

// ── 11. Regional Commodity Balancing Recommendation ──
export function recommendRegionalBalancing(
  commodity: CommodityType,
  districts: Record<string, DistrictLogisticsProfile> = DEMO_DISTRICT_PROFILES
): { recommendation: string; surplusDistrict?: string; deficitDistrict?: string; recommendedTransferQuantity?: number } {
  let surplusDistrict: string | undefined
  let deficitDistrict: string | undefined
  let maxSurplus = -Infinity
  let maxDeficit = -Infinity

  for (const [name, prof] of Object.entries(districts)) {
    const stock = prof.commodities[commodity]
    if (stock) {
      const margin = stock.availableQuantity - stock.minimumReserveThreshold
      if (margin > 500 && margin > maxSurplus) {
        maxSurplus = margin
        surplusDistrict = name
      } else if (margin < 0 && Math.abs(margin) > maxDeficit) {
        maxDeficit = Math.abs(margin)
        deficitDistrict = name
      }
    }
  }

  if (surplusDistrict && deficitDistrict) {
    const transferQty = Math.round(Math.min(maxSurplus * 0.5, maxDeficit))
    return {
      recommendation: `Recommended inter-district transfer: Transfer ${transferQty} units of ${commodity} from ${surplusDistrict} (Surplus: +${maxSurplus}) to ${deficitDistrict} (Deficit: -${maxDeficit}).`,
      surplusDistrict,
      deficitDistrict,
      recommendedTransferQuantity: transferQty,
    }
  }

  return { recommendation: `No immediate inter-district balancing required for ${commodity}.` }
}
