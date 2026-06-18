'use client'

export default function TrustBar() {
  return (
    <div style={{
      width: '100%',
      maxWidth: 520,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: '8px 14px',
      background: '#0d0d1a',
      border: '0.5px solid #2e2b4a',
      borderRadius: 8,
      marginBottom: '1rem',
      fontSize: 11,
      color: '#6b5f8a',
    }}>
      <i className="ti ti-shield-lock" style={{ fontSize: 13, color: '#a78bfa' }} aria-hidden />
      <span style={{ color: '#8b7eb8' }}>
        <strong style={{ color: '#a78bfa' }}>256-bit Encryption</strong>
        &nbsp;·&nbsp;
        Your personal birth data is securely processed and will never be shared.
      </span>
    </div>
  )
}
