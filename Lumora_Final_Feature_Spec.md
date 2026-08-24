# Lumora World — Final Feature Spec (Locked)

*This supersedes both source docs. One system, not two parallel builds.*

## Corrected one-liner
~~"AI-powered learning adventures... adaptive AI learns from their interactions"~~ →
**"Lumora turns a DALI-aligned learning screen into a five-world adventure — one teacher, one tablet, no specialist required. Every world tracks real performance signals and adapts with simple, transparent rules, not a black box."**
Drop "AI-driven" and "the REAL Brain" from any judge-facing copy — the adaptive engine is rule-based (streaks/accuracy thresholds), and calling it AI invites exactly the scrutiny the biomarker language did earlier. Say what it actually is; it's still impressive.

## The merge: your two docs were building the same thing twice
The original 5-task screening battery and the teammate's 5 worlds are the same system in two skins. Consolidated:

| World | Replaces/= screening task | DALI construct | Interaction (locked) |
|---|---|---|---|
| 🌲 Sound Forest | Sound Match + Sound Blending | Communication / phonological | Tap-to-select + voice with teacher-fallback. No gesture. |
| 🏰 Story Castle | Word Reading | Reading | Tap for word-find/comprehension, voice for read-aloud with fallback. No gesture. |
| ✍️ Rune Realm | Letter Tracing | Writing / motor | **Camera finger-tracing as the flagship feature** — touchscreen tracing stays as the default/reliable mode, camera mode is an enhanced option on top, not a replacement. This is your one CV feature. |
| 🧠 Memory Mountains | *(new)* | Memory — this is an official DALI category, genuinely on-construct | Tap-based (remember/reorder/match). No gesture needed, touch works fine. |
| 👁️ Vision Valley | *(new)* | Not a DALI category — visual attention/tracking is dyslexia-adjacent but supplementary, not core. Say so honestly, don't claim DALI-alignment for this one. | Tap-based (find-the-difference, pattern match). No gesture. |

Net result: five worlds, one camera feature, four reliable touch/voice worlds. Nothing here requires hand-gesture detection outside Rune Realm.

## Metrics tracked (feed the rule-based engine + specialist dashboard)
- Accuracy %, response latency, attempt count — every world
- Speech accuracy, response time — Sound Forest, Story Castle (where voice is used)
- Path smoothness, deviation, completion time — Rune Realm only
- Streaks — cross-world, drives leveling

## Adaptive difficulty (rule-based, say so explicitly)
Streak of 3+ correct → next difficulty tier. Accuracy drop below threshold → step back one tier + more scaffolding. No model, no training data — a lookup table. This is a feature, not a limitation; say it plainly in the pitch so nobody has to ask.

## Cross-cutting features (build once, apply everywhere)
- Buddy guide character — reuse the existing cat mascot, don't design a second character
- Calm Mode — reduced animation/sound/larger controls, global toggle
- Session-limit nudges — simple timer-based prompt, no logic needed beyond a clock

## Parent Dashboard (locked)
Plain-language weekly summary, before/after replay clips, three-tier language only (typical range / worth a closer look / recommend follow-up) — **no confidence meter, no numeric score.**

## Specialist Dashboard (locked)
Mistake heatmap + printable report. **"Sample Data — Demonstration Only" must be printed on the report itself**, not just shown on the screen that generates it — the report is the artifact most likely to leave the app and be mistaken for real.

## Badges
Personal-best badges per world, kept as-is — low effort, genuine motivation value, no overclaiming risk.

## Language rollout (locked order)
English fully working first. Hindi and Marathi added only once English is stable — don't split effort across three languages simultaneously with two days left.

## Cut for this build — roadmap only, do not imply working
- Hand-gesture control outside Rune Realm
- Live gaze-tracking / oculomotor claims
- Autism/IASQ module (not in the teammate's latest doc either — treat that as already decided)
- Any numeric "confidence" or "risk score" — three-tier language only, everywhere, no exceptions

## Non-negotiables carried forward
- Consent screen before any child profile is created
- Full disclaimer text on every results screen, product-side, not just docs
- No real child-identifying data leaves the device
