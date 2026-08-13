/* =========================================================
   SB-01 · dossier guide mascot
   Watches <html data-page> (set by the page observer) and
   narrates each page. Every page has its own face + gesture.
   ========================================================= */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Per-page script.
   state  : the page's pose: unique face + unique gesture, no repeats
            across pages (wave point inspect refuse think care excited
            scan cheer bow)
   pos    : where SB-01 travels to on this page:
            x/y in viewport units, side (which side of the screen it
            sits on; bubble + pointing arm flip), scale
   lines  : [{ t: text }] advanced by click or reading-time timer */
const SCRIPT = [
  { // 00 · COVER · wink face, waving arm
    state: 'wave',
    pos: { x: '96vw', y: '68vh', side: 'right', scale: 1.2, range: [14, 10] },
    lines: [
      { t: 'Hey, SB-01. I keep this dossier.' },
      { t: 'Eleven pages, five case files, and two live simulators on page 03. Scroll, I\u2019ll walk you through.' }
    ]
  },
  { // 01 · ORIGIN · round eyes, pointing at the panels
    state: 'point',
    pos: { x: '96vw', y: '10vh', side: 'right', scale: .72, range: [10, 5] },
    lines: [
      { t: 'The software and simulation beats here all have public repos behind them. None of this is retroactive storytelling.' },
      { t: 'The simulators in panel 03? You can run them yourself on the very next page. From here on I\u2019ll stay quiet. Click me anytime for the page intel.' }
    ]
  },
  { // 02 · THE LAB · wide eyes, both arms up
    state: 'excited',
    pos: { x: '95vw', y: '6vh', side: 'right', scale: .8, range: [12, 6] },
    lines: [
      { t: 'These sliders drive demo curves. The real BEMT and vortex-ring solvers are in the linked repos.' },
      { t: 'Try dragging the descent rate into the unstable zone. The BEMT code tuned props for the same drones on page 02.' }
    ]
  },
  { // 03 · ANIMA · waveform face, magnifier raised
    state: 'inspect',
    pos: { x: '2vw', y: '60vh', side: 'left', scale: .95, range: [16, 22] },
    lines: [
      { t: 'The HaluEval and TruthfulQA runs are guard smoke tests on fixtures. The repo documents how to re-run them.' },
      { t: 'The widget is a demo. The real numbers (council 94.0) are in the benchmark report, linked on the EVIDENCE header.' }
    ]
  },
  { // 04 · CORVEX · X eyes, arms crossed (gated contain)
    state: 'refuse',
    pos: { x: '95vw', y: '58vh', side: 'right', scale: .95, range: [16, 22] },
    lines: [
      { t: 'Correlate first. Live containment stays locked: dry-run isolate only until you arm it on purpose.' },
      { t: 'The sealed held-out numbers are in the README. Synthetic packs; honest about what they do not prove.' }
    ]
  },
  { // 05 · GEOQUANT · thinking dots, hand on chin
    state: 'think',
    pos: { x: '2vw', y: '55vh', side: 'left', scale: .95, range: [16, 20] },
    lines: [
      { t: 'It paper-trades live through Alpaca. The feedback loop retrains on its own fills.' }
    ]
  },
  { // 06 · DRIFT · calm face, open palms
    state: 'care',
    pos: { x: '95vw', y: '55vh', side: 'right', scale: .95, range: [16, 20] },
    lines: [
      { t: 'Third health tracker he built. The only one that survived. The other two are archived.' },
      { t: 'The failure modes are documented too. There\u2019s a whole ethics-and-failures file in the repo.' }
    ]
  },
  { // 07 · ORQIS · focus face, presenting the VERIFIED stamp (patch)
    state: 'patch',
    pos: { x: '2vw', y: '58vh', side: 'left', scale: .95, range: [14, 18] },
    lines: [
      { t: 'Case five closes the pattern: same detect-before-commit instinct, now aimed at agent ops.' },
      { t: 'He cofounded Orqis: runaway loops get explained, patched, and held for human review. Never a silent push to main.' }
    ]
  },
  { // 08 · TIMELINE · scanning pupils, hand shading brow
    state: 'scan',
    pos: { x: '50vw', y: '4vh', side: 'right', scale: .72, range: [8, 4] },
    lines: [
      { t: 'The NDA panel has a public twin: a clean-room text-to-SQL rebuild on his GitHub.' }
    ]
  },
  { // 09 · OPERATOR · happy arcs, cheering arms
    state: 'cheer',
    pos: { x: '97vw', y: '76vh', side: 'right', scale: .8, range: [10, 8] },
    lines: [
      { t: 'The All-India CBSE football 2nd is the one credential on this page with zero asterisks. Look for the VERIFIED stamp.' }
    ]
  },
  { // 10 · SIGNAL · eyes closed, bowing out with the VERIFIED stamp
    state: 'bow',
    pos: { x: '98vw', y: '72vh', side: 'right', scale: 1.05, range: [12, 10] },
    lines: [
      { t: 'File closed. Now you know the operator.' },
      { t: 'If it resonated, send the signal.' }
    ]
  }
];

const TYPE_MS = 16;
/* auto-advance: base pause + reading time per character, after typing ends */
const advanceDelay = str => Math.max(9000, 5000 + str.length * 60);

/* Full narration by default on the first NARRATE_PAGES pages;
   after that SB-01 docks in the bottom-right corner with a
   "click me" pill and only talks (and travels) when asked. */
const NARRATE_PAGES = 2;
const DOCK = { x: '97vw', y: '78vh', side: 'right', scale: .88, range: [5, 4] };

export function initMascot(){
  const root   = document.getElementById('sb01');
  const bubble = document.getElementById('sb01Bubble');
  const textEl = document.getElementById('sb01Text');
  const moreEl = document.getElementById('sb01More');
  const close  = document.getElementById('sb01Close');
  const hint   = document.getElementById('sb01Hint');
  const bot    = document.getElementById('sb01Bot');
  if (!root || !bubble) return;

  let page = -1;
  let line = 0;
  let typeTimer = null;
  let advanceTimer = null;
  let quiet = false;       // current mode
  let userMuted = false;   // user hit ×. stay quiet everywhere until re-opened
  let userOpened = false;  // user clicked the bot. stay open on every page until ×

  function setState(s){ root.dataset.state = s; }

  function stopTimers(){
    clearInterval(typeTimer); typeTimer = null;
    clearTimeout(advanceTimer); advanceTimer = null;
  }

  function typeLine(str, done){
    clearInterval(typeTimer);
    if (reduceMotion){
      textEl.textContent = str;
      done?.();
      return;
    }
    let i = 0;
    textEl.innerHTML = '<span class="caret">▍</span>';
    typeTimer = setInterval(() => {
      i++;
      textEl.innerHTML = str.slice(0, i).replace(/</g, '&lt;') + (i < str.length ? '<span class="caret">▍</span>' : '');
      if (i >= str.length){
        clearInterval(typeTimer); typeTimer = null;
        done?.();
      }
    }, TYPE_MS);
  }

  function showLine(){
    const entry = SCRIPT[page];
    if (!entry) return;
    const l = entry.lines[line];
    if (!l) return;
    setState(entry.state);
    bubble.classList.add('show');
    moreEl.hidden = true;
    typeLine(l.t, () => {
      const hasMore = line < entry.lines.length - 1;
      moreEl.hidden = !hasMore;
      if (hasMore){
        clearTimeout(advanceTimer);
        advanceTimer = setTimeout(next, advanceDelay(l.t));
      }
    });
  }

  function next(){
    const entry = SCRIPT[page];
    if (!entry || line >= entry.lines.length - 1) return;
    line++;
    showLine();
  }

  function collapse(){
    quiet = true;
    stopTimers();
    bubble.classList.remove('show');
    moreEl.hidden = true;
    hint.hidden = false;
    travel(DOCK);
  }

  function openGuide(){
    quiet = false;
    hint.hidden = true;
    line = 0;
    travel(SCRIPT[page]?.pos);
    showLine();
  }

  /* organic drift. slow layered sines inside the page's range box,
     so SB-01 wanders around its anchor instead of hovering on a point */
  const drift = document.getElementById('sb01Drift');
  let rangeX = 24, rangeY = 24;
  if (drift && !reduceMotion){
    const t0 = performance.now();
    (function wander(now){
      const t = (now - t0) / 1000;
      const wx = (Math.sin(t * .33) * .62 + Math.sin(t * .71 + 1.7) * .38) * rangeX;
      const wy = (Math.sin(t * .27 + .9) * .58 + Math.sin(t * .59 + 3.1) * .42) * rangeY;
      const rot = Math.sin(t * .21 + 2.2) * 2.2;
      drift.style.transform = `translate(${wx.toFixed(1)}px, ${wy.toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
      requestAnimationFrame(wander);
    })(t0);
  }

  function travel(pos){
    if (!pos) return;
    root.style.setProperty('--sb-x', pos.x);
    root.style.setProperty('--sb-y', pos.y);
    root.style.setProperty('--sb-scale', String(pos.scale));
    root.dataset.side = pos.side;
    if (pos.range){ rangeX = pos.range[0]; rangeY = pos.range[1]; }
  }

  function setPage(idx){
    if (idx === page) return;
    page = idx;
    line = 0;
    stopTimers();
    setState(SCRIPT[idx]?.state || 'wave');
    if (!userMuted && (idx < NARRATE_PAGES || userOpened)){
      openGuide();
    } else {
      collapse();
    }
  }

  bubble.addEventListener('click', e => {
    if (e.target === close) return;
    clearTimeout(advanceTimer);
    next();
  });

  close.addEventListener('click', () => {
    userMuted = true;
    userOpened = false;
    collapse();
  });

  [bot, hint].forEach(el => el.addEventListener('click', () => {
    if (quiet){
      userMuted = false;
      userOpened = true;
      openGuide();
    } else {
      userOpened = true; // sticky-open once the visitor engages
      next();
    }
  }));

  // Follow the page observer via <html data-page="N">
  new MutationObserver(() => {
    const idx = +(document.documentElement.dataset.page || 0);
    if (!Number.isNaN(idx)) setPage(idx);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-page'] });

  setPage(+(document.documentElement.dataset.page || 0));
}
