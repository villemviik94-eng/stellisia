'use client'

import { useState } from 'react'
import CitySearch from './CitySearch'
import { DatePicker } from './DatePicker'
import { TimeDrum } from './TimeDrum'
import { getWesternSign, getChineseSign } from '@/lib/astrology'
import type { OnboardingData, CityResult } from '@/types'

// ── Shared card shell ─────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#161628', border: '0.5px solid #2e2b4a', borderRadius: 16,
      padding: '1.5rem', maxWidth: 460, margin: '0 auto',
    }}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 17, fontWeight: 500, color: '#e2d9f3', marginBottom: 5 }}>{children}</h2>
}

function CardHint({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 12, color: '#6b5f8a', marginBottom: '1.25rem', lineHeight: 1.5 }}>{children}</p>
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: 11, color: '#8b7eb8', marginBottom: 5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {children}
      {!optional && <span style={{ color: '#7c3aed', marginLeft: 2 }}>*</span>}
      {optional  && <span style={{ color: '#4a4070', fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 4 }}>optional</span>}
    </label>
  )
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, color: '#f87171', marginTop: -8, marginBottom: 8 }}>{children}</p>
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#1a1408', border: '0.5px solid #78350f', borderRadius: 8,
      padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start',
      marginTop: '0.5rem', marginBottom: '0.75rem',
    }}>
      <i className="ti ti-alert-triangle" style={{ color: '#f59e0b', fontSize: 14, flexShrink: 0, marginTop: 1 }} aria-hidden />
      <span style={{ fontSize: 12, color: '#b45309', lineHeight: 1.5 }}>{children}</span>
    </div>
  )
}

function InputWrap({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', marginBottom: '1rem' }}>
      <i className={`ti ${icon}`} aria-hidden style={{
        position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
        color: '#6b5f8a', fontSize: 15, pointerEvents: 'none', zIndex: 1,
      }} />
      {children}
    </div>
  )
}

function PrimaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button className="btn-primary" onClick={onClick}>{children}</button>
  )
}

// ── STEP 1: Date of birth ─────────────────────────────
export function StepDOB({ data, onNext }: { data: OnboardingData; onNext: (dob: string) => void }) {
  const [dob, setDob] = useState(data.dob)
  const [err, setErr] = useState(false)

  function submit() {
    if (!dob) { setErr(true); return }
    setErr(false)
    onNext(dob)
  }

  return (
    <Card>
      <CardTitle>When were you born?</CardTitle>
      <CardHint>Your date instantly reveals your Western sun sign and Chinese zodiac animal.</CardHint>
      <FieldLabel>Date of birth</FieldLabel>
      <div style={{
        background: '#0d0d1a', border: `0.5px solid ${err ? '#7c2d2d' : '#2e2b4a'}`,
        borderRadius: 12, padding: '12px 10px', marginBottom: '0.75rem', transition: 'border-color 0.2s',
      }}>
        <DatePicker value={dob} onChange={v => { setDob(v); setErr(false) }} />
      </div>
      {err && <ErrMsg>Please select your date of birth</ErrMsg>}
      {dob && (
        <div style={{ fontSize: 12, color: '#6b5f8a', marginBottom: '0.5rem', textAlign: 'center' }}>
          Selected: <span style={{ color: '#9d8cc4' }}>{new Date(dob + 'T12:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      )}
      <PrimaryBtn onClick={submit}>
        <i className="ti ti-sparkles" aria-hidden /> Reveal my signs
      </PrimaryBtn>
    </Card>
  )
}

// ── STEP 2: Signs reveal ──────────────────────────────
export function StepReveal({ data, onNext }: { data: OnboardingData; onNext: () => void }) {
  const western = getWesternSign(data.dob)
  const chinese = getChineseSign(data.dob)

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#e2d9f3' }}>You are…</h2>
        <p style={{ fontSize: 12, color: '#6b5f8a', marginTop: 4 }}>Your dual cosmic identity</p>
      </div>

      <div style={{ background: '#1a1035', border: '0.5px solid #3d2d6b', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
        {/* Western */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '0.85rem' }}>
          <i className={`ti ${western.icon}`} style={{ fontSize: 26, color: '#a78bfa', flexShrink: 0, lineHeight: 1 }} aria-hidden />
          <div>
            <div style={{ fontSize: 10, color: '#6b5f8a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Western astrology</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#e2d9f3' }}>{western.name}</div>
            <div style={{ fontSize: 12, color: '#9d8cc4', marginTop: 2 }}>{western.traits}</div>
          </div>
        </div>

        <div style={{ borderTop: '0.5px solid #2e2b4a', margin: '0.75rem 0' }} />

        {/* Chinese */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <i className="ti ti-yin-yang" style={{ fontSize: 26, color: '#f59e0b', flexShrink: 0, lineHeight: 1 }} aria-hidden />
          <div>
            <div style={{ fontSize: 10, color: '#6b5f8a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Chinese astrology · {chinese.year}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#e2d9f3' }}>Year of the {chinese.name}</div>
            <div style={{ fontSize: 12, color: '#9d8cc4', marginTop: 2 }}>{chinese.traits}</div>
          </div>
        </div>
      </div>

      <PrimaryBtn onClick={onNext}>
        <i className="ti ti-arrow-right" aria-hidden /> Continue — add birth details
      </PrimaryBtn>
    </Card>
  )
}

// ── STEP 3: Birth city ────────────────────────────────
export function StepBirthCity({ data, onNext }: { data: OnboardingData; onNext: (city: CityResult) => void }) {
  const [city, setCity] = useState<CityResult | null>(data.birthCity)
  const [err, setErr]   = useState(false)

  function submit() {
    if (!city) { setErr(true); return }
    onNext(city)
  }

  return (
    <Card>
      <CardTitle>Where were you born?</CardTitle>
      <CardHint>Exact coordinates are needed to calculate your 12 astrological houses and ascendant.</CardHint>
      <FieldLabel>City of birth</FieldLabel>
      <CitySearch
        id="birthcity"
        value={city}
        onChange={c => { setCity(c); setErr(false) }}
        onClear={() => setCity(null)}
        placeholder="Start typing — e.g. Tallinn, Pärnu, New York…"
      />
      {err && <ErrMsg>Please select a city from the suggestions list</ErrMsg>}
      {city && (
        <PrimaryBtn onClick={submit}>
          <i className="ti ti-arrow-right" aria-hidden /> Continue
        </PrimaryBtn>
      )}
    </Card>
  )
}

// ── STEP 4: Time of birth ─────────────────────────────
export function StepTOB({ data, onNext }: { data: OnboardingData; onNext: (tob: string, unknown: boolean) => void }) {
  const [tob, setTob]         = useState(data.tob || '')
  const [unknown, setUnknown] = useState(data.tobUnknown)

  function submit() {
    onNext(unknown ? '12:00' : tob, unknown)
  }

  return (
    <Card>
      <CardTitle>What time were you born?</CardTitle>
      <CardHint>Used for your Rising sign, Moon sign, and all 12 houses. The more precise, the better.</CardHint>

      <FieldLabel optional>Time of birth</FieldLabel>
      <div style={{ marginBottom: '1rem', opacity: unknown ? 0.35 : 1, pointerEvents: unknown ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
        <TimeDrum value={unknown ? '12:00' : (tob || '12:00')} onChange={v => setTob(v)} />
      </div>

      {/* Unknown checkbox */}
      <label style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: '1rem',
        cursor: 'pointer', padding: '10px 12px', background: '#0d0d1a',
        border: `0.5px solid ${unknown ? '#3d2d6b' : '#2e2b4a'}`, borderRadius: 8, transition: 'border-color 0.2s',
      }}>
        <input
          type="checkbox"
          checked={unknown}
          onChange={e => setUnknown(e.target.checked)}
          style={{ marginTop: 1 }}
        />
        <div style={{ fontSize: 13, color: '#9d8cc4', lineHeight: 1.4 }}>
          <strong style={{ color: '#c4b8e8', fontWeight: 500 }}>I don't know my exact birth time</strong>
          <br />We'll use 12:00 PM as a neutral default
        </div>
      </label>

      {unknown && (
        <WarnBox>
          Without an exact birth time, your house positions and daily sensitivity charts will be approximate.
          You can update this later in your profile.
        </WarnBox>
      )}

      <PrimaryBtn onClick={submit}>
        <i className="ti ti-arrow-right" aria-hidden /> Continue
      </PrimaryBtn>
    </Card>
  )
}

// ── STEP 5: Current location ──────────────────────────
export function StepCurLoc({ data, onNext }: { data: OnboardingData; onNext: (city: CityResult) => void }) {
  const [city, setCity] = useState<CityResult | null>(data.currentCity)
  const [err, setErr]   = useState(false)

  function submit() {
    if (!city) { setErr(true); return }
    onNext(city)
  }

  return (
    <Card>
      <CardTitle>Where are you right now?</CardTitle>
      <CardHint>Used for real-time planetary transits and your personalized daily timing.</CardHint>
      <FieldLabel>Current city</FieldLabel>
      <CitySearch
        id="curloc"
        value={city}
        onChange={c => { setCity(c); setErr(false) }}
        onClear={() => setCity(null)}
        placeholder="Start typing a city…"
      />
      {err && <ErrMsg>Please select your current city</ErrMsg>}
      {city && (
        <PrimaryBtn onClick={submit}>
          <i className="ti ti-arrow-right" aria-hidden /> One last step
        </PrimaryBtn>
      )}
    </Card>
  )
}

// ── STEP 6: Name ──────────────────────────────────────
export function StepName({ data, onNext }: { data: OnboardingData; onNext: (name: string) => void }) {
  const [name, setName] = useState(data.name)
  const [err, setErr]   = useState(false)
  const western = getWesternSign(data.dob)

  function submit() {
    if (!name.trim()) { setErr(true); return }
    onNext(name.trim())
  }

  return (
    <Card>
      <CardTitle>Last step — what's your name?</CardTitle>
      <CardHint>We'll personalize your {western.name} profile and daily readings around you.</CardHint>
      <FieldLabel>Name</FieldLabel>
      <InputWrap icon="ti-user">
        <input
          type="text"
          value={name}
          placeholder="e.g. Sarah"
          autoComplete="given-name"
          className={err ? 'error' : ''}
          onChange={e => { setName(e.target.value); setErr(false) }}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </InputWrap>
      {err && <ErrMsg>Please enter your name to continue</ErrMsg>}
      <PrimaryBtn onClick={submit}>
        <i className="ti ti-rocket" aria-hidden /> Open my free dashboard
      </PrimaryBtn>
    </Card>
  )
}

// ── STEP 7: Summary ───────────────────────────────────
const FEATURES: { icon: string; label: string; sub: string; free: boolean; needsTime?: boolean }[] = [
  { icon: 'ti-chart-radar',    label: 'Sensitivity charts',    sub: 'Daily 0–100% readings',       free: true  },
  { icon: 'ti-moon',           label: 'Moon phase analysis',   sub: 'Lunar emotional rhythms',     free: true  },
  { icon: 'ti-layout-grid',    label: '12 astrological houses',sub: '',                             free: true, needsTime: true },
  { icon: 'ti-arrows-up',      label: 'Rising & ascendant',   sub: '',                             free: true, needsTime: true },
  { icon: 'ti-dna-2',          label: 'Biohacking protocols',  sub: 'Sleep & energy timing',       free: true  },
  { icon: 'ti-calendar-stats', label: '90-day forecast',       sub: 'From day 4 · $7.99/mo',       free: false },
]

export function StepSummary({ data, onDashboard }: { data: OnboardingData; onDashboard: () => void }) {
  const western = getWesternSign(data.dob)
  const chinese = getChineseSign(data.dob)
  const hasExactTime = !!data.tob && !data.tobUnknown

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: 20, fontWeight: 500, color: '#e2d9f3' }}>Welcome, {data.name.split(' ')[0]}</h2>
        <p style={{ fontSize: 12, color: '#6b5f8a', marginTop: 4 }}>
          {western.name} · Year of the {chinese.name}{data.birthCity ? ` · ${data.birthCity.name}` : ''}
        </p>
      </div>

      {/* Signs recap */}
      <div style={{ background: '#1a1035', border: '0.5px solid #3d2d6b', borderRadius: 16, padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: '0.85rem' }}>
          <i className={`ti ${western.icon}`} style={{ fontSize: 24, color: '#a78bfa', flexShrink: 0 }} aria-hidden />
          <div>
            <div style={{ fontSize: 10, color: '#6b5f8a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Western</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#e2d9f3' }}>{western.name}</div>
            <div style={{ fontSize: 12, color: '#9d8cc4' }}>{western.traits}</div>
          </div>
        </div>
        <div style={{ borderTop: '0.5px solid #2e2b4a', margin: '0.75rem 0' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <i className="ti ti-yin-yang" style={{ fontSize: 24, color: '#f59e0b', flexShrink: 0 }} aria-hidden />
          <div>
            <div style={{ fontSize: 10, color: '#6b5f8a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chinese · {chinese.year}</div>
            <div style={{ fontSize: 16, fontWeight: 500, color: '#e2d9f3' }}>Year of the {chinese.name}</div>
            <div style={{ fontSize: 12, color: '#9d8cc4' }}>{chinese.traits}</div>
          </div>
        </div>
      </div>

      {data.tobUnknown && (
        <WarnBox>
          You're using 12:00 PM as your birth time. Update it in your profile anytime for more accurate house readings.
        </WarnBox>
      )}

      {/* Feature grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1rem' }}>
        {FEATURES.map((f) => {
          const dim = (f.needsTime && !hasExactTime) || !f.free
          const sub = f.needsTime
            ? (hasExactTime ? 'Unlocked' : 'Needs exact birth time')
            : f.sub
          return (
            <div key={f.label} style={{
              background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 8,
              padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8,
              opacity: dim ? 0.5 : 1,
            }}>
              <i className={`ti ${f.icon}`} style={{ fontSize: 15, color: dim ? '#4a4070' : '#7c3aed', flexShrink: 0, marginTop: 1 }} aria-hidden />
              <div>
                <div style={{ fontSize: 12, color: '#9d8cc4', lineHeight: 1.3 }}>
                  {f.label}
                  {f.free && !dim && (
                    <span style={{
                      display: 'inline-block', background: '#1a1035', border: '0.5px solid #3d2d6b',
                      borderRadius: 4, fontSize: 10, color: '#a78bfa', padding: '1px 6px', marginLeft: 5,
                    }}>free</span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#4a4070', display: 'block', marginTop: 2 }}>
                  {dim && <i className="ti ti-lock" style={{ fontSize: 10 }} aria-hidden />} {sub}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <PrimaryBtn onClick={onDashboard}>
        <i className="ti ti-rocket" aria-hidden /> Open my free dashboard
      </PrimaryBtn>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#4a4070', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <i className="ti ti-shield-lock" style={{ fontSize: 12, color: '#6b5f8a' }} aria-hidden />
        3 days free · no credit card · 256-bit encrypted
      </div>
    </Card>
  )
}
