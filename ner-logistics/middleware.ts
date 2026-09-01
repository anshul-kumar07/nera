import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Restricted administrative route prefixes
const ADMIN_ONLY_PREFIXES = ['/dashboard', '/vehicles', '/system', '/admin', '/audit', '/analytics', '/incidents']

export function middleware(request: NextRequest) {
  const role = request.cookies.get('nera_role')?.value
  const { pathname } = request.nextUrl

  // 1. Always allow public static assets, APIs, images, icons, and legal pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.json') ||
    pathname.startsWith('/policies') ||
    pathname.startsWith('/legal') ||
    pathname.startsWith('/faq') ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/help' ||
    pathname === '/rti' ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  // 2. Root route: Immediate server-level redirect based on role (instant navigation)
  if (pathname === '/') {
    const targetUrl = request.nextUrl.clone()
    if (role === 'APEX_ADMIN') {
      targetUrl.pathname = '/dashboard'
    } else if (role === 'POLICE_OFFICER' || role === 'FIELD_COMMANDER') {
      targetUrl.pathname = '/portal/police'
    } else if (role === 'CITIZEN_USER' || role === 'CITIZEN_DRIVER') {
      targetUrl.pathname = '/portal/citizen'
    } else {
      targetUrl.pathname = '/login'
    }
    return NextResponse.redirect(targetUrl)
  }

  // 3. Unauthenticated Gate: Redirect to /login if trying to access internal routes without role
  if (!role) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const isCitizen = role === 'CITIZEN_USER' || role === 'CITIZEN_DRIVER'
  const isPolice = role === 'POLICE_OFFICER' || role === 'FIELD_COMMANDER'

  // 4. Citizen Role Strict Boundary: Cannot access Admin routes or Police Portal
  if (isCitizen) {
    if (
      ADMIN_ONLY_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
      pathname.startsWith('/portal/police') ||
      pathname.startsWith('/missions')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/citizen'
      url.searchParams.set('denied', '1')
      return NextResponse.redirect(url)
    }
  }

  // 5. Police Role Strict Boundary: Cannot access System Admin, Vehicles Safety Overrides, or Citizen Portal
  if (isPolice) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/system') ||
      pathname.startsWith('/audit') ||
      pathname.startsWith('/vehicles') ||
      pathname.startsWith('/portal/citizen')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/portal/police'
      url.searchParams.set('denied', '1')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except static chunks and images
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
