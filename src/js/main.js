/* =========================================================
   SB / v7 · INTO THE OPERATOR-VERSE
   Comic book pages with snap-scroll, reveals, interactive widgets.
   ========================================================= */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(hover: none)').matches;
const $  = (q, r=document) => r.querySelector(q);
const $$ = (q, r=document) => Array.from(r.querySelectorAll(q));
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
/** Allow only a tiny author-controlled tag set in theatre captions/events. */
const safeRich = (s) => escapeHtml(s)
  .replace(/&lt;(\/?)(b|em|strong)&gt;/gi, '<$1$2>');

const PAGES = [
  { num: '01', name: 'COVER' },
  { num: '02', name: 'ORIGIN' },
  { num: '03', name: 'THE LAB' },
  { num: '04', name: 'ANIMA' },
  { num: '05', name: 'BUMBLEBEE' },
  { num: '06', name: 'CORVEX' },
  { num: '07', name: 'GODFATHER' },
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
function loadAccentFonts(){
  // Fonts ship via <link rel="stylesheet" href="src/fonts/fonts.css"> in index.html.
}

function boot(){
  // boot-early.js usually already dismissed the loader; this is a safe fallback.
  loadAccentFonts();
  $('#cover')?.classList.add('in');
  const loader = $('#loader');
  if (!loader || loader.classList.contains('gone')) return;
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
    '<span class="ok">[ ready ]</span> Issue 001 · scroll to read'
  ];
  if (log) log.innerHTML = lines.join('\n');
  if (bar) bar.style.right = '0%';
  if (rdy) rdy.textContent = 'PRINTED';
  loader.classList.add('gone');
  setTimeout(() => loader.remove(), reduceMotion ? 0 : 280);
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
  /* a page is "active" when it crosses the middle band of the viewport - ratio thresholds fail on mobile where a page spans several screens */
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
   5. GITHUB. stats + project index
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
    const {
      SITE, fetchAllRepos, categorizeRepos, inflightCount,
      publicRepoCount, padStat, renderRepoIndex
    } = await import('./github.js?v=sb01-40');
    const all = await fetchAllRepos();
    const { buckets } = categorizeRepos(all);
    const inflight = inflightCount(buckets);
    const publicCount = publicRepoCount(all);

    if (reposEl) reposEl.textContent = padStat(publicCount);
    if (inflightEl) inflightEl.textContent = padStat(inflight);
    if (sourceEl) sourceEl.textContent = 'GITHUB · LIVE';
    if (coverMeta){
      coverMeta.textContent =
        `${padStat(SITE.caseFiles)} CASE FILES (${SITE.privateCaseFiles} PRIVATE) · ${padStat(SITE.liveSims)} LIVE SIMS · ${padStat(publicCount)} OPEN REPOS`;
    }

    renderRepoIndex(buckets, indexHost);
  } catch {
    if (reposEl) reposEl.textContent = '-';
    if (inflightEl) inflightEl.textContent = '-';
    if (sourceEl) sourceEl.textContent = 'GITHUB · OFFLINE';
    if (indexHost) indexHost.innerHTML = '<p class="ri-fallback">Index offline. <a href="https://github.com/Siddarthb07" target="_blank" rel="noopener noreferrer">view on GitHub ↗</a></p>';
  } finally {
    reposEl?.classList.remove('loading');
    inflightEl?.classList.remove('loading');
  }
}

/* =========================================================
   6. BUMBLEBEE CEC CHAT DASH (from bumblebee dash_app)
   ========================================================= */
function startBumble(){
  const root = $('#bumbleWidget');
  const log = $('#beeLog');
  const chips = $('#beeChips');
  if (!root || !log || !chips) return;

  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const add = (role, html, cls='') => {
    const d = document.createElement('div');
    d.className = 'bee-msg ' + role + (cls ? ' ' + cls : '');
    d.innerHTML = html;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  };

  const REPLIES = {
    'What is Holi?': {
      status: 'answer',
      answer: 'Holi is a Hindu spring festival of colors, celebrated with colored powders and water.',
      cite: 'Holi is a popular ancient Hindu festival, also known as the Festival of Colors.'
    },
    'Who won the 2022 FIFA World Cup?': {
      status: 'refuse', reason: 'coverage_fail',
      hint: 'Outside the frozen pack — CoverageGate refuses.'
    },
    'What is the GPU throughput rating of McKinsey?': {
      status: 'refuse', reason: 'entity_gap',
      hint: 'No sealed passage binds McKinsey to a GPU throughput rating.'
    },
    'What is 17×19?': {
      status: 'answer', answer: '323', cite: null, skill: 'math'
    },
    'explain SoftCorrelator': {
      status: 'answer',
      answer: 'SoftCorrelator puts sparsemax mass on evidence cells. High mass + coverage → cite. Thin mass → refuse.',
      cite: 'sparsemax mass binding across Correlated Evidence Cells'
    }
  };

  let busy = false;
  const ask = (text) => {
    if (busy) return;
    busy = true;
    add('user', esc(text));
    const data = REPLIES[text] || {
      status: 'refuse', reason: 'coverage_fail', hint: 'Not in this demo pack — try a chip below.'
    };
    setTimeout(() => {
      if (data.status === 'answer'){
        const tag = data.skill ? `SKILL · ${data.skill}` : 'CITE';
        let html = `<div class="lab">${tag}</div><div>${esc(data.answer)}</div>`;
        if (data.cite) html += `<div class="cite">${esc(data.cite)}</div>`;
        add('bot', html, 'answer');
      } else {
        add('bot',
          `<div class="lab">REFUSE · ${esc(data.reason)}</div>`
          + (data.hint ? `<div>${esc(data.hint)}</div>` : ''),
          'refuse');
      }
      busy = false;
    }, reduceMotion ? 40 : 380);
  };

  const examples = [
    { label: 'cite', text: 'What is Holi?' },
    { label: 'refuse', text: 'Who won the 2022 FIFA World Cup?' },
    { label: 'gap', text: 'What is the GPU throughput rating of McKinsey?' },
    { label: 'math', text: 'What is 17×19?' },
    { label: 'arch', text: 'explain SoftCorrelator' }
  ];
  chips.innerHTML = '';
  examples.forEach(ex => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bee-chip';
    b.textContent = ex.label;
    b.title = ex.text;
    b.setAttribute('aria-label', ex.text);
    b.addEventListener('click', () => ask(ex.text));
    chips.appendChild(b);
  });

  add('bot', '<div class="lab">DEMO</div><div>Tap a chip — cite when covered, refuse when thin.</div>', 'idle');
}

/* =========================================================
   7. GODFATHER SESSION-SIM DASH (from FastAPI /rank · /simulate)
   ========================================================= */
function startGodfather(){
  const root = $('#godfatherWidget');
  if (!root) return;
  const phase = $('#gfPhase');
  const ticket = $('#gfTicket');
  const ledger = $('#gfLedger');
  const tbody = $('#gfPicks tbody');
  const scout = $('#gfScout b');
  const risk = $('#gfRisk b');
  const session = $('#gfSession b');
  const rankBtn = $('#gfRank');
  const simBtn = $('#gfSim');

  const PICKS = [
    { ticker: 'RELIANCE', wr: 0.72, score: 2.41, agent: 'Scout' },
    { ticker: 'TCS', wr: 0.68, score: 1.92, agent: 'Scout' },
    { ticker: 'INFY', wr: 0.61, score: 1.14, agent: 'Scout' }
  ];

  const paintPicks = (active) => {
    if (!tbody) return;
    tbody.innerHTML = PICKS.map((p, i) =>
      `<tr class="${active && i < 2 ? 'on' : ''}"><td>${i+1}</td><td>${p.ticker}</td><td>${p.wr.toFixed(2)}</td><td>${p.score.toFixed(2)}</td><td>${p.agent}</td></tr>`
    ).join('');
  };

  const setAgents = (s, r, se, on) => {
    if (scout) scout.innerHTML = s;
    if (risk) risk.innerHTML = r;
    if (session) session.innerHTML = se;
    root.querySelectorAll('.gf-agent').forEach(el => el.classList.toggle('on', !!on));
  };

  const runRank = () => {
    if (phase) phase.textContent = 'RANK';
    setAgents('bulk BUY ranked', 'watching', 'idle', false);
    $('#gfScout')?.classList.add('on');
    paintPicks(false);
    if (ticket) ticket.innerHTML = 'POST /rank · prior-session bulk/block · no lookahead';
    if (ledger) ledger.innerHTML = '';
  };

  const runSim = () => {
    if (phase) phase.textContent = 'SIM';
    paintPicks(true);
    setAgents('candidates locked', 'size cut · 0.85', 'open-range entry', true);
    if (ticket) ticket.innerHTML = '<b class="ok">PAPER FILL</b> · RELIANCE + TCS · SL + soft trail · fail-closed';
    if (ledger) ledger.innerHTML =
      '<div><span>equity</span><b>₹24.8k</b></div>'
      + '<div><span>paper Δ</span><b>+148%</b></div>'
      + '<div><span>mode</span><b>sim</b></div>';
    setTimeout(() => {
      if (phase) phase.textContent = 'BLOCK';
      setAgents('cooldown', '<b class="bad">BLOCKED</b>', 'sit cash', false);
      $('#gfRisk')?.classList.add('on');
      if (ticket) ticket.innerHTML = '<b class="bad">NO RAISE</b> · Risk veto · paper only · not live P&amp;L';
    }, reduceMotion ? 80 : 1100);
  };

  rankBtn?.addEventListener('click', runRank);
  simBtn?.addEventListener('click', () => { runRank(); setTimeout(runSim, reduceMotion ? 60 : 500); });
  runRank();
}

/* =========================================================
   8. ANIMA READOUT DASH (circumplex + stream from dashboard)
   ========================================================= */
function startProbe(){
  const root = $('#animaWidget');
  if (!root) return;
  const valBar = $('#valBar');
  const aroBar = $('#aroBar');
  const uncBar = $('#uncBar');
  const valNum = $('#valNum');
  const aroNum = $('#aroNum');
  const uncNum = $('#uncNum');
  const token = $('#probeToken');
  const layer = $('#probeLayer');
  const state = $('#probeState');
  const tokensEl = $('#anTokens');
  const dot = $('#anDot');
  const dots = $('#anDots');
  const streamBtn = $('#anStream');
  const stopBtn = $('#anStop');

  const WORDS = ['Hello', 'there', '—', 'valence', 'drifts', 'calm', 'then', 'spikes', 'on', 'uncertainty', 'tokens', 'stream'];
  let running = false, raf = 0, tok = 0, t0 = 0;
  const trail = [];

  const setBars = (val, aro, unc) => {
    if (valBar) valBar.style.setProperty('--w', ((val + 1) / 2 * 100).toFixed(1) + '%');
    if (aroBar) aroBar.style.setProperty('--w', (aro * 100).toFixed(1) + '%');
    if (uncBar) uncBar.style.setProperty('--w', (unc * 100).toFixed(1) + '%');
    if (valNum) valNum.textContent = (val >= 0 ? '+' : '') + val.toFixed(2);
    if (aroNum) aroNum.textContent = aro.toFixed(2);
    if (uncNum) uncNum.textContent = unc.toFixed(2);
    if (dot){
      dot.setAttribute('cx', String(110 + val * 88));
      dot.setAttribute('cy', String(90 - (aro - 0.5) * 120));
    }
  };

  const pushToken = (w, on) => {
    if (!tokensEl) return;
    const s = document.createElement('span');
    s.textContent = w;
    if (on) s.classList.add('on');
    tokensEl.appendChild(s);
    while (tokensEl.children.length > 14) tokensEl.removeChild(tokensEl.firstChild);
  };

  const tick = (now) => {
    if (!running) return;
    const t = (now - t0) / 1000;
    const val = Math.sin(t * 1.35) * 0.42 + Math.sin(t * 0.55) * 0.12;
    const aro = clamp(0.5 + Math.sin(t * 1.9 + 0.8) * 0.35, 0.05, 0.95);
    const unc = clamp(0.2 + Math.sin(t * 0.95 + 2) * 0.25, 0.05, 0.9);
    setBars(val, aro, unc);
    if (Math.floor(t * 6) !== Math.floor((t - 0.016) * 6)){
      const w = WORDS[tok % WORDS.length];
      pushToken(w, true);
      if (token) token.textContent = String(tok % 999).padStart(3, '0');
      if (layer) layer.textContent = '−' + (3 + (tok % 4));
      if (state) state.textContent = ['STREAM','HOOK','PROBE','EMIT'][tok % 4];
      if (dots){
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', String(110 + val * 88));
        c.setAttribute('cy', String(90 - (aro - 0.5) * 120));
        c.setAttribute('r', '2.5');
        c.setAttribute('fill', 'rgba(56,196,224,.45)');
        dots.appendChild(c);
        trail.push(c);
        if (trail.length > 40){ dots.removeChild(trail.shift()); }
      }
      tok++;
    }
    raf = requestAnimationFrame(tick);
  };

  const start = () => {
    if (running) return;
    running = true;
    t0 = performance.now();
    if (tokensEl) tokensEl.innerHTML = '';
    if (dots) dots.innerHTML = '';
    trail.length = 0;
    if (state) state.textContent = 'STREAM';
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    if (state) state.textContent = 'IDLE';
  };

  streamBtn?.addEventListener('click', start);
  stopBtn?.addEventListener('click', stop);
  setBars(0.12, 0.48, 0.31);
  start();
}

/* =========================================================
   8c. ORQIS INCIDENT CONSOLE
   ========================================================= */
function startOrqis(){
  const root = $('#orqisWidget');
  const log = $('#oqLog');
  const phase = $('#oqPhase');
  const btn = $('#oqRun');
  if (!root || !log) return;

  const steps = [
    { s: 'detect', phase: 'DETECT', lvl: 'ok', t: '0.0s', line: 'Runaway tool loop · resolve_refund ×14' },
    { s: 'explain', phase: 'EXPLAIN', lvl: 'ok', t: '0.4s', line: 'MCP RCA · missing backoff on refund tool' },
    { s: 'patch', phase: 'PATCH', lvl: 'ok', t: '1.1s', line: 'libcst bound retry + escalate · unified diff ready' },
    { s: 'review', phase: 'REVIEW', lvl: 'ok', t: '1.4s', line: 'PR opened · human approval required' },
    { s: 'refuse', phase: 'REFUSE', lvl: 'bad', t: '1.5s', line: 'Default branch push refused · never silent-push' }
  ];
  let timer = null;

  const run = () => {
    if (timer){ clearTimeout(timer); timer = null; }
    log.innerHTML = '';
    root.querySelectorAll('.oq-stage').forEach(el => { el.classList.remove('on', 'bad'); });
    let i = 0;
    const tick = () => {
      const st = steps[i];
      const stage = root.querySelector(`.oq-stage[data-s="${st.s}"]`);
      if (stage){
        stage.classList.add('on');
        if (st.lvl === 'bad') stage.classList.add('bad');
      }
      if (phase) phase.textContent = st.phase;
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span class="t">${st.t}</span><span class="l">${st.line}</span><span class="lvl ${st.lvl}">${st.lvl.toUpperCase()}</span>`;
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
      i++;
      if (i < steps.length) timer = setTimeout(tick, reduceMotion ? 80 : 700);
      else if (phase) phase.textContent = 'DONE';
    };
    tick();
  };
  btn?.addEventListener('click', run);
  run();
}

/* =========================================================
   8b. CORVEX ATTACK THEATRE. exact GIF sequence as widget
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

  // Each step only carries NEW events. stream appends them one-by-one as the demo advances.
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
      caption: '<b>host-c</b> falls. Attacker now spans workstation, fileserver, jump box.',
      captionCls: '',
      hosts: { a: 'hit', b: 'hit', c: 'hit' },
      links: { a: 1, b: 1, c: 1 },
      mesh: 0, shields: {}, camp: 0,
      events: [
        { ts: '12:00:30', host: 'HOST-C', type: 'auth', text: '<em>alice</em> reaches <em>host-c</em> (jump box). 3 hosts owned', meta: 'campaign complete across lab' }
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
      caption: 'Defense action proposed for <b>host-a</b> / <b>host-b</b> / <b>host-c</b>. Logged only. Live quarantine still locked.',
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
    div.innerHTML = '<div class="t"><span>' + escapeHtml(ev.ts) + '</span><span>' + escapeHtml(ev.host) + '</span></div>'
      + '<div class="body">' + safeRich(ev.text) + '</div>'
      + '<div class="meta">' + escapeHtml(ev.meta || '') + '</div>';
    stream.prepend(div);
    stream.scrollTop = 0;
    requestAnimationFrame(() => div.classList.add('on'));
    const kpi = $('#cxKpiEvents');
    if (kpi) kpi.textContent = String(stream.children.length);
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
      captionEl.innerHTML = safeRich(s.caption);
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
    const kpiCamp = $('#cxKpiCamp');
    if (kpiCamp) kpiCamp.textContent = s.camp ? '1' : '0';
    const kpiAct = $('#cxKpiAct');
    if (kpiAct) kpiAct.textContent = (s.phase || '').includes('CONTAIN') ? 'dry-run' : 'observe';
    const pulse = $('#cxPulse');
    if (pulse) pulse.classList.toggle('idle', !(s.phase && s.phase !== 'IDLE' && !s.phase.includes('DONE')));
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
  // Reduced-motion still steps (so Play/Replay never look dead). just faster.
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

  // Idle until the user presses Play. autoplay made Replay look dead once the sequence finished.
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
   9. SIM. RPM + VRS
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
    range.setAttribute('aria-valuenow', String(Math.round(rpm)));
  }
  range.addEventListener('input', () => {
    set(+range.value);
    range.setAttribute('aria-valuenow', String(range.value));
  });
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
    range.setAttribute('aria-valuenow', String(v));
    if (inst > 0.5){
      regime.textContent = 'VORTEX RING'; regime.style.color = '#8a0f30';
      rec.textContent = '↗ +6 m/s lat'; risk.textContent = 'HIGH'; risk.style.color = '#8a0f30';
    } else if (inst > 0.25){
      regime.textContent = 'TRANSITION'; regime.style.color = '#8a0f30';
      rec.textContent = '→ reduce descent'; risk.textContent = 'MOD'; risk.style.color = '#8a0f30';
    } else {
      regime.textContent = 'STABLE'; regime.style.color = '#0a6675';
      rec.textContent = '✓ within envelope'; risk.textContent = 'LOW'; risk.style.color = '#0a6675';
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
  // Paint path first. cover + nav. then mount below-the-fold widgets.
  run('pages', startPages);
  run('keys', startKeys);
  boot();
  const mountWidgets = () => {
    run('bumble', startBumble);
    run('godfather', startGodfather);
    run('probe', startProbe);
    run('corvex', startCorvex);
    run('orqis', startOrqis);
    run('rpm', initRPM);
    run('vrs', initVRS);
    run('magnets', startMagnets);
    run('mascot', () => {
      import('./mascot.js?v=sb01-23')
        .then(m => m.initMascot())
        .catch(err => console.error('mascot failed', err));
    });
    run('github', loadGitHubData);
  };
  if ('requestIdleCallback' in window){
    requestIdleCallback(mountWidgets, { timeout: 1200 });
  } else {
    setTimeout(mountWidgets, 0);
  }
});
