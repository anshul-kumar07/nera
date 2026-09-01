'use client'

import React from 'react'
import {
  Sparkles,
  Shield,
  CheckCircle,
} from 'lucide-react'

export interface IntelligenceExplanationProps {
  title: string
  evidenceList: string[]
  recommendedAction: string
  requiredRole: string
}

export default function IntelligenceExplanation({
  title,
  evidenceList,
  recommendedAction,
  requiredRole,
}: IntelligenceExplanationProps) {
  return (
    <div className="gov-card p-4 sm:p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#213d77] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#fb792b]" /> Explainable Decision Intelligence
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
            AI ADVISORY
          </span>
          <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
            HUMAN AUTHORITY REQUIRED
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-500 block">
          Evidence Supporting Analysis ({title})
        </span>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {evidenceList.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-[11.5px] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50/60 border border-blue-200 rounded p-3 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[9.5px] uppercase font-extrabold text-[#213d77] flex items-center gap-1">
            <Shield className="w-3 h-3 text-[#213d77]" /> Statutory Decision Scope
          </span>
          <span className="text-[10px] font-mono font-semibold text-slate-600">
            Designated Officer: {requiredRole}
          </span>
        </div>
        <p className="text-slate-800 leading-relaxed font-semibold">{recommendedAction}</p>
      </div>
    </div>
  )
}
