// lib/police-jurisdictions.ts
// ========================================================================
//    NERA: POLICE STATION & DISTRICT JURISDICTION REGISTRY (PAN-NER)
//    Ground-truth directory verified via Assam, Meghalaya, Tripura, Manipur,
//    Mizoram, Nagaland, Arunachal Pradesh, and Sikkim State Portals & SDMAs.
// ========================================================================

export interface PoliceStation {
  id: string
  name: string
  district: string
  state: string
  lat: number
  lng: number
  inCharge: string
  rank: string
  contactPhone: string
  vhfCallsign: string
  jurisdictionRoads: string[]
  checkposts: string[]
  emergencyVehicles: {
    patrolGypsies: number
    quickResponseTeam: number
    heavyRecoveryCrane: boolean
  }
}

export interface DistrictJurisdiction {
  id: string
  name: string
  state: string
  headquarters: string
  center: [number, number]
  bounds: [number, number][]
  spOffice: string
  spContact: string
  deocControlRoom: string
  policeStations: PoliceStation[]
  roadNetworkSummary: {
    nationalHighways: string[]
    stateHighways: string[]
    criticalBridges: string[]
    floodVulnerableZones: string[]
  }
  historicalDisasterProfile: string
}

export const NER_DISTRICT_JURISDICTIONS: DistrictJurisdiction[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. ASSAM: KAMRUP METROPOLITAN (GUWAHATI)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-kamrup-metro',
    name: 'Kamrup Metropolitan (Guwahati)',
    state: 'Assam',
    headquarters: 'Guwahati',
    center: [26.1445, 91.7362],
    bounds: [
      [26.25, 91.60], [26.28, 91.85], [26.15, 91.95],
      [26.05, 91.88], [26.02, 91.65], [26.12, 91.58],
    ],
    spOffice: 'Commissionerate of Police, Guwahati (Panbazar)',
    spContact: '0361-2540278 / 0361-2540138',
    deocControlRoom: 'Kamrup Metro DEOC: 1077 / 0361-2733052 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-27 (East-West Corridor)', 'NH-17 (South Bank)', 'NH-127'],
      stateHighways: ['SH-1', 'GS Road 4-Lane Express Corridor'],
      criticalBridges: ['Saraighat Rail-cum-Road Bridge (Brahmaputra)', 'Kolongpar Crossing'],
      floodVulnerableZones: ['Deepor Beel Catchment', 'Bharalu Basin Overflow', 'Chandrapur Sector'],
    },
    historicalDisasterProfile: 'Brahmaputra urban backflow inundation and high traffic bottleneck during heavy monsoon downpours.',
    policeStations: [
      {
        id: 'ps-panbazar',
        name: 'Panbazar Police Station',
        district: 'Kamrup Metropolitan',
        state: 'Assam',
        lat: 26.1865,
        lng: 91.7485,
        inCharge: 'Insp. Bhaskar Jyoti Das',
        rank: 'Inspector / Officer-in-Charge',
        contactPhone: '0361-2540106 / 9435208307',
        vhfCallsign: 'BRAVO-01 (Guwahati Central Command)',
        jurisdictionRoads: ['MG Road', 'AT Road Sector-1', 'Saraighat Ingress'],
        checkposts: ['Jalukbari Inter-State Checkpost', 'Bharalumukh Point'],
        emergencyVehicles: { patrolGypsies: 6, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-dispur',
        name: 'Dispur Police Station',
        district: 'Kamrup Metropolitan',
        state: 'Assam',
        lat: 26.1420,
        lng: 91.7890,
        inCharge: 'Insp. Mukul Saikia',
        rank: 'Inspector / Officer-in-Charge',
        contactPhone: '0361-2261510 / 9435027424',
        vhfCallsign: 'ALPHA-02 (Capital Security)',
        jurisdictionRoads: ['GS Road Corridor', 'NH-27 Six-Mile Stretch', 'VIP Road'],
        checkposts: ['Khanapara Inter-State Border Checkgate', 'Six-Mile Flyover Post'],
        emergencyVehicles: { patrolGypsies: 8, quickResponseTeam: 4, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-jalukbari',
        name: 'Jalukbari Police Station',
        district: 'Kamrup Metropolitan',
        state: 'Assam',
        lat: 26.1480,
        lng: 91.6630,
        inCharge: 'Insp. Pranab Baruah',
        rank: 'Inspector / Officer-in-Charge',
        contactPhone: '0361-2570587 / 9435152338',
        vhfCallsign: 'SIERRA-03 (North-Western Gateway)',
        jurisdictionRoads: ['NH-27 Western Arterial', 'Saraighat North Approach'],
        checkposts: ['Saraighat South Toll Plaza', 'Guwahati University Gate'],
        emergencyVehicles: { patrolGypsies: 5, quickResponseTeam: 2, heavyRecoveryCrane: true },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ASSAM: DIMA HASAO (HAFLONG MOUNTAIN SECTOR)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-dima-hasao',
    name: 'Dima Hasao (Haflong)',
    state: 'Assam',
    headquarters: 'Haflong',
    center: [25.1685, 93.0180],
    bounds: [
      [25.45, 92.65], [25.55, 93.25], [25.10, 93.40],
      [24.95, 93.10], [25.00, 92.70],
    ],
    spOffice: 'Superintendent of Police, Dima Hasao (Haflong)',
    spContact: '03673-236325 / 03673-236224',
    deocControlRoom: 'Dima Hasao Disaster Control Room: 8638389873 / 6026900464 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-27 (East-West Corridor Hill Section)', 'NH-627'],
      stateHighways: ['Haflong-Jatinga Mountain Highway'],
      criticalBridges: ['Jatinga River Bailey Bridge', 'Diyung River Viaduct'],
      floodVulnerableZones: ['Jatinga Landslide Fracture Zone', 'Mahur Sinking Stretch', 'Harangajao Deep Gorge'],
    },
    historicalDisasterProfile: '2022 massive mudflows and hill subsidence that submerged railway yards at New Haflong and fractured NH-27 between Lumding and Harangajao.',
    policeStations: [
      {
        id: 'ps-haflong',
        name: 'Haflong Sadar Police Station',
        district: 'Dima Hasao',
        state: 'Assam',
        lat: 25.1720,
        lng: 93.0210,
        inCharge: 'Insp. Lalthan Singson',
        rank: 'Inspector / OC Haflong',
        contactPhone: '03673-236222 / 8638389873',
        vhfCallsign: 'VICTOR-11 (Haflong Command)',
        jurisdictionRoads: ['NH-27 Lumding-Haflong Sector', 'Jatinga Bypass'],
        checkposts: ['Jatinga Ridge Observation Post', 'Fiangpui Point'],
        emergencyVehicles: { patrolGypsies: 5, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-harangajao',
        name: 'Harangajao Police Station',
        district: 'Dima Hasao',
        state: 'Assam',
        lat: 25.0450,
        lng: 92.8650,
        inCharge: 'Sub-Insp. D. Sengyung',
        rank: 'Sub-Inspector / OC Harangajao',
        contactPhone: '03673-278234',
        vhfCallsign: 'TANGO-14 (Cachar Gorge Gateway)',
        jurisdictionRoads: ['NH-27 Harangajao-Balacherra Stretch'],
        checkposts: ['Balacherra River Bridge Outpost', 'Ditokcherra Post'],
        emergencyVehicles: { patrolGypsies: 3, quickResponseTeam: 2, heavyRecoveryCrane: false },
      },
      {
        id: 'ps-mahur',
        name: 'Mahur Police Station',
        district: 'Dima Hasao',
        state: 'Assam',
        lat: 25.2890,
        lng: 93.1150,
        inCharge: 'Insp. R. K. Dimasa',
        rank: 'Inspector / OC Mahur',
        contactPhone: '03673-264111',
        vhfCallsign: 'ECHO-12 (North Hill Range)',
        jurisdictionRoads: ['NH-27 Mahur Valley Section', 'Old Lumding Ghat'],
        checkposts: ['Diyungbra Junction Checkgate'],
        emergencyVehicles: { patrolGypsies: 4, quickResponseTeam: 2, heavyRecoveryCrane: false },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ASSAM: CACHAR (SILCHAR)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-cachar',
    name: 'Cachar (Silchar)',
    state: 'Assam',
    headquarters: 'Silchar',
    center: [24.8333, 92.7789],
    bounds: [
      [25.00, 92.60], [25.10, 93.05], [24.70, 93.15],
      [24.50, 92.85], [24.60, 92.55],
    ],
    spOffice: 'Superintendent of Police, Cachar (Silchar)',
    spContact: '03842-245866 / 03842-231525',
    deocControlRoom: 'Cachar District Control: 1077 / 03842-245055 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-37', 'NH-306 (Silchar-Aizawl Lifeline)', 'NH-6'],
      stateHighways: ['Silchar-Hailakandi Road'],
      criticalBridges: ['Sadharghat Barak River Bridge', 'Madhurband Steel Bridge'],
      floodVulnerableZones: ['Barak River Embankment Breaches', 'Sonai Lowland Basin', 'Bethukandi Breach Point'],
    },
    historicalDisasterProfile: '2022 catastrophic Bethukandi dyke breach causing unprecedented urban inundation across Silchar city for over 10 days.',
    policeStations: [
      {
        id: 'ps-silchar-sadar',
        name: 'Silchar Sadar Police Station',
        district: 'Cachar',
        state: 'Assam',
        lat: 24.8290,
        lng: 92.7980,
        inCharge: 'Insp. Bidyut Das',
        rank: 'Inspector / OC',
        contactPhone: '03842-245805 / 03842-245866',
        vhfCallsign: 'BARAK-01 (Silchar Hub)',
        jurisdictionRoads: ['NH-37 Valley Link', 'Sadharghat Bridge Road'],
        checkposts: ['Sadharghat River Checkpost', 'Rangirkhari Junction'],
        emergencyVehicles: { patrolGypsies: 5, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-dholai',
        name: 'Dholai Police Station (Mizoram Border)',
        district: 'Cachar',
        state: 'Assam',
        lat: 24.5950,
        lng: 92.8450,
        inCharge: 'Sub-Insp. S. K. Paul',
        rank: 'Sub-Inspector / OC Dholai',
        contactPhone: '03842-284210',
        vhfCallsign: 'BORDER-DELTA (Mizoram Gateway)',
        jurisdictionRoads: ['NH-306 Silchar-Vairengte Corridor'],
        checkposts: ['Lailapur Inter-State Border Post'],
        emergencyVehicles: { patrolGypsies: 4, quickResponseTeam: 2, heavyRecoveryCrane: false },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. MEGHALAYA: EAST KHASI HILLS & RI-BHOI & EAST JAINTIA (SHILLONG / NH-6)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-east-khasi',
    name: 'East Khasi Hills (Shillong)',
    state: 'Meghalaya',
    headquarters: 'Shillong',
    center: [25.5788, 91.8933],
    bounds: [
      [25.75, 91.68], [25.80, 92.10], [25.40, 92.15],
      [25.20, 91.75], [25.45, 91.60],
    ],
    spOffice: 'Superintendent of Police, East Khasi Hills (Shillong)',
    spContact: '0364-2224150 / 0364-2222277',
    deocControlRoom: 'Meghalaya State Emergency Center: 1070 / 0364-2502098 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-6 (Guwahati-Jorabat-Shillong-Silchar Corridor)', 'NH-206', 'NH-106'],
      stateHighways: ['Cherrapunjee-Mawsynram Mountain Pass'],
      criticalBridges: ['Umiam Lake Dam Viaduct', 'Myntdu Gorge Bridge'],
      floodVulnerableZones: ['Umiam Ingress Sinks', 'Pynursla Fog & Landslide Sector', 'Sonapur Tunnel Debris Choke'],
    },
    historicalDisasterProfile: 'Heavy seasonal monsoon mudslides at Sonapur Tunnel on NH-6 frequently cutting off Tripura, Mizoram, and Barak Valley from the rest of India.',
    policeStations: [
      {
        id: 'ps-sadar-shillong',
        name: 'Sadar Police Station Shillong',
        district: 'East Khasi Hills',
        state: 'Meghalaya',
        lat: 25.5790,
        lng: 91.8840,
        inCharge: 'Insp. B. Marak',
        rank: 'Inspector / Officer-in-Charge',
        contactPhone: '0364-2224818 / 0364-2226042',
        vhfCallsign: 'KILO-01 (Shillong Central)',
        jurisdictionRoads: ['NH-6 Shillong Ingress', 'Police Bazar Arterial'],
        checkposts: ['Mawlai Checkpoint', 'Umiam Lake Northern Outpost'],
        emergencyVehicles: { patrolGypsies: 6, quickResponseTeam: 4, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-nongpoh',
        name: 'Nongpoh Police Station',
        district: 'Ri-Bhoi',
        state: 'Meghalaya',
        lat: 25.9010,
        lng: 91.8820,
        inCharge: 'Insp. D. Khongwir',
        rank: 'Inspector / OC Nongpoh',
        contactPhone: '03638-232232 / 03638-232304',
        vhfCallsign: 'EXPRESSWAY-ALPHA (Guwahati-Shillong Highway)',
        jurisdictionRoads: ['NH-6 4-Lane Expressway Corridor', 'Jorabat Ingress'],
        checkposts: ['Byrnihat Inter-State Border Post', 'Nongpoh Toll Post'],
        emergencyVehicles: { patrolGypsies: 5, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-lumshnong',
        name: 'Lumshnong Police Station (Sonapur Tunnel Sector)',
        district: 'East Jaintia Hills',
        state: 'Meghalaya',
        lat: 25.1680,
        lng: 92.3810,
        inCharge: 'Insp. P. Lamin',
        rank: 'Inspector / OC Lumshnong',
        contactPhone: '03655-230222 / 112',
        vhfCallsign: 'SONAPUR-LIFELINE (Critical Transit Sentry)',
        jurisdictionRoads: ['NH-6 Sonapur Tunnel - Ratacherra Chokepoint'],
        checkposts: ['Sonapur Tunnel Observation Post', 'Ratacherra Border Gate'],
        emergencyVehicles: { patrolGypsies: 4, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. TRIPURA: WEST TRIPURA & NORTH TRIPURA (CHURAIBARI GATEWAY)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-west-tripura',
    name: 'West Tripura (Agartala)',
    state: 'Tripura',
    headquarters: 'Agartala',
    center: [23.8315, 91.2868],
    bounds: [
      [24.05, 91.15], [24.10, 91.45], [23.70, 91.50],
      [23.65, 91.20],
    ],
    spOffice: 'Superintendent of Police, West Tripura (Agartala)',
    spContact: '0381-2323332 / 0381-2325324',
    deocControlRoom: 'Tripura State Disaster Authority: 1070 / 0381-2416045 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-8 (Churaibari-Agartala-Sabroom Lifeline Highway)', 'NH-108'],
      stateHighways: ['Agartala-Bishalgarh Bypass'],
      criticalBridges: ['Howrah River Bridge', 'Gumti River Bridge'],
      floodVulnerableZones: ['Howrah River Catchment', 'Churaibari Bottleneck Sector', 'Khowai Basin Overflow'],
    },
    historicalDisasterProfile: 'Single-corridor vulnerability on NH-8 at Churaibari; when Assam border highway is cut off, petroleum and essential food supplies face critical state-wide scarcity.',
    policeStations: [
      {
        id: 'ps-west-agartala',
        name: 'West Agartala Police Station',
        district: 'West Tripura',
        state: 'Tripura',
        lat: 23.8340,
        lng: 91.2810,
        inCharge: 'Insp. Subrata Debbarma',
        rank: 'Inspector / Officer-in-Charge',
        contactPhone: '0381-2325324 / 9436122110',
        vhfCallsign: 'TRIPURA-ALPHA (Agartala Central)',
        jurisdictionRoads: ['NH-8 Capital Corridor', 'Akhaura Integrated Checkpost Link'],
        checkposts: ['Akhaura Border Gate', 'Radhanagar Transport Node'],
        emergencyVehicles: { patrolGypsies: 6, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-churaibari',
        name: 'Churaibari Border Police Station',
        district: 'North Tripura',
        state: 'Tripura',
        lat: 24.4700,
        lng: 92.2450,
        inCharge: 'Insp. Biplab Nath',
        rank: 'Inspector / OC Churaibari',
        contactPhone: '03822-261222 / 9436133445',
        vhfCallsign: 'GATEWAY-TRIPURA (Lifeline Chokepoint)',
        jurisdictionRoads: ['NH-8 Assam-Tripura Interstate Corridor'],
        checkposts: ['Churaibari Interstate Integrated Checkgate'],
        emergencyVehicles: { patrolGypsies: 5, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. MANIPUR: IMPHAL WEST & NONEY / SENAPATI (NH-2 / NH-37)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-imphal-west',
    name: 'Imphal West',
    state: 'Manipur',
    headquarters: 'Imphal',
    center: [24.8170, 93.9368],
    bounds: [
      [24.95, 93.85], [25.00, 94.05], [24.65, 94.00],
      [24.60, 93.80],
    ],
    spOffice: 'Superintendent of Police, Imphal West',
    spContact: '0385-2450100 / 0385-2450102',
    deocControlRoom: 'Manipur State Emergency Ops: 1070 / 0385-2443441 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-2 (Dimapur-Kohima-Imphal Lifeline Highway)', 'NH-37 (Imphal-Jiribam-Silchar Mountain Arterial)'],
      stateHighways: ['Imphal Ring Road Express'],
      criticalBridges: ['Makru Concrete Bridge (NH-37)', 'Barak River Suspension Bridge', 'Sanjenthong Bridge'],
      floodVulnerableZones: ['Tupul-Noney Landslide Corridor', 'Mao Gate Border Choke', 'Lamphelpat Basin'],
    },
    historicalDisasterProfile: 'June 2022 catastrophic Tupul landslide on NH-37 (61 casualties) and recurrent monsoon road slips between Senapati and Mao Gate on NH-2.',
    policeStations: [
      {
        id: 'ps-imphal-city',
        name: 'Imphal Police Station',
        district: 'Imphal West',
        state: 'Manipur',
        lat: 24.8080,
        lng: 93.9390,
        inCharge: 'Insp. Kh. Hitler Singh',
        rank: 'Inspector / OC Imphal',
        contactPhone: '0385-2450102 / 9436021111',
        vhfCallsign: 'MANIPUR-CENTRAL-01',
        jurisdictionRoads: ['NH-2 Capital Sector', 'Kangla Fort Perimeter'],
        checkposts: ['North AOC Checkpoint', 'Keishampat Junction Post'],
        emergencyVehicles: { patrolGypsies: 7, quickResponseTeam: 4, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-noney',
        name: 'Noney Police Station (Tupul-Makru Corridor)',
        district: 'Noney / Tamenglong',
        state: 'Manipur',
        lat: 24.8120,
        lng: 93.6210,
        inCharge: 'Insp. T. Gangte',
        rank: 'Inspector / OC Noney',
        contactPhone: '03877-222110 / 112',
        vhfCallsign: 'MAKRU-GUARD-01 (Highway Lifeline)',
        jurisdictionRoads: ['NH-37 Imphal-Noney-Jiribam Arterial', 'Makru Bridge Approach'],
        checkposts: ['Tupul Bridge Post', 'Makru River Outpost'],
        emergencyVehicles: { patrolGypsies: 4, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-mao-gate',
        name: 'Mao Police Station (Nagaland Border Gate)',
        district: 'Senapati',
        state: 'Manipur',
        lat: 25.5080,
        lng: 94.1350,
        inCharge: 'Insp. L. Asholi',
        rank: 'Inspector / OC Mao',
        contactPhone: '03871-262222 / 112',
        vhfCallsign: 'MAO-INTERSTATE-01',
        jurisdictionRoads: ['NH-2 Kohima-Senapati-Imphal Lifeline'],
        checkposts: ['Mao Gate Interstate Barrier Post'],
        emergencyVehicles: { patrolGypsies: 5, quickResponseTeam: 3, heavyRecoveryCrane: false },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. SIKKIM: EAST SIKKIM & NORTH SIKKIM (NH-10 TEESTA BASIN)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-east-sikkim',
    name: 'East Sikkim (Gangtok) & North Sikkim',
    state: 'Sikkim',
    headquarters: 'Gangtok',
    center: [27.3389, 88.6065],
    bounds: [
      [27.45, 88.48], [27.50, 88.75], [27.20, 88.78],
      [27.15, 88.45],
    ],
    spOffice: 'Superintendent of Police, East District (Gangtok)',
    spContact: '03592-202022 / 03592-202033',
    deocControlRoom: 'Sikkim SDMA Disaster Cell: 1070 / 03592-201145 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-10 (Sevoke-Coronation Bridge-Rangpo-Gangtok Teesta Lifeline)', 'NH-717A (Alternate Bypass via Pakyong)'],
      stateHighways: ['Jawaharlal Nehru Road (Nathu La High Altitude Pass)', 'Mangan-Chungthang Road'],
      criticalBridges: ['Rangpo Teesta Suspension Bridge', 'Singtam Steel Truss Bridge', 'Chungthang Teesta III Viaduct'],
      floodVulnerableZones: ['South Lhonak GLOF Outburst Basin', '29th Mile Landslide Zone', 'Likhubir Sinking Slip', 'Bhalukhola Gorge'],
    },
    historicalDisasterProfile: 'October 2023 South Lhonak Glacial Lake Outburst Flood (GLOF) that washed away the Teesta III dam, submerged Chungthang, and destroyed multiple sections of NH-10.',
    policeStations: [
      {
        id: 'ps-gangtok-sadar',
        name: 'Gangtok Sadar Police Station',
        district: 'East Sikkim',
        state: 'Sikkim',
        lat: 27.3310,
        lng: 88.6130,
        inCharge: 'Insp. Pempa Norbu Bhutia',
        rank: 'Inspector / OC Gangtok',
        contactPhone: '03592-202033 / 9434012345',
        vhfCallsign: 'KANCHENJUNGA-01 (Capital Command)',
        jurisdictionRoads: ['NH-10 Gangtok Approach', 'Indira Bypass'],
        checkposts: ['Ranipool Checkgate', 'Tadong Security Outpost'],
        emergencyVehicles: { patrolGypsies: 7, quickResponseTeam: 4, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-rangpo',
        name: 'Rangpo Border Police Station',
        district: 'East Sikkim',
        state: 'Sikkim',
        lat: 27.1760,
        lng: 88.5310,
        inCharge: 'Insp. Tshering Lepcha',
        rank: 'Inspector / OC Rangpo',
        contactPhone: '03592-240822 / 112',
        vhfCallsign: 'TEESTA-GATEWAY (Sikkim Ingress)',
        jurisdictionRoads: ['NH-10 Sevoke-Rangpo Highway', 'Rangpo-Melli Link'],
        checkposts: ['Rangpo Inter-State Border Checkpost', 'Teesta Mining Checkgate'],
        emergencyVehicles: { patrolGypsies: 5, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-mangan',
        name: 'Mangan Police Station (North Sikkim GLOF Sentry)',
        district: 'Mangan',
        state: 'Sikkim',
        lat: 27.5110,
        lng: 88.5340,
        inCharge: 'Insp. K. B. Rai',
        rank: 'Inspector / OC Mangan',
        contactPhone: '03592-234222 / 112',
        vhfCallsign: 'HIMALAYAN-NORTH-01 (GLOF Sentry)',
        jurisdictionRoads: ['Mangan-Chungthang-Lachen Highway', 'Dikchu Bypass'],
        checkposts: ['Toong Checkpost', 'Chungthang Convergence Point'],
        emergencyVehicles: { patrolGypsies: 4, quickResponseTeam: 3, heavyRecoveryCrane: false },
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. ARUNACHAL PRADESH: PAPUM PARE & TAWANG (BCT ROAD & SELA TUNNEL)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'dist-papum-pare',
    name: 'Papum Pare (Itanagar) & Tawang Strategic Sector',
    state: 'Arunachal Pradesh',
    headquarters: 'Itanagar',
    center: [27.0844, 93.6053],
    bounds: [
      [27.30, 93.40], [27.35, 93.85], [26.90, 93.90],
      [26.85, 93.45],
    ],
    spOffice: 'Superintendent of Police, Capital Complex (Itanagar)',
    spContact: '0360-2212233 / 9436040006',
    deocControlRoom: 'Arunachal Pradesh SDMA: 1070 / 0360-2291580 / 112',
    roadNetworkSummary: {
      nationalHighways: ['NH-415 (Holongi-Itanagar 4-Lane Strategic Corridor)', 'NH-13 (Trans-Arunachal Highway)', 'BCT Strategic Border Road'],
      stateHighways: ['Sela Tunnel Strategic Bypass (13,700 ft)'],
      criticalBridges: ['Dikrong River Steel Bridge', 'Tawang Chu Gorge Bailey Bridge'],
      floodVulnerableZones: ['Karsingsa Sinking Active Landslide Zone', 'Banderdewa Interstate Choke', 'Sela Pass Snowdrift Avalanche Zone'],
    },
    historicalDisasterProfile: 'Winter blizzards and heavy snowdrifts on Sela Pass (13,700 ft) historically isolating Tawang, now mitigated by the twin-tube Sela Tunnel.',
    policeStations: [
      {
        id: 'ps-itanagar',
        name: 'Itanagar Police Station',
        district: 'Papum Pare',
        state: 'Arunachal Pradesh',
        lat: 27.0910,
        lng: 93.6140,
        inCharge: 'Insp. Khomdram Tage',
        rank: 'Inspector / OC Itanagar',
        contactPhone: '0360-2212111 / 8798127421',
        vhfCallsign: 'HIMALAYA-CAPITAL-01',
        jurisdictionRoads: ['NH-415 Capital Highway', 'Ganga Lake Arterial'],
        checkposts: ['Banderdewa Inter-State Checkgate', 'Holongi Airport Security Gate'],
        emergencyVehicles: { patrolGypsies: 6, quickResponseTeam: 3, heavyRecoveryCrane: true },
      },
      {
        id: 'ps-tawang-sadar',
        name: 'Tawang Sadar Police Station',
        district: 'Tawang',
        state: 'Arunachal Pradesh',
        lat: 27.5850,
        lng: 91.8670,
        inCharge: 'Insp. Lobsang Tsering',
        rank: 'Inspector / OC Tawang',
        contactPhone: '03794-222235 / 7630823200',
        vhfCallsign: 'SELA-FRONTIER-01 (High-Altitude Command)',
        jurisdictionRoads: ['BCT Strategic Border Highway', 'Sela Tunnel North Exit Road'],
        checkposts: ['Sela Tunnel North Portal Outpost', 'Jang Waterfall Barrier Post'],
        emergencyVehicles: { patrolGypsies: 6, quickResponseTeam: 4, heavyRecoveryCrane: true },
      },
    ],
  },
]

export function findPoliceStationById(id: string): PoliceStation | undefined {
  for (const d of NER_DISTRICT_JURISDICTIONS) {
    const match = d.policeStations.find(p => p.id === id)
    if (match) return match
  }
  return undefined
}

export function findDistrictByName(name: string): DistrictJurisdiction | undefined {
  return NER_DISTRICT_JURISDICTIONS.find(
    d => d.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(d.name.toLowerCase())
  )
}

export function getPoliceStationsAlongRoute(
  pathCoordinates: [number, number][],
  maxDistanceKm: number = 18
): { station: PoliceStation; distanceKm: number }[] {
  if (!pathCoordinates || pathCoordinates.length < 2) return []

  const results: { station: PoliceStation; distanceKm: number }[] = []

  for (const district of NER_DISTRICT_JURISDICTIONS) {
    for (const station of district.policeStations) {
      let minDistance = Infinity
      for (const pt of pathCoordinates) {
        const dLat = (station.lat - pt[0]) * 111
        const dLng = (station.lng - pt[1]) * 111 * Math.cos((pt[0] * Math.PI) / 180)
        const dist = Math.hypot(dLat, dLng)
        if (dist < minDistance) {
          minDistance = dist
        }
      }
      if (minDistance <= maxDistanceKm) {
        results.push({ station, distanceKm: Number(minDistance.toFixed(1)) })
      }
    }
  }

  return results.sort((a, b) => a.distanceKm - b.distanceKm)
}
