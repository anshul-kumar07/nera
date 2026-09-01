import { calculateHaversineKm } from '@/lib/routing-algorithm'

export type VehicleStatus = 'IDLE' | 'DISPATCHED' | 'IN_TRANSIT' | 'REROUTING' | 'DELAYED' | 'ARRIVED' | 'OUT_OF_SERVICE' | 'FAILED'

export type CommodityType = 'MEDICINES' | 'FOOD / GRAIN' | 'FUEL' | 'CONSTRUCTION MATERIAL' | 'AGRICULTURAL PRODUCE'

export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'NORMAL'

export interface VehicleTelemetryData {
  vehicleId: string
  driverName: string
  vehicleModel: string
  cargoType: CommodityType
  priority: PriorityLevel
  status: VehicleStatus
  telemetryType: 'SIMULATED'
  lat: number
  lng: number
  speedKmh: number
  headingDeg: number
  originHub: string
  destinationDepot: string
  currentRouteName: string
  totalDistanceKm: number
  distanceRemainingKm: number
  etaClockTime: string
  delayMinutes: number
  lastUpdate: string
  pathCoordinates: [number, number][]
  pathProgress: number // 0.0 to 1.0
  isRerouted?: boolean
  rerouteReason?: string
}

export const COMMODITY_PRIORITY_MAP: Record<CommodityType, PriorityLevel> = {
  'MEDICINES': 'CRITICAL',
  'FOOD / GRAIN': 'HIGH',
  'FUEL': 'CRITICAL',
  'CONSTRUCTION MATERIAL': 'NORMAL',
  'AGRICULTURAL PRODUCE': 'NORMAL',
}

export const INITIAL_FLEET: VehicleTelemetryData[] = [
  {
    vehicleId: 'NER-TRUCK-18',
    driverName: 'Bipul Gogoi',
    vehicleModel: 'Tata Signa 2823.K Heavy Multi-Axle',
    cargoType: 'MEDICINES',
    priority: 'CRITICAL',
    status: 'IN_TRANSIT',
    telemetryType: 'SIMULATED',
    lat: 26.1445,
    lng: 91.7362,
    speedKmh: 42,
    headingDeg: 145,
    originHub: 'Guwahati',
    destinationDepot: 'Shillong',
    currentRouteName: 'NH-6 Guwahati–Jorabat–Shillong Expressway',
    totalDistanceKm: 100,
    distanceRemainingKm: 82,
    etaClockTime: '14:41 IST',
    delayMinutes: 0,
    lastUpdate: 'Just now',
    pathCoordinates: [
      [26.1445, 91.7362],
      [26.0500, 91.8000],
      [25.8500, 91.8000],
      [25.5788, 91.8933],
    ],
    pathProgress: 0.18,
  },
  {
    vehicleId: 'NER-TRUCK-07',
    driverName: 'Sanjay Thapa',
    vehicleModel: 'Ashok Leyland Ecomet 1215 Tipper',
    cargoType: 'FOOD / GRAIN',
    priority: 'HIGH',
    status: 'IN_TRANSIT',
    telemetryType: 'SIMULATED',
    lat: 24.8333,
    lng: 92.7789,
    speedKmh: 48,
    headingDeg: 80,
    originHub: 'Silchar',
    destinationDepot: 'Imphal',
    currentRouteName: 'NH-37 Silchar–Jiribam–Imphal Hill Highway',
    totalDistanceKm: 255,
    distanceRemainingKm: 190,
    etaClockTime: '17:30 IST',
    delayMinutes: 0,
    lastUpdate: 'Just now',
    pathCoordinates: [
      [24.8333, 92.7789],
      [24.8000, 93.1200],
      [24.8170, 93.9368],
    ],
    pathProgress: 0.25,
  },
  {
    vehicleId: 'NER-TRUCK-23',
    driverName: 'Tsering Dorjee',
    vehicleModel: 'BharatBenz 1617R All-Weather Transport',
    cargoType: 'FUEL',
    priority: 'CRITICAL',
    status: 'IN_TRANSIT',
    telemetryType: 'SIMULATED',
    lat: 26.1445,
    lng: 91.7362,
    speedKmh: 52,
    headingDeg: 45,
    originHub: 'Guwahati',
    destinationDepot: 'Itanagar',
    currentRouteName: 'NH-415 Banderdewa–Naharlagun–Itanagar Expressway',
    totalDistanceKm: 330,
    distanceRemainingKm: 290,
    etaClockTime: '19:15 IST',
    delayMinutes: 0,
    lastUpdate: 'Just now',
    pathCoordinates: [
      [26.1445, 91.7362],
      [26.6338, 92.7926],
      [27.0844, 93.6053],
    ],
    pathProgress: 0.12,
  },
]

/**
 * Calculates accurate geodesic heading (0-360 deg) between two points
 */
export function calculateBearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180)
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon)
  const brng = (Math.atan2(y, x) * 180) / Math.PI
  return (brng + 360) % 360
}

/**
 * Interpolates vehicle position and heading along polyline geometry
 */
export function interpolateVehicleMotion(
  coords: [number, number][],
  progress: number
): { position: [number, number]; headingDeg: number; distanceRemainingKm: number } {
  if (!coords || coords.length === 0) {
    return { position: [26.1445, 91.7362], headingDeg: 0, distanceRemainingKm: 0 }
  }
  if (coords.length === 1) {
    return { position: coords[0], headingDeg: 0, distanceRemainingKm: 0 }
  }
  if (progress <= 0) {
    const bearing = calculateBearingDeg(coords[0][0], coords[0][1], coords[1][0], coords[1][1])
    let totalD = 0
    for (let i = 0; i < coords.length - 1; i++) {
      totalD += calculateHaversineKm(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1])
    }
    return { position: coords[0], headingDeg: Math.round(bearing), distanceRemainingKm: Math.round(totalD) }
  }

  const segmentDistances: number[] = [0]
  let totalDist = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const d = calculateHaversineKm(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1])
    totalDist += d
    segmentDistances.push(totalDist)
  }

  if (totalDist === 0) {
    return { position: coords[0], headingDeg: 0, distanceRemainingKm: 0 }
  }

  const targetDist = Math.min(progress, 1.0) * totalDist
  const remainingDist = Math.max(0, totalDist - targetDist)

  for (let i = 0; i < segmentDistances.length - 1; i++) {
    if (targetDist >= segmentDistances[i] && targetDist <= segmentDistances[i + 1]) {
      const segStart = segmentDistances[i]
      const segEnd = segmentDistances[i + 1]
      const segLen = segEnd - segStart
      const segT = segLen === 0 ? 0 : (targetDist - segStart) / segLen

      const p1 = coords[i]
      const p2 = coords[i + 1]
      const lat = p1[0] + (p2[0] - p1[0]) * segT
      const lng = p1[1] + (p2[1] - p1[1]) * segT
      const heading = calculateBearingDeg(p1[0], p1[1], p2[0], p2[1])

      return {
        position: [lat, lng],
        headingDeg: Math.round(heading),
        distanceRemainingKm: Math.round(remainingDist),
      }
    }
  }

  const lastIdx = coords.length - 1
  const lastHeading = calculateBearingDeg(
    coords[lastIdx - 1][0],
    coords[lastIdx - 1][1],
    coords[lastIdx][0],
    coords[lastIdx][1]
  )
  return {
    position: coords[lastIdx],
    headingDeg: Math.round(lastHeading),
    distanceRemainingKm: 0,
  }
}

/**
 * Splices a new OSRM alternate route from the vehicle's current position
 * without teleporting the vehicle backwards.
 */
export function transitionVehicleToNewRoute(
  vehicle: VehicleTelemetryData,
  newRouteGeometry: [number, number][],
  newRouteName: string,
  rerouteReason: string,
  delayMinutesAdded: number = 45
): VehicleTelemetryData {
  if (!newRouteGeometry || newRouteGeometry.length < 2) {
    return vehicle
  }

  // 1. Find the closest point along the new route geometry from current vehicle position
  let closestIndex = 0
  let minDistance = Infinity

  for (let i = 0; i < newRouteGeometry.length; i++) {
    const pt = newRouteGeometry[i]
    const d = calculateHaversineKm(vehicle.lat, vehicle.lng, pt[0], pt[1])
    if (d < minDistance) {
      minDistance = d
      closestIndex = i
    }
  }

  // 2. Splice remaining geometry: current vehicle position -> remaining new path
  const remainingGeometry: [number, number][] = [
    [vehicle.lat, vehicle.lng],
    ...newRouteGeometry.slice(closestIndex),
  ]

  // Calculate remaining distance along new spliced geometry
  let remainingDistKm = 0
  for (let i = 0; i < remainingGeometry.length - 1; i++) {
    remainingDistKm += calculateHaversineKm(
      remainingGeometry[i][0],
      remainingGeometry[i][1],
      remainingGeometry[i + 1][0],
      remainingGeometry[i + 1][1]
    )
  }

  const speed = vehicle.speedKmh || 45
  const remainingHours = remainingDistKm / speed
  const etaDate = new Date(Date.now() + remainingHours * 3600 * 1000)
  const etaClockTime = etaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'

  return {
    ...vehicle,
    status: 'IN_TRANSIT',
    isRerouted: true,
    rerouteReason,
    currentRouteName: newRouteName,
    pathCoordinates: remainingGeometry,
    pathProgress: 0.0, // starts at current spliced position
    distanceRemainingKm: Math.round(remainingDistKm),
    etaClockTime,
    delayMinutes: (vehicle.delayMinutes || 0) + delayMinutesAdded,
    lastUpdate: 'Just now (Rerouted)',
  }
}

