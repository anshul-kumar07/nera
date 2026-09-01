'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import VehicleCard, { VehicleData } from '@/components/VehicleCard'
import { CARGO_ICONS, DEMO_VEHICLES } from '@/lib/data'
import {
  Truck,
  Radio,
  ShieldCheck,
  Wrench,
  Fuel,
  ClipboardCheck,
  History,
  Plus,
  X,
  Sparkles,
  AlertCircle,
  Check,
  Ban,
  Eye,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { summarizeFleetReadiness, DEMO_VEHICLE_SAFETY_RECORDS, VehicleSafetyRecord } from '@/lib/vehicle-readiness'
import {
  MaintenanceRecord,
  InspectionRecord,
  FuelRecord,
  DEMO_MAINTENANCE_RECORDS,
  DEMO_INSPECTION_RECORDS,
  DEMO_FUEL_RECORDS,
  calculateFleetMaintenanceSummary,
  buildVehicleDigitalProfile,
  generateMaintenanceId,
  MaintenanceType,
} from '@/lib/vehicle-maintenance'
import {
  VehicleHealthAssessment,
  generateVehicleHealthAssessment,
  acknowledgeHealthRecommendation,
  dismissHealthRecommendation,
  generateFleetHealthWatchlist,
} from '@/lib/vehicle-health-ai'

export default function VehiclesPage() {
  const { t } = useLanguage()
  const [vehiclesList, setVehiclesList] = useState<VehicleData[]>(DEMO_VEHICLES)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Maintenance & History State
  const [maintenanceMap, setMaintenanceMap] = useState<Record<string, MaintenanceRecord[]>>(DEMO_MAINTENANCE_RECORDS)
  const [inspectionMap] = useState<Record<string, InspectionRecord[]>>(DEMO_INSPECTION_RECORDS)
  const [fuelMap] = useState<Record<string, FuelRecord[]>>(DEMO_FUEL_RECORDS)

  // Dynamic Safety Gate State (Admin Actionable)
  const [safetyMap, setSafetyMap] = useState<Record<string, VehicleSafetyRecord>>(DEMO_VEHICLE_SAFETY_RECORDS)

  // AI Health Assessment State
  const [healthMap, setHealthMap] = useState<Record<string, VehicleHealthAssessment>>({})

  // Selected vehicle for Digital Profile Modal
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AI_HEALTH' | 'MAINTENANCE' | 'INSPECTIONS' | 'FUEL' | 'TIMELINE'>('OVERVIEW')

  // Form State for logging new records
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [maintType, setMaintType] = useState<MaintenanceType>('ROUTINE_SERVICE')
  const [maintDesc, setMaintDesc] = useState('')
  const [maintProvider, setMaintProvider] = useState('')
  const [maintCost, setMaintCost] = useState('')
  const [maintNextKm, setMaintNextKm] = useState('')
  const [maintNextDate, setMaintNextDate] = useState('')

  // Initial load + real-time subscription
  useEffect(() => {
    async function loadVehicles() {
      try {
        const { data } = await supabase.from('vehicles').select('*').order('last_ping', { ascending: false })
        if (data && data.length > 0) setVehiclesList(data)
      } catch {
        // fallback to demo data
      }
    }
    loadVehicles()

    // Real-time subscription
    const channel = supabase
      .channel('vehicles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        loadVehicles()
        setLastUpdated(new Date())
      })
      .subscribe()

    // Simulate live telemetry ticks every 15s (demo mode)
    const ticker = setInterval(() => {
      setVehiclesList(prev =>
        prev.map(v => ({
          ...v,
          speed_kmh: v.status === 'moving' ? Math.max(20, Math.min(90, (v.speed_kmh || 55) + (Math.random() - 0.5) * 8)) : v.speed_kmh,
          last_ping: 'Just now',
        }))
      )
      setLastUpdated(new Date())
    }, 15000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(ticker)
    }
  }, [])

  const moving = vehiclesList.filter(v => v.status === 'moving').length
  const delayed = vehiclesList.filter(v => v.status === 'delayed').length
  const stopped = vehiclesList.filter(v => v.status === 'stopped' || v.status === 'halted' || v.status === 'failed').length

  // Maintenance & Safety Fleet KPI Summary
  const safetyRecordArray: VehicleSafetyRecord[] = Object.values(safetyMap)
  const mSummary = calculateFleetMaintenanceSummary(safetyRecordArray, maintenanceMap)
  const rSummary = summarizeFleetReadiness(safetyRecordArray)

  // Selected Profile
  const activeProfile = selectedVehicleId
    ? buildVehicleDigitalProfile(
        safetyMap[selectedVehicleId] || {
          vehicleId: selectedVehicleId,
          vehicleModel: 'Heavy All-Terrain Transport',
        },
        {
          maintenanceRecords: maintenanceMap[selectedVehicleId] || [],
          inspectionRecords: inspectionMap[selectedVehicleId] || [],
          fuelRecords: fuelMap[selectedVehicleId] || [],
        }
      )
    : null

  // Lock body scroll when vehicle modal or log modal is active
  useEffect(() => {
    if (Boolean(activeProfile) || isLogModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? 'unset' : originalStyle
      }
    }
  }, [activeProfile, isLogModalOpen])

  // Active Health Assessment
  const activeAssessment = activeProfile
    ? healthMap[activeProfile.vehicleId] || generateVehicleHealthAssessment(activeProfile)
    : null

  // Fleet Watchlist
  const fleetProfiles = Object.keys(safetyMap).map(id =>
    buildVehicleDigitalProfile(safetyMap[id], {
      maintenanceRecords: maintenanceMap[id] || [],
      inspectionRecords: inspectionMap[id] || [],
      fuelRecords: fuelMap[id] || [],
    })
  )
  const fleetAssessments = fleetProfiles.map(p => healthMap[p.vehicleId] || generateVehicleHealthAssessment(p))
  const healthWatchlist = generateFleetHealthWatchlist(fleetAssessments)

  const handleAcknowledge = (vehId: string) => {
    const targetAssessment = activeAssessment || generateVehicleHealthAssessment(
      buildVehicleDigitalProfile(safetyMap[vehId] || { vehicleId: vehId }, {
        maintenanceRecords: maintenanceMap[vehId] || [],
        inspectionRecords: inspectionMap[vehId] || [],
        fuelRecords: fuelMap[vehId] || [],
      })
    )
    const updatedHealth = acknowledgeHealthRecommendation(targetAssessment, 'Duty Officer / Field Command (Admin)')
    setHealthMap(prev => ({ ...prev, [vehId]: updatedHealth }))

    // Clear physical safety flags and set to PASS
    setSafetyMap(prev => {
      const current = prev[vehId] || { vehicleId: vehId }
      return {
        ...prev,
        [vehId]: {
          ...current,
          engineStatus: 'PASS',
          brakeStatus: 'PASS',
          tyreStatus: 'PASS',
          mechanicalStatus: 'PASS',
          emergencyKitStatus: 'PASS',
          commEquipmentStatus: 'PASS',
          serviceComplianceStatus: 'PASS',
          knownIssues: [],
          operationalStatus: 'OPERATIONAL (ADMIN CERTIFIED)',
        },
      }
    })

    // Update vehicle list status
    setVehiclesList(prev =>
      prev.map(v => {
        if (v.vehicle_number === vehId) {
          return {
            ...v,
            status: 'moving',
            speed_kmh: v.speed_kmh && v.speed_kmh > 0 ? v.speed_kmh : 55,
            payload_summary: 'Admin Acknowledged & Cleared for Transit',
          }
        }
        return v
      })
    )
  }

  const handleAdminCertifyVehicle = (vehId: string) => {
    // Force approve physical gate & safety checks
    setSafetyMap(prev => {
      const current = prev[vehId] || { vehicleId: vehId }
      return {
        ...prev,
        [vehId]: {
          ...current,
          engineStatus: 'PASS',
          brakeStatus: 'PASS',
          tyreStatus: 'PASS',
          mechanicalStatus: 'PASS',
          emergencyKitStatus: 'PASS',
          commEquipmentStatus: 'PASS',
          serviceComplianceStatus: 'PASS',
          fuelLevelPct: Math.max(current.fuelLevelPct || 85, 92),
          knownIssues: [],
          operationalStatus: 'CERTIFIED BY ADMIN',
        },
      }
    })

    const targetAssessment = activeAssessment || generateVehicleHealthAssessment(
      buildVehicleDigitalProfile(safetyMap[vehId] || { vehicleId: vehId }, {
        maintenanceRecords: maintenanceMap[vehId] || [],
        inspectionRecords: inspectionMap[vehId] || [],
        fuelRecords: fuelMap[vehId] || [],
      })
    )
    const updatedHealth = acknowledgeHealthRecommendation(targetAssessment, 'State Fleet Administrator (Admin)')
    setHealthMap(prev => ({ ...prev, [vehId]: updatedHealth }))

    setVehiclesList(prev =>
      prev.map(v => {
        if (v.vehicle_number === vehId) {
          return {
            ...v,
            status: 'moving',
            speed_kmh: 58,
            payload_summary: 'Admin Certified for Immediate Dispatch',
          }
        }
        return v
      })
    )
  }

  const handleDismiss = (vehId: string) => {
    if (!activeAssessment) return
    const updated = dismissHealthRecommendation(activeAssessment, 'Duty Officer / Field Command', 'Operational review cleared by command')
    setHealthMap(prev => ({ ...prev, [vehId]: updated }))
  }

  const handleAddMaintenanceRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicleId) return

    const newRecord: MaintenanceRecord = {
      id: generateMaintenanceId(),
      vehicleId: selectedVehicleId,
      maintenanceType: maintType,
      performedAt: new Date().toISOString(),
      serviceProvider: maintProvider || 'Guwahati Fleet Logistics Depot',
      technician: 'ACTOR ID UNAVAILABLE',
      description: maintDesc || 'Routine scheduled maintenance performed.',
      costInr: maintCost ? parseFloat(maintCost) : null,
      nextDueKm: maintNextKm ? parseInt(maintNextKm, 10) : null,
      nextDueDate: maintNextDate || null,
      status: 'COMPLETED',
      notes: 'Logged via NERA Fleet Command.',
      isSimulated: true,
    }

    setMaintenanceMap(prev => ({
      ...prev,
      [selectedVehicleId]: [newRecord, ...(prev[selectedVehicleId] || [])],
    }))

    setIsLogModalOpen(false)
    setMaintDesc('')
    setMaintProvider('')
    setMaintCost('')
    setMaintNextKm('')
    setMaintNextDate('')
  }

  return (
    <div className="space-y-5 text-slate-800 font-sans">
      {/* ── Top Header ── */}
      <div className="gov-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#213d77] rounded flex items-center justify-center text-white shrink-0 shadow-xs border border-[#1b3162]">
              <Truck className="w-5 h-5 text-[#fb792b]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-[#213d77] tracking-tight">{t('nav_vehicles')}</h1>
                <span className="text-[10px] bg-blue-100 border border-blue-300 text-[#213d77] font-bold px-2 py-0.5 rounded font-mono">
                  FLEET REGISTRY & SAFETY GATE
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t('vehicles_desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded px-2.5 py-1 text-xs text-amber-900 font-bold font-mono">
            <Radio className="w-3.5 h-3.5 text-[#fb792b] animate-pulse" />
            <span>{t('data_demonstration')}</span>
          </div>
          <div className="text-[10.5px] text-slate-500 font-medium" suppressHydrationWarning>
            {t('updated')}: {lastUpdated.toLocaleTimeString('en-IN')}
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {[
          { label: t('moving_on_time'), count: moving, border: 'border-emerald-200 bg-emerald-50/40', text: 'text-emerald-700', dot: 'bg-emerald-600' },
          { label: t('weather_delayed'), count: delayed, border: 'border-amber-200 bg-amber-50/40', text: 'text-amber-700', dot: 'bg-amber-600' },
          { label: t('halted_maintenance'), count: stopped, border: 'border-red-200 bg-red-50/40', text: 'text-red-700', dot: 'bg-red-600' },
        ].map(({ label, count, border, text, dot }) => (
          <div key={label} className={`gov-card p-3.5 border shadow-xs ${border}`}>
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider">{label}</p>
              <span className={`w-2 h-2 rounded-full ${dot}`} />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${text}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* AI Vehicle Early Warning & Fleet Watchlist */}
      <div className="gov-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fb792b]" />
              <h2 className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wide">
                AI VEHICLE HEALTH & PREDICTIVE WATCHLIST
              </h2>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Explainable historical risk analysis across repeated failures, overdue servicing, and operational stress.
            </p>
          </div>
          <span className="text-[10px] font-mono bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-bold">
            HUMAN REVIEW REQUIRED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {healthWatchlist.map(item => {
            const riskColor =
              item.overallRisk === 'CRITICAL' || item.overallRisk === 'HIGH'
                ? 'border-red-200 bg-red-50/60 text-red-900'
                : item.overallRisk === 'ELEVATED' || item.overallRisk === 'MODERATE'
                ? 'border-amber-200 bg-amber-50/60 text-amber-900'
                : item.overallRisk === 'DATA_INSUFFICIENT'
                ? 'border-slate-200 bg-slate-50 text-slate-700'
                : 'border-emerald-200 bg-emerald-50/60 text-emerald-900'

            return (
              <div
                key={item.vehicleId}
                onClick={() => { setSelectedVehicleId(item.vehicleId); setActiveTab('AI_HEALTH') }}
                className={`p-3 rounded border ${riskColor} cursor-pointer transition-all hover:border-[#fb792b] flex flex-col justify-between shadow-xs`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 text-xs font-mono font-bold">{item.vehicleId}</strong>
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white/80 border border-current">
                      {item.overallRisk}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {item.detectedPatterns[0] || item.riskFactors[0]?.title || 'No adverse patterns detected'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[9.5px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAcknowledge(item.vehicleId)
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[9px] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <Check className="w-2.5 h-2.5" /> Acknowledge
                  </button>
                  <span className="text-[#213d77] font-bold flex items-center gap-0.5">
                    <Eye className="w-3 h-3" /> Inspect
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fleet Readiness & Emergency Deployment Safety Gate Summary */}
      {(() => {
        return (
          <div className="gov-card p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wide">
                    FLEET READINESS & PHYSICAL DEPLOYMENT SAFETY GATE
                  </h2>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  Deterministic pre-deployment safety evaluation across 8 mechanical & operational parameters.
                </p>
              </div>
              <span className="text-[10px] font-mono bg-blue-100 border border-blue-300 text-[#213d77] px-2 py-0.5 rounded font-bold">
                8-POINT PHYSICAL GATE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/60 border border-emerald-200 rounded p-3 text-center">
                <span className="text-[10.5px] font-bold text-emerald-800 uppercase block">🟢 Verified Ready</span>
                <span className="text-2xl font-black text-emerald-700 font-mono mt-0.5 block">{rSummary.ready}</span>
                <span className="text-[9.5px] text-emerald-600 block mt-0.5">Approved for Dispatch</span>
              </div>
              <div className="bg-amber-50/60 border border-amber-200 rounded p-3 text-center">
                <span className="text-[10.5px] font-bold text-amber-800 uppercase block">🟡 Ready (Warning)</span>
                <span className="text-2xl font-black text-amber-700 font-mono mt-0.5 block">{rSummary.readyWithWarning}</span>
                <span className="text-[9.5px] text-amber-600 block mt-0.5">Advisory Inspection</span>
              </div>
              <div className="bg-red-50/60 border border-red-200 rounded p-3 text-center">
                <span className="text-[10.5px] font-bold text-red-800 uppercase block">🔴 Not Ready</span>
                <span className="text-2xl font-black text-red-700 font-mono mt-0.5 block">{rSummary.notReady}</span>
                <span className="text-[9.5px] text-red-600 block mt-0.5">Critical Safety Block</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-center">
                <span className="text-[10.5px] font-bold text-slate-600 uppercase block">⚪ Data Insufficient</span>
                <span className="text-2xl font-black text-slate-700 font-mono mt-0.5 block">{rSummary.dataInsufficient}</span>
                <span className="text-[9.5px] text-slate-500 block mt-0.5">Records Missing</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Cargo Types */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-lg space-y-3">
        <h2 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{t('cargo_in_transit')}</h2>
        <div className="flex flex-wrap gap-2.5">
          {Object.entries(CARGO_ICONS).map(([type, icon]) => (
            <div key={type} className="flex items-center gap-2 bg-gray-800/80 border border-gray-700/60 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-200">
              <span className="text-base">{icon}</span>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-gray-200 uppercase tracking-wider">
            {t('all_vehicles')} ({vehiclesList.length})
          </h2>
          <span className="text-xs text-gray-400">Click any vehicle to inspect digital lifetime record & service history</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehiclesList.map((v: VehicleData) => (
            <div
              key={v.id || v.vehicle_number}
              onClick={() => setSelectedVehicleId(v.vehicle_number)}
              className="cursor-pointer transition-all hover:scale-[1.01]"
            >
              <VehicleCard
                vehicle_number={v.vehicle_number}
                driver_name={v.driver_name}
                cargo_type={v.cargo_type}
                origin={v.origin}
                destination={v.destination}
                status={v.status}
                last_ping={v.last_ping || 'Just now'}
                speed_kmh={v.speed_kmh}
                capacity_kg={v.capacity_kg}
                loaded_kg={v.loaded_kg}
                payload_summary={v.payload_summary}
                safetyRecord={safetyMap[v.vehicle_number]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Phase 14 & 15: Vehicle Digital Lifetime Record & History Modal ── */}
      {activeProfile && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/40 rounded-xl flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-black text-white">{activeProfile.vehicleId}</h2>
                    <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 rounded">
                      {activeProfile.registrationNumber}
                    </span>
                    <span className="text-xs font-mono bg-amber-950 border border-amber-700 text-amber-300 px-2.5 py-0.5 rounded font-bold">
                      {t('data_demonstration')}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 mt-0.5">{activeProfile.vehicleModel} • {activeProfile.vehicleType}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVehicleId(null)}
                className="text-gray-400 hover:text-white p-2 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-800 bg-gray-950/80 px-5 text-xs sm:text-sm font-bold gap-2 overflow-x-auto">
              {[
                { id: 'OVERVIEW', label: 'Overview & Lifetime KPIs', icon: ClipboardCheck },
                { id: 'AI_HEALTH', label: 'AI Health Intelligence', icon: Sparkles },
                { id: 'MAINTENANCE', label: `Maintenance (${activeProfile.maintenanceHistory.length})`, icon: Wrench },
                { id: 'INSPECTIONS', label: `Inspections (${activeProfile.inspectionHistory.length})`, icon: ShieldCheck },
                { id: 'FUEL', label: `Fuel Logs (${activeProfile.fuelHistory.length})`, icon: Fuel },
                { id: 'TIMELINE', label: `Unified Timeline (${activeProfile.timeline.length})`, icon: History },
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'OVERVIEW' | 'AI_HEALTH' | 'MAINTENANCE' | 'INSPECTIONS' | 'FUEL' | 'TIMELINE')}
                    className={`py-3.5 px-4 min-h-[44px] border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-950/30 font-black'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content Area */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-5">
                  {/* Status Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border ${activeProfile.readiness.statusBadge.bgClass} ${activeProfile.readiness.statusBadge.borderClass}`}>
                      <span className="text-xs text-gray-400 uppercase font-bold block">Physical Safety Readiness Gate</span>
                      <strong className={`text-base font-black ${activeProfile.readiness.statusBadge.textClass} flex items-center gap-2 mt-1`}>
                        {activeProfile.readiness.statusBadge.icon} {activeProfile.readiness.status.replace(/_/g, ' ')}
                      </strong>
                      <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                        {activeProfile.readiness.isEligibleForEmergencyDeployment ? 'Approved for emergency mission dispatch' : 'Blocked from emergency deployment'}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border ${activeProfile.maintenanceDue.badgeColor}`}>
                      <span className="text-xs uppercase font-bold block opacity-80">Preventive Maintenance Status</span>
                      <strong className="text-base font-black flex items-center gap-2 mt-1">
                        <Wrench className="w-4 h-4" /> {activeProfile.maintenanceDue.statusLabel}
                      </strong>
                      <p className="text-xs mt-1.5 opacity-90 leading-relaxed">{activeProfile.maintenanceDue.explanation}</p>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/60">
                      <span className="text-xs text-gray-400 uppercase font-bold block">Operational Status</span>
                      <strong className="text-base font-black text-cyan-300 block mt-1">
                        {activeProfile.currentOperationalStatus}
                      </strong>
                      <p className="text-xs text-gray-400 mt-1.5">Active fleet registry status</p>
                    </div>
                  </div>

                  {/* Lifetime Operating Statistics */}
                  <div className="bg-slate-950/80 border border-gray-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs sm:text-sm font-black uppercase text-gray-300 tracking-wider">
                      Lifetime Operating Metrics & Telemetry Log
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="bg-gray-900 p-3.5 rounded-lg border border-gray-800">
                        <span className="text-xs text-gray-400 uppercase font-bold block">Cumulative Distance</span>
                        <strong className="text-lg font-mono text-blue-400 font-bold block mt-0.5">
                          {activeProfile.totalCalculatedDistanceKm.toLocaleString()} km
                        </strong>
                        <span className="text-xs text-amber-400/90 block mt-1 font-semibold">CALCULATED FROM TELEMETRY</span>
                      </div>
                      <div className="bg-gray-900 p-3.5 rounded-lg border border-gray-800">
                        <span className="text-xs text-gray-400 uppercase font-bold block">Total Fuel Dispensed</span>
                        <strong className="text-lg font-mono text-cyan-400 font-bold block mt-0.5">
                          {activeProfile.totalFuelConsumedLiters} L
                        </strong>
                        <span className="text-xs text-gray-400 block mt-1">TELEMETERED DISPENSE</span>
                      </div>
                      <div className="bg-gray-900 p-3.5 rounded-lg border border-gray-800">
                        <span className="text-xs text-gray-400 uppercase font-bold block">Calculated Efficiency</span>
                        <strong className="text-lg font-mono text-emerald-400 font-bold block mt-0.5">
                          {activeProfile.calculatedFuelEfficiencyKmPerLiter ? `${activeProfile.calculatedFuelEfficiencyKmPerLiter} km/L` : 'N/A'}
                        </strong>
                        <span className="text-xs text-emerald-400/90 block mt-1 font-semibold">CALCULATED EFFICIENCY</span>
                      </div>
                      <div className="bg-gray-900 p-3.5 rounded-lg border border-gray-800">
                        <span className="text-xs text-gray-400 uppercase font-bold block">Next Scheduled Service</span>
                        <strong className="text-lg font-mono text-amber-400 font-bold block mt-0.5">
                          {activeProfile.maintenanceDue.nextDueDate || (activeProfile.maintenanceDue.nextDueKm ? `${activeProfile.maintenanceDue.nextDueKm.toLocaleString()} km` : 'DATA UNAVAILABLE')}
                        </strong>
                        <span className="text-xs text-gray-400 block mt-1">SERVICE INTERVAL</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Safety Gate Certification Banner */}
                  <div className="bg-gradient-to-r from-[#213d77] via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider text-emerald-300">
                          STATUTORY ADMIN SAFETY CERTIFICATION & OVERRIDE
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        Authoritative Command Action: Clear all mechanical faults, AI risk advisories, and promote vehicle to <strong className="text-emerald-400">🟢 VERIFIED READY</strong> for immediate emergency lifeline dispatch.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleAdminCertifyVehicle(activeProfile.vehicleId)}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105 min-h-[40px]"
                      >
                        <Check className="w-4 h-4" />
                        <span>Admin Certify Ready ✅</span>
                      </button>
                    </div>
                  </div>

                  {/* 8-Point Physical Safety Gate Details */}
                  <div className="bg-slate-950 border border-gray-800 rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
                      <h4 className="text-xs font-black uppercase text-gray-300 tracking-wider flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-cyan-400" />
                        8-POINT PRE-DEPLOYMENT PHYSICAL SAFETY GATE
                      </h4>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        MHA / NDMA STANDARD
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeProfile.readiness.checks.map(check => {
                        const isPass = check.status === 'PASS'
                        const isWarn = check.status === 'WARNING'
                        return (
                          <div key={check.key} className="bg-gray-900/80 p-3 rounded-lg border border-gray-800 flex items-center justify-between text-xs gap-3">
                            <div className="space-y-0.5">
                              <strong className="text-white text-xs block">{check.name}</strong>
                              <span className="text-[11px] text-gray-400 block">{check.message}</span>
                            </div>
                            <span className={`text-[9.5px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                              isPass ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              isWarn ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}>
                              {check.status}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: AI HEALTH INTELLIGENCE (Phase 15) */}
              {activeTab === 'AI_HEALTH' && activeAssessment && (
                <div className="space-y-4">
                  {/* AI Risk & Confidence Header */}
                  <div className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">
                            AI VEHICLE HEALTH ASSESSMENT
                          </h3>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Analysis Source: <strong className="text-gray-300">{activeAssessment.analysisType}</strong> • Confidence: <strong className="text-indigo-300">{activeAssessment.confidence}</strong> • Completeness: <strong className="text-indigo-300">{activeAssessment.dataCompleteness}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-mono font-black uppercase border ${
                          activeAssessment.overallRisk === 'CRITICAL' || activeAssessment.overallRisk === 'HIGH'
                            ? 'bg-rose-950 border-rose-700 text-rose-300'
                            : activeAssessment.overallRisk === 'ELEVATED' || activeAssessment.overallRisk === 'MODERATE'
                            ? 'bg-amber-950 border-amber-700 text-amber-300'
                            : activeAssessment.overallRisk === 'DATA_INSUFFICIENT'
                            ? 'bg-gray-800 border-gray-700 text-gray-400'
                            : 'bg-emerald-950 border-emerald-700 text-emerald-300'
                        }`}>
                          {activeAssessment.overallRisk} RISK
                        </span>
                      </div>
                    </div>

                    {/* Detected Patterns */}
                    {activeAssessment.detectedPatterns.length > 0 && (
                      <div className="bg-gray-900/80 p-3 rounded-lg border border-gray-800 space-y-1.5">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block">
                          Detected Historical Patterns
                        </span>
                        <div className="space-y-1">
                          {activeAssessment.detectedPatterns.map((pat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-200">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{pat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">
                        Explainable Risk Factors ({activeAssessment.riskFactors.length})
                      </span>
                      <div className="space-y-1.5">
                        {activeAssessment.riskFactors.map(rf => (
                          <div key={rf.factorKey} className="bg-gray-900/60 p-3 rounded-lg border border-gray-800/80 space-y-1">
                            <div className="flex items-center justify-between">
                              <strong className="text-white text-xs">{rf.title}</strong>
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                                rf.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' : rf.severity === 'HIGH' ? 'bg-red-950 text-red-300 border border-red-800' : rf.severity === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-gray-800 text-gray-300'
                              }`}>
                                {rf.severity}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-gray-300">{rf.explanation}</p>
                            <span className="text-[9.5px] text-gray-500 block">Evidence: {rf.evidenceSource}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    <div className="bg-indigo-950/30 border border-indigo-800/50 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <h4 className="text-xs font-black uppercase text-indigo-200">Actionable AI Recommendations</h4>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-gray-200">
                        {activeAssessment.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Safety Gate Disclaimer */}
                    <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-[10.5px] text-gray-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>EMERGENCY READINESS SEPARATION GATE</span>
                      </div>
                      <p>
                        Current Physical Safety Readiness: <strong className={activeProfile.readiness.statusBadge.textClass}>{activeProfile.readiness.status}</strong>. AI maintenance risk provides early warning advisory insight and does NOT certify safety or override emergency deployment eligibility.
                      </p>
                    </div>

                    {/* Human Review Actions */}
                    <div className="pt-2 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="text-[10.5px] text-gray-400">
                        Review Status: <strong className="text-white font-mono">{activeAssessment.acknowledgementRecord?.status || 'GENERATED'}</strong>
                        {activeAssessment.acknowledgementRecord?.acknowledgedAt && (
                          <span className="ml-1 text-gray-500" suppressHydrationWarning>({new Date(activeAssessment.acknowledgementRecord.acknowledgedAt).toLocaleTimeString()})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDismiss(activeProfile.vehicleId)}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5" /> Dismiss
                        </button>
                        <button
                          onClick={() => handleAcknowledge(activeProfile.vehicleId)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-lg shadow-indigo-900/40"
                        >
                          <Check className="w-3.5 h-3.5" /> Acknowledge Recommendation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MAINTENANCE */}
              {activeTab === 'MAINTENANCE' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-gray-300">Service & Workshop Records</h3>
                    <button
                      onClick={() => setIsLogModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Maintenance Record
                    </button>
                  </div>

                  {activeProfile.maintenanceHistory.length === 0 ? (
                    <div className="p-8 text-center bg-gray-950 border border-gray-800 rounded-xl text-gray-400 text-xs">
                      No maintenance records on file. Log a service event above.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeProfile.maintenanceHistory.map(m => (
                        <div key={m.id} className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-cyan-400" />
                              <strong className="text-white text-xs">{m.maintenanceType.replace(/_/g, ' ')}</strong>
                              <span className="text-[10px] font-mono text-gray-400">({m.id})</span>
                            </div>
                            <span className="text-[9.5px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold font-mono">
                              {m.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">{m.description}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px] text-gray-400 pt-1 border-t border-gray-900">
                            <span>Service Date: <strong className="text-gray-200">{new Date(m.performedAt).toLocaleDateString()}</strong></span>
                            <span>Provider: <strong className="text-gray-200">{m.serviceProvider || 'Depot'}</strong></span>
                            <span>Cost: <strong className="text-gray-200">{m.costInr ? `₹${m.costInr.toLocaleString()}` : 'N/A'}</strong></span>
                            <span>Next Due: <strong className="text-cyan-300">{m.nextDueDate || (m.nextDueKm ? `${m.nextDueKm} km` : 'N/A')}</strong></span>
                          </div>
                          {m.partsReplaced && m.partsReplaced.length > 0 && (
                            <div className="text-[10.5px] text-gray-400">
                              Parts Replaced: <span className="text-gray-300">{m.partsReplaced.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INSPECTIONS */}
              {activeTab === 'INSPECTIONS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-gray-300">Safety & Physical Inspections</h3>
                  </div>
                  {activeProfile.inspectionHistory.length === 0 ? (
                    <div className="p-8 text-center bg-gray-950 border border-gray-800 rounded-xl text-gray-400 text-xs">
                      No inspection records on file.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeProfile.inspectionHistory.map(insp => (
                        <div key={insp.id} className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-blue-400" />
                              <strong className="text-white text-xs">{insp.inspectionType}</strong>
                              <span className="text-[10px] font-mono text-gray-400">({insp.id})</span>
                            </div>
                            <span className={`text-[9.5px] px-2 py-0.5 rounded font-bold font-mono ${insp.result === 'PASS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : insp.result === 'WARNING' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                              RESULT: {insp.result}
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">{insp.notes}</p>
                          <div className="flex items-center justify-between text-[10.5px] text-gray-400 pt-1 border-t border-gray-900">
                            <span>Inspection Date: <strong className="text-gray-200">{new Date(insp.inspectionDate).toLocaleDateString()}</strong></span>
                            <span>Inspector: <strong className="text-gray-200">{insp.inspector || 'ACTOR ID UNAVAILABLE'}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FUEL */}
              {activeTab === 'FUEL' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-gray-300">Telemetered Fuel Logs</h3>
                  </div>
                  {activeProfile.fuelHistory.length === 0 ? (
                    <div className="p-8 text-center bg-gray-950 border border-gray-800 rounded-xl text-gray-400 text-xs">
                      No fuel records on file.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeProfile.fuelHistory.map(fuel => (
                        <div key={fuel.id} className="bg-gray-950 border border-gray-800 rounded-xl p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Fuel className="w-4 h-4 text-amber-400" />
                              <strong className="text-white text-xs">{fuel.liters} Liters ({fuel.fuelType || 'Diesel'})</strong>
                              <span className="text-[10px] font-mono text-gray-400">({fuel.id})</span>
                            </div>
                            <span className="text-[9.5px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
                              {fuel.source}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10.5px] text-gray-400">
                            <span>Location: <strong className="text-gray-200">{fuel.locationName || 'Depot'}</strong></span>
                            <span>Cost: <strong className="text-gray-200">{fuel.costInr ? `₹${fuel.costInr.toLocaleString()}` : 'N/A'}</strong></span>
                            <span>Timestamp: <strong className="text-gray-200">{new Date(fuel.timestamp).toLocaleString()}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: UNIFIED TIMELINE */}
              {activeTab === 'TIMELINE' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase text-gray-300">Unified Lifetime Operating Timeline</h3>
                  <div className="relative pl-6 border-l-2 border-gray-800 space-y-4">
                    {activeProfile.timeline.map(item => (
                      <div key={item.id} className="relative group">
                        <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-gray-900" />
                        <div className="bg-gray-950 border border-gray-800/80 rounded-xl p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-blue-400 font-bold">{item.category}</span>
                            <span className="text-[10px] text-gray-500">{new Date(item.timestamp).toLocaleString()}</span>
                          </div>
                          <strong className="text-white text-xs block">{item.title}</strong>
                          <p className="text-[11px] text-gray-300">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Log Maintenance Record Modal ── */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-extrabold text-white">Log Vehicle Maintenance Record</h2>
              </div>
              <button onClick={() => setIsLogModalOpen(false)} className="text-gray-400 hover:text-white text-sm font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMaintenanceRecord} className="space-y-3.5 text-xs">
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800 text-gray-300">
                Vehicle: <strong className="text-white font-mono">{selectedVehicleId}</strong>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Maintenance Type</label>
                <select
                  value={maintType}
                  onChange={e => setMaintType(e.target.value as MaintenanceType)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ROUTINE_SERVICE">Routine Scheduled Service</option>
                  <option value="ENGINE_SERVICE">Engine & Powertrain Service</option>
                  <option value="BRAKE_SERVICE">Brake System Overhaul</option>
                  <option value="TYRE_SERVICE">Tyre Replacement & Alignment</option>
                  <option value="ELECTRICAL_SERVICE">Electrical & Battery Diagnostics</option>
                  <option value="EMERGENCY_REPAIR">Emergency Field Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Service Description</label>
                <input
                  type="text"
                  value={maintDesc}
                  onChange={e => setMaintDesc(e.target.value)}
                  placeholder="e.g. Engine oil and air filter change"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Service Workshop</label>
                  <input
                    type="text"
                    value={maintProvider}
                    onChange={e => setMaintProvider(e.target.value)}
                    placeholder="e.g. Guwahati Apex Depot"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Cost (₹ INR)</label>
                  <input
                    type="number"
                    value={maintCost}
                    onChange={e => setMaintCost(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Next Due (Km)</label>
                  <input
                    type="number"
                    value={maintNextKm}
                    onChange={e => setMaintNextKm(e.target.value)}
                    placeholder="e.g. 60000"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Next Due (Date)</label>
                  <input
                    type="date"
                    value={maintNextDate}
                    onChange={e => setMaintNextDate(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2 rounded-xl shadow-lg shadow-blue-900/40"
                >
                  Save Record →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

