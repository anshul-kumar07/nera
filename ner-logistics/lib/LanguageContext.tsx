'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useSyncExternalStore } from 'react'
import { LanguageCode, TRANSLATIONS, TranslationDictionary } from './i18n'

interface LanguageContextProps {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: keyof TranslationDictionary | string, params?: Record<string, string | number>) => string
  isMounted: boolean
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key, params) => {
    let val = (TRANSLATIONS.en as unknown as Record<string, string>)[key as string] ?? String(key)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }
    return val
  },
  isMounted: false,
})

const emptySubscribe = () => () => {}
const getMountedSnapshot = () => true
const getServerMountedSnapshot = () => false

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with 'en' on both server and client to avoid SSR hydration mismatch
  const [language, setLanguageState] = useState<LanguageCode>('en')
  const isMounted = useSyncExternalStore(emptySubscribe, getMountedSnapshot, getServerMountedSnapshot)

  useEffect(() => {
    const syncLocale = () => {
      try {
        const saved = localStorage.getItem('ner_app_language') as LanguageCode
        if (saved && TRANSLATIONS[saved]) {
          setLanguageState(saved)
        }
      } catch {
        // ignore
      }
    }
    syncLocale()

    const handleCustomChange = (e: Event) => {
      const customEvent = e as CustomEvent<LanguageCode>
      if (customEvent.detail && TRANSLATIONS[customEvent.detail]) {
        setLanguageState(customEvent.detail)
      }
    }

    window.addEventListener('storage', syncLocale)
    window.addEventListener('nera_language_change', handleCustomChange)
    return () => {
      window.removeEventListener('storage', syncLocale)
      window.removeEventListener('nera_language_change', handleCustomChange)
    }
  }, [])

  const setLanguage = useCallback((lang: LanguageCode) => {
    if (!TRANSLATIONS[lang]) return
    setLanguageState(lang)
    try {
      localStorage.setItem('ner_app_language', lang)
      window.dispatchEvent(new CustomEvent('nera_language_change', { detail: lang }))
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback((key: keyof TranslationDictionary | string, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[language] as unknown as Record<string, string> | undefined
    const enDict = TRANSLATIONS.en as unknown as Record<string, string>
    let val = dict?.[key as string] ?? enDict?.[key as string] ?? String(key)
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      })
    }
    return val
  }, [language])

  const value = useMemo(() => ({ language, setLanguage, t, isMounted }), [language, setLanguage, t, isMounted])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
