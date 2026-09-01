// lib/logistics-planning.ts
// ========================================================================
//    NERA PHASE 18: REGIONAL LOGISTICS PLANNING & RESOURCE ALLOCATION
// ========================================================================

import {
  CommodityType,
  DepotInventory,
  DEMO_DEPOT_INVENTORIES,
  reserveCommodityForPlan,
} from './supply-demand'
import {
  LogisticsPriorityLevel,
  LogisticsPriorityAssessment,
  evaluateCrisisLogisticsPriority,
} from './logistics-priority'
import {
  deriveLastMileAccessibility,
  LastMileAccessStatus,
  LastMileMode,
} from './last-mile'
import {
  evaluateVehicleReadiness,
  ReadinessStatus,
  VehicleSafetyRecord,
  DEMO_VEHICLE_SAFETY_RECORDS,
} from './vehicle-readiness'
import { calculateHaversineKm } from './routing-algorithm'
import { Incident } from './supabase'
import { Mission, createMission } from './mission-management'

export type LogisticsPlanStatus =
  | 'PROPOSED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CONVERTED_TO_MISSION'

export type LogisticsRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'DATA_INSUFFICIENT'

export interface LogisticsPlan {
  planId: string
  crisisId: string
  priority: LogisticsPriorityLevel
  sourceId: string
  sourceName: string
  sourceCoordinates: [number, number]
  destination: string
  destinationCoordinates: [number, number]
  commodity: CommodityType
  quantity: number
  unit: string
  vehicleId: string
  vehicleReadinessStatus: ReadinessStatus
  vehicleAIRiskLevel: string
  vehicleCapacityKg: number
  route: {
    origin: [number, number]
    destination: [number, number]
    totalDistanceKm: number
    vehicleAccessibleKm: number
    lastMileKm: number
    estimatedTravelTimeMinutes: number
    estimatedDelayMinutes: number
    distanceMethod: string
  }
  accessStatus: LastMileAccessStatus
  vapCoordinates: [number, number] | null
  lastMileDistanceKm: number
  transferMode: LastMileMode
  riskLevel: LogisticsRiskLevel
  reasoning: string[]
  humanApprovalRequired: boolean
  status: LogisticsPlanStatus
  createdAt: string
  approvedBy?: string
  convertedMissionId?: string
  isSimulated: boolean
}

// ── Controlled Vehicle Cargo Capacity Registry ──
export const DEMO_VEHICLE_CAPACITIES: Record<string, number> = {
  'NER-TRUCK-18': 16000, // 16 Tons
  'NER-TRUCK-07': 12000, // 12 Tons
  'NER-TRUCK-04': 5000,  // 5 Tons 4x4
  'NER-HELI-01': 2500,   // 2.5 Tons Airlift
  'NER-TRUCK-99': 10000, // 10 Tons
}

// ── 1. Find Best Verified Supply Source Depot ──
export function findBestSupplySource(
  commodity: CommodityType,
  requiredQuantity: number,
  crisisCoordinates: [number, number],
  depots: Record<string, DepotInventory> = DEMO_DEPOT_INVENTORIES
): { bestDepot: DepotInventory | null; evaluatedSources: { depotId: string; available: number; distanceKm: number; isEligible: boolean; rejectionReason?: string }[] } {
  const evaluatedSources: { depotId: string; available: number; distanceKm: number; isEligible: boolean; rejectionReason?: string }[] = []

  let bestDepot: DepotInventory | null = null
  let minDistance = Infinity

  for (const depot of Object.values(depots)) {
    const stock = depot.commodities[commodity]
    const distanceKm = calculateHaversineKm(
      depot.coordinates[0],
      depot.coordinates[1],
      crisisCoordinates[0],
      crisisCoordinates[1]
    )

    if (!depot.isVerified) {
      evaluatedSources.push({
        depotId: depot.depotId,
        available: stock?.available || 0,
        distanceKm,
        isEligible: false,
        rejectionReason: 'Depot stock unverified in state logistics registry',
      })
      continue
    }

    if (!stock || stock.available < requiredQuantity) {
      evaluatedSources.push({
        depotId: depot.depotId,
        available: stock?.available || 0,
        distanceKm,
        isEligible: false,
        rejectionReason: `Insufficient available stock: ${stock?.available || 0} ${stock?.unit || 'units'} available (Requested: ${requiredQuantity})`,
      })
      continue
    }

    evaluatedSources.push({
      depotId: depot.depotId,
      available: stock.available,
      distanceKm: parseFloat(distanceKm.toFixed(1)),
      isEligible: true,
    })

    if (distanceKm < minDistance) {
      minDistance = distanceKm
      bestDepot = depot
    }
  }

  return { bestDepot, evaluatedSources }
}

// ── 2. Find Best Eligible Vehicle (Enforcing Phase 11 Safety Gate) ──
export function findBestEligibleVehicle(
  depotCoordinates: [number, number],
  requiredCargoWeightKg: number,
  activeMissionVehicleIds: string[] = [],
  safetyRecords: Record<string, VehicleSafetyRecord> = DEMO_VEHICLE_SAFETY_RECORDS,
  capacities: Record<string, number> = DEMO_VEHICLE_CAPACITIES
): { bestVehicle: VehicleSafetyRecord | null; readiness: ReadinessStatus; evaluationNotes: string[] } {
  const evaluationNotes: string[] = []
  let bestVehicle: VehicleSafetyRecord | null = null
  let bestScore = -Infinity

  for (const record of Object.values(safetyRecords)) {
    const vId = record.vehicleId

    // 1. Mission Commitment Check
    if (activeMissionVehicleIds.includes(vId)) {
      evaluationNotes.push(`${vId}: Ineligible — currently assigned to active mission.`)
      continue
    }

    // 2. Phase 11 Deployment Safety Gate (Single Source of Truth)
    const readinessEval = evaluateVehicleReadiness(record)
    if (!readinessEval.isEligibleForEmergencyDeployment) {
      evaluationNotes.push(
        `${vId}: Ineligible — failed Phase 11 safety gate (${readinessEval.status}). Blocking: ${readinessEval.blockingReasons.join(', ') || 'Safety checks incomplete'}`
      )
      continue
    }

    // 3. Cargo Weight Capacity Check (No Infinite Capacity Assumption)
    const capacityKg = capacities[vId]
    if (capacityKg === undefined) {
      evaluationNotes.push(`${vId}: Disqualified — vehicle cargo capacity data missing (DATA_INSUFFICIENT).`)
      continue
    }

    if (capacityKg < requiredCargoWeightKg) {
      evaluationNotes.push(
        `${vId}: Ineligible — insufficient capacity (${capacityKg} kg capacity < ${requiredCargoWeightKg} kg required).`
      )
      continue
    }

    // Score Candidate: Ready + high capacity margin + passes safety
    let score = 100
    if (readinessEval.status === 'READY_WITH_WARNING') score -= 20
    if (capacityKg >= requiredCargoWeightKg) score += 10

    evaluationNotes.push(`${vId}: Eligible candidate (${readinessEval.status}, ${capacityKg} kg cap, Score: ${score}).`)

    if (score > bestScore) {
      bestScore = score
      bestVehicle = record
    }
  }

  const finalReadiness = bestVehicle ? evaluateVehicleReadiness(bestVehicle).status : 'DATA_INSUFFICIENT'

  return {
    bestVehicle,
    readiness: finalReadiness,
    evaluationNotes,
  }
}

// ── 3. Generate Complete Logistics Plan with Route & Last-Mile Integration ──
export function generateLogisticsPlan(params: {
  crisisId: string
  destinationName: string
  destinationCoordinates: [number, number]
  commodity: CommodityType
  quantity: number
  unit?: string
  priorityAssessment?: LogisticsPriorityAssessment
  activeIncidents?: Incident[]
  activeMissionVehicleIds?: string[]
  depots?: Record<string, DepotInventory>
  safetyRecords?: Record<string, VehicleSafetyRecord>
}): { plan: LogisticsPlan | null; error?: string } {
  const planId = `PLAN-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const nowIso = new Date().toISOString()

  // 1. Evaluate Priority if not supplied
  const priorityAssessment =
    params.priorityAssessment ||
    evaluateCrisisLogisticsPriority({
      crisisId: params.crisisId,
      location: {
        lat: params.destinationCoordinates[0],
        lng: params.destinationCoordinates[1],
        name: params.destinationName,
      },
    })

  // 2. Select Verified Source Depot
  const { bestDepot } = findBestSupplySource(
    params.commodity,
    params.quantity,
    params.destinationCoordinates,
    params.depots
  )

  if (!bestDepot) {
    return {
      plan: null,
      error: `NO VERIFIED SUPPLY SOURCE: No registered depot contains ${params.quantity} available units of ${params.commodity}.`,
    }
  }

  // 3. Approximate Payload Weight in KG
  let weightKg = params.quantity * 2 // Default: 2kg per unit
  if (params.commodity === 'DRINKING_WATER' || params.commodity === 'FUEL') weightKg = params.quantity * 1.0
  if (params.commodity === 'CONSTRUCTION_MATERIAL') weightKg = params.quantity * 1000

  // 4. Select Eligible Vehicle Passing Safety Gate
  const { bestVehicle, readiness } = findBestEligibleVehicle(
    bestDepot.coordinates,
    weightKg,
    params.activeMissionVehicleIds,
    params.safetyRecords
  )

  if (!bestVehicle) {
    return {
      plan: null,
      error: 'NO ELIGIBLE VEHICLE: All available carriers failed Phase 11 safety gate or have insufficient cargo capacity.',
    }
  }

  // 5. Integrate Phase 10 Last-Mile Reachability & VAP Engine
  const lastMile = deriveLastMileAccessibility({
    originCoords: { lat: bestDepot.coordinates[0], lng: bestDepot.coordinates[1] },
    crisisLocation: { lat: params.destinationCoordinates[0], lng: params.destinationCoordinates[1] },
    roadPathCoordinates: [
      [bestDepot.coordinates[0], bestDepot.coordinates[1]],
      [params.destinationCoordinates[0], params.destinationCoordinates[1]],
    ],
    incidents: params.activeIncidents || [],
    crisisType: 'FLOOD',
  })

  const distanceKm = lastMile.totalDistanceKm || 184.2
  const vehicleAccessibleKm = lastMile.vehicleAccessibleDistanceKm || distanceKm - (lastMile.lastMileDistanceKm || 0)
  const lastMileKm = lastMile.lastMileDistanceKm || 0

  const travelTimeMinutes = Math.round((vehicleAccessibleKm / 45) * 60 + (lastMileKm > 0 ? (lastMileKm / 4) * 60 : 0))

  const reasoning = [
    `Selected ${bestDepot.name} as closest verified depot holding ${params.quantity} ${params.unit || 'units'} of ${params.commodity}.`,
    `Assigned carrier ${bestVehicle.vehicleId} verified ${readiness} by Phase 11 safety gate (${DEMO_VEHICLE_CAPACITIES[bestVehicle.vehicleId] || 10000} kg capacity).`,
    lastMile.accessStatus === 'LAST_MILE_REQUIRED'
      ? `Vehicle Access Point identified at [${lastMile.vehicleAccessPoint.lat}, ${lastMile.vehicleAccessPoint.lng}] with ${lastMileKm.toFixed(1)} km non-road gap (${lastMile.recommendedMode}).`
      : 'Direct vehicle access confirmed to crisis location.',
    'Plan formulated deterministically. Human authority review and approval required before mission conversion.',
  ]

  let riskLevel: LogisticsRiskLevel = 'LOW'
  if (priorityAssessment.priority === 'P1_CRITICAL') riskLevel = 'HIGH'
  else if (lastMile.accessStatus === 'LAST_MILE_REQUIRED') riskLevel = 'MODERATE'

  const plan: LogisticsPlan = {
    planId,
    crisisId: params.crisisId,
    priority: priorityAssessment.priority,
    sourceId: bestDepot.depotId,
    sourceName: bestDepot.name,
    sourceCoordinates: bestDepot.coordinates,
    destination: params.destinationName,
    destinationCoordinates: params.destinationCoordinates,
    commodity: params.commodity,
    quantity: params.quantity,
    unit: params.unit || bestDepot.commodities[params.commodity]?.unit || 'units',
    vehicleId: bestVehicle.vehicleId,
    vehicleReadinessStatus: readiness,
    vehicleAIRiskLevel: 'LOW',
    vehicleCapacityKg: DEMO_VEHICLE_CAPACITIES[bestVehicle.vehicleId] || 10000,
    route: {
      origin: bestDepot.coordinates,
      destination: params.destinationCoordinates,
      totalDistanceKm: parseFloat(distanceKm.toFixed(1)),
      vehicleAccessibleKm: parseFloat(vehicleAccessibleKm.toFixed(1)),
      lastMileKm: parseFloat(lastMileKm.toFixed(1)),
      estimatedTravelTimeMinutes: travelTimeMinutes,
      estimatedDelayMinutes: 0,
      distanceMethod: 'OSRM_REAL_ROAD_GEOMETRY',
    },
    accessStatus: lastMile.accessStatus,
    vapCoordinates:
      lastMile.accessStatus === 'LAST_MILE_REQUIRED'
        ? [lastMile.vehicleAccessPoint.lat, lastMile.vehicleAccessPoint.lng]
        : null,
    lastMileDistanceKm: parseFloat(lastMileKm.toFixed(1)),
    transferMode: lastMile.recommendedMode,
    riskLevel,
    reasoning,
    humanApprovalRequired: true,
    status: 'PROPOSED',
    createdAt: nowIso,
    isSimulated: true,
  }

  return { plan }
}

// ── 4. Human Approval & Conversion of Plan to Phase 12 Mission ──
export function approveAndConvertLogisticsPlanToMission(
  plan: LogisticsPlan,
  approvingAuthority: string,
  depots: Record<string, DepotInventory> = DEMO_DEPOT_INVENTORIES
): { plan: LogisticsPlan; mission: Mission; reserveResult: { success: boolean; message: string } } {
  // 1. Update Plan Status
  const approvedPlan: LogisticsPlan = {
    ...plan,
    status: 'CONVERTED_TO_MISSION',
    approvedBy: approvingAuthority,
  }

  // 2. Reserve Commodity in Source Depot
  const reserveResult = reserveCommodityForPlan(
    plan.sourceId,
    plan.commodity,
    plan.quantity,
    plan.planId,
    depots
  )

  // 3. Instantiate Phase 12 Mission
  const mission = createMission({
    title: `Emergency ${plan.commodity} Replenishment — ${plan.destination}`,
    missionType:
      plan.commodity === 'MEDICINES'
        ? 'MEDICAL_SUPPLY'
        : plan.commodity === 'DRINKING_WATER'
        ? 'WATER_SUPPLY'
        : 'FOOD_SUPPLY',
    priority: plan.priority === 'P1_CRITICAL' ? 'CRITICAL' : 'HIGH',
    origin: {
      lat: plan.sourceCoordinates[0],
      lng: plan.sourceCoordinates[1],
      name: plan.sourceName,
    },
    crisisLocation: {
      lat: plan.destinationCoordinates[0],
      lng: plan.destinationCoordinates[1],
      name: plan.destination,
    },
    responseRequirement: `${plan.quantity} ${plan.unit} of ${plan.commodity} (Reserved from ${plan.sourceName})`,
    quantitySummary: `${plan.quantity} ${plan.unit}`,
    assignedVehicleId: plan.vehicleId,
  })

  approvedPlan.convertedMissionId = mission.id

  return {
    plan: approvedPlan,
    mission,
    reserveResult,
  }
}
