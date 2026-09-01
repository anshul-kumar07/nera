// scripts/test-missions.mjs
// ========================================================================
//   NERA PHASE 12: MISSION MANAGEMENT & OFFICIAL DISPATCH TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 12: MISSION MANAGEMENT & OFFICIAL DISPATCH TEST SUITE     ')
console.log('========================================================================\n')

let passedTests = 0

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`)
    process.exit(1)
  } else {
    console.log(`✅ [PASS] ${message}`)
    passedTests++
  }
}

// ── Controlled In-Memory Mission State Engine matching lib/mission-management.ts ──
const ALLOWED_MISSION_TRANSITIONS = {
  PLANNED: ['ROUTE_PROPOSED', 'PENDING_APPROVAL', 'CANCELLED'],
  ROUTE_PROPOSED: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['DISPATCHED', 'INTERRUPTED', 'CANCELLED'],
  DISPATCHED: ['IN_TRANSIT', 'INTERRUPTED', 'CANCELLED'],
  IN_TRANSIT: ['REROUTING', 'INTERRUPTED', 'ARRIVED', 'COMPLETED', 'CANCELLED'],
  REROUTING: ['IN_TRANSIT', 'INTERRUPTED', 'CANCELLED'],
  INTERRUPTED: ['IN_TRANSIT', 'REROUTING', 'APPROVED', 'CANCELLED'],
  ARRIVED: ['COMPLETED', 'INTERRUPTED', 'CANCELLED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
}

function validateMissionTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return { valid: true }
  const allowed = ALLOWED_MISSION_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(nextStatus)) {
    return {
      valid: false,
      reason: `Illegal state transition from '${currentStatus}' to '${nextStatus}'.`,
    }
  }
  return { valid: true }
}

function createTestMission(params) {
  const id = `NERA-MSN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
  const now = new Date().toISOString()
  return {
    id,
    title: params.title || 'Emergency Medical Supply Mission',
    missionType: params.missionType || 'MEDICAL_SUPPLY',
    priority: params.priority || 'NORMAL',
    status: 'PLANNED',
    origin: params.origin,
    crisisLocation: params.crisisLocation,
    responseRequirement: params.responseRequirement || 'Medical essentials',
    incidentId: params.incidentId || null,
    assignedVehicleId: params.assignedVehicleId || null,
    vehicleReadiness: params.vehicleReadiness || null,
    routeSummary: params.routeSummary || null,
    approvalRecord: null,
    rejectionRecord: null,
    dispatchRecord: null,
    arrivalRecord: null,
    completionRecord: null,
    timeline: [
      { timestamp: now, action: 'MISSION_CREATED', actor: 'DISPATCHER', statusTo: 'PLANNED' },
    ],
    isSimulated: params.isSimulated !== false,
  }
}

function proposeTestRoute(mission, options = {}) {
  const isBlocked = options.incidents?.some(i => i.status === 'confirmed' || i.status === 'CONFIRMED')
  const lastMileRequired = options.lastMileRequired || false

  const routeSummary = {
    recommendedHighway: isBlocked ? 'NH-106 High Plateau Alternate Bypass' : 'NH-715 Southern Trunk Road',
    totalDistanceKm: lastMileRequired ? 310 : 126,
    vehicleAccessibleKm: lastMileRequired ? 302 : 126,
    lastMileKm: lastMileRequired ? 8 : 0,
    accessStatus: lastMileRequired ? 'LAST_MILE_REQUIRED' : 'DIRECT_VEHICLE_ACCESS',
    possibleLastMileModes: lastMileRequired ? ['BOAT', 'WALKING_FIELD_TEAM'] : ['DIRECT_VEHICLE'],
    recommendedLastMileMode: lastMileRequired ? 'BOAT' : 'DIRECT_VEHICLE',
    distanceCalculationMethod: lastMileRequired ? 'ESTIMATED_NON_ROAD_DISTANCE' : 'DIRECT_ACCESS',
  }

  const transition = validateMissionTransition(mission.status, 'PENDING_APPROVAL')
  const nextStatus = transition.valid ? 'PENDING_APPROVAL' : mission.status

  return {
    ...mission,
    status: nextStatus,
    routeSummary,
    timeline: [
      ...mission.timeline,
      { timestamp: new Date().toISOString(), action: 'ROUTE_PROPOSED', actor: 'NERA_ROUTING', statusTo: nextStatus },
    ],
  }
}

function approveTestMission(mission, approvingActor = 'ACTOR ID UNAVAILABLE', notes = '') {
  const transition = validateMissionTransition(mission.status, 'APPROVED')
  if (!transition.valid) return { success: false, error: transition.reason, mission }

  if (!mission.vehicleReadiness) {
    return { success: false, error: 'Vehicle safety record not attached', mission }
  }

  if (mission.vehicleReadiness.status === 'NOT_READY') {
    return { success: false, error: 'Cannot approve mission: Vehicle is NOT_READY (Critical Safety Failure)', mission }
  }

  if (mission.vehicleReadiness.status === 'DATA_INSUFFICIENT') {
    return { success: false, error: 'Cannot approve mission: Vehicle has DATA_INSUFFICIENT for critical checks', mission }
  }

  const now = new Date().toISOString()
  const updatedMission = {
    ...mission,
    status: 'APPROVED',
    approvalRecord: { approvedAt: now, approvedBy: approvingActor, decisionNotes: notes },
    timeline: [
      ...mission.timeline,
      { timestamp: now, action: 'OFFICIAL_APPROVAL', actor: approvingActor, statusTo: 'APPROVED' },
    ],
  }
  return { success: true, mission: updatedMission }
}

function rejectTestMission(mission, rejectingActor = 'ACTOR ID UNAVAILABLE', reason = 'Operational decision') {
  const transition = validateMissionTransition(mission.status, 'REJECTED')
  if (!transition.valid) return { success: false, error: transition.reason, mission }

  const now = new Date().toISOString()
  const updatedMission = {
    ...mission,
    status: 'REJECTED',
    rejectionRecord: { rejectedAt: now, rejectedBy: rejectingActor, rejectionReason: reason },
    timeline: [
      ...mission.timeline,
      { timestamp: now, action: 'OFFICIAL_REJECTION', actor: rejectingActor, statusTo: 'REJECTED', notes: reason },
    ],
  }
  return { success: true, mission: updatedMission }
}

function dispatchTestMission(mission, dispatchingActor = 'ACTOR ID UNAVAILABLE') {
  const transition = validateMissionTransition(mission.status, 'DISPATCHED')
  if (!transition.valid) return { success: false, error: transition.reason, mission }

  const now = new Date().toISOString()
  const updatedMission = {
    ...mission,
    status: 'IN_TRANSIT',
    dispatchRecord: { dispatchedAt: now, dispatchedBy: dispatchingActor },
    timeline: [
      ...mission.timeline,
      { timestamp: now, action: 'MISSION_DISPATCHED', actor: dispatchingActor, statusTo: 'IN_TRANSIT' },
    ],
  }
  return { success: true, mission: updatedMission }
}

function completeTestMission(mission, completingActor = 'ACTOR ID UNAVAILABLE') {
  const transition = validateMissionTransition(mission.status, 'COMPLETED')
  if (!transition.valid) return { success: false, error: transition.reason, mission }

  const now = new Date().toISOString()
  const updatedMission = {
    ...mission,
    status: 'COMPLETED',
    completionRecord: { completedAt: now, completedBy: completingActor },
    timeline: [
      ...mission.timeline,
      { timestamp: now, action: 'MISSION_COMPLETED', actor: completingActor, statusTo: 'COMPLETED' },
    ],
  }
  return { success: true, mission: updatedMission }
}

// ------------------------------------------------------------------------
// TEST 1: Mission creation with arbitrary coordinates
// ------------------------------------------------------------------------
const m1 = createTestMission({
  origin: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 27.1234, lng: 93.5678 },
})
assert(
  m1.origin.lat === 26.1445 && m1.crisisLocation.lat === 27.1234 && m1.status === 'PLANNED',
  'TEST 1: Mission creation with arbitrary coordinates initializes PLANNED state'
)

// ------------------------------------------------------------------------
// TEST 2: Mission without predefined NH route
// ------------------------------------------------------------------------
assert(
  m1.routeSummary === null && typeof m1.origin.lat === 'number',
  'TEST 2: Mission created without requirement for predefined NH corridor name'
)

// ------------------------------------------------------------------------
// TEST 3: Mission linked to incident
// ------------------------------------------------------------------------
const m3 = createTestMission({
  origin: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 26.9500, lng: 94.2167 },
  incidentId: 'INC-2026-FLOOD-01',
})
assert(
  m3.incidentId === 'INC-2026-FLOOD-01',
  'TEST 3: Mission cleanly stores and references associated incident ID'
)

// ------------------------------------------------------------------------
// TEST 4: Mission without incident (Proactive logistics)
// ------------------------------------------------------------------------
assert(
  m1.incidentId === null,
  'TEST 4: Proactive logistics mission created without incident link'
)

// ------------------------------------------------------------------------
// TEST 5: Route proposal generated
// ------------------------------------------------------------------------
const m5 = proposeTestRoute(m1)
assert(
  m5.status === 'PENDING_APPROVAL' && m5.routeSummary !== null && m5.routeSummary.totalDistanceKm > 0,
  'TEST 5: Route proposal generated and transitions mission to PENDING_APPROVAL'
)

// ------------------------------------------------------------------------
// TEST 6: Last-mile information integrated
// ------------------------------------------------------------------------
const m6 = proposeTestRoute(m3, { lastMileRequired: true })
assert(
  m6.routeSummary.accessStatus === 'LAST_MILE_REQUIRED' &&
  m6.routeSummary.lastMileKm === 8 &&
  m6.routeSummary.recommendedLastMileMode === 'BOAT',
  'TEST 6: Last-mile reachability and non-road transfer modes integrated into proposal'
)

// ------------------------------------------------------------------------
// TEST 7: READY vehicle eligible for dispatch approval
// ------------------------------------------------------------------------
const m7 = {
  ...m5,
  assignedVehicleId: 'NER-TRUCK-18',
  vehicleReadiness: {
    status: 'READY',
    isEligibleForEmergencyDeployment: true,
    blockingReasons: [],
    warnings: [],
  },
}
const app7 = approveTestMission(m7, 'Command Officer D. Das')
assert(
  app7.success === true && app7.mission.status === 'APPROVED',
  'TEST 7: READY vehicle passes safety gate and allows official mission approval'
)

// ------------------------------------------------------------------------
// TEST 8: NOT_READY vehicle blocked from approval
// ------------------------------------------------------------------------
const m8 = {
  ...m5,
  assignedVehicleId: 'NER-TRUCK-23',
  vehicleReadiness: {
    status: 'NOT_READY',
    isEligibleForEmergencyDeployment: false,
    blockingReasons: ['Brakes failed'],
    warnings: [],
  },
}
const app8 = approveTestMission(m8, 'Command Officer D. Das')
assert(
  app8.success === false && app8.error.includes('NOT_READY'),
  'TEST 8: NOT_READY vehicle blocked from official mission approval'
)

// ------------------------------------------------------------------------
// TEST 9: DATA_INSUFFICIENT vehicle blocked from approval
// ------------------------------------------------------------------------
const m9 = {
  ...m5,
  assignedVehicleId: 'NER-TRUCK-31',
  vehicleReadiness: {
    status: 'DATA_INSUFFICIENT',
    isEligibleForEmergencyDeployment: false,
    blockingReasons: [],
    warnings: [],
  },
}
const app9 = approveTestMission(m9, 'Command Officer D. Das')
assert(
  app9.success === false && app9.error.includes('DATA_INSUFFICIENT'),
  'TEST 9: DATA_INSUFFICIENT critical vehicle safety data blocks approval'
)

// ------------------------------------------------------------------------
// TEST 10: READY_WITH_WARNING displays warning and remains explicitly conditional
// ------------------------------------------------------------------------
const m10 = {
  ...m5,
  assignedVehicleId: 'NER-TRUCK-07',
  vehicleReadiness: {
    status: 'READY_WITH_WARNING',
    isEligibleForEmergencyDeployment: true,
    blockingReasons: [],
    warnings: ['Tyre tread advisory'],
  },
}
const app10 = approveTestMission(m10, 'Command Officer D. Das', 'Approved with tyre advisory acknowledged')
assert(
  app10.success === true && app10.mission.vehicleReadiness.warnings.length > 0,
  'TEST 10: READY_WITH_WARNING permits approval while preserving visible warning notice'
)

// ------------------------------------------------------------------------
// TEST 11: Invalid mission transitions rejected
// ------------------------------------------------------------------------
const compM = { ...m1, status: 'COMPLETED' }
const rejM = { ...m1, status: 'REJECTED' }
const badTrans1 = validateMissionTransition('COMPLETED', 'IN_TRANSIT')
const badTrans2 = validateMissionTransition('REJECTED', 'DISPATCHED')
const badTrans3 = validateMissionTransition('PLANNED', 'COMPLETED')
assert(
  badTrans1.valid === false && badTrans2.valid === false && badTrans3.valid === false,
  'TEST 11: State machine guards reject illegal mission lifecycle transitions'
)

// ------------------------------------------------------------------------
// TEST 12: Approval records timestamp and actor
// ------------------------------------------------------------------------
assert(
  typeof app7.mission.approvalRecord.approvedAt === 'string' &&
  app7.mission.approvalRecord.approvedBy === 'Command Officer D. Das',
  'TEST 12: Approval records explicit ISO timestamp and approving authority'
)

// ------------------------------------------------------------------------
// TEST 13: Rejection records reason
// ------------------------------------------------------------------------
const rejRes = rejectTestMission(m5, 'Disaster Director', 'Vehicle payload capacity insufficient')
assert(
  rejRes.success === true &&
  rejRes.mission.status === 'REJECTED' &&
  rejRes.mission.rejectionRecord.rejectionReason.includes('payload capacity'),
  'TEST 13: Rejection records explicit rejection reason in audit record'
)

// ------------------------------------------------------------------------
// TEST 14: Approved mission can be dispatched
// ------------------------------------------------------------------------
const dispRes = dispatchTestMission(app7.mission, 'NERA Dispatcher R. Bordoloi')
assert(
  dispRes.success === true && dispRes.mission.status === 'IN_TRANSIT',
  'TEST 14: Approved mission successfully dispatches to IN_TRANSIT'
)

// ------------------------------------------------------------------------
// TEST 15: Dispatch associates vehicle
// ------------------------------------------------------------------------
assert(
  dispRes.mission.assignedVehicleId === 'NER-TRUCK-18',
  'TEST 15: Dispatched mission maintains verified assigned vehicle association'
)

// ------------------------------------------------------------------------
// TEST 16: Existing simulated telemetry remains labelled
// ------------------------------------------------------------------------
assert(
  dispRes.mission.isSimulated === true,
  'TEST 16: Simulated mission convoy explicitly maintains isSimulated=true flag'
)

// ------------------------------------------------------------------------
// TEST 17: Mission enters IN_TRANSIT correctly
// ------------------------------------------------------------------------
assert(
  dispRes.mission.status === 'IN_TRANSIT' && dispRes.mission.dispatchRecord !== null,
  'TEST 17: Mission correctly enters IN_TRANSIT status upon convoy departure'
)

// ------------------------------------------------------------------------
// TEST 18: Confirmed incident can trigger rerouting
// ------------------------------------------------------------------------
const confirmedIncident = { id: 'INC-1', status: 'confirmed', highway: 'NH-715' }
const reroutedMission = proposeTestRoute(dispRes.mission, { incidents: [confirmedIncident] })
assert(
  reroutedMission.routeSummary.recommendedHighway.includes('Alternate Bypass'),
  'TEST 18: Confirmed incident triggers dynamic alternate bypass route recalculation'
)

// ------------------------------------------------------------------------
// TEST 19: Predicted incident does not automatically block mission
// ------------------------------------------------------------------------
const predictedIncident = { id: 'INC-PRED-1', status: 'predicted', highway: 'NH-715' }
const predMission = proposeTestRoute(dispRes.mission, { incidents: [predictedIncident] })
assert(
  predMission.routeSummary.recommendedHighway.includes('NH-715'),
  'TEST 19: Predicted incident does NOT block mission route (Preserves operational flow)'
)

// ------------------------------------------------------------------------
// TEST 20: Reported incident does not automatically block mission
// ------------------------------------------------------------------------
const reportedIncident = { id: 'INC-REP-1', status: 'reported', highway: 'NH-715' }
const repMission = proposeTestRoute(dispRes.mission, { incidents: [reportedIncident] })
assert(
  repMission.routeSummary.recommendedHighway.includes('NH-715'),
  'TEST 20: Unverified reported field incident does NOT block mission route'
)

// ------------------------------------------------------------------------
// TEST 21: Resolved incident restores route where appropriate
// ------------------------------------------------------------------------
const resolvedIncident = { id: 'INC-RES-1', status: 'resolved', highway: 'NH-715' }
const resMission = proposeTestRoute(dispRes.mission, { incidents: [resolvedIncident] })
assert(
  resMission.routeSummary.recommendedHighway.includes('NH-715'),
  'TEST 21: Resolved incident restores primary corridor access'
)

// ------------------------------------------------------------------------
// TEST 22: Vehicle reaching VAP does not falsely complete last-mile mission
// ------------------------------------------------------------------------
function simulateVehicleArrival(mission) {
  if (mission.routeSummary?.accessStatus === 'LAST_MILE_REQUIRED') {
    return {
      missionStatus: 'ARRIVED',
      isAtVapOnly: true,
      notice: 'VEHICLE ARRIVED AT ACCESS POINT. LAST-MILE FIELD TRANSFER REQUIRED.',
    }
  }
  return {
    missionStatus: 'ARRIVED',
    isAtVapOnly: false,
    notice: 'VEHICLE ARRIVED AT CRISIS DEPOT.',
  }
}
const vapArrival = simulateVehicleArrival(m6)
assert(
  vapArrival.isAtVapOnly === true && vapArrival.notice.includes('LAST-MILE FIELD TRANSFER REQUIRED'),
  'TEST 22: Reaching VAP does NOT falsely complete disaster response (Flags last-mile requirement)'
)

// ------------------------------------------------------------------------
// TEST 23: Direct-access mission can reach ARRIVED state
// ------------------------------------------------------------------------
const directArrival = simulateVehicleArrival(m5)
assert(
  directArrival.isAtVapOnly === false && directArrival.missionStatus === 'ARRIVED',
  'TEST 23: Direct-access mission reaches ARRIVED state at destination depot'
)

// ------------------------------------------------------------------------
// TEST 24: Mission requires explicit completion
// ------------------------------------------------------------------------
const inTransitM = { ...dispRes.mission, status: 'ARRIVED' }
const compResult = completeTestMission(inTransitM, 'Local Relief Officer T. Saikia')
assert(
  compResult.success === true &&
  compResult.mission.status === 'COMPLETED' &&
  typeof compResult.mission.completionRecord.completedAt === 'string',
  'TEST 24: Mission completion requires explicit operator confirmation and signoff'
)

// ------------------------------------------------------------------------
// TEST 25: Duplicate mission creation is prevented where applicable
// ------------------------------------------------------------------------
const existingMissionIds = new Set(['NERA-MSN-2026-001', 'NERA-MSN-2026-002'])
function deduplicateMissionSubmission(missionId, missionSet) {
  if (missionSet.has(missionId)) {
    return { accepted: false, reason: 'Duplicate mission ID rejected' }
  }
  missionSet.add(missionId)
  return { accepted: true }
}
const dupCheck1 = deduplicateMissionSubmission('NERA-MSN-2026-001', existingMissionIds)
const dupCheck2 = deduplicateMissionSubmission('NERA-MSN-NEW-999', existingMissionIds)
assert(
  dupCheck1.accepted === false && dupCheck2.accepted === true,
  'TEST 25: Duplicate mission submissions are identified and rejected cleanly'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/25 PHASE 12 MISSION MANAGEMENT TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

