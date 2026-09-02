// lib/disaster-comms-store.ts
// ========================================================================
//    NERA: UNIFIED DISASTER COMMUNICATIONS, ROUTE ARBITRATION & BEACONS STORE
//    Synchronizes Police Feasibility Reports, Admin Corridor Directives,
//    Citizen Safe Relief Beacons, and Citizen SOS Distress Pings.
// ========================================================================

import { useEffect, useState, useCallback } from 'react'
import { VehicleCategory } from './vehicle-suitability-matrix'
import { calculateDistanceKm } from './calculateDistanceKm'

export type PassabilityStatus = 'PASSABLE' | 'RESTRICTED_4X4' | 'BLOCKED'

export interface PoliceRouteAssessment {
  id: string
  corridorName: string
  corridorKey?: string
  sectorDistrict: string
  policeStation: string
  reportedBy: string
  passability: PassabilityStatus
  recommendedVehicleCategory: VehicleCategory
  equipmentNeeds: string[] // e.g. ['JCB Excavator', 'Bailey Bridge Spares', 'Winch Escort']
  hazardDescription: string
  lat: number
  lng: number
  status: 'PENDING_ADMIN_REVIEW' | 'APPROVED_BY_ADMIN' | 'OVERRIDDEN'
  timestamp: string
}

export interface ActiveCorridorDecision {
  corridorId: string
  corridorName: string
  status: 'ACTIVE_DISPATCH' | 'DIVERTED' | 'STANDBY'
  assignedVehicleCategory: VehicleCategory
  assignedVehicleName: string
  assignedVehicleId: string
  statutoryDirectiveText: string
  approvedBy: string
  approvedAt: string
  vhfChannel: string
  originHub: string
  destinationTarget: string
  cargoType: string
  etaMinutes: number
  alongRouteThanas: string[]
  targetCoords?: { lat: number; lng: number }
  originCoords?: { lat: number; lng: number; name?: string }
  pathCoordinates?: [number, number][]
  vehicleTelemetry?: any
  distanceKm?: number
}

export interface ReliefBeacon {
  id: string
  name: string
  lat: number
  lng: number
  markedBy: string
  contactPhone?: string
  evacueeCount: number
  waterAvailable: boolean
  shelterAvailable: boolean
  medicalNeeds: boolean
  safeRouteDescription?: string
  notes: string
  verifiedByPolice: boolean
  verifiedBy?: string | null
  rescueTeamDispatched: boolean
  dispatchedTeamName?: string | null
  timestamp: string
}

export type CrisisWorkflowStatus =
  | 'CRISIS_MARKED'
  | 'ROUTE_ASSIGNED'
  | 'POLICE_VERIFIED'
  | 'POLICE_REROUTE_REQUESTED'
  | 'ADMIN_REROUTED'

export interface PoliceCrisisZone {
  id: string
  title: string
  hazardType: string
  lat: number
  lng: number
  radiusMeters: number // In meters, e.g. 8500m (8.5km)
  severity: 'CRITICAL_DANGER' | 'HIGH_RISK'
  affectedCorridor: string
  policeStation: string
  declaredBy: string
  evacuationGuidance: string
  workflowStatus: CrisisWorkflowStatus
  assignedRouteName?: string
  assignedVehicleCategory?: VehicleCategory
  assignedVehicleName?: string
  assignedRouteCoordinates?: [number, number][]
  distanceKm?: number
  etaMinutes?: number
  adminNotes?: string
  policeVerificationNotes?: string
  policeObstacleReport?: string
  reroutedRouteName?: string
  reroutedVehicleCategory?: VehicleCategory
  reroutedVehicleName?: string
  reroutedRouteCoordinates?: [number, number][]
  timestamp: string
}

export function computeCrisisRouteCoordinates(
  destLat: number,
  destLng: number,
  mode: 'primary' | 'bypass' | 'air' = 'primary'
): [number, number][] {
  const origin: [number, number] = [26.1445, 91.7362] // Strategic Apex Supply Hub (Guwahati)

  if (mode === 'air') {
    const steps = 18
    const coords: [number, number][] = []
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps
      const lat = origin[0] + (destLat - origin[0]) * frac + Math.sin(frac * Math.PI) * 0.08
      const lng = origin[1] + (destLng - origin[1]) * frac + Math.sin(frac * Math.PI) * 0.05
      coords.push([parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))])
    }
    return coords
  }

  if (mode === 'bypass') {
    const anchors: [number, number][] = [
      origin,
      [26.1300, 92.3200], // Jagiroad
      [26.3450, 92.6840], // Nagaon Bypass
      [25.9200, 93.7500], // Dimapur Corridor
      [25.6700, 94.1000], // Kohima Ridge
      [25.5000, 94.1300], // Mao Sector Bypass
      [destLat + 0.08, destLng - 0.05],
      [destLat, destLng]
    ]
    const interpolated: [number, number][] = []
    for (let i = 0; i < anchors.length - 1; i++) {
      const start = anchors[i]
      const end = anchors[i + 1]
      const subSteps = 6
      for (let s = 0; s < subSteps; s++) {
        const frac = s / subSteps
        const lat = start[0] + (end[0] - start[0]) * frac
        const lng = start[1] + (end[1] - start[1]) * frac
        interpolated.push([parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))])
      }
    }
    interpolated.push([destLat, destLng])
    return interpolated
  }

  // Primary Motorable Arterial Route
  const anchors: [number, number][] = [
    origin,
    [26.1150, 91.8900],
    [26.1300, 92.3200],
    [26.3450, 92.6840],
    [26.0020, 92.9500],
    [25.7500, 93.1700],
    [25.4500, 93.0800],
    [25.1833, 93.0167],
    [24.8000, 93.1200],
    [(24.8000 + destLat) / 2 + 0.03, (93.1200 + destLng) / 2 - 0.02],
    [destLat, destLng]
  ]
  const interpolated: [number, number][] = []
  for (let i = 0; i < anchors.length - 1; i++) {
    const start = anchors[i]
    const end = anchors[i + 1]
    const subSteps = 5
    for (let s = 0; s < subSteps; s++) {
      const frac = s / subSteps
      const lat = start[0] + (end[0] - start[0]) * frac
      const lng = start[1] + (end[1] - start[1]) * frac
      interpolated.push([parseFloat(lat.toFixed(5)), parseFloat(lng.toFixed(5))])
    }
  }
  interpolated.push([destLat, destLng])
  return interpolated
}

export interface SMSMessage {
  id: string | number
  sender: string
  time: string
  tag: string
  content: string
  type: 'police' | 'admin_route' | 'police_verify' | 'police_reroute_req' | 'admin_reroute' | 'dispatch' | 'citizen' | 'system'
  zoneId?: string
  recipientRole?: 'police' | 'admin' | 'citizen' | 'all'
}

export interface CitizenSOSRequest {
  id: string
  citizenName: string
  lat: number
  lng: number
  landmark: string
  headcount: number
  needs: ('FOOD' | 'WATER' | 'MEDICINE' | 'OXYGEN' | 'EVACUATION' | 'SHELTER')[]
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE'
  contactPhone: string
  status: 'PENDING_DISPATCH' | 'EN_ROUTE' | 'RESCUED'
  dispatchedUnit?: string | null
  timestamp: string
}

export type EssentialCategory =
  | 'POTABLE_WATER'
  | 'FOOD_RATIONS'
  | 'INFANT_FORMULA'
  | 'CRITICAL_MEDICINE'
  | 'OXYGEN_CYLINDERS'
  | 'SHELTER_TARPAULIN'

export interface CitizenSupplyRequisition {
  id: string // e.g. REQ-NER-9481
  citizenName: string
  contactPhone: string
  landmark: string
  crisisZoneId?: string
  category: EssentialCategory
  priority: 'STANDARD' | 'URGENT' | 'LIFE_THREAT'
  familyCount: number
  specificItems: string
  status: 'PENDING_POLICE_REVIEW' | 'VERIFIED_BY_POLICE' | 'DISPATCHED_BY_ADMIN' | 'DELIVERED'
  assignedUnit?: string
  policeVerificationNote?: string
  timestamp: string
}

export type GroundIncidentCategory =
  | 'ROAD_WASHOUT'
  | 'STRUCTURAL_COLLAPSE'
  | 'STRANDED_CLUSTER'
  | 'MUDSLIDE_ACTIVE'
  | 'MEDICAL_EMERGENCY'

export interface CitizenGroundIncident {
  id: string // e.g. INC-CIT-104
  citizenName: string
  contactPhone: string
  crisisZoneId?: string
  locationLandmark: string
  incidentCategory: GroundIncidentCategory
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE'
  description: string
  reportedAt: string
  verifiedByPolice: boolean
  policeActionNote?: string
}

export interface InboundTrackingVehicle {
  id: string
  vehicleCode: string
  vehicleName: string
  driverName: string
  driverPhone: string
  category: VehicleCategory
  assignedCrisisZoneId: string
  currentLocationName: string
  destinationVAP: string
  originDepot: string
  etaMinutes: number
  progressPercent: number
  status: 'DISPATCHING' | 'IN_TRANSIT' | 'APPROACHING_ROADHEAD' | 'DELIVERED'
  manifestItems: { name: string; quantity: string; verifiedSafe: boolean }[]
  updatedAt: string
}

export interface DesignatedSafeZone {
  id: string
  name: string
  district: string
  lat: number
  lng: number
  capacityPAX: number
  currentOccupancy: number
  potableWater: boolean
  medicalStation: boolean
  foodSupplyStatus: 'ABUNDANT' | 'ADEQUATE' | 'CRITICAL'
  accessRoadStatus: 'CLEAR' | '4X4_ONLY' | 'FOOT_TRACK_ONLY'
  nearestCrisisZoneId: string
  navigationGuidance: string
}

// ── Initial Seed Data ──

const INITIAL_POLICE_CRISIS_ZONES: PoliceCrisisZone[] = [
  {
    id: 'pcz-01',
    title: 'Noney–Tupul Mountain Landslide Hazard Zone',
    hazardType: '⛰️ Massive Debris Landslide & River Inundation',
    lat: 24.7860,
    lng: 93.6540,
    radiusMeters: 8500, // 8.5 km danger perimeter
    severity: 'CRITICAL_DANGER',
    affectedCorridor: 'NH-37 Imphal–Jiribam Arterial (Noney Sector)',
    policeStation: 'Noney Police Station',
    declaredBy: 'SDPO Noney & Highway Patrol (Statutory Weight 9.5)',
    evacuationGuidance: 'High hazard sector: Active hill mudslides. Evacuate immediately towards verified Safe Haven beacons at the perimeter.',
    workflowStatus: 'ROUTE_ASSIGNED',
    assignedRouteName: 'NH-37 Tupul Bypass via North Ridge Footpath (km 48)',
    assignedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
    assignedVehicleName: 'Hill 4x4 Off-Road Bolero Fleet',
    assignedRouteCoordinates: computeCrisisRouteCoordinates(24.7860, 93.6540, 'primary'),
    distanceKm: 342,
    etaMinutes: 380,
    adminNotes: 'State EOC Admin designated 4x4 hill route. Awaiting Noney PS ground verification.',
    timestamp: '14:30 IST',
  },
  {
    id: 'pcz-02',
    title: 'Jatinga km 88 Hill Slope Severance Zone',
    hazardType: '⛰️ Mud Silt Sinking & Carriageway Severance',
    lat: 25.1833,
    lng: 93.0167,
    radiusMeters: 6000, // 6 km danger perimeter
    severity: 'CRITICAL_DANGER',
    affectedCorridor: 'NH-27 Lumding–Haflong Road',
    policeStation: 'Haflong Sadar PS',
    declaredBy: 'OC Haflong Sadar PS (Statutory Weight 9.5)',
    evacuationGuidance: 'Active road fracture. Evacuate via ridge footpath towards Jatinga High School Safe Haven.',
    workflowStatus: 'CRISIS_MARKED',
    adminNotes: 'Awaiting State EOC Admin corridor assignment.',
    timestamp: '15:15 IST',
  },
]

const INITIAL_SMS_MESSAGES: SMSMessage[] = [
  // ── 👮 POLICE PORTAL INBOX ──
  {
    id: 'sms-pol-1',
    sender: 'POLICE-SECTOR-HQ',
    time: '14:28 IST',
    tag: 'JURISDICTION ALERT',
    content: '🚨 [FIELD INTEL] Severe slope failure & mud surge reported at Noney Sector (NH-37). OC Noney PS please inspect, mark crisis danger perimeter on map, and await State EOC route calculation.',
    type: 'police',
    recipientRole: 'police',
    zoneId: 'pcz-01',
  },
  {
    id: 'sms-pol-2',
    sender: 'STATE-EOC-ADMIN',
    time: '14:32 IST',
    tag: 'INCOMING ROUTE DIRECTIVE',
    content: '📥 [ADMIN DIRECTIVE] State EOC Admin designated Route [NH-37 Tupul Bypass via 4x4 Bolero Fleet] for Noney–Tupul. Duty Police OC please inspect ground passability on map and tap "Verify Passable" or "Report Obstacle".',
    type: 'admin_route',
    recipientRole: 'police',
    zoneId: 'pcz-01',
  },
  {
    id: 'sms-pol-3',
    sender: 'HIGHWAY-PATROL-LOG',
    time: '15:10 IST',
    tag: 'THANA PATROL LOG',
    content: '📋 [PATROL UPDATE] Haflong Sadar PS patrol unit logged single-lane hill subsidence at km 88 Jatinga. 4x4 pilot escort ready on standby.',
    type: 'police',
    recipientRole: 'police',
    zoneId: 'pcz-02',
  },

  // ── 🏛️ ADMIN PORTAL INBOX ──
  {
    id: 'sms-adm-1',
    sender: 'POLICE-SECTOR-ALERT',
    time: '14:30 IST',
    tag: 'ACTION REQUIRED: CRISIS MARKED',
    content: '📥 [INCOMING CRISIS] OC Noney Police Station marked Crisis Danger Zone at Noney–Tupul (NH-37). Danger radius: 8.5 km. State EOC Admin required to calculate & assign relief corridor.',
    type: 'police',
    recipientRole: 'admin',
    zoneId: 'pcz-01',
  },
  {
    id: 'sms-adm-2',
    sender: 'STATE-EOC-ADMIN',
    time: '14:32 IST',
    tag: 'DIRECTIVE DISPATCHED',
    content: '📤 [ROUTE ORDER ISSUED] Calculated & assigned Route [NH-37 Tupul Bypass] with [Hill 4x4 Off-Road Bolero Fleet] for Noney–Tupul. SMS transmitted to Sector Police for verification.',
    type: 'admin_route',
    recipientRole: 'admin',
    zoneId: 'pcz-01',
  },
  {
    id: 'sms-adm-3',
    sender: 'APEX-HUB-LOGISTICS',
    time: '15:05 IST',
    tag: 'STRATEGIC SUPPLY MANIFEST',
    content: '📦 [SUPPLY MANIFEST] Guwahati Apex Hub loaded 12T Cold-Chain Anti-Venom & Pediatric Vaccines for Dima Hasao & Noney sectors. Ready for green corridor departure.',
    type: 'dispatch',
    recipientRole: 'admin',
  },

  // ── 👥 CITIZEN PORTAL INBOX ──
  {
    id: 'sms-cit-1',
    sender: 'NDMA-EMERGENCY-ALERT',
    time: '14:30 IST',
    tag: 'PUBLIC EVACUATION ADVISORY',
    content: '🚨 [NDMA EMERGENCY ALERT] Severe landslide hazard active at NH-37 Noney Sector. Avoid low river valleys. Evacuate immediately towards verified Safe Haven refuges (⛺) on map.',
    type: 'citizen',
    recipientRole: 'citizen',
    zoneId: 'pcz-01',
  },
  {
    id: 'sms-cit-2',
    sender: 'DISTRICT-REFUGE-DIRECTOR',
    time: '14:45 IST',
    tag: 'SAFE HAVEN DESIGNATED',
    content: '⛺ [SAFE REFUGE OPEN] Haflong High School Ground open as designated Safe Haven (38 PAX capacity). Clean drinking water & dry shelter available. Follow green path on map.',
    type: 'citizen',
    recipientRole: 'citizen',
    zoneId: 'pcz-01',
  },
  {
    id: 'sms-cit-3',
    sender: 'STATE-RELIEF-CONVOY',
    time: '15:12 IST',
    tag: 'RELIEF SUPPLIES INBOUND',
    content: '🚚 [ESSENTIAL SUPPLIES IN TRANSIT] Emergency 4x4 Bolero relief convoy carrying food packets, clean water, and medical kits dispatched from Guwahati towards relief camps.',
    type: 'citizen',
    recipientRole: 'citizen',
  },
]

const INITIAL_POLICE_ASSESSMENTS: PoliceRouteAssessment[] = [
  {
    id: 'pra-01',
    corridorName: 'NH-27 Trans-Assam Express (Dima Hasao Sector)',
    corridorKey: 'NH-27',
    sectorDistrict: 'Dima Hasao',
    policeStation: 'Haflong Sadar PS',
    reportedBy: 'OC Inspector R. Barman (Statutory Weight 9.5)',
    passability: 'RESTRICTED_4X4',
    recommendedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
    equipmentNeeds: ['JCB Excavator', 'Police Pilot Escort', 'Winch Recovery Truck'],
    hazardDescription: 'Hill slope fracture at km 88 Jatinga. Heavy multi-axle 24T barred; Hill 4x4 Bolero convoys passable with police escort.',
    lat: 25.1833,
    lng: 93.0167,
    status: 'APPROVED_BY_ADMIN',
    timestamp: '15:20 IST',
  },
  {
    id: 'pra-02',
    corridorName: 'NH-10 Siliguri–Sevoke–Teesta Gorge',
    corridorKey: 'NH-10',
    sectorDistrict: 'Kalimpong / Darjeeling',
    policeStation: 'Sevoke Traffic PS',
    reportedBy: 'BRO Project Swastik Cdr. & OC P. Bhutia',
    passability: 'BLOCKED',
    recommendedVehicleCategory: 'IAF_MI17_HELI_AIRLIFT',
    equipmentNeeds: ['Heavy Hydraulic Breaker', 'Airbridge Rotary Landing Officer'],
    hazardDescription: 'High-water surge at 29th Mile. Carriageway washed out; zero ground vehicle transit. Recommend Mi-17 rotary airbridge for critical medical plasma.',
    lat: 26.8833,
    lng: 88.4667,
    status: 'PENDING_ADMIN_REVIEW',
    timestamp: '15:32 IST',
  },
]

const INITIAL_CORRIDOR_DECISION: ActiveCorridorDecision = {
  corridorId: 'COR-NH27-DEC-01',
  corridorName: 'NH-27 Trans-Assam Express (Dima Hasao Sector)',
  status: 'ACTIVE_DISPATCH',
  assignedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
  assignedVehicleName: 'Hill 4x4 Off-Road Bolero (NER-4x4-07)',
  assignedVehicleId: 'NER-4x4-07',
  statutoryDirectiveText: 'Statutory Route Clearance under BNSS Sec 187: Priority 1 Cold-Chain Vaccines & Blood dispatched via 4x4 Bolero convoy with Police VHF pilot escort.',
  approvedBy: 'State EOC Apex Command (Admin)',
  approvedAt: '15:25 IST',
  vhfChannel: 'CH-14 (156.700 MHz)',
  originHub: '🏛️ Guwahati Multi-Modal Apex Hub',
  destinationTarget: 'Haflong Outpost ➔ Jatinga Roadhead VAP (km 88)',
  cargoType: 'Cold-Chain Anti-Venom & Pediatric Vaccines (2-8°C)',
  etaMinutes: 42,
  alongRouteThanas: ['Guwahati Sadar PS', 'Nagaon Traffic PS', 'Lumding PS', 'Haflong Sadar PS', 'Jatinga Outpost'],
}

const INITIAL_RELIEF_BEACONS: ReliefBeacon[] = [
  {
    id: 'beacon-01',
    name: 'Jatinga High School Community Safe Shelter',
    lat: 25.1167,
    lng: 93.0333,
    markedBy: 'Gaon Burah D. Hrangkhol (Evacuated Citizen Group)',
    contactPhone: '+91 94350-77889',
    evacueeCount: 38,
    waterAvailable: true,
    shelterAvailable: true,
    medicalNeeds: true,
    notes: 'Elevated concrete structure safe from mudslides. 38 civilians including 9 infants. Need pediatric ORS and dry rations.',
    verifiedByPolice: true,
    verifiedBy: 'Haflong Sadar PS (OC R. Barman)',
    rescueTeamDispatched: true,
    dispatchedTeamName: 'SDRF Quick Response Team-02 (Haflong)',
    timestamp: '14:45 IST',
  },
  {
    id: 'beacon-02',
    name: 'Tupul Hilltop Ridge Safe Zone',
    lat: 24.7167,
    lng: 93.6833,
    markedBy: 'K. Rongmei (Railway Worker & Local Resident)',
    contactPhone: '+91 98620-33441',
    evacueeCount: 19,
    waterAvailable: false,
    shelterAvailable: true,
    medicalNeeds: false,
    notes: 'Safe elevated ridge above landslide debris. Need clean drinking water packets and solar lighting.',
    verifiedByPolice: false,
    verifiedBy: null,
    rescueTeamDispatched: false,
    dispatchedTeamName: null,
    timestamp: '15:10 IST',
  },
]

const INITIAL_SOS_REQUESTS: CitizenSOSRequest[] = [
  {
    id: 'sos-01',
    citizenName: 'Biren Das & Family',
    lat: 26.9100,
    lng: 94.2300,
    landmark: 'Near Kamalabari Char Flood Embankment',
    headcount: 6,
    needs: ['FOOD', 'WATER', 'MEDICINE'],
    urgency: 'CRITICAL',
    contactPhone: '+91 94351-99882',
    status: 'EN_ROUTE',
    dispatchedUnit: 'SDRF Motorized Assault Boat BAUT-02',
    timestamp: '15:18 IST',
  },
  {
    id: 'sos-02',
    citizenName: 'Lalremruata & 4 Co-travellers',
    lat: 23.7500,
    lng: 92.7400,
    landmark: 'Stranded near km 42 Sairang Rockfall',
    headcount: 5,
    needs: ['EVACUATION', 'WATER'],
    urgency: 'HIGH',
    contactPhone: '+91 98621-77443',
    status: 'PENDING_DISPATCH',
    dispatchedUnit: null,
    timestamp: '15:30 IST',
  },
]

const INITIAL_SUPPLY_REQUISITIONS: CitizenSupplyRequisition[] = [
  {
    id: 'REQ-NER-9481',
    citizenName: 'Biren Das',
    contactPhone: '+91 94350-12345',
    landmark: 'Tupul Ridge Footpath Junction',
    crisisZoneId: 'pcz-01',
    category: 'POTABLE_WATER',
    priority: 'URGENT',
    familyCount: 5,
    specificItems: '20L Drinking Water Bottles, ORS Packets & Infant Paracetamol Drops',
    status: 'PENDING_POLICE_REVIEW',
    timestamp: '15:20 IST',
  },
  {
    id: 'REQ-NER-8820',
    citizenName: 'Lalthanzuala',
    contactPhone: '+91 98621-77443',
    landmark: 'Jatinga km 88 Camp near Stream',
    crisisZoneId: 'pcz-02',
    category: 'FOOD_RATIONS',
    priority: 'STANDARD',
    familyCount: 8,
    specificItems: '15kg Ready-to-Eat Rice Rations, High-Protein Biscuits & Bleaching Powder',
    status: 'VERIFIED_BY_POLICE',
    policeVerificationNote: 'Verified by OC Inspector R. Barman. Family isolated by road fracture.',
    timestamp: '14:50 IST',
  },
]

const INITIAL_CITIZEN_INCIDENTS: CitizenGroundIncident[] = [
  {
    id: 'INC-CIT-104',
    citizenName: 'Biren Das (Stranded Resident)',
    contactPhone: '+91 94350-12345',
    crisisZoneId: 'pcz-01',
    locationLandmark: 'NH-37 km 94 curve culvert',
    incidentCategory: 'ROAD_WASHOUT',
    severity: 'CRITICAL',
    description: 'Concrete culvert washed away completely by mountain flash flood. 4x4 trucks cannot cross. Only foot track across ridge is open.',
    reportedAt: '14:40 IST',
    verifiedByPolice: true,
    policeActionNote: 'OC Noney confirmed carriageway severed. Requested Airbridge or alternative bypass.',
  },
  {
    id: 'INC-CIT-105',
    citizenName: 'Anita Rongmei',
    contactPhone: '+91 94360-55123',
    crisisZoneId: 'pcz-01',
    locationLandmark: 'Noney Hill Top School Ridge',
    incidentCategory: 'STRANDED_CLUSTER',
    severity: 'HIGH',
    description: '14 evacuees with 4 children taking refuge in primary school building. Clean drinking water exhausted.',
    reportedAt: '15:10 IST',
    verifiedByPolice: false,
  },
]

const INITIAL_TRACKING_VEHICLES: InboundTrackingVehicle[] = [
  {
    id: 'TRK-NER-01',
    vehicleCode: 'BOLERO-4X4-04',
    vehicleName: 'Hill 4x4 Off-Road Bolero Fleet #04',
    driverName: 'Subedar M. Gogoi (SDRF Escort)',
    driverPhone: '+91 94350-88122',
    category: 'HILL_4X4_OFFROAD_2T',
    assignedCrisisZoneId: 'pcz-01',
    currentLocationName: 'Approaching Tupul North Ridge Junction (km 42)',
    destinationVAP: 'Tupul Roadhead VAP (km 48)',
    originDepot: 'Guwahati Apex Central Depot',
    etaMinutes: 28,
    progressPercent: 72,
    status: 'IN_TRANSIT',
    manifestItems: [
      { name: 'Potable Drinking Water (20L Cans)', quantity: '30 Cans (600L)', verifiedSafe: true },
      { name: 'Polyvalent Snake Anti-Venom Vials', quantity: '120 Vials (2-8°C)', verifiedSafe: true },
      { name: 'Infant Milk Formula & Baby Food', quantity: '60 Tins', verifiedSafe: true },
      { name: 'Emergency Dry Food Rations (Khichdi Kits)', quantity: '250 kg', verifiedSafe: true },
    ],
    updatedAt: '15:35 IST',
  },
  {
    id: 'TRK-NER-02',
    vehicleCode: 'IAF-MI17-ALPHA',
    vehicleName: 'IAF Mi-17 V5 Rotary Airbridge Alpha',
    driverName: 'Wing Cdr. S. Rathore (IAF Airlift)',
    driverPhone: '+91 98110-44911',
    category: 'IAF_MI17_HELI_AIRLIFT',
    assignedCrisisZoneId: 'pcz-01',
    currentLocationName: 'In Flight over Barak Ridge (Altitude 4,500 ft)',
    destinationVAP: 'Noney Helipad Drop Zone',
    originDepot: 'Borjhar Air Force Station (Guwahati)',
    etaMinutes: 14,
    progressPercent: 88,
    status: 'APPROACHING_ROADHEAD',
    manifestItems: [
      { name: 'Heavy Trauma & Surgical Field Kits', quantity: '15 Kits', verifiedSafe: true },
      { name: 'Emergency Oxygen Concentrators', quantity: '8 Units', verifiedSafe: true },
      { name: 'High-Altitude Waterproof Tarpaulins', quantity: '80 Sets', verifiedSafe: true },
    ],
    updatedAt: '15:40 IST',
  },
]

const INITIAL_DESIGNATED_SAFE_ZONES: DesignatedSafeZone[] = [
  {
    id: 'SZ-01',
    name: 'Haflong Higher Secondary School Safe Haven',
    district: 'Dima Hasao',
    lat: 25.1780,
    lng: 93.0210,
    capacityPAX: 250,
    currentOccupancy: 64,
    potableWater: true,
    medicalStation: true,
    foodSupplyStatus: 'ABUNDANT',
    accessRoadStatus: 'CLEAR',
    nearestCrisisZoneId: 'pcz-02',
    navigationGuidance: 'Follow the elevated ridge road north of Haflong bazaar, enter via East Gate.',
  },
  {
    id: 'SZ-02',
    name: 'Tupul Community Relief Shelter',
    district: 'Noney',
    lat: 24.7920,
    lng: 93.6600,
    capacityPAX: 180,
    currentOccupancy: 42,
    potableWater: true,
    medicalStation: true,
    foodSupplyStatus: 'ADEQUATE',
    accessRoadStatus: '4X4_ONLY',
    nearestCrisisZoneId: 'pcz-01',
    navigationGuidance: 'Take the North Ridge bypass path avoiding the valley floor mud surge.',
  },
  {
    id: 'SZ-03',
    name: 'Lumding Railway Sector Transit Camp',
    district: 'Hojai',
    lat: 25.7500,
    lng: 93.1700,
    capacityPAX: 500,
    currentOccupancy: 120,
    potableWater: true,
    medicalStation: true,
    foodSupplyStatus: 'ABUNDANT',
    accessRoadStatus: 'CLEAR',
    nearestCrisisZoneId: 'pcz-02',
    navigationGuidance: 'Arterial railway roadhead connection directly accessible from NH-27.',
  },
]

const STORAGE_KEYS = {
  POLICE_CRISIS_ZONES: 'nera_police_crisis_zones_v2',
  POLICE_ASSESSMENTS: 'nera_police_assessments_v1',
  ACTIVE_CORRIDOR: 'nera_active_corridor_v1',
  RELIEF_BEACONS: 'nera_relief_beacons_v1',
  SOS_REQUESTS: 'nera_sos_requests_v1',
  SMS_MESSAGES: 'nera_sms_messages_v2',
  SUPPLY_REQUISITIONS: 'nera_supply_requisitions_v1',
  CITIZEN_INCIDENTS: 'nera_citizen_incidents_v1',
  TRACKING_VEHICLES: 'nera_tracking_vehicles_v1',
  SAFE_ZONES: 'nera_safe_zones_v1',
}

const EVENT_NAME = 'nera_disaster_comms_update'

function broadcastUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
  }
}

// ── Storage Helpers ──

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(value))
    broadcastUpdate()
  } catch (err) {
    console.warn(`Failed to save to localStorage key ${key}:`, err)
  }
}

// ── Public Store API & React Hook ──

export function useDisasterComms() {
  const [crisisZones, setCrisisZones] = useState<PoliceCrisisZone[]>(INITIAL_POLICE_CRISIS_ZONES)
  const [assessments, setAssessments] = useState<PoliceRouteAssessment[]>(INITIAL_POLICE_ASSESSMENTS)
  const [activeCorridor, setActiveCorridor] = useState<ActiveCorridorDecision>(INITIAL_CORRIDOR_DECISION)
  const [beacons, setBeacons] = useState<ReliefBeacon[]>(INITIAL_RELIEF_BEACONS)
  const [sosRequests, setSosRequests] = useState<CitizenSOSRequest[]>(INITIAL_SOS_REQUESTS)
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>(INITIAL_SMS_MESSAGES)
  const [supplyRequisitions, setSupplyRequisitions] = useState<CitizenSupplyRequisition[]>(INITIAL_SUPPLY_REQUISITIONS)
  const [citizenIncidents, setCitizenIncidents] = useState<CitizenGroundIncident[]>(INITIAL_CITIZEN_INCIDENTS)
  const [trackingVehicles, setTrackingVehicles] = useState<InboundTrackingVehicle[]>(INITIAL_TRACKING_VEHICLES)
  const [safeZones, setSafeZones] = useState<DesignatedSafeZone[]>(INITIAL_DESIGNATED_SAFE_ZONES)

  const syncState = useCallback(() => {
    setCrisisZones(loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES))
    setAssessments(loadFromStorage(STORAGE_KEYS.POLICE_ASSESSMENTS, INITIAL_POLICE_ASSESSMENTS))
    setActiveCorridor(loadFromStorage(STORAGE_KEYS.ACTIVE_CORRIDOR, INITIAL_CORRIDOR_DECISION))
    setBeacons(loadFromStorage(STORAGE_KEYS.RELIEF_BEACONS, INITIAL_RELIEF_BEACONS))
    setSosRequests(loadFromStorage(STORAGE_KEYS.SOS_REQUESTS, INITIAL_SOS_REQUESTS))
    setSmsMessages(loadFromStorage(STORAGE_KEYS.SMS_MESSAGES, INITIAL_SMS_MESSAGES))
    setSupplyRequisitions(loadFromStorage(STORAGE_KEYS.SUPPLY_REQUISITIONS, INITIAL_SUPPLY_REQUISITIONS))
    setCitizenIncidents(loadFromStorage(STORAGE_KEYS.CITIZEN_INCIDENTS, INITIAL_CITIZEN_INCIDENTS))
    setTrackingVehicles(loadFromStorage(STORAGE_KEYS.TRACKING_VEHICLES, INITIAL_TRACKING_VEHICLES))
    setSafeZones(loadFromStorage(STORAGE_KEYS.SAFE_ZONES, INITIAL_DESIGNATED_SAFE_ZONES))
  }, [])

  useEffect(() => {
    syncState()
    const handleUpdate = () => syncState()
    window.addEventListener(EVENT_NAME, handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [syncState])

  // Helper: Append SMS Message
  const addSMSMessage = useCallback((sms: Omit<SMSMessage, 'id' | 'time'>) => {
    const newSMS: SMSMessage = {
      ...sms,
      id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    }
    const current = loadFromStorage(STORAGE_KEYS.SMS_MESSAGES, INITIAL_SMS_MESSAGES)
    const updated = [newSMS, ...current.slice(0, 30)]
    saveToStorage(STORAGE_KEYS.SMS_MESSAGES, updated)
    setSmsMessages(updated)
    return newSMS
  }, [])

  // 1. Step 1: Police Marks Crisis Area (Sends SMS Alert to State EOC Admin & Citizens)
  const declarePoliceCrisisZone = useCallback((zone: Omit<PoliceCrisisZone, 'id' | 'timestamp' | 'workflowStatus'>) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    const newZone: PoliceCrisisZone = {
      ...zone,
      id: `pcz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workflowStatus: 'CRISIS_MARKED',
      timestamp: timeStr,
    }
    const updated = [newZone, ...loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)]
    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updated)
    setCrisisZones(updated)

    // 👮 POLICE PERSPECTIVE: Outgoing Notice
    addSMSMessage({
      sender: 'POLICE-THANA-OUTPOST',
      tag: 'ALERT SENT TO STATE EOC',
      content: `📤 [ALERT SENT TO ADMIN] Crisis Danger Zone marked at ${zone.title} (${zone.affectedCorridor}) by ${zone.policeStation}. Danger perimeter: ${(zone.radiusMeters / 1000).toFixed(1)} km. Awaiting State EOC route calculation.`,
      type: 'police',
      recipientRole: 'police',
      zoneId: newZone.id,
    })

    // 🏛️ ADMIN PERSPECTIVE: Incoming High-Priority Alert
    addSMSMessage({
      sender: 'POLICE-SECTOR-ALERT',
      tag: 'ACTION REQUIRED: CRISIS MARKED',
      content: `📥 [ACTION REQUIRED] OC ${zone.policeStation} declared Disaster Crisis Zone at ${zone.title}. Danger radius: ${(zone.radiusMeters / 1000).toFixed(1)} km. Tap "Calculate & Assign Route" to designate relief corridor!`,
      type: 'police',
      recipientRole: 'admin',
      zoneId: newZone.id,
    })

    // 👥 CITIZEN PERSPECTIVE: Evacuation Advisory
    addSMSMessage({
      sender: 'NDMA-EMERGENCY-ALERT',
      tag: 'PUBLIC EVACUATION ADVISORY',
      content: `🚨 [NDMA EVACUATION ADVISORY] Severe ${zone.hazardType} active along ${zone.affectedCorridor}. Avoid the danger zone and proceed immediately towards designated Safe Haven refuges (⛺) on map.`,
      type: 'citizen',
      recipientRole: 'citizen',
      zoneId: newZone.id,
    })

    return newZone
  }, [addSMSMessage])

  // 2. Step 2: Admin Receives Crisis & Assigns Route (Sends SMS Directive to Police Sector & Citizens)
  const adminAssignRouteToCrisisZone = useCallback((params: {
    zoneId: string
    assignedRouteName: string
    assignedVehicleCategory: VehicleCategory
    assignedVehicleName: string
    adminNotes?: string
  }) => {
    const current = loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)
    let targetZone: PoliceCrisisZone | null = null

    const updated = current.map(zone => {
      if (zone.id === params.zoneId) {
        const routeCoords = computeCrisisRouteCoordinates(zone.lat, zone.lng, 'primary')
        targetZone = {
          ...zone,
          workflowStatus: 'ROUTE_ASSIGNED' as CrisisWorkflowStatus,
          assignedRouteName: params.assignedRouteName,
          assignedVehicleCategory: params.assignedVehicleCategory,
          assignedVehicleName: params.assignedVehicleName,
          assignedRouteCoordinates: routeCoords,
          distanceKm: 342,
          etaMinutes: 380,
          adminNotes: params.adminNotes || `Designated by State EOC Admin. Awaiting ground verification from ${zone.policeStation}.`,
        }
        return targetZone
      }
      return zone
    })

    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updated)
    setCrisisZones(updated)

    if (targetZone) {
      const z = targetZone as PoliceCrisisZone

      // 🏛️ ADMIN PERSPECTIVE: Outgoing Directive Log
      addSMSMessage({
        sender: 'STATE-EOC-ADMIN',
        tag: 'ROUTE DIRECTIVE ISSUED',
        content: `📤 [DIRECTIVE ISSUED] Route [${params.assignedRouteName}] assigned via [${params.assignedVehicleName}] for ${z.title}. Transmitted to ${z.policeStation} for verification.`,
        type: 'admin_route',
        recipientRole: 'admin',
        zoneId: z.id,
      })

      // 👮 POLICE PERSPECTIVE: Incoming Action Order
      addSMSMessage({
        sender: 'STATE-EOC-ADMIN',
        tag: 'ROUTE ASSIGNED (ACTION REQ)',
        content: `📥 [ADMIN DIRECTIVE] State EOC Admin designated Route [${params.assignedRouteName}] (${params.assignedVehicleName}) for ${z.title}. Duty Police OC ${z.policeStation} please verify ground passability on map.`,
        type: 'admin_route',
        recipientRole: 'police',
        zoneId: z.id,
      })

      // 👥 CITIZEN PERSPECTIVE: Relief Convoy Update
      addSMSMessage({
        sender: 'NDMA-RELIEF-CONVOY',
        tag: 'RELIEF CORRIDOR ACTIVE',
        content: `🚚 [RELIEF CONVOY ACTIVE] State emergency supply convoy dispatched towards ${z.title} via ${params.assignedRouteName}. Essential supplies in transit.`,
        type: 'citizen',
        recipientRole: 'citizen',
        zoneId: z.id,
      })
    }
  }, [addSMSMessage])

  // 3. Step 3A: Police Verifies Route as Passable & Clear (Sends SMS to Admin & Citizens)
  const policeVerifyRoute = useCallback((params: {
    zoneId: string
    officerName: string
    notes?: string
  }) => {
    const current = loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)
    let targetZone: PoliceCrisisZone | null = null

    const updated = current.map(zone => {
      if (zone.id === params.zoneId) {
        targetZone = {
          ...zone,
          workflowStatus: 'POLICE_VERIFIED' as CrisisWorkflowStatus,
          policeVerificationNotes: params.notes || `Ground verified clear by ${params.officerName}. Convoys authorized to proceed.`,
        }
        return targetZone
      }
      return zone
    })

    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updated)
    setCrisisZones(updated)

    if (targetZone) {
      const z = targetZone as PoliceCrisisZone

      // 👮 POLICE PERSPECTIVE: Outgoing Verification
      addSMSMessage({
        sender: 'POLICE-FIELD-VERIFY',
        tag: 'GROUND CLEARANCE SENT',
        content: `📤 [CLEARANCE SENT] Confirmed Route [${z.assignedRouteName || z.reroutedRouteName}] is 100% PASSABLE on ground. Authorized relief convoys to transit.`,
        type: 'police_verify',
        recipientRole: 'police',
        zoneId: z.id,
      })

      // 🏛️ ADMIN PERSPECTIVE: Incoming Verification
      addSMSMessage({
        sender: 'POLICE-FIELD-VERIFY',
        tag: 'POLICE VERIFIED CLEAR',
        content: `📥 [POLICE VERIFIED] OC ${params.officerName} (${z.policeStation}) confirmed Route [${z.assignedRouteName || z.reroutedRouteName}] is 100% CLEAR. Convoys rolling on map with green safety authorization.`,
        type: 'police_verify',
        recipientRole: 'admin',
        zoneId: z.id,
      })

      // 👥 CITIZEN PERSPECTIVE: Route Clear Notice
      addSMSMessage({
        sender: 'STATE-POLICE-HQ',
        tag: 'CORRIDOR VERIFIED SAFE',
        content: `✅ [CORRIDOR CLEARED] Route [${z.assignedRouteName || z.reroutedRouteName}] verified safe by Sector Police. Essential medical and food supplies arriving.`,
        type: 'citizen',
        recipientRole: 'citizen',
        zoneId: z.id,
      })
    }
  }, [addSMSMessage])

  // 4. Step 3B: Police Finds Obstacle & Requests Re-Route (Sends SMS Alert to Admin & Citizens)
  const policeRequestReroute = useCallback((params: {
    zoneId: string
    officerName: string
    obstacleDescription: string
  }) => {
    const current = loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)
    let targetZone: PoliceCrisisZone | null = null

    const updated = current.map(zone => {
      if (zone.id === params.zoneId) {
        targetZone = {
          ...zone,
          workflowStatus: 'POLICE_REROUTE_REQUESTED' as CrisisWorkflowStatus,
          policeObstacleReport: params.obstacleDescription,
        }
        return targetZone
      }
      return zone
    })

    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updated)
    setCrisisZones(updated)

    if (targetZone) {
      const z = targetZone as PoliceCrisisZone

      // 👮 POLICE PERSPECTIVE: Outgoing Obstacle SOS
      addSMSMessage({
        sender: 'POLICE-SECTOR-ALERT',
        tag: 'OBSTACLE REPORT SENT',
        content: `📤 [RE-ROUTE REQUESTED] Alerted Admin that Route [${z.assignedRouteName || 'Corridor'}] is SEVERED: "${params.obstacleDescription}". Re-route requested.`,
        type: 'police_reroute_req',
        recipientRole: 'police',
        zoneId: z.id,
      })

      // 🏛️ ADMIN PERSPECTIVE: Incoming Urgent Alert
      addSMSMessage({
        sender: 'POLICE-SECTOR-ALERT',
        tag: 'URGENT: RE-ROUTE REQUIRED',
        content: `📥 [URGENT: ROAD BLOCKED] OC ${params.officerName} reports Route SEVERED: "${params.obstacleDescription}". Tap to deploy IAF Mi-17 Airbridge or alternate bypass!`,
        type: 'police_reroute_req',
        recipientRole: 'admin',
        zoneId: z.id,
      })

      // 👥 CITIZEN PERSPECTIVE: Hazard Warning
      addSMSMessage({
        sender: 'NDMA-ROAD-ALERT',
        tag: 'ROAD OBSTRUCTION ALERT',
        content: `⚠️ [ROAD SEVERED] Corridor blocked near ${z.affectedCorridor} due to ${params.obstacleDescription}. Ground travel restricted. Airborne relief operations mobilizing.`,
        type: 'citizen',
        recipientRole: 'citizen',
        zoneId: z.id,
      })
    }
  }, [addSMSMessage])

  // 5. Step 4: Admin Re-Routes Accordingly (Sends SMS Directive to Police Sector & Citizens)
  const adminRerouteCrisisZone = useCallback((params: {
    zoneId: string
    newRouteName: string
    newVehicleCategory: VehicleCategory
    newVehicleName: string
    adminNotes?: string
  }) => {
    const current = loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)
    let targetZone: PoliceCrisisZone | null = null

    const updated = current.map(zone => {
      if (zone.id === params.zoneId) {
        const isAir = params.newVehicleCategory === 'IAF_MI17_HELI_AIRLIFT'
        const rerouteCoords = computeCrisisRouteCoordinates(zone.lat, zone.lng, isAir ? 'air' : 'bypass')
        targetZone = {
          ...zone,
          workflowStatus: 'ADMIN_REROUTED' as CrisisWorkflowStatus,
          reroutedRouteName: params.newRouteName,
          reroutedVehicleCategory: params.newVehicleCategory,
          reroutedVehicleName: params.newVehicleName,
          reroutedRouteCoordinates: rerouteCoords,
          distanceKm: isAir ? 210 : 385,
          etaMinutes: isAir ? 75 : 420,
          adminNotes: params.adminNotes || `Admin executed tactical re-route to bypass reported obstruction. Police please verify new corridor on map.`,
        }
        return targetZone
      }
      return zone
    })

    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updated)
    setCrisisZones(updated)

    if (targetZone) {
      const z = targetZone as PoliceCrisisZone

      // 🏛️ ADMIN PERSPECTIVE: Outgoing Tactical Re-Route Log
      addSMSMessage({
        sender: 'STATE-EOC-ADMIN',
        tag: 'TACTICAL RE-ROUTE DISPATCHED',
        content: `📤 [TACTICAL RE-ROUTE] Re-routed ${z.title} to [${params.newRouteName}] using [${params.newVehicleName}]. Orders transmitted to Police & Airlift Command.`,
        type: 'admin_reroute',
        recipientRole: 'admin',
        zoneId: z.id,
      })

      // 👮 POLICE PERSPECTIVE: Incoming Re-Route Directive
      addSMSMessage({
        sender: 'STATE-EOC-ADMIN',
        tag: 'INCOMING ADMIN RE-ROUTE',
        content: `📥 [ADMIN RE-ROUTE DIRECTIVE] Admin dispatched Alternate Corridor [${params.newRouteName}] (${params.newVehicleName}). Standby for convoy arrival or helipad escort.`,
        type: 'admin_reroute',
        recipientRole: 'police',
        zoneId: z.id,
      })

      // 👥 CITIZEN PERSPECTIVE: Airlift Relief Notice
      addSMSMessage({
        sender: 'IAF-AIR-COMMAND',
        tag: 'AIRLIFT RELIEF INITIATED',
        content: `🚁 [AIRLIFT RELIEF INITIATED] IAF Mi-17 Rotary Airbridge established for ${z.title}. Emergency supply drops and medical evacuations active.`,
        type: 'citizen',
        recipientRole: 'citizen',
        zoneId: z.id,
      })
    }
  }, [addSMSMessage])

  const removePoliceCrisisZone = useCallback((zoneId: string) => {
    const current = loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)
    const updated = current.filter(z => z.id !== zoneId)
    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updated)
    setCrisisZones(updated)
  }, [])

  // 5B. Police / Admin Action: Mark Issue Resolved & Clear Crisis Area from Map
  const resolveAndClearCrisisZone = useCallback((params: {
    zoneId: string
    officerName?: string
    resolutionNotes?: string
  }) => {
    const current = loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)
    const targetZone = current.find(z => z.id === params.zoneId)
    const updated = current.filter(z => z.id !== params.zoneId)

    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updated)
    setCrisisZones(updated)

    // Reset active corridor so map route line is completely cleared
    const clearedCorridor: ActiveCorridorDecision = {
      ...INITIAL_CORRIDOR_DECISION,
      status: 'STANDBY',
      destinationTarget: '',
      targetCoords: undefined,
      pathCoordinates: undefined,
      vehicleTelemetry: undefined,
      distanceKm: 0,
      etaMinutes: 0,
    }
    saveToStorage(STORAGE_KEYS.ACTIVE_CORRIDOR, clearedCorridor)
    setActiveCorridor(clearedCorridor)

    if (targetZone) {
      // 👮 POLICE PERSPECTIVE
      addSMSMessage({
        sender: 'POLICE-ALL-CLEAR',
        tag: 'ALL-CLEAR SENT TO ADMIN',
        content: `📤 [ALL-CLEAR SENT] Hazard at ${targetZone.title} resolved and cleared from map. Danger perimeter decommissioned and highway reopened.`,
        type: 'police_verify',
        recipientRole: 'police',
        zoneId: targetZone.id,
      })

      // 🏛️ ADMIN PERSPECTIVE
      addSMSMessage({
        sender: 'POLICE-ALL-CLEAR',
        tag: 'SECTOR NORMALIZED',
        content: `📥 [SECTOR NORMALIZED] ${targetZone.policeStation} confirmed hazard resolved. Danger perimeter removed and normal logistics restored on map.`,
        type: 'police_verify',
        recipientRole: 'admin',
        zoneId: targetZone.id,
      })

      // 👥 CITIZEN PERSPECTIVE
      addSMSMessage({
        sender: 'STATE-DISASTER-MGMT',
        tag: 'ALL-CLEAR ADVISORY',
        content: `🎉 [ALL-CLEAR ADVISORY] Hazard cleared along ${targetZone.affectedCorridor}. Normal road connectivity restored. Evacuation advisory lifted.`,
        type: 'citizen',
        recipientRole: 'citizen',
        zoneId: targetZone.id,
      })
    }
  }, [addSMSMessage])

  // 5C. Clear Active Corridor & Normalize Map State
  const clearActiveCorridor = useCallback(() => {
    const clearedCorridor: ActiveCorridorDecision = {
      ...INITIAL_CORRIDOR_DECISION,
      status: 'STANDBY',
      destinationTarget: '',
      targetCoords: undefined,
      pathCoordinates: undefined,
      vehicleTelemetry: undefined,
      distanceKm: 0,
      etaMinutes: 0,
    }
    saveToStorage(STORAGE_KEYS.ACTIVE_CORRIDOR, clearedCorridor)
    setActiveCorridor(clearedCorridor)

    const currentVehicles = loadFromStorage(STORAGE_KEYS.TRACKING_VEHICLES, INITIAL_TRACKING_VEHICLES)
    const updatedVehicles = currentVehicles.map(v => ({
      ...v,
      status: 'DELIVERED' as const,
      progressPercent: 100,
    }))
    saveToStorage(STORAGE_KEYS.TRACKING_VEHICLES, updatedVehicles)
    setTrackingVehicles(updatedVehicles)
  }, [])

  // 6. Police Assessments Form
  const submitPoliceAssessment = useCallback((assessment: Omit<PoliceRouteAssessment, 'id' | 'status' | 'timestamp'>) => {
    const newRecord: PoliceRouteAssessment = {
      ...assessment,
      id: `pra-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING_ADMIN_REVIEW',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    }
    const updated = [newRecord, ...loadFromStorage(STORAGE_KEYS.POLICE_ASSESSMENTS, INITIAL_POLICE_ASSESSMENTS)]
    saveToStorage(STORAGE_KEYS.POLICE_ASSESSMENTS, updated)
    setAssessments(updated)
    return newRecord
  }, [])

  // 7. Admin Corridor Decision
  const approveCorridorAndBroadcast = useCallback((decision: {
    corridorId: string
    corridorName: string
    assignedVehicleCategory: VehicleCategory
    assignedVehicleName: string
    assignedVehicleId: string
    statutoryDirectiveText: string
    originHub?: string
    destinationTarget?: string
    cargoType?: string
    etaMinutes?: number
    alongRouteThanas?: string[]
  }) => {
    const updatedDecision: ActiveCorridorDecision = {
      corridorId: decision.corridorId,
      corridorName: decision.corridorName,
      status: 'ACTIVE_DISPATCH',
      assignedVehicleCategory: decision.assignedVehicleCategory,
      assignedVehicleName: decision.assignedVehicleName,
      assignedVehicleId: decision.assignedVehicleId,
      statutoryDirectiveText: decision.statutoryDirectiveText,
      approvedBy: 'State EOC Apex Command (Admin)',
      approvedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      vhfChannel: 'CH-14 (156.700 MHz)',
      originHub: decision.originHub || 'Guwahati Apex Hub',
      destinationTarget: decision.destinationTarget || 'Sector VAP Roadhead',
      cargoType: decision.cargoType || 'Life-Saving Medical & Relief Supplies',
      etaMinutes: decision.etaMinutes || 45,
      alongRouteThanas: decision.alongRouteThanas || ['Guwahati Sadar PS', 'Lumding PS', 'Haflong Sadar PS'],
    }

    const currentAssessments = loadFromStorage(STORAGE_KEYS.POLICE_ASSESSMENTS, INITIAL_POLICE_ASSESSMENTS)
    const updatedAssessments = currentAssessments.map(a =>
      a.corridorName.includes(decision.corridorName) || decision.corridorName.includes(a.corridorName)
        ? { ...a, status: 'APPROVED_BY_ADMIN' as const }
        : a
    )

    saveToStorage(STORAGE_KEYS.POLICE_ASSESSMENTS, updatedAssessments)
    saveToStorage(STORAGE_KEYS.ACTIVE_CORRIDOR, updatedDecision)
    setAssessments(updatedAssessments)
    setActiveCorridor(updatedDecision)
  }, [])

  // 7B. Admin Immediately Solves & Activates Corridor for Crisis Area (Live Sync to Citizen Portal)
  const adminActivateTacticalCorridor = useCallback((params: {
    corridorName: string
    originHub: string
    destinationTarget: string
    targetCoords: { lat: number; lng: number }
    originCoords?: { lat: number; lng: number; name?: string }
    pathCoordinates?: [number, number][]
    vehicleTelemetry?: any
    cargoType?: string
    etaMinutes: number
    distanceKm: number
    assignedVehicleName?: string
    assignedVehicleCategory?: VehicleCategory
    matchedZoneId?: string
  }) => {
    const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    const vehicleName = params.assignedVehicleName || 'Hill 4x4 Off-Road Bolero (NER-TRUCK-18)'
    const vehicleCat = params.assignedVehicleCategory || 'HILL_4X4_OFFROAD_2T'

    const updatedDecision: ActiveCorridorDecision = {
      corridorId: `COR-${Date.now()}`,
      corridorName: params.corridorName,
      status: 'ACTIVE_DISPATCH',
      assignedVehicleCategory: vehicleCat,
      assignedVehicleName: vehicleName,
      assignedVehicleId: 'NER-TRUCK-18',
      statutoryDirectiveText: `Statutory Route Clearance under BNSS Sec 187: Priority relief supplies dispatched via ${vehicleName} with Police VHF escort.`,
      approvedBy: 'State EOC Apex Command (Admin)',
      approvedAt: timeNow,
      vhfChannel: 'CH-14 (156.700 MHz)',
      originHub: params.originHub,
      destinationTarget: params.destinationTarget,
      cargoType: params.cargoType || 'Life-Saving Emergency Supplies & Medicine',
      etaMinutes: params.etaMinutes,
      alongRouteThanas: ['Guwahati Sadar PS', 'Nagaon Traffic PS', 'Lumding PS', 'Haflong Sadar PS'],
      targetCoords: params.targetCoords,
      originCoords: params.originCoords,
      pathCoordinates: params.pathCoordinates,
      vehicleTelemetry: params.vehicleTelemetry,
      distanceKm: params.distanceKm,
    }

    // 1. Update active corridor
    saveToStorage(STORAGE_KEYS.ACTIVE_CORRIDOR, updatedDecision)
    setActiveCorridor(updatedDecision)

    // 2. Match or update crisis zones
    const currentZones = loadFromStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, INITIAL_POLICE_CRISIS_ZONES)
    let foundMatch = false
    const updatedZones = currentZones.map(zone => {
      const dist = calculateDistanceKm(zone.lat, zone.lng, params.targetCoords.lat, params.targetCoords.lng)
      if ((params.matchedZoneId && zone.id === params.matchedZoneId) || dist < 12.0) {
        foundMatch = true
        return {
          ...zone,
          workflowStatus: 'ROUTE_ASSIGNED' as CrisisWorkflowStatus,
          assignedRouteName: params.corridorName,
          assignedVehicleCategory: vehicleCat,
          assignedVehicleName: vehicleName,
          assignedRouteCoordinates: params.pathCoordinates,
          distanceKm: params.distanceKm,
          etaMinutes: params.etaMinutes,
          adminNotes: `Designated by State EOC Admin via multi-modal corridor engine. Dispatched from ${params.originHub}.`,
        }
      }
      return zone
    })

    if (!foundMatch) {
      // Create a designated crisis zone at these coordinates
      const newZone: PoliceCrisisZone = {
        id: `pcz-${Date.now()}`,
        title: `Designated Crisis Sector (${params.targetCoords.lat.toFixed(3)}, ${params.targetCoords.lng.toFixed(3)})`,
        hazardType: '🚨 Critical Inaccessibility / Disaster Relief Grid',
        lat: params.targetCoords.lat,
        lng: params.targetCoords.lng,
        radiusMeters: 6000,
        severity: 'CRITICAL_DANGER',
        affectedCorridor: params.corridorName,
        policeStation: 'District Emergency Command',
        declaredBy: 'State EOC Apex Command (Admin)',
        evacuationGuidance: 'Emergency convoy dispatched. Civilians remain at verified high-ground safe shelters.',
        workflowStatus: 'ROUTE_ASSIGNED',
        assignedRouteName: params.corridorName,
        assignedVehicleCategory: vehicleCat,
        assignedVehicleName: vehicleName,
        assignedRouteCoordinates: params.pathCoordinates,
        distanceKm: params.distanceKm,
        etaMinutes: params.etaMinutes,
        adminNotes: `Designated directly on tactical map by State EOC Admin. Convoy en route.`,
        timestamp: timeNow,
      }
      updatedZones.unshift(newZone)
    }

    saveToStorage(STORAGE_KEYS.POLICE_CRISIS_ZONES, updatedZones)
    setCrisisZones(updatedZones)

    // 3. Update tracking vehicles for Citizen Portal
    const currentVehicles = loadFromStorage(STORAGE_KEYS.TRACKING_VEHICLES, INITIAL_TRACKING_VEHICLES)
    const updatedVehicles = currentVehicles.map((v, idx) =>
      idx === 0
        ? {
            ...v,
            vehicleName: vehicleName,
            destinationVAP: params.destinationTarget,
            originDepot: params.originHub,
            etaMinutes: params.etaMinutes,
            status: 'IN_TRANSIT' as const,
            progressPercent: 30,
            updatedAt: timeNow,
          }
        : v
    )
    saveToStorage(STORAGE_KEYS.TRACKING_VEHICLES, updatedVehicles)
    setTrackingVehicles(updatedVehicles)

    // 4. SMS Alerts to all portals
    addSMSMessage({
      sender: 'STATE-EOC-ADMIN',
      tag: 'CONVOY ROUTED & DISPATCHED',
      content: `📤 [DIRECTIVE ISSUED] Route [${params.corridorName}] designated for ${params.destinationTarget}. Convoy [${vehicleName}] rolling. ETA: ~${params.etaMinutes} mins (${params.distanceKm} km).`,
      type: 'admin_route',
      recipientRole: 'admin',
    })

    addSMSMessage({
      sender: 'STATE-EOC-ADMIN',
      tag: 'CONVOY INBOUND ESCORT REQ',
      content: `📥 [ADMIN DIRECTIVE] Emergency convoy [${vehicleName}] routed via [${params.corridorName}] towards ${params.destinationTarget}. Sector Police please clear passage & establish VHF pilot escort.`,
      type: 'admin_route',
      recipientRole: 'police',
    })

    addSMSMessage({
      sender: 'NDMA-RELIEF-CONVOY',
      tag: 'RELIEF CONVOY ACTIVE',
      content: `🚚 [RELIEF CONVOY ACTIVE] Emergency supply convoy (${vehicleName}) dispatched towards ${params.destinationTarget}. ETA: ~${params.etaMinutes} mins. Live satellite tracking active on Public Safety Map.`,
      type: 'citizen',
      recipientRole: 'citizen',
    })
  }, [addSMSMessage])

  // 8. Citizen Actions: Mark Safe Relief Point
  const markReliefBeacon = useCallback((beacon: Omit<ReliefBeacon, 'id' | 'verifiedByPolice' | 'rescueTeamDispatched' | 'timestamp'>) => {
    const newBeacon: ReliefBeacon = {
      ...beacon,
      id: `beacon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      verifiedByPolice: false,
      rescueTeamDispatched: false,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    }
    const updated = [newBeacon, ...loadFromStorage(STORAGE_KEYS.RELIEF_BEACONS, INITIAL_RELIEF_BEACONS)]
    saveToStorage(STORAGE_KEYS.RELIEF_BEACONS, updated)
    setBeacons(updated)

    // 👥 Citizen message
    addSMSMessage({
      sender: 'CITIZEN-REFUGE-LOG',
      tag: 'SAFE REFUGE LOGGED',
      content: `⛺ [SAFE HAVEN OPEN] "${beacon.name}" (${beacon.evacueeCount} PAX) marked safe. Drinking water: ${beacon.waterAvailable ? 'YES' : 'NO'}, Shelter: ${beacon.shelterAvailable ? 'YES' : 'NO'}.`,
      type: 'citizen',
      recipientRole: 'citizen',
    })

    // 👮 Police message
    addSMSMessage({
      sender: 'CITIZEN-REFUGE-LOG',
      tag: 'NEW HAVEN REGISTERED',
      content: `⛺ [REFUGE REGISTERED] New civilian haven logged at "${beacon.name}" (${beacon.evacueeCount} PAX). Police escort and supply delivery scheduled.`,
      type: 'police',
      recipientRole: 'police',
    })

    // 🏛️ Admin message
    addSMSMessage({
      sender: 'CITIZEN-REFUGE-LOG',
      tag: 'EVACUATION HAVEN LOGGED',
      content: `⛺ [SHELTER RECORD] Evacuee shelter logged at "${beacon.name}" (${beacon.evacueeCount} PAX). Resource allocation updated.`,
      type: 'dispatch',
      recipientRole: 'admin',
    })

    return newBeacon
  }, [addSMSMessage])

  // 9. Citizen Actions: One-Tap SOS Distress Ping
  const submitCitizenSOS = useCallback((sos: Omit<CitizenSOSRequest, 'id' | 'status' | 'timestamp'>) => {
    const newSOS: CitizenSOSRequest = {
      ...sos,
      id: `sos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'PENDING_DISPATCH',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
    }
    const updated = [newSOS, ...loadFromStorage(STORAGE_KEYS.SOS_REQUESTS, INITIAL_SOS_REQUESTS)]
    saveToStorage(STORAGE_KEYS.SOS_REQUESTS, updated)
    setSosRequests(updated)

    // 👥 Citizen message
    addSMSMessage({
      sender: 'CITIZEN-SOS-GATEWAY',
      tag: 'SOS CONFIRMATION',
      content: `📤 [SOS DISPATCHED] Emergency SOS for ${sos.headcount} PAX at ${sos.landmark} sent to Police & SDRF. Rescue teams mobilizing.`,
      type: 'citizen',
      recipientRole: 'citizen',
    })

    // 👮 Police message
    addSMSMessage({
      sender: 'CITIZEN-SOS-GATEWAY',
      tag: 'URGENT: CITIZEN SOS',
      content: `🚨 [CITIZEN SOS ALERT] ${sos.headcount} civilians stranded at ${sos.landmark}. Phone: ${sos.contactPhone}. Needs: ${sos.needs.join(', ')}. Immediate rescue required!`,
      type: 'police',
      recipientRole: 'police',
    })

    // 🏛️ Admin message
    addSMSMessage({
      sender: 'CITIZEN-SOS-GATEWAY',
      tag: 'DISTRESS INCIDENT LOGGED',
      content: `🚨 [SOS BEACON] Citizen distress beacon logged at ${sos.landmark} (${sos.headcount} PAX). SDRF QRT deployed.`,
      type: 'dispatch',
      recipientRole: 'admin',
    })

    return newSOS
  }, [addSMSMessage])

  // 10. Police / Admin Action: Verify & Dispatch Rescue to Beacon
  const dispatchRescueToBeacon = useCallback((beaconId: string, teamName: string, officerName: string) => {
    const current = loadFromStorage(STORAGE_KEYS.RELIEF_BEACONS, INITIAL_RELIEF_BEACONS)
    const updated = current.map(b =>
      b.id === beaconId
        ? {
            ...b,
            verifiedByPolice: true,
            verifiedBy: officerName,
            rescueTeamDispatched: true,
            dispatchedTeamName: teamName,
          }
        : b
    )
    saveToStorage(STORAGE_KEYS.RELIEF_BEACONS, updated)
    setBeacons(updated)
  }, [])

  // 11. Police / Admin Action: Dispatch Rescue to SOS
  const dispatchRescueToSOS = useCallback((sosId: string, unitName: string) => {
    const current = loadFromStorage(STORAGE_KEYS.SOS_REQUESTS, INITIAL_SOS_REQUESTS)
    const updated = current.map(s =>
      s.id === sosId
        ? {
            ...s,
            status: 'EN_ROUTE' as const,
            dispatchedUnit: unitName,
          }
        : s
    )
    saveToStorage(STORAGE_KEYS.SOS_REQUESTS, updated)
    setSosRequests(updated)
  }, [])

  // 12. Citizen Actions: Submit Essential Needs Requisition
  const submitCitizenSupplyRequisition = useCallback((req: Omit<CitizenSupplyRequisition, 'id' | 'status' | 'timestamp'>) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    const reqCode = `REQ-NER-${Math.floor(1000 + Math.random() * 9000)}`
    const newReq: CitizenSupplyRequisition = {
      ...req,
      id: reqCode,
      status: 'PENDING_POLICE_REVIEW',
      timestamp: timeStr,
    }
    const current = loadFromStorage(STORAGE_KEYS.SUPPLY_REQUISITIONS, INITIAL_SUPPLY_REQUISITIONS)
    const updated = [newReq, ...current]
    saveToStorage(STORAGE_KEYS.SUPPLY_REQUISITIONS, updated)
    setSupplyRequisitions(updated)

    // 👥 Citizen SMS confirmation
    addSMSMessage({
      sender: 'CITIZEN-REQUISITION',
      tag: 'REQUISITION CONFIRMATION',
      content: `📤 [REQUISITION SUBMITTED] Ref: ${reqCode} for ${req.category.replace('_', ' ')} (${req.familyCount} PAX) logged. Forwarded to Sector Police for verification & supply dispatch.`,
      type: 'citizen',
      recipientRole: 'citizen',
      zoneId: req.crisisZoneId,
    })

    // 👮 Police SMS alert (Urgent demand incoming)
    addSMSMessage({
      sender: 'CITIZEN-REQUISITION-PIPELINE',
      tag: 'CITIZEN ESSENTIALS REQUISITION',
      content: `🚨 [CITIZEN REQUISITION] Ref: ${reqCode}: ${req.familyCount} PAX requesting ${req.category.replace('_', ' ')} at ${req.landmark}. Items: "${req.specificItems}". Phone: ${req.contactPhone}. Priority: ${req.priority}. Police please verify & forward to State EOC!`,
      type: 'police',
      recipientRole: 'police',
      zoneId: req.crisisZoneId,
    })

    // 🏛️ Admin Demand Log
    addSMSMessage({
      sender: 'RELIEF-DEMAND-ENGINE',
      tag: 'DEMAND QUEUE UPDATED',
      content: `📥 [DEMAND LOG] Citizen requisition ${reqCode} queued for ${req.category.replace('_', ' ')} at ${req.landmark} (${req.familyCount} PAX). Awaiting Police ground verification.`,
      type: 'dispatch',
      recipientRole: 'admin',
      zoneId: req.crisisZoneId,
    })

    return newReq
  }, [addSMSMessage])

  // 13. Citizen Actions: Report Crowdsourced Ground Hazard
  const submitCitizenGroundIncident = useCallback((inc: Omit<CitizenGroundIncident, 'id' | 'reportedAt' | 'verifiedByPolice'>) => {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    const incCode = `INC-CIT-${Math.floor(100 + Math.random() * 900)}`
    const newInc: CitizenGroundIncident = {
      ...inc,
      id: incCode,
      reportedAt: timeStr,
      verifiedByPolice: false,
    }
    const current = loadFromStorage(STORAGE_KEYS.CITIZEN_INCIDENTS, INITIAL_CITIZEN_INCIDENTS)
    const updated = [newInc, ...current]
    saveToStorage(STORAGE_KEYS.CITIZEN_INCIDENTS, updated)
    setCitizenIncidents(updated)

    // 👥 Citizen SMS confirmation
    addSMSMessage({
      sender: 'CITIZEN-INTEL-PORTAL',
      tag: 'INCIDENT LOGGED',
      content: `📤 [INCIDENT LOGGED] Ref: ${incCode} '${inc.incidentCategory.replace('_', ' ')}' at ${inc.locationLandmark} transmitted to Sector Police QRT & Emergency Command.`,
      type: 'citizen',
      recipientRole: 'citizen',
      zoneId: inc.crisisZoneId,
    })

    // 👮 Police SMS alert
    addSMSMessage({
      sender: 'CROWDSOURCED-INTEL',
      tag: 'ON-GROUND CITIZEN REPORT',
      content: `📡 [CROWDSOURCED INTEL] Incident ${incCode}: Citizen ${inc.citizenName} reported ${inc.incidentCategory.replace('_', ' ')} at ${inc.locationLandmark}. Details: "${inc.description}". Priority: ${inc.severity}. Police QRT reconnaissance advised!`,
      type: 'police',
      recipientRole: 'police',
      zoneId: inc.crisisZoneId,
    })

    // 🏛️ Admin SMS alert
    addSMSMessage({
      sender: 'CROWDSOURCED-INTEL',
      tag: 'CITIZEN HAZARD FLAG',
      content: `⚠️ [CROWDSOURCED HAZARD] Ground incident ${incCode} logged at ${inc.locationLandmark} (${inc.incidentCategory.replace('_', ' ')}). Priority score adjusted.`,
      type: 'dispatch',
      recipientRole: 'admin',
      zoneId: inc.crisisZoneId,
    })

    return newInc
  }, [addSMSMessage])

  // 14. Police Actions: Verify Citizen Requisition & Forward to Admin
  const policeVerifyAndForwardRequisition = useCallback((reqId: string, policeNote: string) => {
    const current = loadFromStorage(STORAGE_KEYS.SUPPLY_REQUISITIONS, INITIAL_SUPPLY_REQUISITIONS)
    const target = current.find(r => r.id === reqId)
    const updated = current.map(r =>
      r.id === reqId
        ? { ...r, status: 'VERIFIED_BY_POLICE' as const, policeVerificationNote: policeNote }
        : r
    )
    saveToStorage(STORAGE_KEYS.SUPPLY_REQUISITIONS, updated)
    setSupplyRequisitions(updated)

    if (target) {
      // 👮 Police outgoing
      addSMSMessage({
        sender: 'POLICE-DUTY-OFFICER',
        tag: 'VERIFICATION FORWARDED TO ADMIN',
        content: `📤 [VERIFIED & SENT TO ADMIN] Requisition ${reqId} verified by Police OC: "${policeNote}". Escort & transport requisitioned from State EOC.`,
        type: 'police',
        recipientRole: 'police',
        zoneId: target.crisisZoneId,
      })

      // 🏛️ Admin incoming directive
      addSMSMessage({
        sender: 'POLICE-TACTICAL-LINK',
        tag: 'TACTICAL DIRECTIVE: VERIFIED ESSENTIALS',
        content: `🏛️ [POLICE DIRECTIVE TO ADMIN] Verified Essential Requisition ${reqId} for ${target.familyCount} PAX at ${target.landmark}. Police OC verified: "${policeNote}". Immediate supply vehicle dispatch requested!`,
        type: 'admin_route',
        recipientRole: 'admin',
        zoneId: target.crisisZoneId,
      })

      // 👥 Citizen notice
      addSMSMessage({
        sender: 'STATE-DISASTER-LOGISTICS',
        tag: 'REQUISITION VERIFIED',
        content: `✅ [POLICE VERIFIED] Your supply requisition ${reqId} for ${target.category.replace('_', ' ')} has been verified by Sector Police. State EOC Admin dispatch order in progress.`,
        type: 'citizen',
        recipientRole: 'citizen',
        zoneId: target.crisisZoneId,
      })
    }
  }, [addSMSMessage])

  // 15. Police Actions: Push Strategic Route Directives directly to Admin
  const policePushRouteDirective = useCallback((params: {
    zoneId: string
    officerName: string
    directiveText: string
    preferredCorridor: string
  }) => {
    const targetZone = crisisZones.find(z => z.id === params.zoneId)
    const zoneName = targetZone?.title || 'Sector Arterial Corridor'

    // 👮 Police outgoing
    addSMSMessage({
      sender: 'POLICE-TACTICAL-COMMAND',
      tag: 'DIRECTIVE SENT TO STATE EOC',
      content: `📤 [DIRECTIVE SENT TO ADMIN] Tactical route instruction transmitted for ${zoneName}: "${params.directiveText}". Preferred Corridor: [${params.preferredCorridor}]. Awaiting Admin convoy reroute.`,
      type: 'police',
      recipientRole: 'police',
      zoneId: params.zoneId,
    })

    // 🏛️ Admin incoming directive
    addSMSMessage({
      sender: 'POLICE-GROUND-COMMAND',
      tag: 'URGENT: POLICE ROUTE DIRECTIVE',
      content: `🏛️ [POLICE STRATEGIC ROUTE DIRECTIVE] Duty Police OC (${params.officerName}) reports for ${zoneName}: "${params.directiveText}". Action Required: Assign bypass corridor [${params.preferredCorridor}] on dynamic map.`,
      type: 'police_reroute_req',
      recipientRole: 'admin',
      zoneId: params.zoneId,
    })
  }, [addSMSMessage, crisisZones])

  // 16. Admin Actions: Dispatch Supply Convoy & Update Vehicle ETA
  const adminDispatchSupplyConvoy = useCallback((params: {
    reqId?: string
    vehicleId: string
    destinationVAP: string
    etaMinutes: number
    vehicleName: string
    driverPhone: string
    itemsManifest: string
  }) => {
    const currentVehicles = loadFromStorage(STORAGE_KEYS.TRACKING_VEHICLES, INITIAL_TRACKING_VEHICLES)
    const updatedVehicles = currentVehicles.map(v =>
      v.id === params.vehicleId
        ? {
            ...v,
            destinationVAP: params.destinationVAP,
            etaMinutes: params.etaMinutes,
            status: 'IN_TRANSIT' as const,
            progressPercent: 30,
            updatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
          }
        : v
    )
    saveToStorage(STORAGE_KEYS.TRACKING_VEHICLES, updatedVehicles)
    setTrackingVehicles(updatedVehicles)

    if (params.reqId) {
      const currentReqs = loadFromStorage(STORAGE_KEYS.SUPPLY_REQUISITIONS, INITIAL_SUPPLY_REQUISITIONS)
      const updatedReqs = currentReqs.map(r =>
        r.id === params.reqId
          ? { ...r, status: 'DISPATCHED_BY_ADMIN' as const, assignedUnit: params.vehicleName }
          : r
      )
      saveToStorage(STORAGE_KEYS.SUPPLY_REQUISITIONS, updatedReqs)
      setSupplyRequisitions(updatedReqs)
    }

    // 🏛️ Admin outgoing
    addSMSMessage({
      sender: 'STATE-EOC-LOGISTICS',
      tag: 'SUPPLY CONVOY DISPATCHED',
      content: `📤 [CONVOY DISPATCHED] Assigned ${params.vehicleName} to ${params.destinationVAP}. ETA: ${params.etaMinutes} mins. Manifest: "${params.itemsManifest}". Orders transmitted to Police pilot escort.`,
      type: 'dispatch',
      recipientRole: 'admin',
    })

    // 👮 Police incoming
    addSMSMessage({
      sender: 'STATE-EOC-ADMIN',
      tag: 'INCOMING SUPPLY CONVOY',
      content: `📥 [ADMIN CONVOY INBOUND] ${params.vehicleName} rolling towards ${params.destinationVAP}. ETA: ${params.etaMinutes} mins. Driver contact: ${params.driverPhone}. Police escort requested.`,
      type: 'admin_route',
      recipientRole: 'police',
    })

    // 👥 Citizen ETA update
    addSMSMessage({
      sender: 'STATE-DISASTER-LOGISTICS',
      tag: 'RELIEF VEHICLE EN ROUTE',
      content: `🚚 [CONVOY IN TRANSIT] Relief vehicle (${params.vehicleName}) dispatched towards your sector. ETA: ~${params.etaMinutes} mins. Essential items on board: ${params.itemsManifest}.`,
      type: 'citizen',
      recipientRole: 'citizen',
    })
  }, [addSMSMessage])

  return {
    crisisZones,
    assessments,
    activeCorridor,
    beacons,
    sosRequests,
    smsMessages,
    supplyRequisitions,
    citizenIncidents,
    trackingVehicles,
    safeZones,
    declarePoliceCrisisZone,
    removePoliceCrisisZone,
    resolveAndClearCrisisZone,
    adminAssignRouteToCrisisZone,
    policeVerifyRoute,
    policeRequestReroute,
    adminRerouteCrisisZone,
    addSMSMessage,
    submitPoliceAssessment,
    approveCorridorAndBroadcast,
    markReliefBeacon,
    submitCitizenSOS,
    dispatchRescueToBeacon,
    dispatchRescueToSOS,
    submitCitizenSupplyRequisition,
    submitCitizenGroundIncident,
    policeVerifyAndForwardRequisition,
    policePushRouteDirective,
    adminDispatchSupplyConvoy,
    adminActivateTacticalCorridor,
    clearActiveCorridor,
  }
}
