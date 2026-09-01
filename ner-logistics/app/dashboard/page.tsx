'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Shield,
  Activity,
  MapPin,
  Compass,
  Truck,
  AlertTriangle,
  FileText,
  Radio,
  Clock,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Box,
  Layers,
  ChevronRight,
  Smartphone,
  ExternalLink,
  Flame,
  Check,
  LifeBuoy,
  Tent,
} from 'lucide-react'

import { useLanguage } from '@/lib/LanguageContext'
import { useUserRole, useRequireRole } from '@/lib/RoleContext'
import { useRealtimeIncidents } from '@/hooks/useRealtimeIncidents'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { INITIAL_FLEET, VehicleTelemetryData } from '@/lib/vehicle-intelligence'
import { INITIAL_NER_ROUTES } from '@/lib/data'
import { ActiveRoute } from '@/lib/routing-algorithm'
import { deriveOperationalRoutes } from '@/lib/incident-route-impact'
import { evaluateCorridorDisruptionRisk } from '@/lib/disruption-prediction'
import { PAN_INDIA_SUPPLY_DEPOTS } from '@/lib/disaster-categories'
import { useDisasterComms, PoliceRouteAssessment, CitizenSOSRequest } from '@/lib/disaster-comms-store'
import LiveMobileNotificationSimulator from '@/components/LiveMobileNotificationSimulator'
import { DASHBOARD_I18N, CARGO_I18N } from './dashboard-i18n'

function formatDeterministicTime(dateStr?: string | Date | null, fallback: string = 'Live'): string {
  if (!dateStr) return fallback
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
  } catch {
    return fallback
  }
}

export default function DashboardPage() {
  const { isAuthorized, isLoaded } = useRequireRole(['APEX_ADMIN'])
  const router = useRouter()
  const { language, t } = useLanguage()
  const { currentRole, roleConfig } = useUserRole()
  const { isOnline, pendingCount } = useOfflineSync()
  const { activeIncidents, lastSync } = useRealtimeIncidents()
  const {
    crisisZones,
    assessments,
    sosRequests,
    beacons,
    supplyRequisitions,
    activeCorridor,
    approveCorridorAndBroadcast,
    dispatchRescueToSOS,
    adminAssignRouteToCrisisZone,
    adminRerouteCrisisZone,
    adminDispatchSupplyConvoy,
    resolveAndClearCrisisZone,
  } = useDisasterComms()

  const dtr = useMemo(() => DASHBOARD_I18N[language] || DASHBOARD_I18N.en, [language])
  const cargoMap = useMemo(() => CARGO_I18N[language] || CARGO_I18N.en, [language])

  const [fleet] = useState<VehicleTelemetryData[]>(INITIAL_FLEET)
  const [baseRoutes] = useState(INITIAL_NER_ROUTES)
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL')
  const [activeRightTab, setActiveRightTab] = useState<'ALERTS' | 'POLICE_FEED' | 'CITIZEN_SOS' | 'REQUISITIONS'>('POLICE_FEED')
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null)

  // Lock body scroll when mobile simulator modal is active
  useEffect(() => {
    if (isMobileSimulatorOpen) {
      document.body.classList.add('overflow-hidden')
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isMobileSimulatorOpen])

  // Derive dynamic operational routes from active incidents
  const operationalResult = useMemo(() => {
    return deriveOperationalRoutes(baseRoutes, activeIncidents)
  }, [baseRoutes, activeIncidents])

  const operationalRoutes = operationalResult.operationalRoutes

  // Operational metrics
  const activeReliefConvoys = fleet.filter(v => v.status === 'IN_TRANSIT' || v.status === 'DISPATCHED' || v.status === 'DELAYED').length
  const totalPassableRoutes = operationalRoutes.filter((r: ActiveRoute) => r.status === 'open').length
  const totalCorridors = operationalRoutes.length
  const priorityHazardCount = activeIncidents.filter(i => i.status === 'confirmed' || i.severity === 'critical' || i.severity === 'high').length
  const lastMilePortersActive = 18

  // Comprehensive multi-modal disaster missions
  const allMissions = [
    {
      missionId: 'MIS-2026-081',
      commodity: 'Pediatric Vaccines & Anti-Venom',
      severity: 'P1 CRITICAL',
      originDepot: 'Delhi Central Medical Reserve (via Borjhar AFS)',
      crisisVAP: 'Jatinga Roadhead VAP (km 88)',
      assignedVehicle: 'Hill 4x4 Off-Road (NER-4x4-07)',
      corridorName: 'NH-27 Lumding–Haflong Road',
      status: 'EN ROUTE',
      progressPercent: 68,
      eta: '42 mins',
      coldChainStatus: '2.4°C PCM Guaranteed',
      handoverAuthority: 'Haflong Sadar PS (VHF Ch-14)',
    },
    {
      missionId: 'MIS-2026-082',
      commodity: 'Emergency Cryo Blood Plasma & O2 Cylinders',
      severity: 'P1 CRITICAL',
      originDepot: 'Nagpur NDRF National Depot (via Silchar Staging)',
      crisisVAP: 'Makru VAP (km 45, Tupul Gorge)',
      assignedVehicle: 'IAF Mi-17 V5 Rotary Airbridge',
      corridorName: 'NH-37 Tupul Mountain Road',
      status: 'AIRLIFT ACTIVE',
      progressPercent: 88,
      eta: '14 mins',
      coldChainStatus: 'Cryo Container Sealed (-20°C)',
      handoverAuthority: 'Makru Village Disaster Committee',
    },
    {
      missionId: 'MIS-2026-083',
      commodity: 'High-Calorie Dry Rations & Water Packs',
      severity: 'P2 HIGH',
      originDepot: 'Kolkata Port & Dankuni Rail Freight Complex',
      crisisVAP: 'Kamalabari Ghat Char Area (Majuli Island)',
      assignedVehicle: 'SDRF Motorized BAUT Assault Boat',
      corridorName: 'Brahmaputra Riverine Island Lifeline',
      status: 'RIVERINE CONVOY',
      progressPercent: 44,
      eta: '1h 15m',
      coldChainStatus: 'Ambient Hermetic Wrap',
      handoverAuthority: 'SDRF Sector Command',
    },
    {
      missionId: 'MIS-2026-084',
      commodity: 'Excavator Hydraulic Spares & Steel Bailey Pins',
      severity: 'P2 HIGH',
      originDepot: 'Hyderabad Bio-Logistics Hub (via Siliguri Gate)',
      crisisVAP: 'Rangpo 29th Mile VAP (Teesta Gorge, Sikkim)',
      assignedVehicle: 'Medium 8T Carrier (NER-MED-12)',
      corridorName: 'NH-10 Siliguri–Sevoke Highway',
      status: 'DISPATCHED',
      progressPercent: 22,
      eta: '3h 20m',
      coldChainStatus: 'Structural Cargo',
      handoverAuthority: 'BRO Project Swastik',
    },
    {
      missionId: 'MIS-2026-085',
      commodity: 'Emergency Cholera Diagnostic Kits & ORS',
      severity: 'P1 CRITICAL',
      originDepot: 'Patna FCI Reserve (via Guwahati Apex)',
      crisisVAP: 'Sairang Railhead VAP (Mizoram Frontier)',
      assignedVehicle: 'Heavy 16T Multi-Axle Carrier',
      corridorName: 'NH-6 Shillong–Silchar Arterial',
      status: 'EN ROUTE',
      progressPercent: 55,
      eta: '1h 45m',
      coldChainStatus: 'Insulated Pharma Carrier',
      handoverAuthority: 'Sairang Sub-Divisional Officer',
    },
  ]

  const filteredMissions = useMemo(() => {
    if (filterSeverity === 'ALL') return allMissions
    return allMissions.filter(m => m.severity.includes(filterSeverity))
  }, [allMissions, filterSeverity])

  // Priority Hazard Directives
  const dynamicAlerts = useMemo(() => {
    const alerts: Array<{
      id: string
      title: string
      authority: string
      detail: string
      severity: 'CRITICAL' | 'HIGH' | 'INFO'
      corridorName: string
      rerouteUrl: string
      badgeText: string
      reportingAuthority: string
      timestamp: string
    }> = []

    activeIncidents.forEach(inc => {
      const isCritical = inc.severity === 'critical' || inc.status === 'confirmed'
      const isHigh = inc.severity === 'high'
      if (isCritical || isHigh) {
        const typeStr = inc.type || (inc as any).incident_type || 'landslide'
        alerts.push({
          id: inc.id,
          title: `🔴 ${typeStr.toUpperCase()}: ${inc.route_name || 'Highway Corridor'}`,
          authority: inc.reported_by || 'Police Highway Patrol (Statutory Weight 9.5)',
          reportingAuthority: inc.reported_by || 'Police Highway Patrol (Statutory Weight 9.5)',
          detail: inc.description || 'Carriageway severed by mud & water overburden. Immediate diversion advised.',
          severity: isCritical ? 'CRITICAL' : 'HIGH',
          corridorName: inc.route_name || 'NH-27 Lumding–Haflong Road',
          rerouteUrl: `/map?route=${encodeURIComponent(inc.route_name || 'NH-27')}&incidentId=${inc.id}`,
          badgeText: isCritical ? 'SEVERANCE DIRECTIVE' : 'RESTRICTED PASSAGE',
          timestamp: formatDeterministicTime(inc.created_at || inc.reported_at, 'Live'),
        })
      }
    })

    if (alerts.length === 0) {
      alerts.push({
        id: 'seed-alert-01',
        title: '🔴 LANDSLIDE: NH-27 Lumding–Haflong Road (km 88 Jatinga)',
        authority: 'Dima Hasao Sector Police & GSI LEWS (Confidence: 94%)',
        reportingAuthority: 'Dima Hasao Sector Police & GSI LEWS (Confidence: 94%)',
        detail: 'Carriageway blocked by 400m mud overburden. Alternate bypass via Umrangso–Haflong vetted for 4x4 convoys.',
        severity: 'CRITICAL',
        corridorName: 'NH-27 Lumding–Haflong Road',
        rerouteUrl: '/map?route=NH-27%20Lumding–Haflong%20Road',
        badgeText: 'SEVERANCE DIRECTIVE',
        timestamp: '15:20 IST',
      })
    }

    return alerts
  }, [activeIncidents])

  // Handler for Admin approving police route feasibility assessment
  const handleApprovePoliceAssessment = (assessment: PoliceRouteAssessment) => {
    approveCorridorAndBroadcast({
      corridorId: assessment.id,
      corridorName: assessment.corridorName,
      assignedVehicleCategory: assessment.recommendedVehicleCategory,
      assignedVehicleName: `${assessment.recommendedVehicleCategory.replace(/_/g, ' ')} (Assigned by State EOC)`,
      assignedVehicleId: `VEH-DISPATCH-${Date.now().toString().slice(-4)}`,
      statutoryDirectiveText: `Statutory Route Clearance under BNSS Sec 187: ${assessment.corridorName} approved for ${assessment.recommendedVehicleCategory} relief operations. Assigned Police Pilot: ${assessment.reportedBy}.`,
      originHub: 'Guwahati Apex Logistics Hub',
      destinationTarget: `${assessment.sectorDistrict} Crisis VAP`,
      cargoType: 'Life-Saving Emergency Supplies',
      etaMinutes: 35,
      alongRouteThanas: [assessment.policeStation, 'Lumding PS', 'Guwahati Sadar PS'],
    })

    setApprovalNotice(`✅ Route Directive Approved & Broadcasted: "${assessment.corridorName}" assigned to ${assessment.recommendedVehicleCategory}. VHF CH-14 orders dispatched to along-route Thanas.`)
    setTimeout(() => setApprovalNotice(null), 8000)
  }

  const handleDispatchSOS = (sosId: string, citizenName: string) => {
    dispatchRescueToSOS(sosId, 'SDRF Quick Response Unit #04')
    setApprovalNotice(`🚑 Relief Convoy Dispatched to ${citizenName}! Field rescue team notified with GPS navigation vector.`)
    setTimeout(() => setApprovalNotice(null), 8000)
  }

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <div className="w-8 h-8 border-3 border-[#213d77] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          Verifying Apex Command Authorization...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-800 font-sans select-none">
      
      {/* ── 1. COMMAND CENTER TOP HEADER BAR ── */}
      <div className="gov-card p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded bg-[#213d77] flex items-center justify-center text-white shrink-0 shadow-xs border border-[#1b3162]">
              <Compass className="w-5 h-5 text-[#fb792b]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[#213d77] tracking-tight">
                  {dtr.hero_title}
                </h1>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[10.5px] font-mono font-bold px-2 py-0.5 rounded">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>ONLINE</span>
                </div>
                <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded font-mono border ${roleConfig?.color || 'bg-emerald-950 border-emerald-700 text-emerald-300'}`}>
                  {roleConfig?.icon || '🛡️'} {roleConfig?.shortBadge || 'Admin'} Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {dtr.hero_sub}
              </p>
            </div>
          </div>
        </div>

        {/* Top Right Action Quick Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMobileSimulatorOpen(true)}
            className="btn-irctc-primary text-xs px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{dtr.btn_sms_simulator}</span>
          </button>

          <Link
            href="/map"
            className="btn-irctc-navy text-xs px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 font-bold"
          >
            <span>🎯</span> {dtr.btn_live_map}
          </Link>

          {(roleConfig?.canAuthorizeMissions ?? true) && (
            <Link
              href="/missions"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 font-bold transition-colors"
            >
              <span>✅</span> {dtr.btn_authorize_missions}
            </Link>
          )}

          <Link
            href="/vehicles"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 font-bold transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>Vehicle Readiness Gate</span>
          </Link>
        </div>
      </div>

      {/* ── Operational Broadcast Banner (When corridor is approved) ── */}
      {approvalNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <strong className="block text-emerald-900 text-sm">STATUTORY CORRIDOR DIRECTIVE BROADCASTED</strong>
            <p className="text-xs text-emerald-800 leading-relaxed">{approvalNotice}</p>
          </div>
        </div>
      )}

      {/* ── 🚨 Police Crisis & Re-Route Alerts Banner ── */}
      {crisisZones.filter(z => z.workflowStatus === 'POLICE_REROUTE_REQUESTED' || z.workflowStatus === 'CRISIS_MARKED').map(zone => (
        <div key={zone.id} className="p-4 rounded-xl bg-rose-50 border-2 border-rose-500 text-rose-950 text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">🚨</span>
            <div className="space-y-0.5">
              <strong className="block text-rose-900 text-sm">
                {zone.workflowStatus === 'POLICE_REROUTE_REQUESTED'
                  ? `POLICE RE-ROUTE REQUEST: ${zone.title}`
                  : `NEW POLICE CRISIS ZONE: ${zone.title}`}
              </strong>
              <p className="text-xs text-rose-800 leading-relaxed font-normal">
                {zone.workflowStatus === 'POLICE_REROUTE_REQUESTED'
                  ? `OC ${zone.policeStation} reported assigned route compromised: "${zone.policeObstacleReport}". Immediate State EOC Re-Routing required!`
                  : `Marked by ${zone.policeStation} (${(zone.radiusMeters / 1000).toFixed(1)} km danger radius). Awaiting corridor directorship.`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {zone.workflowStatus === 'POLICE_REROUTE_REQUESTED' ? (
              <button
                onClick={() => adminRerouteCrisisZone({
                  zoneId: zone.id,
                  newRouteName: 'NH-2 Mao Sector / IAF MI-17 Rotary Airbridge',
                  newVehicleCategory: 'IAF_MI17_HELI_AIRLIFT',
                  newVehicleName: 'IAF Mi-17 V5 Heavy Airlift',
                  adminNotes: 'State EOC Admin executed tactical re-route to IAF Airbridge.',
                })}
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5 animate-pulse"
              >
                <span>🔄</span> Execute Re-Route (SMS Police)
              </button>
            ) : (
              <button
                onClick={() => adminAssignRouteToCrisisZone({
                  zoneId: zone.id,
                  assignedRouteName: 'NH-37 Tupul Bypass via North Ridge Footpath (km 48)',
                  assignedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
                  assignedVehicleName: 'Hill 4x4 Off-Road Bolero Fleet',
                  adminNotes: 'State EOC Admin designated 4x4 Hill Corridor.',
                })}
                className="bg-[#fb792b] hover:bg-[#e06820] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡</span> Designate Route (SMS Police)
              </button>
            )}
            <button
              onClick={() => resolveAndClearCrisisZone({
                zoneId: zone.id,
                officerName: 'State EOC Apex Command',
                resolutionNotes: 'Disaster zone declared resolved by EOC Admin.',
              })}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
            >
              <span>🎉</span> Resolved & Clear
            </button>
            <Link href="/map" className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors">
              View on Map 🗺️
            </Link>
          </div>
        </div>
      ))}

      {/* ── 2. LIVE OPERATIONAL TELEMETRY METRIC WIDGETS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: dtr.kpi_convoys_label,
            val: String(activeReliefConvoys),
            sub: '100% AIS-140 GPS Monitored',
            border: 'border-l-4 border-l-[#fb792b]',
            valColor: 'text-[#213d77]',
            icon: <Truck className="w-4 h-4 text-[#fb792b]" />,
          },
          {
            title: dtr.kpi_lifelines_label,
            val: `${totalPassableRoutes}/${totalCorridors}`,
            sub: `${Math.round((totalPassableRoutes / Math.max(1, totalCorridors)) * 100)}% Passable Arterials`,
            border: 'border-l-4 border-l-emerald-600',
            valColor: 'text-emerald-700',
            icon: <Compass className="w-4 h-4 text-emerald-600" />,
          },
          {
            title: dtr.kpi_hazards_label,
            val: String(priorityHazardCount),
            sub: 'Statutory Weight 9.5 Police Verified',
            border: 'border-l-4 border-l-red-600',
            valColor: 'text-red-700',
            icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
          },
          {
            title: dtr.kpi_porters_label,
            val: String(lastMilePortersActive),
            sub: 'Non-Roadhead Foot Relays',
            border: 'border-l-4 border-l-blue-600',
            valColor: 'text-[#213d77]',
            icon: <Activity className="w-4 h-4 text-blue-600" />,
          },
        ].map(kpi => (
          <div key={kpi.title} className={`gov-card p-4 sm:p-5 bg-white ${kpi.border} shadow-xs`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
              {kpi.icon}
            </div>
            <p className={`text-2xl sm:text-3xl font-black font-mono mt-1 tracking-tight ${kpi.valColor}`}>{kpi.val}</p>
            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* ── 3. MAIN WORKFLOW: RELIEF MISSIONS (LEFT 8 COLS) + INGESTION FEED & DIRECTIVES (RIGHT 4 COLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT 8 COLS: RELIEF MISSIONS DEPLOYMENT TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="gov-card p-4 sm:p-5 space-y-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#fb792b]" />
                  <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#213d77]">
                    {dtr.missions_table_title}
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {dtr.missions_table_sub}
                </p>
              </div>

              {/* Severity Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded text-xs font-mono font-bold">
                {[
                  { key: 'ALL', label: dtr.filter_all },
                  { key: 'CRITICAL', label: dtr.filter_critical },
                  { key: 'HIGH', label: dtr.filter_high },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilterSeverity(key as any)}
                    className={`px-3 py-1 rounded transition-all cursor-pointer ${
                      filterSeverity === key ? 'bg-[#213d77] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop Missions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">{dtr.th_id_cargo}</th>
                    <th className="py-2.5 px-3">{dtr.th_severity}</th>
                    <th className="py-2.5 px-3">{dtr.th_origin_vap}</th>
                    <th className="py-2.5 px-3">{dtr.th_vehicle_mode}</th>
                    <th className="py-2.5 px-3">{dtr.th_status}</th>
                    <th className="py-2.5 px-3">{dtr.th_progress_eta}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11.5px]">
                  {filteredMissions.map(m => (
                    <tr
                      key={m.missionId}
                      onClick={() => router.push(`/map?route=${encodeURIComponent(m.corridorName)}`)}
                      className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
                      title="Click to view live corridor and tactical bypass on Map"
                    >
                      <td className="py-3 px-3 font-mono font-black text-[#213d77] group-hover:text-[#fb792b] whitespace-nowrap transition-colors">
                        {m.missionId}
                        <span className="block text-[11px] font-sans font-normal text-slate-600 mt-0.5">
                          {cargoMap[m.missionId] || m.commodity}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                            m.severity.includes('P1')
                              ? 'bg-red-100 border-red-300 text-red-800'
                              : 'bg-amber-100 border-amber-300 text-amber-800'
                          }`}
                        >
                          {m.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3 min-w-[200px]">
                        <strong className="text-slate-900 block font-bold text-[11.5px]">{m.crisisVAP}</strong>
                        <span className="text-[10.5px] text-[#213d77] font-medium block mt-0.5">{m.originDepot}</span>
                        <span className="text-[10px] text-amber-800 font-mono font-semibold block mt-0.5">{m.coldChainStatus}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block text-[11.5px]">{m.assignedVehicle}</span>
                        <span className="text-[10.5px] text-emerald-700 font-mono font-semibold">{m.handoverAuthority}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase bg-blue-50 text-[#213d77] border-blue-200">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 min-w-[130px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10.5px] font-mono">
                            <span className="font-bold text-slate-800">{m.progressPercent}%</span>
                            <span className="text-emerald-700 font-bold">ETA {m.eta}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#213d77] transition-all duration-300"
                              style={{ width: `${m.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {dtr.showing_missions.replace('{count}', String(filteredMissions.length))}
              </span>
              <Link href="/map" className="text-[#213d77] hover:text-[#fb792b] font-bold flex items-center gap-1 text-[11.5px]">
                {dtr.btn_view_full_map} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLS: CENTRAL INGESTION FEED & STATUTORY HAZARD ALERTS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="gov-card p-4 sm:p-5 space-y-3.5 bg-white border border-slate-200 rounded-lg shadow-xs">
            
            {/* Header Tabs: Police Field Reports vs Citizen SOS vs Hazard Alerts */}
            <div className="border-b border-slate-200 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#213d77] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#fb792b] animate-pulse" />
                  Central Ingestion Feed
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded text-[10px] font-mono font-bold">
                <button
                  type="button"
                  onClick={() => setActiveRightTab('POLICE_FEED')}
                  className={`py-1 px-1 text-center rounded transition-all cursor-pointer truncate ${
                    activeRightTab === 'POLICE_FEED'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👮 Police ({assessments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('REQUISITIONS')}
                  className={`py-1 px-1 text-center rounded transition-all cursor-pointer truncate ${
                    activeRightTab === 'REQUISITIONS'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📦 Demands ({supplyRequisitions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('CITIZEN_SOS')}
                  className={`py-1 px-1 text-center rounded transition-all cursor-pointer truncate ${
                    activeRightTab === 'CITIZEN_SOS'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🆘 SOS ({sosRequests.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('ALERTS')}
                  className={`py-1 px-1 text-center rounded transition-all cursor-pointer truncate ${
                    activeRightTab === 'ALERTS'
                      ? 'bg-[#213d77] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚠️ Alerts ({dynamicAlerts.length})
                </button>
              </div>
            </div>

            {/* TAB 1: POLICE SECTOR ROUTE FEASIBILITY STREAM */}
            {activeRightTab === 'POLICE_FEED' && (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                {assessments.map(assessment => (
                  <div
                    key={assessment.id}
                    className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-blue-200/60 pb-1">
                      <span className="font-mono text-[10px] font-black uppercase text-blue-900">
                        {assessment.passability === 'RESTRICTED_4X4' ? '🟠 RESTRICTED (4x4 ONLY)' : assessment.passability === 'BLOCKED' ? '🔴 BLOCKED SECTOR' : '🟢 PASSABLE'}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-500">{assessment.timestamp}</span>
                    </div>

                    <div>
                      <strong className="text-slate-900 text-xs block">{assessment.corridorName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono">From: {assessment.reportedBy}</span>
                    </div>

                    <div className="bg-white p-2 rounded border border-blue-100 space-y-1">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="text-slate-500">Recommended Mode:</span>
                        <span className="font-mono font-bold text-blue-800">{assessment.recommendedVehicleCategory}</span>
                      </div>
                      {assessment.equipmentNeeds.length > 0 && (
                        <div className="text-[10.5px] text-slate-600">
                          <span>Needs: <strong>{assessment.equipmentNeeds.join(', ')}</strong></span>
                        </div>
                      )}
                      <p className="text-[10.5px] text-slate-700 italic">{assessment.hazardDescription}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-blue-800 font-bold">
                        {assessment.status === 'APPROVED_BY_ADMIN' ? '✅ DIRECTIVE ACTIVE' : '⏳ AWAITING ARBITRATION'}
                      </span>
                      {assessment.status !== 'APPROVED_BY_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => handleApprovePoliceAssessment(assessment)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10.5px] px-2.5 py-1 rounded shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>🔀</span> Approve Route & Directives
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: CITIZEN SOS DISTRESS QUEUE */}
            {activeRightTab === 'CITIZEN_SOS' && (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                {sosRequests.map(sos => (
                  <div
                    key={sos.id}
                    className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-rose-200/60 pb-1">
                      <span className="font-mono text-[10px] font-black uppercase text-rose-900 flex items-center gap-1">
                        <span>🚨</span> {sos.headcount} CIVILIANS STRANDED
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-500">{sos.timestamp}</span>
                    </div>

                    <div>
                      <strong className="text-slate-900 text-xs block">{sos.citizenName}</strong>
                      <span className="text-[10.5px] text-slate-600 block">{sos.landmark}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {sos.needs.map(need => (
                        <span key={need} className="bg-rose-100 text-rose-800 text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border border-rose-200">
                          {need}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">
                        {sos.status === 'EN_ROUTE' ? `🚑 ${sos.dispatchedUnit}` : '⏳ PENDING RELIEF'}
                      </span>
                      {sos.status !== 'EN_ROUTE' && (
                        <button
                          type="button"
                          onClick={() => handleDispatchSOS(sos.id, sos.citizenName)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10.5px] px-2.5 py-1 rounded shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>🚑</span> Dispatch Relief Convoy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2B: CITIZEN ESSENTIALS REQUISITIONS QUEUE */}
            {activeRightTab === 'REQUISITIONS' && (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar text-xs">
                {supplyRequisitions.map(req => (
                  <div
                    key={req.id}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-1">
                      <span className="font-mono text-[10px] font-black uppercase text-amber-950 flex items-center gap-1">
                        <span>📦</span> {req.id} • {req.priority}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-500">{req.timestamp}</span>
                    </div>

                    <div>
                      <strong className="text-slate-900 text-xs block">{req.citizenName} ({req.contactPhone})</strong>
                      <span className="text-[10.5px] text-slate-600 block">{req.landmark} • {req.familyCount} PAX</span>
                    </div>

                    <div className="bg-white p-2 rounded border border-amber-100 space-y-1">
                      <div className="text-[10.5px] text-slate-700">
                        <span>Category: <strong>{req.category.replace(/_/g, ' ')}</strong></span>
                      </div>
                      <p className="text-[10.5px] text-slate-800 font-sans italic">{req.specificItems}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-600 font-bold">
                        {req.status === 'DISPATCHED_BY_ADMIN' ? `🚚 ${req.assignedUnit}` : req.status === 'VERIFIED_BY_POLICE' ? '✅ POLICE VERIFIED' : '⏳ PENDING REVIEW'}
                      </span>
                      {req.status !== 'DISPATCHED_BY_ADMIN' && (
                        <button
                          type="button"
                          onClick={() => {
                            adminDispatchSupplyConvoy({
                              reqId: req.id,
                              vehicleId: 'TRK-NER-01',
                              destinationVAP: req.landmark,
                              etaMinutes: 28,
                              vehicleName: 'Hill 4x4 Bolero Fleet #04',
                              driverPhone: '+91 94350-88122',
                              itemsManifest: req.specificItems,
                            })
                            setApprovalNotice(`🚚 Dispatched Bolero-04 for Requisition ${req.id}! Citizens & Police notified.`)
                            setTimeout(() => setApprovalNotice(null), 8000)
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-black text-[10.5px] px-2.5 py-1 rounded shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <span>🚚</span> Dispatch Convoy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: STATUTORY HAZARD DIRECTIVES & ENGAGE BYPASS */}
            {activeRightTab === 'ALERTS' && (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                {dynamicAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded border space-y-1.5 transition-all ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-50/80 border-red-200 text-red-950'
                        : alert.severity === 'HIGH'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-black/5 pb-1">
                      <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider">
                        {alert.badgeText}
                      </span>
                      <span className="text-[9.5px] font-mono text-slate-500 flex items-center gap-1" suppressHydrationWarning>
                        <Clock className="w-3 h-3 text-slate-400" /> {alert.timestamp}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-xs text-slate-900 leading-tight">
                        {alert.title}
                      </h3>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
                        {dtr.authority_label} <strong className="text-slate-800">{alert.reportingAuthority}</strong>
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed font-sans">
                      {alert.detail}
                    </p>

                    <div className="pt-1 flex justify-end">
                      <Link
                        href={alert.rerouteUrl}
                        className="bg-[#213d77] hover:bg-[#1b3162] text-white text-[10.5px] font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-xs transition-all"
                      >
                        <span>🔀</span> {dtr.btn_engage_bypass}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Floating Interactive Live Mobile Notification & SMS Receiver Widget */}
      <LiveMobileNotificationSimulator
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        initialRole="admin"
      />
    </div>
  )
}