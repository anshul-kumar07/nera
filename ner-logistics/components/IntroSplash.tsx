'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Shield, Radio, Activity, Sparkles, ArrowRight, Zap, CheckCircle2, Globe2, Lock } from 'lucide-react'

export default function IntroSplash() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const [step, setStep] = useState(1)
  const [progress, setProgress] = useState(15)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if intro has already been viewed in this browser session
    try {
      const alreadyShown = sessionStorage.getItem('nera_intro_seen')
      // If user is at root / or has not seen the splash yet
      if (!alreadyShown || pathname === '/') {
        setVisible(true)
        sessionStorage.setItem('nera_intro_seen', 'true')
      }
    } catch {
      setVisible(true)
    }
  }, [pathname])

  // Multi-step animated sequence
  useEffect(() => {
    if (!visible) return

    const t1 = setTimeout(() => {
      setStep(2)
      setProgress(45)
    }, 800)

    const t2 = setTimeout(() => {
      setStep(3)
      setProgress(75)
    }, 1700)

    const t3 = setTimeout(() => {
      setStep(4)
      setProgress(100)
    }, 2500)

    // Auto-transition to login after animation completes
    const t4 = setTimeout(() => {
      handleProceedToLogin()
    }, 3400)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [visible])

  const handleProceedToLogin = () => {
    if (fading) return
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      // Transition to Login Portal Gateway
      if (pathname === '/' || pathname === '') {
        router.push('/login')
      }
    }, 450)
  }

  if (!visible) return null

  return (
    <div
      onClick={handleProceedToLogin}
      className={`fixed inset-0 z-[10000] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center select-none font-sans cursor-pointer transition-all duration-500 ease-out ${
        fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      title="Tap anywhere to proceed to Login Portal"
    >
      {/* Background Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-[#fb792b]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Animated Intro Card */}
      <div className="max-w-lg w-full px-6 text-center space-y-6 animate-in zoom-in-95 fade-in duration-500 relative z-10">
        
        {/* Pulsing Tactical Emblem with Indian Tri-Color Accent */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/40 animate-ping duration-1000" />
          <div className="absolute inset-2 rounded-full border border-[#fb792b]/60 animate-pulse" />
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#213d77] via-[#1b3162] to-slate-950 border-2 border-[#fb792b] flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <span className="text-3xl">🇮🇳</span>
          </div>
        </div>

        {/* Brand Titles */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-blue-500/40 text-[11px] font-mono font-bold text-cyan-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>MDoNER & NDMA DISASTER PLATFORM</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            NERA: North Eastern Resilience & Accessibility
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
            Multi-Modal Emergency Logistics & Resilient Routing Engine for the 8 North Eastern States
          </p>
        </div>

        {/* Live Step-by-Step Initializing Checklist */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs font-mono shadow-xl max-w-md mx-auto">
          <div className={`flex items-center justify-between transition-colors ${step >= 1 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> 1. ISRO Bhuvan & NavIC Satellites
            </span>
            <span className="text-[10px]">{step >= 1 ? 'LOCKED' : 'WAITING'}</span>
          </div>

          <div className={`flex items-center justify-between transition-colors ${step >= 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> 2. 8-State Highway Corridors & VAPs
            </span>
            <span className="text-[10px]">{step >= 2 ? 'SYNCHRONIZED' : 'INITIALIZING'}</span>
          </div>

          <div className={`flex items-center justify-between transition-colors ${step >= 3 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> 3. IMD Doppler & GSI Landslide Sensors
            </span>
            <span className="text-[10px]">{step >= 3 ? 'STREAMING' : 'CONNECTING'}</span>
          </div>

          <div className={`flex items-center justify-between transition-colors ${step >= 4 ? 'text-cyan-300 font-bold' : 'text-slate-500'}`}>
            <span className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> 4. Launching Role Authentication Gateway...
            </span>
            <span className="text-[10px]">{step >= 4 ? 'READY' : 'STANDBY'}</span>
          </div>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-72 mx-auto space-y-2">
          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#213d77] via-[#fb792b] to-emerald-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10.5px] font-mono text-slate-400">
            <span>GRID INITIALIZATION</span>
            <span className="text-emerald-400 font-bold">{progress}% READY</span>
          </div>
        </div>

        {/* Direct Action Button */}
        <div className="pt-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/50 px-5 py-2.5 rounded-xl shadow-lg hover:bg-amber-900/60 transition-all animate-pulse">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Tap anywhere to Enter Login Portal</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </div>

        {/* Government Footer Attribution */}
        <div className="pt-2 border-t border-slate-800/80 text-[10.5px] text-slate-400 font-mono">
          <span>GOVERNMENT OF INDIA • STATUTORY DISASTER MANAGEMENT GRID</span>
        </div>
      </div>
    </div>
  )
}
