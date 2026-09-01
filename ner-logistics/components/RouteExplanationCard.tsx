'use client'

import React from 'react'
import { RouteChangeDetails } from '@/lib/incident-route-impact'
import { AlertTriangle, ArrowRight, ShieldCheck, Clock, Navigation, X } from 'lucide-react'

import { useLanguage } from '@/lib/LanguageContext'

interface RouteExplanationCardProps {
  changeDetails: RouteChangeDetails | null
  onDismiss?: () => void
}

export function RouteExplanationCard({ changeDetails, onDismiss }: RouteExplanationCardProps) {
  const { t } = useLanguage()
  if (!changeDetails) return null

  const isDelayPositive = changeDetails.deltaMinutes > 0
  const isDistPositive = changeDetails.deltaDistanceKm > 0

  return (
    <div className="gov-card p-3.5 border-amber-300 bg-amber-50/30 shadow-md space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#fb792b] animate-ping" />
          <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#fb792b]" />
            {t('alternate_route')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">{changeDetails.timestamp}</span>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title="Dismiss explanation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Disruption Reason */}
      <div className="bg-red-50 border border-red-200 rounded p-2 text-xs">
        <p className="text-[10px] uppercase font-bold text-red-800 tracking-wider">{t('confirmed_road_blockage')}</p>
        <p className="text-slate-800 font-semibold text-[11px] mt-0.5">{changeDetails.reason}</p>
      </div>

      {/* Corridor Shift */}
      <div className="grid grid-cols-1 gap-1.5 text-xs">
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded p-2">
          <div className="space-y-0.5 max-w-[45%]">
            <p className="text-[9.5px] uppercase font-bold text-slate-400">{t('primary_route')}</p>
            <p className="text-slate-600 font-medium truncate text-[11px]">{changeDetails.previousRoute}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-[#fb792b] shrink-0 mx-1" />
          <div className="space-y-0.5 max-w-[45%] text-right">
            <p className="text-[9.5px] uppercase font-bold text-emerald-700">{t('alternate_route')}</p>
            <p className="text-emerald-800 font-bold truncate text-[11px]">{changeDetails.newRoute}</p>
          </div>
        </div>
      </div>

      {/* Numerical Deltas */}
      <div className="grid grid-cols-2 gap-2 text-center text-xs">
        <div className="bg-white border border-slate-200 rounded p-2">
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">{t('total_distance')}</span>
          <span className="font-mono font-bold text-slate-800 text-xs">
            {isDistPositive ? `+${changeDetails.deltaDistanceKm}` : changeDetails.deltaDistanceKm} km
          </span>
          <span className="text-[9.5px] text-slate-400 block font-mono">({changeDetails.newDistanceKm} km total)</span>
        </div>

        <div className="bg-white border border-slate-200 rounded p-2">
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">{t('arrival_time')}</span>
          <span className="font-mono font-bold text-[#fb792b] text-xs">
            {isDelayPositive ? `+${changeDetails.deltaMinutes}` : changeDetails.deltaMinutes} min
          </span>
          <span className="text-[9.5px] text-slate-400 block font-mono">({changeDetails.newDurationHours.toFixed(1)}h total)</span>
        </div>
      </div>

      {/* Safety Gate Verification */}
      <div className="flex items-center justify-between text-[10.5px] bg-emerald-50 border border-emerald-200 text-emerald-900 px-2.5 py-1.5 rounded">
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{changeDetails.bridgeSafetyLabel || t('bridge_check')}</span>
        </div>
        <span className="font-mono text-[10px] text-emerald-800 font-bold">PASSED</span>
      </div>
    </div>
  )
}
