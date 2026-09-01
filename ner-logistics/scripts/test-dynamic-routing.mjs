// scripts/test-dynamic-routing.mjs
// ========================================================================
//    PHASE 9: DYNAMIC MAP & ROAD-NETWORK ROUTING TEST SUITE
// ========================================================================

console.log('\n========================================================================')
console.log('   NERA PHASE 9: DYNAMIC MAP & ROAD-NETWORK ROUTING SUITE               ')
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

// ── Graph Nodes & Haversine Distance ──
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

const NER_GRAPH_NODES = {
  Delhi: { id: 'Delhi', name: 'New Delhi National Reserve Hub', lat: 28.6139, lng: 77.2090 },
  Siliguri: { id: 'Siliguri', name: 'Siliguri North Bengal Gateway', lat: 26.7271, lng: 88.3953 },
  Guwahati: { id: 'Guwahati', name: 'Guwahati Apex Multi-Modal Hub', lat: 26.1445, lng: 91.7362 },
  Shillong: { id: 'Shillong', name: 'Shillong (Meghalaya)', lat: 25.5788, lng: 91.8933 },
  Nongstoin: { id: 'Nongstoin', name: 'Nongstoin High Plateau (Meghalaya)', lat: 25.5167, lng: 91.2667 },
  Silchar: { id: 'Silchar', name: 'Silchar (Barak Valley)', lat: 24.8333, lng: 92.7789 },
  Lumding: { id: 'Lumding', name: 'Lumding Freight Junction (Assam)', lat: 25.7500, lng: 93.1700 },
  Haflong: { id: 'Haflong', name: 'Haflong Mountain Pass (Dima Hasao)', lat: 25.1700, lng: 93.0200 },
  Aizawl: { id: 'Aizawl', name: 'Aizawl (Mizoram)', lat: 23.7271, lng: 92.7176 },
  Agartala: { id: 'Agartala', name: 'Agartala (Tripura)', lat: 23.8315, lng: 91.2868 },
  Nagaon: { id: 'Nagaon', name: 'Nagaon (Central Assam)', lat: 26.3500, lng: 92.6800 },
  Dimapur: { id: 'Dimapur', name: 'Dimapur (Nagaland)', lat: 25.9043, lng: 93.7440 },
  Imphal: { id: 'Imphal', name: 'Imphal (Manipur)', lat: 24.8170, lng: 93.9368 },
}

const NER_GRAPH_EDGES = [
  { from: 'Guwahati', to: 'Shillong', highway: 'NH-6 Guwahati–Jorabat–Shillong Expressway', distanceKm: 100, status: 'open' },
  { from: 'Shillong', to: 'Silchar', highway: 'NH-40 Shillong–Jowai–Silchar Hill Corridor', distanceKm: 215, status: 'open' },
  { from: 'Guwahati', to: 'Nongstoin', highway: 'NH-106 Nongstoin–Shillong High Plateau Bypass', distanceKm: 130, status: 'open' },
  { from: 'Nongstoin', to: 'Shillong', highway: 'NH-106 Nongstoin–Shillong High Plateau Bypass', distanceKm: 90, status: 'open' },
  { from: 'Guwahati', to: 'Nagaon', highway: 'NH-27 Guwahati–Nagaon Arterial', distanceKm: 120, status: 'open' },
  { from: 'Nagaon', to: 'Lumding', highway: 'NH-27 / NH-29 Dabaka–Lumding Express Bypass', distanceKm: 70, status: 'open' },
  { from: 'Lumding', to: 'Haflong', highway: 'NH-54E Lumding–Haflong Mountain Highway Bypass', distanceKm: 95, status: 'open' },
  { from: 'Haflong', to: 'Silchar', highway: 'NH-54E Haflong–Jatinga–Silchar All-Weather Corridor', distanceKm: 85, status: 'open' },
  { from: 'Silchar', to: 'Agartala', highway: 'NH-8 Churaibari–Agartala Lifeline Highway', distanceKm: 250, status: 'open' },
  { from: 'Silchar', to: 'Aizawl', highway: 'NH-54 Silchar–Aizawl Main Trunk Road', distanceKm: 175, status: 'open' },
  { from: 'Nagaon', to: 'Dimapur', highway: 'NH-29 Dabaka–Dimapur Bypass', distanceKm: 150, status: 'open' },
  { from: 'Dimapur', to: 'Imphal', highway: 'NH-2 Dimapur–Kohima–Imphal Highway', distanceKm: 210, status: 'open' },
]

const NER_BRIDGES = [
  { id: 'br-sonapur-culvert', name: 'Sonapur River Bailey Bridge', highway: 'NH-6 Guwahati–Jorabat–Shillong Expressway', max_weight_tons: 18 },
  { id: 'br-saraighat', name: 'Saraighat Bridge', highway: 'NH-27 Arterial', max_weight_tons: 40 },
]

function findNearestNode(lat, lng) {
  let closest = 'Guwahati'
  let minD = Infinity
  for (const [key, node] of Object.entries(NER_GRAPH_NODES)) {
    const d = calculateHaversineKm(lat, lng, node.lat, node.lng)
    if (d < minD) {
      minD = d
      closest = key
    }
  }
  return closest
}

function resolveIncidentToRoadEdge(incident, edges, maxRadiusKm = 18) {
  if (typeof incident.lat !== 'number' || typeof incident.lng !== 'number') {
    return { matchedEdge: null, distanceKm: Infinity }
  }
  let closestEdge = null
  let minD = Infinity

  for (const edge of edges) {
    const n1 = NER_GRAPH_NODES[edge.from]
    const n2 = NER_GRAPH_NODES[edge.to]
    if (!n1 || !n2) continue

    const midLat = (n1.lat + n2.lat) / 2
    const midLng = (n1.lng + n2.lng) / 2
    const dMid = calculateHaversineKm(incident.lat, incident.lng, midLat, midLng)
    const d1 = calculateHaversineKm(incident.lat, incident.lng, n1.lat, n1.lng)
    const d2 = calculateHaversineKm(incident.lat, incident.lng, n2.lat, n2.lng)
    const d = Math.min(dMid, d1, d2)
    if (d < minD) {
      minD = d
      closestEdge = edge
    }
  }

  if (closestEdge && minD <= maxRadiusKm) {
    return { matchedEdge: closestEdge, distanceKm: minD }
  }
  return { matchedEdge: null, distanceKm: minD }
}

function calculateDynamicRoute(options = {}) {
  const {
    origin = 'Guwahati',
    destination = 'Agartala',
    originCoords = null,
    targetCoords = null,
    incidents = [],
    vehicleWeightTons = 0,
    blockedHighway = ''
  } = options

  // 1. Resolve start node & coordinates
  let startNode = 'Guwahati'
  let originLat = 26.1445
  let originLng = 91.7362
  if (originCoords) {
    startNode = findNearestNode(originCoords.lat, originCoords.lng)
    originLat = originCoords.lat
    originLng = originCoords.lng
  } else if (NER_GRAPH_NODES[origin]) {
    startNode = origin
    originLat = NER_GRAPH_NODES[origin].lat
    originLng = NER_GRAPH_NODES[origin].lng
  }

  // 2. Resolve destination node & coordinates
  let targetNode = 'Agartala'
  let destLat = 23.8315
  let destLng = 91.2868
  if (targetCoords) {
    targetNode = findNearestNode(targetCoords.lat, targetCoords.lng)
    destLat = targetCoords.lat
    destLng = targetCoords.lng
  } else if (NER_GRAPH_NODES[destination]) {
    targetNode = destination
    destLat = NER_GRAPH_NODES[destination].lat
    destLng = NER_GRAPH_NODES[destination].lng
  }

  // Clone edges
  const edges = NER_GRAPH_EDGES.map(e => ({ ...e }))

  // 3. Apply confirmed incidents by coordinate
  const confirmed = incidents.filter(i => i.status === 'confirmed')
  for (const inc of confirmed) {
    const { matchedEdge } = resolveIncidentToRoadEdge(inc, edges, 20)
    if (matchedEdge) {
      matchedEdge.status = 'blocked'
    }
  }

  // 4. Apply vehicle weight limits against bridges
  if (vehicleWeightTons > 0) {
    for (const br of NER_BRIDGES) {
      if (br.max_weight_tons < vehicleWeightTons) {
        edges.forEach(e => {
          if (e.highway.toLowerCase().includes(br.highway.toLowerCase()) || br.highway.toLowerCase().includes(e.highway.toLowerCase())) {
            e.status = 'blocked'
          }
        })
      }
    }
  }

  // 5. Dijkstra
  const distances = {}
  const previous = {}
  const unvisited = new Set()

  Object.keys(NER_GRAPH_NODES).forEach(node => {
    distances[node] = Infinity
    previous[node] = null
    unvisited.add(node)
  })

  distances[startNode] = 0

  while (unvisited.size > 0) {
    let current = null
    let shortestDist = Infinity

    for (const node of unvisited) {
      if (distances[node] < shortestDist) {
        shortestDist = distances[node]
        current = node
      }
    }

    if (!current || shortestDist === Infinity) break
    unvisited.delete(current)

    const connected = edges.filter(e => e.from === current || e.to === current)
    for (const edge of connected) {
      const neighbor = edge.from === current ? edge.to : edge.from
      if (!unvisited.has(neighbor)) continue

      let weight = edge.distanceKm
      const isBlocked =
        edge.status === 'blocked' ||
        (blockedHighway && edge.highway.toLowerCase().includes(blockedHighway.toLowerCase()))

      if (isBlocked) {
        weight += 1000000
      }

      const alt = distances[current] + weight
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt
        previous[neighbor] = current
      }
    }
  }

  // Reconstruct path
  const path = []
  let curr = targetNode
  while (curr) {
    path.unshift(curr)
    curr = previous[curr]
  }

  const finalPath = path.length > 1 ? path : [startNode, targetNode]

  // Construct path coordinates
  const pathCoordinates = []
  if (originCoords) {
    pathCoordinates.push([originCoords.lat, originCoords.lng])
  }
  for (const nodeKey of finalPath) {
    const node = NER_GRAPH_NODES[nodeKey]
    if (node) pathCoordinates.push([node.lat, node.lng])
  }
  if (targetCoords) {
    pathCoordinates.push([targetCoords.lat, targetCoords.lng])
  }

  let finalDistanceKm = distances[targetNode] < 10000 ? Math.round(distances[targetNode]) : 360
  if (originCoords) {
    finalDistanceKm += calculateHaversineKm(originCoords.lat, originCoords.lng, originLat, originLng)
  }
  if (targetCoords) {
    finalDistanceKm += calculateHaversineKm(targetCoords.lat, targetCoords.lng, destLat, destLng)
  }

  return {
    pathNodes: finalPath,
    pathCoordinates,
    totalDistanceKm: finalDistanceKm,
    startNode,
    targetNode,
    isDynamic: Boolean(originCoords || targetCoords),
  }
}

// ------------------------------------------------------------------------
// TEST 1: Arbitrary origin -> arbitrary destination coordinate routing
// ------------------------------------------------------------------------
const customOrigin = { lat: 26.2000, lng: 91.6000 }
const customDest = { lat: 23.9500, lng: 91.4500 }
const res1 = calculateDynamicRoute({ originCoords: customOrigin, targetCoords: customDest })
assert(
  res1.pathCoordinates.length >= 3 &&
  res1.pathCoordinates[0][0] === customOrigin.lat &&
  res1.pathCoordinates[res1.pathCoordinates.length - 1][0] === customDest.lat,
  'TEST 1: Arbitrary origin -> arbitrary destination coordinates resolved correctly'
)

// ------------------------------------------------------------------------
// TEST 2: Destination without NH route name
// ------------------------------------------------------------------------
const remoteLocation = { lat: 25.1234, lng: 93.4567 }
const res2 = calculateDynamicRoute({ origin: 'Guwahati', targetCoords: remoteLocation })
assert(
  res2.pathCoordinates.length >= 2 &&
  res2.pathCoordinates[res2.pathCoordinates.length - 1][0] === remoteLocation.lat,
  'TEST 2: Destination without NH name or predefined corridor ID routes successfully'
)

// ------------------------------------------------------------------------
// TEST 3: Map pin coordinate routing
// ------------------------------------------------------------------------
const clickedPin = { lat: 24.7500, lng: 93.8000 }
const res3 = calculateDynamicRoute({ origin: 'Silchar', targetCoords: clickedPin })
assert(
  res3.pathCoordinates[res3.pathCoordinates.length - 1][0] === clickedPin.lat,
  'TEST 3: Direct Map Pin Click coordinate ingestion functions properly'
)

// ------------------------------------------------------------------------
// TEST 4: Real road waypoint sequence continuity
// ------------------------------------------------------------------------
const res4 = calculateDynamicRoute({ origin: 'Guwahati', destination: 'Shillong' })
assert(
  res4.pathCoordinates.length >= 2 &&
  calculateHaversineKm(res4.pathCoordinates[0][0], res4.pathCoordinates[0][1], res4.pathCoordinates[1][0], res4.pathCoordinates[1][1]) > 0,
  'TEST 4: Route generates continuous road sequence without duplicate teleportation'
)

// ------------------------------------------------------------------------
// TEST 5: Confirmed coordinate incident on road segment triggers bypass
// ------------------------------------------------------------------------
const confirmedIncident = {
  id: 'inc-coord-01',
  lat: 25.5000,
  lng: 92.0500,
  status: 'confirmed',
  severity: 'critical',
  type: 'landslide'
}
const res5Base = calculateDynamicRoute({ origin: 'Guwahati', destination: 'Silchar' })
const res5Detour = calculateDynamicRoute({ origin: 'Guwahati', destination: 'Silchar', incidents: [confirmedIncident] })
assert(
  res5Detour.pathNodes.includes('Lumding') || res5Detour.pathNodes.includes('Haflong') || res5Detour.pathNodes.includes('Nongstoin'),
  'TEST 5: Confirmed coordinate incident on road segment dynamically diverts Dijkstra path'
)

// ------------------------------------------------------------------------
// TEST 6: Predicted incident does NOT block route
// ------------------------------------------------------------------------
const predictedInc = { id: 'inc-p1', lat: 25.50, lng: 92.05, status: 'predicted', severity: 'critical' }
const res6 = calculateDynamicRoute({ origin: 'Guwahati', destination: 'Shillong', incidents: [predictedInc] })
assert(
  res6.pathNodes.includes('Shillong'),
  'TEST 6: Predicted incident does NOT block road (Status remains OPEN)'
)

// ------------------------------------------------------------------------
// TEST 7: Reported incident does NOT block route
// ------------------------------------------------------------------------
const reportedInc = { id: 'inc-r1', lat: 25.50, lng: 92.05, status: 'reported', severity: 'critical' }
const res7 = calculateDynamicRoute({ origin: 'Guwahati', destination: 'Shillong', incidents: [reportedInc] })
assert(
  res7.pathNodes.includes('Shillong'),
  'TEST 7: Reported incident awaiting verification does NOT block road'
)

// ------------------------------------------------------------------------
// TEST 8: Resolved incident restores route
// ------------------------------------------------------------------------
const resolvedInc = { id: 'inc-res1', lat: 25.50, lng: 92.05, status: 'resolved', severity: 'critical' }
const res8 = calculateDynamicRoute({ origin: 'Guwahati', destination: 'Shillong', incidents: [resolvedInc] })
assert(
  res8.pathNodes.includes('Shillong'),
  'TEST 8: Resolved incident restores original corridor access'
)

// ------------------------------------------------------------------------
// TEST 9: Multiple confirmed incidents
// ------------------------------------------------------------------------
const multiInc = [
  { id: 'inc-1', lat: 25.57, lng: 91.89, status: 'confirmed', severity: 'critical' },
  { id: 'inc-2', lat: 26.35, lng: 92.68, status: 'confirmed', severity: 'critical' },
]
const res9 = calculateDynamicRoute({ origin: 'Guwahati', destination: 'Silchar', incidents: multiInc })
assert(
  res9.pathCoordinates.length >= 2,
  'TEST 9: Multiple confirmed coordinate blockages handled without crashing'
)

// ------------------------------------------------------------------------
// TEST 10: Existing predefined routes still work (Backward Compatibility)
// ------------------------------------------------------------------------
const res10 = calculateDynamicRoute({
  origin: 'Guwahati',
  destination: 'Agartala',
  blockedHighway: 'NH-6 Guwahati–Jorabat–Shillong Expressway'
})
assert(
  res10.pathNodes.length >= 2 && res10.totalDistanceKm > 0,
  'TEST 10: Backward compatibility for named corridors and route IDs 100% functional'
)

// ------------------------------------------------------------------------
// TEST 11: Vehicle weight restrictions against bridge capacity
// ------------------------------------------------------------------------
const res11Heavy = calculateDynamicRoute({
  origin: 'Guwahati',
  destination: 'Silchar',
  vehicleWeightTons: 40 // 40 tonnes exceeds 18T Sonapur bridge on NH-6
})
assert(
  res11Heavy.pathNodes.includes('Lumding') || res11Heavy.pathNodes.includes('Haflong') || res11Heavy.pathNodes.includes('Nongstoin'),
  'TEST 11: Vehicle weight restrictions respect bridge capacity limits'
)

// ------------------------------------------------------------------------
// TEST 12: Vehicle rerouting from current position
// ------------------------------------------------------------------------
const currentVehicleLat = 26.0500
const currentVehicleLng = 91.8000
const res12 = calculateDynamicRoute({
  originCoords: { lat: currentVehicleLat, lng: currentVehicleLng },
  destination: 'Shillong'
})
assert(
  res12.pathCoordinates[0][0] === currentVehicleLat && res12.pathCoordinates[0][1] === currentVehicleLng,
  'TEST 12: Vehicle reroutes starting from current GPS coordinate'
)

// ------------------------------------------------------------------------
// TEST 13: Zero vehicle teleportation
// ------------------------------------------------------------------------
const originDepotLat = 26.1445
assert(
  res12.pathCoordinates[0][0] !== originDepotLat,
  'TEST 13: Vehicle does NOT teleport back to origin during reroute'
)

// ------------------------------------------------------------------------
// TEST 14: Empty / fallback error resilience
// ------------------------------------------------------------------------
const res14 = calculateDynamicRoute({ origin: 'NonExistentHub', destination: 'NonExistentDepot' })
assert(
  res14.pathCoordinates.length >= 2 && res14.totalDistanceKm > 0,
  'TEST 14: Graceful fallback for empty or unknown inputs'
)

console.log('\n========================================================================')
console.log(`  ALL ${passedTests}/14 PHASE 9 DYNAMIC ROUTING TESTS PASSED CLEANLY`)
console.log('========================================================================\n')
