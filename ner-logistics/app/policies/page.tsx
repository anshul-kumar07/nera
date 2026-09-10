'use client'

import React, { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  FileText,
  Lock,
  Link2,
  Copyright,
  HelpCircle,
  Scale,
  CheckCircle,
  Building,
  Calendar,
  Eye,
  AlertTriangle,
  ArrowRight,
  Printer,
  ChevronRight,
  Phone,
  Mail,
  Compass,
  Share2,
  Globe2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Search,
  Copy,
  Home,
  Check,
  Download,
  Landmark,
  BadgeAlert,
  UserCheck,
} from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { getPoliciesDatabase, PolicyDefinition } from './policies-data'

function PoliciesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { language, t } = useLanguage()

  const [activePolicyId, setActivePolicyId] = useState<string>('terms-of-use')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [copiedToast, setCopiedToast] = useState<string | null>(null)

  const policiesDb = useMemo(() => getPoliciesDatabase(language), [language])

  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toLowerCase()
    if (tabParam) {
      if (tabParam === 'terms' || tabParam === 'terms_of_use' || tabParam === 'terms-of-use') {
        setActivePolicyId('terms-of-use')
      } else if (tabParam === 'privacy' || tabParam === 'privacy_statement' || tabParam === 'privacy-policy') {
        setActivePolicyId('privacy-policy')
      } else if (tabParam === 'website' || tabParam === 'website_policy' || tabParam === 'website-policies') {
        setActivePolicyId('website-policies')
      } else if (tabParam === 'hyperlink' || tabParam === 'hyperlink_policy' || tabParam === 'hyperlinking-policy') {
        setActivePolicyId('hyperlinking-policy')
      } else if (tabParam === 'copyright' || tabParam === 'copyright_policy' || tabParam === 'copyright-policy') {
        setActivePolicyId('copyright-policy')
      } else if (tabParam === 'rti' || tabParam === 'right_to_information') {
        setActivePolicyId('rti')
      } else if (policiesDb[tabParam]) {
        setActivePolicyId(tabParam)
      }
    }
  }, [searchParams, policiesDb])

  const currentPolicy = policiesDb[activePolicyId] || policiesDb['terms-of-use'] || Object.values(policiesDb)[0]
  const policiesList = Object.values(policiesDb)

  const handleSelectPolicy = (id: string) => {
    setActivePolicyId(id)
    setSearchQuery('')
    router.replace(`/policies?tab=${id}`)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyCitation = () => {
    const citation = `${currentPolicy.title} (Gazette Ref: ${currentPolicy.gazetteRef}) — NERA Platform, Ministry of Development of North Eastern Region (MDoNER), Government of India.`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(citation)
      setCopiedToast('📋 Official Gazette Citation copied to clipboard!')
      setTimeout(() => setCopiedToast(null), 4000)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: currentPolicy.title, url: window.location.href }).catch(() => {})
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedToast('🔗 Policy URL copied to clipboard!')
      setTimeout(() => setCopiedToast(null), 4000)
    }
  }

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return currentPolicy.sections
    const q = searchQuery.toLowerCase()
    return currentPolicy.sections.filter(sec => {
      const headingMatch = sec.heading.toLowerCase().includes(q)
      const contentMatch = sec.content.some(c => c.toLowerCase().includes(q))
      return headingMatch || contentMatch
    })
  }, [currentPolicy, searchQuery])

  return (
    <div className="w-full max-w-7xl mx-auto py-3 sm:py-5 px-3 sm:px-6 lg:px-8 space-y-6 font-sans select-none">
      
      {/* ── Breadcrumb Bar ── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/" className="hover:text-[#213d77] flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <span>/</span>
        <span className="text-slate-400">Statutory Charters</span>
        <span>/</span>
        <span className="text-[#213d77] font-bold">{currentPolicy.shortTitle}</span>
      </nav>

      {/* ── Toast Notification ── */}
      {copiedToast && (
        <div className="fixed top-4 right-4 z-[200] bg-[#213d77] border-2 border-[#fb792b] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedToast}</span>
        </div>
      )}

      {/* ── Official Government Header Strip (JanSetu Inspired) ── */}
      <header className="bg-white dark:bg-slate-900/60 backdrop-blur-md border-2 border-slate-200 dark:border-slate-800 py-5 sm:py-6 px-5 sm:px-8 rounded-2xl shadow-sm space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#fb792b] via-white to-[#138808]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xl shrink-0 shadow-xs">
              🇮🇳
            </div>
            <div>
              <span className="text-[10.5px] font-mono font-black uppercase text-blue-900 dark:text-blue-400 tracking-wider block">
                Ministry of Development of North Eastern Region (MDoNER) • Government of India
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#213d77] dark:text-white tracking-tight">
                {currentPolicy.title}
              </h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyCitation}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Copy Citation</span>
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Print</span>
            </button>
            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#213d77] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg shadow-xs hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#213d77] dark:text-blue-400" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-5xl">
          {currentPolicy.metaDescription}
        </p>

        {/* Metadata Badges Strip */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Last Updated: <strong className="text-slate-900 dark:text-white">{currentPolicy.lastUpdated}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> {currentPolicy.badge}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-mono text-[11px] font-bold">
              <Landmark className="w-3 h-3 text-blue-700 dark:text-blue-400" /> Ref: {currentPolicy.gazetteRef}
            </span>
          </div>

          {/* Quick In-Document Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search clauses in document..."
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-300 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#213d77] dark:focus:border-blue-400 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Official 22 Scheduled Language Gazette Notice Banner ── */}
      <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300/80 dark:border-amber-700/50 p-3.5 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs">
        <Globe2 className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-amber-950 dark:text-amber-300">Official 22 Scheduled Language Gazette Notice (Digital India Bhashini)</p>
          <p className="text-amber-800 dark:text-amber-300/90 text-[11.5px] leading-relaxed">
            In accordance with Digital India Bhashini guidelines and Article 343 / Eighth Schedule provisions, this statutory charter is rendered dynamically across official North Eastern and regional dialects. The English and Hindi texts serve as primary authentic references in legal and disaster management proceedings.
          </p>
        </div>
      </div>

      {/* ── Main 2-Column Split Stage (Sidebar Directory | Active Article) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 4 Cols: Sticky Policy Directory Navigation & Table of Contents */}
        <aside className="lg:col-span-4 sticky top-14 space-y-4">
          
          {/* Statutory Policy Directory */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-xl border-2 border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#213d77] dark:text-blue-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#fb792b]" />
                <span>Statutory Policy Directory</span>
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                7 Documents
              </span>
            </div>

            <nav aria-label="Legal policies" className="p-2 space-y-1">
              {policiesList.map((item) => {
                const isSelected = item.id === currentPolicy.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPolicy(item.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-[#213d77] dark:text-blue-300 border-2 border-blue-400 font-black shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={isSelected ? 'text-[#213d77] dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}>
                        {item.id === 'website-policies' && <Globe2 className="w-4 h-4" />}
                        {item.id === 'terms-of-use' && <Scale className="w-4 h-4" />}
                        {item.id === 'privacy-policy' && <Lock className="w-4 h-4" />}
                        {item.id === 'hyperlinking-policy' && <Link2 className="w-4 h-4" />}
                        {item.id === 'copyright-policy' && <Copyright className="w-4 h-4" />}
                        {item.id === 'rti' && <Building className="w-4 h-4" />}
                        {item.id === 'help-faq' && <HelpCircle className="w-4 h-4" />}
                      </span>
                      <span className="truncate">{item.shortTitle}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-[#fb792b] translate-x-0.5' : 'text-slate-300 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`} />
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Quick Jump Table of Contents */}
          <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-3.5 space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Compass className="w-3.5 h-3.5 text-[#fb792b]" />
              <span>Table of Contents ({currentPolicy.sections.length} Clauses)</span>
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar text-xs">
              {currentPolicy.sections.map((sec, sIdx) => (
                <a
                  key={sIdx}
                  href={`#clause-${sIdx + 1}`}
                  className="block text-slate-600 dark:text-slate-400 hover:text-[#213d77] dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 py-1 rounded truncate transition-colors text-[11.5px]"
                >
                  {sec.heading}
                </a>
              ))}
            </div>
          </div>

          {/* Official DPO & Grievance Helpline Card */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-transparent dark:to-transparent dark:bg-slate-900/60 dark:backdrop-blur-md rounded-xl border-2 border-slate-200 dark:border-slate-800 p-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>CPIO & DPO Helpline</span>
              </h3>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-mono font-bold px-1.5 py-0.5 rounded">
                STATUTORY
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
              Questions regarding disaster logistics routing, DPDP data protection, or RTI disclosures?
            </p>
            <div className="space-y-1.5 text-[11.5px]">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-400">
                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <a href="mailto:cpio-nera@mdoner.gov.in" className="font-mono font-bold hover:underline">
                  cpio-nera@mdoner.gov.in
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Phone className="w-3.5 h-3.5 text-[#fb792b] shrink-0" />
                <span>Toll-Free Control Room: <strong>112 / 1070</strong></span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right 8 Cols: Structured Legal Policy Article */}
        <main className="lg:col-span-8 bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-xl border-2 border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xs space-y-6">
          <article className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            
            {/* Header Title inside Article */}
            <div className="border-b-2 border-slate-100 dark:border-slate-800 pb-4 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#fb792b]" />
                  <span>OFFICIAL STATUTORY DOCUMENT SERIES</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Ref: {currentPolicy.gazetteRef}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#213d77] dark:text-white tracking-tight pt-1">
                {currentPolicy.title}
              </h2>
            </div>

            {/* If search query active and no results */}
            {filteredSections.length === 0 && (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-xs space-y-2">
                <p>🔍 No clauses matching "{searchQuery}" in this policy.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-blue-700 dark:text-blue-400 font-bold underline cursor-pointer"
                >
                  Clear search filter
                </button>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-6">
              {filteredSections.map((sec, idx) => (
                <section key={idx} id={`clause-${idx + 1}`} className="space-y-3 pt-2 scroll-mt-20">
                  <h3 className="text-sm sm:text-base font-black text-[#213d77] dark:text-blue-400 flex items-center gap-2 border-l-4 border-[#213d77] dark:border-blue-500 pl-3 py-1 bg-slate-50 dark:bg-slate-800/40 rounded-r-lg">
                    <span>{sec.heading}</span>
                  </h3>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-3 leading-relaxed">
                    {sec.content.map((p, pIdx) => {
                      if (p.startsWith('•')) {
                        const parts = p.replace(/^•\s*/, '').split(':')
                        const title = parts[0]
                        const rest = parts.slice(1).join(':')

                        return (
                          <div key={pIdx} className="flex items-start gap-2.5 ml-1 py-1 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60">
                            <span className="w-2 h-2 rounded-full bg-[#fb792b] mt-1.5 shrink-0" />
                            <span className="leading-relaxed text-slate-800 dark:text-slate-200">
                              <strong className="text-[#213d77] dark:text-blue-300 font-bold">{title}:</strong>{rest}
                            </span>
                          </div>
                        )
                      }
                      return (
                        <p key={pIdx} className="leading-relaxed text-slate-700 dark:text-slate-300">
                          {p}
                        </p>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Specific RTI Dedicated Tables if activePolicyId === 'rti' */}
            {activePolicyId === 'rti' && (
              <div className="space-y-4 pt-4 border-t-2 border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Statutory CPIO & Appellate Officer Directory Table</span>
                </h4>
                
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-100 text-[#213d77] font-black uppercase text-[10.5px]">
                      <tr>
                        <th className="p-2.5">Designation</th>
                        <th className="p-2.5">Jurisdiction Area</th>
                        <th className="p-2.5">Contact Email</th>
                        <th className="p-2.5">Helpline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-sans">
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">Director (Logistics)</td>
                        <td className="p-2.5">Supply Depots & Convoy Rosters</td>
                        <td className="p-2.5 font-mono text-blue-700">cpio-logistics@mdoner.gov.in</td>
                        <td className="p-2.5 font-mono">011-23022400</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">Joint Director (Tech)</td>
                        <td className="p-2.5">GIS Algorithms & Telemetry</td>
                        <td className="p-2.5 font-mono text-blue-700">cpio-gis@nec.gov.in</td>
                        <td className="p-2.5 font-mono">0364-2522660</td>
                      </tr>
                      <tr className="hover:bg-slate-50 bg-blue-50/40">
                        <td className="p-2.5 font-bold text-blue-950">Joint Secretary (Appellate)</td>
                        <td className="p-2.5 font-bold text-blue-950">First Appellate Authority (FAA)</td>
                        <td className="p-2.5 font-mono text-blue-700 font-bold">faa-nera@mdoner.gov.in</td>
                        <td className="p-2.5 font-mono font-bold">011-23022415</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Related Frameworks Links */}
            <div className="mt-8 pt-6 border-t-2 border-slate-100 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Related Statutory Frameworks & Official Gazette Copies
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="https://ndma.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30 transition flex items-center justify-between text-xs font-bold text-slate-800 group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>Disaster Management Act 2005 (NDMA)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-700" />
                </a>

                <a
                  href="https://rtionline.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/30 transition flex items-center justify-between text-xs font-bold text-slate-800 group shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-emerald-700" />
                    <span>RTI Online Portal (rtionline.gov.in)</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </a>
              </div>
            </div>

            {/* Bottom Help CTA */}
            <div className="rounded-xl bg-gradient-to-r from-blue-900 to-[#1b3162] text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md">
              <div className="space-y-0.5">
                <p className="font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#fb792b]" />
                  <span>Need operational guidance or help with statutory filings?</span>
                </p>
                <p className="text-blue-200 text-[11px]">
                  Our searchable Help & FAQ Center covers dynamic bypass algorithms, police regulations, and vaccine cold-chain protocols.
                </p>
              </div>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#fb792b] hover:bg-[#e06820] text-white text-xs font-black shadow-md transition shrink-0 cursor-pointer"
              >
                <span>Open Help & FAQ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </article>
        </main>
      </div>
    </div>
  )
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-600">Loading Statutory Policies...</div>}>
      <PoliciesContent />
    </Suspense>
  )
}

