'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Compass,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  MapPin,
  AlertTriangle,
  Send,
  FileText,
  Package,
  Anchor,
  AlertOctagon,
  Sparkles,
} from 'lucide-react'
import {
  Mission,
  MissionType,
  MissionPriority,
  INITIAL_DEMO_MISSIONS,
  createMission,
  proposeMissionRoute,
  approveMission,
  rejectMission,
  dispatchMission,
  markMissionArrived,
  completeMission,
  interruptMission,
} from '@/lib/mission-management'
import {
  VehicleFailureType,
  reportVehicleFailure,
  findReplacementCandidates,
  calculateReplacementHandoverPlan,
  assignReplacementVehicle,
  confirmMissionHandover,
  ReplacementCandidate,
  FailureSeverity,
  MissionHandoverPlan,
} from '@/lib/vehicle-failure'
import { evaluateVehicleReadiness, DEMO_VEHICLE_SAFETY_RECORDS } from '@/lib/vehicle-readiness'
import { calculateMissionResourceReadiness } from '@/lib/resource-coordination'
import { buildVehicleDigitalProfile } from '@/lib/vehicle-maintenance'
import { generateVehicleHealthAssessment } from '@/lib/vehicle-health-ai'
import { useLanguage } from '@/lib/LanguageContext'
import { MISSIONS_I18N } from './missions-i18n'

// Strategic Preset Origin Hubs
const PRESET_ORIGINS = [
  { id: 'Guwahati', name: '🏛️ Guwahati Apex Logistics Hub', lat: 26.1445, lng: 91.7362 },
  { id: 'Siliguri', name: '🚂 Siliguri Corridor Rail Gateway', lat: 26.7271, lng: 88.3953 },
  { id: 'Silchar', name: '📦 Silchar Barak Valley Center', lat: 24.8333, lng: 92.7789 },
  { id: 'Tezpur', name: '🌾 Tezpur Central Supply Depot', lat: 26.6338, lng: 92.7926 },
  { id: 'Dimapur', name: '🚆 Dimapur Freight Terminal', lat: 25.9043, lng: 93.7440 },
]

// Strategic Preset Crisis Locations
const PRESET_CRISIS_LOCATIONS = [
  { id: 'Majuli', name: '🌊 Majuli Riverine Island Relief Camp', lat: 26.9500, lng: 94.2167 },
  { id: 'Tawang', name: '🏔️ Tawang Strategic Forward Depot', lat: 27.5861, lng: 91.8594 },
  { id: 'Aizawl', name: '⛰️ Aizawl Emergency Supply Center', lat: 23.7271, lng: 92.7176 },
  { id: 'Imphal', name: '🏥 Imphal Regional Medical Complex', lat: 24.8170, lng: 93.9368 },
  { id: 'Agartala', name: '📦 Agartala Civil Relief Depot', lat: 23.8315, lng: 91.2868 },
]

export default function MissionsPage() {
  const { t, language } = useLanguage()
  const mtr = useMemo(() => MISSIONS_I18N[language] || MISSIONS_I18N.en, [language])
  const [missions, setMissions] = useState<Mission[]>(INITIAL_DEMO_MISSIONS)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(missions[0]?.id || null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)

  // ── Create Mission Form State ──
  const [formTitle, setFormTitle] = useState('')
  const [formType, setFormType] = useState<MissionType>('MEDICAL_SUPPLY')
  const [formPriority, setFormPriority] = useState<MissionPriority>('CRITICAL')
  const [formOriginPreset, setFormOriginPreset] = useState('Guwahati')
  const [formDestPreset, setFormDestPreset] = useState('Majuli')
  const [formCustomOriginLat, setFormCustomOriginLat] = useState('')
  const [formCustomOriginLng, setFormCustomOriginLng] = useState('')
  const [formCustomDestLat, setFormCustomDestLat] = useState('')
  const [formCustomDestLng, setFormCustomDestLng] = useState('')
  const [formRequirement, setFormRequirement] = useState('')
  const [formQuantity, setFormQuantity] = useState('')
  const [formIncidentId, setFormIncidentId] = useState('')
  const [formVehicleId, setFormVehicleId] = useState('NER-TRUCK-18')

  // ── Phase 13: Report Vehicle Failure State ──
  const [isReportFailureModalOpen, setIsReportFailureModalOpen] = useState(false)
  const [failureType, setFailureType] = useState<VehicleFailureType>('ENGINE_FAILURE')
  const [failureSeverity, setFailureSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('CRITICAL')
  const [failureDescription, setFailureDescription] = useState('')
  const [handoverPlans, setHandoverPlans] = useState<Record<string, MissionHandoverPlan>>({})

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isCreateModalOpen || isReportFailureModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? 'unset' : originalStyle
      }
    }
  }, [isCreateModalOpen, isReportFailureModalOpen])

  // Filtered Missions
  const filteredMissions = useMemo(() => {
    return missions.filter(m => {
      const matchStatus = statusFilter === 'ALL' || m.status === statusFilter
      const matchPriority = priorityFilter === 'ALL' || m.priority === priorityFilter
      return matchStatus && matchPriority
    })
  }, [missions, statusFilter, priorityFilter])

  const selectedMission = useMemo(() => {
    return missions.find(m => m.id === selectedMissionId) || filteredMissions[0] || null
  }, [missions, selectedMissionId, filteredMissions])

  // KPIs
  const totalCount = missions.length
  const pendingCount = missions.filter(m => m.status === 'PENDING_APPROVAL' || m.status === 'ROUTE_PROPOSED').length
  const inTransitCount = missions.filter(m => m.status === 'IN_TRANSIT' || m.status === 'DISPATCHED' || m.status === 'REROUTING').length
  const completedCount = missions.filter(m => m.status === 'COMPLETED').length

  // ── Handlers ──
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)

    // Resolve Origin Coordinates
    let originCoord = { lat: 26.1445, lng: 91.7362, name: 'Guwahati Apex Logistics Hub' }
    if (formOriginPreset === 'custom') {
      const lat = parseFloat(formCustomOriginLat)
      const lng = parseFloat(formCustomOriginLng)
      if (isNaN(lat) || isNaN(lng)) {
        setActionError('Invalid custom origin coordinates.')
        return
      }
      originCoord = { lat, lng, name: `Custom Origin [${lat.toFixed(2)}, ${lng.toFixed(2)}]` }
    } else {
      const found = PRESET_ORIGINS.find(o => o.id === formOriginPreset)
      if (found) originCoord = { lat: found.lat, lng: found.lng, name: found.name }
    }

    // Resolve Destination Coordinates
    let destCoord = { lat: 26.9500, lng: 94.2167, name: 'Majuli Flood Relief Camp' }
    if (formDestPreset === 'custom') {
      const lat = parseFloat(formCustomDestLat)
      const lng = parseFloat(formCustomDestLng)
      if (isNaN(lat) || isNaN(lng)) {
        setActionError('Invalid custom crisis destination coordinates.')
        return
      }
      destCoord = { lat, lng, name: `Crisis Location [${lat.toFixed(2)}, ${lng.toFixed(2)}]` }
    } else {
      const found = PRESET_CRISIS_LOCATIONS.find(d => d.id === formDestPreset)
      if (found) destCoord = { lat: found.lat, lng: found.lng, name: found.name }
    }

    const title = formTitle.trim() || `${formType.replace(/_/g, ' ')} Response to ${destCoord.name}`
    const requirement = formRequirement.trim() || 'Disaster relief essential supplies'

    // 1. Create Mission
    let newMission = createMission({
      title,
      missionType: formType,
      priority: formPriority,
      origin: originCoord,
      crisisLocation: destCoord,
      responseRequirement: requirement,
      quantitySummary: formQuantity.trim() || undefined,
      incidentId: formIncidentId.trim() || undefined,
      assignedVehicleId: formVehicleId || undefined,
    })

    // 2. Generate Route Proposal with Last-Mile Integration
    newMission = proposeMissionRoute(newMission)

    setMissions(prev => [newMission, ...prev])
    setSelectedMissionId(newMission.id)
    setIsCreateModalOpen(false)
    setActionSuccess(`Mission ${newMission.id} created and route proposal generated.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  const handleApprove = (m: Mission) => {
    setActionError(null)
    const result = approveMission(m, 'Disaster Logistics Officer', 'Verified and authorized for emergency dispatch.')
    if (!result.success) {
      setActionError(result.error || 'Approval rejected by safety gate.')
      return
    }
    setMissions(prev => prev.map(item => (item.id === m.id ? result.mission : item)))
    setActionSuccess(`Mission ${m.id} officially APPROVED. Ready for convoy dispatch.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  const handleReject = (m: Mission) => {
    setActionError(null)
    const reason = prompt('Enter official rejection reason:', 'Vehicle / route unverified')
    if (!reason) return

    const result = rejectMission(m, 'Disaster Logistics Officer', reason)
    if (!result.success) {
      setActionError(result.error || 'Rejection failed.')
      return
    }
    setMissions(prev => prev.map(item => (item.id === m.id ? result.mission : item)))
    setActionSuccess(`Mission ${m.id} REJECTED.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  const handleDispatch = (m: Mission) => {
    setActionError(null)
    const result = dispatchMission(m, 'NERA Command Dispatcher')
    if (!result.success) {
      setActionError(result.error || 'Dispatch failed.')
      return
    }
    setMissions(prev => prev.map(item => (item.id === m.id ? result.mission : item)))
    setActionSuccess(`Convoy ${m.assignedVehicleId} DISPATCHED for Mission ${m.id}. Status: IN_TRANSIT.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  const handleArrived = (m: Mission) => {
    setActionError(null)
    const isVapOnly = m.routeSummary?.accessStatus === 'LAST_MILE_REQUIRED'
    const result = markMissionArrived(m, isVapOnly)
    if (!result.success) {
      setActionError(result.error || 'Failed to update arrival.')
      return
    }
    setMissions(prev => prev.map(item => (item.id === m.id ? result.mission : item)))
    setActionSuccess(`Mission ${m.id} marked as ARRIVED${isVapOnly ? ' (At Vehicle Access Point)' : ''}.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  const handleComplete = (m: Mission) => {
    setActionError(null)
    const notes = prompt('Enter completion verification notes:', 'Relief cargo received and verified by local authority.')
    if (!notes) return

    const result = completeMission(m, 'On-Site Relief Authority', notes)
    if (!result.success) {
      setActionError(result.error || 'Completion failed.')
      return
    }
    setMissions(prev => prev.map(item => (item.id === m.id ? result.mission : item)))
    setActionSuccess(`Mission ${m.id} officially COMPLETED and closed.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  const handleInterrupt = (m: Mission) => {
    setActionError(null)
    const reason = prompt('Enter operational hold / interruption reason:', 'Route obstruction holding convoy')
    if (!reason) return

    const result = interruptMission(m, reason)
    if (!result.success) {
      setActionError(result.error || 'Interruption failed.')
      return
    }
    setMissions(prev => prev.map(item => (item.id === m.id ? result.mission : item)))
    setActionSuccess(`Mission ${m.id} marked as INTERRUPTED.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  // ── Phase 13: Vehicle Failure & Replacement Handlers ──
  const handleOpenReportFailure = (_m?: Mission) => {
    setFailureDescription(`En-route ${failureType.replace(/_/g, ' ').toLowerCase()} reported on active transit corridor.`)
    setIsReportFailureModalOpen(true)
  }

  const handleSubmitFailure = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMission) return

    const { failureEvent, updatedMission } = reportVehicleFailure({
      vehicleId: selectedMission.assignedVehicleId || 'NER-TRUCK-18',
      mission: selectedMission,
      failureType,
      severity: failureSeverity,
      description: failureDescription || 'Vehicle unable to continue delivery',
      reportedBy: 'Driver B. Gogoi',
    })

    if (updatedMission) {
      setMissions(prev => prev.map(m => (m.id === updatedMission.id ? updatedMission : m)))
    }
    setIsReportFailureModalOpen(false)
    setActionSuccess(`Vehicle failure reported (${failureEvent.id}). Mission ${selectedMission.id} set to INTERRUPTED. Emergency replacement recovery protocol active.`)
    setTimeout(() => setActionSuccess(null), 5000)
  }

  const handleSelectAndDispatchReplacement = (m: Mission, cand: ReplacementCandidate) => {
    setActionError(null)
    const plan = calculateReplacementHandoverPlan(m, cand)
    const assignRes = assignReplacementVehicle(m, cand, plan, 'NERA Emergency Recovery Officer')
    if (!assignRes.success) {
      setActionError(assignRes.error || 'Failed to dispatch replacement vehicle.')
      return
    }
    setHandoverPlans(prev => ({ ...prev, [m.id]: plan }))
    setMissions(prev => prev.map(item => (item.id === m.id ? assignRes.mission : item)))
    setActionSuccess(`Replacement vehicle ${cand.vehicleId} authorized & dispatched to Handover Point.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  const handleConfirmHandover = (m: Mission) => {
    setActionError(null)
    const plan = handoverPlans[m.id] || calculateReplacementHandoverPlan(m, {
      vehicleId: m.assignedVehicleId || 'NER-TRUCK-07',
      vehicleModel: 'Ashok Leyland Standby Convoy',
      currentLocation: m.origin,
      readiness: m.vehicleReadiness || evaluateVehicleReadiness({ vehicleId: m.assignedVehicleId || 'NER-TRUCK-07' }),
      distanceToIncidentKm: 0,
      estimatedTravelHours: 0,
      isEligible: true,
      ineligibilityReasons: [],
      warnings: [],
      suitabilityScore: 1000,
      rankingRank: 1,
    })

    const confirmRes = confirmMissionHandover(m, plan, 'On-Site Convoy Master', 'Cargo transfer verified. Resuming route to destination.')
    if (!confirmRes.success) {
      setActionError(confirmRes.error || 'Handover confirmation failed.')
      return
    }
    setMissions(prev => prev.map(item => (item.id === m.id ? confirmRes.mission : item)))
    setActionSuccess(`Mission Handover confirmed on site. Mission ${m.id} resumed in transit.`)
    setTimeout(() => setActionSuccess(null), 4000)
  }

  return (
    <div className="space-y-5 text-slate-800 font-sans">
      {/* ── Top Header Bar ── */}
      <div className="gov-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#213d77] rounded flex items-center justify-center text-white shrink-0 shadow-xs border border-[#1b3162]">
              <Compass className="w-5 h-5 text-[#fb792b]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#213d77]">
                  MISSION MANAGEMENT & OFFICIAL DISPATCH
                </h1>
                <span className="text-[10px] bg-blue-100 border border-blue-300 text-[#213d77] font-bold px-2 py-0.5 rounded font-mono">
                  GOVERNMENT COMMAND GATE
                </span>
                <span className="text-[10px] bg-amber-100 border border-amber-300 text-amber-900 font-bold px-2 py-0.5 rounded font-mono">
                  OFFICIAL AUTHORIZATION GATE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                AI-Assisted Emergency Logistics Response Planning, Vehicle Readiness Verification & Official Government Approval
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-irctc-primary text-xs sm:text-sm min-h-[44px] px-5 py-2.5 flex items-center gap-2 cursor-pointer font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" /> CREATE EMERGENCY MISSION
          </button>
        </div>
      </div>

      {/* ── Alert Banners ── */}
      {actionError && (
        <div className="bg-red-50 border border-red-300 p-4 rounded text-xs sm:text-sm text-red-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-semibold">{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900 text-xs font-bold px-2 py-1">Dismiss</button>
        </div>
      )}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 p-4 rounded text-xs sm:text-sm text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1">Dismiss</button>
        </div>
      )}

      {/* ── Operational KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="gov-card p-4 sm:p-5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{mtr.kpi_total}</span>
          <p className="text-3xl sm:text-4xl font-black text-[#213d77] mt-1 font-mono">{totalCount}</p>
          <span className="text-xs text-slate-500 block mt-1">{mtr.kpi_total_sub}</span>
        </div>
        <div className="gov-card p-4 sm:p-5 border-amber-200 bg-amber-50/40">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">{mtr.kpi_pending}</span>
          <p className="text-3xl sm:text-4xl font-black text-amber-700 mt-1 font-mono">{pendingCount}</p>
          <span className="text-xs text-amber-700 block mt-1">{mtr.kpi_pending_sub}</span>
        </div>
        <div className="gov-card p-4 sm:p-5 border-blue-200 bg-blue-50/40">
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">{mtr.kpi_transit}</span>
          <p className="text-3xl sm:text-4xl font-black text-[#213d77] mt-1 font-mono">{inTransitCount}</p>
          <span className="text-xs text-blue-700 block mt-1">{mtr.kpi_transit_sub}</span>
        </div>
        <div className="gov-card p-4 sm:p-5 border-emerald-200 bg-emerald-50/40">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">{mtr.kpi_completed}</span>
          <p className="text-3xl sm:text-4xl font-black text-emerald-700 mt-1 font-mono">{completedCount}</p>
          <span className="text-xs text-emerald-700 block mt-1">{mtr.kpi_completed_sub}</span>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Mission Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="gov-card p-3.5 flex flex-wrap items-center justify-between gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 rounded px-2.5 py-1.5 min-h-[38px] font-semibold focus:outline-none focus:border-[#fb792b] cursor-pointer"
              >
                <option value="ALL">{mtr.filter_all_statuses}</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="APPROVED">Approved</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="ARRIVED">Arrived</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
                <option value="INTERRUPTED">Interrupted</option>
              </select>
            </div>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 rounded px-2.5 py-1.5 min-h-[38px] font-semibold focus:outline-none focus:border-[#fb792b] cursor-pointer"
            >
              <option value="ALL">{mtr.filter_all_priorities}</option>
              <option value="CRITICAL">🔴 Critical</option>
              <option value="HIGH">🟠 High</option>
              <option value="NORMAL">🔵 Normal</option>
              <option value="LOW">⚪ Low</option>
            </select>
          </div>

          {/* Missions List */}
          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {filteredMissions.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded p-10 text-center text-slate-500 text-xs sm:text-sm space-y-2.5">
                <FileText className="w-8 h-8 mx-auto text-slate-400" />
                <p>{mtr.no_missions}</p>
              </div>
            ) : (
              filteredMissions.map(m => {
                const isSelected = selectedMission?.id === m.id
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMissionId(m.id)}
                    className={`p-4 rounded border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-[#213d77] border-blue-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-[#fb792b]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#213d77] text-xs sm:text-sm font-mono">{m.id}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                            m.priority === 'CRITICAL'
                              ? 'bg-red-100 border-red-300 text-red-800'
                              : m.priority === 'HIGH'
                              ? 'bg-amber-100 border-amber-300 text-amber-800'
                              : 'bg-blue-100 border-blue-300 text-[#213d77]'
                          }`}
                        >
                          {m.priority}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                            m.status === 'APPROVED'
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                              : m.status === 'PENDING_APPROVAL'
                              ? 'bg-amber-100 border-amber-300 text-amber-800'
                              : m.status === 'IN_TRANSIT'
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : m.status === 'COMPLETED'
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : m.status === 'REJECTED'
                              ? 'bg-red-100 border-red-300 text-red-800'
                              : 'bg-slate-100 border-slate-300 text-slate-700'
                          }`}
                        >
                          {m.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <p className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{m.title}</p>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{m.origin.name?.split(' ')[1] || 'Origin'} → {m.crisisLocation.name?.split(' ')[1] || 'Destination'}</span>
                      <span className="font-mono text-[#213d77] font-bold">{m.routeSummary?.totalDistanceKm || '~'} km</span>
                    </div>

                    {m.assignedVehicleId && (
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 text-slate-600">
                        <span className="flex items-center gap-1 font-semibold">
                          <Truck className="w-3.5 h-3.5 text-[#fb792b]" />
                          {m.assignedVehicleId}
                        </span>
                        {m.vehicleReadiness && (
                          <span className={`font-bold font-mono text-xs ${m.vehicleReadiness.statusBadge.textClass}`}>
                            {m.vehicleReadiness.statusBadge.icon} {m.vehicleReadiness.status.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right: Selected Mission Detail & Action Control (7 cols) */}
        <div className="lg:col-span-7 space-y-5 max-h-[820px] overflow-y-auto pr-1.5 custom-scrollbar">
          {selectedMission ? (
            <div className="gov-card p-5 sm:p-6 space-y-5">
              {/* Mission Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold text-[#213d77] bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                      {selectedMission.id}
                    </span>
                    <span className="text-xs text-slate-600 font-bold uppercase">{selectedMission.missionType.replace(/_/g, ' ')}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5">{selectedMission.title}</h2>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs sm:text-sm font-black px-3.5 py-1.5 rounded border font-mono uppercase tracking-wide ${
                      selectedMission.status === 'APPROVED'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : selectedMission.status === 'PENDING_APPROVAL'
                        ? 'bg-amber-100 border-amber-300 text-amber-900 animate-pulse'
                        : selectedMission.status === 'IN_TRANSIT'
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : selectedMission.status === 'COMPLETED'
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : selectedMission.status === 'REJECTED'
                        ? 'bg-red-100 border-red-300 text-red-800'
                        : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    STATUS: {selectedMission.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Geographic Coordinates & Relief Cargo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1.5">
                  <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#213d77]" /> Origin Hub
                  </span>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">{selectedMission.origin.name}</p>
                  <p className="font-mono text-slate-600 text-xs">[{selectedMission.origin.lat.toFixed(4)}, {selectedMission.origin.lng.toFixed(4)}]</p>
                </div>
                <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-1.5">
                  <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" /> Crisis Location (Target)
                  </span>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">{selectedMission.crisisLocation.name}</p>
                  <p className="font-mono text-slate-600 text-xs">[{selectedMission.crisisLocation.lat.toFixed(4)}, {selectedMission.crisisLocation.lng.toFixed(4)}]</p>
                </div>
              </div>

              {/* Cargo & Requirement */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 text-xs sm:text-sm space-y-1.5">
                <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#fb792b]" /> Relief Requirement Manifest
                </span>
                <p className="font-semibold text-slate-900 text-sm">{selectedMission.responseRequirement}</p>
                {selectedMission.quantitySummary && (
                  <p className="text-[#213d77] font-mono font-bold text-xs sm:text-sm">{selectedMission.quantitySummary}</p>
                )}
                {selectedMission.incidentId && (
                  <p className="text-xs text-amber-800 font-semibold pt-1">⚠️ Responding to Incident Reference: <strong>{selectedMission.incidentId}</strong></p>
                )}
              </div>

              {/* ── Route & Last-Mile Reachability Proposal ── */}
              {selectedMission.routeSummary && (
                <div className="bg-slate-50 border border-slate-200 rounded p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs sm:text-sm font-bold uppercase flex items-center gap-2 text-[#213d77]">
                      <Compass className="w-4 h-4 text-[#fb792b]" /> Operational Route Proposal & Multi-Modal Plan
                    </span>
                    <span className="text-xs font-mono bg-blue-100 text-[#213d77] border border-blue-200 px-2.5 py-1 rounded font-bold">
                      {selectedMission.routeSummary.accessStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="font-bold text-slate-900 text-xs sm:text-sm">{selectedMission.routeSummary.recommendedHighway}</p>

                  <div className="grid grid-cols-3 gap-3 text-center text-xs sm:text-sm">
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-xs text-slate-500 uppercase font-bold block">Vehicle Road</span>
                      <strong className="text-[#213d77] font-mono text-base block mt-0.5">{selectedMission.routeSummary.vehicleAccessibleKm} km</strong>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-xs text-slate-500 uppercase font-bold block">Last-Mile Gap</span>
                      <strong className={`font-mono text-base block mt-0.5 ${selectedMission.routeSummary.lastMileKm > 0 ? 'text-[#fb792b]' : 'text-emerald-700'}`}>
                        {selectedMission.routeSummary.lastMileKm} km
                      </strong>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-xs text-slate-500 uppercase font-bold block">Total Operational</span>
                      <strong className="text-slate-800 font-mono text-base block mt-0.5">{selectedMission.routeSummary.totalDistanceKm} km</strong>
                    </div>
                  </div>

                  {selectedMission.routeSummary.lastMileKm > 0 && (
                    <div className="bg-amber-50 border border-amber-300 p-3.5 rounded text-xs sm:text-sm space-y-1.5 text-amber-900">
                      <div className="flex items-center gap-2 font-bold">
                        <Anchor className="w-4 h-4 text-[#fb792b]" />
                        <span>Recommended Last-Mile Transfer: {selectedMission.routeSummary.recommendedLastMileMode}</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        ⚠️ Road terminates at Vehicle Access Point. Non-road distance ({selectedMission.routeSummary.lastMileKm} km) requires field deployment verification.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── MISSION RESOURCE STATUS & DEPENDENCY BOARD ── */}
              {(() => {
                const resourceReadiness = calculateMissionResourceReadiness(selectedMission)
                return (
                  <div className="bg-slate-50 border border-slate-200 rounded p-4 sm:p-5 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                      <span className="text-xs sm:text-sm font-bold uppercase flex items-center gap-2 text-[#213d77]">
                        <Package className="w-4 h-4 text-[#fb792b]" /> Regional Resource Status & Inventory Allocation
                      </span>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase ${
                          resourceReadiness.overallStatus === 'READY'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : resourceReadiness.overallStatus === 'READY_WITH_WARNING'
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-red-100 border-red-300 text-red-800'
                        }`}
                      >
                        READINESS: {resourceReadiness.overallStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-xs uppercase font-bold text-slate-500 block">Carrier</span>
                        <span className="text-emerald-700 font-bold block truncate mt-0.5">
                          ✓ {resourceReadiness.dependencies.vehicle.id}
                        </span>
                        <span className="text-xs text-slate-500">{resourceReadiness.dependencies.vehicle.status}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-xs uppercase font-bold text-slate-500 block">Cargo</span>
                        <span className="text-[#213d77] font-bold block mt-0.5">✓ Reserved</span>
                        <span className="text-xs text-slate-500">Payload verified</span>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-xs uppercase font-bold text-slate-500 block">Route</span>
                        <span className="text-blue-700 font-bold block mt-0.5">✓ Feasible</span>
                        <span className="text-xs text-slate-500">OSRM Road</span>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-xs uppercase font-bold text-slate-500 block">Last-Mile</span>
                        <span className="text-amber-700 font-bold block mt-0.5">
                          {selectedMission.routeSummary?.lastMileKm ? '⚠ VAP Gap' : '✓ Direct'}
                        </span>
                        <span className="text-xs text-slate-500">{resourceReadiness.dependencies.lastMile.mode}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-xs uppercase font-bold text-slate-500 block">Field Team</span>
                        <span className="text-purple-700 font-bold block mt-0.5">Field Verify</span>
                        <span className="text-xs text-slate-500">Non-simulated</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-700 bg-white p-3 rounded border border-slate-200 leading-relaxed">
                      ℹ️ {resourceReadiness.actionRequired}
                    </p>
                  </div>
                )
              })()}

              {/* ── Assigned Vehicle & Phase 11 Readiness Gate ── */}
              {selectedMission.assignedVehicleId && selectedMission.vehicleReadiness && (
                <div className="p-4 sm:p-5 rounded border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs sm:text-sm font-bold uppercase flex items-center gap-2 text-slate-800">
                      <Truck className="w-4 h-4 text-[#213d77]" /> Assigned Vehicle: {selectedMission.assignedVehicleId}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded font-mono ${selectedMission.vehicleReadiness.statusBadge.textClass} bg-white border border-current`}>
                      {selectedMission.vehicleReadiness.statusBadge.icon} {selectedMission.vehicleReadiness.statusBadge.label}
                    </span>
                  </div>

                  {/* 8-Point Checklist Preview */}
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {selectedMission.vehicleReadiness.checks.slice(0, 4).map(chk => (
                      <div key={chk.key} className="bg-white p-2 rounded border border-slate-200 text-center">
                        <span className="text-slate-500 block truncate font-medium">{chk.key}</span>
                        <strong className={`font-mono text-xs sm:text-sm mt-0.5 block ${chk.status === 'PASS' ? 'text-emerald-700' : chk.status === 'WARNING' ? 'text-amber-700' : 'text-red-700'}`}>
                          {chk.status}
                        </strong>
                      </div>
                    ))}
                  </div>

                  {selectedMission.vehicleReadiness.blockingReasons.length > 0 && (
                    <div className="bg-red-50 border border-red-300 p-3 rounded text-xs sm:text-sm text-red-800 font-bold">
                      🛑 BLOCKING ISSUE: {selectedMission.vehicleReadiness.blockingReasons[0]}
                    </div>
                  )}

                  {/* Phase 15 AI Health Intelligence Advisory */}
                  {(() => {
                    const safetyRec = DEMO_VEHICLE_SAFETY_RECORDS[selectedMission.assignedVehicleId] || {
                      vehicleId: selectedMission.assignedVehicleId,
                    }
                    const vProfile = buildVehicleDigitalProfile(safetyRec)
                    const vHealth = generateVehicleHealthAssessment(vProfile)
                    return (
                      <div className="bg-white border border-slate-200 p-3 rounded text-xs sm:text-sm space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs sm:text-[13px] font-bold text-[#213d77]">
                            <Sparkles className="w-4 h-4 text-[#fb792b]" /> AI Maintenance Risk
                          </span>
                          <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded ${
                            vHealth.overallRisk === 'CRITICAL' || vHealth.overallRisk === 'HIGH'
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : vHealth.overallRisk === 'ELEVATED' || vHealth.overallRisk === 'MODERATE'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}>
                            AI RISK: {vHealth.overallRisk}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {vHealth.recommendations[0] || 'Vehicle operating within nominal safety thresholds.'}
                        </p>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* ── Official Review & Dispatch Action Controls ── */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Official Command Actions</span>

                <div className="flex flex-wrap gap-2">
                  {/* APPROVE Button */}
                  {selectedMission.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApprove(selectedMission)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 min-h-[44px] rounded text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" /> OFFICIAL APPROVE
                    </button>
                  )}

                  {/* REJECT Button */}
                  {selectedMission.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleReject(selectedMission)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold py-3 px-4 min-h-[44px] rounded text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> REJECT
                    </button>
                  )}

                  {/* DISPATCH Button */}
                  {selectedMission.status === 'APPROVED' && (
                    <button
                      onClick={() => handleDispatch(selectedMission)}
                      className="flex-1 btn-irctc-primary py-3 px-4 min-h-[44px] rounded text-xs sm:text-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> DISPATCH RELIEF CONVOY
                    </button>
                  )}

                  {/* ARRIVED Button */}
                  {selectedMission.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleArrived(selectedMission)}
                      className="btn-irctc-navy py-3 px-4 min-h-[44px] rounded text-xs sm:text-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" /> MARK ARRIVED
                    </button>
                  )}

                  {/* COMPLETE Button */}
                  {(selectedMission.status === 'ARRIVED' || selectedMission.status === 'IN_TRANSIT') && (
                    <button
                      onClick={() => handleComplete(selectedMission)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 min-h-[44px] rounded text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-4 h-4" /> COMPLETE MISSION (SIGNOFF)
                    </button>
                  )}

                  {/* REPORT VEHICLE FAILURE Button */}
                  {(selectedMission.status === 'IN_TRANSIT' || selectedMission.status === 'DISPATCHED' || selectedMission.status === 'REROUTING') && (
                    <button
                      onClick={() => handleOpenReportFailure(selectedMission)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertOctagon className="w-4 h-4 text-red-600" /> REPORT VEHICLE FAILURE
                    </button>
                  )}

                  {/* INTERRUPT Button */}
                  {(selectedMission.status === 'IN_TRANSIT' || selectedMission.status === 'APPROVED') && (
                    <button
                      onClick={() => handleInterrupt(selectedMission)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold py-2 px-3 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> HOLD / INTERRUPT
                    </button>
                  )}
                </div>
              </div>

              {/* ── Phase 13: Emergency Replacement & Handover Recovery Center (Active when INTERRUPTED) ── */}
              {selectedMission.status === 'INTERRUPTED' && (
                <div className="bg-red-50 border-2 border-red-400 rounded p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-red-200 pb-2">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-5 h-5 text-red-600" />
                      <div>
                        <h3 className="text-xs font-black uppercase text-red-900">
                          EMERGENCY REPLACEMENT & MISSION RECOVERY CENTER
                        </h3>
                        <p className="text-[10px] text-red-700">
                          Vehicle failure reported. Select an eligible standby vehicle to resume delivery.
                        </p>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-mono bg-red-100 border border-red-300 text-red-900 px-2 py-0.5 rounded font-bold">
                      RECOVERY PROTOCOL
                    </span>
                  </div>

                  {/* Candidate Replacement Vehicles Grid */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-800 uppercase block">
                      Eligible Standby Fleet (Physical Safety Gate Evaluated):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {findReplacementCandidates({
                        missionLocation: selectedMission.origin,
                        crisisLocation: selectedMission.crisisLocation,
                        activeCommittedVehicleIds: [selectedMission.assignedVehicleId || ''],
                      }).map(cand => (
                        <div
                          key={cand.vehicleId}
                          className={`p-2.5 rounded border text-xs space-y-1.5 transition-all ${
                            cand.isEligible
                              ? 'bg-white border-slate-300 hover:border-[#fb792b]'
                              : 'bg-slate-100 border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-[#213d77] font-mono">{cand.vehicleId}</strong>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${cand.readiness.statusBadge.textClass} bg-white border border-current`}>
                              {cand.readiness.statusBadge.icon} {cand.readiness.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-700">{cand.vehicleModel}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Distance: <strong className="text-[#213d77]">{cand.distanceToIncidentKm} km</strong></span>
                            <span>ETA: <strong className="text-slate-800">~{cand.estimatedTravelHours}h</strong></span>
                          </div>
                          {cand.isEligible ? (
                            <button
                              onClick={() => handleSelectAndDispatchReplacement(selectedMission, cand)}
                              className="w-full btn-irctc-primary py-1 px-2 rounded text-[10.5px] flex items-center justify-center gap-1 font-bold cursor-pointer mt-1"
                            >
                              <Send className="w-3 h-3" /> Dispatch Replacement →
                            </button>
                          ) : (
                            <p className="text-[9.5px] text-red-700 leading-tight">
                              🛑 Ineligible: {cand.ineligibilityReasons[0]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Handover Confirmation Callout if Replacement Dispatched */}
                  {selectedMission.timeline.some(t => t.action === 'REPLACEMENT_VEHICLE_DISPATCHED') && (
                    <div className="bg-amber-50 border border-amber-300 rounded p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#fb792b]" />
                          Proposed Handover Point: [{selectedMission.origin.lat.toFixed(4)}, {selectedMission.origin.lng.toFixed(4)}]
                        </span>
                        <span className="text-[9.5px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          PHYSICAL HANDOVER REQUIRED
                        </span>
                      </div>
                      <p className="text-[10.5px] text-amber-800">
                        Replacement vehicle is en-route to the handover point. Once custody/cargo transfer is verified by on-site crew, confirm handover to resume delivery.
                      </p>
                      <button
                        onClick={() => handleConfirmHandover(selectedMission)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle className="w-4 h-4" /> CONFIRM ON-SITE HANDOVER & RESUME MISSION
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Operational Timeline Audit Record ── */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Operational Audit Trail ({selectedMission.timeline.length} Events)
                </span>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedMission.timeline.map((evt, idx) => (
                    <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-200 text-xs flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#213d77] mt-1.5 shrink-0" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-[#213d77]">{evt.action}</span>
                          <span className="font-mono text-slate-500" suppressHydrationWarning>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-700 text-[11px]">{evt.notes}</p>
                        <p className="text-[9.5px] text-slate-500 font-mono">Actor: {evt.actor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="gov-card p-12 text-center text-slate-500 text-xs">
              Select a mission from the queue to view route proposal, vehicle readiness, and official review actions.
            </div>
          )}
        </div>
      </div>

      {/* ── Create Mission Modal ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#fb792b]" />
                <h2 className="text-base font-black text-slate-900">Create Operational Emergency Mission</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Mission Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Emergency IV Fluid & Antivenom Delivery"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Mission Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as MissionType)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b] cursor-pointer"
                  >
                    <option value="MEDICAL_SUPPLY">Medical Supplies</option>
                    <option value="FOOD_SUPPLY">Food / Grain</option>
                    <option value="WATER_SUPPLY">Potable Water</option>
                    <option value="RESCUE_SUPPORT">Rescue Support</option>
                    <option value="CONSTRUCTION_MATERIAL">Construction / Bailey Bridge</option>
                    <option value="EMERGENCY_EVACUATION">Evacuation Support</option>
                    <option value="GENERAL_LOGISTICS">General Logistics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as MissionPriority)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b] cursor-pointer"
                  >
                    <option value="CRITICAL">🔴 Critical Priority</option>
                    <option value="HIGH">🟠 High Priority</option>
                    <option value="NORMAL">🔵 Normal Priority</option>
                    <option value="LOW">⚪ Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Origin Hub */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Supply Origin Hub</label>
                <select
                  value={formOriginPreset}
                  onChange={e => setFormOriginPreset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b] cursor-pointer"
                >
                  {PRESET_ORIGINS.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                  <option value="custom">📍 Custom GPS Coordinates (Arbitrary Ingress)</option>
                </select>
                {formOriginPreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Origin Latitude (e.g. 26.1445)"
                      value={formCustomOriginLat}
                      onChange={e => setFormCustomOriginLat(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Origin Longitude (e.g. 91.7362)"
                      value={formCustomOriginLng}
                      onChange={e => setFormCustomOriginLng(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Crisis Destination */}
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Crisis Destination / Disaster Point</label>
                <select
                  value={formDestPreset}
                  onChange={e => setFormDestPreset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b] cursor-pointer"
                >
                  {PRESET_CRISIS_LOCATIONS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                  <option value="custom">🎯 Custom GPS Coordinates (Arbitrary Crisis Point)</option>
                </select>
                {formDestPreset === 'custom' && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Crisis Latitude (e.g. 26.9500)"
                      value={formCustomDestLat}
                      onChange={e => setFormCustomDestLat(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Crisis Longitude (e.g. 94.2167)"
                      value={formCustomDestLng}
                      onChange={e => setFormCustomDestLng(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Response Requirement & Vehicle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Response Cargo Manifest</label>
                  <input
                    type="text"
                    value={formRequirement}
                    onChange={e => setFormRequirement(e.target.value)}
                    placeholder="e.g. Emergency Antivenom & Antibiotics"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Payload Weight / Quantity</label>
                  <input
                    type="text"
                    value={formQuantity}
                    onChange={e => setFormQuantity(e.target.value)}
                    placeholder="e.g. 3,400 kg Medical Cargo"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Assign Response Vehicle</label>
                  <select
                    value={formVehicleId}
                    onChange={e => setFormVehicleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b] cursor-pointer"
                  >
                    <option value="NER-TRUCK-18">NER-TRUCK-18 (Tata Signa - Ready)</option>
                    <option value="NER-TRUCK-07">NER-TRUCK-07 (Ashok Leyland - Warning)</option>
                    <option value="NER-TRUCK-23">NER-TRUCK-23 (BharatBenz - Not Ready)</option>
                    <option value="NER-TRUCK-31">NER-TRUCK-31 (Bolero - Data Insufficient)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Incident Reference (Optional)</label>
                  <input
                    type="text"
                    value={formIncidentId}
                    onChange={e => setFormIncidentId(e.target.value)}
                    placeholder="e.g. INC-2026-FLOOD-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-[#fb792b]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-irctc-primary py-2 rounded font-bold cursor-pointer"
                >
                  Generate Route Proposal →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Phase 13: Report Vehicle Failure Modal ── */}
      {isReportFailureModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-300 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-red-200 pb-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertOctagon className="w-5 h-5" />
                <h2 className="text-base font-black text-red-900">Report In-Transit Vehicle Failure</h2>
              </div>
              <button
                onClick={() => setIsReportFailureModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFailure} className="space-y-3.5 text-xs">
              <div className="bg-red-50 border border-red-300 p-2.5 rounded text-red-900 space-y-0.5">
                <span className="font-bold">Active Mission: {selectedMission?.id}</span>
                <p className="text-[10.5px] text-red-700">Vehicle: {selectedMission?.assignedVehicleId || 'NER-TRUCK-18'}</p>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Failure / Problem Classification</label>
                <select
                  value={failureType}
                  onChange={e => setFailureType(e.target.value as VehicleFailureType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="ENGINE_FAILURE">Powertrain / Severe Engine Failure</option>
                  <option value="BRAKE_FAILURE">Pneumatic / Hydraulic Brake Fault</option>
                  <option value="TYRE_FAILURE">Tyre Puncture / Mountain Tread Baldness</option>
                  <option value="MECHANICAL_FAILURE">Suspension / Axle / Chassis Fracture</option>
                  <option value="ACCIDENT">Road Collision / Debris Impact</option>
                  <option value="FUEL_PROBLEM">Fuel Depletion / Line Clog</option>
                  <option value="VEHICLE_STUCK">Stuck in Landslide Mud / Snow</option>
                  <option value="COMMUNICATION_FAILURE">GPS / Radio Blackout</option>
                  <option value="UNSAFE_CONDITION">Severe Mountain Weather Hazards</option>
                  <option value="OTHER">Other Operational Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Failure Severity</label>
                <select
                  value={failureSeverity}
                  onChange={e => setFailureSeverity(e.target.value as FailureSeverity)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  <option value="CRITICAL">🔴 Critical (Vehicle Immobilized / Hazard)</option>
                  <option value="HIGH">🟠 High (Unable to Maintain Convoy Speed)</option>
                  <option value="MEDIUM">🟡 Medium (Mechanical Advisory)</option>
                  <option value="LOW">⚪ Low (Minor Sensor Fault)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Detailed Operational Description</label>
                <textarea
                  rows={3}
                  value={failureDescription}
                  onChange={e => setFailureDescription(e.target.value)}
                  placeholder="Describe failure condition, symptoms, and on-site crew status..."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportFailureModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded shadow-xs cursor-pointer"
                >
                  Report Failure & Hold Mission →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
