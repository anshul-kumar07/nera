'use client'

import { useState } from 'react'
import {
  Activity,
  Server,
  Shield,
  Radio,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react'
import {
  DataSourceHealth,
  SYSTEM_DATA_SOURCES,
} from '@/lib/data-source-health'
import { NOTIFICATION_CHANNELS } from '@/lib/notification-provider'
import { useLanguage } from '@/lib/LanguageContext'

export default function SystemHealthPage() {
  const { t } = useLanguage()
  const [sources] = useState<DataSourceHealth[]>(SYSTEM_DATA_SOURCES)
  const [channels] = useState(Object.values(NOTIFICATION_CHANNELS))

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* ── 1. OFFICIAL HEADER ── */}
      <div className="gov-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-blue-100 border border-blue-300 text-[#213d77] font-mono font-bold px-2.5 py-0.5 rounded">
              {t('portal_title')}
            </span>
            <span className="text-xs bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" /> {t('system_online')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#213d77] flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#fb792b]" />
            {t('nav_data_telemetry')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time verification of external APIs, telemetry feeds, inventory ledgers, database replication & gateway availability
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right">
          <span className="text-xs uppercase font-bold text-slate-500 block">Operational Mode</span>
          <strong className="text-xs sm:text-sm text-[#213d77] font-mono font-bold block">{t('data_demonstration')}</strong>
          <span className="text-xs text-slate-500">Provenance Tracking Active</span>
        </div>
      </div>

      {/* ── 2. DATA SOURCES REGISTRY ── */}
      <div className="gov-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#213d77] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#fb792b]" /> {t('external_data_feeds')} ({sources.length})
          </h2>
          <span className="text-xs font-mono text-slate-600 font-semibold">
            {t('freshness_eval_active')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-xs text-[#213d77] uppercase font-mono font-bold tracking-wider">
              <tr>
                <th className="p-4">{t('col_feed_name_source')}</th>
                <th className="p-4">{t('col_category')}</th>
                <th className="p-4">{t('col_live_status')}</th>
                <th className="p-4">{t('col_provider_coverage')}</th>
                <th className="p-4">{t('col_confidence')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map(src => (
                <tr key={src.sourceId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <strong className="text-slate-900 font-bold block text-sm">{src.sourceName}</strong>
                    <span className="text-xs font-mono text-slate-500">{src.sourceId}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 font-semibold">
                      {src.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded border uppercase inline-flex items-center gap-1.5 ${
                        src.status === 'LIVE'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : src.status === 'SIMULATED'
                          ? 'bg-blue-100 border-blue-300 text-blue-900'
                          : src.status === 'STALE'
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                    >
                      {src.status === 'LIVE' && <CheckCircle className="w-3.5 h-3.5" />}
                      {src.status === 'SIMULATED' && <Radio className="w-3.5 h-3.5" />}
                      {src.status === 'UNAVAILABLE' && <XCircle className="w-3.5 h-3.5" />}
                      <span>{src.status === 'SIMULATED' ? t('data_demonstration') : src.status}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-900 font-semibold block">{src.provider}</span>
                    <span className="text-xs text-slate-500 block">{src.coverage}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-1 rounded border inline-flex items-center gap-1.5 ${
                        src.confidence === 'HIGH'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : src.confidence === 'MEDIUM'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : src.confidence === 'LOW'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span>{src.confidence === 'HIGH' ? '🛡️ 99.4%' : src.confidence === 'MEDIUM' ? '⚡ 85.0%' : src.confidence === 'LOW' ? '⚠️ 65.0%' : 'N/A'}</span>
                      <span className="text-[10px] opacity-80 uppercase tracking-wide">({src.confidence})</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. NOTIFICATION CHANNELS ── */}
      <div className="gov-card p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#213d77] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#fb792b]" /> {t('dispatch_channels_title')}
          </h2>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-bold">
            {t('multi_channel_dispatch_enabled')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {channels.map(ch => (
            <div key={ch.channel} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <strong className="text-xs sm:text-sm font-bold text-slate-900">{ch.channel}</strong>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {ch.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">{ch.providerName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
