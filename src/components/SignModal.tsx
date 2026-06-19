'use client'
import { useEffect } from 'react'

export type ModalPlacement = 'sun' | 'moon' | 'rising'

interface SignModalProps {
  sign: string
  placement: ModalPlacement
  name: string
  onClose: () => void
}

// ── Placement labels & colours ─────────────────────────────────────────────
const PLACEMENT_META: Record<ModalPlacement, { label: string; icon: string; color: string; sub: string }> = {
  sun:    { label: 'Sun Sign',      icon: 'ti-sun',          color: '#fbbf24', sub: 'Your core identity — the fire that drives you' },
  moon:   { label: 'Moon Sign',     icon: 'ti-moon-stars',   color: '#818cf8', sub: 'Your emotional nature — what you need to feel safe' },
  rising: { label: 'Rising Sign',   icon: 'ti-arrow-up-circle', color: '#34d399', sub: 'Your interface — how the world experiences you first' },
}

// ── Sign icons ─────────────────────────────────────────────────────────────
const SIGN_ICONS: Record<string, string> = {
  Aries:'ti-flame', Taurus:'ti-leaf', Gemini:'ti-affiliate', Cancer:'ti-moon',
  Leo:'ti-sun', Virgo:'ti-plant', Libra:'ti-scale', Scorpio:'ti-bug',
  Sagittarius:'ti-bow-arrow', Capricorn:'ti-mountain', Aquarius:'ti-wave-sine', Pisces:'ti-fish',
}

// ── Deep profiles ──────────────────────────────────────────────────────────
type Profile = { body: string; gift: string; shadow: string }

const SUN_PROFILES: Record<string, Profile> = {
  Aries: {
    body: `Your Sun in Aries means your core identity is built in motion. You need to act, to initiate, to be first — not out of arrogance, but because staying still feels like dying a little. The restlessness you sometimes apologize for is actually the engine of everything real you've ever created. The wound underneath it all is the fear of being stopped, dismissed, or told that your fire is too much. It isn't. It never was.`,
    gift: `You make things begin. In any room, in any situation, you're the one who breaks the paralysis — who says "let's go" and means it. That momentum is a gift most people never develop.`,
    shadow: `The Aries shadow is impatience with anything that requires sitting in uncertainty. You'd rather make a wrong move than no move — and sometimes that costs you the relationship or the opportunity that needed just a little more time.`,
  },
  Taurus: {
    body: `Your Sun in Taurus means your identity is rooted in worth — what's real, what lasts, what can be touched and trusted. You build slowly and completely. The fear underneath is losing what matters: security, stability, the people and things that anchor you. What looks like stubbornness from the outside is actually loyalty to the things you've decided deserve permanence.`,
    gift: `You make things last. In a world of speed and disposability, you're the one who builds to hold. People feel safe in structures you've created — whether that's a relationship, a home, or a way of doing things.`,
    shadow: `The Taurus shadow is resistance to change so thorough it starts to look like fear. The comfort zone that once protected you can become the thing that stops you from reaching what you actually want.`,
  },
  Gemini: {
    body: `Your Sun in Gemini means your identity lives in connection and mind — you become most fully yourself when you're learning, communicating, translating between worlds. The longing beneath the wit is to be truly known, not just appreciated for how fast you move. The fear is being pinned down to one version of yourself before you've finished figuring out who that is.`,
    gift: `You make things communicate. You're the bridge between people who couldn't reach each other without you — the one who finds the shared language in a room full of misunderstanding.`,
    shadow: `The Gemini shadow is using motion and words to avoid the feeling that needs stillness to surface. The chatter that fills the quiet before the grief. The connection that keeps things interesting so nothing has to go deep.`,
  },
  Cancer: {
    body: `Your Sun in Cancer means your identity is woven into belonging — the home you create, the people you protect, the feeling of being needed and rooted. The wound runs deep: a primal fear of abandonment that you've learned to manage by becoming indispensable. What looks like nurturing is also, sometimes, a way of making sure no one ever leaves.`,
    gift: `You make people feel safe. Not in a managed, curated way — in the ancient, cellular way that only comes from someone who genuinely gives a damn whether you're okay.`,
    shadow: `The Cancer shadow is the collapse into mood when the external world doesn't match the internal one. The withdrawal that punishes without saying what it's punishing for. The care that slowly becomes control.`,
  },
  Leo: {
    body: `Your Sun sits in the sign of the Lion — the royal fire that needs to express, to create, to pour its warmth into the world and have that warmth genuinely received. The thing underneath all of it is that you need to be seen — not performed at from a distance, but truly witnessed. When you feel overlooked, something ancient and frightened wakes up. The work of this placement is learning that your light doesn't require performance to justify its existence.`,
    gift: `You carry an almost supernatural ability to make people feel important just by turning your full attention toward them. That's not a small thing. That's love, expressed as presence.`,
    shadow: `The Lion's pride is its greatest armor and its most honest wound. When you can't admit you were wrong, or can't let someone else shine without feeling diminished — that's the fear talking, not the gift.`,
  },
  Virgo: {
    body: `Your Sun in Virgo means your identity is earned through precision, service, and making things genuinely better. The fear underneath is inadequacy — the constant suspicion that you're slightly behind, slightly not enough, that the gap between who you are and who you should be is more visible than you'd like. The inner critic has been so loud for so long that you've started to mistake its voice for truth.`,
    gift: `You notice what's broken before anyone else has identified it as a problem, and you fix it without making it about yourself. That quality — quiet competence in service of something real — is one of the rarest things there is.`,
    shadow: `The Virgo shadow is perfectionism that stops motion. The standard held so high that nothing is ever ready, never quite right enough to share. The help that comes with an edge of judgment. The self-criticism that poisons the well of what you've actually built.`,
  },
  Libra: {
    body: `Your Sun in Libra means your identity is formed in relationship — you become most yourself in the context of other people, through the quality of your connections, through the acts of balancing and harmonizing that you perform so naturally others don't notice you're doing it. The wound is a profound fear of conflict and aloneness that sometimes makes you agree when you don't, and disappear when you should speak.`,
    gift: `You see all sides simultaneously — not as indecision, but as a panoramic intelligence that almost no one else in the room has access to. When you trust that vision and act on it, you create outcomes that feel fair to everyone involved.`,
    shadow: `The Libra shadow is the self that keeps disappearing to keep the peace. The opinion that gets softened until it no longer says anything real. The yes that means no, delivered with such grace that no one notices the cost to you.`,
  },
  Scorpio: {
    body: `Your Sun in Scorpio means your identity is forged in depth, transformation, and the willingness to go to places most people won't. You've been in the dark and found something there. The wound is betrayal — real or anticipated — and the elaborate internal structures you've built to make sure it never happens in quite the same way again. What looks like intensity is actually a very precise form of self-protection.`,
    gift: `You see what's real when everyone else is managing appearances. That perception — the thing beneath the thing, the truth inside the story — is one of the most powerful forms of intelligence that exists.`,
    shadow: `The Scorpio shadow is control used as a substitute for trust. The information withheld as leverage. The wound kept open because closing it would mean giving up the vigilance, and vigilance is the only thing that's ever felt safe.`,
  },
  Sagittarius: {
    body: `Your Sun in Sagittarius means your identity lives in possibility — in the horizon, the question, the meaning just beyond the next ridge. You're fueled by freedom, philosophy, and the relentless sense that there's more to understand. The wound, which you rarely let yourself feel, is that all this forward motion is sometimes running from something you haven't named yet. The thing you're looking for isn't always out there.`,
    gift: `You make movement feel like adventure rather than risk. You bring people with you into uncertainty because your optimism is credible — it's backed by actual experience of things working out when you kept going.`,
    shadow: `The Sagittarius shadow is the incompletion that accumulates like debt. The relationships half-built, the projects half-finished, the promises made in the glow of enthusiasm that the next horizon has already replaced.`,
  },
  Capricorn: {
    body: `Your Sun in Capricorn means your identity is built through mastery, achievement, and the slow accumulation of things that hold. You're playing a longer game than almost anyone around you. The wound is a deep fear of failure — not of falling once, but of being exposed as insufficient after all the effort. The discipline you carry is real, but so is the exhaustion beneath it.`,
    gift: `You see twenty moves ahead and have the patience to execute each one. That combination — strategic vision plus actual follow-through — is what separates people who build empires from people who talk about building them.`,
    shadow: `The Capricorn shadow is the performance of being fine. You can hold yourself together under pressure that would level most people — and the cost is that no one thinks to check whether you need something, because you've trained them not to expect it.`,
  },
  Aquarius: {
    body: `Your Sun in Aquarius means your identity is defined through distinctness — your vision, your originality, your refusal to be absorbed by the consensus reality everyone else accepts without question. The wound is the specific loneliness of being ahead of the room: seen as eccentric by people who haven't caught up yet, and secretly longing for someone who actually can.`,
    gift: `You see the future clearly enough to act in it today. That forward-located intelligence, when trusted rather than apologized for, puts you years ahead of rooms you're still physically standing in.`,
    shadow: `The Aquarius shadow is detachment used to avoid vulnerability. The analysis of connection as a substitute for actual connection. The glass wall that protects you from being hurt and also keeps you from being fully known.`,
  },
  Pisces: {
    body: `Your Sun in Pisces means your identity is fluid, empathic, and dissolving — you feel what others feel, absorb what others carry, and sometimes lose track of where you end and the world begins. The wound is the fear of being consumed: by other people's needs, by emotion, by the boundlessness that makes you extraordinary and also exhausting to inhabit. You came here to feel everything. That's not a burden. That's your assignment.`,
    gift: `You make people feel held. In your presence, people sense that their most fragile parts are safe — not because you've said anything, but because the field around you is genuinely accepting.`,
    shadow: `The Pisces shadow is the disappearance into other people's reality until your own becomes impossible to locate. The martyrdom that doesn't ask for anything back and then quietly drowns. The escape — into fantasy, into addiction, into anything that blurs the edges — when reality gets too sharp.`,
  },
}

const MOON_PROFILES: Record<string, Profile> = {
  Aries: {
    body: `Your Moon in Aries means your emotional body is fast, reactive, and honest — you feel things immediately and completely, and then, often, move on faster than the people around you can track. You feel safe when you're moving, when you're the one initiating, when there's room to be direct without managing the fallout. Stillness reads as threat. Waiting feels like abandonment.`,
    gift: `Emotional courage. You'll say the thing no one else is willing to say, feel the thing no one else will admit to feeling, and clear the air in a way that actually makes room for something better.`,
    shadow: `The Aries Moon's shadow is the emotional aftermath of leading with fire. The anger that arrives before the sadness does. The reaction that's genuine but timed wrong. The recovery that's faster inside you than it is in the relationship.`,
  },
  Taurus: {
    body: `Your Moon in Taurus means you're emotionally nourished by stability, sensory pleasure, and the slow accumulation of comfort. You need things to feel consistent — environments, people, routines. Disruption to your sense of security hits at a primal level that can be hard to articulate. You process slowly and completely, which means when you've decided how you feel, you've genuinely decided.`,
    gift: `You create a quality of emotional safety that other people find profoundly restful. Your steadiness isn't performed — it's constitutional, and people in chaos orient toward it without knowing why.`,
    shadow: `The Taurus Moon's shadow is emotional stubbornness — the refusal to update a feeling even when the situation has changed. The wound that stays open because changing would require admitting something hurt you.`,
  },
  Gemini: {
    body: `Your Moon in Gemini means you process emotion through language and motion — feelings that can't be spoken or shared feel almost unreal to you. You're emotionally nourished by stimulation, variety, and someone sharp enough to keep up with the speed of your interior. Anxiety rises in stillness and settles when you're moving, learning, communicating something that matters.`,
    gift: `You can hold emotional complexity without collapsing — multiple contradictory feelings at once don't break you, they enrich you. That's a rare and underappreciated kind of resilience.`,
    shadow: `The Gemini Moon's deepest avoidance is the feeling that can't be talked into manageable shape. The chatter that fills the quiet before grief arrives. The motion that prevents the thing that actually needs to land from landing.`,
  },
  Cancer: {
    body: `Your Moon in Cancer means you feel everything — not metaphorically, but literally, in the body, in the gut, in the shift of atmosphere before anyone has spoken a word. You're emotionally nourished by belonging, by being genuinely needed, by spaces that feel like home. The pain of this placement is that you can carry everyone else's emotional weather and lose track of your own.`,
    gift: `You know what someone needs before they know they're going to ask for it. That's not an inconvenience — that's a form of love so deep it functions like a second nervous system.`,
    shadow: `The Cancer Moon's shadow is emotional absorption taken past the point of safety. The mood that fills the room without announcing itself. The retreat into shell when vulnerability would have served everyone better.`,
  },
  Leo: {
    body: `Your Moon in Leo means you're emotionally nourished by recognition, creative expression, and the warmth of genuine appreciation. Not applause — real acknowledgment of who you actually are. When that's present, you're radiant. When it's absent, a specific kind of loneliness sets in that you might dress up as pride or busy-ness. You need to be celebrated — not constantly, but genuinely.`,
    gift: `You bring light to other people's emotional lives. Your enthusiasm for the people you love is generous, specific, and memorable — it's the kind that makes someone feel chosen.`,
    shadow: `The Leo Moon's shadow is the emotional performance that replaces actual vulnerability. The feeling managed into something more flattering. The wound dressed in gold until it becomes invisible even to you.`,
  },
  Virgo: {
    body: `Your Moon in Virgo means you process emotion through analysis — you feel something and immediately begin to understand it, categorize it, find the useful signal in the noise. You're emotionally nourished by order, productivity, and the sense that you're contributing something real. Chaos is genuinely distressing to you at a physiological level, not just a preference.`,
    gift: `You're one of the most genuinely helpful emotional presences there is — not in a performed way, but in the practical, specific, "I noticed you needed this and I handled it" way that actually changes people's lives.`,
    shadow: `The Virgo Moon's shadow is self-criticism that's been running so long it's become the background music. The worry that looks like preparation. The emotional processing that turns inward and becomes anxiety when the world refuses to be organized.`,
  },
  Libra: {
    body: `Your Moon in Libra means you're emotionally nourished by harmony, beauty, and genuine connection — you feel most at home when things are balanced and relationships are easy. Conflict doesn't just bother you, it registers as a kind of physical discomfort. You're exquisitely sensitive to the emotional temperature of a room and adjust instinctively, sometimes before you've decided to.`,
    gift: `You create peace. Not the false peace of avoidance, but the genuine article — spaces where people feel comfortable enough to be honest, where hard things can be said without the room shattering.`,
    shadow: `The Libra Moon's shadow is the self that disappears into accommodation. The emotional response that gets edited before it's expressed. The loneliness of being agreeable so consistently that no one is quite sure what you actually feel.`,
  },
  Scorpio: {
    body: `Your Moon in Scorpio means you feel everything at maximum intensity and reveal almost none of it. Emotionally, you're an ocean with a still surface. You're nourished by depth, by being genuinely trusted with real things, by intimacy that doesn't shy away from the difficult. Shallow emotional contact doesn't just bore you — it feels like a kind of insult.`,
    gift: `You can sit with someone in their darkest place without needing to fix it, illuminate it, or make it more comfortable. That capacity — to hold darkness without flinching — is one of the most extraordinary emotional gifts that exists.`,
    shadow: `The Scorpio Moon's shadow is the wound kept open because vulnerability would mean surrendering the control that's been the only thing that ever felt safe. The feeling translated into power dynamics when love would have worked better.`,
  },
  Sagittarius: {
    body: `Your Moon in Sagittarius means you're emotionally nourished by freedom, meaning, and the sense that life is genuinely interesting and expansive. You feel most alive when you're learning something that rearranges what you thought was true. Emotional weight that doesn't resolve into movement or meaning can feel almost physically unbearable.`,
    gift: `Your emotional optimism is contagious in the best way — not naive, but genuinely rooted in experience of things opening up when you kept going. You make people believe that the next chapter could actually be better.`,
    shadow: `The Sagittarius Moon's shadow is the emotional avoidance dressed as philosophy. The pursuit of the next horizon that conveniently prevents you from having to sit with what you left behind.`,
  },
  Capricorn: {
    body: `Your Moon in Capricorn means you've learned, probably early, to manage your emotional life with the same efficiency you bring to everything else. You're nourished by competence, by respect, by the sense that what you're doing matters and is being recognized. Emotional need feels uncomfortable — yours and often other people's. You're better at solving the problem than sitting with the feeling.`,
    gift: `Emotional reliability. You don't dissolve in crisis, you organize it. People can count on you when everything else is falling apart, and that quality builds the kind of trust that lasts decades.`,
    shadow: `The Capricorn Moon's shadow is the emotional life that gets postponed indefinitely. The feelings filed away to be dealt with after the work is done — and the work is never done. The loneliness of being the dependable one.`,
  },
  Aquarius: {
    body: `Your Moon in Aquarius means you process emotion from a slight remove — not because you don't feel things deeply, but because feeling things deeply has always felt slightly dangerous, and the overview position at least gives you information. You're nourished by intellectual connection, by people who surprise you, by the sense that you're part of something larger than your own story.`,
    gift: `You can be present with someone's pain without being swept into it — which makes you one of the most stabilizing emotional presences available, particularly in situations where everyone else is already drowning.`,
    shadow: `The Aquarius Moon's shadow is the distance that protects against vulnerability and also against real intimacy. The friend who understands everything and reveals nothing. The loneliness of being the one who sees everyone clearly and feels seen by almost no one.`,
  },
  Pisces: {
    body: `Your Moon in Pisces means your emotional body has no edges — you absorb what's around you, feel what others feel, and dissolve into the emotional atmosphere of any room you walk into. You're nourished by beauty, by spiritual connection, by the sense that there's something larger holding everything together. The challenge is maintaining any sense of your own emotional reality when everyone else's is so loud.`,
    gift: `Empathy so precise it functions like perception — you don't just understand what someone is feeling, you feel it alongside them in a way that makes them feel genuinely less alone. That is a rare and extraordinary form of love.`,
    shadow: `The Pisces Moon's shadow is the dissolution of self into other people's emotional worlds. The martyrdom that gives until there's nothing left and then doesn't understand why it's empty. The escape routes — fantasy, numbing, disappearing — that become necessary when the permeability gets too painful.`,
  },
}

const RISING_PROFILES: Record<string, Profile> = {
  Aries: {
    body: `Aries Rising means the world encounters you as direct, energized, and slightly magnetic — there's a forward-leaning immediacy to your presence that people either find exciting or slightly alarming, depending on how awake they are. You project confidence as a default, which earns you respect and also sometimes earns you the assumption that you don't need support. The gap between how you appear (fearless) and what you sometimes carry (fear, like everyone else) can be isolating.`,
    gift: `You create momentum in rooms just by being present. Your energy is a permission structure for other people — when you move, they feel like they can too.`,
    shadow: `The Aries Rising shadow is the appearance of not needing anything, maintained so well that eventually no one offers. The impression of being fine that becomes the thing that keeps you from getting what you actually need.`,
  },
  Taurus: {
    body: `Taurus Rising means the world experiences you as calm, sensual, and gently authoritative — there's a gravitational quality to your presence that makes people slow down and settle. You project stability before you've said a word. What people don't always see is the depth of feeling underneath the composure, or the stubbornness that's indistinguishable from the steadiness until something wants to move you.`,
    gift: `You create a quality of safety that's rare and hard to replicate. People feel more grounded in your presence — like whatever is happening is somehow going to be okay.`,
    shadow: `The Taurus Rising shadow is the impression of ease that prevents people from realizing when you're struggling. The composed exterior that keeps the world at exactly the distance you've decided is safe.`,
  },
  Gemini: {
    body: `Gemini Rising means the world encounters you as quick, curious, and socially brilliant — you adapt your presentation to whatever the situation requires with what looks like effortlessness. People experience you as interesting and engaging before they've had time to decide whether they like you. The gap between the quick, witty interface and the more complex interior is something you navigate constantly.`,
    gift: `You can enter any room and find a point of genuine connection within minutes. That social agility isn't superficial — it's a sophisticated form of intelligence that opens doors most people don't know exist.`,
    shadow: `The Gemini Rising shadow is the interface that becomes the identity. The performance of engagement so polished that it starts to feel like the thing itself — and somewhere underneath, you wonder if anyone is reaching the actual you.`,
  },
  Cancer: {
    body: `Cancer Rising means the world experiences you as warm, intuitive, and somehow maternal or protective — people feel taken care of in your presence even when you haven't done anything specific. You read emotional atmospheres before you read words. The challenge is that this sensitivity is visible to others before it's visible to you — people bring you their wounds because you look like someone who can hold them.`,
    gift: `You make people feel received. Not just heard — received, as in their actual experience has landed somewhere it's genuinely welcome. That's a rare and profound kind of presence.`,
    shadow: `The Cancer Rising shadow is the impression of unconditional availability that eventually runs dry. The care given past the point of sustainability because the interface projects receptivity even when the interior is depleted.`,
  },
  Leo: {
    body: `Leo Rising means the world encounters you as radiant, warm, and magnetically present — you have a solar quality that makes whatever room you're in feel more alive. People orient toward you before you've earned it, which can feel like a gift and also like a performance requirement you didn't sign up for. The pressure to be "on" when you're Leo Rising can be quietly exhausting.`,
    gift: `Your presence is a gift people feel before they can name it. You make ordinary moments feel significant — just by choosing to show up fully, you shift the quality of what's possible.`,
    shadow: `The Leo Rising shadow is the expectation of performance that follows you everywhere. The way the world has decided what you're supposed to be like, based on first impressions, that sometimes leaves no room for the quieter, less radiant versions of who you actually are.`,
  },
  Virgo: {
    body: `Virgo Rising means the world experiences you as precise, reliable, and slightly understated — you project competence without announcing it, which earns you trust and sometimes earns you the assumption that you're always okay. People bring you their problems because you look like someone who has a plan. The gap between the put-together exterior and the inner critic running its commentary is wider than anyone suspects.`,
    gift: `You create order where there was chaos, simply by your presence. People feel more organized, more clear, more capable of handling things after spending time with you — and they often can't say exactly why.`,
    shadow: `The Virgo Rising shadow is the standard held so visibly that people around you feel subtly judged — even when you're judging yourself far more harshly than anyone else. The perfectionism that leaks out as a kind of atmospheric pressure.`,
  },
  Libra: {
    body: `Libra Rising means the world encounters you as graceful, charming, and aesthetically calibrated — you walk into rooms and immediately make them more beautiful and more harmonious, without seeming to try. People experience you as easy to be around. What they don't see is the constant calculation underneath the ease — the social intelligence running continuously to make sure the harmony holds.`,
    gift: `You make connection feel effortless for the people around you. In your presence, conversations go deeper, tensions ease, and people find themselves saying things they didn't plan to say because the space felt safe enough.`,
    shadow: `The Libra Rising shadow is the exhaustion of the diplomat. The harmony maintained at the cost of your own honest experience. The beautiful impression that costs more to sustain than anyone around you knows.`,
  },
  Scorpio: {
    body: `Scorpio Rising means the world experiences you as intense, perceptive, and slightly magnetic in a way that's hard to look away from. People sense that you see more than you're saying — which is usually true. You project a quality of depth that makes people either drawn to you or slightly uneasy around you, depending on how much they have to hide. There's almost no way to be in your presence and feel neutral about it.`,
    gift: `Your presence creates a quality of honesty in rooms — people find themselves dropping the performance because your X-ray quality makes it feel pointless. That's a profound gift for anyone who's tired of pretending.`,
    shadow: `The Scorpio Rising shadow is the power dynamic that develops when people can feel you seeing through them. The intensity that doesn't turn off even when it would serve everyone better to soften. The impression that invites projection — people assume they know what you think of them, and they're usually wrong.`,
  },
  Sagittarius: {
    body: `Sagittarius Rising means the world experiences you as open, enthusiastic, and slightly larger than life — you take up space in a way that feels generous rather than imposing, and you make things feel possible just by arriving. People experience your optimism as contagious before they've decided whether it's warranted. The gap between the expansive interface and the moments of private doubt is one that almost no one gets to see.`,
    gift: `You make the future feel reachable. When you say something is possible, people believe it — not because you've given them evidence, but because the quality of your belief is persuasive in its own right.`,
    shadow: `The Sagittarius Rising shadow is the perpetual forward-motion that makes depth hard to achieve. The impression of freedom that sometimes prevents people from offering you the anchor you actually need.`,
  },
  Capricorn: {
    body: `Capricorn Rising means the world experiences you as composed, quietly authoritative, and capable before you've said a word. You project competence as a default — which earns respect and also earns the assumption that you don't need anything. The distance people sometimes feel from you isn't coldness. It's the careful architecture you built when letting people in felt like a risk you couldn't afford. And it worked. And it also cost you something you're still calculating.`,
    gift: `A natural gravitas that makes ideas credible when you speak them. You make seriousness feel trustworthy, and trustworthiness feel powerful. People follow you without knowing exactly why.`,
    shadow: `The performance of being fine, maintained so well that no one thinks to ask whether you are. The loneliness of capability — the specific isolation of being the person everyone believes has it together.`,
  },
  Aquarius: {
    body: `Aquarius Rising means the world experiences you as original, slightly ahead, and refreshingly hard to categorize. You project a frequency that's distinctively yours — people recognize you even before they know you. The sense that you're operating from a different set of coordinates than everyone else is accurate, and it's both your greatest distinction and your most consistent source of loneliness.`,
    gift: `You make rooms feel like it's okay to be strange. Your presence is a permission structure for anyone who's been trying to fit and can't — when you're around, the weird option suddenly seems like the interesting one.`,
    shadow: `The Aquarius Rising shadow is the uniqueness that becomes its own performance. The cool detachment that protects against the vulnerability of actually wanting to belong. The glass wall that keeps you distinct and also separate.`,
  },
  Pisces: {
    body: `Pisces Rising means the world experiences you as soft-edged, dreamy, and somehow otherworldly — people often feel in the presence of something larger than a person when they're with you. You project empathy and receptivity before you've said anything, which means people bring you their most tender and difficult things almost immediately. The challenge is that you absorb all of it.`,
    gift: `You create the experience of being truly seen — not analyzed, not categorized, but received exactly as you are. In your presence, people feel permitted to be complex and contradictory, and that is an extraordinary thing to offer the world.`,
    shadow: `The Pisces Rising shadow is the dissolution of self into whatever is needed. The impression of boundless empathy that is both real and unsustainable. The way your permeability can be taken advantage of by people who mistake openness for an invitation to take.`,
  },
}

const PROFILES: Record<ModalPlacement, Record<string, Profile>> = {
  sun:    SUN_PROFILES,
  moon:   MOON_PROFILES,
  rising: RISING_PROFILES,
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SignModal({ sign, placement, name, onClose }: SignModalProps) {
  const meta    = PLACEMENT_META[placement]
  const profile = PROFILES[placement][sign] ?? PROFILES[placement]['Leo']
  const icon    = SIGN_ICONS[sign] ?? 'ti-sparkles'

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      <style>{`
        @keyframes sheet-up { from { transform: translateY(100%); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes fade-in   { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)', zIndex: 200,
          animation: 'fade-in 0.2s ease',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
        background: '#0f0e1f', borderRadius: '20px 20px 0 0',
        border: '0.5px solid #2e2b4a', borderBottom: 'none',
        maxHeight: '88dvh', overflowY: 'auto',
        animation: 'sheet-up 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#2e2b4a' }} />
        </div>

        <div style={{ padding: '8px 22px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${meta.color}18`, border: `0.5px solid ${meta.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <i className={`ti ${icon}`} style={{ fontSize: 26, color: meta.color }} aria-hidden />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: meta.color, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 3px' }}>
                  {meta.label}
                </p>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: '#e2d9f3', margin: 0 }}>{sign}</h2>
                <p style={{ fontSize: 11, color: '#6b5f8a', margin: '2px 0 0' }}>{meta.sub}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: '#1a1628', border: '0.5px solid #2e2b4a', borderRadius: 8,
                color: '#6b5f8a', fontSize: 16, padding: '6px 8px', cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center',
              }}
            >
              <i className="ti ti-x" aria-hidden />
            </button>
          </div>

          {/* Body */}
          <p style={{ fontSize: 14, color: '#c4b8e8', lineHeight: 1.8, marginBottom: 18 }}>
            {profile.body}
          </p>

          {/* Gift */}
          <div style={{ background: '#0d1a14', border: '0.5px solid #14532d', borderRadius: 11, padding: '13px 15px', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <i className="ti ti-sparkles" style={{ fontSize: 13, color: '#34d399' }} aria-hidden />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', letterSpacing: '0.07em', textTransform: 'uppercase' }}>The Gift</span>
            </div>
            <p style={{ fontSize: 13, color: '#a7f3d0', lineHeight: 1.65, margin: 0 }}>{profile.gift}</p>
          </div>

          {/* Shadow */}
          <div style={{ background: '#1a0f1a', border: '0.5px solid #6b21a8', borderRadius: 11, padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <i className="ti ti-moon" style={{ fontSize: 13, color: '#c084fc' }} aria-hidden />
              <span style={{ fontSize: 10, fontWeight: 700, color: '#c084fc', letterSpacing: '0.07em', textTransform: 'uppercase' }}>The Shadow</span>
            </div>
            <p style={{ fontSize: 13, color: '#e9d5ff', lineHeight: 1.65, margin: 0 }}>{profile.shadow}</p>
          </div>
        </div>
      </div>
    </>
  )
}
