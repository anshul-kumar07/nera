// lib/last-mile.ts
// ========================================================================
//    NERA PHASE 10: LAST-MILE ACCESSIBILITY & REACHABILITY ENGINE
// ========================================================================
import { Incident } from './supabase'
import { calculateHaversineKm } from './routing-algorithm'

export type CrisisType =
  | 'FLOOD'
  | 'LANDSLIDE'
  | 'ROAD_COLLAPSE'
  | 'BRIDGE_DAMAGE'
  | 'MEDICAL_EMERGENCY'
  | 'ISOLATED_AREA'
  | 'OTHER'

export type LastMileMode =
  | 'WALKING_FIELD_TEAM'
  | 'BOAT'
  | '4X4_OFF_ROAD'
  | 'LOCAL_RESCUE_TEAM'
  | 'AMBULANCE_TRANSFER'
  | 'MANUAL_SUPPLY_CARRY'
  | 'MODE_NOT_AVAILABLE'
  | 'FIELD_VERIFICATION_REQUIRED'

export type LastMileAccessStatus =
  | 'DIRECT_VEHICLE_ACCESS'
  | 'LAST_MILE_REQUIRED'
  | 'FIELD_VERIFICATION_REQUIRED'
  | 'LAST_MILE_INACCESSIBLE'

export interface Coordinate {
  lat: number
  lng: number
}

export interface LastMileAccessibility {
  crisisLocation: Coordinate
  vehicleAccessPoint: Coordinate
  vehicleAccessibleDistanceKm: number
  lastMileDistanceKm: number
  totalDistanceKm: number
  accessStatus: LastMileAccessStatus
  crisisType: CrisisType
  possibleModes: LastMileMode[]
  recommendedMode: LastMileMode
  resourceAvailability: 'RESOURCE_ASSIGNMENT_PENDING' | 'FIELD_VERIFICATION_REQUIRED' | 'DIRECT_ROAD_PASSABLE'
  verificationRequired: boolean
  distanceCalculationMethod: 'ROUTABLE_ROAD' | 'ESTIMATED_NON_ROAD_DISTANCE' | 'DIRECT_ACCESS'
  operationalSummary: string
  vehiclePathCoordinates: [number, number][]
  lastMileCoordinates: [number, number][]
  vehicleCapabilityLabel?: string
}

// Controlled mapping of possible modes per crisis type
export const CRISIS_MODE_MATRIX: Record<
  CrisisType,
  { possibleModes: LastMileMode[]; recommendedMode: LastMileMode }
> = {
  FLOOD: {
    possibleModes: ['BOAT', 'LOCAL_RESCUE_TEAM', 'FIELD_VERIFICATION_REQUIRED'],
    recommendedMode: 'BOAT',
  },
  LANDSLIDE: {
    possibleModes: ['WALKING_FIELD_TEAM', 'MANUAL_SUPPLY_CARRY', '4X4_OFF_ROAD', 'FIELD_VERIFICATION_REQUIRED'],
    recommendedMode: 'WALKING_FIELD_TEAM',
  },
  ROAD_COLLAPSE: {
    possibleModes: ['WALKING_FIELD_TEAM', '4X4_OFF_ROAD', 'LOCAL_RESCUE_TEAM'],
    recommendedMode: 'WALKING_FIELD_TEAM',
  },
  BRIDGE_DAMAGE: {
    possibleModes: ['BOAT', 'WALKING_FIELD_TEAM', 'MANUAL_SUPPLY_CARRY'],
    recommendedMode: 'BOAT',
  },
  MEDICAL_EMERGENCY: {
    possibleModes: ['AMBULANCE_TRANSFER', 'LOCAL_RESCUE_TEAM', 'WALKING_FIELD_TEAM'],
    recommendedMode: 'AMBULANCE_TRANSFER',
  },
  ISOLATED_AREA: {
    possibleModes: ['4X4_OFF_ROAD', 'WALKING_FIELD_TEAM', 'MANUAL_SUPPLY_CARRY'],
    recommendedMode: '4X4_OFF_ROAD',
  },
  OTHER: {
    possibleModes: ['WALKING_FIELD_TEAM', 'FIELD_VERIFICATION_REQUIRED'],
    recommendedMode: 'FIELD_VERIFICATION_REQUIRED',
  },
}

/**
 * Maps raw incident or hazard text to standard CrisisType
 */
export function determineCrisisType(incident?: Incident | null, rawType?: string): CrisisType {
  const t = (incident?.type || incident?.incident_type || rawType || '').toLowerCase()
  if (t.includes('flood') || t.includes('water') || t.includes('inundation')) return 'FLOOD'
  if (t.includes('landslide') || t.includes('mudslide') || t.includes('rockfall')) return 'LANDSLIDE'
  if (t.includes('collapse') || t.includes('road_damage') || t.includes('crack')) return 'ROAD_COLLAPSE'
  if (t.includes('bridge') || t.includes('culvert')) return 'BRIDGE_DAMAGE'
  if (t.includes('medical') || t.includes('hospital') || t.includes('casualty')) return 'MEDICAL_EMERGENCY'
  if (t.includes('isolated') || t.includes('remote') || t.includes('valley')) return 'ISOLATED_AREA'
  return 'OTHER'
}

/**
 * Returns controlled list of possible operational modes for a given crisis type
 */
export function getPossibleLastMileModes(crisisType: CrisisType): {
  possibleModes: LastMileMode[]
  recommendedMode: LastMileMode
} {
  return CRISIS_MODE_MATRIX[crisisType] || CRISIS_MODE_MATRIX.OTHER
}

export interface DeriveLastMileParams {
  originCoords: Coordinate
  crisisLocation: Coordinate
  roadPathCoordinates: [number, number][]
  incidents?: Incident[]
  crisisType?: CrisisType
  vehicleType?: string
  forcedObstructionCoords?: Coordinate | null
}

/**
 * Core Algorithm: Derives Vehicle Access Point (VAP) and Last-Mile Segment
 *
 * Rules:
 * 1. PREDICTED and REPORTED incidents do NOT create vehicle restrictions (advisory only).
 * 2. Only CONFIRMED incidents can block roads and establish a Vehicle Access Point.
 * 3. RESOLVED incidents unblock roads and restore direct vehicle access.
 * 4. Never fabricates available resources — labels possible modes with FIELD_VERIFICATION_REQUIRED.
 * 5. Accurately calculates geodesic distance for non-road last-mile segments.
 */
export function deriveLastMileAccessibility(params: DeriveLastMileParams): LastMileAccessibility {
  const {
    originCoords: _originCoords,
    crisisLocation,
    roadPathCoordinates,
    incidents = [],
    vehicleType,
    forcedObstructionCoords,
  } = params

  const confirmedIncidents = incidents.filter(i => i.status === 'confirmed')
  let activeCrisisType: CrisisType = params.crisisType || 'OTHER'

  // 1. Identify primary confirmed incident on or near the approach route
  let _blockingIncident: Incident | null = null
  let minObstructionDistKm = Infinity
  let obstructionCoords: Coordinate | null = forcedObstructionCoords || null

  if (confirmedIncidents.length > 0 && roadPathCoordinates.length > 1) {
    for (const inc of confirmedIncidents) {
      if (typeof inc.lat === 'number' && typeof inc.lng === 'number') {
        // Check distance to any point along the final half of the route
        const startIdx = Math.max(0, Math.floor(roadPathCoordinates.length / 2))
        for (let i = startIdx; i < roadPathCoordinates.length; i++) {
          const pt = roadPathCoordinates[i]
          const d = calculateHaversineKm(inc.lat, inc.lng, pt[0], pt[1])
          if (d < minObstructionDistKm && d <= 18) {
            minObstructionDistKm = d
            _blockingIncident = inc
            obstructionCoords = { lat: inc.lat, lng: inc.lng }
            activeCrisisType = determineCrisisType(inc)
          }
        }
      }
    }
  }

  // 2. Scenario A: Confirmed Blockage on Approach
  if (obstructionCoords && roadPathCoordinates.length > 1) {
    // Find the last safe coordinate on the road path BEFORE the obstruction
    let lastSafeIndex = 0
    let minBlockedDist = Infinity

    for (let i = 0; i < roadPathCoordinates.length; i++) {
      const pt = roadPathCoordinates[i]
      const distToBlock = calculateHaversineKm(pt[0], pt[1], obstructionCoords.lat, obstructionCoords.lng)
      if (distToBlock < minBlockedDist) {
        minBlockedDist = distToBlock
      }
      // If we are getting within 5 km of the obstruction, stop vehicle route
      if (distToBlock <= 6.0) {
        lastSafeIndex = Math.max(0, i - 1)
        break
      }
      lastSafeIndex = i
    }

    // Ensure vehicle path has at least the origin
    const vehiclePath: [number, number][] = roadPathCoordinates.slice(0, Math.max(1, lastSafeIndex + 1))
    const vapPt = vehiclePath[vehiclePath.length - 1]
    const vehicleAccessPoint: Coordinate = { lat: vapPt[0], lng: vapPt[1] }

    // Calculate vehicle-accessible distance along the road path
    let vehicleDistKm = 0
    for (let i = 0; i < vehiclePath.length - 1; i++) {
      vehicleDistKm += calculateHaversineKm(vehiclePath[i][0], vehiclePath[i][1], vehiclePath[i + 1][0], vehiclePath[i + 1][1])
    }

    // Calculate last-mile distance from VAP to actual Crisis Location
    const lastMileDistKm = calculateHaversineKm(
      vehicleAccessPoint.lat,
      vehicleAccessPoint.lng,
      crisisLocation.lat,
      crisisLocation.lng
    )

    const modeInfo = getPossibleLastMileModes(activeCrisisType)

    return {
      crisisLocation,
      vehicleAccessPoint,
      vehicleAccessibleDistanceKm: Math.round(vehicleDistKm),
      lastMileDistanceKm: lastMileDistKm,
      totalDistanceKm: Math.round(vehicleDistKm + lastMileDistKm),
      accessStatus: 'LAST_MILE_REQUIRED',
      crisisType: activeCrisisType,
      possibleModes: modeInfo.possibleModes,
      recommendedMode: modeInfo.recommendedMode,
      resourceAvailability: 'FIELD_VERIFICATION_REQUIRED',
      verificationRequired: true,
      distanceCalculationMethod: 'ESTIMATED_NON_ROAD_DISTANCE',
      operationalSummary: `Vehicle access terminates at Vehicle Access Point [${vehicleAccessPoint.lat.toFixed(3)}, ${vehicleAccessPoint.lng.toFixed(3)}] due to confirmed ${activeCrisisType.toLowerCase()}. Remaining ${lastMileDistKm} km requires last-mile deployment (${modeInfo.recommendedMode}). NOTE: Field verification required before dispatch.`,
      vehiclePathCoordinates: vehiclePath,
      lastMileCoordinates: [
        [vehicleAccessPoint.lat, vehicleAccessPoint.lng],
        [crisisLocation.lat, crisisLocation.lng],
      ],
      vehicleCapabilityLabel: vehicleType ? `Vehicle Class: ${vehicleType}` : 'Standard Convoy Fleet',
    }
  }

  // 3. Scenario B: Remote / Off-Road Crisis Location (Target far from road terminus)
  if (roadPathCoordinates.length > 0) {
    const lastRoadPoint = roadPathCoordinates[roadPathCoordinates.length - 1]
    const offRoadDistance = calculateHaversineKm(
      lastRoadPoint[0],
      lastRoadPoint[1],
      crisisLocation.lat,
      crisisLocation.lng
    )

    // If destination is > 3 km from the end of the recognized road network
    if (offRoadDistance > 3.0) {
      let roadDistKm = 0
      for (let i = 0; i < roadPathCoordinates.length - 1; i++) {
        roadDistKm += calculateHaversineKm(roadPathCoordinates[i][0], roadPathCoordinates[i][1], roadPathCoordinates[i + 1][0], roadPathCoordinates[i + 1][1])
      }

      const vehicleAccessPoint: Coordinate = { lat: lastRoadPoint[0], lng: lastRoadPoint[1] }
      const modeInfo = getPossibleLastMileModes(activeCrisisType !== 'OTHER' ? activeCrisisType : 'ISOLATED_AREA')

      return {
        crisisLocation,
        vehicleAccessPoint,
        vehicleAccessibleDistanceKm: Math.round(roadDistKm),
        lastMileDistanceKm: offRoadDistance,
        totalDistanceKm: Math.round(roadDistKm + offRoadDistance),
        accessStatus: 'LAST_MILE_REQUIRED',
        crisisType: activeCrisisType !== 'OTHER' ? activeCrisisType : 'ISOLATED_AREA',
        possibleModes: modeInfo.possibleModes,
        recommendedMode: modeInfo.recommendedMode,
        resourceAvailability: 'FIELD_VERIFICATION_REQUIRED',
        verificationRequired: true,
        distanceCalculationMethod: 'ESTIMATED_NON_ROAD_DISTANCE',
        operationalSummary: `Crisis location is in off-road terrain (${offRoadDistance} km from road terminus). Vehicle Access Point established at road head. Suggested mode: ${modeInfo.recommendedMode}.`,
        vehiclePathCoordinates: roadPathCoordinates,
        lastMileCoordinates: [
          [vehicleAccessPoint.lat, vehicleAccessPoint.lng],
          [crisisLocation.lat, crisisLocation.lng],
        ],
        vehicleCapabilityLabel: vehicleType ? `Vehicle Class: ${vehicleType}` : 'Standard Convoy Fleet',
      }
    }
  }

  // 4. Scenario C: Direct Vehicle Access (Normal road route with no obstruction)
  let totalRoadKm = 0
  for (let i = 0; i < roadPathCoordinates.length - 1; i++) {
    totalRoadKm += calculateHaversineKm(roadPathCoordinates[i][0], roadPathCoordinates[i][1], roadPathCoordinates[i + 1][0], roadPathCoordinates[i + 1][1])
  }

  return {
    crisisLocation,
    vehicleAccessPoint: { lat: crisisLocation.lat, lng: crisisLocation.lng },
    vehicleAccessibleDistanceKm: Math.round(totalRoadKm),
    lastMileDistanceKm: 0,
    totalDistanceKm: Math.round(totalRoadKm),
    accessStatus: 'DIRECT_VEHICLE_ACCESS',
    crisisType: activeCrisisType,
    possibleModes: ['4X4_OFF_ROAD', 'WALKING_FIELD_TEAM'],
    recommendedMode: '4X4_OFF_ROAD',
    resourceAvailability: 'DIRECT_ROAD_PASSABLE',
    verificationRequired: false,
    distanceCalculationMethod: 'DIRECT_ACCESS',
    operationalSummary: 'Direct road access confirmed to destination depot. No last-mile transfer required.',
    vehiclePathCoordinates: roadPathCoordinates,
    lastMileCoordinates: [],
    vehicleCapabilityLabel: vehicleType ? `Vehicle Class: ${vehicleType}` : 'Standard Convoy Fleet',
  }
}
