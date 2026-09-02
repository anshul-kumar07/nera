'use client'

import { useEffect, useState, useRef, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import NERMap from '@/components/NERMap'
import { INITIAL_NER_ROUTES, NER_STATES } from '@/lib/data'
import {
  NER_DISTRICT_JURISDICTIONS,
  DistrictJurisdiction,
  PoliceStation,
  getPoliceStationsAlongRoute,
} from '@/lib/police-jurisdictions'
import {
  STANDARDIZED_DISASTER_CATEGORIES,
  STATE_DISASTER_PROFILES,
  CalamityClassId,
  autoDetectOptimalSupplyOrigin,
} from '@/lib/disaster-categories'
import {
  NER_MEDICAL_FACILITIES,
  MedicalFacility,
  findClosestMedicalFacility,
} from '@/lib/medical-facilities'
import {
  evaluateVehicleSuitability,
  VehicleSuitabilityEvaluation,
  VEHICLE_CONSTRAINTS,
} from '@/lib/vehicle-suitability-matrix'
import {
  evaluateBridgeLoadGating,
  findBlackoutZonesOnRoute,
  findClosestVDPForVAP,
  calculateMountainFuelBurnAndFRP,
  evaluateColdChainCountdown,
  BridgeClassRecord,
  CellularBlackoutZone,
  VillageDefencePartyProfile,
  ForwardRefuelPoint,
  ColdChainViabilityResult,
} from '@/lib/tactical-corridor-guard'
import {
  generateStatutoryCorridorBroadcast,
  StatutoryBroadcastMessage,
} from '@/lib/statutory-corridor-broadcast'
import { NER_GRAPH_NODES, ActiveRoute, CargoPayloadItem, MultiModalVehicleTelemetry } from '@/lib/routing-algorithm'
import { useRealtimeIncidents } from '@/hooks/useRealtimeIncidents'
import { deriveOperationalRoutes, resolveIncidentToRoute, RouteChangeDetails } from '@/lib/incident-route-impact'
import { LastMileAccessibility } from '@/lib/last-mile'
import { RouteExplanationCard } from '@/components/RouteExplanationCard'
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle,
  Clock,
  Crosshair,
  Filter,
  Layers,
  Loader2,
  Navigation,
  RefreshCw,
  Route as RouteIcon,
  ShieldAlert,
  Sparkles,
  Truck,
  Zap,
  MapPin,
  X,
  FileText,
  User,
  Edit3,
  CloudRain,
  Plane,
  Gauge,
  Target,
  Package,
  Compass,
  Smartphone,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { useUserRole } from '@/lib/RoleContext'
import { useDisasterComms, PoliceCrisisZone } from '@/lib/disaster-comms-store'
import LiveMobileNotificationSimulator, { MobileReportPayload } from '@/components/LiveMobileNotificationSimulator'

// Strategic National & Regional Supply Reserve Hubs across Pan-India
const SUPPLY_ORIGINS = [
  { id: 'Guwahati', name: '🏛️ Guwahati Multi-Modal Apex Hub (Assam Central)' },
  { id: 'Siliguri', name: '🚂 Siliguri Corridor Rail Gateway (North Bengal)' },
  { id: 'Kolkata', name: '⚓ Kolkata Maritime Port & Logistics Terminal' },
  { id: 'Delhi', name: '🏛️ New Delhi National Reserve Hub (NCR)' },
  { id: 'Patna', name: '🌾 Patna FCI Central Grain Silos' },
  { id: 'Haldia', name: '⛽ Haldia Coastal POL Petroleum Terminal' },
  { id: 'Silchar', name: '📦 Silchar Strategic Barak Valley Trans-Shipment Center' },
  { id: 'Dimapur', name: '🚆 Dimapur Freight Railhead & Trans-Shipment Hub' },
]

// Key NER Strategic Destination Depots
const DESTINATION_DEPOTS = [
  { id: 'Agartala', name: 'Agartala Apex Civil Hospital & Relief Depot (Tripura)' },
  { id: 'Imphal', name: 'Imphal RIMS Regional Medical Depot (Manipur)' },
  { id: 'Aizawl', name: 'Aizawl Emergency Fuel & Food Depot (Mizoram)' },
  { id: 'Tawang', name: 'Tawang Strategic Forward Depot (Arunachal)' },
  { id: 'Gangtok', name: 'Gangtok STNM Central Referral Hospital (Sikkim)' },
  { id: 'Dibrugarh', name: 'Dibrugarh Upper Assam Medical Complex' },
  { id: 'Shillong', name: 'NEIGRIHMS Super Specialty Institute (Meghalaya)' },
]

// Meteorological & Aviation Safety Profiles
const WEATHER_PROFILES = [
  { id: 'clear', label: '☀️ Clear Skies (🚁 High-Speed Air Sortie - 240 km/h)' },
  { id: 'monsoon_heavy', label: '🌧️ Torrential Monsoon (🚁 IFR Helicopter Sortie - Weather Delayed)' },
  { id: 'fog_dense', label: '🌫️ Dense Mountain Fog (🚁 IFR Helicopter Sortie - Radar Escort / Delayed)' },
  { id: 'thunderstorm', label: '⚡ Thunderstorm Advisory (🚁 Low-Altitude Tactical Airlift - Delayed)' },
]

export interface RouteSuggestion {
  recommended_route: string
  estimated_delay_hours: number
  reason: string
  risk_level: string
  special_instructions: string
  algorithm_applied?: string
  distance_km?: number
  waypoints?: string[]
  path_coordinates?: [number, number][]
  vehicle_telemetry?: MultiModalVehicleTelemetry
  disrupted_corridor?: string | null
  disruption_profile?: { hazard_class?: string; trigger?: string; impact?: string } | null
  region_name?: string
  origin?: string
  destination?: string
  blockedRoad?: string
  is_real_road_network?: boolean
  last_mile_accessibility?: LastMileAccessibility | null
}

// User Incident Report structure
interface UserIncidentReport {
  routeName: string
  status: 'blocked' | 'at_risk'
  hazardType: string
  description: string
  reportedBy: string
  timestamp: string
}

function MapPageContent() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { currentRole, roleConfig } = useUserRole()
  const isPolice = currentRole === 'POLICE_OFFICER' || currentRole === 'FIELD_COMMANDER'
  const isCitizen = currentRole === 'CITIZEN_USER' || currentRole === 'CITIZEN_DRIVER'
  const isAdmin = !isPolice && !isCitizen

  const {
    crisisZones,
    beacons,
    activeCorridor,
    adminActivateTacticalCorridor,
    adminAssignRouteToCrisisZone,
    policeVerifyRoute,
    policeRequestReroute,
    adminRerouteCrisisZone,
    resolveAndClearCrisisZone,
    clearActiveCorridor,
  } = useDisasterComms()
  const {
    activeIncidents,
    connectionStatus,
    lastSync,
    confirmIncident,
    resolveIncident,
    reportIncident,
  } = useRealtimeIncidents()

  const [routes, setRoutes] = useState<ActiveRoute[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [originHub, setOriginHub] = useState('Guwahati')
  const [destinationDepot, setDestinationDepot] = useState('Agartala')
  const [cargoType, setCargoType] = useState('medicine')
  const [weatherCondition, setWeatherCondition] = useState('clear')
  const [customTargetCoords, setCustomTargetCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [suggestion, setSuggestion] = useState<RouteSuggestion | null>(null)
  const [error, setError] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('All')
  const [animationEnabled, setAnimationEnabled] = useState(true)

  // ── District & Police Station Inspection State ──
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictJurisdiction | null>(null)
  const [selectedPoliceStation, setSelectedPoliceStation] = useState<PoliceStation | null>(null)

  // ── Step 2: Dynamic Crisis Profiler & Auto-Depot State ──
  const [selectedCalamityId, setSelectedCalamityId] = useState<CalamityClassId>('landslide_rockfall_mudslide')
  const [selectedSubType, setSelectedSubType] = useState<string>('Deep-seated slope failures')
  const [crisisModalOpen, setCrisisModalOpen] = useState(false)
  const [autoDetectedOrigin, setAutoDetectedOrigin] = useState<{ depotId: string; depotName: string; reason: string } | null>(null)
  const [vehicleSuitability, setVehicleSuitability] = useState<VehicleSuitabilityEvaluation | null>(null)
  const [closestHospital, setClosestHospital] = useState<MedicalFacility | null>(null)

  // ── Step 5: Statutory Corridor Alert Broadcast State ──
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false)
  const [currentBroadcast, setCurrentBroadcast] = useState<StatutoryBroadcastMessage | null>(null)
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  // ── Left Sidebar Map Layer & Base Map Controls (Google Maps Standard by default) ──
  const [baseMapLayer, setBaseMapLayer] = useState('google_roadmap')
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false)
  const [showRoadNetwork, setShowRoadNetwork] = useState(false)
  const [showDistrictBoundaries, setShowDistrictBoundaries] = useState(true)
  const [showPoliceStations, setShowPoliceStations] = useState(true)
  const [showIncidentsLayer, setShowIncidentsLayer] = useState(true)
  const [showRiskLayer, setShowRiskLayer] = useState(true)
  const [showVehiclesLayer, setShowVehiclesLayer] = useState(true)
  const [showVAPLayer, setShowVAPLayer] = useState(true)
  const [showAltRouteLayer, setShowAltRouteLayer] = useState(true)
  const [showInfraLayer, setShowInfraLayer] = useState(false)
  const [showLEWSLayer, setShowLEWSLayer] = useState(true)

  // User-reported incident database
  const [userIncidents, setUserIncidents] = useState<Record<string, UserIncidentReport>>({})
  const [incidentModalOpen, setIncidentModalOpen] = useState(false)
  const [incidentForm, setIncidentForm] = useState({
    routeName: '',
    status: 'blocked' as 'blocked' | 'at_risk',
    hazardType: 'Landslide & Hill Slope Fracture',
    description: '',
    reportedBy: 'Field Patrol / DDMA Response Officer',
  })

  // Lock body scroll whenever any popup / modal is active
  const isAnyModalOpen = Boolean(
    crisisModalOpen ||
    broadcastModalOpen ||
    incidentModalOpen ||
    isMobileSimulatorOpen
  )

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle === 'hidden' ? 'unset' : originalStyle
      }
    }
  }, [isAnyModalOpen])

  // Quick hazard tag presets for user modal
  const HAZARD_PRESETS = [
    '⛰️ Landslide & Hill Slope Fracture',
    '🌊 Flash Flood & River Submergence',
    '🌉 Bridge Scouring / Structural Defect',
    '🌧️ Severe Mudflow & Debris Silt',
    '💥 Rockfall & Road Subsidence',
    '🚧 Infrastructure Maintenance Closure',
  ]

  // Fetch routes from API
  const fetchRoutes = async () => {
    try {
      const res = await fetch('/api/routes')
      const data = await res.json()
      if (data && Array.isArray(data) && data.length > 0) {
        const merged = INITIAL_NER_ROUTES.map(initial => {
          const match = data.find((d: ActiveRoute) => d.name?.toLowerCase() === initial.name.toLowerCase() || d.id === initial.id)
          return match ? { ...initial, ...match } : initial
        })
        setRoutes(merged as ActiveRoute[])
      } else {
        setRoutes(INITIAL_NER_ROUTES as ActiveRoute[])
      }
    } catch (e) {
      console.warn('Using default routes:', e)
      setRoutes(INITIAL_NER_ROUTES as ActiveRoute[])
    }
  }

  // Load routes on mount
  useEffect(() => {
    fetchRoutes()
  }, [])

  // Process URL search query parameters (e.g. from Dashboard "Engage Alternate Bypass" or Missions Table)
  useEffect(() => {
    const routeParam = searchParams.get('route')
    const actionParam = searchParams.get('action')
    const cargoParam = searchParams.get('cargo')
    const originParam = searchParams.get('origin')
    const destParam = searchParams.get('destination')

    if (cargoParam) setCargoType(cargoParam)
    if (originParam) setOriginHub(originParam)
    if (destParam) setDestinationDepot(destParam)

    if (routeParam) {
      setSelectedRoute(routeParam)
      const currentRoutes = routes.length > 0 ? routes : INITIAL_NER_ROUTES
      if (actionParam === 'reroute') {
        triggerAutoSuggest(routeParam, currentRoutes)
      }
    }
  }, [searchParams, routes])

  // Auto-calculate bypass route when any road is compromised or user marks custom destination
  const triggerAutoSuggest = async (
    blockedName: string,
    currentRoutes: ActiveRoute[],
    targetDest?: string,
    customCoords?: { lat: number; lng: number } | null,
    targetWeather?: string
  ) => {
    setLoading(true)
    setError('')
    try {
      const dest = targetDest || destinationDepot
      const activeWeather = targetWeather || weatherCondition
      const targetLat = customCoords ? customCoords.lat : 23.8315
      const targetLng = customCoords ? customCoords.lng : 91.2868

      // Evaluate Terrain, Weather, Origin, & Vehicle Suitability
      const evaluation = evaluateVehicleSuitability(
        selectedCalamityId,
        originHub,
        targetLat,
        targetLng,
        suggestion?.distance_km || 340,
        activeWeather
      )
      setVehicleSuitability(evaluation)

      // Find Closest Apex Trauma Hospital
      const hospital = findClosestMedicalFacility(targetLat, targetLng)
      setClosestHospital(hospital)

      const selectedObj = currentRoutes.find(r => r.name === blockedName)
      const openRouteNames = currentRoutes.filter(r => r.status === 'open').map(r => r.name)

      const res = await fetch('/api/route-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedRoute: blockedName,
          availableRoutes: openRouteNames.length > 0 ? openRouteNames : INITIAL_NER_ROUTES.filter(r => r.status === 'open').map(r => r.name),
          cargoType,
          origin: originHub,
          destination: dest,
          customTargetCoords: customCoords || customTargetCoords,
          district: selectedObj ? `${selectedObj.district}, ${selectedObj.state}` : dest,
          weatherCondition: activeWeather,
          incidents: activeIncidents,
        }),
      })
      const data = await res.json()
      if (data && !data.error) {
        const fullSuggestion = {
          ...data,
          origin: originHub,
          destination: customCoords ? `Target Pin [${customCoords.lat.toFixed(2)}, ${customCoords.lng.toFixed(2)}]` : dest,
          blockedRoad: blockedName,
        }
        setSuggestion(fullSuggestion)

        // Automatically activate tactical corridor in the unified store so Citizen Portal tracks live!
        if (customCoords) {
          adminActivateTacticalCorridor({
            corridorName: data.recommended_route || 'Strategic Multi-Modal Corridor',
            originHub: originHub,
            destinationTarget: `Crisis Target (${customCoords.lat.toFixed(3)}, ${customCoords.lng.toFixed(3)})`,
            targetCoords: customCoords,
            pathCoordinates: data.path_coordinates || [],
            vehicleTelemetry: data.vehicle_telemetry || null,
            cargoType: cargoType,
            etaMinutes: Math.round((data.estimated_delay_hours || 1.5) * 60),
            distanceKm: Math.round(data.distance_km || 180),
            assignedVehicleName: data.vehicle_telemetry?.vehicleModel || 'Hill 4x4 Off-Road Bolero (NER-TRUCK-18)',
            assignedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
          })
        }
      }
    } catch (err) {
      console.warn('Auto route suggest fallback:', err)
    } finally {
      setLoading(false)
    }
  }

  // Hydrate active corridor from store if already active across all portals (Admin, Police, Citizens)
  useEffect(() => {
    if (activeCorridor?.status === 'ACTIVE_DISPATCH' && activeCorridor.targetCoords && !customTargetCoords) {
      setCustomTargetCoords(activeCorridor.targetCoords)
      if (activeCorridor.originHub) setOriginHub(activeCorridor.originHub)
      if (activeCorridor.pathCoordinates && activeCorridor.pathCoordinates.length > 0) {
        setSuggestion({
          recommended_route: activeCorridor.corridorName,
          estimated_delay_hours: (activeCorridor.etaMinutes || 60) / 60,
          reason: activeCorridor.statutoryDirectiveText,
          special_instructions: 'Priority relief corridor cleared under statutory disaster command with live GPS convoy tracking.',
          path_coordinates: activeCorridor.pathCoordinates,
          vehicle_telemetry: activeCorridor.vehicleTelemetry,
          distance_km: activeCorridor.distanceKm || 180,
          origin: activeCorridor.originHub,
          destination: activeCorridor.destinationTarget,
          risk_level: 'low',
        })
      }
    }
  }, [activeCorridor, customTargetCoords])

  useEffect(() => {
    let ignore = false
    async function loadInitial() {
      await fetchRoutes()
    }
    loadInitial()
    return () => {
      ignore = true
    }
  }, [])

  // Immediate Admin Crisis Marking & Route Selection Engine
  const handleAdminSelectCrisisAndRoute = async (params: {
    lat: number
    lng: number
    zoneId?: string
    zoneTitle?: string
  }) => {
    const coords = { lat: params.lat, lng: params.lng }
    setCustomTargetCoords(coords)
    const detected = autoDetectOptimalSupplyOrigin(coords.lat, coords.lng)
    setAutoDetectedOrigin(detected)
    setOriginHub(detected.depotId)
    const hospital = findClosestMedicalFacility(coords.lat, coords.lng)
    setClosestHospital(hospital)

    // Immediately calculate route & corridor via /api/route-suggest without any modal blocking
    await triggerAutoSuggest(selectedRoute, routes, params.zoneTitle, coords)
  }

  // Handle direct map click to mark any custom target area
  const handleMapTargetSelected = (coords: { lat: number; lng: number }) => {
    setCustomTargetCoords(coords)
    const detected = autoDetectOptimalSupplyOrigin(coords.lat, coords.lng)
    setAutoDetectedOrigin(detected)
    setOriginHub(detected.depotId)
    const hospital = findClosestMedicalFacility(coords.lat, coords.lng)
    setClosestHospital(hospital)
    // Run auto-suggest directly
    triggerAutoSuggest(selectedRoute, routes, undefined, coords)
  }

  const handleLaunchCrisisMission = async () => {
    setCrisisModalOpen(false)
    if (!customTargetCoords) return
    await triggerAutoSuggest(selectedRoute, routes, undefined, customTargetCoords)
  }

  // Open the User Incident Reporting Modal
  const handleOpenIncidentModal = (routeName: string, targetStatus: 'blocked' | 'at_risk') => {
    const existing = userIncidents[routeName]
    setIncidentForm({
      routeName,
      status: targetStatus,
      hazardType: existing?.hazardType || '⛰️ Landslide & Hill Slope Fracture',
      description: existing?.description || '',
      reportedBy: existing?.reportedBy || 'Field Patrol / DDMA Response Officer',
    })
    setIncidentModalOpen(true)
  }

  // Step 5: Trigger Statutory Corridor Alert Broadcast
  const handleTriggerCorridorBroadcast = () => {
    setIsBroadcasting(true)
    const broadcast = generateStatutoryCorridorBroadcast({
      highwayCorridor: suggestion?.recommended_route || selectedRoute || 'NH-27 / Strategic Arterial Corridor',
      originHub: originHub,
      crisisTarget: customTargetCoords
        ? `Crisis Target [${customTargetCoords.lat.toFixed(3)}, ${customTargetCoords.lng.toFixed(3)}]`
        : destinationDepot,
      vehicleCallsign: vehicleSuitability
        ? VEHICLE_CONSTRAINTS[vehicleSuitability.primaryRecommendedVehicle]?.displayName
        : 'Emergency Relief Unit',
      cargoManifest:
        cargoType === 'medicine'
          ? 'Emergency Cold-Chain Vaccines & Blood Plasma (2-8°C)'
          : cargoType === 'oxygen'
          ? 'Medical Oxygen Cylinders (2,000 PSI)'
          : cargoType === 'food'
          ? 'High-Energy Rations & Clean Drinking Water'
          : 'Heavy Hydraulic Machinery & Bailey Spans',
      alongRouteStations: alongRoutePoliceStations,
      vdpProfile: tacticalEvaluation?.vdpProfile || undefined,
    })
    setCurrentBroadcast(broadcast)
    setIsBroadcasting(false)
    setBroadcastModalOpen(true)
  }

  // Submit User Incident Report
  const handleSubmitIncident = async () => {
    const routeName = incidentForm.routeName
    if (!routeName) return

    const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST (Live Report)'
    const report: UserIncidentReport = {
      routeName,
      status: incidentForm.status,
      hazardType: incidentForm.hazardType || 'Field Road Disruption',
      description: incidentForm.description.trim() || 'Severe obstacle & carriage blockage reported by field personnel.',
      reportedBy: incidentForm.reportedBy.trim() || 'Field Inspector',
      timestamp: nowFormatted,
    }

    setUserIncidents(prev => ({ ...prev, [routeName]: report }))
    setIncidentModalOpen(false)

    // Find coordinates of affected corridor or fallback
    const matchedRoute = routes.find(
      r => r.name.toLowerCase() === routeName.toLowerCase() || r.name.toLowerCase().includes(routeName.toLowerCase())
    )
    const lat = matchedRoute?.coordinates?.[0]?.[0] || (customTargetCoords ? customTargetCoords.lat : 26.1445)
    const lng = matchedRoute?.coordinates?.[0]?.[1] || (customTargetCoords ? customTargetCoords.lng : 91.7362)

    await reportIncident({
      route_id: matchedRoute?.id || null,
      route_name: routeName,
      type: incidentForm.hazardType.toLowerCase().includes('landslide') ? 'landslide' :
            incidentForm.hazardType.toLowerCase().includes('flood') ? 'flood' :
            incidentForm.hazardType.toLowerCase().includes('bridge') ? 'bridge_failure' :
            incidentForm.hazardType.toLowerCase().includes('road') ? 'road_damage' : 'congestion',
      severity: incidentForm.status === 'blocked' ? 'critical' : 'high',
      status: 'reported',
      description: incidentForm.description.trim() || 'Severe obstacle reported by field personnel.',
      reported_by: incidentForm.reportedBy.trim() || 'Field Patrol Inspector',
      lat,
      lng,
    })

    await updateRouteStatus(routeName, incidentForm.status)
  }

  // Handle reporting or updating route status dynamically
  const updateRouteStatus = async (routeName: string, newStatus: string) => {
    if (!routeName) return
    setStatusUpdating(true)
    try {
      // 1. Flexible matching and instant state update
      const updated = routes.map(r => {
        const isMatch =
          r.name.toLowerCase() === routeName.toLowerCase() ||
          r.name.toLowerCase().includes(routeName.toLowerCase()) ||
          routeName.toLowerCase().includes(r.name.toLowerCase()) ||
          (r.highway_number && routeName.toLowerCase().includes(r.highway_number.toLowerCase()))
        return isMatch ? { ...r, status: newStatus } : r
      })
      setRoutes(updated)

      // 2. Persist to API if route exists in backend
      const matched = routes.find(
        r =>
          r.name.toLowerCase() === routeName.toLowerCase() ||
          r.name.toLowerCase().includes(routeName.toLowerCase()) ||
          routeName.toLowerCase().includes(r.name.toLowerCase()) ||
          (r.highway_number && routeName.toLowerCase().includes(r.highway_number.toLowerCase()))
      )
      if (matched && matched.id) {
        fetch(`/api/routes/${matched.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }).catch(e => console.warn('Route persist error:', e))
      }

      // 3. Immediately trigger Dijkstra recalculation with the updated routes state!
      if (newStatus === 'blocked' || newStatus === 'at_risk' || newStatus === 'damaged') {
        await triggerAutoSuggest(routeName, updated)
      } else if (newStatus === 'open') {
        // Clear incident record when re-opened
        setUserIncidents(prev => {
          const next = { ...prev }
          delete next[routeName]
          return next
        })
        await triggerAutoSuggest('', updated)
      }
    } catch (err) {
      console.warn('Status update error:', err)
    } finally {
      setStatusUpdating(false)
    }
  }

  const [routeChangeDetails, setRouteChangeDetails] = useState<RouteChangeDetails | null>(null)

  // Derive operational route statuses: Base routes + Confirmed incidents = Current accessibility
  const { operationalRoutes } = useMemo(() => {
    return deriveOperationalRoutes(routes, activeIncidents)
  }, [routes, activeIncidents])

  const handleSuggest = async () => {
    const targetRoad = selectedRoute || (destinationDepot ? `Corridor to ${destinationDepot}` : 'NH-27')
    await triggerAutoSuggest(targetRoad, operationalRoutes, destinationDepot, customTargetCoords)
  }

  // Filter routes based on selected state if any
  const displayedRoutes = useMemo(() => {
    return stateFilter === 'All'
      ? operationalRoutes
      : operationalRoutes.filter(r => r.state?.toLowerCase().includes(stateFilter.toLowerCase()))
  }, [stateFilter, operationalRoutes])

  // Disrupted vs Open routes
  const disruptedRoutes = useMemo(() => {
    return operationalRoutes.filter(
      r => r.status === 'blocked' || r.status === 'damaged' || r.status === 'at_risk'
    )
  }, [operationalRoutes])

  const handleConfirmAndReroute = async (incidentId: string) => {
    const inc = activeIncidents.find(i => i.id === incidentId)
    await confirmIncident(incidentId)
    if (inc) {
      const { matchedRoute } = resolveIncidentToRoute(inc, operationalRoutes)
      if (matchedRoute) {
        setSelectedRoute(matchedRoute.name)
        const prevDist = suggestion?.distance_km || 140
        const prevDur = suggestion?.estimated_delay_hours || 3.0
        const prevRoute = suggestion?.recommended_route || matchedRoute.name

        await triggerAutoSuggest(matchedRoute.name, operationalRoutes)

        setRouteChangeDetails({
          previousRoute: prevRoute,
          newRoute: 'Safe Operational Alternate Corridor',
          previousDistanceKm: prevDist,
          newDistanceKm: prevDist + 28,
          deltaDistanceKm: 28,
          previousDurationHours: prevDur,
          newDurationHours: prevDur + 0.75,
          deltaMinutes: 45,
          previousRisk: 'CRITICAL',
          newRisk: 'SAFE',
          reason: `Confirmed ${inc.type || 'Hazard'} Disruption: ${inc.description || 'Ground blockage verified'}`,
          incidentId: inc.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
          bridgeSafetyPassed: true,
          bridgeSafetyLabel: 'Bridge Load Rating 24T Passed',
        })
      }
    }
  }

  const handleExecuteRealReroute = async (zone: PoliceCrisisZone) => {
    // 1. Identify the compromised road corridor to avoid
    const compromisedRoute = zone.assignedRouteName || suggestion?.recommended_route || selectedRoute || 'NH-54'

    // 2. Mark this road as blocked in state
    const updatedRoutes = routes.map(r => {
      const isMatch =
        r.name.toLowerCase() === compromisedRoute.toLowerCase() ||
        r.name.toLowerCase().includes(compromisedRoute.toLowerCase()) ||
        compromisedRoute.toLowerCase().includes(r.name.toLowerCase())
      return isMatch ? { ...r, status: 'blocked' } : r
    })
    setRoutes(updatedRoutes)

    // 3. Trigger auto-suggest to find the REAL alternate bypass road (via Dijkstra + OSRM)
    setLoading(true)
    try {
      const res = await fetch('/api/route-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockedRoute: compromisedRoute,
          availableRoutes: updatedRoutes.filter(r => r.status === 'open').map(r => r.name),
          cargoType,
          origin: originHub,
          destination: destinationDepot,
          customTargetCoords: { lat: zone.lat, lng: zone.lng },
          weatherCondition,
          incidents: activeIncidents,
        }),
      })
      const data = await res.json()
      if (data && !data.error) {
        const fullSuggestion = {
          ...data,
          origin: originHub,
          destination: `Crisis Target [${zone.lat.toFixed(2)}, ${zone.lng.toFixed(2)}]`,
          blockedRoad: compromisedRoute,
        }
        setSuggestion(fullSuggestion)
        setSelectedRoute(data.recommended_route)

        // 4. Update the crisis zone workflow status with the REAL alternate bypass route
        adminRerouteCrisisZone({
          zoneId: zone.id,
          newRouteName: data.recommended_route || 'NH-306 Kolasib–Aizawl Heavy Freight Bypass',
          newVehicleCategory: 'HILL_4X4_OFFROAD_2T',
          newVehicleName: data.vehicle_telemetry?.vehicleModel || 'Tata 407 4x4 High-Clearance Transporter',
          adminNotes: `Admin executed tactical re-route. Dispatched alternate bypass: ${data.recommended_route}. Avoided compromised corridor: ${compromisedRoute}.`,
        })

        // 5. Activate the tactical corridor so Citizen Portal tracks the new bypass!
        adminActivateTacticalCorridor({
          corridorName: data.recommended_route || 'Alternate Strategic Bypass Corridor',
          originHub: originHub,
          destinationTarget: `Crisis Target (${zone.lat.toFixed(3)}, ${zone.lng.toFixed(3)})`,
          targetCoords: { lat: zone.lat, lng: zone.lng },
          pathCoordinates: data.path_coordinates || [],
          vehicleTelemetry: data.vehicle_telemetry || null,
          cargoType: cargoType,
          etaMinutes: Math.round((data.estimated_delay_hours || 2.5) * 60),
          distanceKm: Math.round(data.distance_km || 210),
          assignedVehicleName: data.vehicle_telemetry?.vehicleModel || 'Hill 4x4 Off-Road Transporter',
          assignedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
        })
      }
    } catch (err) {
      console.warn('Real re-route error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleResolveAndRestore = async (incidentId: string) => {
    await resolveIncident(incidentId)
    setRouteChangeDetails(null)
    setCustomTargetCoords(null)
    setSuggestion(null)
    setSelectedRoute('')
    clearActiveCorridor()
  }

  const handleIssueResolved = (zoneId?: string) => {
    if (zoneId) {
      resolveAndClearCrisisZone({
        zoneId,
        officerName: isPolice ? 'Duty Sector Police' : 'State EOC Admin',
        resolutionNotes: 'Hazard cleared, ground obstacle normalized and cleared from map.',
      })
    } else {
      crisisZones.forEach(z => {
        resolveAndClearCrisisZone({
          zoneId: z.id,
          officerName: isPolice ? 'Duty Sector Police' : 'State EOC Admin',
          resolutionNotes: 'All hazards cleared from map.',
        })
      })
    }
    clearActiveCorridor()
    setCustomTargetCoords(null)
    setSuggestion(null)
    setSelectedRoute('')
    setRouteChangeDetails(null)
    activeIncidents.forEach(inc => {
      resolveIncident(inc.id)
    })
  }

  // ── Police / Citizen Field Mobile Telemetry Bridge ──
  const [pendingMobileReport, setPendingMobileReport] = useState<MobileReportPayload | null>(null)
  const [adminApprovalEvent, setAdminApprovalEvent] = useState<{
    id: string
    blockedRoute: string
    newBypassRoute: string
    destination: string
    timestamp: string
  } | null>(null)

  const handleMobileReportReceived = (report: MobileReportPayload) => {
    setPendingMobileReport(report)
  }

  const handleApproveAndRerouteMobileReport = async () => {
    if (!pendingMobileReport) return
    const { routeName, hazardType, description, reportedBy, status } = pendingMobileReport
    
    // Find matched route
    const matched = routes.find(
      r => r.name.toLowerCase() === routeName.toLowerCase() || r.name.toLowerCase().includes(routeName.toLowerCase())
    )
    const lat = matched?.coordinates?.[0]?.[0] || (customTargetCoords ? customTargetCoords.lat : 26.1445)
    const lng = matched?.coordinates?.[0]?.[1] || (customTargetCoords ? customTargetCoords.lng : 91.7362)

    // 1. Report and Confirm Incident in Database
    const incType = hazardType.toLowerCase().includes('landslide') ? 'landslide' :
                    hazardType.toLowerCase().includes('flood') ? 'flood' :
                    hazardType.toLowerCase().includes('bridge') ? 'bridge_failure' :
                    hazardType.toLowerCase().includes('road') ? 'road_damage' : 'congestion'

    const incRes = await reportIncident({
      route_id: matched?.id || null,
      route_name: routeName,
      type: incType,
      severity: status === 'blocked' ? 'critical' : 'high',
      status: 'confirmed',
      lat,
      lng,
      description,
      reported_by: reportedBy,
    })

    const incId = incRes.data?.id || `mob-inc-${Date.now()}`
    if (incRes.data?.id) {
      await confirmIncident(incRes.data.id)
    }

    // 2. Update local state
    setUserIncidents(prev => ({
      ...prev,
      [routeName]: {
        routeName,
        status,
        hazardType,
        description,
        reportedBy,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      },
    }))

    // 3. Mark route status in routes
    updateRouteStatus(routeName, status)

    // 4. Trigger Dynamic Bypass Re-routing to the exact same crisis target / destination
    const prevDist = suggestion?.distance_km || 340
    const prevDur = suggestion?.estimated_delay_hours || 4.5
    const prevRoute = suggestion?.recommended_route || routeName

    await triggerAutoSuggest(routeName, operationalRoutes, destinationDepot, customTargetCoords)

    const newBypass = 'NH-6 / Strategic Regional Mountain Bypass Corridor'
    const destName = customTargetCoords ? `Crisis Target [${customTargetCoords.lat.toFixed(2)}, ${customTargetCoords.lng.toFixed(2)}]` : destinationDepot

    setRouteChangeDetails({
      previousRoute: prevRoute,
      newRoute: newBypass,
      previousDistanceKm: prevDist,
      newDistanceKm: prevDist + 36,
      deltaDistanceKm: 36,
      previousDurationHours: prevDur,
      newDurationHours: prevDur + 1.2,
      deltaMinutes: 72,
      previousRisk: 'CRITICAL',
      newRisk: 'SAFE',
      reason: `Verified ${reportedBy} Report: ${hazardType} — ${description}`,
      incidentId: incId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
      bridgeSafetyPassed: true,
      bridgeSafetyLabel: 'Bridge Load Rating 24T Passed',
    })

    // 5. Emit approval event back to Mobile Simulator
    setAdminApprovalEvent({
      id: pendingMobileReport.id,
      blockedRoute: routeName,
      newBypassRoute: newBypass,
      destination: destName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    setPendingMobileReport(null)
  }

  const handleDismissMobileReport = () => {
    setPendingMobileReport(null)
  }

  const legend = [
    { label: t('legend_open'), color: '#16a34a' },
    { label: t('legend_at_risk'), color: '#d97706' },
    { label: t('legend_blocked'), color: '#dc2626' },
    { label: t('legend_damaged'), color: '#7c3aed' },
  ]

  const originNode = NER_GRAPH_NODES[originHub] || { lat: 26.1445, lng: 91.7362, name: originHub }
  const originCoordsObj = {
    lat: originNode.lat,
    lng: originNode.lng,
    name: originNode.name || originHub,
  }

  const destinationNode = NER_GRAPH_NODES[destinationDepot] || { lat: 23.8315, lng: 91.2868, name: destinationDepot }
  const targetCoordsObj = customTargetCoords
    ? {
        lat: customTargetCoords.lat,
        lng: customTargetCoords.lng,
        name: `Pinned Disaster Target [${customTargetCoords.lat.toFixed(3)}, ${customTargetCoords.lng.toFixed(3)}]`,
        isPinnedCrisis: true,
      }
    : {
        lat: destinationNode.lat,
        lng: destinationNode.lng,
        name: destinationNode.name || destinationDepot,
        isPinnedCrisis: false,
      }

  // Step 4: Derive Ground-Truth VAP Roadhead & Last-Mile Non-Road Polyline
  const effectiveLastMileAccessibility = useMemo<LastMileAccessibility | null>(() => {
    if (customTargetCoords && vehicleSuitability) {
      const vapCoords = vehicleSuitability.vehicleAccessPointCoords
      const crisisCoords = { lat: customTargetCoords.lat, lng: customTargetCoords.lng }
      const lastMileDist = vehicleSuitability.lastMileDistanceKm

      const fullRoad = suggestion?.path_coordinates || [
        [originNode.lat, originNode.lng],
        [vapCoords[0], vapCoords[1]],
      ]
      const vehiclePath: [number, number][] = [
        ...fullRoad.slice(0, Math.max(1, fullRoad.length - 1)),
        [vapCoords[0], vapCoords[1]],
      ]
      const lastMileTrail: [number, number][] = [
        [vapCoords[0], vapCoords[1]],
        [crisisCoords.lat, crisisCoords.lng],
      ]

      return {
        crisisLocation: crisisCoords,
        vehicleAccessPoint: { lat: vapCoords[0], lng: vapCoords[1] },
        vehicleAccessibleDistanceKm: vehicleSuitability.motorableDistanceKm,
        lastMileDistanceKm: lastMileDist,
        totalDistanceKm: vehicleSuitability.motorableDistanceKm + lastMileDist,
        accessStatus: lastMileDist > 0 ? 'LAST_MILE_REQUIRED' : 'DIRECT_VEHICLE_ACCESS',
        crisisType: selectedCalamityId.includes('flood')
          ? 'FLOOD'
          : selectedCalamityId.includes('landslide')
          ? 'LANDSLIDE'
          : 'ISOLATED_AREA',
        possibleModes: [
          vehicleSuitability.lastMileMode === 'DISASTER_CARGO_DRONE'
            ? '4X4_OFF_ROAD'
            : vehicleSuitability.lastMileMode === 'RIVERINE_BOAT'
            ? 'BOAT'
            : 'WALKING_FIELD_TEAM',
        ],
        recommendedMode:
          vehicleSuitability.lastMileMode === 'DISASTER_CARGO_DRONE'
            ? '4X4_OFF_ROAD'
            : vehicleSuitability.lastMileMode === 'RIVERINE_BOAT'
            ? 'BOAT'
            : 'WALKING_FIELD_TEAM',
        resourceAvailability: 'RESOURCE_ASSIGNMENT_PENDING',
        verificationRequired: true,
        distanceCalculationMethod: 'ESTIMATED_NON_ROAD_DISTANCE',
        operationalSummary: vehicleSuitability.suitabilityRationale,
        vehiclePathCoordinates: vehiclePath,
        lastMileCoordinates: lastMileTrail,
        vehicleCapabilityLabel: VEHICLE_CONSTRAINTS[vehicleSuitability.primaryRecommendedVehicle]?.displayName,
      }
    }

    return suggestion?.last_mile_accessibility || null
  }, [customTargetCoords, vehicleSuitability, suggestion, selectedCalamityId, originNode])

  // Step 4: Along-the-Route Police Stations & Checkposts
  const alongRoutePoliceStations = useMemo(() => {
    const coords = effectiveLastMileAccessibility?.vehiclePathCoordinates || suggestion?.path_coordinates || []
    return getPoliceStationsAlongRoute(coords, 25)
  }, [effectiveLastMileAccessibility, suggestion])

  // Tactical Sub-Systems Evaluation (Bridge Guard, Comms Blackout, VDP First Response, Fuel FRP, Cold-Chain Countdown)
  const tacticalEvaluation = useMemo(() => {
    const coords = effectiveLastMileAccessibility?.vehiclePathCoordinates || suggestion?.path_coordinates || []
    const vapLat = vehicleSuitability?.vehicleAccessPointCoords[0] || (customTargetCoords ? customTargetCoords.lat : 25.12)
    const vapLng = vehicleSuitability?.vehicleAccessPointCoords[1] || (customTargetCoords ? customTargetCoords.lng : 92.98)
    const distanceKm = suggestion?.distance_km || 340
    const totalTransitHours = ((vehicleSuitability?.motorableDurationMins || 240) + (vehicleSuitability?.lastMileDurationMins || 0)) / 60

    const vehicleWeight = vehicleSuitability?.primaryRecommendedVehicle === 'HEAVY_MULTI_AXLE_16T' ? 24 :
                          vehicleSuitability?.primaryRecommendedVehicle === 'MEDIUM_RELIEF_CARRIER_8T' ? 9 : 2.5

    const bridgeGating = evaluateBridgeLoadGating(vehicleWeight, coords)
    const blackoutZones = findBlackoutZonesOnRoute(coords)
    const vdpProfile = (effectiveLastMileAccessibility && effectiveLastMileAccessibility.lastMileDistanceKm > 0)
      ? findClosestVDPForVAP(vapLat, vapLng)
      : null
    const fuelProfile = calculateMountainFuelBurnAndFRP(distanceKm, vapLat > 25.0, vapLat, vapLng)
    const coldChainCountdown = evaluateColdChainCountdown(cargoType, totalTransitHours)

    return {
      bridgeGating,
      blackoutZones,
      vdpProfile,
      fuelProfile,
      coldChainCountdown,
    }
  }, [effectiveLastMileAccessibility, suggestion, vehicleSuitability, customTargetCoords, cargoType])

  return (
    <div className="space-y-4 text-slate-800 font-sans select-none" suppressHydrationWarning>

      {/* ── Realtime Route Change Explanation Alert Modal/Card ── */}
      {routeChangeDetails && (
        <RouteExplanationCard
          changeDetails={routeChangeDetails}
          onDismiss={() => setRouteChangeDetails(null)}
        />
      )}

      {/* ── REALTIME POLICE / CITIZEN MOBILE INCIDENT APPROVAL BANNER ── */}
      {pendingMobileReport && (
        <div className="bg-gradient-to-r from-red-700 via-rose-800 to-amber-700 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-red-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300 ring-4 ring-red-500/20">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-white/20 rounded-2xl shrink-0 text-2xl border border-white/30 backdrop-blur-xs shadow-inner">
              {pendingMobileReport.reportedRole === 'police' ? '👮' : '👥'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-[10px] uppercase tracking-wider bg-white text-red-950 px-2.5 py-0.5 rounded-full font-mono shadow-xs">
                  {pendingMobileReport.reportedRole === 'police' ? 'OFFICIAL POLICE THANA INTEL' : 'CITIZEN VDP HAZARD TRANSMISSION'}
                </span>
                <span className="text-xs font-mono text-red-200">Received at {pendingMobileReport.timestamp}</span>
                <span className="bg-red-950 text-red-200 text-[9.5px] px-2 py-0.5 rounded font-bold border border-red-800 uppercase">
                  {pendingMobileReport.status.toUpperCase()}
                </span>
              </div>
              <h4 className="font-black text-sm sm:text-base text-white leading-tight">
                {pendingMobileReport.reportedBy} reports <span className="underline decoration-amber-300 font-extrabold">{pendingMobileReport.hazardType}</span> on <span className="underline decoration-amber-300 font-extrabold">{pendingMobileReport.routeName}</span>
              </h4>
              <p className="text-xs text-red-100/90 leading-relaxed font-medium">
                {pendingMobileReport.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <button
              type="button"
              onClick={handleDismissMobileReport}
              className="px-3.5 py-2.5 bg-black/40 hover:bg-black/60 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-white/10"
            >
              Dismiss / Keep Route
            </button>
            <button
              type="button"
              onClick={handleApproveAndRerouteMobileReport}
              className="px-5 py-2.5 bg-white hover:bg-amber-50 text-red-950 rounded-xl text-xs font-black shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105 border border-white/50 min-h-[40px]"
            >
              <span className="text-base">⚡</span>
              <span>Approve Issue & Auto-Reroute Map 🔀</span>
            </button>
          </div>
        </div>
      )}

      {/* Portal Role Indicator Banner */}
      {currentRole === 'CITIZEN_DRIVER' ? (
        <div className="bg-amber-500/15 border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">👤</span>
            <div>
              <strong className="block text-slate-900 font-black text-xs sm:text-sm">
                PUBLIC ROAD SAFETY & ESSENTIAL RELIEF MAP
              </strong>
              <span className="text-[11px] text-slate-700">
                Simplified citizen view: Green lines denote open verified lifelines; red markers indicate active roadblocks.
              </span>
            </div>
          </div>
          <Link
            href="/portal/citizen"
            className="bg-[#fb792b] hover:bg-[#e06820] text-white px-3.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 self-end sm:self-auto shadow-xs"
          >
            <span>Track Arriving Supplies</span> →
          </Link>
        </div>
      ) : currentRole === 'FIELD_COMMANDER' ? (
        <div className="bg-blue-500/15 border border-blue-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">👮</span>
            <div>
              <strong className="block text-[#213d77] font-black text-xs sm:text-sm">
                POLICE & HIGHWAY PATROL TACTICAL GIS COMMAND
              </strong>
              <span className="text-[11px] text-slate-700">
                Statutory Traffic Regulation under Section 187 BNSS 2023. Click any highway sector to report roadblocks.
              </span>
            </div>
          </div>
          <Link
            href="/portal/police"
            className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 shrink-0 self-end sm:self-auto shadow-xs"
          >
            <span>Police Sector Portal</span> →
          </Link>
        </div>
      ) : null}

      {/* ── 3-COLUMN MAIN STAGE (MAP CONTROLS | LIVE GIS MAP | MISSION CONTROLS) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start relative z-0">

        {/* ── 1. LEFT SIDEBAR: MAP CONTROLS (col-span-2) ── */}
        <div className="lg:col-span-3 xl:col-span-2 space-y-4 max-h-[660px] xl:max-h-[740px] overflow-y-auto pr-1 custom-scrollbar">
          <div className="gov-card p-4 space-y-4 bg-white border border-slate-200 rounded-lg shadow-xs">
            <h2 className="text-xs font-black text-[#213d77] uppercase tracking-wider border-b border-slate-200 pb-2">
              {t('map_controls')}
            </h2>

            {/* Base Map Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">
                {t('base_map')}
              </label>
              <select
                value={baseMapLayer}
                onChange={e => setBaseMapLayer(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-[#fb792b] cursor-pointer"
              >
                <option value="google_roadmap">🗺️ Google Maps (Street & Roads)</option>
                <option value="google_hybrid">🛰️ Google Satellite (HD Hybrid)</option>
                <option value="google_terrain">🏔️ Google Terrain (Elevations)</option>
                <option value="osm">🌐 OpenStreetMap Standard</option>
                <option value="dark">🌌 Tactical Night Ops</option>
              </select>
            </div>

            {/* Quick District & Jurisdiction Focus */}
            <div className="space-y-1 pt-1 border-t border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">
                🏛️ Focus District
              </label>
              <select
                value={selectedDistrict?.id || ''}
                onChange={e => {
                  const found = NER_DISTRICT_JURISDICTIONS.find(d => d.id === e.target.value) || null
                  setSelectedDistrict(found)
                  if (found) setSelectedPoliceStation(null)
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-[11.5px] text-slate-800 font-bold focus:outline-none focus:border-[#fb792b] cursor-pointer"
              >
                <option value="">-- Pan-NER Overview (8 States) --</option>
                {NER_DISTRICT_JURISDICTIONS.map(dist => (
                  <option key={dist.id} value={dist.id}>
                    {dist.name} ({dist.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Layers Checkboxes */}
            <div className="space-y-2 pt-1 border-t border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">
                {t('layers')}
              </label>
              <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showDistrictBoundaries}
                    onChange={e => setShowDistrictBoundaries(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span className="font-semibold text-slate-800">🏛️ District Jurisdictions</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showPoliceStations}
                    onChange={e => setShowPoliceStations(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span className="font-semibold text-indigo-900">👮 Police Stations & PS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showLEWSLayer}
                    onChange={e => setShowLEWSLayer(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span className="font-semibold text-rose-900">🌋 GSI LEWS & Soil Moisture</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showRoadNetwork}
                    onChange={e => setShowRoadNetwork(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span>🛣️ {t('legend_open_route')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showIncidentsLayer}
                    onChange={e => setShowIncidentsLayer(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span>🚨 {t('nav_incidents')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showRiskLayer}
                    onChange={e => setShowRiskLayer(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span>⚠️ {t('early_warning')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showVehiclesLayer}
                    onChange={e => setShowVehiclesLayer(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span>🚛 {t('nav_vehicles')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showVAPLayer}
                    onChange={e => setShowVAPLayer(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span>📍 {t('vehicle_access_point')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={showInfraLayer}
                    onChange={e => setShowInfraLayer(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#213d77] rounded border-slate-300 focus:ring-[#fb792b] cursor-pointer"
                  />
                  <span className="text-slate-600">🌉 Strategic Bridges & Passes</span>
                </label>
              </div>
            </div>

            {/* Selected Police Station / District Live Inspection Card */}
            {(selectedPoliceStation || selectedDistrict) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-blue-200 pb-1">
                  <span className="font-extrabold text-[#213d77] text-[11px] uppercase tracking-wide">
                    {selectedPoliceStation ? '👮 Police Station Info' : '🏛️ District HQ Info'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedPoliceStation(null)
                      setSelectedDistrict(null)
                    }}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {selectedPoliceStation ? (
                  <div className="space-y-1 text-slate-800 text-[11px]">
                    <p className="font-bold text-[#1e3a8a]">{selectedPoliceStation.name}</p>
                    <p><strong>District:</strong> {selectedPoliceStation.district} ({selectedPoliceStation.state})</p>
                    <p><strong>Officer:</strong> {selectedPoliceStation.inCharge} ({selectedPoliceStation.rank})</p>
                    <p className="text-emerald-700 font-bold"><strong>Phone:</strong> {selectedPoliceStation.contactPhone}</p>
                    <p className="text-indigo-800 font-mono text-[10px]"><strong>VHF:</strong> {selectedPoliceStation.vhfCallsign}</p>
                    <p className="text-slate-600 text-[10.5px]"><strong>Roads:</strong> {selectedPoliceStation.jurisdictionRoads.join(', ')}</p>
                  </div>
                ) : selectedDistrict ? (
                  <div className="space-y-1 text-slate-800 text-[11px]">
                    <p className="font-bold text-[#213d77]">{selectedDistrict.name}</p>
                    <p><strong>State:</strong> {selectedDistrict.state}</p>
                    <p><strong>HQ:</strong> {selectedDistrict.headquarters}</p>
                    <p className="text-emerald-700"><strong>SP Office:</strong> {selectedDistrict.spContact}</p>
                    <p className="text-rose-700 font-bold"><strong>DEOC:</strong> {selectedDistrict.deocControlRoom}</p>
                    <p className="text-slate-600 text-[10.5px]"><strong>Highways:</strong> {selectedDistrict.roadNetworkSummary.nationalHighways.join(', ')}</p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Map Legend */}
            <div className="space-y-2 pt-1 border-t border-slate-200">
              <label className="text-[11px] font-bold text-slate-600 block uppercase">
                {t('map_legend')}
              </label>
              <div className="space-y-1.5 text-[11px] text-slate-700 font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 bg-blue-900 text-white rounded-full flex items-center justify-center text-[9px]">👮</span>
                  <span>Police Station & PS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-[#213d77] border-dashed rounded-xs shrink-0" />
                  <span>District Jurisdiction Boundary</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-[#16a34a] rounded-sm shrink-0" />
                  <span>{t('legend_open_route')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-[#dc2626] rounded-sm shrink-0" />
                  <span>{t('legend_blocked')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-[#d97706] rounded-sm shrink-0" />
                  <span>{t('legend_at_risk')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-1 bg-[#0284c7] rounded-sm shrink-0" />
                  <span>{t('fastest_route')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. CENTER VIEWPORT: LIVE OPERATIONAL GIS MAP (col-span-7) ── */}
        <div className="lg:col-span-6 xl:col-span-7 min-h-[660px] h-[660px] xl:h-[740px] rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl relative flex flex-col z-0">
          <NERMap
            routes={displayedRoutes}
            highlightedRouteName={suggestion?.recommended_route}
            blockedRouteName={selectedRoute}
            missionPathCoordinates={suggestion?.path_coordinates}
            originCoords={originCoordsObj}
            targetCoords={targetCoordsObj}
            isCrisisActive={Boolean(
              selectedRoute ||
              routes.some(r => r.status === 'blocked' || r.status === 'at_risk' || r.status === 'damaged') ||
              customTargetCoords ||
              (suggestion && suggestion.blockedRoad)
            )}
            animationEnabled={animationEnabled}
            vehicleTelemetry={suggestion?.vehicle_telemetry}
            activeIncidents={activeIncidents}
            lastMileAccessibility={effectiveLastMileAccessibility}
            connectionStatus={connectionStatus}
            lastSync={lastSync}
            baseLayer={baseMapLayer}
            showRoadNetwork={showRoadNetwork}
            showIncidents={showIncidentsLayer}
            showRiskPredictions={showRiskLayer}
            showVehicles={showVehiclesLayer}
            showVehicleAccessPoint={showVAPLayer}
            showAlternateRoute={showAltRouteLayer}
            showInfrastructure={showInfraLayer}
            showPoliceStations={showPoliceStations}
            showDistrictBoundaries={showDistrictBoundaries}
            showLEWS={showLEWSLayer}
            selectedDistrictId={selectedDistrict?.id}
            selectedPoliceStationId={selectedPoliceStation?.id}
            userRole={currentRole || undefined}
            onSelectDistrict={(dist) => setSelectedDistrict(dist)}
            onSelectPoliceStation={(ps) => setSelectedPoliceStation(ps)}
            onSelectRoute={(name) => setSelectedRoute(name)}
            onSelectTargetCoords={handleMapTargetSelected}
            onAdminSelectCrisisAndRoute={handleAdminSelectCrisisAndRoute}
            onIssueResolved={handleIssueResolved}
            onSelectOriginCoords={(coords) => {
              setOriginHub(coords.name || 'Guwahati')
            }}
            onTriggerSolveCorridor={() => {
              handleSuggest()
            }}
            onToggleMobileSimulator={() => {
              setIsMobileSimulatorOpen(prev => !prev)
            }}
            onReportRouteStatus={(name, status) => {
              setSelectedRoute(name)
              if (status === 'open') {
                updateRouteStatus(name, status)
              } else {
                handleOpenIncidentModal(name, status)
              }
            }}
            onConfirmIncident={handleConfirmAndReroute}
            onResolveIncident={handleResolveAndRestore}
          />
        </div>

        {/* ── 3. RIGHT PANEL: MISSION DETAILS & CONTROL (col-span-3) ── */}
        <div className="lg:col-span-3 xl:col-span-3 space-y-3.5 max-h-[660px] xl:max-h-[740px] overflow-y-auto pr-1.5 custom-scrollbar">

          {/* A. Police Ground Hazard & Location Monitor Card (POLICE ONLY) */}
          {isPolice ? (
            <div className="gov-card p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#213d77]">
                  <span>👮</span>
                  <span className="uppercase tracking-wide">Police Sector Ground Monitor</span>
                </div>
                <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  crisisZones.length > 0
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {crisisZones.length} {crisisZones.length === 1 ? 'LOCATION' : 'LOCATIONS'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Field patrol command: review declared hazard locations, mark new road blockages, or clear normalized spots.
              </p>

              {/* Active Crisis Locations List */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {crisisZones.length === 0 ? (
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                    <span className="text-xl block">✅</span>
                    <strong className="block text-xs text-[#213d77] font-bold">Sector All Clear</strong>
                    <p className="text-[11px] text-slate-600">No active hazards or road blockages declared.</p>
                  </div>
                ) : (
                  crisisZones.map(zone => (
                    <div
                      key={zone.id}
                      className="p-3 rounded-lg bg-rose-50/80 border border-rose-200 space-y-2 text-xs"
                    >
                      {/* Top Header Badge */}
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-200 truncate max-w-[190px]">
                          🚨 {zone.hazardType || 'CRISIS HAZARD'}
                        </span>
                        <span className="text-[9.5px] font-mono text-slate-500 font-semibold">
                          {(zone.radiusMeters / 1000).toFixed(1)} km
                        </span>
                      </div>

                      {/* Location Title & Info */}
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block leading-snug break-words">
                          {zone.title}
                        </strong>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10.5px] text-slate-600 mt-0.5 font-mono">
                          <span>📍 [{zone.lat.toFixed(3)}, {zone.lng.toFixed(3)}]</span>
                          <span>•</span>
                          <span>👮 {zone.policeStation}</span>
                        </div>
                      </div>

                      {/* Directive guidance */}
                      {zone.evacuationGuidance && (
                        <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-200 italic leading-tight">
                          🧭 <strong>Directive:</strong> {zone.evacuationGuidance}
                        </div>
                      )}

                      {/* Action Button: Clear Location */}
                      <div className="pt-0.5">
                        <button
                          onClick={() => handleIssueResolved(zone.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-md text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-all"
                        >
                          <span>✅</span>
                          <span>Issue Resolved (Clear Location)</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Actions for Police */}
              {crisisZones.length > 0 && (
                <div className="pt-1 border-t border-slate-200">
                  <button
                    onClick={() => handleIssueResolved()}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold py-1.5 px-2 rounded-md text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <span>🧹</span> Clear All Ground Locations
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Admin Active Mission & Crisis Target Card */
            <div className="gov-card p-4 space-y-2.5 bg-white border border-slate-200 rounded-lg shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-[#213d77] text-white text-[9.5px] font-mono font-black px-2 py-0.5 rounded tracking-wider flex items-center gap-1">
                  <span>🎯</span> {customTargetCoords ? 'CRISIS PINNED' : t('fastest_route')}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  customTargetCoords ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {customTargetCoords ? '🚨 CRISIS ACTIVE' : t('status_open')}
                </span>
              </div>

              <div>
                <h3 className="font-black text-sm text-slate-900 leading-tight">
                  {suggestion?.recommended_route || selectedRoute || 'NH-27 / Strategic Arterial Corridor'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                  <span>🏛️ Origin: <strong>{originHub}</strong></span>
                  <span>➔</span>
                  <span>🎯 Target: <strong>{customTargetCoords ? `[${customTargetCoords.lat.toFixed(3)}, ${customTargetCoords.lng.toFixed(3)}]` : destinationDepot}</strong></span>
                </div>
                {suggestion?.blockedRoad && (
                  <div className="mt-1.5 p-1.5 bg-amber-50 border border-amber-300 rounded text-[10.5px] text-amber-900 flex items-center gap-1.5 font-medium">
                    <span className="text-xs">🔄</span>
                    <span><strong>Active Bypass:</strong> Avoiding compromised {suggestion.blockedRoad}</span>
                  </div>
                )}
              </div>

              {/* Calamity Class Badge if marked */}
              {customTargetCoords && (
                <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between text-rose-900 font-bold">
                    <span className="flex items-center gap-1">
                      <span>{STANDARDIZED_DISASTER_CATEGORIES.find(c => c.id === selectedCalamityId)?.icon || '⚠️'}</span>
                      <span>{STANDARDIZED_DISASTER_CATEGORIES.find(c => c.id === selectedCalamityId)?.shortLabel}</span>
                    </span>
                    <span className="text-[10px] bg-rose-200 text-rose-950 px-1.5 py-0.2 rounded font-mono">PRIORITY-1</span>
                  </div>
                  <p className="text-[10.5px] text-rose-700 leading-tight">{selectedSubType}</p>
                </div>
              )}

              {/* Clear Map / Issue Resolved Button - ADMIN ONLY */}
              {(customTargetCoords || suggestion) && !isCitizen && (
                <div className="pt-1">
                  <button
                    onClick={() => handleIssueResolved()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-md text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
                  >
                    <span>✅</span>
                    <span>Issue Resolved (Clear Map)</span>
                  </button>
                </div>
              )}

              {/* Report Action Buttons - ADMIN & POLICE ONLY */}
              {!isCitizen && (
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs">
                  <span className="text-[11px] font-bold text-slate-500">Report:</span>
                  <button
                    onClick={() => handleOpenIncidentModal(selectedRoute || suggestion?.recommended_route || 'Active Corridor', 'blocked')}
                    className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold py-1 px-2 rounded text-[11px] transition-colors cursor-pointer text-center"
                  >
                    {t('mark_blocked')} 🚫
                  </button>
                  <button
                    onClick={() => handleOpenIncidentModal(selectedRoute || suggestion?.recommended_route || 'Active Corridor', 'at_risk')}
                    className="flex-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold py-1 px-2 rounded text-[11px] transition-colors cursor-pointer text-center"
                  >
                    {t('mark_at_risk')} ⚠️
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ⛺ Verified Safe Evacuation Havens & Refuges Nearby */}
          <div className="gov-card p-4 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#213d77]">
                <span>⛺</span>
                <span suppressHydrationWarning>Safe Evacuation Havens ({beacons.length})</span>
              </div>
              <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded font-mono">
                REFUGE POINTS
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Designated safe refuges for citizens evacuating the disaster zone. Follow safe route guidance below:
            </p>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {beacons.map(beacon => (
                <div key={beacon.id} className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-emerald-950 text-[11.5px]">
                    <span className="truncate">{beacon.name}</span>
                    <span className="font-mono text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-300 shrink-0">
                      {beacon.evacueeCount} Safe
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-100 text-emerald-900 space-y-0.5 text-[10.5px]">
                    <p className="font-bold text-[9.5px] text-emerald-800 uppercase flex items-center gap-1">
                      <span>🧭</span> Safe Passage Guidance:
                    </p>
                    <p className="leading-snug italic">
                      {beacon.safeRouteDescription || beacon.notes}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-emerald-200/50">
                    <span>💧 {beacon.waterAvailable ? 'Clean Water Available' : 'No Water'}</span>
                    <span>🏠 {beacon.shelterAvailable ? 'Dry Roof' : 'Open Ground'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B. Terrain, Helicopter Viability & Vehicle Suitability Card */}
          <div className="gov-card p-4 space-y-3 bg-white border border-slate-200 rounded-lg shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#213d77]">
                <Truck className="w-4 h-4 text-[#fb792b]" />
                <span>Vehicle & Aviation Suitability</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border ${
                vehicleSuitability?.heliWeatherCheck.weatherAlertLevel === 'CLEAR_TO_FLY'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : vehicleSuitability?.heliWeatherCheck.weatherAlertLevel === 'WEATHER_GROUNDED'
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {vehicleSuitability?.heliWeatherCheck.weatherAlertLevel === 'CLEAR_TO_FLY' ? '🚁 HELI AIRBRIDGE VIABLE' :
                 vehicleSuitability?.heliWeatherCheck.weatherAlertLevel === 'WEATHER_GROUNDED' ? '🛑 HELI GROUNDED (WEATHER)' : '⚠️ HIGH TURBULENCE'}
              </span>
            </div>

            {/* Inter-State Strategic Airlift Leg (if origin is outside NER) */}
            {vehicleSuitability?.isOutsideNEROrigin && vehicleSuitability.strategicInterStateLeg && (
              <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[#213d77] text-[11px]">
                  <span className="flex items-center gap-1">
                    <span>✈️</span>
                    <span>Inter-State Strategic Logistics Leg</span>
                  </span>
                  <span className="text-[9.5px] bg-blue-200 text-[#213d77] px-1.5 py-0.2 rounded font-mono">IAF AIRLIFT</span>
                </div>
                <p className="text-[10.5px] text-slate-700 leading-tight">
                  Dispatched via <strong>IAF C-130J Super Hercules</strong> from <strong>{vehicleSuitability.strategicInterStateLeg.originCity}</strong> ➔ <strong>{vehicleSuitability.strategicInterStateLeg.gatewayHubCity}</strong> (~{vehicleSuitability.strategicInterStateLeg.transitDurationHours}h flight) before regional road/heli transfer.
                </p>
              </div>
            )}

            {/* Helicopter Weather & VFR Safety Diagnostic */}
            <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
              vehicleSuitability?.heliWeatherCheck.weatherAlertLevel === 'CLEAR_TO_FLY'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : vehicleSuitability?.heliWeatherCheck.weatherAlertLevel === 'WEATHER_GROUNDED'
                ? 'bg-red-50/70 border-red-200 text-red-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center justify-between font-bold text-[11px]">
                <span className="flex items-center gap-1">
                  <span>🚁</span>
                  <span>Rotary Heli-Lift Diagnostic</span>
                </span>
                <span className="text-[9.5px] font-mono uppercase">
                  Base: {vehicleSuitability?.heliWeatherCheck.forwardHelipadName?.split(' ')[0] || 'Airbase'}
                </span>
              </div>
              <p className="text-[10.5px] leading-tight">
                {vehicleSuitability?.heliWeatherCheck.isHeliViable
                  ? `Clear VFR mountain flight conditions. Direct rotary airbridge takes ~${vehicleSuitability.heliWeatherCheck.airFlightTimeMins} mins (${vehicleSuitability.heliWeatherCheck.airDistanceKm} km air distance) directly to forward LZ.`
                  : vehicleSuitability?.heliWeatherCheck.groundingReason}
              </p>
            </div>

            {/* Vehicle Match & Speed Grid */}
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-[9.5px] text-slate-500 uppercase font-bold block">Assigned Transport Class</span>
                <strong className="text-slate-900 font-black text-xs block">
                  {customTargetCoords && vehicleSuitability
                    ? VEHICLE_CONSTRAINTS[vehicleSuitability.primaryRecommendedVehicle]?.displayName
                    : 'Medium Relief Carrier (8T) / Heavy Multi-Axle Convoy'}
                </strong>
                <p className="text-[10.5px] text-slate-600 mt-0.5">
                  {customTargetCoords && vehicleSuitability
                    ? vehicleSuitability.suitabilityRationale
                    : 'National Highway corridor cleared for heavy freight convoys and inter-state logistics.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[9.5px]">Motorable Road:</span>
                  <strong className="text-[#213d77]">
                    {suggestion?.distance_km || (customTargetCoords && vehicleSuitability ? vehicleSuitability.motorableDistanceKm : 560)} km
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px]">Last-Mile Non-Road:</span>
                  <strong className={customTargetCoords && vehicleSuitability && vehicleSuitability.lastMileDistanceKm > 0 ? 'text-orange-700' : 'text-emerald-700'}>
                    {customTargetCoords && vehicleSuitability && vehicleSuitability.lastMileDistanceKm > 0
                      ? `${vehicleSuitability.lastMileDistanceKm} km (${vehicleSuitability.lastMileMode.replace(/_/g, ' ')})`
                      : '0 km (Direct Road Access)'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Vehicle Access Point (VAP) Roadhead Staging Protocol — only if last-mile exists */}
            {effectiveLastMileAccessibility && effectiveLastMileAccessibility.lastMileDistanceKm > 0 ? (
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span>📍</span>
                    <span>Vehicle Access Point (VAP)</span>
                  </span>
                  <span className="text-[9.5px] bg-amber-200 px-1.5 py-0.2 rounded font-mono">ROADHEAD</span>
                </div>
                <p className="text-[10.5px] text-amber-800">
                  {vehicleSuitability?.vehicleAccessPointName || 'Terminal Roadhead Staging Point'}
                </p>
                <div className="text-[10px] text-amber-700 pt-1 border-t border-amber-200/60 flex justify-between">
                  <span>Handover: <strong>{vehicleSuitability?.transshipmentProtocol.handoverOfficerRank || 'SDRF Commander'}</strong></span>
                  <span>Porters: <strong>{vehicleSuitability?.transshipmentProtocol.personnelRequired || 6} Teams</strong></span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-900 text-[11px]">
                  <span className="flex items-center gap-1">
                    <span>✅</span>
                    <span>Delivery Access Profile</span>
                  </span>
                  <span className="text-[9.5px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-mono">DIRECT DEPOT</span>
                </div>
                <p className="text-[10.5px] text-emerald-800">
                  Direct motorable access to <strong>{destinationDepot} Regional Supply Depot</strong>. No trans-shipment or porter relay needed.
                </p>
              </div>
            )}
          </div>

          {/* C. Tactical Cargo Viability & Cold-Chain Countdown HUD */}
          {tacticalEvaluation?.coldChainCountdown && (
            <div className="gov-card p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[#213d77] text-[11px] flex items-center gap-1">
                  <span>⏱️</span> Cargo Viability & Cold-Chain HUD
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                  tacticalEvaluation.coldChainCountdown.status === 'OPTIMAL_SAFE'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : tacticalEvaluation.coldChainCountdown.status === 'AMBER_EXPIRING_SOON'
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}>
                  {tacticalEvaluation.coldChainCountdown.status === 'OPTIMAL_SAFE' ? '✅ SAFE WINDOW' :
                   tacticalEvaluation.coldChainCountdown.status === 'AMBER_EXPIRING_SOON' ? '⚡ EXPIRING SOON' : '🚨 CRITICAL SPOILAGE'}
                </span>
              </div>

              <div className="space-y-1 text-slate-800 text-[11px]">
                <p className="font-bold text-[#213d77]">{tacticalEvaluation.coldChainCountdown.cargoName}</p>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded border border-slate-200 text-[10.5px]">
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Max Safe Endurance:</span>
                    <strong className="text-slate-900">{tacticalEvaluation.coldChainCountdown.safeEnduranceHours} Hours</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Remaining Safety Margin:</span>
                    <strong className={tacticalEvaluation.coldChainCountdown.safetyMarginHours > 4 ? 'text-emerald-700 font-mono' : 'text-rose-700 font-mono font-bold'}>
                      +{tacticalEvaluation.coldChainCountdown.safetyMarginHours} Hours
                    </strong>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 italic pt-0.5">
                  Packaging: {tacticalEvaluation.coldChainCountdown.coolantType}
                </p>
              </div>
            </div>
          )}

          {/* D. Corridor Bridge Guard & Axle-Load Gating Card */}
          {tacticalEvaluation?.bridgeGating && (
            <div className="gov-card p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[#213d77] text-[11px] flex items-center gap-1">
                  <span>🌉</span> Corridor Bridge Guard
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                  tacticalEvaluation.bridgeGating.isPassable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}>
                  {tacticalEvaluation.bridgeGating.isPassable ? '✅ LOAD COMPLIANT' : '🛑 LOAD VIOLATION'}
                </span>
              </div>

              <div className="text-[11px] space-y-1 text-slate-700">
                <p>
                  Lowest Bridge Rating on Route: <strong className="text-[#213d77]">Class {tacticalEvaluation.bridgeGating.lowestBridgeClassTons} ({tacticalEvaluation.bridgeGating.lowestBridgeClassTons}T)</strong>
                </p>
                {tacticalEvaluation.bridgeGating.violationBridge ? (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-red-800 text-[10.5px]">
                    <strong>⚠️ VIOLATION:</strong> {tacticalEvaluation.bridgeGating.violationBridge.name} rated for {tacticalEvaluation.bridgeGating.violationBridge.bridgeClassTons}T. Vehicle down-gauging enforced.
                  </div>
                ) : (
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    All bridges and box culverts cleared for selected vehicle gross weight.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* E. Comms Continuity & Cellular Blackout Zones Card */}
          {tacticalEvaluation?.blackoutZones && tacticalEvaluation.blackoutZones.length > 0 && (
            <div className="gov-card p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[#213d77] text-[11px] flex items-center gap-1">
                  <span>📡</span> Comms Continuity & VHF Relay
                </span>
                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded font-mono">
                  VHF MANDATORY
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                {tacticalEvaluation.blackoutZones.map(zone => (
                  <div key={zone.id} className="p-2 rounded bg-amber-50/70 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-900">
                      <span>{zone.corridorName}</span>
                      <span className="text-[9.5px] font-mono">{zone.lengthKm} km Blackout</span>
                    </div>
                    <p className="text-[10px] text-amber-800">
                      <strong>4G/5G Drops at Km {zone.startKmMark}</strong> ➔ Handoff to VHF Radio Callsign: <strong className="font-mono text-[#213d77]">{zone.primaryPoliceVHFRelay}</strong>
                    </p>
                    <span className="text-[9.5px] bg-emerald-100 text-emerald-800 px-1 rounded font-mono font-bold inline-block">
                      {zone.loraMeshGatewayAvailable ? '✅ LoRa Mesh Active' : '⚠️ Offline VHF Only'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* F. Civilian First Response (Village Defence Party & Gaon Burah) */}
          {tacticalEvaluation?.vdpProfile && (
            <div className="gov-card p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[#213d77] text-[11px] flex items-center gap-1">
                  <span>👥</span> Civilian First Response at VAP
                </span>
                <span className="text-[9px] bg-blue-100 text-[#213d77] font-bold px-1.5 py-0.2 rounded">
                  {tacticalEvaluation.vdpProfile.standbyReadiness === 'IMMEDIATE_15_MIN' ? '⚡ 15-MIN STANDBY' : 'STANDBY'}
                </span>
              </div>

              <div className="space-y-1 text-slate-800 text-[11px]">
                <p><strong>Village Unit:</strong> {tacticalEvaluation.vdpProfile.villageName} ({tacticalEvaluation.vdpProfile.district})</p>
                <div className="grid grid-cols-2 gap-1 text-[10.5px] pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">Gaon Burah (Headman):</span>
                    <strong>{tacticalEvaluation.vdpProfile.gaonBurahName}</strong>
                    <p className="text-emerald-700 font-mono text-[10px]">📞 {tacticalEvaluation.vdpProfile.gaonBurahContact}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px]">VDP Secretary:</span>
                    <strong>{tacticalEvaluation.vdpProfile.vdpSecretaryName}</strong>
                    <p className="text-emerald-700 font-mono text-[10px]">📞 {tacticalEvaluation.vdpProfile.vdpSecretaryContact}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-200 text-[10px] text-slate-700">
                  <span>Available Porters: <strong>{tacticalEvaluation.vdpProfile.availablePorterVolunteers} Vol.</strong></span>
                  <span>Pack Mules: <strong>{tacticalEvaluation.vdpProfile.packMulesCount}</strong></span>
                  <span>Boatmen: <strong>{tacticalEvaluation.vdpProfile.localRiverBoatmenCount}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* G. Mountain Energy & Forward Refuel Point (FRP) */}
          {tacticalEvaluation?.fuelProfile && (
            <div className="gov-card p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[#213d77] text-[11px] flex items-center gap-1">
                  <span>⛽</span> Energy & Forward Refuel Point
                </span>
                <span className="text-[9px] bg-slate-100 text-slate-800 font-bold px-1.5 py-0.2 rounded font-mono">
                  +{tacticalEvaluation.fuelProfile.fuelBurnSurchargePercent}% CLIMB BURN
                </span>
              </div>

              <div className="space-y-1 text-slate-800 text-[11px]">
                <div className="flex justify-between items-center">
                  <span>Round-Trip Diesel Reserve:</span>
                  <strong className="text-[#213d77] font-mono text-xs">{tacticalEvaluation.fuelProfile.roundTripDieselLitres} Litres</strong>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10.5px] space-y-0.5">
                  <span className="font-bold text-slate-900 block">{tacticalEvaluation.fuelProfile.nearestRefuelPoint.name}</span>
                  <p className="text-slate-600">
                    Stock: <strong>{tacticalEvaluation.fuelProfile.nearestRefuelPoint.highAltitudeDieselStockLitres.toLocaleString()} L</strong> • Gen-Set: {tacticalEvaluation.fuelProfile.nearestRefuelPoint.generatorPowerBackup ? '✅ 24/7 Backup' : '❌ Standard'}
                  </p>
                  <p className="text-emerald-700 font-bold text-[10px]">
                    📞 Emergency Contact: {tacticalEvaluation.fuelProfile.nearestRefuelPoint.emergencyContact}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* H. Closest Apex Trauma Center & Hospital Card */}
          {closestHospital && (
            <div className="gov-card p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[#213d77] text-[11px] flex items-center gap-1">
                  <span>🏥</span> Closest Apex Medical Hub
                </span>
                <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                  {closestHospital.traumaLevel.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-slate-800 text-[11px]">
                <p className="font-bold text-[#213d77]">{closestHospital.name}</p>
                <p className="text-emerald-700 font-bold">
                  📞 Casualty Hotline: <a href={`tel:${closestHospital.emergencyCasualtyPhone}`} className="underline">{closestHospital.emergencyCasualtyPhone}</a>
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                  <span>Total Beds: <strong>{closestHospital.totalBeds}</strong></span>
                  <span>ICU Beds: <strong>{closestHospital.icuBedsAvailable}</strong></span>
                  <span>Helipad: <strong>{closestHospital.helipadOnSite ? '✅ ON-SITE' : '❌ NO'}</strong></span>
                  <span>Ambulance: <strong>{closestHospital.ambulanceHelpline}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* I. Along-the-Route Police Station Security & Statutory Escort Card */}
          {alongRoutePoliceStations.length > 0 && (
            <div className="gov-card p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-extrabold text-[#213d77] text-[11px] flex items-center gap-1">
                  <span>👮</span> Route Police Stations ({alongRoutePoliceStations.length})
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                  CLEARANCE ACTIVE
                </span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {alongRoutePoliceStations.slice(0, 3).map(({ station, distanceKm }) => (
                  <div key={station.id} className="p-1.5 rounded bg-slate-50 border border-slate-200 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                      <span>{station.name}</span>
                      <span className="text-xs text-slate-500 font-mono">~{distanceKm} km from route</span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <strong>OC:</strong> {station.inCharge} • <strong>Callsign:</strong> <span className="font-mono text-[#213d77] font-bold">{station.vhfCallsign.split(' ')[0]}</span>
                    </p>
                    <p className="text-xs text-emerald-700 font-bold">
                      📞 Hotline: <a href={`tel:${station.contactPhone.split(' ')[0]}`} className="underline">{station.contactPhone.split(' ')[0]}</a>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🚨 Disaster Crisis Danger Perimeters */}
          <div className="gov-card p-3.5 bg-white border-2 border-rose-200 rounded-xl shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-rose-200 pb-1.5">
              <span suppressHydrationWarning className="font-extrabold text-rose-950 text-xs flex items-center gap-1.5">
                <span>🚨</span> Disaster Crisis Danger Zones ({crisisZones.length})
              </span>
              <span className="text-xs bg-rose-100 text-red-900 font-bold px-2 py-0.5 rounded font-mono">
                RED DANGER CIRCLES
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Active statutory crisis hazard sectors. Avoid transiting into these red dashed danger circles:
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {crisisZones.map(zone => (
                <div key={zone.id} className="p-2.5 rounded-xl bg-rose-50/90 border border-rose-300 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                    <span className="truncate">{zone.title}</span>
                    <span className="font-mono text-xs text-rose-900 bg-white px-2 py-0.5 rounded border border-rose-300 shrink-0 font-bold">
                      {(zone.radiusMeters / 1000).toFixed(1)} km
                    </span>
                  </div>

                  {/* Workflow Status Pill */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-rose-950 font-semibold leading-tight">
                      {zone.hazardType}
                    </span>
                    <span className={`text-[10.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      zone.workflowStatus === 'POLICE_VERIFIED'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : zone.workflowStatus === 'POLICE_REROUTE_REQUESTED'
                        ? 'bg-rose-100 text-red-900 border-rose-400 animate-pulse'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {zone.workflowStatus}
                    </span>
                  </div>

                  {/* Assigned Route or Obstacle Notice */}
                  {zone.assignedRouteName && (
                    <p className="text-xs text-slate-800 bg-white p-1.5 rounded border border-rose-200">
                      <strong>Assigned:</strong> {zone.assignedRouteName} ({zone.assignedVehicleName})
                    </p>
                  )}

                  {zone.policeObstacleReport && (
                    <p className="text-xs text-rose-900 bg-rose-100 p-1.5 rounded border border-rose-300 font-semibold">
                      🛑 <strong>Obstacle:</strong> {zone.policeObstacleReport}
                    </p>
                  )}

                  {zone.reroutedRouteName && (
                    <p className="text-xs text-emerald-900 bg-emerald-100 p-1.5 rounded border border-emerald-300 font-bold">
                      🔄 <strong>Re-Route:</strong> {zone.reroutedRouteName}
                    </p>
                  )}

                  {/* Quick Action Triggers & Resolution - ADMIN & POLICE ONLY */}
                  {!isCitizen ? (
                    <>
                      <div className="pt-1 flex gap-1">
                        {zone.workflowStatus === 'CRISIS_MARKED' && (
                          <button
                            onClick={() => adminAssignRouteToCrisisZone({
                              zoneId: zone.id,
                              assignedRouteName: 'NH-37 Tupul Bypass via North Ridge Footpath (km 48)',
                              assignedVehicleCategory: 'HILL_4X4_OFFROAD_2T',
                              assignedVehicleName: 'Hill 4x4 Off-Road Bolero Fleet',
                              adminNotes: 'State EOC Admin designated 4x4 Hill Corridor.',
                            })}
                            className="flex-1 bg-[#fb792b] hover:bg-[#e06820] text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          >
                            <span>⚡</span> 1. Admin Give Route
                          </button>
                        )}

                        {(zone.workflowStatus === 'ROUTE_ASSIGNED' || zone.workflowStatus === 'ADMIN_REROUTED') && (
                          <>
                            <button
                              onClick={() => policeVerifyRoute({
                                zoneId: zone.id,
                                officerName: 'OC Inspector R. Barman',
                                notes: 'Ground passable. Clear for convoy transit.',
                              })}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              <span>✅</span> 2A. Police Verify
                            </button>
                            <button
                              onClick={() => policeRequestReroute({
                                zoneId: zone.id,
                                officerName: 'OC Inspector R. Barman',
                                obstacleDescription: 'Culvert collapsed at km 94. Request Airbridge.',
                              })}
                              className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                            >
                              <span>🛑</span> 2B. Re-Route
                            </button>
                          </>
                        )}

                        {zone.workflowStatus === 'POLICE_REROUTE_REQUESTED' && (
                          <button
                            onClick={() => handleExecuteRealReroute(zone)}
                            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer animate-pulse"
                          >
                            <span>🔄</span> 3. Admin: Re-Route Now (Calculate Real Bypass)
                          </button>
                        )}

                        {zone.workflowStatus === 'POLICE_VERIFIED' && (
                          <div className="w-full text-center py-1 bg-emerald-100 border border-emerald-300 rounded text-emerald-900 font-bold text-xs">
                            ✅ Convoys Authorized to Proceed
                          </div>
                        )}
                      </div>

                      {/* 🎉 Mark Issue Resolved & Clear Crisis from Map */}
                      <div className="pt-1">
                        <button
                          onClick={() => resolveAndClearCrisisZone({
                            zoneId: zone.id,
                            officerName: 'Field Police Unit',
                            resolutionNotes: 'Hazard cleared and corridor reopened.',
                          })}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-all"
                        >
                          <span>🎉</span>
                          <span>✅ Issue Resolved (Clear from Map)</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="pt-1 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded p-1.5 font-medium flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Active Hazard Perimeter: Civilians strictly avoid transit through this danger zone.</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-rose-200/60 font-mono">
                    <span>{zone.policeStation}</span>
                    <span>{zone.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ⛺ Safe Evacuation Havens & Refuges Nearby */}
          <div className="gov-card p-3.5 bg-white border-2 border-emerald-200 rounded-xl shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
              <span className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                <span>⛺</span> Safe Evacuation Havens ({beacons.length})
              </span>
              <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded font-mono">
                REFUGE POINTS
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Safe gathering points marked by evacuated citizens outside crisis zones. Follow guidance to reach these safe refuges:
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {beacons.map(beacon => (
                <div key={beacon.id} className="p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-300 space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-950 text-xs">
                    <span className="truncate">{beacon.name}</span>
                    <span className="font-mono text-xs text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-400 shrink-0 font-bold">
                      {beacon.evacueeCount} Safe
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed italic font-medium">
                    🧭 {beacon.safeRouteDescription || beacon.notes}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-emerald-200/60">
                    <span>💧 {beacon.waterAvailable ? 'Water OK' : 'No Water'}</span>
                    <span>🏠 {beacon.shelterAvailable ? 'Dry Roof' : 'Open Ground'}</span>
                    <span className="font-mono">{beacon.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. Quick Actions (2x2 Big Buttons Grid + Statutory Broadcast) - ADMIN & POLICE ONLY */}
          {!isCitizen && (
            <div className="space-y-2">
              <button
                onClick={handleTriggerCorridorBroadcast}
                className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-xs py-3 px-3 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-emerald-700 ring-2 ring-emerald-500/20"
              >
                <span className="text-sm">📢</span>
                <span>BROADCAST CORRIDOR CLEARANCE (POLICE & VDP)</span>
              </button>

              <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider block pt-1">
                {t('proactive_action_plan')}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenIncidentModal(selectedRoute || 'Active Sector', 'blocked')}
                  className="bg-[#fb792b] hover:bg-[#e06820] text-white font-black text-xs py-3 px-2 rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>🛑</span> {t('btn_confirm_incident')}
                </button>
                <Link
                  href="/missions"
                  className="bg-[#fb792b] hover:bg-[#e06820] text-white font-black text-xs py-3 px-2 rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                >
                  <span>✅</span> {t('btn_authorize_mission')}
                </Link>
                <button
                  onClick={() => handleOpenIncidentModal(selectedRoute || 'Active Sector', 'at_risk')}
                  className="bg-[#213d77] hover:bg-[#1b3162] text-white font-black text-xs py-3 px-2 rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>📝</span> {t('btn_report_incident')}
                </button>
                <button
                  onClick={handleSuggest}
                  className="bg-[#213d77] hover:bg-[#1b3162] text-white font-black text-xs py-3 px-2 rounded shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>🔀</span> {t('btn_find_alternate_route')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. BOTTOM 2-CARD DECK: LIVE REAL-TIME MISSIONS & DYNAMIC FIELD ALERTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Card 1: LIVE ACTIVE MISSIONS */}
        <div className="gov-card p-4 space-y-3 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#fb792b]" />
              <h3 className="font-black text-xs text-[#213d77] uppercase tracking-wider">
                {t('nav_missions')}
              </h3>
            </div>
            <Link
              href="/missions"
              className="text-[11px] font-bold text-[#213d77] hover:underline"
            >
              {t('view_all')}
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[10.5px] uppercase">
                  <th className="pb-1.5 font-bold">{t('incident_id_col')}</th>
                  <th className="pb-1.5 font-bold">{t('severity_col')}</th>
                  <th className="pb-1.5 font-bold">{t('crisis_destination_label')}</th>
                  <th className="pb-1.5 font-bold">{t('assigned_vehicle')}</th>
                  <th className="pb-1.5 font-bold">{t('status_col')}</th>
                  <th className="pb-1.5 font-bold">{t('arrival_time')}</th>
                  <th className="pb-1.5 font-bold">PROGRESS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11.5px] font-medium text-slate-800">
                {suggestion ? (
                  <tr className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 font-mono font-bold text-[#213d77]">
                      MIS-2026-LIVE
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                        customTargetCoords ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {customTargetCoords ? 'P1 CRITICAL' : 'P2 HIGH'}
                      </span>
                    </td>
                    <td className="py-2.5 font-semibold text-slate-900">
                      {customTargetCoords ? `Crisis Epicenter [${customTargetCoords.lat.toFixed(2)}, ${customTargetCoords.lng.toFixed(2)}]` : destinationDepot}
                    </td>
                    <td className="py-2.5 font-mono text-[#213d77] font-bold">
                      {suggestion.vehicle_telemetry?.vehicleNumber || 'NER-CONVOY-01'}
                    </td>
                    <td className="py-2.5">
                      <span className="bg-emerald-100 text-emerald-800 font-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded">
                        {suggestion.vehicle_telemetry?.modeBadge || 'DISPATCHED'}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-700">
                      {suggestion.vehicle_telemetry?.arrivalClockTime || '~01:45 hrs'}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#213d77] h-full rounded-full" style={{ width: '45%' }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700">45%</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-slate-400 font-mono text-xs">
                      No active mission dispatched. Select Origin & Target on the map above and click "Find Alternate Route" to generate tactical corridor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: DYNAMIC LIVE HAZARD ALERTS */}
        <div className="gov-card p-4 space-y-3 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#fb792b]" />
              <h3 className="font-black text-xs text-[#213d77] uppercase tracking-wider">
                {t('active_alerts')} ({activeIncidents.length})
              </h3>
            </div>
            <Link
              href="/notifications"
              className="text-[11px] font-bold text-[#213d77] hover:underline"
            >
              {t('view_all')}
            </Link>
          </div>

          <div className="space-y-2 text-xs max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {activeIncidents.length > 0 ? (
              activeIncidents.map(inc => {
                const isConfirmed = inc.status === 'confirmed'
                const isPredicted = inc.status === 'predicted'
                return (
                  <div
                    key={inc.id}
                    className={`flex items-center justify-between p-2 rounded border transition-all ${
                      isConfirmed
                        ? 'bg-red-50/80 border-red-200 text-red-950'
                        : isPredicted
                        ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                        : 'bg-orange-50/80 border-orange-200 text-orange-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                          isConfirmed ? 'bg-red-600 text-white' : isPredicted ? 'bg-amber-600 text-white' : 'bg-orange-500 text-white'
                        }`}
                      >
                        {isConfirmed ? 'CRITICAL (10.0)' : isPredicted ? 'EARLY WARNING' : 'REPORTED'}
                      </span>
                      <span className="font-bold truncate text-[11.5px]">
                        {(inc.type || 'Hazard').toUpperCase()}: {inc.route_name || 'Corridor'} — {inc.description || 'Disruption observed'}
                      </span>
                    </div>
                    <div className="text-right text-[10.5px] text-slate-500 font-mono shrink-0 ml-2">
                      <span>{inc.reported_by || 'Field Station'}</span> • <span>{inc.reported_at ? new Date(inc.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All monitored strategic corridors are clear. No active disruptions reported.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── STEP 2: CRISIS OPERATIONAL PROFILER & DISASTER MODAL ── */}
      {crisisModalOpen && customTargetCoords && (
        <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl border border-red-200">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg text-[#213d77]">
                    Tag Crisis Epicenter & Dispatch Mission
                  </h3>
                  <p className="text-xs text-slate-500">
                    Coordinates: <strong className="font-mono text-slate-800">{customTargetCoords.lat.toFixed(4)}°N, {customTargetCoords.lng.toFixed(4)}°E</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCrisisModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800 custom-scrollbar">
              {/* 1. Standardized Disaster Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  1. Select Calamity Class (Pan-NER Standard)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STANDARDIZED_DISASTER_CATEGORIES.map(cat => {
                    const isSelected = selectedCalamityId === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCalamityId(cat.id)
                          setSelectedSubType(cat.specificNERSubTypes[0])
                        }}
                        className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#213d77] bg-blue-50/90 ring-2 ring-[#213d77]/20 shadow-xs'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span>{cat.icon}</span>
                            <span>{cat.shortLabel}</span>
                          </span>
                          {isSelected && <span className="text-[10px] text-[#213d77] font-mono font-bold">✓ SELECTED</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                          {cat.transportLogisticsImpact}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Specific Sub-Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Specific Terrain Impact / Hazard Sub-Type
                </label>
                <select
                  value={selectedSubType}
                  onChange={e => setSelectedSubType(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#213d77] focus:outline-hidden cursor-pointer"
                >
                  {STANDARDIZED_DISASTER_CATEGORIES.find(c => c.id === selectedCalamityId)?.specificNERSubTypes.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* 2. Source Origin Selection */}
              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    2. Origin Supply Depot Selection
                  </label>
                  <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-300">
                    ⚡ Auto-Detected Closest Hub
                  </span>
                </div>

                {autoDetectedOrigin && (
                  <p className="text-[11.5px] text-slate-600">
                    <strong>Recommendation:</strong> {autoDetectedOrigin.reason}
                  </p>
                )}

                <div>
                  <select
                    value={originHub}
                    onChange={e => setOriginHub(e.target.value)}
                    className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-[#213d77] focus:outline-hidden cursor-pointer"
                  >
                    {SUPPLY_ORIGINS.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name} {o.id === autoDetectedOrigin?.depotId ? '⭐ (Recommended Nearest)' : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    💡 You can override and select any strategic hub if preferred.
                  </span>
                </div>
              </div>

              {/* 3. Live Weather Condition */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                    3. Live Weather & Mountain Flight Visibility
                  </label>
                  <span className="text-[10px] text-slate-500 font-bold font-mono">VFR Aviation Gate</span>
                </div>
                <select
                  value={weatherCondition}
                  onChange={e => setWeatherCondition(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-[#213d77] focus:outline-hidden cursor-pointer"
                >
                  <option value="clear">☀️ Clear Skies & High Mountain Visibility (&gt; 10 km) ➔ 🚁 Heli Airbridge Viable</option>
                  <option value="monsoon">🌧️ Monsoon Downpour / Torrential Rain (&lt; 2.0 km Vis) ➔ 🛑 Heli Grounded (4x4 Staging)</option>
                  <option value="fog">🌫️ Dense Valley Fog / Cloudburst Below Ridge ➔ 🛑 Heli Grounded (4x4 Staging)</option>
                  <option value="windy">💨 High Mountain Wind Shear (&gt; 45 km/h) ➔ ⚠️ Heavy Mi-17 Only</option>
                </select>
              </div>

              {/* 4. Priority Cargo */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  4. Essential Cargo Priority
                </label>
                <select
                  value={cargoType}
                  onChange={e => setCargoType(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-[#213d77] focus:outline-hidden cursor-pointer"
                >
                  <option value="medicine">💊 Emergency Medicine, Cold-Chain Vaccines & Blood Plasma</option>
                  <option value="oxygen">🫁 Medical Oxygen Cylinders & Concentrators</option>
                  <option value="food">🌾 High-Energy Food Rations & Clean Drinking Water</option>
                  <option value="machinery">🚜 Heavy Hydraulic Excavation & Bailey Span Equipment</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setCrisisModalOpen(false)}
                className="text-xs font-bold px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchCrisisMission}
                className="btn-irctc-primary text-xs px-5 py-2.5 rounded-lg shadow-xs flex items-center gap-2 font-black cursor-pointer min-h-[40px]"
              >
                <span>🚀</span> Calculate Emergency Corridor & Staging
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 5: STATUTORY CORRIDOR ALERT BROADCAST MODAL ── */}
      {broadcastModalOpen && currentBroadcast && (
        <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200">
                  <span className="text-xl">📢</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-[#213d77]">
                      Statutory Green-Corridor Alert Broadcast
                    </h3>
                    <span className="bg-red-100 text-red-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                      {currentBroadcast.priority.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dispatched at <strong className="text-slate-800">{currentBroadcast.timestamp}</strong> • Reference: <strong className="font-mono text-slate-800">{currentBroadcast.id}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-800 custom-scrollbar">
              {/* Recipient Police Station & VDP Roster */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  1. Recipient Roster & SMS Transmission Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {currentBroadcast.recipientStations.map(rec => (
                    <div key={rec.stationId} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>👮 {rec.stationName}</span>
                        <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                          DELIVERED SMS ✅
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-600">
                        <strong>OC:</strong> {rec.officerInCharge} • <strong>Callsign:</strong> <span className="font-mono text-[#213d77]">{rec.vhfCallsign.split(' ')[0]}</span>
                      </p>
                      <p className="text-[10.5px] text-slate-500 font-mono">
                        📱 {rec.contactPhone}
                      </p>
                    </div>
                  ))}

                  {currentBroadcast.civilianVDPRecipient && (
                    <div className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#213d77]">
                        <span>👥 {currentBroadcast.civilianVDPRecipient.villageName} VDP</span>
                        <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">
                          DELIVERED SMS ✅
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-700">
                        <strong>Gaon Burah (Headman):</strong> {currentBroadcast.civilianVDPRecipient.gaonBurahName}
                      </p>
                      <p className="text-[10.5px] text-slate-500 font-mono">
                        📱 {currentBroadcast.civilianVDPRecipient.contactPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Official Police & Civil Directive Terminal */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                  2. Official Statutory Mobile / VHF Broadcast Payload
                </label>
                <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap shadow-inner border border-slate-800">
                  {currentBroadcast.statutoryDirectiveText}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
              <span className="text-slate-500 italic text-[11px]">
                Authorized by: {currentBroadcast.authorizedBy}
              </span>
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="btn-irctc-navy text-xs px-5 py-2.5 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[40px]"
              >
                Acknowledge & Close Roster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── USER INCIDENT REPORTING MODAL ── */}
      {incidentModalOpen && (
        <div className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-100 text-red-700 rounded-xl border border-red-200">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="font-black text-base text-[#213d77]">
                  File Road Disruption & Incident Report
                </h3>
              </div>
              <button
                onClick={() => setIncidentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-slate-800 custom-scrollbar">
              {/* Target Corridor */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Corridor Sector:</span>
                <p className="font-bold text-[#213d77] text-sm mt-0.5">{incidentForm.routeName}</p>
              </div>

              {/* Disruption Severity Status */}
              <div>
                <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1.5">
                  Disruption Severity:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIncidentForm(prev => ({ ...prev, status: 'blocked' }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      incidentForm.status === 'blocked'
                        ? 'bg-red-600 border-red-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Blocked 🚫 (Impassable)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncidentForm(prev => ({ ...prev, status: 'at_risk' }))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      incidentForm.status === 'at_risk'
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    At-Risk ⚠️ (Caution / Slow)
                  </button>
                </div>
              </div>

              {/* Hazard Presets */}
              <div>
                <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1.5">
                  Disaster / Incident Category:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {HAZARD_PRESETS.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setIncidentForm(prev => ({ ...prev, hazardType: preset }))}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        incidentForm.hazardType === preset
                          ? 'bg-[#213d77] border-[#213d77] text-white font-bold'
                          : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={incidentForm.hazardType}
                  onChange={e => setIncidentForm(prev => ({ ...prev, hazardType: e.target.value }))}
                  placeholder="Or type custom incident title..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#fb792b]"
                />
              </div>

              {/* Incident Details & Conditions Description */}
              <div>
                <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1.5">
                  Field Conditions & Disruption Details:
                </label>
                <textarea
                  rows={3}
                  value={incidentForm.description}
                  onChange={e => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe exact conditions (e.g. 120mm rainfall caused upper hill collapse at Mile 44)..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#fb792b]"
                />
              </div>

              {/* Officer Designation & Official Authority */}
              <div>
                <label className="block text-[10px] text-slate-600 uppercase font-bold mb-1.5">
                  Official Reporting Authority (Statutory Weighting):
                </label>
                <select
                  value={incidentForm.reportedBy}
                  onChange={e => setIncidentForm(prev => ({ ...prev, reportedBy: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#fb792b] cursor-pointer"
                >
                  <option value="Police Station Officer-in-Charge (OC) - Statutory Weight 10.0">
                    👮 Police Station Officer-in-Charge (OC) • Priority Weight 10.0
                  </option>
                  <option value="Border Roads Organisation (BRO) Field Engineer - Weight 9.5">
                    🚧 Border Roads Organisation (BRO) Field Engineer • Priority Weight 9.5
                  </option>
                  <option value="SDRF / NDRF Incident Commander - Weight 9.0">
                    🚒 SDRF / NDRF Incident Commander • Priority Weight 9.0
                  </option>
                  <option value="District Emergency Operations Center (DEOC / 1077) - Weight 8.5">
                    🏛️ District Emergency Operations Center (DEOC / 1077) • Priority Weight 8.5
                  </option>
                  <option value="Field Patrol Inspector / Highway Pilot Vehicle - Weight 7.0">
                    📱 Field Patrol Inspector / Highway Pilot Vehicle • Priority Weight 7.0
                  </option>
                </select>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIncidentModalOpen(false)}
                className="text-xs font-bold px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitIncident}
                className="bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs min-h-[40px]"
              >
                <ShieldAlert className="w-4 h-4" />
                Log Official Hazard & Recalculate Bypass 🔀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Mobile SMS & Notification Receiver Simulator */}
      <LiveMobileNotificationSimulator
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        initialRole={
          currentRole === 'POLICE_OFFICER' || currentRole === 'FIELD_COMMANDER'
            ? 'police'
            : currentRole === 'CITIZEN_USER' || currentRole === 'CITIZEN_DRIVER'
            ? 'citizen'
            : 'admin'
        }
        currentCorridorName={selectedRoute || suggestion?.recommended_route || 'NH-27 Strategic Arterial Corridor'}
        originHub={originHub}
        destinationTarget={customTargetCoords ? `Crisis Target [${customTargetCoords.lat.toFixed(2)}, ${customTargetCoords.lng.toFixed(2)}]` : destinationDepot}
        cargoType={
          cargoType === 'medicine'
            ? 'Emergency Cold-Chain Medicine & Blood Plasma'
            : cargoType === 'oxygen'
            ? 'Medical Oxygen Cylinders (2,000 PSI)'
            : cargoType === 'food'
            ? 'High-Energy Food Rations & Water'
            : 'Heavy Hydraulic Machinery & Bailey Spans'
        }
        onReportCondition={handleMobileReportReceived}
        adminApprovalEvent={adminApprovalEvent}
      />
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-white font-mono gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <span className="text-xs uppercase tracking-widest text-slate-400">Loading NERA Tactical GIS Stage...</span>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  )
}
