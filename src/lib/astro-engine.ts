// Simplified but mathematically grounded astronomical calculations.
// Uses mean orbital elements from J2000.0 — accurate to ~1–2° for display purposes.

const J2000_MS = new Date('2000-01-01T12:00:00Z').getTime()

export function jde(date: Date = new Date()): number {
  return (date.getTime() - J2000_MS) / 86_400_000
}

// Mean longitude at J2000, daily motion (degrees/day)
const ORBITAL = {
  Sun:     { L0: 280.46457, n: 0.98564736  },
  Moon:    { L0: 218.31645, n: 13.17639    },
  Mercury: { L0: 252.25084, n: 4.09233445  },
  Venus:   { L0: 181.97973, n: 1.60213034  },
  Mars:    { L0: 355.43300, n: 0.52402068  },
  Jupiter: { L0: 34.39644,  n: 0.08308529  },
  Saturn:  { L0: 50.07748,  n: 0.03345914  },
} as const

export type PlanetKey = keyof typeof ORBITAL

export function lonOf(planet: PlanetKey, d: number = jde()): number {
  const { L0, n } = ORBITAL[planet]
  return ((L0 + n * d) % 360 + 360) % 360
}

export const ZODIAC = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
] as const

export type ZodiacSign = typeof ZODIAC[number]

export function signOf(lon: number): ZodiacSign {
  return ZODIAC[Math.floor(((lon % 360) + 360) % 360 / 30)]
}

export function degOf(lon: number): number {
  return Math.floor(((lon % 360) + 360) % 360 % 30)
}

// ── Aspects ────────────────────────────────────────────────────────────────

export type AspectName = 'conjunction'|'sextile'|'square'|'trine'|'opposition'

const ASPECT_DEFS = [
  { name: 'conjunction' as const, angle: 0,   orb: 8 },
  { name: 'sextile'     as const, angle: 60,  orb: 5 },
  { name: 'square'      as const, angle: 90,  orb: 7 },
  { name: 'trine'       as const, angle: 120, orb: 8 },
  { name: 'opposition'  as const, angle: 180, orb: 8 },
]

export function aspectBetween(a: number, b: number): AspectName | null {
  const diff  = ((a - b) % 360 + 360) % 360
  const angle = diff > 180 ? 360 - diff : diff
  for (const asp of ASPECT_DEFS) {
    if (Math.abs(angle - asp.angle) <= asp.orb) return asp.name
  }
  return null
}

export const ASPECT_VERB: Record<AspectName, string> = {
  conjunction: 'conjuncts',
  sextile:     'sextiles',
  square:      'squares',
  trine:       'trines',
  opposition:  'opposes',
}

export const ASPECT_QUALITY: Record<AspectName, string> = {
  conjunction: 'merging intensity — energies fuse and amplify',
  sextile:     'cooperative flow — resources open with minimal resistance',
  square:      'productive friction — pressure that converts directly into output',
  trine:       'effortless alignment — things click without forcing',
  opposition:  'clarifying tension — contrast sharpens awareness',
}

// ── Planet snapshots ───────────────────────────────────────────────────────

export type PlanetMap = Record<PlanetKey, number>

export function currentPlanets(date?: Date): PlanetMap {
  const d = jde(date)
  return Object.fromEntries(
    (Object.keys(ORBITAL) as PlanetKey[]).map(p => [p, lonOf(p, d)])
  ) as PlanetMap
}

export function natalPlanets(dob: string, tob: string): PlanetMap {
  const d = jde(new Date(`${dob}T${tob || '12:00'}:00`))
  return Object.fromEntries(
    (Object.keys(ORBITAL) as PlanetKey[]).map(p => [p, lonOf(p, d)])
  ) as PlanetMap
}

// ── Ascendant (equal house from Local Sidereal Time at birth) ──────────────

export function calcAscendant(dob: string, tob: string, lat: number, lng: number): ZodiacSign {
  const d   = jde(new Date(`${dob}T${tob || '12:00'}:00`))
  const obl = (23.4393 - 0.0000003563 * d) * Math.PI / 180
  const GMST  = ((280.46061837 + 360.98564736629 * d) % 360 + 360) % 360
  const LMST  = ((GMST + lng) % 360 + 360) % 360
  const lmstR = LMST * Math.PI / 180
  const latR  = lat  * Math.PI / 180
  const ascLon = (Math.atan2(
    Math.cos(lmstR),
    -(Math.sin(lmstR) * Math.cos(obl) + Math.tan(latR) * Math.sin(obl))
  ) * 180 / Math.PI + 360) % 360
  return signOf(ascLon)
}

// House number in equal-house system (1–12, house 1 = ascendant sign)
export function houseOf(planetSign: ZodiacSign, ascSign: ZodiacSign): number {
  return ((ZODIAC.indexOf(planetSign) - ZODIAC.indexOf(ascSign) + 12) % 12) + 1
}

// ── House themes ───────────────────────────────────────────────────────────

export const HOUSE_THEMES: Record<number, string> = {
  1:  'identity and self-projection',
  2:  'personal finances and values',
  3:  'communication and local movement',
  4:  'home, roots and emotional foundation',
  5:  'creativity, romance and self-expression',
  6:  'daily work rhythms and body maintenance',
  7:  'key partnerships and one-on-one dynamics',
  8:  'transformation, depth and shared resources',
  9:  'higher vision, travel and belief systems',
  10: 'career trajectory and public reputation',
  11: 'networks, community and future aspirations',
  12: 'solitude, inner wisdom and hidden patterns',
}

// ── Today's transits ───────────────────────────────────────────────────────

export interface Transit {
  transiting:  PlanetKey
  natalPlanet: PlanetKey
  aspect:      AspectName
}

export function keyTransits(natal: PlanetMap, current: PlanetMap): Transit[] {
  const results: Transit[] = []
  const tPlanets: PlanetKey[] = ['Moon','Sun','Mercury','Venus','Mars','Jupiter','Saturn']
  const nPlanets: PlanetKey[] = ['Sun','Moon','Mercury','Venus','Mars']
  for (const tp of tPlanets) {
    for (const np of nPlanets) {
      if (tp === np) continue
      const asp = aspectBetween(current[tp], natal[np])
      if (asp) {
        results.push({ transiting: tp, natalPlanet: np, aspect: asp })
        if (results.length >= 5) return results
      }
    }
  }
  return results
}

// ── Moon cosmic shift ──────────────────────────────────────────────────────

export interface MoonInfo {
  lon:           number
  sign:          ZodiacSign
  deg:           number
  minutesToNext: number
}

export function moonInfo(date?: Date): MoonInfo {
  const lon  = lonOf('Moon', jde(date))
  const minsPerDeg = (1 / 13.17639) * 24 * 60   // ~109 min per degree
  const degsToNextSign = 30 - (lon % 30)
  const minutesToNext = degsToNextSign * minsPerDeg
  return { lon, sign: signOf(lon), deg: degOf(lon), minutesToNext }
}

// ── Mars local meridian window ─────────────────────────────────────────────
// When Mars transits the local meridian it is at maximum elevation — used
// as a proxy for a high-focus "local space" productivity window.

export function marsLocalWindow(currentLng: number): { peakAt: string; endsAt: string } {
  const marsLon = lonOf('Mars')
  const d     = jde()
  const GMST  = ((280.46061837 + 360.98564736629 * d) % 360 + 360) % 360
  const LMST  = ((GMST + currentLng) % 360 + 360) % 360

  // Hour angle: positive = west of meridian, negative = east (rising)
  let HA = ((LMST - marsLon) % 360 + 360) % 360
  if (HA > 180) HA -= 360

  let hoursToTransit = -HA / 15
  if (hoursToTransit < 0)  hoursToTransit += 24
  if (hoursToTransit > 12) hoursToTransit -= 12

  const now     = new Date()
  const peakDt  = new Date(now.getTime() + hoursToTransit  * 3_600_000)
  const endDt   = new Date(peakDt.getTime() + 2.5          * 3_600_000)
  const fmt     = (dt: Date) => dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return { peakAt: fmt(peakDt), endsAt: fmt(endDt) }
}

// ── Biorhythm computation ──────────────────────────────────────────────────

export interface Metrics {
  mental:    number
  emotional: number
  career:    number
  physical:  number
}

export function computeMetrics(dob: string, date?: Date): Metrics {
  const target = date ?? new Date()
  const days  = Math.floor((target.getTime() - new Date(dob + 'T12:00').getTime()) / 86_400_000)
  const PI2   = 2 * Math.PI
  const phy   = Math.sin((PI2 * days) / 23)
  const emo   = Math.sin((PI2 * days) / 28)
  const int_  = Math.sin((PI2 * days) / 33)
  const lunar = (target.getTime() - new Date('2024-01-11').getTime()) / 86_400_000
  const moon  = Math.sin(((lunar % 29.53) / 29.53) * PI2 - Math.PI / 2)
  const pct   = (v: number) => Math.min(97, Math.max(3, Math.round((v + 1) * 50)))
  return {
    mental:    pct(int_ * 0.55 + moon * 0.45),
    emotional: pct(emo  * 0.65 + moon * 0.35),
    career:    pct(phy  * 0.45 + int_ * 0.55),
    physical:  pct(phy),
  }
}

// ── Timeframe Tags ─────────────────────────────────────────────────────────

export interface TimeframeTag {
  emoji: string
  label: string
  from?: string   // starting state (arc)
  to?: string     // ending state (arc)
  type: 'arc' | 'dominant' | 'lesson' | 'growth'
}

function ordH(n: number): string {
  if (n === 1) return '1st'
  if (n === 2) return '2nd'
  if (n === 3) return '3rd'
  return `${n}th`
}

// Week: Moon sign arc + Mercury arc (or Sun in house if Mercury stable)
export function weekTags(ascendant: ZodiacSign | null): TimeframeTag[] {
  const dNow  = jde()
  const dWeek = jde(new Date(Date.now() + 7 * 86_400_000))

  const moonNow  = signOf(lonOf('Moon',    dNow))
  const moonWeek = signOf(lonOf('Moon',    dWeek))
  const mercNow  = signOf(lonOf('Mercury', dNow))
  const mercWeek = signOf(lonOf('Mercury', dWeek))
  const sunNow   = signOf(lonOf('Sun',     dNow))

  const tag1: TimeframeTag = moonNow !== moonWeek
    ? { emoji: '🌙', label: 'Moon', from: moonNow, to: moonWeek, type: 'arc' }
    : { emoji: '🌙', label: `Moon in ${moonNow}`, type: 'dominant' }

  let tag2: TimeframeTag
  if (mercNow !== mercWeek) {
    tag2 = { emoji: '💬', label: 'Mercury', from: mercNow, to: mercWeek, type: 'arc' }
  } else if (ascendant) {
    tag2 = { emoji: '☀️', label: `Sun · ${ordH(houseOf(sunNow, ascendant))} House`, type: 'dominant' }
  } else {
    tag2 = { emoji: '☀️', label: `Sun in ${sunNow}`, type: 'dominant' }
  }

  return [tag1, tag2]
}

// Month: Sun sign arc + next full moon house (or Mars if no full moon this month)
export function monthTags(ascendant: ZodiacSign | null): TimeframeTag[] {
  const dNow   = jde()
  const dMonth = jde(new Date(Date.now() + 30 * 86_400_000))

  const sunNow   = signOf(lonOf('Sun', dNow))
  const sunMonth = signOf(lonOf('Sun', dMonth))

  const tag1: TimeframeTag = sunNow !== sunMonth
    ? { emoji: '☀️', label: 'Sun', from: sunNow, to: sunMonth, type: 'arc' }
    : { emoji: '☀️', label: `Sun in ${sunNow}`, type: 'dominant' }

  const phase      = ((Date.now() - new Date('2024-01-11').getTime()) / 86_400_000 % 29.53 + 29.53) % 29.53
  const daysToFull = phase < 14.765 ? 14.765 - phase : 14.765 + (29.53 - phase)

  let tag2: TimeframeTag
  if (daysToFull <= 30) {
    const fullSign = signOf(lonOf('Moon', jde(new Date(Date.now() + daysToFull * 86_400_000))))
    tag2 = ascendant
      ? { emoji: '🌕', label: `Full Moon · ${ordH(houseOf(fullSign, ascendant))} House`, type: 'dominant' }
      : { emoji: '🌕', label: `Full Moon in ${fullSign}`, type: 'dominant' }
  } else {
    tag2 = { emoji: '⚡', label: `Mars in ${signOf(lonOf('Mars', dNow))}`, type: 'dominant' }
  }

  return [tag1, tag2]
}

// Year: Saturn house lesson + Jupiter house growth arc
export function yearTags(ascendant: ZodiacSign | null): TimeframeTag[] {
  const dNow  = jde()
  const dYear = jde(new Date(Date.now() + 365 * 86_400_000))

  let tag1: TimeframeTag
  if (ascendant) {
    const satH0 = houseOf(signOf(lonOf('Saturn', dNow)),  ascendant)
    const satH1 = houseOf(signOf(lonOf('Saturn', dYear)), ascendant)
    tag1 = satH0 !== satH1
      ? { emoji: '🪐', label: 'Saturn', from: `${ordH(satH0)} House`, to: `${ordH(satH1)} House`, type: 'lesson' }
      : { emoji: '🪐', label: `Saturn · ${ordH(satH0)} House`, type: 'lesson' }
  } else {
    tag1 = { emoji: '🪐', label: `Saturn in ${signOf(lonOf('Saturn', dNow))}`, type: 'lesson' }
  }

  let tag2: TimeframeTag
  if (ascendant) {
    const jupH0 = houseOf(signOf(lonOf('Jupiter', dNow)),  ascendant)
    const jupH1 = houseOf(signOf(lonOf('Jupiter', dYear)), ascendant)
    tag2 = jupH0 !== jupH1
      ? { emoji: '🍀', label: 'Jupiter', from: `${ordH(jupH0)} House`, to: `${ordH(jupH1)} House`, type: 'growth' }
      : { emoji: '🍀', label: `Jupiter · ${ordH(jupH0)} House`, type: 'growth' }
  } else {
    const jupS0 = signOf(lonOf('Jupiter', dNow))
    const jupS1 = signOf(lonOf('Jupiter', dYear))
    tag2 = jupS0 !== jupS1
      ? { emoji: '🍀', label: 'Jupiter', from: jupS0, to: jupS1, type: 'growth' }
      : { emoji: '🍀', label: `Jupiter in ${jupS0}`, type: 'growth' }
  }

  return [tag1, tag2]
}

// ── Moon phase ─────────────────────────────────────────────────────────────

export function moonPhaseLabel(): { emoji: string; label: string } {
  const lunar = (Date.now() - new Date('2024-01-11').getTime()) / 86_400_000
  const p     = ((lunar % 29.53) + 29.53) % 29.53 / 29.53
  if (p < 0.07) return { emoji: '🌑', label: 'New Moon' }
  if (p < 0.25) return { emoji: '🌒', label: 'Waxing Crescent' }
  if (p < 0.32) return { emoji: '🌓', label: 'First Quarter' }
  if (p < 0.46) return { emoji: '🌔', label: 'Waxing Gibbous' }
  if (p < 0.54) return { emoji: '🌕', label: 'Full Moon' }
  if (p < 0.68) return { emoji: '🌖', label: 'Waning Gibbous' }
  if (p < 0.75) return { emoji: '🌗', label: 'Last Quarter' }
  return              { emoji: '🌘', label: 'Waning Crescent' }
}
