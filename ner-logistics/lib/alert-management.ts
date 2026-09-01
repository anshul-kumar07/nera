// lib/alert-management.ts
// ========================================================================
//    NERA PHASE 20: OPERATIONAL ALERT & NOTIFICATION MANAGEMENT ENGINE
// ========================================================================

import { UserRole } from './access-control'

export type AlertType =
  | 'CONFIRMED_ROAD_BLOCK'
  | 'AI_DISRUPTION_WARNING'
  | 'FIELD_REPORT_PENDING'
  | 'CRITICAL_SHIPMENT_DELAY'
  | 'VEHICLE_FAILURE'
  | 'VEHICLE_NOT_READY'
  | 'RESOURCE_CONFLICT'
  | 'SUPPLY_SHORTAGE'
  | 'MISSION_INTERRUPTED'
  | 'LAST_MILE_REQUIRED'
  | 'EMERGENCY_MODE'
  | 'SYSTEM_OFFLINE'
  | 'DATA_INSUFFICIENT'

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export type AlertStatus =
  | 'GENERATED'
  | 'DELIVERED'
  | 'ACKNOWLEDGED'
  | 'ESCALATED'
  | 'RESOLVED'

export interface OperationalAlert {
  alertId: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  source: string
  relatedIncidentId?: string | null
  relatedMissionId?: string | null
  relatedVehicleId?: string | null
  relatedResourceId?: string | null
  targetRoles: UserRole[]
  targetDistricts?: string[]
  createdAt: string
  expiresAt?: string | null
  status: AlertStatus
  acknowledgedBy?: string | null
  acknowledgedAt?: string | null
  escalatedAt?: string | null
  escalationReason?: string | null
  resolvedAt?: string | null
  isSimulated: boolean
}

// ── Role Target Mapping Matrix ──
export const ALERT_TARGET_ROLES: Record<AlertType, UserRole[]> = {
  CONFIRMED_ROAD_BLOCK: ['DISASTER_AUTHORITY', 'LOGISTICS_OPERATOR', 'COMMANDER'],
  AI_DISRUPTION_WARNING: ['LOGISTICS_OPERATOR', 'DISASTER_AUTHORITY', 'COMMANDER'],
  FIELD_REPORT_PENDING: ['DISASTER_AUTHORITY', 'DISTRICT_AUTHORITY'],
  CRITICAL_SHIPMENT_DELAY: ['LOGISTICS_OPERATOR', 'COMMANDER'],
  VEHICLE_FAILURE: ['FLEET_OFFICER', 'LOGISTICS_OPERATOR', 'COMMANDER'],
  VEHICLE_NOT_READY: ['FLEET_OFFICER', 'LOGISTICS_OPERATOR'],
  RESOURCE_CONFLICT: ['LOGISTICS_OPERATOR', 'COMMANDER'],
  SUPPLY_SHORTAGE: ['LOGISTICS_OPERATOR', 'DISTRICT_AUTHORITY', 'COMMANDER'],
  MISSION_INTERRUPTED: ['LOGISTICS_OPERATOR', 'FLEET_OFFICER', 'COMMANDER'],
  LAST_MILE_REQUIRED: ['FIELD_OFFICER', 'LOGISTICS_OPERATOR'],
  EMERGENCY_MODE: ['COMMANDER', 'DISASTER_AUTHORITY', 'DISTRICT_AUTHORITY', 'LOGISTICS_OPERATOR', 'FLEET_OFFICER', 'FIELD_OFFICER'],
  SYSTEM_OFFLINE: ['SYSTEM_ADMIN', 'COMMANDER'],
  DATA_INSUFFICIENT: ['LOGISTICS_OPERATOR', 'FIELD_OFFICER'],
}

// ── Baseline Demo Alerts ──
export const INITIAL_OPERATIONAL_ALERTS: OperationalAlert[] = [
  {
    alertId: 'ALT-2026-001',
    type: 'VEHICLE_FAILURE',
    severity: 'CRITICAL',
    title: 'Carrier NER-TRUCK-18 In-Transit Transmission Overheat',
    description: 'Vehicle NER-TRUCK-18 experienced mechanical failure at KM 48 Lumding-Haflong corridor. Mission NERA-MSN-01 interrupted.',
    source: 'Vehicle Telemetry Engine',
    relatedMissionId: 'NERA-MSN-01',
    relatedVehicleId: 'NER-TRUCK-18',
    targetRoles: ['FLEET_OFFICER', 'LOGISTICS_OPERATOR', 'COMMANDER'],
    targetDistricts: ['Dima Hasao (Haflong)'],
    createdAt: '2026-08-29T06:05:00Z',
    status: 'GENERATED',
    isSimulated: true,
  },
  {
    alertId: 'ALT-2026-002',
    type: 'CONFIRMED_ROAD_BLOCK',
    severity: 'HIGH',
    title: 'NH-27 Lumding Sector Closed — Active Landslide',
    description: 'District Magistrate Dima Hasao confirmed road closure. Dynamic Dijkstra bypass recalculation active via Lanka route.',
    source: 'Disaster Authority Office',
    relatedIncidentId: 'INC-2026-0829-01',
    targetRoles: ['DISASTER_AUTHORITY', 'LOGISTICS_OPERATOR', 'COMMANDER'],
    targetDistricts: ['Dima Hasao (Haflong)', 'Hojai'],
    createdAt: '2026-08-29T05:45:00Z',
    status: 'ACKNOWLEDGED',
    acknowledgedBy: 'Brigadier A. Barman (Retd.)',
    acknowledgedAt: '2026-08-29T05:50:00Z',
    isSimulated: true,
  },
  {
    alertId: 'ALT-2026-003',
    type: 'RESOURCE_CONFLICT',
    severity: 'HIGH',
    title: 'Vehicle Double-Assignment Conflict: NER-TRUCK-18',
    description: 'Carrier NER-TRUCK-18 requested simultaneously by Haflong Medical Replenishment and Silchar Food Support missions.',
    source: 'Resource Coordination Engine',
    relatedVehicleId: 'NER-TRUCK-18',
    targetRoles: ['LOGISTICS_OPERATOR', 'COMMANDER'],
    createdAt: '2026-08-29T06:10:00Z',
    status: 'GENERATED',
    isSimulated: true,
  },
  {
    alertId: 'ALT-2026-004',
    type: 'SUPPLY_SHORTAGE',
    severity: 'HIGH',
    title: 'Haflong District Medical Reserves Critical (< 2.0 Days Cover)',
    description: 'Available medical stock (180 kits) below safe reserve threshold (600 kits). Proactive replenishment recommended.',
    source: 'Regional Supply-Demand Engine',
    relatedResourceId: 'Haflong (Dima Hasao)',
    targetRoles: ['LOGISTICS_OPERATOR', 'DISTRICT_AUTHORITY', 'COMMANDER'],
    targetDistricts: ['Dima Hasao (Haflong)'],
    createdAt: '2026-08-29T05:00:00Z',
    status: 'DELIVERED',
    isSimulated: true,
  },
]

// ── Alert Factory & Deduplication Engine ──

export function createOperationalAlert(params: {
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  source: string
  relatedIncidentId?: string | null
  relatedMissionId?: string | null
  relatedVehicleId?: string | null
  relatedResourceId?: string | null
  targetDistricts?: string[]
  existingAlerts?: OperationalAlert[]
}): { alert: OperationalAlert | null; isDuplicate: boolean } {
  const existing = params.existingAlerts || []

  // Deduplication Check
  const duplicate = existing.find(
    a =>
      a.type === params.type &&
      (params.relatedVehicleId ? a.relatedVehicleId === params.relatedVehicleId : true) &&
      (params.relatedIncidentId ? a.relatedIncidentId === params.relatedIncidentId : true) &&
      (params.relatedMissionId ? a.relatedMissionId === params.relatedMissionId : true) &&
      a.status !== 'RESOLVED'
  )

  if (duplicate) {
    return { alert: duplicate, isDuplicate: true }
  }

  const alertId = `ALT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
  const targetRoles = ALERT_TARGET_ROLES[params.type] || ['COMMANDER']

  const alert: OperationalAlert = {
    alertId,
    type: params.type,
    severity: params.severity,
    title: params.title,
    description: params.description,
    source: params.source,
    relatedIncidentId: params.relatedIncidentId || null,
    relatedMissionId: params.relatedMissionId || null,
    relatedVehicleId: params.relatedVehicleId || null,
    relatedResourceId: params.relatedResourceId || null,
    targetRoles,
    targetDistricts: params.targetDistricts || [],
    createdAt: new Date().toISOString(),
    status: 'GENERATED',
    isSimulated: true,
  }

  return { alert, isDuplicate: false }
}

export function acknowledgeAlert(
  alert: OperationalAlert,
  officerName: string
): OperationalAlert {
  return {
    ...alert,
    status: 'ACKNOWLEDGED',
    acknowledgedBy: officerName,
    acknowledgedAt: new Date().toISOString(),
  }
}

export function escalateAlert(
  alert: OperationalAlert,
  reason: string
): OperationalAlert {
  return {
    ...alert,
    status: 'ESCALATED',
    escalatedAt: new Date().toISOString(),
    escalationReason: reason,
  }
}

export function resolveAlert(
  alert: OperationalAlert
): OperationalAlert {
  return {
    ...alert,
    status: 'RESOLVED',
    resolvedAt: new Date().toISOString(),
  }
}

export function filterAlertsForRole(
  alerts: OperationalAlert[],
  role: UserRole
): OperationalAlert[] {
  return alerts.filter(a => a.targetRoles.includes(role))
}
