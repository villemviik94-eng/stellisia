'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { searchCities, reverseGeocode } from '@/lib/geocoding'
import type { CityResult } from '@/types'

interface Props {
  value: CityResult | null
  onChange: (city: CityResult) => void
  onClear: () => void
  placeholder?: string
  id?: string
}

type GpsState = 'idle' | 'loading' | 'error'

export default function CitySearch({ value, onChange, onClear, placeholder, id }: Props) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<CityResult[]>([])
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState(false)
  const [gps, setGps]           = useState<GpsState>('idle')
  const [gpsError, setGpsError] = useState('')
  const timerRef                = useRef<ReturnType<typeof setTimeout>>()
  const wrapRef                 = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchResults = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const data = await searchCities(q)
      setResults(data)
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setQuery(q)
    if (q.length < 2) { setOpen(false); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchResults(q), 320)
  }

  function handleSelect(city: CityResult) {
    onChange(city)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  function handleClear() {
    setQuery('')
    setOpen(false)
    setResults([])
    onClear()
  }

  async function handleGPS() {
    if (!navigator.geolocation) { setGps('error'); setGpsError('GPS not supported'); return }
    setGps('loading')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const city = await reverseGeocode(pos.coords.latitude, pos.coords.longitude)
          onChange(city)
          setGps('idle')
        } catch {
          setGps('error'); setGpsError('Could not identify location')
        }
      },
      (err) => {
        setGps('error')
        setGpsError(err.code === 1 ? 'Location access denied — search manually' : 'Could not get location')
      },
      { timeout: 9000, enableHighAccuracy: true }
    )
  }

  // ── Confirmed city view ───────────────────────────
  if (value) {
    return (
      <div style={{
        background: '#1a1035', border: '0.5px solid #3d2d6b', borderRadius: 8,
        padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem',
      }}>
        <i className="ti ti-map-pin" style={{ color: '#7c3aed', fontSize: 15, flexShrink: 0 }} aria-hidden />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#e2d9f3', fontWeight: 500 }}>{value.name}</div>
          <div style={{ fontSize: 11, color: '#6b5f8a', marginTop: 1 }}>
            {[value.state, value.country].filter(Boolean).join(', ')}
          </div>
          <div style={{ fontSize: 10, color: '#3d3460', fontFamily: 'monospace', marginTop: 2 }}>
            {value.lat.toFixed(4)}° N &nbsp;{value.lng.toFixed(4)}° E
          </div>
        </div>
        <button
          onClick={handleClear}
          style={{
            flexShrink: 0, fontSize: 11, color: '#6b5f8a', cursor: 'pointer',
            border: '0.5px solid #2e2b4a', borderRadius: 4, padding: '2px 8px',
            background: 'none',
          }}
        >
          Change
        </button>
      </div>
    )
  }

  // ── Search input view ─────────────────────────────
  return (
    <div ref={wrapRef}>
      {/* GPS button — shown for current location step (id="curloc") */}
      {id === 'curloc' && (
        <>
          <button className="btn-ghost" onClick={handleGPS} disabled={gps === 'loading'} style={{ marginBottom: '0.75rem' }}>
            <i className={`ti ${gps === 'loading' ? 'ti-loader' : gps === 'error' ? 'ti-alert-triangle' : 'ti-current-location'}`}
               style={{ color: gps === 'error' ? '#f87171' : '#a78bfa' }} aria-hidden />
            {gps === 'idle'    && 'Use my GPS location'}
            {gps === 'loading' && 'Requesting location…'}
            {gps === 'error'   && gpsError}
          </button>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#4a4070', marginBottom: '0.75rem' }}>
            or search manually
          </div>
        </>
      )}

      {/* Text input + dropdown */}
      <div style={{ position: 'relative' }}>
        <i className="ti ti-map-pin" aria-hidden style={{
          position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
          color: '#6b5f8a', fontSize: 15, pointerEvents: 'none', zIndex: 1,
        }} />
        <input
          type="text"
          id={id}
          value={query}
          onChange={handleInput}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder ?? 'Start typing a city…'}
          autoComplete="off"
        />
        {query && (
          <button onClick={handleClear} aria-label="Clear" style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            color: '#4a4070', fontSize: 14, cursor: 'pointer', background: 'none',
            border: 'none', padding: 2, zIndex: 2,
          }}>
            <i className="ti ti-x" aria-hidden />
          </button>
        )}

        {/* Dropdown */}
        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
            background: '#1a1628', border: '0.5px solid #3d2d6b', borderRadius: 8,
            zIndex: 100, maxHeight: 220, overflowY: 'auto',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}>
            {loading && (
              <div style={{ padding: '10px 14px', fontSize: 12, color: '#6b5f8a', display: 'flex', gap: 6 }}>
                <i className="ti ti-loader" aria-hidden /> Searching…
              </div>
            )}
            {!loading && results.length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: 12, color: '#6b5f8a' }}>
                No results — try a different spelling
              </div>
            )}
            {!loading && results.map((city, i) => (
              <div
                key={i}
                onClick={() => handleSelect(city)}
                style={{
                  padding: '10px 12px 10px 14px', fontSize: 13, color: '#c4b8e8',
                  cursor: 'pointer', borderBottom: i < results.length - 1 ? '0.5px solid #2e2b4a' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#261f40')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <i className="ti ti-map-pin" style={{ color: '#7c3aed', fontSize: 14, flexShrink: 0, marginTop: 2 }} aria-hidden />
                <div>
                  <div style={{ fontSize: 13, color: '#c4b8e8' }}>{city.name}</div>
                  <div style={{ fontSize: 11, color: '#6b5f8a', marginTop: 1 }}>
                    {[city.state, city.country].filter(Boolean).join(', ')}
                  </div>
                  <div style={{ fontSize: 10, color: '#3d3460', fontFamily: 'monospace', marginTop: 1 }}>
                    {city.lat.toFixed(4)}° N &nbsp;{city.lng.toFixed(4)}° E
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: '#4a4070', marginTop: 4 }}>
        <i className="ti ti-info-circle" style={{ fontSize: 12, verticalAlign: -1 }} aria-hidden />{' '}
        Select from the dropdown to save exact coordinates
      </p>
    </div>
  )
}
