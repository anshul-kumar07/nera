'use client'

import { useState, useRef } from 'react'
import { MapPin, Camera, Upload, CheckCircle, Loader2, Globe, ArrowRight, X, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { NER_DISTRICTS, INITIAL_NER_ROUTES } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useLanguage } from '@/lib/LanguageContext'
import { saveOfflineReport } from '@/lib/offline-queue'
import { useOfflineSync } from '@/hooks/useOfflineSync'

const INCIDENT_TYPES = [
  { value: 'landslide', label: '🏔️ Landslide / Mudslide' },
  { value: 'flood', label: '🌊 Flood / River Inundation' },
  { value: 'road_damage', label: '🛣️ Road / Bridge Damage' },
  { value: 'bridge_failure', label: '🌉 Bridge Washout / Limit' },
  { value: 'congestion', label: '🚗 Heavy Bottleneck / Blockade' },
]

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'border-green-600 bg-green-900/20 text-green-300' },
  { value: 'medium', label: 'Medium', color: 'border-amber-600 bg-amber-900/20 text-amber-300' },
  { value: 'high', label: 'High', color: 'border-red-600 bg-red-900/20 text-red-300' },
  { value: 'critical', label: 'Critical', color: 'border-purple-600 bg-purple-900/20 text-purple-300' },
]

interface MultilingualAlert {
  english: string
  hindi: string
  assamese: string
}

export default function ReportPage() {
  const { language, t } = useLanguage()
  const { isOnline, isSyncing, pendingCount, triggerSync } = useOfflineSync()
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locating, setLocating] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [offlineSaved, setOfflineSaved] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [severity, setSeverity] = useState('high')
  const [incidentType, setIncidentType] = useState('landslide')
  const [district] = useState('Shillong (East Khasi)')
  const [affectedRoute, setAffectedRoute] = useState('NH-6 Guwahati–Jorabat–Shillong Expressway')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [generatedAlert, setGeneratedAlert] = useState<MultilingualAlert | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setPhotoUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(parseFloat(pos.coords.latitude.toFixed(6)))
        setLng(parseFloat(pos.coords.longitude.toFixed(6)))
        setLocating(false)
      },
      () => {
        const found = NER_DISTRICTS.find(d => d.name === district)
        setLat(found ? found.lat : 26.1445)
        setLng(found ? found.lng : 91.7362)
        setLocating(false)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const clientReportId = `rep-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    // Deterministic multilingual fallback messages
    let multiAlert: MultilingualAlert = {
      english: `Emergency Alert (${severity.toUpperCase()}): ${incidentType.replace('_', ' ')} reported along ${affectedRoute || district}. ${description}`,
      hindi: `आपातकालीन सूचना (${severity}): ${affectedRoute || district} पर ${incidentType} की सूचना प्राप्त हुई है। ${description}`,
      assamese: `জৰুৰী সতৰ্কবাৰ্তা (${severity}): ${affectedRoute || district}ত ${incidentType}ৰ ঘটনা পোহৰলৈ আহিছে। ${description}`
    }

    // If offline, immediately queue into IndexedDB
    if (!navigator.onLine) {
      try {
        await saveOfflineReport({
          client_report_id: clientReportId,
          type: incidentType,
          severity,
          description: `${description} | Route: ${affectedRoute}`,
          lat: lat ?? 25.5788,
          lng: lng ?? 91.8933,
          route_name: affectedRoute,
          district,
          photo_base64: photoPreview,
          photo_name: photoFile?.name,
          created_at: new Date().toISOString(),
        })

        setGeneratedAlert(multiAlert)
        setOfflineSaved(true)
        setSubmitted(true)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to save offline report')
      } finally {
        setSubmitting(false)
      }
      return
    }

    // Online submission workflow
    try {
      try {
        const aiRes = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'alert',
            incidentType,
            location: `${affectedRoute} (${district})`,
            severity,
            details: description,
          })
        })
        const aiData = await aiRes.json()
        if (aiData && aiData.english) {
          multiAlert = aiData
        }
      } catch (aiErr) {
        console.warn('AI alert generation fallback used', aiErr)
      }

      setGeneratedAlert(multiAlert)

      let uploadedPhotoUrl: string | null = null
      if (photoFile) {
        try {
          const ext = photoFile.name.split('.').pop() || 'jpg'
          const fileName = `incident-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('incident-photos')
            .upload(fileName, photoFile, { contentType: photoFile.type, upsert: false })

          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('incident-photos')
              .getPublicUrl(uploadData.path)
            uploadedPhotoUrl = publicUrl
            setPhotoUrl(publicUrl)
          }
        } catch (photoErr) {
          console.warn('Photo upload skipped:', photoErr)
        }
      }

      // Save to Supabase incidents table with status 'reported' (Phase 3 operational state)
      const { error: dbError } = await supabase.from('incidents').insert({
        type: incidentType,
        description: `${description} | Route: ${affectedRoute}`,
        lat: lat ?? 25.5788,
        lng: lng ?? 91.8933,
        severity,
        route_name: affectedRoute,
        status: 'reported',
        reported_by: 'Field Patrol Officer',
        reported_at: new Date().toISOString(),
        ...(uploadedPhotoUrl ? { photo_url: uploadedPhotoUrl } : {}),
      })

      if (dbError) {
        throw dbError
      }

      setSubmitted(true)
    } catch (err: unknown) {
      console.warn('Online submission failed, falling back to IndexedDB offline queue:', err)
      try {
        await saveOfflineReport({
          client_report_id: clientReportId,
          type: incidentType,
          severity,
          description: `${description} | Route: ${affectedRoute}`,
          lat: lat ?? 25.5788,
          lng: lng ?? 91.8933,
          route_name: affectedRoute,
          district,
          photo_base64: photoPreview,
          photo_name: photoFile?.name,
          created_at: new Date().toISOString(),
        })
        setGeneratedAlert(multiAlert)
        setOfflineSaved(true)
        setSubmitted(true)
      } catch (offlineErr: unknown) {
        setError(offlineErr instanceof Error ? offlineErr.message : 'Submission error')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && generatedAlert) {
    return (
      <div className="min-h-screen p-6 text-white max-w-2xl mx-auto flex flex-col justify-center">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${offlineSaved ? 'bg-amber-900/40 border-amber-700' : 'bg-green-900/40 border-green-700'} border rounded-xl flex items-center justify-center`}>
              {offlineSaved ? <WifiOff className="w-6 h-6 text-amber-400" /> : <CheckCircle className="w-6 h-6 text-green-400" />}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {offlineSaved ? 'REPORT SAVED OFFLINE' : 'Field Incident Reported!'}
              </h2>
              <p className="text-xs text-gray-400">
                {offlineSaved
                  ? 'Queued in IndexedDB. Will automatically sync to Supabase when network is restored.'
                  : `Incident logged as REPORTED. Awaiting operational verification before road blockage.`}
              </p>
            </div>
          </div>

          {offlineSaved && (
            <div className="bg-amber-950/60 border border-amber-800/80 rounded-xl p-3 text-xs text-amber-200 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-300">
                <span>📦 PENDING SYNCHRONIZATION: 1</span>
                <span>STATUS: QUEUED</span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                No data lost. Once network connectivity is restored, this report will automatically sync to Supabase and propagate to the live map.
              </p>
            </div>
          )}

          {/* Multilingual Broadcast Banner */}
          <div className="bg-gray-950 border border-blue-900/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Multilingual Emergency Dispatch Advisory
              </span>
              <span className="text-[10px] bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">
                Standard Operational Format
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-gray-400 font-semibold uppercase text-[10px] block">🇬🇧 English Advisory:</span>
                <p className="text-gray-200 mt-0.5 leading-relaxed">{generatedAlert.english}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold uppercase text-[10px] block">🇮🇳 Hindi (हिंदी):</span>
                <p className="text-gray-200 mt-0.5 leading-relaxed">{generatedAlert.hindi}</p>
              </div>

              <div>
                <span className="text-gray-400 font-semibold uppercase text-[10px] block">🏔️ Assamese (অসমীয়া):</span>
                <p className="text-gray-200 mt-0.5 leading-relaxed">{generatedAlert.assamese}</p>
              </div>
            </div>
          </div>

          {/* Uploaded Photo Evidence */}
          {photoPreview && (
            <div className="rounded-xl overflow-hidden border border-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoPreview} alt="Incident evidence preview" className="w-full h-36 object-cover" />
              <div className="bg-gray-950 px-3 py-1.5 flex items-center gap-1.5">
                <span className="text-[10px] text-green-400 font-medium">
                  📸 Photo evidence {offlineSaved ? 'cached in IndexedDB (Pending Upload)' : photoUrl ? 'uploaded to cloud storage' : 'attached'}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/map"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              View GIS Map <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setSubmitted(false)
                setOfflineSaved(false)
                setDescription('')
                clearPhoto()
              }}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-slate-800 font-sans">
      {/* ── Header & Connectivity Status ── */}
      <div className="gov-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#213d77] tracking-tight">
            {t('report_page_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('report_page_desc')}
          </p>
        </div>

        {/* Network State & Offline Queue Indicator */}
        <div className="flex items-center gap-2.5" suppressHydrationWarning>
          <div
            suppressHydrationWarning
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs sm:text-sm font-bold border min-h-[38px] ${
              isOnline ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />}
            <span>{isOnline ? t('system_online') : t('system_offline')}</span>
          </div>

          {pendingCount > 0 && (
            <button
              onClick={triggerSync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-[#213d77] px-3 py-1.5 rounded text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50 min-h-[38px]"
              title="Click to sync pending reports"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>PENDING SYNC: {pendingCount}</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="gov-card p-6 sm:p-7 shadow-xs space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm p-3.5 rounded font-semibold">
            {error}
          </div>
        )}

        {/* Incident Type */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
            {t('incident_type_label')} *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { value: 'landslide', labelKey: 'hazard_landslide' as const },
              { value: 'flood', labelKey: 'hazard_flood' as const },
              { value: 'road_damage', labelKey: 'hazard_road_damage' as const },
              { value: 'bridge_failure', labelKey: 'hazard_bridge_failure' as const },
              { value: 'congestion', labelKey: 'hazard_congestion' as const },
            ].map(typeItem => (
              <button
                key={typeItem.value}
                type="button"
                onClick={() => setIncidentType(typeItem.value)}
                className={`p-3 rounded border text-left text-xs sm:text-sm font-semibold transition-all flex items-center justify-between min-h-[44px] cursor-pointer ${
                  incidentType === typeItem.value
                    ? 'border-[#fb792b] bg-amber-50/70 text-[#213d77] font-bold shadow-xs'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400 text-slate-700'
                }`}
              >
                <span>{t(typeItem.labelKey)}</span>
                {incidentType === typeItem.value && <span className="text-[#fb792b] font-bold text-sm">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
            {t('severity_label')} *
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { value: 'low', labelKey: 'sev_low' as const },
              { value: 'medium', labelKey: 'sev_medium' as const },
              { value: 'high', labelKey: 'sev_high' as const },
              { value: 'critical', labelKey: 'sev_critical' as const },
            ].map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSeverity(s.value)}
                className={`py-2.5 px-2 rounded border text-center text-xs sm:text-sm font-bold capitalize transition-all min-h-[44px] cursor-pointer ${
                  severity === s.value
                    ? 'border-[#fb792b] bg-[#fb792b] text-white shadow-xs'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400'
                }`}
              >
                {t(s.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Corridor / Highway */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
            {t('impacted_highway')} *
          </label>
          <select
            value={affectedRoute}
            onChange={e => setAffectedRoute(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:border-[#fb792b] cursor-pointer"
          >
            {INITIAL_NER_ROUTES.map(r => (
              <option key={r.id} value={r.name}>
                {r.name} ({r.state})
              </option>
            ))}
          </select>
        </div>

        {/* GPS Coordinates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
              {t('gps_tag')}
            </label>
            <button
              type="button"
              onClick={getLocation}
              disabled={locating}
              className="text-xs sm:text-sm text-[#213d77] hover:text-[#fb792b] flex items-center gap-1.5 font-bold cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#fb792b]" />
              {locating ? t('capturing_gps') : t('auto_gps_detect')}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <input
              type="number"
              step="0.0001"
              value={lat ?? ''}
              onChange={e => setLat(parseFloat(e.target.value))}
              placeholder="Latitude (e.g. 25.5788)"
              className="bg-slate-50 border border-slate-300 rounded px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:border-[#fb792b]"
            />
            <input
              type="number"
              step="0.0001"
              value={lng ?? ''}
              onChange={e => setLng(parseFloat(e.target.value))}
              placeholder="Longitude (e.g. 91.8933)"
              className="bg-slate-50 border border-slate-300 rounded px-3.5 py-2.5 min-h-[44px] text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:border-[#fb792b]"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
            {t('observation_details')} *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={t('placeholder_description')}
            className="w-full bg-slate-50 border border-slate-300 rounded px-3.5 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#fb792b] resize-none"
          />
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 block">
            {t('photo_evidence')}
          </label>
          <div className="border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 rounded p-4 text-center">
            {photoPreview ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="max-h-48 rounded object-cover" />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer space-y-1.5 py-3"
              >
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">{t('photo_upload_hint')}</p>
                <p className="text-xs text-slate-500">{t('photo_format_hint')}</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-irctc-primary text-xs sm:text-sm py-3.5 min-h-[44px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isOnline ? 'Broadcasting Report...' : 'Saving to IndexedDB...'}</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>
                {isOnline ? t('broadcast_btn') : `${t('system_offline')} (${t('btn_save_changes')})`}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
