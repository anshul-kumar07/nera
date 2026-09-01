'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import {
  Brain,
  CloudRain,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Thermometer,
  Wind,
  Droplets,
  Mountain,
  Activity,
  Radio,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  MapPin,
} from 'lucide-react'
import { NER_DISTRICTS, NER_SOIL_SLOPE_SENSORS } from '@/lib/data'
import { useLanguage } from '@/lib/LanguageContext'

const emptySubscribe = () => () => {}
const getMountedSnapshot = () => true
const getServerMountedSnapshot = () => false

interface DisruptionPrediction {
  risk_level: string
  high_risk_routes: string[]
  predicted_disruptions: string[]
  recommended_actions: string[]
  confidence_percent: number
  soil_moisture_saturation?: number
  slope_gradient_deg?: number
  choke_point_probability?: number
}

interface LiveWeather {
  location: string
  state: string
  temperature: number
  precipitation: number
  rain: number
  humidity: number
  windSpeed: number
  weatherCondition: string
  landslideRiskScore: string
}

export default function PredictiveDisruptionsPanel() {
  const { t } = useLanguage()
  const isMounted = useSyncExternalStore(emptySubscribe, getMountedSnapshot, getServerMountedSnapshot)
  const [selectedDistrict, setSelectedDistrict] = useState('Shillong (East Khasi)')
  const [weatherData, setWeatherData] = useState<LiveWeather | null>(null)
  const [, setWeatherLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [copiedSMS, setCopiedSMS] = useState(false)
  const [justCalculated, setJustCalculated] = useState(false)

  // Find corresponding slope sensor if available
  const activeSensor = (NER_SOIL_SLOPE_SENSORS || []).find(s => 
    selectedDistrict.toLowerCase().includes(s.district.toLowerCase()) || 
    s.district.toLowerCase().includes(selectedDistrict.toLowerCase().split(' ')[0])
  ) || (NER_SOIL_SLOPE_SENSORS || [])[0] || {
    id: 'sensor-fallback',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    highway: 'NH-6 Guwahati–Shillong Corridor',
    soil_moisture_percent: 94,
    slope_gradient_deg: 52,
    rainfall_24h_mm: 142,
    pore_pressure_kpa: 185,
    failure_probability_percent: 91,
    risk_status: 'Critical Alert',
  }

  const [prediction, setPrediction] = useState<DisruptionPrediction | null>({
    risk_level: 'high',
    high_risk_routes: ['NH-6 Guwahati–Shillong Highway', 'NH-37 Silchar–Jiribam–Imphal'],
    predicted_disruptions: [
      'High probability of mudslides along NH-6 near Ri-Bhoi ghats (Soil moisture 94%)',
      'Pore pressure spike (185 kPa) indicates imminent slope failure within 18h',
    ],
    recommended_actions: [
      'Pre-stage heavy excavators near Ratacherra bottleneck',
      'Divert freight convoys through alternate high-elevation bypasses (NH-106)',
    ],
    confidence_percent: 89,
    soil_moisture_saturation: 94,
    slope_gradient_deg: 52,
    choke_point_probability: 91,
  })

  // Fetch live meteorological data when district changes
  useEffect(() => {
    let isCancelled = false
    async function loadWeather() {
      setWeatherLoading(true)
      try {
        const res = await fetch(`/api/weather?location=${encodeURIComponent(selectedDistrict)}`)
        if (res.ok) {
          const data = await res.json()
          if (!isCancelled && !data.error) {
            setWeatherData(data)
          }
        }
      } catch (err) {
        console.warn('Weather API fallback to sensor data:', err)
      } finally {
        if (!isCancelled) setWeatherLoading(false)
      }
    }
    loadWeather()
    return () => { isCancelled = true }
  }, [selectedDistrict])

  // Call predictive disruption API
  const runPrediction = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfall_24h: weatherData?.precipitation ?? activeSensor.rainfall_24h_mm,
          humidity: weatherData?.humidity ?? 85,
          wind_speed: weatherData?.windSpeed ?? 18,
          temperature: weatherData?.temperature ?? 24,
          weather_condition: weatherData?.weatherCondition ?? 'heavy_monsoon',
          soil_moisture_percent: activeSensor.soil_moisture_percent,
          slope_gradient_deg: activeSensor.slope_gradient_deg,
          pore_pressure_kpa: activeSensor.pore_pressure_kpa,
          district: selectedDistrict,
          highway: activeSensor.highway,
        }),
      })
      const data = await res.json()
      if (data && !data.error) {
        setPrediction(data)
        setJustCalculated(true)
        setTimeout(() => setJustCalculated(false), 3500)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const smsBroadcastText = `[NER-ALERT: ${selectedDistrict.toUpperCase()}] HIGH RISK: Slope failure probability ${activeSensor.failure_probability_percent}% on ${activeSensor.highway}. Avoid night transit. Freight rerouted via alternate bypass.`

  const copySMS = () => {
    navigator.clipboard.writeText(smsBroadcastText)
    setCopiedSMS(true)
    setTimeout(() => setCopiedSMS(false), 2000)
  }

  const riskBadge: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    high: 'bg-red-100 text-red-800 border-red-300',
    critical: 'bg-purple-100 text-purple-800 border-purple-300',
  }

  if (!isMounted) {
    return (
      <div className="gov-card p-5 h-64 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <div className="w-5 h-5 border-2 border-[#213d77] border-t-transparent rounded-full animate-spin" />
          <span>INITIALIZING AI DISRUPTION PREDICTOR...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="gov-card p-4 sm:p-5 space-y-4" suppressHydrationWarning>
      {/* ── Top Header Bar ── */}
      <div className="space-y-3 border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-[#213d77] flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5 text-[#fb792b]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-[#213d77] tracking-tight flex items-center gap-1.5 flex-wrap">
                <span>{t('predictor_title')}</span>
              </h2>
              <p className="text-[10.5px] text-slate-500">
                Pre-emptively predicts slope failure & corridor choke points
              </p>
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-wider bg-blue-50 border border-blue-200 text-[#213d77] px-2 py-0.5 rounded font-mono font-bold shrink-0">
            SOIL SENSORS + AI
          </span>
        </div>

        {/* Action Controls: District Selector & Prominent AI Recalculate Button */}
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-300 rounded px-3 py-2 min-h-[44px] min-w-0">
            <MapPin className="w-4 h-4 text-[#fb792b] shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none cursor-pointer w-full truncate"
            >
              {(NER_DISTRICTS || []).map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}, {d.state}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={runPrediction}
            disabled={loading}
            suppressHydrationWarning
            className={`flex items-center justify-center gap-2 font-bold text-xs sm:text-sm px-4 py-2.5 min-h-[44px] rounded transition-all shadow-xs cursor-pointer shrink-0 ${
              loading
                ? 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-80'
                : justCalculated
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'btn-irctc-primary'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('analyzing_sensors')}</span>
              </>
            ) : justCalculated ? (
              <>
                <Check className="w-4 h-4" />
                <span>Synced</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>{t('recalculate_risk')}</span>
                <RefreshCw className="w-3.5 h-3.5 opacity-70" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 4 Live Geological & Slope Sensor Gauges (Clean 2x2 Grid) ── */}
      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <Droplets className="w-4 h-4 text-[#213d77] shrink-0" />
              <span>{t('soil_saturation')}</span>
            </span>
            <span className="font-bold text-[#213d77] text-xs sm:text-sm font-mono">{activeSensor.soil_moisture_percent}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#213d77] h-full rounded-full transition-all" style={{ width: `${activeSensor.soil_moisture_percent}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-medium">Critical &gt;85%</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <Mountain className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('slope_gradient')}</span>
            </span>
            <span className="font-bold text-amber-700 text-xs sm:text-sm font-mono">{activeSensor.slope_gradient_deg}°</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${(activeSensor.slope_gradient_deg / 90) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-medium">Shear zone &gt;45°</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <CloudRain className="w-4 h-4 text-[#213d77] shrink-0" />
              <span>{t('rainfall_24h')}</span>
            </span>
            <span className="font-bold text-[#213d77] text-xs sm:text-sm font-mono">{activeSensor.rainfall_24h_mm} mm</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#213d77] h-full rounded-full transition-all" style={{ width: `${Math.min(100, (activeSensor.rainfall_24h_mm / 150) * 100)}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-medium">{activeSensor.pore_pressure_kpa} kPa pore</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded p-3 space-y-1.5">
          <div className="flex items-center justify-between text-red-900">
            <span className="flex items-center gap-1.5 text-xs font-bold">
              <Activity className="w-4 h-4 text-red-600 shrink-0" />
              <span>{t('collapse_risk')}</span>
            </span>
            <span className="font-bold text-red-700 text-xs sm:text-sm font-mono">{activeSensor.failure_probability_percent}%</span>
          </div>
          <div className="w-full bg-red-200 h-2 rounded-full overflow-hidden">
            <div className="bg-red-600 h-full rounded-full transition-all" style={{ width: `${activeSensor.failure_probability_percent}%` }} />
          </div>
          <p className="text-xs text-red-800 font-bold uppercase">{activeSensor.risk_status}</p>
        </div>
      </div>

      {/* ── Live Meteorological Sensor Strip ── */}
      {weatherData && (
        <div className="bg-slate-50 border border-slate-200 rounded px-3.5 py-2.5 flex items-center justify-between flex-wrap gap-2.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#fb792b] animate-pulse" />
            <span className="text-slate-900 font-bold text-xs sm:text-[13px]">{weatherData.location}:</span>
            <span className="text-[#213d77] font-semibold text-xs sm:text-[13px]">{weatherData.weatherCondition}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-700 text-xs sm:text-[13px]">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              {weatherData.temperature}°C
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-[#213d77]" />
              {weatherData.humidity}%
            </span>
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-slate-500" />
              {weatherData.windSpeed} km/h
            </span>
          </div>
        </div>
      )}

      {/* ── AI Disruption Prediction Cards ── */}
      {prediction && (
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Summary Score */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase">{t('threat_level')}</span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded border font-mono ${riskBadge[prediction.risk_level] || riskBadge.high}`}>
                  {prediction.risk_level}
                </span>
                <span className="font-black text-slate-900 text-base">
                  {prediction.confidence_percent}% <span className="text-xs font-normal text-slate-500">Confidence</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('vulnerable_corridors')}</span>
              <div className="flex flex-wrap justify-end gap-1 mt-0.5">
                {(prediction.high_risk_routes || []).map((route, i) => (
                  <span key={i} className="text-[9.5px] bg-red-50 text-red-800 border border-red-200 px-1.5 py-0.2 rounded font-bold">
                    {route.split(' ')[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5">
            <span className="text-[11px] text-[#213d77] font-black uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {t('proactive_action_plan')}
            </span>
            <ul className="space-y-1 text-[11px] text-slate-700">
              {(prediction.recommended_actions || []).slice(0, 2).map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Offline Low-Bandwidth SMS Broadcast Gateway Simulator ── */}
      <div className="bg-slate-50 border border-slate-200 rounded p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <span className="text-[10.5px] font-bold text-slate-800 truncate block">
              {t('sms_simulator_title')}
            </span>
            <p className="text-[10px] text-slate-500 font-mono truncate">{smsBroadcastText}</p>
          </div>
        </div>

        <button
          onClick={copySMS}
          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-[10.5px] font-bold rounded border border-slate-300 transition-colors shrink-0 cursor-pointer"
        >
          {copiedSMS ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
          <span>{copiedSMS ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}
