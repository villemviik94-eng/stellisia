'use client'
import { useState } from 'react'
import { Drum, DRUM_ITEM_H } from './Drum'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS   = ['January','February','March','April','May','June','July','August','September','October','November','December']

const THIS_YEAR  = new Date().getFullYear()
const YEARS      = Array.from({ length: THIS_YEAR - 1929 }, (_, i) => String(THIS_YEAR - i))

function toYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const today    = new Date()
  const todayStr = toYMD(today.getFullYear(), today.getMonth(), today.getDate())

  const initYear  = value ? parseInt(value.slice(0, 4)) : today.getFullYear()
  const initMonth = value ? parseInt(value.slice(5, 7)) - 1 : today.getMonth()
  const [view, setView]         = useState({ year: initYear, month: initMonth })
  const [yearMode, setYearMode] = useState(false)

  function clampView(year: number, month: number) {
    if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())) return
    if (year < 1930) return
    setView({ year, month })
  }

  function prevMonth() { view.month === 0  ? clampView(view.year - 1, 11) : clampView(view.year, view.month - 1) }
  function nextMonth() { view.month === 11 ? clampView(view.year + 1,  0) : clampView(view.year, view.month + 1) }

  const canGoNext = !(view.year === today.getFullYear() && view.month === today.getMonth())

  // Calendar grid (Monday-first)
  const firstDow   = new Date(view.year, view.month, 1).getDay()
  const startOff   = (firstDow + 6) % 7
  const daysInMo   = new Date(view.year, view.month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(startOff).fill(null),
    ...Array.from({ length: daysInMo }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ userSelect: 'none' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        {yearMode ? (
          // Year-picker mode header
          <>
            <span style={{ fontSize: 13, color: '#6b5f8a' }}>Select year</span>
            <button
              onClick={() => setYearMode(false)}
              style={{
                background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer',
                fontSize: 13, fontFamily: 'inherit', padding: '4px 8px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Done
            </button>
          </>
        ) : (
          // Calendar mode header
          <>
            <NavBtn icon="ti-chevron-left" onClick={prevMonth} label="Previous month" />
            <button
              onClick={() => setYearMode(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: 14, fontWeight: 500, color: '#e2d9f3',
                display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px', borderRadius: 6,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {MONTHS[view.month]}
              <span style={{ color: '#a78bfa' }}>{view.year}</span>
              <i className="ti ti-chevron-down" style={{ fontSize: 12, color: '#6b5f8a' }} aria-hidden />
            </button>
            <NavBtn icon="ti-chevron-right" onClick={nextMonth} label="Next month" disabled={!canGoNext} />
          </>
        )}
      </div>

      {yearMode ? (
        // ── Year drum ───────────────────────────────────
        <div style={{ height: DRUM_ITEM_H * 5, background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 10, overflow: 'hidden', maxWidth: 180, margin: '0 auto' }}>
          <Drum
            items={YEARS}
            value={String(view.year)}
            onChange={y => {
              const yr = parseInt(y)
              const mo = yr === today.getFullYear() && view.month > today.getMonth()
                ? today.getMonth()
                : view.month
              setView({ year: yr, month: mo })
            }}
            fontSize={22}
          />
        </div>
      ) : (
        // ── Calendar grid ────────────────────────────────
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
            {WEEKDAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#4a4070', paddingBottom: 2 }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const dateStr  = toYMD(view.year, view.month, day)
              const isSel    = dateStr === value
              const isToday  = dateStr === todayStr
              const isFuture = dateStr > todayStr
              return (
                <button
                  key={i}
                  disabled={isFuture}
                  onClick={() => onChange(dateStr)}
                  style={{
                    height: 38,
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    cursor: isFuture ? 'default' : 'pointer',
                    fontFamily: 'inherit',
                    background: isSel ? '#7c3aed' : 'transparent',
                    color: isSel ? '#fff' : isFuture ? '#2a2540' : isToday ? '#a78bfa' : '#c4b8e8',
                    fontWeight: isSel || isToday ? 600 : 400,
                    outline: isToday && !isSel ? '1px solid #3d2d6b' : 'none',
                    outlineOffset: -1,
                    transition: 'background 0.12s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function NavBtn({ icon, onClick, label, disabled }: { icon: string; onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: 'none', border: 'none',
        color: disabled ? '#2e2b4a' : '#9d8cc4',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: 16, padding: '6px 8px', borderRadius: 6,
        fontFamily: 'inherit', display: 'flex', alignItems: 'center',
        minWidth: 36, justifyContent: 'center',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <i className={`ti ${icon}`} aria-hidden />
    </button>
  )
}
