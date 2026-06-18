'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TrustBar from './TrustBar'
import ProgressBar from './ProgressBar'
import {
  StepDOB,
  StepReveal,
  StepBirthCity,
  StepTOB,
  StepCurLoc,
  StepName,
  StepSummary,
} from './Steps'
import { startTrial } from '@/lib/trial'
import type { OnboardingData, OnboardingStep, CityResult } from '@/types'

const EMPTY: OnboardingData = {
  dob: '',
  tob: '',
  tobUnknown: false,
  birthCity: null,
  currentCity: null,
  name: '',
}

export default function OnboardingFlow() {
  const router              = useRouter()
  const [step, setStep]     = useState<OnboardingStep>('dob')
  const [data, setData]     = useState<OnboardingData>(EMPTY)

  function patch(partial: Partial<OnboardingData>) {
    setData(prev => ({ ...prev, ...partial }))
  }

  // ── Step handlers ──────────────────────────────────
  function onDOB(dob: string) {
    patch({ dob })
    setStep('reveal')
  }

  function onReveal() {
    setStep('birthcity')
  }

  function onBirthCity(birthCity: CityResult) {
    patch({ birthCity })
    setStep('tob')
  }

  function onTOB(tob: string, tobUnknown: boolean) {
    patch({ tob, tobUnknown })
    setStep('curloc')
  }

  function onCurLoc(currentCity: CityResult) {
    patch({ currentCity })
    setStep('name')
  }

  function onName(name: string) {
    patch({ name })
    setStep('summary')
  }

  function onDashboard() {
    // Write trial cookie with all collected data
    startTrial({ ...data })
    router.push('/dashboard')
  }

  // ── Logo shared header ─────────────────────────────
  const Logo = () => (
    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <i className="ti ti-moon-stars" style={{ fontSize: 30, color: '#a78bfa', display: 'block', marginBottom: 5 }} aria-hidden />
      <div style={{ fontSize: 20, fontWeight: 500, color: '#e2d9f3', letterSpacing: '0.04em' }}>Stellisia</div>
      <div style={{ fontSize: 12, color: '#6b5f8a', marginTop: 3 }}>Dual Astrology · Biohacking</div>
    </div>
  )

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <TrustBar />

      <div style={{
        background: '#0d0d1a',
        borderRadius: 16,
        padding: '2rem 1.5rem',
        width: '100%',
        maxWidth: 520,
      }}>
        <Logo />
        <ProgressBar step={step} />

        {step === 'dob'       && <StepDOB       data={data} onNext={onDOB}       />}
        {step === 'reveal'    && <StepReveal    data={data} onNext={onReveal}    />}
        {step === 'birthcity' && <StepBirthCity data={data} onNext={onBirthCity} />}
        {step === 'tob'       && <StepTOB       data={data} onNext={onTOB}       />}
        {step === 'curloc'    && <StepCurLoc    data={data} onNext={onCurLoc}    />}
        {step === 'name'      && <StepName      data={data} onNext={onName}      />}
        {step === 'summary'   && <StepSummary   data={data} onDashboard={onDashboard} />}
      </div>
    </main>
  )
}
