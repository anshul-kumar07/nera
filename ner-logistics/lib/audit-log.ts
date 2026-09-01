// lib/audit-log.ts
// ========================================================================
//    NERA PHASE 20: IMMUTABLE OPERATIONAL AUDIT & ACCOUNTABILITY LOG
// ========================================================================

import { UserRole } from './access-control'

export type AuditEntityType =
  | 'INCIDENT'
  | 'MISSION'
  | 'VEHICLE'
  | 'RESOURCE'
  | 'ALERT'
  | 'USER'

export interface AuditEvent {
  eventId: string
  actorId: string
  actorName: string
  actorRole: UserRole
  action: string
  entityType: AuditEntityType
  entityId: string
  previousState?: string | null
  newState: string
  reason: string
  timestamp: string
  source: string
  isSimulated: boolean
}

// ── Baseline Demo Audit Events ──
export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    eventId: 'AUD-2026-001',
    actorId: 'USER-DIS-01',
    actorName: 'Dr. R. K. Sarma, IAS',
    actorRole: 'DISASTER_AUTHORITY',
    action: 'INCIDENT_CONFIRMED',
    entityType: 'INCIDENT',
    entityId: 'INC-2026-0829-01',
    previousState: 'reported',
    newState: 'confirmed',
    reason: 'Field patrol photographic evidence and PWD road blockage report verified',
    timestamp: '2026-08-29T05:45:00Z',
    source: 'Disaster Authority Portal',
    isSimulated: true,
  },
  {
    eventId: 'AUD-2026-002',
    actorId: 'USER-CMD-01',
    actorName: 'Brigadier A. Barman (Retd.)',
    actorRole: 'COMMANDER',
    action: 'MISSION_APPROVED',
    entityType: 'MISSION',
    entityId: 'NERA-MSN-01',
    previousState: 'PENDING_APPROVAL',
    newState: 'APPROVED',
    reason: 'Emergency Medical Replenishment for Haflong Settlement authorized',
    timestamp: '2026-08-29T05:55:00Z',
    source: 'Command Operations Console',
    isSimulated: true,
  },
  {
    eventId: 'AUD-2026-003',
    actorId: 'USER-LOG-01',
    actorName: 'P. Bora',
    actorRole: 'LOGISTICS_OPERATOR',
    action: 'RESOURCE_RESERVED',
    entityType: 'RESOURCE',
    entityId: 'DEPOT-GHY-01',
    previousState: 'AVAILABLE',
    newState: 'RESERVED',
    reason: 'Reserved 350 medical kits at Guwahati Apex Hub for Mission NERA-MSN-01',
    timestamp: '2026-08-29T05:50:00Z',
    source: 'Regional Resource Coordination Engine',
    isSimulated: true,
  },
  {
    eventId: 'AUD-2026-004',
    actorId: 'USER-FLEET-01',
    actorName: 'Sub-Inspector M. Nath',
    actorRole: 'FLEET_OFFICER',
    action: 'VEHICLE_FAILURE_LOGGED',
    entityType: 'VEHICLE',
    entityId: 'NER-TRUCK-18',
    previousState: 'IN_TRANSIT',
    newState: 'FAILED',
    reason: 'Transmission overheating reported at KM 48 Lumding-Haflong corridor',
    timestamp: '2026-08-29T06:05:00Z',
    source: 'Field Telemetry Gateway',
    isSimulated: true,
  },
]

// ── In-Memory Audit Trail Store ──
const auditStore: AuditEvent[] = [...INITIAL_AUDIT_EVENTS]

export function recordAuditEvent(params: {
  actorId: string
  actorName: string
  actorRole: UserRole
  action: string
  entityType: AuditEntityType
  entityId: string
  previousState?: string | null
  newState: string
  reason: string
  source?: string
}): AuditEvent {
  const eventId = `AUD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`
  const event: AuditEvent = {
    eventId,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    previousState: params.previousState || null,
    newState: params.newState,
    reason: params.reason,
    timestamp: new Date().toISOString(),
    source: params.source || 'NERA Operational Engine',
    isSimulated: true,
  }

  // Strictly append (immutable)
  auditStore.unshift(event)
  return event
}

export function getAuditEvents(): AuditEvent[] {
  return [...auditStore]
}

export function filterAuditEvents(params: {
  actorRole?: UserRole | 'ALL'
  entityType?: AuditEntityType | 'ALL'
  searchQuery?: string
}): AuditEvent[] {
  return auditStore.filter(event => {
    const matchRole = !params.actorRole || params.actorRole === 'ALL' || event.actorRole === params.actorRole
    const matchType = !params.entityType || params.entityType === 'ALL' || event.entityType === params.entityType
    const matchQuery =
      !params.searchQuery ||
      event.action.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
      event.entityId.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
      event.actorName.toLowerCase().includes(params.searchQuery.toLowerCase()) ||
      event.reason.toLowerCase().includes(params.searchQuery.toLowerCase())

    return matchRole && matchType && matchQuery
  })
}
