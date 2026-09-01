'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPendingReports, syncPendingReports, OfflineReport } from '@/lib/offline-queue'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [pendingReports, setPendingReports] = useState<OfflineReport[]>([])
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)

  const refreshPending = useCallback(async () => {
    try {
      const reports = await getPendingReports()
      setPendingReports(reports)
    } catch {
      setPendingReports([])
    }
  }, [])

  const triggerSync = useCallback(async () => {
    if (isSyncing || typeof navigator === 'undefined' || !navigator.onLine) return

    setIsSyncing(true)
    setSyncMessage('Syncing offline reports...')

    try {
      const result = await syncPendingReports()
      if (result.syncedCount > 0) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST'
        setLastSyncTime(timeStr)
        setSyncMessage(`Successfully synced ${result.syncedCount} report${result.syncedCount > 1 ? 's' : ''}`)
      } else if (result.failedCount > 0) {
        setSyncMessage(`Sync failed for ${result.failedCount} report(s). Will retry.`)
      } else {
        setSyncMessage(null)
      }
      await refreshPending()
    } catch (err: unknown) {
      console.error('Trigger sync error:', err)
      setSyncMessage('Sync error. Retrying when connection stabilizes.')
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncMessage(null), 5000)
    }
  }, [isSyncing, refreshPending])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      triggerSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncMessage('Operating in Offline Mode. Reports will queue in IndexedDB.')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Client-only initial IndexedDB queue load
    refreshPending()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [triggerSync, refreshPending])

  return {
    isOnline,
    isSyncing,
    pendingReports,
    pendingCount: pendingReports.length,
    lastSyncTime,
    syncMessage,
    triggerSync,
    refreshPending,
  }
}
