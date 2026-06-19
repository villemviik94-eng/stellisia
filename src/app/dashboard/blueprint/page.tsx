import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BlueprintClient from './BlueprintClient'

export default function BlueprintPage() {
  const jar = cookies()
  const trial   = jar.get('st_trial')?.value
  const premium = jar.get('st_premium')?.value
  if (!trial && !premium) redirect('/onboarding')
  return <BlueprintClient />
}
