// ── Geo ──────────────────────────────────────────────
export interface CityResult {
  name: string
  country: string
  state: string
  lat: number
  lng: number
}

// ── Onboarding form state ─────────────────────────────
export type OnboardingStep =
  | 'dob'
  | 'reveal'
  | 'birthcity'
  | 'tob'
  | 'curloc'
  | 'name'
  | 'summary'

export interface OnboardingData {
  dob: string            // "YYYY-MM-DD"
  tob: string            // "HH:MM" — "12:00" if tobUnknown
  tobUnknown: boolean
  birthCity: CityResult | null
  currentCity: CityResult | null
  name: string
}

// ── Astrology ─────────────────────────────────────────
export interface WesternSign {
  name: string
  icon: string           // tabler icon class e.g. "ti-mountain"
  traits: string
}

export interface ChineseSign {
  name: string
  traits: string
  year: number
}

// ── Trial cookie payload ──────────────────────────────
export interface TrialCookie {
  startedAt: number      // Unix ms timestamp
  userId: string         // random uuid generated at onboarding
  onboarding: OnboardingData
}

export type TrialStatus = 'trial' | 'expired' | 'premium' | 'none'
