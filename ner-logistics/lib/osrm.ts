// Real-Road Routing Service using Open Source Routing Machine (OSRM)
// Converts discrete origin/destination waypoints into real-world highway & street GeoJSON curves
// Fully compliant with OpenStreetMap and offline-resilient with in-memory caching

export interface OSRMRouteResult {
  coordinates: [number, number][]
  distanceKm: number
  durationHours: number
  isRealRoad: boolean
}

// In-memory cache to prevent duplicate network calls across React renders
const routeCache = new Map<string, OSRMRouteResult>()

// Helper to create a cache key from waypoints (rounded to 4 decimal places for GPS precision)
function createCacheKey(waypoints: [number, number][]): string {
  return waypoints.map(([lat, lng]) => `${lat.toFixed(4)},${lng.toFixed(4)}`).join(';')
}

/**
 * Fetches real road driving geometry between two or more waypoints using OSRM.
 * @param waypoints Array of [latitude, longitude] pairs.
 * @param timeoutMs Maximum wait time before falling back gracefully.
 * @returns OSRMRouteResult with road geometry, distance, and duration.
 */
export async function fetchOSRMRoute(
  waypoints: [number, number][],
  timeoutMs: number = 4500
): Promise<OSRMRouteResult> {
  if (!waypoints || waypoints.length < 2) {
    return {
      coordinates: waypoints || [],
      distanceKm: 0,
      durationHours: 0,
      isRealRoad: false,
    }
  }

  const cacheKey = createCacheKey(waypoints)
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!
  }

  // OSRM expects coordinates in "longitude,latitude" format
  const coordString = waypoints.map(([lat, lng]) => `${lng.toFixed(6)},${lat.toFixed(6)}`).join(';')
  const baseUrl = process.env.OSRM_ROUTING_ENDPOINT || 'https://router.project-osrm.org'
  const url = `${baseUrl}/route/v1/driving/${coordString}?overview=full&geometries=geojson`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NER-Logistics-Intelligence/1.0',
      },
    })
    clearTimeout(timer)

    if (!res.ok) {
      throw new Error(`OSRM HTTP status ${res.status}`)
    }

    const data = await res.json()

    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const primaryRoute = data.routes[0]
      // Invert GeoJSON [lng, lat] back to Leaflet [lat, lng]
      const roadCoordinates: [number, number][] = primaryRoute.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      )

      const result: OSRMRouteResult = {
        coordinates: roadCoordinates,
        distanceKm: Math.round((primaryRoute.distance || 0) / 1000),
        durationHours: parseFloat(((primaryRoute.duration || 0) / 3600).toFixed(2)),
        isRealRoad: true,
      }

      // Cache successful route
      routeCache.set(cacheKey, result)
      return result
    } else {
      throw new Error(`OSRM returned code: ${data.code}`)
    }
  } catch (error: unknown) {
    console.warn(
      'OSRM road routing unavailable, using baseline waypoint geometry fallback:',
      error instanceof Error ? error.message : String(error)
    )

    // Graceful fallback: return original waypoints without throwing
    const fallbackResult: OSRMRouteResult = {
      coordinates: waypoints,
      distanceKm: 0,
      durationHours: 0,
      isRealRoad: false,
    }
    return fallbackResult
  }
}

