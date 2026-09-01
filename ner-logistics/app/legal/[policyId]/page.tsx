import { redirect } from 'next/navigation'

export default async function LegalPolicyCatchAll({
  params,
}: {
  params: Promise<{ policyId: string }>
}) {
  const { policyId } = await params
  redirect(`/policies?tab=${policyId}`)
}

