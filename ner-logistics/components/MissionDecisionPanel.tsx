'use client'

import React from 'react'
import {
  Truck,
  Shield,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

import { useLanguage } from '@/lib/LanguageContext'

export interface MissionDecisionProps {
  missionId: string
  title: string
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW'
  status: 'PLANNED' | 'ROUTE_PROPOSED' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'IN_TRANSIT' | 'INTERRUPTED' | 'ARRIVED_AT_VAP' | 'COMPLETED'
  origin: string
  destination: string
  currentVehicleLocation?: string
  assignedVehicleId: string
  vehicleReadiness: 'READY' | 'READY_WITH_WARNING' | 'NOT_READY' | 'DATA_INSUFFICIENT'
  aiMaintenanceRisk: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL'
  gpsFreshness: 'LIVE' | 'STALE' | 'OFFLINE'
  lastMileStatus: 'DIRECT_VEHICLE_ACCESS' | 'LAST_MILE_REQUIRED'
  vapCoords?: [number, number]
  nonRoadDistanceKm?: number
  lastMileMode?: string
  approvedBy?: string
  approvedAt?: string
  recommendedNextAction: string
}

export default function MissionDecisionPanel({
  missionId,
  title,
  priority,
  status,
  origin,
  destination,
  currentVehicleLocation,
  assignedVehicleId,
  vehicleReadiness,
  aiMaintenanceRisk,
  gpsFreshness,
  lastMileStatus,
  vapCoords,
  nonRoadDistanceKm,
  lastMileMode,
  approvedBy,
  approvedAt,
  recommendedNextAction,
}: MissionDecisionProps) {
  const { t } = useLanguage()

  return (
    <div className="gov-card p-4 sm:p-5 space-y-4 shadow-sm">
      {/* ── 1. Header ── */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase ${
                priority === 'P1_CRITICAL'
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'bg-amber-100 border-amber-300 text-amber-800'
              }`}
            >
              {priority.replace('_', ' ')}
            </span>
            <span className="text-[9px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded">
              {status.replace(/_/g, ' ')}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-[#213d77]">{title}</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {origin} <span className="text-[#fb792b] font-bold">→</span> {destination}
          </p>
        </div>

        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-300">
          {missionId}
        </span>
      </div>

      {/* ── 2. Assigned Fleet & Readiness Gate ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">{t('assigned_vehicle')}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Truck className="w-3.5 h-3.5 text-[#213d77]" />
            <strong className="text-slate-800 font-mono font-bold">{assignedVehicleId}</strong>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
            GPS: {gpsFreshness}
          </span>
        </div>

        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">{t('deployment_safety')}</span>
          <span
            className={`font-mono text-xs font-black inline-block mt-0.5 ${
              vehicleReadiness === 'READY'
                ? 'text-emerald-700'
                : vehicleReadiness === 'READY_WITH_WARNING'
                ? 'text-amber-700'
                : 'text-red-700'
            }`}
          >
            {vehicleReadiness === 'READY' ? t('safety_ready') : vehicleReadiness === 'READY_WITH_WARNING' ? t('safety_ready_warning') : t('safety_not_safe')}
          </span>
        </div>

        <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">{t('ai_maintenance_advisory')}</span>
          <span
            className={`font-mono text-xs font-black inline-block mt-0.5 ${
              aiMaintenanceRisk === 'LOW'
                ? 'text-emerald-700'
                : aiMaintenanceRisk === 'MODERATE'
                ? 'text-blue-700'
                : 'text-amber-700'
            }`}
          >
            {aiMaintenanceRisk} RISK
          </span>
        </div>
      </div>

      {/* ── 3. Last-Mile Reachability Status ── */}
      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#213d77]" />
            {t('final_access_crisis')}
          </span>
          <span
            className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
              lastMileStatus === 'DIRECT_VEHICLE_ACCESS'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}
          >
            {lastMileStatus === 'DIRECT_VEHICLE_ACCESS' ? t('direct_road_access') : t('final_access_required')}
          </span>
        </div>
        {lastMileStatus === 'LAST_MILE_REQUIRED' && vapCoords && (
          <p className="text-slate-700 text-[11px]">
            Vehicle terminates at VAP [{vapCoords.join(', ')}]. {nonRoadDistanceKm} km final gap requires {lastMileMode || 'SDRF Porter / Riverine Team'}.
          </p>
        )}
      </div>

      {/* ── 4. Authority Sign-Off & Recommended Next Step ── */}
      <div className="p-3 bg-blue-50/50 border border-blue-200 rounded text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#213d77] uppercase">{t('officer_approval')}</span>
          <span className="text-[9.5px] font-mono text-slate-500 font-semibold">
            {approvedBy ? `Approved by ${approvedBy}` : t('mission_pending_approval')}
          </span>
        </div>
        <p className="text-slate-800 text-[11.5px] leading-relaxed font-semibold">
          {recommendedNextAction}
        </p>
      </div>
    </div>
  )
}
