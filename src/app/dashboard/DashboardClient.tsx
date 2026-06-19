'use client'

import { useState, useEffect, useCallback } from 'react'
import { getTrialCookie, getTrialStatus, trialDaysRemaining } from '@/lib/trial'
import { getWesternSign, getChineseSign } from '@/lib/astrology'
import {
  currentPlanets, natalPlanets, calcAscendant, keyTransits,
  moonInfo, moonPhaseLabel, computeMetrics, marsLocalWindow,
  weekTags, monthTags, yearTags,
  signOf, degOf, houseOf, lonOf, ZODIAC,
  ASPECT_VERB, ASPECT_QUALITY, HOUSE_THEMES,
  type Transit, type Metrics, type ZodiacSign, type PlanetMap, type AspectName, type TimeframeTag,
} from '@/lib/astro-engine'
import SignModal, { type ModalPlacement } from '@/components/SignModal'
import type { TrialCookie, TrialStatus } from '@/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function levelTag(pct: number): { label: string; color: string } {
  if (pct >= 80) return { label: 'PEAK',     color: '#34d399' }
  if (pct >= 60) return { label: 'HIGH',      color: '#a3e635' }
  if (pct >= 40) return { label: 'MODERATE',  color: '#fbbf24' }
  if (pct >= 25) return { label: 'LOW',       color: '#f97316' }
  return              { label: 'CRITICAL',  color: '#f87171' }
}

function fmtCountdown(totalMinutes: number): string {
  const d = Math.floor(totalMinutes / (60 * 24))
  const h = Math.floor((totalMinutes % (60 * 24)) / 60)
  const m = Math.floor(totalMinutes % 60)
  const s = Math.floor((totalMinutes * 60) % 60)
  if (d > 0) return `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`
  return `${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`
}

// ── Horoscope engine ───────────────────────────────────────────────────────

function buildCoreHoro(name: string, sign: string): { big: string; weapon: string; warning: string } {
  const n = name
  const cores: Record<string, { big: string; weapon: string; warning: string }> = {
    Aries: {
      big: `${n}, there's a fire running under your skin today that you can't quite name — part restlessness, part something that hasn't been let out yet. That pressure isn't a problem. It's information. The thing that's been blocked isn't blocked anymore; it just needs you to stop second-guessing the impulse and move.`,
      weapon: `The version of you that acts before the fear catches up. That split-second window between instinct and overthinking is where your real power lives, and today it's wide open. Most people deliberate until the moment passes. You don't have to.`,
      warning: `The sharpness in you right now will cut the people who deserve your softness just as fast as the ones who deserve your fire. You're right about what you want to say — but the way you're about to say it will cost you the relationship. One breath first.`,
    },
    Taurus: {
      big: `${n}, if there's an unnameable tightness in your chest this morning — a quiet hum of "is this actually enough?" — that's not anxiety. That's the part of you that senses something shifting. The ground under you is holding. Stop bracing for it to fall.`,
      weapon: `The kind of patience that looks like stillness from the outside and absolute precision from the inside. You know how to wait until the moment is actually ready — and then move once, exactly right, and it holds.`,
      warning: `Comfort is wearing the face of safety today, and they're not the same thing. There's something you've been orbiting without touching. The weight of not addressing it is heavier than addressing it would ever be.`,
    },
    Gemini: {
      big: `${n}, you wake up carrying a quiet longing you rarely let yourself name: to be truly known, not just appreciated for how fast and bright you move. Something in the field is inviting you to slow down for one real connection. That version of you is the one they actually want to reach.`,
      weapon: `The ability to make someone feel completely understood in under three minutes — not through technique, but through the way you actually listen when you decide to. Today you're reading people at a depth that surprises even you.`,
      warning: `You're moving at your speed and everyone else is moving at theirs, and the gap is creating small fractures you haven't noticed yet. The most important thing you say today will land wrong if you don't slow down to feel the room first.`,
    },
    Cancer: {
      big: `${n}, you've been carrying something that isn't yours — the weight of someone else's sadness, their unspoken need — until you've started to confuse it with your own interior weather. Today the chart creates a clear boundary: what's yours, and what's been given to you to hold. You're allowed to set it down.`,
      weapon: `You know what's happening in a room before anyone says a word — the undercurrent, the person who's quietly coming apart at the edges. That's not a burden. That's an extraordinary gift that makes you irreplaceable.`,
      warning: `Your nervous system has been absorbing input all day and hasn't stopped to breathe. Find ten minutes — not to process or plan, just to exist in a quiet room without anyone needing anything from you. This is maintenance, not luxury.`,
    },
    Leo: {
      big: `${n}, there's a quiet ache beneath the shine today — the kind you've gotten very good at not letting show. You don't have to earn your space today. Your presence — unperformed, without the golden glow — is the thing that actually changes rooms.`,
      weapon: `When you turn your full attention on someone — really on them, not performing interest but actually curious — they feel it as something close to being loved. Today that quality in you is luminous, and people will remember this conversation for years.`,
      warning: `The Lion's deepest shadow is pride dressed as principle. You're about to dismiss a piece of feedback that's actually right. You can hold your dignity and take in the information at the same time. The version of you that can do both is the one people actually follow.`,
    },
    Virgo: {
      big: `${n}, the inner critic has been loud lately — measuring everything against an impossible standard. The gap between who you are and who you think you should be is not as wide as that voice makes it feel. Someone in your orbit is watching you thinking: I want to be that capable.`,
      weapon: `You notice the thing no one else caught — the detail, the small broken piece creating the large systemic problem — and fix it without making a fuss. That quiet competence is your most underestimated gift, and today it's running at full capacity.`,
      warning: `The thing you're holding back until it's "ready" — it's ready. The hesitation is protecting you from something that isn't actually a threat. The standard is in service of avoiding vulnerability now, not the work.`,
    },
    Libra: {
      big: `${n}, somewhere inside you there's an opinion you've been carefully not having — a truth you've softened, a boundary you've made negotiable. The version of you that keeps the peace by disappearing is not actually at peace. The people who love you can only meet you as deeply as you're willing to be honest.`,
      weapon: `You see all sides simultaneously — not as indecision, but as a panoramic view no one else in the room has access to. That clarity, when you trust and act on it, is what makes you genuinely irreplaceable.`,
      warning: `People-pleasing has a convincing disguise today: kindness, keeping the peace, being the bigger person. But the honest assessment you're about to swallow is precisely what the other person needs from you to actually grow. Your silence is not neutral.`,
    },
    Scorpio: {
      big: `${n}, you've been sensing something for weeks — a pattern, a shift in the current that no one else is naming. You've probably dismissed it twice already. You weren't wrong. The chart today is confirming what your gut already decided.`,
      weapon: `The capacity to sit inside a hard truth without flinching, without fleeing, without managing it into something more comfortable. Most people can't hold that kind of heat. You can. And today, that makes all the difference.`,
      warning: `The thing you're withholding — you're keeping it because releasing it means releasing control. But what you're actually protecting yourself from isn't danger. It's intimacy. The door is there if you want to open it.`,
    },
    Sagittarius: {
      big: `${n}, underneath the optimism and the horizon-chasing, there's something you've been running from quietly — not out of cowardice, but because it doesn't have a name yet. The next big thing isn't out there. It's right here, in the thing you haven't finished yet.`,
      weapon: `Your relentless forward motion — the way you make moving feel exciting rather than terrifying, the way you bring people along into uncertainty because you make it feel like adventure. Today it ignites something in someone who desperately needed to believe in movement again.`,
      warning: `There are more open loops in your life right now than you're tracking. One closure today creates more real momentum than three new beginnings. The incompletions are heavier than they look.`,
    },
    Capricorn: {
      big: `${n}, you've been holding so much for so long. I want you to hear this clearly: the structure is holding. You built it to hold. You are not one unguarded moment away from failure. You are allowed to breathe inside the life you've worked this hard to build.`,
      weapon: `The ability to look twenty moves ahead while everyone around you is still reacting to move two. Today you see something others won't see for months, and you have time to position yourself before they realize the opportunity exists.`,
      warning: `One person close to you is already cracking under the standard you hold — and they don't know how to tell you. Create a small opening for human imperfection today before you lose something you can't rebuild.`,
    },
    Aquarius: {
      big: `${n}, the distance you keep isn't coldness — it's protection. But something in the chart today is reaching through that glass. A moment of genuine connection is available if you want to take it. That's a door worth opening.`,
      weapon: `The ability to see the shape of things before they exist — to sense where the world is going while everyone else is still arguing about where it's been. That vision, trusted and acted on, puts you years ahead of the room.`,
      warning: `The detachment that protects you is costing you something you haven't quite named. Someone today is trying to reach through. The analysis of whether they're "worth it" is the thing standing in your way, not them.`,
    },
    Pisces: {
      big: `${n}, you've been disappearing into other people's realities again until your own edges have become difficult to locate. Today something in the chart is giving you your outline back. Take up your space. It belongs to you.`,
      weapon: `An empathy so precise it functions like telepathy — you feel what someone is carrying before they open their mouth, and you know instinctively what they need to hear versus what they're asking for. Trust what you feel without requiring evidence.`,
      warning: `You've absorbed someone else's emotional weight so gradually you've stopped noticing it's not yours. Some of it belongs to someone else, and they can handle it — they just haven't had to, because you've been holding it for them. Setting it down is an act of love, not abandonment.`,
    },
  }
  return cores[sign] ?? cores['Leo']
}

const CHINESE_BRIDGE: Record<string, string> = {
  Rat:     'And underneath it all, the Rat in you is watching — quietly calculating, two moves ahead, turning what others see as chaos into a personal advantage. That instinct isn\'t cynicism. It\'s survival intelligence, and today it\'s pointing you somewhere real.',
  Ox:      'The Ox in your foundation means that what you build today actually holds — not through luck, but through a bone-deep stubbornness that refuses to let things collapse. People will feel that steadiness in you long after this moment passes.',
  Tiger:   'The Tiger beneath your surface is awake today — that wild, unpredictable current that makes people in rooms unconsciously orient toward you. You don\'t have to perform it. It\'s already there, already working, already pulling the right things toward you.',
  Rabbit:  'The Rabbit in you carries a kind of grace under pressure that\'s almost invisible — a softening that happens at exactly the right moment, that makes the hard thing land without bruising. That is not weakness. That is surgical precision.',
  Dragon:  'The Dragon\'s fortune is not luck — it\'s the accumulated momentum of someone who has refused to stop. That energy is running hot in you today. The instinct that arrives suddenly, the door that appears without explanation: that\'s the Dragon opening things.',
  Snake:   'The Snake in you sees around corners that others won\'t notice for weeks. That quiet intuition — the one you sometimes second-guess because it arrived without evidence — is the most reliable intelligence you have. It\'s been right before. It\'s right now.',
  Horse:   'The Horse in you is restless in the best possible way today — that open, wind-in-your-face energy that makes starting things feel like freedom rather than risk. Use it. The stagnation you\'ve been feeling is already dissolving.',
  Goat:    'The Goat in you carries an artistic intelligence that lives underneath every practical thing you do — a way of seeing beauty in the structure, meaning in the texture of ordinary moments. Today that quality softens everything around you in ways you may not even notice you\'re doing.',
  Monkey:  'The Monkey in you is lit up today — that quick, joyful, irreverent intelligence that finds the thing everyone else missed and makes it look obvious in retrospect. Follow the thread that feels like play. It\'s not a distraction. It\'s the actual path.',
  Rooster: 'The Rooster in you sees clearly what others are performing around. You notice the gap between what\'s being said and what\'s actually true, and today that perception is running so cleanly it borders on uncomfortable. Trust it. You\'re not imagining it.',
  Dog:     'The Dog in you is loyal to something today that deserves that loyalty — a person, a principle, a version of yourself you\'ve been protecting. That through-line of honesty, even when it costs something, is what makes you trustworthy in a way most people can only aspire to.',
  Pig:     'The Pig in you genuinely, unself-consciously cares — and people feel the difference between that and performance immediately. Today that warmth lands as something close to sanctuary for someone in your orbit who\'s been running on empty and didn\'t know they needed to be seen.',
}

const RISING_QUALITY: Record<string, string> = {
  Aries: 'direct personal magnetism and physical presence',
  Taurus: 'calm authority and grounded aesthetic instinct',
  Gemini: 'quick verbal wit and perceptive social radar',
  Cancer: 'emotional intelligence and protective warmth',
  Leo: 'natural leadership presence and creative charisma',
  Virgo: 'precise analytical clarity and quiet competence',
  Libra: 'diplomatic grace and natural aesthetic calibration',
  Scorpio: 'piercing perceptiveness and magnetic intensity',
  Sagittarius: 'enthusiastic vision and expansive thinking',
  Capricorn: 'quiet authority and strategic long-range thinking',
  Aquarius: 'original perspective and forward-looking insight',
  Pisces: 'empathic resonance and fluid adaptability',
}

const ASPECT_FEEL: Record<AspectName, string> = {
  conjunction: 'fusing them into something almost too intense to ignore — a signal so strong it cuts through the noise',
  sextile:     'quietly opening a door that wasn\'t there yesterday — no fanfare, just a clear path that wasn\'t visible before',
  square:      'creating the kind of friction that either breaks things open or breaks them — the difference is entirely in how you meet it',
  trine:       'running a current in your direction without you having to swim against anything — a rare, unearned ease that you should use, not question',
  opposition:  'pulling two parts of you in opposite directions until the tension itself becomes a kind of lucidity — hold both without collapsing into either',
}

const RISING_DEPTH: Record<string, string> = {
  Aries:       'a fire in your immediate presence that people either lean into or step back from — there\'s no neutral reaction to you today',
  Taurus:      'a gravitational calm that makes people feel safe enough to say the thing they\'ve been sitting on',
  Gemini:      'a quicksilver wit that makes even the heaviest subjects feel navigable and alive',
  Cancer:      'an emotional permeability — you feel the room before you read it, and the room feels you',
  Leo:         'a solar quality that makes whoever you\'re with feel like the moment they\'re in actually matters',
  Virgo:       'a precision that other people experience as being genuinely, specifically understood — not generically heard',
  Libra:       'a balancing weight — your presence alone shifts the quality of a conversation toward something more honest',
  Scorpio:     'an X-ray quality — people sense, without knowing why, that you already know',
  Sagittarius: 'a contagious forward-leaning energy that makes possibility feel more real than fear',
  Capricorn:   'a quiet, load-bearing authority that other people instinctively orient around',
  Aquarius:    'a frequency that\'s slightly ahead of the room — people don\'t always know what you mean immediately, but they remember it',
  Pisces:      'a dissolving warmth — the edges between you and others become permeable in a way that\'s both beautiful and something to be careful with',
}

const TEASER_HOOKS: Record<string, (name: string, moonSign: string) => string> = {
  Aries:       (n, m) => `${n}, something that's been blocked is starting to move — and the Moon in ${m} is the reason why. Today has a specific window in it. You'll feel it before you understand it.`,
  Taurus:      (n, m) => `${n}, the Moon in ${m} is touching something in your chart that only happens a few times a year. There's a decision sitting in front of you that's quieter than it looks.`,
  Gemini:      (n, m) => `${n}, there's a conversation that needs to happen today — the Moon in ${m} is opening the door for it. The words you've been holding are ready to land.`,
  Cancer:      (n, m) => `${n}, the Moon in ${m} is asking you to set something down that isn't yours to carry. Your reading today is about what returns to you when you do.`,
  Leo:         (n, m) => `${n}, today's sky has your name on it. The Moon in ${m} is lighting up a part of your chart that most people never see — but you'll feel it the moment you read what it means.`,
  Virgo:       (n, m) => `${n}, the Moon in ${m} is highlighting something you've been getting right that you've been calling wrong. Your reading today corrects the record.`,
  Libra:       (n, m) => `${n}, there's something you've been not-saying, and the Moon in ${m} has created the exact conditions for it to be heard today. Your reading shows you the window.`,
  Scorpio:     (n, m) => `${n}, you've been right about something. The Moon in ${m} today confirms what your gut has been telling you for weeks. Your reading names it.`,
  Sagittarius: (n, m) => `${n}, the Moon in ${m} is slowing you down just enough to see something you've been moving too fast to notice. Your reading today shows you what it is.`,
  Capricorn:   (n, m) => `${n}, the Moon in ${m} is activating a part of your chart related to what you're building. Your reading today tells you whether to push or hold.`,
  Aquarius:    (n, m) => `${n}, the Moon in ${m} is creating a rare opening — the kind that doesn't repeat for months. Your reading today tells you exactly what to do with it.`,
  Pisces:      (n, m) => `${n}, the Moon in ${m} is giving you your edges back. There's something in today's reading that's going to feel like recognition — like someone finally said the thing.`,
}

const CHINESE_EMOJI: Record<string, string> = {
  Rat:'🐀', Ox:'🐂', Tiger:'🐅', Rabbit:'🐇', Dragon:'🐉', Snake:'🐍',
  Horse:'🐎', Goat:'🐐', Monkey:'🐒', Rooster:'🐓', Dog:'🐕', Pig:'🐖',
}

const WEEK_THEMES: Record<string, string> = {
  Aries:       `This week, your energy is building toward something — don't release the pressure early. The momentum you're carrying into the weekend is worth protecting. One focused push mid-week opens a door you haven't been able to reach.`,
  Taurus:      `A week of consolidation rather than expansion — and that's exactly right. Something you've been building quietly is becoming solid enough to stand on. Trust the process, not the timeline.`,
  Gemini:      `Conversations this week carry more weight than they appear to. The casual exchange early in the week, the offhand comment later — one of them lands somewhere real. Stay present in each one.`,
  Cancer:      `Your emotional antennae are particularly sharp this week — you're reading rooms before you enter them. Use this to navigate, not to predict disaster. The week ends softer than it begins.`,
  Leo:         `A week where your presence matters more than your performance. Someone in your orbit is watching how you handle something imperfect. Being real in that moment counts more than being polished.`,
  Virgo:       `A useful week for finishing what's been sitting half-done. The energy supports completion over initiation — the thing you've been orbiting without landing is ready to be closed this week.`,
  Libra:       `This week asks you to take a side. The careful balance you've been maintaining is useful in most situations, but this one needs your actual opinion. The people in your corner are waiting for it.`,
  Scorpio:     `A week of strategic patience. Something is developing beneath the surface — you can feel the current shifting even if you can't name it yet. Don't reach for it before it surfaces.`,
  Sagittarius: `The week's energy favors depth over distance. Instead of opening another horizon, this week returns the most for staying close and going further into what's already in front of you.`,
  Capricorn:   `A week where your long-game instincts are running cleanly. Something that looked like a dead end recently is showing an opening. You positioned yourself for this — trust it.`,
  Aquarius:    `This week, a community or group dynamic shifts in your favor. Something you've been contributing quietly is being recognized in a way you might not expect. Receive it.`,
  Pisces:      `A creative or intuitive breakthrough is building this week — the kind that arrives sideways, in a dream or a half-formed thought. Keep something nearby to write it down when it comes.`,
}

const MONTH_THEMES: Record<string, string> = {
  Aries:       `This month asks you to commit to one direction and stop hedging. The scattered energy of recent weeks is ready to channel — and the channel is clear if you name it clearly. One deliberate choice unlocks the rest.`,
  Taurus:      `A month where your relationship to security is being tested and clarified. Something that felt stable is being recalibrated. This isn't instability — it's an upgrade in progress. Hold steady.`,
  Gemini:      `A mentally active month where your ideas are actually landing. The difference between this month and recent ones: people are listening. Use that window to say the things that matter.`,
  Cancer:      `Home, family, and your inner life are in sharp focus this month. Something that needed tending gets your full attention now — and the tending is what unlocks the next chapter.`,
  Leo:         `A month of visible growth. Something you've been working on behind the scenes enters the room. You're ready for the attention even if part of you pretends you aren't.`,
  Virgo:       `This month rewards the systematic approach — patient, incremental progress that most people underestimate. You know exactly how to do this. Trust the process, not the pace.`,
  Libra:       `A month where the relationships in your life are reorganizing themselves into something clearer. Some connections deepen. Some create space. The clarity is a gift even when it's uncomfortable.`,
  Scorpio:     `A month of depth and transformation — the kind that doesn't look dramatic from the outside but shifts something fundamental on the inside. You'll feel different in thirty days without being able to explain exactly why.`,
  Sagittarius: `Expansion is available this month — but through depth, not distance. The biggest journey available right now is interior. The horizon is inward and the reward is concrete.`,
  Capricorn:   `A month of structural progress. The foundations you've been building are ready to bear more weight. Something you've delayed — out of caution or perfectionism — is ready to move.`,
  Aquarius:    `A month where your vision for something larger crystallizes into something actionable. The ideas that have been circling are ready to land. One of them becomes a plan this month.`,
  Pisces:      `An emotionally rich month — deep feeling, meaningful encounters, the kind of beauty that arrives unexpectedly. Make room for it. The month is asking you to be present, not productive.`,
}

const YEAR_THEMES: Record<string, string> = {
  Aries:       `This year is about ownership — of your direction, your decisions, and your pace. Something that has been other people's territory or timeline becomes yours to govern. The defining move is one deliberate step taken before you feel completely ready.`,
  Taurus:      `A year of building something durable. The foundation work isn't glamorous, but what you construct this year holds for years. One relationship and one project will define this chapter when you look back.`,
  Gemini:      `A year of meaningful communication — writing, conversation, teaching, connecting. Your mind is running at a frequency that can translate difficult things into clear things. That gift is wanted. Aim it intentionally.`,
  Cancer:      `A year oriented around home, belonging, and what you're willing to call yours. Something shifts in your innermost world — a healing, a return, a new kind of rootedness. This is a year for arriving.`,
  Leo:         `A year where your creative and professional presence becomes undeniable. Something you've been building privately enters public life. The recognition comes — and the challenge is receiving it without either shrinking or overextending.`,
  Virgo:       `A year of mastery — deepening rather than widening. The expertise you've been accumulating quietly becomes visible, useful, and valued in ways you didn't anticipate. This is the year it compounds.`,
  Libra:       `A year for relationships — romantic, creative, professional, intellectual. The connections you make and deepen this year define the next chapter. The key is choosing presence over performance.`,
  Scorpio:     `A year of transformation that runs deeper than what's visible from the outside. Something is released, something long-buried surfaces, something that has been one thing becomes something else. You don't lose yourself in this. You find yourself.`,
  Sagittarius: `An expansive year — in wisdom, in geography, in belief. Something you've been holding as probable becomes certain. The movement is outward: a journey, a study, a horizon you've been pointing toward for years.`,
  Capricorn:   `A year of culmination. The long arc of something you've been building — a career, a reputation, a structure — reaches a visible point. This is not the end of the work. It's the moment the work becomes legible.`,
  Aquarius:    `A year where your vision for the future stops being abstract and starts being something you can actually build. One community, one system, one collective project becomes the frame for the year's most significant work.`,
  Pisces:      `A year of spiritual and creative completion — the kind where something that has been searching finds its form. An artistic or healing work matures. An inner journey reaches a resting point. You're allowed to let it land.`,
}

function buildTechnicalHoroscope(params: {
  westSign: string
  moonSign: ZodiacSign
  moonDeg: number
  moonHouse: number
  sunSign: ZodiacSign
  sunHouse: number
  marsSign: ZodiacSign
  ascendant: ZodiacSign | null
  transits: Transit[]
  curr: PlanetMap
}): string[] {
  const { moonSign, moonDeg, moonHouse, sunSign, sunHouse, marsSign, ascendant, transits, curr } = params
  const parts: string[] = []

  parts.push(
    `The Moon is sitting at ${moonDeg}° ${moonSign} right now, pressing into your ${moonHouse}th house — the part of your chart that governs ${HOUSE_THEMES[moonHouse]}. You may feel this as a mood before you understand it as a message.`
  )

  const t1 = transits[0]
  if (t1) {
    const tSign = signOf(curr[t1.transiting])
    const tDeg  = degOf(curr[t1.transiting])
    parts.push(
      `${t1.transiting} at ${tDeg}° ${tSign} is ${ASPECT_VERB[t1.aspect]} your natal ${t1.natalPlanet} — ${ASPECT_FEEL[t1.aspect]}.`
    )
  }

  const t2 = transits[1]
  if (t2 && t2.transiting !== t1?.transiting) {
    parts.push(
      `There's a quieter ${t2.aspect} between transiting ${t2.transiting} and your natal ${t2.natalPlanet} running like an undercurrent beneath the surface of the day — not the loudest energy, but the one you'll feel the shape of hours from now.`
    )
  }

  if (ascendant) {
    parts.push(
      `The Sun moving through ${sunSign} is lighting up your ${sunHouse}th house — and through your ${ascendant} Ascendant, that light carries ${RISING_DEPTH[ascendant]}.`
    )
  } else {
    parts.push(
      `The Sun in ${sunSign} is illuminating your ${sunHouse}th house — the territory of ${HOUSE_THEMES[sunHouse]} — and asking for your honest attention there.`
    )
  }

  parts.push(
    `Mars in ${marsSign} is adding a charge to all of this — a restless, forward-pushing energy that won't let you stay comfortable in indecision for long.`
  )

  return parts
}

function barometerNote(
  metric: keyof Metrics,
  value: number,
  transits: Transit[],
  moonSign: ZodiacSign,
  sunSign: ZodiacSign,
  marsSign: ZodiacSign,
): string {
  const mercuryT = transits.find(t => t.transiting === 'Mercury' || t.natalPlanet === 'Mercury')
  const moonT    = transits.find(t => t.natalPlanet === 'Moon' || t.transiting === 'Moon')
  const high     = value >= 60

  switch (metric) {
    case 'mental':
      return mercuryT
        ? `${mercuryT.transiting} touching your natal ${mercuryT.natalPlanet} — your mind is ${high ? 'making connections faster than usual, trust the leaps' : 'moving carefully, deliberate over fast'}.`
        : `Moon in ${moonSign} — your inner compass is ${high ? 'loud and trustworthy today, listen to it' : 'turned inward, the answers need quiet not pressure'}.`
    case 'emotional':
      return moonT
        ? `${moonT.transiting} pressing your natal ${moonT.natalPlanet} — your emotional antenna is ${high ? 'picking up everything, real signal in the static' : 'protecting itself, the wall is information not failure'}.`
        : `Your heart is ${high ? 'wide open today — you feel people accurately, trust what you sense' : 'processing in private — this is integration, not shutdown'}.`
    case 'career':
      return `Sun in ${sunSign} — the doors in your work life are ${high ? 'responding to knocking right now, ask directly' : 'resting — build the blueprint today, launch tomorrow'}.`
    case 'physical':
      return high
        ? `Mars in ${marsSign} is flooding your system with raw animal vitality right now — your body isn't just ready, it's asking to be used. This is the window.`
        : `Your body is whispering to slow down — rest now compounds into strength tomorrow. Mars in ${marsSign} will return the fire; let it reload.`
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SnapPill({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#0d0d1a', border: '0.5px solid #2e2b4a',
      borderRadius: 20, padding: '5px 10px',
    }}>
      <i className={`ti ${icon}`} style={{ fontSize: 11, color }} aria-hidden />
      <span style={{ fontSize: 11, color: '#6b5f8a', fontWeight: 500 }}>{label}</span>
    </div>
  )
}

function PeriodPill({ tag }: { tag: TimeframeTag }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: '#0d0d1a', border: '0.5px solid #2e2b4a',
      borderRadius: 20, padding: '5px 10px',
    }}>
      <span style={{ fontSize: 11 }}>{tag.emoji}</span>
      {tag.from && tag.to ? (
        <span style={{ fontSize: 11, fontWeight: 500 }}>
          <span style={{ color: '#7a6fa8' }}>{tag.label} · </span>
          <span style={{ color: '#c4b8e8' }}>{tag.from}</span>
          <span style={{ color: '#3d3460', margin: '0 4px' }}>→</span>
          <span style={{ color: '#a78bfa' }}>{tag.to}</span>
        </span>
      ) : (
        <span style={{ fontSize: 11, color: '#6b5f8a', fontWeight: 500 }}>{tag.label}</span>
      )}
    </div>
  )
}

function SectionLabel({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 13, color: '#7c3aed' }} aria-hidden />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#6b5f8a', letterSpacing: '0.09em', textTransform: 'uppercase' }}>{text}</span>
      <div style={{ flex: 1, height: '0.5px', background: '#1e1b35' }} />
    </div>
  )
}

function HighlightBlock({ icon, iconColor, title, body, bg, border }: {
  icon: string; iconColor: string; title: string; body: string; bg: string; border: string
}) {
  return (
    <div style={{ background: bg, border: `0.5px solid ${border}`, borderRadius: 11, padding: '13px 15px', marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        <i className={`ti ${icon}`} style={{ fontSize: 14, color: iconColor }} aria-hidden />
        <span style={{ fontSize: 10, fontWeight: 700, color: iconColor, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{title}</span>
      </div>
      <p style={{ fontSize: 13, color: '#c4b8e8', lineHeight: 1.65, margin: 0 }}>{body}</p>
    </div>
  )
}

function MetricBar({ icon, label, value, animate, note, gradFrom, gradTo, glow }: {
  icon: string; label: string; value: number; animate: boolean; note: string
  gradFrom: string; gradTo: string; glow: string
}) {
  const { label: lvl, color: lvlColor } = levelTag(value)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <i className={`ti ${icon}`} style={{ fontSize: 13, color: gradTo }} aria-hidden />
          <span style={{ fontSize: 13, color: '#c4b8e8', fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: lvlColor, letterSpacing: '0.06em' }}>{lvl}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: gradTo, fontVariantNumeric: 'tabular-nums' }}>
            {value}<span style={{ fontSize: 11, color: '#7a6fa8' }}>%</span>
          </span>
        </div>
      </div>
      <div style={{ height: 6, background: '#1a1628', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, height: '100%',
          width: animate ? `${value}%` : '0%',
          background: `linear-gradient(to right, ${gradFrom}, ${gradTo})`,
          borderRadius: 4, boxShadow: `0 0 8px ${glow}`,
          transition: 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }} />
      </div>
      <p style={{ fontSize: 11, color: '#7a6fa8', marginTop: 5, lineHeight: 1.5 }}>{note}</p>
    </div>
  )
}

// ── Main dashboard ─────────────────────────────────────────────────────────

type Period = 'today' | 'tomorrow' | 'week' | 'month' | 'year'
const PERIODS: { key: Period; label: string }[] = [
  { key: 'today',    label: 'Today'    },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'week',     label: 'Week'     },
  { key: 'month',    label: 'Month'    },
  { key: 'year',     label: 'Year'     },
]

export default function DashboardClient() {
  const [cookie,        setCookie]        = useState<TrialCookie | null>(null)
  const [status,        setStatus]        = useState<TrialStatus>('none')
  const [daysLeft,      setDaysLeft]      = useState(0)
  const [animate,       setAnimate]       = useState(false)
  const [period,        setPeriod]        = useState<Period>('today')
  const [shiftMins,     setShiftMins]     = useState(0)
  const [shareCopied,   setShareCopied]   = useState(false)
  const [modal,         setModal]         = useState<{ sign: string; placement: ModalPlacement } | null>(null)
  const [showTransit,   setShowTransit]   = useState(false)
  const [devStatus,     setDevStatus]     = useState<TrialStatus | null>(null)

  useEffect(() => {
    const c = getTrialCookie()
    if (!c) { window.location.href = '/onboarding'; return }
    setCookie(c)
    setStatus(getTrialStatus())
    setDaysLeft(trialDaysRemaining())
    setTimeout(() => setAnimate(true), 120)

    // Cosmic shift countdown — updates every second
    function tick() { setShiftMins(moonInfo().minutesToNext) }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const handleShare = useCallback(async () => {
    if (!cookie) return
    const ob      = cookie.onboarding
    const western = getWesternSign(ob.dob)
    const chinese = getChineseSign(ob.dob)
    const m       = computeMetrics(ob.dob)
    const text    = [
      `🌟 My Cosmic Shield — ${new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long' })}`,
      ``,
      `🧠 Mental Sensitivity   ${m.mental}%`,
      `🛡️ Emotional Shield      ${m.emotional}%`,
      `⚡ Career Momentum       ${m.career}%`,
      `🔋 Physical Energy       ${m.physical}%`,
      ``,
      `${western.name} Sun · Year of the ${chinese.name}`,
      ``,
      `✨ stellisia.com — free cosmic blueprint`,
    ].join('\n')

    if (typeof navigator.share === 'function') {
      try { await navigator.share({ text, title: 'My Cosmic Shield Score' }); return } catch {}
    }
    await navigator.clipboard.writeText(text)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2500)
  }, [cookie])

  // ── Loading ──────────────────────────────────────────
  if (!cookie) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070f' }}>
        <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 30, color: '#7c3aed' }} />
      </main>
    )
  }

  // ── Derive all data ──────────────────────────────────
  const ob        = cookie.onboarding
  const firstName = ob.name.split(' ')[0]
  const western   = getWesternSign(ob.dob)
  const chinese   = getChineseSign(ob.dob)
  const metrics   = computeMetrics(ob.dob)
  const moon      = moonPhaseLabel()
  const activeStatus = devStatus ?? status
  const locked    = activeStatus === 'expired'
  const todayStr  = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  const tob         = ob.tobUnknown ? '12:00' : (ob.tob || '12:00')
  const birthLat    = ob.birthCity?.lat   ?? 0
  const birthLng    = ob.birthCity?.lng   ?? 0
  const hasExactTOB = !ob.tobUnknown && !!ob.tob && !!ob.birthCity

  const curr      = currentPlanets()
  const natal     = natalPlanets(ob.dob, tob)
  const transits  = keyTransits(natal, curr)
  const ascendant = hasExactTOB ? calcAscendant(ob.dob, tob, birthLat, birthLng) : null

  const moonData     = moonInfo()
  const moonHouse    = ascendant ? houseOf(moonData.sign, ascendant) : 4
  const sunSign      = signOf(curr.Sun)
  const sunHouse     = ascendant ? houseOf(sunSign, ascendant) : 10
  const marsSign     = signOf(curr.Mars)
  const marsWindow   = ob.currentCity ? marsLocalWindow(ob.currentCity.lng) : null

  const technicalHoro = buildTechnicalHoroscope({
    westSign: western.name, moonSign: moonData.sign, moonDeg: moonData.deg,
    moonHouse, sunSign, sunHouse, marsSign, ascendant, transits, curr,
  })
  const coreHoro = buildCoreHoro(firstName, western.name)
  const chBridge = CHINESE_BRIDGE[chinese.name] ?? ''

  const barNotes = {
    mental:    barometerNote('mental',    metrics.mental,    transits, moonData.sign, sunSign, marsSign),
    emotional: barometerNote('emotional', metrics.emotional, transits, moonData.sign, sunSign, marsSign),
    career:    barometerNote('career',    metrics.career,    transits, moonData.sign, sunSign, marsSign),
    physical:  barometerNote('physical',  metrics.physical,  transits, moonData.sign, sunSign, marsSign),
  }

  // ── Target-period derived data ───────────────────────────────────────────
  const tgtDate = period === 'tomorrow' ? new Date(Date.now() + 86_400_000) :
                  period === 'week'     ? new Date(Date.now() + 7  * 86_400_000) :
                  period === 'month'    ? new Date(Date.now() + 30 * 86_400_000) :
                  period === 'year'     ? new Date(Date.now() + 365 * 86_400_000) :
                  new Date()

  const tgtCurr     = period !== 'today' ? currentPlanets(tgtDate)         : curr
  const tgtMoonData = period !== 'today' ? moonInfo(tgtDate)               : moonData
  const tgtMetrics  = period !== 'today' ? computeMetrics(ob.dob, tgtDate) : metrics
  const tgtTransits = period !== 'today' ? keyTransits(natal, tgtCurr)     : transits
  const tgtMoonHouse = ascendant ? houseOf(tgtMoonData.sign, ascendant) : moonHouse
  const tgtSunSign   = signOf(tgtCurr.Sun)
  const tgtMarsSign  = signOf(tgtCurr.Mars)

  const tgtBarNotes = period !== 'today' ? {
    mental:    barometerNote('mental',    tgtMetrics.mental,    tgtTransits, tgtMoonData.sign, tgtSunSign, tgtMarsSign),
    emotional: barometerNote('emotional', tgtMetrics.emotional, tgtTransits, tgtMoonData.sign, tgtSunSign, tgtMarsSign),
    career:    barometerNote('career',    tgtMetrics.career,    tgtTransits, tgtMoonData.sign, tgtSunSign, tgtMarsSign),
    physical:  barometerNote('physical',  tgtMetrics.physical,  tgtTransits, tgtMoonData.sign, tgtSunSign, tgtMarsSign),
  } : barNotes

  const tgtTechnicalHoro = period === 'tomorrow' ? buildTechnicalHoroscope({
    westSign: western.name, moonSign: tgtMoonData.sign, moonDeg: tgtMoonData.deg,
    moonHouse: tgtMoonHouse, sunSign: tgtSunSign, sunHouse: ascendant ? houseOf(tgtSunSign, ascendant) : sunHouse,
    marsSign: tgtMarsSign, ascendant, transits: tgtTransits, curr: tgtCurr,
  }) : technicalHoro

  const periodTags = period === 'week'  ? weekTags(ascendant) :
                     period === 'month' ? monthTags(ascendant) :
                     period === 'year'  ? yearTags(ascendant) : []

  const tomorrowDate = new Date(Date.now() + 86_400_000)
  const tomorrowStr  = tomorrowDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  const periodLabel = period === 'today'    ? "Today's Reading"
                    : period === 'tomorrow' ? "Tomorrow's Reading"
                    : period === 'week'     ? 'This Week'
                    : period === 'month'    ? 'This Month'
                    : 'This Year'

  const strengthsLabel = period === 'today'    ? "Today's Strengths"
                       : period === 'tomorrow' ? "Tomorrow's Strengths"
                       : period === 'week'     ? "This Week's Strengths"
                       : period === 'month'    ? "This Month's Strengths"
                       : "This Year's Strengths"

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.5)} }
        @keyframes glow-btn  { 0%,100%{box-shadow:0 0 20px #7c3aed88,0 4px 20px #7c3aed33} 50%{box-shadow:0 0 36px #a855f7bb,0 4px 32px #7c3aed66} }
        @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes tick-glow { 0%,100%{color:#6b5f8a} 50%{color:#a78bfa} }
        @keyframes sheet-up  { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fade-in   { from{opacity:0} to{opacity:1} }
        .icon-float { animation: float 4s ease-in-out infinite; }
        .tick { animation: tick-glow 1s ease-in-out infinite; font-variant-numeric: tabular-nums; }
        .hw-row { display:flex; flex-direction:column; gap:8px; }
      `}</style>

      <main style={{ minHeight: '100dvh', background: '#07070f', overflowX: 'hidden' }}>
        <div style={{ maxWidth: 460, margin: '0 auto', paddingBottom: 80 }}>

          {/* ══ HEADER ══════════════════════════════════════════════════════ */}
          <div style={{
            background: 'linear-gradient(160deg,#100c24 0%,#0d0d1a 55%,#07070f 100%)',
            borderBottom: '0.5px solid #1e1b35', padding: '20px 20px 20px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,#7c3aed14 0%,transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: '#6b5f8a' }}>{moon.emoji} {moon.label}</span>
              <span style={{ fontSize: 11, color: '#7a6fa8' }}>{todayStr}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="icon-float" style={{ fontSize: 38, lineHeight: 1, flexShrink: 0 }}>
                <i className={`ti ${western.icon}`} style={{ color: '#a78bfa' }} aria-hidden />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#e2d9f3', lineHeight: 1.15, margin: 0 }}>
                {firstName}<span style={{ color: '#7c3aed' }}>'s</span> Horoscope
              </h1>
            </div>

            {locked && (
              <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1a0f0f', border: '0.5px solid #7c2d2d', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#f87171' }}>
                <i className="ti ti-lock" style={{ fontSize: 11 }} aria-hidden /> Free trial ended — unlock to continue
              </div>
            )}

            {/* ── DEV ONLY: state toggle ── */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ marginTop: 14, display: 'flex', gap: 4 }}>
                {(['trial', 'expired', 'premium'] as TrialStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setDevStatus(s)}
                    style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: 10, fontFamily: 'inherit',
                      cursor: 'pointer', fontWeight: 600, letterSpacing: '0.05em',
                      border: `0.5px solid ${activeStatus === s ? '#7c3aed' : '#2e2b4a'}`,
                      background: activeStatus === s ? '#1e1b35' : 'transparent',
                      color: activeStatus === s
                        ? '#a78bfa'
                        : s === 'expired' ? '#f87171'
                        : s === 'premium' ? '#34d399'
                        : '#6b5f8a',
                    }}
                  >
                    {s === 'trial' ? '✦ Trial' : s === 'expired' ? '✕ Expired' : '★ Premium'}
                  </button>
                ))}
              </div>
            )}

            {/* Period selector */}
            <div style={{ display: 'flex', marginTop: 18, background: '#0a0918', borderRadius: 12, padding: 4, gap: 2 }}>
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  style={{
                    flex: 1, padding: '7px 4px', border: 'none', borderRadius: 9, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: period === p.key ? 600 : 400,
                    background: period === p.key ? '#1e1b35' : 'transparent',
                    color: period === p.key ? '#a78bfa' : '#6b5f8a',
                    transition: 'background 0.15s, color 0.15s',
                    boxShadow: period === p.key ? '0 0 0 0.5px #3d2d6b' : 'none',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* ══ READING SECTION ════════════════════════════════════════════ */}
          <div style={{ padding: '22px 20px 0' }}>
            <SectionLabel icon="ti-stars" text={periodLabel} />

            {locked ? (
              /* ── Paywall state ── */
              <div>

                {/* YOU / NOW — always visible */}
                <div style={{ background: '#0a0918', border: '0.5px solid #1e1b35', borderRadius: 12, padding: '12px 14px', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#6b5f8a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 26 }}>You</span>
                    <SnapPill icon={western.icon} color="#a78bfa" label={western.name} />
                    <SnapPill icon="ti-yin-yang" color="#c084fc" label={`Year of ${chinese.name}`} />
                    {ascendant && <SnapPill icon="ti-arrow-up-circle" color="#34d399" label={`${ascendant} Rising`} />}
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#6b5f8a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 26 }}>Now</span>
                    <SnapPill icon="ti-moon-stars" color="#818cf8" label={`Moon ${moonData.sign}`} />
                    <SnapPill icon="ti-home" color="#6b5f8a" label={`${moonHouse}th House`} />
                    {transits[0] && <SnapPill icon="ti-arrows-cross" color="#7c3aed" label={`${transits[0].transiting} ${transits[0].aspect} ${transits[0].natalPlanet}`} />}
                  </div>
                </div>

                {/* Teaser — hooks without revealing */}
                <div style={{ background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 14, padding: '16px 16px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
                    <i className={`ti ${western.icon}`} style={{ fontSize: 13, color: '#a78bfa' }} aria-hidden />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7a6fa8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Today's Reading</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#c4b8e8', lineHeight: 1.8, margin: '0 0 10px' }}>
                    {TEASER_HOOKS[western.name]?.(firstName, moonData.sign) ?? `${firstName}, the sky has something specific for you today — and it involves the Moon's current position in ${moonData.sign}.`}
                  </p>
                  <p style={{ fontSize: 12, color: '#6b5f8a', lineHeight: 1.6, margin: 0 }}>
                    Your {western.name} reading for {moonData.sign} moon is ready. Your barometer is live. The full picture is one tap away.
                  </p>
                  {/* Fade out bottom */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to top, #0d0d1a, transparent)', pointerEvents: 'none' }} />
                </div>

                {/* Paywall CTA */}
                <div style={{ background: '#0d0d1a', border: '0.5px solid #3d2d6b', borderRadius: 16, padding: '22px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🔓</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: '#e2d9f3', marginBottom: 6 }}>Your reading is waiting</h3>
                  <p style={{ fontSize: 12, color: '#6b5f8a', lineHeight: 1.65, marginBottom: 18 }}>
                    Full daily reading · Real transit aspects · Local Space window · 90-day forecast
                  </p>
                  <button style={{
                    width: '100%', background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
                    border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 600,
                    padding: '14px', cursor: 'pointer', fontFamily: 'inherit',
                    animation: 'glow-btn 2.5s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    <i className="ti ti-sparkles" aria-hidden /> Continue reading — $7.99/mo
                  </button>
                  <p style={{ fontSize: 11, color: '#6b5f8a', marginTop: 10 }}>Cancel anytime · Instant access · 256-bit encrypted</p>
                </div>
              </div>
            ) : period === 'today' || period === 'tomorrow' ? (
              /* ── Active reading — today or tomorrow ── */
              <div>

                {/* Date label for tomorrow */}
                {period === 'tomorrow' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, background: '#0a0918', border: '0.5px solid #1e1b35', borderRadius: 10, padding: '8px 12px' }}>
                    <i className="ti ti-calendar-event" style={{ fontSize: 12, color: '#a78bfa' }} aria-hidden />
                    <span style={{ fontSize: 12, color: '#9d8cc4', fontWeight: 500 }}>Reading for <strong style={{ color: '#c4b8e8' }}>{tomorrowStr}</strong></span>
                  </div>
                )}

                {/* YOU / NOW context box */}
                <div style={{ background: '#0a0918', border: '0.5px solid #1e1b35', borderRadius: 12, padding: '12px 14px', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#6b5f8a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 26 }}>You</span>
                    <button onClick={() => setModal({ sign: western.name, placement: 'sun' })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                      <SnapPill icon={western.icon} color="#a78bfa" label={western.name} />
                    </button>
                    <SnapPill icon="ti-yin-yang" color="#c084fc" label={`Year of ${chinese.name}`} />
                    {ascendant && (
                      <button onClick={() => setModal({ sign: ascendant, placement: 'rising' })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                        <SnapPill icon="ti-arrow-up-circle" color="#34d399" label={`${ascendant} Rising`} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#6b5f8a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 26 }}>
                      {period === 'tomorrow' ? 'Sky' : 'Now'}
                    </span>
                    <SnapPill icon="ti-moon-stars" color="#818cf8" label={`Moon ${tgtMoonData.sign}`} />
                    <SnapPill icon="ti-home" color="#6b5f8a" label={`${tgtMoonHouse}th House`} />
                    {tgtTransits[0] && (
                      <SnapPill icon="ti-arrows-cross" color="#7c3aed" label={`${tgtTransits[0].transiting} ${tgtTransits[0].aspect} ${tgtTransits[0].natalPlanet}`} />
                    )}
                  </div>
                </div>

                {/* Transit accordion */}
                <div style={{ marginBottom: 10 }}>
                  <button
                    onClick={() => setShowTransit(v => !v)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: showTransit ? '12px 12px 0 0' : 12,
                      padding: '9px 14px', cursor: 'pointer', fontFamily: 'inherit',
                      borderBottom: showTransit ? '0.5px solid #1e1b35' : undefined,
                      transition: 'border-radius 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <i className="ti ti-atom" style={{ fontSize: 12, color: '#7c3aed' }} aria-hidden />
                      <span style={{ fontSize: 11, color: '#6b5f8a', fontWeight: 500 }}>Transit Aspects · Moon {tgtMoonData.deg}° {tgtMoonData.sign}</span>
                    </div>
                    <i className={`ti ti-chevron-${showTransit ? 'up' : 'down'}`} style={{ fontSize: 13, color: '#6b5f8a' }} aria-hidden />
                  </button>
                  {showTransit && (
                    <div style={{ background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {tgtTechnicalHoro.map((sentence, i) => (
                        <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                          <i className="ti ti-point-filled" style={{ fontSize: 7, color: '#7c3aed', marginTop: 6, flexShrink: 0 }} aria-hidden />
                          <p style={{ fontSize: 12.5, color: '#9d8cc4', lineHeight: 1.7, margin: 0 }}>{sentence}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* The Big Picture */}
                <div style={{ background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 14, padding: '18px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13 }}>
                    <i className={`ti ${western.icon}`} style={{ fontSize: 13, color: '#a78bfa' }} aria-hidden />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7a6fa8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>The Big Picture</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#c4b8e8', lineHeight: 1.82, margin: 0 }}>{coreHoro.big}</p>
                </div>

                {/* Strengths + Warning */}
                <div className="hw-row" style={{ marginBottom: 10 }}>
                  <div style={{ background: '#110e08', border: '0.5px solid #4a2e0a', borderRadius: 13, padding: '13px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <i className="ti ti-bulb" style={{ fontSize: 13, color: '#fbbf24' }} aria-hidden />
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{strengthsLabel}</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: '#c4b8e8', lineHeight: 1.65, margin: 0 }}>
                      {coreHoro.weapon}{chBridge ? <> <span style={{ color: '#7c6fab' }}>{chBridge}</span></> : null}
                    </p>
                  </div>
                  <div style={{ background: '#0f0a0a', border: '0.5px solid #4a1a1a', borderRadius: 13, padding: '13px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <i className="ti ti-alert-triangle" style={{ fontSize: 13, color: '#f97316' }} aria-hidden />
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#f97316', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Watch Out</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: '#c4b8e8', lineHeight: 1.65, margin: 0 }}>{coreHoro.warning}</p>
                  </div>
                </div>

                {/* Local Space — only for today */}
                {period === 'today' && marsWindow && ob.currentCity && (
                  <div style={{ background: '#0b0f1a', border: '0.5px solid #1e3a5f', borderRadius: 13, padding: '12px 14px', marginBottom: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                      <span style={{ fontSize: 12 }}>📍</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Local Space · {ob.currentCity.name}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#93c5fd', lineHeight: 1.65, margin: 0 }}>
                      <strong style={{ color: '#bfdbfe' }}>Mars peak {marsWindow.peakAt}</strong> — 2.5h focus window until {marsWindow.endsAt}.{' '}
                      {metrics.career < 55
                        ? 'Career doors resting — use this for training, creative work, or private strategy.'
                        : 'Bold moves and output-driven tasks carry extra momentum now. Act.'}
                    </p>
                  </div>
                )}

              </div>
            ) : (
              /* ── Week / Month / Year overview ── */
              <div>

                {/* Period date label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, background: '#0a0918', border: '0.5px solid #1e1b35', borderRadius: 10, padding: '8px 12px' }}>
                  <i className="ti ti-calendar-event" style={{ fontSize: 12, color: '#a78bfa' }} aria-hidden />
                  <span style={{ fontSize: 12, color: '#9d8cc4', fontWeight: 500 }}>
                    {period === 'week'  ? `Week of ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}` :
                     period === 'month' ? new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) :
                     new Date().getFullYear().toString()}
                  </span>
                </div>

                {/* YOU + period sky context box */}
                <div style={{ background: '#0a0918', border: '0.5px solid #1e1b35', borderRadius: 12, padding: '12px 14px', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#6b5f8a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 26 }}>You</span>
                    <button onClick={() => setModal({ sign: western.name, placement: 'sun' })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                      <SnapPill icon={western.icon} color="#a78bfa" label={western.name} />
                    </button>
                    <SnapPill icon="ti-yin-yang" color="#c084fc" label={`Year of ${chinese.name}`} />
                    {ascendant && (
                      <button onClick={() => setModal({ sign: ascendant, placement: 'rising' })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                        <SnapPill icon="ti-arrow-up-circle" color="#34d399" label={`${ascendant} Rising`} />
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 9, color: '#6b5f8a', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 40 }}>
                      {period === 'year' ? 'Cycles' : 'Sky'}
                    </span>
                    {periodTags.map((tag, i) => <PeriodPill key={i} tag={tag} />)}
                  </div>
                </div>

                {/* Period overview card */}
                <div style={{ background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 14, padding: '18px 16px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 13 }}>
                    <i className={`ti ${western.icon}`} style={{ fontSize: 13, color: '#a78bfa' }} aria-hidden />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#7a6fa8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                      {period === 'week' ? 'Weekly Overview' : period === 'month' ? 'Monthly Overview' : 'Yearly Overview'}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, color: '#c4b8e8', lineHeight: 1.82, margin: 0 }}>
                    {period === 'week'  ? (WEEK_THEMES[western.name]  ?? WEEK_THEMES['Leo'])  :
                     period === 'month' ? (MONTH_THEMES[western.name] ?? MONTH_THEMES['Leo']) :
                                          (YEAR_THEMES[western.name]  ?? YEAR_THEMES['Leo'])}
                  </p>
                </div>

                {/* Strengths stays consistent */}
                <div style={{ background: '#110e08', border: '0.5px solid #4a2e0a', borderRadius: 13, padding: '13px 14px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <i className="ti ti-bulb" style={{ fontSize: 13, color: '#fbbf24' }} aria-hidden />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{strengthsLabel}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#c4b8e8', lineHeight: 1.65, margin: 0 }}>
                    {coreHoro.weapon}{chBridge ? <> <span style={{ color: '#7c6fab' }}>{chBridge}</span></> : null}
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* ══ COSMIC SHIFT TIMER — today only ════════════════════════════ */}
          {period === 'today' && (
            <div style={{ padding: '22px 20px 0' }}>
              <SectionLabel icon="ti-clock-bolt" text="Cosmic Shift Timer" />
              <div style={{ background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div className="tick" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '0.04em', color: '#a78bfa' }}>
                    {fmtCountdown(shiftMins)}
                  </div>
                  <div style={{ fontSize: 10, color: '#7a6fa8', marginTop: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Next shift</div>
                </div>
                <div style={{ width: '0.5px', background: '#2e2b4a', alignSelf: 'stretch', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 12, color: '#9d8cc4', margin: 0, lineHeight: 1.6 }}>
                    Moon leaves <strong style={{ color: '#c4b8e8' }}>{moonData.sign}</strong> and enters <strong style={{ color: '#c4b8e8' }}>{ZODIAC[(ZODIAC.indexOf(moonData.sign) + 1) % 12]}</strong> — your emotional field shifts to a new frequency.
                  </p>
                  <p style={{ fontSize: 11, color: '#7a6fa8', margin: '4px 0 0' }}>
                    Now: Moon {moonData.deg}° {moonData.sign} · House {moonHouse}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══ COSMIC BAROMETER — today & tomorrow only ════════════════════ */}
          {(period === 'today' || period === 'tomorrow') && (
            <div style={{ padding: '22px 20px 0' }}>
              <SectionLabel icon="ti-chart-radar" text={period === 'tomorrow' ? "Tomorrow's Barometer" : 'Cosmic Barometer'} />
              <div style={{ background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 14, padding: '18px 16px' }}>
                <MetricBar icon="ti-brain"            label="Mental Sensitivity"  value={tgtMetrics.mental}    animate={animate} note={tgtBarNotes.mental}    gradFrom="#6d28d9" gradTo="#a855f7" glow="#a855f788" />
                <MetricBar icon="ti-shield-half"      label="Emotional Shield"    value={tgtMetrics.emotional} animate={animate} note={tgtBarNotes.emotional}  gradFrom="#1d4ed8" gradTo="#60a5fa" glow="#3b82f688" />
                <MetricBar icon="ti-bolt"             label="Career Momentum"     value={tgtMetrics.career}    animate={animate} note={tgtBarNotes.career}     gradFrom="#b45309" gradTo="#fbbf24" glow="#f59e0b88" />
                <MetricBar icon="ti-battery-charging" label="Physical Energy"     value={tgtMetrics.physical}  animate={animate} note={tgtBarNotes.physical}   gradFrom="#047857" gradTo="#34d399" glow="#10b98188" />
              </div>
            </div>
          )}

          {/* ══ SHARE (Function C) ══════════════════════════════════════════ */}
          <div style={{ padding: '22px 20px 0' }}>
            <button
              onClick={handleShare}
              style={{
                width: '100%', background: '#0d0d1a', border: '0.5px solid #2e2b4a',
                borderRadius: 12, color: '#9d8cc4', fontSize: 13, fontWeight: 500,
                padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              {shareCopied ? (
                <><i className="ti ti-check" style={{ color: '#34d399' }} aria-hidden /> Copied to clipboard</>
              ) : (
                <><i className="ti ti-share" aria-hidden /> Share Today's Shield Score</>
              )}
            </button>
          </div>

        </div>
      </main>

      {modal && (
        <SignModal
          sign={modal.sign}
          placement={modal.placement}
          name={firstName}
          onClose={() => setModal(null)}
        />
      )}

    </>
  )
}
