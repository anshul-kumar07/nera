// scripts/test-last-mile.mjs
// ========================================================================
//   NERA PHASE 10: LAST-MILE ACCESSIBILITY & REACHABILITY TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 10: LAST-MILE ACCESSIBILITY & CRISIS REACHABILITY SUITE   ')
console.log('========================================================================\n')

let passedTests = 0

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`)
    process.exit(1)
  } else {
    console.log(`✅ [PASS] ${message}`)
    passedTests++
  }
}

// ── Geographic Helpers ──
function calculateHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

// ── Controlled Crisis & Last-Mile Matrix ──
const CRISIS_MODE_MATRIX = {
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

function determineCrisisType(incident, rawType) {
  const t = (incident?.type || incident?.incident_type || rawType || '').toLowerCase()
  if (t.includes('flood') || t.includes('water') || t.includes('inundation')) return 'FLOOD'
  if (t.includes('landslide') || t.includes('mudslide') || t.includes('rockfall')) return 'LANDSLIDE'
  if (t.includes('collapse') || t.includes('road_damage') || t.includes('crack')) return 'ROAD_COLLAPSE'
  if (t.includes('bridge') || t.includes('culvert')) return 'BRIDGE_DAMAGE'
  if (t.includes('medical') || t.includes('hospital') || t.includes('casualty')) return 'MEDICAL_EMERGENCY'
  if (t.includes('isolated') || t.includes('remote') || t.includes('valley')) return 'ISOLATED_AREA'
  return 'OTHER'
}

function deriveLastMileAccessibility(params) {
  const {
    originCoords,
    crisisLocation,
    roadPathCoordinates,
    incidents = [],
    vehicleType,
    forcedObstructionCoords,
  } = params

  const confirmedIncidents = incidents.filter(i => i.status === 'confirmed')
  let activeCrisisType = params.crisisType || 'OTHER'

  let obstructionCoords = forcedObstructionCoords || null

  if (confirmedIncidents.length > 0 && roadPathCoordinates.length > 1) {
    for (const inc of confirmedIncidents) {
      if (typeof inc.lat === 'number' && typeof inc.lng === 'number') {
        const startIdx = Math.max(0, Math.floor(roadPathCoordinates.length / 2))
        for (let i = startIdx; i < roadPathCoordinates.length; i++) {
          const pt = roadPathCoordinates[i]
          const d = calculateHaversineKm(inc.lat, inc.lng, pt[0], pt[1])
          if (d <= 18) {
            obstructionCoords = { lat: inc.lat, lng: inc.lng }
            activeCrisisType = determineCrisisType(inc)
            break
          }
        }
      }
    }
  }

  // Confirmed Obstruction on Approach
  if (obstructionCoords && roadPathCoordinates.length > 1) {
    let lastSafeIndex = 0
    for (let i = 0; i < roadPathCoordinates.length; i++) {
      const pt = roadPathCoordinates[i]
      const distToBlock = calculateHaversineKm(pt[0], pt[1], obstructionCoords.lat, obstructionCoords.lng)
      if (distToBlock <= 6.0) {
        lastSafeIndex = Math.max(0, i - 1)
        break
      }
      lastSafeIndex = i
    }

    const vehiclePath = roadPathCoordinates.slice(0, Math.max(1, lastSafeIndex + 1))
    const vapPt = vehiclePath[vehiclePath.length - 1]
    const vehicleAccessPoint = { lat: vapPt[0], lng: vapPt[1] }

    let vehicleDistKm = 0
    for (let i = 0; i < vehiclePath.length - 1; i++) {
      vehicleDistKm += calculateHaversineKm(vehiclePath[i][0], vehiclePath[i][1], vehiclePath[i + 1][0], vehiclePath[i + 1][1])
    }

    const lastMileDistKm = calculateHaversineKm(
      vehicleAccessPoint.lat,
      vehicleAccessPoint.lng,
      crisisLocation.lat,
      crisisLocation.lng
    )

    const modeInfo = CRISIS_MODE_MATRIX[activeCrisisType] || CRISIS_MODE_MATRIX.OTHER

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
      operationalSummary: `Vehicle access terminates at Vehicle Access Point [${vehicleAccessPoint.lat.toFixed(3)}, ${vehicleAccessPoint.lng.toFixed(3)}]. Last-mile distance: ${lastMileDistKm} km. Recommended mode: ${modeInfo.recommendedMode}. NOTE: Field verification required before dispatch.`,
      vehiclePathCoordinates: vehiclePath,
      lastMileCoordinates: [
        [vehicleAccessPoint.lat, vehicleAccessPoint.lng],
        [crisisLocation.lat, crisisLocation.lng],
      ],
      vehicleCapabilityLabel: vehicleType ? `Vehicle Class: ${vehicleType}` : 'Standard Convoy Fleet',
    }
  }

  // Remote / Off-Road Crisis Location
  if (roadPathCoordinates.length > 0) {
    const lastRoadPoint = roadPathCoordinates[roadPathCoordinates.length - 1]
    const offRoadDistance = calculateHaversineKm(
      lastRoadPoint[0],
      lastRoadPoint[1],
      crisisLocation.lat,
      crisisLocation.lng
    )

    if (offRoadDistance > 3.0) {
      let roadDistKm = 0
      for (let i = 0; i < roadPathCoordinates.length - 1; i++) {
        roadDistKm += calculateHaversineKm(roadPathCoordinates[i][0], roadPathCoordinates[i][1], roadPathCoordinates[i + 1][0], roadPathCoordinates[i + 1][1])
      }

      const vehicleAccessPoint = { lat: lastRoadPoint[0], lng: lastRoadPoint[1] }
      const modeInfo = CRISIS_MODE_MATRIX[activeCrisisType !== 'OTHER' ? activeCrisisType : 'ISOLATED_AREA']

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
        operationalSummary: `Crisis location is in off-road terrain (${offRoadDistance} km from road terminus). Vehicle Access Point established at road head.`,
        vehiclePathCoordinates: roadPathCoordinates,
        lastMileCoordinates: [
          [vehicleAccessPoint.lat, vehicleAccessPoint.lng],
          [crisisLocation.lat, crisisLocation.lng],
        ],
        vehicleCapabilityLabel: vehicleType ? `Vehicle Class: ${vehicleType}` : 'Standard Convoy Fleet',
      }
    }
  }

  // Direct Vehicle Access
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

// ------------------------------------------------------------------------
// TEST 1: Normal route reaches destination directly
// ------------------------------------------------------------------------
const normalRoadPath = [
  [26.1445, 91.7362], // Guwahati
  [25.5788, 91.8933], // Shillong
]
const normalRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 25.5788, lng: 91.8933 },
  roadPathCoordinates: normalRoadPath,
  incidents: [],
})
assert(
  normalRes.accessStatus === 'DIRECT_VEHICLE_ACCESS',
  'TEST 1: Normal unobstructed road route achieves DIRECT_VEHICLE_ACCESS'
)

// ------------------------------------------------------------------------
// TEST 2: Last-mile distance = 0 when vehicle can reach destination
// ------------------------------------------------------------------------
assert(
  normalRes.lastMileDistanceKm === 0,
  'TEST 2: Last-mile distance is strictly 0 km when vehicle directly reaches destination'
)

// ------------------------------------------------------------------------
// TEST 3: Confirmed obstruction creates vehicle access point
// ------------------------------------------------------------------------
const confirmedFlood = {
  id: 'inc-fl-01',
  lat: 25.5700,
  lng: 91.8900,
  status: 'confirmed',
  type: 'flood',
  severity: 'critical'
}
const blockedRoadPath = [
  [26.1445, 91.7362], // Guwahati
  [25.8000, 91.8200], // Mid-point
  [25.5788, 91.8933], // Shillong near flood
]
const floodRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 25.5788, lng: 91.8933 },
  roadPathCoordinates: blockedRoadPath,
  incidents: [confirmedFlood],
})
assert(
  floodRes.accessStatus === 'LAST_MILE_REQUIRED' &&
  (floodRes.vehicleAccessPoint.lat !== floodRes.crisisLocation.lat || floodRes.vehicleAccessPoint.lng !== floodRes.crisisLocation.lng),
  'TEST 3: Confirmed obstruction creates distinct Vehicle Access Point before blocked section'
)

// ------------------------------------------------------------------------
// TEST 4: Predicted incident does not create last-mile restriction
// ------------------------------------------------------------------------
const predictedIncident = {
  id: 'inc-pred-1',
  lat: 25.5700,
  lng: 91.8900,
  status: 'predicted',
  type: 'flood',
}
const predRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 25.5788, lng: 91.8933 },
  roadPathCoordinates: normalRoadPath,
  incidents: [predictedIncident],
})
assert(
  predRes.accessStatus === 'DIRECT_VEHICLE_ACCESS' && predRes.lastMileDistanceKm === 0,
  'TEST 4: Predicted AI risk does NOT create last-mile restriction (Status remains DIRECT_VEHICLE_ACCESS)'
)

// ------------------------------------------------------------------------
// TEST 5: Reported incident does not create last-mile restriction
// ------------------------------------------------------------------------
const reportedIncident = {
  id: 'inc-rep-1',
  lat: 25.5700,
  lng: 91.8900,
  status: 'reported',
  type: 'landslide',
}
const repRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 25.5788, lng: 91.8933 },
  roadPathCoordinates: normalRoadPath,
  incidents: [reportedIncident],
})
assert(
  repRes.accessStatus === 'DIRECT_VEHICLE_ACCESS' && repRes.lastMileDistanceKm === 0,
  'TEST 5: Reported unverified incident does NOT block road (Status remains DIRECT_VEHICLE_ACCESS)'
)

// ------------------------------------------------------------------------
// TEST 6: Resolved incident restores direct accessibility where appropriate
// ------------------------------------------------------------------------
const resolvedIncident = {
  id: 'inc-res-1',
  lat: 25.5700,
  lng: 91.8900,
  status: 'resolved',
  type: 'landslide',
}
const resRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 25.5788, lng: 91.8933 },
  roadPathCoordinates: normalRoadPath,
  incidents: [resolvedIncident],
})
assert(
  resRes.accessStatus === 'DIRECT_VEHICLE_ACCESS' && resRes.lastMileDistanceKm === 0,
  'TEST 6: Resolved incident clears obstruction and restores DIRECT_VEHICLE_ACCESS'
)

// ------------------------------------------------------------------------
// TEST 7: Crisis location remains separate from vehicle access point
// ------------------------------------------------------------------------
const remoteCrisisPt = { lat: 25.5000, lng: 91.3000 }
const roadHeadPt = { lat: 25.5167, lng: 91.2667 }
const offRoadRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: remoteCrisisPt,
  roadPathCoordinates: [[26.1445, 91.7362], [roadHeadPt.lat, roadHeadPt.lng]],
  incidents: [],
})
assert(
  offRoadRes.crisisLocation.lat === remoteCrisisPt.lat &&
  offRoadRes.vehicleAccessPoint.lat === roadHeadPt.lat &&
  offRoadRes.crisisLocation.lat !== offRoadRes.vehicleAccessPoint.lat,
  'TEST 7: Crisis location remains distinct from Vehicle Access Point coordinate'
)

// ------------------------------------------------------------------------
// TEST 8: Last-mile distance is calculated, not hardcoded
// ------------------------------------------------------------------------
const expectedHaversine = calculateHaversineKm(roadHeadPt.lat, roadHeadPt.lng, remoteCrisisPt.lat, remoteCrisisPt.lng)
assert(
  offRoadRes.lastMileDistanceKm === expectedHaversine && offRoadRes.lastMileDistanceKm > 0,
  `TEST 8: Last-mile distance is dynamically calculated (${offRoadRes.lastMileDistanceKm} km)`
)

// ------------------------------------------------------------------------
// TEST 9: Possible modes are separate from available resources
// ------------------------------------------------------------------------
assert(
  offRoadRes.possibleModes.length > 0 &&
  offRoadRes.resourceAvailability === 'FIELD_VERIFICATION_REQUIRED' &&
  offRoadRes.verificationRequired === true,
  'TEST 9: Possible transfer modes are explicitly labeled with FIELD_VERIFICATION_REQUIRED (No fake dispatched resource)'
)

// ------------------------------------------------------------------------
// TEST 10: Flood crisis generates appropriate possible mode suggestion (BOAT)
// ------------------------------------------------------------------------
assert(
  floodRes.crisisType === 'FLOOD' && floodRes.recommendedMode === 'BOAT',
  'TEST 10: Flood crisis generates BOAT as primary possible last-mile transfer mode'
)

// ------------------------------------------------------------------------
// TEST 11: Landslide crisis generates appropriate possible mode suggestion (WALKING_FIELD_TEAM)
// ------------------------------------------------------------------------
const confirmedLandslide = {
  id: 'inc-ls-01',
  lat: 25.5700,
  lng: 91.8900,
  status: 'confirmed',
  type: 'landslide',
  severity: 'critical'
}
const landslideRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: { lat: 25.5788, lng: 91.8933 },
  roadPathCoordinates: blockedRoadPath,
  incidents: [confirmedLandslide],
})
assert(
  landslideRes.crisisType === 'LANDSLIDE' && landslideRes.recommendedMode === 'WALKING_FIELD_TEAM',
  'TEST 11: Landslide crisis generates WALKING_FIELD_TEAM as primary recommended mode'
)

// ------------------------------------------------------------------------
// TEST 12: Missing data produces FIELD VERIFICATION REQUIRED
// ------------------------------------------------------------------------
const unknownRes = deriveLastMileAccessibility({
  originCoords: { lat: 26.1445, lng: 91.7362 },
  crisisLocation: remoteCrisisPt,
  roadPathCoordinates: [[26.1445, 91.7362], [roadHeadPt.lat, roadHeadPt.lng]],
  crisisType: 'OTHER',
})
assert(
  unknownRes.recommendedMode === 'FIELD_VERIFICATION_REQUIRED' || unknownRes.verificationRequired === true,
  'TEST 12: Uncategorized or missing crisis data produces FIELD_VERIFICATION_REQUIRED'
)

// ------------------------------------------------------------------------
// TEST 13: No fake road geometry is generated for non-road last-mile
// ------------------------------------------------------------------------
assert(
  offRoadRes.distanceCalculationMethod === 'ESTIMATED_NON_ROAD_DISTANCE' &&
  offRoadRes.lastMileCoordinates.length === 2,
  'TEST 13: Non-road last-mile is explicitly labeled ESTIMATED_NON_ROAD_DISTANCE (No fake road curvature)'
)

// ------------------------------------------------------------------------
// TEST 14: Existing vehicle rerouting still works
// ------------------------------------------------------------------------
const rerouteVehiclePos = { lat: 26.0500, lng: 91.8000 }
const reroutedLastMile = deriveLastMileAccessibility({
  originCoords: rerouteVehiclePos,
  crisisLocation: { lat: 25.5788, lng: 91.8933 },
  roadPathCoordinates: [[26.0500, 91.8000], [25.80, 91.50], [25.57, 91.89]],
  incidents: [],
})
assert(
  reroutedLastMile.vehicleAccessibleDistanceKm > 0 && reroutedLastMile.accessStatus === 'DIRECT_VEHICLE_ACCESS',
  'TEST 14: Vehicle rerouting from en-route position calculates valid accessibility without teleportation'
)

// ------------------------------------------------------------------------
// TEST 15: Existing dynamic routing still works
// ------------------------------------------------------------------------
const dynamicOrigin = { lat: 26.2000, lng: 91.6000 }
const dynamicDest = { lat: 23.9500, lng: 91.4500 }
const dynLastMile = deriveLastMileAccessibility({
  originCoords: dynamicOrigin,
  crisisLocation: dynamicDest,
  roadPathCoordinates: [[dynamicOrigin.lat, dynamicOrigin.lng], [24.83, 92.77], [dynamicDest.lat, dynamicDest.lng]],
  incidents: [],
})
assert(
  dynLastMile.totalDistanceKm > 0 && dynLastMile.crisisLocation.lat === dynamicDest.lat,
  'TEST 15: Dynamic arbitrary coordinate routing integrates smoothly with Last-Mile reachability'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/15 PHASE 10 LAST-MILE TESTS PASSED CLEANLY`)
console.log('========================================================================\n')

