# Operator-Verse Site — Upgrade Plan

> **Status:** May 2026 · Issue 001 is live at [siddarthb07.github.io/siddarthb](https://siddarthb07.github.io/siddarthb/)  
> **Rule:** Do not replace project images until Phase 2. Current neon wireframe panels are good enough for now.

---

## What to leave alone

These are features, not bugs:

- **Spider-Verse comic theme** — intentional, built from scratch, matches verify / simulate / refuse voice
- **Snap-scroll 10-page structure** — memorable for admissions; don't flatten into a generic template
- **Interactive widgets** (audit table, equity curve, risk dial, probe readout, BEMT/VRS sliders) — signal builder, not decorator
- **Current project images** — busy AI art and minimal AI art both missed the mark; keep existing panels until a deliberate art pass (Phase 2)

---

## Audience lens (interviewers & VCs)

A reader should leave with **four legible spikes**, not ten projects:

| Spike | What they need to see | Site slot today |
|---|---|---|
| Scientific ML / CFD | Self-driven simulators + (future) NeuralVortex | Lab + Case #04 Anima adjacent |
| Production ML | Lexprobe stack, Vegam line (NDA-safe) | Case #01, Timeline Q1 2026 |
| Founder / automation | Athera, real client numbers | Timeline Panel 4 — **gap: no public metrics** |
| Hardware / maker | Drones, rovers — **invisible on site** | Not on site yet |

Every future upgrade should make one spike **more verifiable in 30 seconds**.

---

## Phase 0 — Now (no image changes)

**Goal:** Honest copy + one live stat. ~2 hrs.

| Task | Why |
|---|---|
| Keep current `src/images/*.png` | Avoid churn until Phase 2 art direction is locked |
| Stats block: case files · live repos · internships · live sims | Already shipped — reads as dossier, not vanity GitHub metrics |
| Add `sessionStorage` cache for repo count (1 hr TTL) | Cuts GitHub API hits for repeat visitors |
| Cover line: update when NeuralVortex ships | `"4 CASE FILES"` → `"5 CASE FILES"` etc. |
| Timeline Panel 4: add Athera case-study link once page exists | Founder spike currently has no numbers on site |

**Do not do in Phase 0:** regenerate images, add Issue #002 pages, embed full Lexprobe demo.

---

## Phase 1 — Content & metrics (2–4 weeks)

**Goal:** Every case file links to proof. Interviewer can click through without asking you to explain.

### 1.1 Case file evidence → real numbers

Replace illustrative widgets with **labeled demo vs live** where needed:

| Case | Current evidence | Upgrade |
|---|---|---|
| Lexprobe | Fake audit rows | Keep as *demo*; add footnote + link to repo README / demo video |
| GeoQuant | Random equity curve | Pull from saved backtest CSV in repo, or label `"12M paper sim · illustrative"` |
| Health AI | Static 0.31 CVD dial | Cite ACC/AHA + FINDRISC in evidence header; link to `AUDIT_AND_DESIGN.md` |
| Anima | Animated probe | Link to benchmark table in repo (`distilgpt2` Pearson r, guard AUROC) |

### 1.2 Operator stats v2

When hero projects ship, swap static counters for **spike-aware** stats:

```
04 → 05 case files     (after NeuralVortex page)
21 → live public repos  (keep)
03 internships          (keep)
06+ mo founder          (replace "live sims" once Athera case studies have dates)
```

Optional fifth stat row (footer micro-line, not grid): `"Spider + BIRD exec acc · X%"` after text2sql-rag ships — NDA-safe, portfolio-verifiable.

### 1.3 One-line proof under each repo link

Add under every `github.com/...` link:

- Lexprobe — `FastAPI · Postgres · Qdrant · citation audit`
- GeoQuant — `walk-forward · Alpaca paper · cost in optimizer`
- Health-AI — `ACC/AHA · FINDRISC · safety gates`
- Anima — `HF hooks · valence/arousal/unc · MIT`
- Lab repos — one physics formula each (Helmholtz, BEMT)

---

## Phase 2 — Project imagery (deliberate art pass)

**Goal:** One clear story per panel. Professional for VC; Spider-Verse as *accent*, not noise.

### Why AI generation failed

- **Complex batch:** too busy for 320px panels + duotone filter doubles chaos
- **Minimal batch:** too flat; lost energy that makes the site distinctive

### Recommended approach (don't use raw AI output)

1. **Art direction doc** — one sentence story + one focal object per project (see table below)
2. **Human or Figma pass** — export SVG or flat PNG at 800×800; let CSS filters + halftone do the comic work
3. **Optional:** commission one consistent set (5–7 panels) from an illustrator who knows Into the Spider-Verse *texture* not *clutter*

### Story brief per image (for Phase 2)

| File | One-sentence story | Single focal object |
|---|---|---|
| `proj-lexprobe.png` | Verified beat hallucinated | Scales; green check vs red strike |
| `proj-geoquant.png` | Cost the trade, then take it | One equity line + small cost wedge |
| `proj-health.png` | Clinical models, not invented scores | Risk dial + 3 lab bars |
| `proj-anima.png` | Measure inside the model | 3 layer blocks + 3 readout traces |
| `proj-propeller.png` | RPM → thrust | One blade + thrust arrow |
| `proj-vortex.png` | Descent envelope danger | Drone + one red vortex ring |
| `frame-07-emblem.png` | Verify · simulate · refuse | SB hex mark, minimal |

**Style rules:** cream/dark base, max 3 accent colors, halftone in ≤15% of frame, readable at 240px height after CSS filter.

### Alternative (cheaper, very professional)

Drop photographic/3D panels entirely for **inline SVG story icons** in each case title panel — zero image maintenance, fully on-brand, scales on mobile. Spider-Verse halftone stays on page background; icons stay clean.

---

## Phase 3 — New pages when projects ship

**Trigger:** project reaches README + benchmark + demo.

| Project | Site change |
|---|---|
| **NeuralVortex** | Case File #05 (Page 11) OR replace Lab slot + bump page count; pin on GitHub |
| **text2sql-rag** | Case File or Timeline bullet with Spider exec acc; clean-room phrasing only |
| **quad-build-log** | Lab Panel 3 or Operator bio photo strip — makes CFD spike unfakeable |
| **Athera case studies** | Timeline Panel 4 numbers + external link to athera.so/cases |

Update on each ship:

- Cover foot: `N CASE FILES · M LIVE EXPERIMENTS`
- Rail nav + `PAGES` array in `main.js`
- Operator stat `case files`
- Meta description

---

## Phase 4 — VC / interviewer mode (optional toggle)

**Goal:** Same site, faster signal for non-admissions readers.

- **`?mode=brief`** or subtle HUD toggle: hides SFX, reduces motion, opens with Operator + Timeline + Case titles only
- **Print/PDF stylesheet** — one-page dossier export (name, spikes, links, stats)
- **Structured data** (`JSON-LD` Person + SoftwareSourceCode per case) for search / link previews

Low priority until first VC or internship outreach wave.

---

## Phase 5 — Performance & hygiene

| Item | Action |
|---|---|
| GitHub API rate limit | Cache repo count in `sessionStorage`; fallback to last known value |
| Image weight | When Phase 2 lands: WebP + PNG fallback, `<picture>` per panel |
| Preload | Only preload above-fold cover + first case image |
| Archive dead repos | GitHub profile cleanup (AI-BRAIN etc.) — repo count stays honest |
| LinkedIn / site parity | Sports, MUN, 50+ hrs service on LinkedIn; site Operator bio already has them |

---

## Priority order (if time-constrained)

1. **Athera case-study page + Timeline numbers** — founder spike is invisible without this  
2. **NeuralVortex case file** — caps scientific ML spike  
3. **Phase 2 art** (SVG icons OR one commissioned set) — not more AI batches  
4. **text2sql-rag** public benchmark line — closes Vegam verifiability gap  
5. **quad-build-log** — hardware spike  
6. **VC brief mode** — nice-to-have  

---

## Decision log

| Date | Decision |
|---|---|
| May 2026 | Keep existing project images; reject complex + minimal AI Spider-Verse batches |
| May 2026 | Stats: case files · live repos · internships · in flight |
| May 2026 | Anima replaces AI-BRAIN as Case #04 |
| May 2026 | **Shipped:** GitHub live index on Operator page; proof lines; demo labels; brief mode; print CSS; JSON-LD; sessionStorage API cache |
| May 2026 | Athera: no client names on site; `project_thrive` + Elevyx hidden from GitHub index |
| — | Images: revisit only after story brief table is approved |

---

## Shipped in this pass (May 2026)

- [x] Phase 0 — repo cache, dossier stats, cover meta live repo count
- [x] Phase 1 — proof lines, demo/illustrative evidence labels, Anima + Health benchmark links
- [x] Phase 4 — `?mode=brief`, HUD BRIEF toggle, print stylesheet, JSON-LD
- [x] Phase 5 — sessionStorage GitHub cache, reduced image preloads
- [x] GitHub project index — categorized live list (featured / lab / in flight / founder / archived)
- [ ] Phase 2 — SVG story icons or commissioned art (deferred)
- [ ] Phase 3 — NeuralVortex case page when hero ships; text2sql-rag benchmark line

---

## Next action (pick one)

- [ ] Approve Phase 2 story brief table → commission or build SVG set  
- [ ] Ship NeuralVortex → add Case #05 + bump counters  
- [ ] Ship text2sql-rag → add exec-acc micro-line under Operator stats  
- [ ] Wait for quad-build-log → Lab Panel 3  

*End of plan. Update this file when a phase ships or facts change.*
