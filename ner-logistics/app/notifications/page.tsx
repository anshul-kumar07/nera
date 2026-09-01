'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Check,
  Truck,
  Package,
} from 'lucide-react'
import {
  OperationalAlert,
  AlertSeverity,
  AlertStatus,
  INITIAL_OPERATIONAL_ALERTS,
  acknowledgeAlert,
  escalateAlert,
} from '@/lib/alert-management'
import { CURRENT_DEMO_USER } from '@/lib/access-control'

import { useLanguage } from '@/lib/LanguageContext'

export default function NotificationsPage() {
  const { t } = useLanguage()
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_OPERATIONAL_ALERTS)
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'ALL'>('ALL')

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      const matchSev = severityFilter === 'ALL' || a.severity === severityFilter
      const matchStat = statusFilter === 'ALL' || a.status === statusFilter
      return matchSev && matchStat
    })
  }, [alerts, severityFilter, statusFilter])

  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length
  const unreadCount = alerts.filter(a => a.status === 'GENERATED' || a.status === 'DELIVERED').length

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.alertId === alertId ? acknowledgeAlert(a, CURRENT_DEMO_USER.name) : a
      )
    )
  }

  const handleEscalate = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.alertId === alertId
          ? escalateAlert(a, 'Urgent commander escalation — required response SLA exceeded')
          : a
      )
    )
  }

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* ── 1. OFFICIAL HEADER ── */}
      <div className="gov-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-red-100 border border-red-300 text-red-900 font-mono font-bold px-2.5 py-0.5 rounded">
              {t('portal_title')}
            </span>
            <span className="text-xs bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold px-2.5 py-0.5 rounded">
              {t('data_demonstration')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#213d77] flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-[#fb792b]" />
            {t('nav_alerts')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('active_alerts')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right">
            <span className="text-xs uppercase font-bold text-slate-500 block">{t('officer_approval')}</span>
            <strong className="text-xs sm:text-sm text-[#213d77] font-bold block">{CURRENT_DEMO_USER.name}</strong>
            <span className="text-xs font-mono text-slate-500">{CURRENT_DEMO_USER.role}</span>
          </div>
        </div>
      </div>

      {/* ── 2. ALERT KPI SUMMARY RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gov-card p-4 sm:p-5 border-red-200 bg-red-50/40 space-y-1">
          <span className="text-xs font-bold uppercase text-red-800">{t('critical_active')}</span>
          <p className="text-3xl sm:text-4xl font-black text-red-700 font-mono">{criticalCount}</p>
          <p className="text-xs text-red-700 font-medium">{t('immediate_response_req')}</p>
        </div>
        <div className="gov-card p-4 sm:p-5 border-amber-200 bg-amber-50/40 space-y-1">
          <span className="text-xs font-bold uppercase text-amber-800">{t('pending_acknowledge')}</span>
          <p className="text-3xl sm:text-4xl font-black text-amber-700 font-mono">{unreadCount}</p>
          <p className="text-xs text-amber-700 font-medium">{t('awaiting_officer_signoff')}</p>
        </div>
        <div className="gov-card p-4 sm:p-5 space-y-1">
          <span className="text-xs font-bold uppercase text-slate-500">{t('total_notifications')}</span>
          <p className="text-3xl sm:text-4xl font-black text-[#213d77] font-mono">{alerts.length}</p>
          <p className="text-xs text-slate-500 font-medium">{t('total_lifecycle_dispatches')}</p>
        </div>
        <div className="gov-card p-4 sm:p-5 border-emerald-200 bg-emerald-50/40 space-y-1">
          <span className="text-xs font-bold uppercase text-emerald-800">{t('resolved_alerts')}</span>
          <p className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono">
            {alerts.filter(a => a.status === 'RESOLVED').length}
          </p>
          <p className="text-xs text-emerald-700 font-medium">{t('action_completed')}</p>
        </div>
      </div>

      {/* ── 3. FILTER CONTROLS ── */}
      <div className="gov-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-slate-600 font-bold flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-500" /> {t('severity_label')}:
          </span>
          {[
            { id: 'ALL', label: t('stat_all') },
            { id: 'CRITICAL', label: t('sev_critical') },
            { id: 'HIGH', label: t('sev_high') },
            { id: 'MEDIUM', label: t('sev_medium') },
            { id: 'LOW', label: t('sev_low') },
          ].map(sev => (
            <button
              key={sev.id}
              onClick={() => setSeverityFilter(sev.id as AlertSeverity | 'ALL')}
              className={`text-xs sm:text-sm font-bold px-3 py-1.5 min-h-[38px] rounded border transition-all cursor-pointer ${
                severityFilter === sev.id
                  ? 'bg-[#213d77] border-[#213d77] text-white shadow-xs'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {sev.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm text-slate-600 font-bold">{t('status_label')}:</span>
          {[
            { id: 'ALL', label: t('stat_all') },
            { id: 'GENERATED', label: t('stat_generated') },
            { id: 'ACKNOWLEDGED', label: t('stat_acknowledged') },
            { id: 'ESCALATED', label: t('stat_escalated') },
            { id: 'RESOLVED', label: t('stat_resolved') },
          ].map(stat => (
            <button
              key={stat.id}
              onClick={() => setStatusFilter(stat.id as AlertStatus | 'ALL')}
              className={`text-xs sm:text-sm font-bold px-3 py-1.5 min-h-[38px] rounded border transition-all cursor-pointer ${
                statusFilter === stat.id
                  ? 'bg-[#fb792b] border-[#fb792b] text-white shadow-xs'
                  : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. NOTIFICATIONS LIST ── */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="gov-card p-12 text-center text-slate-500 space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
            <p className="font-bold text-base text-slate-800">{t('no_active_alerts')}</p>
            <p className="text-xs sm:text-sm text-slate-600">{t('no_incidents')}</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.alertId}
              className={`gov-card p-5 sm:p-6 space-y-4 transition-all ${
                alert.severity === 'CRITICAL'
                  ? 'border-red-300 border-l-4 border-l-red-600 bg-red-50/20'
                  : alert.severity === 'HIGH'
                  ? 'border-amber-300 border-l-4 border-l-amber-500'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-100 border-red-300 text-red-900'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-blue-100 border-blue-300 text-blue-900'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-bold">
                    {alert.type.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">{alert.title}</h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase ${
                      alert.status === 'ACKNOWLEDGED'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : alert.status === 'ESCALATED'
                        ? 'bg-red-100 border-red-300 text-red-900 animate-pulse'
                        : 'bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {alert.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1" suppressHydrationWarning>
                    <Clock className="w-3.5 h-3.5 text-[#213d77]" /> {new Date(alert.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {alert.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded border border-slate-200">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">{t('origin_source')}</span>
                  <span className="text-slate-800 font-bold">{alert.source}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">{t('target_authorities')}</span>
                  <span className="text-[#213d77] font-bold">{alert.targetRoles.join(', ')}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">{t('related_entity')}</span>
                  <span className="font-mono text-slate-800 font-bold">{alert.relatedMissionId || alert.relatedVehicleId || 'GENERAL'}</span>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">{t('acknowledge_status')}</span>
                  <span className="text-slate-800 font-bold">
                    {alert.acknowledgedBy ? t('ack_by', { name: alert.acknowledgedBy }) : t('pending_signoff')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs sm:text-sm flex-wrap gap-2">
                <span className="text-xs text-slate-500 font-mono">ID: {alert.alertId}</span>
                <div className="flex items-center gap-2.5">
                  {alert.status !== 'ACKNOWLEDGED' && alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleAcknowledge(alert.alertId)}
                      className="btn-irctc-primary text-xs sm:text-sm px-4 py-2 min-h-[44px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4" /> {t('btn_acknowledge')}
                    </button>
                  )}
                  {alert.status !== 'ESCALATED' && alert.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleEscalate(alert.alertId)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-xs sm:text-sm px-4 py-2 min-h-[44px] font-bold rounded flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4" /> {t('btn_escalate_ndrf')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
