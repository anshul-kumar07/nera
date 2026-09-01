'use client'

import React from 'react'
import {
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import { UserIdentity } from '@/lib/access-control'

import { useLanguage } from '@/lib/LanguageContext'

export interface AuthorityActionProps {
  currentUser: UserIdentity
  pendingActionName: string
  actionReason: string
  onApprove: () => void
  onReject: () => void
}

export default function AuthorityActionCenter({
  currentUser,
  pendingActionName,
  actionReason,
  onApprove,
  onReject,
}: AuthorityActionProps) {
  const { t } = useLanguage()
  const isCommander = currentUser.role === 'COMMANDER' || currentUser.role === 'SYSTEM_ADMIN'

  return (
    <div className="gov-card p-4 sm:p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#213d77] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> {t('officer_approval')}
        </h3>
        <span className="text-[10px] font-mono text-[#213d77] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
          User: {currentUser.name} ({currentUser.role})
        </span>
      </div>

      <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1 text-xs">
        <span className="text-[9.5px] uppercase font-bold text-slate-500 block">{t('mission_pending_approval')}</span>
        <h4 className="font-bold text-slate-900 text-sm">{pendingActionName}</h4>
        <p className="text-slate-600 text-[11.5px] leading-relaxed">{actionReason}</p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10.5px] text-slate-500 font-mono font-semibold">
          {isCommander ? `${t('nav_rbac_clearance')}: AUTHORIZED` : `${t('nav_rbac_clearance')}: INSUFFICIENT`}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onReject}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold border border-slate-300 cursor-pointer transition-colors"
          >
            {t('btn_dismiss')}
          </button>
          <button
            onClick={onApprove}
            disabled={!isCommander}
            className={`btn-irctc-primary px-4 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{t('btn_authorize_mission')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
