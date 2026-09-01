import fs from 'fs'
import https from 'https'

function perpendicularDistance(point, lineStart, lineEnd) {
  const [lat, lon] = point
  const [startLat, startLon] = lineStart
  const [endLat, endLon] = lineEnd

  const dx = endLon - startLon
  const dy = endLat - startLat

  if (dx === 0 && dy === 0) {
    return Math.hypot(lat - startLat, lon - startLon)
  }

  let t = ((lon - startLon) * dx + (lat - startLat) * dy) / (dx * dx + dy * dy)
  t = Math.max(0, Math.min(1, t))

  const projLat = startLat + t * dy
  const projLon = startLon + t * dx

  return Math.hypot(lat - projLat, lon - projLon)
}

function douglasPeucker(points, epsilon) {
  if (points.length <= 2) return points

  let maxDist = 0
  let maxIndex = 0
  const start = points[0]
  const end = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], start, end)
    if (d > maxDist) {
      maxDist = d
      maxIndex = i
    }
  }

  if (maxDist > epsilon) {
    const left = douglasPeucker(points.slice(0, maxIndex + 1), epsilon)
    const right = douglasPeucker(points.slice(maxIndex), epsilon)
    return left.slice(0, -1).concat(right)
  } else {
    return [start, end]
  }
}

async function fetchOSRM(waypoints) {
  const points = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${points}?overview=full&geometries=geojson`

  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'NER-Logistics-Platform/1.0' } }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.code === 'Ok' && json.routes && json.routes[0]) {
            const coords = json.routes[0].geometry.coordinates.map(([lng, lat]) => [
              Number(lat.toFixed(5)),
              Number(lng.toFixed(5))
            ])
            const simplified = douglasPeucker(coords, 0.0006)
            resolve(simplified)
          } else {
            resolve(waypoints)
          }
        } catch {
          resolve(waypoints)
        }
      })
    }).on('error', () => resolve(waypoints))
  })
}

async function main() {
  const dataPath = 'lib/data.ts'
  let content = fs.readFileSync(dataPath, 'utf8')

  // We can dynamically extract the INITIAL_NER_ROUTES array
  const match = content.match(/export const INITIAL_NER_ROUTES = (\[[\s\S]*?\n\]\n)/)
  if (!match) {
    console.error('Could not find INITIAL_NER_ROUTES')
    return
  }

  // Parse routes loosely or use eval/Function
  const routesCode = match[1]
  const routes = (new Function(`return ${routesCode}`))()

  console.log(`Enriching ${routes.length} National Highway corridors with real OSRM road geometry...`)

  for (let i = 0; i < routes.length; i++) {
    const r = routes[i]
    console.log(`[${i+1}/${routes.length}] Fetching real road for ${r.highway_number || r.name}...`)
    const realCoords = await fetchOSRM(r.coordinates)
    console.log(`  -> ${r.coordinates.length} waypoints -> ${realCoords.length} real road curve points`)
    r.coordinates = realCoords
    await new Promise(r => setTimeout(r, 400)) // rate limit polite delay
  }

  const updatedRoutesJson = JSON.stringify(routes, null, 2)
  const updatedCode = `export const INITIAL_NER_ROUTES = ${updatedRoutesJson}\n`

  content = content.replace(match[0], updatedCode)
  fs.writeFileSync(dataPath, content, 'utf8')
  console.log('Successfully updated lib/data.ts with real road network geometry!')
}

main()

