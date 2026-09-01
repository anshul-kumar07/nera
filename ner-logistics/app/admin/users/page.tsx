'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  Shield,
  CheckCircle,
  Building,
  MapPin,
} from 'lucide-react'
import {
  DEMO_IDENTITIES,
  CURRENT_DEMO_USER,
  UserIdentity,
} from '@/lib/access-control'
import { useLanguage } from '@/lib/LanguageContext'
import { LanguageCode } from '@/lib/i18n'

const USERS_I18N: Record<LanguageCode, {
  title: string
  sub: string
  officer_badge: string
  card_title: string
  matrix_badge: string
  col_user: string
  col_role: string
  col_dept: string
  col_scope: string
  col_status: string
  active_status: string
  permissions_count: string
}> = {
  en: {
    title: 'User Role & Statutory RBAC Matrix',
    sub: 'Government role assignments, departmental authority scopes, and disaster operational clearance levels',
    officer_badge: 'Officer Clearance Active',
    card_title: 'Registered Government Operators',
    matrix_badge: '8-ROLE MATRIX ACTIVE',
    col_user: 'User ID & Name',
    col_role: 'Assigned Role',
    col_dept: 'Department & Jurisdiction',
    col_scope: 'Operational Scope',
    col_status: 'Status',
    active_status: 'ACTIVE',
    permissions_count: '{count} Explicit Permissions',
  },
  hi: {
    title: 'उपयोगकर्ता भूमिका एवं वैधानिक RBAC मैट्रिक्स',
    sub: 'सरकारी पद आवंटन, विभागीय अधिकार क्षेत्र एवं आपदा परिचालन अनुमति स्तर',
    officer_badge: 'अधिकारी अनुमति सक्रिय',
    card_title: 'पंजीकृत सरकारी ऑपरेटर',
    matrix_badge: '8-भूमिका मैट्रिक्स सक्रिय',
    col_user: 'उपयोगकर्ता आईडी एवं नाम',
    col_role: 'आवंटित भूमिका',
    col_dept: 'विभाग एवं अधिकार क्षेत्र',
    col_scope: 'परिचालन दायरा',
    col_status: 'स्थिति',
    active_status: 'सक्रिय (ACTIVE)',
    permissions_count: '{count} स्पष्ट अनुमतियां',
  },
  as: {
    title: 'ব্যৱহাৰকাৰী ভূমিকা আৰু বিধিবদ্ধ RBAC মেট্ৰিক্স',
    sub: 'চৰকাৰী পদবন্টন, বিভাগীয় কৰ্তৃত্ব আৰু দুৰ্যোগ সাহায্য কাৰ্যক্ষেত্ৰ',
    officer_badge: 'বিষয়াৰ অনুমতি সক্ৰিয়',
    card_title: 'পঞ্জীভুক্ত চৰকাৰী কৰ্মচাৰী',
    matrix_badge: '৮-ভূমিকা মেট্ৰিক্স সক্ৰিয়',
    col_user: 'ব্যৱহাৰকাৰী ID আৰু নাম',
    col_role: 'নিৰ্ধাৰিত ভূমিকা',
    col_dept: 'বিভাগ আৰু কৰ্তৃত্ব ক্ষেত্ৰ',
    col_scope: 'কাৰ্যপ্ৰণালী',
    col_status: 'স্থিতি',
    active_status: 'সক্ৰিয়',
    permissions_count: '{count}টা বিশেষ অনুমতি',
  },
  bn: {
    title: 'ব্যবহারকারী ভূমিকা ও আইনি RBAC ম্যাট্রিক্স',
    sub: 'সরকারি পদ বরাদ্দ, বিভাগীয় কর্তৃত্বের পরিধি ও দুর্যোগ পরিচালনা স্তর',
    officer_badge: 'কর্মকর্তার অনুমোদন সক্রিয়',
    card_title: 'নিবন্ধিত সরকারি অপারেটরবৃন্দ',
    matrix_badge: '৮-রোল ম্যাট্রিক্স সক্রিয়',
    col_user: 'ইউজার আইডি ও নাম',
    col_role: 'বরাদ্দকৃত ভূমিকা',
    col_dept: 'বিভাগ ও এখতিয়ার',
    col_scope: 'অপারেশনাল পরিধি',
    col_status: 'অবস্থা',
    active_status: 'সক্রিয়',
    permissions_count: '{count}টি স্পষ্ট অনুমতি',
  },
  mn: {
    title: 'শীজিন্নরিবগী থৌদাং অমসুং আইনগী RBAC মেত্রিক্স',
    sub: 'সরকারি পদম, দিপার্তমেন্তগী হক অমসুং খুদোংথিবা মতমগী অয়াবা চাং',
    officer_badge: 'ওফিসারগী হক হিংলি',
    card_title: 'লৈঙাক্কী ওপরেতরশিং',
    matrix_badge: '৮-রোল মেত্রিক্স হিংলি',
    col_user: 'শীজিন্নরিবা ID অমসুং মমিং',
    col_role: 'পীবা থৌদাং',
    col_dept: 'দিপার্তমেন্ত অমসুং মফম',
    col_scope: 'থবক তৌবগী মফম',
    col_status: 'ফিভম',
    active_status: 'হিংলি',
    permissions_count: '{count} হক লৈ',
  },
}

export default function AdminUsersPage() {
  const { language, t } = useLanguage()
  const [users] = useState<UserIdentity[]>(Object.values(DEMO_IDENTITIES))
  const utr = useMemo(() => USERS_I18N[language] || USERS_I18N.en, [language])

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* ── 1. OFFICIAL HEADER ── */}
      <div className="gov-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-blue-100 border border-blue-300 text-[#213d77] font-mono font-bold px-2.5 py-0.5 rounded">
              {t('nav_rbac_clearance')}
            </span>
            <span className="text-xs bg-amber-100 border border-amber-300 text-amber-900 font-mono font-bold px-2.5 py-0.5 rounded">
              {t('data_demonstration')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#213d77] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#fb792b]" />
            {utr.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {utr.sub}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-right">
          <span className="text-xs uppercase font-bold text-slate-500 block">{utr.officer_badge}</span>
          <strong className="text-xs sm:text-sm text-[#213d77] font-bold block">{CURRENT_DEMO_USER.name}</strong>
          <span className="text-xs font-mono text-slate-500">{CURRENT_DEMO_USER.role}</span>
        </div>
      </div>

      {/* ── 2. USERS REGISTRY TABLE ── */}
      <div className="gov-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#213d77] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#fb792b]" /> {utr.card_title} ({users.length})
          </h2>
          <span className="text-xs font-mono bg-blue-50 text-[#213d77] border border-blue-200 px-2.5 py-1 rounded font-bold">
            {utr.matrix_badge}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#f8fafc] border-b border-slate-200 text-xs text-[#213d77] uppercase font-mono font-bold tracking-wider">
              <tr>
                <th className="p-4">{utr.col_user}</th>
                <th className="p-4">{utr.col_role}</th>
                <th className="p-4">{utr.col_dept}</th>
                <th className="p-4">{utr.col_scope}</th>
                <th className="p-4">{utr.col_status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.userId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <strong className="text-slate-900 font-bold block text-sm">{u.name}</strong>
                    <span className="text-xs font-mono text-slate-500">{u.userId}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono font-bold bg-blue-50 border border-blue-200 text-[#213d77] px-2.5 py-1 rounded uppercase">
                      {u.role.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                      <Building className="w-4 h-4 text-slate-400" /> {u.department}
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {u.district || 'Regional HQ'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-[#213d77] font-mono font-bold block">
                      {utr.permissions_count.replace('{count}', String(u.permissions.length))}
                    </span>
                    <span className="text-xs text-slate-500 truncate block max-w-xs mt-0.5">
                      {u.permissions.slice(0, 3).join(', ')}...
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded inline-flex items-center gap-1.5 font-mono">
                      <CheckCircle className="w-3.5 h-3.5" /> {utr.active_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
