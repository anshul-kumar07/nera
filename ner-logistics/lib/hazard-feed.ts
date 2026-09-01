// lib/hazard-feed.ts
// ========================================================================
//    NERA PHASE 22: AUTHORITATIVE HAZARD FEED & DISASTER INGESTION ADAPTER
// ========================================================================

export type HazardType =
  | 'EARTHQUAKE'
  | 'FLOOD'
  | 'LANDSLIDE'
  | 'CYCLONE'
  | 'HEAVY_RAIN'
  | 'ROAD_DISRUPTION'
  | 'OTHER_HAZARD'

export type HazardInfoState =
  | 'OBSERVED'
  | 'OFFICIAL_WARNING'
  | 'AUTHORITATIVE_ALERT'
  | 'FIELD_REPORTED'
  | 'AI_RISK_ESTIMATE'
  | 'DATA_UNAVAILABLE'

export interface HazardEvent {
  hazardId: string
  type: HazardType
  infoState: HazardInfoState
  title: string
  description: string
  sourceAgency: string
  coordinates: {
    lat: number
    lng: number
  }
  affectedRadiusKm: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  issuedAt: string
  expiresAt?: string | null
  isAuthoritative: boolean
  isSimulated: boolean
  logisticsImpactAssessment: {
    corridorExposureRisk: 'HIGH' | 'MODERATE' | 'LOW'
    supplyDisruptionRisk: 'CRITICAL' | 'ELEVATED' | 'MINIMAL'
    evacuationPressure: 'EXTREME' | 'MODERATE' | 'LOW'
    explanation: string
  }
}

// ── Ingested Authoritative Hazard Adapter ──

export function ingestHazardEvent(params: {
  type: HazardType
  infoState: HazardInfoState
  title: string
  description: string
  sourceAgency: string
  lat: number
  lng: number
  affectedRadiusKm: number
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  isSimulated?: boolean
}): HazardEvent {
  // CRITICAL SAFETY CHECK: Prevent fabricated earthquake predictions
  if (params.type === 'EARTHQUAKE' && params.infoState === 'AI_RISK_ESTIMATE') {
    throw new Error(
      'SAFETY VIOLATION: NERA does not generate deterministic earthquake time/location predictions. Only authoritative seismic alerts or post-event logistics impact assessments may be processed.'
    )
  }

  const isAuthoritative =
    params.infoState === 'AUTHORITATIVE_ALERT' ||
    params.infoState === 'OFFICIAL_WARNING' ||
    params.infoState === 'OBSERVED'

  // Estimate Logistics Exposure (NOT predicting seismic events, but evaluating road vulnerability)
  const logisticsImpact = evaluateLogisticsExposure({
    type: params.type,
    severity: params.severity,
    radiusKm: params.affectedRadiusKm,
  })

  return {
    hazardId: `HAZ-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    type: params.type,
    infoState: params.infoState,
    title: params.title,
    description: params.description,
    sourceAgency: params.sourceAgency,
    coordinates: { lat: params.lat, lng: params.lng },
    affectedRadiusKm: params.affectedRadiusKm,
    severity: params.severity,
    issuedAt: new Date().toISOString(),
    isAuthoritative,
    isSimulated: params.isSimulated ?? true,
    logisticsImpactAssessment: logisticsImpact,
  }
}

function evaluateLogisticsExposure(params: {
  type: HazardType
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  radiusKm: number
}): HazardEvent['logisticsImpactAssessment'] {
  if (params.severity === 'CRITICAL') {
    return {
      corridorExposureRisk: 'HIGH',
      supplyDisruptionRisk: 'CRITICAL',
      evacuationPressure: 'EXTREME',
      explanation: `Critical ${params.type.toLowerCase()} event within ${params.radiusKm}km radius requires immediate corridor vulnerability assessment and relief pre-positioning.`,
    }
  } else if (params.severity === 'HIGH') {
    return {
      corridorExposureRisk: 'HIGH',
      supplyDisruptionRisk: 'ELEVATED',
      evacuationPressure: 'MODERATE',
      explanation: `High severity ${params.type.toLowerCase()} warning indicates potential freight delays and requires alternative routing readiness.`,
    }
  } else {
    return {
      corridorExposureRisk: 'MODERATE',
      supplyDisruptionRisk: 'MINIMAL',
      evacuationPressure: 'LOW',
      explanation: `Moderate ${params.type.toLowerCase()} observation currently manageable within local district reserves.`,
    }
  }
}

