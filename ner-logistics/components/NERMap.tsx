'use client'

import dynamic from 'next/dynamic'
import { ActiveRoute, MultiModalVehicleTelemetry } from '@/lib/routing-algorithm'
import { Incident } from '@/lib/supabase'
import { LastMileAccessibility } from '@/lib/last-mile'
import { ConnectionStatus } from '@/hooks/useRealtimeIncidents'

// Dynamically import map to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('@/components/MapInner'), { ssr: false })

import { DistrictJurisdiction, PoliceStation } from '@/lib/police-jurisdictions'

interface NERMapProps {
  routes?: ActiveRoute[]
  highlightedRouteName?: string
  blockedRouteName?: string
  missionPathCoordinates?: [number, number][] | null
  originCoords?: { lat: number; lng: number; name: string } | null
  targetCoords?: { lat: number; lng: number; name: string } | null
  isCrisisActive?: boolean
  animationEnabled?: boolean
  vehicleTelemetry?: MultiModalVehicleTelemetry | null
  activeIncidents?: Incident[]
  lastMileAccessibility?: LastMileAccessibility | null
  connectionStatus?: ConnectionStatus
  lastSync?: Date | null
  baseLayer?: string
  showRoadNetwork?: boolean
  showIncidents?: boolean
  showRiskPredictions?: boolean
  showVehicles?: boolean
  showVehicleAccessPoint?: boolean
  showAlternateRoute?: boolean
  showInfrastructure?: boolean
  showPoliceStations?: boolean
  showDistrictBoundaries?: boolean
  showLEWS?: boolean
  selectedDistrictId?: string | null
  selectedPoliceStationId?: string | null
  userRole?: string
  onSelectDistrict?: (district: DistrictJurisdiction | null) => void
  onSelectPoliceStation?: (station: PoliceStation | null) => void
  onSelectRoute?: (routeName: string) => void
  onSelectTargetCoords?: (coords: { lat: number; lng: number }) => void
  onSelectOriginCoords?: (coords: { lat: number; lng: number; name: string }) => void
  onTriggerSolveCorridor?: () => void
  onToggleMobileSimulator?: () => void
  onReportRouteStatus?: (routeName: string, status: 'blocked' | 'at_risk' | 'open') => void
  onConfirmIncident?: (id: string) => void
  onResolveIncident?: (id: string) => void
  onAdminSelectCrisisAndRoute?: (params: { lat: number; lng: number; zoneId?: string; zoneTitle?: string }) => void
  onIssueResolved?: (zoneId?: string) => void
}

export default function NERMap({
  routes,
  highlightedRouteName,
  blockedRouteName,
  missionPathCoordinates,
  originCoords,
  targetCoords,
  isCrisisActive,
  animationEnabled = true,
  vehicleTelemetry,
  activeIncidents,
  lastMileAccessibility,
  connectionStatus,
  lastSync,
  baseLayer,
  showRoadNetwork,
  showIncidents,
  showRiskPredictions,
  showVehicles,
  showVehicleAccessPoint,
  showAlternateRoute,
  showInfrastructure,
  showPoliceStations,
  showDistrictBoundaries,
  showLEWS,
  selectedDistrictId,
  selectedPoliceStationId,
  userRole,
  onSelectDistrict,
  onSelectPoliceStation,
  onSelectRoute,
  onSelectTargetCoords,
  onSelectOriginCoords,
  onTriggerSolveCorridor,
  onToggleMobileSimulator,
  onReportRouteStatus,
  onConfirmIncident,
  onResolveIncident,
  onAdminSelectCrisisAndRoute,
  onIssueResolved,
}: NERMapProps) {
  return (
    <MapWithNoSSR
      routes={routes}
      highlightedRouteName={highlightedRouteName}
      blockedRouteName={blockedRouteName}
      missionPathCoordinates={missionPathCoordinates}
      originCoords={originCoords}
      targetCoords={targetCoords}
      isCrisisActive={isCrisisActive}
      animationEnabled={animationEnabled}
      vehicleTelemetry={vehicleTelemetry}
      activeIncidents={activeIncidents}
      lastMileAccessibility={lastMileAccessibility}
      connectionStatus={connectionStatus}
      lastSync={lastSync}
      baseLayer={baseLayer}
      showRoadNetwork={showRoadNetwork}
      showIncidents={showIncidents}
      showRiskPredictions={showRiskPredictions}
      showVehicles={showVehicles}
      showVehicleAccessPoint={showVehicleAccessPoint}
      showAlternateRoute={showAlternateRoute}
      showInfrastructure={showInfrastructure}
      showPoliceStations={showPoliceStations}
      showDistrictBoundaries={showDistrictBoundaries}
      showLEWS={showLEWS}
      selectedDistrictId={selectedDistrictId}
      selectedPoliceStationId={selectedPoliceStationId}
      userRole={userRole}
      onSelectDistrict={onSelectDistrict}
      onSelectPoliceStation={onSelectPoliceStation}
      onSelectRoute={onSelectRoute}
      onSelectTargetCoords={onSelectTargetCoords}
      onSelectOriginCoords={onSelectOriginCoords}
      onTriggerSolveCorridor={onTriggerSolveCorridor}
      onToggleMobileSimulator={onToggleMobileSimulator}
      onReportRouteStatus={onReportRouteStatus}
      onConfirmIncident={onConfirmIncident}
      onResolveIncident={onResolveIncident}
      onAdminSelectCrisisAndRoute={onAdminSelectCrisisAndRoute}
      onIssueResolved={onIssueResolved}
    />
  )
}
