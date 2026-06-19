'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path        = usePathname()
  const isBlueprint = path.startsWith('/dashboard/blueprint')
  const isProfile   = path.startsWith('/dashboard/profile')

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(10,10,20,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid #1e1b35',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {isBlueprint ? (
        <NavTab href="/dashboard"           icon="ti-stars"       label="Horoscope" active={false} color="#a78bfa" />
      ) : (
        <NavTab href="/dashboard/blueprint" icon="ti-planet"      label="Blueprint" active={false} color="#fbbf24" />
      )}
      <NavTab href="/dashboard/profile"     icon="ti-user-circle" label="Profile"   active={isProfile} color="#34d399" />
    </nav>
  )
}

function NavTab({ href, icon, label, active, color }: { href: string; icon: string; label: string; active: boolean; color: string }) {
  return (
    <Link
      href={href}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 4, padding: '12px 0 11px', textDecoration: 'none',
        transition: 'opacity 0.18s',
        position: 'relative',
        opacity: active ? 1 : 0.85,
      }}
    >
      {active && (
        <span style={{
          position: 'absolute', top: 0, left: '30%', right: '30%', height: 2,
          background: `linear-gradient(to right, ${color}99, ${color})`,
          borderRadius: '0 0 3px 3px',
        }} />
      )}
      <i className={`ti ${icon}`} style={{ fontSize: 22, lineHeight: 1, color }} aria-hidden />
      <span style={{
        fontSize: 10, fontWeight: active ? 600 : 400,
        letterSpacing: '0.07em', textTransform: 'uppercase',
        color,
      }}>{label}</span>
    </Link>
  )
}
