// lib/vehicle-data-provider.ts
// ========================================================================
//    NERA PHASE 22: VEHICLE GPS DATA PROVIDER & TELEMETRY HEALTH ADAPTER
// ========================================================================

export type GpsProviderMode = 'LIVE_GPS' | 'SIMULATED_GPS' | 'OFFLINE_GPS' | 'UNAVAILABLE'

export type VehicleCommHealth = 'CONNECTED' | 'DEGRADED' | 'STALE' | 'OFFLINE' | 'UNKNOWN'

export interface VehicleTelemetryFeed {
  vehicleId: string
  latitude: number
  longitude: number
  speedKmH: number
  headingDeg: number
  timestamp: string
  gpsAccuracyMeters?: number
  heartbeatReceivedAt: string
  commHealth: VehicleCommHealth
  providerMode: GpsProviderMode
  source: string
  isSimulated: boolean
}

export function evaluateGpsFreshness(
  lastPingIso: string | null,
  providerMode: GpsProviderMode = 'LIVE_GPS'
): { commHealth: VehicleCommHealth; freshnessSec: number | null } {
  if (providerMode === 'UNAVAILABLE') {
    return { commHealth: 'UNKNOWN', freshnessSec: null }
  }

  if (providerMode === 'OFFLINE_GPS' || !lastPingIso) {
    return { commHealth: 'OFFLINE', freshnessSec: null }
  }

  const pingTime = new Date(lastPingIso).getTime()
  if (isNaN(pingTime)) {
    return { commHealth: 'UNKNOWN', freshnessSec: null }
  }

  const now = Date.now()
  const freshnessSec = Math.max(0, Math.floor((now - pingTime) / 1000))

  if (freshnessSec <= 60) {
    return { commHealth: 'CONNECTED', freshnessSec }
  } else if (freshnessSec <= 300) {
    return { commHealth: 'DEGRADED', freshnessSec }
  } else if (freshnessSec <= 900) {
    return { commHealth: 'STALE', freshnessSec }
  } else {
    return { commHealth: 'OFFLINE', freshnessSec }
  }
}

export function createVehicleTelemetryRecord(params: {
  vehicleId: string
  lat: number
  lng: number
  speedKmH: number
  headingDeg: number
  timestamp?: string
  accuracyMeters?: number
  providerMode?: GpsProviderMode
  isSimulated?: boolean
}): VehicleTelemetryFeed {
  const ts = params.timestamp || new Date().toISOString()
  const mode = params.providerMode || (params.isSimulated !== false ? 'SIMULATED_GPS' : 'LIVE_GPS')
  const { commHealth } = evaluateGpsFreshness(ts, mode)

  return {
    vehicleId: params.vehicleId,
    latitude: params.lat,
    longitude: params.lng,
    speedKmH: params.speedKmH,
    headingDeg: params.headingDeg,
    timestamp: ts,
    gpsAccuracyMeters: params.accuracyMeters || 5.0,
    heartbeatReceivedAt: new Date().toISOString(),
    commHealth,
    providerMode: mode,
    source: mode === 'LIVE_GPS' ? 'AIS-140 Vehicle Telemetry Gateway' : 'NERA Vehicle Telemetry Emulator',
    isSimulated: params.isSimulated ?? true,
  }
}

