import { NextRequest } from 'next/server'
import { fetchOSRMRoute } from '@/lib/osrm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { waypoints } = body

    if (!waypoints || !Array.isArray(waypoints) || waypoints.length < 2) {
      return Response.json(
        { error: 'Invalid waypoints. Provide an array of at least 2 [lat, lng] coordinates.' },
        { status: 400 }
      )
    }

    const result = await fetchOSRMRoute(waypoints)
    return Response.json(result)
  } catch (error: unknown) {
    console.error('API /api/osrm-route error:', error)
    return Response.json(
      { error: 'OSRM routing failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

