// lib/vehicle-failure.ts
// ========================================================================
//    NERA PHASE 13: VEHICLE FAILURE, EMERGENCY INTERRUPTION & REPLACEMENT DISPATCH
// ========================================================================

import { calculateHaversineKm, findShortestAlternatePath } from './routing-algorithm'
import { evaluateVehicleReadiness, VehicleReadinessEvaluation, DEMO_VEHICLE_SAFETY_RECORDS, VehicleSafetyRecord } from './vehicle-readiness'
import { deriveLastMileAccessibility, LastMileAccessStatus } from './last-mile'
import { Mission, interruptMission, MissionTimelineEvent } from './mission-management'
import { Incident } from './supabase'

export type VehicleFailureType =
  | 'ENGINE_FAILURE'
  | 'BRAKE_FAILURE'
  | 'TYRE_FAILURE'
  | 'MECHANICAL_FAILURE'
  | 'ACCIDENT'
  | 'FUEL_PROBLEM'
  | 'COMMUNICATION_FAILURE'
  | 'VEHICLE_STUCK'
  | 'UNSAFE_CONDITION'
  | 'OTHER'

export type FailureSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface VehicleFailureEvent {
  id: string
  vehicleId: string
  missionId?: string | null
  location: {
    lat: number
    lng: number
    locationName?: string
  }
  failureType: VehicleFailureType
  severity: FailureSeverity
  description: string
  reportedAt: string
  reportedBy: string
  isResolved: boolean
  resolvedAt?: string | null
  resolutionNotes?: string | null
  lastKnownTelemetry?: {
    lat: number
    lng: number
    speedKmh: number
    headingDeg: number
    timestamp: string
  }
  isSimulated: boolean
}

export interface ReplacementCandidate {
  vehicleId: string
  vehicleModel: string
  driverName?: string
  currentLocation: { lat: number; lng: number; name?: string }
  readiness: VehicleReadinessEvaluation
  distanceToIncidentKm: number
  estimatedTravelHours: number
  isEligible: boolean
  ineligibilityReasons: string[]
  warnings: string[]
  suitabilityScore: number
  rankingRank: number
}

export interface MissionHandoverPlan {
  missionId: string
  failedVehicleId: string
  replacementVehicleId: string
  handoverLocation: {
    lat: number
    lng: number
    name?: string
  }
  isHandoverConfirmed: boolean
  handoverConfirmedAt?: string | null
  handoverConfirmedBy?: string | null
  replacementRouteToHandover: {
    distanceKm: number
    estimatedHours: number
    pathCoordinates?: [number, number][]
  }
  continuationRouteToCrisis: {
    highwayName: string
    distanceKm: number
    estimatedHours: number
    pathCoordinates?: [number, number][]
    lastMileKm: number
    accessStatus: string
  }
}

/**
 * Generates unique Failure Event ID
 */
export function generateFailureId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `FAIL-${ts}-${rand}`
}

export interface ReportFailureParams {
  vehicleId: string
  mission?: Mission | null
  location?: { lat: number; lng: number; locationName?: string }
  failureType: VehicleFailureType
  severity?: FailureSeverity
  description: string
  reportedBy?: string
  lastKnownTelemetry?: {
    lat: number
    lng: number
    speedKmh: number
    headingDeg: number
    timestamp: string
  }
  isSimulated?: boolean
}

/**
 * 1. Explicitly reports a vehicle failure event.
 * If vehicle is engaged in an active mission, interrupts the mission cleanly.
 */
export function reportVehicleFailure(params: ReportFailureParams): {
  failureEvent: VehicleFailureEvent
  updatedMission?: Mission | null
} {
  const id = generateFailureId()
  const now = new Date().toISOString()
  const severity = params.severity || 'CRITICAL'
  const reportedBy = params.reportedBy || 'ACTOR ID UNAVAILABLE'

  const location = params.location || {
    lat: params.lastKnownTelemetry?.lat || 26.1445,
    lng: params.lastKnownTelemetry?.lng || 91.7362,
    locationName: 'En-Route Highway Corridor',
  }

  const failureEvent: VehicleFailureEvent = {
    id,
    vehicleId: params.vehicleId,
    missionId: params.mission?.id || null,
    location,
    failureType: params.failureType,
    severity,
    description: params.description,
    reportedAt: now,
    reportedBy,
    isResolved: false,
    resolvedAt: null,
    resolutionNotes: null,
    lastKnownTelemetry: params.lastKnownTelemetry,
    isSimulated: params.isSimulated !== false,
  }

  let updatedMission: Mission | null = null
  if (params.mission && (params.mission.status === 'IN_TRANSIT' || params.mission.status === 'REROUTING' || params.mission.status === 'DISPATCHED')) {
    const interruptRes = interruptMission(
      params.mission,
      `Vehicle ${params.vehicleId} reported failure (${params.failureType}): ${params.description}`
    )
    if (interruptRes.success) {
      updatedMission = interruptRes.mission
    }
  }

  return { failureEvent, updatedMission }
}

export interface CandidateSearchOptions {
  missionLocation: { lat: number; lng: number; name?: string }
  crisisLocation: { lat: number; lng: number; name?: string }
  activeCommittedVehicleIds?: string[]
  fleetRecords?: VehicleSafetyRecord[]
}

/**
 * 2. Deterministically identifies and ranks eligible replacement vehicles
 */
export function findReplacementCandidates(options: CandidateSearchOptions): ReplacementCandidate[] {
  const committedIds = new Set(options.activeCommittedVehicleIds || [])
  const records: VehicleSafetyRecord[] = Array.isArray(options.fleetRecords)
    ? options.fleetRecords
    : Object.values(options.fleetRecords || DEMO_VEHICLE_SAFETY_RECORDS)

  const candidates: ReplacementCandidate[] = []

  for (const record of records) {
    const readiness = evaluateVehicleReadiness(record)
    const ineligibilityReasons: string[] = []
    const warnings: string[] = [...readiness.warnings]

    // Check if vehicle is already actively committed
    if (committedIds.has(record.vehicleId)) {
      ineligibilityReasons.push('Vehicle is actively committed to another ongoing emergency mission')
    }

    // Check readiness gate
    if (readiness.status === 'NOT_READY') {
      ineligibilityReasons.push(`Readiness Gate Failed: ${readiness.blockingReasons.join(', ')}`)
    } else if (readiness.status === 'DATA_INSUFFICIENT') {
      ineligibilityReasons.push('Readiness Gate Incomplete: Critical safety telemetry records missing')
    }

    const isEligible = ineligibilityReasons.length === 0

    // Vehicle location (Use depot/preset or default coordinate)
    const candidateLocation = {
      lat: record.vehicleId === 'NER-TRUCK-07' ? 26.6338 : record.vehicleId === 'NER-TRUCK-18' ? 26.1445 : 24.8333,
      lng: record.vehicleId === 'NER-TRUCK-07' ? 92.7926 : record.vehicleId === 'NER-TRUCK-18' ? 91.7362 : 92.7789,
      name: record.vehicleId === 'NER-TRUCK-07' ? 'Tezpur Supply Depot' : 'Guwahati Logistics Apex',
    }

    const distKm = Math.round(
      calculateHaversineKm(
        candidateLocation.lat,
        candidateLocation.lng,
        options.missionLocation.lat,
        options.missionLocation.lng
      ) * 10
    ) / 10

    const estHours = Math.round((distKm / 40) * 10) / 10 // Average 40 km/h hill transit

    // Deterministic suitability score: Higher is better
    // Base 1000 - distanceKm. If READY +200, if READY_WITH_WARNING +100, if ineligible -5000
    let score = Math.max(0, 1000 - distKm * 2)
    if (readiness.status === 'READY') score += 200
    if (readiness.status === 'READY_WITH_WARNING') score += 100
    if (!isEligible) score = -1000

    candidates.push({
      vehicleId: record.vehicleId,
      vehicleModel: record.vehicleModel || 'Heavy All-Terrain Truck',
      driverName: record.driverName,
      currentLocation: candidateLocation,
      readiness,
      distanceToIncidentKm: distKm,
      estimatedTravelHours: estHours,
      isEligible,
      ineligibilityReasons,
      warnings,
      suitabilityScore: score,
      rankingRank: 0,
    })
  }

  // Sort deterministically: Eligible first -> Higher suitability score -> lower distance
  candidates.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1
    if (!a.isEligible && b.isEligible) return 1
    if (b.suitabilityScore !== a.suitabilityScore) return b.suitabilityScore - a.suitabilityScore
    return a.distanceToIncidentKm - b.distanceToIncidentKm
  })

  // Assign ranking numbers
  return candidates.map((c, idx) => ({ ...c, rankingRank: idx + 1 }))
}

/**
 * 3. Calculates the two-leg replacement route:
 * Leg 1: Replacement vehicle location -> Handover point (failed vehicle current position)
 * Leg 2: Handover point -> Crisis destination (continuation route)
 */
export function calculateReplacementHandoverPlan(
  mission: Mission,
  replacementCandidate: ReplacementCandidate,
  handoverLocation?: { lat: number; lng: number; name?: string },
  incidents: Incident[] = []
): MissionHandoverPlan {
  const handover = handoverLocation || {
    lat: mission.routeSummary?.pathCoordinates?.[Math.floor((mission.routeSummary.pathCoordinates.length || 1) / 2)]?.[0] || 26.1445,
    lng: mission.routeSummary?.pathCoordinates?.[Math.floor((mission.routeSummary.pathCoordinates.length || 1) / 2)]?.[1] || 91.7362,
    name: 'Proposed Mission Handover Point',
  }

  // Leg 1: Replacement Vehicle -> Handover Point
  const leg1Dist = Math.round(
    calculateHaversineKm(
      replacementCandidate.currentLocation.lat,
      replacementCandidate.currentLocation.lng,
      handover.lat,
      handover.lng
    ) * 10
  ) / 10
  const leg1Hours = Math.round((leg1Dist / 40) * 10) / 10

  // Leg 2: Handover Point -> Crisis Destination
  const leg2Algo = findShortestAlternatePath(
    handover.name || 'Handover Point',
    mission.crisisLocation.name || 'Crisis Target',
    '',
    [],
    { lat: mission.crisisLocation.lat, lng: mission.crisisLocation.lng },
    'medicine',
    'clear',
    {
      originCoords: { lat: handover.lat, lng: handover.lng },
      targetCoords: { lat: mission.crisisLocation.lat, lng: mission.crisisLocation.lng },
      incidents,
      vehicleWeightTons: 16,
    }
  )

  const leg2LastMile = deriveLastMileAccessibility({
    originCoords: handover,
    crisisLocation: mission.crisisLocation,
    roadPathCoordinates: leg2Algo.pathCoordinates,
    incidents,
  })

  return {
    missionId: mission.id,
    failedVehicleId: mission.assignedVehicleId || 'UNKNOWN-FAILED',
    replacementVehicleId: replacementCandidate.vehicleId,
    handoverLocation: handover,
    isHandoverConfirmed: false,
    handoverConfirmedAt: null,
    handoverConfirmedBy: null,
    replacementRouteToHandover: {
      distanceKm: leg1Dist,
      estimatedHours: leg1Hours,
      pathCoordinates: [[replacementCandidate.currentLocation.lat, replacementCandidate.currentLocation.lng], [handover.lat, handover.lng]],
    },
    continuationRouteToCrisis: {
      highwayName: leg2Algo.recommendedHighway,
      distanceKm: leg2LastMile.totalDistanceKm,
      estimatedHours: leg2Algo.estimatedHours,
      pathCoordinates: leg2LastMile.vehiclePathCoordinates,
      lastMileKm: leg2LastMile.lastMileDistanceKm,
      accessStatus: leg2LastMile.accessStatus,
    },
  }
}

/**
 * 4. Assigns replacement vehicle to mission and updates status/timeline
 */
export function assignReplacementVehicle(
  mission: Mission,
  replacementCandidate: ReplacementCandidate,
  handoverPlan: MissionHandoverPlan,
  approvingActor: string = 'ACTOR ID UNAVAILABLE'
): { success: boolean; mission: Mission; error?: string } {
  if (!replacementCandidate.isEligible) {
    return {
      success: false,
      mission,
      error: `Cannot assign replacement: ${replacementCandidate.ineligibilityReasons.join('; ')}`,
    }
  }

  const now = new Date().toISOString()
  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'REPLACEMENT_VEHICLE_DISPATCHED',
      actor: approvingActor,
      statusFrom: mission.status,
      statusTo: 'IN_TRANSIT',
      notes: `Replacement vehicle ${replacementCandidate.vehicleId} authorized. Dispatched to Handover Point (${handoverPlan.replacementRouteToHandover.distanceKm} km).`,
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'IN_TRANSIT',
    assignedVehicleId: replacementCandidate.vehicleId,
    assignedVehicleModel: replacementCandidate.vehicleModel,
    vehicleReadiness: replacementCandidate.readiness,
    routeSummary: {
      recommendedHighway: handoverPlan.continuationRouteToCrisis.highwayName,
      totalDistanceKm: handoverPlan.replacementRouteToHandover.distanceKm + handoverPlan.continuationRouteToCrisis.distanceKm,
      vehicleAccessibleKm: handoverPlan.continuationRouteToCrisis.distanceKm,
      lastMileKm: handoverPlan.continuationRouteToCrisis.lastMileKm,
      estimatedHours: handoverPlan.replacementRouteToHandover.estimatedHours + handoverPlan.continuationRouteToCrisis.estimatedHours,
      accessStatus: handoverPlan.continuationRouteToCrisis.accessStatus as LastMileAccessStatus,
      possibleLastMileModes: ['BOAT', 'WALKING_FIELD_TEAM'],
      recommendedLastMileMode: 'WALKING_FIELD_TEAM',
      distanceCalculationMethod: 'HANDOVER_CONTINUATION_ROUTING',
      pathCoordinates: handoverPlan.continuationRouteToCrisis.pathCoordinates,
    },
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission }
}

/**
 * 5. Explicitly confirms physical cargo/custody handover on site and resumes mission to crisis location
 */
export function confirmMissionHandover(
  mission: Mission,
  handoverPlan: MissionHandoverPlan,
  confirmingActor: string = 'ACTOR ID UNAVAILABLE',
  notes?: string
): { success: boolean; mission: Mission; updatedPlan: MissionHandoverPlan; error?: string } {
  const now = new Date().toISOString()
  const updatedPlan: MissionHandoverPlan = {
    ...handoverPlan,
    isHandoverConfirmed: true,
    handoverConfirmedAt: now,
    handoverConfirmedBy: confirmingActor,
  }

  const updatedTimeline: MissionTimelineEvent[] = [
    ...mission.timeline,
    {
      timestamp: now,
      action: 'MISSION_HANDOVER_CONFIRMED',
      actor: confirmingActor,
      statusFrom: mission.status,
      statusTo: 'IN_TRANSIT',
      notes: notes || `Physical cargo handover completed at ${handoverPlan.handoverLocation.name || 'Handover Point'}. Replacement vehicle ${handoverPlan.replacementVehicleId} continuing route to crisis location.`,
    },
  ]

  const updatedMission: Mission = {
    ...mission,
    status: 'IN_TRANSIT',
    timeline: updatedTimeline,
    updatedAt: now,
  }

  return { success: true, mission: updatedMission, updatedPlan }
}

/**
 * 6. Resolves vehicle failure record (historical record preserved)
 */
export function resolveVehicleFailure(
  failureEvent: VehicleFailureEvent,
  resolutionNotes: string = 'Repaired on site / recovered',
  resolvingActor: string = 'ACTOR ID UNAVAILABLE'
): VehicleFailureEvent {
  const now = new Date().toISOString()
  return {
    ...failureEvent,
    isResolved: true,
    resolvedAt: now,
    resolutionNotes: `Resolved by ${resolvingActor}: ${resolutionNotes}`,
  }
}
