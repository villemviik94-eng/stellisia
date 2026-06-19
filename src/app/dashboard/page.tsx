import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  const cookieStore = cookies()
  if (!cookieStore.has('st_trial') && !cookieStore.has('st_premium')) {
    redirect('/onboarding')
  }
  return <DashboardClient />
}
