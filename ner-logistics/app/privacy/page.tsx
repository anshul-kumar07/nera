import { redirect } from 'next/navigation'

export default function PrivacyPage() {
  redirect('/policies?tab=privacy_statement')
}

