import { predictDisruptions, generateMultilingualAlert } from '@/lib/groq'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const action = body.action || 'predict'
    const params = body

    if (action === 'predict') {
      const result = await predictDisruptions({
        weatherForecast: params.weatherForecast || 'Heavy rainfall expected',
        recentIncidents: params.recentIncidents || 'Landslide on NH-37 yesterday',
        district: params.district || 'Manipur',
      })
      return Response.json(result)
    }

    if (action === 'alert') {
      const result = await generateMultilingualAlert({
        incidentType: params.incidentType,
        location: params.location,
        severity: params.severity,
        details: params.details,
      })
      return Response.json(result)
    }

    return Response.json({ error: 'Invalid action. Use "predict" or "alert"' }, { status: 400 })
  } catch (error: unknown) {
    console.error('AI predict error:', error)
    return Response.json({ error: 'AI prediction failed', detail: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
