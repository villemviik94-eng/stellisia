'use client'

import type { OnboardingStep } from '@/types'

const STEP_MAP: Record<OnboardingStep, number> = {
  dob:       1,
  reveal:    2,
  birthcity: 3,
  tob:       4,
  curloc:    5,
  name:      6,
  summary:   6,
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  dob:       'Step 1 of 6 — Date of birth',
  reveal:    'Step 2 of 6 — Your signs',
  birthcity: 'Step 3 of 6 — Birth city',
  tob:       'Step 4 of 6 — Time of birth',
  curloc:    'Step 5 of 6 — Current location',
  name:      'Step 6 of 6 — Your name',
  summary:   'Your profile is ready',
}

const TOTAL = 6

interface Props {
  step: OnboardingStep
}

export default function ProgressBar({ step }: Props) {
  const current = STEP_MAP[step]

  return (
    <>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: '1.25rem' }}>
        {Array.from({ length: TOTAL }, (_, i) => {
          const n = i + 1
          const isDone   = n < current
          const isActive = n === current
          return (
            <div
              key={n}
              style={{
                height: 3,
                borderRadius: 2,
                flex: 1,
                maxWidth: 60,
                background: isDone ? '#7c3aed' : isActive ? '#a78bfa' : '#2e2b4a',
                transition: 'background 0.4s',
              }}
            />
          )
        })}
      </div>
      <p style={{
        textAlign: 'center',
        fontSize: 11,
        color: '#6b5f8a',
        letterSpacing: '0.06em',
        marginBottom: '1.25rem',
      }}>
        {STEP_LABELS[step]}
      </p>
    </>
  )
}
