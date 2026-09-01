'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRole } from '@/lib/RoleContext'

export default function RootPage() {
  const router = useRouter()
  const { role } = useRole()

  useEffect(() => {
    if (!role) {
      router.replace('/login')
    } else if (role === 'APEX_ADMIN') {
      router.replace('/dashboard')
    } else if (role === 'POLICE_OFFICER' || role === 'FIELD_COMMANDER') {
      router.replace('/portal/police')
    } else if (role === 'CITIZEN_USER' || role === 'CITIZEN_DRIVER') {
      router.replace('/portal/citizen')
    } else {
      router.replace('/login')
    }
  }, [role, router])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 font-sans select-none p-4 text-center">
      <div className="w-8 h-8 border-3 border-[#213d77] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
        Redirecting to NERA Operational Gateway...
      </p>
      <Link
        href="/login"
        className="text-xs font-bold text-[#213d77] hover:text-[#fb792b] underline"
      >
        Click here to access Login Portal directly
      </Link>
    </div>
  )
}
