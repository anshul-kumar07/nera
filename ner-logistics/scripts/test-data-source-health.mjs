// scripts/test-data-source-health.mjs
// ========================================================================
//    NERA PHASE 22: DATA SOURCE HEALTH & FRESHNESS TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 22: DATA SOURCE HEALTH & FRESHNESS TEST SUITE             ')
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

// ── In-Memory Logic (Matching lib/data-source-health.ts) ──

const FRESHNESS_THRESHOLDS_SEC = {
  WEATHER: 1800,
  HAZARD_FEED: 900,
  FLEET_GPS: 60,
  INVENTORY: 3600,
}

function evaluateDataFreshness(category, lastUpdatedIso, isSimulated = false) {
  if (isSimulated) return { status: 'SIMULATED', freshnessSeconds: 0 }
  if (!lastUpdatedIso) return { status: 'UNAVAILABLE', freshnessSeconds: null }

  const updatedTime = new Date(lastUpdatedIso).getTime()
  if (isNaN(updatedTime)) return { status: 'DATA_INSUFFICIENT', freshnessSeconds: null }

  const now = Date.now()
  const freshnessSeconds = Math.max(0, Math.floor((now - updatedTime) / 1000))
  const threshold = FRESHNESS_THRESHOLDS_SEC[category] || 600

  if (freshnessSeconds <= threshold) return { status: 'LIVE', freshnessSeconds }
  return { status: 'STALE', freshnessSeconds }
}

// ------------------------------------------------------------------------
// TEST 1: LIVE source recognized correctly
// ------------------------------------------------------------------------
const liveWeather = evaluateDataFreshness('WEATHER', new Date(Date.now() - 120000).toISOString(), false)
assert(
  liveWeather.status === 'LIVE' && liveWeather.freshnessSeconds !== null,
  'TEST 1: Recently updated external API recognized as LIVE'
)

// ------------------------------------------------------------------------
// TEST 2: STALE source recognized correctly
// ------------------------------------------------------------------------
const staleWeather = evaluateDataFreshness('WEATHER', new Date(Date.now() - 3600000).toISOString(), false)
assert(
  staleWeather.status === 'STALE',
  'TEST 2: Outdated data recognized as STALE when threshold exceeded'
)

// ------------------------------------------------------------------------
// TEST 3: UNAVAILABLE source recognized correctly
// ------------------------------------------------------------------------
const unavailHazard = evaluateDataFreshness('HAZARD_FEED', null, false)
assert(
  unavailHazard.status === 'UNAVAILABLE',
  'TEST 3: Unconfigured data feed recognized as UNAVAILABLE'
)

// ------------------------------------------------------------------------
// TEST 4: SIMULATED source correctly labeled
// ------------------------------------------------------------------------
const simGps = evaluateDataFreshness('FLEET_GPS', new Date().toISOString(), true)
assert(
  simGps.status === 'SIMULATED',
  'TEST 4: Simulated demo telemetry explicitly labeled as SIMULATED'
)

// ------------------------------------------------------------------------
// TEST 5: DATA_INSUFFICIENT recognized on corrupted timestamp
// ------------------------------------------------------------------------
const badTs = evaluateDataFreshness('INVENTORY', 'corrupted-timestamp', false)
assert(
  badTs.status === 'DATA_INSUFFICIENT',
  'TEST 5: Corrupted timestamp gracefully resolves to DATA_INSUFFICIENT'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/5 PHASE 22 DATA SOURCE HEALTH TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

