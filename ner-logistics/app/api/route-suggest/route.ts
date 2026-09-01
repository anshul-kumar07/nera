import { suggestAlternateRoute } from '@/lib/groq'
import { findShortestAlternatePath, deduceCorridorFromCoordinates } from '@/lib/routing-algorithm'
import { INITIAL_NER_ROUTES } from '@/lib/data'
import { fetchOSRMRoute } from '@/lib/osrm'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      blockedRoute,
      availableRoutes: _availableRoutes,
      cargoType,
      district,
      weatherCondition,
      origin,
      originCoords,
      destination,
      destinationCoords,
      customTargetCoords,
      incidents,
      vehicleWeightTons,
      impactRadiusKm,
    } = body

    const targetCoords = customTargetCoords || destinationCoords || null

    // 1. Run Multi-Modal Dijkstra & Meteorological Gatekeeper Routing Engine
    const algoResult = findShortestAlternatePath(
      origin || 'Guwahati',
      destination || 'Agartala',
      blockedRoute || '',
      INITIAL_NER_ROUTES,
      targetCoords,
      cargoType || 'medicine',
      weatherCondition || 'clear',
      {
        originCoords: originCoords || null,
        targetCoords: targetCoords,
        incidents: Array.isArray(incidents) ? incidents : undefined,
        vehicleWeightTons: typeof vehicleWeightTons === 'number' ? vehicleWeightTons : undefined,
        impactRadiusKm: typeof impactRadiusKm === 'number' ? impactRadiusKm : undefined,
      }
    )

    // Deduce accurate regional context if target pin was clicked
    let geographicContext = district || destination || 'NER'
    if (targetCoords) {
      const deduced = deduceCorridorFromCoordinates(targetCoords.lat, targetCoords.lng)
      geographicContext = deduced.regionName
    }

    // Find predefined disaster profile for the compromised corridor if any
    const blockedObj = INITIAL_NER_ROUTES.find(
      r =>
        (blockedRoute && r.name.toLowerCase().includes(blockedRoute.toLowerCase())) ||
        (blockedRoute && blockedRoute.toLowerCase().includes(r.name.toLowerCase())) ||
        (blockedRoute && r.highway_number && blockedRoute.includes(r.highway_number))
    )

    // 2. Feed algorithmic result into Groq AI Engine for terrain, monsoon & cargo reasoning
    let aiResult = {
      recommended_route: algoResult.recommendedHighway,
      estimated_delay_hours: algoResult.estimatedHours,
      reason: algoResult.vehicleTelemetry.routingReason,
      risk_level: algoResult.vehicleTelemetry.isWeatherDelayed ? 'medium' : 'low',
      special_instructions: algoResult.vehicleTelemetry.isWeatherDelayed
        ? 'Adverse mountain weather active. Helicopter deployed via IFR low-altitude tactical corridor with Doppler weather radar at reduced speed (135 km/h) with weather holding delay.'
        : 'Clear flight conditions. Standard direct high-speed flight corridor at 240 km/h.',
    }

    try {
      const groqResult = await suggestAlternateRoute({
        blockedRoute: blockedRoute || 'Normal Operations (Baseline Routing)',
        availableRoutes: [algoResult.recommendedHighway],
        cargoType: cargoType || 'medicine',
        district: geographicContext,
        weatherCondition: algoResult.vehicleTelemetry.weatherStatusLabel,
      })
      if (groqResult && groqResult.recommended_route) {
        aiResult = {
          ...aiResult,
          ...groqResult,
          recommended_route: algoResult.recommendedHighway, // keep deterministic geographical corridor
          estimated_delay_hours: algoResult.estimatedHours,
          reason: groqResult.reason || algoResult.vehicleTelemetry.routingReason,
        }
      }
    } catch (groqErr) {
      console.warn('Groq AI fallback to deterministic graph route:', groqErr)
    }

    // 3. Resolve Real Road Geometry via OSRM for ground logistics (Air airlift remains direct flight corridor)
    let finalPathCoordinates = algoResult.pathCoordinates
    let isRealRoad = false

    if (algoResult.vehicleTelemetry.transportMode !== 'air_helicopter') {
      try {
        const osrmResult = await fetchOSRMRoute(algoResult.pathCoordinates)
        if (osrmResult.isRealRoad && osrmResult.coordinates.length > 1) {
          finalPathCoordinates = osrmResult.coordinates
          isRealRoad = true
        }
      } catch (osrmErr) {
        console.warn('OSRM route resolution fallback:', osrmErr)
      }
    }

    return Response.json({
      recommended_route: aiResult.recommended_route,
      estimated_delay_hours: algoResult.estimatedHours,
      reason: aiResult.reason,
      risk_level: aiResult.risk_level,
      special_instructions: aiResult.special_instructions,
      algorithm_applied: algoResult.algorithmUsed,
      distance_km: algoResult.totalDistanceKm,
      waypoints: algoResult.pathNodes,
      path_coordinates: finalPathCoordinates,
      is_real_road_network: isRealRoad,
      vehicle_telemetry: algoResult.vehicleTelemetry,
      disrupted_corridor: blockedRoute || null,
      disruption_profile: blockedObj?.disruption_info || null,
      region_name: geographicContext,
      last_mile_accessibility: algoResult.lastMileAccessibility || null,
    })
  } catch (error: unknown) {
    console.error('Route suggest error:', error)
    return Response.json({ error: 'AI route suggestion failed', detail: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
