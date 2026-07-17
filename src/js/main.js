/* =========================================================
   SB / v7 — INTO THE OPERATOR-VERSE
   Comic book pages with snap-scroll, reveals, interactive widgets.
   ========================================================= */

import {
  SITE, fetchAllRepos, categorizeRepos, inflightCount,
  padStat, renderRepoIndex
} from './github.js';
import { initMascot } from './mascot.js?v=sb01-15';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none)').matches;
const $  = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => Array.from(r.querySelectorAll(q));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

const PAGES = [
  { num: '01', name: 'COVER' },
  { num: '02', name: 'ORIGIN' },
  { num: '03', name: 'THE LAB' },
  { num: '04', name: 'ANIMA' },
  { num: '05', name: 'VIDHISETHU' },
  { num: '06', name: 'GEOQUANT' },
  { num: '07', name: 'HEALTH AI' },
  { num: '08', name: 'TIMELINE' },
  { num: '09', name: 'OPERATOR' },
  { num: '10', name: 'SIGNAL' }
];

/* =========================================================
   1. CURSOR
   ========================================================= */
(() => {
  if (isTouch) return;
  const cur = $('#cursor');
  const lab = $('#curLabel');
  let x = innerWidth/2, y = innerHeight/2, tx = x, ty = y, seeded = false;

  addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    if (!seeded){ x = tx; y = ty; seeded = true; }
  }, { passive: true });

  document.addEventListener('mouseleave', () => cur.style.opacity = '0');
  document.addEventListener('mouseenter', () => cur.style.opacity = '1');

  function tick(){
    x = lerp(x, tx, 0.42);
    y = lerp(y, ty, 0.42);
    cur.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    requestAnimationFrame(tick);
  }
  tick();

  const wire = () => {
    $$('a, button, [data-cur]').forEach(el => {
      if (el.dataset.curBound) return;
      el.dataset.curBound = '1';
      el.addEventListener('mouseenter', () => {
        cur.classList.add('hover');
        const t = el.getAttribute('data-cur');
        if (t){ lab.textContent = t; cur.classList.add('show-label'); }
      });
      el.addEventListener('mouseleave', () => cur.classList.remove('hover','show-label'));
    });
  };
  wire();
  new MutationObserver(wire).observe(document.body, { childList: true, subtree: true });
})();

/* =========================================================
   2. BOOT LOADER
   ========================================================= */
async function boot(){
  const log = $('#bootLog');
  const bar = $('.boot-bar i');
  const rdy = $('#bootRdy');
  const lines = [
    '> printing cover...........<span class="ok">ok</span>',
    '> mixing inks · CMYK......<span class="ok">ok</span>',
    '> stamping halftone.......<span class="ok">ok</span>',
    '> binding 10 pages........<span class="ok">ok</span>',
    '> syncing GitHub index....<span class="ok">live</span>',
    '> mounting widgets........<span class="ok">04</span>',
    '<span class="ok">[ ready ]</span> Issue 001 — scroll to read'
  ];
  for (let i = 0; i < lines.length; i++){
    log.innerHTML += (i ? '\n' : '') + lines[i];
    bar.style.right = (100 - (i + 1) / lines.length * 100).toFixed(0) + '%';
    await new Promise(r => setTimeout(r, 120 + Math.random() * 60));
  }
  if (rdy) rdy.textContent = 'PRINTED';
  await new Promise(r => setTimeout(r, 320));
  $('#loader').classList.add('gone');
  setTimeout(() => $('#loader')?.remove(), 1100);
  $('#cover')?.classList.add('in');
}

/* =========================================================
   4. PAGE OBSERVER
   ========================================================= */
function startPages(){
  const pages = $$('.page');
  const ticks = $$('.r-tick');
  const hudNum = $('#hudNum');
  const hudName = $('#hudName');

  let lastIdx = -1;
  const setActive = idx => {
    const meta = PAGES[idx];
    if (!meta || idx === lastIdx) return;
    ticks.forEach((t, i) => t.classList.toggle('on', i === idx));
    if (hudNum) hudNum.textContent = meta.num;
    if (hudName) hudName.textContent = meta.name;
    document.documentElement.dataset.page = String(idx);
    lastIdx = idx;
  };

  const revealIO = new IntersectionObserver(entries => {
    for (const e of entries){
      if (e.isIntersecting){
        e.target.classList.add('in');
        if (e.target.id === 'case-2'){
          const audit = $('.audit', e.target);
          if (audit) audit.classList.add('run');
        }
      }
    }
  }, { threshold: 0.25 });
  pages.forEach(p => revealIO.observe(p));

  const activeIO = new IntersectionObserver(entries => {
    let best = null;
    for (const e of entries){
      if (e.isIntersecting){
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
    }
    if (best){
      const idx = pages.indexOf(best.target);
      if (idx >= 0) setActive(idx);
    }
  }, { threshold: [0.4, 0.6, 0.8] });
  pages.forEach(p => activeIO.observe(p));

  $$('a[data-jump]').forEach(a => {
    a.addEventListener('click', e => {
      const j = +a.getAttribute('data-jump');
      const target = pages[j];
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  setActive(0);
}

/* =========================================================
   5. GITHUB — stats + project index
   ========================================================= */
async function loadGitHubData(){
  const reposEl = $('#statRepos');
  const inflightEl = $('#statInflight');
  const sourceEl = $('#statSource');
  const indexHost = $('#repoIndex');
  const coverMeta = $('#coverMeta');

  if (reposEl) reposEl.classList.add('loading');
  if (inflightEl) inflightEl.classList.add('loading');

  try {
    const all = await fetchAllRepos();
    const { visible, buckets } = categorizeRepos(all);
    const inflight = inflightCount(buckets);

    if (reposEl) reposEl.textContent = padStat(visible.length);
    if (inflightEl) inflightEl.textContent = padStat(inflight);
    if (sourceEl) sourceEl.textContent = 'GITHUB · LIVE';
    if (coverMeta){
      coverMeta.textContent =
        `10 PAGES · ${padStat(SITE.caseFiles)} CASE FILES · ${padStat(SITE.liveSims)} LIVE SIMS · ${padStat(visible.length)} REPOS`;
    }

    renderRepoIndex(buckets, indexHost);
  } catch {
    if (reposEl) reposEl.textContent = '—';
    if (inflightEl) inflightEl.textContent = '—';
    if (sourceEl) sourceEl.textContent = 'GITHUB · OFFLINE';
    if (indexHost) indexHost.innerHTML = '<p class="ri-fallback">Index offline — <a href="https://github.com/Siddarthb07" target="_blank" rel="noopener noreferrer">view on GitHub ↗</a></p>';
  } finally {
    reposEl?.classList.remove('loading');
    inflightEl?.classList.remove('loading');
  }
}

/* =========================================================
   6. EQUITY (illustrative)
   ========================================================= */
function drawEquity(){
  const line = $('#eqLine');
  const fill = $('#eqFill');
  if (!line) return;
  const N = 80, W = 320, H = 90;
  let v = 50; const pts = [];
  let seed = 7;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < N; i++){
    v += (rand() - 0.4) * 4 + 0.6;
    pts.push([i * (W / (N - 1)), H - clamp(v, 5, 85)]);
  }
  const d  = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const df = `M0,${H} ` + pts.map(p => 'L' + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + ` L${W},${H} Z`;
  line.setAttribute('d', d);
  fill.setAttribute('d', df);
}

/* =========================================================
   7. RISK DIAL
   ========================================================= */
function setRisk(v=0.31){
  const arc = $('#riskArc'); const num = $('#riskNum');
  if (!arc) return;
  const len = Math.PI * 50;
  arc.setAttribute('d', 'M10,60 A50,50 0 0,1 110,60');
  arc.style.strokeDasharray = len;
  arc.style.strokeDashoffset = len;
  arc.getBoundingClientRect();
  arc.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(.16,1,.3,1)';
  arc.style.strokeDashoffset = (len * (1 - v)).toFixed(1);
  if (num) num.textContent = v.toFixed(2);
}

/* =========================================================
   8. ANIMA PROBE READOUT
   ========================================================= */
function startProbe(){
  const host = $('#probeBars');
  if (!host) return;
  host.innerHTML = '';
  const N = 36;
  const bars = [];
  for (let i = 0; i < N; i++){
    const s = document.createElement('span');
    host.appendChild(s); bars.push(s);
  }
  const valBar = $('#valBar');
  const aroBar = $('#aroBar');
  const uncBar = $('#uncBar');
  const valNum = $('#valNum');
  const aroNum = $('#aroNum');
  const uncNum = $('#uncNum');
  const token = $('#probeToken');
  const layer = $('#probeLayer');
  const state = $('#probeState');
  const states = ['STREAM','HOOK','PROBE','EMIT'];
  let si = 0, tok = 47, t0 = performance.now();
  function tick(now){
    const t = (now - t0) / 1000;
    const val = (Math.sin(t * 1.4) * 0.35 + Math.sin(t * 0.7) * 0.15);
    const aro = (Math.sin(t * 2.1 + 1.2) * 0.5 + 0.5);
    const unc = clamp(0.18 + Math.sin(t * 0.9 + 2.4) * 0.22 + Math.sin(t * 3.1) * 0.08, 0.05, 0.92);
    for (let i = 0; i < N; i++){
      const w = (Math.sin(i * 0.55 + t * 5 + val * 2) + Math.sin(i * 0.2 + t * 2.8)) * 0.5 + 0.5;
      const decay = 1 - Math.abs((i - N/2) / (N/2));
      bars[i].style.height = (8 + w * decay * (60 + aro * 40)) + '%';
    }
    if (valBar) valBar.style.setProperty('--w', ((val + 1) / 2 * 100).toFixed(1) + '%');
    if (aroBar) aroBar.style.setProperty('--w', (aro * 100).toFixed(1) + '%');
    if (uncBar) uncBar.style.setProperty('--w', (unc * 100).toFixed(1) + '%');
    if (valNum) valNum.textContent = (val >= 0 ? '+' : '') + val.toFixed(2);
    if (aroNum) aroNum.textContent = aro.toFixed(2);
    if (uncNum) uncNum.textContent = unc.toFixed(2);
    if (Math.floor(t * 8) % 18 === 0){
      tok = (tok + 1) % 999;
      if (token) token.textContent = String(tok).padStart(3, '0');
      if (layer) layer.textContent = '−' + (4 + (tok % 5));
    }
    if (Math.floor(t * 10) % 24 === 0){
      si = (si + 1) % states.length;
      if (state) state.textContent = states[si];
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* =========================================================
   9. SIM — RPM + VRS
   ========================================================= */
function initRPM(){
  const range = $('#rpmRange');
  if (!range) return;
  const curve = $('#thrustCurve');
  const cursor = $('#rpmCursor');
  const point = $('#rpmPoint');
  const W = 320, H = 120;
  const xs = [];
  for (let r = 1500; r <= 8500; r += 100){
    const rn = (r - 1500) / (8500 - 1500);
    const T  = 6 + 30 * Math.pow(rn, 1.6) - 10 * Math.pow(rn, 3);
    xs.push([r, T]);
  }
  const d = xs.map((p, i) => {
    const x = ((p[0] - 1500) / 7000) * W;
    const y = H - clamp(p[1] / 32 * (H - 20), 6, H - 6);
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ');
  curve.setAttribute('d', d);

  function set(rpm){
    const rn = (rpm - 1500) / 7000;
    const T  = 6 + 30 * Math.pow(rn, 1.6) - 10 * Math.pow(rn, 3);
    const eta = clamp(0.22 + Math.pow(rn, 0.6) * 0.7 - Math.pow(rn, 2.4) * 0.4, 0.10, 0.92);
    const P  = T / eta * 4.6;
    const x  = rn * W;
    const y  = H - clamp(T / 32 * (H - 20), 6, H - 6);
    cursor.setAttribute('x1', x); cursor.setAttribute('x2', x);
    point.setAttribute('cx', x);  point.setAttribute('cy', y);
    $('#rpmVal').textContent = String(Math.round(rpm));
    $('#thrustVal').textContent = T.toFixed(1);
    $('#effVal').textContent = eta.toFixed(2);
    $('#pwrVal').textContent = String(Math.round(P));
  }
  range.addEventListener('input', () => set(+range.value));
  set(+range.value);
}

function initVRS(){
  const range = $('#vdRange');
  if (!range) return;
  const field = $('#vrsField');
  const line  = $('#vdLine');
  const point = $('#vrsPoint');
  const regime= $('#vrsRegime');
  const rec   = $('#vrsRec');
  const risk  = $('#vrsRisk');
  const W = 320, H = 120;
  const pts = [];
  for (let i = 0; i <= 60; i++){
    const x = i / 60 * W;
    const v = i / 60 * 12;
    const inst = Math.exp(-Math.pow((v - 6.5) / 1.6, 2)) * 70;
    const y = H - 8 - inst;
    pts.push([x, y]);
  }
  const d = `M0,${H-8} ` + pts.map(p => 'L' + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + ` L${W},${H-8} Z`;
  field.setAttribute('d', d);

  function set(v){
    const x = (v / 12) * W;
    const inst = Math.exp(-Math.pow((v - 6.5) / 1.6, 2));
    const y = H - 8 - inst * 70;
    line.setAttribute('x1', x); line.setAttribute('x2', x);
    point.setAttribute('cx', x); point.setAttribute('cy', y);
    point.setAttribute('fill', inst > 0.5 ? 'var(--red)' : inst > 0.25 ? 'var(--yellow)' : 'var(--cyan)');
    $('#vdVal').textContent = v.toFixed(1);
    if (inst > 0.5){
      regime.textContent = 'VORTEX RING'; regime.style.color = 'var(--red)';
      rec.textContent = '↗ +6 m/s lat'; risk.textContent = 'HIGH'; risk.style.color = 'var(--red)';
    } else if (inst > 0.25){
      regime.textContent = 'TRANSITION'; regime.style.color = 'var(--magenta)';
      rec.textContent = '→ reduce descent'; risk.textContent = 'MOD'; risk.style.color = 'var(--magenta)';
    } else {
      regime.textContent = 'STABLE'; regime.style.color = 'var(--cyan)';
      rec.textContent = '✓ within envelope'; risk.textContent = 'LOW'; risk.style.color = 'var(--cyan)';
    }
  }
  range.addEventListener('input', () => set(+range.value));
  set(+range.value);
}

/* =========================================================
   10. MAGNET CTA
   ========================================================= */
function startMagnets(){
  if (isTouch || reduceMotion) return;
  $$('[data-magnet]').forEach(el => {
    function move(e){
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      if (Math.hypot(dx, dy) > 220){ el.style.transform = ''; return; }
      el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.25}px)`;
    }
    addEventListener('mousemove', move, { passive: true });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
}

/* =========================================================
   11. KEYS
   ========================================================= */
function startKeys(){
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    const pages = $$('.page');
    if (e.key >= '1' && e.key <= '9'){
      const i = +e.key - 1;
      pages[i]?.scrollIntoView({ behavior: 'smooth' });
    }
    if (e.key === '0') pages[9]?.scrollIntoView({ behavior: 'smooth' });
    if (e.key === 'ArrowDown' || e.key === 'PageDown'){
      const cur = +(document.documentElement.dataset.page || 0);
      pages[Math.min(pages.length-1, cur+1)]?.scrollIntoView({ behavior: 'smooth' });
      e.preventDefault();
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp'){
      const cur = +(document.documentElement.dataset.page || 0);
      pages[Math.max(0, cur-1)]?.scrollIntoView({ behavior: 'smooth' });
      e.preventDefault();
    }
  });
}

/* =========================================================
   BOOT
   ========================================================= */
function ready(fn){
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn, { once: true });
}

ready(() => {
  drawEquity();
  setRisk(0.31);
  startProbe();
  initRPM();
  initVRS();
  startMagnets();
  startKeys();
  startPages();
  initMascot();
  loadGitHubData();

  boot();
});
