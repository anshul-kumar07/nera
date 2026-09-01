'use client'

import React from 'react'
import {
  Layers,
  AlertTriangle,
} from 'lucide-react'

export interface RegionalResourceProps {
  availableDepotStockKits: number
  reservedDepotStockKits: number
  depotsCount: number
  activeConflictsCount: number
  conflictDetails?: {
    conflictType: string
    competingMissions: string[]
    recommendedAction: string
    requiredAuthority: string
  }
}

export default function RegionalResourcePanel({
  availableDepotStockKits,
  reservedDepotStockKits,
  depotsCount,
  activeConflictsCount,
  conflictDetails,
}: RegionalResourceProps) {
  return (
    <div className="gov-card p-4 sm:p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#213d77] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#fb792b]" /> Regional Resource Coordination & Stock Reserves
        </h3>
        <span className="text-[10px] font-mono text-slate-500 font-semibold">
          Finite Allocation Ledger
        </span>
      </div>

      {/* ── Depot Stock Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Verified Apex Depots</span>
          <p className="text-base font-mono font-bold text-[#213d77]">{depotsCount} Hubs Active</p>
          <span className="text-[9.5px] text-slate-400">Guwahati, Silchar, Dimapur</span>
        </div>

        <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Available Commodity Stock</span>
          <p className="text-base font-mono font-bold text-emerald-700">{availableDepotStockKits.toLocaleString()} Kits</p>
          <span className="text-[9.5px] text-slate-400">Certified regional buffer</span>
        </div>

        <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Reserved For Active Missions</span>
          <p className="text-base font-mono font-bold text-[#fb792b]">{reservedDepotStockKits.toLocaleString()} Kits</p>
          <span className="text-[9.5px] text-slate-400">Committed allocations</span>
        </div>
      </div>

      {/* ── Resource Conflict Alert Card ── */}
      {activeConflictsCount > 0 && conflictDetails && (
        <div className="p-3 rounded bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-950">
          <div className="flex items-center justify-between">
            <span className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Resource Contention Detected: {conflictDetails.conflictType}
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
              Auth: {conflictDetails.requiredAuthority}
            </span>
          </div>
          <p className="text-slate-700 leading-relaxed font-medium">{conflictDetails.recommendedAction}</p>
        </div>
      )}
    </div>
  )
}
