# Lumora World — Brand Kit

*Draft v1, derived from the Final Feature Spec (locked). Voice rules and required on-screen text below are carried forward as non-negotiable constraints from that doc. Color, type, iconography, and logo direction are new creative recommendations, proposed and open to design review — they are not yet "locked" the way the spec's product decisions are.*

---

## 1. Brand at a Glance

**Name:** Lumora World
**One-liner (corrected, use as-is):** Lumora turns a DALI-aligned learning screen into a five-world adventure — one teacher, one tablet, no specialist required. Every world tracks real performance signals and adapts with simple, transparent rules, not a black box.

**What it is, in one sentence:** A five-world learning adventure for early readers that a single teacher can run on a single tablet, built on rule-based (not AI-hyped) adaptive difficulty.

**Who it's for:** Teachers running the session, parents reading the weekly summary, specialists reading the printable report. Not the child's primary audience in the branding sense — the child is the player, but the brand has to earn trust with the adults reading the output.

**Core brand value: honesty over hype.** Every other decision in this kit — copy, color, claims — serves that one value. The product's most defensible feature is that it says exactly what it is and no more.

---

## 2. Voice & Tone *(locked constraints from spec, styled here)*

**Principles**
- **Plain over impressive.** If a plainer word says the same thing, use the plainer word. "Adapts with simple rules" beats "AI-driven," not just because it's more accurate but because it's more confident — Lumora isn't hiding behind jargon.
- **Calm, not clinical.** This product touches a sensitive area — a child's reading development. Warm and matter-of-fact, never alarmist, never cutesy about it either.
- **Specific over clever.** Say what a feature does, not how exciting it is. A parent reading a summary about their child doesn't need a tagline; they need to know what happened.
- **Teacher- and parent-first language.** Name things by what the adult using them controls and recognizes, not by the system underneath. "Weekly summary," not "aggregated session telemetry."

**Say / Don't say**

| Don't say | Say instead |
|---|---|
| "AI-powered," "AI-driven," "adaptive AI" | "adapts with simple, transparent rules" |
| "the REAL Brain" | (retire entirely — no replacement needed) |
| "black box," "biomarker" | "real performance signals," "rule-based engine" |
| any numeric confidence, risk, or score | three-tier language only: *typical range / worth a closer look / recommend follow-up* |
| implying gesture control outside Rune Realm | don't mention it — it isn't in this build |
| implying gaze-tracking or oculomotor detection | don't mention it — it isn't in this build |
| calling Vision Valley "DALI-aligned" | "visual attention and tracking — dyslexia-adjacent, not an official DALI category" |
| "diagnosis," "result," "test score" | "signal for a teacher or specialist to review" |

**The three-tier language is the only scoring vocabulary that exists.** Not a simplified version of a numeric score, not a rounding of one — there is no number behind it anywhere in the product or its marketing.

---

## 3. Naming System *(proposed)*

- **Product name:** "Lumora World" on first reference in any document (pitch decks, press, app store listing); "Lumora" is fine after that. Don't shorten to an acronym.
- **World names are fixed** — don't retitle them per-audience:

| World | Construct | Note for copy |
|---|---|---|
| 🌲 Sound Forest | Communication / phonological (DALI) | |
| 🏰 Story Castle | Reading (DALI) | |
| ✍️ Rune Realm | Writing / motor (DALI) | the only world that mentions camera tracing |
| 🧠 Memory Mountains | Memory (DALI, official category) | |
| 👁️ Vision Valley | Visual attention/tracking — **not** a DALI category | always name it as supplementary, never imply DALI-alignment |

- **The Buddy guide:** referred to as "the Buddy guide" or "your Buddy" in this kit. It's the existing cat mascot — reuse it as designed; this kit does not propose a redesign or a new name. If the character already has a name from earlier work, keep that name; don't relabel it here.
- **Calm Mode, session-limit nudge:** plain, literal names, sentence case, no cute rebrand ("Calm Mode" not "Zen Mode," etc.). The literalness is itself on-brand.

---

## 4. Color System *(proposed)*

Two palettes, used for two different jobs. **World colors are for play.** **Neutral colors are for anything an adult has to trust** — dashboards, consent, disclaimers, reports. Never mix a world color into a parent- or specialist-facing screen; that separation is what keeps the "evidence" side of the product feeling calm and credible instead of gamified.

**Neutral system** (dashboards, consent screens, disclaimers, reports)

| Token | Hex | Use |
|---|---|---|
| Ink | `#2B2A33` | primary text |
| Muted ink | `#6B6875` | secondary text, captions |
| Paper | `#F4F2F6` | background |
| Hairline | `#E4E1E8` | borders, dividers |
| Signal (three-tier only) | typical `#4C8577` · closer look `#C68A3E` · follow‑up `#B0473F` | status language, never a gradient or meter — three flat, equal-weight chips, not a scale |

**World system** (in-world play only)

| World | Primary | Accent | Why |
|---|---|---|---|
| 🌲 Sound Forest | `#2F5D50` pine | `#E8A33D` dappled light | canopy shade and the light breaking through it |
| 🏰 Story Castle | `#3E4C7A` dusk indigo | `#8B3A52` banner berry | storybook castle at dusk, heraldic banner accent |
| ✍️ Rune Realm | `#5B5654` carved stone | `#2FA8A0` rune glow teal | stone the finger traces across, glowing where it's been |
| 🧠 Memory Mountains | `#4F5D75` twilight slate | `#9B87B0` ridge lilac | layered ridgelines at last light — a quiet, reflective world |
| 👁️ Vision Valley | `#3E8FB0` sky blue | `#EFC94C` sunrise gold | open valley, wide sky, clear morning light |

Deliberately avoided: the warm-cream-plus-terracotta combination and the dark-background-plus-neon-accent combination that most AI-generated kids'-app pitches default to. Nothing here uses either.

**Calm Mode rule:** desaturate all world colors ~30% and drop accent usage to backgrounds/fills only (no accent-colored moving elements). Neutral system is unaffected — it's already calm.

---

## 5. Typography *(proposed)*

| Role | Face | Why |
|---|---|---|
| Body / UI / dashboards | **Lexend** | designed and tested specifically for reading proficiency; a legible, research-backed choice for a product that's literally about early reading, and it reads as considered rather than decorative |
| Display / world titles / wordmark | **Baloo 2** | rounded, warm, has enough personality for five distinct world titles without tipping into a novelty font |
| Data / metrics (specialist dashboard) | **Lexend** at tabular figures, or a plain mono (e.g. IBM Plex Mono) for the heatmap's numeric labels only | numbers should look like data, not like part of the story |

**Before Hindi/Marathi rollout begins:** confirm Devanagari glyph coverage for both faces (or pick a paired alternate for that script) — flag this as a design task to close out before localization starts, not something to assume works. This lines up with the spec's own rollout order: English fully stable first, then Hindi and Marathi.

---

## 6. Iconography & Illustration Style *(proposed)*

- Flat, storybook-illustrated — not 3D-glossy, not photographic, not stock "kids app" clip art.
- Consistent line weight across all five worlds and the Buddy guide, so a child can tell it's all one product even as the palette shifts world to world.
- **No photographs of real children anywhere in brand or marketing material.** This isn't just a style preference — it mirrors the product's own non-negotiable that no real child-identifying data leaves the device. The brand shouldn't do with imagery what the product refuses to do with data.
- Each world gets one signature motif for icon/favicon use: a leaf (Sound Forest), a tower window (Story Castle), a glowing rune (Rune Realm), a ridgeline (Memory Mountains), an open eye framed by hills (Vision Valley).

---

## 7. Logo Concept *(proposed — not locked)*

Direction: a small lantern or spark worked into the wordmark, tied to the name itself (*Lumora* ← *lumen*, light) and to the idea of the Buddy guide leading a child through five worlds by lantern-light. Concretely: the dot on a lowercase "i" or the counter of an "o" in "Lumora" reads as a small glowing point rather than a plain circle.

**Lockup rules:**
- One wordmark, always in Ink (`#2B2A33`) or Paper (`#F4F2F6`) depending on background — it never inherits a world's color. The logo is one of the few things that stays neutral everywhere.
- Keep clear space around it equal to the height of the "L."
- Don't stretch, rotate, or recolor per-world; a shifting logo undercuts the "one consistent, honest product" feeling the neutral system is protecting.

This is a starting direction for whoever executes the actual mark, not a finished asset.

---

## 8. Buddy Guide Mascot *(locked constraint: reuse as-is, styled here)*

- Reuse the existing cat character exactly as designed. This kit does not propose changes to its design — building a second character or redesigning the first was explicitly ruled out in the spec.
- Personality: encouraging, patient, unbothered by mistakes. Never mocks a wrong answer, never celebrates a correct one more than the badges already do.
- Present in all five worlds with consistent proportions and line weight so it's recognizably the same character everywhere, not a re-skin per world.
- In Calm Mode: same character, slower and smaller movements, no bounce/idle animation loop.

---

## 9. Calm Mode — Visual & Audio Rules *(proposed, implementing the spec's "global toggle")*

- Reduce animation to essential state-change only (no idle/ambient motion).
- Desaturate world colors ~30% (see §4).
- Increase minimum tap target size.
- Mute or remove non-essential sound effects; keep only functional audio cues (correct/incorrect, if used).
- No sudden or loud audio anywhere in this mode.

---

## 10. Required On-Screen Text *(locked — non-negotiable, from spec)*

These are product requirements, not suggestions, and they belong on-screen, not just in this doc or internal docs:

- **Consent screen** before any child profile is created.
- **Full disclaimer text on every results screen** — product-side, rendered in the app itself.
- **"Sample Data — Demonstration Only"** printed directly on the specialist report output (the PDF/printout), not only shown on the screen that generates it. The report is what's most likely to leave the app and get mistaken for something real.
- **Three-tier language only, everywhere, no exceptions** — no numeric score or confidence meter on any screen, in any dashboard, or in any exported artifact.

**Draft disclaimer tone** (starting point only — route through legal/clinical review before shipping):
> *Lumora World tracks how a child plays across five activities and summarizes patterns for a teacher, parent, or specialist to review. It does not diagnose, and results should not be read as a medical or clinical assessment. If a pattern is flagged as "worth a closer look" or "recommend follow-up," the next step is a conversation with a qualified professional — not a number, and not a conclusion.*

---

## 11. Badges *(locked as-is, styled here)*

- Personal-best only, per world. No leaderboards, no comparison to other children, no ranking of any kind — none of that was asked for and it would cut against the calm, non-competitive tone the rest of the product is built on.
- One simple icon variant per world, modest celebratory tone in the copy ("New personal best!" not "You crushed it!").

---

## 12. Judge-/Press-Facing Copy Checklist *(proposed — run every external doc through this)*

Before any pitch deck, one-pager, demo script, or press copy ships, check it against:

- [ ] No "AI-powered," "AI-driven," or "adaptive AI" anywhere
- [ ] "The REAL Brain" does not appear
- [ ] No confidence meter, risk score, or any number standing in for a result
- [ ] No implication of gesture control outside Rune Realm
- [ ] No implication of live gaze-tracking or oculomotor claims
- [ ] Vision Valley is described as supplementary, not DALI-aligned
- [ ] Any specialist report shown or shared has "Sample Data — Demonstration Only" visible on it
- [ ] Disclaimer and consent language match what's actually on-screen in the product, not an aspirational version

---

## 13. Language Rollout Note *(locked order, from spec)*

English ships fully stable first. Hindi and Marathi follow only once English is stable — don't split brand or translation effort across three languages at once. When those translations happen, the three-tier language (*typical range / worth a closer look / recommend follow-up*) must translate as three flat, equal-weight phrases in the target language too — not as a paraphrase that could read as a number or a scale in translation.
