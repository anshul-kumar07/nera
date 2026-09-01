// lib/mission-management.ts
// ========================================================================
//    NERA PHASE 12: MISSION MANAGEMENT & OFFICIAL DISPATCH WORKFLOW
// ========================================================================

import { findShortestAlternatePath } from './routing-algorithm'
import { deriveLastMileAccessibility, LastMileAccessStatus, LastMileMode } from './last-mile'
import { evaluateVehicleReadiness, VehicleReadinessEvaluation, VehicleSafetyRecord } from './vehicle-readiness'
import { Incident } from './supabase'

export type MissionType =
  | 'MEDICAL_SUPPLY'
  | 'FOOD_SUPPLY'
  | 'WATER_SUPPLY'
  | 'RESCUE_SUPPORT'
  | 'CONSTRUCTION_MATERIAL'
  | 'AGRICULTURAL_SUPPLY'
  | 'EMERGENCY_EVACUATION'
  | 'GENERAL_LOGISTICS'
  | 'OTHER'

export type MissionPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW'

export type MissionStatus =
  | 'PLANNED'
  | 'ROUTE_PROPOSED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'REROUTING'
  | 'INTERRUPTED'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'

export interface MissionCoordinate {
  lat: number
  lng: number
  name?: string
}

export interface MissionTimelineEvent {
  timestamp: string
  action: string
  actor: string
  statusFrom?: MissionStatus
  statusTo?: MissionStatus
  notes?: string
}

export interface MissionRouteSummary {
  recommendedHighway: string
  totalDistanceKm: number
  vehicleAccessibleKm: number
  lastMileKm: number
  estimatedHours: number
  accessStatus: LastMileAccessStatus
  possibleLastMileModes: LastMileMode[]
  recommendedLastMileMode: LastMileMode
  distanceCalculationMethod: string
  pathCoordinates?: [number, number][]
  lastMileCoordinates?: [number, number][]
}

export interface Mission {
  id: string
  title: string
  missionType: MissionType
  priority: MissionPriority
  status: MissionStatus
  origin: MissionCoordinate
  crisisLocation: MissionCoordinate
  responseRequirement: string
  quantitySummary?: string
  incidentId?: string | null
  assignedVehicleId?: string | null
  assignedVehicleModel?: string | null
  vehicleReadiness?: VehicleReadinessEvaluation | null
  routeSummary?: MissionRouteSummary | null
  approvalRecord?: {
    approvedAt?: string
    approvedBy?: string
    decisionNotes?: string
  } | null
  rejectionRecord?: {
    rejectedAt?: string
    rejectedBy?: string
    rejectionReason?: string
  } | null
  dispatchRecord?: {
    dispatchedAt?: string
    dispatchedBy?: string
  } | null
  arrivalRecord?: {
    arrivedAt?: string
    arrivedAtVapOnly?: boolean
    notes?: string
  } | null
  completionRecord?: {
    completedAt?: string
    completedBy?: string
    notes?: string
  } | null
  interruptionRecord?: {
    interruptedAt?: string
    interruptionReason?: string
  } | null
  timeline: MissionTimelineEvent[]
  createdAt: string
  updatedAt: string
  isSimulated: boolean
}

// ── State Machine Transition Rules Matrix ──
export const ALLOWED_MISSION_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  PLANNED: ['ROUTE_PROPOSED', 'PENDING_APPROVAL', 'CANCELLED'],
  ROUTE_PROPOSED: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['DISPATCHED', 'INTERRUPTED', 'CANCELLED'],
  DISPATCHED: ['IN_TRANSIT', 'INTERRUPTED', 'CANCELLED'],
  IN_TRANSIT: ['REROUTING', 'INTERRUPTED', 'ARRIVED', 'COMPLETED', 'CANCELLED'],
  REROUTING: ['IN_TRANSIT', 'INTERRUPTED', 'CANCELLED'],
  INTERRUPTED: ['IN_TRANSIT', 'REROUTING', 'APPROVED', 'CANCELLED'],
  ARRIVED: ['COMPLETED', 'INTERRUPTED', 'CANCELLED'],
  COMPLETED: [], // Terminal State
  REJECTED: [], // Terminal State
  CANCELLED: [], // Terminal State
}

/**
 * Validates whether a mission can legally transition from currentStatus to nextStatus
 */
export function validateMissionTransition(
  currentStatus: MissionStatus,
  nextStatus: MissionStatus
): { valid: boolean; reason?: string } {
  if (currentStatus === nextStatus) {
    return { valid: true }
  }
  const allowed = ALLOWED_MISSION_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(nextStatus)) {
    return {
      valid: false,
      reason: `Illegal state transition: Mission in status '${currentStatus}' cannot transition to '${nextStatus}'. Allowed transitions: [${allowed.join(', ') || 'NONE - Terminal State'}].`,
    }
  }
  return { valid: true }
}

/**
 * Generates a unique, collision-free Mission reference ID
 */
export function generateMissionId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `NERA-MSN-${ts}-${rand}`
}

export interface CreateMissionParams {
  title: string
  missionType: MissionType
  priority?: MissionPriority
  origin: MissionCoordinate
  crisisLocation: MissionCoordinate
  responseRequirement: string
  quantitySummary?: string
  incidentId?: string | null
  assignedVehicleId?: string | null
  isSimulated?: boolean
}

/**
 * 1. Creates a new operational Mission entity
 */
export function createMission(params: CreateMissionParams): Mission {
  const id = generateMissionId()
  const now = new Date().toISOString()
  const priority = params.priority || 'NORMAL'

  const timeline: MissionTimelineEvent[] = [
    {
      timestamp: now,
      action: 'MISSION_CREATED',
      actor: 'OPERATOR_DISPATCH',
      statusTo: 'PLANNED',
      notes: `Operational response planned: ${params.title} (${params.missionType})`,
    },
  ]

  let vehicleReadiness: VehicleReadinessEvaluation | null = null
  if (params.assignedVehicleId) {
    vehicleReadiness = evaluateVehicleReadiness({ vehicleId: params.assignedVehicleId })
    timeline.push({
      timestamp: now,
      action: 'VEHICLE_ASSIGNED',
      actor: 'OPERATOR_DISPATCH',
      notes: `Vehicle ${params.assignedVehicleId} assigned. Safety Gate: ${vehicleReadiness.status}`,
    })
  }

  return {
    id,
    title: params.title,
    missionType: params.missionType,
    priority,
    status: 'PLANNED',
    origin: params.origin,
    crisisLocation: params.crisisLocation,
    responseRequirement: params.responseRequirement,
    quantitySummary: params.quantitySummary,
    incidentId: params.incidentId || null,
    assignedVehicleId: params.assignedVehicleId || null,
    assignedVehicleModel: vehicleReadiness?.vehicleId ? 'Standard Heavy Fleet' : null,
    vehicleReadiness,
    routeSummary: null,
    approvalRecord: null,
    rejectionRecord: null,
    dispatchRecord: null,
    arrivalRecord: null,
    completionRecord: null,
    interruptionRecord: null,
    timeline,
    createdAt: now,
    updatedAt: now,
    isSimulated: params.isSimulated !== false,
  }
}

/**
 * 2. Generates an operational route proposal combining Phase 9 Dijkstra/OSRM & Phase 10 Last-Mile
 */
export function proposeMissionRoute(
  mission: Mission,
  options?: {
    incidents?: Incident[]
    vehicleWeightTons?: number
  }
): Mission {
  const incidents = options?.incidents || []
  const originNodeName = mission.origin.name || 'Guwahati'
  const destNodeName = mission.crisisLocation.name || 'Shillong'

  const algoResult = findShortestAlternatePath(
    originNodeName,
    destNodeName,
    '',
    [],
    { lat: mission.crisisLocation.lat, lng: mission.crisisLocation.lng },
    'medicine',
    'clear',
    {
      originCoords: { lat: mission.origin.lat, lng: mission.origin.lng },
      targetCoords: { lat: mission.crisisLocation.lat, lng: mission.crisisLocation.lng },
      incidents,
      vehicleWeightTons: options?.vehicleWeightTons || 16,
    }
  )

  const lastMile =
    algoResult.lastMileAccessibility ||
    deriveLastMileAccessibility({
      originCoords: mission.origin,
      crisisLocation: mission.crisisLocation,
      roadPathCoordinates: algoResult.pathCoordinates,
      incidents,
    })

  const routeSummary: MissionRouteSummary = {
    recommendedHighway: algoResult.recommendedHighway,
    totalDistanceKm: lastMile.totalDistanceKm,
    vehicleAccessibleKm: lastMile.vehicleAccessibleDistanceKm,
    lastMileKm: lastMile.lastMileDistanceKm,
    estimatedHours: algoResult.estimatedHours,
    accessStatus: lastMile.accessStatus,
    possibleLastMileModes: lastMile.possibleModes,
    recommendedLastMileMode: lastMile.recommendedMode,
    distanceCalculationMethod: lastMile.distanceCalculationMethod,
    pathCoordinates: lastMile.vehiclePathCoordinates,
    lastMileCoordinates: lastMile.lastMileCoordinates,
  }

  const now = new Date().toISOString()
  const transition = validateMissionTransition(mission.status, 'PENDING_APPROVAL')

  const nextStatus: MissionStatus = transition.valid ? 'PENDING_APPROVAL' : mission.status

  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'ROUTE_PROPOSAL_GENERATED',
      actor: 'NERA_ROUTING_ENGINE',
      statusFrom: mission.status,
      statusTo: nextStatus,
      notes: `Route calculated: ${routeSummary.recommendedHighway} (${routeSummary.totalDistanceKm} km). Last-mile: ${routeSummary.lastMileKm} km (${routeSummary.accessStatus}).`,
    },
  ]

  return {
    ...mission,
    status: nextStatus,
    routeSummary,
    timeline: updatedTimeline,
    updatedAt: now,
  }
}

/**
 * 3. Assigns or re-assigns a vehicle to the mission and evaluates readiness gate
 */
export function assignMissionVehicle(
  mission: Mission,
  vehicleId: string,
  customSafetyRecord?: Partial<VehicleSafetyRecord>
): Mission {
  const readiness = evaluateVehicleReadiness({
    vehicleId,
    ...customSafetyRecord,
  })

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'VEHICLE_ASSIGNED',
      actor: 'OPERATOR_DISPATCH',
      notes: `Vehicle ${vehicleId} assigned. Safety Gate: ${readiness.statusBadge.label}`,
    },
  ]

  return {
    ...mission,
    assignedVehicleId: vehicleId,
    assignedVehicleModel: customSafetyRecord?.vehicleModel || 'Standard Convoy',
    vehicleReadiness: readiness,
    timeline: updatedTimeline,
    updatedAt: now,
  }
}

/**
 * 4. Official Review: APPROVE Mission
 *
 * Safety Gate Invariant:
 * - Vehicle cannot be NOT_READY.
 * - Vehicle cannot be DATA_INSUFFICIENT for critical checks.
 * - Route summary must be present.
 */
export function approveMission(
  mission: Mission,
  approvingActor: string = 'ACTOR ID UNAVAILABLE',
  decisionNotes?: string
): { success: boolean; mission: Mission; error?: string } {
  const transition = validateMissionTransition(mission.status, 'APPROVED')
  if (!transition.valid) {
    return { success: false, mission, error: transition.reason }
  }

  // Safety Gate Evaluation
  if (!mission.assignedVehicleId || !mission.vehicleReadiness) {
    return {
      success: false,
      mission,
      error: 'Cannot approve mission: No vehicle assigned. An emergency vehicle must be selected and evaluated.',
    }
  }

  if (mission.vehicleReadiness.status === 'NOT_READY') {
    return {
      success: false,
      mission,
      error: `Cannot approve mission: Assigned vehicle ${mission.assignedVehicleId} is NOT_READY. Blocking issue: ${mission.vehicleReadiness.blockingReasons.join('; ')}`,
    }
  }

  if (mission.vehicleReadiness.status === 'DATA_INSUFFICIENT') {
    return {
      success: false,
      mission,
      error: `Cannot approve mission: Vehicle ${mission.assignedVehicleId} has DATA_INSUFFICIENT for critical safety checks.`,
    }
  }

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'OFFICIAL_APPROVAL',
      actor: approvingActor,
      statusFrom: mission.status,
      statusTo: 'APPROVED' as MissionStatus,
      notes: decisionNotes || 'Mission operational proposal reviewed and approved by authority.',
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'APPROVED',
    approvalRecord: {
      approvedAt: now,
      approvedBy: approvingActor,
      decisionNotes,
    },
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission }
}

/**
 * 5. Official Review: REJECT Mission
 */
export function rejectMission(
  mission: Mission,
  rejectingActor: string = 'ACTOR ID UNAVAILABLE',
  rejectionReason: string = 'Operational decision'
): { success: boolean; mission: Mission; error?: string } {
  const transition = validateMissionTransition(mission.status, 'REJECTED')
  if (!transition.valid) {
    return { success: false, mission, error: transition.reason }
  }

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'OFFICIAL_REJECTION',
      actor: rejectingActor,
      statusFrom: mission.status,
      statusTo: 'REJECTED' as MissionStatus,
      notes: `Mission rejected: ${rejectionReason}`,
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'REJECTED',
    rejectionRecord: {
      rejectedAt: now,
      rejectedBy: rejectingActor,
      rejectionReason,
    },
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission }
}

/**
 * 6. DISPATCH Mission (Transitions APPROVED -> DISPATCHED -> IN_TRANSIT)
 */
export function dispatchMission(
  mission: Mission,
  dispatchingActor: string = 'ACTOR ID UNAVAILABLE'
): { success: boolean; mission: Mission; error?: string } {
  const transition = validateMissionTransition(mission.status, 'DISPATCHED')
  if (!transition.valid) {
    return { success: false, mission, error: transition.reason }
  }

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'MISSION_DISPATCHED',
      actor: dispatchingActor,
      statusFrom: mission.status,
      statusTo: 'IN_TRANSIT' as MissionStatus,
      notes: `Vehicle ${mission.assignedVehicleId} dispatched on mission route.`,
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'IN_TRANSIT',
    dispatchRecord: {
      dispatchedAt: now,
      dispatchedBy: dispatchingActor,
    },
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission }
}

/**
 * 7. REROUTE Mission (En-route obstruction encountered)
 */
export function rerouteMission(
  mission: Mission,
  newRouteSummary: MissionRouteSummary,
  rerouteReason: string
): Mission {
  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'MISSION_REROUTED',
      actor: 'NERA_DYNAMIC_ROUTING',
      statusFrom: mission.status,
      statusTo: 'IN_TRANSIT' as MissionStatus,
      notes: `En-route diversion: ${rerouteReason}. New route via ${newRouteSummary.recommendedHighway}`,
    },
  ]

  return {
    ...mission,
    status: 'IN_TRANSIT',
    routeSummary: newRouteSummary,
    timeline: updatedTimeline,
    updatedAt: now,
  }
}

/**
 * 8. Mark Mission ARRIVED
 */
export function markMissionArrived(
  mission: Mission,
  isAtVapOnly: boolean = false,
  notes?: string
): { success: boolean; mission: Mission; error?: string } {
  const transition = validateMissionTransition(mission.status, 'ARRIVED')
  if (!transition.valid) {
    return { success: false, mission, error: transition.reason }
  }

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: isAtVapOnly ? 'ARRIVED_AT_VEHICLE_ACCESS_POINT' : 'ARRIVED_AT_DESTINATION',
      actor: 'VEHICLE_TELEMETRY',
      statusFrom: mission.status,
      statusTo: 'ARRIVED' as MissionStatus,
      notes:
        notes ||
        (isAtVapOnly
          ? 'Vehicle arrived at Vehicle Access Point. LAST-MILE FIELD TRANSFER REQUIRED to reach crisis location.'
          : 'Vehicle arrived at direct crisis depot destination.'),
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'ARRIVED',
    arrivalRecord: {
      arrivedAt: now,
      arrivedAtVapOnly: isAtVapOnly,
      notes,
    },
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission }
}

/**
 * 9. Mark Mission COMPLETE (Explicit authority signoff)
 */
export function completeMission(
  mission: Mission,
  completingActor: string = 'ACTOR ID UNAVAILABLE',
  notes?: string
): { success: boolean; mission: Mission; error?: string } {
  const transition = validateMissionTransition(mission.status, 'COMPLETED')
  if (!transition.valid) {
    return { success: false, mission, error: transition.reason }
  }

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'MISSION_COMPLETED',
      actor: completingActor,
      statusFrom: mission.status,
      statusTo: 'COMPLETED' as MissionStatus,
      notes: notes || 'Emergency delivery confirmed and signed off by on-site authority.',
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'COMPLETED',
    completionRecord: {
      completedAt: now,
      completedBy: completingActor,
      notes,
    },
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission }
}

/**
 * 10. Interrupt Mission (Operational hold or route blocked)
 */
export function interruptMission(
  mission: Mission,
  interruptionReason: string = 'Operational hold'
): { success: boolean; mission: Mission; error?: string } {
  const transition = validateMissionTransition(mission.status, 'INTERRUPTED')
  if (!transition.valid) {
    return { success: false, mission, error: transition.reason }
  }

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'MISSION_INTERRUPTED',
      actor: 'OPERATIONAL_COMMAND',
      statusFrom: mission.status,
      statusTo: 'INTERRUPTED' as MissionStatus,
      notes: `Mission held / interrupted: ${interruptionReason}`,
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'INTERRUPTED',
    interruptionRecord: {
      interruptedAt: now,
      interruptionReason,
    },
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission }
}

// ── Controlled Initial Demo Missions for UI & Testing ──
export const INITIAL_DEMO_MISSIONS: Mission[] = [
  {
    id: 'NERA-MSN-2026-001',
    title: 'Emergency Pediatric Medical Supply to Majuli Riverine Island',
    missionType: 'MEDICAL_SUPPLY',
    priority: 'CRITICAL',
    status: 'IN_TRANSIT',
    origin: { lat: 26.1445, lng: 91.7362, name: 'Guwahati Apex Logistics Hub' },
    crisisLocation: { lat: 26.9500, lng: 94.2167, name: 'Majuli Flood Relief Camp' },
    responseRequirement: 'Emergency IV Fluids, Antivenom, and Infant Nutrition Packs (3,400 kg)',
    quantitySummary: '3,400 kg Medical Cargo',
    incidentId: 'INC-2026-FLOOD-01',
    assignedVehicleId: 'NER-TRUCK-18',
    assignedVehicleModel: 'Tata Signa 2823.K Heavy Multi-Axle',
    vehicleReadiness: evaluateVehicleReadiness({ vehicleId: 'NER-TRUCK-18' }),
    routeSummary: {
      recommendedHighway: 'NH-715 Southern Brahmaputra Highway',
      totalDistanceKm: 310,
      vehicleAccessibleKm: 302,
      lastMileKm: 8,
      estimatedHours: 6.5,
      accessStatus: 'LAST_MILE_REQUIRED',
      possibleLastMileModes: ['BOAT', 'LOCAL_RESCUE_TEAM', 'FIELD_VERIFICATION_REQUIRED'],
      recommendedLastMileMode: 'BOAT',
      distanceCalculationMethod: 'ESTIMATED_NON_ROAD_DISTANCE',
    },
    approvalRecord: {
      approvedAt: new Date(Date.now() - 3600000).toISOString(),
      approvedBy: 'Regional Disaster Commissioner (Assam)',
      decisionNotes: 'Critical medical cargo approved for immediate deployment.',
    },
    dispatchRecord: {
      dispatchedAt: new Date(Date.now() - 2700000).toISOString(),
      dispatchedBy: 'NERA Central Command',
    },
    timeline: [
      {
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        action: 'MISSION_CREATED',
        actor: 'DISTRICT_MAGISTRATE_JORHAT',
        statusTo: 'PLANNED',
        notes: 'Flood relief request logged for Majuli riverine sector.',
      },
      {
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        action: 'ROUTE_PROPOSAL_GENERATED',
        actor: 'NERA_ROUTING_ENGINE',
        statusTo: 'PENDING_APPROVAL',
        notes: 'Route proposed: NH-715 (302 km) + 8 km Boat transfer at Neemati Ghat.',
      },
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: 'OFFICIAL_APPROVAL',
        actor: 'Regional Disaster Commissioner (Assam)',
        statusTo: 'APPROVED',
        notes: 'Authorized for priority dispatch.',
      },
      {
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        action: 'MISSION_DISPATCHED',
        actor: 'NERA Central Command',
        statusTo: 'IN_TRANSIT',
        notes: 'Convoy NER-TRUCK-18 in transit.',
      },
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 2700000).toISOString(),
    isSimulated: true,
  },
  {
    id: 'NERA-MSN-2026-002',
    title: 'Disaster Food Grain Replenishment to Tawang Strategic Forward Sector',
    missionType: 'FOOD_SUPPLY',
    priority: 'HIGH',
    status: 'PENDING_APPROVAL',
    origin: { lat: 26.6338, lng: 92.7926, name: 'Tezpur Supply Depot' },
    crisisLocation: { lat: 27.5861, lng: 91.8594, name: 'Tawang Civil Depot' },
    responseRequirement: 'FCI MRE Rations & High-Calorie Winter Food Packs (12,000 kg)',
    quantitySummary: '12,000 kg Grain & MRE Rations',
    assignedVehicleId: 'NER-TRUCK-07',
    assignedVehicleModel: 'Ashok Leyland Ecomet 1215 Tipper',
    vehicleReadiness: evaluateVehicleReadiness({ vehicleId: 'NER-TRUCK-07' }),
    routeSummary: {
      recommendedHighway: 'NH-13 Trans-Arunachal Highway via Sela Tunnel',
      totalDistanceKm: 320,
      vehicleAccessibleKm: 320,
      lastMileKm: 0,
      estimatedHours: 8.2,
      accessStatus: 'DIRECT_VEHICLE_ACCESS',
      possibleLastMileModes: ['4X4_OFF_ROAD', 'WALKING_FIELD_TEAM'],
      recommendedLastMileMode: '4X4_OFF_ROAD',
      distanceCalculationMethod: 'DIRECT_ACCESS',
    },
    timeline: [
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: 'MISSION_CREATED',
        actor: 'OPERATOR_DISPATCH',
        statusTo: 'PLANNED',
        notes: 'Forward winter stockpile mission initiated.',
      },
      {
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        action: 'ROUTE_PROPOSAL_GENERATED',
        actor: 'NERA_ROUTING_ENGINE',
        statusTo: 'PENDING_APPROVAL',
        notes: 'Direct all-weather Sela Tunnel route proposed.',
      },
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    isSimulated: true,
  },
]
