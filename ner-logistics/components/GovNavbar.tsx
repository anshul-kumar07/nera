'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  MapPin,
  AlertTriangle,
  Compass,
  Truck,
  FileText,
  Bell,
  ScrollText,
  Activity,
  Users,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  BarChart3,
  ShieldCheck,
  User,
  Package,
  LogIn,
  LogOut,
  HelpCircle,
  Scale,
  Shield,
  Sun,
  Moon,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { useRole } from '@/lib/RoleContext'
import { useTheme } from '@/lib/ThemeContext'
import { LanguageCode } from '@/lib/i18n'

interface NavLink {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const NAVBAR_I18N: Record<LanguageCode, {
  supplies_tracker: string
  safe_map: string
  report_obstacle: string
  help_faq: string
  statutory_policies: string
  police_command: string
  tactical_map: string
  sector_convoys: string
  statutory_directives: string
  report_severance: string
  dashboard: string
  tactical_gis: string
  relief_missions: string
  vehicles_safety: string
  system_health: string
  more_tools: string
  admin_modules: string
  incidents_lifecycle: string
  analytics_matrix: string
  audit_trail: string
  user_mgmt: string
  sign_out: string
}> = {
  en: {
    supplies_tracker: 'Essential Supplies Tracker',
    safe_map: 'Public Safe Road Map',
    report_obstacle: 'Report Road Obstacle',
    help_faq: 'Help & FAQ',
    statutory_policies: 'Statutory Policies',
    police_command: 'Police Sector Command',
    tactical_map: 'Tactical GIS Map',
    sector_convoys: 'Sector Convoys',
    statutory_directives: 'Statutory Directives',
    report_severance: 'Report Severance',
    dashboard: 'Dashboard',
    tactical_gis: 'Tactical GIS',
    relief_missions: 'Missions',
    vehicles_safety: 'Vehicles & Safety',
    system_health: 'System Health',
    more_tools: 'More Tools',
    admin_modules: 'Administrative Modules',
    incidents_lifecycle: 'Incidents Lifecycle',
    analytics_matrix: 'Predictive Analytics',
    audit_trail: 'Cryptographic Audit Log',
    user_mgmt: 'User Role Management',
    sign_out: 'Sign Out',
  },
  hi: {
    supplies_tracker: 'आवश्यक आपूर्ति ट्रैकर',
    safe_map: 'सार्वजनिक सुरक्षित मार्ग',
    report_obstacle: 'सड़क बाधा रिपोर्ट करें',
    help_faq: 'सहायता एवं FAQ',
    statutory_policies: 'वैधानिक नीतियां',
    police_command: 'पुलिस सेक्टर कमान',
    tactical_map: 'रणनीतिक GIS मानचित्र',
    sector_convoys: 'सेक्टर राहत काफिला',
    statutory_directives: 'वैधानिक निर्देश',
    report_severance: 'सड़क विच्छेद रिपोर्ट',
    dashboard: 'कमांड डैशबोर्ड',
    tactical_gis: 'रणनीतिक GIS',
    relief_missions: 'राहत मिशन',
    vehicles_safety: 'वाहन एवं सुरक्षा',
    system_health: 'सिस्टम स्थिति',
    more_tools: 'अन्य उपकरण',
    admin_modules: 'प्रशासनिक मॉड्यूल',
    incidents_lifecycle: 'आपदा चक्र',
    analytics_matrix: 'पूर्वानुमान विश्लेषिकी',
    audit_trail: 'ऑडिट लॉग',
    user_mgmt: 'उपयोगकर्ता प्रबंधन',
    sign_out: 'साइन आउट',
  },
  as: {
    supplies_tracker: 'সামগ্ৰী যোগান ট্ৰেকাৰ',
    safe_map: 'ৰাজহুৱা নিৰাপদ পথ মেপ',
    report_obstacle: 'পথৰ বাধাৰ তথ্য দিয়ক',
    help_faq: 'সহায় আৰু FAQ',
    statutory_policies: 'বিধিবদ্ধ নীতিসমূহ',
    police_command: 'আৰক্ষী খণ্ড কমাণ্ড',
    tactical_map: 'ৰণনীতিমূলক GIS মেপ',
    sector_convoys: 'খণ্ড কনভয়',
    statutory_directives: 'বিধিবদ্ধ নিৰ্দেশনা',
    report_severance: 'পথ বন্ধৰ তথ্য দিয়ক',
    dashboard: 'ডেশ্বব’ৰ্ড',
    tactical_gis: 'ৰণনীতিমূলক GIS',
    relief_missions: 'সাহায্য অভিযান',
    vehicles_safety: 'বাহন আৰু সুৰক্ষা',
    system_health: 'ব্যৱস্থাৰ স্বাস্থ্য',
    more_tools: 'অন্যান্য সঁজুলি',
    admin_modules: 'প্ৰশাসনিক বিভাগসমূহ',
    incidents_lifecycle: 'দুৰ্যোগৰ বিৱৰণ',
    analytics_matrix: 'পূৰ্বানুমান বিশ্লেষণ',
    audit_trail: 'অডিট ল’গ',
    user_mgmt: 'ব্যৱহাৰকাৰী ব্যৱস্থাপনা',
    sign_out: 'প্ৰস্থান (Sign Out)',
  },
  bn: {
    supplies_tracker: 'প্রয়োজনীয় সরবরাহ ট্র্যাকার',
    safe_map: 'পাবলিক নিরাপদ সড়ক মানচিত্র',
    report_obstacle: 'সড়ক বিপত্তির অভিযোগ',
    help_faq: 'সাহায্য ও FAQ',
    statutory_policies: 'আইনি নীতিমালা',
    police_command: 'পুলিশ সেক্টর কমান্ড',
    tactical_map: 'কৌশলগত জিআইএস মানচিত্র',
    sector_convoys: 'সেক্টর কনভয়',
    statutory_directives: 'আইনি নির্দেশনা',
    report_severance: 'সড়ক বিচ্ছিন্নতা রিপোর্ট',
    dashboard: 'ড্যাশবোর্ড',
    tactical_gis: 'কৌশলগত জিআইএস',
    relief_missions: 'ত্রাণ অভিযান',
    vehicles_safety: 'যানবাহন ও নিরাপত্তা',
    system_health: 'সিস্টেম স্বাস্থ্য',
    more_tools: 'আরও টুলস',
    admin_modules: 'প্রশাসনিক মডিউল',
    incidents_lifecycle: 'ঘটনা চক্র',
    analytics_matrix: 'পূর্বাভাস অ্যানালিটিক্স',
    audit_trail: 'অডিট লগ',
    user_mgmt: 'ব্যবহারকারী পরিচালনা',
    sign_out: 'লগ আউট',
  },
  mn: {
    supplies_tracker: 'পোৎলম য়েন্থোকপা ত্ৰেকাৰ',
    safe_map: 'মীয়ামগী লম্বী মেপ',
    report_obstacle: 'লম্বী অপনবা ফোঙদোকউ',
    help_faq: 'মতেং অমসুং FAQ',
    statutory_policies: 'আইনগী নীতিশিং',
    police_command: 'পুলিস সেক্তৰ কমান্দ',
    tactical_map: 'GIS লম্বী মেপ',
    sector_convoys: 'সেক্তৰ গারি কাংলুপ',
    statutory_directives: 'আইনগী পাউতাক',
    report_severance: 'লম্বী কাইবা ফোঙদোকউ',
    dashboard: 'কমান্দ দেসবোর্দ',
    tactical_gis: 'GIS মেপ',
    relief_missions: 'ত্রাণ মিসন',
    vehicles_safety: 'গারি অমসুং সেফতি',
    system_health: 'সিস্তেম হকশেল',
    more_tools: 'অতোপ্পা পোৎলম',
    admin_modules: 'এদমিন সেক্সন',
    incidents_lifecycle: 'থৌদোক বিৱরন',
    analytics_matrix: 'এনালাইতিক্স',
    audit_trail: 'ওদিত লোগ',
    user_mgmt: 'শীজিন্নরিবশিং',
    sign_out: 'থোকপা (Sign Out)',
  },
}

export default function GovNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const { role, roleConfig, isAuthenticated, logout } = useRole()
  const { toggleTheme, isDark } = useTheme()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const ntr = useMemo(() => NAVBAR_I18N[language] || NAVBAR_I18N.en, [language])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // If on login page, do not render navigation bar
  if (pathname === '/login') {
    return null
  }

  const isCitizen = role === 'CITIZEN_USER' || role === 'CITIZEN_DRIVER'
  const isPolice = role === 'POLICE_OFFICER' || role === 'FIELD_COMMANDER'
  const isAdmin = role === 'APEX_ADMIN'

  // 1. CITIZEN NAVIGATION
  const citizenPrimaryLinks: NavLink[] = [
    { href: '/portal/citizen', label: ntr.supplies_tracker, icon: Package, badge: 'PUBLIC' },
    { href: '/map', label: ntr.safe_map, icon: MapPin },
    { href: '/report', label: ntr.report_obstacle, icon: FileText },
    { href: '/faq', label: ntr.help_faq, icon: HelpCircle },
    { href: '/policies', label: ntr.statutory_policies, icon: Scale },
  ]

  // 2. POLICE NAVIGATION
  const policePrimaryLinks: NavLink[] = [
    { href: '/portal/police', label: ntr.police_command, icon: ShieldCheck, badge: 'OFFICIAL' },
    { href: '/map', label: ntr.tactical_map, icon: MapPin },
    { href: '/missions', label: ntr.sector_convoys, icon: Compass },
    { href: '/notifications', label: ntr.statutory_directives, icon: Bell },
    { href: '/report', label: ntr.report_severance, icon: FileText },
    { href: '/faq', label: ntr.help_faq, icon: HelpCircle },
  ]

  // 3. ADMIN NAVIGATION
  const adminPrimaryLinks: NavLink[] = [
    { href: '/dashboard', label: ntr.dashboard, icon: Home },
    { href: '/map', label: ntr.tactical_gis, icon: MapPin },
    { href: '/missions', label: ntr.relief_missions, icon: Compass },
    { href: '/vehicles', label: ntr.vehicles_safety, icon: Truck },
    { href: '/system', label: ntr.system_health, icon: Activity },
  ]

  const adminSecondaryLinks: NavLink[] = [
    { href: '/incidents', label: ntr.incidents_lifecycle, icon: AlertTriangle },
    { href: '/analytics', label: ntr.analytics_matrix, icon: BarChart3 },
    { href: '/audit', label: ntr.audit_trail, icon: ScrollText },
    { href: '/admin/users', label: ntr.user_mgmt, icon: Users },
    { href: '/notifications', label: ntr.statutory_directives, icon: Bell },
    { href: '/faq', label: ntr.help_faq, icon: HelpCircle },
    { href: '/policies', label: ntr.statutory_policies, icon: Scale },
  ]

  // 4. PUBLIC GUEST NAVIGATION (When not logged in)
  const publicPrimaryLinks: NavLink[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/map', label: 'Safety Map', icon: MapPin },
    { href: '/portal/citizen', label: 'Citizen Portal', icon: Package, badge: 'PUBLIC' },
    { href: '/portal/police', label: 'Police Portal', icon: ShieldCheck, badge: 'OFFICIAL' },
    { href: '/dashboard', label: 'Admin Command', icon: Home, badge: 'EOC' },
    { href: '/faq', label: 'Help & FAQ', icon: HelpCircle },
    { href: '/policies', label: 'Statutory Policies', icon: Scale },
  ]

  const primaryLinks = isCitizen
    ? citizenPrimaryLinks
    : isPolice
    ? policePrimaryLinks
    : isAdmin
    ? adminPrimaryLinks
    : publicPrimaryLinks
  const secondaryLinks = isAdmin ? adminSecondaryLinks : []

  const isSecondaryActive = secondaryLinks.some(link => pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="w-full bg-[#213d77] text-white select-none border-b border-[#1b3162] sticky top-0 z-[100] shadow-md">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          
          {/* Desktop Navigation: Primary Items */}
          <div className="hidden lg:flex items-center space-x-0.5">
            {primaryLinks.map(({ href, label, icon: Icon, badge }) => {
              const isActive = pathname === href || (href !== '/' && href !== '/dashboard' && pathname.startsWith(href)) || (href === '/dashboard' && pathname === '/dashboard')

              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-black tracking-wider transition-all relative whitespace-nowrap ${
                    isActive
                      ? 'bg-[#fb792b] text-white shadow-xs font-black'
                      : 'text-slate-100 hover:bg-[#1b3162] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-white" />
                  <span>{label}</span>
                  {badge && (
                    <span className="text-[9px] font-mono bg-white text-[#fb792b] px-1.5 py-0.2 rounded font-black tracking-wide">
                      {badge}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Admin MORE ▼ Dropdown (Only for Admin) */}
            {isAdmin && secondaryLinks.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-black tracking-wider transition-all cursor-pointer ${
                    isSecondaryActive || moreDropdownOpen
                      ? 'bg-[#fb792b] text-white'
                      : 'text-slate-100 hover:bg-[#1b3162] hover:text-white'
                  }`}
                  aria-expanded={moreDropdownOpen}
                >
                  <span>{ntr.more_tools}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreDropdownOpen ? 'rotate-180 text-white' : 'text-slate-300'}`} />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute left-0 top-full mt-0.5 w-64 bg-[#1b3162] border border-[#2c4d8e] rounded-b shadow-2xl py-1.5 z-[110] animate-in fade-in duration-150">
                    <div className="px-3.5 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700/60 mb-1">
                      {ntr.admin_modules}
                    </div>
                    {secondaryLinks.map(({ href, label, icon: Icon }) => {
                      const isActive = pathname === href || pathname.startsWith(href)

                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold transition-colors ${
                            isActive
                              ? 'bg-[#213d77] text-white border-l-4 border-l-[#fb792b]'
                              : 'text-slate-200 hover:bg-[#213d77] hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-[#fb792b]' : 'text-slate-400'}`} />
                          <span>{label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Right Side: Active Persona Badge & Sign Out / Login Button */}
          <div className="hidden lg:flex items-center gap-3">
            {role ? (
              <>
                {/* Active Authority Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1b3162]/80 border border-[#2c4d8e] text-xs font-bold">
                  <span>{roleConfig?.icon || '🛡️'}</span>
                  <span className="text-white font-mono text-[11px]">{roleConfig?.shortBadge || 'Active User'}</span>
                </div>

                {/* Explicit Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 bg-rose-700 hover:bg-rose-800 text-white px-3 py-1 rounded text-xs font-black tracking-wide shadow-xs transition-colors cursor-pointer border border-rose-600"
                  title="End active statutory session and clear cookies"
                >
                  <LogOut className="w-3.5 h-3.5 text-white" />
                  <span>{ntr.sign_out}</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-[#fb792b] hover:bg-[#e06820] text-white px-3.5 py-1 rounded text-xs font-black tracking-wide shadow-xs transition-colors cursor-pointer border border-amber-400/40"
              >
                <LogIn className="w-3.5 h-3.5 text-white" />
                <span>Login / Select Role</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {role ? (
                <span className="text-xs font-mono font-bold bg-[#1b3162] px-2 py-0.5 rounded border border-[#2c4d8e] text-amber-300">
                  {roleConfig?.icon} {roleConfig?.shortBadge}
                </span>
              ) : (
                <Link
                  href="/login"
                  className="text-xs font-bold bg-[#fb792b] text-white px-2.5 py-0.5 rounded"
                >
                  Login
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2">
              {role && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-rose-700 hover:bg-rose-800 text-white px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3 h-3 text-white" />
                  <span>{ntr.sign_out}</span>
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded hover:bg-[#1b3162] text-slate-200 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1b3162] border-t border-[#2c4d8e] px-4 py-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700 mb-1">
            Primary Navigation
          </div>

          {primaryLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-colors ${
                  isActive ? 'bg-[#fb792b] text-white font-black' : 'text-slate-200 hover:bg-[#213d77]'
                }`}
              >
                <Icon className="w-4 h-4 text-white" />
                <span>{label}</span>
              </Link>
            )
          })}

          {isAdmin && (
            <>
              <div className="px-2 pt-3 pb-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-700 mb-1">
                {ntr.admin_modules}
              </div>
              {secondaryLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href)

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded text-xs font-bold transition-colors ${
                      isActive ? 'bg-[#213d77] text-white border-l-4 border-l-[#fb792b]' : 'text-slate-200 hover:bg-[#213d77]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </>
          )}

          {/* Quick Theme & Language Selector in Mobile Drawer */}
          <div className="pt-3 border-t border-slate-700 space-y-2">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Appearance</span>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#213d77] text-amber-300 border border-slate-600"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="px-2 pt-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">Language</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'as', label: 'অসমীয়া' },
                  { code: 'bn', label: 'বাংলা' },
                  { code: 'mn', label: 'মৈতৈলোন্' },
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => setLanguage(l.code as any)}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                      language === l.code
                        ? 'bg-[#fb792b] text-white'
                        : 'bg-[#213d77] text-slate-300 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
