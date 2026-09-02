'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, Polygon, Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { INITIAL_NER_ROUTES, NER_STRATEGIC_PASSES, NER_STRATEGIC_BRIDGES } from '@/lib/data'
import { calculateHaversineKm, ActiveRoute, MultiModalVehicleTelemetry } from '@/lib/routing-algorithm'
import { useLanguage } from '@/lib/LanguageContext'
import { useUserRole } from '@/lib/RoleContext'
import { Incident } from '@/lib/supabase'
import { LastMileAccessibility } from '@/lib/last-mile'
import { evaluateVehicleReadiness } from '@/lib/vehicle-readiness'
import { ConnectionStatus } from '@/hooks/useRealtimeIncidents'
import {
  Layers,
  Crosshair,
  Plus,
  Minus,
  Search,
  X,
  Target,
  Truck,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  ChevronDown,
  Smartphone,
} from 'lucide-react'

import { PAN_INDIA_SUPPLY_DEPOTS } from '@/lib/disaster-categories'
import LiveMobileNotificationSimulator from '@/components/LiveMobileNotificationSimulator'

import {
  NER_DISTRICT_JURISDICTIONS,
  DistrictJurisdiction,
  PoliceStation,
  findDistrictByName,
  findPoliceStationById,
} from '@/lib/police-jurisdictions'
import { useDisasterComms, ReliefBeacon, CitizenSOSRequest, PoliceRouteAssessment } from '@/lib/disaster-comms-store'

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── SVG Marker & Translucent Badge Creators ──

// Google Maps Style Police Station Pin (Compact Anti-Clutter Pin)
const createPoliceStationIcon = (stationName: string, isSelected = false) => {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer; z-index: ${isSelected ? '1300' : '850'};">
      <div style="width: ${isSelected ? '32px' : '24px'}; height: ${isSelected ? '32px' : '24px'}; background: #1e3a8a; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(30,58,138,0.5); font-size: ${isSelected ? '15px' : '12px'}; color: white;">
        👮
      </div>
      ${isSelected ? `
      <div style="position: absolute; top: 28px; left: 50%; transform: translateX(-50%); background: #1e3a8a; color: #ffffff; font-family: system-ui, sans-serif; font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 5px; white-space: nowrap; border: 1px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); pointer-events: none;">
        ${stationName.replace(' Police Station', ' PS')}
      </div>` : ''}
    </div>
  `
  return L.divIcon({ html, className: 'police-station-marker', iconSize: [0, 0] })
}

// High-visibility Google Maps style National Highway shield badge
const createHighwayLabelIcon = (highwayNum: string, status: string) => {
  const isBlocked = status === 'blocked'
  const isAtRisk = status === 'at_risk'

  const bg = isBlocked
    ? '#dc2626'
    : isAtRisk
    ? '#d97706'
    : '#ffffff'

  const textColor = isBlocked || isAtRisk ? '#ffffff' : '#0f172a'
  const border = isBlocked
    ? '1.5px solid #ffffff'
    : isAtRisk
    ? '1.5px solid #ffffff'
    : '1.5px solid #16a34a'

  const html = `
    <div style="transform: translate(-50%, -50%); pointer-events: none; user-select: none;">
      <div style="background: ${bg}; color: ${textColor}; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: 800; padding: 2.5px 8px; border-radius: 6px; border: ${border}; box-shadow: 0 2px 8px rgba(0,0,0,0.28); white-space: nowrap; letter-spacing: 0.2px; display: flex; align-items: center; gap: 3px;">
        ${highwayNum}
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'highway-visible-badge', iconSize: [0, 0] })
}

const createOriginHubIcon = () => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1000;">
      <div style="width: 30px; height: 30px; background: #1e40af; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(30,64,175,0.6); font-size: 14px; color: white;">
        🏛️
      </div>
      <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #93c5fd; font-family: system-ui, sans-serif; font-size: 9px; font-weight: 800; padding: 0.5px 4px; border-radius: 4px; white-space: nowrap; border: 1px solid #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.4); pointer-events: none;">
        ORIGIN
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-origin-marker', iconSize: [0, 0] })
}

const createDestinationDepotIcon = () => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1050;">
      <div style="width: 30px; height: 30px; background: #0f766e; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(15,118,110,0.6); font-size: 14px; color: white;">
        📍
      </div>
      <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #5eead4; font-family: system-ui, sans-serif; font-size: 9px; font-weight: 800; padding: 0.5px 4px; border-radius: 4px; white-space: nowrap; border: 1px solid #0f766e; box-shadow: 0 2px 4px rgba(0,0,0,0.4); pointer-events: none;">
        DEPOT
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-destination-marker', iconSize: [0, 0] })
}

const createTargetCrisisIcon = () => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1050;">
      <div style="width: 30px; height: 30px; background: #dc2626; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(220,38,38,0.6); font-size: 14px; color: white; animation: pulse 2s infinite;">
        🎯
      </div>
      <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fca5a5; font-family: system-ui, sans-serif; font-size: 9px; font-weight: 800; padding: 0.5px 4px; border-radius: 4px; white-space: nowrap; border: 1px solid #dc2626; box-shadow: 0 2px 4px rgba(0,0,0,0.4); pointer-events: none;">
        TARGET
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-target-marker', iconSize: [0, 0] })
}

const createVehicleAccessPointIcon = () => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1050;">
      <div style="width: 30px; height: 30px; background: #0284c7; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(2,132,199,0.6); font-size: 14px; color: white;">
        🚛
      </div>
      <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #38bdf8; font-family: system-ui, sans-serif; font-size: 9px; font-weight: 800; padding: 0.5px 4px; border-radius: 4px; white-space: nowrap; border: 1px solid #0284c7; box-shadow: 0 2px 4px rgba(0,0,0,0.4); pointer-events: none;">
        VAP
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-vap-marker', iconSize: [0, 0] })
}

const createLastMileCrisisIcon = () => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1100;">
      <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: #ea580c; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 30px; height: 30px; background: #ea580c; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(234,88,12,0.6); font-size: 14px; color: white; z-index: 2;">
        🚨
      </div>
      <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fdba74; font-family: system-ui, sans-serif; font-size: 9px; font-weight: 800; padding: 0.5px 4px; border-radius: 4px; white-space: nowrap; border: 1px solid #ea580c; box-shadow: 0 2px 4px rgba(0,0,0,0.4); z-index: 3; pointer-events: none;">
        EPICENTER
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-lastmile-target-marker', iconSize: [0, 0] })
}

const createBlockedHazardIcon = () => {
  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1000;">
      <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: #dc2626; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 28px; height: 28px; background: #dc2626; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(220,38,38,0.6); font-size: 13px; color: white; z-index: 2;">
        ⛔
      </div>
      <div style="position: absolute; top: 34px; left: 50%; transform: translateX(-50%); background: #0f172a; color: #fca5a5; font-family: system-ui, sans-serif; font-size: 10.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; white-space: nowrap; border: 1px solid #dc2626; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 2px; z-index: 3; pointer-events: none;">
        <span>BLOCKED</span>
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-hazard-marker', iconSize: [0, 0] })
}

// Strategic Mountain Pass Marker Icon
const createStrategicPassIcon = (name: string, status: string, elevationFt: number) => {
  const isClosed = status === 'closed' || status === 'blocked'
  const isAtRisk = status === 'at_risk' || status === 'restricted'
  const badgeBg = isClosed ? '#dc2626' : isAtRisk ? '#d97706' : '#2563eb'

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 800;">
      <div style="width: 28px; height: 28px; background: ${badgeBg}; border: 2px solid #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); font-size: 14px; color: white;">
        🏔️
      </div>
      <div style="position: absolute; top: 32px; left: 50%; transform: translateX(-50%); background: rgba(15,23,42,0.92); color: #e2e8f0; font-size: 10.5px; font-weight: 700; padding: 1.5px 5px; border-radius: 4px; white-space: nowrap; border: 1px solid ${badgeBg}; box-shadow: 0 2px 6px rgba(0,0,0,0.4); pointer-events: none;">
        ${elevationFt} ft
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-pass-marker', iconSize: [0, 0] })
}

// Strategic Bridge Marker Icon
const createStrategicBridgeIcon = (name: string, status: string, maxWeightTons: number) => {
  const isDamaged = status === 'damaged' || status === 'blocked'
  const isAtRisk = status === 'at_risk' || status === 'restricted'
  const badgeBg = isDamaged ? '#dc2626' : isAtRisk ? '#d97706' : '#0891b2'

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 800;">
      <div style="width: 28px; height: 28px; background: ${badgeBg}; border: 2px solid #ffffff; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.4); font-size: 14px; color: white;">
        🌉
      </div>
      <div style="position: absolute; top: 32px; left: 50%; transform: translateX(-50%); background: rgba(15,23,42,0.92); color: #38bdf8; font-size: 10.5px; font-weight: 700; padding: 1.5px 5px; border-radius: 4px; white-space: nowrap; border: 1px solid ${badgeBg}; box-shadow: 0 2px 6px rgba(0,0,0,0.4); pointer-events: none;">
        ${maxWeightTons}T Max
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-bridge-marker', iconSize: [0, 0] })
}

// Live Supabase Incident Marker (Differentiates PREDICTED, REPORTED, CONFIRMED)
const createLiveIncidentIcon = (type: string = 'landslide', severity: string = 'high', status: string = 'reported') => {
  const isPredicted = status === 'predicted'
  const isConfirmed = status === 'confirmed'
  const isCritical = severity === 'critical'

  const emoji =
    type === 'landslide' ? '🏔️' :
    type === 'flood' ? '🌊' :
    type === 'bridge_failure' ? '🌉' :
    type === 'road_damage' ? '🛣️' : '⚠️'

  const bgColor = isConfirmed ? '#dc2626' : isPredicted ? '#d97706' : '#ea580c'
  const badgeText = isConfirmed ? 'CONFIRMED' : isPredicted ? 'PREDICTED' : 'REPORTED'

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1100;">
      <div style="position: absolute; width: ${isCritical ? '40px' : '34px'}; height: ${isCritical ? '40px' : '34px'}; border-radius: 50%; background: ${bgColor}; opacity: 0.35; animation: ping ${isCritical ? '1.2s' : '2s'} cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 26px; height: 26px; background: ${bgColor}; border: 2px solid ${isCritical ? '#fef08a' : '#ffffff'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 12px rgba(0,0,0,0.5); font-size: 13px; color: white; z-index: 2;">
        ${emoji}
      </div>
      <div style="position: absolute; top: 32px; left: 50%; transform: translateX(-50%); background: rgba(15,23,42,0.95); color: #ffffff; font-family: system-ui, sans-serif; font-size: 10px; font-weight: 800; padding: 1.5px 5px; border-radius: 4px; white-space: nowrap; border: 1px solid ${bgColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 2px; z-index: 3; pointer-events: none;">
        ${badgeText}
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'live-incident-marker', iconSize: [0, 0] })
}

// ⛺ Crowdsourced Safe Evacuation Relief Beacon Icon (Sleek pin with compact badge)
const createSafeBeaconIcon = (count: number = 10, isVerified: boolean = false) => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1100;">
      <div style="width: 30px; height: 30px; background: #059669; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(5,150,105,0.6); font-size: 14px; color: white;">
        ⛺
      </div>
      <div style="position: absolute; top: -5px; right: -7px; background: #064e3b; color: #a7f3d0; border: 1.5px solid #ffffff; border-radius: 999px; font-family: system-ui, sans-serif; font-size: 9.5px; font-weight: 800; padding: 0.5px 4.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); pointer-events: none; white-space: nowrap;">
        ${count}${isVerified ? '✓' : ''}
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-beacon-marker', iconSize: [0, 0] })
}

// 🚨 Citizen SOS Emergency Distress Icon (Sleek pin with compact headcount badge)
const createSOSDistressIcon = (headcount: number = 4) => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1200;">
      <div style="position: absolute; width: 38px; height: 38px; border-radius: 50%; background: #e11d48; opacity: 0.35; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 28px; height: 28px; background: #be123c; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(190,18,60,0.7); font-size: 13px; color: white; z-index: 2;">
        🚨
      </div>
      <div style="position: absolute; top: -5px; right: -7px; background: #881337; color: #ffe4e6; border: 1.5px solid #ffffff; border-radius: 999px; font-family: system-ui, sans-serif; font-size: 9px; font-weight: 800; padding: 0.5px 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.4); z-index: 3; pointer-events: none; white-space: nowrap;">
        ${headcount}
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-sos-marker', iconSize: [0, 0] })
}

// 👮 Police Route Feasibility Assessment Badge
const createPoliceAssessmentIcon = (passability: string = 'RESTRICTED_4X4', vehicle: string = 'HILL_4X4_OFFROAD_2T') => {
  const isBlocked = passability === 'BLOCKED'
  const isRestricted = passability === 'RESTRICTED_4X4'
  const bg = isBlocked ? '#dc2626' : isRestricted ? '#d97706' : '#16a34a'

  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1050;">
      <div style="width: 26px; height: 26px; background: ${bg}; border: 1.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.35); font-size: 12px; color: white;">
        👮
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-police-assessment-marker', iconSize: [0, 0] })
}

// 🚨 Universal Disaster Crisis Zone Epicenter Icon (Shared identically by Admin & Police)
const createCrisisEpicenterIcon = () => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1250;">
      <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: #dc2626; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 32px; height: 32px; background: #dc2626; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(220,38,38,0.8); font-size: 15px; color: white; z-index: 2;">
        🚨
      </div>
      <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: #991b1b; color: #fee2e2; border: 1px solid #f87171; border-radius: 4px; font-family: system-ui, sans-serif; font-size: 9px; font-weight: 900; padding: 0.5px 4.5px; box-shadow: 0 2px 5px rgba(0,0,0,0.4); z-index: 3; pointer-events: none; letter-spacing: 0.4px; white-space: nowrap;">
        CRISIS
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'crisis-epicenter-marker', iconSize: [0, 0] })
}

// 🛑 Police Reported Obstacle Marker Icon
const createObstacleHazardIcon = (obstacle: string = 'Road Blocked') => {
  const html = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1200;">
      <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #dc2626; opacity: 0.35; animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 26px; height: 26px; background: #dc2626; border: 2px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(220,38,38,0.7); font-size: 13px; color: white; z-index: 2;">
        🛑
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-obstacle-marker', iconSize: [0, 0] })
}

// Dynamic Animated Traveling Vehicle Marker with Directional Bearing Pointer
const createMovingVehicleIcon = (
  transportMode: string,
  vehicleNumber: string,
  etaFormatted: string,
  headingDeg: number = 0,
  isRerouting: boolean = false
) => {
  const isAir = transportMode === 'air_helicopter'
  const isHeavy = transportMode === 'heavy_road_convoy'
  const isHill = transportMode === 'hill_4x4_freight'

  const iconEmoji = isAir ? '🚁' : isHeavy ? '🚛' : isHill ? '🚚' : '🚐'
  const bgColor = isRerouting ? '#dc2626' : isAir ? '#0284c7' : isHeavy ? '#16a34a' : isHill ? '#d97706' : '#2563eb'
  const badgeColor = isRerouting ? '#fca5a5' : isAir ? '#38bdf8' : isHeavy ? '#86efac' : isHill ? '#fde047' : '#93c5fd'
  const statusLabel = isRerouting ? 'REROUTING' : isAir ? 'AIRLIFT' : 'CONVOY'

  const html = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer; z-index: 1200;">
      <!-- Glowing Beacon Pulse Ring -->
      <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: ${bgColor}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      
      <!-- Directional Pointer Arrow Ring (Oriented to road bearing) -->
      <div style="position: absolute; width: 42px; height: 42px; display: flex; align-items: flex-start; justify-content: center; transform: rotate(${headingDeg}deg); transition: transform 0.2s linear; pointer-events: none; z-index: 1;">
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 9px solid ${bgColor}; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.8)); transform: translateY(-5px);"></div>
      </div>

      <!-- Vehicle Circular Icon -->
      <div style="width: 34px; height: 34px; background: ${bgColor}; border: 2.5px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.6); font-size: 16px; z-index: 2;">
        ${iconEmoji}
      </div>

      <!-- Live Transit Tag (Compact Pill) -->
      <div style="position: absolute; top: 38px; left: 50%; transform: translateX(-50%); background: rgba(15,23,42,0.95); color: ${badgeColor}; font-family: system-ui, -apple-system, sans-serif; font-size: 8.5px; font-weight: 800; padding: 1.5px 5.5px; border-radius: 5px; white-space: nowrap; border: 1px solid ${bgColor}; box-shadow: 0 3px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 3px; z-index: 3; pointer-events: none;">
        <span>${statusLabel}</span> • <span>${etaFormatted || 'EN ROUTE'}</span>
      </div>
    </div>
  `
  return L.divIcon({ html, className: 'custom-moving-vehicle-marker', iconSize: [0, 0] })
}

// Map Tile Layers (Featuring Real Google Maps, High-Res Hybrid & Tactical Night Ops)
const TILE_LAYERS: Record<string, { name: string; url: string; attribution: string; subdomains?: string }> = {
  google_roadmap: {
    name: '🗺️ Google Maps (Street & Highways)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Data',
  },
  google_hybrid: {
    name: '🛰️ Google Satellite (High-Res Hybrid)',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Satellite Imagery & Roads',
  },
  google_terrain: {
    name: '🏔️ Google Terrain (Contours & Elevation)',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Terrain Data',
  },
  osm: {
    name: '🌐 OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abc',
  },
  dark: {
    name: '🌌 Tactical Night Ops',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    subdomains: 'abcd',
  },
}

// State Focus Centers
const STATE_HUBS: Record<string, [number, number, number]> = {
  All: [25.7, 92.8, 7],
  Assam: [26.1445, 91.7362, 8],
  Meghalaya: [25.5788, 91.8933, 8],
  Manipur: [24.8170, 93.9368, 8],
  Mizoram: [23.7271, 92.7176, 8],
  Nagaland: [25.9043, 93.7440, 8],
  Tripura: [23.8315, 91.2868, 8],
  Arunachal: [27.0844, 93.6053, 7],
  Sikkim: [27.3389, 88.6065, 9],
}

// NER 8-State Geographic Boundary
const NER_ZONE_POLYGON: [number, number][] = [
  [27.9, 88.1], [27.7, 88.9], [27.1, 88.9], [27.0, 88.5],
  [26.7, 89.2], [26.0, 89.7],
  [25.1, 90.1], [25.1, 91.2], [25.1, 92.2],
  [24.3, 92.1], [23.8, 91.2], [23.1, 91.4], [23.0, 91.8], [23.5, 92.2],
  [22.8, 92.6], [21.9, 92.9], [22.2, 93.3], [23.4, 93.4],
  [24.2, 94.3], [24.8, 94.4], [25.5, 94.6],
  [25.8, 94.9], [26.5, 95.2], [26.9, 95.3],
  [27.4, 96.2], [27.9, 97.2], [28.2, 97.4], [28.8, 96.8],
  [29.3, 95.5], [29.0, 94.0], [28.5, 93.2], [28.0, 92.0], [27.6, 91.6],
  [26.9, 91.5], [26.8, 90.0]
]

// ── Geological Survey of India (GSI) Landslide Early Warning System (LEWS) Data ──
export interface GSILEWSZone {
  id: string
  name: string
  corridor: string
  state: string
  lat: number
  lng: number
  radiusMeters: number
  saturationPercent: number
  riskLevel: 'CRITICAL_LEWS' | 'HIGH_SATURATION' | 'WATCH'
  geologicalFormation: string
  rainfallAccumulationMm: number
}

export const PAN_NER_LEWS_ZONES: GSILEWSZone[] = [
  {
    id: 'lews-haflong',
    name: 'Haflong–Jatinga Hill Escarpment (NH-27)',
    corridor: 'NH-27 / Lumding–Silchar Sector',
    state: 'Assam',
    lat: 25.152,
    lng: 93.024,
    radiusMeters: 7500,
    saturationPercent: 88,
    riskLevel: 'CRITICAL_LEWS',
    geologicalFormation: 'Tertiary Sandstone & Fractured Shale Overburden',
    rainfallAccumulationMm: 210,
  },
  {
    id: 'lews-sonapur',
    name: 'Sonapur Tunnel & High-Slope Shear Zone (NH-6)',
    corridor: 'NH-6 / East Jaintia Hills',
    state: 'Meghalaya',
    lat: 25.105,
    lng: 92.368,
    radiusMeters: 6000,
    saturationPercent: 84,
    riskLevel: 'HIGH_SATURATION',
    geologicalFormation: 'Limestone Sinkhole & Saturated Red Laterite Soil',
    rainfallAccumulationMm: 340,
  },
  {
    id: 'lews-sela',
    name: 'Sela Pass High-Altitude Ridge Fracture',
    corridor: 'NH-13 / Balipara–Tawang Highway',
    state: 'Arunachal Pradesh',
    lat: 27.502,
    lng: 92.103,
    radiusMeters: 9000,
    saturationPercent: 79,
    riskLevel: 'HIGH_SATURATION',
    geologicalFormation: 'Glacial Moraine & Freeze-Thaw Scree Slopes',
    rainfallAccumulationMm: 110,
  },
  {
    id: 'lews-chungthang',
    name: 'Chungthang Teesta River Gorge Debris Corridor',
    corridor: 'North Sikkim Lifeline',
    state: 'Sikkim',
    lat: 27.604,
    lng: 88.642,
    radiusMeters: 8000,
    saturationPercent: 92,
    riskLevel: 'CRITICAL_LEWS',
    geologicalFormation: 'Post-GLOF Loose Silt, Boulders & Riverine Scour',
    rainfallAccumulationMm: 195,
  },
  {
    id: 'lews-noney',
    name: 'Noney Hill Cutting & Railway Slope Sector',
    corridor: 'NH-37 / Imphal–Jiribam Highway',
    state: 'Manipur',
    lat: 24.821,
    lng: 93.604,
    radiusMeters: 6500,
    saturationPercent: 86,
    riskLevel: 'CRITICAL_LEWS',
    geologicalFormation: 'Dissected Clayey Siltstone with High Pore Pressure',
    rainfallAccumulationMm: 230,
  },
]

// Interpolate exact continuous lat/lng and heading along polyline path given progress 0..1
function interpolatePositionAndHeading(
  coords: [number, number][],
  progress: number
): { position: [number, number]; headingDeg: number } {
  if (!coords || coords.length === 0) return { position: [26.1445, 91.7362], headingDeg: 0 }
  if (coords.length === 1) return { position: coords[0], headingDeg: 0 }

  const clamped = Math.max(0, Math.min(1, progress))

  const distances: number[] = [0]
  let totalDist = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const d = calculateHaversineKm(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1])
    totalDist += d
    distances.push(totalDist)
  }

  if (totalDist === 0) return { position: coords[0], headingDeg: 0 }
  const targetDist = clamped * totalDist

  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDist >= distances[i] && targetDist <= distances[i + 1]) {
      const segStart = distances[i]
      const segEnd = distances[i + 1]
      const segLen = segEnd - segStart
      const segT = segLen === 0 ? 0 : (targetDist - segStart) / segLen

      const p1 = coords[i]
      const p2 = coords[i + 1]
      const lat = p1[0] + (p2[0] - p1[0]) * segT
      const lng = p1[1] + (p2[1] - p1[1]) * segT

      const dLng = ((p2[1] - p1[1]) * Math.PI) / 180
      const y = Math.sin(dLng) * Math.cos((p2[0] * Math.PI) / 180)
      const x =
        Math.cos((p1[0] * Math.PI) / 180) * Math.sin((p2[0] * Math.PI) / 180) -
        Math.sin((p1[0] * Math.PI) / 180) * Math.cos((p2[0] * Math.PI) / 180) * Math.cos(dLng)
      const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360

      return { position: [lat, lng], headingDeg: Math.round(bearing) }
    }
  }

  return { position: coords[coords.length - 1], headingDeg: 0 }
}

interface MapInnerProps {
  routes?: ActiveRoute[]
  highlightedRouteName?: string
  blockedRouteName?: string
  missionPathCoordinates?: [number, number][] | null
  originCoords?: { lat: number; lng: number; name: string } | null
  targetCoords?: { lat: number; lng: number; name: string; isPinnedCrisis?: boolean } | null
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
  userRole?: 'APEX_ADMIN' | 'POLICE_OFFICER' | 'CITIZEN_USER' | 'FIELD_COMMANDER' | 'CITIZEN_DRIVER' | string
  onSelectDistrict?: (district: DistrictJurisdiction | null) => void
  onSelectPoliceStation?: (station: PoliceStation | null) => void
  onSelectRoute?: (routeName: string) => void
  onSelectTargetCoords?: (coords: { lat: number; lng: number }) => void
  onReportRouteStatus?: (routeName: string, status: 'blocked' | 'at_risk' | 'open') => void
  onConfirmIncident?: (id: string) => void
  onResolveIncident?: (id: string) => void
  onAdminSelectCrisisAndRoute?: (params: { lat: number; lng: number; zoneId?: string; zoneTitle?: string }) => void
  onIssueResolved?: (zoneId?: string) => void
}

function MapControllerComponent({
  targetView,
  missionPathCoordinates,
  zoomAction,
  fitRouteTrigger,
}: {
  targetView: [number, number, number] | null
  missionPathCoordinates?: [number, number][] | null
  zoomAction: number | null
  fitRouteTrigger: number
}) {
  const map = useMap()

  useEffect(() => {
    if (targetView) {
      map.setView([targetView[0], targetView[1]], targetView[2], { animate: true })
    }
  }, [targetView, map])

  useEffect(() => {
    if (zoomAction) {
      map.setZoom(map.getZoom() + zoomAction)
    }
  }, [zoomAction, map])

  useEffect(() => {
    if (missionPathCoordinates && missionPathCoordinates.length > 1) {
      try {
        const bounds = L.latLngBounds(missionPathCoordinates.map(c => [c[0], c[1]]))
        map.fitBounds(bounds, { padding: [50, 50], animate: true })
      } catch (err) {
        console.warn('Map fit bounds failed:', err)
      }
    }
  }, [fitRouteTrigger, missionPathCoordinates, map])

  return null
}

function MapClickEventsComponent({
  isPinModeActive,
  isSafePinModeActive,
  isPoliceCrisisPinModeActive,
  isAdminCrisisRouteModeActive,
  onSelectTargetCoords,
  onSelectSafeCoords,
  onSelectCrisisCoords,
  onAdminSelectCrisisAndRoute,
  onPinPlaced,
}: {
  isPinModeActive: boolean
  isSafePinModeActive: boolean
  isPoliceCrisisPinModeActive?: boolean
  isAdminCrisisRouteModeActive?: boolean
  onSelectTargetCoords?: (coords: { lat: number; lng: number }) => void
  onSelectSafeCoords?: (coords: { lat: number; lng: number }) => void
  onSelectCrisisCoords?: (coords: { lat: number; lng: number }) => void
  onAdminSelectCrisisAndRoute?: (params: { lat: number; lng: number }) => void
  onPinPlaced: () => void
}) {
  useMapEvents({
    click(e) {
      if (isAdminCrisisRouteModeActive && onAdminSelectCrisisAndRoute) {
        onAdminSelectCrisisAndRoute({ lat: e.latlng.lat, lng: e.latlng.lng })
        onPinPlaced()
      } else if (isPoliceCrisisPinModeActive && onSelectCrisisCoords) {
        onSelectCrisisCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
        onPinPlaced()
      } else if (isSafePinModeActive && onSelectSafeCoords) {
        onSelectSafeCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
        onPinPlaced()
      } else if (isPinModeActive && onSelectTargetCoords) {
        onSelectTargetCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
        onPinPlaced()
      }
    },
  })
  return null
}

export default function MapInner({
  routes = [] as ActiveRoute[],
  highlightedRouteName,
  blockedRouteName,
  missionPathCoordinates,
  originCoords,
  targetCoords,
  animationEnabled = true,
  vehicleTelemetry,
  activeIncidents = [],
  lastMileAccessibility,
  connectionStatus = 'OFFLINE',
  lastSync,
  baseLayer = 'google_roadmap',
  showRoadNetwork = false,
  showIncidents: propShowIncidents,
  showRiskPredictions: propShowRiskPredictions,
  showVehicles: propShowVehicles = true,
  showVehicleAccessPoint: propShowVAP = true,
  showAlternateRoute: propShowAlt = true,
  showInfrastructure: propShowInfra,
  showPoliceStations = true,
  showDistrictBoundaries = true,
  showLEWS = true,
  selectedDistrictId,
  selectedPoliceStationId,
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
  userRole,
  onAdminSelectCrisisAndRoute,
  onIssueResolved,
}: MapInnerProps & {
  onSelectOriginCoords?: (coords: { lat: number; lng: number; name: string }) => void
  onTriggerSolveCorridor?: () => void
  onToggleMobileSimulator?: () => void
}) {
  const { t } = useLanguage()
  const { currentRole } = useUserRole()
  const effectiveRole = userRole || currentRole || (typeof window !== 'undefined' ? localStorage.getItem('nera_tactical_role') : null) || 'APEX_ADMIN'
  const isPolice = effectiveRole === 'POLICE_OFFICER' || effectiveRole === 'FIELD_COMMANDER' || effectiveRole === 'police'
  const isCitizen = effectiveRole === 'CITIZEN_USER' || effectiveRole === 'CITIZEN_DRIVER' || effectiveRole === 'citizen'
  const isAdmin = !isPolice && !isCitizen
  const {
    crisisZones,
    beacons,
    sosRequests,
    assessments,
    dispatchRescueToBeacon,
    markReliefBeacon,
    declarePoliceCrisisZone,
    removePoliceCrisisZone,
    resolveAndClearCrisisZone,
    adminAssignRouteToCrisisZone,
    policeVerifyRoute,
    policeRequestReroute,
    adminRerouteCrisisZone,
  } = useDisasterComms()
  const [currentLayer, setCurrentLayer] = useState<keyof typeof TILE_LAYERS>((baseLayer as keyof typeof TILE_LAYERS) || 'google_roadmap')

  // Keep internal layer in sync when parent baseLayer prop changes
  useEffect(() => {
    if (baseLayer && TILE_LAYERS[baseLayer as keyof typeof TILE_LAYERS]) {
      setCurrentLayer(baseLayer as keyof typeof TILE_LAYERS)
    }
  }, [baseLayer])
  const [targetView, setTargetView] = useState<[number, number, number] | null>(null)
  const [zoomAction, setZoomAction] = useState<number | null>(null)
  const [fitRouteTrigger, setFitRouteTrigger] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [layerDrawerOpen, setLayerDrawerOpen] = useState(false)
  const [isPinModeActive, setIsPinModeActive] = useState(false)
  const [isSafePinModeActive, setIsSafePinModeActive] = useState(false)
  const [isPoliceCrisisPinModeActive, setIsPoliceCrisisPinModeActive] = useState(false)
  const [isAdminCrisisRouteModeActive, setIsAdminCrisisRouteModeActive] = useState(false)
  const [adminSuccessNotice, setAdminSuccessNotice] = useState<string | null>(null)
  const [pendingCrisisCoords, setPendingCrisisCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isPoliceCrisisModalOpen, setIsPoliceCrisisModalOpen] = useState(false)
  const [crisisTitle, setCrisisTitle] = useState('Noney–Tupul Mountain Landslide Hazard Zone')
  const [crisisHazardType, setCrisisHazardType] = useState('⛰️ Massive Debris Landslide & River Inundation')
  const [crisisRadiusKm, setCrisisRadiusKm] = useState('8.5')
  const [crisisAffectedCorridor, setCrisisAffectedCorridor] = useState('NH-37 Imphal–Jiribam Arterial (Noney Sector)')
  const [crisisReportingStation, setCrisisReportingStation] = useState('Noney Police Station')
  const [crisisReportingOfficer, setCrisisReportingOfficer] = useState('SDPO Noney & Highway Patrol (Statutory Weight 9.5)')
  const [crisisGuidance, setCrisisGuidance] = useState('Active slope failure and flood inundation. Civilians inside this red danger circle must immediately evacuate towards verified Safe Haven beacons at the perimeter.')
  const [crisisSuccessNotice, setCrisisSuccessNotice] = useState<string | null>(null)
  const [showCrisisZonesLayer, setShowCrisisZonesLayer] = useState(true)

  const [pendingSafeCoords, setPendingSafeCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isSafeModalOpen, setIsSafeModalOpen] = useState(false)
  const [safeHavenName, setSafeHavenName] = useState('Highland Primary School Safe Refuge')
  const [safeHeadcount, setSafeHeadcount] = useState('26')
  const [waterAvail, setWaterAvail] = useState(true)
  const [shelterAvail, setShelterAvail] = useState(true)
  const [medAvail, setMedAvail] = useState(true)
  const [escapeGuidance, setEscapeGuidance] = useState('Avoid the flooded low river crossing. Take the elevated ridge footpath on the north side leading directly to this school compound.')
  const [reporterName, setReporterName] = useState('Biren Das (Local Relief Volunteer / Evacuee)')
  const [reporterPhone, setReporterPhone] = useState('+91 94350-11223')
  const [safeSuccessNotice, setSafeSuccessNotice] = useState<string | null>(null)
  const [showSafeBeaconsLayer, setShowSafeBeaconsLayer] = useState(true)
  const [originDropdownOpen, setOriginDropdownOpen] = useState(false)
  const [isMobileSimulatorOpen, setIsMobileSimulatorOpen] = useState(false)
  const [activeDistrict, setActiveDistrict] = useState<DistrictJurisdiction | null>(null)
  const [activePoliceStation, setActivePoliceStation] = useState<PoliceStation | null>(null)

  // Sync external baseLayer prop if changed
  useEffect(() => {
    if (baseLayer && TILE_LAYERS[baseLayer as keyof typeof TILE_LAYERS]) {
      setCurrentLayer(baseLayer as keyof typeof TILE_LAYERS)
    }
  }, [baseLayer])

  // Layer Visibility Controls
  const [showInfrastructure, setShowInfrastructure] = useState(propShowInfra !== undefined ? propShowInfra : false)
  const [showActiveIncidents, setShowActiveIncidents] = useState(propShowIncidents !== undefined ? propShowIncidents : true)
  const [showRiskPredictions, setShowRiskPredictions] = useState(propShowRiskPredictions !== undefined ? propShowRiskPredictions : true)

  useEffect(() => {
    if (propShowInfra !== undefined) setShowInfrastructure(propShowInfra)
  }, [propShowInfra])

  useEffect(() => {
    if (propShowIncidents !== undefined) setShowActiveIncidents(propShowIncidents)
  }, [propShowIncidents])

  useEffect(() => {
    if (propShowRiskPredictions !== undefined) setShowRiskPredictions(propShowRiskPredictions)
  }, [propShowRiskPredictions])

  // ── Traveling Convoy Animation State ──
  const [simProgress, setSimProgress] = useState(0.0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1) // 1x, 3x, 8x
  // Animation Loop: smoothly moves the vehicle along missionPathCoordinates
  useEffect(() => {
    if (!animationEnabled || !missionPathCoordinates || missionPathCoordinates.length < 2 || !isPlaying) return

    // High-visibility smooth demo loop: ~16 seconds at 1x, ~5.3s at 3x, ~2.0s at 8x
    const baseLoopDurationMs = 16000
    const durationMs = baseLoopDurationMs / playbackSpeed
    const stepInterval = 30 // ~33fps smooth rendering
    const stepDelta = stepInterval / durationMs

    const interval = setInterval(() => {
      setSimProgress(prev => {
        const next = prev + stepDelta
        if (next >= 1.0) {
          return 0.0 // Loop convoy animation seamlessly
        }
        return next
      })
    }, stepInterval)

    return () => clearInterval(interval)
  }, [animationEnabled, missionPathCoordinates, isPlaying, playbackSpeed])

  // Continuous interpolated vehicle position & heading
  const vehicleMotion = missionPathCoordinates && missionPathCoordinates.length > 1
    ? interpolatePositionAndHeading(missionPathCoordinates, simProgress)
    : null

  const currentVehiclePos = vehicleMotion ? vehicleMotion.position : null
  const currentVehicleHeading = vehicleMotion ? vehicleMotion.headingDeg : 0

  // Calculate live remaining distance & estimated time dynamically based on progress
  const totalMissionDistance = vehicleTelemetry?.totalDistanceKm || 350
  const remainingDistanceKm = Math.round(totalMissionDistance * (1 - simProgress))
  const completedPercentage = Math.round(simProgress * 100)

  // Filter routes by search if any
  const filteredRoutes = searchQuery.trim()
    ? routes.filter(
        r =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.highway_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.state?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : routes

  return (
    <div className="relative w-full h-full font-sans select-none overflow-hidden rounded-lg z-0">
      {/* ── Admin Instant Dispatch Success Alert Banner ── */}
      {adminSuccessNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-emerald-950/95 border-2 border-emerald-400 text-white px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold pointer-events-auto animate-in fade-in slide-in-from-top-3 max-w-lg text-center">
          <span className="text-xl">🚚</span>
          <span className="leading-snug">{adminSuccessNotice}</span>
          <button onClick={() => setAdminSuccessNotice(null)} className="ml-2 text-slate-300 hover:text-white text-base cursor-pointer">✕</button>
        </div>
      )}

      {/* ── UNIFIED NON-OVERLAPPING TOP BAR OVERLAY ── */}
      <div className="absolute top-3 left-3 right-3 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Search & Tactical 4-Step Action Toolbar */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* Tactical Action Toolbar (Role Adaptive - ADMIN & POLICE ONLY) */}
          {!isCitizen && (
            <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl flex-wrap">
              {/* Button 1: Select Supply Origin (ADMIN ONLY) */}
              {!isPolice && (
                <div className="relative">
                  <button
                    onClick={() => setOriginDropdownOpen(!originDropdownOpen)}
                    className="bg-slate-900 hover:bg-[#213d77] text-white border border-slate-700 hover:border-[#fb792b] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Select Strategic Pan-India or Regional NER Supply Origin"
                  >
                    <span>📍</span>
                    <span className="truncate max-w-[100px] sm:max-w-none">1. Origin</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {originDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-72 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-2 z-[2000] text-xs space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">Strategic Pan-India Hubs</span>
                        <div className="space-y-1 mt-1">
                          {PAN_INDIA_SUPPLY_DEPOTS.filter(d => d.regionType === 'PAN_INDIA_STRATEGIC').map(depot => (
                            <button
                              key={depot.id}
                              onClick={() => {
                                setOriginDropdownOpen(false)
                                if (onSelectOriginCoords) {
                                  onSelectOriginCoords({ lat: depot.coordinates[0], lng: depot.coordinates[1], name: depot.name })
                                } else {
                                  setTargetView([depot.coordinates[0], depot.coordinates[1], 8])
                                }
                              }}
                              className="w-full text-left p-1.5 rounded hover:bg-[#213d77] text-slate-200 transition-colors cursor-pointer"
                            >
                              <strong className="block text-white text-[11px]">{depot.name}</strong>
                              <span className="text-[9.5px] text-emerald-400 block">{depot.role}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">Regional NER Depots</span>
                        <div className="space-y-1 mt-1">
                          {PAN_INDIA_SUPPLY_DEPOTS.filter(d => d.regionType === 'NER_REGIONAL_CORE').map(depot => (
                            <button
                              key={depot.id}
                              onClick={() => {
                                setOriginDropdownOpen(false)
                                if (onSelectOriginCoords) {
                                  onSelectOriginCoords({ lat: depot.coordinates[0], lng: depot.coordinates[1], name: depot.name })
                                } else {
                                  setTargetView([depot.coordinates[0], depot.coordinates[1], 8])
                                }
                              }}
                              className="w-full text-left p-1.5 rounded hover:bg-[#213d77] text-slate-200 transition-colors cursor-pointer"
                            >
                              <strong className="block text-white text-[11px]">{depot.name}</strong>
                              <span className="text-[9.5px] text-emerald-400 block">{depot.role}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Button: Mark Crisis & Dynamic Auto-Route (ADMIN: 2. Mark Crisis & Route / POLICE: 1. Mark Hazard Location) */}
              <button
                onClick={() => {
                  if (isAdmin) {
                    setIsAdminCrisisRouteModeActive(!isAdminCrisisRouteModeActive)
                    if (isPoliceCrisisPinModeActive) setIsPoliceCrisisPinModeActive(false)
                    if (isSafePinModeActive) setIsSafePinModeActive(false)
                    if (isPinModeActive) setIsPinModeActive(false)
                  } else {
                    setIsPoliceCrisisPinModeActive(!isPoliceCrisisPinModeActive)
                    if (isPinModeActive) setIsPinModeActive(false)
                    if (isSafePinModeActive) setIsSafePinModeActive(false)
                    if (isAdminCrisisRouteModeActive) setIsAdminCrisisRouteModeActive(false)
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  (isAdmin ? isAdminCrisisRouteModeActive : isPoliceCrisisPinModeActive)
                    ? 'bg-rose-600 text-white border-rose-500 ring-2 ring-rose-400/50 animate-pulse'
                    : 'bg-rose-950/90 hover:bg-rose-900 text-rose-200 border-rose-700 hover:border-rose-500'
                }`}
                title={
                  isAdmin
                    ? "Admin: Tap any spot or police-reported crisis area to immediately solve optimal corridor & stream live vehicle tracking to Citizen Portal"
                    : "Police: Tap map to mark a Disaster Crisis Hazard Location with danger perimeter"
                }
              >
                <span className="text-sm">🚨</span>
                <span className="truncate max-w-[150px] sm:max-w-none">
                  {isAdmin
                    ? (isAdminCrisisRouteModeActive ? '🎯 Tap Spot to Auto-Route' : '2. Mark Crisis & Route')
                    : (isPoliceCrisisPinModeActive ? 'Tap Location to Mark' : '1. Mark Hazard Location')}
                </span>
              </button>

              {/* Button: Mark Safe Area / Evacuation Refuge */}
              <button
                onClick={() => {
                  setIsSafePinModeActive(!isSafePinModeActive)
                  if (isPinModeActive) setIsPinModeActive(false)
                  if (isPoliceCrisisPinModeActive) setIsPoliceCrisisPinModeActive(false)
                  if (isAdminCrisisRouteModeActive) setIsAdminCrisisRouteModeActive(false)
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 shadow-xs ${
                  isSafePinModeActive
                    ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/50 animate-pulse'
                    : 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border-emerald-600 hover:border-emerald-400'
                }`}
                title="Escaped crisis? Tap map to mark a safe refuge point for others to evacuate towards"
              >
                <span className="text-sm">⛺</span>
                <span className="truncate max-w-[125px] sm:max-w-none">
                  {isPolice ? (isSafePinModeActive ? 'Tap Safe Spot' : '2. Mark Safe Area') : (isSafePinModeActive ? 'Tap Safe Spot' : 'Mark Safe Area')}
                </span>
              </button>

              {/* Button 3: Generate Tactical Corridor (ADMIN ONLY - Police do not see or generate supply routes) */}
              {!isPolice && (
                <button
                  onClick={() => {
                    if (onTriggerSolveCorridor) {
                      onTriggerSolveCorridor()
                    } else {
                      setFitRouteTrigger(Date.now())
                    }
                  }}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Solve OSRM/Dijkstra routing, set VAP roadhead, and detect along-route police stations"
                >
                  <span>⚡</span>
                  <span className="hidden sm:inline">3. Generate Corridor</span>
                  <span className="sm:hidden">3. Solve</span>
                </button>
              )}

              {/* Button: Clear Location / Issue Resolved */}
              <button
                onClick={() => {
                  if (onIssueResolved) onIssueResolved()
                  if (crisisZones.length > 0) {
                    crisisZones.forEach(z => {
                      resolveAndClearCrisisZone({
                        zoneId: z.id,
                        officerName: isPolice ? 'Duty Sector Police' : 'State EOC Admin',
                        resolutionNotes: 'Hazard cleared, ground obstacle normalized and cleared from map.',
                      })
                    })
                  }
                  setAdminSuccessNotice(isPolice ? '✅ Location Cleared: Hazard resolved and road reopened.' : '✅ Map Cleared: Active corridor and crisis target normalized.')
                  setTimeout(() => setAdminSuccessNotice(null), 6000)
                }}
                className="bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-600 hover:border-emerald-400 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={isPolice ? "Clear active disaster hazard location from map" : "Clear all active corridors and normalized map"}
              >
                <span>✅</span>
                <span className="hidden sm:inline">{isPolice ? '3. Clear Location (Resolved)' : 'Clear Map'}</span>
                <span className="sm:hidden">Clear</span>
              </button>

              {/* Button 4: Live Mobile SMS / Comms */}
              <button
                onClick={() => {
                  if (onToggleMobileSimulator) {
                    onToggleMobileSimulator()
                  }
                }}
                className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-600/70 hover:border-amber-400 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title={isPolice ? "Police Radio & Incident Dispatch Log" : "Toggle Live Mobile Dispatch & SMS Receiver Simulator"}
              >
                <span>📱</span>
                <span className="hidden sm:inline">{isPolice ? '4. Police Comms' : '4. Mobile SMS'}</span>
                <span className="sm:hidden">SMS</span>
              </button>
            </div>
          )}

          {/* Search Highway Input */}
          <div className="bg-white/95 backdrop-blur-md text-gray-900 rounded-lg shadow-md border border-slate-300 px-3 py-1.5 hidden md:flex items-center gap-2 w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search_highways_placeholder')}
              className="flex-1 text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Status Badges */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* Realtime Supabase Connection Badge */}
          <div className="bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'LIVE'
                  ? 'bg-emerald-400 animate-pulse'
                  : connectionStatus === 'RECONNECTING'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            <span className="font-semibold text-slate-200 text-xs">
              {connectionStatus === 'LIVE' ? '● LIVE' : connectionStatus === 'RECONNECTING' ? '↻ RECONNECTING' : '● OFFLINE'}
            </span>
          </div>

          {/* Live Active Incident Counter Badge */}
          {activeIncidents && activeIncidents.length > 0 && (
            <div className="bg-red-950/90 backdrop-blur-md text-red-200 border border-red-700 px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{activeIncidents.length} Incident{activeIncidents.length > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* OSRM Road Network Status Badge */}
          <div className="bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 px-2.5 py-1.5 rounded-lg shadow-md flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                missionPathCoordinates && missionPathCoordinates.length > 20
                  ? 'bg-blue-400 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            <span className="font-semibold text-slate-200 hidden sm:inline">
              {missionPathCoordinates && missionPathCoordinates.length > 20
                ? 'OSRM Road Network'
                : 'GIS Navigation'}
            </span>
            {missionPathCoordinates && missionPathCoordinates.length > 20 && (
              <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-700/60 px-1.5 py-0.5 rounded font-mono font-bold">
                {missionPathCoordinates.length} nodes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 🎬 CONVOY SIMULATION & TELEMETRY CONTROLLER BAR (BOTTOM-CENTER DOCK - ADMIN & CITIZENS ONLY) ── */}
      {!isPolice && missionPathCoordinates && missionPathCoordinates.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-slate-950/95 backdrop-blur-md border border-slate-700 text-slate-100 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 max-w-lg w-[94%] sm:w-auto">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-[#213d77] hover:bg-[#1b3162] text-white p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 border border-blue-500/40"
            title={isPlaying ? 'Pause Convoy Movement' : 'Resume Convoy Movement'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          </button>

          {/* Restart Button */}
          <button
            onClick={() => setSimProgress(0.0)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer border border-slate-700 shrink-0"
            title="Restart Convoy from Origin"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Convoy Telemetry Info & Scrub Track */}
          <div className="flex flex-col flex-1 min-w-[130px] sm:min-w-[180px] text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-white flex items-center gap-1 truncate max-w-[120px] sm:max-w-none font-mono">
                <Truck className="w-3.5 h-3.5 text-[#fb792b] shrink-0" />
                <span className="truncate">{vehicleTelemetry?.vehicleNumber || 'NER-TRUCK-18'}</span>
              </span>
              <span className="text-emerald-400 font-mono text-[10.5px] ml-1">{completedPercentage}%</span>
            </div>

            {/* Interactive Progress Track */}
            <div
              className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-1 cursor-pointer border border-slate-700"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const newProgress = Math.max(0, Math.min(1, clickX / rect.width))
                setSimProgress(newProgress)
              }}
              title="Click track to scrub convoy position"
            >
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-75"
                style={{ width: `${completedPercentage}%` }}
              />
            </div>

            <div className="flex justify-between text-[9.5px] text-slate-400 mt-0.5 font-mono">
              <span>{remainingDistanceKm} km left</span>
              <span>{currentVehicleHeading}° heading</span>
            </div>
          </div>

          {/* Speed Selector (1x, 3x, 8x) */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5 text-[10px] shrink-0 font-mono font-bold">
            {[1, 3, 8].map(spd => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-[#213d77] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Playback Speed ${spd}x`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── RIGHT FLOATING MAP TOOLBAR (TOP-RIGHT STACK TO PREVENT ANY DOCK COLLISION) ── */}
      <div className="absolute top-16 right-3 z-30 flex flex-col items-end gap-1.5 pointer-events-auto">
        {/* Fit Route Button */}
        {missionPathCoordinates && missionPathCoordinates.length > 1 && (
          <button
            onClick={() => setFitRouteTrigger(Date.now())}
            className="bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 px-2.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
            title="Fit Active Road Route to Screen"
          >
            <Navigation className="w-3.5 h-3.5 text-[#fb792b]" />
            <span className="hidden sm:inline">Fit Route</span>
          </button>
        )}

        {/* Layer Switcher */}
        <div className="relative">
          <button
            onClick={() => setLayerDrawerOpen(!layerDrawerOpen)}
            className="bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 px-2.5 py-1.5 rounded-xl shadow-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
            title="Change Map Style & Data Layers"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {layerDrawerOpen && (
            <div className="absolute top-0 right-full mr-2 bg-slate-950/95 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 p-3 w-64 space-y-2.5 text-xs backdrop-blur-xl z-[2500]">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">Base Map Theme</p>
                <div className="space-y-1">
                  {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map(key => (
                    <button
                      key={key}
                      onClick={() => {
                        setCurrentLayer(key)
                        setLayerDrawerOpen(false)
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        currentLayer === key ? 'bg-[#213d77] text-white shadow-xs' : 'hover:bg-slate-900 text-slate-300'
                      }`}
                    >
                      <span>{TILE_LAYERS[key].name}</span>
                      {currentLayer === key && <span className="text-emerald-400 font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800 pt-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">GIS Data Layers</p>
                <div className="space-y-1.5 px-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showActiveIncidents}
                      onChange={e => setShowActiveIncidents(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-[#fb792b] focus:ring-[#fb792b] cursor-pointer"
                    />
                    <span>🚨 Active Incidents</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showRiskPredictions}
                      onChange={e => setShowRiskPredictions(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-[#fb792b] focus:ring-[#fb792b] cursor-pointer"
                    />
                    <span>⚠️ AI Risk Predictions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showInfrastructure}
                      onChange={e => setShowInfrastructure(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-[#fb792b] focus:ring-[#fb792b] cursor-pointer"
                    />
                    <span>🌉 Bridges & Mountain Passes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showCrisisZonesLayer}
                      onChange={e => setShowCrisisZonesLayer(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className="text-rose-400 font-bold">🚨 Police Crisis Danger Zones ({crisisZones.length})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={showSafeBeaconsLayer}
                      onChange={e => setShowSafeBeaconsLayer(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-emerald-400 focus:ring-emerald-400 cursor-pointer"
                    />
                    <span className="text-emerald-300 font-bold">⛺ Safe Evacuation Havens ({beacons.length})</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GPS Recenter Button */}
        <button
          onClick={() => setTargetView(STATE_HUBS.All)}
          className="bg-slate-950/90 hover:bg-slate-900 text-slate-200 hover:text-white p-2 rounded-xl shadow-xl border border-slate-700 transition-all cursor-pointer backdrop-blur-md"
          title="Recenter NER Map"
        >
          <Crosshair className="w-3.5 h-3.5 text-slate-300" />
        </button>

        {/* Zoom In/Out Controls */}
        <div className="bg-slate-950/90 rounded-xl shadow-xl border border-slate-700 flex flex-col overflow-hidden backdrop-blur-md">
          <button
            onClick={() => {
              setZoomAction(1)
              setTimeout(() => setZoomAction(null), 100)
            }}
            className="p-2 text-slate-200 hover:bg-slate-900 border-b border-slate-800 flex items-center justify-center cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomAction(-1)
              setTimeout(() => setZoomAction(null), 100)
            }}
            className="p-2 text-slate-200 hover:bg-slate-900 flex items-center justify-center cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 🚨 PROMPT BANNER WHEN CRISIS PIN MODE IS ACTIVE ── */}
      {isPoliceCrisisPinModeActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[2500] pointer-events-auto bg-rose-950/95 border-2 border-rose-500 text-rose-100 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 backdrop-blur-md animate-bounce ring-4 ring-rose-500/20">
          <span className="text-base">🚨</span>
          <span>CRISIS MODE: Click anywhere on the map to define the <strong>Disaster Crisis Epicenter & Danger Radius</strong>!</span>
          <button
            onClick={() => setIsPoliceCrisisPinModeActive(false)}
            className="bg-rose-800 hover:bg-rose-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] ml-1 cursor-pointer"
            title="Cancel Crisis Mode"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── ✅ SUCCESS BANNER WHEN CRISIS ZONE IS BROADCASTED ── */}
      {crisisSuccessNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[2500] pointer-events-auto bg-rose-900 border-2 border-rose-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <span>🚨</span>
          <span>{crisisSuccessNotice}</span>
          <button onClick={() => setCrisisSuccessNotice(null)} className="ml-2 text-rose-300 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* ── 📍 PROMPT BANNER WHEN 'MARK SAFE AREA' PIN MODE IS ACTIVE ── */}
      {isSafePinModeActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[2500] pointer-events-auto bg-emerald-950/95 border-2 border-emerald-400 text-emerald-100 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 backdrop-blur-md animate-bounce ring-4 ring-emerald-500/20">
          <span className="text-base">📍</span>
          <span>Click anywhere on the map to drop a <strong>Safe Haven / Evacuation Refuge</strong> point for citizens!</span>
          <button
            onClick={() => setIsSafePinModeActive(false)}
            className="bg-emerald-800 hover:bg-emerald-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] ml-1 cursor-pointer"
            title="Cancel Safe Pin Mode"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── ✅ SUCCESS BANNER WHEN SAFE BEACON IS BROADCASTED ── */}
      {safeSuccessNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[2500] pointer-events-auto bg-emerald-900 border-2 border-emerald-400 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <span>✅</span>
          <span>{safeSuccessNotice}</span>
          <button onClick={() => setSafeSuccessNotice(null)} className="ml-2 text-emerald-300 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* ── LEAFLET MAP CANVAS ── */}
      <MapContainer
        center={[25.7, 92.8]}
        zoom={7}
        zoomControl={false}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: '0.75rem',
          background: currentLayer === 'dark' ? '#0f172a' : currentLayer === 'google_hybrid' ? '#041019' : '#f1f5f9',
        }}
      >
        <TileLayer
          key={currentLayer}
          attribution={TILE_LAYERS[currentLayer]?.attribution || '&copy; OpenStreetMap'}
          url={TILE_LAYERS[currentLayer]?.url || TILE_LAYERS.google_roadmap.url}
          subdomains={TILE_LAYERS[currentLayer]?.subdomains || 'abc'}
          maxZoom={18}
        />

        <MapControllerComponent
          targetView={targetView}
          missionPathCoordinates={missionPathCoordinates}
          zoomAction={zoomAction}
          fitRouteTrigger={fitRouteTrigger}
        />

        {/* ── Map Click Event: Drops Crisis Pin, Safe Haven Pin, or Police Crisis Zone based on active mode ── */}
        <MapClickEventsComponent
          isPinModeActive={isPinModeActive}
          isSafePinModeActive={isSafePinModeActive}
          isPoliceCrisisPinModeActive={isPoliceCrisisPinModeActive}
          isAdminCrisisRouteModeActive={isAdminCrisisRouteModeActive}
          onSelectTargetCoords={onSelectTargetCoords}
          onSelectSafeCoords={(coords) => {
            setPendingSafeCoords(coords)
            setIsSafeModalOpen(true)
            setIsSafePinModeActive(false)
          }}
          onSelectCrisisCoords={(coords) => {
            setPendingCrisisCoords(coords)
            setIsPoliceCrisisModalOpen(true)
            setIsPoliceCrisisPinModeActive(false)
          }}
          onAdminSelectCrisisAndRoute={(coords) => {
            setIsAdminCrisisRouteModeActive(false)
            if (onAdminSelectCrisisAndRoute) {
              onAdminSelectCrisisAndRoute(coords)
            } else if (onSelectTargetCoords) {
              onSelectTargetCoords(coords)
            }
            setAdminSuccessNotice('⚡ Tactical Corridor Generated & Convoy Dispatched! Live tracking streaming to Citizen Portal.')
            setTimeout(() => setAdminSuccessNotice(null), 8000)
          }}
          onPinPlaced={() => {
            setIsPinModeActive(false)
            setIsSafePinModeActive(false)
            setIsPoliceCrisisPinModeActive(false)
            setIsAdminCrisisRouteModeActive(false)
          }}
        />



        {/* ── Origin Hub Pin (Always rendered at Origin) ── */}
        {originCoords && (
          <Marker
            position={[originCoords.lat, originCoords.lng]}
            icon={createOriginHubIcon()}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className="font-extrabold text-blue-600 block text-sm">🏛️ Supply Origin Hub</span>
                <p className="text-gray-900 font-bold text-xs mt-0.5">{originCoords.name}</p>
                <p className="text-gray-600 text-[11px] mt-0.5">
                  Convoys dispatched from this strategic logistics reserve.
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ── Direct Destination / Crisis Pin (When NO last-mile gap) ── */}
        {targetCoords && (!lastMileAccessibility || lastMileAccessibility.lastMileDistanceKm === 0) && (
          <Marker
            position={[targetCoords.lat, targetCoords.lng]}
            icon={targetCoords.isPinnedCrisis ? createTargetCrisisIcon() : createDestinationDepotIcon()}
          >
            <Popup>
              <div className="text-xs p-1">
                <span className={`font-extrabold block text-sm ${targetCoords.isPinnedCrisis ? 'text-red-600' : 'text-teal-700'}`}>
                  {targetCoords.isPinnedCrisis ? '🎯 Pinned Crisis Zone' : '📍 Destination Delivery Depot'}
                </span>
                <p className="text-gray-900 font-bold text-xs mt-0.5">{targetCoords.name}</p>
                <p className="text-emerald-700 font-semibold text-[10.5px] mt-0.5">
                  ✅ Direct Vehicle Access Passable
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ── Phase 10: Vehicle Access Point & Last-Mile Crisis Pins (When last-mile exists) ── */}
        {lastMileAccessibility && lastMileAccessibility.lastMileDistanceKm > 0 && (
          <>
            {/* 🚛 Vehicle Access Point Pin */}
            <Marker
              position={[lastMileAccessibility.vehicleAccessPoint.lat, lastMileAccessibility.vehicleAccessPoint.lng]}
              icon={createVehicleAccessPointIcon()}
            >
              <Popup>
                <div className="text-xs p-1.5 max-w-xs space-y-1 font-sans">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                    <span className="font-extrabold text-blue-700 text-xs">🚛 Vehicle Access Point</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded uppercase">
                      ROAD HEAD
                    </span>
                  </div>
                  <p className="text-gray-800 font-semibold text-[11px]">
                    Vehicle road access ends at this safe coordinate.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-1.5 text-[10.5px] text-blue-900 space-y-0.5">
                    <div className="flex justify-between">
                      <span>Vehicle Accessible:</span>
                      <strong>{lastMileAccessibility.vehicleAccessibleDistanceKm} km</strong>
                    </div>
                    <div className="flex justify-between text-amber-700 font-bold">
                      <span>Remaining Last-Mile:</span>
                      <strong>{lastMileAccessibility.lastMileDistanceKm} km</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    Suggested Mode: <strong>{lastMileAccessibility.recommendedMode}</strong> (Field verification required before dispatch).
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* 🚨 Actual Crisis Location Pin */}
            <Marker
              position={[lastMileAccessibility.crisisLocation.lat, lastMileAccessibility.crisisLocation.lng]}
              icon={createLastMileCrisisIcon()}
            >
              <Popup>
                <div className="text-xs p-1.5 max-w-xs space-y-1 font-sans">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                    <span className="font-extrabold text-orange-700 text-xs">🚨 Crisis Location</span>
                    <span className="text-[9px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded uppercase">
                      {lastMileAccessibility.crisisType}
                    </span>
                  </div>
                  <p className="text-gray-800 font-semibold text-[11px]">
                    Target Disaster Relief & Supply Destination
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded p-1.5 text-[10.5px] text-orange-900 space-y-0.5">
                    <p><strong>Last-Mile Distance:</strong> {lastMileAccessibility.lastMileDistanceKm} km (Estimated Non-Road Distance)</p>
                    <p><strong>Suggested Transfer Mode:</strong> {lastMileAccessibility.recommendedMode}</p>
                    <p className="text-amber-800 font-bold text-[9.5px]">⚠️ FIELD VERIFICATION REQUIRED (Resource not yet assigned)</p>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* ── Dashed Last-Mile Segment Polyline ── */}
            <Polyline
              positions={lastMileAccessibility.lastMileCoordinates}
              color="#ea580c"
              weight={4}
              dashArray="6, 8"
              opacity={0.9}
            >
              <Popup>
                <div className="text-xs p-1">
                  <span className="font-bold text-orange-700">🚶 Last-Mile Non-Road Segment</span>
                  <p className="text-gray-700 text-[11px] mt-0.5">
                    Distance: <strong>{lastMileAccessibility.lastMileDistanceKm} km</strong> (Estimated Non-Road Distance)
                  </p>
                  <p className="text-gray-600 text-[10px]">
                    Mode: {lastMileAccessibility.recommendedMode} • Verification: Required
                  </p>
                </div>
              </Popup>
            </Polyline>
          </>
        )}

        {/* ── NER 8-State Geographic Operational Territory Boundary ── */}
        <Polygon
          positions={NER_ZONE_POLYGON}
          pathOptions={{
            color: '#0284c7',
            weight: 2,
            dashArray: '5, 8',
            fillColor: '#0ea5e9',
            fillOpacity: 0.02,
          }}
        />

        {/* ── 🏛️ Real Google Maps-style District Administrative Jurisdiction Boundaries ── */}
        {showDistrictBoundaries && NER_DISTRICT_JURISDICTIONS.map((district) => {
          const isSelected = activeDistrict?.id === district.id || selectedDistrictId === district.id
          return (
            <Polygon
              key={district.id}
              positions={district.bounds}
              pathOptions={{
                color: isSelected ? '#fb792b' : '#213d77',
                weight: isSelected ? 3.5 : 1.5,
                dashArray: isSelected ? undefined : '4, 6',
                fillColor: isSelected ? '#fb792b' : '#213d77',
                fillOpacity: isSelected ? 0.12 : 0.04,
              }}
              eventHandlers={{
                click: () => {
                  setActiveDistrict(district)
                  if (onSelectDistrict) onSelectDistrict(district)
                },
              }}
            >
              <Popup>
                <div className="text-xs p-2 max-w-sm space-y-2 font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="font-extrabold text-[#213d77] text-xs">🏛️ {district.name}</span>
                    <span className="text-[9.5px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                      {district.state}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <p><strong>District HQ:</strong> {district.headquarters}</p>
                    <p><strong>SP Office:</strong> {district.spOffice}</p>
                    <p className="text-emerald-700 font-semibold">
                      <strong>Direct Phone:</strong> {district.spContact}
                    </p>
                    <p className="text-rose-700 font-semibold">
                      <strong>DEOC Control:</strong> {district.deocControlRoom}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[10.5px] space-y-1">
                    <p className="font-bold text-slate-800 uppercase tracking-wide text-[9px]">Road Infrastructure</p>
                    <p className="text-slate-600">
                      <strong>Highways:</strong> {district.roadNetworkSummary.nationalHighways.join(', ')}
                    </p>
                    <p className="text-slate-600">
                      <strong>Key Bridges:</strong> {district.roadNetworkSummary.criticalBridges.join(', ')}
                    </p>
                    <p className="text-amber-700">
                      <strong>Vulnerable Zones:</strong> {district.roadNetworkSummary.floodVulnerableZones.join(', ')}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">{district.policeStations.length} Jurisdictional Police Stations</span>
                    <button
                      onClick={() => {
                        setActiveDistrict(district)
                        if (onSelectDistrict) onSelectDistrict(district)
                      }}
                      className="bg-[#213d77] text-white font-bold px-2 py-1 rounded text-[9.5px] hover:bg-[#1b3162] cursor-pointer"
                    >
                      Inspect District 🔍
                    </button>
                  </div>
                </div>
              </Popup>
            </Polygon>
          )
        })}

        {/* ── 🏔️ Geological Survey of India (GSI) Landslide Early Warning System (LEWS) Saturation Layer ── */}
        {showLEWS && PAN_NER_LEWS_ZONES.map((zone) => {
          const isCritical = zone.riskLevel === 'CRITICAL_LEWS'
          const fillColor = isCritical ? '#dc2626' : '#d97706'
          const strokeColor = isCritical ? '#b91c1c' : '#b45309'

          return (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radiusMeters}
              pathOptions={{
                color: strokeColor,
                fillColor: fillColor,
                fillOpacity: isCritical ? 0.22 : 0.15,
                weight: 2,
                dashArray: isCritical ? '6, 6' : undefined,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="text-xs p-1 font-sans space-y-1">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <span>🌋</span> GSI LEWS Hazard Zone
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      isCritical ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {zone.saturationPercent}% SATURATION
                    </span>
                  </div>
                  <p className="font-bold text-[#213d77]">{zone.name}</p>
                  <p className="text-[10.5px] text-slate-600">Corridor: <strong>{zone.corridor}</strong></p>
                  <p className="text-[10px] text-slate-500 italic">Formation: {zone.geologicalFormation}</p>
                  <div className="text-[10px] text-emerald-800 font-semibold pt-0.5 border-t border-slate-100 flex justify-between">
                    <span>Rainfall: <strong>{zone.rainfallAccumulationMm} mm/48h</strong></span>
                    <span className="text-rose-700 font-bold">Slope Instability: HIGH</span>
                  </div>
                </div>
              </Tooltip>
            </Circle>
          )
        })}

        {/* ── 👮 Pan-NER Police Station (PS) Operational Outposts ── */}
        {showPoliceStations && NER_DISTRICT_JURISDICTIONS.flatMap(d => d.policeStations).map((ps) => {
          const isSelected = activePoliceStation?.id === ps.id || selectedPoliceStationId === ps.id
          return (
            <Marker
              key={ps.id}
              position={[ps.lat, ps.lng]}
              icon={createPoliceStationIcon(ps.name, isSelected)}
              eventHandlers={{
                click: () => {
                  setActivePoliceStation(ps)
                  if (onSelectPoliceStation) onSelectPoliceStation(ps)
                },
              }}
            >
              <Popup maxWidth={280} minWidth={250}>
                <div className="text-[11px] p-2.5 max-w-[260px] space-y-1.5 font-sans select-none">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <span className="font-bold text-[#1e3a8a] text-xs flex items-center gap-1">
                      👮 {ps.name}
                    </span>
                    <span className="text-[9px] bg-indigo-100 text-indigo-900 font-bold px-1.5 py-0.2 rounded font-mono">
                      {ps.district}
                    </span>
                  </div>

                  <div className="space-y-0.5 text-slate-700 text-[10.5px]">
                    <p><strong>OC:</strong> <span className="font-bold text-slate-900">{ps.inCharge}</span></p>
                    <p className="text-emerald-700 font-medium"><strong>Phone:</strong> {ps.contactPhone}</p>
                    <p className="text-indigo-700 font-mono text-[10px]"><strong>VHF:</strong> {ps.vhfCallsign}</p>
                  </div>

                  <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-[10px] space-y-0.5">
                    <p className="text-slate-600"><strong>Roads:</strong> {ps.jurisdictionRoads.join(', ')}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* ── Clean Base Road Network Polylines (Only when explicitly enabled or searched) ── */}
        {(showRoadNetwork || searchQuery) && filteredRoutes.map((route) => {
          const isBlocked = route.status === 'blocked'
          const isAtRisk = route.status === 'at_risk'
          const isHighlighted = highlightedRouteName && (
            route.name.toLowerCase() === highlightedRouteName.toLowerCase() ||
            route.name.toLowerCase().includes(highlightedRouteName.toLowerCase())
          )

          const color = isBlocked
            ? '#dc2626'
            : isAtRisk
            ? '#d97706'
            : isHighlighted
            ? '#0284c7'
            : '#64748b'

          const weight = isHighlighted ? 6 : isBlocked ? 4.5 : 3.5
          const opacity = isHighlighted ? 1.0 : isBlocked ? 0.9 : 0.65

          const coords = (route.coordinates || []) as [number, number][]
          if (coords.length === 0) return null

          const labelIndex = Math.floor(coords.length * 0.35)
          const hazardIndex = Math.floor(coords.length * 0.65)
          const labelPoint: [number, number] = coords[labelIndex] || coords[0]
          const hazardPoint: [number, number] = coords[hazardIndex] || coords[0]

          return (
            <div key={route.id}>
              <Polyline
                positions={coords}
                color={color}
                weight={weight}
                opacity={opacity}
                dashArray={isBlocked ? '8, 8' : undefined}
                eventHandlers={{
                  click: () => onSelectRoute && onSelectRoute(route.name),
                }}
              >
                <Popup>
                  <div className="text-xs p-1.5 max-w-xs space-y-1">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                      <span className="font-extrabold text-gray-900 text-xs">{route.highway_number || 'NH Corridor'}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isBlocked ? 'bg-red-100 text-red-800' : isAtRisk ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {route.status}
                      </span>
                    </div>
                    <p className="text-gray-800 font-bold text-xs">{route.name}</p>
                    <p className="text-gray-600 text-[10.5px]">
                      📍 {route.district || 'Regional Sector'}, {route.state || 'NER'}
                    </p>
                    <div className="pt-1 border-t border-gray-200 flex gap-1">
                      <button
                        onClick={() => onReportRouteStatus && onReportRouteStatus(route.name, 'blocked')}
                        className="flex-1 bg-red-600 text-white font-bold text-[9px] py-1 rounded cursor-pointer"
                      >
                        Block 🚫
                      </button>
                      <button
                        onClick={() => onReportRouteStatus && onReportRouteStatus(route.name, 'at_risk')}
                        className="flex-1 bg-amber-500 text-white font-bold text-[9px] py-1 rounded cursor-pointer"
                      >
                        At Risk ⚠️
                      </button>
                      <button
                        onClick={() => onReportRouteStatus && onReportRouteStatus(route.name, 'open')}
                        className="flex-1 bg-green-600 text-white font-bold text-[9px] py-1 rounded cursor-pointer"
                      >
                        Open ✅
                      </button>
                    </div>
                  </div>
                </Popup>
              </Polyline>

              {/* Highway Label Shield (Positioned at 35% corridor mark; suppressed if corridor is blocked) */}
              {route.highway_number && labelPoint && !isBlocked && (
                <Marker
                  position={labelPoint}
                  icon={createHighwayLabelIcon(route.highway_number, route.status)}
                />
              )}

              {/* Blocked Red Hazard Marker at Obstruction (Positioned at 65% corridor mark) */}
              {isBlocked && hazardPoint && (
                <Marker
                  position={hazardPoint}
                  icon={createBlockedHazardIcon()}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <span className="font-extrabold text-red-600 block text-xs">⛔ Corridor Blockage</span>
                      <p className="text-gray-900 font-bold text-xs">{route.name}</p>
                      <p className="text-gray-600 text-[10.5px] mt-0.5">
                        Carriageway blocked by structural hazard or landslide debris.
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </div>
          )
        })}

        {/* ── 🏔️ Strategic Mountain Passes (Optional Layer) ── */}
        {showInfrastructure && NER_STRATEGIC_PASSES.map((pass) => (
          <Marker
            key={pass.id}
            position={[pass.coordinates[0], pass.coordinates[1]]}
            icon={createStrategicPassIcon(pass.name, pass.status, pass.elevation_ft)}
          >
            <Popup>
              <div className="text-xs p-1.5 max-w-xs space-y-1 font-sans">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                  <span className="font-extrabold text-gray-900">🏔️ {pass.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    pass.status === 'open' ? 'bg-green-100 text-green-800' :
                    pass.status === 'at_risk' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {pass.status}
                  </span>
                </div>
                <p className="text-gray-700 text-[11px]"><strong>Elevation:</strong> {pass.elevation_ft} ft • <strong>Highway:</strong> {pass.highway}</p>
                <p className="text-gray-600 text-[11px]">{pass.snow_risk}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── 🌉 Strategic Bridges with Weight Limits (Optional Layer) ── */}
        {showInfrastructure && NER_STRATEGIC_BRIDGES.map((br) => (
          <Marker
            key={br.id}
            position={[br.coordinates[0], br.coordinates[1]]}
            icon={createStrategicBridgeIcon(br.name, br.status, br.max_weight_tons)}
          >
            <Popup>
              <div className="text-xs p-1.5 max-w-xs space-y-1 font-sans">
                <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                  <span className="font-extrabold text-cyan-900">🌉 {br.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    br.status === 'open' ? 'bg-green-100 text-green-800' :
                    br.status === 'at_risk' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {br.status}
                  </span>
                </div>
                <p className="text-gray-700 text-[11px]"><strong>River:</strong> {br.river} • <strong>Length:</strong> {br.length_meters}m</p>
                <p className="text-gray-700 text-[11px]"><strong>Max Weight Rating:</strong> {br.max_weight_tons} Tons Heavy Multi-Axle</p>
                <p className="text-cyan-700 text-[10.5px]"><strong>Health:</strong> {br.structural_health}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── 🚨 Live Supabase Realtime Incident Markers (Phase 2) ── */}
        {showActiveIncidents && (activeIncidents || []).map((incident) => {
          const isConfirmed = incident.status === 'confirmed'
          const isPredicted = incident.status === 'predicted'

          return (
            <Marker
              key={incident.id}
              position={[incident.lat, incident.lng]}
              icon={createLiveIncidentIcon(
                (incident.type || incident.incident_type || 'landslide') as string,
                (incident.severity || 'high') as string,
                incident.status || 'reported'
              )}
            >
              <Popup maxWidth={290} minWidth={250}>
                <div className="text-[11px] p-2.5 max-w-[270px] max-h-[340px] overflow-y-auto space-y-1.5 font-sans custom-scrollbar select-none">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                    <span className="font-extrabold text-gray-900 capitalize">
                      {incident.type === 'landslide' ? '🏔️ Landslide' :
                       incident.type === 'flood' ? '🌊 Flash Flood' :
                       incident.type === 'bridge_failure' ? '🌉 Bridge Failure' :
                       incident.type === 'road_damage' ? '🛣️ Road Damage' : '⚠️ Hazard Incident'}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        isConfirmed ? 'bg-red-100 text-red-800' :
                        isPredicted ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {incident.status === 'predicted' ? '🟡 AI PREDICTED RISK' : incident.status ? incident.status.toUpperCase() : 'REPORTED'}
                    </span>
                  </div>

                  {incident.route_name && (
                    <p className="text-gray-800 font-bold text-[11px]">
                      🛣️ Corridor: {incident.route_name}
                    </p>
                  )}

                  {isPredicted && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-1.5 text-[10.5px] text-amber-900 space-y-0.5">
                      <p className="font-bold uppercase text-[9px] text-amber-800">⚠️ AI Risk Forecast (Early Warning)</p>
                      <p className="leading-tight">Elevated disruption probability based on meteorological & terrain indices. <strong>Road is NOT marked blocked.</strong></p>
                      <div className="pt-1 text-[9px] text-amber-700 flex justify-between border-t border-amber-200">
                        <span>Soil Moisture: DATA UNAVAILABLE</span>
                        <span>Confidence: HIGH</span>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    {incident.description || 'Hazard reported by field patrol observation.'}
                  </p>

                  {incident.photo_url && (
                    <div className="rounded-lg overflow-hidden border border-gray-200 mt-1 max-h-32">
                      <img
                        src={incident.photo_url}
                        alt="Incident Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-100 flex items-center justify-between">
                    <span>👤 {incident.reported_by || 'Field Observer'}</span>
                    <span>📍 {incident.lat.toFixed(3)}, {incident.lng.toFixed(3)}</span>
                  </div>

                  {/* Incident Audit Timeline */}
                  <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-200 text-[10px] space-y-1 text-gray-700">
                    <p className="font-bold text-gray-800 uppercase tracking-wider text-[9px]">🕒 Audit Timeline</p>
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>• {isPredicted ? 'Forecasted:' : 'Reported:'}</span>
                        <span className="font-mono" suppressHydrationWarning>{incident.reported_at || incident.created_at ? new Date(incident.reported_at || incident.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                      </div>
                      {incident.confirmed_at && (
                        <div className="flex items-center justify-between text-red-700 font-semibold">
                          <span>• Confirmed:</span>
                          <span className="font-mono" suppressHydrationWarning>{new Date(incident.confirmed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({incident.confirmed_by || 'Officer'})</span>
                        </div>
                      )}
                      {incident.resolved_at && (
                        <div className="flex items-center justify-between text-green-700 font-semibold">
                          <span>• Resolved:</span>
                          <span className="font-mono" suppressHydrationWarning>{new Date(incident.resolved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({incident.resolved_by || 'Authority'})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-1 border-t border-gray-200 flex gap-1">
                    {incident.status === 'reported' && (
                      <button
                        onClick={() => onConfirmIncident && onConfirmIncident(incident.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[9px] py-1 px-1.5 rounded transition-colors cursor-pointer"
                        title="Authorize and confirm ground blockage"
                      >
                        Confirm 🛑
                      </button>
                    )}
                    {incident.status === 'confirmed' && (
                      <button
                        onClick={() => onResolveIncident && onResolveIncident(incident.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[9px] py-1 px-1.5 rounded transition-colors cursor-pointer"
                        title="Mark hazard cleared and re-open corridor"
                      >
                        Resolve ✅
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* ── 🚨 Statutory Police Crisis Danger Zones (Red Dashed Perimeter & Central Police Pin) ── */}
        {showCrisisZonesLayer && crisisZones.map((zone) => {
          const isReRouteReq = zone.workflowStatus === 'POLICE_REROUTE_REQUESTED'
          const isVerified = zone.workflowStatus === 'POLICE_VERIFIED'

          return (
            <React.Fragment key={zone.id}>
              {/* Obstacle Hazard Marker if Re-Route Requested by Police */}
              {!isPolice && zone.workflowStatus === 'POLICE_REROUTE_REQUESTED' && zone.assignedRouteCoordinates && zone.assignedRouteCoordinates.length > 5 && (
                <Marker
                  position={zone.assignedRouteCoordinates[Math.floor(zone.assignedRouteCoordinates.length * 0.6)]}
                  icon={createObstacleHazardIcon(zone.policeObstacleReport)}
                >
                  <Popup>
                    <div className="text-xs p-2 font-sans space-y-1">
                      <span className="font-bold text-rose-700 block">🛑 POLICE REPORTED OBSTACLE</span>
                      <p className="text-slate-900 font-bold text-xs">{zone.policeObstacleReport || 'Road blockage reported by OC'}</p>
                      <p className="text-slate-600 text-[10.5px]">Corridor severed. Awaiting State EOC Admin alternate re-routing.</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Statutory Red Dashed Danger Circle */}
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radiusMeters}
                pathOptions={{
                  color: isReRouteReq ? '#e11d48' : '#b91c1c',
                  fillColor: isReRouteReq ? '#f43f5e' : '#ef4444',
                  fillOpacity: 0.22,
                  weight: 2.5,
                  dashArray: '8, 8',
                }}
              />

              {/* Central Disaster Epicenter Marker */}
              <Marker
                position={[zone.lat, zone.lng]}
                icon={createCrisisEpicenterIcon()}
              >
                <Popup maxWidth={300} minWidth={270}>
                  <div className="text-[11px] p-2.5 max-w-[280px] max-h-[350px] overflow-y-auto space-y-2 font-sans custom-scrollbar select-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-rose-200 pb-1">
                      <span className="font-black text-rose-900 text-xs flex items-center gap-1">
                        <span>🚨</span> {isPolice ? 'HAZARD LOCATION' : 'CRISIS ZONE'}
                      </span>
                      <span className="text-[9.5px] bg-rose-100 text-rose-900 font-mono font-bold px-1.5 py-0.2 rounded border border-rose-300">
                        {(zone.radiusMeters / 1000).toFixed(1)} KM PERIMETER
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div>
                      <strong className="text-slate-900 text-xs font-bold block leading-snug">{zone.title}</strong>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span className="truncate">{zone.policeStation}</span>
                        <span className="text-rose-600 font-bold uppercase">
                          {zone.hazardType || 'DISRUPTION'}
                        </span>
                      </div>
                    </div>

                    {/* Content: Admin Corridor vs Police Ground Reality */}
                    {!isPolice ? (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 space-y-1 text-[10.5px]">
                        <div className="flex items-center justify-between font-bold text-rose-950">
                          <span>🛣️ Corridor:</span>
                          <span className="bg-white text-rose-900 font-mono font-bold px-1 rounded border border-rose-200 text-[9.5px]">
                            {zone.assignedVehicleName || '4x4 Fleet'}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium leading-tight">
                          {zone.reroutedRouteName
                            ? `🔄 ${zone.reroutedRouteName}`
                            : zone.assignedRouteName
                            ? `⚡ ${zone.assignedRouteName}`
                            : '⏳ Awaiting Admin route assignment.'}
                        </p>
                        {zone.policeObstacleReport && (
                          <div className="text-rose-900 bg-rose-100 p-1 rounded border border-rose-300 font-semibold text-[10px]">
                            🛑 <strong>Obstacle:</strong> {zone.policeObstacleReport}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1 text-[10.5px] text-slate-700">
                        <p>📍 <strong>Coordinates:</strong> {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</p>
                        <p>👮 <strong>Police Thana:</strong> {zone.policeStation}</p>
                        <p>⚠️ <strong>Hazard Type:</strong> {zone.hazardType}</p>
                      </div>
                    )}

                    {/* Interactive Action Triggers */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-200">
                      {isAdmin && zone.workflowStatus === 'CRISIS_MARKED' && (
                        <button
                          onClick={() => {
                            if (onAdminSelectCrisisAndRoute) {
                              onAdminSelectCrisisAndRoute({
                                lat: zone.lat,
                                lng: zone.lng,
                                zoneId: zone.id,
                                zoneTitle: zone.title,
                              })
                              setAdminSuccessNotice(`⚡ Route Auto-Calculated for ${zone.title}! Convoy dispatched & streaming to Citizen Portal.`)
                              setTimeout(() => setAdminSuccessNotice(null), 8000)
                            }
                          }}
                          className="w-full bg-[#fb792b] hover:bg-[#e06820] text-white font-bold py-1.5 px-2 rounded-md text-[10.5px] flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>⚡</span> Auto-Select Route & Dispatch Convoy
                        </button>
                      )}

                      {isAdmin && zone.workflowStatus !== 'CRISIS_MARKED' && (
                        <button
                          onClick={() => {
                            if (onAdminSelectCrisisAndRoute) {
                              onAdminSelectCrisisAndRoute({
                                lat: zone.lat,
                                lng: zone.lng,
                                zoneId: zone.id,
                                zoneTitle: zone.title,
                              })
                              setAdminSuccessNotice(`⚡ Recalculating Route & Convoy for ${zone.title}...`)
                              setTimeout(() => setAdminSuccessNotice(null), 8000)
                            }
                          }}
                          className="w-full bg-[#213d77] hover:bg-[#1b3162] text-white font-bold py-1 px-2 rounded-md text-[9.5px] flex items-center justify-center gap-1 shadow-xs cursor-pointer mb-1"
                        >
                          <span>🔄</span> Admin Re-Solve Tactical Corridor Here
                        </button>
                      )}

                      {/* Issue Resolved / Clear Location (Primary Button for Police and Admin) */}
                      <button
                        onClick={() => {
                          if (onIssueResolved) onIssueResolved(zone.id)
                          resolveAndClearCrisisZone({
                            zoneId: zone.id,
                            officerName: isPolice ? 'Duty Patrol Inspector' : 'State EOC Admin',
                            resolutionNotes: 'Hazard cleared, ground obstacle resolved, location normalized.',
                          })
                          setAdminSuccessNotice(`✅ Issue Resolved: Cleared "${zone.title}" from map!`)
                          setTimeout(() => setAdminSuccessNotice(null), 6000)
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2 rounded-md text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all"
                      >
                        <span>✅</span>
                        <span className="font-extrabold">{isPolice ? 'Mark Issue Resolved (Clear Location)' : 'Issue Resolved (Clear from Map)'}</span>
                      </button>
                    </div>

                    {/* Civilian Directive */}
                    <div className="bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-600 text-[10px] leading-tight italic">
                      🧭 <strong>Directive:</strong> {zone.evacuationGuidance}
                    </div>

                    {/* Footer */}
                    <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-[9.5px] text-slate-400 font-mono">
                      <span>{zone.timestamp}</span>
                      <button
                        onClick={() => removePoliceCrisisZone(zone.id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      >
                        Remove ✕
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          )
        })}

        {/* ── ⛺ Crowdsourced Citizen Safe Evacuation Relief Beacons & Perimeter ── */}
        {showSafeBeaconsLayer && beacons.map((beacon) => (
          <React.Fragment key={beacon.id}>
            {/* Pulsating Safe Gathering Perimeter Ring */}
            <Circle
              center={[beacon.lat, beacon.lng]}
              radius={400}
              pathOptions={{
                color: '#059669',
                fillColor: '#10b981',
                fillOpacity: 0.16,
                weight: 2,
                dashArray: '5, 6',
              }}
            />
            <Marker
              position={[beacon.lat, beacon.lng]}
              icon={createSafeBeaconIcon(beacon.evacueeCount, beacon.verifiedByPolice)}
            >
              <Popup maxWidth={280} minWidth={250}>
                <div className="text-[11px] p-2.5 max-w-[260px] max-h-[340px] overflow-y-auto space-y-2 font-sans custom-scrollbar select-none">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                    <span className="font-black text-emerald-800 text-xs flex items-center gap-1">
                      <span>⛺</span> SAFE HAVEN
                    </span>
                    <span className="text-[9.5px] bg-emerald-100 text-emerald-900 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                      {beacon.evacueeCount} CIVILIANS
                    </span>
                  </div>

                  <div>
                    <strong className="text-slate-900 text-xs font-bold block leading-snug">{beacon.name}</strong>
                    <span className="text-[9.5px] text-slate-400 font-mono">Marked by: {beacon.markedBy}</span>
                  </div>

                  {/* Safe Guidance */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-1.5 text-emerald-950 text-[10px] leading-relaxed">
                    🧭 {beacon.safeRouteDescription || beacon.notes || 'Safe gathering refuge designated for evacuees.'}
                  </div>

                  {/* Resource Badges */}
                  <div className="grid grid-cols-3 gap-1 text-[9.5px] text-center font-bold">
                    <div className={`p-1 rounded border ${beacon.waterAvailable ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      💧 Water {beacon.waterAvailable ? '✅' : '❌'}
                    </div>
                    <div className={`p-1 rounded border ${beacon.shelterAvailable ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      🏠 Roof {beacon.shelterAvailable ? '✅' : '❌'}
                    </div>
                    <div className={`p-1 rounded border ${beacon.medicalNeeds ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-emerald-100/70 border-emerald-300 text-emerald-800'}`}>
                      🩹 {beacon.medicalNeeds ? 'Med Req' : 'First Aid'}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-emerald-100 text-[10px]">
                    <span className="text-slate-400 font-mono">{beacon.timestamp}</span>
                    {!beacon.rescueTeamDispatched ? (
                      <button
                        onClick={() => dispatchRescueToBeacon(beacon.id, 'SDRF Quick Response Unit', 'Duty Commander')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer"
                      >
                        Dispatch SDRF 🚤
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold">✅ SDRF Dispatched</span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* ── 🚨 Citizen One-Tap SOS Distress Beacons (Admin / Police Visibility) ── */}
        {(userRole === 'APEX_ADMIN' || userRole === 'POLICE_OFFICER' || userRole === 'FIELD_COMMANDER' || !userRole) && sosRequests.map((sos) => (
          <Marker
            key={sos.id}
            position={[sos.lat, sos.lng]}
            icon={createSOSDistressIcon(sos.headcount)}
          >
            <Popup maxWidth={280} minWidth={250}>
              <div className="text-[11px] p-2.5 max-w-[260px] space-y-1.5 font-sans select-none">
                <div className="flex items-center justify-between border-b border-rose-200 pb-1">
                  <span className="font-black text-rose-800 text-xs flex items-center gap-1">
                    <span>🚨</span> SOS BEACON
                  </span>
                  <span className="text-[9.5px] bg-rose-100 text-rose-800 font-mono font-bold px-1.5 py-0.2 rounded border border-rose-300">
                    {sos.headcount} PAX
                  </span>
                </div>
                <strong className="text-slate-900 text-xs font-bold block leading-snug">{sos.citizenName}</strong>
                <p className="text-slate-600 text-[10.5px]">📍 {sos.landmark}</p>
                <div className="bg-rose-50 border border-rose-200 rounded p-1.5 text-[10.5px] text-rose-900 space-y-0.5">
                  <p><strong>Needs:</strong> {sos.needs.join(', ')}</p>
                  <p><strong>Phone:</strong> {sos.contactPhone}</p>
                </div>
                <div className="pt-1 text-[10px] text-slate-400 flex justify-between items-center border-t border-rose-100 font-mono">
                  <span>{sos.timestamp}</span>
                  <span className="font-bold text-rose-700">{sos.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* ── Active Calculated Emergency Supply Mission Polyline (OSRM Precision Road Ribbon) ── */}
        {missionPathCoordinates && missionPathCoordinates.length > 1 && (
          <div>
            {/* Outer Glow Ribbon */}
            <Polyline
              positions={missionPathCoordinates}
              color="#0284c7"
              weight={14}
              opacity={0.35}
              lineCap="round"
              lineJoin="round"
            />
            {/* High-Contrast Casing Outline */}
            <Polyline
              positions={missionPathCoordinates}
              color="#0f172a"
              weight={7}
              opacity={0.85}
              lineCap="round"
              lineJoin="round"
            />
            {/* Core Precision Navigation Line */}
            <Polyline
              positions={missionPathCoordinates}
              color="#38bdf8"
              weight={4.5}
              opacity={1.0}
              lineCap="round"
              lineJoin="round"
            >
              <Popup>
                <div className="text-xs p-1.5 max-w-xs space-y-1">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                    <span className="font-extrabold text-blue-600 text-xs">⚡ Active Road Mission</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.2 rounded uppercase">
                      {vehicleTelemetry?.modeBadge || 'ACTIVE'}
                    </span>
                  </div>
                  <p className="text-gray-800 font-bold text-xs">{highlightedRouteName || 'Direct Mission Corridor'}</p>
                  <p className="text-gray-600 text-[10.5px]">
                    🛣️ Total Distance: <strong>{totalMissionDistance} km</strong> • {missionPathCoordinates.length} road curve nodes
                  </p>
                  <div className="pt-1 border-t border-gray-200 flex gap-1">
                    <button
                      onClick={() => onReportRouteStatus && onReportRouteStatus(highlightedRouteName || 'Active Mission Route', 'blocked')}
                      className="flex-1 bg-red-600 text-white font-bold text-[9px] py-1 rounded cursor-pointer"
                    >
                      Report Block 🚫
                    </button>
                    <button
                      onClick={() => onReportRouteStatus && onReportRouteStatus(highlightedRouteName || 'Active Mission Route', 'at_risk')}
                      className="flex-1 bg-amber-500 text-white font-bold text-[9px] py-1 rounded cursor-pointer"
                    >
                      Report Risk ⚠️
                    </button>
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* ── 📡 NAVIC DEAD-RECKONING VECTOR PROJECTION (DASHED FORWARD CONVOY PATH) ── */}
            {currentVehiclePos && (
              <>
                {(() => {
                  const headingRad = (currentVehicleHeading * Math.PI) / 180
                  const deadReckoningLat = currentVehiclePos[0] + 0.14 * Math.cos(headingRad)
                  const deadReckoningLng = currentVehiclePos[1] + 0.14 * Math.sin(headingRad)
                  return (
                    <Polyline
                      positions={[currentVehiclePos, [deadReckoningLat, deadReckoningLng]]}
                      color="#fb792b"
                      weight={3.5}
                      dashArray="6, 8"
                      opacity={0.9}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                        <div className="text-[10px] font-mono p-0.5 space-y-0.5 text-orange-950">
                          <p className="font-extrabold flex items-center gap-1">
                            <span>📡</span> NavIC Dead-Reckoning Vector
                          </p>
                          <p>Bearing: <strong>{currentVehicleHeading}°</strong> • Speed: <strong>{vehicleTelemetry?.averageSpeedKmh || 48} km/h</strong></p>
                          <p className="text-[9px] text-slate-500 italic">Projected Trajectory in Comms Blackout</p>
                        </div>
                      </Tooltip>
                    </Polyline>
                  )
                })()}
              </>
            )}

            {/* ── 🚁 / 🚛 ANIMATED TRAVELING VEHICLE MARKER ── */}
            {currentVehiclePos && (
              <Marker
                position={currentVehiclePos}
                icon={createMovingVehicleIcon(
                  vehicleTelemetry?.transportMode || 'heavy_road_convoy',
                  vehicleTelemetry?.vehicleNumber || 'NER-TRUCK-18',
                  vehicleTelemetry?.etaHoursFormatted || '~4.5h',
                  currentVehicleHeading,
                  Boolean(blockedRouteName)
                )}
              >
                <Popup>
                  <div className="text-xs p-1.5 max-w-xs space-y-1.5 font-sans">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                      <span className="font-extrabold text-blue-600 text-[11px] flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                        {vehicleTelemetry?.vehicleNumber || 'NER-TRUCK-18'}
                      </span>
                      <span className="text-[8.5px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                        SIMULATED TELEMETRY
                      </span>
                    </div>

                    {/* Phase 11: Vehicle Readiness Safety Gate */}
                    {(() => {
                      const vReadiness = evaluateVehicleReadiness({
                        vehicleId: vehicleTelemetry?.vehicleNumber || 'NER-TRUCK-18',
                      })
                      return (
                        <div className="flex items-center justify-between bg-slate-900 text-white px-2 py-1 rounded text-[10px] font-mono border border-slate-700">
                          <span className="text-gray-400 font-bold">SAFETY GATE:</span>
                          <span className="font-extrabold flex items-center gap-1">
                            <span>{vReadiness.statusBadge.icon}</span>
                            <span>{vReadiness.status.replace(/_/g, ' ')}</span>
                          </span>
                        </div>
                      )
                    })()}

                    <div>
                      <p className="font-extrabold text-gray-900 text-xs">{vehicleTelemetry?.vehicleModel || 'Heavy Multi-Axle Convoy'}</p>
                      <p className="text-gray-600 text-[11px]">{vehicleTelemetry?.driverName || 'Commander R. Sharma'} ({vehicleTelemetry?.operatorRole || 'Fleet Master'})</p>
                    </div>

                    <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-200 text-[10.5px] space-y-0.5">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Operational Status:</span>
                        <span className={`font-bold uppercase ${blockedRouteName ? 'text-red-600' : 'text-emerald-700'}`}>
                          {blockedRouteName ? 'REROUTING' : 'IN TRANSIT'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Speed / Heading:</span>
                        <span className="font-bold text-gray-800">{vehicleTelemetry?.averageSpeedKmh || 45} km/h • {currentVehicleHeading}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Remaining Dist:</span>
                        <span className="font-bold text-blue-600">{remainingDistanceKm} km ({completedPercentage}% done)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Predicted Arrival:</span>
                        <span className="font-extrabold text-emerald-600">~{vehicleTelemetry?.arrivalClockTime || '07:02 am'} IST</span>
                      </div>
                    </div>

                    {/* Cargo Payload Manifest & Priority */}
                    {vehicleTelemetry?.cargoPayload && (
                      <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-200 text-[10.5px] space-y-0.5">
                        <div className="flex justify-between font-bold text-blue-900">
                          <span>📦 Cargo: {vehicleTelemetry.cargoPayload.cargoCategory.toUpperCase()}</span>
                          <span className="text-[9px] bg-red-100 text-red-700 border border-red-300 px-1 rounded uppercase font-extrabold">
                            CRITICAL PRIORITY
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-800 leading-tight">
                          {vehicleTelemetry.cargoPayload.primaryQuantity}
                        </p>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}
          </div>
        )}
      </MapContainer>

      {/* ── ⛺ MARK SAFE AREA / EVACUATION REFUGE MODAL ── */}
      {isSafeModalOpen && pendingSafeCoords && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-[4500] p-4 pointer-events-auto select-none">
          <div className="bg-slate-900 border-2 border-emerald-500 text-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans ring-4 ring-emerald-500/20">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-xl shadow-inner">
                  ⛺
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-emerald-400 uppercase tracking-wider">
                    Mark Safe Area / Refuge Point
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-mono">Guide citizens in crisis zone to this safe haven</p>
                </div>
              </div>
              <button
                onClick={() => setIsSafeModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-700 text-xs font-mono text-emerald-300 flex items-center justify-between">
              <span>📍 Pinned Coordinates:</span>
              <strong className="text-white">{pendingSafeCoords.lat.toFixed(4)}° N, {pendingSafeCoords.lng.toFixed(4)}° E</strong>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Safe Haven / Landmark Name:
                </label>
                <input
                  type="text"
                  value={safeHavenName}
                  onChange={e => setSafeHavenName(e.target.value)}
                  placeholder="e.g. Haflong High School Ground / Panchayat Bhavan"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                    Safe People Here (Pax):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={safeHeadcount}
                    onChange={e => setSafeHeadcount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                    Reporter / Contact Phone:
                  </label>
                  <input
                    type="text"
                    value={reporterPhone}
                    onChange={e => setReporterPhone(e.target.value)}
                    placeholder="+91 94350-xxxxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Available Facilities Toggles */}
              <div className="space-y-1.5">
                <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase">
                  Available Facilities at Safe Haven:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWaterAvail(!waterAvail)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      waterAvail
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="block text-base">💧</span>
                    <span className="text-[10.5px] font-bold">Clean Water {waterAvail ? '✅' : '❌'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShelterAvail(!shelterAvail)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      shelterAvail
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="block text-base">🏠</span>
                    <span className="text-[10.5px] font-bold">Dry Roof {shelterAvail ? '✅' : '❌'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMedAvail(!medAvail)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      medAvail
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="block text-base">🩹</span>
                    <span className="text-[10.5px] font-bold">First Aid Kit {medAvail ? '✅' : '❌'}</span>
                  </button>
                </div>
              </div>

              {/* Safe Passage Guidance from Crisis Area */}
              <div>
                <label className="block text-[10.5px] font-mono font-bold text-emerald-400 uppercase mb-1 flex items-center gap-1">
                  <span>🧭</span> Safe Escape Guidance (For Stranded People in Crisis Zone):
                </label>
                <textarea
                  rows={2}
                  value={escapeGuidance}
                  onChange={e => setEscapeGuidance(e.target.value)}
                  placeholder="e.g. Avoid the flooded lower river crossing. Take the north ridge footpath directly to this school."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSafeModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  markReliefBeacon({
                    name: safeHavenName.trim() || 'Safe Evacuation Refuge',
                    lat: pendingSafeCoords.lat,
                    lng: pendingSafeCoords.lng,
                    markedBy: reporterName,
                    contactPhone: reporterPhone,
                    evacueeCount: parseInt(safeHeadcount, 10) || 10,
                    waterAvailable: waterAvail,
                    shelterAvailable: shelterAvail,
                    medicalNeeds: !medAvail,
                    safeRouteDescription: escapeGuidance.trim(),
                    notes: `Safe haven marked. ${escapeGuidance.trim()}`,
                  })
                  setIsSafeModalOpen(false)
                  setSafeSuccessNotice(`✅ Safe Area "${safeHavenName}" broadcasted! People evacuating the crisis area can now see this refuge point on the map.`)
                  setTimeout(() => setSafeSuccessNotice(null), 8000)
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer transition-all"
              >
                <span>⛺</span>
                <span>Broadcast Safe Haven Beacon</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 🚨 DECLARE DISASTER CRISIS AREA MODAL (IDENTICAL FOR ADMIN & POLICE) ── */}
      {isPoliceCrisisModalOpen && pendingCrisisCoords && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[4500] p-4 pointer-events-auto select-none">
          <div className="bg-slate-900 border-2 border-rose-500 text-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-sans ring-4 ring-rose-500/20 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-500 flex items-center justify-center text-xl shadow-inner">
                  🚨
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-rose-400 uppercase tracking-wider">
                    Mark Disaster Crisis Area
                  </h3>
                  <p className="text-[10.5px] text-slate-400 font-mono">Define hazard epicenter, danger radius & evacuation directive</p>
                </div>
              </div>
              <button
                onClick={() => setIsPoliceCrisisModalOpen(false)}
                className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-700 text-xs font-mono text-rose-300 flex items-center justify-between">
              <span>📍 Danger Epicenter:</span>
              <strong className="text-white">{pendingCrisisCoords.lat.toFixed(4)}° N, {pendingCrisisCoords.lng.toFixed(4)}° E</strong>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Crisis Area / Sector Name:
                </label>
                <input
                  type="text"
                  value={crisisTitle}
                  onChange={e => setCrisisTitle(e.target.value)}
                  placeholder="e.g. Noney–Tupul Mountain Landslide Hazard Zone"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                    Hazard Classification:
                  </label>
                  <select
                    value={crisisHazardType}
                    onChange={e => setCrisisHazardType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="⛰️ Massive Debris Landslide & River Inundation">⛰️ Landslide & River Inundation</option>
                    <option value="🌊 High Surge Flash Flood & Submersion">🌊 Flash Flood Submersion</option>
                    <option value="🌉 Strategic Bridge Pier Fracture">🌉 Bridge Washout / Fracture</option>
                    <option value="💥 Cloudburst & Hill Escarpment Sinking">💥 Cloudburst / Hill Sinking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                    Danger Radius:
                  </label>
                  <select
                    value={crisisRadiusKm}
                    onChange={e => setCrisisRadiusKm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="3.0">3.0 km Radius</option>
                    <option value="5.0">5.0 km Radius</option>
                    <option value="8.5">8.5 km Radius (Standard Gorge)</option>
                    <option value="12.0">12.0 km Radius (Regional Sector)</option>
                    <option value="15.0">15.0 km Radius (Severe Basin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                    Affected Highway Corridor:
                  </label>
                  <input
                    type="text"
                    value={crisisAffectedCorridor}
                    onChange={e => setCrisisAffectedCorridor(e.target.value)}
                    placeholder="e.g. NH-37 Imphal–Jiribam Arterial"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                    Reporting Station / Thana / EOC:
                  </label>
                  <input
                    type="text"
                    value={crisisReportingStation}
                    onChange={e => setCrisisReportingStation(e.target.value)}
                    placeholder="e.g. Noney Police Station / Sector EOC"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold text-slate-300 uppercase mb-1">
                  Declaring Officer / Commander:
                </label>
                <input
                  type="text"
                  value={crisisReportingOfficer}
                  onChange={e => setCrisisReportingOfficer(e.target.value)}
                  placeholder="e.g. SDPO Noney / Duty Commander (Weight 9.5)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-mono font-bold text-rose-400 uppercase mb-1 flex items-center gap-1">
                  <span>📢</span> Public Evacuation Directive (Shown to Stranded Citizens):
                </label>
                <textarea
                  rows={2}
                  value={crisisGuidance}
                  onChange={e => setCrisisGuidance(e.target.value)}
                  placeholder="e.g. High hazard sector: Active hill mudslides. Evacuate immediately towards verified Safe Haven beacons at the perimeter."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed font-sans"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsPoliceCrisisModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const radiusMeters = Math.round(parseFloat(crisisRadiusKm) * 1000) || 8500
                  declarePoliceCrisisZone({
                    title: crisisTitle.trim() || 'Disaster Crisis Area',
                    hazardType: crisisHazardType,
                    lat: pendingCrisisCoords.lat,
                    lng: pendingCrisisCoords.lng,
                    radiusMeters,
                    severity: 'CRITICAL_DANGER',
                    affectedCorridor: crisisAffectedCorridor.trim() || 'National Highway Arterial',
                    policeStation: crisisReportingStation.trim() || 'Sector Police / EOC',
                    declaredBy: crisisReportingOfficer.trim() || 'Duty Commander',
                    evacuationGuidance: crisisGuidance.trim(),
                  })
                  setIsPoliceCrisisModalOpen(false)
                  setCrisisSuccessNotice(`🚨 Crisis Area "${crisisTitle}" (${crisisRadiusKm} km radius) declared! Red danger perimeter is now active.`)
                  setTargetView([pendingCrisisCoords.lat, pendingCrisisCoords.lng, 11])
                  setTimeout(() => setCrisisSuccessNotice(null), 8000)
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer transition-all"
              >
                <span>🚨</span>
                <span>Broadcast Crisis Area & Alert EOC</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Mobile SMS & Notification Simulator Widget */}
      <LiveMobileNotificationSimulator
        isOpen={isMobileSimulatorOpen}
        onClose={() => setIsMobileSimulatorOpen(false)}
        initialRole={
          userRole === 'POLICE_OFFICER' || userRole === 'FIELD_COMMANDER'
            ? 'police'
            : userRole === 'CITIZEN_USER' || userRole === 'CITIZEN_DRIVER'
            ? 'citizen'
            : 'admin'
        }
      />
    </div>
  )
}
