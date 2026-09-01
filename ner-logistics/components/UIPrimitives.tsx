// components/UIPrimitives.tsx
// ========================================================================
//    NERA PHASE 27: GOVERNMENT PORTAL UI PRIMITIVES (IRCTC THEME)
// ========================================================================

import React from 'react'
import {
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Info,
  RefreshCw,
  Activity,
  type LucideIcon,
} from 'lucide-react'

// ── 1. Standardized Operational Status Badge ──

export type OperationalStatusType =
  | 'OPEN'
  | 'PREDICTED'
  | 'REPORTED'
  | 'CONFIRMED'
  | 'RESOLVED'
  | 'READY'
  | 'READY_WITH_WARNING'
  | 'NOT_READY'
  | 'DATA_INSUFFICIENT'
  | 'IN_TRANSIT'
  | 'REROUTING'
  | 'INTERRUPTED'
  | 'COMPLETED'
  | 'APPROVED'
  | 'PENDING_APPROVAL'
  | 'LAST_MILE_REQUIRED'
  | 'LOW'
  | 'MODERATE'
  | 'ELEVATED'
  | 'HIGH'
  | 'CRITICAL'

export interface StatusBadgeProps {
  status: OperationalStatusType | string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export function StatusBadge({ status, label, size = 'sm', showIcon = true }: StatusBadgeProps) {
  const normStatus = (status || '').toUpperCase().replace(/\s+/g, '_')
  const displayLabel = label || normStatus.replace(/_/g, ' ')

  let bgClass = 'bg-slate-100 text-slate-700 border-slate-300'
  let IconComponent: LucideIcon = Info

  switch (normStatus) {
    case 'OPEN':
    case 'READY':
    case 'COMPLETED':
    case 'RESOLVED':
    case 'LOW':
      bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-300'
      IconComponent = CheckCircle
      break
    case 'PREDICTED':
    case 'READY_WITH_WARNING':
    case 'MODERATE':
    case 'ELEVATED':
    case 'PENDING_APPROVAL':
      bgClass = 'bg-amber-50 text-amber-900 border-amber-300'
      IconComponent = AlertTriangle
      break
    case 'REPORTED':
    case 'REROUTING':
    case 'LAST_MILE_REQUIRED':
      bgClass = 'bg-orange-50 text-orange-900 border-orange-300'
      IconComponent = Clock
      break
    case 'CONFIRMED':
    case 'NOT_READY':
    case 'INTERRUPTED':
    case 'HIGH':
    case 'CRITICAL':
      bgClass = 'bg-red-50 text-red-900 border-red-300'
      IconComponent = AlertOctagon
      break
    case 'IN_TRANSIT':
    case 'APPROVED':
      bgClass = 'bg-blue-50 text-blue-900 border-blue-300'
      IconComponent = Activity
      break
    case 'DATA_INSUFFICIENT':
    default:
      bgClass = 'bg-slate-100 text-slate-700 border-slate-300'
      IconComponent = Info
      break
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono border uppercase tracking-wide ${bgClass} ${sizeClasses}`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />}
      <span>{displayLabel}</span>
    </span>
  )
}

// ── 2. Operational Alert Banner ──

export interface OperationalAlertBannerProps {
  level: 'CRITICAL' | 'WARNING' | 'INFO'
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function OperationalAlertBanner({
  level,
  title,
  message,
  actionLabel,
  onAction,
}: OperationalAlertBannerProps) {
  let containerStyle = 'bg-blue-50 border-blue-300 text-blue-950'
  let Icon = Info

  if (level === 'CRITICAL') {
    containerStyle = 'bg-red-50 border-red-300 text-red-950'
    Icon = AlertOctagon
  } else if (level === 'WARNING') {
    containerStyle = 'bg-amber-50 border-amber-300 text-amber-950'
    Icon = AlertTriangle
  }

  return (
    <div className={`p-3.5 rounded border ${containerStyle} flex items-start gap-3 shadow-xs`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5 text-current" />
      <div className="flex-1">
        <strong className="text-xs font-bold uppercase tracking-wider block">{title}</strong>
        <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{message}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-irctc-primary text-xs px-3 py-1 font-bold shrink-0 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// ── 3. Government KPI Ribbon Tile ──

export interface KPICardProps {
  label: string
  value: string | number
  sublabel?: string
  status?: 'NORMAL' | 'WARNING' | 'CRITICAL'
  icon?: LucideIcon
}

export function KPICard({ label, value, sublabel, status = 'NORMAL', icon: Icon = Activity }: KPICardProps) {
  let valueColor = 'text-[#213d77]'
  let borderColor = 'border-slate-200'

  if (status === 'CRITICAL') {
    valueColor = 'text-red-700'
    borderColor = 'border-red-200 bg-red-50/40'
  } else if (status === 'WARNING') {
    valueColor = 'text-amber-700'
    borderColor = 'border-amber-200 bg-amber-50/40'
  }

  return (
    <div className={`gov-card p-3.5 border ${borderColor} flex items-center justify-between`}>
      <div>
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">{label}</span>
        <span className={`text-2xl font-black ${valueColor} font-mono block mt-0.5`}>{value}</span>
        {sublabel && <span className="text-[10px] text-slate-500 block mt-0.5">{sublabel}</span>}
      </div>
      <div className="p-2.5 rounded bg-slate-100 text-[#213d77]">
        <Icon className="w-5 h-5 text-current" />
      </div>
    </div>
  )
}

// ── 4. Government Tabular Frame ──

export interface TableFrameProps {
  title: string
  subtitle?: string
  actionButton?: React.ReactNode
  children: React.ReactNode
}

export function TableFrame({ title, subtitle, actionButton, children }: TableFrameProps) {
  return (
    <div className="gov-card overflow-hidden">
      <div className="gov-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wide">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actionButton && <div>{actionButton}</div>}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}

// ── 5. Operational Attention Card ──

export interface AttentionCardProps {
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'
  issue: string
  location: string
  affectedMission?: string
  recommendedAction: string
  authorityRequired: string
  dataStatus?: string
  onTakeAction?: () => void
}

export function AttentionCard({
  priority,
  issue,
  location,
  affectedMission,
  recommendedAction,
  authorityRequired,
  dataStatus,
  onTakeAction,
}: AttentionCardProps) {
  const isP0 = priority === 'P0'

  return (
    <div
      className={`p-3.5 rounded border bg-white ${
        isP0 ? 'border-red-300 border-l-4 border-l-red-600' : 'border-slate-200 border-l-4 border-l-[#213d77]'
      } space-y-2`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
              isP0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {priority}
          </span>
          <strong className="text-xs font-bold text-slate-800">{issue}</strong>
        </div>
        {dataStatus && (
          <span className="text-[9.5px] font-mono font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {dataStatus}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
        <div>
          <span className="text-[9.5px] font-bold uppercase text-slate-400 block">Location</span>
          <span className="font-semibold text-slate-700">{location}</span>
        </div>
        {affectedMission && (
          <div>
            <span className="text-[9.5px] font-bold uppercase text-slate-400 block">Mission</span>
            <span className="font-mono text-slate-700">{affectedMission}</span>
          </div>
        )}
        <div>
          <span className="text-[9.5px] font-bold uppercase text-slate-400 block">Authority Required</span>
          <span className="font-bold text-[#213d77]">{authorityRequired}</span>
        </div>
        <div className="sm:col-span-2 md:col-span-1">
          <span className="text-[9.5px] font-bold uppercase text-slate-400 block">System Action</span>
          <span className="text-slate-700">{recommendedAction}</span>
        </div>
      </div>

      {onTakeAction && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onTakeAction}
            className="btn-irctc-primary text-xs px-3 py-1 font-bold cursor-pointer"
          >
            EXECUTE ACTION
          </button>
        </div>
      )}
    </div>
  )
}

import { useLanguage } from '@/lib/LanguageContext'

export interface JudgeExplanationCardProps {
  stepNumber: number
  stepTitle: string
  whatIsHappening: string
  whyItMatters: string
  currentStatus: string
  authorityRequired?: string
}

export function JudgeExplanationCard({
  stepNumber,
  stepTitle,
  whatIsHappening,
  whyItMatters,
  currentStatus,
}: JudgeExplanationCardProps) {
  const { t } = useLanguage()

  return (
    <div className="gov-card p-4 sm:p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold bg-[#213d77] text-white px-2 py-0.5 rounded">
            STAGE {stepNumber}
          </span>
          <h3 className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wide">{stepTitle}</h3>
        </div>
        <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
          {currentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1">
          <span className="text-[9.5px] uppercase font-bold text-slate-500 block">1. {t('sih_what_happening')}</span>
          <p className="text-slate-800 font-semibold leading-relaxed">{whatIsHappening}</p>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded p-2.5 space-y-1">
          <span className="text-[9.5px] uppercase font-bold text-amber-800 block">2. {t('sih_why_it_matters')}</span>
          <p className="text-slate-800 leading-relaxed">{whyItMatters}</p>
        </div>
      </div>
    </div>
  )
}
