# Siddarth Boggarapu — Issue 001 / Operator-Verse

A Spider-Verse–styled comic book dossier portfolio. Ten snap-scroll pages, multi-panel comic spreads, halftone-treated panel art, chromatic aberration, sound-effect typography. Real interactive widgets inside the panels.

**Live:** [siddarthb07.github.io/siddarthb](https://siddarthb07.github.io/siddarthb/)

---

## What's inside

10 comic pages, each a multi-panel spread:

| # | Page | What's in it |
|---|------|--------------|
| 01 | **COVER** | Issue title, chromatic name, starburst, paper-quote panel |
| 02 | **ORIGIN** | Method / stakes / craft narration panels + 3 principles |
| 03 | **CASE FILE #01 — ANIMA** | LLM internals · probe readout · valence / arousal / unc |
| 04 | **CASE FILE #02 — CORVEX** | Multi-host campaign correlator · sealed eval · gated contain |
| 05 | **CASE FILE #03 — GEOQUANT** | Walk-forward quant signals · animated equity curve · Sharpe / MDD / Hit / YR |
| 06 | **CASE FILE #04 — DRIFT** | Calibrated risk · animated CVD dial · 4 biomarker bars |
| 07 | **CASE FILE #05 — ORQIS** | Agent ops · incident explain · reviewable patch / PR |
| 07 | **THE LAB** | Two physics solvers — propeller (RPM → thrust) and drone VRS (descent → vortex regime) |
| 08 | **TIMELINE** | Career as a 4-cell comic strip with ONGOING pulse |
| 09 | **THE OPERATOR** | Quote · bio · daily stack · stats |
| 10 | **SIGNAL** | End-of-issue card with magnetic CTA + links |

Every project image is treated three ways so it BLENDS as comic panel art: high-contrast color filter, SVG duotone, and halftone dot overlay with multiply blend.

---

## Design system

- **Palette** — midnight indigo / ink black / paper cream / magenta / cyan / yellow / red
- **Typography** — Bowlby One (page titles), Bangers (sound effects), Bricolage Grotesque (headlines), Inter (body), Special Elite (typewriter narration), JetBrains Mono (labels)
- **Treatments** — halftone dot background on every page, chromatic aberration on every major headline, bold ink panel borders with offset shadows, slight tilts (-1° / +1°) on panels, comic-book SFX in the corners
- **Cursor** — SVG crosshair with chromatic aberration; rotates 45° + scales on hover
- **Imagery** — only project-relevant images; no decorative cosmic backgrounds

---

## Tech stack

- HTML5
- CSS3 (custom design tokens, SVG `feColorMatrix` filters for duotone)
- Vanilla JavaScript (ES module) — no build tool, no framework

That's it. Open `index.html` and it runs.

---

## Project structure

```
.
├── index.html              page content + 10 comic spreads
├── README.md
└── src/
    ├── styles/
    │   └── main.css        full design system
    ├── js/
    │   └── main.js         page observer, reveals, all widgets, cursor
    └── images/             contextual project art (halftone-treated at runtime)
```

---

## Run locally

It's a static site. The simplest path:

```bash
python -m http.server 5500
```

Then open `http://127.0.0.1:5500/`.

(Opening `index.html` directly via `file://` will fail because `main.js` is loaded as an ES module — modules need an HTTP origin.)

---

## Deployment

Hosted via GitHub Pages from the `main` branch root. Pushing to `main` updates the live site at `https://siddarthb07.github.io/siddarthb/`.

---

## Navigation

- Scroll, or click any dot on the right rail
- `1`–`9` jump to a page, `0` jumps to SIGNAL
- `↑` / `↓` previous / next page

---

## Contact

- Email — [siddarthb078@gmail.com](mailto:siddarthb078@gmail.com)
- LinkedIn — [siddarth-boggarapu](https://www.linkedin.com/in/siddarth-boggarapu-12411339b/)
- GitHub — [Siddarthb07](https://github.com/Siddarthb07)

---

© 2026 · Siddarth Boggarapu · Built from scratch in HTML / CSS / JS
