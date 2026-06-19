'use client'

import { useState, useEffect } from 'react'
import { getTrialCookie } from '@/lib/trial'
import { getWesternSign, getChineseSign } from '@/lib/astrology'
import {
  natalPlanets, calcAscendant, signOf,
  type ZodiacSign,
} from '@/lib/astro-engine'
import SignModal, { type ModalPlacement } from '@/components/SignModal'
import type { TrialCookie } from '@/types'

// ── Primal Blend texts (Western × Chinese) ─────────────────────────────────
// Key format: "WesternSign_ChineseAnimal"
// Covers 12 × 12 = 144 combinations. Grouped by Western sign with fallback.

const BLEND_CORE: Record<string, string> = {
  // ARIES
  'Aries_Rat':      'The Rat sharpens Aries fire into surgical precision — where the Ram charges, the Rat already knows which door to aim for. Your speed is never wasted; it\'s aimed.',
  'Aries_Ox':       'Ox stubbornness gives Aries fire a foundation it rarely gets. You don\'t just ignite — you ignite and hold. The most unstoppable combination: raw force with quiet durability.',
  'Aries_Tiger':    'Double fire. Tiger and Ram share the same restless forward motion, but the Tiger adds a predator\'s patience — you know when to wait, and when to strike once, perfectly.',
  'Aries_Rabbit':   'The Rabbit\'s grace softens Aries\'s edge without killing the fire. You can walk into a room, completely change its direction, and no one quite felt it as an attack.',
  'Aries_Dragon':   'Pure kinetic energy. Dragon amplifies Aries charisma into something almost impossible to ignore — a presence that opens doors before you\'ve asked.',
  'Aries_Snake':    'Snake intuition runs underneath Aries speed — you act fast, but rarely without knowing why on some cellular level. Others call it luck. It isn\'t.',
  'Aries_Horse':    'Two creatures of pure motion. Horse freedom + Aries fire = someone who needs space the way most people need oxygen. When pointed at something real, unstoppable.',
  'Aries_Goat':     'The Goat\'s creativity gives Aries fire an artistic outlet — you\'re not just the initiator, you\'re the one whose initiations are genuinely original.',
  'Aries_Monkey':   'Monkey wit + Aries boldness = someone who moves faster than others can track and is somehow also the funniest person in the room. Dangerous combination. Use it well.',
  'Aries_Rooster':  'Rooster precision channels Aries fire into something organized and deliberate. You\'re the rare Ram who actually finishes what they started — and finishes it right.',
  'Aries_Dog':      'Dog loyalty gives Aries fire a moral compass it desperately needs. You\'re not just brave — you\'re brave in the right direction, for the right reasons.',
  'Aries_Pig':      'Pig warmth softens Aries edge into something genuinely inviting. Your energy doesn\'t just push — it pulls people in. You lead and people want to follow.',

  // TAURUS
  'Taurus_Rat':     'Rat resourcefulness runs under Taurus patience like a quiet river. You build slowly and you build smart — you know which materials last and you know where to find them.',
  'Taurus_Ox':      'Double earth. Two creatures who understand that real things take real time. Your patience isn\'t passivity — it\'s the most underestimated form of power there is.',
  'Taurus_Tiger':   'Tiger restlessness creates a necessary friction with Taurus\'s need for stability. You build, then break, then build better. The tension is the engine.',
  'Taurus_Rabbit':  'The most harmonious blend on the chart. Rabbit grace + Taurus beauty sense = someone whose spaces, relationships, and work are all touched with quiet elegance.',
  'Taurus_Dragon':  'Dragon ambition gives Taurus\'s patience a destination worthy of it. You\'re the Dragon who actually delivers — not just vision, but the finished thing.',
  'Taurus_Snake':   'Snake perception under Taurus composure creates someone who appears still and is actually reading everything. Very little escapes you. Very little is said about it.',
  'Taurus_Horse':   'The tension here is instructive: Horse freedom vs. Taurus roots. You\'ve probably learned that commitment doesn\'t mean suffocation — and that\'s a hard-won wisdom.',
  'Taurus_Goat':    'Goat artistry + Taurus sensuality = someone whose aesthetic sense borders on supernatural. You know how things should feel before you know how they look.',
  'Taurus_Monkey':  'Monkey quick-thinking keeps Taurus from over-settling. You can commit deeply and still pivot cleverly — a combination most signs can\'t manage.',
  'Taurus_Rooster':  'Double precision. Rooster exactness meets Taurus thoroughness and the result is work that simply cannot be argued with. You don\'t miss things.',
  'Taurus_Dog':     'Dog\'s principled loyalty deepens Taurus\'s natural reliability. You\'re the person others build entire lives around — the fixed point in everyone\'s moving world.',
  'Taurus_Pig':     'Pig generosity + Taurus warmth = genuinely the safest place in most people\'s lives. You give real things — presence, stability, actual help — not performances of it.',

  // GEMINI
  'Gemini_Rat':     'Rat + Gemini is possibly the sharpest intellect on the entire chart. You don\'t just think fast — you think ahead, in multiple directions simultaneously, while appearing effortless.',
  'Gemini_Ox':      'Ox discipline gives Gemini\'s restless mind a container. You\'re the Gemini who actually completes the thought, finishes the book, delivers the project. Rare and powerful.',
  'Gemini_Tiger':   'Tiger confidence + Gemini wit = someone who commands rooms without trying. Your words land harder than you think. You\'re more influential than you\'ve estimated.',
  'Gemini_Rabbit':  'Rabbit diplomacy + Gemini communication = a negotiator\'s dream combination. You find the language that makes everyone feel they got what they came for.',
  'Gemini_Dragon':  'Dragon charisma amplified through Gemini\'s social intelligence. You don\'t just communicate — you inspire. People leave conversations with you feeling larger.',
  'Gemini_Snake':   'The most psychologically perceptive blend for Gemini. Snake depth gives you the ability to read what\'s not being said and find the exact words to reach it.',
  'Gemini_Horse':   'Double freedom-seekers. Your life needs variety the way other lives need routine — and when you accept that, rather than fighting it, everything flows.',
  'Gemini_Goat':    'Goat creative vision + Gemini language = an artist who can also explain what they\'re doing. You make the invisible legible, the complex accessible.',
  'Gemini_Monkey':  'The most playfully intelligent combination on the chart. You make everything look easy and interesting simultaneously. People underestimate you — to their own cost.',
  'Gemini_Rooster':  'Rooster\'s critical precision channels Gemini\'s information-processing into something actionable. You don\'t just know things — you know what to do with what you know.',
  'Gemini_Dog':     'Dog\'s moral seriousness anchors Gemini\'s lightness into something trustworthy. You\'re the communicator people actually believe.',
  'Gemini_Pig':     'Pig\'s warmth makes Gemini\'s connection genuine rather than performed. People don\'t just enjoy talking to you — they feel genuinely known by you afterward.',

  // CANCER
  'Cancer_Rat':     'Rat emotional intelligence under Cancer\'s empathy creates someone who feels everything and understands why they\'re feeling it — a therapist\'s combination.',
  'Cancer_Ox':      'Ox steadiness gives Cancer\'s emotional tides a harbor. You feel deeply and hold it with dignity — the grief doesn\'t sweep you away; it deepens you.',
  'Cancer_Tiger':   'Tiger strength underneath Cancer tenderness. You appear soft and you are soft — and you\'re also capable of ferocity that genuinely surprises people who forgot to pay attention.',
  'Cancer_Rabbit':  'The most empathic combination on the chart. You feel what others carry before they\'ve put it into words, and you know exactly how to respond without making it about you.',
  'Cancer_Dragon':  'Dragon\'s boldness creates a productive tension with Cancer\'s caution — you act, but never carelessly. The feeling leads; the Dragon executes.',
  'Cancer_Snake':   'Snake intuition deepens Cancer\'s already profound emotional radar. You know things you can\'t explain. You\'ve learned to trust that knowledge.',
  'Cancer_Horse':   'Horse freedom meets Cancer\'s longing for home — a deep internal negotiation between needing roots and needing to run. Your home is portable: it lives in the people you carry.',
  'Cancer_Goat':    'Goat sensitivity + Cancer empathy = someone who creates spaces of such genuine warmth that people remember them decades later.',
  'Cancer_Monkey':  'Monkey humor keeps Cancer from disappearing into feeling. You\'re the one who makes people laugh through the hard thing — and that\'s a profound service.',
  'Cancer_Rooster':  'Rooster practicality gives Cancer\'s care a structure and a schedule. You don\'t just feel — you show up. Consistently. That\'s the rarest form of love.',
  'Cancer_Dog':     'Two of the most loyal creatures on the chart. This combination\'s greatest gift is constancy — you\'re there before you\'re asked, and you stay.',
  'Cancer_Pig':     'Pig warmth + Cancer care = someone whose love language is deeply physical — food, presence, touch, the actual showing-up that other people theorize about.',

  // LEO
  'Leo_Rat':        'Rat\'s strategic intelligence runs under Leo\'s magnetic performance. You\'re not just the brightest in the room — you\'ve already mapped where the exits are.',
  'Leo_Ox':         'Ox discipline gives Leo\'s fire a project worthy of sustaining it. You don\'t just shine — you build something that keeps shining after you\'ve left the room.',
  'Leo_Tiger':      'Two solar animals. This is the combination that writes history — bold enough to begin, strong enough to withstand resistance, impossible to ignore.',
  'Leo_Rabbit':     'Rabbit grace refines Leo\'s natural showmanship into something genuinely elegant. You command attention and make it look like you were simply present.',
  'Leo_Dragon':     'The apex of solar energy on the chart. When this combination is aligned with something worthy, it is nearly unstoppable. When it\'s not, the heat is enormous.',
  'Leo_Snake':      'Snake depth gives Leo\'s warmth a mystery that makes people come closer without knowing exactly why. You reveal only what you choose to reveal. That\'s a kind of power.',
  'Leo_Horse':      'Horse freedom + Leo fire = a force of nature. You need space to run and an audience to run toward simultaneously — and somehow you usually find both.',
  'Leo_Goat':       'Goat artistry + Leo expression = a creative force of unusual purity. You don\'t just create — you create in a way that opens something in the people who encounter it.',
  'Leo_Monkey':     'Leo warmth + Monkey wit = the most irresistible social combination on the chart. Rooms organize around you without you arranging it.',
  'Leo_Rooster':    'Rooster precision + Leo performance = a professional who delivers exactly what they promise, and delivers it beautifully. Standards and charisma, combined.',
  'Leo_Dog':        'Dog\'s loyalty grounds Leo\'s solar energy in something real — not just brilliant, but reliably, deeply trustworthy. The warmth has teeth.',
  'Leo_Pig':        'Pig\'s generous spirit amplifies Leo\'s natural warmth into something genuinely community-building. You don\'t just love your people — you create belonging for them.',

  // VIRGO
  'Virgo_Rat':      'Two of the most analytical minds on the chart in one body. You see systems most people don\'t notice and fix them before anyone knows they were broken.',
  'Virgo_Ox':       'Double precision and patience. The work you produce is simply inarguable — you\'ve accounted for everything, twice, and the result shows it.',
  'Virgo_Tiger':    'Tiger confidence pushes Virgo past its own standards. You\'re the Tiger who measures before leaping — and the Virgo who leaps instead of measuring forever.',
  'Virgo_Rabbit':   'Rabbit diplomacy + Virgo service = the person who runs everything beautifully and never makes it seem like effort. Indispensable in ways that go perpetually unnoticed.',
  'Virgo_Dragon':   'Dragon ambition + Virgo execution = extraordinary results. You have the vision and the ability to execute it to the last detail. That combination is genuinely rare.',
  'Virgo_Snake':    'Snake intuition + Virgo analysis = possibly the most perceptive combination on the chart. You see both the pattern and the exception. Almost nothing gets past you.',
  'Virgo_Horse':    'Horse momentum helps Virgo release its perfectionism. Sometimes "good enough and moving" serves better than "perfect and still." You\'re learning that.',
  'Virgo_Goat':     'Goat creativity + Virgo craft = an artist with technical precision — the rare combination of inspiration and the discipline to realize it fully.',
  'Virgo_Monkey':   'Monkey speed + Virgo exactness = incredibly fast without sacrificing accuracy. You process, sort, and act in the time others spend deciding where to start.',
  'Virgo_Rooster':  'Two of the highest-standard signs in a single chart. Your work is either impeccable or it doesn\'t leave your hands. That\'s both a strength and a thing to watch.',
  'Virgo_Dog':      'Dog loyalty + Virgo service = someone who shows up, does the work, keeps the confidence, and never asks for credit. The foundation that holds everything else.',
  'Virgo_Pig':      'Pig warmth gives Virgo\'s service a quality of genuine care rather than obligation. You help because you actually want things to be better for people. That\'s felt.',

  // LIBRA
  'Libra_Rat':      'Rat resourcefulness under Libra\'s charm creates a negotiator of rare effectiveness — you find the path everyone wins by while making it look effortless.',
  'Libra_Ox':       'Ox steadiness gives Libra a spine it sometimes lacks. You can be fair and firm simultaneously — a combination most diplomats never manage.',
  'Libra_Tiger':    'Tiger directness gives Libra the courage to say the honest thing. You\'ve learned that real harmony requires truth, not the performance of agreement.',
  'Libra_Rabbit':   'The most graceful combination on the chart. Everything you touch has a quality of refinement — your spaces, your conversations, your choices.',
  'Libra_Dragon':   'Dragon charisma + Libra social intelligence = someone who leads through influence rather than authority. People simply agree with you — and feel good about it.',
  'Libra_Snake':    'Snake perception + Libra sensitivity = reading the room at a depth that borders on uncomfortable for everyone else in it. You\'re usually twelve steps ahead.',
  'Libra_Horse':    'Horse freedom + Libra partnership = the tension between needing connection and needing space. You\'re most alive in relationships where both are honored.',
  'Libra_Goat':     'Double aesthetic intelligence. The beauty you create and the balance you maintain are two expressions of the same fundamental drive toward harmony.',
  'Libra_Monkey':   'Monkey quick thinking + Libra charm = someone who can solve a social problem with a well-placed joke and make it look like luck rather than skill.',
  'Libra_Rooster':  'Rooster directness provides the thing Libra most needs: the ability to say the truth quickly and cleanly, before it gets edited into something useless.',
  'Libra_Dog':      'Dog\'s principled honesty deepens Libra\'s diplomacy into something real. You\'re not just fair — you\'re trustworthy in a way people orient their lives around.',
  'Libra_Pig':      'Two warmth-oriented signs that genuinely enjoy other people. Your social life is a pleasure because you are, without effort, a pleasure to be around.',

  // SCORPIO
  'Scorpio_Rat':    'Rat strategic intelligence + Scorpio depth = someone who understands systems, motivations, and leverage points at a level most people don\'t know exists.',
  'Scorpio_Ox':     'Ox endurance + Scorpio intensity = capable of sustaining an investigation, a project, or a transformation far past the point where others walk away.',
  'Scorpio_Tiger':  'Two of the most intense signs combined. The power here is enormous. So is the potential for burnout. The question is always: what is this force pointed at?',
  'Scorpio_Rabbit':  'Rabbit grace keeps Scorpio\'s intensity from overwhelming the people it most wants to reach. You see everything and say the right amount of what you see.',
  'Scorpio_Dragon': 'Dragon force amplifies Scorpio\'s already considerable power. When this combination decides something, it happens. The question is always: what have you decided?',
  'Scorpio_Snake':  'Two intuitive, perceptive signs. The depth of perception here is without parallel — you read people, patterns, and situations with an accuracy that can be disorienting.',
  'Scorpio_Horse':  'Horse freedom creates necessary relief from Scorpio\'s intensity. Movement, physical space, and variety are medicine for this combination — not escapes.',
  'Scorpio_Goat':   'Goat creativity + Scorpio depth = art that operates at the level of the unconscious. What you make touches something in people they didn\'t know was there.',
  'Scorpio_Monkey': 'Monkey humor releases Scorpio\'s pressure in the best possible way. You can take the darkest thing and find the exact angle that makes it survivable.',
  'Scorpio_Rooster':'Rooster precision + Scorpio perception = absolutely nothing gets through your filters unchecked. You see it, assess it, categorize it, and respond accordingly.',
  'Scorpio_Dog':    'Dog loyalty + Scorpio intensity = someone whose love is fierce, protective, and permanent. You don\'t love casually. When you\'re in, you\'re in completely.',
  'Scorpio_Pig':    'Pig warmth softens Scorpio\'s edge into something approachable without losing the depth. People feel safe enough to be honest with you — and that opens everything.',

  // SAGITTARIUS
  'Sagittarius_Rat':    'Rat\'s practical intelligence keeps Sagittarius from chasing purely theoretical horizons. You\'re the one who actually makes the trip.',
  'Sagittarius_Ox':     'Ox stability grounds Sagittarius\'s expansive fire into something that lasts. You build philosophies people can live inside, not just visit.',
  'Sagittarius_Tiger':  'Three fire energies: Sagittarius, Tiger, and pure forward motion. When aligned, unstoppable. When misaligned, dramatic. The key is the direction.',
  'Sagittarius_Rabbit': 'Rabbit diplomacy softens Sagittarius\'s famous bluntness into something people can receive. You\'re still honest — you\'ve just learned how.',
  'Sagittarius_Dragon': 'Dragon ambition + Sagittarius vision = someone who dreams at the largest scale and then actually pursues it. The scope of your goals is not a problem.',
  'Sagittarius_Snake':  'Snake intuition adds depth to Sagittarius\'s expansive sight. You don\'t just see far — you see under. The question beneath the question.',
  'Sagittarius_Horse':  'The most freedom-loving combination on the chart. What looks like instability from outside is actually a very deliberate relationship with possibility.',
  'Sagittarius_Goat':   'Goat artistry + Sagittarius philosophy = a creative intelligence that produces work with genuine meaning — not just beauty, but something to think about.',
  'Sagittarius_Monkey': 'Monkey wit + Sagittarius optimism = the most naturally entertaining combination on the chart. You make difficult things feel like adventures.',
  'Sagittarius_Rooster':'Rooster organization channels Sagittarius fire into actual systems. You\'re the rare archer who also builds the infrastructure to support what follows the arrow.',
  'Sagittarius_Dog':    'Dog\'s faithfulness anchors Sagittarius\'s forward momentum in genuine relationship. You\'re the traveler who always returns and always means it.',
  'Sagittarius_Pig':    'Pig generosity + Sagittarius enthusiasm = someone who shares the vision AND the resources to realize it. Genuinely inspiring and practically helpful simultaneously.',

  // CAPRICORN
  'Capricorn_Rat':      'Two of the most strategically intelligent signs. You build things that last and you build them cleverly — accounting for the variables that will emerge in year five.',
  'Capricorn_Ox':       'Double earth endurance. The patience you have for the long project is genuinely extraordinary — you\'ll still be building when others have given up or moved on.',
  'Capricorn_Tiger':    'Tiger boldness gives Capricorn permission to risk — not recklessly, but enough to reach what pure caution never could. You know when to stop measuring.',
  'Capricorn_Rabbit':   'Rabbit refinement + Capricorn ambition = an achiever with genuine taste. What you build is excellent and it looks excellent. Form and substance, together.',
  'Capricorn_Dragon':   'Dragon ambition meets Capricorn strategy and the result is a capacity for long-range achievement that almost nothing can interrupt.',
  'Capricorn_Snake':    'Snake perception + Capricorn patience = you\'re playing a game three moves deeper than anyone else in the room, and you\'ve been patient enough not to show it.',
  'Capricorn_Horse':    'Horse freedom + Capricorn discipline = the productive tension of someone who knows they do their best work in structure, and needs space to remember why they\'re doing it.',
  'Capricorn_Goat':     'Goat creativity + Capricorn mastery = an artist who has put in the hours. What you produce has both original vision and technical command — the combination that endures.',
  'Capricorn_Monkey':   'Monkey adaptability keeps Capricorn from over-systematizing. You can hold the plan and change it when the situation requires — a flexibility most Caps don\'t develop.',
  'Capricorn_Rooster':  'Double precision and standards. What this combination produces is simply the highest-quality work available. The bar is not symbolic. It is categorical.',
  'Capricorn_Dog':      'Dog loyalty + Capricorn reliability = the person whose word is a contract. You\'ve built a reputation for doing what you say, and that reputation is your most valuable asset.',
  'Capricorn_Pig':      'Pig warmth gives Capricorn\'s ambition a human reason — you\'re not building for status, you\'re building for the people who depend on what you create.',

  // AQUARIUS
  'Aquarius_Rat':       'Rat\'s strategic intelligence runs under Aquarius\'s visionary mind. You don\'t just see the future — you have a plan to move into it.',
  'Aquarius_Ox':        'Ox steadiness gives Aquarian innovation a delivery system. Your ideas don\'t live in abstraction — they get built, tested, revised, and deployed.',
  'Aquarius_Tiger':     'Tiger confidence + Aquarius originality = a force that changes fields. You refuse the obvious path and you have the nerve to follow that refusal to the end.',
  'Aquarius_Rabbit':    'Rabbit diplomacy + Aquarius vision = a reformer people can actually follow. You change things without making people feel attacked for what existed before.',
  'Aquarius_Dragon':    'Dragon ambition gives Aquarian vision scale. You don\'t think about improving things at the margin — you think about redesigning the system.',
  'Aquarius_Snake':     'Snake intuition deepens Aquarian analysis. You\'re not just intellectually ahead — you sense things about where things are going that analysis alone can\'t reach.',
  'Aquarius_Horse':     'Two freedom-oriented energies. Your life works best when the architecture honors independence — within relationships, within work, within daily structure.',
  'Aquarius_Goat':      'Goat artistry + Aquarius originality = creative work that exists ahead of its time. Not everyone gets it now. They will.',
  'Aquarius_Monkey':    'Monkey wit + Aquarius intelligence = the most conceptually playful combination on the chart. You make the avant-garde feel obvious and fun.',
  'Aquarius_Rooster':   'Rooster precision + Aquarius systems thinking = ability to both design and audit a complex system. You see what\'s elegant and what\'s broken simultaneously.',
  'Aquarius_Dog':       'Dog\'s principled nature + Aquarius\'s humanitarian instinct = genuine investment in making things better for people beyond your immediate circle.',
  'Aquarius_Pig':       'Pig warmth grounds Aquarian idealism in actual people. Your vision isn\'t abstract — it\'s for the specific humans in front of you. That makes it real.',

  // PISCES
  'Pisces_Rat':         'Rat\'s practical intelligence provides Pisces with a navigation system for moving through the world without being consumed by it. You feel everything and function.',
  'Pisces_Ox':          'Ox steadiness gives Pisces an anchor in the physical world. You have access to the full depth of feeling without being swept away by it. That\'s extraordinary.',
  'Pisces_Tiger':       'Tiger courage + Pisces compassion = a combination that can go into difficult places without losing itself. You\'re both brave and soft — separately, in the right moments.',
  'Pisces_Rabbit':      'The most sensitive combination on the chart. Everything registers. The art you make, the care you give, the spaces you create — all carry a quality of genuine presence.',
  'Pisces_Dragon':      'Dragon boldness lifts Pisces above its tendency to dissolve — you can be expansive and stay present simultaneously. A rare and powerful combination.',
  'Pisces_Snake':       'Snake intuition + Pisces permeability = a psychic intelligence that functions as a second sight. Trust what arrives without evidence. It\'s not imagination.',
  'Pisces_Horse':       'Horse movement helps Pisces stay tethered to the physical world. Motion is medicine for this combination — it metabolizes the feeling that would otherwise accumulate.',
  'Pisces_Goat':        'Two of the most creatively intuitive signs in a single chart. What you produce when aligned with your deepest feeling is simply unlike anything else.',
  'Pisces_Monkey':      'Monkey lightness keeps Pisces from sinking into the feeling. You\'re the empath who can also make people laugh — that balance makes you profoundly approachable.',
  'Pisces_Rooster':     'Rooster precision + Pisces feeling = creative work that is both emotionally resonant and technically controlled. You don\'t have to choose between depth and craft.',
  'Pisces_Dog':         'Dog loyalty + Pisces empathy = unconditional love that is actually unconditional. You don\'t keep score. You don\'t have conditions. You just show up.',
  'Pisces_Pig':         'Double water and warmth. The most genuinely compassionate combination on the entire chart. Your presence is experienced as care even when you\'re simply standing there.',
}

// ── Sign icons ─────────────────────────────────────────────────────────────
const SIGN_ICONS: Record<string, string> = {
  Aries:'ti-flame', Taurus:'ti-leaf', Gemini:'ti-affiliate', Cancer:'ti-moon',
  Leo:'ti-sun', Virgo:'ti-plant', Libra:'ti-scale', Scorpio:'ti-bug',
  Sagittarius:'ti-bow-arrow', Capricorn:'ti-mountain', Aquarius:'ti-wave-sine', Pisces:'ti-fish',
}

const CHINESE_ICONS: Record<string, string> = {
  Rat:'🐀', Ox:'🐂', Tiger:'🐅', Rabbit:'🐇', Dragon:'🐉', Snake:'🐍',
  Horse:'🐎', Goat:'🐐', Monkey:'🐒', Rooster:'🐓', Dog:'🐕', Pig:'🐖',
}

// ── Component ──────────────────────────────────────────────────────────────

export default function BlueprintClient() {
  const [cookie,  setCookie]  = useState<TrialCookie | null>(null)
  const [modal,   setModal]   = useState<{ sign: string; placement: ModalPlacement } | null>(null)

  useEffect(() => {
    const c = getTrialCookie()
    if (!c) { window.location.href = '/onboarding'; return }
    setCookie(c)
  }, [])

  if (!cookie) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#07070f' }}>
        <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 30, color: '#7c3aed' }} />
      </main>
    )
  }

  const ob        = cookie.onboarding
  const firstName = ob.name.split(' ')[0]
  const western   = getWesternSign(ob.dob)
  const chinese   = getChineseSign(ob.dob)

  const tob       = ob.tobUnknown ? '12:00' : (ob.tob || '12:00')
  const birthLat  = ob.birthCity?.lat ?? 0
  const birthLng  = ob.birthCity?.lng ?? 0
  const hasExactTOB = !ob.tobUnknown && !!ob.tob && !!ob.birthCity

  const natal         = natalPlanets(ob.dob, tob)
  const natalMoonSign = signOf(natal.Moon) as ZodiacSign
  const natalSunSign  = western.name as ZodiacSign
  const ascendant     = hasExactTOB ? calcAscendant(ob.dob, tob, birthLat, birthLng) : null

  const blendKey  = `${western.name}_${chinese.name}`
  const blendText = BLEND_CORE[blendKey] ?? `${western.name} and ${chinese.name} create a rare intersection of energies — the precision of your Western nature refined through the instinct of your Chinese essence. The combination is distinctly yours.`

  const sunIcon  = SIGN_ICONS[natalSunSign]  ?? 'ti-sun'
  const moonIcon = SIGN_ICONS[natalMoonSign] ?? 'ti-moon'

  return (
    <>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} } .icon-float{animation:float 4s ease-in-out infinite;}`}</style>

      <main style={{ minHeight: '100dvh', background: '#07070f', overflowX: 'hidden' }}>
        <div style={{ maxWidth: 460, margin: '0 auto', paddingBottom: 96 }}>

          {/* ── Header ── */}
          <div style={{
            background: 'linear-gradient(160deg,#100c24 0%,#0d0d1a 55%,#07070f 100%)',
            borderBottom: '0.5px solid #1e1b35', padding: '20px 20px 22px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,#7c3aed14 0%,transparent 70%)', pointerEvents: 'none' }} />

            <div className="icon-float" style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }}>
              <i className="ti ti-dna-2" style={{ color: '#a78bfa' }} aria-hidden />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#e2d9f3', lineHeight: 1.2, marginBottom: 4 }}>
              {firstName}<span style={{ color: '#7c3aed' }}>'s</span> Blueprint
            </h1>
            <p style={{ fontSize: 12, color: '#6b5f8a', margin: 0 }}>
              {western.name} · Year of the {chinese.name}
              {ascendant ? ` · ${ascendant} Rising` : ''}
            </p>
          </div>

          {/* ── Primal Blend ── */}
          <div style={{ padding: '22px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="ti ti-infinity" style={{ fontSize: 13, color: '#7c3aed' }} aria-hidden />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6b5f8a', letterSpacing: '0.09em', textTransform: 'uppercase' }}>The Primal Blend</span>
              <div style={{ flex: 1, height: '0.5px', background: '#1e1b35' }} />
            </div>

            <div style={{ background: '#0d0d1a', border: '0.5px solid #2e2b4a', borderRadius: 14, padding: '18px 16px' }}>
              {/* Blend icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: '#1a1628', border: '0.5px solid #3d2d6b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`ti ${sunIcon}`} style={{ fontSize: 20, color: '#a78bfa' }} aria-hidden />
                  </div>
                  <span style={{ fontSize: 13, color: '#c4b8e8', fontWeight: 500 }}>{western.name}</span>
                </div>
                <span style={{ fontSize: 18, color: '#3d3460' }}>×</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: '#1a1628', border: '0.5px solid #3d2d6b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 20 }}>{CHINESE_ICONS[chinese.name] ?? '🐉'}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#c4b8e8', fontWeight: 500 }}>{chinese.name}</span>
                </div>
              </div>

              <p style={{ fontSize: 14, color: '#c4b8e8', lineHeight: 1.8, margin: 0 }}>{blendText}</p>
            </div>
          </div>

          {/* ── The Big Three ── */}
          <div style={{ padding: '22px 20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <i className="ti ti-triangle" style={{ fontSize: 13, color: '#7c3aed' }} aria-hidden />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#6b5f8a', letterSpacing: '0.09em', textTransform: 'uppercase' }}>The Big Three</span>
              <div style={{ flex: 1, height: '0.5px', background: '#1e1b35' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BigThreeCard
                placement="sun"
                sign={natalSunSign}
                icon={sunIcon}
                label="Sun Sign"
                sub="Core identity"
                color="#fbbf24"
                onOpen={(sign, placement) => setModal({ sign, placement })}
              />
              <BigThreeCard
                placement="moon"
                sign={natalMoonSign}
                icon={moonIcon}
                label="Moon Sign"
                sub="Emotional nature"
                color="#818cf8"
                onOpen={(sign, placement) => setModal({ sign, placement })}
              />
              {ascendant ? (
                <BigThreeCard
                  placement="rising"
                  sign={ascendant}
                  icon={SIGN_ICONS[ascendant] ?? 'ti-arrow-up-circle'}
                  label="Rising Sign"
                  sub="How the world sees you"
                  color="#34d399"
                  onOpen={(sign, placement) => setModal({ sign, placement })}
                />
              ) : (
                <div style={{ background: '#0d0d1a', border: '0.5px solid #1e1b35', borderRadius: 13, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', opacity: 0.5 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#161628', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="ti ti-lock" style={{ fontSize: 18, color: '#3d3460' }} aria-hidden />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#6b5f8a', margin: '0 0 2px' }}>Rising Sign — Unknown</p>
                    <p style={{ fontSize: 11, color: '#3d3460', margin: 0 }}>Exact birth time & city required</p>
                  </div>
                </div>
              )}
            </div>
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

// ── BigThreeCard ───────────────────────────────────────────────────────────

function BigThreeCard({ placement, sign, icon, label, sub, color, onOpen }: {
  placement: ModalPlacement
  sign: string
  icon: string
  label: string
  sub: string
  color: string
  onOpen: (sign: string, placement: ModalPlacement) => void
}) {
  return (
    <button
      onClick={() => onOpen(sign, placement)}
      style={{
        width: '100%', background: '#0d0d1a', border: `0.5px solid #2e2b4a`,
        borderRadius: 13, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
        transition: 'border-color 0.18s, background 0.18s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = color + '66'; (e.currentTarget as HTMLButtonElement).style.background = '#111020' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2b4a'; (e.currentTarget as HTMLButtonElement).style.background = '#0d0d1a' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}14`, border: `0.5px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={`ti ${icon}`} style={{ fontSize: 22, color }} aria-hidden />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 3px' }}>{label}</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: '#e2d9f3', margin: '0 0 2px' }}>{sign}</p>
        <p style={{ fontSize: 11, color: '#6b5f8a', margin: 0 }}>{sub}</p>
      </div>
      <i className="ti ti-chevron-right" style={{ fontSize: 16, color: '#3d3460', flexShrink: 0 }} aria-hidden />
    </button>
  )
}
