import Cookies from 'js-cookie'
import type { TrialCookie, TrialStatus, OnboardingData } from '@/types'

const COOKIE_KEY = 'st_trial'
const TRIAL_DAYS = 3
const PREMIUM_KEY = 'st_premium'   // set server-side after Stripe webhook

// ── Write ─────────────────────────────────────────────
export function startTrial(data: OnboardingData): TrialCookie {
  const payload: TrialCookie = {
    startedAt: Date.now(),
    userId: crypto.randomUUID(),
    onboarding: data,
  }
  // expires after 365 days — we manage trial logic ourselves via startedAt
  Cookies.set(COOKIE_KEY, JSON.stringify(payload), {
    expires: 365,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return payload
}

// ── Read ──────────────────────────────────────────────
export function getTrialCookie(): TrialCookie | null {
  const raw = Cookies.get(COOKIE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as TrialCookie
  } catch {
    return null
  }
}

// ── Status ────────────────────────────────────────────
export function getTrialStatus(): TrialStatus {
  // premium flag (set via server-side cookie after Stripe webhook)
  if (Cookies.get(PREMIUM_KEY)) return 'premium'

  const trial = getTrialCookie()
  if (!trial) return 'none'

  const elapsedMs = Date.now() - trial.startedAt
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24)

  return elapsedDays <= TRIAL_DAYS ? 'trial' : 'expired'
}

// ── Days remaining ────────────────────────────────────
export function trialDaysRemaining(): number {
  const trial = getTrialCookie()
  if (!trial) return 0
  const elapsedDays = (Date.now() - trial.startedAt) / (1000 * 60 * 60 * 24)
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsedDays))
}

// ── Clear (logout / reset) ────────────────────────────
export function clearTrial(): void {
  Cookies.remove(COOKIE_KEY)
}
