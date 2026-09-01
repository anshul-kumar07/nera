// lib/vehicle-maintenance.ts
// ========================================================================
//    NERA PHASE 14: VEHICLE MAINTENANCE, SERVICE HISTORY & FLEET RECORDS
// ========================================================================

import { evaluateVehicleReadiness, VehicleReadinessEvaluation, VehicleSafetyRecord } from './vehicle-readiness'
import { VehicleFailureEvent } from './vehicle-failure'
import { Mission } from './mission-management'

export type MaintenanceType =
  | 'ROUTINE_SERVICE'
  | 'ENGINE_SERVICE'
  | 'BRAKE_SERVICE'
  | 'TYRE_SERVICE'
  | 'ELECTRICAL_SERVICE'
  | 'FLUID_SERVICE'
  | 'BATTERY_SERVICE'
  | 'INSPECTION'
  | 'REPAIR'
  | 'EMERGENCY_REPAIR'
  | 'OTHER'

export type MaintenanceStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface MaintenanceRecord {
  id: string
  vehicleId: string
  maintenanceType: MaintenanceType
  performedAt: string
  odometerKm?: number | null
  serviceProvider?: string
  technician?: string
  description: string
  partsReplaced?: string[]
  costInr?: number | null
  nextDueKm?: number | null
  nextDueDate?: string | null
  status: MaintenanceStatus
  notes?: string
  relatedFailureId?: string | null
  isSimulated: boolean
}

export type InspectionResult = 'PASS' | 'WARNING' | 'FAIL'

export interface InspectionRecord {
  id: string
  vehicleId: string
  inspectionDate: string
  odometerKm?: number | null
  inspectionType: string
  checklist: Record<string, string>
  result: InspectionResult
  issuesFound?: string[]
  inspector?: string
  notes?: string
  isSimulated: boolean
}

export interface FuelRecord {
  id: string
  vehicleId: string
  timestamp: string
  liters: number
  fuelType?: string
  odometerKm?: number | null
  costInr?: number | null
  locationName?: string
  source: 'TELEMETERED_DISPENSE' | 'MANUAL_LOG' | 'SIMULATED'
  isSimulated: boolean
}

export type MaintenanceDueStatus =
  | 'MAINTENANCE_CURRENT'
  | 'MAINTENANCE_DUE_SOON'
  | 'MAINTENANCE_DUE'
  | 'DATA_INSUFFICIENT'

export interface MaintenanceDueEvaluation {
  status: MaintenanceDueStatus
  statusLabel: string
  badgeColor: string
  remainingKm?: number | null
  daysRemaining?: number | null
  explanation: string
  lastServiceDate?: string | null
  nextDueDate?: string | null
  nextDueKm?: number | null
}

export interface VehicleTimelineItem {
  id: string
  timestamp: string
  category: 'MISSION' | 'FAILURE' | 'MAINTENANCE' | 'INSPECTION' | 'FUEL'
  title: string
  description: string
  status?: string
  severity?: string
  actor?: string
  isSimulated: boolean
}

export interface VehicleDigitalProfile {
  vehicleId: string
  registrationNumber?: string
  vehicleModel: string
  vehicleType: string
  commissioningDate?: string
  currentOperationalStatus: string
  readiness: VehicleReadinessEvaluation
  maintenanceDue: MaintenanceDueEvaluation
  totalCalculatedDistanceKm: number
  totalFuelConsumedLiters: number
  calculatedFuelEfficiencyKmPerLiter?: number | null
  efficiencyStatus: 'CALCULATED' | 'DATA_INSUFFICIENT'
  maintenanceHistory: MaintenanceRecord[]
  inspectionHistory: InspectionRecord[]
  fuelHistory: FuelRecord[]
  failureHistory: VehicleFailureEvent[]
  missionHistory: Mission[]
  timeline: VehicleTimelineItem[]
  isSimulated: boolean
}

// ── Unique ID Generators ──
export function generateMaintenanceId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `MNT-${ts}-${rand}`
}

export function generateInspectionId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `INSP-${ts}-${rand}`
}

export function generateFuelRecordId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `FUEL-${ts}-${rand}`
}

/**
 * 1. Deterministic calculation of maintenance due status.
 * Thresholds:
 * - Within 2,000 km or 30 days -> MAINTENANCE_DUE_SOON
 * - Past due km or past due date -> MAINTENANCE_DUE
 * - Not near due -> MAINTENANCE_CURRENT
 * - If neither interval exists -> DATA_INSUFFICIENT
 */
export function calculateMaintenanceStatus(
  currentOdometerKm?: number | null,
  maintenanceRecords: MaintenanceRecord[] = []
): MaintenanceDueEvaluation {
  const latestCompleted = maintenanceRecords
    .filter(m => m.status === 'COMPLETED' && (m.nextDueKm || m.nextDueDate))
    .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())[0]

  if (!latestCompleted || (!latestCompleted.nextDueKm && !latestCompleted.nextDueDate)) {
    return {
      status: 'DATA_INSUFFICIENT',
      statusLabel: 'Data Insufficient',
      badgeColor: 'bg-gray-800 text-gray-400 border-gray-700',
      explanation: 'No verified manufacturer service interval or scheduled due date on record.',
      lastServiceDate: latestCompleted?.performedAt || null,
      nextDueDate: null,
      nextDueKm: null,
    }
  }

  let isOverdue = false
  let isDueSoon = false
  let remainingKm: number | null = null
  let daysRemaining: number | null = null
  const reasons: string[] = []

  // Check distance-based interval
  if (latestCompleted.nextDueKm && currentOdometerKm != null) {
    remainingKm = latestCompleted.nextDueKm - currentOdometerKm
    if (remainingKm <= 0) {
      isOverdue = true
      reasons.push(`Overdue by ${Math.abs(remainingKm)} km (Limit: ${latestCompleted.nextDueKm.toLocaleString()} km)`)
    } else if (remainingKm <= 2000) {
      isDueSoon = true
      reasons.push(`Service due within ${remainingKm} km`)
    }
  }

  // Check date-based interval
  if (latestCompleted.nextDueDate) {
    const dueTime = new Date(latestCompleted.nextDueDate).getTime()
    const nowTime = Date.now()
    daysRemaining = Math.ceil((dueTime - nowTime) / (1000 * 60 * 60 * 24))

    if (daysRemaining <= 0) {
      isOverdue = true
      reasons.push(`Overdue by ${Math.abs(daysRemaining)} days (Due: ${latestCompleted.nextDueDate})`)
    } else if (daysRemaining <= 30) {
      isDueSoon = true
      reasons.push(`Scheduled service due in ${daysRemaining} days`)
    }
  }

  if (isOverdue) {
    return {
      status: 'MAINTENANCE_DUE',
      statusLabel: 'Maintenance Overdue',
      badgeColor: 'bg-rose-950 border-rose-600 text-rose-300',
      remainingKm,
      daysRemaining,
      explanation: reasons.join('; ') || 'Service interval exceeded.',
      lastServiceDate: latestCompleted.performedAt,
      nextDueDate: latestCompleted.nextDueDate || null,
      nextDueKm: latestCompleted.nextDueKm || null,
    }
  }

  if (isDueSoon) {
    return {
      status: 'MAINTENANCE_DUE_SOON',
      statusLabel: 'Maintenance Due Soon',
      badgeColor: 'bg-amber-950 border-amber-600 text-amber-300',
      remainingKm,
      daysRemaining,
      explanation: reasons.join('; ') || 'Approaching scheduled maintenance threshold.',
      lastServiceDate: latestCompleted.performedAt,
      nextDueDate: latestCompleted.nextDueDate || null,
      nextDueKm: latestCompleted.nextDueKm || null,
    }
  }

  return {
    status: 'MAINTENANCE_CURRENT',
    statusLabel: 'Maintenance Current',
    badgeColor: 'bg-emerald-950 border-emerald-600 text-emerald-300',
    remainingKm,
    daysRemaining,
    explanation: 'Vehicle service intervals are up to date and verified.',
    lastServiceDate: latestCompleted.performedAt,
    nextDueDate: latestCompleted.nextDueDate || null,
    nextDueKm: latestCompleted.nextDueKm || null,
  }
}

/**
 * 2. Deterministic calculation of fuel efficiency
 */
export function calculateFuelEfficiency(
  fuelRecords: FuelRecord[] = [],
  totalDistanceKm: number = 0
): {
  totalLiters: number
  distanceKm: number
  kmPerLiter: number | null
  status: 'CALCULATED' | 'DATA_INSUFFICIENT'
} {
  const totalLiters = fuelRecords.reduce((acc, r) => acc + r.liters, 0)
  if (totalLiters <= 0 || totalDistanceKm <= 0) {
    return {
      totalLiters,
      distanceKm: totalDistanceKm,
      kmPerLiter: null,
      status: 'DATA_INSUFFICIENT',
    }
  }

  const kmPerLiter = Math.round((totalDistanceKm / totalLiters) * 10) / 10
  return {
    totalLiters,
    distanceKm: totalDistanceKm,
    kmPerLiter,
    status: 'CALCULATED',
  }
}

/**
 * 3. Builds unified chronological vehicle timeline
 */
export function buildVehicleTimeline(
  vehicleId: string,
  options: {
    missions?: Mission[]
    failures?: VehicleFailureEvent[]
    maintenance?: MaintenanceRecord[]
    inspections?: InspectionRecord[]
    fuelRecords?: FuelRecord[]
  } = {}
): VehicleTimelineItem[] {
  const items: VehicleTimelineItem[] = []

  // Missions
  for (const m of options.missions || []) {
    if (m.assignedVehicleId === vehicleId) {
      items.push({
        id: `TL-MSN-${m.id}`,
        timestamp: m.createdAt,
        category: 'MISSION',
        title: `Mission: ${m.title}`,
        description: `Cargo: ${m.responseRequirement}. Access Status: ${m.routeSummary?.accessStatus || 'DIRECT_VEHICLE_ACCESS'}`,
        status: m.status,
        isSimulated: m.isSimulated,
      })
    }
  }

  // Failures
  for (const f of options.failures || []) {
    if (f.vehicleId === vehicleId) {
      items.push({
        id: `TL-FAIL-${f.id}`,
        timestamp: f.reportedAt,
        category: 'FAILURE',
        title: `Failure: ${f.failureType.replace(/_/g, ' ')}`,
        description: f.description,
        status: f.isResolved ? 'RESOLVED' : 'ACTIVE_FAILURE',
        severity: f.severity,
        actor: f.reportedBy,
        isSimulated: f.isSimulated,
      })
    }
  }

  // Maintenance
  for (const m of options.maintenance || []) {
    if (m.vehicleId === vehicleId) {
      items.push({
        id: `TL-MNT-${m.id}`,
        timestamp: m.performedAt,
        category: 'MAINTENANCE',
        title: `Maintenance: ${m.maintenanceType.replace(/_/g, ' ')}`,
        description: m.description,
        status: m.status,
        actor: m.technician || m.serviceProvider || 'ACTOR ID UNAVAILABLE',
        isSimulated: m.isSimulated,
      })
    }
  }

  // Inspections
  for (const insp of options.inspections || []) {
    if (insp.vehicleId === vehicleId) {
      items.push({
        id: `TL-INSP-${insp.id}`,
        timestamp: insp.inspectionDate,
        category: 'INSPECTION',
        title: `Inspection: ${insp.inspectionType}`,
        description: `Result: ${insp.result}. Issues: ${insp.issuesFound?.join(', ') || 'None'}`,
        status: insp.result,
        actor: insp.inspector || 'ACTOR ID UNAVAILABLE',
        isSimulated: insp.isSimulated,
      })
    }
  }

  // Fuel
  for (const fuel of options.fuelRecords || []) {
    if (fuel.vehicleId === vehicleId) {
      items.push({
        id: `TL-FUEL-${fuel.id}`,
        timestamp: fuel.timestamp,
        category: 'FUEL',
        title: `Fuel Refill: ${fuel.liters} L (${fuel.fuelType || 'Diesel'})`,
        description: `Dispensed at ${fuel.locationName || 'Depot'} (Source: ${fuel.source})`,
        isSimulated: fuel.isSimulated,
      })
    }
  }

  // Sort descending by timestamp
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * 4. Aggregates Fleet Maintenance KPIs
 */
export function calculateFleetMaintenanceSummary(
  fleet: VehicleSafetyRecord[] = [],
  maintenanceMap: Record<string, MaintenanceRecord[]> = {}
) {
  let maintenanceDue = 0
  let dueSoon = 0
  let current = 0
  let dataInsufficient = 0
  let outOfService = 0

  for (const v of fleet) {
    const mRecords = maintenanceMap[v.vehicleId] || DEMO_MAINTENANCE_RECORDS[v.vehicleId] || []
    const mEval = calculateMaintenanceStatus(v.odometerKm || 48000, mRecords)

    if (mEval.status === 'MAINTENANCE_DUE') maintenanceDue++
    else if (mEval.status === 'MAINTENANCE_DUE_SOON') dueSoon++
    else if (mEval.status === 'MAINTENANCE_CURRENT') current++
    else if (mEval.status === 'DATA_INSUFFICIENT') dataInsufficient++

    if (v.operationalStatus === 'OUT_OF_SERVICE' || v.operationalStatus === 'FAILED') {
      outOfService++
    }
  }

  return {
    totalVehicles: fleet.length,
    maintenanceDue,
    dueSoon,
    current,
    dataInsufficient,
    outOfService,
  }
}

/**
 * 5. Builds complete aggregated Vehicle Digital Profile
 */
export function buildVehicleDigitalProfile(
  safetyRecord: VehicleSafetyRecord,
  options: {
    maintenanceRecords?: MaintenanceRecord[]
    inspectionRecords?: InspectionRecord[]
    fuelRecords?: FuelRecord[]
    failureEvents?: VehicleFailureEvent[]
    missions?: Mission[]
    totalCalculatedDistanceKm?: number
  } = {}
): VehicleDigitalProfile {
  const readiness = evaluateVehicleReadiness(safetyRecord)
  const maintenance = options.maintenanceRecords || DEMO_MAINTENANCE_RECORDS[safetyRecord.vehicleId] || []
  const inspections = options.inspectionRecords || DEMO_INSPECTION_RECORDS[safetyRecord.vehicleId] || []
  const fuelRecords = options.fuelRecords || DEMO_FUEL_RECORDS[safetyRecord.vehicleId] || []
  const failures = options.failureEvents || []
  const missions = options.missions || []

  const distKm = options.totalCalculatedDistanceKm || safetyRecord.odometerKm || 48500
  const maintenanceDue = calculateMaintenanceStatus(safetyRecord.odometerKm || distKm, maintenance)
  const fuelCalc = calculateFuelEfficiency(fuelRecords, distKm)
  const timeline = buildVehicleTimeline(safetyRecord.vehicleId, {
    missions,
    failures,
    maintenance,
    inspections,
    fuelRecords,
  })

  return {
    vehicleId: safetyRecord.vehicleId,
    registrationNumber: `AS-01-NER-${safetyRecord.vehicleId.replace(/\D/g, '')}`,
    vehicleModel: safetyRecord.vehicleModel || 'Heavy All-Terrain Truck',
    vehicleType: 'Emergency Cargo Transport',
    currentOperationalStatus: safetyRecord.operationalStatus || 'AVAILABLE',
    readiness,
    maintenanceDue,
    totalCalculatedDistanceKm: distKm,
    totalFuelConsumedLiters: fuelCalc.totalLiters,
    calculatedFuelEfficiencyKmPerLiter: fuelCalc.kmPerLiter,
    efficiencyStatus: fuelCalc.status,
    maintenanceHistory: maintenance,
    inspectionHistory: inspections,
    fuelHistory: fuelRecords,
    failureHistory: failures,
    missionHistory: missions,
    timeline,
    isSimulated: safetyRecord.isSimulated !== false,
  }
}

// ── Initial Demo Historical Fleet Maintenance Records ──
export const DEMO_MAINTENANCE_RECORDS: Record<string, MaintenanceRecord[]> = {
  'NER-TRUCK-18': [
    {
      id: 'MNT-2026-001',
      vehicleId: 'NER-TRUCK-18',
      maintenanceType: 'ROUTINE_SERVICE',
      performedAt: '2026-06-15T09:30:00.000Z',
      odometerKm: 45000,
      serviceProvider: 'Tata Authorized Workshop, Guwahati',
      technician: 'Senior Master Mech. K. Sarma',
      description: 'Comprehensive 45,000 km Scheduled Service: Engine oil, oil filter, air filter, and brake fluid replacement.',
      partsReplaced: ['Engine Oil 15W40 (22L)', 'Oil Filter Element', 'Brake Fluid DOT-4'],
      costInr: 18450,
      nextDueKm: 55000,
      nextDueDate: '2026-12-15',
      status: 'COMPLETED',
      notes: 'All cylinders holding optimal compression. Brake liners at 85% thickness.',
      isSimulated: true,
    },
    {
      id: 'MNT-2026-002',
      vehicleId: 'NER-TRUCK-18',
      maintenanceType: 'BRAKE_SERVICE',
      performedAt: '2026-07-20T14:00:00.000Z',
      odometerKm: 48200,
      serviceProvider: 'Guwahati Depot Workshop',
      technician: 'Mech. R. Barua',
      description: 'Air brake pressure valve calibration and moisture purge.',
      partsReplaced: ['Moisture Separator Filter'],
      costInr: 3200,
      status: 'COMPLETED',
      notes: 'Pneumatic pressure holds solid at 8.2 bar.',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-07': [
    {
      id: 'MNT-2026-003',
      vehicleId: 'NER-TRUCK-07',
      maintenanceType: 'TYRE_SERVICE',
      performedAt: '2026-07-10T11:00:00.000Z',
      odometerKm: 62000,
      serviceProvider: 'Tezpur Military Logistics Base Depot',
      technician: 'Technician P. Das',
      description: 'Front dual-axle tyre rotation and mountain tread depth measurement.',
      partsReplaced: [],
      costInr: 1500,
      nextDueKm: 70000,
      nextDueDate: '2026-09-10',
      status: 'COMPLETED',
      notes: 'Front left tyre has 3.8mm tread remaining (advisory logged).',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-23': [
    {
      id: 'MNT-2026-004',
      vehicleId: 'NER-TRUCK-23',
      maintenanceType: 'EMERGENCY_REPAIR',
      performedAt: '2026-08-25T16:30:00.000Z',
      odometerKm: 78500,
      serviceProvider: 'Silchar Mountain Depot Workshop',
      technician: 'Mech. Lead M. Ali',
      description: 'Pneumatic brake valve overhaul in progress following hill descent pressure loss.',
      partsReplaced: ['Pneumatic Master Cylinder Kit'],
      costInr: 24500,
      status: 'IN_PROGRESS',
      notes: 'Vehicle immobilised in workshop bay #3. Re-evaluation required before any dispatch.',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-31': [],
}

export const DEMO_INSPECTION_RECORDS: Record<string, InspectionRecord[]> = {
  'NER-TRUCK-18': [
    {
      id: 'INSP-2026-001',
      vehicleId: 'NER-TRUCK-18',
      inspectionDate: '2026-08-01T08:00:00.000Z',
      odometerKm: 49100,
      inspectionType: 'Pre-Deployment Mountain Logistics Safety Check',
      checklist: { Brakes: 'PASS', Engine: 'PASS', Tyres: 'PASS', VHF: 'PASS', FirstAid: 'PASS' },
      result: 'PASS',
      issuesFound: [],
      inspector: 'Safety Officer A. Kalita',
      notes: 'Vehicle cleared for high-altitude emergency supply missions.',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-07': [
    {
      id: 'INSP-2026-002',
      vehicleId: 'NER-TRUCK-07',
      inspectionDate: '2026-08-10T10:00:00.000Z',
      odometerKm: 63400,
      inspectionType: 'Quarterly Fleet Physical Inspection',
      checklist: { Brakes: 'PASS', Engine: 'PASS', Tyres: 'WARNING', VHF: 'PASS', FirstAid: 'PASS' },
      result: 'WARNING',
      issuesFound: ['Front axle tyre tread depth near minimum threshold (3.8mm)'],
      inspector: 'Inspector S. Roy',
      notes: 'Cleared for plains missions; mountain routes require tyre upgrade.',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-23': [
    {
      id: 'INSP-2026-003',
      vehicleId: 'NER-TRUCK-23',
      inspectionDate: '2026-08-25T15:00:00.000Z',
      odometerKm: 78500,
      inspectionType: 'Post-Incident Mechanical Diagnostics',
      checklist: { Brakes: 'FAIL', Engine: 'PASS', Tyres: 'PASS', VHF: 'PASS', FirstAid: 'PASS' },
      result: 'FAIL',
      issuesFound: ['Brake line pressure loss detected', 'Air reservoir seal cracked'],
      inspector: 'Chief Inspector J. Nath',
      notes: 'VEHICLE GROUNDED. Dispatched to Silchar maintenance workshop.',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-31': [],
}

export const DEMO_FUEL_RECORDS: Record<string, FuelRecord[]> = {
  'NER-TRUCK-18': [
    {
      id: 'FUEL-2026-001',
      vehicleId: 'NER-TRUCK-18',
      timestamp: '2026-08-15T07:15:00.000Z',
      liters: 180,
      fuelType: 'High-Altitude Winter Diesel',
      odometerKm: 48800,
      costInr: 16200,
      locationName: 'Guwahati Apex IOCL Fueling Station',
      source: 'TELEMETERED_DISPENSE',
      isSimulated: true,
    },
    {
      id: 'FUEL-2026-002',
      vehicleId: 'NER-TRUCK-18',
      timestamp: '2026-08-22T12:45:00.000Z',
      liters: 140,
      fuelType: 'High-Altitude Winter Diesel',
      odometerKm: 49450,
      costInr: 12600,
      locationName: 'Nagaon Highway Fuel Point',
      source: 'TELEMETERED_DISPENSE',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-07': [
    {
      id: 'FUEL-2026-003',
      vehicleId: 'NER-TRUCK-07',
      timestamp: '2026-08-18T09:00:00.000Z',
      liters: 220,
      fuelType: 'Standard Commercial Diesel',
      odometerKm: 63100,
      costInr: 19800,
      locationName: 'Tezpur Supply Base Dispenser',
      source: 'TELEMETERED_DISPENSE',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-23': [
    {
      id: 'FUEL-2026-004',
      vehicleId: 'NER-TRUCK-23',
      timestamp: '2026-08-20T11:20:00.000Z',
      liters: 190,
      fuelType: 'Standard Commercial Diesel',
      odometerKm: 78200,
      costInr: 17100,
      locationName: 'Silchar Transit IOCL Station',
      source: 'TELEMETERED_DISPENSE',
      isSimulated: true,
    },
  ],
  'NER-TRUCK-31': [],
}
