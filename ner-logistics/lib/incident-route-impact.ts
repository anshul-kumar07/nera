import { Incident } from '@/lib/supabase'
import { ActiveRoute, calculateHaversineKm, GraphEdge, GraphNode, NER_GRAPH_NODES } from '@/lib/routing-algorithm'
import { NER_STRATEGIC_BRIDGES, NER_STRATEGIC_PASSES } from '@/lib/data'

export interface RouteImpactResolution {
  matchedRoute: ActiveRoute | null
  matchReason: string
}

export interface EdgeImpactResolution {
  matchedEdge: GraphEdge | null
  distanceKm: number
  matchReason: string
}

export interface RouteChangeDetails {
  previousRoute: string
  newRoute: string
  previousDistanceKm: number
  newDistanceKm: number
  deltaDistanceKm: number
  previousDurationHours: number
  newDurationHours: number
  deltaMinutes: number
  previousRisk: string
  newRisk: string
  reason: string
  incidentId?: string
  timestamp: string
  bridgeSafetyPassed: boolean
  bridgeSafetyLabel?: string
}

/**
 * Associates an incident with a route:
 * 1. Checks incident.route_id === route.id
 * 2. Checks incident.infrastructure_id (matches bridge/pass associated highway)
 * 3. Checks geographic proximity (incident lat/lng within 18 km of route coordinates)
 * 4. Checks route_name match
 */
export function resolveIncidentToRoute(
  incident: Incident,
  routes: ActiveRoute[]
): RouteImpactResolution {
  // 1. Direct route_id match
  if (incident.route_id) {
    const found = routes.find(r => r.id === incident.route_id)
    if (found) return { matchedRoute: found, matchReason: 'Direct route_id match' }
  }

  // 2. Infrastructure ID match (bridges / passes)
  if (incident.infrastructure_id) {
    const bridge = NER_STRATEGIC_BRIDGES.find(b => b.id === incident.infrastructure_id)
    if (bridge) {
      const found = routes.find(
        r =>
          r.name.toLowerCase().includes(bridge.highway.toLowerCase()) ||
          (r.highway_number && bridge.highway.includes(r.highway_number))
      )
      if (found) return { matchedRoute: found, matchReason: `Associated via infrastructure: ${bridge.name}` }
    }

    const pass = NER_STRATEGIC_PASSES.find(p => p.id === incident.infrastructure_id)
    if (pass) {
      const found = routes.find(
        r =>
          r.name.toLowerCase().includes(pass.highway.toLowerCase()) ||
          (r.highway_number && pass.highway.includes(r.highway_number))
      )
      if (found) return { matchedRoute: found, matchReason: `Associated via strategic pass: ${pass.name}` }
    }
  }

  // 3. Exact or substring route_name match
  if (incident.route_name) {
    const found = routes.find(
      r =>
        r.name.toLowerCase() === incident.route_name!.toLowerCase() ||
        r.name.toLowerCase().includes(incident.route_name!.toLowerCase()) ||
        incident.route_name!.toLowerCase().includes(r.name.toLowerCase())
    )
    if (found) return { matchedRoute: found, matchReason: 'Corridor name match' }
  }

  // 4. Geographic proximity match (within 18 km of polyline)
  if (typeof incident.lat === 'number' && typeof incident.lng === 'number') {
    let closestRoute: ActiveRoute | null = null
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

/**
 * Associates an incident with a road network edge by geographic coordinates:
 * Finds closest road edge within maxRadiusKm (default 18 km).
 */
export function resolveIncidentToRoadEdge(
  incident: Incident,
  edges: GraphEdge[],
  nodes: Record<string, GraphNode> = NER_GRAPH_NODES,
  maxRadiusKm: number = 18
): EdgeImpactResolution {
  if (typeof incident.lat !== 'number' || typeof incident.lng !== 'number') {
    return { matchedEdge: null, distanceKm: Infinity, matchReason: 'Invalid incident coordinates' }
  }

  let closestEdge: GraphEdge | null = null
  let minDistanceKm = Infinity

  for (const edge of edges) {
    const nodeFrom = nodes[edge.from]
    const nodeTo = nodes[edge.to]
    if (!nodeFrom || !nodeTo) continue

    const midLat = (nodeFrom.lat + nodeTo.lat) / 2
    const midLng = (nodeFrom.lng + nodeTo.lng) / 2
    const dMid = calculateHaversineKm(incident.lat, incident.lng, midLat, midLng)
    const dFrom = calculateHaversineKm(incident.lat, incident.lng, nodeFrom.lat, nodeFrom.lng)
    const dTo = calculateHaversineKm(incident.lat, incident.lng, nodeTo.lat, nodeTo.lng)

    let dCoordMin = Infinity
    if (edge.coordinates && edge.coordinates.length > 0) {
      for (const pt of edge.coordinates) {
        const d = calculateHaversineKm(incident.lat, incident.lng, pt[0], pt[1])
        if (d < dCoordMin) dCoordMin = d
      }
    }

    const effectiveDist = Math.min(dMid, dFrom, dTo, dCoordMin)
    if (effectiveDist < minDistanceKm) {
      minDistanceKm = effectiveDist
      closestEdge = edge
    }
  }

  if (closestEdge && minDistanceKm <= maxRadiusKm) {
    return {
      matchedEdge: closestEdge,
      distanceKm: minDistanceKm,
      matchReason: `Coordinate proximity to road edge ${closestEdge.from}–${closestEdge.to} (${minDistanceKm.toFixed(1)} km)`,
    }
  }

  return { matchedEdge: null, distanceKm: minDistanceKm, matchReason: 'No road edge within impact radius' }
}

/**
 * Evaluates operational impact for a confirmed incident
 */
export function determineIncidentImpact(incident: Incident): 'blocked' | 'damaged' | 'at_risk' | 'open' {
  // Only CONFIRMED incidents affect operational route status
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

/**
 * Derives operational route accessibility:
 * BASE ROUTES + ACTIVE CONFIRMED INCIDENTS = CURRENT ACCESSIBILITY
 *
 * Handles multiple incidents per route:
 * - If any confirmed incident on route is 'blocked', route is 'blocked'.
 * - Else if any is 'damaged', route is 'damaged'.
 * - Else if any is 'at_risk', route is 'at_risk'.
 * - If no active confirmed incidents on route, base status is preserved.
 */
export function deriveOperationalRoutes(
  baseRoutes: ActiveRoute[],
  incidents: Incident[]
): {
  operationalRoutes: ActiveRoute[]
  routeImpactMap: Map<string, { impact: 'blocked' | 'damaged' | 'at_risk' | 'open'; incidents: Incident[] }>
} {
  const confirmedIncidents = incidents.filter(i => i.status === 'confirmed')
  const routeImpactMap = new Map<string, { impact: 'blocked' | 'damaged' | 'at_risk' | 'open'; incidents: Incident[] }>()

  // Map confirmed incidents to routes
  for (const inc of confirmedIncidents) {
    const { matchedRoute } = resolveIncidentToRoute(inc, baseRoutes)
    const routeKey = matchedRoute?.id || matchedRoute?.name
    if (routeKey) {
      const impact = determineIncidentImpact(inc)
      const existing = routeImpactMap.get(routeKey) || { impact: 'open', incidents: [] }
      existing.incidents.push(inc)

      // Priority ranking: blocked > damaged > at_risk > open
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
    // Return original base route without permanent mutation
    return { ...baseRoute }
  })

  return { operationalRoutes, routeImpactMap }
}

