// lib/ner-disaster-history.ts
// ========================================================================
//    NERA: HISTORICAL DISASTER & CORRIDOR VULNERABILITY ARCHIVE (PAN-NER)
//    Ground-truth documentation of major terrain disruptions, flood breaches,
//    landslide fractures, and strategic highway lifelines across the 8 states.
// ========================================================================

export interface HistoricalDisasterRecord {
  id: string
  title: string
  yearMonth: string
  state: string
  affectedHighway: string
  disasterType: 'landslide' | 'flash_flood' | 'glof' | 'bridge_failure' | 'road_subsidence'
  coordinates: [number, number]
  severelyImpactedDistricts: string[]
  responsiblePoliceStation: string
  historicalImpactSummary: string
  mitigationAndReroutingStrategy: string
  vulnerabilityScore: number // 1 to 10
}

export const NER_HISTORICAL_DISASTER_RECORDS: HistoricalDisasterRecord[] = [
  {
    id: 'disaster-sikkim-glof-2023',
    title: 'South Lhonak Glacial Lake Outburst Flood (GLOF) & Teesta Valley Surge',
    yearMonth: '2023-10',
    state: 'Sikkim',
    affectedHighway: 'NH-10 (Sevoke-Rangpo-Gangtok Lifeline)',
    disasterType: 'glof',
    coordinates: [27.595, 88.645],
    severelyImpactedDistricts: ['Mangan', 'Gangtok', 'Pakyong', 'Namchi'],
    responsiblePoliceStation: 'Mangan Police Station & Rangpo PS',
    historicalImpactSummary: 'Catastrophic outburst from South Lhonak Lake destroyed the 1,200 MW Teesta-III Chungthang Dam and submerged multiple bridges along the Teesta River gorge. Wiped out substantial stretches of NH-10 at 20th Mile, Likhubir, and Bhalukhola, completely severing Gangtok road connectivity.',
    mitigationAndReroutingStrategy: 'Divert heavy logistics traffic via alternate Pakyong-Rorathang NH-717A bypass and deploy IAF Mi-17 heavy airlift to Mangan forward helipads.',
    vulnerabilityScore: 9.8,
  },
  {
    id: 'disaster-manipur-tupul-2022',
    title: 'Tupul Mountain Railway Yard & Ijai River Landslide',
    yearMonth: '2022-06',
    state: 'Manipur',
    affectedHighway: 'NH-37 (Imphal-Noney-Jiribam Lifeline)',
    disasterType: 'landslide',
    coordinates: [24.812, 93.621],
    severelyImpactedDistricts: ['Noney', 'Tamenglong', 'Imphal West'],
    responsiblePoliceStation: 'Noney Police Station',
    historicalImpactSummary: 'Continuous torrential rains triggered massive slope destabilization at Tupul railway yard, causing 61 fatalities, damming the Ijai River into an artificial reservoir, and depositing deep silt across the NH-37 mountain corridor.',
    mitigationAndReroutingStrategy: 'Primary diversion via NH-2 Mao Gate corridor with emergency Bailey bridge stabilization across Makru and Barak river tributaries.',
    vulnerabilityScore: 9.5,
  },
  {
    id: 'disaster-assam-dima-hasao-2022',
    title: 'Dima Hasao Hill Range Subsidence & Jatinga Fracture',
    yearMonth: '2022-05',
    state: 'Assam',
    affectedHighway: 'NH-27 (Lumding-Haflong-Harangajao Hill Section)',
    disasterType: 'landslide',
    coordinates: [25.172, 93.021],
    severelyImpactedDistricts: ['Dima Hasao', 'Cachar', 'Karbi Anglong'],
    responsiblePoliceStation: 'Haflong Sadar PS & Harangajao PS',
    historicalImpactSummary: 'Over 80 landslides across Dima Hasao completely isolated Haflong town for weeks, buried the New Haflong railway junction under mud, and broke NH-27 at Jatinga and Mahur, cutting the link between Brahmaputra and Barak valleys.',
    mitigationAndReroutingStrategy: 'Reroute critical medical convoys via NH-6 Meghalaya corridor (Jorabat-Shillong-Jowai-Silchar) while BRO deploys tracked earthmovers on Jatinga ridge.',
    vulnerabilityScore: 9.4,
  },
  {
    id: 'disaster-assam-silchar-flood-2022',
    title: 'Bethukandi Dyke Breach & Silchar Urban Submergence',
    yearMonth: '2022-06',
    state: 'Assam',
    affectedHighway: 'NH-37 / NH-306 (Barak Valley Network)',
    disasterType: 'flash_flood',
    coordinates: [24.833, 92.778],
    severelyImpactedDistricts: ['Cachar', 'Hailakandi', 'Karimganj'],
    responsiblePoliceStation: 'Silchar Sadar Police Station',
    historicalImpactSummary: 'Breach of the Bethukandi embankment on the Barak River submerged 90% of Silchar under 8 to 12 feet of water for nearly two weeks, isolating over 300,000 residents and paralyzing ground supply transit.',
    mitigationAndReroutingStrategy: 'Utilize Kumbhirgram Air Force Base for fixed-wing heavy supply drop-offs and deploy SDRF motorized inflatable boats for urban last-mile ferrying.',
    vulnerabilityScore: 9.2,
  },
  {
    id: 'disaster-meghalaya-sonapur-2026',
    title: 'Sonapur Tunnel Torrential Mudflow & Rock Choke',
    yearMonth: '2026-08',
    state: 'Meghalaya',
    affectedHighway: 'NH-6 (Jorabat-Shillong-Jowai-Silchar Corridor)',
    disasterType: 'landslide',
    coordinates: [25.168, 92.381],
    severelyImpactedDistricts: ['East Jaintia Hills', 'West Jaintia Hills', 'East Khasi Hills'],
    responsiblePoliceStation: 'Lumshnong Police Station',
    historicalImpactSummary: 'Repeated heavy monsoon mud cascades from high shale slopes immediately above the Sonapur Tunnel portal block hundreds of commercial fuel tankers and emergency supply trucks destined for Tripura, Mizoram, and Barak Valley.',
    mitigationAndReroutingStrategy: 'Active round-the-clock BRO excavator escorts, strict convoy staging at Lumshnong and Ratacherra checkposts, and dynamic alternate rerouting via NH-27 Haflong bypass when open.',
    vulnerabilityScore: 8.9,
  },
  {
    id: 'disaster-tripura-churaibari-2021',
    title: 'Churaibari Lifeline Border Siltation & Fuel Scarcity Crisis',
    yearMonth: '2021-07',
    state: 'Tripura',
    affectedHighway: 'NH-8 (Churaibari-Agartala Lifeline Highway)',
    disasterType: 'flash_flood',
    coordinates: [24.470, 92.245],
    severelyImpactedDistricts: ['North Tripura', 'Unakoti', 'West Tripura'],
    responsiblePoliceStation: 'Churaibari Border Police Station',
    historicalImpactSummary: 'Severe waterlogging and mud bogging on the single interstate highway entrance into Tripura at Churaibari stranded thousands of petroleum tankers, causing statewide fuel rationing in Agartala.',
    mitigationAndReroutingStrategy: 'Priority green-corridor police escort from Churaibari checkgate directly into Agartala depot with Roll-on/Roll-off (Ro-Ro) rail freight redundancy.',
    vulnerabilityScore: 8.7,
  },
  {
    id: 'disaster-arunachal-sela-frost',
    title: 'Sela Pass High-Altitude Blizzard & Snowdrift Avalanche',
    yearMonth: '2023-01',
    state: 'Arunachal Pradesh',
    affectedHighway: 'NH-13 / BCT Road (Balipara-Charduar-Tawang)',
    disasterType: 'road_subsidence',
    coordinates: [27.502, 92.103],
    severelyImpactedDistricts: ['Tawang', 'West Kameng'],
    responsiblePoliceStation: 'Tawang Sadar PS & Jang PS',
    historicalImpactSummary: 'Sub-zero temperatures and 6-foot heavy snowdrifts at Sela Pass (13,700 ft) historically caused severe multi-week winter cutoffs for civilian and military convoys traveling to Tawang forward sectors.',
    mitigationAndReroutingStrategy: 'Strategic routing through the newly inaugurated twin-tube all-weather Sela Tunnel bypass, avoiding the high-altitude avalanche hazard entirely.',
    vulnerabilityScore: 8.5,
  },
]

export function getDisasterHistoryForHighway(highwayNumber: string): HistoricalDisasterRecord[] {
  return NER_HISTORICAL_DISASTER_RECORDS.filter(r =>
    r.affectedHighway.toLowerCase().includes(highwayNumber.toLowerCase())
  )
}

