'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, isSupabaseConfigured, Incident, IncidentStatus } from '@/lib/supabase'

export type ConnectionStatus = 'LIVE' | 'RECONNECTING' | 'OFFLINE'

export interface RealtimeIncidentsHook {
  incidents: Incident[]
  activeIncidents: Incident[]
  reportedIncidents: Incident[]
  confirmedIncidents: Incident[]
  resolvedIncidents: Incident[]
  predictedRisks: Incident[]
  connectionStatus: ConnectionStatus
  lastSync: Date | null
  isLoading: boolean
  error: string | null
  reportIncident: (incidentData: Omit<Incident, 'id' | 'created_at'>) => Promise<{ data: Incident | null; error: Error | null }>
  confirmIncident: (id: string, confirmedBy?: string) => Promise<{ success: boolean; error: Error | null }>
  resolveIncident: (id: string, resolvedBy?: string) => Promise<{ success: boolean; error: Error | null }>
  refreshIncidents: () => Promise<void>
}

// Normalize incoming incident records from Supabase / Demo
function normalizeIncident(raw: Partial<Incident> & { [key: string]: unknown }): Incident {
  const createdAt = raw.created_at ? String(raw.created_at) : (raw.timestamp ? String(raw.timestamp) : new Date().toISOString())
  return {
    id: String(raw.id || `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`),
    route_id: raw.route_id ? String(raw.route_id) : null,
    route_name: raw.route_name ? String(raw.route_name) : (raw.routeName ? String(raw.routeName) : undefined),
    infrastructure_id: raw.infrastructure_id ? String(raw.infrastructure_id) : null,
    type: (raw.type || raw.incident_type || 'landslide') as string,
    description: String(raw.description || ''),
    photo_url: raw.photo_url ? String(raw.photo_url) : undefined,
    lat: typeof raw.lat === 'number' ? raw.lat : 26.1445,
    lng: typeof raw.lng === 'number' ? raw.lng : 91.7362,
    severity: (raw.severity || 'high') as string,
    status: (raw.status || 'reported') as IncidentStatus,
    reported_by: raw.reported_by ? String(raw.reported_by) : (raw.reportedBy ? String(raw.reportedBy) : 'Field Observer'),
    created_at: createdAt,
    reported_at: raw.reported_at ? String(raw.reported_at) : createdAt,
    confirmed_at: raw.confirmed_at ? String(raw.confirmed_at) : null,
    confirmed_by: raw.confirmed_by ? String(raw.confirmed_by) : null,
    resolved_at: raw.resolved_at ? String(raw.resolved_at) : null,
    resolved_by: raw.resolved_by ? String(raw.resolved_by) : null,
  }
}

export function useRealtimeIncidents(): RealtimeIncidentsHook {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : (isSupabaseConfigured ? 'RECONNECTING' : 'OFFLINE')
  )
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Initial Incident Fetch from Supabase
  const loadIncidents = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setConnectionStatus('OFFLINE')
      setIsLoading(false)
      return
    }

    try {
      const { data, error: sbError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (sbError) throw sbError

      if (data && Array.isArray(data)) {
        const normalized = data.map(i => normalizeIncident(i))
        setIncidents(normalized)
        setLastSync(new Date())
        setConnectionStatus('LIVE')
      }
    } catch (err: unknown) {
      console.warn('Supabase incidents load fallback:', err)
      setError(err instanceof Error ? err.message : String(err))
      setConnectionStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'RECONNECTING')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 2. Real-time Subscription with Deduplication & Cleanup
  useEffect(() => {
    let ignore = false

    async function init() {
      if (!isSupabaseConfigured) {
        setConnectionStatus('OFFLINE')
        setIsLoading(false)
        return
      }

      try {
        const { data, error: sbError } = await supabase
          .from('incidents')
          .select('*')
          .order('created_at', { ascending: false })

        if (sbError) throw sbError

        if (!ignore && data && Array.isArray(data)) {
          const normalized = data.map(i => normalizeIncident(i))
          setIncidents(normalized)
          setLastSync(new Date())
          setConnectionStatus('LIVE')
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.warn('Supabase incidents load fallback:', err)
          setError(err instanceof Error ? err.message : String(err))
          setConnectionStatus(typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'RECONNECTING')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    init()

    if (!isSupabaseConfigured) return

    const channel = supabase
      .channel('public:incidents')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        payload => {
          if (payload.new && typeof payload.new === 'object') {
            const newIncident = normalizeIncident(payload.new as Partial<Incident>)
            setIncidents(prev => {
              // Avoid duplicate insertion
              const exists = prev.some(i => i.id === newIncident.id)
              if (exists) {
                return prev.map(i => (i.id === newIncident.id ? newIncident : i))
              }
              return [newIncident, ...prev]
            })
            setLastSync(new Date())
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'incidents' },
        payload => {
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            const updated = normalizeIncident(payload.new as Partial<Incident>)
            setIncidents(prev => prev.map(i => (i.id === updated.id ? updated : i)))
            setLastSync(new Date())
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'incidents' },
        payload => {
          if (payload.old && typeof payload.old === 'object' && 'id' in payload.old) {
            const deletedId = String(payload.old.id)
            setIncidents(prev => prev.filter(i => i.id !== deletedId))
            setLastSync(new Date())
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('LIVE')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('RECONNECTING')
        } else if (status === 'CLOSED') {
          setConnectionStatus('OFFLINE')
        }
      })

    // Browser online/offline event listeners
    const handleOnline = () => {
      setConnectionStatus('RECONNECTING')
      loadIncidents()
    }
    const handleOffline = () => {
      setConnectionStatus('OFFLINE')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      ignore = true
      supabase.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [loadIncidents])

  // 3. Derived Lifecycle Collections
  const activeIncidents = useMemo(
    () => incidents.filter(i => (i.status || 'reported') !== 'resolved'),
    [incidents]
  )

  const reportedIncidents = useMemo(
    () => incidents.filter(i => (i.status || 'reported') === 'reported'),
    [incidents]
  )

  const confirmedIncidents = useMemo(
    () => incidents.filter(i => i.status === 'confirmed'),
    [incidents]
  )

  const resolvedIncidents = useMemo(
    () => incidents.filter(i => i.status === 'resolved'),
    [incidents]
  )

  const predictedRisks = useMemo(
    () => incidents.filter(i => i.status === 'predicted'),
    [incidents]
  )

  // 4. Action Handlers (Report, Confirm, Resolve) with Strict State Machine Transitions
  const reportIncident = useCallback(
    async (incidentData: Omit<Incident, 'id' | 'created_at'>): Promise<{ data: Incident | null; error: Error | null }> => {
      const tempId = `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const nowIso = new Date().toISOString()
      const newObj: Incident = {
        ...incidentData,
        id: tempId,
        status: incidentData.status || 'reported',
        created_at: nowIso,
        reported_at: incidentData.reported_at || nowIso,
      }

      // Optimistic local update
      setIncidents(prev => [newObj, ...prev])
      setLastSync(new Date())

      if (!isSupabaseConfigured) {
        return { data: newObj, error: null }
      }

      try {
        const { data, error: insertError } = await supabase
          .from('incidents')
          .insert({
            route_id: newObj.route_id,
            route_name: newObj.route_name,
            infrastructure_id: newObj.infrastructure_id,
            type: newObj.type,
            severity: newObj.severity,
            status: newObj.status,
            description: newObj.description,
            reported_by: newObj.reported_by,
            lat: newObj.lat,
            lng: newObj.lng,
            photo_url: newObj.photo_url,
            reported_at: newObj.reported_at,
          })
          .select()
          .single()

        if (insertError) throw insertError

        if (data) {
          const confirmed = normalizeIncident(data)
          setIncidents(prev => prev.map(i => (i.id === tempId ? confirmed : i)))
          return { data: confirmed, error: null }
        }
        return { data: newObj, error: null }
      } catch (err: unknown) {
        console.warn('Supabase incident insert fallback to local state:', err)
        return { data: newObj, error: err instanceof Error ? err : new Error(String(err)) }
      }
    },
    []
  )

  const confirmIncident = useCallback(
    async (id: string, confirmedBy = 'Authorized Logistics Officer'): Promise<{ success: boolean; error: Error | null }> => {
      const target = incidents.find(i => i.id === id)
      if (target && target.status === 'resolved') {
        return { success: false, error: new Error('Cannot confirm an already resolved incident') }
      }

      const confirmedAt = new Date().toISOString()
      setIncidents(prev =>
        prev.map(i =>
          i.id === id
            ? {
                ...i,
                status: 'confirmed' as IncidentStatus,
                confirmed_at: confirmedAt,
                confirmed_by: confirmedBy,
              }
            : i
        )
      )
      setLastSync(new Date())

      if (!isSupabaseConfigured) return { success: true, error: null }

      try {
        const { error: updateError } = await supabase
          .from('incidents')
          .update({
            status: 'confirmed',
            confirmed_at: confirmedAt,
            confirmed_by: confirmedBy,
          })
          .eq('id', id)

        if (updateError) throw updateError
        return { success: true, error: null }
      } catch (err: unknown) {
        console.warn('Supabase confirmIncident error:', err)
        return { success: false, error: err instanceof Error ? err : new Error(String(err)) }
      }
    },
    [incidents]
  )

  const resolveIncident = useCallback(
    async (id: string, resolvedBy = 'Emergency Operations Officer'): Promise<{ success: boolean; error: Error | null }> => {
      const resolvedAt = new Date().toISOString()
      setIncidents(prev =>
        prev.map(i =>
          i.id === id
            ? {
                ...i,
                status: 'resolved' as IncidentStatus,
                resolved_at: resolvedAt,
                resolved_by: resolvedBy,
              }
            : i
        )
      )
      setLastSync(new Date())

      if (!isSupabaseConfigured) return { success: true, error: null }

      try {
        const { error: updateError } = await supabase
          .from('incidents')
          .update({
            status: 'resolved',
            resolved_at: resolvedAt,
            resolved_by: resolvedBy,
          })
          .eq('id', id)

        if (updateError) throw updateError
        return { success: true, error: null }
      } catch (err: unknown) {
        console.warn('Supabase resolveIncident error:', err)
        return { success: false, error: err instanceof Error ? err : new Error(String(err)) }
      }
    },
    []
  )

  return {
    incidents,
    activeIncidents,
    reportedIncidents,
    confirmedIncidents,
    resolvedIncidents,
    predictedRisks,
    connectionStatus,
    lastSync,
    isLoading,
    error,
    reportIncident,
    confirmIncident,
    resolveIncident,
    refreshIncidents: loadIncidents,
  }
}
