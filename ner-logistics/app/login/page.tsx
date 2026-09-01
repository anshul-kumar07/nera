'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  ShieldCheck,
  Truck,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
  Phone,
  Compass,
  AlertTriangle,
  Radio,
  Package,
  Sparkles,
} from 'lucide-react'
import { useRole, Role } from '@/lib/RoleContext'
import { useLanguage } from '@/lib/LanguageContext'
import { LOGIN_I18N } from './login-i18n'

export default function LoginPage() {
  const { login } = useRole()
  const { language } = useLanguage()
  const [loadingRole, setLoadingRole] = useState<Role | null>(null)

  const tr = useMemo(() => LOGIN_I18N[language] || LOGIN_I18N.en, [language])

  const handleLogin = (role: Role) => {
    setLoadingRole(role)
    setTimeout(() => {
      login(role)
    }, 200)
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 select-none font-sans space-y-8">
      
      {/* ── Top Official Masthead ── */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#213d77] text-xs font-black tracking-wide uppercase shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#fb792b]" />
          <span>{tr.gov_badge}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#213d77] tracking-tight leading-tight">
          {tr.title}
        </h1>

        <p className="text-xs sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
          {tr.subtitle}
        </p>

        <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{tr.encryption_note}</span>
        </div>
      </div>

      {/* ── 3-Door Official Cards Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* CARD 1: ADMIN */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-[#fb792b] shadow-sm hover:shadow-xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          
          <div className="space-y-4">
            {/* Header / Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded bg-orange-50 text-orange-900 border border-orange-200">
                {tr.admin_badge}
              </span>
              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                🛡️
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#213d77] group-hover:text-[#fb792b] transition-colors">
                {tr.admin_title}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                {tr.admin_sub}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {tr.admin_desc}
              </p>
            </div>

            {/* Checklist */}
            <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tr.admin_f1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tr.admin_f2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tr.admin_f3}</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleLogin('APEX_ADMIN')}
            disabled={Boolean(loadingRole)}
            className="w-full mt-6 py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#fb792b] hover:bg-[#e06820] text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group-hover:translate-y-[-1px]"
          >
            <span>{loadingRole === 'APEX_ADMIN' ? tr.admin_loading : tr.admin_btn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD 2: FIELD LAW ENFORCEMENT & POLICE */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-600 shadow-sm hover:shadow-xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />

          <div className="space-y-4">
            {/* Header / Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200">
                {tr.police_badge}
              </span>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                👮
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#213d77] group-hover:text-blue-700 transition-colors">
                {tr.police_title}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                {tr.police_sub}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {tr.police_desc}
              </p>
            </div>

            {/* Checklist */}
            <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{tr.police_f1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{tr.police_f2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{tr.police_f3}</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleLogin('POLICE_OFFICER')}
            disabled={Boolean(loadingRole)}
            className="w-full mt-6 py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-[#213d77] hover:bg-[#1b3162] text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group-hover:translate-y-[-1px]"
          >
            <span>{loadingRole === 'POLICE_OFFICER' ? tr.police_loading : tr.police_btn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD 3: CITIZEN & ESSENTIAL SUPPLIES BENEFICIARY */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-200 p-6 sm:p-7 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />

          <div className="space-y-4">
            {/* Header / Badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                {tr.citizen_badge}
              </span>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform">
                👤
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#213d77] group-hover:text-emerald-700 transition-colors">
                {tr.citizen_title}
              </h2>
              <p className="text-xs font-bold text-slate-500 mt-0.5">
                {tr.citizen_sub}
              </p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {tr.citizen_desc}
              </p>
            </div>

            {/* Checklist */}
            <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tr.citizen_f1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tr.citizen_f2}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{tr.citizen_f3}</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleLogin('CITIZEN_USER')}
            disabled={Boolean(loadingRole)}
            className="w-full mt-6 py-3 px-4 rounded-xl font-black text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group-hover:translate-y-[-1px]"
          >
            <span>{loadingRole === 'CITIZEN_USER' ? tr.citizen_loading : tr.citizen_btn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── Bottom Statutory Compliance Note ── */}
      <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-500 font-medium space-y-1">
        <p>{tr.statutory_footer}</p>
        <p className="text-[11px] text-slate-400">{tr.gigw_footer}</p>
      </div>

    </div>
  )
}
