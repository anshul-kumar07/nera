// Phase 6: AI Disruption Prediction & Weather Risk Intelligence Verification Suite

const NER_TERRAIN_VULNERABILITY = {
  'NH-6': { terrainType: 'Steep Khasi-Jaintia Mountain Ghats', slopeRisk: 22, historicalDisruptions: 14 },
  'NH-37': { terrainType: 'Barak-Imphal Fractured Hill Terrain', slopeRisk: 24, historicalDisruptions: 18 },
  'NH-2': { terrainType: 'Naga Mountain Foothills & Soft Silt', slopeRisk: 20, historicalDisruptions: 11 },
  'NH-13': { terrainType: 'High-Altitude Arunachal Seismically Active Slopes', slopeRisk: 25, historicalDisruptions: 16 },
  'NH-10': { terrainType: 'Teesta River Gorge Active Sinking Zone', slopeRisk: 25, historicalDisruptions: 22 },
  'NH-54': { terrainType: 'Mizo Hills Clay Shale Terrain', slopeRisk: 21, historicalDisruptions: 12 },
  'NH-27': { terrainType: 'Brahmaputra Floodplain Alluvial Plain', slopeRisk: 8, historicalDisruptions: 5 },
  'NH-106': { terrainType: 'West Khasi High-Altitude Plateau', slopeRisk: 14, historicalDisruptions: 4 },
}

function evaluateCorridorDisruptionRisk(route, weatherInfo, activeIncidents = [], activeFleet = []) {
  const corridorKey = route.highway_number || (route.name.includes('NH-') ? route.name.split(' ')[0] : 'NH-27')
  const terrainProfile = NER_TERRAIN_VULNERABILITY[corridorKey] || {
    terrainType: 'NER Regional Highway Corridor',
    slopeRisk: 12,
    historicalDisruptions: 3,
  }

  const factors = []
  const explanations = []
  let totalScore = 0

  // 1. Weather Factor (Max 35 points)
  let weatherScore = 5
  let weatherDetail = 'Fair weather or standard seasonal atmospheric conditions.'
  const weatherSource = weatherInfo?.source || 'Open-Meteo Satellite Feed'

  if (weatherInfo) {
    const rain = weatherInfo.rain || weatherInfo.precipitation || 0
    if (rain > 15 || (weatherInfo.weatherCondition && weatherInfo.weatherCondition.toLowerCase().includes('torrential'))) {
      weatherScore = 35
      weatherDetail = `Severe precipitation recorded (${rain} mm/h) with high runoff saturation.`
      explanations.push(`Heavy precipitation (${rain} mm/h) exceeds mountain slope absorption threshold.`)
    } else if (rain > 6 || (weatherInfo.weatherCondition && weatherInfo.weatherCondition.toLowerCase().includes('rain'))) {
      weatherScore = 24
      weatherDetail = `Moderate to heavy rain (${rain} mm/h).`
      explanations.push(`Rainfall rate (${rain} mm/h) elevating landslide risk.`)
    } else if (rain > 1) {
      weatherScore = 12
      weatherDetail = `Light rain showers (${rain} mm/h).`
    }
  } else {
    weatherDetail = 'Live weather feed unavailable — using regional baseline.'
  }

  factors.push({
    category: 'Meteorological & Rain Index',
    scoreContribution: weatherScore,
    maxPossible: 35,
    detail: weatherDetail,
    source: weatherSource,
  })
  totalScore += weatherScore

  // 2. Terrain & Slope (Max 25 points)
  factors.push({
    category: 'Terrain & Slope Susceptibility',
    scoreContribution: terrainProfile.slopeRisk,
    maxPossible: 25,
    detail: `${terrainProfile.terrainType} with high incline gradients.`,
    source: 'NER Geological Survey of India Terrain Matrix',
  })
  totalScore += terrainProfile.slopeRisk
  if (terrainProfile.slopeRisk >= 20) {
    explanations.push(`Steep gradient terrain (${terrainProfile.terrainType}) historically susceptible to slip fractures.`)
  }

  // 3. Historical Frequency (Max 25 points)
  let histScore = 5
  if (terrainProfile.historicalDisruptions > 15) {
    histScore = 25
    explanations.push(`High historical disruption frequency (${terrainProfile.historicalDisruptions} recorded landslides).`)
  } else if (terrainProfile.historicalDisruptions > 8) {
    histScore = 16
    explanations.push(`Moderate historical disruption frequency (${terrainProfile.historicalDisruptions} past incidents).`)
  } else {
    histScore = 8
  }

  factors.push({
    category: 'Historical Incident Frequency',
    scoreContribution: histScore,
    maxPossible: 25,
    detail: `${terrainProfile.historicalDisruptions} verified historical disruptions.`,
    source: 'State Disaster Management Authority (SDMA) Incident Registry',
  })
  totalScore += histScore

  // 4. Active Field Signal (Max 15 points)
  const unconfirmedReports = activeIncidents.filter(
    i =>
      i.status === 'reported' &&
      (i.route_id === route.id ||
        (i.route_name && route.name.toLowerCase().includes(i.route_name.toLowerCase())))
  )

  let fieldScore = 0
  let fieldDetail = 'No pending ground reports on this sector.'
  let hasFieldValidation = false

  if (unconfirmedReports.length > 0) {
    fieldScore = 15
    fieldDetail = `${unconfirmedReports.length} pending field report(s) logged by patrol units.`
    explanations.push(`Unconfirmed ground report submitted: "${unconfirmedReports[0].description}" (Awaiting verification).`)
    hasFieldValidation = true
  }

  factors.push({
    category: 'Active Field Observations',
    scoreContribution: fieldScore,
    maxPossible: 15,
    detail: fieldDetail,
    source: 'Ground Observer & Highway Patrol Signal',
  })
  totalScore += fieldScore

  const clampedScore = Math.min(100, Math.max(0, totalScore))

  let riskLevel = 'LOW'
  if (clampedScore >= 75) riskLevel = 'CRITICAL'
  else if (clampedScore >= 55) riskLevel = 'HIGH'
  else if (clampedScore >= 35) riskLevel = 'MEDIUM'

  let hazardCategory = 'LANDSLIDE_RISK'
  if (terrainProfile.terrainType.includes('Floodplain')) hazardCategory = 'FLOOD_RISK'
  else if (weatherScore >= 30) hazardCategory = 'HEAVY_RAINFALL_DISRUPTION'

  const vehicleInCorridor = activeFleet.find(
    v =>
      v.status === 'IN_TRANSIT' &&
      (v.currentRouteName.toLowerCase().includes(route.name.toLowerCase()) ||
        route.name.toLowerCase().includes(v.currentRouteName.toLowerCase()))
  )

  const criticalShipmentAtRisk =
    vehicleInCorridor && (vehicleInCorridor.priority === 'CRITICAL' || vehicleInCorridor.priority === 'HIGH')
      ? {
          vehicleId: vehicleInCorridor.vehicleId,
          cargoType: vehicleInCorridor.cargoType,
          driverName: vehicleInCorridor.driverName,
          etaClockTime: vehicleInCorridor.etaClockTime,
        }
      : null

  return {
    corridorId: route.id,
    corridorName: route.name,
    riskLevel,
    riskScore: clampedScore,
    hazardCategory,
    dataConfidence: weatherInfo ? 'HIGH' : 'MEDIUM',
    factors,
    explanations,
    soilMoistureStatus: 'DATA UNAVAILABLE (Sensor Interface Ready)',
    trafficDataStatus: 'DATA UNAVAILABLE',
    hasFieldReportValidation: hasFieldValidation,
    criticalShipmentAtRisk,
  }
}

function runDisruptionPredictionTests() {
  console.log('========================================================================')
  console.log('   PHASE 6: AI DISRUPTION PREDICTION & WEATHER RISK INTELLIGENCE SUITE   ')
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

  const routeNH6 = {
    id: 'route-nh6',
    name: 'NH-6 Guwahati–Jorabat–Shillong Expressway',
    highway_number: 'NH-6',
    status: 'open',
  }

  const routeNH27 = {
    id: 'route-nh27',
    name: 'NH-27 Guwahati–Nagaon East-West Corridor',
    highway_number: 'NH-27',
    status: 'open',
  }

  const heavyRainWeather = {
    location: 'Shillong (East Khasi)',
    temperature: 18,
    precipitation: 22,
    rain: 22,
    weatherCondition: 'Heavy Torrential Downpours',
    source: 'Open-Meteo Satellite Feed',
  }

  const clearWeather = {
    location: 'Guwahati',
    temperature: 28,
    precipitation: 0,
    rain: 0,
    weatherCondition: 'Clear Sky',
    source: 'Open-Meteo Satellite Feed',
  }

  // TEST 1: Weather risk produces expected risk category (Heavy Rain + Mountain Ghats -> HIGH / CRITICAL)
  const pred1 = evaluateCorridorDisruptionRisk(routeNH6, heavyRainWeather)
  assert(
    pred1.riskLevel === 'HIGH' || pred1.riskLevel === 'CRITICAL',
    'TEST 1: Severe rainfall on mountain ghats produces HIGH / CRITICAL risk prediction',
    `Score: ${pred1.riskScore}/100, Risk Level: ${pred1.riskLevel}`
  )

  // TEST 2: Low weather produces LOW/MEDIUM risk without false alarms
  const pred2 = evaluateCorridorDisruptionRisk(routeNH27, clearWeather)
  assert(
    pred2.riskLevel === 'LOW' || pred2.riskLevel === 'MEDIUM',
    'TEST 2: Clear weather on plain terrain produces LOW / NORMAL risk profile',
    `Score: ${pred2.riskScore}/100, Risk Level: ${pred2.riskLevel}`
  )

  // TEST 3: Predicted risk does NOT block route (route accessibility remains open)
  assert(
    routeNH6.status === 'open',
    'TEST 3: AI Predicted Risk does NOT alter route accessibility (Status remains OPEN)',
    `Operational Status: ${routeNH6.status}`
  )

  // TEST 4: Reported incident does NOT auto-confirm or block route
  const reportedIncident = {
    id: 'inc-rep-1',
    route_id: 'route-nh6',
    route_name: 'NH-6 Guwahati–Jorabat–Shillong Expressway',
    type: 'landslide',
    status: 'reported',
    description: 'Field patrol reports boulder displacement.',
  }
  const predWithReport = evaluateCorridorDisruptionRisk(routeNH6, heavyRainWeather, [reportedIncident])
  assert(
    predWithReport.hasFieldReportValidation === true && routeNH6.status === 'open',
    'TEST 4: Ground field report validates prediction but route remains OPEN until confirmed',
    `Field Validation: ${predWithReport.hasFieldReportValidation}, Route: ${routeNH6.status}`
  )

  // TEST 5: Risk factors are explainable and sum to valid total risk score (0 - 100)
  const factorSum = pred1.factors.reduce((sum, f) => sum + f.scoreContribution, 0)
  assert(
    factorSum === pred1.riskScore && pred1.riskScore >= 0 && pred1.riskScore <= 100,
    'TEST 5: Risk score is mathematically explainable across transparent factor breakdown',
    `Factor Sum: ${factorSum}, Total Risk Score: ${pred1.riskScore}`
  )

  // TEST 6: Missing sensor data (soil moisture, traffic) is handled truthfully
  assert(
    pred1.soilMoistureStatus.includes('DATA UNAVAILABLE') && pred1.trafficDataStatus.includes('DATA UNAVAILABLE'),
    'TEST 6: Missing sensor data is truthfully labeled "DATA UNAVAILABLE" (Zero fabrication)',
    `Soil Moisture: ${pred1.soilMoistureStatus}`
  )

  // TEST 7: Multiple corridors evaluate independent risk profiles
  assert(
    pred1.riskScore !== pred2.riskScore,
    'TEST 7: Multiple corridors evaluate independent risk profiles based on geography & weather',
    `NH-6 Mountain Score: ${pred1.riskScore} vs NH-27 Floodplain Score: ${pred2.riskScore}`
  )

  // TEST 8: Critical shipment risk detection alerts when high-priority cargo traverses high-risk corridor
  const fleetWithMeds = [
    {
      vehicleId: 'NER-TRUCK-18',
      driverName: 'Bipul Gogoi',
      cargoType: 'MEDICINES',
      priority: 'CRITICAL',
      status: 'IN_TRANSIT',
      currentRouteName: 'NH-6 Guwahati–Jorabat–Shillong Expressway',
      etaClockTime: '14:41 IST',
    },
  ]
  const predWithFleet = evaluateCorridorDisruptionRisk(routeNH6, heavyRainWeather, [], fleetWithMeds)
  assert(
    predWithFleet.criticalShipmentAtRisk && predWithFleet.criticalShipmentAtRisk.cargoType === 'MEDICINES',
    'TEST 8: Critical shipment (MEDICINES on NER-TRUCK-18) at risk is accurately detected',
    `Alert Vehicle: ${predWithFleet.criticalShipmentAtRisk?.vehicleId} (${predWithFleet.criticalShipmentAtRisk?.cargoType})`
  )

  console.log('\n========================================================================')
  console.log(`           SUMMARY: ${passedTests}/${totalTests} TESTS PASSED CLEANLY             `)
  console.log('========================================================================\n')

  if (passedTests !== totalTests) {
    process.exit(1)
  }
}

runDisruptionPredictionTests()

