// lib/statutory-corridor-broadcast.ts
// ========================================================================
//    NERA: STATUTORY CORRIDOR ALERT BROADCAST & DISPATCH ENGINE
//    Simulates real-time official alerts, SMS dispatches, and VHF radio
//    green-corridor clearance to along-the-route Police Stations,
//    DEOC Disaster Control Rooms, and Village Defence Parties (VDPs).
// ========================================================================

import { PoliceStation } from './police-jurisdictions'
import { VillageDefencePartyProfile } from './tactical-corridor-guard'

export interface StatutoryBroadcastMessage {
  id: string
  timestamp: string
  priority: 'PRIORITY_1_STATUTORY_DISPATCH' | 'CRITICAL_GREEN_CORRIDOR' | 'SECURITY_ESCORT_DIRECTIVE'
  highwayCorridor: string
  originHub: string
  crisisTarget: string
  vehicleCallsign: string
  cargoManifest: string
  recipientStations: {
    stationId: string
    stationName: string
    officerInCharge: string
    contactPhone: string
    vhfCallsign: string
    transmissionStatus: 'DELIVERED_SMS' | 'TRANSMITTED_VHF' | 'ACKNOWLEDGED'
  }[]
  civilianVDPRecipient?: {
    villageName: string
    gaonBurahName: string
    contactPhone: string
    transmissionStatus: 'DELIVERED_SMS' | 'ACKNOWLEDGED'
  }
  statutoryDirectiveText: string
  authorizedBy: string
}

export function generateStatutoryCorridorBroadcast(params: {
  highwayCorridor: string
  originHub: string
  crisisTarget: string
  vehicleCallsign: string
  cargoManifest: string
  alongRouteStations: { station: PoliceStation; distanceKm: number }[]
  vdpProfile?: VillageDefencePartyProfile
}): StatutoryBroadcastMessage {
  const now = new Date()
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'
  const broadcastId = `STAT-DISP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

  const recipients = params.alongRouteStations.map(({ station }) => ({
    stationId: station.id,
    stationName: station.name,
    officerInCharge: station.inCharge,
    contactPhone: station.contactPhone,
    vhfCallsign: station.vhfCallsign,
    transmissionStatus: 'DELIVERED_SMS' as const,
  }))

  const vdpRecipient = params.vdpProfile
    ? {
        villageName: params.vdpProfile.villageName,
        gaonBurahName: params.vdpProfile.gaonBurahName,
        contactPhone: params.vdpProfile.gaonBurahContact,
        transmissionStatus: 'DELIVERED_SMS' as const,
      }
    : undefined

  const statutoryDirective = `[GOVT OF INDIA / SDMA STATUTORY CONVOY DIRECTIVE - ${broadcastId}]
STATUTORY LEGAL AUTHORITY: Section 187, Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 & Sections 30/34, Disaster Management Act, 2005.

URGENT: Disaster Relief Emergency Lifeline Mission in transit along ${params.highwayCorridor}.
Origin: ${params.originHub} ➔ Destination: ${params.crisisTarget}.
Vehicle: ${params.vehicleCallsign} | Cargo: ${params.cargoManifest}.

STATUTORY DIRECTIVE TO ALL OFFICER-IN-CHARGES (OC), HIGHWAY PATROLS & SDRF POSTS:
1. Grant immediate unhindered GREEN CORRIDOR passage at all state/inter-district barrier toll gates.
2. Deploy QRT Highway Pilot to escort convoy through vulnerable single-lane mountain bridge bottlenecks.
3. Maintain continuous VHF radio watch on designated sector frequencies (No mobile-only dependency).
4. Mobilize Gaon Burah / Village Defence Party (VDP) for roadhead porter handoff at terminal VAP.`

  return {
    id: broadcastId,
    timestamp: timeFormatted,
    priority: 'CRITICAL_GREEN_CORRIDOR',
    highwayCorridor: params.highwayCorridor,
    originHub: params.originHub,
    crisisTarget: params.crisisTarget,
    vehicleCallsign: params.vehicleCallsign,
    cargoManifest: params.cargoManifest,
    recipientStations: recipients,
    civilianVDPRecipient: vdpRecipient,
    statutoryDirectiveText: statutoryDirective,
    authorizedBy: 'State Emergency Operations Centre (SEOC) & Director General of Police Command',
  }
}

