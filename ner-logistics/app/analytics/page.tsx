'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Radio, BarChart3 } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts'

const STATUS_COLORS_CHART: Record<string, string> = {
  open: '#16a34a',
  at_risk: '#d97706',
  blocked: '#dc2626',
  damaged: '#213d77',
}

const CARGO_COLORS: Record<string, string> = {
  medicine: '#213d77',
  food: '#16a34a',
  fuel: '#ea580c',
  construction: '#64748b',
  agricultural: '#0d9488',
}

import { INITIAL_NER_ROUTES, DEMO_VEHICLES, DEMO_INCIDENTS } from '@/lib/data'
import { ActiveRoute } from '@/lib/routing-algorithm'
import { VehicleData } from '@/components/VehicleCard'

interface IncidentSummary {
  id: string
  type?: string
  incident_type?: string
  severity: string
  description: string
}

interface CargoCountItem {
  name: string
  value: number
}

export default function AnalyticsPage() {
  const { t } = useLanguage()
  const [routes, setRoutes] = useState<ActiveRoute[]>(INITIAL_NER_ROUTES)
  const [vehicles, setVehicles] = useState<VehicleData[]>(DEMO_VEHICLES)
  const [incidents, setIncidents] = useState<IncidentSummary[]>(DEMO_INCIDENTS as unknown as IncidentSummary[])
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    async function fetchAll() {
      try {
        const [r, v, i] = await Promise.all([
          supabase.from('routes').select('*'),
          supabase.from('vehicles').select('*'),
          supabase.from('incidents').select('*'),
        ])
        if (r.data && r.data.length > 0) setRoutes(r.data)
        if (v.data && v.data.length > 0) setVehicles(v.data)
        if (i.data && i.data.length > 0) setIncidents(i.data)
        setLastUpdated(new Date())
      } catch (e) {
        console.warn('Using local telemetry for analytics:', e)
      }
    }
    fetchAll()

    const routesCh = supabase.channel('analytics-routes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'routes' }, fetchAll)
      .subscribe()
    const vehiclesCh = supabase.channel('analytics-vehicles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchAll)
      .subscribe()
    const incidentsCh = supabase.channel('analytics-incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, fetchAll)
      .subscribe()

    return () => {
      supabase.removeChannel(routesCh)
      supabase.removeChannel(vehiclesCh)
      supabase.removeChannel(incidentsCh)
    }
  }, [])

  const routeStatusData = ['open', 'at_risk', 'blocked', 'damaged'].map(status => ({
    name: status.replace('_', ' '),
    count: routes.filter(r => r.status === status).length,
    fill: STATUS_COLORS_CHART[status],
  })).filter(d => d.count > 0)

  const vehicleStatusData = ['moving', 'delayed', 'stopped', 'delivered'].map(status => ({
    name: status,
    count: vehicles.filter(v => v.status === status).length,
  })).filter(d => d.count > 0)

  const incidentTypeData = ['landslide', 'flood', 'road_damage', 'bridge_failure', 'congestion'].map(type => ({
    name: type.replace('_', ' '),
    count: incidents.filter(i => (i.type || i.incident_type) === type).length,
  })).filter(d => d.count > 0)

  const cargoData: CargoCountItem[] = Object.entries(
    vehicles.reduce<Record<string, number>>((acc, v) => {
      acc[v.cargo_type] = (acc[v.cargo_type] || 0) + 1
      return acc
    }, {})
  ).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-5 text-slate-800 font-sans">
      {/* ── Top Header ── */}
      <div className="gov-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#213d77] rounded flex items-center justify-center text-white shrink-0 shadow-xs border border-[#1b3162]">
              <BarChart3 className="w-5 h-5 text-[#fb792b]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#213d77] tracking-tight">{t('nav_analytics')}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{t('analytics_desc')}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#213d77] bg-slate-50 border border-slate-200 rounded px-2.5 py-1 font-bold font-mono">
          <Radio className="w-3.5 h-3.5 text-[#fb792b] animate-pulse" />
          <span>{t('live_data')}</span>
          <span className="text-slate-400 ml-1" suppressHydrationWarning>{lastUpdated.toLocaleTimeString('en-IN')}</span>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: t('total_routes'), value: routes.length, color: 'text-[#213d77]' },
          { label: t('open_corridors'), value: routes.filter(r => r.status === 'open').length, color: 'text-emerald-700' },
          { label: t('active_fleet'), value: vehicles.length, color: 'text-[#fb792b]' },
          { label: t('total_reports'), value: incidents.length, color: 'text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="gov-card p-3.5 text-center">
            <p className={`text-3xl font-black font-mono ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Status Chart */}
        <div className="gov-card p-5 sm:p-6">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#213d77] mb-4">{t('route_status_chart')}</h2>
          {routeStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={routeStatusData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {routeStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-xs text-center py-12">No route data available</p>
          )}
        </div>

        {/* Vehicle Status Chart */}
        <div className="gov-card p-5 sm:p-6">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#213d77] mb-4">{t('vehicle_status_chart')}</h2>
          {vehicleStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={vehicleStatusData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                <Bar dataKey="count" fill="#213d77" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-xs text-center py-12">No vehicle data available</p>
          )}
        </div>

        {/* Incident Types Breakdown */}
        <div className="gov-card p-5 sm:p-6">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#213d77] mb-4">{t('incidents_chart')}</h2>
          {incidentTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={incidentTypeData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} />
                <YAxis tick={{ fill: '#334155', fontSize: 13, fontWeight: 600 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                <Bar dataKey="count" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-xs text-center py-12">No incidents reported</p>
          )}
        </div>

        {/* Cargo Distribution Pie */}
        <div className="gov-card p-5 sm:p-6">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-[#213d77] mb-4">{t('cargo_chart')}</h2>
          {cargoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={cargoData}
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  innerRadius={45}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {cargoData.map((entry) => (
                    <Cell key={entry.name} fill={CARGO_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#1e293b', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-400 text-xs text-center py-12">No cargo data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
