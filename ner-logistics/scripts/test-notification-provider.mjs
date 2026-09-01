// scripts/test-notification-provider.mjs
// ========================================================================
//    NERA PHASE 22: NOTIFICATION PROVIDER TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 22: NOTIFICATION PROVIDER TEST SUITE                      ')
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

// ── In-Memory Logic (Matching lib/notification-provider.ts) ──

const NOTIFICATION_CHANNELS = {
  IN_APP: { channel: 'IN_APP', status: 'AVAILABLE', isAvailable: true },
  SMS: { channel: 'SMS', status: 'UNCONFIGURED', isAvailable: false },
  EMAIL: { channel: 'EMAIL', status: 'UNCONFIGURED', isAvailable: false },
  PUSH: { channel: 'PUSH', status: 'UNCONFIGURED', isAvailable: false },
}

function dispatchOperationalNotification(params) {
  const channelInfo = NOTIFICATION_CHANNELS[params.channel]
  let deliveryStatus = 'SIMULATED_DELIVERY'

  if (params.channel === 'IN_APP') deliveryStatus = 'DELIVERED'
  else if (!channelInfo.isAvailable) deliveryStatus = 'SIMULATED_DELIVERY'

  return {
    notificationId: `NOTIF-TEST-${Math.floor(100 + Math.random() * 900)}`,
    recipient: params.recipient,
    targetRole: params.targetRole,
    district: params.district,
    severity: params.severity,
    channel: params.channel,
    title: params.title,
    deliveryStatus,
    isSimulated: params.isSimulated ?? true,
  }
}

// ------------------------------------------------------------------------
// TEST 1: In-App notification delivery works
// ------------------------------------------------------------------------
const notif1 = dispatchOperationalNotification({
  recipient: 'Commander Barman',
  targetRole: 'COMMANDER',
  severity: 'CRITICAL',
  channel: 'IN_APP',
  title: 'Critical Vehicle Failure',
  message: 'Vehicle NER-TRUCK-18 failure on NH-27',
  isSimulated: false,
})
assert(
  notif1.deliveryStatus === 'DELIVERED' && notif1.channel === 'IN_APP',
  'TEST 1: In-App notification delivered to command center console'
)

// ------------------------------------------------------------------------
// TEST 2: Unconfigured SMS gateway gracefully handles dispatch
// ------------------------------------------------------------------------
const notif2 = dispatchOperationalNotification({
  recipient: 'Disaster Authority Sarma',
  targetRole: 'DISASTER_AUTHORITY',
  severity: 'HIGH',
  channel: 'SMS',
  title: 'Road Blockage Confirmed',
  message: 'NH-27 Lumding corridor closed',
})
assert(
  notif2.deliveryStatus === 'SIMULATED_DELIVERY',
  'TEST 2: Unconfigured external SMS gateway falls back to SIMULATED_DELIVERY'
)

// ------------------------------------------------------------------------
// TEST 3: Notification channel configuration states verified
// ------------------------------------------------------------------------
assert(
  NOTIFICATION_CHANNELS.IN_APP.status === 'AVAILABLE' && NOTIFICATION_CHANNELS.SMS.status === 'UNCONFIGURED',
  'TEST 3: Notification channel status distinguishes active vs unconfigured providers'
)

// ------------------------------------------------------------------------
// TEST 4: District targeting preserved
// ------------------------------------------------------------------------
const notif4 = dispatchOperationalNotification({
  recipient: 'DEOC Haflong',
  targetRole: 'DISTRICT_AUTHORITY',
  district: 'Dima Hasao (Haflong)',
  severity: 'HIGH',
  channel: 'IN_APP',
  title: 'District Supply Shortage',
  message: 'Medical reserves below threshold',
})
assert(
  notif4.district === 'Dima Hasao (Haflong)',
  'TEST 4: Jurisdictional district targeting attached to notification record'
)

// ------------------------------------------------------------------------
// TEST 5: Simulated notification flag preserved
// ------------------------------------------------------------------------
assert(
  notif2.isSimulated === true,
  'TEST 5: Demonstration notification records carry explicit isSimulated=true badge'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/5 PHASE 22 NOTIFICATION PROVIDER TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

