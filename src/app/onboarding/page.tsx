import type { Metadata } from 'next'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export const metadata: Metadata = {
  title: 'Stellisia — Discover your cosmic profile',
  description: 'Enter your birth details to unlock your personalized Dual Astrology + Biohacking dashboard.',
}

export default function OnboardingPage() {
  return <OnboardingFlow />
}
