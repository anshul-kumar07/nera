'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Shield,
  AlertTriangle,
  Truck,
  Layers,
  Sparkles,
  Info,
  ArrowRight,
  CheckCircle,
  Clock,
  Radio,
} from 'lucide-react'

export interface DemoStep {
  stepNumber: number
  stageTitle: string
  subtitle: string
  whatIsHappening: string
  whyItMatters: string
  systemAction: string
  authorityRequired: string
  dataStatus: 'SIMULATED' | 'LIVE' | 'STALE'
  simulatedDataClaim: string
  operationalState: {
    incidents: string
    routeStatus: string
    missionState: string
    carrierState: string
    safetyGate: 'READY' | 'NOT_READY' | 'DATA_INSUFFICIENT'
    aiRisk: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL'
    lastMileState: string
  }
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    stageTitle: 'Normal Monitored Operations',
    subtitle: 'Baseline regional network monitoring across 8 North Eastern States',
    whatIsHappening: 'NERA command center continuously monitors regional logistics, weather, and fleet readiness.',
    whyItMatters: 'Baseline regional connectivity is normal with zero active confirmed road blockages.',
    systemAction: 'Monitors Open-Meteo weather streams and AIS-140 GPS telemetry buffers.',
    authorityRequired: 'None (Continuous Monitoring)',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Baseline North Eastern regional telemetry stream',
    operationalState: {
      incidents: 'NO_ACTIVE_INCIDENTS',
      routeStatus: 'NH-27 LUMDING-HAFLONG OPEN',
      missionState: 'STANDBY',
      carrierState: 'NER-TRUCK-18 AVAILABLE',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 2,
    stageTitle: 'AI Early Warning & Hazard Ingestion',
    subtitle: 'Predictive weather disruption & slope saturation advisory generated',
    whatIsHappening: 'Predictive hazard engine flags heavy rainfall (85 mm/h) and high landslide risk (78%) along NH-27 KM 48.',
    whyItMatters: 'AI identifies vulnerability early without unilaterally closing government corridors.',
    systemAction: 'Generates advisory warning. Does NOT sever road corridor.',
    authorityRequired: 'Advisory Only (AI Cannot Block Routes)',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Synthetic geological slope sensor & radar rain ingestion',
    operationalState: {
      incidents: 'PREDICTED RISK (78% PROBABILITY)',
      routeStatus: 'NH-27 OPEN (ADVISORY_MONITORING)',
      missionState: 'STANDBY',
      carrierState: 'NER-TRUCK-18 AVAILABLE',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 3,
    stageTitle: 'Field Officer Geotagged Report',
    subtitle: 'Ground-level verification submitted via offline-capable mobile reporter',
    whatIsHappening: 'Field Officer Sonowal submits on-site photo report: major boulder fall blocking both lanes at KM 48.',
    whyItMatters: 'Human on-site report creates actionable operational incident awaiting official verification.',
    systemAction: 'Registers incident with status REPORTED. Primary corridor remains OPEN until statutory sign-off.',
    authorityRequired: 'Field Officer Report (Awaiting Authority Confirmation)',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Geotagged mobile field report [25.1720° N, 93.0040° E]',
    operationalState: {
      incidents: 'REPORTED (AWAITING VERIFICATION)',
      routeStatus: 'NH-27 OPEN (UNCONFIRMED_REPORT)',
      missionState: 'PRE_PLANNING',
      carrierState: 'NER-TRUCK-18 AVAILABLE',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 4,
    stageTitle: 'Official Disaster Confirmation & Route Severing',
    subtitle: 'Disaster Authority confirmation severs primary corridor and triggers dynamic bypass',
    whatIsHappening: 'District Disaster Management Authority (DDMA) verifies field evidence and confirms landslide.',
    whyItMatters: 'Only statutory government confirmation possesses authority to sever road corridors.',
    systemAction: 'Status becomes CONFIRMED. Primary NH-27 marked BLOCKED. Dijkstra + OSRM calculates Lanka bypass (+32.3 km).',
    authorityRequired: 'Disaster Authority Official Confirmation (DDMA Sign-Off)',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'State Disaster Management Authority statutory verification ledger',
    operationalState: {
      incidents: 'CONFIRMED DISASTER (ROAD SEVERED)',
      routeStatus: 'NH-27 BLOCKED -> BYPASS VIA LANKA (+32.3 KM)',
      missionState: 'EMERGENCY_PROPOSAL',
      carrierState: 'NER-TRUCK-18 AVAILABLE',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 5,
    stageTitle: 'Emergency Relief Mission Creation',
    subtitle: 'Supply-demand matching and commodity reservation without phantom inventory',
    whatIsHappening: 'DEOC Haflong creates emergency mission for 350 pediatric trauma kits (3,400 kg).',
    whyItMatters: 'Matches verified stock from Guwahati Apex Depot without fabricating stock.',
    systemAction: 'Reserves 350 kits, assigns candidate carrier NER-TRUCK-18, proposes Lanka alternate corridor.',
    authorityRequired: 'Logistics Operator Initialization',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Guwahati Apex Depot finite commodity inventory reserve',
    operationalState: {
      incidents: 'CONFIRMED DISASTER (ACTIVE)',
      routeStatus: 'LANKA-HAFLONG BYPASS (310 KM)',
      missionState: 'PENDING_APPROVAL',
      carrierState: 'NER-TRUCK-18 ALLOCATED',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 6,
    stageTitle: 'Vehicle Readiness & AI Health Gate Evaluation',
    subtitle: 'Deterministic 8-point physical safety gate separated from AI predictive maintenance risk',
    whatIsHappening: 'NERA evaluates carrier NER-TRUCK-18: passes 8-point physical check (READY) and AI risk (LOW).',
    whyItMatters: 'Deployment Safety (Physical Gate) is strictly independent from AI Maintenance Advisory Risk.',
    systemAction: 'Clears vehicle for deployment. Unsafe carriers are deterministically blocked.',
    authorityRequired: 'Automated 8-Point Physical Safety Clearance',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Physical mechanical inspection & brake hydraulic pressure buffer',
    operationalState: {
      incidents: 'CONFIRMED DISASTER (ACTIVE)',
      routeStatus: 'LANKA-HAFLONG BYPASS (310 KM)',
      missionState: 'PENDING_APPROVAL',
      carrierState: 'NER-TRUCK-18 CLEARED (READY)',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 7,
    stageTitle: 'Official Commander Approval & Dispatch',
    subtitle: 'Senior Commander statutory sign-off and official convoy dispatch',
    whatIsHappening: 'Senior Commander Brigadier Barman reviews mission manifest, verified bypass, and readiness gate.',
    whyItMatters: 'Preserves statutory chain of command. AI never autonomously dispatches relief convoys.',
    systemAction: 'Official sign-off recorded in immutable audit log. Mission transitions to DISPATCHED.',
    authorityRequired: 'Senior Commander Statutory Authorization (Brig. Barman)',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Military / Civil Defense command authorization signature',
    operationalState: {
      incidents: 'CONFIRMED DISASTER (ACTIVE)',
      routeStatus: 'LANKA-HAFLONG BYPASS (310 KM)',
      missionState: 'DISPATCHED & IN_TRANSIT',
      carrierState: 'NER-TRUCK-18 IN_TRANSIT',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 8,
    stageTitle: 'Real-Time Telemetry & Convoy Progression',
    subtitle: 'GPS telemetry stream following real OSRM road geometry at 45 km/h',
    whatIsHappening: 'Convoy moves along Lanka bypass corridor, streaming real-time GPS coordinates, speed, and fuel rate.',
    whyItMatters: 'Follows actual road curves without artificial straight-line map interpolation.',
    systemAction: 'Ingests GPS telemetry at 45 km/h along verified OSRM path.',
    authorityRequired: 'Live Fleet Tracking & Telemetry Stream',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'AIS-140 standard GPS telemetry packet [25.7500° N, 92.5000° E]',
    operationalState: {
      incidents: 'CONFIRMED DISASTER (ACTIVE)',
      routeStatus: 'LANKA-HAFLONG BYPASS (IN_PROGRESS)',
      missionState: 'IN_TRANSIT (PROGRESS: 45%)',
      carrierState: 'NER-TRUCK-18 IN_TRANSIT (45 KM/H)',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 9,
    stageTitle: 'Secondary Road Obstruction & Mid-Route Rerouting',
    subtitle: 'Dynamic rerouting computed strictly from vehicle current GPS position',
    whatIsHappening: 'Secondary flash flood submerges culvert ahead. Disaster Authority confirms blockage.',
    whyItMatters: 'Mid-route rerouting starts strictly from current vehicle GPS position (no depot teleportation).',
    systemAction: 'Recalculates alternate mountain trail from [25.7500, 92.5000] -> Haflong (+14 km).',
    authorityRequired: 'Disaster Authority Secondary Incident Confirmation',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Mid-route dynamic Dijkstra waypoint recalculation',
    operationalState: {
      incidents: 'SECONDARY BLOCKAGE CONFIRMED',
      routeStatus: 'MID-ROUTE REROUTED FROM CURRENT GPS',
      missionState: 'IN_TRANSIT (REROUTED)',
      carrierState: 'NER-TRUCK-18 IN_TRANSIT',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 10,
    stageTitle: 'In-Transit Vehicle Failure & Mission Interruption',
    subtitle: 'Carrier transmission failure triggers INTERRUPTED state while preserving exact GPS',
    whatIsHappening: 'Driver reports catastrophic transmission failure. Carrier immobilized at KM 112.',
    whyItMatters: 'Mission immediately halts to protect cargo; vehicle state transitions to FAILED without data loss.',
    systemAction: 'Transitions mission to INTERRUPTED. Carrier marked FAILED (NOT_READY). Generates P0 alert.',
    authorityRequired: 'Field Driver Incident Report & Operator Verification',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'OBD-II diagnostic DTC P0700 transmission failure code',
    operationalState: {
      incidents: 'IN-TRANSIT VEHICLE FAILURE',
      routeStatus: 'IMMOBILIZED AT KM 112',
      missionState: 'INTERRUPTED (CRITICAL P0)',
      carrierState: 'NER-TRUCK-18 FAILED (NOT_READY)',
      safetyGate: 'NOT_READY',
      aiRisk: 'CRITICAL',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 11,
    stageTitle: 'Replacement Selection & Physical Handover',
    subtitle: 'Deterministic replacement dispatch and verified physical cargo transfer',
    whatIsHappening: 'NERA evaluates standby fleet; dispatches eligible replacement NER-TRUCK-07 (READY, 18 km away).',
    whyItMatters: 'Ensures replacement meets safety gate and verifies physical cargo handover on site.',
    systemAction: 'Transfers custody manifest to NER-TRUCK-07. Mission status resumes to IN_TRANSIT.',
    authorityRequired: 'Official Handover Confirmation & Commander Clearance',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Dual-officer physical cargo custody sign-off ledger',
    operationalState: {
      incidents: 'HANDOVER COMPLETED',
      routeStatus: 'RESUMED VIA REPLACEMENT CARRIER',
      missionState: 'IN_TRANSIT (RESUMED)',
      carrierState: 'NER-TRUCK-07 IN_TRANSIT (ACTIVE)',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'ACCESSIBLE',
    },
  },
  {
    stepNumber: 12,
    stageTitle: 'Vehicle Access Point (VAP) & Last-Mile Transfer',
    subtitle: 'Convoy reaches road terminus; non-road gap transferred via 4x4 / Walking Team',
    whatIsHappening: 'Convoy reaches Vehicle Access Point (VAP). Final 3.8 km to relief center is non-road terrain.',
    whyItMatters: 'VAP arrival does NOT equal delivery. Explicitly identifies 3.8 km non-road gap.',
    systemAction: 'Marks VAP reached. Activates 4x4 / Walking Field Team transfer mode.',
    authorityRequired: 'Last-Mile Field Coordination Officer',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Digital Elevation Model (DEM) terrain accessibility matrix',
    operationalState: {
      incidents: 'LAST-MILE TRANSFER ACTIVE',
      routeStatus: 'ROAD TERMINUS REACHED (VAP)',
      missionState: 'ARRIVED_AT_VAP',
      carrierState: 'NER-TRUCK-07 AT_VAP',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: '3.8 KM NON-ROAD (4X4_OFF_ROAD)',
    },
  },
  {
    stepNumber: 13,
    stageTitle: 'Final Recipient Delivery & Statutory Completion',
    subtitle: 'Official recipient verification and Disaster Authority statutory completion sign-off',
    whatIsHappening: 'Relief team confirms receipt of 350 trauma kits at Haflong Civil Hospital. DDMA signs off.',
    whyItMatters: 'Full chain of custody verified; releases vehicle to AVAILABLE and records statutory audit entry.',
    systemAction: 'Transitions mission to COMPLETED. Releases vehicle. Finalizes immutable audit trail.',
    authorityRequired: 'Disaster Management Authority Completion Sign-Off',
    dataStatus: 'SIMULATED',
    simulatedDataClaim: 'Hospital Medical Superintendent statutory delivery certificate',
    operationalState: {
      incidents: 'INCIDENTS RESOLVED',
      routeStatus: 'ALL CORRIDORS REOPENED',
      missionState: 'COMPLETED & VERIFIED',
      carrierState: 'NER-TRUCK-07 AVAILABLE',
      safetyGate: 'READY',
      aiRisk: 'LOW',
      lastMileState: 'DELIVERED & VERIFIED',
    },
  },
]

export default function DemoPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentStep = DEMO_STEPS[currentStepIndex]
  const hours = 8 + Math.floor(currentStepIndex * 0.75)
  const minutes = (currentStepIndex * 15) % 60
  const simClock = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00 IST`

  // Auto-play timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= DEMO_STEPS.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 4500)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying])

  const handleNext = () => {
    if (currentStepIndex < DEMO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleReset = () => {
    setCurrentStepIndex(0)
    setIsPlaying(false)
  }

  return (
    <div className="space-y-5">
      {/* ── Top Government Header & Scenario Title ── */}
      <div className="gov-card p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#213d77] text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                INTERACTIVE OPERATIONAL SIMULATION
              </span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                DEMONSTRATION DATA
              </span>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                OPERATIONAL LIFECYCLE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#213d77] tracking-tight mt-1">
              NERA — End-to-End Emergency Logistics Lifecycle
            </h1>
            <p className="text-xs text-slate-600">
              Deterministic 13-Stage Emergency Response, Routing, Readiness, and Statutory Sign-Off Simulation
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-100 border border-slate-300 rounded-lg px-3.5 py-2 text-center">
              <span className="text-xs font-bold uppercase text-slate-500 block">SIMULATION CLOCK</span>
              <strong className="text-base font-mono text-[#213d77] font-black">{simClock}</strong>
            </div>
            <button
              onClick={handleReset}
              className="btn-irctc-navy text-xs sm:text-sm px-4 py-2.5 min-h-[44px] flex items-center gap-2 cursor-pointer font-bold shadow-xs"
              title="Reset simulation to initial baseline"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ── Step Navigation & Progress Bar ── */}
        <div className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-black text-[#fb792b] uppercase tracking-wider font-mono">
                STEP {currentStep.stepNumber} OF {DEMO_STEPS.length}
              </span>
              <h2 className="text-base sm:text-lg font-black text-[#213d77] mt-0.5">
                {currentStep.stageTitle}
              </h2>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentStepIndex === 0}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer shadow-xs"
                title="Previous step"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-2 text-xs sm:text-sm px-4 py-2.5 min-h-[44px] font-bold rounded cursor-pointer shadow-xs ${
                  isPlaying ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'btn-irctc-primary'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause Simulation' : 'Auto Play Simulation'}</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentStepIndex === DEMO_STEPS.length - 1}
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 cursor-pointer shadow-xs"
                title="Next step"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Indicator Track */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#fb792b] h-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / DEMO_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Stepper Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => {
                  setCurrentStepIndex(idx)
                  setIsPlaying(false)
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded text-xs font-mono whitespace-nowrap border transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-[#213d77] text-white border-[#213d77] font-bold shadow-xs'
                    : idx < currentStepIndex
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {s.stepNumber}. {s.stageTitle.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Context & Operational Ledger Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4-Point Explainability Card */}
        <div className="lg:col-span-2 space-y-5">
          <div className="gov-card p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#fb792b]" />
                OPERATIONAL CONTEXT & EXPLAINABILITY
              </span>
              <span className="text-xs font-mono bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded font-bold">
                STAGE {currentStep.stepNumber}
              </span>
            </div>

            {/* 4-Box Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* 1. What is Happening */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <span className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#213d77]" />
                  1. WHAT IS HAPPENING?
                </span>
                <p className="text-slate-900 font-semibold leading-relaxed">
                  {currentStep.whatIsHappening}
                </p>
              </div>

              {/* 2. Why It Matters */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1.5">
                <span className="text-xs font-bold uppercase text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  2. WHY IT MATTERS
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {currentStep.whyItMatters}
                </p>
              </div>

              {/* 3. System Action */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1.5">
                <span className="text-xs font-bold uppercase text-blue-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#213d77]" />
                  3. SYSTEM ACTION
                </span>
                <p className="text-slate-800 leading-relaxed">
                  {currentStep.systemAction}
                </p>
              </div>

              {/* 4. Authority Required */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1.5">
                <span className="text-xs font-bold uppercase text-emerald-800 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  4. AUTHORITY REQUIRED
                </span>
                <p className="text-emerald-950 font-bold leading-relaxed">
                  {currentStep.authorityRequired}
                </p>
              </div>
            </div>

            {/* Data Provenance Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Data Provenance Classification:</span>
              <span className="font-mono font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded border border-amber-300">
                {currentStep.dataStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Live Operational State Ledger */}
        <div className="space-y-4">
          <div className="gov-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs sm:text-sm font-black text-[#213d77] uppercase tracking-wider flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#fb792b]" />
                OPERATIONAL STATE LEDGER
              </span>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                SYNCHRONIZED
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold uppercase text-slate-500 block">Incident Pipeline</span>
                <strong className="text-slate-900 font-mono text-xs sm:text-sm block mt-1">
                  {currentStep.operationalState.incidents}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold uppercase text-slate-500 block">Corridor Network</span>
                <strong className="text-slate-900 font-mono text-xs sm:text-sm block mt-1">
                  {currentStep.operationalState.routeStatus}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold uppercase text-slate-500 block">Mission Dispatch State</span>
                <strong className="text-[#213d77] font-mono text-xs sm:text-sm block mt-1 font-bold">
                  {currentStep.operationalState.missionState}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold uppercase text-slate-500 block">Carrier Readiness & Gate</span>
                <div className="flex items-center justify-between mt-1 gap-2 flex-wrap">
                  <strong className="text-slate-900 font-mono text-xs">
                    {currentStep.operationalState.carrierState}
                  </strong>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
                    currentStep.operationalState.safetyGate === 'READY'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-red-50 border-red-300 text-red-800'
                  }`}>
                    {currentStep.operationalState.safetyGate}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold uppercase text-slate-500 block">Predictive AI Maintenance Risk</span>
                <div className="flex items-center justify-between mt-1">
                  <strong className="text-slate-700 font-mono text-xs">VEHICLE HEALTH</strong>
                  <span className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded text-xs font-mono font-bold">
                    {currentStep.operationalState.aiRisk} RISK
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-xs font-bold uppercase text-slate-500 block">Last-Mile Handover Status</span>
                <strong className="text-slate-900 font-mono text-xs sm:text-sm block mt-1">
                  {currentStep.operationalState.lastMileState}
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <Link
                href="/dashboard"
                className="w-full btn-irctc-navy text-xs py-2 flex items-center justify-center gap-1.5 font-bold cursor-pointer"
              >
                <span>Open Command Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

