import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default function DashboardPage() {
  const cookieStore = cookies()
  const hasTrial    = cookieStore.has('st_trial')
  const hasPremium  = cookieStore.has('st_premium')

  // No cookie at all → back to onboarding
  if (!hasTrial && !hasPremium) {
    redirect('/onboarding')
  }

  // TODO: replace with real dashboard component
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070f' }}>
      <div style={{ textAlign: 'center', color: '#a78bfa' }}>
        <i className="ti ti-moon-stars" style={{ fontSize: 48, display: 'block', marginBottom: 16 }} />
        <h1 style={{ fontSize: 22, fontWeight: 500, color: '#e2d9f3', marginBottom: 8 }}>Dashboard coming soon</h1>
        <p style={{ fontSize: 13, color: '#6b5f8a' }}>Trial cookie saved ✓ — next step: sensitivity charts & moon phase</p>
      </div>
    </main>
  )
}
