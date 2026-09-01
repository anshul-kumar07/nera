import React from 'react'
import {
  Truck,
  Shield,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

export interface VehicleSituationProps {
  totalVehicles: number
  inTransitCount: number
  availableCount: number
  failedCount: number
  readySafetyGateCount: number
  warningSafetyGateCount: number
  notReadySafetyGateCount: number
  aiHighRiskCount: number
}

export default function VehicleSituationPanel({
  totalVehicles,
  inTransitCount,
  availableCount,
  failedCount,
  readySafetyGateCount,
  warningSafetyGateCount,
  notReadySafetyGateCount,
  aiHighRiskCount,
}: VehicleSituationProps) {
  const { t } = useLanguage()

  return (
    <div className="gov-card p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#213d77] flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#fb792b]" /> {t('nav_vehicles')} ({totalVehicles} Monitored Carriers)
        </h3>
        <span className="text-[10px] font-mono text-slate-500 font-semibold">
          {t('deployment_safety_check')}
        </span>
      </div>

      {/* ── Operational Status Breakdown ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('mission_in_transit')}</span>
          <p className="text-xl font-mono font-black text-[#213d77]">{inTransitCount}</p>
          <span className="text-[9.5px] text-slate-400">Active convoys</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('safety_ready')}</span>
          <p className="text-xl font-mono font-black text-emerald-700">{availableCount}</p>
          <span className="text-[9.5px] text-slate-400">Ready for mission</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('safety_not_safe')}</span>
          <p className="text-xl font-mono font-black text-red-700">{failedCount}</p>
          <span className="text-[9.5px] text-slate-400">Service required</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">{t('ai_maintenance_advisory')}</span>
          <p className="text-xl font-mono font-black text-amber-700">{aiHighRiskCount}</p>
          <span className="text-[9.5px] text-slate-400">Advisory watchlist</span>
        </div>
      </div>

      {/* ── Physical Safety Gate Breakdown ── */}
      <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2">
        <span className="text-[10.5px] font-bold text-slate-600 uppercase flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#213d77]" />
          {t('deployment_safety')}:
        </span>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded border border-slate-200">
            <span className="text-[9.5px] text-emerald-700 font-bold uppercase block">{t('safety_ready')}</span>
            <strong className="text-sm font-mono font-bold text-slate-800">{readySafetyGateCount}</strong>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <span className="text-[9.5px] text-amber-700 font-bold uppercase block">{t('safety_ready_warning')}</span>
            <strong className="text-sm font-mono font-bold text-slate-800">{warningSafetyGateCount}</strong>
          </div>
          <div className="bg-white p-2 rounded border border-slate-200">
            <span className="text-[9.5px] text-red-700 font-bold uppercase block">{t('safety_not_safe')}</span>
            <strong className="text-sm font-mono font-bold text-slate-800">{notReadySafetyGateCount}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
