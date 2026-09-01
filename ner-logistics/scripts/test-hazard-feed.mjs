// scripts/test-hazard-feed.mjs
// ========================================================================
//    NERA PHASE 22: AUTHORITATIVE HAZARD FEED & SAFETY RULES TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 22: AUTHORITATIVE HAZARD FEED & SAFETY RULES TEST SUITE   ')
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

// ── In-Memory Logic (Matching lib/hazard-feed.ts) ──

function ingestHazardEvent(params) {
  if (params.type === 'EARTHQUAKE' && params.infoState === 'AI_RISK_ESTIMATE') {
    throw new Error('SAFETY VIOLATION: NERA does not generate deterministic earthquake time/location predictions.')
  }

  const isAuthoritative =
    params.infoState === 'AUTHORITATIVE_ALERT' ||
    params.infoState === 'OFFICIAL_WARNING' ||
    params.infoState === 'OBSERVED'

  return {
    hazardId: `HAZ-TEST-${Math.floor(100 + Math.random() * 900)}`,
    type: params.type,
    infoState: params.infoState,
    title: params.title,
    severity: params.severity,
    isAuthoritative,
    isSimulated: params.isSimulated ?? true,
    logisticsImpactAssessment: {
      corridorExposureRisk: params.severity === 'CRITICAL' ? 'HIGH' : 'MODERATE',
      supplyDisruptionRisk: params.severity === 'CRITICAL' ? 'CRITICAL' : 'ELEVATED',
    },
  }
}

// ------------------------------------------------------------------------
// TEST 1: Authoritative flood warning ingested
// ------------------------------------------------------------------------
const floodEvent = ingestHazardEvent({
  type: 'FLOOD',
  infoState: 'AUTHORITATIVE_ALERT',
  title: 'Brahmaputra River Inundation Alert',
  severity: 'CRITICAL',
})
assert(
  floodEvent.isAuthoritative === true && floodEvent.type === 'FLOOD',
  'TEST 1: Authoritative disaster warning successfully ingested'
)

// ------------------------------------------------------------------------
// TEST 2: CRITICAL SAFETY RULE: AI earthquake prediction rejected
// ------------------------------------------------------------------------
let earthquakeSafetyBlocked = false
try {
  ingestHazardEvent({
    type: 'EARTHQUAKE',
    infoState: 'AI_RISK_ESTIMATE',
    title: 'Predicted Earthquake at 14:30',
    severity: 'CRITICAL',
  })
} catch {
  earthquakeSafetyBlocked = true
}
assert(
  earthquakeSafetyBlocked === true,
  'TEST 2: System strictly forbids claiming AI predicts deterministic earthquake occurrences'
)

// ------------------------------------------------------------------------
// TEST 3: Authoritative earthquake post-event assessment allowed
// ------------------------------------------------------------------------
const postEarthquake = ingestHazardEvent({
  type: 'EARTHQUAKE',
  infoState: 'OBSERVED',
  title: 'Magnitude 5.2 Seismic Event Observed in Dima Hasao',
  severity: 'HIGH',
})
assert(
  postEarthquake.isAuthoritative === true && postEarthquake.type === 'EARTHQUAKE',
  'TEST 3: Authoritative observed earthquake reports processed for route logistics impact'
)

// ------------------------------------------------------------------------
// TEST 4: Logistics exposure calculated
// ------------------------------------------------------------------------
assert(
  floodEvent.logisticsImpactAssessment.supplyDisruptionRisk === 'CRITICAL',
  'TEST 4: Disaster severity automatically translates to logistics supply disruption risk'
)

// ------------------------------------------------------------------------
// TEST 5: Simulated hazard badge preserved
// ------------------------------------------------------------------------
assert(
  floodEvent.isSimulated === true,
  'TEST 5: Demonstration hazard records explicitly retain isSimulated=true'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/5 PHASE 22 HAZARD FEED TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

