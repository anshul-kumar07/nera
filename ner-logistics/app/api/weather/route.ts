import { fetchLiveNERWeather } from '@/lib/weather'
import { NER_DISTRICTS } from '@/lib/data'
import { NextRequest } from 'next/server'

export const revalidate = 300 // cache 5 minutes

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const districtName = searchParams.get('district')

  if (districtName) {
    const found = NER_DISTRICTS.find(
      d => d.name.toLowerCase().includes(districtName.toLowerCase()) || districtName.toLowerCase().includes(d.name.toLowerCase())
    ) || NER_DISTRICTS[0]

    const weather = await fetchLiveNERWeather(found.lat, found.lng, found.name, found.state)
    return Response.json(weather)
  }

  // Fetch summary for major NER hubs
  const majorHubs = [
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362 },
    { name: 'Shillong', state: 'Meghalaya', lat: 25.5788, lng: 91.8933 },
    { name: 'Imphal', state: 'Manipur', lat: 24.8170, lng: 93.9368 },
    { name: 'Aizawl', state: 'Mizoram', lat: 23.7271, lng: 92.7176 },
    { name: 'Kohima', state: 'Nagaland', lat: 25.6701, lng: 94.1077 },
    { name: 'Agartala', state: 'Tripura', lat: 23.8315, lng: 91.2868 },
    { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.0844, lng: 93.6053 },
    { name: 'Gangtok', state: 'Sikkim', lat: 27.3389, lng: 88.6065 },
  ]

  const weatherList = await Promise.all(
    majorHubs.map(hub => fetchLiveNERWeather(hub.lat, hub.lng, hub.name, hub.state))
  )

  return Response.json(weatherList)
}
