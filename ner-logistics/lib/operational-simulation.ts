// lib/operational-simulation.ts
// ========================================================================
//    NERA PHASE 16: END-TO-END EMERGENCY LOGISTICS OPERATIONS
//                  & REAL-TIME MISSION SIMULATION
// ========================================================================

import { Mission, createMission, approveMission, dispatchMission, completeMission } from './mission-management'
import {
  VehicleFailureEvent,
  reportVehicleFailure,
  findReplacementCandidates,
  calculateReplacementHandoverPlan,
  assignReplacementVehicle,
  confirmMissionHandover,
  ReplacementCandidate,
  MissionHandoverPlan,
} from './vehicle-failure'
import { evaluateVehicleReadiness, DEMO_VEHICLE_SAFETY_RECORDS } from './vehicle-readiness'

export type ScenarioStep =
  | 'IDLE'
  | 'AI_WARNING'
  | 'FIELD_REPORTED'
  | 'OFFICIAL_CONFIRMED'
  | 'ROUTE_CALCULATED'
  | 'MISSION_CREATED'
  | 'MISSION_APPROVED'
  | 'DISPATCHED'
  | 'IN_TRANSIT'
  | 'ROAD_BLOCKED'
  | 'REROUTING'
  | 'VEHICLE_FAILURE'
  | 'REPLACEMENT_REQUIRED'
  | 'HANDOVER_PENDING'
  | 'HANDOVER_CONFIRMED'
  | 'VAP_REACHED'
  | 'LAST_MILE_REQUIRED'
  | 'LAST_MILE_COMPLETED'
  | 'COMPLETED'

export interface OperationalEvent {
  id: string
  type: string
  step: ScenarioStep
  timestamp: string // Simulated time string e.g. "08:30"
  isoTimestamp: string
  missionId?: string
  vehicleId?: string
  incidentId?: string
  location?: string
  coordinates?: [number, number]
  actor: string
  description: string
  source: 'DEMO_SIMULATION' | 'SYSTEM' | 'FIELD_OFFICER' | 'OFFICIAL_COMMAND'
  isSimulated: boolean
}

export interface OperationalSimulationState {
  scenarioId: string
  scenarioName: string
  crisisName: string
  crisisLocation: {
    name: string
    coordinates: [number, number]
  }
  originDepot: {
    name: string
    coordinates: [number, number]
  }
  currentStep: ScenarioStep
  simulationClock: {
    simulatedTime: string
    isRunning: boolean
    speedMultiplier: number
  }
  activeIncident: {
    id: string
    title: string
    status: 'predicted' | 'reported' | 'confirmed' | 'resolved'
    severity: 'critical' | 'high' | 'medium' | 'low'
    location: string
    coordinates: [number, number]
    impactSummary?: string
  } | null
  activeMission: Mission | null
  assignedVehicle: {
    vehicleId: string
    currentCoordinates: [number, number]
    speedKmh: number
    readinessStatus: string
    aiRiskLevel: string
  } | null
  currentRoutePlan: {
    origin: [number, number]
    destination: [number, number]
    totalDistanceKm: number
    vehicleAccessibleKm: number
    lastMileKm: number
    vapCoordinates: [number, number]
    recommendedLastMileMode: string
    isRerouted: boolean
    rerouteReason?: string
  } | null
  vehicleFailure: VehicleFailureEvent | null
  replacementCandidate: ReplacementCandidate | null
  handoverPlan: MissionHandoverPlan | null
  events: OperationalEvent[]
  isSimulated: boolean
}

export function generateEventId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `EVT-${ts}-${rand}`
}

/**
 * 1. Initial State Factory
 */
export function createInitialSimulationState(): OperationalSimulationState {
  return {
    scenarioId: 'NERA-SCN-2026-FLOOD-01',
    scenarioName: 'Monsoon Flash Flood & Landslide Emergency Response',
    crisisName: 'Karbi Anglong Hill Settlement Flash Flood',
    crisisLocation: {
      name: 'Haflong Outpost Hill Settlement (Non-road accessible ridge)',
      coordinates: [25.1843, 93.0182],
    },
    originDepot: {
      name: 'Guwahati Apex Logistics Depot',
      coordinates: [26.1445, 91.7362],
    },
    currentStep: 'IDLE',
    simulationClock: {
      simulatedTime: '08:30',
      isRunning: false,
      speedMultiplier: 1,
    },
    activeIncident: null,
    activeMission: null,
    assignedVehicle: {
      vehicleId: 'NER-TRUCK-18',
      currentCoordinates: [26.1445, 91.7362],
      speedKmh: 0,
      readinessStatus: 'READY',
      aiRiskLevel: 'LOW',
    },
    currentRoutePlan: null,
    vehicleFailure: null,
    replacementCandidate: null,
    handoverPlan: null,
    events: [
      {
        id: 'EVT-000',
        type: 'SCENARIO_INITIALIZED',
        step: 'IDLE',
        timestamp: '08:30',
        isoTimestamp: new Date().toISOString(),
        actor: 'SYSTEM',
        description: 'Operational demo scenario loaded. All logistics modules standing by.',
        source: 'DEMO_SIMULATION',
        isSimulated: true,
      },
    ],
    isSimulated: true,
  }
}

/**
 * 2. Step 1: AI Predicts Disruption Risk (Advisory only — does NOT block road)
 */
export function triggerAIWarning(state: OperationalSimulationState): OperationalSimulationState {
  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'AI_WARNING_GENERATED',
    step: 'AI_WARNING',
    timestamp: '08:32',
    isoTimestamp: new Date().toISOString(),
    location: 'NH-27 / Lumding Hill Pass',
    coordinates: [25.7512, 93.1843],
    actor: 'NERA AI Predictive Engine',
    description: 'AI Disruption Predictor flagged 84% probability of slope instability along Lumding Hill Corridor due to continuous monsoon rainfall.',
    source: 'SYSTEM',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'AI_WARNING',
    simulationClock: { ...state.simulationClock, simulatedTime: '08:32' },
    activeIncident: {
      id: 'INC-PRED-0832',
      title: 'Predicted Slope Instability Risk (Advisory)',
      status: 'predicted',
      severity: 'high',
      location: 'NH-27 Lumding Hill Sector',
      coordinates: [25.7512, 93.1843],
      impactSummary: 'Advisory alert issued to command. Corridor remains operationally passable until field confirmation.',
    },
    events: [event, ...state.events],
  }
}

/**
 * 3. Step 2: Field Officer Reports Actual Condition
 */
export function submitFieldReport(state: OperationalSimulationState): OperationalSimulationState {
  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'FIELD_REPORT_SUBMITTED',
    step: 'FIELD_REPORTED',
    timestamp: '08:42',
    isoTimestamp: new Date().toISOString(),
    location: 'NH-27 Lumding Hill Sector KM 48',
    coordinates: [25.7512, 93.1843],
    actor: 'Field Patrol Officer B. Saikia',
    description: 'Field officer patrol logged active rockfall and mudslide over 120m roadway. Traffic halted.',
    source: 'FIELD_OFFICER',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'FIELD_REPORTED',
    simulationClock: { ...state.simulationClock, simulatedTime: '08:42' },
    activeIncident: {
      id: 'INC-REP-0842',
      title: 'Reported Landslide Blockage (Pending Official Confirmation)',
      status: 'reported',
      severity: 'critical',
      location: 'NH-27 Lumding KM 48',
      coordinates: [25.7512, 93.1843],
      impactSummary: 'Reported by field patrol. Awaiting official verification before system-wide route invalidation.',
    },
    events: [event, ...state.events],
  }
}

/**
 * 4. Step 3: Authorized Official Confirms Disruption (Road is now officially blocked)
 */
export function confirmDisruption(state: OperationalSimulationState): OperationalSimulationState {
  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'INCIDENT_OFFICIALLY_CONFIRMED',
    step: 'OFFICIAL_CONFIRMED',
    timestamp: '08:50',
    isoTimestamp: new Date().toISOString(),
    incidentId: 'INC-CONF-0850',
    location: 'NH-27 Lumding Hill Corridor',
    coordinates: [25.7512, 93.1843],
    actor: 'District Disaster Management Authority (DDMA)',
    description: 'Official confirmation issued by District Magistrate. NH-27 Lumding Sector officially closed to all heavy vehicles.',
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'OFFICIAL_CONFIRMED',
    simulationClock: { ...state.simulationClock, simulatedTime: '08:50' },
    activeIncident: {
      id: 'INC-CONF-0850',
      title: 'Confirmed Landslide Road Closure',
      status: 'confirmed',
      severity: 'critical',
      location: 'NH-27 Lumding Hill Corridor',
      coordinates: [25.7512, 93.1843],
      impactSummary: 'Corridor closed. System automatically recalculates all routes to bypass affected sector.',
    },
    events: [event, ...state.events],
  }
}

/**
 * 5. Step 4: Dynamic Arbitrary Route & Last-Mile Reachability Calculation
 */
export function calculateDynamicCrisisRoute(state: OperationalSimulationState): OperationalSimulationState {
  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'DYNAMIC_ROUTE_CALCULATED',
    step: 'ROUTE_CALCULATED',
    timestamp: '08:52',
    isoTimestamp: new Date().toISOString(),
    location: 'Guwahati Depot → Nagaon Bypass → Haflong VAP',
    actor: 'NERA Dynamic Dijkstra & OSRM Engine',
    description: 'Bypass route generated around Lumding blockage via Nagaon-Dabaka Corridor. VAP identified at Haflong River Base (3.8 km non-road last mile).',
    source: 'SYSTEM',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'ROUTE_CALCULATED',
    simulationClock: { ...state.simulationClock, simulatedTime: '08:52' },
    currentRoutePlan: {
      origin: state.originDepot.coordinates,
      destination: state.crisisLocation.coordinates,
      totalDistanceKm: 184.2,
      vehicleAccessibleKm: 180.4,
      lastMileKm: 3.8,
      vapCoordinates: [25.1721, 93.0045],
      recommendedLastMileMode: '4X4_OFF_ROAD',
      isRerouted: false,
    },
    events: [event, ...state.events],
  }
}

/**
 * 6. Step 5: Official Mission Creation
 */
export function createCrisisMission(state: OperationalSimulationState): OperationalSimulationState {
  const newMission = createMission({
    title: 'Emergency Medical & Food Relief — Haflong Settlement',
    missionType: 'MEDICAL_SUPPLY',
    priority: 'CRITICAL',
    origin: {
      name: state.originDepot.name,
      lat: state.originDepot.coordinates[0],
      lng: state.originDepot.coordinates[1],
    },
    crisisLocation: {
      name: state.crisisLocation.name,
      lat: state.crisisLocation.coordinates[0],
      lng: state.crisisLocation.coordinates[1],
    },
    responseRequirement: '1,500 kg High-Energy Rations, Anti-Venom, Blood Units & Water Purification Kits',
    assignedVehicleId: 'NER-TRUCK-18',
    isSimulated: true,
  })

  newMission.routeSummary = {
    recommendedHighway: 'NH-27 / NH-627 Nagaon-Haflong',
    totalDistanceKm: 184.2,
    vehicleAccessibleKm: 180.4,
    lastMileKm: 3.8,
    estimatedHours: 4.5,
    accessStatus: 'LAST_MILE_REQUIRED',
    possibleLastMileModes: ['WALKING_FIELD_TEAM'],
    recommendedLastMileMode: 'WALKING_FIELD_TEAM',
    distanceCalculationMethod: 'OSRM_REAL_ROAD_GEOMETRY',
  }

  // Evaluate Phase 11 Vehicle Readiness
  const safetyRecord = DEMO_VEHICLE_SAFETY_RECORDS['NER-TRUCK-18'] || { vehicleId: 'NER-TRUCK-18' }
  newMission.vehicleReadiness = evaluateVehicleReadiness(safetyRecord)

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'MISSION_CREATED',
    step: 'MISSION_CREATED',
    timestamp: '08:55',
    isoTimestamp: new Date().toISOString(),
    missionId: newMission.id,
    vehicleId: 'NER-TRUCK-18',
    actor: 'Emergency Logistics Coordinator',
    description: `Mission ${newMission.id} drafted. Assigned vehicle NER-TRUCK-18 evaluated by Phase 11 Safety Gate (${newMission.vehicleReadiness.status}).`,
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'MISSION_CREATED',
    simulationClock: { ...state.simulationClock, simulatedTime: '08:55' },
    activeMission: newMission,
    events: [event, ...state.events],
  }
}

/**
 * 7. Step 6: Official Mission Approval
 */
export function approveCrisisMission(state: OperationalSimulationState): OperationalSimulationState {
  if (!state.activeMission) return state

  const appResult = approveMission(state.activeMission, 'Director of Logistics, Assam State Disaster Management')
  const approvedMission = appResult.mission || state.activeMission

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'MISSION_OFFICIALLY_APPROVED',
    step: 'MISSION_APPROVED',
    timestamp: '09:01',
    isoTimestamp: new Date().toISOString(),
    missionId: approvedMission.id,
    actor: 'Director of Logistics, ASDMA',
    description: `Mission ${approvedMission.id} officially approved for deployment. Ready for convoy dispatch.`,
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'MISSION_APPROVED',
    simulationClock: { ...state.simulationClock, simulatedTime: '09:01' },
    activeMission: approvedMission,
    events: [event, ...state.events],
  }
}

/**
 * 8. Step 7: Convoy Dispatch
 */
export function dispatchCrisisMission(state: OperationalSimulationState): OperationalSimulationState {
  if (!state.activeMission) return state

  const dispResult = dispatchMission(state.activeMission, 'Guwahati Central Depot Dispatch Officer')
  const dispatchedMission = dispResult.mission || state.activeMission

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'CONVOY_DISPATCHED',
    step: 'DISPATCHED',
    timestamp: '09:05',
    isoTimestamp: new Date().toISOString(),
    missionId: dispatchedMission.id,
    vehicleId: 'NER-TRUCK-18',
    actor: 'Guwahati Depot Dispatch Officer',
    description: 'Vehicle NER-TRUCK-18 cleared gate and commenced transit along primary bypass corridor.',
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'IN_TRANSIT',
    simulationClock: { ...state.simulationClock, simulatedTime: '09:05' },
    activeMission: dispatchedMission,
    assignedVehicle: {
      ...state.assignedVehicle!,
      speedKmh: 55,
      currentCoordinates: [26.0512, 92.1456],
    },
    events: [event, ...state.events],
  }
}

/**
 * 9. Step 8: Second Confirmed Blockage on Active Route
 */
export function triggerEnRouteRoadBlockage(state: OperationalSimulationState): OperationalSimulationState {
  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'EN_ROUTE_ROAD_BLOCKED',
    step: 'ROAD_BLOCKED',
    timestamp: '09:35',
    isoTimestamp: new Date().toISOString(),
    location: 'Nagaon-Dabaka Highway KM 24',
    coordinates: [26.0821, 92.4215],
    actor: 'Assam State Highway Police',
    description: 'Culvert collapse reported on Nagaon-Dabaka highway. Rerouting required from current vehicle position.',
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'ROAD_BLOCKED',
    simulationClock: { ...state.simulationClock, simulatedTime: '09:35' },
    assignedVehicle: {
      ...state.assignedVehicle!,
      speedKmh: 0,
      currentCoordinates: [26.0512, 92.1456],
    },
    events: [event, ...state.events],
  }
}

/**
 * 10. Step 9: Dynamic Reroute From Vehicle's Current Position (Never restart from origin)
 */
export function executeDynamicRerouteFromCurrentPosition(state: OperationalSimulationState): OperationalSimulationState {
  const currPos: [number, number] = state.assignedVehicle?.currentCoordinates || [26.0512, 92.1456]

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'DYNAMIC_REROUTE_EXECUTED',
    step: 'REROUTING',
    timestamp: '09:36',
    isoTimestamp: new Date().toISOString(),
    location: `Vehicle Current Position [${currPos[0]}, ${currPos[1]}] → Lanka Bypass → Haflong VAP`,
    actor: 'NERA Dynamic Rerouting Engine',
    description: `Route dynamically recalculated from current vehicle position [${currPos[0]}, ${currPos[1]}]. Bypass via Lanka adds +18.6 km. Origin NOT restarted.`,
    source: 'SYSTEM',
    isSimulated: true,
  }

  const updatedPlan = {
    origin: currPos,
    destination: state.crisisLocation.coordinates,
    totalDistanceKm: 142.8,
    vehicleAccessibleKm: 139.0,
    lastMileKm: 3.8,
    vapCoordinates: [25.1721, 93.0045] as [number, number],
    recommendedLastMileMode: '4X4_OFF_ROAD',
    isRerouted: true,
    rerouteReason: 'Confirmed culvert collapse on Nagaon-Dabaka corridor',
  }

  return {
    ...state,
    currentStep: 'IN_TRANSIT',
    simulationClock: { ...state.simulationClock, simulatedTime: '09:36' },
    currentRoutePlan: updatedPlan,
    assignedVehicle: {
      ...state.assignedVehicle!,
      speedKmh: 48,
    },
    events: [event, ...state.events],
  }
}

/**
 * 11. Step 10: In-Transit Vehicle Failure
 */
export function triggerEnRouteVehicleFailure(state: OperationalSimulationState): OperationalSimulationState {
  if (!state.activeMission) return state

  const failResult = reportVehicleFailure({
    vehicleId: 'NER-TRUCK-18',
    failureType: 'ENGINE_FAILURE',
    severity: 'CRITICAL',
    location: {
      lat: 25.9124,
      lng: 92.9512,
      locationName: 'Lanka Foothills Sector (KM 112)',
    },
    description: 'Engine cylinder head overheating and oil pressure collapse on mountain gradient.',
    reportedBy: 'Driver K. Das (Field Comms Radio)',
    mission: state.activeMission,
    lastKnownTelemetry: {
      lat: 25.9124,
      lng: 92.9512,
      speedKmh: 0,
      headingDeg: 135,
      timestamp: new Date().toISOString(),
    },
    isSimulated: true,
  })

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'VEHICLE_FAILURE_REPORTED',
    step: 'VEHICLE_FAILURE',
    timestamp: '09:42',
    isoTimestamp: new Date().toISOString(),
    missionId: state.activeMission.id,
    vehicleId: 'NER-TRUCK-18',
    location: 'Lanka Foothills Sector KM 112',
    actor: 'Driver K. Das / Field Radio',
    description: `🚨 Critical Engine Failure on NER-TRUCK-18. Mission ${state.activeMission.id} transitioned to INTERRUPTED. Safety gate engaged.`,
    source: 'FIELD_OFFICER',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'VEHICLE_FAILURE',
    simulationClock: { ...state.simulationClock, simulatedTime: '09:42' },
    activeMission: failResult.updatedMission || state.activeMission,
    vehicleFailure: failResult.failureEvent,
    assignedVehicle: {
      ...state.assignedVehicle!,
      speedKmh: 0,
      readinessStatus: 'NOT_READY',
      currentCoordinates: [25.9124, 92.9512],
    },
    events: [event, ...state.events],
  }
}

/**
 * 12. Step 11: Candidate Ranking & Safe Replacement Assignment
 */
export function findAndAssignSafeReplacement(state: OperationalSimulationState): OperationalSimulationState {
  if (!state.activeMission || !state.vehicleFailure) return state

  const candidates = findReplacementCandidates({
    missionLocation: state.vehicleFailure.location,
    crisisLocation: {
      lat: state.crisisLocation.coordinates[0],
      lng: state.crisisLocation.coordinates[1],
      name: state.crisisLocation.name,
    },
    activeCommittedVehicleIds: ['NER-TRUCK-18'],
  })

  const bestCandidate = candidates[0]
  if (!bestCandidate) return state

  const handoverPlan = calculateReplacementHandoverPlan(
    state.activeMission,
    bestCandidate,
    {
      lat: state.vehicleFailure.location.lat,
      lng: state.vehicleFailure.location.lng,
      name: 'Lanka Depot Yard Handover Point',
    }
  )

  const assignedResult = assignReplacementVehicle(
    state.activeMission,
    bestCandidate,
    handoverPlan,
    'Emergency Fleet Coordinator'
  )

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'REPLACEMENT_CANDIDATE_ASSIGNED',
    step: 'HANDOVER_PENDING',
    timestamp: '09:45',
    isoTimestamp: new Date().toISOString(),
    missionId: state.activeMission.id,
    vehicleId: bestCandidate.vehicleId,
    actor: 'Emergency Fleet Coordinator',
    description: `Replacement vehicle ${bestCandidate.vehicleId} (Status: READY, Distance: ${bestCandidate.distanceToIncidentKm} km) dispatched to Handover Point at Lanka Depot Yard.`,
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'HANDOVER_PENDING',
    simulationClock: { ...state.simulationClock, simulatedTime: '09:45' },
    activeMission: assignedResult.mission,
    replacementCandidate: bestCandidate,
    handoverPlan,
    events: [event, ...state.events],
  }
}

/**
 * 13. Step 12: Official Handover Confirmation (Mission resumes IN_TRANSIT)
 */
export function confirmOnSiteHandover(state: OperationalSimulationState): OperationalSimulationState {
  if (!state.activeMission || !state.handoverPlan || !state.replacementCandidate) return state

  const confResult = confirmMissionHandover(
    state.activeMission,
    state.handoverPlan,
    'Lanka Forward Logistics Point Commander'
  )

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'HANDOVER_CONFIRMED',
    step: 'HANDOVER_CONFIRMED',
    timestamp: '09:55',
    isoTimestamp: new Date().toISOString(),
    missionId: state.activeMission.id,
    vehicleId: state.replacementCandidate.vehicleId,
    location: state.handoverPlan.handoverLocation.name || 'Lanka Depot Yard',
    actor: 'Lanka Logistics Point Commander',
    description: `Physical cargo custody transfer verified. Mission resumed IN_TRANSIT with new carrier ${state.replacementCandidate.vehicleId}.`,
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'IN_TRANSIT',
    simulationClock: { ...state.simulationClock, simulatedTime: '09:55' },
    activeMission: confResult.mission,
    assignedVehicle: {
      vehicleId: state.replacementCandidate.vehicleId,
      currentCoordinates: [state.handoverPlan.handoverLocation.lat, state.handoverPlan.handoverLocation.lng],
      speedKmh: 52,
      readinessStatus: 'READY',
      aiRiskLevel: 'LOW',
    },
    events: [event, ...state.events],
  }
}

/**
 * 14. Step 13: Vehicle Reaches Vehicle Access Point (VAP)
 */
export function reachVehicleAccessPoint(state: OperationalSimulationState): OperationalSimulationState {
  const vapCoords: [number, number] = [25.1721, 93.0045]

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'VAP_REACHED',
    step: 'VAP_REACHED',
    timestamp: '10:25',
    isoTimestamp: new Date().toISOString(),
    location: 'Haflong River Vehicle Access Point (VAP)',
    coordinates: vapCoords,
    actor: 'Carrier Driver (NER-TRUCK-07)',
    description: 'Vehicle reached road terminus at Haflong VAP. LAST-MILE RESPONSE REQUIRED (3.8 km non-road gap). Mission NOT yet completed.',
    source: 'FIELD_OFFICER',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'LAST_MILE_REQUIRED',
    simulationClock: { ...state.simulationClock, simulatedTime: '10:25' },
    assignedVehicle: {
      ...state.assignedVehicle!,
      speedKmh: 0,
      currentCoordinates: vapCoords,
    },
    events: [event, ...state.events],
  }
}

/**
 * 15. Step 14: Field Team Completes Last-Mile Delivery
 */
export function completeLastMileFieldResponse(state: OperationalSimulationState): OperationalSimulationState {
  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'LAST_MILE_DELIVERED',
    step: 'LAST_MILE_COMPLETED',
    timestamp: '10:40',
    isoTimestamp: new Date().toISOString(),
    location: state.crisisLocation.name,
    coordinates: state.crisisLocation.coordinates,
    actor: 'SDRF Mountain Field Team Alpha',
    description: '3.8 km off-road transfer completed. 1,500 kg medical and ration supplies handed over to Haflong Relief Camp Coordinator.',
    source: 'FIELD_OFFICER',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'LAST_MILE_COMPLETED',
    simulationClock: { ...state.simulationClock, simulatedTime: '10:40' },
    events: [event, ...state.events],
  }
}

/**
 * 16. Step 15: Authorized Official Formally Completes Mission
 */
export function officiallyCompleteMission(state: OperationalSimulationState): OperationalSimulationState {
  if (!state.activeMission) return state

  const compResult = completeMission(
    state.activeMission,
    'District Magistrate / Incident Commander',
    'Mission successfully accomplished. Full relief payload delivered to crisis coordinates with zero casualties.'
  )

  const completedMission = compResult.mission || state.activeMission

  const event: OperationalEvent = {
    id: generateEventId(),
    type: 'MISSION_OFFICIALLY_COMPLETED',
    step: 'COMPLETED',
    timestamp: '10:45',
    isoTimestamp: new Date().toISOString(),
    missionId: completedMission.id,
    actor: 'District Magistrate / Incident Commander',
    description: `Official sign-off recorded. Mission ${completedMission.id} closed. Historical logs and AI health profiles updated.`,
    source: 'OFFICIAL_COMMAND',
    isSimulated: true,
  }

  return {
    ...state,
    currentStep: 'COMPLETED',
    simulationClock: { ...state.simulationClock, simulatedTime: '10:45' },
    activeMission: completedMission,
    events: [event, ...state.events],
  }
}

/**
 * 17. Step 16: Reset Demo Simulation
 */
export function resetSimulation(): OperationalSimulationState {
  return createInitialSimulationState()
}
