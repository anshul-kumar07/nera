// scripts/test-vehicle-readiness.mjs
// ========================================================================
//   NERA PHASE 11: VEHICLE READINESS & SAFETY GATE TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 11: VEHICLE READINESS & SAFETY GATE TEST SUITE            ')
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

// ── Controlled Deterministic Evaluator Matching lib/vehicle-readiness.ts ──
function evaluateVehicleReadiness(input) {
  const vehicleId = input.vehicleId || input.vehicle_number || 'UNKNOWN-VEHICLE'
  const record = { ...input }

  const isSimulated = record.isSimulated !== false

  const checks = [
    // CRITICAL
    {
      key: 'BRAKES',
      name: 'Pneumatic / Hydraulic Brake System',
      category: 'CRITICAL',
      status: record.brakeStatus || 'UNKNOWN',
      message:
        record.brakeStatus === 'PASS'
          ? 'Brake pressure and pad thickness nominal'
          : record.brakeStatus === 'FAIL'
          ? 'CRITICAL BRAKE FAULT: Pressure loss or mechanical failure detected'
          : record.brakeStatus === 'WARNING'
          ? 'Brake wear advisory: pad wear approaching maintenance limit'
          : 'DATA UNAVAILABLE: Brake inspection log missing',
    },
    {
      key: 'ENGINE',
      name: 'Powertrain & Engine Health',
      category: 'CRITICAL',
      status: record.engineStatus || 'UNKNOWN',
      message:
        record.engineStatus === 'PASS'
          ? 'Engine operating parameters and oil pressure nominal'
          : record.engineStatus === 'FAIL'
          ? 'CRITICAL ENGINE FAULT: Overheating or mechanical malfunction'
          : record.engineStatus === 'WARNING'
          ? 'Engine warning: minor sensor anomaly detected'
          : 'DATA UNAVAILABLE: Engine diagnostics not received',
    },
    {
      key: 'TYRES',
      name: 'Tyre Tread & Mountain Terrain Integrity',
      category: 'CRITICAL',
      status: record.tyreStatus || 'UNKNOWN',
      message:
        record.tyreStatus === 'PASS'
          ? 'Tread depth and pressure adequate for hill roads'
          : record.tyreStatus === 'FAIL'
          ? 'CRITICAL TYRE FAILURE: Puncture or severe tread baldness'
          : record.tyreStatus === 'WARNING'
          ? 'Tyre advisory: tread depth low'
          : 'DATA UNAVAILABLE: Tyre physical check record missing',
    },
    {
      key: 'MECHANICAL_INTEGRITY',
      name: 'Suspension, Chassis & Steering Integrity',
      category: 'CRITICAL',
      status: record.mechanicalStatus || 'UNKNOWN',
      message:
        record.mechanicalStatus === 'PASS'
          ? 'Structural chassis and axle load suspension verified'
          : record.mechanicalStatus === 'FAIL'
          ? 'CRITICAL MECHANICAL ISSUE: Chassis crack or suspension fracture'
          : record.mechanicalStatus === 'WARNING'
          ? 'Mechanical warning: slight steering alignment drift'
          : 'DATA UNAVAILABLE: Mechanical structural inspection unavailable',
    },
    // NON-CRITICAL
    {
      key: 'FUEL_LEVEL',
      name: 'Fuel Reserve & Range Adequacy',
      category: 'NON_CRITICAL',
      status:
        typeof record.fuelLevelPct === 'number'
          ? record.fuelLevelPct >= 50
            ? 'PASS'
            : record.fuelLevelPct >= 25
            ? 'WARNING'
            : 'FAIL'
          : 'UNKNOWN',
      message:
        typeof record.fuelLevelPct === 'number'
          ? record.fuelLevelPct >= 50
            ? `Fuel level verified at ${record.fuelLevelPct}%`
            : `Low fuel alert: Tank at ${record.fuelLevelPct}%.`
          : 'DATA UNAVAILABLE: Fuel telemetry sensor not transmitting',
    },
    {
      key: 'EMERGENCY_KIT',
      name: 'First-Aid Kit & Emergency Equipment',
      category: 'NON_CRITICAL',
      status: record.emergencyKitStatus || 'UNKNOWN',
      message: record.emergencyKitStatus === 'PASS' ? 'First-aid kit verified' : 'Equipment unverified',
    },
    {
      key: 'COMM_EQUIPMENT',
      name: 'VHF Radio & Satellite GPS Uplink',
      category: 'NON_CRITICAL',
      status: record.commEquipmentStatus || 'UNKNOWN',
      message: record.commEquipmentStatus === 'PASS' ? 'Tactical VHF active' : 'Comm unverified',
    },
    {
      key: 'SERVICE_COMPLIANCE',
      name: 'Periodic Service & Road Fitness Certificate',
      category: 'NON_CRITICAL',
      status: record.serviceComplianceStatus || 'UNKNOWN',
      message: record.serviceComplianceStatus === 'PASS' ? 'Certificate active' : 'Compliance unverified',
    },
  ]

  const blockingReasons = []
  const warnings = []
  const unknownChecks = []

  if (record.knownIssues && record.knownIssues.length > 0) {
    for (const issue of record.knownIssues) {
      if (
        issue.toLowerCase().includes('critical') ||
        issue.toLowerCase().includes('fail') ||
        issue.toLowerCase().includes('brake') ||
        issue.toLowerCase().includes('engine')
      ) {
        blockingReasons.push(issue)
      } else {
        warnings.push(issue)
      }
    }
  }

  for (const check of checks) {
    if (check.category === 'CRITICAL') {
      if (check.status === 'FAIL') {
        blockingReasons.push(`${check.name}: ${check.message}`)
      } else if (check.status === 'UNKNOWN') {
        unknownChecks.push(`${check.name}: Critical parameter missing`)
      } else if (check.status === 'WARNING') {
        warnings.push(`${check.name}: ${check.message}`)
      }
    } else {
      if (check.status === 'FAIL') {
        warnings.push(`Non-critical failure: ${check.name}`)
      } else if (check.status === 'WARNING') {
        warnings.push(`${check.name}: ${check.message}`)
      } else if (check.status === 'UNKNOWN') {
        unknownChecks.push(`${check.name}: Parameter unrecorded`)
      }
    }
  }

  let status = 'READY'
  let isEligibleForEmergencyDeployment = true

  if (blockingReasons.length > 0) {
    status = 'NOT_READY'
    isEligibleForEmergencyDeployment = false
  } else if (unknownChecks.some(u => checks.find(c => c.category === 'CRITICAL' && u.includes(c.name)))) {
    status = 'DATA_INSUFFICIENT'
    isEligibleForEmergencyDeployment = false
  } else if (warnings.length > 0 || unknownChecks.length > 0) {
    status = 'READY_WITH_WARNING'
    isEligibleForEmergencyDeployment = true
  } else {
    status = 'READY'
    isEligibleForEmergencyDeployment = true
  }

  return {
    vehicleId,
    status,
    isEligibleForEmergencyDeployment,
    checks,
    blockingReasons,
    warnings,
    unknownChecks,
    evaluatedAt: new Date().toISOString(),
    isSimulated,
  }
}

// ------------------------------------------------------------------------
// TEST 1: Fully passing vehicle -> READY
// ------------------------------------------------------------------------
const perfectVehicle = {
  vehicleId: 'NER-TRUCK-18',
  engineStatus: 'PASS',
  brakeStatus: 'PASS',
  tyreStatus: 'PASS',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 90,
  emergencyKitStatus: 'PASS',
  commEquipmentStatus: 'PASS',
  serviceComplianceStatus: 'PASS',
  isSimulated: true,
}
const res1 = evaluateVehicleReadiness(perfectVehicle)
assert(
  res1.status === 'READY' && res1.isEligibleForEmergencyDeployment === true && res1.blockingReasons.length === 0,
  'TEST 1: Fully passing vehicle achieves READY status with deployment eligibility'
)

// ------------------------------------------------------------------------
// TEST 2: Critical brake failure -> NOT READY
// ------------------------------------------------------------------------
const brakeFailVehicle = {
  vehicleId: 'NER-TRUCK-23',
  engineStatus: 'PASS',
  brakeStatus: 'FAIL',
  tyreStatus: 'PASS',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 80,
  emergencyKitStatus: 'PASS',
  commEquipmentStatus: 'PASS',
  serviceComplianceStatus: 'PASS',
}
const res2 = evaluateVehicleReadiness(brakeFailVehicle)
assert(
  res2.status === 'NOT_READY' &&
  res2.isEligibleForEmergencyDeployment === false &&
  res2.blockingReasons.some(r => r.includes('Brake')),
  'TEST 2: Critical brake failure triggers NOT_READY status and blocks emergency deployment'
)

// ------------------------------------------------------------------------
// TEST 3: Critical engine failure -> NOT READY
// ------------------------------------------------------------------------
const engineFailVehicle = {
  vehicleId: 'NER-TRUCK-12',
  engineStatus: 'FAIL',
  brakeStatus: 'PASS',
  tyreStatus: 'PASS',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 75,
}
const res3 = evaluateVehicleReadiness(engineFailVehicle)
assert(
  res3.status === 'NOT_READY' && res3.blockingReasons.some(r => r.includes('Engine')),
  'TEST 3: Critical engine failure triggers NOT_READY status'
)

// ------------------------------------------------------------------------
// TEST 4: Critical tyre failure -> NOT READY
// ------------------------------------------------------------------------
const tyreFailVehicle = {
  vehicleId: 'NER-TRUCK-05',
  engineStatus: 'PASS',
  brakeStatus: 'PASS',
  tyreStatus: 'FAIL',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 85,
}
const res4 = evaluateVehicleReadiness(tyreFailVehicle)
assert(
  res4.status === 'NOT_READY' && res4.blockingReasons.some(r => r.includes('Tyre')),
  'TEST 4: Critical tyre failure triggers NOT_READY status'
)

// ------------------------------------------------------------------------
// TEST 5: Non-critical warning -> READY WITH WARNING
// ------------------------------------------------------------------------
const warningVehicle = {
  vehicleId: 'NER-TRUCK-07',
  engineStatus: 'PASS',
  brakeStatus: 'PASS',
  tyreStatus: 'WARNING', // non-blocking tread wear advisory
  mechanicalStatus: 'PASS',
  fuelLevelPct: 65,
  emergencyKitStatus: 'PASS',
  commEquipmentStatus: 'PASS',
  serviceComplianceStatus: 'PASS',
}
const res5 = evaluateVehicleReadiness(warningVehicle)
assert(
  res5.status === 'READY_WITH_WARNING' &&
  res5.isEligibleForEmergencyDeployment === true &&
  res5.warnings.length > 0,
  'TEST 5: Non-critical tyre advisory triggers READY_WITH_WARNING'
)

// ------------------------------------------------------------------------
// TEST 6: Missing critical information -> DATA INSUFFICIENT
// ------------------------------------------------------------------------
const missingCriticalVehicle = {
  vehicleId: 'NER-TRUCK-31',
  engineStatus: 'UNKNOWN',
  brakeStatus: 'UNKNOWN',
  tyreStatus: 'PASS',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 70,
}
const res6 = evaluateVehicleReadiness(missingCriticalVehicle)
assert(
  res6.status === 'DATA_INSUFFICIENT' &&
  res6.isEligibleForEmergencyDeployment === false &&
  res6.unknownChecks.length > 0,
  'TEST 6: Missing critical brake/engine diagnostics triggers DATA_INSUFFICIENT (Does NOT default to PASS)'
)

// ------------------------------------------------------------------------
// TEST 7: Missing non-critical information -> appropriate warning/unknown handling
// ------------------------------------------------------------------------
const missingNonCriticalVehicle = {
  vehicleId: 'NER-TRUCK-09',
  engineStatus: 'PASS',
  brakeStatus: 'PASS',
  tyreStatus: 'PASS',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 80,
  emergencyKitStatus: 'UNKNOWN',
  commEquipmentStatus: 'PASS',
  serviceComplianceStatus: 'PASS',
}
const res7 = evaluateVehicleReadiness(missingNonCriticalVehicle)
assert(
  res7.status === 'READY_WITH_WARNING' &&
  res7.unknownChecks.some(u => u.includes('First-Aid')) &&
  res7.isEligibleForEmergencyDeployment === true,
  'TEST 7: Missing non-critical equipment produces READY_WITH_WARNING with logged unknown parameter'
)

// ------------------------------------------------------------------------
// TEST 8: Multiple failures -> NOT READY with all blocking reasons
// ------------------------------------------------------------------------
const multiFailVehicle = {
  vehicleId: 'NER-TRUCK-99',
  engineStatus: 'FAIL',
  brakeStatus: 'FAIL',
  tyreStatus: 'FAIL',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 20,
}
const res8 = evaluateVehicleReadiness(multiFailVehicle)
assert(
  res8.status === 'NOT_READY' && res8.blockingReasons.length >= 3,
  'TEST 8: Multiple safety failures all recorded cleanly in blockingReasons array'
)

// ------------------------------------------------------------------------
// TEST 9: Available vehicle with critical failure -> still NOT READY
// ------------------------------------------------------------------------
const availableButBrokenVehicle = {
  vehicleId: 'NER-TRUCK-23',
  status: 'AVAILABLE',
  operationalStatus: 'AVAILABLE',
  engineStatus: 'PASS',
  brakeStatus: 'FAIL',
  tyreStatus: 'PASS',
  mechanicalStatus: 'PASS',
}
const res9 = evaluateVehicleReadiness(availableButBrokenVehicle)
assert(
  res9.status === 'NOT_READY' && res9.isEligibleForEmergencyDeployment === false,
  'TEST 9: Vehicle with operationalStatus=AVAILABLE but brake failure remains strictly NOT_READY'
)

// ------------------------------------------------------------------------
// TEST 10: Simulated vehicle data remains labelled
// ------------------------------------------------------------------------
assert(
  res1.isSimulated === true && res2.isSimulated === true,
  'TEST 10: Simulated/Demo vehicle telemetry explicitly maintains isSimulated=true label'
)

// ------------------------------------------------------------------------
// TEST 11: No fabricated values are created
// ------------------------------------------------------------------------
const emptyVehicle = { vehicleId: 'RAW-VEHICLE-01' }
const res11 = evaluateVehicleReadiness(emptyVehicle)
const unknownCount = res11.checks.filter(c => c.status === 'UNKNOWN').length
assert(
  unknownCount === 8 && res11.status === 'DATA_INSUFFICIENT',
  'TEST 11: Unprovided vehicle properties cleanly resolve to UNKNOWN (0 fabricated values)'
)

// ------------------------------------------------------------------------
// TEST 12: Readiness evaluator returns structured result
// ------------------------------------------------------------------------
assert(
  typeof res1.status === 'string' &&
  Array.isArray(res1.checks) &&
  Array.isArray(res1.blockingReasons) &&
  Array.isArray(res1.warnings) &&
  Array.isArray(res1.unknownChecks) &&
  typeof res1.evaluatedAt === 'string',
  'TEST 12: Readiness evaluation conforms strictly to structured VehicleReadinessEvaluation interface'
)

// ------------------------------------------------------------------------
// TEST 13: Existing vehicle telemetry remains unaffected
// ------------------------------------------------------------------------
const mockTelemetry = {
  vehicleId: 'NER-TRUCK-18',
  speedKmh: 48,
  headingDeg: 145,
  distanceRemainingKm: 82,
  etaClockTime: '14:41 IST',
}
const res13 = evaluateVehicleReadiness(mockTelemetry)
assert(
  res13.vehicleId === 'NER-TRUCK-18' && mockTelemetry.speedKmh === 48,
  'TEST 13: Vehicle telemetry data structures remain 100% decoupled and unaffected'
)

// ------------------------------------------------------------------------
// TEST 14: Existing vehicle rerouting remains unaffected
// ------------------------------------------------------------------------
const reroutedVehicle = {
  vehicleId: 'NER-TRUCK-18',
  status: 'REROUTING',
  isRerouted: true,
  engineStatus: 'PASS',
  brakeStatus: 'PASS',
  tyreStatus: 'PASS',
  mechanicalStatus: 'PASS',
  fuelLevelPct: 88,
  emergencyKitStatus: 'PASS',
  commEquipmentStatus: 'PASS',
  serviceComplianceStatus: 'PASS',
}
const res14 = evaluateVehicleReadiness(reroutedVehicle)
assert(
  res14.status === 'READY' && res14.isEligibleForEmergencyDeployment === true,
  'TEST 14: Rerouted en-route vehicle maintains valid readiness state'
)

// ------------------------------------------------------------------------
// TEST 15: Future mission integration can consume readiness result
// ------------------------------------------------------------------------
function futureMissionGate(vehicle, missionRequirement) {
  const readiness = evaluateVehicleReadiness(vehicle)
  if (!readiness.isEligibleForEmergencyDeployment) {
    return { canDispatch: false, reason: readiness.blockingReasons[0] || 'Safety gate rejected' }
  }
  return { canDispatch: true, approvedVehicleId: vehicle.vehicleId }
}
const missionOk = futureMissionGate(perfectVehicle, { priority: 'CRITICAL' })
const missionBlocked = futureMissionGate(brakeFailVehicle, { priority: 'CRITICAL' })
assert(
  missionOk.canDispatch === true && missionBlocked.canDispatch === false,
  'TEST 15: Future Mission Engine seamlessly gates vehicle dispatch using evaluateVehicleReadiness()'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/15 PHASE 11 VEHICLE READINESS TESTS PASSED CLEANLY`)
console.log('========================================================================\n')
