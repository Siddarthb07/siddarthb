/* =========================================================
   SB / v7 — INTO THE OPERATOR-VERSE
   Comic book pages with snap-scroll, reveals, interactive widgets.
   ========================================================= */

import {
  SITE, fetchAllRepos, categorizeRepos, inflightCount,
  padStat, renderRepoIndex
} from './github.js?v=sb01-32';
import { initMascot } from './mascot.js?v=sb01-20';

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
  { num: '05', name: 'CORVEX' },
  { num: '06', name: 'GEOQUANT' },
  { num: '07', name: 'DRIFT' },
  { num: '08', name: 'ORQIS' },
  { num: '09', name: 'TIMELINE' },
  { num: '10', name: 'OPERATOR' },
  { num: '11', name: 'SIGNAL' }
];

/* =========================================================
   1. CURSOR
   ========================================================= */
(() => {
  if (isTouch) return;
  document.documentElement.classList.add('js-cursor');
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
    $$('a, button, [data-cur], input, textarea, select, summary, label[for]').forEach(el => {
      if (el.dataset.curBound) return;
      el.dataset.curBound = '1';
      el.addEventListener('mouseenter', () => {
        // Snap + hide custom cursor on controls so clicks hit what you aim at.
        x = tx; y = ty;
        cur.style.opacity = '0';
        cur.classList.add('hover');
        const t = el.getAttribute('data-cur');
        if (t){ lab.textContent = t; cur.classList.add('show-label'); }
      });
      el.addEventListener('mouseleave', () => {
        cur.style.opacity = '1';
        cur.classList.remove('hover','show-label');
      });
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
    '> binding 11 pages........<span class="ok">ok</span>',
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
    const id = pages[idx]?.id;
    if (id && location.hash.slice(1) !== id){
      history.replaceState(null, '', '#' + id);
    }
  };

  const revealIO = new IntersectionObserver(entries => {
    for (const e of entries){
      if (e.isIntersecting){
        e.target.classList.add('in');
        const audit = $('.audit', e.target);
        if (audit) audit.classList.add('run');
      }
    }
  }, { threshold: 0.06 });
  /* tall stacked pages on mobile never hit a high visibility ratio,
     so a low threshold is required for panels to reveal at all */
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
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  /* a page is "active" when it crosses the middle band of the viewport —
     ratio thresholds fail on mobile where a page spans several screens */
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

  const hash = location.hash.slice(1);
  const hashPage = hash ? document.getElementById(hash) : null;
  if (hashPage && pages.includes(hashPage)){
    hashPage.scrollIntoView({ behavior: 'auto', block: 'start' });
    setActive(pages.indexOf(hashPage));
  } else {
    setActive(0);
  }
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
        `${padStat(SITE.caseFiles)} CASE FILES · ${padStat(SITE.liveSims)} LIVE SIMS · ${padStat(visible.length)} OPEN REPOS`;
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
   6. EQUITY (measured GeoQuant walk-forward sparkline)
   ========================================================= */
async function drawEquity(){
  const line = $('#eqLine');
  const fill = $('#eqFill');
  if (!line) return;
  const W = 320, H = 90;
  let pts = null;
  try {
    const res = await fetch(`src/data/geoquant-equity.json?v=1`);
    if (res.ok) {
      const data = await res.json();
      const vals = Array.isArray(data?.points) ? data.points.map(Number).filter(Number.isFinite) : [];
      if (vals.length >= 2) {
        const lo = Math.min(...vals), hi = Math.max(...vals);
        const span = Math.max(hi - lo, 1);
        pts = vals.map((v, i) => {
          const x = i * (W / (vals.length - 1));
          const y = H - 8 - ((v - lo) / span) * (H - 16);
          return [x, clamp(y, 4, H - 4)];
        });
      }
    }
  } catch { /* fall through to placeholder */ }

  if (!pts) {
    // Fallback placeholder if the measured JSON fails to load
    let v = 50; const seedPts = [];
    let seed = 7;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < 80; i++){
      v += (rand() - 0.4) * 4 + 0.6;
      seedPts.push([i * (W / 79), H - clamp(v, 5, 85)]);
    }
    pts = seedPts;
  }

  const d  = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const df = `M0,${H} ` + pts.map(p => 'L' + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') + ` L${W},${H} Z`;
  line.setAttribute('d', d);
  if (fill) fill.setAttribute('d', df);
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
   8b. CORVEX ATTACK THEATRE — exact GIF sequence as widget
   ========================================================= */
function startCorvex(){
  const root = $('#corvexWidget');
  const stream = $('#cxStream');
  if (!root || !stream) return;

  const phaseEl = $('#cxPhase');
  const captionEl = $('#cxCaption');
  const campEl = $('#cxCamp');
  const playBtn = $('#cxPlay');
  const replayBtn = $('#cxReplay');

  // Each step only carries NEW events — stream appends them one-by-one as the demo advances.
  const STEPS = [
    {
      phase: 'ATTACK IN PROGRESS',
      caption: 'Compromised account <b>alice</b> is authenticating from <b>10.1.0.5</b> across the lab.',
      captionCls: '',
      hosts: { a: '', b: '', c: '' },
      links: { a: 0, b: 0, c: 0 },
      mesh: 0, shields: {}, camp: 0,
      events: []
    },
    {
      phase: 'ATTACK IN PROGRESS',
      caption: 'User <b>alice</b> logs into <b>host-a</b> from attacker <b>10.1.0.5</b>.',
      captionCls: '',
      hosts: { a: 'hit', b: '', c: '' },
      links: { a: 1, b: 0, c: 0 },
      mesh: 0, shields: {}, camp: 0,
      events: [
        { ts: '12:00:00', host: 'HOST-A', type: 'auth', text: 'User <em>alice</em> logs into <em>host-a</em> from attacker <em>10.1.0.5</em>', meta: 'auth success · stolen/abused account' }
      ]
    },
    {
      phase: 'ATTACK IN PROGRESS',
      caption: 'Same user <b>alice</b> hops to <b>host-b</b> (fileserver) 15s later.',
      captionCls: '',
      hosts: { a: 'hit', b: 'hit', c: '' },
      links: { a: 1, b: 1, c: 0 },
      mesh: 0, shields: {}, camp: 0,
      events: [
        { ts: '12:00:15', host: 'HOST-B', type: 'auth', text: 'Same user <em>alice</em> hops to <em>host-b</em> (fileserver) 15s later', meta: 'lateral movement · same src 10.1.0.5' }
      ]
    },
    {
      phase: 'ATTACK IN PROGRESS',
      caption: '<b>host-c</b> falls — attacker now spans workstation, fileserver, jump box.',
      captionCls: '',
      hosts: { a: 'hit', b: 'hit', c: 'hit' },
      links: { a: 1, b: 1, c: 1 },
      mesh: 0, shields: {}, camp: 0,
      events: [
        { ts: '12:00:30', host: 'HOST-C', type: 'auth', text: '<em>alice</em> reaches <em>host-c</em> (jump box) — 3 hosts owned', meta: 'campaign complete across lab' }
      ]
    },
    {
      phase: 'DETECT',
      caption: 'Corvex links the 3 auths -> campaign <b>camp-lateral-alice</b>.',
      captionCls: 'detect',
      hosts: { a: 'hit', b: 'hit', c: 'hit' },
      links: { a: 1, b: 1, c: 1 },
      mesh: 1, shields: {}, camp: 1,
      events: [
        { ts: 'now', host: 'DETECT', type: 'detect', text: 'Corvex links the 3 auths -> campaign <em>camp-lateral-alice</em>', meta: 'lateral_auth · score 1.0 · hosts a/b/c' }
      ]
    },
    {
      phase: 'INTERRUPT (DRY-RUN)',
      caption: 'Defense action proposed for <b>host-a</b> / <b>host-b</b> / <b>host-c</b>. Logged only — live quarantine still locked.',
      captionCls: 'defend',
      hosts: { a: 'isolated', b: 'isolated', c: 'isolated' },
      links: { a: 1, b: 1, c: 1 },
      mesh: 1, shields: { a: 1, b: 1, c: 1 }, camp: 1,
      events: [
        { ts: 'dry-run', host: 'HOST-A', type: 'defend', text: 'Propose IsolateHost on <em>host-a</em> (dry-run logged)', meta: 'IsolateHost · no live mutation' },
        { ts: 'dry-run', host: 'HOST-B', type: 'defend', text: 'Propose IsolateHost on <em>host-b</em> (dry-run logged)', meta: 'IsolateHost · no live mutation' },
        { ts: 'dry-run', host: 'HOST-C', type: 'defend', text: 'Propose IsolateHost on <em>host-c</em> (dry-run logged)', meta: 'IsolateHost · no live mutation' }
      ]
    },
    {
      phase: 'CONTAINED (SIM)',
      caption: 'Attack path shown. Detection real. Interrupt simulated. Live isolate stays off until Stage D executor exists.',
      captionCls: 'defend',
      hosts: { a: 'isolated', b: 'isolated', c: 'isolated' },
      links: { a: 1, b: 1, c: 1 },
      mesh: 1, shields: { a: 1, b: 1, c: 1 }, camp: 1,
      events: []
    }
  ];

  let step = 0;
  let timer = null;
  let eventQueue = [];
  let eventTimer = null;
  const linkOn = { A: false, B: false, C: false };
  const hostState = { A: '', B: '', C: '' };

  function setHost(id, state){
    const el = document.getElementById('cxHost' + id);
    if (!el) return;
    const prev = hostState[id];
    hostState[id] = state || '';
    el.setAttribute('class', 'cx-host' + (state ? (' ' + state) : ''));
    if (state && state !== prev){
      el.classList.remove('cx-pulse');
      void el.getBoundingClientRect();
      el.classList.add('cx-pulse');
    }
  }

  function hideLink(el){
    if (!el) return;
    const len = el.getTotalLength ? el.getTotalLength() : 300;
    el.classList.remove('on', 'draw');
    el.style.transition = 'none';
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    void el.getBoundingClientRect();
    el.style.transition = '';
  }

  function setLink(id, on){
    const el = document.getElementById('cxLink' + id);
    if (!el) return;
    const was = linkOn[id];
    linkOn[id] = !!on;
    if (on && !was){
      const len = el.getTotalLength ? el.getTotalLength() : 300;
      el.classList.add('on', 'draw');
      el.style.transition = 'none';
      el.style.strokeDasharray = String(len);
      el.style.strokeDashoffset = String(len);
      void el.getBoundingClientRect();
      el.style.transition = '';
      requestAnimationFrame(() => { el.style.strokeDashoffset = '0'; });
    } else if (!on){
      hideLink(el);
    }
  }

  function setShield(id, on){
    const el = document.getElementById('cxShield' + id);
    if (el) el.classList.toggle('on', !!on);
  }

  function phaseClass(phase){
    if (phase.includes('ATTACK')) return 'ATTACK';
    if (phase.includes('DETECT')) return 'DETECT';
    if (phase.includes('INTERRUPT')) return 'INTERRUPT';
    if (phase.includes('CONTAINED')) return 'CONTAINED';
    if (phase.includes('DONE')) return 'DONE';
    return '';
  }

  function pushEvent(ev){
    const div = document.createElement('div');
    div.className = 'cx-evt ' + (ev.type || '');
    div.innerHTML = '<div class="t"><span>' + ev.ts + '</span><span>' + ev.host + '</span></div>'
      + '<div class="body">' + ev.text + '</div>'
      + '<div class="meta">' + (ev.meta || '') + '</div>';
    stream.prepend(div);
    stream.scrollTop = 0;
    requestAnimationFrame(() => div.classList.add('on'));
  }

  function flushEvents(){
    if (eventTimer){ clearTimeout(eventTimer); eventTimer = null; }
    while (eventQueue.length) pushEvent(eventQueue.shift());
  }

  function queueEvents(list){
    if (!list || !list.length) return;
    eventQueue.push(...list);
    const drain = () => {
      if (!eventQueue.length){ eventTimer = null; return; }
      pushEvent(eventQueue.shift());
      eventTimer = setTimeout(drain, reduceMotion ? 280 : 900);
    };
    if (!eventTimer) drain();
  }

  function renderGraph(s){
    if (phaseEl){
      phaseEl.textContent = s.phase;
      const cls = phaseClass(s.phase);
      phaseEl.className = 'cx-phase' + (cls ? (' ' + cls) : '');
    }
    if (captionEl){
      captionEl.innerHTML = s.caption;
      captionEl.className = 'cx-caption' + (s.captionCls ? (' ' + s.captionCls) : '');
    }
    setHost('A', s.hosts.a); setHost('B', s.hosts.b); setHost('C', s.hosts.c);
    setLink('A', s.links.a); setLink('B', s.links.b); setLink('C', s.links.c);
    ['AB','BC','AC'].forEach(k => {
      const el = document.getElementById('cxMesh' + k);
      if (el) el.classList.toggle('on', !!s.mesh);
    });
    setShield('A', s.shields.a); setShield('B', s.shields.b); setShield('C', s.shields.c);
    if (campEl){
      campEl.textContent = s.camp ? 'camp-lateral-alice' : '';
      campEl.style.opacity = s.camp ? '1' : '0';
    }
  }

  function resetVisual(){
    if (eventTimer){ clearTimeout(eventTimer); eventTimer = null; }
    eventQueue = [];
    stream.innerHTML = '';
    linkOn.A = linkOn.B = linkOn.C = false;
    hostState.A = hostState.B = hostState.C = '';
    ['A','B','C'].forEach(id => {
      hideLink(document.getElementById('cxLink' + id));
      const host = document.getElementById('cxHost' + id);
      if (host) host.setAttribute('class', 'cx-host');
      setShield(id, false);
    });
    ['AB','BC','AC'].forEach(k => {
      document.getElementById('cxMesh' + k)?.classList.remove('on');
    });
    if (campEl){ campEl.textContent = ''; campEl.style.opacity = '0'; }
  }

  // Hold long enough that the link draw is readable before the next hop.
  // Reduced-motion still steps (so Play/Replay never look dead) — just faster.
  const STEP_MS = reduceMotion
    ? [700, 900, 900, 900, 1000, 1200, 700]
    : [2200, 3400, 3400, 3400, 3800, 5200, 2800];

  function stop(){
    if (timer){ clearTimeout(timer); timer = null; }
    if (eventTimer){ clearTimeout(eventTimer); eventTimer = null; }
  }

  function applyStep(i){
    const s = STEPS[i];
    renderGraph(s);
    queueEvents(s.events);
  }

  function scheduleNext(){
    if (step >= STEPS.length - 1){ timer = null; return; }
    const wait = STEP_MS[step] || 3400;
    timer = setTimeout(() => {
      step += 1;
      applyStep(step);
      scheduleNext();
    }, wait);
  }

  function play(){
    stop();
    resetVisual();
    step = 0;
    applyStep(0);
    scheduleNext();
  }

  function armPlay(){
    playBtn?.classList.add('on');
    replayBtn?.classList.remove('on');
    play();
  }

  // pointerdown beats click when a lagged custom cursor / touch hybrid is in play
  root.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('#cxPlay, #cxReplay');
    if (!btn || !root.contains(btn)) return;
    e.preventDefault();
    e.stopPropagation();
    if (btn.id === 'cxPlay') armPlay();
    else {
      replayBtn?.classList.add('on');
      playBtn?.classList.add('on');
      play();
    }
  });

  // Idle until the user presses Play — autoplay made Replay look dead once the sequence finished.
  ['A','B','C'].forEach(id => hideLink(document.getElementById('cxLink' + id)));
  renderGraph(STEPS[0]);
  if (phaseEl){ phaseEl.textContent = 'IDLE'; phaseEl.className = 'cx-phase'; }
  if (captionEl){
    captionEl.innerHTML = 'Press <b>Play attack</b> to run the theatre.';
    captionEl.className = 'cx-caption';
  }
  playBtn?.classList.remove('on');
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
    if (e.key === '0') pages[10]?.scrollIntoView({ behavior: 'smooth' });
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
  const run = (label, fn) => {
    try { fn(); }
    catch (err) { console.error(label + ' failed', err); }
  };
  run('equity', drawEquity);
  run('risk', () => setRisk(0.31));
  run('probe', startProbe);
  run('corvex', startCorvex);
  run('rpm', initRPM);
  run('vrs', initVRS);
  run('magnets', startMagnets);
  run('keys', startKeys);
  run('pages', startPages);
  run('mascot', initMascot);
  run('github', loadGitHubData);
  boot();
});
