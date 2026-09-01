// lib/operational-priority.ts
// ========================================================================
//    NERA PHASE 23: "WHAT NEEDS ATTENTION?" OPERATIONAL PRIORITY ENGINE
// ========================================================================

import { UserRole } from './access-control'

export type AttentionPriority =
  | 'P0_CRITICAL'
  | 'P1_HIGH'
  | 'P2_MEDIUM'
  | 'P3_LOW'
  | 'P4_INFO'

export interface OperationalAttentionItem {
  itemId: string
  priority: AttentionPriority
  title: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  entityType: 'MISSION' | 'VEHICLE' | 'INCIDENT' | 'RESOURCE' | 'SUPPLY' | 'SYSTEM'
  entityId: string
  location: string
  reason: string
  supportingEvidence: string[]
  recommendedAction: string
  requiredRole: UserRole
  timestamp: string
  dataSource: string
  isSimulated: boolean
}

export const INITIAL_ATTENTION_ITEMS: OperationalAttentionItem[] = [
  {
    itemId: 'ATTN-001',
    priority: 'P0_CRITICAL',
    title: 'P1 Emergency Mission Interrupted — Carrier Mechanical Failure',
    severity: 'CRITICAL',
    entityType: 'MISSION',
    entityId: 'NERA-MSN-01',
    location: 'NH-27 Lumding-Haflong KM 48',
    reason: 'Carrier NER-TRUCK-18 reported transmission failure carrying 350 emergency medical kits.',
    supportingEvidence: [
      'Vehicle Telemetry Engine: Speed 0 km/h, Engine temperature 118°C',
      'Phase 11 Safety Gate: NOT_READY',
      'Mission Management: Status INTERRUPTED',
    ],
    recommendedAction: 'NERA recommends commander review and authorization of replacement carrier NER-TRUCK-07.',
    requiredRole: 'COMMANDER',
    timestamp: '2026-08-29T06:05:00Z',
    dataSource: 'Vehicle Telemetry Gateway',
    isSimulated: true,
  },
  {
    itemId: 'ATTN-002',
    priority: 'P1_HIGH',
    title: 'Confirmed Road Closure — Dynamic Bypass In Effect',
    severity: 'HIGH',
    entityType: 'INCIDENT',
    entityId: 'INC-2026-0829-01',
    location: 'NH-27 KM 48 Sector',
    reason: 'Active landslide confirmed by District Authority Dima Hasao. Corridor blocked.',
    supportingEvidence: [
      'Disaster Authority official confirmation signoff',
      'Phase 4 Route Invalidation: Primary corridor CLOSED',
      'Phase 9 Dynamic Reroute: Lanka-Kheroni alternate bypass active (+32.3 km, +45 min)',
    ],
    recommendedAction: 'NERA recommends monitoring convoy progress along Lanka alternative route.',
    requiredRole: 'LOGISTICS_OPERATOR',
    timestamp: '2026-08-29T05:45:00Z',
    dataSource: 'Disaster Authority Office & OSRM Engine',
    isSimulated: true,
  },
  {
    itemId: 'ATTN-003',
    priority: 'P1_HIGH',
    title: 'Haflong District Medical Stock Critical (< 2 Days Cover)',
    severity: 'HIGH',
    entityType: 'SUPPLY',
    entityId: 'DIST-HAFLONG',
    location: 'Haflong DEOC Medical Cache',
    reason: 'Current stock (180 kits) below safe reserve baseline (600 kits) due to flood demand.',
    supportingEvidence: [
      'Regional Supply-Demand Engine: 1.8 days cover remaining',
      'Active Mission NERA-MSN-01 carries 350 replenishment kits',
    ],
    recommendedAction: 'NERA recommends monitoring replacement convoy arrival to replenish stock.',
    requiredRole: 'DISTRICT_AUTHORITY',
    timestamp: '2026-08-29T05:00:00Z',
    dataSource: 'State Warehousing ERP',
    isSimulated: true,
  },
  {
    itemId: 'ATTN-004',
    priority: 'P2_MEDIUM',
    title: 'AI Predictive Maintenance Risk Advisory: NER-TRUCK-14',
    severity: 'MEDIUM',
    entityType: 'VEHICLE',
    entityId: 'NER-TRUCK-14',
    location: 'Guwahati Depot Base',
    reason: 'AI detected repeated brake pressure decline patterns over past 3 hill missions.',
    supportingEvidence: [
      'Phase 15 AI Vehicle Health: Risk ELEVATED',
      'Phase 11 Safety Gate: Currently READY_WITH_WARNING',
    ],
    recommendedAction: 'NERA recommends depot inspection prior to next long-haul mountain dispatch.',
    requiredRole: 'FLEET_OFFICER',
    timestamp: '2026-08-29T04:30:00Z',
    dataSource: 'AI Vehicle Health Intelligence',
    isSimulated: true,
  },
]

export function rankAttentionItems(items: OperationalAttentionItem[]): OperationalAttentionItem[] {
  const priorityWeights: Record<AttentionPriority, number> = {
    P0_CRITICAL: 5,
    P1_HIGH: 4,
    P2_MEDIUM: 3,
    P3_LOW: 2,
    P4_INFO: 1,
  }

  return [...items].sort((a, b) => {
    const diff = priorityWeights[b.priority] - priorityWeights[a.priority]
    if (diff !== 0) return diff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
}

