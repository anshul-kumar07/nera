import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import { RoleProvider } from '@/lib/RoleContext'
import { ThemeProvider } from '@/lib/ThemeContext'
import IntroSplash from '@/components/IntroSplash'
import GovHeader from '@/components/GovHeader'
import GovNavbar from '@/components/GovNavbar'
import GovFooter from '@/components/GovFooter'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NERA — North Eastern Resilience and Accessibility',
  description: 'Emergency Logistics & Disaster Accessibility Platform for North Eastern Region — Government of India Prototype',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NERA Logistics',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  themeColor: '#213d77',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-[#f4f6fa] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200`} suppressHydrationWarning>
        <ThemeProvider>
          <RoleProvider>
            <LanguageProvider>
              <IntroSplash />
              <GovHeader />
              <GovNavbar />
              <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {children}
              </main>
              <GovFooter />
            </LanguageProvider>
          </RoleProvider>
        </ThemeProvider>
        <Script
          id="pwa-service-worker-reg"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister();
                    }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (var j = 0; j < names.length; j++) {
                        caches.delete(names[j]);
                      }
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(reg) { console.log('[NER] SW registered:', reg.scope); })
                      .catch(function(err) { console.warn('[NER] SW registration failed:', err); });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
