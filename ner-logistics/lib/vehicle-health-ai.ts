// lib/vehicle-health-ai.ts
// ========================================================================
//    NERA PHASE 15: AI VEHICLE HEALTH & PREDICTIVE MAINTENANCE INTELLIGENCE
// ========================================================================

import { VehicleDigitalProfile } from './vehicle-maintenance'

export type VehicleHealthRiskLevel =
  | 'LOW'
  | 'MODERATE'
  | 'ELEVATED'
  | 'HIGH'
  | 'CRITICAL'
  | 'DATA_INSUFFICIENT'

export type DataCompletenessLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT'
export type HealthTrend = 'IMPROVING' | 'STABLE' | 'DETERIORATING' | 'INSUFFICIENT_DATA'
export type RecommendationStatus = 'GENERATED' | 'ACKNOWLEDGED' | 'DISMISSED' | 'ACTIONED'

export interface HealthRiskFactor {
  factorKey: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
  title: string
  explanation: string
  evidenceSource: string
}

export interface VehicleHealthAssessment {
  assessmentId: string
  vehicleId: string
  overallRisk: VehicleHealthRiskLevel
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  dataCompleteness: DataCompletenessLevel
  trend: HealthTrend
  riskFactors: HealthRiskFactor[]
  detectedPatterns: string[]
  recommendations: string[]
  supportingEvidence: {
    failureCount: number
    repeatedFailureTypes: string[]
    maintenanceCount: number
    maintenanceDueStatus: string
    cumulativeDistanceKm: number
    distanceSource: string
    fuelEfficiencyStatus: string
    fuelEfficiencyKmPerLiter: number | null
    recentMissionCount: number
    failedInspectionIssues: string[]
  }
  requiresHumanReview: boolean
  analysisType: 'RULE_BASED_HEURISTIC' | 'LLM_ASSISTED_EXPLANATION'
  generatedAt: string
  isSimulated: boolean
  acknowledgementRecord?: {
    status: RecommendationStatus
    acknowledgedAt?: string | null
    acknowledgedBy?: string | null
    notes?: string | null
  }
}

export function generateAssessmentId(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.floor(100 + Math.random() * 900)
  return `VHA-${ts}-${rand}`
}

/**
 * 1. Generates deterministic, explainable AI health assessment based on structured historical data
 */
export function generateVehicleHealthAssessment(
  profile: VehicleDigitalProfile,
  options: { customId?: string; isOffline?: boolean } = {}
): VehicleHealthAssessment {
  const now = new Date().toISOString()
  const assessmentId = options.customId || generateAssessmentId()

  const failures = profile.failureHistory || []
  const maintenance = profile.maintenanceHistory || []
  const inspections = profile.inspectionHistory || []
  const fuelRecords = profile.fuelHistory || []
  const missions = profile.missionHistory || []

  // Check Data Completeness
  const hasFailures = failures.length > 0
  const hasMaintenance = maintenance.length > 0
  const hasInspections = inspections.length > 0
  const hasFuel = fuelRecords.length > 0
  const hasTelemetry = profile.totalCalculatedDistanceKm > 0

  let completenessScore = 0
  if (hasMaintenance) completenessScore += 2
  if (hasInspections) completenessScore += 2
  if (hasTelemetry) completenessScore += 1
  if (hasFuel) completenessScore += 1

  let dataCompleteness: DataCompletenessLevel = 'LOW'
  if (completenessScore >= 5) dataCompleteness = 'HIGH'
  else if (completenessScore >= 3) dataCompleteness = 'MEDIUM'
  else if (completenessScore === 0 && !hasFailures) dataCompleteness = 'INSUFFICIENT'

  // If critical records are entirely missing
  if (dataCompleteness === 'INSUFFICIENT') {
    return {
      assessmentId,
      vehicleId: profile.vehicleId,
      overallRisk: 'DATA_INSUFFICIENT',
      confidence: 'LOW',
      dataCompleteness: 'INSUFFICIENT',
      trend: 'INSUFFICIENT_DATA',
      riskFactors: [
        {
          factorKey: 'MISSING_RECORDS',
          severity: 'INFO',
          title: 'Insufficient Historical Data',
          explanation: 'No maintenance, inspection, or failure records found on file for this vehicle.',
          evidenceSource: 'Fleet Historical Database',
        },
      ],
      detectedPatterns: [],
      recommendations: [
        'Perform initial physical baseline safety inspection.',
        'Upload verified manufacturer maintenance schedule and odometer baseline.',
      ],
      supportingEvidence: {
        failureCount: 0,
        repeatedFailureTypes: [],
        maintenanceCount: 0,
        maintenanceDueStatus: profile.maintenanceDue.status,
        cumulativeDistanceKm: profile.totalCalculatedDistanceKm,
        distanceSource: 'CALCULATED FROM TELEMETRY',
        fuelEfficiencyStatus: profile.efficiencyStatus,
        fuelEfficiencyKmPerLiter: profile.calculatedFuelEfficiencyKmPerLiter ?? null,
        recentMissionCount: missions.length,
        failedInspectionIssues: [],
      },
      requiresHumanReview: true,
      analysisType: 'RULE_BASED_HEURISTIC',
      generatedAt: now,
      isSimulated: profile.isSimulated,
      acknowledgementRecord: { status: 'GENERATED' },
    }
  }

  const riskFactors: HealthRiskFactor[] = []
  const detectedPatterns: string[] = []
  const recommendations: string[] = []

  // 1. Failure Pattern Analysis
  const failureCountMap: Record<string, number> = {}
  for (const f of failures) {
    failureCountMap[f.failureType] = (failureCountMap[f.failureType] || 0) + 1
  }

  const repeatedFailures: string[] = []
  for (const [type, count] of Object.entries(failureCountMap)) {
    if (count >= 2) {
      repeatedFailures.push(type)
      const cleanType = type.replace(/_/g, ' ')
      detectedPatterns.push(`Repeated ${cleanType} pattern detected (${count} occurrences)`)
      riskFactors.push({
        factorKey: `REPEATED_FAILURE_${type}`,
        severity: type === 'BRAKE_FAILURE' || type === 'ENGINE_FAILURE' ? 'CRITICAL' : 'HIGH',
        title: `Recurring ${cleanType}`,
        explanation: `Vehicle has logged ${count} separate ${cleanType} incidents across operational missions.`,
        evidenceSource: 'Phase 13 Vehicle Failure Log',
      })
      recommendations.push(`Schedule comprehensive ${cleanType} diagnostics before next deployment.`)
    } else if (count === 1) {
      const cleanType = type.replace(/_/g, ' ')
      riskFactors.push({
        factorKey: `SINGLE_FAILURE_${type}`,
        severity: 'MEDIUM',
        title: `Previous ${cleanType} Logged`,
        explanation: `Historical record shows 1 ${cleanType} event. Verify repair resolution.`,
        evidenceSource: 'Phase 13 Vehicle Failure Log',
      })
    }
  }

  // 2. Maintenance Due Analysis
  if (profile.maintenanceDue.status === 'MAINTENANCE_DUE') {
    riskFactors.push({
      factorKey: 'MAINTENANCE_OVERDUE',
      severity: 'HIGH',
      title: 'Scheduled Maintenance Overdue',
      explanation: profile.maintenanceDue.explanation || 'Vehicle has exceeded scheduled maintenance interval.',
      evidenceSource: 'Phase 14 Maintenance Schedule Engine',
    })
    recommendations.push('Complete scheduled workshop servicing before non-emergency deployment.')
  } else if (profile.maintenanceDue.status === 'MAINTENANCE_DUE_SOON') {
    riskFactors.push({
      factorKey: 'MAINTENANCE_DUE_SOON',
      severity: 'MEDIUM',
      title: 'Scheduled Service Due Soon',
      explanation: profile.maintenanceDue.explanation || 'Approaching service threshold within 2,000 km or 30 days.',
      evidenceSource: 'Phase 14 Maintenance Schedule Engine',
    })
    recommendations.push('Plan upcoming workshop service window.')
  }

  // 3. Inspection Findings Analysis
  const failedInspectionIssues: string[] = []
  for (const insp of inspections) {
    if (insp.result === 'FAIL') {
      const issues = insp.issuesFound?.join(', ') || 'Critical safety failure'
      failedInspectionIssues.push(issues)
      riskFactors.push({
        factorKey: `INSPECTION_FAIL_${insp.id}`,
        severity: 'CRITICAL',
        title: 'Safety Inspection Failure',
        explanation: `Inspection on ${new Date(insp.inspectionDate).toLocaleDateString()} failed: ${issues}`,
        evidenceSource: 'Phase 14 Inspection Records',
      })
      recommendations.push('Resolve inspection failure items prior to operational clearance.')
    } else if (insp.result === 'WARNING') {
      const issues = insp.issuesFound?.join(', ') || 'Inspection advisory'
      riskFactors.push({
        factorKey: `INSPECTION_WARN_${insp.id}`,
        severity: 'MEDIUM',
        title: 'Inspection Advisory Note',
        explanation: `Advisories recorded: ${issues}`,
        evidenceSource: 'Phase 14 Inspection Records',
      })
    }
  }

  // 4. Operational Workload Analysis
  if (profile.totalCalculatedDistanceKm >= 60000) {
    riskFactors.push({
      factorKey: 'HIGH_CUMULATIVE_DISTANCE',
      severity: 'LOW',
      title: 'High Accumulated Operating Distance',
      explanation: `Vehicle has logged ${profile.totalCalculatedDistanceKm.toLocaleString()} km cumulative travel.`,
      evidenceSource: 'Telemetered GPS Accumulation',
    })
  }

  if (missions.length >= 3) {
    riskFactors.push({
      factorKey: 'HIGH_MISSION_CADENCE',
      severity: 'INFO',
      title: 'High Emergency Mission Cadence',
      explanation: `Vehicle deployed on ${missions.length} emergency response missions.`,
      evidenceSource: 'Phase 12 Mission History',
    })
  }

  // 5. Fuel Efficiency Trend Analysis
  if (profile.calculatedFuelEfficiencyKmPerLiter && profile.calculatedFuelEfficiencyKmPerLiter < 4.2) {
    riskFactors.push({
      factorKey: 'REDUCED_FUEL_EFFICIENCY',
      severity: 'MEDIUM',
      title: 'Sub-Optimal Calculated Fuel Efficiency',
      explanation: `Calculated efficiency is ${profile.calculatedFuelEfficiencyKmPerLiter} km/L (Standard baseline: 5.0 km/L).`,
      evidenceSource: 'Telemetered Dispense & Telemetry Distance',
    })
    recommendations.push('Inspect fuel injection lines and tyre pressure for rolling resistance.')
  }

  // 6. Trend Determination
  let trend: HealthTrend = 'STABLE'
  if (riskFactors.some(r => r.severity === 'CRITICAL') || repeatedFailures.length > 0) {
    trend = 'DETERIORATING'
  } else if (riskFactors.length === 0) {
    trend = 'IMPROVING'
  }

  // 7. Overall Risk Categorization
  let overallRisk: VehicleHealthRiskLevel = 'LOW'
  const hasCritical = riskFactors.some(r => r.severity === 'CRITICAL')
  const hasHigh = riskFactors.some(r => r.severity === 'HIGH')
  const hasMedium = riskFactors.some(r => r.severity === 'MEDIUM')

  if (hasCritical) {
    overallRisk = 'CRITICAL'
  } else if (hasHigh) {
    overallRisk = 'HIGH'
  } else if (hasMedium || repeatedFailures.length > 0) {
    overallRisk = 'ELEVATED'
  } else if (riskFactors.length > 0) {
    overallRisk = 'MODERATE'
  } else {
    overallRisk = 'LOW'
  }

  if (recommendations.length === 0) {
    recommendations.push('Vehicle operating within expected historical parameters. Maintain normal service intervals.')
  }

  const confidence = dataCompleteness === 'HIGH' ? 'HIGH' : dataCompleteness === 'MEDIUM' ? 'MEDIUM' : 'LOW'

  return {
    assessmentId,
    vehicleId: profile.vehicleId,
    overallRisk,
    confidence,
    dataCompleteness,
    trend,
    riskFactors,
    detectedPatterns,
    recommendations,
    supportingEvidence: {
      failureCount: failures.length,
      repeatedFailureTypes: repeatedFailures,
      maintenanceCount: maintenance.length,
      maintenanceDueStatus: profile.maintenanceDue.status,
      cumulativeDistanceKm: profile.totalCalculatedDistanceKm,
      distanceSource: 'CALCULATED FROM TELEMETRY',
      fuelEfficiencyStatus: profile.efficiencyStatus,
      fuelEfficiencyKmPerLiter: profile.calculatedFuelEfficiencyKmPerLiter ?? null,
      recentMissionCount: missions.length,
      failedInspectionIssues,
    },
    requiresHumanReview: true,
    analysisType: options.isOffline ? 'RULE_BASED_HEURISTIC' : 'RULE_BASED_HEURISTIC',
    generatedAt: now,
    isSimulated: profile.isSimulated,
    acknowledgementRecord: { status: 'GENERATED' },
  }
}

/**
 * 2. Official Human Acknowledgment of AI Health Recommendation
 */
export function acknowledgeHealthRecommendation(
  assessment: VehicleHealthAssessment,
  acknowledgedBy: string = 'ACTOR ID UNAVAILABLE',
  notes?: string
): VehicleHealthAssessment {
  const now = new Date().toISOString()
  return {
    ...assessment,
    acknowledgementRecord: {
      status: 'ACKNOWLEDGED',
      acknowledgedAt: now,
      acknowledgedBy,
      notes: notes || 'Acknowledged by operational logistics authority.',
    },
  }
}

/**
 * 3. Official Dismissal of AI Health Recommendation with reason
 */
export function dismissHealthRecommendation(
  assessment: VehicleHealthAssessment,
  dismissedBy: string = 'ACTOR ID UNAVAILABLE',
  reason: string = 'Operational exception reviewed by command'
): VehicleHealthAssessment {
  const now = new Date().toISOString()
  return {
    ...assessment,
    acknowledgementRecord: {
      status: 'DISMISSED',
      acknowledgedAt: now,
      acknowledgedBy: dismissedBy,
      notes: `Dismissed: ${reason}`,
    },
  }
}

/**
 * 4. Aggregates Fleet Watchlist of vehicles requiring human review
 */
export function generateFleetHealthWatchlist(
  assessments: VehicleHealthAssessment[]
): VehicleHealthAssessment[] {
  const rankMap: Record<VehicleHealthRiskLevel, number> = {
    CRITICAL: 1,
    HIGH: 2,
    ELEVATED: 3,
    MODERATE: 4,
    DATA_INSUFFICIENT: 5,
    LOW: 6,
  }

  return [...assessments].sort((a, b) => rankMap[a.overallRisk] - rankMap[b.overallRisk])
}
