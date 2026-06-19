'use client'
import { Drum } from './Drum'

const HOURS_12 = ['12','01','02','03','04','05','06','07','08','09','10','11']
const MINUTES  = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const AMPM     = ['AM', 'PM']

/** Parse "HH:MM" (24h) → { h12, min, ampm } */
function from24(value: string) {
  const [hStr, mStr] = (value || '12:00').split(':')
  const h24 = parseInt(hStr) || 0
  const min = mStr || '00'
  if (h24 === 0)  return { h12: '12', min, ampm: 'AM' }
  if (h24 < 12)   return { h12: String(h24).padStart(2, '0'), min, ampm: 'AM' }
  if (h24 === 12) return { h12: '12', min, ampm: 'PM' }
  return { h12: String(h24 - 12).padStart(2, '0'), min, ampm: 'PM' }
}

/** Convert { h12, min, ampm } → "HH:MM" (24h) */
function to24(h12: string, min: string, ampm: string) {
  const h = parseInt(h12)
  let h24: number
  if (ampm === 'AM') h24 = h === 12 ? 0 : h
  else               h24 = h === 12 ? 12 : h + 12
  return `${String(h24).padStart(2, '0')}:${min}`
}

export function TimeDrum({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { h12, min, ampm } = from24(value)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      background: '#0d0d1a',
      border: '0.5px solid #2e2b4a',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <Drum
        items={HOURS_12}
        value={h12}
        onChange={hh => onChange(to24(hh, min, ampm))}
      />
      <span style={{ fontSize: 28, fontWeight: 300, color: '#3d2d6b', flexShrink: 0, lineHeight: 1, paddingBottom: 2 }}>:</span>
      <Drum
        items={MINUTES}
        value={min}
        onChange={mm => onChange(to24(h12, mm, ampm))}
      />
      <div style={{ width: '0.5px', background: '#2e2b4a', alignSelf: 'stretch', flexShrink: 0 }} />
      <Drum
        items={AMPM}
        value={ampm}
        onChange={ap => onChange(to24(h12, min, ap))}
        width="72px"
        fontSize={16}
      />
    </div>
  )
}
