'use client';

import React, { useState, useEffect } from 'react';
import { VehicleCategory, VEHICLE_CONSTRAINTS } from '@/lib/vehicle-suitability-matrix';
import {
  useDisasterComms,
  PassabilityStatus,
  EssentialCategory,
  GroundIncidentCategory,
} from '@/lib/disaster-comms-store';
import { calculateDistanceKm } from '@/lib/calculateDistanceKm';

export interface MobileReportPayload {
  id: string;
  routeName: string;
  hazardType: string;
  description: string;
  reportedBy: string;
  reportedRole: 'police' | 'admin' | 'citizen';
  status: 'blocked' | 'at_risk';
  timestamp: string;
}

export interface LiveMobileNotificationSimulatorProps {
  isOpen?: boolean;
  onClose: () => void;
  initialRole?: 'police' | 'admin' | 'citizen';
  currentCorridorName?: string;
  originHub?: string;
  destinationTarget?: string;
  cargoType?: string;
  onReportCondition?: (report: MobileReportPayload) => void;
  adminApprovalEvent?: {
    id: string;
    blockedRoute: string;
    newBypassRoute: string;
    destination: string;
    timestamp: string;
  } | null;
}

export default function LiveMobileNotificationSimulator({
  isOpen = true,
  onClose,
  initialRole = 'police',
  currentCorridorName = 'NH-27 Trans-Assam Express (Dima Hasao Sector)',
  originHub = 'Guwahati Apex Hub',
  destinationTarget = 'Jatinga Roadhead VAP (km 88)',
  cargoType = 'Cold-Chain Anti-Venom & Pediatric Vaccines',
  onReportCondition,
  adminApprovalEvent,
}: LiveMobileNotificationSimulatorProps) {
  const {
    crisisZones,
    smsMessages,
    supplyRequisitions,
    citizenIncidents,
    trackingVehicles,
    safeZones,
    adminAssignRouteToCrisisZone,
    policeVerifyRoute,
    policeRequestReroute,
    adminRerouteCrisisZone,
    resolveAndClearCrisisZone,
    submitPoliceAssessment,
    submitCitizenSOS,
    submitCitizenSupplyRequisition,
    submitCitizenGroundIncident,
    policeVerifyAndForwardRequisition,
    policePushRouteDirective,
    adminDispatchSupplyConvoy,
  } = useDisasterComms();

  // Active Persona: Strictly locked to portal role (no switch option)
  const activeRole = initialRole;
  const [activeTab, setActiveTab] = useState<'feed' | 'workflow'>('feed');

  // Sub-tab Navigation per Role
  const [citizenSubTab, setCitizenSubTab] = useState<'tracker' | 'requisition' | 'safezones' | 'report_hazard'>('tracker');
  const [policeSubTab, setPoliceSubTab] = useState<'intel_queue' | 'directives' | 'operations'>('intel_queue');
  const [adminSubTab, setAdminSubTab] = useState<'corridors' | 'resources' | 'resolve'>('corridors');

  // Selected Crisis Zone
  const [selectedZoneId, setSelectedZoneId] = useState<string>(crisisZones[0]?.id || '');
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  // ── Citizen Form States ──
  const [reqCategory, setReqCategory] = useState<EssentialCategory>('POTABLE_WATER');
  const [reqPriority, setReqPriority] = useState<'STANDARD' | 'URGENT' | 'LIFE_THREAT'>('URGENT');
  const [reqFamilyCount, setReqFamilyCount] = useState('5');
  const [reqSpecificItems, setReqSpecificItems] = useState('20L Potable Water Cans, ORS & Infant Formula');
  const [reqPhone, setReqPhone] = useState('+91 94350-12345');
  const [reqLandmark, setReqLandmark] = useState('Tupul Ridge Footpath Curve (km 94)');
  const [reqCitizenName, setReqCitizenName] = useState('Biren Das (Stranded Resident)');

  const [incCategory, setIncCategory] = useState<GroundIncidentCategory>('ROAD_WASHOUT');
  const [incSeverity, setIncSeverity] = useState<'CRITICAL' | 'HIGH' | 'MODERATE'>('CRITICAL');
  const [incLandmark, setIncLandmark] = useState('NH-37 km 94 Culvert Breach');
  const [incDesc, setIncDesc] = useState('Culvert completely washed out by flash floods. Carriageway severed. Trucks cannot pass.');

  // ── Police Form States ──
  const [policeDirectiveText, setPoliceDirectiveText] = useState('NH-37 severed at km 94. Bypass via Tupul North Ridge foot track or deploy IAF Mi-17 rotary wing.');
  const [policePreferredCorridor, setPolicePreferredCorridor] = useState('IAF Mi-17 Rotary Airbridge Alpha');

  // ── Admin Form States ──
  const [adminBypassRoute, setAdminBypassRoute] = useState('NH-2 Mao Sector / IAF MI-17 Rotary Airbridge');
  const [adminSelectedVehicle, setAdminSelectedVehicle] = useState<VehicleCategory>('IAF_MI17_HELI_AIRLIFT');
  const [adminRouteNotes, setAdminRouteNotes] = useState('State EOC re-routing to Mi-17 Airbridge to bypass road breach.');

  // Sync selectedZoneId
  useEffect(() => {
    if (!selectedZoneId && crisisZones.length > 0) {
      setSelectedZoneId(crisisZones[0].id);
    }
  }, [crisisZones, selectedZoneId]);

  const activeZone = crisisZones.find(z => z.id === selectedZoneId) || crisisZones[0];

  const triggerToast = (msg: string) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(null), 5000);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Filtered SMS messages for the active role
  const roleSmsMessages = smsMessages.filter(
    msg => !msg.recipientRole || msg.recipientRole === 'all' || msg.recipientRole === activeRole
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-4 flex flex-col font-sans text-slate-100 overflow-hidden"
        style={{ height: 'min(92vh, 740px)' }}
      >
        {/* Mobile Phone Speaker Notch Bar */}
        <div className="flex items-center justify-between px-2 pt-0.5 pb-2 text-[10px] text-slate-400 font-mono select-none shrink-0 border-b border-slate-900">
          <span className="font-bold tracking-widest text-slate-300">NERA-SAT-LINK</span>
          <div className="w-16 h-1.5 bg-slate-800 rounded-full mx-auto" />
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>📶 VHF CH-14</span>
            <span>🔋 98%</span>
          </div>
        </div>

        {/* Header Strip (Strictly Portal-Locked) */}
        <div className="border-b border-slate-800 pb-2.5 my-2 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {activeRole === 'police' ? '👮' : activeRole === 'admin' ? '🏛️' : '📱'}
              </span>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  {activeRole === 'police'
                    ? 'Police Tactical SMS Radio'
                    : activeRole === 'admin'
                    ? 'State EOC Command SMS Terminal'
                    : 'Civilian Emergency SMS Alerts'}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {activeRole === 'police'
                    ? 'Sector Thana & Highway Patrol Link (VHF 156.700 MHz)'
                    : activeRole === 'admin'
                    ? 'Apex Disaster Logistics Directives Link'
                    : 'Public Evacuation, Tracking & NDMA Relief Stream'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className={`p-1.5 rounded-lg text-xs font-mono font-bold flex items-center justify-between border ${
            activeRole === 'police'
              ? 'bg-blue-950/80 border-blue-600 text-blue-200'
              : activeRole === 'admin'
              ? 'bg-amber-950/80 border-amber-500 text-amber-200'
              : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
          }`}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {activeRole === 'police'
                  ? 'POLICE SECURE VHF CHANNEL'
                  : activeRole === 'admin'
                  ? 'STATE EOC APEX DISPATCH'
                  : 'PUBLIC CITIZEN RELIEF GATEWAY'}
              </span>
            </span>
            <span className="text-[10px] uppercase font-bold opacity-80">
              {activeRole.toUpperCase()} PORTAL ONLY
            </span>
          </div>
        </div>

        {/* View Mode Tabs: Feed vs Action Center */}
        <div className="flex border-b border-slate-800 mb-2 text-xs font-mono shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`flex-1 py-1.5 text-center font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'feed'
                ? activeRole === 'police'
                  ? 'border-blue-400 text-blue-300'
                  : activeRole === 'admin'
                  ? 'border-[#fb792b] text-[#fb792b]'
                  : 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeRole === 'police'
              ? '👮 Police Feed'
              : activeRole === 'admin'
              ? '🏛️ Admin Feed'
              : '👥 Citizen Feed'}{' '}
            ({roleSmsMessages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`flex-1 py-1.5 text-center font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'workflow'
                ? 'border-white text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeRole === 'police'
              ? '👮 Command Actions'
              : activeRole === 'admin'
              ? '🏛️ EOC Logistics'
              : '📱 Citizen Action Center'}
          </button>
        </div>

        {/* Toast Alert */}
        {actionSuccessToast && (
          <div className="mb-2 p-2 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-100 text-xs font-bold animate-in fade-in flex items-center justify-between">
            <span>{actionSuccessToast}</span>
            <button onClick={() => setActionSuccessToast(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Main Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0 text-xs">

          {/* ════════════════════════════════════════════════════════════════
              TAB 1: ROLE-LOCKED SMS STREAM
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'feed' && (
            <div className="space-y-2">
              {roleSmsMessages.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono">
                  No SMS messages on this channel yet.
                </div>
              ) : (
                roleSmsMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-2xl border text-xs space-y-1.5 shadow-sm transition-all ${
                      msg.type === 'police'
                        ? 'bg-blue-950/40 border-blue-800/80 text-blue-100'
                        : msg.type === 'admin_route' || msg.type === 'admin_reroute'
                        ? 'bg-amber-950/40 border-amber-700/80 text-amber-100'
                        : msg.type === 'police_verify'
                        ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-100'
                        : msg.type === 'police_reroute_req'
                        ? 'bg-rose-950/50 border-rose-600 text-rose-100'
                        : msg.type === 'citizen'
                        ? 'bg-slate-900/90 border-slate-700 text-slate-200'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80 border-b border-white/10 pb-1">
                      <span className="font-bold text-white flex items-center gap-1">
                        {msg.type === 'police' && '👮'}
                        {(msg.type === 'admin_route' || msg.type === 'admin_reroute') && '🏛️'}
                        {msg.type === 'citizen' && '👥'}
                        {msg.type === 'police_reroute_req' && '🛑'}
                        {msg.type === 'police_verify' && '✅'}
                        {msg.sender}
                      </span>
                      <span>{msg.time}</span>
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-wider text-[#fb792b]">
                      {msg.tag}
                    </div>

                    <p className="text-xs leading-relaxed whitespace-pre-wrap font-sans">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              TAB 2: ROLE-LOCKED ACTION / COMMAND CENTER
          ════════════════════════════════════════════════════════════════ */}
          {activeTab === 'workflow' && (
            <div className="space-y-2.5">

              {/* ────────────────────────────────────────────────────────
                  1. CITIZEN ACTION CENTER
              ──────────────────────────────────────────────────────── */}
              {activeRole === 'citizen' && (
                <div className="space-y-2">
                  {/* Citizen Sub-Navigation */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCitizenSubTab('tracker')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        citizenSubTab === 'tracker' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🚚 Tracker
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitizenSubTab('requisition')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        citizenSubTab === 'requisition' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📦 Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitizenSubTab('safezones')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        citizenSubTab === 'safezones' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⛺ Safe Havens
                    </button>
                    <button
                      type="button"
                      onClick={() => setCitizenSubTab('report_hazard')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        citizenSubTab === 'report_hazard' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📢 Report
                    </button>
                  </div>

                  {/* Subview 1: Inbound Vehicle & Supply Manifest Tracker */}
                  {citizenSubTab === 'tracker' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>🚚</span> Inbound Relief Convoy Tracker
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600 animate-pulse">
                          LIVE SATELLITE ETA
                        </span>
                      </div>

                      {trackingVehicles.map(vehicle => (
                        <div key={vehicle.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <strong className="text-white text-xs">{vehicle.vehicleName}</strong>
                            <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded border border-blue-600">
                              {vehicle.status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-300">
                            <p><strong>Driver / Pilot:</strong> {vehicle.driverName} ({vehicle.driverPhone})</p>
                            <p><strong>Current Sector:</strong> {vehicle.currentLocationName}</p>
                            <p className="text-amber-300 font-bold">
                              ⏱️ Estimated Arrival (ETA): ~{vehicle.etaMinutes} mins
                            </p>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>Depot ({vehicle.originDepot})</span>
                              <span>{vehicle.progressPercent}% En Route</span>
                              <span>Target VAP</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${vehicle.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Manifest Checklist */}
                          <div className="p-2 rounded-lg bg-black/40 border border-white/5 space-y-1 text-[10px]">
                            <span className="font-bold text-slate-300 uppercase block">📦 On-Board Supplies Manifest:</span>
                            <ul className="space-y-0.5 text-slate-300">
                              {vehicle.manifestItems.map((item, i) => (
                                <li key={i} className="flex items-center justify-between">
                                  <span>• {item.name}</span>
                                  <span className="text-emerald-400 font-bold">{item.quantity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Subview 2: Citizen Needs Requisition Pipeline */}
                  {citizenSubTab === 'requisition' && (
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-[#fb792b] uppercase tracking-wide flex items-center gap-1.5">
                          <span>📦</span> Requisition Specific Essentials
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Routes to Police SMS</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Category:</label>
                            <select
                              value={reqCategory}
                              onChange={e => setReqCategory(e.target.value as EssentialCategory)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                            >
                              <option value="POTABLE_WATER">💧 Potable Drinking Water</option>
                              <option value="FOOD_RATIONS">🍞 Dry Food Rations</option>
                              <option value="INFANT_FORMULA">🍼 Infant Formula & Milk</option>
                              <option value="CRITICAL_MEDICINE">💉 Anti-Venom & Medicines</option>
                              <option value="OXYGEN_CYLINDERS">🫁 Emergency Oxygen</option>
                              <option value="SHELTER_TARPAULIN">⛺ Tarpaulin & Blankets</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Priority:</label>
                            <select
                              value={reqPriority}
                              onChange={e => setReqPriority(e.target.value as any)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-300 font-bold"
                            >
                              <option value="URGENT">⚠️ Urgent Need</option>
                              <option value="LIFE_THREAT">🚨 Life-Threatening</option>
                              <option value="STANDARD">Standard Relief</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Family / PAX Count:</label>
                            <input
                              type="number"
                              value={reqFamilyCount}
                              onChange={e => setReqFamilyCount(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone:</label>
                            <input
                              type="text"
                              value={reqPhone}
                              onChange={e => setReqPhone(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Landmark / Location:</label>
                          <input
                            type="text"
                            value={reqLandmark}
                            onChange={e => setReqLandmark(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Specific Items Needed:</label>
                          <textarea
                            rows={2}
                            value={reqSpecificItems}
                            onChange={e => setReqSpecificItems(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white resize-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newReq = submitCitizenSupplyRequisition({
                              citizenName: reqCitizenName,
                              contactPhone: reqPhone,
                              landmark: reqLandmark,
                              crisisZoneId: activeZone?.id,
                              category: reqCategory,
                              priority: reqPriority,
                              familyCount: parseInt(reqFamilyCount, 10) || 4,
                              specificItems: reqSpecificItems,
                            });
                            triggerToast(`📦 Requisition ${newReq.id} transmitted to Police SMS!`);
                            setActiveTab('feed');
                          }}
                          className="w-full bg-[#fb792b] hover:bg-[#e06820] text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-1"
                        >
                          <span>📤</span>
                          <span>TRANSMIT REQUISITION TO POLICE SMS</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subview 3: Safe Zone Distance & Evacuation Finder */}
                  {citizenSubTab === 'safezones' && (
                    <div className="space-y-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>⛺</span> Nearest Designated Safe Havens
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Distance Calculated</span>
                      </div>

                      <div className="space-y-2">
                        {safeZones.map(zone => {
                          const dist = activeZone
                            ? calculateDistanceKm(activeZone.lat, activeZone.lng, zone.lat, zone.lng)
                            : 4.2;
                          return (
                            <div key={zone.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <strong className="text-white text-xs">{zone.name}</strong>
                                <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600">
                                  {dist} km away
                                </span>
                              </div>

                              <p className="text-slate-400 text-[11px]">District: {zone.district} | Access: <strong className="text-amber-300">{zone.accessRoadStatus}</strong></p>

                              <div className="flex items-center gap-2 text-[10px] text-slate-300">
                                <span>💧 Water: {zone.potableWater ? '✅ Available' : '❌ Depleted'}</span>
                                <span>🏥 Medical: {zone.medicalStation ? '✅ On-Site' : '❌ None'}</span>
                                <span>👥 Capacity: {zone.currentOccupancy}/{zone.capacityPAX}</span>
                              </div>

                              <p className="text-[10px] text-slate-300 bg-black/40 p-1.5 rounded border border-white/5">
                                <strong>🧭 Guidance:</strong> {zone.navigationGuidance}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Subview 4: Crowdsourced Ground Hazard Reporting */}
                  {citizenSubTab === 'report_hazard' && (
                    <div className="space-y-2 p-3 rounded-2xl bg-rose-950/30 border border-rose-800">
                      <div className="flex items-center justify-between border-b border-rose-900 pb-1.5">
                        <span className="text-xs font-black text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>📢</span> Report On-Ground Crisis Hazard
                        </span>
                        <span className="text-[10px] text-rose-400 font-mono">Feeds Police QRT</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Hazard Category:</label>
                            <select
                              value={incCategory}
                              onChange={e => setIncCategory(e.target.value as GroundIncidentCategory)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                            >
                              <option value="ROAD_WASHOUT">⛰️ Road Washout</option>
                              <option value="STRUCTURAL_COLLAPSE">🏚️ Structural Collapse</option>
                              <option value="STRANDED_CLUSTER">👥 Stranded Cluster</option>
                              <option value="MUDSLIDE_ACTIVE">🌊 Active Mudslide</option>
                              <option value="MEDICAL_EMERGENCY">🚑 Medical Trauma</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Severity:</label>
                            <select
                              value={incSeverity}
                              onChange={e => setIncSeverity(e.target.value as any)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-rose-300 font-bold"
                            >
                              <option value="CRITICAL">🚨 Critical Danger</option>
                              <option value="HIGH">⚠️ High Hazard</option>
                              <option value="MODERATE">Moderate Risk</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Location Landmark:</label>
                          <input
                            type="text"
                            value={incLandmark}
                            onChange={e => setIncLandmark(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Ground Truth Description:</label>
                          <textarea
                            rows={2}
                            value={incDesc}
                            onChange={e => setIncDesc(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white resize-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const newInc = submitCitizenGroundIncident({
                              citizenName: reqCitizenName,
                              contactPhone: reqPhone,
                              crisisZoneId: activeZone?.id,
                              locationLandmark: incLandmark,
                              incidentCategory: incCategory,
                              severity: incSeverity,
                              description: incDesc,
                            });
                            triggerToast(`📢 Incident ${newInc.id} transmitted to Police QRT!`);
                            setActiveTab('feed');
                          }}
                          className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/60 cursor-pointer mt-1"
                        >
                          <span>📢</span>
                          <span>TRANSMIT GROUND HAZARD TO POLICE</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  2. POLICE COMMAND ACTIONS
              ──────────────────────────────────────────────────────── */}
              {activeRole === 'police' && (
                <div className="space-y-2">
                  {/* Police Sub-Navigation */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setPoliceSubTab('intel_queue')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        policeSubTab === 'intel_queue' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🚨 Citizen Intel ({supplyRequisitions.length + citizenIncidents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoliceSubTab('directives')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        policeSubTab === 'directives' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🗺️ Directives to Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setPoliceSubTab('operations')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        policeSubTab === 'operations' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📋 Operations & Clear
                    </button>
                  </div>

                  {/* Subview 1: Live Intelligence & Citizen Requests Dashboard */}
                  {policeSubTab === 'intel_queue' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>🚨</span> Incoming Citizen Requisitions & Hazards
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Police Review Queue</span>
                      </div>

                      {/* Citizen Requisitions */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">📦 Essential Supplies Requests:</span>
                        {supplyRequisitions.map(req => (
                          <div key={req.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-amber-300">{req.id}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                req.status === 'VERIFIED_BY_POLICE'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                                  : req.status === 'DISPATCHED_BY_ADMIN'
                                  ? 'bg-blue-950 text-blue-300 border-blue-600'
                                  : 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
                              }`}>
                                {req.status.replace(/_/g, ' ')}
                              </span>
                            </div>

                            <p className="text-slate-200">
                              <strong>Citizen:</strong> {req.citizenName} ({req.contactPhone}) | <strong>PAX:</strong> {req.familyCount}
                            </p>
                            <p className="text-slate-300 text-[11px]">
                              <strong>Category:</strong> {req.category} | <strong>Landmark:</strong> {req.landmark}
                            </p>
                            <p className="text-[10px] text-slate-400 bg-black/40 p-1.5 rounded">
                              <strong>Items:</strong> {req.specificItems}
                            </p>

                            {req.status === 'PENDING_POLICE_REVIEW' && (
                              <button
                                type="button"
                                onClick={() => {
                                  policeVerifyAndForwardRequisition(req.id, 'Verified by Sector Police OC. Immediate dispatch required.');
                                  triggerToast(`✅ Requisition ${req.id} verified & forwarded to State EOC!`);
                                  setActiveTab('feed');
                                }}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>✅</span> Verify & Forward Directive to Admin
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Crowdsourced Ground Incidents */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-bold text-rose-400 uppercase">📢 Crowdsourced Incident Flags:</span>
                        {citizenIncidents.map(inc => (
                          <div key={inc.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-rose-300">{inc.id}</span>
                              <span className="text-[10px] font-bold bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded border border-rose-600">
                                {inc.severity}
                              </span>
                            </div>
                            <p className="text-slate-200"><strong>Type:</strong> {inc.incidentCategory} at {inc.locationLandmark}</p>
                            <p className="text-[10px] text-slate-400">"{inc.description}" (Reported: {inc.reportedAt})</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subview 2: Strategic Routing Directives Panel */}
                  {policeSubTab === 'directives' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-blue-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>🗺️</span> Push Strategic Directive to Admin
                        </span>
                        <span className="text-[10px] text-blue-400 font-mono">VHF ⇄ EOC Direct Link</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Active Hazard Zone:</label>
                          <select
                            value={selectedZoneId}
                            onChange={e => setSelectedZoneId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
                          >
                            {crisisZones.map(z => (
                              <option key={z.id} value={z.id}>
                                🚨 {z.title} ({z.policeStation})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Tactical Ground Directive:</label>
                          <textarea
                            rows={3}
                            value={policeDirectiveText}
                            onChange={e => setPoliceDirectiveText(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Recommended Bypass Mode:</label>
                          <select
                            value={policePreferredCorridor}
                            onChange={e => setPolicePreferredCorridor(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-amber-300 font-bold"
                          >
                            <option value="IAF Mi-17 Rotary Airbridge Alpha">🚁 IAF Mi-17 Rotary Airbridge (Gorge Severed)</option>
                            <option value="Hill 4x4 Bolero Fleet (North Ridge)">🚙 Hill 4x4 Off-Road Bolero Fleet (Ridge Track)</option>
                            <option value="SDRF River Assault Boat">🚤 SDRF Motorized Assault Boat BAUT</option>
                            <option value="Heavy Cargo UAV Drone Lift">🛸 Heavy Cargo Disaster UAV Drone</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            policePushRouteDirective({
                              zoneId: activeZone?.id || 'pcz-01',
                              officerName: 'OC Inspector R. Barman (Haflong PS)',
                              directiveText: policeDirectiveText,
                              preferredCorridor: policePreferredCorridor,
                            });
                            triggerToast('📤 Strategic Directive pushed to State EOC Admin SMS!');
                            setActiveTab('feed');
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-1"
                        >
                          <span>📤</span>
                          <span>PUSH STRATEGIC DIRECTIVE TO ADMIN SMS</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subview 3: Operations Lifecycle & Issue Resolution */}
                  {policeSubTab === 'operations' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>📋</span> Operations Lifecycle & Clear
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">Resolution Board</span>
                      </div>

                      {activeZone ? (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <strong className="text-white">{activeZone.title}</strong>
                            <span className="text-[10px] font-mono font-bold bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-600">
                              {activeZone.workflowStatus}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-300 space-y-1 bg-black/40 p-2 rounded-lg">
                            <p><strong>Corridor:</strong> {activeZone.affectedCorridor}</p>
                            <p><strong>Thana:</strong> {activeZone.policeStation}</p>
                            {activeZone.assignedRouteName && (
                              <p className="text-amber-300"><strong>Route:</strong> {activeZone.assignedRouteName}</p>
                            )}
                          </div>

                          {/* 1-Tap Issue Resolved */}
                          <button
                            type="button"
                            onClick={() => {
                              resolveAndClearCrisisZone({
                                zoneId: activeZone.id,
                                officerName: 'OC Inspector R. Barman',
                                resolutionNotes: 'Highway cleared and safe passage restored.',
                              });
                              triggerToast('🎉 Crisis resolved & cleared from map! All-clear SMS broadcasted.');
                              setActiveTab('feed');
                            }}
                            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer"
                          >
                            <span>🎉</span>
                            <span>ISSUE RESOLVED & CLEAR FROM MAP</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-4">No active crisis zones. Map is clear!</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ────────────────────────────────────────────────────────
                  3. ADMIN APEX EOC ACTIONS
              ──────────────────────────────────────────────────────── */}
              {activeRole === 'admin' && (
                <div className="space-y-2">
                  {/* Admin Sub-Navigation */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('corridors')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        adminSubTab === 'corridors' ? 'bg-[#fb792b] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ⚡ Dynamic Corridors
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('resources')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        adminSubTab === 'resources' ? 'bg-[#fb792b] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      📦 Resource Allocation
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminSubTab('resolve')}
                      className={`py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        adminSubTab === 'resolve' ? 'bg-[#fb792b] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      🎉 Resolve Zone
                    </button>
                  </div>

                  {/* Subview 1: Dynamic Corridors & Fleet Allocation */}
                  {adminSubTab === 'corridors' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-[#fb792b] uppercase tracking-wide flex items-center gap-1.5">
                          <span>⚡</span> Dynamic Corridor & Fleet Router
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">State EOC Engine</span>
                      </div>

                      {activeZone ? (
                        <div className="space-y-2 text-xs">
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                            <strong className="text-white block">{activeZone.title}</strong>
                            <p className="text-[11px] text-slate-300">Status: <span className="text-amber-300 font-bold">{activeZone.workflowStatus}</span></p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Select Bypass Corridor:</label>
                            <input
                              type="text"
                              value={adminBypassRoute}
                              onChange={e => setAdminBypassRoute(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Fleet Category:</label>
                            <select
                              value={adminSelectedVehicle}
                              onChange={e => setAdminSelectedVehicle(e.target.value as VehicleCategory)}
                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-amber-300 font-bold"
                            >
                              <option value="IAF_MI17_HELI_AIRLIFT">🚁 IAF Mi-17 Rotary Airbridge (Gorge Severed)</option>
                              <option value="HILL_4X4_OFFROAD_2T">🚙 Hill 4x4 Off-Road Bolero (Steep Slope)</option>
                              <option value="RIVERINE_BOAT_BAUT">🚤 SDRF Motorized Assault Boat BAUT</option>
                              <option value="DISASTER_CARGO_DRONE">🛸 Heavy Disaster Cargo UAV Drone</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              adminRerouteCrisisZone({
                                zoneId: activeZone.id,
                                newRouteName: adminBypassRoute,
                                newVehicleCategory: adminSelectedVehicle,
                                newVehicleName: VEHICLE_CONSTRAINTS[adminSelectedVehicle]?.displayName || 'Tactical Convoy',
                                adminNotes: adminRouteNotes,
                              });
                              triggerToast('🔄 Re-route confirmed & broadcasted to Police & Citizens!');
                              setActiveTab('feed');
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer mt-1"
                          >
                            <span>🔄</span>
                            <span>EXECUTE RE-ROUTE & BROADCAST SMS</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-4">No active crisis zones.</p>
                      )}
                    </div>
                  )}

                  {/* Subview 2: Resource Allocation Engine */}
                  {adminSubTab === 'resources' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>📦</span> Strategic Depot Matching & Dispatch
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">Stockpile Matching</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <span className="font-bold text-slate-300 block">Strategic Apex Depots:</span>
                          <p className="text-[11px] text-slate-400">• Guwahati Apex Depot: 1,400L Water, 350 Anti-Venom, 1,200kg Rations</p>
                          <p className="text-[11px] text-slate-400">• Silchar Depot: 800L Water, 150 Anti-Venom, 800kg Rations</p>
                        </div>

                        {supplyRequisitions.map(req => (
                          <div key={req.id} className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-amber-300">{req.id} ({req.familyCount} PAX)</span>
                              <span className="text-[10px] font-bold text-emerald-400">{req.status}</span>
                            </div>
                            <p className="text-slate-300"><strong>Items:</strong> {req.specificItems}</p>
                            <p className="text-slate-400 text-[10px]">Location: {req.landmark}</p>

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
                                  });
                                  triggerToast(`🚚 Convoy dispatched for ${req.id}! Citizens & Police notified.`);
                                  setActiveTab('feed');
                                }}
                                className="w-full bg-[#fb792b] hover:bg-[#e06820] text-white font-bold py-1.5 rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>🚚</span> Dispatch Nearest Convoy (Bolero-04)
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Subview 3: Sector Normalization */}
                  {adminSubTab === 'resolve' && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span>🎉</span> Sector Normalization & Clear
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">State EOC</span>
                      </div>

                      {activeZone ? (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                          <strong className="text-white block">{activeZone.title}</strong>
                          <p className="text-slate-300 text-[11px]">{activeZone.affectedCorridor}</p>

                          <button
                            type="button"
                            onClick={() => {
                              resolveAndClearCrisisZone({
                                zoneId: activeZone.id,
                                officerName: 'State EOC Admin Controller',
                                resolutionNotes: 'Disaster operation completed. Corridor restored to safe transit.',
                              });
                              triggerToast('🎉 Sector normalized & cleared from GIS map!');
                              setActiveTab('feed');
                            }}
                            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/60 cursor-pointer"
                          >
                            <span>🎉</span>
                            <span>NORMALIZE SECTOR & CLEAR FROM MAP</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-4">No active crisis zones.</p>
                      )}
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* Mobile Phone Footer Bar */}
        <div className="mt-2 pt-2 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono flex items-center justify-between px-1 shrink-0">
          <span>NERA DISASTER COMMS SECURE GATEWAY</span>
          <span className="text-emerald-400 font-bold">● V140 LIVE</span>
        </div>

      </div>
    </div>
  );
}