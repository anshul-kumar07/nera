// lib/vehicle-readiness.ts
// ========================================================================
//    NERA PHASE 11: VEHICLE READINESS & EMERGENCY DEPLOYMENT SAFETY GATE
// ========================================================================

export type ReadinessStatus =
  | 'READY'
  | 'READY_WITH_WARNING'
  | 'NOT_READY'
  | 'DATA_INSUFFICIENT'

export type CheckStatus = 'PASS' | 'WARNING' | 'FAIL' | 'UNKNOWN'

export type CheckCategory = 'CRITICAL' | 'NON_CRITICAL'

export type CheckKey =
  | 'BRAKES'
  | 'ENGINE'
  | 'TYRES'
  | 'MECHANICAL_INTEGRITY'
  | 'FUEL_LEVEL'
  | 'EMERGENCY_KIT'
  | 'COMM_EQUIPMENT'
  | 'SERVICE_COMPLIANCE'

export interface SafetyCheckItem {
  key: CheckKey
  name: string
  category: CheckCategory
  status: CheckStatus
  message: string
  recordedValue?: string | number
}

export interface VehicleSafetyRecord {
  vehicleId: string
  vehicleModel?: string
  driverName?: string
  engineStatus?: CheckStatus
  brakeStatus?: CheckStatus
  tyreStatus?: CheckStatus
  mechanicalStatus?: CheckStatus
  fuelLevelPct?: number
  emergencyKitStatus?: CheckStatus
  commEquipmentStatus?: CheckStatus
  serviceComplianceStatus?: CheckStatus
  knownIssues?: string[]
  isSimulated?: boolean
  operationalStatus?: string
  odometerKm?: number
}

export interface VehicleReadinessEvaluation {
  vehicleId: string
  status: ReadinessStatus
  statusBadge: {
    label: string
    color: string
    icon: string
    bgClass: string
    borderClass: string
    textClass: string
  }
  isEligibleForEmergencyDeployment: boolean
  checks: SafetyCheckItem[]
  blockingReasons: string[]
  warnings: string[]
  unknownChecks: string[]
  evaluatedAt: string
  isSimulated: boolean
  operationalSummary: string
}

// ── Controlled Demo Fleet Readiness Scenarios (Clearly labeled SIMULATED) ──
export const DEMO_VEHICLE_SAFETY_RECORDS: Record<string, VehicleSafetyRecord> = {
  'NER-TRUCK-18': {
    vehicleId: 'NER-TRUCK-18',
    vehicleModel: 'Tata Signa 2823.K Heavy Multi-Axle',
    driverName: 'Bipul Gogoi',
    engineStatus: 'PASS',
    brakeStatus: 'PASS',
    tyreStatus: 'PASS',
    mechanicalStatus: 'PASS',
    fuelLevelPct: 92,
    emergencyKitStatus: 'PASS',
    commEquipmentStatus: 'PASS',
    serviceComplianceStatus: 'PASS',
    knownIssues: [],
    isSimulated: true,
  },
  'NER-TRUCK-07': {
    vehicleId: 'NER-TRUCK-07',
    vehicleModel: 'Ashok Leyland Ecomet 1215 Tipper',
    driverName: 'Sanjay Thapa',
    engineStatus: 'PASS',
    brakeStatus: 'PASS',
    tyreStatus: 'WARNING',
    mechanicalStatus: 'PASS',
    fuelLevelPct: 65,
    emergencyKitStatus: 'PASS',
    commEquipmentStatus: 'PASS',
    serviceComplianceStatus: 'PASS',
    knownIssues: ['Tyre tread depth 3.2mm on rear axle — inspection recommended before mountain ascent'],
    isSimulated: true,
  },
  'NER-TRUCK-23': {
    vehicleId: 'NER-TRUCK-23',
    vehicleModel: 'BharatBenz 1617R All-Weather Transport',
    driverName: 'Tsering Dorjee',
    engineStatus: 'PASS',
    brakeStatus: 'FAIL',
    tyreStatus: 'PASS',
    mechanicalStatus: 'PASS',
    fuelLevelPct: 78,
    emergencyKitStatus: 'PASS',
    commEquipmentStatus: 'PASS',
    serviceComplianceStatus: 'WARNING',
    knownIssues: ['Pneumatic brake line pressure drop detected (2.8 bar) — requires maintenance depot servicing'],
    isSimulated: true,
  },
  'NER-TRUCK-31': {
    vehicleId: 'NER-TRUCK-31',
    vehicleModel: 'Mahindra Bolero Maxi Truck Plus',
    driverName: 'Unassigned',
    engineStatus: 'UNKNOWN',
    brakeStatus: 'UNKNOWN',
    tyreStatus: 'PASS',
    mechanicalStatus: 'UNKNOWN',
    fuelLevelPct: 50,
    emergencyKitStatus: 'UNKNOWN',
    commEquipmentStatus: 'PASS',
    serviceComplianceStatus: 'UNKNOWN',
    knownIssues: [],
    isSimulated: true,
  },
  'NER-TRUCK-12': {
    vehicleId: 'NER-TRUCK-12',
    vehicleModel: 'Eicher Pro 3015 Hill Freightliner',
    driverName: 'Rahul Karmakar',
    engineStatus: 'FAIL',
    brakeStatus: 'PASS',
    tyreStatus: 'PASS',
    mechanicalStatus: 'PASS',
    fuelLevelPct: 40,
    emergencyKitStatus: 'PASS',
    commEquipmentStatus: 'PASS',
    serviceComplianceStatus: 'PASS',
    knownIssues: ['Engine coolant temperature sensor fault — overheating risk'],
    isSimulated: true,
  },
  'NER-TRUCK-05': {
    vehicleId: 'NER-TRUCK-05',
    vehicleModel: 'Force Trax Cruiser 4x4',
    driverName: 'Deepak Das',
    engineStatus: 'PASS',
    brakeStatus: 'PASS',
    tyreStatus: 'FAIL',
    mechanicalStatus: 'PASS',
    fuelLevelPct: 85,
    emergencyKitStatus: 'PASS',
    commEquipmentStatus: 'PASS',
    serviceComplianceStatus: 'PASS',
    knownIssues: ['Severe sidewall puncture risk on front-left all-terrain tyre'],
    isSimulated: true,
  },
}

/**
 * Standard badge rendering metadata for the 4 operational readiness states
 */
export function getReadinessStatusBadge(status: ReadinessStatus) {
  switch (status) {
    case 'READY':
      return {
        label: 'READY FOR DEPLOYMENT',
        color: '#16a34a',
        icon: '🟢',
        bgClass: 'bg-emerald-950/40',
        borderClass: 'border-emerald-700/80',
        textClass: 'text-emerald-300',
      }
    case 'READY_WITH_WARNING':
      return {
        label: 'READY WITH WARNING',
        color: '#d97706',
        icon: '🟡',
        bgClass: 'bg-amber-950/40',
        borderClass: 'border-amber-700/80',
        textClass: 'text-amber-300',
      }
    case 'NOT_READY':
      return {
        label: 'NOT READY (BLOCKING ISSUE)',
        color: '#dc2626',
        icon: '🔴',
        bgClass: 'bg-rose-950/40',
        borderClass: 'border-rose-700/80',
        textClass: 'text-rose-300',
      }
    case 'DATA_INSUFFICIENT':
    default:
      return {
        label: 'DATA INSUFFICIENT',
        color: '#64748b',
        icon: '⚪',
        bgClass: 'bg-slate-900/60',
        borderClass: 'border-slate-700/80',
        textClass: 'text-slate-300',
      }
  }
}

/**
 * Deterministic Safety Gate Evaluator
 *
 * Rules:
 * 1. IF any critical check is FAIL → NOT_READY (Cannot be dispatched for emergency response).
 * 2. ELSE IF any critical check is UNKNOWN → DATA_INSUFFICIENT (Missing critical data != safe).
 * 3. ELSE IF any non-critical check has WARNING / FAIL / UNKNOWN → READY_WITH_WARNING (Advisory caution).
 * 4. ELSE → READY (All safety parameters verified).
 *
 * Availability and Readiness are decoupled:
 * An 'AVAILABLE' vehicle with a failed safety check remains NOT_READY.
 */
export function evaluateVehicleReadiness(
  input: Partial<VehicleSafetyRecord> & {
    vehicleId?: string
    vehicle_number?: string
    status?: string
  }
): VehicleReadinessEvaluation {
  const vehicleId = input.vehicleId || input.vehicle_number || 'UNKNOWN-VEHICLE'
  const demoRecord = DEMO_VEHICLE_SAFETY_RECORDS[vehicleId]
  const record: Partial<VehicleSafetyRecord> = { ...demoRecord, ...input }

  const isSimulated = record.isSimulated !== false // default true for test fleet

  // Build the 8-Point Structured Safety Checklist
  const checks: SafetyCheckItem[] = [
    // ── CRITICAL CHECKS ──
    {
      key: 'BRAKES',
      name: 'Pneumatic / Hydraulic Brake System',
      category: 'CRITICAL',
      status: record.brakeStatus || 'UNKNOWN',
      message:
        record.brakeStatus === 'PASS'
          ? 'Brake pressure and pad thickness within operational tolerance'
          : record.brakeStatus === 'FAIL'
          ? 'CRITICAL BRAKE FAULT: Pressure loss or mechanical failure detected'
          : record.brakeStatus === 'WARNING'
          ? 'Brake wear advisory: pad wear approaching maintenance limit'
          : 'DATA UNAVAILABLE: Brake inspection log missing',
      recordedValue: record.brakeStatus || 'UNAVAILABLE',
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
      recordedValue: record.engineStatus || 'UNAVAILABLE',
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
          ? 'Tyre advisory: tread depth low, hill transit caution required'
          : 'DATA UNAVAILABLE: Tyre physical check record missing',
      recordedValue: record.tyreStatus || 'UNAVAILABLE',
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
      recordedValue: record.mechanicalStatus || 'UNAVAILABLE',
    },

    // ── NON-CRITICAL CHECKS ──
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
            ? `Fuel level verified at ${record.fuelLevelPct}% (Adequate mission range)`
            : record.fuelLevelPct >= 25
            ? `Fuel warning: Tank at ${record.fuelLevelPct}%. Refueling recommended before remote corridor transit.`
            : `Low fuel alert: Tank critically low at ${record.fuelLevelPct}%.`
          : 'DATA UNAVAILABLE: Fuel telemetry sensor not transmitting',
      recordedValue: typeof record.fuelLevelPct === 'number' ? `${record.fuelLevelPct}%` : 'UNAVAILABLE',
    },
    {
      key: 'EMERGENCY_KIT',
      name: 'First-Aid Kit & Emergency Equipment',
      category: 'NON_CRITICAL',
      status: record.emergencyKitStatus || 'UNKNOWN',
      message:
        record.emergencyKitStatus === 'PASS'
          ? 'First-aid kit, fire extinguisher, and reflective triangles present'
          : record.emergencyKitStatus === 'WARNING'
          ? 'First-aid supplies partially depleted'
          : record.emergencyKitStatus === 'FAIL'
          ? 'Emergency equipment missing from cab'
          : 'DATA UNAVAILABLE: Emergency kit audit unverified',
      recordedValue: record.emergencyKitStatus || 'UNAVAILABLE',
    },
    {
      key: 'COMM_EQUIPMENT',
      name: 'VHF Radio & Satellite GPS Uplink',
      category: 'NON_CRITICAL',
      status: record.commEquipmentStatus || 'UNKNOWN',
      message:
        record.commEquipmentStatus === 'PASS'
          ? 'Tactical communications and GPS tracker verified online'
          : record.commEquipmentStatus === 'WARNING'
          ? 'Secondary VHF radio battery weak'
          : record.commEquipmentStatus === 'FAIL'
          ? 'Primary communications link non-responsive'
          : 'DATA UNAVAILABLE: Communication link audit unavailable',
      recordedValue: record.commEquipmentStatus || 'UNAVAILABLE',
    },
    {
      key: 'SERVICE_COMPLIANCE',
      name: 'Periodic Service & Road Fitness Certificate',
      category: 'NON_CRITICAL',
      status: record.serviceComplianceStatus || 'UNKNOWN',
      message:
        record.serviceComplianceStatus === 'PASS'
          ? 'Government road fitness certificate valid and active'
          : record.serviceComplianceStatus === 'WARNING'
          ? 'Service due within 500 km'
          : record.serviceComplianceStatus === 'FAIL'
          ? 'Mandatory government fitness certification expired'
          : 'DATA UNAVAILABLE: Compliance records not found in database',
      recordedValue: record.serviceComplianceStatus || 'UNAVAILABLE',
    },
  ]

  // Accumulate Blocking Reasons, Warnings, and Unknowns
  const blockingReasons: string[] = []
  const warnings: string[] = []
  const unknownChecks: string[] = []

  // Add explicit known issues from record if any
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
        warnings.push(`Non-critical failure: ${check.name} (${check.message})`)
      } else if (check.status === 'WARNING') {
        warnings.push(`${check.name}: ${check.message}`)
      } else if (check.status === 'UNKNOWN') {
        unknownChecks.push(`${check.name}: Parameter unrecorded`)
      }
    }
  }

  // ── Deterministic Decision Matrix ──
  let status: ReadinessStatus = 'READY'
  let isEligibleForEmergencyDeployment = true
  let operationalSummary = ''

  if (blockingReasons.length > 0) {
    status = 'NOT_READY'
    isEligibleForEmergencyDeployment = false
    operationalSummary = `BLOCKED FROM DEPLOYMENT: ${blockingReasons.length} critical safety failure(s) detected. Servicing required.`
  } else if (unknownChecks.some(u => checks.find(c => c.category === 'CRITICAL' && u.includes(c.name)))) {
    status = 'DATA_INSUFFICIENT'
    isEligibleForEmergencyDeployment = false
    operationalSummary = `INSUFFICIENT DATA: Critical vehicle safety parameters are unrecorded. Cannot assume vehicle is safe for emergency deployment.`
  } else if (warnings.length > 0 || unknownChecks.length > 0) {
    status = 'READY_WITH_WARNING'
    isEligibleForEmergencyDeployment = true
    operationalSummary = `DEPLOYABLE WITH CAUTION: ${warnings.length} warning(s) logged. Field inspection recommended.`
  } else {
    status = 'READY'
    isEligibleForEmergencyDeployment = true
    operationalSummary = `VERIFIED READY: All 8 safety checklist parameters verified nominal. Approved for emergency mission dispatch.`
  }

  return {
    vehicleId,
    status,
    statusBadge: getReadinessStatusBadge(status),
    isEligibleForEmergencyDeployment,
    checks,
    blockingReasons,
    warnings,
    unknownChecks,
    evaluatedAt: new Date().toISOString(),
    isSimulated,
    operationalSummary,
  }
}

/**
 * Calculates fleet-wide readiness distribution for Dashboard and Analytics
 */
export function summarizeFleetReadiness(fleetVehicles: Array<{ vehicleId?: string; vehicle_number?: string }>): {
  total: number
  ready: number
  readyWithWarning: number
  notReady: number
  dataInsufficient: number
  evaluations: Record<string, VehicleReadinessEvaluation>
} {
  const evaluations: Record<string, VehicleReadinessEvaluation> = {}
  let ready = 0
  let readyWithWarning = 0
  let notReady = 0
  let dataInsufficient = 0

  for (const v of fleetVehicles) {
    const id = v.vehicleId || v.vehicle_number || 'UNKNOWN'
    const ev = evaluateVehicleReadiness(v)
    evaluations[id] = ev
    if (ev.status === 'READY') ready++
    else if (ev.status === 'READY_WITH_WARNING') readyWithWarning++
    else if (ev.status === 'NOT_READY') notReady++
    else if (ev.status === 'DATA_INSUFFICIENT') dataInsufficient++
  }

  return {
    total: fleetVehicles.length,
    ready,
    readyWithWarning,
    notReady,
    dataInsufficient,
    evaluations,
  }
}

