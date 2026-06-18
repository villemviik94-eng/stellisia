import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function RootPage() {
  const cookieStore = cookies()
  const hasTrial    = cookieStore.has('st_trial')
  const hasPremium  = cookieStore.has('st_premium')

  if (hasPremium || hasTrial) {
    redirect('/dashboard')
  }

  redirect('/onboarding')
}
