'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Send,
  Phone,
  Compass,
  CheckCircle,
  Truck,
  HeartPulse,
  Droplets,
  HelpCircle,
  ArrowRight,
  Sparkles,
  LifeBuoy,
  Tent,
  Check,
  X,
  Users,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { useUserRole, useRequireRole } from '@/lib/RoleContext'
import { useRealtimeIncidents } from '@/hooks/useRealtimeIncidents'
import { useDisasterComms, ReliefBeacon, CitizenSOSRequest } from '@/lib/disaster-comms-store'
import LiveMobileNotificationSimulator from '@/components/LiveMobileNotificationSimulator'
import { CITIZEN_I18N } from './citizen-i18n'

export default function CitizenPortalPage() {
  const { isAuthorized, isLoaded } = useRequireRole(['CITIZEN_USER', 'CITIZEN_DRIVER', 'APEX_ADMIN'])
  const { language, t } = useLanguage()
  const { currentRole, setRole } = useUserRole()
  const { reportIncident } = useRealtimeIncidents()
  const {
    beacons,
    activeCorridor,
    supplyRequisitions,
    citizenIncidents,
    trackingVehicles,
    safeZones,
    markReliefBeacon,
    submitCitizenSOS,
    submitCitizenSupplyRequisition,
    submitCitizenGroundIncident,
  } = useDisasterComms()

  const ctr = useMemo(() => CITIZEN_I18N[language] || CITIZEN_I18N.en, [language])

  // Modals state
  const [isBeaconModalOpen, setIsBeaconModalOpen] = useState(false)
  const [isSosModalOpen, setIsSosModalOpen] = useState(false)
  const [isReqModalOpen, setIsReqModalOpen] = useState(false)
  const [isSmsTerminalOpen, setIsSmsTerminalOpen] = useState(false)

  // Requisition Form State
  const [reqCategory, setReqCategory] = useState<'POTABLE_WATER' | 'FOOD_RATIONS' | 'INFANT_FORMULA' | 'CRITICAL_MEDICINE' | 'OXYGEN_CYLINDERS' | 'SHELTER_TARPAULIN'>('POTABLE_WATER')
  const [reqPriority, setReqPriority] = useState<'STANDARD' | 'URGENT' | 'LIFE_THREAT'>('URGENT')
  const [reqFamilyCount, setReqFamilyCount] = useState('5')
  const [reqSpecificItems, setReqSpecificItems] = useState('20L Drinking Water Bottles & Oral Rehydration Salts')
  const [reqPhone, setReqPhone] = useState('+91 94350-12345')
  const [reqLandmark, setReqLandmark] = useState('Tupul Ridge Footpath Curve (km 94)')
  const [reqCitizenName, setReqCitizenName] = useState('Biren Das (Stranded Resident)')

  // Safe Relief Point Form State
  const [beaconName, setBeaconName] = useState('')
  const [beaconLocation, setBeaconLocation] = useState('Jatinga Elevated Community Ridge')
  const [evacueeCount, setEvacueeCount] = useState('14')
  const [waterAvailable, setWaterAvailable] = useState(true)
  const [shelterAvailable, setShelterAvailable] = useState(true)
  const [medicalNeeds, setMedicalNeeds] = useState(false)
  const [beaconNotes, setBeaconNotes] = useState('')

  // SOS Distress Form State
  const [sosName, setSosName] = useState('')
  const [sosHeadcount, setSosHeadcount] = useState('4')
  const [sosPhone, setSosPhone] = useState('+91 94350-')
  const [sosLandmark, setSosLandmark] = useState('Stranded near km 94 curve')
  const [sosNeeds, setSosNeeds] = useState<Array<'FOOD' | 'WATER' | 'MEDICINE' | 'OXYGEN' | 'EVACUATION'>>(['WATER', 'MEDICINE'])

  // Citizen Hazard Report Form State
  const [reportRoad, setReportRoad] = useState('NH-27 Lumding–Haflong Road')
  const [reportType, setReportType] = useState('waterlogging')
  const [reportDesc, setReportDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [optimisticNotice, setOptimisticNotice] = useState<string | null>(null)
  const [localCitizenReports, setLocalCitizenReports] = useState<Array<{ id: string; location: string; type: string; time: string }>>([])

  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 font-sans select-none">
        <div className="w-8 h-8 border-3 border-[#fb792b] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          Verifying Citizen Credentials...
        </p>
      </div>
    )
  }

  // Live Arriving Essential Relief Supplies
  const arrivingEssentials = [
    {
      id: 'DELIVERY-MED-01',
      title: 'Pediatric Vaccines & Snake Anti-Venom (2-8°C)',
      category: 'CRITICAL MEDICINE',
      icon: '💉',
      destinationVAP: activeCorridor.destinationTarget || 'Jatinga Roadhead VAP (km 88)',
      originDepot: activeCorridor.originHub || 'Delhi Central Medical Reserve (via Borjhar AFS)',
      eta: `${activeCorridor.etaMinutes || 42} mins (~01:45 hrs)`,
      status: `IN TRANSIT (${activeCorridor.assignedVehicleName || 'Hill 4x4 Bolero'})`,
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      safeNotice: 'Cold-chain guaranteed in PCM temperature-controlled coolant container.',
      collectionPoint: 'Jatinga Primary Health Sub-Centre Counter 1',
      payloadItems: [
        'Anti-Venom Vials (Polyvalent): 120 Doses',
        'Pediatric Measles & Tetanus Vaccines: 250 Doses',
        'Cold-Chain Temperature: Verified 4.2°C Stable',
      ],
    },
    {
      id: 'DELIVERY-O2-02',
      title: 'Medical Oxygen Cylinders & Cryo Blood Plasma',
      category: 'EMERGENCY LIFE-SUPPORT',
      icon: '🫁',
      destinationVAP: 'Makru VAP (km 45, Tupul Gorge)',
      originDepot: 'Nagpur NDRF National Depot (via Silchar Staging)',
      eta: '14 mins (~00:18 hrs)',
      status: 'APPROACHING VAP (IAF AIRLIFT)',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      safeNotice: 'Helicopter airbridge landing at Makru Football Ground helipad.',
      collectionPoint: 'Makru Village Disaster Committee Relief Tent',
      payloadItems: [
        'Pressurized Oxygen Type-D (2,000 PSI): 18 Cylinders',
        'O-Negative & B-Positive Blood Plasma: 40 Units',
        'Oxygen Regulators & Pediatric Cannulas: 50 Sets',
      ],
    },
    {
      id: 'DELIVERY-FOOD-03',
      title: 'High-Calorie Dry Rations & Mobile Water Purification',
      category: 'COMMUNITY FOOD & WATER',
      icon: '🌾',
      destinationVAP: 'Kamalabari Ghat Char Area (Majuli Island)',
      originDepot: 'Kolkata Port & Dankuni Rail Freight Complex',
      eta: '1h 15m (~01:15 hrs)',
      status: 'RIVERINE CONVOY (SDRF BOAT)',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      safeNotice: 'Sufficient for 850 families for 72 hours. Chlorination tablets included.',
      collectionPoint: 'Kamalabari Higher Secondary School Relief Camp',
      payloadItems: [
        'High-Energy Fortified Biscuits & Rice Packs: 1.2 Tonnes',
        'Halazone Water Purification Tablets: 5,000 Tabs',
        'Ready-to-Use Therapeutic Food (RUTF): 300 Packs',
      ],
    },
  ]

  const handleCitizenReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const reportId = `PUB-REP-${Date.now().toString().slice(-4)}`
    
    // 1. Submit to unified disaster comms store (broadcasting to Police Radio)
    submitCitizenGroundIncident({
      citizenName: 'Citizen Beneficiary (Public Queue)',
      contactPhone: '+91 94350-12345',
      locationLandmark: reportRoad,
      incidentCategory: reportType === 'landslide' ? 'MUDSLIDE_ACTIVE' : reportType === 'collapse' ? 'STRUCTURAL_COLLAPSE' : 'ROAD_WASHOUT',
      severity: 'HIGH',
      description: reportDesc || `Community obstacle reported by local resident on ${reportRoad}.`,
    })

    try {
      await reportIncident({
        route_name: reportRoad,
        type: reportType,
        severity: 'high',
        status: 'reported',
        description: reportDesc || `Community obstacle reported by local resident on ${reportRoad}.`,
        reported_by: 'Citizen Beneficiary / VDP Volunteer (Public Queue)',
        lat: 26.1445,
        lng: 91.7362,
      })
    } catch {
      // local fallback
    }

    setLocalCitizenReports(prev => [
      { id: reportId, location: reportRoad, type: reportType.toUpperCase(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev,
    ])

    setOptimisticNotice(`✅ Your report has been submitted to the State EOC and District Police SMS Queue! Local patrol units alerted for verification.`)
    setReportDesc('')
    setIsSubmitting(false)

    setTimeout(() => {
      setOptimisticNotice(null)
    }, 8000)
  }

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(reqFamilyCount, 10) || 4
    const newReq = submitCitizenSupplyRequisition({
      citizenName: reqCitizenName,
      contactPhone: reqPhone,
      landmark: reqLandmark,
      category: reqCategory,
      priority: reqPriority,
      familyCount: count,
      specificItems: reqSpecificItems,
    })

    setIsReqModalOpen(false)
    setOptimisticNotice(`📦 Essential Supplies Requisition ${newReq.id} transmitted to Police SMS Portal! Allocation tracking reference generated.`)
    setTimeout(() => setOptimisticNotice(null), 8000)
  }

  const handleCreateBeacon = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(evacueeCount, 10) || 1
    markReliefBeacon({
      name: beaconName || 'Safe Evacuation Shelter',
      lat: 25.1500 + (Math.random() - 0.5) * 0.05,
      lng: 93.0200 + (Math.random() - 0.5) * 0.05,
      markedBy: 'Evacuated Citizen Volunteer',
      evacueeCount: count,
      waterAvailable,
      shelterAvailable,
      medicalNeeds,
      notes: beaconNotes || `Safe area established at ${beaconLocation}. ${count} civilians safely evacuated.`,
    })

    setIsBeaconModalOpen(false)
    setBeaconName('')
    setBeaconNotes('')
    setOptimisticNotice(`🌟 Safe Relief Point beacon marked successfully! Coordinates transmitted to Police Patrol & SDRF rescue queue.`)
    setTimeout(() => setOptimisticNotice(null), 8000)
  }

  const handleSendSOS = (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(sosHeadcount, 10) || 1
    submitCitizenSOS({
      citizenName: sosName || 'Stranded Citizen',
      lat: 25.1800 + (Math.random() - 0.5) * 0.04,
      lng: 93.0100 + (Math.random() - 0.5) * 0.04,
      landmark: sosLandmark,
      headcount: count,
      needs: sosNeeds,
      urgency: 'CRITICAL',
      contactPhone: sosPhone,
    })

    setIsSosModalOpen(false)
    setOptimisticNotice(`🚨 Immediate SOS Signal Transmitted! Incident Commander at State EOC and local Highway Patrol Thana have been alerted for rescue dispatch.`)
    setTimeout(() => setOptimisticNotice(null), 9000)
  }

  return (
    <div className="space-y-6 text-slate-800 font-sans select-none max-w-7xl mx-auto px-4 sm:px-6 py-4">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#fb792b] via-[#e06820] to-[#213d77] rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/40 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {ctr.portal_title}
                </h1>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black/40 text-amber-200 border border-amber-300/40">
                  {ctr.public_badge}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                {ctr.sub_heading}
              </p>
            </div>
          </div>
          
          {/* Action Buttons: Mark Relief Point + One-Tap SOS + Request Supplies */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsReqModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-amber-300"
            >
              <Package className="w-4 h-4 text-slate-950" />
              <span>Request Supplies</span>
            </button>

            <button
              onClick={() => setIsBeaconModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-emerald-400/40"
            >
              <Tent className="w-4 h-4 text-amber-300" />
              <span>{ctr.mark_beacon_btn}</span>
            </button>

            <button
              onClick={() => setIsSosModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-rose-400/40 animate-pulse"
            >
              <LifeBuoy className="w-4 h-4 text-white" />
              <span>{ctr.sos_btn}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSmsTerminalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-blue-400/40"
            >
              <Phone className="w-4 h-4 text-amber-300" />
              <span>Emergency SMS Alerts</span>
            </button>

            <Link
              href="/map"
              className="bg-white hover:bg-slate-100 text-[#213d77] font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#fb792b]" />
              <span>Public Safety Map</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/10 flex items-center gap-2.5">
            <Package className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="text-[10px] text-amber-200 uppercase font-bold block">Arriving Deliveries Today</span>
              <strong className="text-white font-mono text-xs">3 Relief Convoys En Route</strong>
            </div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/10 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <div>
              <span className="text-[10px] text-emerald-200 uppercase font-bold block">Safe Community Havens</span>
              <strong className="text-white font-mono text-xs">{beacons.length} Safe Relief Beacons Active</strong>
            </div>
          </div>
          <div className="bg-black/30 p-2.5 rounded-lg border border-white/10 flex items-center gap-2.5">
            <HeartPulse className="w-4 h-4 text-rose-300 shrink-0" />
            <div>
              <span className="text-[10px] text-rose-200 uppercase font-bold block">24x7 Helpline Access</span>
              <strong className="text-white font-mono text-xs">Toll-Free 112 / 1070 Active</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Optimistic UI Notice Banner */}
      {optimisticNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 text-xs sm:text-sm font-bold flex items-start gap-3 shadow-md animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <strong className="block text-emerald-900 text-sm">TRANSMISSION CONFIRMED</strong>
            <p className="text-xs text-emerald-800 leading-relaxed">{optimisticNotice}</p>
          </div>
        </div>
      )}

      {/* 2-Column Beneficiary Operations Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT 7 COLS: ARRIVING ESSENTIAL SUPPLIES & PAYLOAD BREAKDOWN */}
        <div className="lg:col-span-7 space-y-4">
          <div className="gov-card p-4 sm:p-5 space-y-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#fb792b]" />
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wide">
                    {ctr.arriving_title}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {ctr.arriving_sub}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded font-bold">
                {arrivingEssentials.length} IN TRANSIT
              </span>
            </div>

            <div className="space-y-3.5">
              {arrivingEssentials.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 hover:border-[#fb792b] transition-all shadow-2xs group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <span className="text-[9.5px] font-mono font-black text-[#213d77] uppercase tracking-wider block">
                          {item.category}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#213d77] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded shrink-0">
                      ETA {item.eta}
                    </span>
                  </div>

                  {/* Verified Payload Breakdown Pill Box */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block border-b border-slate-100 pb-1">
                      📦 {ctr.payload_breakdown_title}
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {item.payloadItems.map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[11.5px] text-slate-600 space-y-1 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span>Destination VAP: <strong className="text-slate-900">{item.destinationVAP}</strong></span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-blue-100">
                      <span>Origin: <strong className="text-slate-700">{item.originDepot}</strong></span>
                      <span className="font-mono text-emerald-700 font-bold">{item.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500 text-[10.5px]">
                      📍 Collection: <strong className="text-slate-800">{item.collectionPoint}</strong>
                    </span>
                    <Link
                      href={`/map?route=${encodeURIComponent(item.destinationVAP)}`}
                      className="text-[#213d77] hover:text-[#fb792b] font-bold flex items-center gap-1"
                    >
                      Track on Map <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CROWDSOURCED SAFE COMMUNITY RELIEF BEACONS LIST */}
          <div className="gov-card p-4 sm:p-5 space-y-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Tent className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-xs sm:text-sm font-black text-emerald-950 uppercase tracking-wide">
                    {ctr.safe_points_title} ({beacons.length})
                  </h2>
                  <p className="text-slate-500 text-xs">{ctr.safe_points_sub}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBeaconModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                + Mark Safe Point
              </button>
            </div>

            <div className="space-y-2.5">
              {beacons.map(b => (
                <div key={b.id} className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-1.5">
                      <span>⛺</span> {b.name}
                    </strong>
                    <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded border border-emerald-300">
                      {b.evacueeCount} CIVILIANS SAFE
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{b.notes}</p>
                  <div className="flex items-center justify-between pt-1 text-[10.5px] text-slate-500 border-t border-emerald-100">
                    <span className="flex items-center gap-2">
                      {b.waterAvailable && <span className="text-blue-700 font-semibold">💧 Water OK</span>}
                      {b.shelterAvailable && <span className="text-emerald-700 font-semibold">🏠 Shelter OK</span>}
                      {b.medicalNeeds && <span className="text-rose-700 font-bold">⚠️ Medical Needed</span>}
                    </span>
                    <span className="font-mono text-[10px] text-emerald-800 font-bold">
                      {b.verifiedByPolice ? '✅ Police Verified' : '⏳ Citizen Reported'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT 5 COLS: REPORT HAZARD FORM & 24x7 HELPLINE */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* CROWDSOURCED ROAD HAZARD FORM */}
          <div className="gov-card p-4 sm:p-5 space-y-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#fb792b]" />
                <h2 className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wide">
                  {ctr.report_hazard_title}
                </h2>
              </div>
              <p className="text-slate-500 text-xs mt-0.5">
                {ctr.report_hazard_sub}
              </p>
            </div>

            <form onSubmit={handleCitizenReport} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{ctr.road_label}</label>
                <select
                  value={reportRoad}
                  onChange={e => setReportRoad(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#fb792b]"
                >
                  <option value="NH-27 Lumding–Haflong Road">NH-27 Lumding–Haflong Road (Dima Hasao)</option>
                  <option value="NH-6 Shillong–Jowai–Silchar Arterial">NH-6 Shillong–Jowai–Silchar Arterial</option>
                  <option value="NH-10 Siliguri–Sevoke Highway">NH-10 Siliguri–Sevoke Highway (Teesta Corridor)</option>
                  <option value="NH-37 Tupul Mountain Road">NH-37 Tupul Mountain Road (Manipur Lifeline)</option>
                  <option value="Kamalabari Island Ferry Approach">Kamalabari Island Ferry Approach (Majuli)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{ctr.hazard_type_label}</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#fb792b]"
                >
                  <option value="waterlogging">🌊 River Overflow / Waterlogging</option>
                  <option value="landslide">⛰️ Mudslide / Falling Boulders</option>
                  <option value="road_damage">🛣️ Road Crack / Culvert Cave-in</option>
                  <option value="tree_fall">🌲 Fallen Trees / Electric Wire Hazard</option>
                  <option value="congestion">🛑 Traffic Gridlock / Stranded Vehicles</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{ctr.desc_label}</label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={e => setReportDesc(e.target.value)}
                  placeholder={ctr.desc_placeholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#fb792b]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#fb792b] hover:bg-[#e06820] text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? ctr.submitting : ctr.submit_report_btn}</span>
              </button>
            </form>
          </div>

          {/* 24x7 HELPDESK & EMERGENCY DIRECT CALL */}
          <div className="gov-card p-4 sm:p-5 space-y-3 bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-xl shadow-xs">
            <div className="flex items-center gap-2 border-b border-blue-700/60 pb-2">
              <Phone className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                {ctr.helpdesk_title}
              </h3>
            </div>
            <p className="text-xs text-blue-200 leading-relaxed">
              {ctr.helpdesk_sub}
            </p>
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <a
                href="tel:112"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-lg text-center font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> Call National Helpline 112
              </a>
              <a
                href="tel:1070"
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-3 rounded-lg text-center font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Phone className="w-3.5 h-3.5" /> Call State EOC 1070
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* ── MODAL 1: MARK SAFE RELIEF POINT / EXIT BEACON ── */}
      {isBeaconModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl">
                  ⛺
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">{ctr.mark_beacon_title}</h3>
                  <p className="text-[11px] text-slate-500">{ctr.mark_beacon_sub}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBeaconModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBeacon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Shelter / Landmark Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jatinga Higher Secondary School / Elevated Hill Ridge"
                  value={beaconName}
                  onChange={e => setBeaconName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{ctr.evacuee_count_label}</label>
                  <input
                    type="number"
                    min="1"
                    value={evacueeCount}
                    onChange={e => setEvacueeCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nearest Sector</label>
                  <input
                    type="text"
                    value={beaconLocation}
                    onChange={e => setBeaconLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              {/* Resource Toggles */}
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={waterAvailable}
                    onChange={e => setWaterAvailable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>💧 {ctr.water_label}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={shelterAvailable}
                    onChange={e => setShelterAvailable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>🏠 {ctr.shelter_label}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-rose-700">
                  <input
                    type="checkbox"
                    checked={medicalNeeds}
                    onChange={e => setMedicalNeeds(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span>🚨 {ctr.medical_label}</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Notes / Landmarks for Rescue Teams</label>
                <textarea
                  rows={2}
                  value={beaconNotes}
                  onChange={e => setBeaconNotes(e.target.value)}
                  placeholder="Describe access path, visible landmarks, or elderly/infant needs..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBeaconModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md"
                >
                  🌟 Save Safe Relief Beacon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: ONE-TAP SOS DISTRESS PING ── */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border-2 border-rose-500 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center text-xl animate-pulse">
                  🚨
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-rose-950">{ctr.sos_title}</h3>
                  <p className="text-[11px] text-slate-500">{ctr.sos_sub}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSosModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendSOS} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Name / Group Lead</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kalita"
                    value={sosName}
                    onChange={e => setSosName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stranded Headcount</label>
                  <input
                    type="number"
                    min="1"
                    value={sosHeadcount}
                    onChange={e => setSosHeadcount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Mobile Number</label>
                <input
                  type="text"
                  required
                  value={sosPhone}
                  onChange={e => setSosPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Exact Landmark / Current Position</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trapped on NH-27 km 94 curve near Jatinga bridge"
                  value={sosLandmark}
                  onChange={e => setSosLandmark(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-medium"
                />
              </div>

              {/* Needs Checkboxes */}
              <div className="space-y-1.5 bg-rose-50 p-3 rounded-lg border border-rose-200">
                <label className="font-black text-rose-950 uppercase text-[10px] block">Immediate Life-Safety Needs:</label>
                <div className="grid grid-cols-2 gap-2 text-slate-800 font-bold">
                  {(['FOOD', 'WATER', 'MEDICINE', 'OXYGEN', 'EVACUATION'] as const).map(need => (
                    <label key={need} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sosNeeds.includes(need)}
                        onChange={e => {
                          if (e.target.checked) setSosNeeds(prev => [...prev, need])
                          else setSosNeeds(prev => prev.filter(n => n !== need))
                        }}
                        className="w-4 h-4 text-rose-600 rounded"
                      />
                      <span>{need === 'FOOD' ? '🍞 Food' : need === 'WATER' ? '💧 Water' : need === 'MEDICINE' ? '💉 Medicine' : need === 'OXYGEN' ? '🫁 Oxygen' : '🚤 Evacuation'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSosModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center gap-1.5"
                >
                  <LifeBuoy className="w-4 h-4" />
                  <span>Transmit Emergency SOS Signal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requisition Supplies Modal */}
      {isReqModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-amber-400 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📦</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Requisition Essential Relief Supplies
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transmits urgent demand directly to Sector Police & Disaster Logistics Queue
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReqModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequisition} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Name / Group</label>
                  <input
                    type="text"
                    required
                    value={reqCitizenName}
                    onChange={e => setReqCitizenName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contact Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={reqPhone}
                    onChange={e => setReqPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Essential Category</label>
                  <select
                    value={reqCategory}
                    onChange={e => setReqCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="POTABLE_WATER">💧 Potable Drinking Water</option>
                    <option value="FOOD_RATIONS">🍞 Dry Food Rations</option>
                    <option value="INFANT_FORMULA">🍼 Infant Formula & Baby Food</option>
                    <option value="CRITICAL_MEDICINE">💉 Anti-Venom & Critical Medicines</option>
                    <option value="OXYGEN_CYLINDERS">🫁 Emergency Oxygen</option>
                    <option value="SHELTER_TARPAULIN">⛺ Tarpaulin & Warm Blankets</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Urgency Priority</label>
                  <select
                    value={reqPriority}
                    onChange={e => setReqPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-bold text-amber-700"
                  >
                    <option value="URGENT">⚠️ Urgent Need (Within 6 hrs)</option>
                    <option value="LIFE_THREAT">🚨 Life-Threatening Emergency</option>
                    <option value="STANDARD">Standard Relief Schedule</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Family / PAX Count</label>
                  <input
                    type="number"
                    min="1"
                    value={reqFamilyCount}
                    onChange={e => setReqFamilyCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exact Landmark / Location</label>
                  <input
                    type="text"
                    required
                    value={reqLandmark}
                    onChange={e => setReqLandmark(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specific Supply Details / Quantities</label>
                <textarea
                  rows={2}
                  required
                  value={reqSpecificItems}
                  onChange={e => setReqSpecificItems(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5"
                >
                  <Package className="w-4 h-4" />
                  <span>Transmit Requisition to Police SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Citizen Mobile SMS Simulator */}
      <LiveMobileNotificationSimulator
        isOpen={isSmsTerminalOpen}
        onClose={() => setIsSmsTerminalOpen(false)}
        initialRole="citizen"
      />

    </div>
  )
}
