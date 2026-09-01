'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark'

interface ThemeContextProps {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nera_theme') as ThemeMode
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved)
        applyTheme(saved)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const defaultTheme: ThemeMode = prefersDark ? 'dark' : 'light'
        setThemeState(defaultTheme)
        applyTheme(defaultTheme)
      }
    } catch {
      applyTheme('light')
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nera_theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue as ThemeMode)
        applyTheme(e.newValue as ThemeMode)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const applyTheme = (t: ThemeMode) => {
    const root = document.documentElement
    if (t === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
  }

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    try {
      localStorage.setItem('nera_theme', newTheme)
    } catch {
      // ignore
    }
  }, [])

  const toggleTheme = useCallback(() => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
  }, [theme, setTheme])

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
    }),
    [theme, setTheme, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}

