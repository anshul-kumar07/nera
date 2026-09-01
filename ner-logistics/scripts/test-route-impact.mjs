// Phase 4: Incident -> Route Impact Automated Verification Suite

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

function resolveIncidentToRoute(incident, routes) {
  if (incident.route_id) {
    const found = routes.find(r => r.id === incident.route_id)
    if (found) return { matchedRoute: found, matchReason: 'Direct route_id match' }
  }

  if (incident.route_name) {
    const found = routes.find(
      r =>
        r.name.toLowerCase() === incident.route_name.toLowerCase() ||
        r.name.toLowerCase().includes(incident.route_name.toLowerCase()) ||
        incident.route_name.toLowerCase().includes(r.name.toLowerCase())
    )
    if (found) return { matchedRoute: found, matchReason: 'Corridor name match' }
  }

  if (typeof incident.lat === 'number' && typeof incident.lng === 'number') {
    let closestRoute = null
    let minDistanceKm = Infinity

    for (const route of routes) {
      if (!route.coordinates || !Array.isArray(route.coordinates)) continue
      for (const pt of route.coordinates) {
        if (Array.isArray(pt) && pt.length >= 2) {
          const lat = Number(pt[0])
          const lng = Number(pt[1])
          if (!isNaN(lat) && !isNaN(lng)) {
            const d = calculateHaversineKm(incident.lat, incident.lng, lat, lng)
            if (d < minDistanceKm) {
              minDistanceKm = d
              closestRoute = route
            }
          }
        }
      }
    }

    if (closestRoute && minDistanceKm <= 18) {
      return {
        matchedRoute: closestRoute,
        matchReason: `Geographic proximity match (${minDistanceKm.toFixed(1)} km from corridor)`,
      }
    }
  }

  return { matchedRoute: null, matchReason: 'No confident route association found' }
}

function determineIncidentImpact(incident) {
  if (incident.status !== 'confirmed') return 'open'

  const type = (incident.type || incident.incident_type || '').toLowerCase()
  const severity = (incident.severity || 'high').toLowerCase()

  if (type === 'bridge_failure' || severity === 'critical' || type === 'landslide') {
    return 'blocked'
  }
  if (type === 'road_damage' || severity === 'high') {
    return 'damaged'
  }
  if (type === 'flood' || type === 'congestion' || severity === 'medium') {
    return 'at_risk'
  }
  return 'at_risk'
}

function deriveOperationalRoutes(baseRoutes, incidents) {
  const confirmedIncidents = incidents.filter(i => i.status === 'confirmed')
  const routeImpactMap = new Map()

  for (const inc of confirmedIncidents) {
    const { matchedRoute } = resolveIncidentToRoute(inc, baseRoutes)
    const routeKey = matchedRoute?.id || matchedRoute?.name
    if (routeKey) {
      const impact = determineIncidentImpact(inc)
      const existing = routeImpactMap.get(routeKey) || { impact: 'open', incidents: [] }
      existing.incidents.push(inc)

      if (impact === 'blocked' || existing.impact === 'blocked') {
        existing.impact = 'blocked'
      } else if (impact === 'damaged' || existing.impact === 'damaged') {
        existing.impact = 'damaged'
      } else if (impact === 'at_risk' || existing.impact === 'at_risk') {
        existing.impact = 'at_risk'
      }

      routeImpactMap.set(routeKey, existing)
    }
  }

  const operationalRoutes = baseRoutes.map(baseRoute => {
    const routeKey = baseRoute.id || baseRoute.name
    const impactInfo = routeKey ? routeImpactMap.get(routeKey) : null

    if (impactInfo && impactInfo.impact !== 'open') {
      const primaryInc = impactInfo.incidents[0]
      return {
        ...baseRoute,
        status: impactInfo.impact,
        disruption_info: {
          hazard_class: primaryInc.type || 'Disruption',
          trigger: `Confirmed Incident (${impactInfo.incidents.length} active report${impactInfo.incidents.length > 1 ? 's' : ''})`,
          impact: primaryInc.description || 'Confirmed operational disruption.',
        },
      }
    }
    return { ...baseRoute }
  })

  return { operationalRoutes, routeImpactMap }
}

const MOCK_BASE_ROUTES = [
  {
    id: 'route-nh6',
    name: 'NH-6 Guwahati–Jorabat–Shillong Expressway',
    highway_number: 'NH-6',
    status: 'open',
    state: 'Meghalaya',
    coordinates: [
      [26.1445, 91.7362],
      [26.0500, 91.8000],
      [25.8500, 91.8000],
      [25.5788, 91.8933],
    ],
  },
  {
    id: 'route-nh106',
    name: 'NH-106 Nongstoin–Shillong High Plateau Bypass',
    highway_number: 'NH-106',
    status: 'open',
    state: 'Meghalaya',
    coordinates: [
      [26.1445, 91.7362],
      [25.5167, 91.2667],
      [25.5788, 91.8933],
    ],
  },
  {
    id: 'route-nh8',
    name: 'NH-8 Churaibari–Agartala–Sabroom Lifeline Highway',
    highway_number: 'NH-8',
    status: 'open',
    state: 'Tripura',
    coordinates: [
      [24.8333, 92.7789],
      [23.8315, 91.2868],
    ],
  },
]

function runRouteImpactTests() {
  console.log('========================================================================')
  console.log('         PHASE 4: INCIDENT -> ROUTE IMPACT VERIFICATION SUITE           ')
  console.log('========================================================================\n')

  let passedTests = 0
  let totalTests = 0

  function assert(condition, testName, details = '') {
    totalTests++
    if (condition) {
      passedTests++
      console.log(`✅ [PASS] ${testName}`)
      if (details) console.log(`   └─ ${details}`)
    } else {
      console.error(`❌ [FAIL] ${testName}`)
      if (details) console.error(`   └─ ${details}`)
    }
  }

  // TEST 1: PREDICTED incident does NOT block route
  const predictedInc = {
    id: 'inc-p1',
    route_id: 'route-nh6',
    type: 'landslide',
    severity: 'critical',
    status: 'predicted',
    lat: 25.85,
    lng: 91.80,
  }
  const res1 = deriveOperationalRoutes(MOCK_BASE_ROUTES, [predictedInc])
  const nh6_1 = res1.operationalRoutes.find(r => r.id === 'route-nh6')
  assert(
    nh6_1.status === 'open',
    'TEST 1: PREDICTED incident does NOT block route',
    `Expected status 'open', got '${nh6_1.status}'`
  )

  // TEST 2: REPORTED incident does NOT block route
  const reportedInc = {
    id: 'inc-r1',
    route_id: 'route-nh6',
    type: 'landslide',
    severity: 'critical',
    status: 'reported',
    lat: 25.85,
    lng: 91.80,
  }
  const res2 = deriveOperationalRoutes(MOCK_BASE_ROUTES, [reportedInc])
  const nh6_2 = res2.operationalRoutes.find(r => r.id === 'route-nh6')
  assert(
    nh6_2.status === 'open',
    'TEST 2: REPORTED incident does NOT block route',
    `Expected status 'open', got '${nh6_2.status}'`
  )

  // TEST 3: CONFIRMED incident blocks affected route
  const confirmedInc = {
    id: 'inc-c1',
    route_id: 'route-nh6',
    type: 'landslide',
    severity: 'critical',
    status: 'confirmed',
    lat: 25.85,
    lng: 91.80,
    description: 'Boulders blocking carriageway near Ri-Bhoi.',
  }
  const res3 = deriveOperationalRoutes(MOCK_BASE_ROUTES, [confirmedInc])
  const nh6_3 = res3.operationalRoutes.find(r => r.id === 'route-nh6')
  assert(
    nh6_3.status === 'blocked',
    'TEST 3: CONFIRMED incident alters operational status to BLOCKED',
    `Expected status 'blocked', got '${nh6_3.status}'`
  )

  // TEST 4: Unrelated route remains completely unaffected
  const nh8_3 = res3.operationalRoutes.find(r => r.id === 'route-nh8')
  assert(
    nh8_3.status === 'open',
    'TEST 4: Unrelated corridor (NH-8 Tripura) remains OPEN',
    `Status: ${nh8_3.status}`
  )

  // TEST 5: Nullable route_id resolved via geographic proximity (within 18 km)
  const proximityInc = {
    id: 'inc-geo1',
    route_id: null,
    type: 'bridge_failure',
    severity: 'high',
    status: 'confirmed',
    lat: 25.852,
    lng: 91.803,
    description: 'Culvert fracture on highway.',
  }
  const resolved = resolveIncidentToRoute(proximityInc, MOCK_BASE_ROUTES)
  assert(
    resolved.matchedRoute && resolved.matchedRoute.id === 'route-nh6',
    'TEST 5: Nullable route_id resolved via coordinates proximity',
    `Matched route: ${resolved.matchedRoute?.name} (${resolved.matchReason})`
  )

  // TEST 6: Multiple incidents on same route (Resolving 1 of 2 keeps route affected)
  const incA = {
    id: 'inc-a',
    route_id: 'route-nh6',
    type: 'landslide',
    severity: 'critical',
    status: 'confirmed',
    lat: 25.85,
    lng: 91.80,
  }
  const incB = {
    id: 'inc-b',
    route_id: 'route-nh6',
    type: 'flood',
    severity: 'high',
    status: 'confirmed',
    lat: 26.05,
    lng: 91.80,
  }
  const resMulti1 = deriveOperationalRoutes(MOCK_BASE_ROUTES, [incA, incB])
  const nh6_multi1 = resMulti1.operationalRoutes.find(r => r.id === 'route-nh6')
  assert(
    nh6_multi1.status === 'blocked',
    'TEST 6a: 2 confirmed incidents on NH-6 -> route is BLOCKED',
    `Status: ${nh6_multi1.status}`
  )

  // Resolve incident A (inc-a becomes resolved, inc-b remains confirmed)
  const incA_resolved = { ...incA, status: 'resolved' }
  const resMulti2 = deriveOperationalRoutes(MOCK_BASE_ROUTES, [incA_resolved, incB])
  const nh6_multi2 = resMulti2.operationalRoutes.find(r => r.id === 'route-nh6')
  assert(
    nh6_multi2.status === 'damaged' || nh6_multi2.status === 'at_risk' || nh6_multi2.status === 'blocked',
    'TEST 6b: Resolving 1 of 2 incidents keeps corridor operational impact active',
    `Status: ${nh6_multi2.status}`
  )

  // Resolve incident B as well -> Route returns to base 'open' status
  const incB_resolved = { ...incB, status: 'resolved' }
  const resMulti3 = deriveOperationalRoutes(MOCK_BASE_ROUTES, [incA_resolved, incB_resolved])
  const nh6_multi3 = resMulti3.operationalRoutes.find(r => r.id === 'route-nh6')
  assert(
    nh6_multi3.status === 'open',
    'TEST 6c: Resolving ALL confirmed incidents restores corridor to OPEN',
    `Status: ${nh6_multi3.status}`
  )

  console.log('\n========================================================================')
  console.log(`           SUMMARY: ${passedTests}/${totalTests} TESTS PASSED CLEANLY             `)
  console.log('========================================================================\n')

  if (passedTests !== totalTests) {
    process.exit(1)
  }
}

runRouteImpactTests()

