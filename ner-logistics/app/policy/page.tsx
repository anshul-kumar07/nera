import { redirect } from 'next/navigation'

export default function PolicyRedirectPage() {
  redirect('/policies?tab=website_policy')
}

