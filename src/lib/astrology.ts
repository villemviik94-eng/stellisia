import type { WesternSign, ChineseSign } from '@/types'

// ── Western zodiac ────────────────────────────────────
const WESTERN_SIGNS: WesternSign[] = [
  { name: 'Capricorn',   icon: 'ti-mountain',   traits: 'Ambitious · Disciplined · Grounded' },
  { name: 'Aquarius',    icon: 'ti-wave-sine',   traits: 'Visionary · Independent · Humanitarian' },
  { name: 'Pisces',      icon: 'ti-fish',        traits: 'Intuitive · Empathetic · Dreamy' },
  { name: 'Aries',       icon: 'ti-flame',       traits: 'Bold · Driven · Pioneering' },
  { name: 'Taurus',      icon: 'ti-leaf',        traits: 'Patient · Sensual · Steadfast' },
  { name: 'Gemini',      icon: 'ti-affiliate',   traits: 'Curious · Adaptable · Expressive' },
  { name: 'Cancer',      icon: 'ti-moon',        traits: 'Nurturing · Intuitive · Loyal' },
  { name: 'Leo',         icon: 'ti-sun',         traits: 'Radiant · Generous · Creative' },
  { name: 'Virgo',       icon: 'ti-plant',       traits: 'Analytical · Precise · Dedicated' },
  { name: 'Libra',       icon: 'ti-scale',       traits: 'Balanced · Charming · Just' },
  { name: 'Scorpio',     icon: 'ti-bug',         traits: 'Intense · Perceptive · Transformative' },
  { name: 'Sagittarius', icon: 'ti-bow-arrow',   traits: 'Free-spirited · Optimistic · Philosophical' },
]

export function getWesternSign(dob: string): WesternSign {
  const dt = new Date(dob)
  const m = dt.getMonth() + 1
  const d = dt.getDate()

  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return WESTERN_SIGNS[0]
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return WESTERN_SIGNS[1]
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return WESTERN_SIGNS[2]
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return WESTERN_SIGNS[3]
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return WESTERN_SIGNS[4]
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return WESTERN_SIGNS[5]
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return WESTERN_SIGNS[6]
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return WESTERN_SIGNS[7]
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return WESTERN_SIGNS[8]
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return WESTERN_SIGNS[9]
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return WESTERN_SIGNS[10]
  return WESTERN_SIGNS[11]
}

// ── Chinese zodiac ────────────────────────────────────
// NOTE: Production should account for the exact Chinese New Year date
// (which falls in Jan/Feb). For a year that starts in Jan/Feb before
// CNY the animal should be the previous year's. Store birthCity timezone
// and use a CNY lookup table for precision.
const CHINESE_ANIMALS = [
  'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig',
]

const CHINESE_TRAITS = [
  'Clever · Resourceful · Quick-witted',
  'Reliable · Strong · Honest',
  'Brave · Magnetic · Unpredictable',
  'Gentle · Elegant · Compassionate',
  'Powerful · Lucky · Wise',
  'Mysterious · Intuitive · Refined',
  'Free · Energetic · Open-minded',
  'Calm · Gentle · Creative',
  'Playful · Curious · Versatile',
  'Confident · Observant · Ambitious',
  'Loyal · Honest · Protective',
  'Generous · Sincere · Warm-hearted',
]

export function getChineseSign(dob: string): ChineseSign {
  const year = new Date(dob).getFullYear()
  const idx = ((year - 1900) % 12 + 12) % 12
  return {
    name: CHINESE_ANIMALS[idx],
    traits: CHINESE_TRAITS[idx],
    year,
  }
}
