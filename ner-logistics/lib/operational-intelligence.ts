// lib/operational-intelligence.ts
// ========================================================================
//    NERA PHASE 23: CENTRAL REGIONAL OPERATIONAL INTELLIGENCE ENGINE
// ========================================================================

import { SYSTEM_DATA_SOURCES, DataSourceHealth } from './data-source-health'
import { INITIAL_OPERATIONAL_ALERTS, OperationalAlert } from './alert-management'
import { DEMO_DEPOT_INVENTORIES } from './supply-demand'
import { ResourceConflict } from './resource-coordination'

export interface RegionalOperationalSummary {
  activeIncidents: number
  confirmedBlocks: number
  predictedRisks: number
  reportedIncidents: number
  activeMissions: number
  interruptedMissions: number
  reroutingMissions: number
  criticalMissions: number
  vehiclesInTransit: number
  vehiclesAvailable: number
  vehiclesReady: number
  vehiclesNotReady: number
  vehiclesWithWarnings: number
  vehicleFailures: number
  highRiskVehicles: number
  depotsMonitored: number
  totalAvailableStockKits: number
  totalReservedStockKits: number
  supplyPressureLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  resourceConflictsCount: number
  criticalAlertsCount: number
  dataSourcesSummary: {
    liveCount: number
    staleCount: number
    offlineCount: number
    simulatedCount: number
    unavailableCount: number
  }
  isSimulated: boolean
}

export interface DistrictSituationRecord {
  districtName: string
  connectivityStatus: 'NORMAL' | 'DEGRADED' | 'SEVERED'
  activeIncidents: number
  confirmedBlocks: number
  activeMissions: number
  supplyPressure: 'NORMAL' | 'ELEVATED' | 'CRITICAL'
  vehicleCoverage: 'OPTIMAL' | 'LIMITED' | 'RESERVE_DEPLETED'
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
  dataStatus: 'LIVE' | 'STALE' | 'SIMULATED' | 'DATA_INSUFFICIENT'
}

export const REGIONAL_DISTRICT_SITUATIONS: DistrictSituationRecord[] = [
  {
    districtName: 'Dima Hasao (Haflong)',
    connectivityStatus: 'SEVERED',
    activeIncidents: 2,
    confirmedBlocks: 1,
    activeMissions: 1,
    supplyPressure: 'CRITICAL',
    vehicleCoverage: 'LIMITED',
    riskLevel: 'EXTREME',
    dataStatus: 'LIVE',
  },
  {
    districtName: 'Kamrup Metro (Guwahati)',
    connectivityStatus: 'NORMAL',
    activeIncidents: 0,
    confirmedBlocks: 0,
    activeMissions: 2,
    supplyPressure: 'NORMAL',
    vehicleCoverage: 'OPTIMAL',
    riskLevel: 'LOW',
    dataStatus: 'LIVE',
  },
  {
    districtName: 'Cachar (Silchar)',
    connectivityStatus: 'DEGRADED',
    activeIncidents: 1,
    confirmedBlocks: 0,
    activeMissions: 1,
    supplyPressure: 'ELEVATED',
    vehicleCoverage: 'OPTIMAL',
    riskLevel: 'MODERATE',
    dataStatus: 'LIVE',
  },
  {
    districtName: 'Hojai (Lumding)',
    connectivityStatus: 'DEGRADED',
    activeIncidents: 1,
    confirmedBlocks: 1,
    activeMissions: 1,
    supplyPressure: 'ELEVATED',
    vehicleCoverage: 'LIMITED',
    riskLevel: 'HIGH',
    dataStatus: 'LIVE',
  },
  {
    districtName: 'East Khasi Hills (Shillong)',
    connectivityStatus: 'NORMAL',
    activeIncidents: 0,
    confirmedBlocks: 0,
    activeMissions: 0,
    supplyPressure: 'NORMAL',
    vehicleCoverage: 'OPTIMAL',
    riskLevel: 'LOW',
    dataStatus: 'LIVE',
  },
]

export function computeRegionalOperationalSummary(params: {
  incidentsCount?: number
  confirmedBlocksCount?: number
  predictedRisksCount?: number
  reportedCount?: number
  missionsCount?: number
  interruptedMissionsCount?: number
  fleetStatusList?: Array<{ readiness: string; operationalStatus: string; aiRisk?: string }>
  alertsList?: OperationalAlert[]
  conflictsList?: ResourceConflict[]
  dataSources?: DataSourceHealth[]
}): RegionalOperationalSummary {
  const sources = params.dataSources || SYSTEM_DATA_SOURCES
  const alerts = params.alertsList || INITIAL_OPERATIONAL_ALERTS
  const conflicts = params.conflictsList || []
  const fleet = params.fleetStatusList || [
    { readiness: 'READY', operationalStatus: 'IN_TRANSIT', aiRisk: 'LOW' },
    { readiness: 'READY', operationalStatus: 'AVAILABLE', aiRisk: 'LOW' },
    { readiness: 'NOT_READY', operationalStatus: 'OUT_OF_SERVICE', aiRisk: 'CRITICAL' },
    { readiness: 'READY_WITH_WARNING', operationalStatus: 'AVAILABLE', aiRisk: 'ELEVATED' },
  ]

  let totalAvailableStock = 0
  let totalReservedStock = 0
  Object.values(DEMO_DEPOT_INVENTORIES).forEach(inv => {
    Object.values(inv).forEach(item => {
      totalAvailableStock += item.availableQuantity
      totalReservedStock += item.reservedQuantity
    })
  })

  const liveSources = sources.filter(s => s.status === 'LIVE').length
  const staleSources = sources.filter(s => s.status === 'STALE').length
  const offlineSources = sources.filter(s => s.status === 'OFFLINE').length
  const simulatedSources = sources.filter(s => s.status === 'SIMULATED').length
  const unavailableSources = sources.filter(s => s.status === 'UNAVAILABLE').length

  const readyVehicles = fleet.filter(v => v.readiness === 'READY').length
  const notReadyVehicles = fleet.filter(v => v.readiness === 'NOT_READY').length
  const warningVehicles = fleet.filter(v => v.readiness === 'READY_WITH_WARNING').length
  const inTransitVehicles = fleet.filter(v => v.operationalStatus === 'IN_TRANSIT').length
  const availableVehicles = fleet.filter(v => v.operationalStatus === 'AVAILABLE').length
  const highRiskVehicles = fleet.filter(v => v.aiRisk === 'HIGH' || v.aiRisk === 'CRITICAL').length

  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length

  return {
    activeIncidents: params.incidentsCount ?? 3,
    confirmedBlocks: params.confirmedBlocksCount ?? 1,
    predictedRisks: params.predictedRisksCount ?? 2,
    reportedIncidents: params.reportedCount ?? 1,
    activeMissions: params.missionsCount ?? 2,
    interruptedMissions: params.interruptedMissionsCount ?? 1,
    reroutingMissions: 1,
    criticalMissions: 1,
    vehiclesInTransit: inTransitVehicles,
    vehiclesAvailable: availableVehicles,
    vehiclesReady: readyVehicles,
    vehiclesNotReady: notReadyVehicles,
    vehiclesWithWarnings: warningVehicles,
    vehicleFailures: notReadyVehicles,
    highRiskVehicles,
    depotsMonitored: Object.keys(DEMO_DEPOT_INVENTORIES).length,
    totalAvailableStockKits: totalAvailableStock,
    totalReservedStockKits: totalReservedStock,
    supplyPressureLevel: 'CRITICAL',
    resourceConflictsCount: conflicts.length > 0 ? conflicts.length : 1,
    criticalAlertsCount: criticalAlerts,
    dataSourcesSummary: {
      liveCount: liveSources,
      staleCount: staleSources,
      offlineCount: offlineSources,
      simulatedCount: simulatedSources,
      unavailableCount: unavailableSources,
    },
    isSimulated: true,
  }
}
