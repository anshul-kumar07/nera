// lib/tactical-corridor-guard.ts
// ========================================================================
//    NERA: TACTICAL CORRIDOR GUARD & CRITICAL INFRASTRUCTURE ENGINE
//    Implements:
//    1. Bridge Axle-Load Gating (Class 12 / 18 / 24)
//    2. Cellular Blackout & Police VHF Handoff Zones
//    3. Civilian First Response: Village Defence Parties (VDP) & Gaon Burahs
//    4. Mountain Gradient Fuel Burn & Forward Refuel Points (FRP)
//    5. Dynamic Cold-Chain & Oxygen Viability Countdown
// ========================================================================

export interface BridgeClassRecord {
  id: string
  name: string
  highway: string
  state: string
  coordinates: [number, number]
  bridgeClassTons: number // Max gross vehicular weight in metric tons
  structureType: 'BAILEY_SINGLE_LANE' | 'STEEL_TRUSS' | 'REINFORCED_CONCRETE' | 'WOODEN_SUSPENSION'
  lowestAxleLimitTons: number
  riskWarning: string
}

export interface CellularBlackoutZone {
  id: string
  corridorName: string
  highway: string
  startKmMark: number
  endKmMark: number
  lengthKm: number
  telecomStatus: 'CELLULAR_BLACKOUT' | 'INTERMITTENT_2G' | 'VHF_RADIO_MANDATORY'
  primaryPoliceVHFRelay: string
  loraMeshGatewayAvailable: boolean
}

export interface VillageDefencePartyProfile {
  id: string
  villageName: string
  district: string
  state: string
  nearestVAPCoords: [number, number]
  gaonBurahName: string // Village Headman
  gaonBurahContact: string
  vdpSecretaryName: string
  vdpSecretaryContact: string
  availablePorterVolunteers: number
  packMulesCount: number
  localRiverBoatmenCount: number
  standbyReadiness: 'IMMEDIATE_15_MIN' | 'STANDBY_1_HR'
}

export interface ForwardRefuelPoint {
  id: string
  name: string
  highway: string
  chainageKm: number
  company: 'IOCL_GOVT_RESERVED' | 'HPCL_STRATEGIC' | 'BPCL_DISASTER_RESERVE'
  coordinates: [number, number]
  highAltitudeDieselStockLitres: number
  generatorPowerBackup: boolean
  emergencyContact: string
}

export interface ColdChainViabilityResult {
  cargoName: string
  safeEnduranceHours: number
  totalTransitHours: number
  safetyMarginHours: number
  status: 'OPTIMAL_SAFE' | 'AMBER_EXPIRING_SOON' | 'CRITICAL_SPOILAGE_RISK'
  coolantType: string
  recommendation: string
}

// ──────────────────────────────────────────────────────────────────────────
// 1. PAN-NER CRITICAL BRIDGE CLASSIFICATION DATABASE
// ──────────────────────────────────────────────────────────────────────────
export const NER_BRIDGE_CLASSIFICATION_DATABASE: BridgeClassRecord[] = [
  {
    id: 'br-teesta-rangpo',
    name: 'Rangpo Teesta Steel Suspension Bridge',
    highway: 'NH-10 (Sikkim Lifeline)',
    state: 'Sikkim',
    coordinates: [27.176, 88.531],
    bridgeClassTons: 18,
    structureType: 'BAILEY_SINGLE_LANE',
    lowestAxleLimitTons: 9,
    riskWarning: 'Post-2023 GLOF temporary Bailey span. Multi-axle carriers > 18T strictly prohibited; risk of pier displacement.',
  },
  {
    id: 'br-makru-nh37',
    name: 'Makru Concrete High-Level Bridge',
    highway: 'NH-37 (Imphal–Jiribam)',
    state: 'Manipur',
    coordinates: [24.812, 93.621],
    bridgeClassTons: 40,
    structureType: 'REINFORCED_CONCRETE',
    lowestAxleLimitTons: 16,
    riskWarning: 'Two-lane reinforced concrete span. Cleared for heavy multi-axle freight convoys up to 40T.',
  },
  {
    id: 'br-jatinga-bailey',
    name: 'Jatinga River Emergency Bailey Span',
    highway: 'NH-27 (Dima Hasao Hill Sector)',
    state: 'Assam',
    coordinates: [25.120, 92.980],
    bridgeClassTons: 12,
    structureType: 'BAILEY_SINGLE_LANE',
    lowestAxleLimitTons: 6,
    riskWarning: 'Single-lane 12T emergency Bailey crossing over fracture chasm. Restrict to 4x4 Gypsies & Ambulances.',
  },
  {
    id: 'br-churaibari-culvert',
    name: 'Churaibari Low-Level River Box Culvert',
    highway: 'NH-8 (Tripura Interstate Gateway)',
    state: 'Tripura / Assam',
    coordinates: [24.470, 92.245],
    bridgeClassTons: 24,
    structureType: 'STEEL_TRUSS',
    lowestAxleLimitTons: 12,
    riskWarning: 'Submergence prone during heavy rain. Passable up to 24T when water level < 30 cm.',
  },
  {
    id: 'br-tawang-chu',
    name: 'Tawang Chu Gorge Military Bailey Bridge',
    highway: 'BCT Strategic Road (Arunachal Pradesh)',
    state: 'Arunachal Pradesh',
    coordinates: [27.550, 91.910],
    bridgeClassTons: 18,
    structureType: 'BAILEY_SINGLE_LANE',
    lowestAxleLimitTons: 8,
    riskWarning: 'High-altitude deep gorge crossing. Regulated single-vehicle spacing of 50 meters enforced.',
  },
]

// ──────────────────────────────────────────────────────────────────────────
// 2. CELLULAR BLACKOUT & VHF RADIO HANDOFF ZONES
// ──────────────────────────────────────────────────────────────────────────
export const NER_CELLULAR_BLACKOUT_ZONES: CellularBlackoutZone[] = [
  {
    id: 'blackout-sonapur-tunnel',
    corridorName: 'Sonapur Tunnel & Lukha River Gorge',
    highway: 'NH-6 (East Jaintia Hills, Meghalaya)',
    startKmMark: 132,
    endKmMark: 154,
    lengthKm: 22,
    telecomStatus: 'VHF_RADIO_MANDATORY',
    primaryPoliceVHFRelay: 'SONAPUR-LIFELINE (Lumshnong PS / VHF Channel 4)',
    loraMeshGatewayAvailable: true,
  },
  {
    id: 'blackout-jatinga-harangajao',
    corridorName: 'Jatinga Sinking Ridge to Harangajao Valley',
    highway: 'NH-27 (Dima Hasao, Assam)',
    startKmMark: 88,
    endKmMark: 116,
    lengthKm: 28,
    telecomStatus: 'VHF_RADIO_MANDATORY',
    primaryPoliceVHFRelay: 'VICTOR-11 (Haflong Command / VHF Channel 2)',
    loraMeshGatewayAvailable: true,
  },
  {
    id: 'blackout-tupul-noney',
    corridorName: 'Tupul Mountain Railway Gorge & Makru Sector',
    highway: 'NH-37 (Tamenglong, Manipur)',
    startKmMark: 45,
    endKmMark: 80,
    lengthKm: 35,
    telecomStatus: 'VHF_RADIO_MANDATORY',
    primaryPoliceVHFRelay: 'MAKRU-GUARD-01 (Noney PS / VHF Channel 6)',
    loraMeshGatewayAvailable: false,
  },
  {
    id: 'blackout-sela-pass',
    corridorName: 'Sela Pass High-Altitude Ridge (13,700 ft)',
    highway: 'NH-13 / BCT Road (Arunachal Pradesh)',
    startKmMark: 165,
    endKmMark: 198,
    lengthKm: 33,
    telecomStatus: 'VHF_RADIO_MANDATORY',
    primaryPoliceVHFRelay: 'SELA-FRONTIER-01 (Tawang Command / VHF Channel 1)',
    loraMeshGatewayAvailable: true,
  },
  {
    id: 'blackout-teesta-gorge',
    corridorName: '29th Mile to Singtam Teesta River Basin',
    highway: 'NH-10 (Sikkim)',
    startKmMark: 30,
    endKmMark: 48,
    lengthKm: 18,
    telecomStatus: 'VHF_RADIO_MANDATORY',
    primaryPoliceVHFRelay: 'TEESTA-GATEWAY (Rangpo PS / VHF Channel 3)',
    loraMeshGatewayAvailable: true,
  },
]

// ──────────────────────────────────────────────────────────────────────────
// 3. CIVILIAN FIRST RESPONSE: VILLAGE DEFENCE PARTIES & GAON BURAHS
// ──────────────────────────────────────────────────────────────────────────
export const NER_VDP_REGISTRY: VillageDefencePartyProfile[] = [
  {
    id: 'vdp-jatinga',
    villageName: 'Jatinga Hill Village',
    district: 'Dima Hasao',
    state: 'Assam',
    nearestVAPCoords: [25.120, 92.980],
    gaonBurahName: 'D. Hrangkhol (Headman)',
    gaonBurahContact: '94355-12890',
    vdpSecretaryName: 'Laltanpuia VDP',
    vdpSecretaryContact: '98620-44120',
    availablePorterVolunteers: 18,
    packMulesCount: 6,
    localRiverBoatmenCount: 0,
    standbyReadiness: 'IMMEDIATE_15_MIN',
  },
  {
    id: 'vdp-harangajao',
    villageName: 'Harangajao River Settlement',
    district: 'Dima Hasao',
    state: 'Assam',
    nearestVAPCoords: [25.045, 92.865],
    gaonBurahName: 'J. Sengyung (Headman)',
    gaonBurahContact: '94351-87234',
    vdpSecretaryName: 'B. Dimasa VDP',
    vdpSecretaryContact: '86383-99120',
    availablePorterVolunteers: 24,
    packMulesCount: 4,
    localRiverBoatmenCount: 6,
    standbyReadiness: 'IMMEDIATE_15_MIN',
  },
  {
    id: 'vdp-majuli-kamalabari',
    villageName: 'Kamalabari Ghat Char Area',
    district: 'Majuli',
    state: 'Assam',
    nearestVAPCoords: [26.950, 94.170],
    gaonBurahName: 'Prabhat Saikia (Gaon Burah)',
    gaonBurahContact: '94350-66712',
    vdpSecretaryName: 'Tarun Hazarika VDP',
    vdpSecretaryContact: '88765-33410',
    availablePorterVolunteers: 30,
    packMulesCount: 0,
    localRiverBoatmenCount: 14,
    standbyReadiness: 'IMMEDIATE_15_MIN',
  },
  {
    id: 'vdp-noney-tupul',
    villageName: 'Tupul Valley Habitation',
    district: 'Noney',
    state: 'Manipur',
    nearestVAPCoords: [24.812, 93.621],
    gaonBurahName: 'K. Rongmei (Village Chief)',
    gaonBurahContact: '98622-77190',
    vdpSecretaryName: 'G. Gangte VDP',
    vdpSecretaryContact: '94360-88123',
    availablePorterVolunteers: 22,
    packMulesCount: 8,
    localRiverBoatmenCount: 2,
    standbyReadiness: 'IMMEDIATE_15_MIN',
  },
  {
    id: 'vdp-chungthang',
    villageName: 'Chungthang Alpine Hamlet',
    district: 'North Sikkim',
    state: 'Sikkim',
    nearestVAPCoords: [27.605, 88.645],
    gaonBurahName: 'Tshering Lepcha (Panchayat Head)',
    gaonBurahContact: '94340-99811',
    vdpSecretaryName: 'Karma Bhutia (Local Rescue Lead)',
    vdpSecretaryContact: '80018-44219',
    availablePorterVolunteers: 16,
    packMulesCount: 10,
    localRiverBoatmenCount: 0,
    standbyReadiness: 'IMMEDIATE_15_MIN',
  },
]

// ──────────────────────────────────────────────────────────────────────────
// 4. FORWARD REFUEL POINTS (FRP) & MOUNTAIN FUEL BURN
// ──────────────────────────────────────────────────────────────────────────
export const NER_FORWARD_REFUEL_POINTS: ForwardRefuelPoint[] = [
  {
    id: 'frp-lumshnong',
    name: 'IOCL Strategic Reserve Bunk Lumshnong',
    highway: 'NH-6 (East Jaintia Hills)',
    chainageKm: 130,
    company: 'IOCL_GOVT_RESERVED',
    coordinates: [25.168, 92.381],
    highAltitudeDieselStockLitres: 45000,
    generatorPowerBackup: true,
    emergencyContact: '03655-230111',
  },
  {
    id: 'frp-haflong-lumding',
    name: 'HPCL Haflong Hill Staging Terminal',
    highway: 'NH-27 (Dima Hasao)',
    chainageKm: 85,
    company: 'HPCL_STRATEGIC',
    coordinates: [25.172, 93.021],
    highAltitudeDieselStockLitres: 38000,
    generatorPowerBackup: true,
    emergencyContact: '03673-236440',
  },
  {
    id: 'frp-rangpo-gateway',
    name: 'BPCL Rangpo Interstate Strategic Fuel Depot',
    highway: 'NH-10 (Sikkim Border)',
    chainageKm: 25,
    company: 'BPCL_DISASTER_RESERVE',
    coordinates: [27.176, 88.531],
    highAltitudeDieselStockLitres: 60000,
    generatorPowerBackup: true,
    emergencyContact: '03592-240190',
  },
  {
    id: 'frp-bomdila-bct',
    name: 'IOCL High-Altitude Fuel Station Bomdila',
    highway: 'NH-13 / BCT Road',
    chainageKm: 140,
    company: 'IOCL_GOVT_RESERVED',
    coordinates: [27.264, 92.420],
    highAltitudeDieselStockLitres: 50000,
    generatorPowerBackup: true,
    emergencyContact: '03782-222180',
  },
]

// ──────────────────────────────────────────────────────────────────────────
// 5. EVALUATION FUNCTIONS
// ──────────────────────────────────────────────────────────────────────────

// Bridge Axle-Load Gating
export function evaluateBridgeLoadGating(
  vehicleGrossWeightTons: number,
  pathCoordinates: [number, number][]
): { isPassable: boolean; lowestBridgeClassTons: number; violationBridge?: BridgeClassRecord } {
  let lowestClass = 40
  let violation: BridgeClassRecord | undefined = undefined

  for (const bridge of NER_BRIDGE_CLASSIFICATION_DATABASE) {
    for (const pt of pathCoordinates) {
      const dLat = (bridge.coordinates[0] - pt[0]) * 111
      const dLng = (bridge.coordinates[1] - pt[1]) * 111 * Math.cos((pt[0] * Math.PI) / 180)
      const dist = Math.hypot(dLat, dLng)
      if (dist <= 12) {
        if (bridge.bridgeClassTons < lowestClass) {
          lowestClass = bridge.bridgeClassTons
        }
        if (vehicleGrossWeightTons > bridge.bridgeClassTons) {
          violation = bridge
        }
      }
    }
  }

  return {
    isPassable: !violation,
    lowestBridgeClassTons: lowestClass,
    violationBridge: violation,
  }
}

// Find Cellular Blackout Zone on Route
export function findBlackoutZonesOnRoute(
  pathCoordinates: [number, number][]
): CellularBlackoutZone[] {
  const matches: CellularBlackoutZone[] = []
  for (const zone of NER_CELLULAR_BLACKOUT_ZONES) {
    for (const pt of pathCoordinates) {
      // rough bounding box check
      if (zone.highway.includes('NH-27') && pt[0] > 25.0 && pt[0] < 25.3 && pt[1] > 92.8 && pt[1] < 93.2) {
        if (!matches.some(m => m.id === zone.id)) matches.push(zone)
      } else if (zone.highway.includes('NH-6') && pt[0] > 25.0 && pt[0] < 25.3 && pt[1] > 92.2 && pt[1] < 92.6) {
        if (!matches.some(m => m.id === zone.id)) matches.push(zone)
      } else if (zone.highway.includes('NH-10') && pt[0] > 27.0 && pt[0] < 27.4 && pt[1] > 88.4 && pt[1] < 88.7) {
        if (!matches.some(m => m.id === zone.id)) matches.push(zone)
      } else if (zone.highway.includes('NH-37') && pt[0] > 24.6 && pt[0] < 24.9 && pt[1] > 93.4 && pt[1] < 93.8) {
        if (!matches.some(m => m.id === zone.id)) matches.push(zone)
      }
    }
  }
  return matches
}

// Find Closest VDP & Gaon Burah for VAP Roadhead
export function findClosestVDPForVAP(
  vapLat: number,
  vapLng: number
): VillageDefencePartyProfile {
  let closest = NER_VDP_REGISTRY[0]
  let minDist = Infinity

  for (const vdp of NER_VDP_REGISTRY) {
    const d = Math.hypot(vdp.nearestVAPCoords[0] - vapLat, vdp.nearestVAPCoords[1] - vapLng)
    if (d < minDist) {
      minDist = d
      closest = vdp
    }
  }

  return closest
}

// Calculate Steep Ascent Mountain Fuel Burn & Find Closest Refuel Bunk
export function calculateMountainFuelBurnAndFRP(
  distanceKm: number,
  isMountainous: boolean,
  targetLat: number,
  targetLng: number
): { roundTripDieselLitres: number; nearestRefuelPoint: ForwardRefuelPoint; fuelBurnSurchargePercent: number } {
  const baseBurnRatePer100Km = 24 // Litres / 100km for 4x4 / Medium vehicle
  const gradientSurcharge = isMountainous ? 1.45 : 1.1 // +45% in steep hill climb
  const oneWayLitres = (distanceKm / 100) * baseBurnRatePer100Km * gradientSurcharge
  const roundTripLitres = Math.round(oneWayLitres * 2)

  let nearestFRP = NER_FORWARD_REFUEL_POINTS[0]
  let minDist = Infinity

  for (const frp of NER_FORWARD_REFUEL_POINTS) {
    const d = Math.hypot(frp.coordinates[0] - targetLat, frp.coordinates[1] - targetLng)
    if (d < minDist) {
      minDist = d
      nearestFRP = frp
    }
  }

  return {
    roundTripDieselLitres: roundTripLitres,
    nearestRefuelPoint: nearestFRP,
    fuelBurnSurchargePercent: isMountainous ? 45 : 10,
  }
}

// Dynamic Cold-Chain & Oxygen Exhaustion Viability Countdown
export function evaluateColdChainCountdown(
  cargoType: string,
  totalTransitHours: number
): ColdChainViabilityResult {
  let safeEnduranceHours = 72
  let cargoName = 'Standard Emergency Relief Cargo'
  let coolantType = 'Standard Ambient Packaging'

  if (cargoType.includes('medicine') || cargoType.includes('vaccine') || cargoType.includes('plasma')) {
    safeEnduranceHours = 18.0 // 18 hours in Phase-Change Coolant Box (2-8°C)
    cargoName = 'Vaccines, Insulin & Anti-Venom (2°C - 8°C Cold-Chain)'
    coolantType = 'Phase-Change Material (PCM) Dry Ice / Gel Flasks'
  } else if (cargoType.includes('blood')) {
    safeEnduranceHours = 12.0
    cargoName = 'Cryo-Preserved Blood Plasma & O-Negative Units'
    coolantType = 'Active Cryo-Insulated Transport Shipper'
  } else if (cargoType.includes('oxygen')) {
    safeEnduranceHours = 6.5
    cargoName = 'Medical Oxygen Cylinders (2,000 PSI @ 10 L/min flow)'
    coolantType = 'Pressurized Cryogenic / Flow Manifold'
  }

  const safetyMargin = Number((safeEnduranceHours - totalTransitHours).toFixed(1))
  let status: ColdChainViabilityResult['status'] = 'OPTIMAL_SAFE'
  let recommendation = 'Transit duration is well within the certified preservation window.'

  if (safetyMargin <= 1.5) {
    status = 'CRITICAL_SPOILAGE_RISK'
    recommendation = '⚠️ CRITICAL VIABILITY HAZARD: Total transit time approaches or exceeds safe endurance limit. Immediate UAV Drone / IAF Mi-17 rotary airlift mandatory to prevent total cold-chain failure.'
  } else if (safetyMargin <= 4.0) {
    status = 'AMBER_EXPIRING_SOON'
    recommendation = '⚡ CAUTION: Less than 4 hours preservation buffer remaining upon arrival at crisis zone. Expedite last-mile handoff immediately at VAP.'
  }

  return {
    cargoName,
    safeEnduranceHours,
    totalTransitHours: Number(totalTransitHours.toFixed(1)),
    safetyMarginHours: safetyMargin,
    status,
    coolantType,
    recommendation,
  }
}

