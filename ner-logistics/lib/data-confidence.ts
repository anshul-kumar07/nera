// lib/data-confidence.ts
// ========================================================================
//    NERA PHASE 22: DATA CONFIDENCE & RELIABILITY SCORING MODEL
// ========================================================================

export type DataConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT'

export interface DataConfidenceAssessment {
  confidenceLevel: DataConfidenceLevel
  scorePct: number
  factors: {
    sourceReliability: 'HIGH' | 'MEDIUM' | 'LOW'
    freshnessRating: 'FRESH' | 'ACCEPTABLE' | 'STALE'
    verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'SIMULATED'
  }
  explanation: string
}

export function evaluateDataConfidence(params: {
  isSimulated: boolean
  isFresh: boolean
  isVerified: boolean
  hasError?: boolean
}): DataConfidenceAssessment {
  if (params.hasError) {
    return {
      confidenceLevel: 'INSUFFICIENT',
      scorePct: 0,
      factors: {
        sourceReliability: 'LOW',
        freshnessRating: 'STALE',
        verificationStatus: 'UNVERIFIED',
      },
      explanation: 'Data source encountered error or is unavailable.',
    }
  }

  if (params.isVerified && params.isFresh) {
    return {
      confidenceLevel: 'HIGH',
      scorePct: 95,
      factors: {
        sourceReliability: 'HIGH',
        freshnessRating: 'FRESH',
        verificationStatus: params.isSimulated ? 'SIMULATED' : 'VERIFIED',
      },
      explanation: params.isSimulated
        ? 'High confidence in deterministic simulated telemetry dataset.'
        : 'High confidence from verified, recently updated live data feed.',
    }
  }

  if (params.isFresh && !params.isVerified) {
    return {
      confidenceLevel: 'MEDIUM',
      scorePct: 65,
      factors: {
        sourceReliability: 'MEDIUM',
        freshnessRating: 'FRESH',
        verificationStatus: 'UNVERIFIED',
      },
      explanation: 'Unverified live input received; requires authoritative official signoff.',
    }
  }

  return {
    confidenceLevel: 'LOW',
    scorePct: 35,
    factors: {
      sourceReliability: 'LOW',
      freshnessRating: 'STALE',
      verificationStatus: 'UNVERIFIED',
    },
    explanation: 'Stale telemetry feed; operational decisions should require field re-verification.',
  }
}

