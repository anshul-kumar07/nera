'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Phone, Clock, Calendar, Sun, Moon } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { useUserRole } from '@/lib/RoleContext'
import { useTheme } from '@/lib/ThemeContext'
import { LanguageCode } from '@/lib/i18n'

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mn', label: 'Manipuri', native: 'মৈতৈলোন্' },
]

export default function GovHeader() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const { role, currentRole, setRole, roleConfig } = useUserRole()
  const { theme, toggleTheme, isDark } = useTheme()
  const [timeStr, setTimeStr] = useState('14:57 IST')
  const [dateStr, setDateStr] = useState('29 Aug 2026')
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const updateTime = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST')
      setDateStr(now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => {
      clearInterval(timer)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <header className="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 select-none relative z-50 transition-colors duration-200">
      {/* 1. National Government Utility Bar */}
      <div className="bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 px-4 sm:px-6 lg:px-8 py-1.5 text-xs border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Identification & Regional Scope */}
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <span className="font-bold text-slate-900 dark:text-white">{t('gov_india')}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-600 dark:text-slate-400">{t('ner_scope')}</span>
          </div>

          {/* Right: Date/Time + Languages + Theme Toggle + Helpline + Status */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="hidden md:flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span suppressHydrationWarning>{dateStr}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span suppressHydrationWarning>{timeStr}</span>
            </div>

            {/* Language Text Links */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-3">
              {LANGUAGES.map((l, idx) => (
                <span key={l.code} className="flex items-center gap-2">
                  <button
                    onClick={() => setLanguage(l.code)}
                    className={`hover:text-[#213d77] dark:hover:text-blue-400 cursor-pointer transition-colors ${
                      language === l.code ? 'font-bold text-[#213d77] dark:text-blue-400 underline underline-offset-2' : ''
                    }`}
                  >
                    {l.native}
                  </button>
                  {idx < LANGUAGES.length - 1 && <span className="text-slate-300 dark:text-slate-700">|</span>}
                </span>
              ))}
            </div>

            {/* ☀️ / 🌙 Dark & Light Mode Toggle Button (Directly near Language) */}
            <div className="flex items-center border-l border-slate-300 dark:border-slate-700 pl-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-amber-300 border border-slate-300 dark:border-slate-700 shadow-xs"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="font-mono text-[11px] font-black tracking-wide">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-700" />
                    <span className="font-mono text-[11px] font-black tracking-wide">Dark</span>
                  </>
                )}
              </button>
            </div>

            {/* Emergency Helpline */}
            <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/50 px-2.5 py-0.5 rounded border border-rose-200 dark:border-rose-900/60">
              <Phone className="w-3 h-3 text-rose-600 dark:text-rose-400" />
              <span>{t('gov_helpline')}</span>
            </div>

            {/* Live System Indicator */}
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60 font-mono">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isOnline ? t('system_online') : t('system_offline')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NERA Brand Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 bg-white dark:bg-[#0f172a] transition-colors">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <Link href="/" className="flex items-center gap-3.5 group cursor-pointer">
            <span className="text-3xl sm:text-4xl font-black text-[#213d77] dark:text-blue-400 tracking-tight group-hover:text-[#1b3162] dark:group-hover:text-blue-300 transition-colors">
              NERA
            </span>
            <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-3">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {t('brand_full_title')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('brand_subtitle')}
              </p>
            </div>
          </Link>

          {/* Center/Right Status & Government Identity */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            {/* Tactical Persona Status Badge */}
            {role && pathname !== '/login' ? (
              <div className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 border border-slate-700 dark:border-slate-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-xs">{roleConfig?.icon || '🛡️'}</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {roleConfig?.shortBadge || 'Active Session'}
                </span>
              </div>
            ) : null}

            {/* Live Data Badge */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-lg">
              <div className="bg-[#213d77] text-white text-xs font-black font-mono px-2 py-0.5 rounded flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span>{t('data_live')}</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                <span>{t('data_status_label')} <strong className="text-slate-900 dark:text-white font-bold">{t('data_live')}</strong></span>
                <span className="text-slate-400 dark:text-slate-400 block text-[11px]">{t('last_updated_label')} {timeStr}</span>
              </div>
            </div>

            {/* National Authority Seal */}
            <div className="hidden sm:flex items-center gap-3 text-right">
              <div>
                <p className="text-xs sm:text-sm font-black text-[#213d77] dark:text-blue-300 tracking-tight">
                  {t('gov_authority_title')}
                </p>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                  {t('gov_authority_sub')}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#213d77] border-2 border-[#fb792b] flex items-center justify-center text-white shadow-xs shrink-0 font-mono text-xs font-black">
                🇮🇳
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Saffron/Tricolor Accent Line */}
      <div className="h-1 bg-[#fb792b] w-full" />
    </header>
  )
}
