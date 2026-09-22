# MACHINA — Site Style Spec (locked)

## Rule: strict palette, zero other colors
Only the mark's inks, plus opacity variants of them. No cyan, no gradients to new hues.

| Token      | Hex     | Role |
|------------|---------|------|
| `--void`   | `#0A0C18` | Page background (dark surface the light badge lives on) |
| `--porcelain` | `#F4F9FB` | Primary text, borders at low alpha, the light-surface mark |
| `--indigo` | `#2E2C64` | Accent fills: buttons, cards, hover states, section tint |

Derived values are ONLY alpha tints of the three above:
`rgba(244,249,251,.65)` secondary text · `rgba(244,249,251,.25)` hairline borders ·
`rgba(46,44,100,.5)` card fills · `#1B1A3A` (indigo @ ~45% over void) elevated cards.
That last one is a *mix* of the two allowed hues, still within the accent family.

## Type (both free, CDN)
- Display / headings / wordmark: **Cinzel** (Roman-inscription caps — goddess/seal energy)
- Body / UI: **Inter**
- Scale: 48/28/18/14, line-height 1.5 body, letter-spacing .02em caps labels

## Motifs (from the mark itself)
- Seal disc = hero object + section divider (thin ring, 4 anchor dots)
- Orbit dots = list bullets
- 1px hairlines `rgba(porcelain,.15)` only — no heavy rules
- Single column, max-width 68ch, generous vertical rhythm (96px section gaps)
- No images except the mark and the demo video. No stock, no emoji, no color icons.

## Layout (one-pager)
1. **Hero** — void bg, light seal 220px centered, "MACHINA" in Cinzel, one-liner:
   "Autonomous web agents for the work you don't want to do."
   + one indigo button ("See the proof")
2. **Proof** — SIH2026 browser-agent case study: what it did, 240 tests, demo video block
   (dark 16:9 placeholder, ring border, "agent demo — drops here")
3. **What I build** — 3 orbit-bullet rows: logs in · navigates · completes (each one sentence)
4. **How it works** — 3 steps, numbered in Cinzel, hairline dividers
5. **Contact** — `hello@getmachina.com` + X link placeholder, indigo card, done.

Footer: seal 16px + "Machina · getmachina.com".

## Hard constraints
- Dark only (single theme). No light mode for now.
- Everything static: index.html + style.css (+ optional 20 lines of JS for reveal-on-scroll).
- No framework, no build step, no paid fonts, no external images.
- Responsive: single column stays single; seal scales 160–220px; type clamps.

## Tools (chosen, $0)
| Task | Tool | Why |
|------|------|-----|
| Author | hand-written HTML/CSS (me) | total control, zero deps, $0 |
| Fonts | Google Fonts CDN (Cinzel, Inter) | free, one link, no license cost |
| Assets | the mark SVGs already in site/assets/ | no new raster work |
| Video | `<video>` block, file drops in when ready | placeholder ring for now |
| Verify | headless Chrome screenshots @ 375/768/1440 widths + vision check | already our pipeline |
| Host | static: Netlify or Vercel free tier (or GCP after $300 credit) | $0 now |
| Domain | getmachina.com (~₹600/yr) when buying | — |
