# siddarthb

Personal portfolio website for Siddarth Boggarapu, built as a static single-page experience and published via GitHub Pages.

Live URL:

- `https://siddarthb07.github.io/siddarthb/`

## What Is Implemented

- Structured sections for systems, simulation work, projects, experience, and about
- Full-screen animated particle background on canvas
- Scroll-reveal motion with `IntersectionObserver`
- Mobile nav hamburger and active-section highlighting
- Animated data-viz style components (pipelines, charts, audit panel, feature bars)
- Responsive layout with dark design system

## Tech Stack

- HTML5
- CSS3 (custom design tokens and animation keyframes)
- Vanilla JavaScript

No build tool and no framework required.

## Project Structure

- `index.html` - page content and semantic sections
- `styles.css` - full design system and responsive styling
- `script.js` - animation, observers, nav behavior, and canvas particles

## Local Run

Because this is static, you can open `index.html` directly. For best behavior, run a local server:

```bash
python -m http.server 5500
```

Then open `http://127.0.0.1:5500`.

## Deployment

Designed for GitHub Pages static deployment. Pushing the repo updates the site path at `/siddarthb/`.

## Notes

The page content references projects across AI, quant, legal tech, and simulation. To keep this as a trusted portfolio source, update project blurbs when underlying repos change.

