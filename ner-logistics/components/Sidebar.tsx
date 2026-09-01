'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MapPin, Truck, AlertTriangle, FileText,
  BarChart3, Home, Wifi, Shield, ArrowLeft,
  Globe, Compass, Bell, ScrollText, Activity,
  Users,
  type LucideIcon
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { LanguageCode } from '@/lib/i18n'

interface NavSection {
  title: string
  items: {
    href: string
    label: string
    icon: LucideIcon
    badge?: string
  }[]
}

const navSections: NavSection[] = [
  {
    title: 'OPERATIONS',
    items: [
      { href: '/dashboard', label: 'Command Dashboard', icon: Home },
      { href: '/map', label: 'GIS Operations Map', icon: MapPin },
      { href: '/missions', label: 'Missions & Dispatch', icon: Compass },
      { href: '/incidents', label: 'Incident Control', icon: AlertTriangle },
      { href: '/report', label: 'Field Reporting', icon: FileText },
    ],
  },
  {
    title: 'FLEET & RESOURCES',
    items: [
      { href: '/vehicles', label: 'Fleet & Safety Gates', icon: Truck },
      { href: '/analytics', label: 'Logistics Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'GOVERNANCE & SYSTEM',
    items: [
      { href: '/notifications', label: 'Alerts Center', icon: Bell },
      { href: '/audit', label: 'Statutory Audit', icon: ScrollText },
      { href: '/system', label: 'Data Integration', icon: Activity },
      { href: '/admin/users', label: 'Access Control', icon: Users },
    ],
  },
]

const LANGUAGES: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mn', label: 'Manipuri', native: 'ꯃꯤꯇꯩꯂꯣꯟ' },
]

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}
const getOnlineSnapshot = () => navigator.onLine
const getServerOnlineSnapshot = () => true

export default function Sidebar() {
  const pathname = usePathname()
  const { language, setLanguage, t } = useLanguage()
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot)

  return (
    <aside className="w-64 bg-[#142649] text-white flex flex-col shrink-0 sticky top-0 h-screen border-r border-[#1e3a6d] select-none overflow-hidden" suppressHydrationWarning>
      {/* Logo */}
      <div className="p-4 border-b border-[#1e3a6d] bg-[#1a315e]">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer" title="Go to home page">
          <div className="w-9 h-9 bg-[#213d77] border border-[#2b4c8f] rounded flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-[#fb792b]" />
          </div>
          <div>
            <p className="font-black text-sm text-white tracking-tight leading-tight group-hover:text-[#fb792b] transition-colors" suppressHydrationWarning>
              {t('brand_title')}
            </p>
            <p className="text-[10px] text-blue-200 font-medium" suppressHydrationWarning>{t('brand_subtitle')}</p>
          </div>
        </Link>
      </div>

      {/* Live / Offline status badge */}
      <div className="px-3 py-2">
        <div className={`flex items-center gap-2 rounded px-3 py-1.5 border ${isOnline ? 'bg-emerald-950/60 border-emerald-700/80' : 'bg-amber-950/60 border-amber-700/80'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
          <span className={`text-[11px] font-bold ${isOnline ? 'text-emerald-300' : 'text-amber-300'}`} suppressHydrationWarning>
            {isOnline ? t('system_online') : t('system_offline')}
          </span>
          <Wifi className={`w-3 h-3 ml-auto ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
        </div>
      </div>

      {/* 🌐 Multi-Lingual Regional Language Selector */}
      <div className="px-3 py-1">
        <div className="bg-[#1a315e] border border-[#26447c] rounded p-2">
          <div className="flex items-center gap-1.5 text-[10px] text-blue-200 font-semibold mb-1 px-1">
            <Globe className="w-3 h-3 text-[#fb792b]" />
            <span suppressHydrationWarning>{t('regional_language')}</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                suppressHydrationWarning
                className={`px-1.5 py-0.5 rounded text-left font-medium transition-all cursor-pointer ${
                  language === lang.code
                    ? 'bg-[#fb792b] text-white font-bold shadow-xs'
                    : 'bg-[#142649] text-blue-200 hover:text-white hover:bg-[#213d77]'
                }`}
              >
                {lang.native}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <span className="text-[9px] font-mono font-black text-blue-300/80 uppercase px-2 tracking-wider">
              {sec.title}
            </span>
            <div className="space-y-0.5">
              {sec.items.map(({ href, label, icon: Icon, badge }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded text-xs font-bold transition-all duration-150 group ${
                      isActive
                        ? 'bg-[#213d77] border-l-4 border-l-[#fb792b] text-white shadow-xs'
                        : 'text-blue-100/80 hover:bg-[#1e3a6d] hover:text-white'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#fb792b]' : 'text-blue-300 group-hover:text-[#fb792b]'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                    {badge && (
                      <span className="ml-auto text-[8.5px] font-mono font-extrabold bg-[#fb792b] text-white px-1.5 py-0.2 rounded">
                        {badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#1e3a6d] bg-[#1a315e] space-y-1.5">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-blue-200 hover:text-white transition-colors px-2 py-1 rounded hover:bg-[#213d77]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('back_to_home')}
        </Link>
        <p className="text-[9.5px] text-blue-300/80 text-center font-mono">GOVERNMENT OF INDIA • NDMA / MDoNER</p>
      </div>
    </aside>
  )
}
