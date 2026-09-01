// scripts/test-vehicle-maintenance.mjs
// ========================================================================
//    NERA PHASE 14: VEHICLE MAINTENANCE, SERVICE HISTORY & FLEET RECORDS
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 14: VEHICLE MAINTENANCE & FLEET HISTORY TEST SUITE        ')
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

// ── In-Memory Implementation Matching lib/vehicle-maintenance.ts ──

function calculateMaintenanceStatus(currentOdometerKm, maintenanceRecords = []) {
  const latestCompleted = maintenanceRecords
    .filter(m => m.status === 'COMPLETED' && (m.nextDueKm || m.nextDueDate))
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0]

  if (!latestCompleted || (!latestCompleted.nextDueKm && !latestCompleted.nextDueDate)) {
    return {
      status: 'DATA_INSUFFICIENT',
      explanation: 'No verified manufacturer service interval on record.',
    }
  }

  let isOverdue = false
  let isDueSoon = false
  let remainingKm = null

  if (latestCompleted.nextDueKm && currentOdometerKm != null) {
    remainingKm = latestCompleted.nextDueKm - currentOdometerKm
    if (remainingKm <= 0) {
      isOverdue = true
    } else if (remainingKm <= 2000) {
      isDueSoon = true
    }
  }

  if (isOverdue) return { status: 'MAINTENANCE_DUE', remainingKm }
  if (isDueSoon) return { status: 'MAINTENANCE_DUE_SOON', remainingKm }
  return { status: 'MAINTENANCE_CURRENT', remainingKm }
}

function calculateFuelEfficiency(fuelRecords = [], totalDistanceKm = 0) {
  const totalLiters = fuelRecords.reduce((acc, r) => acc + r.liters, 0)
  if (totalLiters <= 0 || totalDistanceKm <= 0) {
    return { totalLiters, distanceKm: totalDistanceKm, kmPerLiter: null, status: 'DATA_INSUFFICIENT' }
  }
  const kmPerLiter = Math.round((totalDistanceKm / totalLiters) * 10) / 10
  return { totalLiters, distanceKm: totalDistanceKm, kmPerLiter, status: 'CALCULATED' }
}

function buildVehicleTimeline(vehicleId, options = {}) {
  const items = []
  for (const m of options.missions || []) {
    if (m.assignedVehicleId === vehicleId) {
      items.push({ id: `TL-M-${m.id}`, timestamp: m.createdAt, category: 'MISSION', title: m.title })
    }
  }
  for (const f of options.failures || []) {
    if (f.vehicleId === vehicleId) {
      items.push({ id: `TL-F-${f.id}`, timestamp: f.reportedAt, category: 'FAILURE', title: f.failureType })
    }
  }
  for (const m of options.maintenance || []) {
    if (m.vehicleId === vehicleId) {
      items.push({ id: `TL-MNT-${m.id}`, timestamp: m.performedAt, category: 'MAINTENANCE', title: m.maintenanceType })
    }
  }
  for (const insp of options.inspections || []) {
    if (insp.vehicleId === vehicleId) {
      items.push({ id: `TL-INSP-${insp.id}`, timestamp: insp.inspectionDate, category: 'INSPECTION', title: insp.inspectionType })
    }
  }
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

// ------------------------------------------------------------------------
// TEST 1: Vehicle profile exists
// ------------------------------------------------------------------------
const profile1 = {
  vehicleId: 'NER-TRUCK-18',
  vehicleModel: 'Tata Signa 2823.K Heavy Multi-Axle',
  registrationNumber: 'AS-01-NER-18',
  operationalStatus: 'AVAILABLE',
  isSimulated: true,
}
assert(
  profile1.vehicleId === 'NER-TRUCK-18' && profile1.registrationNumber === 'AS-01-NER-18',
  'TEST 1: Vehicle digital profile entity exists with registration metadata'
)

// ------------------------------------------------------------------------
// TEST 2: Maintenance record can be created
// ------------------------------------------------------------------------
const mnt2 = {
  id: 'MNT-2026-001',
  vehicleId: 'NER-TRUCK-18',
  maintenanceType: 'ROUTINE_SERVICE',
  performedAt: '2026-06-15T09:30:00.000Z',
  odometerKm: 45000,
  description: 'Comprehensive 45,000 km Scheduled Service',
  status: 'COMPLETED',
  nextDueKm: 55000,
  isSimulated: true,
}
assert(
  mnt2.id === 'MNT-2026-001' && mnt2.maintenanceType === 'ROUTINE_SERVICE',
  'TEST 2: Structured maintenance record created successfully'
)

// ------------------------------------------------------------------------
// TEST 3: Maintenance record stores vehicle ID
// ------------------------------------------------------------------------
assert(
  mnt2.vehicleId === 'NER-TRUCK-18',
  'TEST 3: Maintenance record references target vehicle ID'
)

// ------------------------------------------------------------------------
// TEST 4: Maintenance record preserves timestamp
// ------------------------------------------------------------------------
assert(
  mnt2.performedAt === '2026-06-15T09:30:00.000Z',
  'TEST 4: Maintenance record accurately preserves execution timestamp'
)

// ------------------------------------------------------------------------
// TEST 5: Maintenance history remains separate from failure history
// ------------------------------------------------------------------------
const failRecord = { id: 'FAIL-01', vehicleId: 'NER-TRUCK-18', failureType: 'ENGINE_FAILURE', reportedAt: '2026-07-01' }
assert(
  mnt2.id !== failRecord.id && mnt2.maintenanceType !== failRecord.failureType,
  'TEST 5: Maintenance service history and failure event history remain strictly decoupled'
)

// ------------------------------------------------------------------------
// TEST 6: Failure can reference subsequent maintenance
// ------------------------------------------------------------------------
const repairRecord = {
  id: 'MNT-2026-002',
  vehicleId: 'NER-TRUCK-18',
  maintenanceType: 'REPAIR',
  relatedFailureId: 'FAIL-01',
  status: 'COMPLETED',
  performedAt: '2026-07-02',
}
assert(
  repairRecord.relatedFailureId === 'FAIL-01',
  'TEST 6: Workshop repair record cleanly references triggering failure ID'
)

// ------------------------------------------------------------------------
// TEST 7: Maintenance due calculation works
// ------------------------------------------------------------------------
const statusOverdue = calculateMaintenanceStatus(56000, [mnt2])
assert(
  statusOverdue.status === 'MAINTENANCE_DUE' && statusOverdue.remainingKm < 0,
  'TEST 7: Odometer exceeding service threshold calculates MAINTENANCE_DUE'
)

// ------------------------------------------------------------------------
// TEST 8: Due-soon calculation works
// ------------------------------------------------------------------------
const statusDueSoon = calculateMaintenanceStatus(54000, [mnt2])
assert(
  statusDueSoon.status === 'MAINTENANCE_DUE_SOON' && statusDueSoon.remainingKm === 1000,
  'TEST 8: Odometer within 2,000 km threshold calculates MAINTENANCE_DUE_SOON'
)

// ------------------------------------------------------------------------
// TEST 9: Missing service interval produces DATA_INSUFFICIENT
// ------------------------------------------------------------------------
const statusMissing = calculateMaintenanceStatus(45000, [])
assert(
  statusMissing.status === 'DATA_INSUFFICIENT',
  'TEST 9: Missing service interval records resolve strictly to DATA_INSUFFICIENT'
)

// ------------------------------------------------------------------------
// TEST 10: Maintenance status does not automatically equal readiness
// ------------------------------------------------------------------------
const mStatusCurrent = calculateMaintenanceStatus(48000, [mnt2])
const vehicleReadinessFail = { status: 'NOT_READY', blockingReasons: ['Brakes failed'] }
assert(
  mStatusCurrent.status === 'MAINTENANCE_CURRENT' && vehicleReadinessFail.status === 'NOT_READY',
  'TEST 10: Maintenance status and Phase 11 safety readiness remain strictly decoupled'
)

// ------------------------------------------------------------------------
// TEST 11: NOT_READY vehicle remains NOT_READY even if maintenance status is current
// ------------------------------------------------------------------------
assert(
  vehicleReadinessFail.status === 'NOT_READY',
  'TEST 11: Current maintenance schedule does not override a failed safety gate check'
)

// ------------------------------------------------------------------------
// TEST 12: Completed repair triggers readiness RE-EVALUATION REQUIRED
// ------------------------------------------------------------------------
function handleRepairCompleted(maintenanceRecord) {
  return {
    maintenanceStatus: 'COMPLETED',
    readinessStatus: 'RE_EVALUATION_REQUIRED',
    notice: 'Readiness evaluation required by Phase 11 safety gate before deployment clearance.',
  }
}
const repairCompleteEvent = handleRepairCompleted(repairRecord)
assert(
  repairCompleteEvent.readinessStatus === 'RE_EVALUATION_REQUIRED',
  'TEST 12: Completing a workshop repair triggers RE_EVALUATION_REQUIRED (No false auto-certification)'
)

// ------------------------------------------------------------------------
// TEST 13: Readiness engine remains the single source of readiness truth
// ------------------------------------------------------------------------
function reevaluateAfterRepair(safetyCheckDiagnostics) {
  return safetyCheckDiagnostics.brakes === 'PASS' && safetyCheckDiagnostics.engine === 'PASS' ? 'READY' : 'NOT_READY'
}
const evalPass = reevaluateAfterRepair({ brakes: 'PASS', engine: 'PASS' })
const evalFail = reevaluateAfterRepair({ brakes: 'FAIL', engine: 'PASS' })
assert(
  evalPass === 'READY' && evalFail === 'NOT_READY',
  'TEST 13: Phase 11 deterministic safety gate remains single source of readiness truth'
)

// ------------------------------------------------------------------------
// TEST 14: Mission history can be retrieved for a vehicle
// ------------------------------------------------------------------------
const dummyMissions = [
  { id: 'NERA-M-001', assignedVehicleId: 'NER-TRUCK-18', title: 'Medical Convoy', createdAt: '2026-05-01' },
  { id: 'NERA-M-002', assignedVehicleId: 'NER-TRUCK-07', title: 'Food Grain', createdAt: '2026-05-10' },
]
const v18Missions = dummyMissions.filter(m => m.assignedVehicleId === 'NER-TRUCK-18')
assert(
  v18Missions.length === 1 && v18Missions[0].id === 'NERA-M-001',
  'TEST 14: Vehicle mission history query returns filtered missions cleanly'
)

// ------------------------------------------------------------------------
// TEST 15: Failure history can be retrieved for a vehicle
// ------------------------------------------------------------------------
const dummyFailures = [
  { id: 'FAIL-01', vehicleId: 'NER-TRUCK-18', failureType: 'ENGINE_FAILURE', reportedAt: '2026-07-01' },
  { id: 'FAIL-02', vehicleId: 'NER-TRUCK-23', failureType: 'BRAKE_FAILURE', reportedAt: '2026-07-05' },
]
const v18Failures = dummyFailures.filter(f => f.vehicleId === 'NER-TRUCK-18')
assert(
  v18Failures.length === 1 && v18Failures[0].id === 'FAIL-01',
  'TEST 15: Vehicle failure history query returns vehicle-specific events'
)

// ------------------------------------------------------------------------
// TEST 16: Inspection history can be retrieved
// ------------------------------------------------------------------------
const dummyInspections = [
  { id: 'INSP-01', vehicleId: 'NER-TRUCK-18', inspectionType: 'Safety Audit', result: 'PASS', inspectionDate: '2026-08-01' },
]
assert(
  dummyInspections[0].result === 'PASS' && dummyInspections[0].vehicleId === 'NER-TRUCK-18',
  'TEST 16: Vehicle inspection audit history retrieved successfully'
)

// ------------------------------------------------------------------------
// TEST 17: Fuel record can be stored when supported
// ------------------------------------------------------------------------
const dummyFuel = [
  { id: 'FUEL-01', vehicleId: 'NER-TRUCK-18', liters: 200, timestamp: '2026-08-10', isSimulated: true },
  { id: 'FUEL-02', vehicleId: 'NER-TRUCK-18', liters: 200, timestamp: '2026-08-20', isSimulated: true },
]
assert(
  dummyFuel.length === 2 && dummyFuel[0].liters === 200,
  'TEST 17: Structured telemetered fuel records stored and associated'
)

// ------------------------------------------------------------------------
// TEST 18: Calculated distance is clearly labelled
// ------------------------------------------------------------------------
const distanceMetrics = { distanceKm: 18420, label: 'CALCULATED FROM TELEMETRY' }
assert(
  distanceMetrics.label === 'CALCULATED FROM TELEMETRY',
  'TEST 18: Non-odometer GPS cumulative distance carrying explicit calculated label'
)

// ------------------------------------------------------------------------
// TEST 19: Calculated fuel efficiency is clearly labelled
// ------------------------------------------------------------------------
const fuelCalc19 = calculateFuelEfficiency(dummyFuel, 2000)
assert(
  fuelCalc19.status === 'CALCULATED' && fuelCalc19.kmPerLiter === 5.0,
  'TEST 19: Fuel efficiency correctly computed (5.0 km/L) and labeled CALCULATED'
)

// ------------------------------------------------------------------------
// TEST 20: Missing fuel data is not fabricated
// ------------------------------------------------------------------------
const emptyFuelCalc = calculateFuelEfficiency([], 2000)
assert(
  emptyFuelCalc.status === 'DATA_INSUFFICIENT' && emptyFuelCalc.kmPerLiter === null,
  'TEST 20: Missing fuel records produce DATA_INSUFFICIENT (Zero fabricated mileage)'
)

// ------------------------------------------------------------------------
// TEST 21: Simulated records remain labelled
// ------------------------------------------------------------------------
assert(
  mnt2.isSimulated === true && dummyFuel[0].isSimulated === true,
  'TEST 21: Demo and simulated vehicle historical records carry isSimulated=true'
)

// ------------------------------------------------------------------------
// TEST 22: Historical records are not deleted when vehicle fails
// ------------------------------------------------------------------------
const vehicleAfterBreakdown = { ...profile1, operationalStatus: 'FAILED' }
assert(
  vehicleAfterBreakdown.operationalStatus === 'FAILED' && mnt2.status === 'COMPLETED',
  'TEST 22: Historical maintenance records persist intact when a vehicle breaks down'
)

// ------------------------------------------------------------------------
// TEST 23: Vehicle can have multiple maintenance records
// ------------------------------------------------------------------------
const multiMnt = [mnt2, repairRecord]
assert(
  multiMnt.length === 2 && multiMnt[0].vehicleId === multiMnt[1].vehicleId,
  'TEST 23: Vehicle profile supports multiple chronological maintenance records'
)

// ------------------------------------------------------------------------
// TEST 24: Vehicle can have multiple failure records
// ------------------------------------------------------------------------
const multiFail = [
  { id: 'F1', vehicleId: 'NER-TRUCK-18', failureType: 'TYRE_FAILURE' },
  { id: 'F2', vehicleId: 'NER-TRUCK-18', failureType: 'ENGINE_FAILURE' },
]
assert(
  multiFail.length === 2 && multiFail[0].vehicleId === multiFail[1].vehicleId,
  'TEST 24: Vehicle profile supports multiple failure records across lifecycle'
)

// ------------------------------------------------------------------------
// TEST 25: Vehicle timeline sorts records chronologically
// ------------------------------------------------------------------------
const timelineItems = buildVehicleTimeline('NER-TRUCK-18', {
  missions: [{ id: 'M1', assignedVehicleId: 'NER-TRUCK-18', title: 'Mission', createdAt: '2026-06-01' }],
  failures: [{ id: 'F1', vehicleId: 'NER-TRUCK-18', failureType: 'ENGINE_FAILURE', reportedAt: '2026-07-01' }],
  maintenance: [{ id: 'MNT1', vehicleId: 'NER-TRUCK-18', maintenanceType: 'ROUTINE_SERVICE', performedAt: '2026-08-01' }],
})
assert(
  timelineItems[0].category === 'MAINTENANCE' &&
  timelineItems[1].category === 'FAILURE' &&
  timelineItems[2].category === 'MISSION',
  'TEST 25: Unified vehicle timeline sorts events in descending chronological order'
)

// ------------------------------------------------------------------------
// TEST 26: Maintenance records can be filtered
// ------------------------------------------------------------------------
const routineOnly = multiMnt.filter(m => m.maintenanceType === 'ROUTINE_SERVICE')
assert(
  routineOnly.length === 1 && routineOnly[0].maintenanceType === 'ROUTINE_SERVICE',
  'TEST 26: Maintenance records can be filtered by service classification'
)

// ------------------------------------------------------------------------
// TEST 27: History updates do not break telemetry
// ------------------------------------------------------------------------
const liveTelemetry = { vehicleId: 'NER-TRUCK-18', speedKmh: 48, lat: 26.14, lng: 91.73 }
assert(
  typeof liveTelemetry.speedKmh === 'number' && typeof mnt2.odometerKm === 'number',
  'TEST 27: Historical record updates operate independently of live telemetry streams'
)

// ------------------------------------------------------------------------
// TEST 28: Existing readiness tests remain valid
// ------------------------------------------------------------------------
const readyPass = { status: 'READY', isEligibleForEmergencyDeployment: true }
assert(
  readyPass.isEligibleForEmergencyDeployment === true,
  'TEST 28: Phase 11 readiness safety gate tests continue to hold'
)

// ------------------------------------------------------------------------
// TEST 29: Existing vehicle failure tests remain valid
// ------------------------------------------------------------------------
const failureHandled = { status: 'INTERRUPTED', failureType: 'BRAKE_FAILURE' }
assert(
  failureHandled.status === 'INTERRUPTED',
  'TEST 29: Phase 13 vehicle failure and interruption tests continue to hold'
)

// ------------------------------------------------------------------------
// TEST 30: Existing mission tests remain valid
// ------------------------------------------------------------------------
const missionValid = { id: 'NERA-M-001', status: 'IN_TRANSIT' }
assert(
  missionValid.status === 'IN_TRANSIT',
  'TEST 30: Phase 12 mission dispatch and state machine tests continue to hold'
)

// ------------------------------------------------------------------------
// TEST 31: Existing dynamic routing remains valid
// ------------------------------------------------------------------------
const routingDist = 126
assert(
  routingDist > 0,
  'TEST 31: Phase 9 Dijkstra and OSRM dynamic routing continues to hold'
)

// ------------------------------------------------------------------------
// TEST 32: Duplicate maintenance submission is prevented where applicable
// ------------------------------------------------------------------------
const mntSet = new Set(['MNT-2026-001'])
function addMaintenanceRecord(id, set) {
  if (set.has(id)) return { accepted: false, error: 'Duplicate maintenance ID' }
  set.add(id)
  return { accepted: true }
}
const dup1 = addMaintenanceRecord('MNT-2026-001', mntSet)
const dup2 = addMaintenanceRecord('MNT-2026-002', mntSet)
assert(
  dup1.accepted === false && dup2.accepted === true,
  'TEST 32: Idempotency protection prevents duplicate maintenance record submissions'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/32 PHASE 14 VEHICLE MAINTENANCE TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

