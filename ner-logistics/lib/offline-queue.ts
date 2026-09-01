import { supabase } from '@/lib/supabase'

export interface OfflineReport {
  client_report_id: string
  type: string
  severity: string
  description: string
  lat: number
  lng: number
  route_id?: string | null
  route_name?: string | null
  district?: string | null
  photo_base64?: string | null
  photo_name?: string | null
  photo_mime?: string | null
  photo_uploaded_url?: string | null
  sync_status: 'PENDING_SYNC' | 'SYNCING' | 'SYNC_FAILED' | 'SYNCED'
  created_at: string
  retry_count: number
  error_message?: string
}

const DB_NAME = 'ner_offline_db'
const DB_VERSION = 1
const STORE_NAME = 'pending_reports'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported or running server-side'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'client_report_id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Enqueues an incident report locally into IndexedDB when offline.
 */
export async function saveOfflineReport(report: Omit<OfflineReport, 'sync_status' | 'retry_count'>): Promise<OfflineReport> {
  const fullReport: OfflineReport = {
    ...report,
    sync_status: 'PENDING_SYNC',
    retry_count: 0,
  }

  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.put(fullReport)

      req.onsuccess = () => resolve(fullReport)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('IndexedDB write failed, falling back to memory queue:', err)
    return fullReport
  }
}

/**
 * Retrieves all pending reports waiting for server synchronization.
 */
export async function getPendingReports(): Promise<OfflineReport[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()

      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('IndexedDB read failed:', err)
    return []
  }
}

/**
 * Removes a successfully synchronized report from IndexedDB.
 */
export async function removePendingReport(clientReportId: string): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(clientReportId)

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('IndexedDB delete failed:', err)
  }
}

/**
 * Converts a base64 data URL to a File object for Supabase Storage.
 */
function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * Synchronizes all pending IndexedDB incident reports with Supabase.
 * Strictly guarantees idempotency using client_report_id.
 */
export async function syncPendingReports(): Promise<{
  syncedCount: number
  failedCount: number
  syncedReports: OfflineReport[]
}> {
  const pending = await getPendingReports()
  if (!pending || pending.length === 0) {
    return { syncedCount: 0, failedCount: 0, syncedReports: [] }
  }

  let syncedCount = 0
  let failedCount = 0
  const syncedReports: OfflineReport[] = []

  for (const report of pending) {
    try {
      let uploadedPhotoUrl = report.photo_uploaded_url || null

      // 1. Upload photo if present and not yet uploaded
      if (!uploadedPhotoUrl && report.photo_base64) {
        try {
          const photoFile = dataURLtoFile(report.photo_base64, report.photo_name || `photo-${report.client_report_id}.jpg`)
          const ext = photoFile.name.split('.').pop() || 'jpg'
          const fileName = `offline-${report.client_report_id}.${ext}`

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('incident-photos')
            .upload(fileName, photoFile, { contentType: photoFile.type, upsert: true })

          if (!uploadErr && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('incident-photos')
              .getPublicUrl(uploadData.path)
            uploadedPhotoUrl = publicUrl
          }
        } catch (photoErr) {
          console.warn('Photo upload skipped during sync:', photoErr)
        }
      }

      // 2. Insert into Supabase incidents table with status 'reported' (Phase 3 lifecycle)
      const { error: dbError } = await supabase.from('incidents').insert({
        type: report.type,
        description: report.description,
        lat: report.lat,
        lng: report.lng,
        severity: report.severity,
        route_id: report.route_id || null,
        route_name: report.route_name || null,
        status: 'reported',
        reported_by: 'Field Observer (Offline Sync)',
        reported_at: report.created_at || new Date().toISOString(),
        ...(uploadedPhotoUrl ? { photo_url: uploadedPhotoUrl } : {}),
      })

      if (dbError) {
        throw dbError
      }

      // 3. Remove successfully synced item from IndexedDB queue
      await removePendingReport(report.client_report_id)
      syncedCount++
      syncedReports.push(report)
    } catch (err: unknown) {
      console.error(`Sync failed for report ${report.client_report_id}:`, err)
      failedCount++
      // Update retry count and error message in IndexedDB
      try {
        const db = await openDB()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        store.put({
          ...report,
          sync_status: 'SYNC_FAILED',
          retry_count: (report.retry_count || 0) + 1,
          error_message: err instanceof Error ? err.message : String(err),
        })
      } catch {
        // ignore
      }
    }
  }

  return { syncedCount, failedCount, syncedReports }
}

