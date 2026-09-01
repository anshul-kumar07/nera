'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Shield,
  ShieldCheck,
  Truck,
  MapPin,
  AlertTriangle,
  Radio,
  FileText,
  Clock,
  CheckCircle,
  Compass,
  ArrowRight,
  Check,
  Send,
  Sparkles,
  Phone,
  Flame,
  LifeBuoy,
  Tent,
  Navigation,
  Wrench,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { useUserRole, useRequireRole } from '@/lib/RoleContext'
import { useRealtimeIncidents } from '@/hooks/useRealtimeIncidents'
import { useDisasterComms, PassabilityStatus, PoliceRouteAssessment } from '@/lib/disaster-comms-store'
import { VehicleCategory, VEHICLE_CONSTRAINTS } from '@/lib/vehicle-suitability-matrix'
import LiveMobileNotificationSimulator from '@/components/LiveMobileNotificationSimulator'
import { POLICE_I18N } from './police-i18n'

export default function PolicePortalPage() {
  const { isAuthorized, isLoaded } = useRequireRole(['POLICE_OFFICER', 'FIELD_COMMANDER', 'APEX_ADMIN'])
  const { language, t } = useLanguage()
  const { currentRole, setRole, roleConfig } = useUserRole()
  const { activeIncidents, reportIncident } = useRealtimeIncidents()
  const {
    crisisZones,
    assessments,
    activeCorridor,
    beacons,
    supplyRequisitions,
    citizenIncidents,
    submitPoliceAssessment,
    dispatchRescueToBeacon,
    removePoliceCrisisZone,
    resolveAndClearCrisisZone,
    policeVerifyRoute,
    policeRequestReroute,
    adminAssignRouteToCrisisZone,
    adminRerouteCrisisZone,
    policeVerifyAndForwardRequisition,
    policePushRouteDirective,
  } = useDisasterComms()

  const ptr = useMemo(() => POLICE_I18N[language] || POLICE_I18N.en, [language])

  // Floating SMS Terminal State
  const [isSmsTerminalOpen, setIsSmsTerminalOpen] = useState(false)

  // Highway Disruption & Feasibility Reporting Form State
  const [selectedCorridor, setSelectedCorridor] = useState('NH-27 Trans-Assam Express (Dima Hasao Sector)')
  const [passability, setPassability] = useState<PassabilityStatus>('RESTRICTED_4X4')
  const [recommendedVehicleCategory, setRecommendedVehicleCategory] = useState<VehicleCategory>('HILL_4X4_OFFROAD_2T')
  const [equipmentNeeds, setEquipmentNeeds] = useState<string[]>(['JCB Excavator', 'Police Pilot Escort'])
  const [hazardType, setHazardType] = useState('landslide')
  const [severity, setSeverity] = useState<'critical' | 'high'>('critical')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [optimisticNotice, setOptimisticNotice] = useState<string | null>(null)
  const [officerName, setOfficerName] = useState('OC Inspector R. Barman (Haflong Sadar PS)')

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          Verifying Police Sector Credentials...
        </p>
      </div>
    )
  }

  const handleReportDisruption = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // 1. Submit to unified disaster comms store
    submitPoliceAssessment({
      corridorName: selectedCorridor,
      corridorKey: selectedCorridor.includes('NH-27') ? 'NH-27' : selectedCorridor.includes('NH-6') ? 'NH-6' : 'NH-10',
      sectorDistrict: 'Dima Hasao / Barak Valley',
      policeStation: 'Haflong Sadar PS',
      reportedBy: officerName,
      passability: passability,
      recommendedVehicleCategory: recommendedVehicleCategory,
      equipmentNeeds: equipmentNeeds,
      hazardDescription: description || `Ground reality verified by Sector OC: ${passability} due to ${hazardType}. Recommends ${recommendedVehicleCategory}.`,
      lat: 25.1833,
      lng: 93.0167,
    })

    // 2. Transmit incident to database / map
    try {
      await reportIncident({
        route_name: selectedCorridor,
        type: hazardType,
        severity: severity,
        status: 'reported',
        description: `${description || 'Passability restricted'} | Recommended Transport: ${recommendedVehicleCategory} | Equipment: ${equipmentNeeds.join(', ')}`,
        reported_by: officerName,
        lat: 25.1833,
        lng: 93.0167,
      })
    } catch {
      // local fallback
    }

    setOptimisticNotice(`✅ Sector Route Feasibility & Vehicle Requirement Transmitted to State EOC Admin! Priority weight 9.5 tagged.`)
    setDescription('')
    setIsSubmitting(false)

    setTimeout(() => {
      setOptimisticNotice(null)
    }, 8000)
  }

  const handleDispatchSDRF = (beaconId: string, beaconName: string) => {
    dispatchRescueToBeacon(beaconId, 'SDRF Quick Response Team-02 (Haflong)', officerName)
    setOptimisticNotice(`🚨 SDRF Quick Response Team dispatched to evacuation beacon "${beaconName}"! Navigation vector locked on VHF CH-14.`)
    setTimeout(() => setOptimisticNotice(null), 8000)
  }

  const EQUIPMENT_OPTIONS = [
    'JCB Excavator',
    'Bailey Bridge Spares',
    'Police Pilot Escort',
    'Winch Recovery Truck',
    'SDRF Motorized BAUT Boat',
    'Airbridge Landing Officer',
  ]

  return (
    <div className="space-y-6 text-slate-800 font-sans select-none max-w-7xl mx-auto px-4 sm:px-6 py-4">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#1b3162] via-[#213d77] to-[#0f172a] rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-2xl">
              👮
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {ptr.portal_title}
                </h1>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-400/40">
                  {ptr.rank_badge}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {ptr.jurisdiction_sub}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsSmsTerminalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-blue-400/40"
            >
              <Phone className="w-4 h-4 text-emerald-300 animate-bounce" />
              <span>Police SMS Radio</span>
            </button>

            <Link
              href="/map"
              className="bg-[#fb792b] hover:bg-[#e06820] text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{ptr.launch_map}</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-white/10 p-2.5 rounded-lg border border-white/10 flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <div>
              <span className="text-[10px] text-blue-200 uppercase font-bold block">{ptr.vhf_label}</span>
              <strong className="text-white font-mono text-xs">{ptr.vhf_val}</strong>
            </div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-lg border border-white/10 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
            <div>
              <span className="text-[10px] text-blue-200 uppercase font-bold block">{ptr.mandate_label}</span>
              <strong className="text-white font-mono text-xs">{ptr.mandate_val}</strong>
            </div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-lg border border-white/10 flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-[#fb792b] shrink-0" />
            <div>
              <span className="text-[10px] text-blue-200 uppercase font-bold block">{ptr.convoys_label}</span>
              <strong className="text-white font-mono text-xs">{ptr.convoys_val}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Optimistic UI Notice Banner */}
      {optimisticNotice && (
        <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-600 text-blue-950 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <strong className="block text-blue-900 text-sm">STATUTORY DIRECTIVE RECORDED</strong>
            <p className="text-xs text-blue-800 leading-relaxed">{optimisticNotice}</p>
          </div>
        </div>
      )}

      {/* 2-Column Police Command Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: ROUTE FEASIBILITY & TERRAIN VEHICLE RECOMMENDATION FORM */}
        <div className="lg:col-span-7 space-y-4">
          <div className="gov-card p-4 sm:p-5 space-y-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wide">
                  {ptr.report_disruption_title}
                </h2>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                {ptr.report_disruption_sub}
              </p>
            </div>

            <form onSubmit={handleReportDisruption} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{ptr.corridor_label}</label>
                  <select
                    value={selectedCorridor}
                    onChange={e => setSelectedCorridor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="NH-27 Trans-Assam Express (Dima Hasao Sector)">NH-27 Trans-Assam Express (Dima Hasao Sector)</option>
                    <option value="NH-6 Shillong–Jowai–Silchar Arterial">NH-6 Shillong–Jowai–Silchar Arterial</option>
                    <option value="NH-10 Siliguri–Sevoke–Teesta Gorge">NH-10 Siliguri–Sevoke–Teesta Gorge</option>
                    <option value="NH-37 Tupul Mountain Road (Manipur Sector)">NH-37 Tupul Mountain Road (Manipur Sector)</option>
                    <option value="Kamalabari Ferry Terminal & Approach Road">Kamalabari Ferry Terminal & Approach Road (Majuli)</option>
                  </select>
                </div>

                {/* Passability Selector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{ptr.passability_label}</label>
                  <select
                    value={passability}
                    onChange={e => setPassability(e.target.value as PassabilityStatus)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="PASSABLE">🟢 PASSABLE (All heavy vehicles)</option>
                    <option value="RESTRICTED_4X4">🟠 RESTRICTED (4x4 Off-Road / Porters Only)</option>
                    <option value="BLOCKED">🔴 BLOCKED (Total Road Severance)</option>
                  </select>
                </div>
              </div>

              {/* Trained Vehicle Recommendation Selector */}
              <div className="space-y-1 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                <label className="font-black text-amber-950 uppercase text-[10.5px] flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#fb792b]" />
                  <span>{ptr.vehicle_recommendation_label}</span>
                </label>
                <select
                  value={recommendedVehicleCategory}
                  onChange={e => setRecommendedVehicleCategory(e.target.value as VehicleCategory)}
                  className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#fb792b]"
                >
                  <option value="HEAVY_MULTI_AXLE_16T">🚛 Heavy Multi-Axle 16T–24T (Paved Highway & Class 24 Bridge)</option>
                  <option value="MEDIUM_RELIEF_CARRIER_8T">🚚 Medium Relief Carrier 8T (State Highway & Class 18 Bailey Bridge)</option>
                  <option value="HILL_4X4_OFFROAD_2T">🚙 Hill 4x4 Off-Road Bolero Camper (Steep Slope / Mud / Rainfall &gt; 60mm)</option>
                  <option value="RIVERINE_BOAT_BAUT">🚤 SDRF Motorized Assault Boat BAUT (Riverine Island / Inundation &gt; 0.8m)</option>
                  <option value="IAF_MI17_HELI_AIRLIFT">🚁 IAF Mi-17 V5 Rotary Airbridge (Deep Mountain Gorge / Highway Severed &gt; 12h)</option>
                  <option value="ALH_DHRUV_MOUNTAIN_HELI">🚁 ALH Dhruv Light Helicopter (High Altitude Valley Evacuation)</option>
                  <option value="DISASTER_CARGO_DRONE">🛸 Disaster Cargo UAV Drone (Critical Blood/Anti-Venom to Isolated Outposts)</option>
                  <option value="FOOT_RESCUE_PORTER">🚶 Tactical Foot Rescue Porters & Village Defence Parties (Non-Roadhead Trails)</option>
                </select>
                <p className="text-[10.5px] text-amber-800 font-medium pt-1">
                  💡 Max Capacity: <strong>{VEHICLE_CONSTRAINTS[recommendedVehicleCategory]?.payloadCapacityKg} kg</strong> • Max Slope: <strong>{VEHICLE_CONSTRAINTS[recommendedVehicleCategory]?.maxSlopeGradientDeg}°</strong>
                </p>
              </div>

              {/* Equipment Needs Pill Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">{ptr.equipment_needs_label}</label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map(eq => {
                    const isSelected = equipmentNeeds.includes(eq)
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => {
                          if (isSelected) setEquipmentNeeds(prev => prev.filter(item => item !== eq))
                          else setEquipmentNeeds(prev => [...prev, eq])
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#213d77] text-white border-[#213d77]'
                            : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '} {eq}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">{ptr.hazard_type_label}</label>
                  <select
                    value={hazardType}
                    onChange={e => setHazardType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                  >
                    <option value="landslide">⛰️ Sudden Hill Slope Landslide</option>
                    <option value="flood">🌊 River Breach & Waterlogging</option>
                    <option value="bridge_damage">🌉 Culvert Scour / Bridge Weight Gating</option>
                    <option value="debris">💥 Falling Boulders & Road Debris</option>
                    <option value="mud_silt">🛑 Heavy Mud Silt & Axle Sinking</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Duty Officer / Reporting Thana</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={e => setOfficerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{ptr.desc_label}</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder={ptr.desc_placeholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#1b3162] hover:bg-[#213d77] text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#fb792b]" />
                <span>{isSubmitting ? ptr.submitting : ptr.submit_btn}</span>
              </button>
            </form>
          </div>

          {/* RESCUE & EVACUATION QUEUE (CROWDSOURCED BEACONS) */}
          <div className="gov-card p-4 sm:p-5 space-y-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-rose-600" />
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                    {ptr.rescue_queue_title} ({beacons.length})
                  </h2>
                  <p className="text-slate-500 text-xs">{ptr.rescue_queue_sub}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300">
                SDRF STANDBY
              </span>
            </div>

            <div className="space-y-3">
              {beacons.map(beacon => (
                <div
                  key={beacon.id}
                  className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2 hover:border-rose-400 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                        <span>⛺</span> {beacon.name}
                      </strong>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Reported by: <strong>{beacon.markedBy}</strong> ({beacon.timestamp})
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black text-rose-900 bg-rose-100 border border-rose-300 px-2 py-1 rounded shrink-0">
                      {beacon.evacueeCount} CIVILIANS
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed bg-white/80 p-2 rounded-lg border border-rose-100">
                    {beacon.notes}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] flex-wrap gap-2">
                    <div className="flex items-center gap-2 font-semibold">
                      {beacon.waterAvailable && <span className="text-blue-700">💧 Water OK</span>}
                      {beacon.shelterAvailable && <span className="text-emerald-700">🏠 Shelter OK</span>}
                      {beacon.medicalNeeds && <span className="text-rose-700 font-bold">⚠️ Urgent Medical</span>}
                    </div>

                    {beacon.rescueTeamDispatched ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded text-[10.5px] border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Team Dispatched ({beacon.dispatchedTeamName})
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDispatchSDRF(beacon.id, beacon.name)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-black px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <LifeBuoy className="w-3.5 h-3.5" /> {ptr.dispatch_rescue_btn}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🚨 INCOMING CITIZEN REQUISITIONS & LIVE GROUND INTEL QUEUE */}
          <div className="gov-card p-4 sm:p-5 space-y-4 bg-white border-2 border-amber-300 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📦</span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                    Live Citizen Requisitions & Ground Intel ({supplyRequisitions.length + citizenIncidents.length})
                  </h3>
                  <p className="text-amber-800 text-xs mt-0.5">
                    Urgent citizen needs and crowdsourced ground-truth hazard reports
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmsTerminalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>📱</span> Open Police SMS Radio
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {/* Supply Requisitions */}
              {supplyRequisitions.map(req => (
                <div key={req.id} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded border border-amber-300">
                      {req.id} • {req.priority}
                    </span>
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded border ${
                      req.status === 'VERIFIED_BY_POLICE'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : req.status === 'DISPATCHED_BY_ADMIN'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    }`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium">
                    <strong>Citizen:</strong> {req.citizenName} ({req.contactPhone}) • <strong>PAX:</strong> {req.familyCount}
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    <strong>Landmark:</strong> {req.landmark} | <strong>Category:</strong> {req.category.replace(/_/g, ' ')}
                  </p>
                  <p className="text-[11px] text-slate-800 bg-white/90 p-2 rounded-lg border border-amber-200 font-sans">
                    <strong>Specific Items:</strong> {req.specificItems}
                  </p>

                  {req.status === 'PENDING_POLICE_REVIEW' && (
                    <button
                      onClick={() => {
                        policeVerifyAndForwardRequisition(req.id, 'Verified on ground by Sector Police OC. Immediate dispatch required.');
                        setOptimisticNotice(`✅ Verified Requisition ${req.id}! Tactical directive transmitted to State EOC Admin.`);
                        setTimeout(() => setOptimisticNotice(null), 8000);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Verify & Transmit Directive to State EOC Admin
                    </button>
                  )}
                </div>
              ))}

              {/* Crowdsourced Ground Incidents */}
              {citizenIncidents.map(inc => (
                <div key={inc.id} className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-rose-950 bg-rose-200/80 px-2 py-0.5 rounded border border-rose-300">
                      📢 {inc.id} • {inc.severity}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{inc.reportedAt}</span>
                  </div>
                  <p className="text-slate-800">
                    <strong>Category:</strong> {inc.incidentCategory.replace(/_/g, ' ')} at {inc.locationLandmark}
                  </p>
                  <p className="text-slate-700 text-[11px] bg-white/90 p-2 rounded border border-rose-100 italic">
                    "{inc.description}" (Reported by: {inc.citizenName})
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT 5 COLS: ADMIN CHOSEN CORRIDOR DIRECTIVES & VHF CHECKPOINTS */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CORRIDOR EXECUTION HUD (ADMIN CHOICE) */}
          <div className="gov-card p-4 sm:p-5 space-y-3.5 bg-gradient-to-br from-slate-900 via-[#1b3162] to-[#213d77] text-white rounded-xl shadow-md border-2 border-blue-400/40">
            <div className="border-b border-white/20 pb-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-black block">
                ⚡ OFFICIAL STATE EOC DIRECTIVE
              </span>
              <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                {ptr.corridor_execution_title}
              </h3>
              <p className="text-blue-200 text-xs mt-0.5">
                {ptr.corridor_execution_sub}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-black/30 p-2.5 rounded-lg border border-white/10 space-y-1">
                <span className="text-[10px] text-blue-200 uppercase font-bold block">Approved Corridor</span>
                <strong className="text-white text-xs block">{activeCorridor.corridorName}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 p-2 rounded-lg border border-white/10">
                  <span className="text-[9.5px] text-blue-200 uppercase block font-bold">Assigned Mode</span>
                  <strong className="text-amber-300 font-mono text-xs block">{activeCorridor.assignedVehicleName}</strong>
                </div>
                <div className="bg-black/30 p-2 rounded-lg border border-white/10">
                  <span className="text-[9.5px] text-blue-200 uppercase block font-bold">Target ETA</span>
                  <strong className="text-emerald-300 font-mono text-xs block">{activeCorridor.etaMinutes} Mins</strong>
                </div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-lg border border-white/10 space-y-1">
                <span className="text-[10px] text-amber-300 uppercase font-bold block">Statutory Directive</span>
                <p className="text-[11px] text-white leading-relaxed">{activeCorridor.statutoryDirectiveText}</p>
              </div>

              <div className="pt-1 text-[10.5px] text-blue-200 flex items-center justify-between border-t border-white/10">
                <span>Approved By: <strong>{activeCorridor.approvedBy}</strong></span>
                <span className="font-mono text-amber-300">{activeCorridor.approvedAt}</span>
              </div>
            </div>
          </div>

          {/* 🚨 POLICE DECLARED CRISIS DANGER PERIMETERS */}
          <div className="gov-card p-4 sm:p-5 space-y-3 bg-white border-2 border-rose-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-rose-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <h3 suppressHydrationWarning className="text-xs sm:text-sm font-black text-rose-950 uppercase tracking-wide">
                    Disaster Crisis Danger Perimeters ({crisisZones.length})
                  </h3>
                  <p className="text-rose-700 text-xs mt-0.5">Statutory red evacuation danger circles broadcasted</p>
                </div>
              </div>
              <Link
                href="/map"
                className="text-[10.5px] font-bold bg-rose-600 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-2xs"
              >
                <span>+ Mark on Map</span>
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              {crisisZones.map(zone => (
                <div
                  key={zone.id}
                  className="p-3.5 rounded-xl border-2 border-rose-300 bg-rose-50/70 space-y-2.5 text-xs shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-slate-900 font-black text-xs block">
                        {zone.title}
                      </strong>
                      <span className="text-xs text-rose-800 font-semibold block mt-0.5">
                        {zone.hazardType}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono text-xs font-black text-rose-900 bg-rose-200 border border-rose-400 px-2 py-0.5 rounded">
                        {(zone.radiusMeters / 1000).toFixed(1)} KM RADIUS
                      </span>
                      <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border ${
                        zone.workflowStatus === 'POLICE_VERIFIED'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : zone.workflowStatus === 'POLICE_REROUTE_REQUESTED'
                          ? 'bg-rose-100 text-red-900 border-rose-400 animate-pulse'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}>
                        {zone.workflowStatus}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Route from Admin */}
                  {zone.assignedRouteName ? (
                    <div className="bg-white p-2 rounded-lg border border-rose-200 space-y-0.5">
                      <span className="text-[10.5px] uppercase font-bold text-slate-500 block">Admin Assigned Route:</span>
                      <p className="text-xs font-bold text-slate-900">{zone.assignedRouteName} ({zone.assignedVehicleName})</p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-800 italic bg-amber-50 p-2 rounded border border-amber-200">
                      ⏳ Awaiting State EOC Admin to assign relief supply corridor.
                    </p>
                  )}

                  {zone.policeObstacleReport && (
                    <div className="bg-rose-100 p-2 rounded-lg border border-rose-300 text-rose-950 font-semibold text-xs">
                      🛑 <strong>Reported Obstacle:</strong> "{zone.policeObstacleReport}"
                    </div>
                  )}

                  {zone.reroutedRouteName && (
                    <div className="bg-emerald-100 p-2 rounded-lg border border-emerald-300 text-emerald-950 font-bold text-xs">
                      🔄 <strong>Admin Re-Route Assigned:</strong> {zone.reroutedRouteName} ({zone.reroutedVehicleName})
                    </div>
                  )}

                  {/* Police Action Buttons */}
                  <div className="pt-1 flex gap-1.5">
                    {zone.workflowStatus === 'CRISIS_MARKED' && (
                      <button
                        onClick={() => adminAssignRouteToCrisisZone({
                          zoneId: zone.id,
                          assignedRouteName: 'NH-37 Tupul Bypass via North Ridge Footpath (km 48)',
                          assignedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
                          assignedVehicleName: 'Hill 4x4 Off-Road Bolero Fleet',
                          adminNotes: 'State EOC Admin designated 4x4 Hill Corridor.',
                        })}
                        className="flex-1 bg-[#fb792b] hover:bg-[#e06820] text-white font-bold py-2 px-2.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <span>⚡</span> Simulate Admin Giving Route
                      </button>
                    )}

                    {(zone.workflowStatus === 'ROUTE_ASSIGNED' || zone.workflowStatus === 'ADMIN_REROUTED') && (
                      <>
                        <button
                          onClick={() => policeVerifyRoute({
                            zoneId: zone.id,
                            officerName: 'OC Inspector R. Barman (Sector Police)',
                            notes: 'Ground passable. Clear for convoy transit.',
                          })}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>✅</span> Verify Passable (SMS Admin)
                        </button>
                        <button
                          onClick={() => policeRequestReroute({
                            zoneId: zone.id,
                            officerName: 'OC Inspector R. Barman (Sector Police)',
                            obstacleDescription: 'Culvert collapsed at km 94. Cannot take 4x4. Request Airbridge.',
                          })}
                          className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-bold py-2 px-2.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>🛑</span> Issue / Re-Route (SMS Admin)
                        </button>
                      </>
                    )}

                    {zone.workflowStatus === 'POLICE_REROUTE_REQUESTED' && (
                      <button
                        onClick={() => adminRerouteCrisisZone({
                          zoneId: zone.id,
                          newRouteName: 'NH-2 Mao Sector / IAF MI-17 Rotary Airbridge',
                          newVehicleCategory: 'IAF_MI17_HELI_AIRLIFT',
                          newVehicleName: 'IAF Mi-17 V5 Heavy Airlift',
                          adminNotes: 'State EOC Admin re-routed to Mi-17 Airbridge.',
                        })}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-2.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer animate-pulse"
                      >
                        <span>🔄</span> Admin: Re-Route to IAF Airbridge
                      </button>
                    )}

                    {zone.workflowStatus === 'POLICE_VERIFIED' && (
                      <div className="w-full text-center py-1.5 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-900 font-bold text-xs">
                        ✅ Corridor Ground Verified by Police. Convoy rolling.
                      </div>
                    )}
                  </div>

                  {/* 🎉 Police Officer: Mark Issue Resolved & Clear Crisis Area from Map */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        resolveAndClearCrisisZone({
                          zoneId: zone.id,
                          officerName: officerName,
                          resolutionNotes: 'Field crisis cleared and highway reopened.',
                        })
                        setOptimisticNotice(`🎉 Crisis hazard at "${zone.title}" marked as RESOLVED! Red danger perimeter and crisis route cleared from the live map.`)
                        setTimeout(() => setOptimisticNotice(null), 8000)
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>🎉</span>
                      <span>✅ Issue Resolved (Clear Crisis Area from Map)</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-rose-200/70 text-xs text-slate-500 font-mono">
                    <span>{zone.policeStation} • {zone.timestamp}</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/map"
                        className="text-rose-700 hover:text-rose-900 font-bold underline font-sans"
                      >
                        Inspect on Map 🗺️
                      </Link>
                      <button
                        onClick={() => removePoliceCrisisZone(zone.id)}
                        className="text-slate-400 hover:text-rose-700 font-bold font-sans cursor-pointer"
                        title="Decommission Crisis Danger Zone"
                      >
                        Decommission 🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE VHF RADIO CHECKPOINTS */}
          <div className="gov-card p-4 sm:p-5 space-y-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide">
                  {ptr.radio_checkpoints_title}
                </h3>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                {ptr.radio_checkpoints_sub}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { name: 'Haflong Ridge VHF Repeater #01', freq: '156.700 MHz', status: 'ONLINE', latency: '4ms' },
                { name: 'Lumding Sector Relay Station #04', freq: '156.700 MHz', status: 'ONLINE', latency: '6ms' },
                { name: 'Jatinga Gorge Satellite Blackout Post', freq: 'HF High-Power Relay', status: 'ONLINE', latency: '12ms' },
              ].map(station => (
                <div key={station.name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 text-xs block">{station.name}</strong>
                    <span className="text-[10.5px] font-mono text-slate-500">{station.freq}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                    ● {station.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Floating Police Mobile SMS Simulator */}
      <LiveMobileNotificationSimulator
        isOpen={isSmsTerminalOpen}
        onClose={() => setIsSmsTerminalOpen(false)}
        initialRole="police"
      />

    </div>
  )
}
