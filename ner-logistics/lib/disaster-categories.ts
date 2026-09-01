// lib/disaster-categories.ts
// ========================================================================
//    NERA: STANDARDIZED DISASTER CLASSIFICATION & STATE VULNERABILITY
//    Codified from NDMA / SDMA standards, field failure reports,
//    and authentic North Eastern Region calamity profiles.
// ========================================================================

export type CalamityClassId =
  | 'landslide_rockfall_mudslide'
  | 'flash_flood_river_breach'
  | 'bridge_culvert_collapse'
  | 'sinking_deformed_highway'
  | 'high_altitude_glof_surge'

export interface StandardDisasterCategory {
  id: CalamityClassId
  displayName: string
  shortLabel: string
  icon: string
  color: string
  specificNERSubTypes: string[]
  realWorldHotspots: string[]
  transportLogisticsImpact: string
  recommendedVehicleCategory: string
  lastMileHandoverMode: 'FOOT_PORTER_TEAM' | 'DISASTER_CARGO_DRONE' | 'RIVERINE_BOAT'
  emergencyActionProtocol: string
}

export const STANDARDIZED_DISASTER_CATEGORIES: StandardDisasterCategory[] = [
  {
    id: 'landslide_rockfall_mudslide',
    displayName: 'Landslide / Rockfall / Mudslide (Slope Collapse)',
    shortLabel: 'Landslide / Mudslide',
    icon: '⛰️',
    color: '#dc2626',
    specificNERSubTypes: [
      'Deep-seated slope failures',
      'Debris flows & mud torrents',
      'Shear rockfalls from escarpments',
      'Active shale slips',
    ],
    realWorldHotspots: [
      'NH-29 (Dimapur–Kohima–Chümoukedima, Nagaland)',
      'NH-10 (Sevoke–Rangpo–Gangtok, Sikkim)',
      'NH-6 (Sonapur Tunnel / East Jaintia Hills, Meghalaya)',
      'NH-13 (BCT Corridor / Trans-Arunachal)',
      'NH-27 (Jatinga–Harangajao Ridge, Dima Hasao, Assam)',
    ],
    transportLogisticsImpact:
      'Complete road severance; heavy multi-axle 6-wheelers barred from crossing; urgent requirement for 4x4 Bolero/Gypsy staging and NDRF/SDRF foot porter headload transitions.',
    recommendedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
    lastMileHandoverMode: 'FOOT_PORTER_TEAM',
    emergencyActionProtocol:
      'Stage heavy convoys at nearest Police Checkpost; dispatch BRO / NHIDCL earthmovers; activate foot porter / drone last-mile relay beyond the terminal roadhead (VAP).',
  },
  {
    id: 'flash_flood_river_breach',
    displayName: 'Flash Flood / River Breach (Inundation)',
    shortLabel: 'Flash Flood / River Breach',
    icon: '🌊',
    color: '#0284c7',
    specificNERSubTypes: [
      'Trans-boundary river surges',
      'Embankment / dyke ruptures',
      'Riverbank soil scouring',
      'Tarmac submergence (>50 cm)',
    ],
    realWorldHotspots: [
      'Majuli Island & Brahmaputra South Bank (Assam)',
      'Dhemaji & Barpeta Lowlands (Assam)',
      'Silchar Barak River Basin (Bethukandi Dyke Breach, Assam)',
      'Imphal Valley & Nambul Basin (Manipur)',
      'Howrah & Gomati River Plains (Tripura)',
    ],
    transportLogisticsImpact:
      'Waterlogged tarmac and washed-away approaches; road vehicles halted; routes require boat assault (BAUT) or amphibious transport transfers across submerged corridors.',
    recommendedVehicleCategory: 'RIVERINE_BOAT_BAUT',
    lastMileHandoverMode: 'RIVERINE_BOAT',
    emergencyActionProtocol:
      'Mobilize SDRF Inflatable Assault Boats (BAUT); establish trans-shipment depot at dry highway embankment; airlift critical medical supplies if water depth > 1.5m.',
  },
  {
    id: 'bridge_culvert_collapse',
    displayName: 'Bridge / Culvert Collapse (Point-Severance)',
    shortLabel: 'Bridge / Culvert Collapse',
    icon: '🌉',
    color: '#7c3aed',
    specificNERSubTypes: [
      'Pier foundation scouring',
      'Bailey bridge structural buckling',
      'Ruptured mountain box culverts',
      'Abutment soil washouts',
    ],
    realWorldHotspots: [
      'Teesta River Tributary Crossings (Sikkim)',
      'Kameng & Subansiri River Basins (Arunachal Pradesh)',
      'Makru & Barak River Approaches (NH-37, Manipur)',
      'Jatinga River Bailey Crossing (NH-27, Assam)',
    ],
    transportLogisticsImpact:
      'Instant point-severance; no advance motorable detour without dynamic alternative route planning; requires immediate foot-bridge / aerial ropeway staging.',
    recommendedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
    lastMileHandoverMode: 'FOOT_PORTER_TEAM',
    emergencyActionProtocol:
      'Divert heavy freight via secondary state bypass; deploy Army/BRO for rapid Bailey bridge assembly; establish twin-bank trans-shipment points.',
  },
  {
    id: 'sinking_deformed_highway',
    displayName: 'Sinking / Deformed Highway Stretch (Subsidence)',
    shortLabel: 'Sinking / Deformed Highway',
    icon: '🛣️',
    color: '#d97706',
    specificNERSubTypes: [
      'Tectonic fault line displacement',
      'Sub-surface soil liquefaction',
      'Pavement heaving & cracking',
      'Slow creeping road fractures',
    ],
    realWorldHotspots: [
      'Mahur & Jatinga Sinking Stretches (NH-27, Dima Hasao, Assam)',
      'Phesama & Dzuvuru Mud Slips (NH-29, Nagaland)',
      'Ramhlun Valley Settlement (Aizawl, Mizoram)',
      'Karsingsa Sinking Zone (NH-415, Arunachal Pradesh)',
    ],
    transportLogisticsImpact:
      'Speed reduced to < 10 km/h; heavy multi-axle vehicles prohibited due to axle sinking risk; 4x4 high-clearance vehicles required for transit.',
    recommendedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
    lastMileHandoverMode: 'FOOT_PORTER_TEAM',
    emergencyActionProtocol:
      'Impose strict single-lane regulated convoy movement; monitor surface displacement with geological sensors; enforce maximum 3-ton axle load limit.',
  },
  {
    id: 'high_altitude_glof_surge',
    displayName: 'High-Altitude GLOF / Surge (Glacial Runoff)',
    shortLabel: 'GLOF / Glacial Surge',
    icon: '❄️',
    color: '#0891b2',
    specificNERSubTypes: [
      'Glacial moraine dam breach',
      'High-velocity sediment debris flow',
      'Hydroelectric dam overtopping',
      'Severe alpine river bed scouring',
    ],
    realWorldHotspots: [
      'South Lhonak Glacial Lake & Teesta Basin (North Sikkim)',
      'Chungthang & Lachen Valley (Sikkim)',
      'Tawang Chu & Dibang Alpine Valleys (Arunachal Pradesh)',
    ],
    transportLogisticsImpact:
      'Long-term multi-week disruption of national lifelines; military and civil forward supply cutoffs; demands IAF rotary airlift and high-altitude UAV cargo drones.',
    recommendedVehicleCategory: 'DISASTER_CARGO_DRONE',
    lastMileHandoverMode: 'DISASTER_CARGO_DRONE',
    emergencyActionProtocol:
      'Activate sirens and downstream Police Station evacuation alarms; reroute supply convoys via high-ridge bypasses (e.g. NH-717A); deploy IAF Mi-17 heavy airlift.',
  },
]

export interface StateDisasterProfile {
  state: string
  primaryDisasterProfile: string
  frequentRoadCorridorsImpacted: string[]
  keyVulnerabilities: string[]
  recommendedApexDepot: string
}

export const STATE_DISASTER_PROFILES: Record<string, StateDisasterProfile> = {
  Assam: {
    state: 'Assam',
    primaryDisasterProfile: 'River Flooding, Bank Erosion, Urban Landslides',
    frequentRoadCorridorsImpacted: ['NH-27', 'NH-37', 'NH-15', 'Simen Chapari'],
    keyVulnerabilities: ['Submerged road beds', 'Cut-off railway lines', 'Dyke breaches (e.g. Bethukandi)'],
    recommendedApexDepot: 'Guwahati',
  },
  'Arunachal Pradesh': {
    state: 'Arunachal Pradesh',
    primaryDisasterProfile: 'Flash Floods, Cloudbursts, Deep-Gorge Landslides',
    frequentRoadCorridorsImpacted: ['NH-13 (Trans-Arunachal Highway)', 'NH-515', 'BCT Strategic Road'],
    keyVulnerabilities: ['Remote habitations cut off', 'Washed-away bridges', 'High altitude snowdrifts'],
    recommendedApexDepot: 'Guwahati',
  },
  Meghalaya: {
    state: 'Meghalaya',
    primaryDisasterProfile: 'High-Rainfall Slope Failure, Mudslides, Lightning',
    frequentRoadCorridorsImpacted: ['NH-6 (East Jaintia Hills, Shillong–Silchar)', 'NH-106', 'NH-206'],
    keyVulnerabilities: ['Heavy freight highway blocks to Mizoram/Tripura', 'Sonapur tunnel mud chokes'],
    recommendedApexDepot: 'Guwahati',
  },
  Nagaland: {
    state: 'Nagaland',
    primaryDisasterProfile: 'Mudslips, Sinking Highway Zones, Rockslides',
    frequentRoadCorridorsImpacted: ['NH-29 (Dimapur–Kohima–Chümoukedima)', 'NH-2'],
    keyVulnerabilities: ['Main lifeline for essential food/fuel transport', 'Phesama & Dzuvuru fractures'],
    recommendedApexDepot: 'Dimapur',
  },
  Manipur: {
    state: 'Manipur',
    primaryDisasterProfile: 'River Overflow, Highway Subsidence, Landslides',
    frequentRoadCorridorsImpacted: ['NH-37 (Imphal–Jiribam)', 'NH-2 (Imphal–Dimapur)'],
    keyVulnerabilities: ['Imphal valley cutoff requiring air-dropping relief', 'Tupul & Noney mudflows'],
    recommendedApexDepot: 'Silchar',
  },
  Mizoram: {
    state: 'Mizoram',
    primaryDisasterProfile: 'Cyclone/Storm Remnants, Slope Collapse',
    frequentRoadCorridorsImpacted: ['NH-306', 'NH-54 (Silchar–Aizawl)', 'NH-108A'],
    keyVulnerabilities: ['Structural landslides in urban valley settlements', 'Vairengte gateway blockage'],
    recommendedApexDepot: 'Silchar',
  },
  Tripura: {
    state: 'Tripura',
    primaryDisasterProfile: 'Flash Flooding, River Inundation (Howrah/Gomati)',
    frequentRoadCorridorsImpacted: ['NH-8 (Churaibari corridor)', 'NH-108'],
    keyVulnerabilities: ['Single highway bottleneck connectivity at Churaibari', 'Fuel tanker stranding'],
    recommendedApexDepot: 'Silchar',
  },
  Sikkim: {
    state: 'Sikkim',
    primaryDisasterProfile: 'GLOF, High-Gradient Landslides, Avalanche',
    frequentRoadCorridorsImpacted: ['NH-10 (Sevoke–Rangpo–Gangtok)', 'NH-717A (Pakyong Bypass)'],
    keyVulnerabilities: ['River-level highway vulnerable to surges', 'Teesta dam outburst washouts'],
    recommendedApexDepot: 'Siliguri',
  },
}

// Auto-detect optimal supply origin depot based on target coordinates
export function autoDetectOptimalSupplyOrigin(lat: number, lng: number): {
  depotId: string
  depotName: string
  state: string
  reason: string
} {
  // Sikkim / North Bengal region
  if (lng < 89.5 && lat > 26.5) {
    return {
      depotId: 'Siliguri',
      depotName: '🚂 Siliguri Corridor Rail Gateway (North Bengal)',
      state: 'Sikkim / North Bengal',
      reason: 'Closest strategic railhead and multi-modal logistics depot for Sikkim & Teesta Basin.',
    }
  }

  // Southern NER (Tripura, Mizoram, Barak Valley, Southern Manipur)
  if (lat < 25.0 && lng > 91.0 && lng < 93.8) {
    return {
      depotId: 'Silchar',
      depotName: '📦 Silchar Strategic Barak Valley Trans-Shipment Center',
      state: 'Assam (Barak Valley)',
      reason: 'Apex trans-shipment hub serving southern lifelines (NH-8 Tripura, NH-306 Mizoram, NH-37 Manipur).',
    }
  }

  // Eastern NER (Nagaland, Upper Manipur)
  if (lat >= 25.0 && lat <= 26.5 && lng > 93.5) {
    return {
      depotId: 'Dimapur',
      depotName: '🚆 Dimapur Freight Railhead & Trans-Shipment Hub',
      state: 'Nagaland',
      reason: 'Primary rail terminal and bulk fuel/grain stock facility for NH-29 & NH-2 corridors.',
    }
  }

  // Central / Western NER (Guwahati, Meghalaya, Arunachal, Brahmaputra Valley)
  return {
    depotId: 'Guwahati',
    depotName: '🏛️ Guwahati Multi-Modal Apex Hub (Assam Central)',
    state: 'Assam',
    reason: 'Central National Reserve & multi-modal transport apex with direct NH-27, NH-17, and airbase access.',
  }
}

export interface SupplyOriginDepot {
  id: string
  name: string
  regionType: 'PAN_INDIA_STRATEGIC' | 'NER_REGIONAL_CORE'
  state: string
  coordinates: [number, number]
  role: string
  transportModes: ('AIRLIFT_IAF' | 'STRATEGIC_RAIL' | 'NATIONAL_HIGHWAY' | 'PORT_MARITIME')[]
  specialtyStock: string
}

export const PAN_INDIA_SUPPLY_DEPOTS: SupplyOriginDepot[] = [
  // 1. Pan-India Strategic Origins (Airlift / Express Rail / Port into NER)
  {
    id: 'Delhi',
    name: '🏛️ Northern Hub: Delhi Central Medical & Oxygen Warehouse (National Reserve)',
    regionType: 'PAN_INDIA_STRATEGIC',
    state: 'Delhi NCR',
    coordinates: [28.6139, 77.2090],
    role: 'Apex National Disaster Reserve & Emergency Medical Stocks',
    transportModes: ['AIRLIFT_IAF', 'STRATEGIC_RAIL', 'NATIONAL_HIGHWAY'],
    specialtyStock: 'Critical Vaccines, Anti-Venom, 10,000+ Oxygen Cylinders, Trauma Kits',
  },
  {
    id: 'Nagpur',
    name: '🛡️ Central Railhead: Nagpur NDRF National Logistic Base',
    regionType: 'PAN_INDIA_STRATEGIC',
    state: 'Maharashtra',
    coordinates: [21.1458, 79.0882],
    role: 'Central Geolocation Quick-Response NDRF/SDRF Staging Base',
    transportModes: ['AIRLIFT_IAF', 'STRATEGIC_RAIL', 'NATIONAL_HIGHWAY'],
    specialtyStock: 'Heavy Hydraulic Excavators, Inflatable BAUT Boats, Collapsible Bailey Bridges',
  },
  {
    id: 'Kolkata',
    name: '⚓ Eastern Maritime & Rail Core: Kolkata Port & Dankuni Freight Complex',
    regionType: 'PAN_INDIA_STRATEGIC',
    state: 'West Bengal',
    coordinates: [22.5726, 88.3639],
    role: 'Primary Eastern Maritime Inflow & Siliguri Corridor Rail Staging',
    transportModes: ['PORT_MARITIME', 'STRATEGIC_RAIL', 'NATIONAL_HIGHWAY'],
    specialtyStock: 'Bulk Food Grains (FCI), POL Fuel Tankers, Water Purification Plants',
  },
  {
    id: 'Mumbai',
    name: '✈️ Western Core: Mumbai Pharma & Airfreight Terminal',
    regionType: 'PAN_INDIA_STRATEGIC',
    state: 'Maharashtra',
    coordinates: [19.0760, 72.8777],
    role: 'High-Value Pharmaceutical & Critical Bio-Supply Airbridge',
    transportModes: ['AIRLIFT_IAF', 'STRATEGIC_RAIL'],
    specialtyStock: 'Advanced Plasma Expanders, Surgical Intensive Care Equipment',
  },
  {
    id: 'Hyderabad',
    name: '💉 Southern Vaccine Hub: Hyderabad Cold-Chain & Bio-Logistics Core',
    regionType: 'PAN_INDIA_STRATEGIC',
    state: 'Telangana',
    coordinates: [17.3850, 78.4867],
    role: 'Global Vaccine & Biologics Dedicated Cold-Chain Pipeline',
    transportModes: ['AIRLIFT_IAF', 'STRATEGIC_RAIL'],
    specialtyStock: '2°C–8°C Cryo-Preserved Vaccine Vials, Insulin, Diagnostic PCR Units',
  },

  // 2. Strategic NER Regional Hubs
  {
    id: 'Guwahati',
    name: '🏛️ Guwahati Multi-Modal Apex Hub (Assam Central / Borjhar AFS)',
    regionType: 'NER_REGIONAL_CORE',
    state: 'Assam',
    coordinates: [26.1445, 91.7362],
    role: 'NER Gateway Depot & IAF Borjhar Forward Staging Base',
    transportModes: ['AIRLIFT_IAF', 'STRATEGIC_RAIL', 'NATIONAL_HIGHWAY'],
    specialtyStock: 'Full-Spectrum Emergency Food, Fuel, Medical & SDRF Deployable Fleet',
  },
  {
    id: 'Silchar',
    name: '📦 Silchar Strategic Barak Valley Trans-Shipment Center',
    regionType: 'NER_REGIONAL_CORE',
    state: 'Assam (Barak Valley)',
    coordinates: [24.8333, 92.7789],
    role: 'Barak Valley Lifeline Core for Tripura, Mizoram & S. Manipur',
    transportModes: ['NATIONAL_HIGHWAY', 'STRATEGIC_RAIL'],
    specialtyStock: 'Hill 4x4 Bolero Convoys, Boat Squadrons, Emergency Diesel Reserves',
  },
  {
    id: 'Dimapur',
    name: '🚆 Dimapur Freight Railhead & Trans-Shipment Hub',
    regionType: 'NER_REGIONAL_CORE',
    state: 'Nagaland',
    coordinates: [25.9044, 93.7279],
    role: 'Railhead Terminal supplying NH-29 Kohima-Imphal Lifeline',
    transportModes: ['STRATEGIC_RAIL', 'NATIONAL_HIGHWAY'],
    specialtyStock: 'Bulk Food Grain Reserves, Heavy Recovery Cranes',
  },
  {
    id: 'Siliguri',
    name: '🚂 Siliguri Corridor Rail Gateway (North Bengal / Chicken Neck)',
    regionType: 'NER_REGIONAL_CORE',
    state: 'West Bengal',
    coordinates: [26.7271, 88.3953],
    role: 'Gateway to Sikkim & Western NER via NH-10 & NH-27',
    transportModes: ['STRATEGIC_RAIL', 'NATIONAL_HIGHWAY'],
    specialtyStock: 'Sikkim Relief Convoys, High-Altitude Cold Climate Gear',
  },
]

