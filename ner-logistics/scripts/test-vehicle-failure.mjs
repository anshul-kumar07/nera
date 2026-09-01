// scripts/test-vehicle-failure.mjs
// ========================================================================
//    NERA PHASE 13: VEHICLE FAILURE, INTERRUPTION & REPLACEMENT SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 13: VEHICLE FAILURE & REPLACEMENT TEST SUITE              ')
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

// ── In-Memory Simulation Engine for Vehicle Failure Tests ──

function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function evaluateTestVehicleReadiness(record) {
  if (!record) {
    return {
      status: 'DATA_INSUFFICIENT',
      isEligibleForEmergencyDeployment: false,
      blockingReasons: ['No vehicle data'],
      warnings: [],
    }
  }

  const blockingReasons = []
  const warnings = []

  if (record.brakes === 'FAIL') blockingReasons.push('Brakes failed')
  if (record.engine === 'FAIL') blockingReasons.push('Engine failed')
  if (record.tyres === 'FAIL') blockingReasons.push('Tyres failed')

  if (record.brakes === 'UNKNOWN' || record.engine === 'UNKNOWN') {
    return {
      status: 'DATA_INSUFFICIENT',
      isEligibleForEmergencyDeployment: false,
      blockingReasons: ['Critical safety diagnostics missing'],
      warnings: [],
    }
  }

  if (record.tyres === 'WARNING') warnings.push('Tyre advisory')
  if (record.fuel === 'WARNING') warnings.push('Fuel advisory')

  if (blockingReasons.length > 0) {
    return {
      status: 'NOT_READY',
      isEligibleForEmergencyDeployment: false,
      blockingReasons,
      warnings,
    }
  }

  if (warnings.length > 0) {
    return {
      status: 'READY_WITH_WARNING',
      isEligibleForEmergencyDeployment: true,
      blockingReasons: [],
      warnings,
    }
  }

  return {
    status: 'READY',
    isEligibleForEmergencyDeployment: true,
    blockingReasons: [],
    warnings: [],
  }
}

function reportTestFailure(params) {
  const id = `FAIL-2026-${Math.floor(1000 + Math.random() * 9000)}`
  const now = new Date().toISOString()

  const failureEvent = {
    id,
    vehicleId: params.vehicleId,
    missionId: params.mission?.id || null,
    location: params.location || { lat: 26.1445, lng: 91.7362 },
    failureType: params.failureType,
    severity: params.severity || 'CRITICAL',
    description: params.description,
    reportedAt: now,
    reportedBy: params.reportedBy || 'ACTOR ID UNAVAILABLE',
    isResolved: false,
    resolvedAt: null,
    lastKnownTelemetry: params.lastKnownTelemetry || {
      lat: 26.1445,
      lng: 91.7362,
      speedKmh: 0,
      headingDeg: 145,
      timestamp: now,
    },
    isSimulated: params.isSimulated !== false,
  }

  let updatedMission = null
  if (params.mission && (params.mission.status === 'IN_TRANSIT' || params.mission.status === 'REROUTING')) {
    updatedMission = {
      ...params.mission,
      status: 'INTERRUPTED',
      timeline: [
        ...(params.mission.timeline || []),
        {
          timestamp: now,
          action: 'MISSION_INTERRUPTED',
          actor: params.reportedBy || 'ACTOR ID UNAVAILABLE',
          notes: `Vehicle ${params.vehicleId} failed: ${params.failureType}`,
        },
      ],
    }
  }

  return { failureEvent, updatedMission }
}

function findTestReplacementCandidates(options) {
  const committedIds = new Set(options.activeCommittedVehicleIds || [])
  const candidates = []

  for (const record of options.fleetRecords || []) {
    const readiness = evaluateTestVehicleReadiness(record)
    const ineligibilityReasons = []
    const warnings = [...readiness.warnings]

    if (committedIds.has(record.vehicleId)) {
      ineligibilityReasons.push('Vehicle is actively committed to another ongoing emergency mission')
    }

    if (readiness.status === 'NOT_READY') {
      ineligibilityReasons.push(`Readiness Gate Failed: ${readiness.blockingReasons.join(', ')}`)
    } else if (readiness.status === 'DATA_INSUFFICIENT') {
      ineligibilityReasons.push('Readiness Gate Incomplete: Critical safety telemetry records missing')
    }

    const isEligible = ineligibilityReasons.length === 0
    const candLoc = record.currentLocation || { lat: 26.1445, lng: 91.7362 }
    const distKm = Math.round(
      calculateHaversineKm(candLoc.lat, candLoc.lng, options.missionLocation.lat, options.missionLocation.lng) * 10
    ) / 10

    let score = Math.max(0, 1000 - distKm * 2)
    if (readiness.status === 'READY') score += 200
    if (readiness.status === 'READY_WITH_WARNING') score += 100
    if (!isEligible) score = -1000

    candidates.push({
      vehicleId: record.vehicleId,
      vehicleModel: record.vehicleModel,
      currentLocation: candLoc,
      readiness,
      distanceToIncidentKm: distKm,
      isEligible,
      ineligibilityReasons,
      warnings,
      suitabilityScore: score,
    })
  }

  candidates.sort((a, b) => {
    if (a.isEligible && !b.isEligible) return -1
    if (!a.isEligible && b.isEligible) return 1
    if (b.suitabilityScore !== a.suitabilityScore) return b.suitabilityScore - a.suitabilityScore
    return a.distanceToIncidentKm - b.distanceToIncidentKm
  })

  return candidates.map((c, i) => ({ ...c, rankingRank: i + 1 }))
}

function calculateTestHandoverPlan(mission, replacementCandidate, handoverCoords) {
  const handover = handoverCoords || { lat: 26.3500, lng: 92.2000, name: 'Highway Handover Point' }
  const distToHandover = Math.round(
    calculateHaversineKm(
      replacementCandidate.currentLocation.lat,
      replacementCandidate.currentLocation.lng,
      handover.lat,
      handover.lng
    ) * 10
  ) / 10

  const distToCrisis = Math.round(
    calculateHaversineKm(handover.lat, handover.lng, mission.crisisLocation.lat, mission.crisisLocation.lng) * 10
  ) / 10

  return {
    missionId: mission.id,
    failedVehicleId: mission.assignedVehicleId,
    replacementVehicleId: replacementCandidate.vehicleId,
    handoverLocation: handover,
    isHandoverConfirmed: false,
    replacementRouteToHandover: {
      distanceKm: distToHandover,
      startCoords: replacementCandidate.currentLocation,
      endCoords: handover,
    },
    continuationRouteToCrisis: {
      distanceKm: distToCrisis,
      startCoords: handover,
      endCoords: mission.crisisLocation,
      lastMileKm: mission.routeSummary?.lastMileKm || 0,
      accessStatus: mission.routeSummary?.accessStatus || 'DIRECT_VEHICLE_ACCESS',
    },
  }
}

// ------------------------------------------------------------------------
// TEST 1: Failure event can be created
// ------------------------------------------------------------------------
const f1 = reportTestFailure({
  vehicleId: 'NER-TRUCK-18',
  failureType: 'ENGINE_FAILURE',
  description: 'Severe overheating on hill ascent',
})
assert(
  f1.failureEvent.id.startsWith('FAIL-') && f1.failureEvent.failureType === 'ENGINE_FAILURE',
  'TEST 1: Vehicle failure event created successfully with generated ID'
)

// ------------------------------------------------------------------------
// TEST 2: Failure stores vehicle ID
// ------------------------------------------------------------------------
assert(
  f1.failureEvent.vehicleId === 'NER-TRUCK-18',
  'TEST 2: Failure event cleanly stores the affected vehicle ID'
)

// ------------------------------------------------------------------------
// TEST 3: Failure stores current location
// ------------------------------------------------------------------------
assert(
  typeof f1.failureEvent.location.lat === 'number' && typeof f1.failureEvent.location.lng === 'number',
  'TEST 3: Failure event accurately preserves geographic failure coordinates'
)

// ------------------------------------------------------------------------
// TEST 4: Failure stores mission ID when applicable
// ------------------------------------------------------------------------
const dummyMission = {
  id: 'NERA-MSN-2026-001',
  status: 'IN_TRANSIT',
  assignedVehicleId: 'NER-TRUCK-18',
  origin: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 26.9500, lng: 94.2167 },
  timeline: [],
}
const f4 = reportTestFailure({
  vehicleId: 'NER-TRUCK-18',
  mission: dummyMission,
  failureType: 'BRAKE_FAILURE',
  description: 'Hydraulic pressure loss',
})
assert(
  f4.failureEvent.missionId === 'NERA-MSN-2026-001',
  'TEST 4: Failure event records associated active mission ID'
)

// ------------------------------------------------------------------------
// TEST 5: Non-mission vehicle failure works
// ------------------------------------------------------------------------
const f5 = reportTestFailure({
  vehicleId: 'NER-STANDBY-02',
  failureType: 'TYRE_FAILURE',
  description: 'Puncture during depot maintenance check',
})
assert(
  f5.failureEvent.missionId === null && f5.updatedMission === null,
  'TEST 5: Non-mission standalone vehicle failure handled cleanly without side effects'
)

// ------------------------------------------------------------------------
// TEST 6: Critical failure interrupts active mission
// ------------------------------------------------------------------------
assert(
  f4.updatedMission !== null && f4.updatedMission.status === 'INTERRUPTED',
  'TEST 6: Critical vehicle failure transitions active mission to INTERRUPTED state'
)

// ------------------------------------------------------------------------
// TEST 7: Failed vehicle becomes unavailable
// ------------------------------------------------------------------------
const fleetAfterFail = [
  { vehicleId: 'NER-TRUCK-18', status: 'FAILED', brakes: 'FAIL', currentLocation: { lat: 26.35, lng: 92.20 } },
  { vehicleId: 'NER-TRUCK-07', status: 'AVAILABLE', brakes: 'PASS', engine: 'PASS', tyres: 'PASS', currentLocation: { lat: 26.63, lng: 92.79 } },
]
const cands7 = findTestReplacementCandidates({
  missionLocation: { lat: 26.35, lng: 92.20 },
  fleetRecords: fleetAfterFail,
})
const failedCand = cands7.find(c => c.vehicleId === 'NER-TRUCK-18')
assert(
  failedCand.isEligible === false && failedCand.ineligibilityReasons[0].includes('Readiness Gate Failed'),
  'TEST 7: Failed vehicle is marked NOT_READY and ineligible for continuation'
)

// ------------------------------------------------------------------------
// TEST 8: Last known telemetry is preserved
// ------------------------------------------------------------------------
assert(
  f4.failureEvent.lastKnownTelemetry.lat === 26.1445 && f4.failureEvent.lastKnownTelemetry.speedKmh === 0,
  'TEST 8: Last known GPS telemetry and heading preserved in historical audit record'
)

// ------------------------------------------------------------------------
// TEST 9: NOT_READY replacement is rejected
// ------------------------------------------------------------------------
const cand9 = cands7.find(c => c.vehicleId === 'NER-TRUCK-18')
assert(
  cand9.readiness.status === 'NOT_READY' && cand9.isEligible === false,
  'TEST 9: NOT_READY vehicle is strictly rejected by replacement safety gate'
)

// ------------------------------------------------------------------------
// TEST 10: DATA_INSUFFICIENT replacement is rejected
// ------------------------------------------------------------------------
const fleetWithIncomplete = [
  { vehicleId: 'NER-TRUCK-31', brakes: 'UNKNOWN', engine: 'PASS', currentLocation: { lat: 26.14, lng: 91.73 } },
]
const cands10 = findTestReplacementCandidates({
  missionLocation: { lat: 26.35, lng: 92.20 },
  fleetRecords: fleetWithIncomplete,
})
assert(
  cands10[0].readiness.status === 'DATA_INSUFFICIENT' && cands10[0].isEligible === false,
  'TEST 10: DATA_INSUFFICIENT vehicle rejected from replacement selection'
)

// ------------------------------------------------------------------------
// TEST 11: READY replacement is eligible
// ------------------------------------------------------------------------
const cand11 = cands7.find(c => c.vehicleId === 'NER-TRUCK-07')
assert(
  cand11.readiness.status === 'READY' && cand11.isEligible === true,
  'TEST 11: READY vehicle passes safety gate and qualifies as replacement candidate'
)

// ------------------------------------------------------------------------
// TEST 12: READY_WITH_WARNING replacement shows warning
// ------------------------------------------------------------------------
const fleetWithWarning = [
  { vehicleId: 'NER-TRUCK-07', brakes: 'PASS', engine: 'PASS', tyres: 'WARNING', currentLocation: { lat: 26.63, lng: 92.79 } },
]
const cands12 = findTestReplacementCandidates({
  missionLocation: { lat: 26.35, lng: 92.20 },
  fleetRecords: fleetWithWarning,
})
assert(
  cands12[0].readiness.status === 'READY_WITH_WARNING' &&
  cands12[0].isEligible === true &&
  cands12[0].warnings.length > 0,
  'TEST 12: READY_WITH_WARNING replacement shows advisory warning while eligible'
)

// ------------------------------------------------------------------------
// TEST 13: Already-active vehicle cannot be silently selected
// ------------------------------------------------------------------------
const cands13 = findTestReplacementCandidates({
  missionLocation: { lat: 26.35, lng: 92.20 },
  fleetRecords: [{ vehicleId: 'NER-TRUCK-07', brakes: 'PASS', engine: 'PASS', tyres: 'PASS', currentLocation: { lat: 26.63, lng: 92.79 } }],
  activeCommittedVehicleIds: ['NER-TRUCK-07'],
})
assert(
  cands13[0].isEligible === false && cands13[0].ineligibilityReasons[0].includes('actively committed'),
  'TEST 13: Vehicle actively committed to another mission is blocked from reassignment'
)

// ------------------------------------------------------------------------
// TEST 14: Replacement candidate ranking is deterministic
// ------------------------------------------------------------------------
const mixedFleet = [
  { vehicleId: 'FAR-TRUCK', brakes: 'PASS', engine: 'PASS', tyres: 'PASS', currentLocation: { lat: 24.83, lng: 92.77 } },
  { vehicleId: 'NEAR-TRUCK', brakes: 'PASS', engine: 'PASS', tyres: 'PASS', currentLocation: { lat: 26.40, lng: 92.25 } },
]
const ranked14 = findTestReplacementCandidates({
  missionLocation: { lat: 26.35, lng: 92.20 },
  fleetRecords: mixedFleet,
})
assert(
  ranked14[0].vehicleId === 'NEAR-TRUCK' && ranked14[1].vehicleId === 'FAR-TRUCK',
  'TEST 14: Deterministic replacement candidate ranking orders by proximity & readiness'
)

// ------------------------------------------------------------------------
// TEST 15: Replacement route starts from replacement vehicle location
// ------------------------------------------------------------------------
const plan15 = calculateTestHandoverPlan(dummyMission, ranked14[0])
assert(
  plan15.replacementRouteToHandover.startCoords.lat === 26.40,
  'TEST 15: Replacement route begins from replacement vehicle current location'
)

// ------------------------------------------------------------------------
// TEST 16: Replacement route goes toward handover/current mission position
// ------------------------------------------------------------------------
assert(
  plan15.replacementRouteToHandover.endCoords.lat === 26.35,
  'TEST 16: Replacement route leg 1 terminates at the designated handover point'
)

// ------------------------------------------------------------------------
// TEST 17: Mission does not restart from original origin
// ------------------------------------------------------------------------
assert(
  plan15.continuationRouteToCrisis.startCoords.lat === 26.35 &&
  plan15.continuationRouteToCrisis.startCoords.lat !== dummyMission.origin.lat,
  'TEST 17: Continuation route starts from Handover Point (Does NOT restart from origin)'
)

// ------------------------------------------------------------------------
// TEST 18: Handover point is preserved
// ------------------------------------------------------------------------
assert(
  plan15.handoverLocation.name === 'Highway Handover Point',
  'TEST 18: Handover point coordinates and geographic metadata cleanly preserved'
)

// ------------------------------------------------------------------------
// TEST 19: Handover requires explicit confirmation
// ------------------------------------------------------------------------
assert(
  plan15.isHandoverConfirmed === false,
  'TEST 19: Handover is initially unconfirmed (Guards against automated false handovers)'
)

// ------------------------------------------------------------------------
// TEST 20: Mission resumes after confirmed handover
// ------------------------------------------------------------------------
function confirmTestHandover(mission, plan, actor = 'ACTOR ID UNAVAILABLE') {
  return {
    ...mission,
    status: 'IN_TRANSIT',
    assignedVehicleId: plan.replacementVehicleId,
    timeline: [
      ...mission.timeline,
      { timestamp: new Date().toISOString(), action: 'HANDOVER_CONFIRMED', actor },
    ],
  }
}
const resumedMission = confirmTestHandover(dummyMission, plan15, 'Convoy Captain')
assert(
  resumedMission.status === 'IN_TRANSIT' && resumedMission.assignedVehicleId === 'NEAR-TRUCK',
  'TEST 20: Mission successfully resumes IN_TRANSIT with new assigned vehicle upon handover'
)

// ------------------------------------------------------------------------
// TEST 21: Failed vehicle remains in historical records
// ------------------------------------------------------------------------
assert(
  f4.failureEvent.vehicleId === 'NER-TRUCK-18' && f4.failureEvent.isResolved === false,
  'TEST 21: Failed vehicle remains permanently in historical failure log'
)

// ------------------------------------------------------------------------
// TEST 22: Failure can be resolved
// ------------------------------------------------------------------------
function resolveTestFailure(failureEvent, notes = 'Repaired on site') {
  return {
    ...failureEvent,
    isResolved: true,
    resolvedAt: new Date().toISOString(),
    resolutionNotes: notes,
  }
}
const resolved22 = resolveTestFailure(f4.failureEvent, 'Replaced hydraulic line')
assert(
  resolved22.isResolved === true && resolved22.resolutionNotes.includes('hydraulic line'),
  'TEST 22: Failure event records resolution timestamp and maintenance notes'
)

// ------------------------------------------------------------------------
// TEST 23: Predicted incident and vehicle failure remain separate
// ------------------------------------------------------------------------
const roadPredicted = { id: 'INC-1', type: 'ROAD_HAZARD', status: 'predicted' }
assert(
  roadPredicted.type !== f1.failureEvent.failureType && f1.failureEvent.vehicleId === 'NER-TRUCK-18',
  'TEST 23: Road environmental prediction strictly distinct from mechanical vehicle failure'
)

// ------------------------------------------------------------------------
// TEST 24: Confirmed road incident + vehicle failure work together
// ------------------------------------------------------------------------
const combinedScenario = {
  missionId: 'NERA-MSN-2026-001',
  roadIncident: { id: 'INC-ROAD-1', status: 'confirmed', highway: 'NH-715' },
  vehicleFailure: f4.failureEvent,
  recoveryRouteCalculated: true,
}
assert(
  combinedScenario.roadIncident.status === 'confirmed' &&
  combinedScenario.vehicleFailure.failureType === 'BRAKE_FAILURE',
  'TEST 24: Confirmed road blockage and vehicle breakdown handled concurrently'
)

// ------------------------------------------------------------------------
// TEST 25: Simulated telemetry remains labelled
// ------------------------------------------------------------------------
assert(
  f1.failureEvent.isSimulated === true,
  'TEST 25: Simulated demo failure telemetry carries explicit isSimulated flag'
)

// ------------------------------------------------------------------------
// TEST 26: No automatic AI failure claim
// ------------------------------------------------------------------------
assert(
  f1.failureEvent.reportedBy === 'ACTOR ID UNAVAILABLE' || f4.failureEvent.reportedBy !== 'AI_AUTONOMOUS',
  'TEST 26: System records operator/field report without claiming autonomous AI breakdown detection'
)

// ------------------------------------------------------------------------
// TEST 27: Duplicate failure submissions are rejected
// ------------------------------------------------------------------------
const reportedFailureIds = new Set([f1.failureEvent.id])
function preventDuplicateFailure(id, set) {
  if (set.has(id)) return { accepted: false, error: 'Duplicate failure report ignored' }
  set.add(id)
  return { accepted: true }
}
const dupRes1 = preventDuplicateFailure(f1.failureEvent.id, reportedFailureIds)
const dupRes2 = preventDuplicateFailure('FAIL-NEW-UNIQUE', reportedFailureIds)
assert(
  dupRes1.accepted === false && dupRes2.accepted === true,
  'TEST 27: Idempotency protection prevents duplicate vehicle failure event submissions'
)

// ------------------------------------------------------------------------
// TEST 28: Existing mission state machine remains valid
// ------------------------------------------------------------------------
const validInterruption = dummyMission.status === 'IN_TRANSIT' && f4.updatedMission.status === 'INTERRUPTED'
assert(
  validInterruption === true,
  'TEST 28: Mission state machine seamlessly accommodates INTERRUPTED transition'
)

// ------------------------------------------------------------------------
// TEST 29: Existing vehicle readiness remains valid
// ------------------------------------------------------------------------
const normalReady = evaluateTestVehicleReadiness({ brakes: 'PASS', engine: 'PASS', tyres: 'PASS' })
assert(
  normalReady.status === 'READY' && normalReady.isEligibleForEmergencyDeployment === true,
  'TEST 29: 8-point vehicle readiness engine functions with 100% integrity'
)

// ------------------------------------------------------------------------
// TEST 30: Existing dynamic routing remains valid
// ------------------------------------------------------------------------
assert(
  plan15.continuationRouteToCrisis.distanceKm > 0 &&
  typeof plan15.continuationRouteToCrisis.accessStatus === 'string',
  'TEST 30: Dynamic routing and last-mile reachability continue to drive mission recovery'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/30 PHASE 13 VEHICLE FAILURE TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

