'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type Role = 'APEX_ADMIN' | 'POLICE_OFFICER' | 'CITIZEN_USER' | 'FIELD_COMMANDER' | 'CITIZEN_DRIVER' | null
export type UserRole = Role

export interface RoleConfig {
  id: string
  label: string
  shortBadge: string
  icon: string
  color: string
  description: string
  portalHomeUrl: string
  canAuthorizeMissions: boolean
  canAssignVehicles: boolean
  canOverrideSafetyGate: boolean
  canApproveReroutes: boolean
  canBroadcastCorridorAlerts: boolean
  canFileStatutoryHazards: boolean
  canAccessSystemFeeds: boolean
  hazardPriorityWeight: number
}

export const USER_ROLES: Record<string, RoleConfig> = {
  APEX_ADMIN: {
    id: 'APEX_ADMIN',
    label: 'Admin (Command Center)',
    shortBadge: 'Admin',
    icon: '🛡️',
    color: 'bg-emerald-950 border-emerald-700 text-emerald-300',
    description: 'Full statutory access: Command Center, Dispatch Authorization, Fleet Calibration, Audit Logs & System Control.',
    portalHomeUrl: '/dashboard',
    canAuthorizeMissions: true,
    canAssignVehicles: true,
    canOverrideSafetyGate: true,
    canApproveReroutes: true,
    canBroadcastCorridorAlerts: true,
    canFileStatutoryHazards: true,
    canAccessSystemFeeds: true,
    hazardPriorityWeight: 10.0,
  },
  POLICE_OFFICER: {
    id: 'POLICE_OFFICER',
    label: 'Police & Highway Patrol (Traffic OC / BRO)',
    shortBadge: 'Police & Patrol',
    icon: '👮',
    color: 'bg-blue-950 border-blue-700 text-blue-300',
    description: 'Tactical field access: Live Map, Sector Convoy Escort, VHF Clearance, and Statutory Hazard Directives (Weight 9.5).',
    portalHomeUrl: '/portal/police',
    canAuthorizeMissions: false,
    canAssignVehicles: false,
    canOverrideSafetyGate: false,
    canApproveReroutes: false,
    canBroadcastCorridorAlerts: true,
    canFileStatutoryHazards: true,
    canAccessSystemFeeds: false,
    hazardPriorityWeight: 9.5,
  },
  FIELD_COMMANDER: {
    id: 'FIELD_COMMANDER',
    label: 'Police & Highway Patrol (Traffic OC / BRO)',
    shortBadge: 'Police & Patrol',
    icon: '👮',
    color: 'bg-blue-950 border-blue-700 text-blue-300',
    description: 'Tactical field access: Live Map, Sector Convoy Escort, VHF Clearance, and Statutory Hazard Directives (Weight 9.5).',
    portalHomeUrl: '/portal/police',
    canAuthorizeMissions: false,
    canAssignVehicles: false,
    canOverrideSafetyGate: false,
    canApproveReroutes: false,
    canBroadcastCorridorAlerts: true,
    canFileStatutoryHazards: true,
    canAccessSystemFeeds: false,
    hazardPriorityWeight: 9.5,
  },
  CITIZEN_USER: {
    id: 'CITIZEN_USER',
    label: 'Citizen & Relief Beneficiary (Public / VDP)',
    shortBadge: 'Citizen Beneficiary',
    icon: '👤',
    color: 'bg-amber-950 border-amber-700 text-amber-300',
    description: 'Public accessibility view: Essential Supplies Arrival Tracker, Public Safe Routes, and Crowd-Sourced Hazard Reports (Weight 7.0).',
    portalHomeUrl: '/portal/citizen',
    canAuthorizeMissions: false,
    canAssignVehicles: false,
    canOverrideSafetyGate: false,
    canApproveReroutes: false,
    canBroadcastCorridorAlerts: false,
    canFileStatutoryHazards: false,
    canAccessSystemFeeds: false,
    hazardPriorityWeight: 7.0,
  },
  CITIZEN_DRIVER: {
    id: 'CITIZEN_DRIVER',
    label: 'Citizen & Relief Beneficiary (Public / VDP)',
    shortBadge: 'Citizen Beneficiary',
    icon: '👤',
    color: 'bg-amber-950 border-amber-700 text-amber-300',
    description: 'Public accessibility view: Essential Supplies Arrival Tracker, Public Safe Routes, and Crowd-Sourced Hazard Reports (Weight 7.0).',
    portalHomeUrl: '/portal/citizen',
    canAuthorizeMissions: false,
    canAssignVehicles: false,
    canOverrideSafetyGate: false,
    canApproveReroutes: false,
    canBroadcastCorridorAlerts: false,
    canFileStatutoryHazards: false,
    canAccessSystemFeeds: false,
    hazardPriorityWeight: 7.0,
  },
}

interface RoleContextType {
  role: Role
  currentRole: Role
  roleConfig: RoleConfig | null
  isAuthenticated: boolean
  isLoaded: boolean
  login: (selectedRole: Role) => void
  logout: () => void
  setRole: (selectedRole: Role) => void
  isApexAdmin: boolean
  isPolice: boolean
  isCitizen: boolean
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  currentRole: null,
  roleConfig: null,
  isAuthenticated: false,
  isLoaded: false,
  login: () => {},
  logout: () => {},
  setRole: () => {},
  isApexAdmin: false,
  isPolice: false,
  isCitizen: false,
})

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState<Role>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      // Must be explicitly authenticated in this active browser session
      const isSessionActive = typeof window !== 'undefined' && sessionStorage.getItem('nera_session_authenticated') === 'true'
      const savedCookie = typeof document !== 'undefined'
        ? document.cookie
            .split('; ')
            .find(row => row.startsWith('nera_role='))
            ?.split('=')[1] as Role
        : null

      if (isSessionActive && savedCookie && USER_ROLES[savedCookie]) {
        setRoleState(savedCookie)
      } else {
        // Force unauthenticated default on fresh browser open
        setRoleState(null)
        if (typeof document !== 'undefined') {
          document.cookie = 'nera_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'
          localStorage.removeItem('nera_tactical_role')
        }
      }
    } catch {
      setRoleState(null)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const setRole = (selectedRole: Role) => {
    setRoleState(selectedRole)
    try {
      if (selectedRole) {
        sessionStorage.setItem('nera_session_authenticated', 'true')
        document.cookie = `nera_role=${selectedRole}; path=/; SameSite=Lax`
      } else {
        sessionStorage.removeItem('nera_session_authenticated')
        localStorage.removeItem('nera_tactical_role')
        document.cookie = 'nera_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'
      }
    } catch {
      // ignore
    }
  }

  const login = (selectedRole: Role) => {
    if (!selectedRole) return
    setRole(selectedRole)

    if (selectedRole === 'APEX_ADMIN') router.push('/dashboard')
    else if (selectedRole === 'POLICE_OFFICER' || selectedRole === 'FIELD_COMMANDER') router.push('/portal/police')
    else if (selectedRole === 'CITIZEN_USER' || selectedRole === 'CITIZEN_DRIVER') router.push('/portal/citizen')
  }

  const logout = () => {
    setRoleState(null)
    if (typeof document !== 'undefined') {
      document.cookie = 'nera_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax'
      try {
        sessionStorage.removeItem('nera_session_authenticated')
        localStorage.removeItem('nera_tactical_role')
      } catch {
        // ignore
      }
    }
    router.push('/login')
  }

  const activeConfig = role && USER_ROLES[role] ? USER_ROLES[role] : null

  return (
    <RoleContext.Provider
      value={{
        role,
        currentRole: role,
        roleConfig: activeConfig,
        isAuthenticated: Boolean(role),
        isLoaded,
        login,
        logout,
        setRole,
        isApexAdmin: role === 'APEX_ADMIN',
        isPolice: role === 'POLICE_OFFICER' || role === 'FIELD_COMMANDER',
        isCitizen: role === 'CITIZEN_USER' || role === 'CITIZEN_DRIVER',
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
export const useUserRole = () => useContext(RoleContext)

export const useRequireRole = (allowedRoles?: Role[]) => {
  const { role, isLoaded, isAuthenticated } = useRole()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!role || !isAuthenticated) {
      router.replace('/login')
      return
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const isAllowed = allowedRoles.some(r => r === role)
      if (!isAllowed) {
        if (role === 'APEX_ADMIN') router.replace('/dashboard')
        else if (role === 'POLICE_OFFICER' || role === 'FIELD_COMMANDER') router.replace('/portal/police')
        else router.replace('/portal/citizen')
        return
      }
    }

    setIsAuthorized(true)
  }, [role, isLoaded, isAuthenticated, allowedRoles, router])

  return { isAuthorized, isLoaded }
}
