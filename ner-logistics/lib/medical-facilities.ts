// lib/medical-facilities.ts
// ========================================================================
//    NERA: REGIONAL APEX MEDICAL & TRAUMA FACILITIES REGISTRY (PAN-NER)
//    Official trauma centers, emergency casualty desks, blood banks,
//    and advanced ICU hubs across all 8 North Eastern States.
// ========================================================================

export interface MedicalFacility {
  id: string
  name: string
  district: string
  state: string
  type: 'apex_institute' | 'medical_college' | 'district_hospital' | 'military_base_hospital'
  lat: number
  lng: number
  emergencyCasualtyPhone: string
  ambulanceHelpline: string
  bloodBankContact: string
  traumaLevel: 'LEVEL_1_APEX' | 'LEVEL_2_REGIONAL' | 'LEVEL_3_DISTRICT'
  totalBeds: number
  icuBedsAvailable: number
  helipadOnSite: boolean
  oxygenPlantCapacityLPM: number
  specialties: string[]
}

export const NER_MEDICAL_FACILITIES: MedicalFacility[] = [
  // ── ASSAM ──
  {
    id: 'hosp-aiims-guwahati',
    name: 'AIIMS Guwahati (All India Institute of Medical Sciences)',
    district: 'Kamrup Rural / Metro',
    state: 'Assam',
    type: 'apex_institute',
    lat: 26.2415,
    lng: 91.6840,
    emergencyCasualtyPhone: '0361-2800630 (24 Hrs Emergency)',
    ambulanceHelpline: '108 / 112',
    bloodBankContact: '0361-2800645',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 750,
    icuBedsAvailable: 85,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 2500,
    specialties: ['Level-1 Polytrauma', 'Neurosurgery', 'Critical Care', 'Disaster Triage Unit'],
  },
  {
    id: 'hosp-gmch-guwahati',
    name: 'Gauhati Medical College & Hospital (GMCH)',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    type: 'medical_college',
    lat: 26.1565,
    lng: 91.7720,
    emergencyCasualtyPhone: '0361-2263444 / 08638740135',
    ambulanceHelpline: '108 / 102',
    bloodBankContact: '0361-2130248',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 1800,
    icuBedsAvailable: 140,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 4000,
    specialties: ['Comprehensive Trauma', 'Burn Unit', 'Cardiothoracic Surgery', 'Epidemic Isolation'],
  },
  {
    id: 'hosp-smch-silchar',
    name: 'Silchar Medical College & Hospital (SMCH)',
    district: 'Cachar',
    state: 'Assam',
    type: 'medical_college',
    lat: 24.7890,
    lng: 92.7950,
    emergencyCasualtyPhone: '03842-240033 / 03842-240044',
    ambulanceHelpline: '108',
    bloodBankContact: '03842-240055',
    traumaLevel: 'LEVEL_2_REGIONAL',
    totalBeds: 900,
    icuBedsAvailable: 50,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 1500,
    specialties: ['Barak Valley Trauma Hub', 'Orthopedic Surgery', 'Neonatal ICU'],
  },
  {
    id: 'hosp-amch-dibrugarh',
    name: 'Assam Medical College & Hospital (AMCH)',
    district: 'Dibrugarh',
    state: 'Assam',
    type: 'medical_college',
    lat: 27.4680,
    lng: 94.9210,
    emergencyCasualtyPhone: '0373-2300080 / 0373-2300627',
    ambulanceHelpline: '108',
    bloodBankContact: '0373-2302300',
    traumaLevel: 'LEVEL_2_REGIONAL',
    totalBeds: 1200,
    icuBedsAvailable: 70,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 2200,
    specialties: ['Upper Assam Apex', 'Toxicology & Anti-Venom Center', 'Plastic Surgery'],
  },

  // ── MEGHALAYA ──
  {
    id: 'hosp-neigrihms-shillong',
    name: 'NEIGRIHMS (North Eastern Indira Gandhi Regional Institute)',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    type: 'apex_institute',
    lat: 25.5920,
    lng: 91.9380,
    emergencyCasualtyPhone: '0364-2538014 (24-Hour Casualty)',
    ambulanceHelpline: '108 / 112',
    bloodBankContact: '0364-2538025',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 600,
    icuBedsAvailable: 60,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 2000,
    specialties: ['Super-Specialty Trauma', 'Cardiology', 'Neurology', 'High-Altitude Hypoxia Care'],
  },
  {
    id: 'hosp-shillong-civil',
    name: 'Shillong Civil Hospital',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    type: 'district_hospital',
    lat: 25.5710,
    lng: 91.8790,
    emergencyCasualtyPhone: '0364-2224100 / 0364-2224001',
    ambulanceHelpline: '108',
    bloodBankContact: '0364-2224500',
    traumaLevel: 'LEVEL_2_REGIONAL',
    totalBeds: 400,
    icuBedsAvailable: 25,
    helipadOnSite: false,
    oxygenPlantCapacityLPM: 800,
    specialties: ['Emergency Triage', 'General Surgery', 'Orthopedic Stabilization'],
  },

  // ── TRIPURA ──
  {
    id: 'hosp-agmc-agartala',
    name: 'AGMC & Govind Ballabh Pant (GBP) Hospital',
    district: 'West Tripura',
    state: 'Tripura',
    type: 'medical_college',
    lat: 23.8580,
    lng: 91.2910,
    emergencyCasualtyPhone: '0381-2355069 / 0381-2356701',
    ambulanceHelpline: '102 / 108',
    bloodBankContact: '0381-2355075',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 1100,
    icuBedsAvailable: 75,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 1800,
    specialties: ['Tripura Apex Polytrauma', 'Dialysis Center', 'Burn ICU', 'Infectious Disease'],
  },

  // ── MANIPUR ──
  {
    id: 'hosp-rims-imphal',
    name: 'Regional Institute of Medical Sciences (RIMS)',
    district: 'Imphal West',
    state: 'Manipur',
    type: 'apex_institute',
    lat: 24.8190,
    lng: 93.9180,
    emergencyCasualtyPhone: '0385-2414539 / 0385-2414629',
    ambulanceHelpline: '108 / 112',
    bloodBankContact: '0385-2414700',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 1074,
    icuBedsAvailable: 80,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 2100,
    specialties: ['Regional Emergency Trauma', 'Neurosurgery', 'Critical Resuscitation'],
  },
  {
    id: 'hosp-jnims-imphal',
    name: 'JNIMS Hospital (Jawaharlal Nehru Institute)',
    district: 'Imphal East',
    state: 'Manipur',
    type: 'medical_college',
    lat: 24.7950,
    lng: 93.9550,
    emergencyCasualtyPhone: '0385-2443144',
    ambulanceHelpline: '108',
    bloodBankContact: '0385-2443150',
    traumaLevel: 'LEVEL_2_REGIONAL',
    totalBeds: 600,
    icuBedsAvailable: 40,
    helipadOnSite: false,
    oxygenPlantCapacityLPM: 1000,
    specialties: ['General Trauma', 'Orthopedic Surgery', 'Blood Component Transfusion'],
  },

  // ── SIKKIM ──
  {
    id: 'hosp-stnm-gangtok',
    name: 'STNM Central Referral Hospital (Sir Thutob Namgyal Memorial)',
    district: 'East Sikkim',
    state: 'Sikkim',
    type: 'apex_institute',
    lat: 27.3210,
    lng: 88.5990,
    emergencyCasualtyPhone: '+91 80018 03255 / +91 62969 15750',
    ambulanceHelpline: '108 / 112',
    bloodBankContact: '03592-202944',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 1000,
    icuBedsAvailable: 65,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 1600,
    specialties: ['High-Altitude Trauma', 'Hypothermia Resuscitation', 'Orthopedic Critical Care'],
  },

  // ── ARUNACHAL PRADESH ──
  {
    id: 'hosp-trihms-itanagar',
    name: 'TRIHMS (Tomo Riba Institute of Health & Medical Sciences)',
    district: 'Papum Pare',
    state: 'Arunachal Pradesh',
    type: 'medical_college',
    lat: 27.1050,
    lng: 93.6920,
    emergencyCasualtyPhone: '6909936141 / 9862709467 / 9436229900',
    ambulanceHelpline: '108 / 112',
    bloodBankContact: '0360-2244200',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 500,
    icuBedsAvailable: 45,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 1200,
    specialties: ['Arunachal State Trauma Center', 'Emergency Neurosurgery', 'Disaster Casualty Ward'],
  },
  {
    id: 'hosp-tawang-civil',
    name: 'Tawang District Civil & Military Referral Hospital',
    district: 'Tawang',
    state: 'Arunachal Pradesh',
    type: 'district_hospital',
    lat: 27.5890,
    lng: 91.8620,
    emergencyCasualtyPhone: '03794-222214 / 112',
    ambulanceHelpline: '108',
    bloodBankContact: '03794-222220',
    traumaLevel: 'LEVEL_2_REGIONAL',
    totalBeds: 150,
    icuBedsAvailable: 15,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 500,
    specialties: ['Frostbite & High-Altitude Illness', 'Emergency Shock Triage', 'Military Joint Trauma'],
  },

  // ── MIZORAM ──
  {
    id: 'hosp-zmc-aizawl',
    name: 'Zoram Medical College & Hospital (ZMC Falkawn)',
    district: 'Aizawl',
    state: 'Mizoram',
    type: 'medical_college',
    lat: 23.6520,
    lng: 92.7080,
    emergencyCasualtyPhone: '0389-2374020 / 0389-2374021',
    ambulanceHelpline: '108 / 112',
    bloodBankContact: '0389-2374035',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 500,
    icuBedsAvailable: 35,
    helipadOnSite: true,
    oxygenPlantCapacityLPM: 1000,
    specialties: ['Mizoram State Trauma Hub', 'Critical Care', 'Anti-Venom & Toxicology'],
  },

  // ── NAGALAND ──
  {
    id: 'hosp-nhak-kohima',
    name: 'Naga Hospital Authority Kohima (NHAK)',
    district: 'Kohima',
    state: 'Nagaland',
    type: 'medical_college',
    lat: 25.6680,
    lng: 94.1020,
    emergencyCasualtyPhone: '0370-2244450 / 0370-2222916',
    ambulanceHelpline: '108 / 112',
    bloodBankContact: '0370-2244460',
    traumaLevel: 'LEVEL_1_APEX',
    totalBeds: 350,
    icuBedsAvailable: 28,
    helipadOnSite: false,
    oxygenPlantCapacityLPM: 750,
    specialties: ['Nagaland Trauma Referral', 'Emergency Surgery', 'Blood Transfusion Center'],
  },
]

export function findClosestMedicalFacility(lat: number, lng: number): MedicalFacility {
  let closest = NER_MEDICAL_FACILITIES[0]
  let minDist = Infinity

  for (const m of NER_MEDICAL_FACILITIES) {
    const d = Math.hypot(m.lat - lat, m.lng - lng)
    if (d < minDist) {
      minDist = d
      closest = m
    }
  }

  return closest
}
