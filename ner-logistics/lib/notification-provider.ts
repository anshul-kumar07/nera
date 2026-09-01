// lib/notification-provider.ts
// ========================================================================
//    NERA PHASE 22: MULTI-CHANNEL NOTIFICATION PROVIDER ADAPTER
// ========================================================================

import { UserRole } from './access-control'
import { AlertSeverity } from './alert-management'

export type NotificationChannel = 'SMS' | 'EMAIL' | 'PUSH' | 'IN_APP'

export type NotificationProviderStatus =
  | 'CONFIGURED'
  | 'UNCONFIGURED'
  | 'AVAILABLE'
  | 'FAILED'
  | 'SIMULATED'

export interface ChannelStatusInfo {
  channel: NotificationChannel
  status: NotificationProviderStatus
  providerName: string
  isAvailable: boolean
}

export const NOTIFICATION_CHANNELS: Record<NotificationChannel, ChannelStatusInfo> = {
  IN_APP: {
    channel: 'IN_APP',
    status: 'AVAILABLE',
    providerName: 'NERA WebSocket / Live Stream',
    isAvailable: true,
  },
  SMS: {
    channel: 'SMS',
    status: 'UNCONFIGURED',
    providerName: 'NIC Government SMS Gateway (CDAC)',
    isAvailable: false,
  },
  EMAIL: {
    channel: 'EMAIL',
    status: 'UNCONFIGURED',
    providerName: 'Gov.in SMTP Relay',
    isAvailable: false,
  },
  PUSH: {
    channel: 'PUSH',
    status: 'UNCONFIGURED',
    providerName: 'Firebase Cloud Messaging (FCM)',
    isAvailable: false,
  },
}

export interface DispatchNotificationRecord {
  notificationId: string
  recipient: string
  targetRole: UserRole
  district?: string
  severity: AlertSeverity
  channel: NotificationChannel
  title: string
  message: string
  createdAt: string
  deliveryStatus: 'DELIVERED' | 'FAILED' | 'BUFFERED_OFFLINE' | 'SIMULATED_DELIVERY'
  acknowledgedAt?: string | null
  isSimulated: boolean
}

export function dispatchOperationalNotification(params: {
  recipient: string
  targetRole: UserRole
  district?: string
  severity: AlertSeverity
  channel: NotificationChannel
  title: string
  message: string
  isSimulated?: boolean
}): DispatchNotificationRecord {
  const channelInfo = NOTIFICATION_CHANNELS[params.channel]
  let deliveryStatus: DispatchNotificationRecord['deliveryStatus'] = 'SIMULATED_DELIVERY'

  if (params.channel === 'IN_APP') {
    deliveryStatus = 'DELIVERED'
  } else if (!channelInfo.isAvailable) {
    deliveryStatus = 'SIMULATED_DELIVERY'
  }

  return {
    notificationId: `NOTIF-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    recipient: params.recipient,
    targetRole: params.targetRole,
    district: params.district,
    severity: params.severity,
    channel: params.channel,
    title: params.title,
    message: params.message,
    createdAt: new Date().toISOString(),
    deliveryStatus,
    isSimulated: params.isSimulated ?? true,
  }
}

