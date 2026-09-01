'use client'

import { useState, useMemo } from 'react'
import {
  ShieldCheck,
  Search,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import {
  AuditEvent,
  AuditEntityType,
  getAuditEvents,
} from '@/lib/audit-log'
import { UserRole } from '@/lib/access-control'
import { useLanguage } from '@/lib/LanguageContext'

export default function AuditLogPage() {
  const { t } = useLanguage()
  const [events] = useState<AuditEvent[]>(getAuditEvents)
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchRole = roleFilter === 'ALL' || e.actorRole === roleFilter
      const matchEntity = entityFilter === 'ALL' || e.entityType === entityFilter
      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        e.action.toLowerCase().includes(q) ||
        e.entityId.toLowerCase().includes(q) ||
        e.actorName.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q)

      return matchRole && matchEntity && matchQuery
    })
  }, [events, roleFilter, entityFilter, searchQuery])

  return (
    <div className="space-y-5 text-slate-800 font-sans">
      {/* ── 1. STATUTORY OFFICIAL HEADER ── */}
      <div className="gov-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-blue-100 border border-blue-300 text-[#213d77] font-mono font-bold px-2 py-0.5 rounded">
              {t('portal_title')}
            </span>
            <span className="text-[10px] bg-red-100 border border-red-300 text-red-900 font-mono font-bold px-2 py-0.5 rounded">
              ZERO-DELETION POLICY
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#213d77] flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            {t('nav_audit_signoffs')}
          </h1>
          <p className="text-xs text-slate-500">
            Immutable statutory event ledger recording mission approvals, incident verifications & authority sign-offs
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-right">
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">{t('total_events')}</span>
          <strong className="text-lg text-[#213d77] font-mono font-black">{events.length} Events</strong>
          <span className="text-[9.5px] text-emerald-700 font-semibold block">Zero-Deletion Certified</span>
        </div>
      </div>

      {/* ── 2. SEARCH & FILTER CONTROLS ── */}
      <div className="gov-card p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by Actor Name, Action, Entity ID, or Justification..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded pl-10 pr-4 py-2.5 min-h-[44px] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#fb792b]"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs sm:text-sm text-slate-600 font-bold shrink-0">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as UserRole | 'ALL')}
              className="bg-slate-50 border border-slate-300 rounded px-3 py-2 min-h-[44px] text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#fb792b] cursor-pointer"
            >
              <option value="ALL">All Roles</option>
              <option value="COMMANDER">Commander</option>
              <option value="DISASTER_AUTHORITY">Disaster Authority</option>
              <option value="DISTRICT_AUTHORITY">District Authority</option>
              <option value="LOGISTICS_OPERATOR">Logistics Operator</option>
              <option value="FLEET_OFFICER">Fleet Officer</option>
              <option value="FIELD_OFFICER">Field Officer</option>
              <option value="SYSTEM_ADMIN">System Admin</option>
            </select>

            <span className="text-xs sm:text-sm text-slate-600 font-bold shrink-0 ml-1">Entity:</span>
            <select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value as AuditEntityType | 'ALL')}
              className="bg-slate-50 border border-slate-300 rounded px-3 py-2 min-h-[44px] text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#fb792b] cursor-pointer"
            >
              <option value="ALL">All Entities</option>
              <option value="MISSION">Missions</option>
              <option value="INCIDENT">Incidents</option>
              <option value="VEHICLE">Vehicles</option>
              <option value="RESOURCE">Resources</option>
              <option value="USER">Users</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. AUDIT TIMELINE TABLE ── */}
      <div className="gov-card overflow-hidden bg-white dark:bg-slate-900/60 dark:border-slate-800/80 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#f8fafc] dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs text-[#213d77] dark:text-blue-400 uppercase font-mono font-bold tracking-wider">
              <tr>
                <th className="p-4">Timestamp & Event ID</th>
                <th className="p-4">Authorized Actor & Role</th>
                <th className="p-4">Action Executed</th>
                <th className="p-4">Entity Reference</th>
                <th className="p-4">State Transition</th>
                <th className="p-4">Official Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No audit records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr key={event.eventId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 align-top">
                      <span className="font-mono text-xs font-bold text-[#213d77] dark:text-blue-400 block" suppressHydrationWarning>
                        {new Date(event.timestamp).toLocaleTimeString('en-IN', { hour12: false })}
                      </span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 block" suppressHydrationWarning>
                        {new Date(event.timestamp).toLocaleDateString('en-IN')}
                      </span>
                      <span className="font-mono text-xs text-slate-400 dark:text-slate-500 block mt-0.5">{event.eventId}</span>
                    </td>
                    <td className="p-4 align-top">
                      <strong className="text-slate-900 dark:text-white block">{event.actorName}</strong>
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block mt-0.5 font-bold">
                        {event.actorRole}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <span className="font-bold text-slate-900 dark:text-white block font-mono text-xs sm:text-sm">
                        {event.action}
                      </span>
                    </td>
                    <td className="p-4 align-top font-mono text-xs">
                      <span className="font-bold text-[#213d77] dark:text-blue-300 block">{event.entityType}</span>
                      <span className="text-slate-600 dark:text-slate-400 block">{event.entityId}</span>
                    </td>
                    <td className="p-4 align-top">
                      {event.previousState || event.newState ? (
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {event.previousState || 'INIT'}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#fb792b]" />
                          <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                            {event.newState || 'END'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">—</span>
                      )}
                    </td>
                    <td className="p-4 align-top text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-xs leading-relaxed">
                      {event.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
