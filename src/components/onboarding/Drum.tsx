'use client'
import { useRef, useEffect } from 'react'

export const DRUM_ITEM_H = 50
const VISIBLE = 5
const PAD = Math.floor(VISIBLE / 2) * DRUM_ITEM_H // 100

interface DrumProps {
  items: string[]
  value: string
  onChange: (v: string) => void
  /** Width of the drum column, e.g. '56px'. Defaults to flex: 1 */
  width?: string
  fontSize?: number
}

export function Drum({ items, value, onChange, width, fontSize = 24 }: DrumProps) {
  const ref      = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const cbRef    = useRef(onChange)
  cbRef.current  = onChange

  useEffect(() => {
    const idx = items.indexOf(value)
    if (ref.current && idx >= 0) {
      ref.current.scrollTop = idx * DRUM_ITEM_H
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-sync scroll when value changes externally (e.g. reset)
  useEffect(() => {
    const idx = items.indexOf(value)
    if (!ref.current || idx < 0) return
    const target = idx * DRUM_ITEM_H
    if (Math.abs(ref.current.scrollTop - target) > DRUM_ITEM_H * 0.6) {
      ref.current.scrollTop = target
    }
  }, [value, items])

  function onScroll() {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!ref.current) return
      const idx = Math.round(ref.current.scrollTop / DRUM_ITEM_H)
      const clamped = Math.max(0, Math.min(idx, items.length - 1))
      ref.current.scrollTo({ top: clamped * DRUM_ITEM_H, behavior: 'smooth' })
      cbRef.current(items[clamped])
    }, 120)
  }

  const style: React.CSSProperties = width
    ? { width, flexShrink: 0 }
    : { flex: 1 }

  return (
    <div style={{ position: 'relative', height: DRUM_ITEM_H * VISIBLE, overflow: 'hidden', ...style }}>
      {/* Top fade */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: PAD,
        background: 'linear-gradient(to bottom, #161628 30%, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Bottom fade */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: PAD,
        background: 'linear-gradient(to top, #161628 30%, transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      {/* Selection highlight */}
      <div style={{
        position: 'absolute', top: PAD, left: 4, right: 4,
        height: DRUM_ITEM_H, border: '0.5px solid #3d2d6b', borderRadius: 8,
        background: 'rgba(124, 58, 237, 0.08)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      <div
        ref={ref}
        onScroll={onScroll}
        className="drum-scroll"
        style={{
          height: '100%',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          paddingTop: PAD,
          paddingBottom: PAD,
        }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              height: DRUM_ITEM_H,
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize,
              fontWeight: 500,
              color: item === value ? '#e2d9f3' : '#3d3460',
              letterSpacing: '0.03em',
              transition: 'color 0.1s',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
