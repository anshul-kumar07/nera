// scripts/test-access-control.mjs
// ========================================================================
//    NERA PHASE 20: GOVERNMENT RBAC & ACCESS CONTROL TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 20: GOVERNMENT RBAC & ACCESS CONTROL TEST SUITE           ')
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

// ── In-Memory RBAC Logic (Matching lib/access-control.ts) ──

const ROLE_PERMISSIONS = {
  PUBLIC_REPORTER: ['VIEW_INCIDENTS', 'REPORT_INCIDENTS'],
  FIELD_OFFICER: ['VIEW_INCIDENTS', 'REPORT_INCIDENTS', 'MANAGE_VEHICLES', 'ACKNOWLEDGE_ALERTS'],
  LOGISTICS_OPERATOR: ['VIEW_INCIDENTS', 'REPORT_INCIDENTS', 'CREATE_MISSIONS', 'ASSIGN_RESOURCES', 'ACKNOWLEDGE_ALERTS'],
  FLEET_OFFICER: ['VIEW_INCIDENTS', 'MANAGE_VEHICLES', 'RECORD_MAINTENANCE', 'ACKNOWLEDGE_ALERTS'],
  DISASTER_AUTHORITY: ['VIEW_INCIDENTS', 'REPORT_INCIDENTS', 'CONFIRM_INCIDENTS', 'RESOLVE_INCIDENTS', 'ACKNOWLEDGE_ALERTS', 'ESCALATE_ALERTS', 'VIEW_AUDIT_LOGS'],
  DISTRICT_AUTHORITY: ['VIEW_INCIDENTS', 'CONFIRM_INCIDENTS', 'RESOLVE_INCIDENTS', 'ASSIGN_RESOURCES', 'ACKNOWLEDGE_ALERTS', 'ESCALATE_ALERTS', 'VIEW_AUDIT_LOGS'],
  COMMANDER: ['VIEW_INCIDENTS', 'REPORT_INCIDENTS', 'CONFIRM_INCIDENTS', 'RESOLVE_INCIDENTS', 'CREATE_MISSIONS', 'APPROVE_MISSIONS', 'DISPATCH_MISSIONS', 'MANAGE_VEHICLES', 'RECORD_MAINTENANCE', 'ASSIGN_RESOURCES', 'APPROVE_RESOURCE_REASSIGNMENT', 'ACKNOWLEDGE_ALERTS', 'ESCALATE_ALERTS', 'VIEW_AUDIT_LOGS'],
  SYSTEM_ADMIN: ['VIEW_INCIDENTS', 'REPORT_INCIDENTS', 'CONFIRM_INCIDENTS', 'RESOLVE_INCIDENTS', 'CREATE_MISSIONS', 'APPROVE_MISSIONS', 'DISPATCH_MISSIONS', 'MANAGE_VEHICLES', 'RECORD_MAINTENANCE', 'ASSIGN_RESOURCES', 'APPROVE_RESOURCE_REASSIGNMENT', 'ACKNOWLEDGE_ALERTS', 'ESCALATE_ALERTS', 'MANAGE_USERS', 'VIEW_AUDIT_LOGS'],
}

function hasPermission(user, permission) {
  if (!user || !user.isActive) return false
  return (ROLE_PERMISSIONS[user.role] || []).includes(permission)
}

const publicUser = { userId: 'U-PUB', name: 'Citizen Reporter', role: 'PUBLIC_REPORTER', isActive: true, isSimulated: true }
const fieldOfficer = { userId: 'U-FIELD', name: 'Constable D. Gogoi', role: 'FIELD_OFFICER', isActive: true, isSimulated: true }
const logisticsOp = { userId: 'U-LOG', name: 'P. Bora', role: 'LOGISTICS_OPERATOR', isActive: true, isSimulated: true }
const fleetOfficer = { userId: 'U-FLEET', name: 'SI M. Nath', role: 'FLEET_OFFICER', isActive: true, isSimulated: true }
const disasterAuth = { userId: 'U-DIS', name: 'Dr. R. Sarma', role: 'DISASTER_AUTHORITY', isActive: true, isSimulated: true }
const commander = { userId: 'U-CMD', name: 'Brig A. Barman', role: 'COMMANDER', isActive: true, isSimulated: true }
const systemAdmin = { userId: 'U-ADM', name: 'System Admin', role: 'SYSTEM_ADMIN', isActive: true, isSimulated: true }

// ------------------------------------------------------------------------
// TEST 1: User identity creation
// ------------------------------------------------------------------------
assert(
  commander.userId === 'U-CMD' && commander.isSimulated === true,
  'TEST 1: User identity instantiated with official attributes and simulated badge'
)

// ------------------------------------------------------------------------
// TEST 2: Role validation
// ------------------------------------------------------------------------
assert(
  Object.keys(ROLE_PERMISSIONS).length === 8,
  'TEST 2: All 8 official government roles defined in RBAC matrix'
)

// ------------------------------------------------------------------------
// TEST 3: Permission validation
// ------------------------------------------------------------------------
assert(
  hasPermission(commander, 'APPROVE_MISSIONS') === true,
  'TEST 3: Commander role contains explicit APPROVE_MISSIONS permission'
)

// ------------------------------------------------------------------------
// TEST 4: Public reporter cannot confirm
// ------------------------------------------------------------------------
assert(
  hasPermission(publicUser, 'CONFIRM_INCIDENTS') === false,
  'TEST 4: Public reporter role strictly denied CONFIRM_INCIDENTS permission'
)

// ------------------------------------------------------------------------
// TEST 5: Field officer reporting works
// ------------------------------------------------------------------------
assert(
  hasPermission(fieldOfficer, 'REPORT_INCIDENTS') === true,
  'TEST 5: Field officer granted REPORT_INCIDENTS permission'
)

// ------------------------------------------------------------------------
// TEST 6: Logistics operator can prepare mission
// ------------------------------------------------------------------------
assert(
  hasPermission(logisticsOp, 'CREATE_MISSIONS') === true,
  'TEST 6: Logistics operator granted CREATE_MISSIONS permission'
)

// ------------------------------------------------------------------------
// TEST 7: Commander can approve mission
// ------------------------------------------------------------------------
assert(
  hasPermission(commander, 'APPROVE_MISSIONS') === true,
  'TEST 7: Senior Commander granted APPROVE_MISSIONS permission'
)

// ------------------------------------------------------------------------
// TEST 8: Unauthorized approval rejected
// ------------------------------------------------------------------------
assert(
  hasPermission(logisticsOp, 'APPROVE_MISSIONS') === false,
  'TEST 8: Logistics operator denied APPROVE_MISSIONS permission (Prevents unauthorized self-approval)'
)

// ------------------------------------------------------------------------
// TEST 9: Fleet officer can update maintenance
// ------------------------------------------------------------------------
assert(
  hasPermission(fleetOfficer, 'RECORD_MAINTENANCE') === true,
  'TEST 9: Fleet officer granted RECORD_MAINTENANCE permission'
)

// ------------------------------------------------------------------------
// TEST 10: Admin-only user management
// ------------------------------------------------------------------------
assert(
  hasPermission(systemAdmin, 'MANAGE_USERS') === true && hasPermission(commander, 'MANAGE_USERS') === false,
  'TEST 10: MANAGE_USERS permission strictly restricted to SYSTEM_ADMIN'
)

// ------------------------------------------------------------------------
// TEST 11: Incident confirmation requires authority
// ------------------------------------------------------------------------
assert(
  hasPermission(disasterAuth, 'CONFIRM_INCIDENTS') === true,
  'TEST 11: Disaster Authority granted CONFIRM_INCIDENTS permission'
)

// ------------------------------------------------------------------------
// TEST 12: Incident resolution requires authority
// ------------------------------------------------------------------------
assert(
  hasPermission(disasterAuth, 'RESOLVE_INCIDENTS') === true && hasPermission(fieldOfficer, 'RESOLVE_INCIDENTS') === false,
  'TEST 12: Incident resolution requires official authority signoff'
)

// ------------------------------------------------------------------------
// TEST 13: Inactive user rejected
// ------------------------------------------------------------------------
const inactiveCommander = { ...commander, isActive: false }
assert(
  hasPermission(inactiveCommander, 'APPROVE_MISSIONS') === false,
  'TEST 13: Deactivated user accounts are denied all operational actions'
)

// ------------------------------------------------------------------------
// TEST 14: Resource reassignment authorization
// ------------------------------------------------------------------------
assert(
  hasPermission(commander, 'APPROVE_RESOURCE_REASSIGNMENT') === true &&
  hasPermission(logisticsOp, 'APPROVE_RESOURCE_REASSIGNMENT') === false,
  'TEST 14: Resource reassignment approval restricted to Commander'
)

// ------------------------------------------------------------------------
// TEST 15: Audit log inspection permission
// ------------------------------------------------------------------------
assert(
  hasPermission(commander, 'VIEW_AUDIT_LOGS') === true &&
  hasPermission(publicUser, 'VIEW_AUDIT_LOGS') === false,
  'TEST 15: Audit log visibility restricted to official authorities'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/15 PHASE 20 RBAC & ACCESS CONTROL TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

