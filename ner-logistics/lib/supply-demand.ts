// lib/supply-demand.ts
// ========================================================================
//    NERA PHASE 18: REGIONAL SUPPLY-DEMAND & INVENTORY MANAGEMENT
// ========================================================================

export type CommodityType =
  | 'MEDICINES'
  | 'FOOD'
  | 'DRINKING_WATER'
  | 'FUEL'
  | 'CONSTRUCTION_MATERIAL'
  | 'EMERGENCY_EQUIPMENT'

export type InventoryStatus = 'AVAILABLE' | 'RESERVED' | 'IN_TRANSIT' | 'DELIVERED'

export type DistrictSupplyStatusLevel =
  | 'ADEQUATE'
  | 'LOW'
  | 'CRITICAL'
  | 'DEPLETED'
  | 'DATA_INSUFFICIENT'

export interface CommodityStock {
  commodityType: CommodityType
  unit: string
  availableQuantity: number
  reservedQuantity: number
  inTransitQuantity?: number
  deliveredQuantity?: number
  minimumReserveThreshold: number
  dailyDemandEstimate?: number
  status: DistrictSupplyStatusLevel
  isSimulated: boolean
}

export interface DistrictLogisticsProfile {
  districtName: string
  state: string
  coordinates: [number, number]
  population?: number
  isPopulationEstimated?: boolean
  commodities: Record<CommodityType, CommodityStock>
  lastUpdated: string
  isSimulated: boolean
}

export interface DepotInventory {
  depotId: string
  name: string
  state: string
  coordinates: [number, number]
  commodities: Record<CommodityType, {
    available: number
    reserved: number
    inTransit: number
    unit: string
  }>
  capacityTons: number
  lastAudit: string
  isVerified: boolean
  isSimulated: boolean
}

export interface SupplyShortageAssessment {
  districtName: string
  commodityType: CommodityType
  status: DistrictSupplyStatusLevel
  daysOfCover: number | null
  currentReserve: number
  estimatedDailyDemand: number | null
  shortageGapQuantity: number
  urgencyClass: 'IMMEDIATE' | 'HIGH' | 'MODERATE' | 'MONITOR' | 'UNKNOWN'
  recommendedReplenishment: number
  requiresHumanReview: boolean
  isSimulated: boolean
  notes: string
}

// ── Controlled Strategic Depots Across Pan-NER (Verified Base Data) ──
export const DEMO_DEPOT_INVENTORIES: Record<string, DepotInventory> = {
  'DEPOT-GHY-01': {
    depotId: 'DEPOT-GHY-01',
    name: 'Guwahati Multi-Modal Apex Logistics Hub',
    state: 'Assam',
    coordinates: [26.1445, 91.7362],
    commodities: {
      MEDICINES: { available: 12500, reserved: 1200, inTransit: 800, unit: 'kits' },
      FOOD: { available: 45000, reserved: 4000, inTransit: 2500, unit: 'rations' },
      DRINKING_WATER: { available: 60000, reserved: 5000, inTransit: 3000, unit: 'litres' },
      FUEL: { available: 85000, reserved: 10000, inTransit: 5000, unit: 'litres' },
      CONSTRUCTION_MATERIAL: { available: 500, reserved: 50, inTransit: 20, unit: 'tons' },
      EMERGENCY_EQUIPMENT: { available: 350, reserved: 25, inTransit: 10, unit: 'sets' },
    },
    capacityTons: 5000,
    lastAudit: '2026-08-28T18:00:00Z',
    isVerified: true,
    isSimulated: true,
  },
  'DEPOT-SIL-02': {
    depotId: 'DEPOT-SIL-02',
    name: 'Siliguri Corridor Rail Logistics Gateway',
    state: 'West Bengal / Gateway',
    coordinates: [26.7271, 88.3953],
    commodities: {
      MEDICINES: { available: 8000, reserved: 500, inTransit: 0, unit: 'kits' },
      FOOD: { available: 32000, reserved: 2000, inTransit: 1000, unit: 'rations' },
      DRINKING_WATER: { available: 40000, reserved: 2000, inTransit: 0, unit: 'litres' },
      FUEL: { available: 60000, reserved: 5000, inTransit: 2000, unit: 'litres' },
      CONSTRUCTION_MATERIAL: { available: 800, reserved: 100, inTransit: 50, unit: 'tons' },
      EMERGENCY_EQUIPMENT: { available: 200, reserved: 10, inTransit: 0, unit: 'sets' },
    },
    capacityTons: 8000,
    lastAudit: '2026-08-28T19:00:00Z',
    isVerified: true,
    isSimulated: true,
  },
  'DEPOT-SC-03': {
    depotId: 'DEPOT-SC-03',
    name: 'Silchar Strategic Barak Valley Trans-Shipment Center',
    state: 'Assam (Barak)',
    coordinates: [24.8333, 92.7789],
    commodities: {
      MEDICINES: { available: 3500, reserved: 400, inTransit: 200, unit: 'kits' },
      FOOD: { available: 18000, reserved: 1500, inTransit: 800, unit: 'rations' },
      DRINKING_WATER: { available: 25000, reserved: 2000, inTransit: 1000, unit: 'litres' },
      FUEL: { available: 30000, reserved: 2500, inTransit: 1000, unit: 'litres' },
      CONSTRUCTION_MATERIAL: { available: 150, reserved: 20, inTransit: 0, unit: 'tons' },
      EMERGENCY_EQUIPMENT: { available: 80, reserved: 10, inTransit: 5, unit: 'sets' },
    },
    capacityTons: 2000,
    lastAudit: '2026-08-28T20:00:00Z',
    isVerified: true,
    isSimulated: true,
  },
  'DEPOT-DIM-04': {
    depotId: 'DEPOT-DIM-04',
    name: 'Dimapur Freight Railhead & Trans-Shipment Hub',
    state: 'Nagaland',
    coordinates: [25.9043, 93.7440],
    commodities: {
      MEDICINES: { available: 4200, reserved: 300, inTransit: 150, unit: 'kits' },
      FOOD: { available: 22000, reserved: 1800, inTransit: 500, unit: 'rations' },
      DRINKING_WATER: { available: 30000, reserved: 1500, inTransit: 500, unit: 'litres' },
      FUEL: { available: 40000, reserved: 3000, inTransit: 1200, unit: 'litres' },
      CONSTRUCTION_MATERIAL: { available: 220, reserved: 30, inTransit: 10, unit: 'tons' },
      EMERGENCY_EQUIPMENT: { available: 95, reserved: 5, inTransit: 2, unit: 'sets' },
    },
    capacityTons: 2500,
    lastAudit: '2026-08-28T21:00:00Z',
    isVerified: true,
    isSimulated: true,
  },
}

// ── Controlled District Reserve Profiles for Crisis Analysis ──
export const DEMO_DISTRICT_PROFILES: Record<string, DistrictLogisticsProfile> = {
  'Haflong (Dima Hasao)': {
    districtName: 'Haflong (Dima Hasao)',
    state: 'Assam',
    coordinates: [25.1843, 93.0182],
    population: 214000,
    commodities: {
      MEDICINES: {
        commodityType: 'MEDICINES',
        unit: 'kits',
        availableQuantity: 180,
        reservedQuantity: 0,
        minimumReserveThreshold: 600,
        dailyDemandEstimate: 120,
        status: 'CRITICAL',
        isSimulated: true,
      },
      FOOD: {
        commodityType: 'FOOD',
        unit: 'rations',
        availableQuantity: 4200,
        reservedQuantity: 0,
        minimumReserveThreshold: 8000,
        dailyDemandEstimate: 1500,
        status: 'LOW',
        isSimulated: true,
      },
      DRINKING_WATER: {
        commodityType: 'DRINKING_WATER',
        unit: 'litres',
        availableQuantity: 9000,
        reservedQuantity: 0,
        minimumReserveThreshold: 20000,
        dailyDemandEstimate: 6000,
        status: 'CRITICAL',
        isSimulated: true,
      },
      FUEL: {
        commodityType: 'FUEL',
        unit: 'litres',
        availableQuantity: 12000,
        reservedQuantity: 0,
        minimumReserveThreshold: 15000,
        dailyDemandEstimate: 2500,
        status: 'LOW',
        isSimulated: true,
      },
      CONSTRUCTION_MATERIAL: {
        commodityType: 'CONSTRUCTION_MATERIAL',
        unit: 'tons',
        availableQuantity: 15,
        reservedQuantity: 0,
        minimumReserveThreshold: 40,
        dailyDemandEstimate: 5,
        status: 'LOW',
        isSimulated: true,
      },
      EMERGENCY_EQUIPMENT: {
        commodityType: 'EMERGENCY_EQUIPMENT',
        unit: 'sets',
        availableQuantity: 12,
        reservedQuantity: 0,
        minimumReserveThreshold: 25,
        dailyDemandEstimate: 3,
        status: 'LOW',
        isSimulated: true,
      },
    },
    lastUpdated: '2026-08-29T06:00:00Z',
    isSimulated: true,
  },
  'Shillong (East Khasi)': {
    districtName: 'Shillong (East Khasi)',
    state: 'Meghalaya',
    coordinates: [25.5788, 91.8933],
    population: 460000,
    commodities: {
      MEDICINES: {
        commodityType: 'MEDICINES',
        unit: 'kits',
        availableQuantity: 2800,
        reservedQuantity: 100,
        minimumReserveThreshold: 1500,
        dailyDemandEstimate: 350,
        status: 'ADEQUATE',
        isSimulated: true,
      },
      FOOD: {
        commodityType: 'FOOD',
        unit: 'rations',
        availableQuantity: 18500,
        reservedQuantity: 500,
        minimumReserveThreshold: 12000,
        dailyDemandEstimate: 2200,
        status: 'ADEQUATE',
        isSimulated: true,
      },
      DRINKING_WATER: {
        commodityType: 'DRINKING_WATER',
        unit: 'litres',
        availableQuantity: 45000,
        reservedQuantity: 1000,
        minimumReserveThreshold: 30000,
        dailyDemandEstimate: 8000,
        status: 'ADEQUATE',
        isSimulated: true,
      },
      FUEL: {
        commodityType: 'FUEL',
        unit: 'litres',
        availableQuantity: 38000,
        reservedQuantity: 1200,
        minimumReserveThreshold: 25000,
        dailyDemandEstimate: 4500,
        status: 'ADEQUATE',
        isSimulated: true,
      },
      CONSTRUCTION_MATERIAL: {
        commodityType: 'CONSTRUCTION_MATERIAL',
        unit: 'tons',
        availableQuantity: 85,
        reservedQuantity: 5,
        minimumReserveThreshold: 50,
        dailyDemandEstimate: 8,
        status: 'ADEQUATE',
        isSimulated: true,
      },
      EMERGENCY_EQUIPMENT: {
        commodityType: 'EMERGENCY_EQUIPMENT',
        unit: 'sets',
        availableQuantity: 45,
        reservedQuantity: 2,
        minimumReserveThreshold: 30,
        dailyDemandEstimate: 4,
        status: 'ADEQUATE',
        isSimulated: true,
      },
    },
    lastUpdated: '2026-08-29T06:00:00Z',
    isSimulated: true,
  },
}

// ── 1. Evaluate District Supply Status & Detect Critical Shortages ──
export function evaluateDistrictSupply(
  district: DistrictLogisticsProfile,
  commodityType: CommodityType
): SupplyShortageAssessment {
  const stock = district.commodities?.[commodityType]

  if (!stock) {
    return {
      districtName: district.districtName,
      commodityType,
      status: 'DATA_INSUFFICIENT',
      daysOfCover: null,
      currentReserve: 0,
      estimatedDailyDemand: null,
      shortageGapQuantity: 0,
      urgencyClass: 'UNKNOWN',
      recommendedReplenishment: 0,
      requiresHumanReview: true,
      isSimulated: district.isSimulated || true,
      notes: 'No verified inventory telemetry available for this commodity.',
    }
  }

  const currentReserve = stock.availableQuantity
  const dailyDemand = stock.dailyDemandEstimate || null
  const minThreshold = stock.minimumReserveThreshold

  let daysOfCover: number | null = null
  if (dailyDemand && dailyDemand > 0) {
    daysOfCover = parseFloat((currentReserve / dailyDemand).toFixed(1))
  }

  let status: DistrictSupplyStatusLevel = 'ADEQUATE'
  let urgency: 'IMMEDIATE' | 'HIGH' | 'MODERATE' | 'MONITOR' | 'UNKNOWN' = 'MONITOR'
  let recommendedReplenishment = 0

  if (currentReserve <= 0) {
    status = 'DEPLETED'
    urgency = 'IMMEDIATE'
    recommendedReplenishment = minThreshold * 2
  } else if (currentReserve < minThreshold * 0.4 || (daysOfCover !== null && daysOfCover < 2.0)) {
    status = 'CRITICAL'
    urgency = 'IMMEDIATE'
    recommendedReplenishment = Math.max(minThreshold - currentReserve, minThreshold * 1.5)
  } else if (currentReserve < minThreshold || (daysOfCover !== null && daysOfCover < 4.0)) {
    status = 'LOW'
    urgency = 'HIGH'
    recommendedReplenishment = minThreshold - currentReserve
  } else {
    status = 'ADEQUATE'
    urgency = 'MONITOR'
    recommendedReplenishment = 0
  }

  return {
    districtName: district.districtName,
    commodityType,
    status,
    daysOfCover,
    currentReserve,
    estimatedDailyDemand: dailyDemand,
    shortageGapQuantity: Math.max(0, minThreshold - currentReserve),
    urgencyClass: urgency,
    recommendedReplenishment: Math.round(recommendedReplenishment),
    requiresHumanReview: status !== 'ADEQUATE',
    isSimulated: stock.isSimulated,
    notes:
      status === 'ADEQUATE'
        ? `Sufficient reserves. Current cover: ${daysOfCover !== null ? daysOfCover + ' days' : 'Adequate'}.`
        : `Deficit detected: reserve is ${currentReserve} ${stock.unit} (Minimum safe threshold: ${minThreshold} ${stock.unit}).`,
  }
}

// ── 2. Verified Reserve Inventory Mutation (Sets status to RESERVED without premature deduction) ──
export function reserveCommodityForPlan(
  depotId: string,
  commodityType: CommodityType,
  quantity: number,
  planId: string,
  depots: Record<string, DepotInventory> = DEMO_DEPOT_INVENTORIES
): { success: boolean; message: string; updatedDepot?: DepotInventory } {
  const depot = depots[depotId]
  if (!depot) {
    return { success: false, message: `Depot ${depotId} not found in verified registry.` }
  }

  const stock = depot.commodities[commodityType]
  if (!stock) {
    return { success: false, message: `Depot ${depot.name} does not stock commodity ${commodityType}.` }
  }

  if (stock.available < quantity) {
    return {
      success: false,
      message: `Insufficient available stock in ${depot.name}. Requested: ${quantity} ${stock.unit}, Available: ${stock.available} ${stock.unit}.`,
    }
  }

  const updatedDepot: DepotInventory = {
    ...depot,
    commodities: {
      ...depot.commodities,
      [commodityType]: {
        ...stock,
        available: stock.available - quantity,
        reserved: stock.reserved + quantity,
      },
    },
    lastAudit: new Date().toISOString(),
  }

  return {
    success: true,
    message: `Reserved ${quantity} ${stock.unit} of ${commodityType} at ${depot.name} for Plan ${planId}. Inventory status: RESERVED.`,
    updatedDepot,
  }
}

