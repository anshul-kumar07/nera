import { redirect } from 'next/navigation'

export default function CopyrightPage() {
  redirect('/policies?tab=copyright_policy')
}

