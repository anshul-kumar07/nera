'use client'

import React from 'react'
import {
  MapPin,
  Clock,
  Shield,
  ArrowRight,
  Package,
} from 'lucide-react'

import { useLanguage } from '@/lib/LanguageContext'

export interface CrisisIntelligenceProps {
  incidentId: string
  title: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'predicted' | 'reported' | 'confirmed' | 'resolved'
  location: string
  coordinates: [number, number]
  source: string
  confirmedBy?: string
  confirmedAt?: string
  affectedCorridor: string
  alternateBypass: string
  additionalDistanceKm: number
  additionalTimeMin: number
  affectedMissions: string[]
  recommendedAction: string
  requiredRole: string
}

export default function CrisisIntelligencePanel({
  incidentId,
  title,
  severity,
  status,
  location,
  coordinates,
  source,
  confirmedBy,
  confirmedAt,
  affectedCorridor,
  alternateBypass,
  additionalDistanceKm,
  additionalTimeMin,
  affectedMissions,
  recommendedAction,
  requiredRole,
}: CrisisIntelligenceProps) {
  const { t } = useLanguage()

  const statusLabel = 
    status === 'confirmed' ? t('confirmed_road_blockage') :
    status === 'reported' ? t('field_report_received') :
    status === 'predicted' ? t('early_warning') :
    t('road_access_restored')

  return (
    <div className="gov-card p-4 sm:p-5 space-y-4 shadow-sm">
      {/* ── 1. Header ── */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase ${
                severity === 'CRITICAL'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : severity === 'HIGH'
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-blue-100 border-blue-300 text-blue-800'
              }`}
            >
              {severity}
            </span>
            <span
              className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase ${
                status === 'confirmed'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : status === 'reported'
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-blue-100 border-blue-300 text-blue-800'
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-[#213d77]">{title}</h3>
          <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#fb792b]" />
            <span>{location} [{coordinates.join(', ')}]</span>
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-300">
          {incidentId}
        </span>
      </div>

      {/* ── 2. Corridor & Reroute Impact ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">{t('route_blocked')}</span>
          <strong className="text-red-700 font-bold block mt-0.5">{affectedCorridor}</strong>
        </div>

        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">{t('alternate_route')}</span>
          <strong className="text-[#213d77] font-bold block mt-0.5">{alternateBypass}</strong>
          <span className="text-[10px] text-slate-500 block font-mono">
            +{additionalDistanceKm} km • +{additionalTimeMin} min ETA penalty
          </span>
        </div>
      </div>

      {/* ── 3. Affected Missions ── */}
      {affectedMissions.length > 0 && (
        <div className="space-y-1.5 text-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">
            Impacted Active Missions ({affectedMissions.length})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {affectedMissions.map((m) => (
              <span key={m} className="font-mono text-[10px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-300">
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Statutory Recommendation & Sign-Off Requirement ── */}
      <div className="p-3 bg-amber-50/50 border border-amber-200 rounded text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-900 uppercase">{t('ai_advisory')}</span>
          <span className="text-[9.5px] font-mono text-slate-500 font-bold">
            Sign-off: {requiredRole}
          </span>
        </div>
        <p className="text-slate-800 text-[11.5px] leading-relaxed font-semibold">
          {recommendedAction}
        </p>
      </div>
    </div>
  )
}
