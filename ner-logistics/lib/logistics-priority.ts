// lib/logistics-priority.ts
// ========================================================================
//    NERA PHASE 18: CRISIS LOGISTICS PRIORITIZATION ENGINE
// ========================================================================

import { CommodityType, DistrictLogisticsProfile, evaluateDistrictSupply } from './supply-demand'
import { LastMileAccessStatus } from './last-mile'
import { Incident } from './supabase'

export type LogisticsPriorityLevel =
  | 'P1_CRITICAL'
  | 'P2_HIGH'
  | 'P3_MEDIUM'
  | 'P4_LOW'
  | 'DATA_INSUFFICIENT'

export interface LogisticsPriorityAssessment {
  assessmentId: string
  crisisId: string
  location: {
    lat: number
    lng: number
    name?: string
  }
  priority: LogisticsPriorityLevel
  urgencyScore: number // 0 - 100
  urgencyFactors: string[]
  affectedCommodities: CommodityType[]
  estimatedNeedSummary: string
  accessibilityStatus: LastMileAccessStatus
  recommendedAction: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  dataCompleteness: 'COMPLETE' | 'PARTIAL' | 'DATA_INSUFFICIENT'
  supportingEvidence: string[]
  generatedAt: string
  isSimulated: boolean
  requiresHumanReview: boolean
}

export interface EvaluatePriorityParams {
  crisisId: string
  location: { lat: number; lng: number; name?: string }
  incident?: Incident | null
  districtProfile?: DistrictLogisticsProfile | null
  accessibilityStatus?: LastMileAccessStatus
  weatherRiskLevel?: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  customNotes?: string
}

// ── 1. Explainable Crisis Prioritization Scoring ──
export function evaluateCrisisLogisticsPriority(
  params: EvaluatePriorityParams
): LogisticsPriorityAssessment {
  const assessmentId = `LPA-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const nowIso = new Date().toISOString()

  // Guard against missing location coordinates
  if (!params.location || typeof params.location.lat !== 'number' || typeof params.location.lng !== 'number') {
    return {
      assessmentId,
      crisisId: params.crisisId || 'UNKNOWN',
      location: { lat: 0, lng: 0, name: 'Unknown Location' },
      priority: 'DATA_INSUFFICIENT',
      urgencyScore: 0,
      urgencyFactors: ['Missing valid geographic coordinates'],
      affectedCommodities: [],
      estimatedNeedSummary: 'DATA INSUFFICIENT — Geographic location coordinates missing',
      accessibilityStatus: 'FIELD_VERIFICATION_REQUIRED',
      recommendedAction: 'FIELD VERIFICATION REQUIRED: Obtain verified coordinates from ground officer.',
      confidence: 'LOW',
      dataCompleteness: 'DATA_INSUFFICIENT',
      supportingEvidence: ['Coordinates missing in input payload'],
      generatedAt: nowIso,
      isSimulated: true,
      requiresHumanReview: true,
    }
  }

  let score = 0
  const urgencyFactors: string[] = []
  const supportingEvidence: string[] = []
  const affectedCommodities: CommodityType[] = []

  let dataPointsCount = 0

  // 1. Incident Severity & Lifecycle Evaluation (Advisory vs Confirmed)
  if (params.incident) {
    dataPointsCount++
    const inc = params.incident
    if (inc.status === 'confirmed') {
      score += 35
      urgencyFactors.push(`Confirmed ${inc.incident_type?.replace(/_/g, ' ')} disruption (${inc.severity?.toUpperCase()})`)
      supportingEvidence.push(`Official Disaster Authority confirmed disruption on ${inc.route_name || 'target corridor'}`)
    } else if (inc.status === 'reported') {
      score += 20
      urgencyFactors.push(`Unverified field officer report of ${inc.incident_type}`)
      supportingEvidence.push('Field patrol report submitted — awaiting official confirmation')
    } else if (inc.status === 'predicted') {
      score += 10
      urgencyFactors.push(`AI predicted geological/meteorological risk`)
      supportingEvidence.push('Early warning indicator active — advisory status')
    }
  }

  // 2. District Commodity Reserves Evaluation
  if (params.districtProfile) {
    dataPointsCount++
    const commoditiesToCheck: CommodityType[] = ['MEDICINES', 'DRINKING_WATER', 'FOOD', 'FUEL']

    for (const comm of commoditiesToCheck) {
      const shortage = evaluateDistrictSupply(params.districtProfile, comm)
      if (shortage.status === 'DEPLETED') {
        score += 30
        affectedCommodities.push(comm)
        urgencyFactors.push(`Depleted ${comm} reserves in ${params.districtProfile.districtName}`)
        supportingEvidence.push(`District ${comm} inventory at 0 units (Threshold: ${params.districtProfile.commodities[comm]?.minimumReserveThreshold})`)
      } else if (shortage.status === 'CRITICAL') {
        score += 25
        affectedCommodities.push(comm)
        urgencyFactors.push(`Critical ${comm} shortage (${shortage.daysOfCover !== null ? shortage.daysOfCover + 'd cover' : 'Severely low'})`)
        supportingEvidence.push(`District ${comm} reserve below 40% safe minimum buffer`)
      } else if (shortage.status === 'LOW') {
        score += 12
        affectedCommodities.push(comm)
        urgencyFactors.push(`Low ${comm} buffer (${shortage.daysOfCover !== null ? shortage.daysOfCover + 'd cover' : 'Low'})`)
      }
    }
  }

  // 3. Accessibility & Last-Mile Terrain Difficulty
  if (params.accessibilityStatus) {
    dataPointsCount++
    if (params.accessibilityStatus === 'LAST_MILE_REQUIRED') {
      score += 20
      urgencyFactors.push('Non-road last-mile response required (Direct vehicle access severed)')
      supportingEvidence.push('Vehicle access terminus reached; off-road transfer mode necessary')
    } else if (params.accessibilityStatus === 'LAST_MILE_INACCESSIBLE') {
      score += 25
      urgencyFactors.push('Severe terrain isolation — conventional access severed')
      supportingEvidence.push('Corridor and alternative bypasses currently inaccessible')
    }
  }

  // 4. Hydro-Meteorological / Weather Risk
  if (params.weatherRiskLevel) {
    dataPointsCount++
    if (params.weatherRiskLevel === 'CRITICAL' || params.weatherRiskLevel === 'HIGH') {
      score += 15
      urgencyFactors.push(`Adverse weather risk: ${params.weatherRiskLevel}`)
      supportingEvidence.push('Heavy regional precipitation / mountain fog advisory active')
    }
  }

  // 5. Proactive Replenishment (When no disaster exists but reserves are depleted)
  if (!params.incident && affectedCommodities.length > 0) {
    urgencyFactors.push('Proactive strategic reserve replenishment recommended')
    supportingEvidence.push('Pre-positioning supplies prior to potential seasonal isolation')
  }

  // Determine Data Completeness
  let dataCompleteness: 'COMPLETE' | 'PARTIAL' | 'DATA_INSUFFICIENT' = 'COMPLETE'
  if (dataPointsCount < 1) {
    dataCompleteness = 'DATA_INSUFFICIENT'
  } else if (dataPointsCount < 3) {
    dataCompleteness = 'PARTIAL'
  }

  // Calculate Controlled Priority Level
  let priority: LogisticsPriorityLevel = 'P4_LOW'
  if (dataCompleteness === 'DATA_INSUFFICIENT') {
    priority = 'DATA_INSUFFICIENT'
  } else if (score >= 70 || affectedCommodities.includes('MEDICINES') && score >= 50) {
    priority = 'P1_CRITICAL'
  } else if (score >= 50) {
    priority = 'P2_HIGH'
  } else if (score >= 25) {
    priority = 'P3_MEDIUM'
  } else {
    priority = 'P4_LOW'
  }

  // Action Recommendation
  let recommendedAction = 'Monitor district reserves and corridor accessibility.'
  if (priority === 'P1_CRITICAL') {
    recommendedAction = 'IMMEDIATE ACTION: Formulate emergency logistics dispatch plan. Human authorization required.'
  } else if (priority === 'P2_HIGH') {
    recommendedAction = 'HIGH PRIORITY: Identify available source depot and schedule priority convoy.'
  } else if (priority === 'P3_MEDIUM') {
    recommendedAction = 'PROACTIVE REPLENISHMENT: Pre-position inventory during next scheduled dispatch.'
  }

  return {
    assessmentId,
    crisisId: params.crisisId,
    location: params.location,
    priority,
    urgencyScore: Math.min(100, score),
    urgencyFactors: urgencyFactors.length > 0 ? urgencyFactors : ['Routine regional logistics monitoring'],
    affectedCommodities,
    estimatedNeedSummary:
      affectedCommodities.length > 0
        ? `Replenishment required for: ${affectedCommodities.join(', ')}`
        : 'Current district commodity reserves within acceptable safe margins.',
    accessibilityStatus: params.accessibilityStatus || 'DIRECT_VEHICLE_ACCESS',
    recommendedAction,
    confidence: dataCompleteness === 'COMPLETE' ? 'HIGH' : dataCompleteness === 'PARTIAL' ? 'MEDIUM' : 'LOW',
    dataCompleteness,
    supportingEvidence,
    generatedAt: nowIso,
    isSimulated: true,
    requiresHumanReview: true,
  }
}
