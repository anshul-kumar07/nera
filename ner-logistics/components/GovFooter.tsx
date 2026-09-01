'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Shield, Phone } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'
import { LanguageCode } from '@/lib/i18n'

const FOOTER_I18N: Record<LanguageCode, {
  helplines_title: string
  national_helpline: string
  state_eoc: string
  vhf_relay: string
  website_policy: string
  terms_of_use: string
  privacy_statement: string
  hyperlinking_policy: string
  copyright_policy: string
  rti: string
  help_faq: string
  copyright_notice: string
}> = {
  en: {
    helplines_title: 'Emergency Helplines & Control',
    national_helpline: 'National Disaster Helpline',
    state_eoc: 'State EOC Control Room',
    vhf_relay: 'VHF Emergency Relay',
    website_policy: 'Website Policy',
    terms_of_use: 'Terms of Use',
    privacy_statement: 'Privacy Statement',
    hyperlinking_policy: 'Hyperlinking Policy',
    copyright_policy: 'Copyright Policy',
    rti: 'Right to Information (RTI)',
    help_faq: 'Help & FAQ',
    copyright_notice: '© 2026 NERA Platform. Government of India • Guidelines for Indian Government Websites (GIGW 3.0)',
  },
  hi: {
    helplines_title: 'आपातकालीन हेल्पलाइन एवं नियंत्रण',
    national_helpline: 'राष्ट्रीय आपदा हेल्पलाइन',
    state_eoc: 'राज्य EOC नियंत्रण कक्ष',
    vhf_relay: 'VHF आपातकालीन रिले',
    website_policy: 'वेबसाइट नीति',
    terms_of_use: 'उपयोग की शर्तें',
    privacy_statement: 'गोपनीयता नीति',
    hyperlinking_policy: 'हाइपरलिंकिंग नीति',
    copyright_policy: 'कॉपीराइट नीति',
    rti: 'सूचना का अधिकार (RTI)',
    help_faq: 'सहायता एवं FAQ',
    copyright_notice: '© 2026 NERA प्लेटफॉर्म. भारत सरकार • भारतीय सरकारी वेबसाइट दिशानिर्देश (GIGW 3.0)',
  },
  as: {
    helplines_title: 'জৰুৰীকালীন হেল্পলাইন আৰু নিয়ন্ত্ৰণ',
    national_helpline: 'ৰাষ্ট্ৰীয় দুৰ্যোগ হেল্পলাইন',
    state_eoc: 'ৰাজ্যিক EOC নিয়ন্ত্ৰণ কক্ষ',
    vhf_relay: 'VHF জৰুৰীকালীন ৰিলে',
    website_policy: 'ৱেবচাইট নীতি',
    terms_of_use: 'ব্যৱহাৰৰ নিয়ম',
    privacy_statement: 'গোপনীয়তা নীতি',
    hyperlinking_policy: 'হাইপাৰলিংক নীতি',
    copyright_policy: 'কপিৰাইট নীতি',
    rti: 'তথ্য জনাৰ অধিকাৰ (RTI)',
    help_faq: 'সহায় আৰু FAQ',
    copyright_notice: '© ২০২৬ NERA প্লেটফৰ্ম. ভাৰত চৰকাৰ • GIGW 3.0 মানদণ্ড',
  },
  bn: {
    helplines_title: 'জরুরি হেল্পলাইন ও নিয়ন্ত্রণ কক্ষ',
    national_helpline: 'জাতীয় দুর্যোগ হেল্পলাইন',
    state_eoc: 'রাজ্য EOC নিয়ন্ত্রণ কক্ষ',
    vhf_relay: 'VHF জরুরি রিলে',
    website_policy: 'ওয়েবসাইট নীতিমালা',
    terms_of_use: 'ব্যবহারের শর্তাবলী',
    privacy_statement: 'গোপনীয়তা বিবৃতি',
    hyperlinking_policy: 'হাইপারলিঙ্কিং নীতি',
    copyright_policy: 'কপিরাইট নীতি',
    rti: 'তথ্যের অধিকার (RTI)',
    help_faq: 'সাহায্য ও FAQ',
    copyright_notice: '© ২০২৬ NERA প্ল্যাটফর্ম. ভারত সরকার • GIGW 3.0 মানদণ্ড',
  },
  mn: {
    helplines_title: 'খুদোংথিবা মতমগী হেল্পলাইন',
    national_helpline: 'লৈবাক্কী দিজাস্তর হেল্পলাইন',
    state_eoc: 'ষ্টেত EOC কন্ত্রোল রুম',
    vhf_relay: 'VHF রেলে',
    website_policy: 'ৱেবসাইত নীতি',
    terms_of_use: 'শীজিন্নবগী নিয়ম',
    privacy_statement: 'গোপনীয়তা নিয়ম',
    hyperlinking_policy: 'হাইপৰলিঙ্ক নীতি',
    copyright_policy: 'কপিরাইত নীতি',
    rti: 'পাউ খঙবগী হক (RTI)',
    help_faq: 'মতেং অমসুং FAQ',
    copyright_notice: '© ২০২৬ NERA প্লেতফোৰ্ম. ভারত সরকার • GIGW 3.0 স্তেন্দার্দ',
  },
}

export default function GovFooter() {
  const { language, t } = useLanguage()
  const ftr = useMemo(() => FOOTER_I18N[language] || FOOTER_I18N.en, [language])

  return (
    <footer className="w-full bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 text-xs select-none mt-auto transition-colors duration-200">
      {/* Tri-color Accent Bar */}
      <div className="gov-tricolor" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-3.5 border-b border-slate-200 dark:border-slate-800 items-center">
          
          {/* Col 1: Brand & Scope */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-black text-[#213d77] dark:text-blue-400 tracking-tight">
                NERA
              </span>
              <div className="border-l-2 border-slate-300 dark:border-slate-700 pl-2.5">
                <strong className="text-slate-900 dark:text-white text-xs sm:text-sm block leading-tight">
                  {t('brand_full_title')}
                </strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {t('brand_subtitle')}
                </span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-snug max-w-xl">
              National Emergency Logistics & Multi-Modal Disaster Accessibility Command Grid for the 8 North Eastern States.
            </p>
            <div className="inline-block bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-bold">
              {t('footer_official_badge')}
            </div>
          </div>

          {/* Col 2: Emergency Helplines & Direct Control */}
          <div className="space-y-1.5 md:text-right md:flex md:flex-col md:items-end">
            <strong className="text-[#213d77] dark:text-blue-400 text-[11px] font-bold uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-0.5 w-fit">
              {ftr.helplines_title}
            </strong>
            <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-1.5 md:justify-end">
                <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{ftr.national_helpline}: <strong className="text-slate-900 dark:text-white font-mono">1070 / 112</strong></span>
              </li>
              <li className="flex items-center gap-1.5 md:justify-end">
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{ftr.state_eoc}: <strong className="text-slate-900 dark:text-white font-mono">1077</strong></span>
              </li>
              <li className="flex items-center gap-1.5 md:justify-end">
                <Shield className="w-3.5 h-3.5 text-[#fb792b] dark:text-amber-400 shrink-0" />
                <span>{ftr.vhf_relay}: <strong className="text-slate-900 dark:text-white font-mono">CH-14 (156.700 MHz)</strong></span>
              </li>
            </ul>
          </div>

        </div>

        {/* GIGW Statutory Policy Compliance Link Bar */}
        <div className="py-2.5 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <Link href="/policies?tab=website-policies" className="hover:text-[#213d77] dark:hover:text-blue-400 hover:underline transition-colors">{ftr.website_policy}</Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/policies?tab=terms-of-use" className="hover:text-[#213d77] dark:hover:text-blue-400 hover:underline transition-colors">{ftr.terms_of_use}</Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/policies?tab=privacy-policy" className="hover:text-[#213d77] dark:hover:text-blue-400 hover:underline transition-colors">{ftr.privacy_statement}</Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/policies?tab=hyperlinking-policy" className="hover:text-[#213d77] dark:hover:text-blue-400 hover:underline transition-colors">{ftr.hyperlinking_policy}</Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/policies?tab=copyright-policy" className="hover:text-[#213d77] dark:hover:text-blue-400 hover:underline transition-colors">{ftr.copyright_policy}</Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/policies?tab=rti" className="hover:text-[#213d77] dark:hover:text-blue-400 hover:underline transition-colors">{ftr.rti}</Link>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <Link href="/faq" className="hover:text-[#213d77] dark:hover:text-blue-400 hover:underline font-bold transition-colors">{ftr.help_faq}</Link>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400">
          <p>
            {ftr.copyright_notice}
          </p>
          <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
            {t('all_states_filter')}
          </p>
        </div>
      </div>
    </footer>
  )
}
