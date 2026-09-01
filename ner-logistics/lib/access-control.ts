// lib/access-control.ts
// ========================================================================
//    NERA PHASE 20: GOVERNMENT ACCESS CONTROL & OFFICIAL IDENTITY (RBAC)
// ========================================================================

export type UserRole =
  | 'PUBLIC_REPORTER'
  | 'FIELD_OFFICER'
  | 'LOGISTICS_OPERATOR'
  | 'FLEET_OFFICER'
  | 'DISASTER_AUTHORITY'
  | 'DISTRICT_AUTHORITY'
  | 'COMMANDER'
  | 'SYSTEM_ADMIN'

export type Permission =
  | 'VIEW_INCIDENTS'
  | 'REPORT_INCIDENTS'
  | 'CONFIRM_INCIDENTS'
  | 'RESOLVE_INCIDENTS'
  | 'CREATE_MISSIONS'
  | 'APPROVE_MISSIONS'
  | 'DISPATCH_MISSIONS'
  | 'MANAGE_VEHICLES'
  | 'RECORD_MAINTENANCE'
  | 'ASSIGN_RESOURCES'
  | 'APPROVE_RESOURCE_REASSIGNMENT'
  | 'ACKNOWLEDGE_ALERTS'
  | 'ESCALATE_ALERTS'
  | 'MANAGE_USERS'
  | 'VIEW_AUDIT_LOGS'

export interface UserIdentity {
  userId: string
  name: string
  role: UserRole
  department: string
  district?: string
  permissions: Permission[]
  lastLogin: string
  isActive: boolean
  isSimulated: boolean
}

// ── Role Permissions Mapping Matrix ──
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  PUBLIC_REPORTER: [
    'VIEW_INCIDENTS',
    'REPORT_INCIDENTS',
  ],
  FIELD_OFFICER: [
    'VIEW_INCIDENTS',
    'REPORT_INCIDENTS',
    'MANAGE_VEHICLES',
    'ACKNOWLEDGE_ALERTS',
  ],
  LOGISTICS_OPERATOR: [
    'VIEW_INCIDENTS',
    'REPORT_INCIDENTS',
    'CREATE_MISSIONS',
    'ASSIGN_RESOURCES',
    'ACKNOWLEDGE_ALERTS',
  ],
  FLEET_OFFICER: [
    'VIEW_INCIDENTS',
    'MANAGE_VEHICLES',
    'RECORD_MAINTENANCE',
    'ACKNOWLEDGE_ALERTS',
  ],
  DISASTER_AUTHORITY: [
    'VIEW_INCIDENTS',
    'REPORT_INCIDENTS',
    'CONFIRM_INCIDENTS',
    'RESOLVE_INCIDENTS',
    'ACKNOWLEDGE_ALERTS',
    'ESCALATE_ALERTS',
    'VIEW_AUDIT_LOGS',
  ],
  DISTRICT_AUTHORITY: [
    'VIEW_INCIDENTS',
    'CONFIRM_INCIDENTS',
    'RESOLVE_INCIDENTS',
    'ASSIGN_RESOURCES',
    'ACKNOWLEDGE_ALERTS',
    'ESCALATE_ALERTS',
    'VIEW_AUDIT_LOGS',
  ],
  COMMANDER: [
    'VIEW_INCIDENTS',
    'REPORT_INCIDENTS',
    'CONFIRM_INCIDENTS',
    'RESOLVE_INCIDENTS',
    'CREATE_MISSIONS',
    'APPROVE_MISSIONS',
    'DISPATCH_MISSIONS',
    'MANAGE_VEHICLES',
    'RECORD_MAINTENANCE',
    'ASSIGN_RESOURCES',
    'APPROVE_RESOURCE_REASSIGNMENT',
    'ACKNOWLEDGE_ALERTS',
    'ESCALATE_ALERTS',
    'VIEW_AUDIT_LOGS',
  ],
  SYSTEM_ADMIN: [
    'VIEW_INCIDENTS',
    'REPORT_INCIDENTS',
    'CONFIRM_INCIDENTS',
    'RESOLVE_INCIDENTS',
    'CREATE_MISSIONS',
    'APPROVE_MISSIONS',
    'DISPATCH_MISSIONS',
    'MANAGE_VEHICLES',
    'RECORD_MAINTENANCE',
    'ASSIGN_RESOURCES',
    'APPROVE_RESOURCE_REASSIGNMENT',
    'ACKNOWLEDGE_ALERTS',
    'ESCALATE_ALERTS',
    'MANAGE_USERS',
    'VIEW_AUDIT_LOGS',
  ],
}

// ── Controlled Demo Simulated Identities ──
export const DEMO_IDENTITIES: Record<string, UserIdentity> = {
  'USER-CMD-01': {
    userId: 'USER-CMD-01',
    name: 'Brigadier A. Barman (Retd.)',
    role: 'COMMANDER',
    department: 'Assam State Disaster Management Authority (ASDMA)',
    district: 'State HQ (Guwahati)',
    permissions: ROLE_PERMISSIONS.COMMANDER,
    lastLogin: '2026-08-29T06:00:00Z',
    isActive: true,
    isSimulated: true,
  },
  'USER-DIS-01': {
    userId: 'USER-DIS-01',
    name: 'Dr. R. K. Sarma, IAS',
    role: 'DISASTER_AUTHORITY',
    department: 'Revenue & Disaster Management Dept, Govt. of Assam',
    district: 'Kamrup Metro',
    permissions: ROLE_PERMISSIONS.DISASTER_AUTHORITY,
    lastLogin: '2026-08-29T05:30:00Z',
    isActive: true,
    isSimulated: true,
  },
  'USER-DIST-01': {
    userId: 'USER-DIST-01',
    name: 'Shri N. Deka, ACS',
    role: 'DISTRICT_AUTHORITY',
    department: 'District Emergency Operations Center (DEOC)',
    district: 'Dima Hasao (Haflong)',
    permissions: ROLE_PERMISSIONS.DISTRICT_AUTHORITY,
    lastLogin: '2026-08-29T05:45:00Z',
    isActive: true,
    isSimulated: true,
  },
  'USER-LOG-01': {
    userId: 'USER-LOG-01',
    name: 'P. Bora',
    role: 'LOGISTICS_OPERATOR',
    department: 'ASDMA Emergency Logistics Cell',
    district: 'Guwahati Apex Logistics Hub',
    permissions: ROLE_PERMISSIONS.LOGISTICS_OPERATOR,
    lastLogin: '2026-08-29T06:15:00Z',
    isActive: true,
    isSimulated: true,
  },
  'USER-FLEET-01': {
    userId: 'USER-FLEET-01',
    name: 'Sub-Inspector M. Nath',
    role: 'FLEET_OFFICER',
    department: 'Govt. Regional Transport & Fleet Depot',
    district: 'Silchar Center',
    permissions: ROLE_PERMISSIONS.FLEET_OFFICER,
    lastLogin: '2026-08-29T04:30:00Z',
    isActive: true,
    isSimulated: true,
  },
  'USER-FIELD-01': {
    userId: 'USER-FIELD-01',
    name: 'Constable D. Gogoi',
    role: 'FIELD_OFFICER',
    department: 'Highway Patrol Sector 4',
    district: 'Lumding - Haflong Corridor',
    permissions: ROLE_PERMISSIONS.FIELD_OFFICER,
    lastLogin: '2026-08-29T06:20:00Z',
    isActive: true,
    isSimulated: true,
  },
  'USER-ADMIN-01': {
    userId: 'USER-ADMIN-01',
    name: 'System Administrator (NIC)',
    role: 'SYSTEM_ADMIN',
    department: 'National Informatics Centre (NIC) NER Cell',
    district: 'Guwahati',
    permissions: ROLE_PERMISSIONS.SYSTEM_ADMIN,
    lastLogin: '2026-08-29T00:00:00Z',
    isActive: true,
    isSimulated: true,
  },
}

// ── Default Active Demo User ──
export const CURRENT_DEMO_USER: UserIdentity = DEMO_IDENTITIES['USER-CMD-01']

// ── RBAC Authority Enforcement Functions ──

export function hasPermission(user: UserIdentity | null, permission: Permission): boolean {
  if (!user || !user.isActive) return false
  return user.permissions.includes(permission)
}

export function canViewIncident(user: UserIdentity | null): boolean {
  return hasPermission(user, 'VIEW_INCIDENTS')
}

export function canReportIncident(user: UserIdentity | null): boolean {
  return hasPermission(user, 'REPORT_INCIDENTS')
}

export function canConfirmIncident(user: UserIdentity | null): boolean {
  return hasPermission(user, 'CONFIRM_INCIDENTS')
}

export function canResolveIncident(user: UserIdentity | null): boolean {
  return hasPermission(user, 'RESOLVE_INCIDENTS')
}

export function canCreateMission(user: UserIdentity | null): boolean {
  return hasPermission(user, 'CREATE_MISSIONS')
}

export function canApproveMission(user: UserIdentity | null): boolean {
  return hasPermission(user, 'APPROVE_MISSIONS')
}

export function canDispatchMission(user: UserIdentity | null): boolean {
  return hasPermission(user, 'DISPATCH_MISSIONS')
}

export function canManageVehicle(user: UserIdentity | null): boolean {
  return hasPermission(user, 'MANAGE_VEHICLES')
}

export function canRecordMaintenance(user: UserIdentity | null): boolean {
  return hasPermission(user, 'RECORD_MAINTENANCE')
}

export function canAssignResource(user: UserIdentity | null): boolean {
  return hasPermission(user, 'ASSIGN_RESOURCES')
}

export function canApproveResourceReassignment(user: UserIdentity | null): boolean {
  return hasPermission(user, 'APPROVE_RESOURCE_REASSIGNMENT')
}

export function canAcknowledgeAlert(user: UserIdentity | null): boolean {
  return hasPermission(user, 'ACKNOWLEDGE_ALERTS')
}

export function canEscalateAlert(user: UserIdentity | null): boolean {
  return hasPermission(user, 'ESCALATE_ALERTS')
}

export function canManageUsers(user: UserIdentity | null): boolean {
  return hasPermission(user, 'MANAGE_USERS')
}

export function canViewAuditLogs(user: UserIdentity | null): boolean {
  return hasPermission(user, 'VIEW_AUDIT_LOGS')
}

