import { AlertTriangle, X } from 'lucide-react'

interface AlertBannerProps {
  title?: string
  route_name?: string
  message?: string
  description?: string
  severity?: 'low' | 'medium' | 'high' | 'critical' | string
  district?: string
  reported_by?: string
  onDismiss?: () => void
}

const severityBg: Record<string, string> = {
  low: 'bg-green-900/40 border-green-700 text-green-300',
  medium: 'bg-amber-900/40 border-amber-700 text-amber-300',
  high: 'bg-red-900/40 border-red-700 text-red-300',
  critical: 'bg-purple-900/40 border-purple-700 text-purple-300',
}

export default function AlertBanner(props: AlertBannerProps) {
  const { title, route_name, message, description, severity = 'high', district, reported_by, onDismiss } = props

  const displayTitle = title || route_name || 'Emergency Strategic Corridor Alert'
  const displayMessage = message || description || 'Critical meteorological or geological hazard active in this sector.'
  const displayDistrict = district || reported_by || ''
  const currentSeverity = (severity?.toLowerCase() as 'low' | 'medium' | 'high' | 'critical') || 'high'

  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 shadow-md ${severityBg[currentSeverity] || severityBg.high}`}>
      <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 animate-pulse" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white">{displayTitle}</p>
        <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{displayMessage}</p>
        {displayDistrict && <p className="text-[11px] opacity-75 mt-1 font-medium">📍 {displayDistrict}</p>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
