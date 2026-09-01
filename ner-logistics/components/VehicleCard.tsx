'use client'

import { CARGO_ICONS } from '@/lib/data'
import { useLanguage } from '@/lib/LanguageContext'
import { VehicleSafetyRecord, evaluateVehicleReadiness } from '@/lib/vehicle-readiness'
import { ShieldCheck, AlertTriangle, XCircle, HelpCircle, Award } from 'lucide-react'

export interface VehicleData {
  id?: string
  vehicle_number: string
  driver_name: string
  cargo_type: string
  origin: string
  destination: string
  status: string
  last_ping?: string
  speed_kmh?: number
  capacity_kg?: number
  loaded_kg?: number
  payload_summary?: string
  current_lat?: number
  current_lng?: number
  safetyRecord?: Partial<VehicleSafetyRecord>
}

export type VehicleCardProps = VehicleData

const statusStyles: Record<string, string> = {
  moving: 'bg-blue-50 text-blue-900 border-blue-300',
  stopped: 'bg-red-50 text-red-900 border-red-300',
  halted: 'bg-red-50 text-red-900 border-red-300',
  delayed: 'bg-amber-50 text-amber-900 border-amber-300',
  delivered: 'bg-emerald-50 text-emerald-900 border-emerald-300',
  failed: 'bg-red-50 text-red-900 border-red-400',
  out_of_service: 'bg-slate-100 text-slate-700 border-slate-300',
}

const statusDot: Record<string, string> = {
  moving: 'bg-blue-600',
  stopped: 'bg-red-600',
  halted: 'bg-red-600',
  delayed: 'bg-amber-600',
  delivered: 'bg-emerald-600',
  failed: 'bg-red-600 animate-ping',
  out_of_service: 'bg-slate-500',
}

export default function VehicleCard(props: VehicleCardProps) {
  const { t } = useLanguage()
  const { vehicle_number, driver_name, cargo_type, origin, destination, status, last_ping, speed_kmh, capacity_kg, loaded_kg, payload_summary, safetyRecord } = props
  const currentStatus = status?.toLowerCase() || 'moving'
  const utilization = capacity_kg && loaded_kg ? Math.round((loaded_kg / capacity_kg) * 100) : 85

  // Deterministic Vehicle Readiness Evaluation (Physical Safety Gate)
  const readiness = evaluateVehicleReadiness({
    vehicleId: vehicle_number,
    vehicle_number,
    status: currentStatus,
    ...(safetyRecord || {}),
  })

  const isAdminCertified = Boolean(
    safetyRecord?.operationalStatus?.includes('ADMIN') ||
    payload_summary?.includes('Admin')
  )

  return (
    <div className="gov-card p-4 sm:p-5 hover:border-[#fb792b] transition-all shadow-xs space-y-3.5">
      {/* Header & Carrier */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-black text-[#213d77] text-base tracking-tight">{vehicle_number}</p>
            {isAdminCertified && (
              <span className="text-[10px] font-mono bg-emerald-100 border border-emerald-400 text-emerald-900 px-2 py-0.5 rounded font-black flex items-center gap-1 shadow-xs animate-in fade-in duration-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                ADMIN CERTIFIED
              </span>
            )}
            <span className="text-xs font-mono bg-slate-100 border border-slate-300 text-slate-600 px-2 py-0.5 rounded font-bold">
              {t('data_demonstration')}
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-600 font-semibold mt-0.5">{t('pilot_driver')}: {driver_name}</p>
        </div>

        {/* Operational Status Badge */}
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded border uppercase font-mono ${statusStyles[currentStatus] || statusStyles.moving}`}>
          <span className={`w-2 h-2 rounded-full ${statusDot[currentStatus] || statusDot.moving}`} />
          {currentStatus === 'moving' ? t('moving_on_time') : currentStatus.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Safety Gate Status Banner */}
      <div className="pt-0.5">
        <div className={`p-2.5 rounded border flex items-center justify-between text-xs sm:text-sm ${
          readiness.status === 'READY'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : readiness.status === 'READY_WITH_WARNING'
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : readiness.status === 'NOT_READY'
            ? 'bg-red-50 border-red-200 text-red-900'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}>
          <div className="flex items-center gap-2">
            {readiness.status === 'READY' && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
            {readiness.status === 'READY_WITH_WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
            {readiness.status === 'NOT_READY' && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
            {readiness.status === 'DATA_INSUFFICIENT' && <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />}
            <span className="font-bold text-xs">
              {t('deployment_safety')}: {
                readiness.status === 'READY' ? t('safety_ready') :
                readiness.status === 'READY_WITH_WARNING' ? t('safety_ready_warning') :
                readiness.status === 'NOT_READY' ? t('safety_not_safe') :
                t('safety_incomplete')
              }
            </span>
          </div>
          <span className="text-xs font-mono font-bold">
            {readiness.isEligibleForEmergencyDeployment ? t('safety_ready') : t('safety_not_safe')}
          </span>
        </div>
      </div>

      {/* Corridor Route */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-xs sm:text-sm flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 block">{t('origin_hub_label')}</span>
          <strong className="text-slate-800 font-bold">{origin}</strong>
        </div>
        <span className="text-[#fb792b] font-black text-sm">→</span>
        <div className="text-right">
          <span className="text-xs uppercase font-bold text-slate-400 block">{t('crisis_destination_label')}</span>
          <strong className="text-slate-800 font-bold">{destination}</strong>
        </div>
      </div>

      {/* Cargo & Telemetry Footer */}
      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 text-slate-600">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          <span>{CARGO_ICONS[cargo_type as keyof typeof CARGO_ICONS] || '📦'}</span>
          <span className="capitalize">{cargo_type}</span>
        </span>
        <span className="font-mono text-xs font-bold text-[#213d77]">
          {speed_kmh !== undefined ? `${speed_kmh} km/h` : '42 km/h'} • {utilization}% Load
        </span>
      </div>
    </div>
  )
}
