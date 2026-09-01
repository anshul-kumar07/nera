'use client'

import { useRealtimeIncidents } from '@/hooks/useRealtimeIncidents'
import Link from 'next/link'
import { AlertTriangle, MapPin, Clock, Radio, CheckCircle, ShieldAlert, Check } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { Incident } from '@/lib/supabase'

const severityBadge: Record<string, string> = {
  low: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  medium: 'bg-amber-50 text-amber-800 border-amber-300',
  high: 'bg-red-50 text-red-800 border-red-300',
  critical: 'bg-purple-50 text-purple-800 border-purple-300',
}

const statusBadge: Record<string, { label: string; style: string }> = {
  predicted: { label: 'AI Predicted Risk', style: 'bg-amber-50 text-amber-900 border-amber-300' },
  reported: { label: 'Field Report', style: 'bg-orange-50 text-orange-900 border-orange-300' },
  confirmed: { label: 'Confirmed Disruption', style: 'bg-red-50 text-red-900 border-red-300' },
  resolved: { label: 'Resolved / Cleared', style: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
}

const incidentIcon: Record<string, string> = {
  landslide: '🏔️',
  flood: '🌊',
  road_damage: '🛣️',
  bridge_failure: '🌉',
  congestion: '🚗',
}

export default function IncidentsPage() {
  const { t } = useLanguage()
  const {
    incidents,
    activeIncidents,
    reportedIncidents,
    confirmedIncidents,
    resolvedIncidents,
    connectionStatus,
    lastSync,
    confirmIncident,
    resolveIncident,
  } = useRealtimeIncidents()

  const statusBadge: Record<string, { label: string; style: string }> = {
    predicted: { label: t('early_warning'), style: 'bg-amber-50 text-amber-900 border-amber-300' },
    reported: { label: t('field_report_received'), style: 'bg-orange-50 text-orange-900 border-orange-300' },
    confirmed: { label: t('confirmed_road_blockage'), style: 'bg-red-50 text-red-900 border-red-300' },
    resolved: { label: t('road_access_restored'), style: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  }

  return (
    <div className="space-y-5 text-slate-800 font-sans" suppressHydrationWarning>
      {/* ── Top Header Bar ── */}
      <div className="gov-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#213d77] rounded flex items-center justify-center text-white shrink-0 shadow-xs border border-[#1b3162]">
              <AlertTriangle className="w-5 h-5 text-[#fb792b]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-[#213d77] tracking-tight" suppressHydrationWarning>
                  {t('nav_incidents')}
                </h1>
                <span className="text-xs bg-blue-100 border border-blue-300 text-[#213d77] font-bold px-2.5 py-0.5 rounded font-mono">
                  {t('officer_approval')}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5" suppressHydrationWarning>{t('incidents_desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#213d77] bg-slate-100 border border-slate-300 rounded px-3 py-2 font-bold font-mono min-h-[44px]">
            <Radio className={`w-4 h-4 ${connectionStatus === 'LIVE' ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{connectionStatus === 'LIVE' ? 'REALTIME AIS-140' : connectionStatus}</span>
          </div>
          <Link
            href="/report"
            className="btn-irctc-primary text-xs sm:text-sm px-5 py-2.5 min-h-[44px] flex items-center gap-2 cursor-pointer font-bold shadow-xs"
          >
            {t('report_incident_btn')}
          </Link>
        </div>
      </div>

      {/* ── Operational Lifecycle Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gov-card p-4 sm:p-5 text-center">
          <p className="text-3xl sm:text-4xl font-black text-[#213d77] font-mono">{activeIncidents.length}</p>
          <p className="text-xs text-slate-500 mt-1 uppercase font-bold">{t('total_reports')}</p>
        </div>
        <div className="gov-card p-4 sm:p-5 border-orange-200 bg-orange-50/40 text-center">
          <p className="text-3xl sm:text-4xl font-black text-orange-700 font-mono">{reportedIncidents.length}</p>
          <p className="text-xs text-orange-800 mt-1 uppercase font-bold">{t('field_verification_required')}</p>
        </div>
        <div className="gov-card p-4 sm:p-5 border-red-200 bg-red-50/40 text-center">
          <p className="text-3xl sm:text-4xl font-black text-red-700 font-mono">{confirmedIncidents.length}</p>
          <p className="text-xs text-red-800 mt-1 uppercase font-bold">{t('confirmed_road_blockage')}</p>
        </div>
        <div className="gov-card p-4 sm:p-5 border-emerald-200 bg-emerald-50/40 text-center">
          <p className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono">{resolvedIncidents.length}</p>
          <p className="text-xs text-emerald-800 mt-1 uppercase font-bold">{t('road_access_restored')}</p>
        </div>
      </div>

      {/* Last sync info */}
      <p className="text-xs text-slate-500 text-right" suppressHydrationWarning>
        {t('last_sync')}: {lastSync ? lastSync.toLocaleTimeString('en-IN') : 'Synced'}
      </p>

      {/* Incidents List */}
      {incidents.length === 0 ? (
        <div className="gov-card text-center py-16 p-6">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold text-base">{t('no_incidents')}</p>
          <Link href="/report" className="mt-4 inline-block btn-irctc-primary text-xs sm:text-sm px-5 py-2.5 font-bold min-h-[44px] shadow-xs">
            {t('report_incident_btn')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident: Incident) => {
            const currentStatus = incident.status || 'reported'
            const badgeInfo = statusBadge[currentStatus] || statusBadge.reported

            return (
              <div
                key={incident.id}
                className={`gov-card p-5 transition-all ${
                  currentStatus === 'confirmed'
                    ? 'border-red-300 border-l-4 border-l-red-600 bg-red-50/20'
                    : currentStatus === 'resolved'
                    ? 'border-slate-200 opacity-80'
                    : 'border-slate-200 hover:border-[#fb792b]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className="text-3xl mt-0.5 shrink-0">
                      {incident.type && incidentIcon[incident.type]
                        ? incidentIcon[incident.type]
                        : incident.incident_type && incidentIcon[incident.incident_type]
                        ? incidentIcon[incident.incident_type]
                        : '⚠️'}
                    </span>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <p className="font-bold text-slate-900 capitalize text-sm sm:text-base">
                          {(incident.type || incident.incident_type || 'Incident').replace('_', ' ')}
                        </p>
                        {incident.route_name && (
                          <span className="text-xs bg-slate-100 text-[#213d77] font-bold px-2.5 py-0.5 rounded border border-slate-300 font-mono">
                            {incident.route_name}
                          </span>
                        )}
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider font-mono ${badgeInfo.style}`}>
                          {badgeInfo.label}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{incident.description}</p>

                      {/* Audit Timeline */}
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1 text-slate-600 mt-2 max-w-xl">
                        <div className="flex items-center gap-2 font-bold text-slate-800">
                          <Clock className="w-4 h-4 text-[#213d77]" />
                          <span>{t('nav_audit_signoffs')}:</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          <div>
                            • {t('field_report_received')}: <span className="text-slate-800 font-semibold" suppressHydrationWarning>{incident.reported_at || incident.created_at ? new Date(incident.reported_at || incident.created_at!).toLocaleTimeString('en-IN') : 'Recent'}</span> by <span className="text-slate-800 font-semibold">{incident.reported_by || 'Field Officer'}</span>
                          </div>
                          {incident.confirmed_at && (
                            <div className="text-red-700 font-semibold">
                              • {t('confirmed_road_blockage')}: <span suppressHydrationWarning>{new Date(incident.confirmed_at).toLocaleTimeString('en-IN')}</span> by {incident.confirmed_by || 'Officer'}
                            </div>
                          )}
                          {incident.resolved_at && (
                            <div className="text-emerald-700 font-semibold">
                              • {t('road_access_restored')}: <span suppressHydrationWarning>{new Date(incident.resolved_at).toLocaleTimeString('en-IN')}</span> by {incident.resolved_by || 'Authority'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500">
                        {incident.lat && incident.lng && (
                          <span className="flex items-center gap-1 font-mono">
                            <MapPin className="w-3.5 h-3.5 text-[#fb792b]" />
                            {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Severity */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2.5 shrink-0">
                    <span className={`text-xs font-bold capitalize px-3 py-1 rounded border font-mono ${severityBadge[incident.severity] ?? severityBadge.medium}`}>
                      {incident.severity}
                    </span>

                    {/* Operational Action Controls */}
                    <div className="flex items-center gap-2 pt-1">
                      {currentStatus === 'reported' && (
                        <button
                          onClick={() => confirmIncident(incident.id)}
                          className="btn-irctc-primary text-xs sm:text-sm px-4 py-2.5 min-h-[44px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <ShieldAlert className="w-4 h-4" /> {t('btn_confirm_incident')}
                        </button>
                      )}
                      {currentStatus === 'confirmed' && (
                        <button
                          onClick={() => resolveIncident(incident.id)}
                          className="btn-irctc-navy text-xs sm:text-sm px-4 py-2.5 min-h-[44px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald-400" /> {t('reopen_route')}
                        </button>
                      )}
                      {currentStatus === 'resolved' && (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded">
                          <Check className="w-4 h-4" /> {t('road_access_restored')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
