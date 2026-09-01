'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  Search,
  ChevronDown,
  Shield,
  ShieldCheck,
  Truck,
  MapPin,
  Radio,
  Phone,
  ArrowRight,
  Package,
  AlertTriangle,
  Sparkles,
  BookOpen,
  LifeBuoy,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { getFAQDatabase, FAQItem } from './faq-data'

export default function FAQPage() {
  const { language, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ADMIN' | 'POLICE' | 'CITIZEN' | 'TECH'>('ALL')
  const [openAccordion, setOpenAccordion] = useState<string | null>('faq-1')

  const faqDatabase = useMemo(() => getFAQDatabase(language), [language])

  const filteredFAQs = useMemo(() => {
    return faqDatabase.filter(item => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.highlights?.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
  }, [faqDatabase, searchQuery, selectedCategory])

  const toggleAccordion = (id: string) => {
    setOpenAccordion(prev => (prev === id ? null : id))
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans select-none pb-12">
      {/* Top Hero Banner */}
      <div className="bg-[#213d77] text-white border-b border-[#1b3162] py-8 sm:py-10 px-4 sm:px-8 shadow-md">
        <div className="max-w-5xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#1b3162] border border-blue-400/40 text-blue-200">
            <LifeBuoy className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL HELP & KNOWLEDGE BASE
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            How can we assist you today?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find immediate answers on disaster routing, police highway regulations under BNSS 2023, essential delivery tracking, and offline GPS telemetry.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword (e.g. bypass, vaccines, BNSS 2023, offline, safety gate)..."
              className="w-full bg-white text-slate-900 placeholder:text-slate-400 pl-11 pr-4 py-3 rounded-xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#fb792b] shadow-md font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs">
          {[
            { id: 'ALL', label: 'All Questions', icon: BookOpen },
            { id: 'ADMIN', label: '🛡️ Admin Command', icon: Shield },
            { id: 'POLICE', label: '👮 Police & Patrol', icon: ShieldCheck },
            { id: 'CITIZEN', label: '👤 Citizen Tracking', icon: Package },
            { id: 'TECH', label: '📡 Offline & Telemetry', icon: Radio },
          ].map(cat => {
            const Icon = cat.icon
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#213d77] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
          <span>Showing <strong>{filteredFAQs.length}</strong> matching questions</span>
          <span>Official MDoNER & NDMA Disaster Guidelines</span>
        </div>

        {/* Accordion FAQ List */}
        <div className="space-y-3">
          {filteredFAQs.map(item => {
            const isOpen = openAccordion === item.id
            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen ? 'border-[#fb792b] shadow-md ring-1 ring-[#fb792b]/20' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1 pr-2">
                    <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#213d77] border border-blue-200">
                      {item.category}
                    </span>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {item.question}
                    </h2>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-orange-50 text-[#fb792b] rotate-180' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-slate-100 text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                    <p>{item.answer}</p>
                    {item.highlights && item.highlights.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-slate-400 mr-1">Key Takeaways:</span>
                        {item.highlights.map((h, i) => (
                          <span key={i} className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Helpdesk Contact Card */}
        <div className="gov-card p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-[#213d77] text-white">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2 justify-center sm:justify-start">
              <Phone className="w-4 h-4 text-[#fb792b]" /> Still have unanswered operational questions?
            </h3>
            <p className="text-xs text-blue-200 max-w-xl">
              Connect directly with the 24x7 State Emergency Operations Centre (SEOC) Control Room or explore full legal policies.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/policies"
              className="px-4 py-2.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
            >
              Statutory Policies
            </Link>
            <a
              href="tel:1070"
              className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#fb792b] hover:bg-[#e06820] text-white shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>Call Helpline 1070</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
