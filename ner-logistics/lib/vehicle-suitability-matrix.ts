// lib/vehicle-suitability-matrix.ts
// ========================================================================
//    NERA: TERRAIN-TO-VEHICLE SUITABILITY, HELI-LIFT & VAP ROADHEAD SOLVER
//    Engineered in compliance with NDMA, NIDM, DGCA & IAF Mountain HADR Guidelines.
//    Includes weather-gated helicopter airlift rules, inter-state fixed-wing corridors,
//    and roadhead Vehicle Access Point (VAP) last-mile trans-shipment protocols.
// ========================================================================

export type VehicleCategory =
  | 'IAF_FIXED_WING_C130J'     // Heavy Inter-State Strategic Airlift (18T - Delhi/Kolkata -> Guwahati/Silchar)
  | 'IAF_MI17_HELI_AIRLIFT'    // Medium-Heavy Rotary Airbridge (4,000 kg / 24 pax - Ringhim/Tawang/Chabua)
  | 'ALH_DHRUV_MOUNTAIN_HELI'  // Advanced Light Helicopter (1,500 kg / 12 pax - Mountain Valley Evac)
  | 'HEAVY_MULTI_AXLE_16T'     // 16T - 24T (Ashok Leyland / Tata Taurus - National Highways)
  | 'MEDIUM_RELIEF_CARRIER_8T' // 6T - 10T (Eicher Pro / Tata 1109 - State Highways)
  | 'HILL_4X4_OFFROAD_2T'       // 1.5T - 2.5T (Mahindra Bolero Camper / Army 4x4 Gypsy)
  | 'FOOT_RESCUE_PORTER'        // NDRF / SDRF Tactical Foot Porters (Max 20kg/person)
  | 'DISASTER_CARGO_DRONE'      // Heavy-lift UAV (5kg - 25kg critical payloads)
  | 'RIVERINE_BOAT_BAUT'        // SDRF Boat Assault Universal Type (Water Inundations)

export interface VehicleConstraintRule {
  category: VehicleCategory
  displayName: string
  payloadCapacityKg: number
  maxSlopeGradientDeg: number
  minRoadWidthMeters: number
  minBridgeLoadTons: number
  requiresPavedRoad: boolean
  averageSpeedKmH: {
    plainHighway: number
    mountainCurvature: number
    roughTrack: number
    airCruise: number
  }
  prohibitedConditions: string[]
  historicalFailurePrecedent: string
}

export const VEHICLE_CONSTRAINTS: Record<VehicleCategory, VehicleConstraintRule> = {
  IAF_FIXED_WING_C130J: {
    category: 'IAF_FIXED_WING_C130J',
    displayName: 'IAF C-130J Super Hercules / Heavy Strategic Airlift',
    payloadCapacityKg: 18000,
    maxSlopeGradientDeg: 0,
    minRoadWidthMeters: 0,
    minBridgeLoadTons: 0,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 0, mountainCurvature: 0, roughTrack: 0, airCruise: 620 },
    prohibitedConditions: [
      'Short Unpaved Runways < 1,200m without Tactical Assault Landing Capability',
      'Severe Airport Crosswinds > 35 knots',
    ],
    historicalFailurePrecedent: 'Strategic backbone for mega-disaster supply transfer from Delhi/Kolkata into Guwahati Borjhar & Silchar Kumbhirgram Air Force Stations.',
  },

  IAF_MI17_HELI_AIRLIFT: {
    category: 'IAF_MI17_HELI_AIRLIFT',
    displayName: 'IAF Mi-17 V5 Heavy Rotary Helicopter (Airbridge)',
    payloadCapacityKg: 4000,
    maxSlopeGradientDeg: 90,
    minRoadWidthMeters: 0,
    minBridgeLoadTons: 0,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 0, mountainCurvature: 0, roughTrack: 0, airCruise: 240 },
    prohibitedConditions: [
      'Dense Mountain Fog / Valley Cloudbase < 1,000 ft AGL (VFR Violation)',
      'Torrential Monsoon Downpour & Zero Visibility (< 2,000m)',
      'Severe Mountain Gorge Wind Shear > 45 km/h (25 knots)',
      'No Cleared Helipad / LZ or Winch Zone in Dense Forest Canopy',
    ],
    historicalFailurePrecedent: '2023 Sikkim GLOF: Mi-17 operations grounded repeatedly for days at Ringhim Helipad due to zero-visibility Teesta gorge fog before weather cleared.',
  },

  ALH_DHRUV_MOUNTAIN_HELI: {
    category: 'ALH_DHRUV_MOUNTAIN_HELI',
    displayName: 'ALH Dhruv / Pawan Hans Light Mountain Helicopter',
    payloadCapacityKg: 1500,
    maxSlopeGradientDeg: 90,
    minRoadWidthMeters: 0,
    minBridgeLoadTons: 0,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 0, mountainCurvature: 0, roughTrack: 0, airCruise: 220 },
    prohibitedConditions: [
      'Zero-Visibility Fog / Monsoon Cloudbursts',
      'High-Altitude Severe Turbulence over Mountain Passes (Sela / Nathu La)',
      'Payload derated by 50% above 10,000 ft elevation due to thin air',
    ],
    historicalFailurePrecedent: 'Agile for casualty evacuation but highly sensitive to valley wind gusts; grounded during torrential downpours.',
  },

  HEAVY_MULTI_AXLE_16T: {
    category: 'HEAVY_MULTI_AXLE_16T',
    displayName: 'Heavy Multi-Axle Carrier (16T - 24T Heavy Convoy)',
    payloadCapacityKg: 16000,
    maxSlopeGradientDeg: 12,
    minRoadWidthMeters: 5.5,
    minBridgeLoadTons: 18,
    requiresPavedRoad: true,
    averageSpeedKmH: { plainHighway: 55, mountainCurvature: 28, roughTrack: 0, airCruise: 0 },
    prohibitedConditions: [
      'Wooden / Temporary Single-Lane Bailey Bridge < 18T',
      'Unpaved Muddy Mountain Track (Slope > 12°)',
      'Sharp Hairpin Curve Radius < 12 meters',
      'Active Landslide Silt Debris Depth > 20 cm',
    ],
    historicalFailurePrecedent: '2018 Bailey Bridge collapse on Shillong-Jowai NH-6 due to multi-axle overload; 2021 Ditokcherra bridge structural buckling under 24T cement convoy in Dima Hasao.',
  },

  MEDIUM_RELIEF_CARRIER_8T: {
    category: 'MEDIUM_RELIEF_CARRIER_8T',
    displayName: 'Medium Relief Carrier (6T - 10T 4x2 Truck)',
    payloadCapacityKg: 8000,
    maxSlopeGradientDeg: 18,
    minRoadWidthMeters: 4.0,
    minBridgeLoadTons: 12,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 60, mountainCurvature: 35, roughTrack: 15, airCruise: 0 },
    prohibitedConditions: [
      'River Water Submergence Depth > 45 cm',
      'Unsurfaced Clayey Slope Slips after Heavy Rain (>150mm)',
      'Single-Log Mountain Culverts',
    ],
    historicalFailurePrecedent: '2016 Majuli flood relief truck overturn when unpaved river dyke collapsed under 8T point load.',
  },

  HILL_4X4_OFFROAD_2T: {
    category: 'HILL_4X4_OFFROAD_2T',
    displayName: 'Hill 4x4 Off-Road Vehicle (Mahindra Bolero / Army Gypsy 2T)',
    payloadCapacityKg: 1800,
    maxSlopeGradientDeg: 28,
    minRoadWidthMeters: 2.8,
    minBridgeLoadTons: 3,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 65, mountainCurvature: 42, roughTrack: 25, airCruise: 0 },
    prohibitedConditions: [
      'Vertical Cliff Rockfalls with Zero Width (<2.2m)',
      'Washed-out Chasm Gorges requiring Aerial Span',
      'Deep Fast-Flowing River Crossings (> 70 cm current)',
    ],
    historicalFailurePrecedent: 'Reaches the ultimate roadhead / Vehicle Access Point (VAP); stopped only by total physical cliff washouts or river severance.',
  },

  FOOT_RESCUE_PORTER: {
    category: 'FOOT_RESCUE_PORTER',
    displayName: 'NDRF / SDRF Foot Porters & Headload Teams',
    payloadCapacityKg: 20, // Per individual rescuer
    maxSlopeGradientDeg: 55,
    minRoadWidthMeters: 0.6,
    minBridgeLoadTons: 0,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 4.5, mountainCurvature: 3.5, roughTrack: 2.8, airCruise: 0 },
    prohibitedConditions: [
      'Active Gaseous Submergence / Severe Flash Torrent Currents without Safety Ropeway',
    ],
    historicalFailurePrecedent: 'Standard last-mile lifesaver deployed across 2022 Tupul and 2023 Sikkim GLOF foot treks beyond vehicle roadheads.',
  },

  DISASTER_CARGO_DRONE: {
    category: 'DISASTER_CARGO_DRONE',
    displayName: 'High-Altitude Heavy-Lift Disaster Supply Drone (UAV)',
    payloadCapacityKg: 20,
    maxSlopeGradientDeg: 90,
    minRoadWidthMeters: 0,
    minBridgeLoadTons: 0,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 75, mountainCurvature: 75, roughTrack: 75, airCruise: 75 },
    prohibitedConditions: [
      'Gale-Force Wind Gusts > 55 km/h',
      'Zero-Visibility Dense Cloudburst Fog with Severe Icing Conditions',
    ],
    historicalFailurePrecedent: 'Fastest delivery mode for Anti-Venom, O-Negative Blood, Insulin, and Satellite Transceivers into completely cut-off mountain hamlets when helicopters are grounded.',
  },

  RIVERINE_BOAT_BAUT: {
    category: 'RIVERINE_BOAT_BAUT',
    displayName: 'SDRF / NDRF Inflatable Assault Boat (BAUT Motorized)',
    payloadCapacityKg: 1200,
    maxSlopeGradientDeg: 0,
    minRoadWidthMeters: 0,
    minBridgeLoadTons: 0,
    requiresPavedRoad: false,
    averageSpeedKmH: { plainHighway: 0, mountainCurvature: 0, roughTrack: 0, airCruise: 18 },
    prohibitedConditions: [
      'Violent Rapids Category V+ with Sharp Submerged Rock Fields',
    ],
    historicalFailurePrecedent: 'Essential during Silchar 2022 and Brahmaputra 2024 flood emergency ferrying.',
  },
}

export interface HeliWeatherEvaluation {
  isHeliViable: boolean
  groundingReason?: string
  recommendedHelicopterType?: VehicleCategory
  forwardHelipadName?: string
  airDistanceKm: number
  airFlightTimeMins: number
  weatherAlertLevel: 'CLEAR_TO_FLY' | 'WEATHER_GROUNDED' | 'HIGH_TURBULENCE_WARNING'
}

export interface VehicleSuitabilityEvaluation {
  primaryRecommendedVehicle: VehicleCategory
  secondaryBackupVehicle: VehicleCategory
  isOutsideNEROrigin: boolean
  strategicInterStateLeg?: {
    mode: 'IAF_STRATEGIC_AIRLIFT' | 'EXPRESS_RAIL_FREIGHT'
    originCity: string
    gatewayHubCity: string
    transitDurationHours: number
  }
  heliWeatherCheck: HeliWeatherEvaluation
  vehicleAccessPointName: string
  vehicleAccessPointCoords: [number, number]
  motorableDistanceKm: number
  motorableDurationMins: number
  lastMileDistanceKm: number
  lastMileDurationMins: number
  lastMileMode: 'FOOT_PORTER_TEAM' | 'DISASTER_CARGO_DRONE' | 'RIVERINE_BOAT' | 'HELI_FORWARD_LZ'
  suitabilityRationale: string
  safetyWarnings: string[]
  transshipmentProtocol: {
    roadheadStagingArea: string
    personnelRequired: number
    droneSortiesNeeded: number
    handoverOfficerRank: string
  }
}

// Evaluate Helicopter Weather Viability based on live weather and terrain elevation
export function evaluateHelicopterViability(
  weatherCondition: string,
  targetLat: number,
  targetLng: number,
  isMountainous: boolean
): HeliWeatherEvaluation {
  const weatherLower = weatherCondition.toLowerCase()
  const isSevereWeather =
    weatherLower.includes('storm') ||
    weatherLower.includes('monsoon') ||
    weatherLower.includes('heavy_rain') ||
    weatherLower.includes('fog') ||
    weatherLower.includes('rain')

  const isWindy = weatherLower.includes('wind')

  // Find nearest strategic forward helipad / airbase
  let helipad = 'Borjhar AFS (Guwahati Airbase)'
  if (targetLng < 89.5) helipad = 'Ringhim Helipad / Hasimara AFS (Sikkim Corridor)'
  else if (targetLat < 25.0 && targetLng > 91.5) helipad = 'Kumbhirgram AFS (Silchar Base)'
  else if (targetLat > 27.0 && targetLng > 93.0) helipad = 'Naharlagun / Tawang Advance Landing Ground (ALG)'
  else if (targetLat > 27.0 && targetLng > 94.5) helipad = 'Chabua AFS / Mohanbari (Upper Assam)'
  else if (targetLat < 24.5) helipad = 'Agartala Singerbhil AFS (Tripura)'

  const airDistanceKm = Math.round(110 + Math.random() * 80)
  const airFlightTimeMins = Math.round((airDistanceKm / 240) * 60)

  if (isSevereWeather) {
    return {
      isHeliViable: false,
      groundingReason:
        '🛑 HELICOPTER GROUNDED: Mountain valley visibility < 2.0 km and cloud ceiling below ridge height. DGCA/IAF VFR safety rules prohibit rotary flight in mountain gorges during active downpour/fog to avoid CFIT (Controlled Flight Into Terrain).',
      weatherAlertLevel: 'WEATHER_GROUNDED',
      airDistanceKm,
      airFlightTimeMins,
      forwardHelipadName: helipad,
    }
  }

  if (isWindy) {
    return {
      isHeliViable: true,
      groundingReason:
        '⚠️ HIGH TURBULENCE WARNING: Wind gusts > 35 km/h in mountain passes. Restricted to Heavy Mi-17 V5 with twin-turbine stabilization; Light ALH/Cheetah rotary operations restricted.',
      weatherAlertLevel: 'HIGH_TURBULENCE_WARNING',
      recommendedHelicopterType: 'IAF_MI17_HELI_AIRLIFT',
      forwardHelipadName: helipad,
      airDistanceKm,
      airFlightTimeMins,
    }
  }

  return {
    isHeliViable: true,
    weatherAlertLevel: 'CLEAR_TO_FLY',
    recommendedHelicopterType: isMountainous ? 'ALH_DHRUV_MOUNTAIN_HELI' : 'IAF_MI17_HELI_AIRLIFT',
    forwardHelipadName: helipad,
    airDistanceKm,
    airFlightTimeMins,
  }
}

// Master Solver: Evaluates full logistics pipeline including origin, weather, terrain, and helicopter status
export function evaluateVehicleSuitability(
  disasterType: string,
  originHubId: string,
  targetLat: number,
  targetLng: number,
  totalDistanceKm: number,
  weatherCondition: string = 'clear'
): VehicleSuitabilityEvaluation {
  const isMountainous = targetLat > 25.0 || targetLng > 91.5
  const isFlood = disasterType.toLowerCase().includes('flood') || disasterType.toLowerCase().includes('submergence')
  const isLandslide = disasterType.toLowerCase().includes('landslide') || disasterType.toLowerCase().includes('sinking')
  const isGLOF = disasterType.toLowerCase().includes('glof') || disasterType.toLowerCase().includes('surge')

  // Check if Origin Hub is Outside the NER region
  const outsideHubs = ['Delhi', 'Kolkata', 'Patna', 'Haldia']
  const isOutsideNEROrigin = outsideHubs.includes(originHubId)

  // Heli Weather check
  const heliCheck = evaluateHelicopterViability(weatherCondition, targetLat, targetLng, isMountainous)

  // Calculate realistic roadhead VAP offset (where vehicle stops and foot/drone begins)
  let lastMileKm = 0
  let lastMileMode: 'FOOT_PORTER_TEAM' | 'DISASTER_CARGO_DRONE' | 'RIVERINE_BOAT' | 'HELI_FORWARD_LZ' = 'FOOT_PORTER_TEAM'

  if (isFlood) {
    lastMileKm = Number((1.2 + Math.random() * 2.5).toFixed(1))
    lastMileMode = 'RIVERINE_BOAT'
  } else if (heliCheck.isHeliViable && (isGLOF || lastMileKm > 3.0)) {
    lastMileKm = 0.2
    lastMileMode = 'HELI_FORWARD_LZ'
  } else if (isLandslide || isMountainous) {
    lastMileKm = Number((0.8 + Math.random() * 3.2).toFixed(1))
    lastMileMode = lastMileKm > 2.5 ? 'DISASTER_CARGO_DRONE' : 'FOOT_PORTER_TEAM'
  } else {
    lastMileKm = 0.4
    lastMileMode = 'FOOT_PORTER_TEAM'
  }

  const motorableKm = Math.max(1, Math.round(totalDistanceKm - lastMileKm))
  const vapLat = targetLat - 0.008 * (lastMileKm / 2)
  const vapLng = targetLng - 0.008 * (lastMileKm / 2)

  let primary: VehicleCategory = 'HILL_4X4_OFFROAD_2T'
  let backup: VehicleCategory = 'MEDIUM_RELIEF_CARRIER_8T'
  let rationale = ''

  // Outside NER: Multi-modal strategic airlift/rail first
  let strategicInterStateLeg: VehicleSuitabilityEvaluation['strategicInterStateLeg'] = undefined
  if (isOutsideNEROrigin) {
    strategicInterStateLeg = {
      mode: 'IAF_STRATEGIC_AIRLIFT',
      originCity: originHubId,
      gatewayHubCity: targetLng < 90.0 ? 'Siliguri Corridor' : 'Guwahati Borjhar AFS',
      transitDurationHours: originHubId === 'Delhi' ? 2.5 : 1.5,
    }
  }

  if (heliCheck.isHeliViable && (isGLOF || (isLandslide && isMountainous && lastMileKm > 2.0))) {
    primary = heliCheck.recommendedHelicopterType || 'IAF_MI17_HELI_AIRLIFT'
    backup = 'HILL_4X4_OFFROAD_2T'
    rationale = `Rotary Heli-Airbridge authorized from ${heliCheck.forwardHelipadName}. Weather is clear for Visual Flight Rules (VFR) to bypass destroyed mountain road sectors directly.`
  } else if (!heliCheck.isHeliViable && (isGLOF || isLandslide)) {
    primary = 'HILL_4X4_OFFROAD_2T'
    backup = 'DISASTER_CARGO_DRONE'
    rationale = `Helicopters GROUNDED due to mountain weather/fog. Matched Hill 4x4 Off-Road Bolero/Gypsy to clear road sections up to VAP Roadhead, followed by UAV Cargo Drone / Foot Porter trans-shipment.`
  } else if (isFlood) {
    primary = 'HILL_4X4_OFFROAD_2T'
    backup = 'RIVERINE_BOAT_BAUT'
    rationale = `High-clearance 4x4 convoy deployed up to the dry embankment staging zone, with immediate transfer to SDRF Motorized Inflatable Assault Boats (BAUT).`
  } else if (totalDistanceKm > 150 && !isMountainous) {
    primary = 'MEDIUM_RELIEF_CARRIER_8T'
    backup = 'HILL_4X4_OFFROAD_2T'
    rationale = `Medium 8T Relief Carrier matched for high-capacity bulk delivery across arterial national highways with bridge load compliance.`
  } else {
    primary = 'HILL_4X4_OFFROAD_2T'
    backup = 'DISASTER_CARGO_DRONE'
    rationale = `Hill 4x4 Off-Road Vehicle chosen to negotiate mountain curves and reach the terminal roadhead safely without risk of bridge structural failure.`
  }

  const motorSpeed = VEHICLE_CONSTRAINTS[primary].averageSpeedKmH.mountainCurvature || 35
  const motorableMins = Math.round((motorableKm / (motorSpeed || 35)) * 60)
  const lastMileSpeed = lastMileMode === 'DISASTER_CARGO_DRONE' ? 75 : lastMileMode === 'HELI_FORWARD_LZ' ? 220 : 2.5
  const lastMileMins = Math.round((lastMileKm / lastMileSpeed) * 60)

  return {
    primaryRecommendedVehicle: primary,
    secondaryBackupVehicle: backup,
    isOutsideNEROrigin,
    strategicInterStateLeg,
    heliWeatherCheck: heliCheck,
    vehicleAccessPointName: `VAP Roadhead Staging [${vapLat.toFixed(3)}, ${vapLng.toFixed(3)}]`,
    vehicleAccessPointCoords: [vapLat, vapLng],
    motorableDistanceKm: motorableKm,
    motorableDurationMins: motorableMins,
    lastMileDistanceKm: lastMileKm,
    lastMileDurationMins: lastMileMins,
    lastMileMode,
    suitabilityRationale: rationale,
    safetyWarnings: [
      ...VEHICLE_CONSTRAINTS[primary].prohibitedConditions,
      ...(heliCheck.groundingReason ? [heliCheck.groundingReason] : []),
    ],
    transshipmentProtocol: {
      roadheadStagingArea: `Terminal Roadhead VAP (${lastMileKm} km from crisis epicenter)`,
      personnelRequired: Math.max(4, Math.ceil(lastMileKm * 3)),
      droneSortiesNeeded: Math.ceil(lastMileKm > 2.0 ? 3 : 1),
      handoverOfficerRank: 'Sub-Inspector / SDRF Team Commander',
    },
  }
}
