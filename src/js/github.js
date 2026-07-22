/* GitHub project registry — source of truth for public repo index + live stats */

export const GH_USER = 'Siddarthb07';
export const GH_CACHE_KEY = 'sb_gh_repos_v10';
export const GH_CACHE_TTL = 60 * 60 * 1000;

export const SITE = {
  caseFiles: 5,
  internships: 3,
  liveSims: 2,
  founderMonths: 6
};

/** Repos never shown in the public index (site source, profile readme, archived toys, client work). */
export const REPO_HIDDEN = new Set([
  'Siddarthb07',
  'siddarthb',
  'AI-BRAIN',
  'AI-powered-whatsapp-chatbot',
  'health-tracker-v2',
  'AI-Risk-Prediction-',
  'cv2-volume-control',
  'webcam-sketcher',
  'project_thrive',
  'VidhiSethu',
  'first-contributions',
  'sign-language-cv',
  'orqis-e2e-test'
]);

export const REPO_TIERS = {
  featured: ['Anima', 'corvex', 'GeoQuant', 'Drift'],
  lab: ['Propeller-simulator', 'Drone-Vortex-Ring-Simulation'],
  inflight: ['NeuralVortex', 'text2sql-rag', 'vortex-tracker', 'cursor-llm-council', 'trade_bot'],
  founder: ['Athera', 'Elevyx']
};

/** Display aliases when the GitHub repo name differs from the brand. */
export const REPO_DISPLAY = {
  corvex: 'Corvex'
};

export const PROOF_LINES = {
  corvex: 'multi-host correlator · sealed eval · gated contain',
  GeoQuant: 'walk-forward · Alpaca paper · cost in optimizer',
  Drift: 'ACC/AHA · FINDRISC · safety gates',
  Anima: 'HF hooks · valence / arousal / unc · MIT',
  'Propeller-simulator': 'BEMT · GUI + CLI · CSV sweeps',
  'Drone-Vortex-Ring-Simulation': 'Helmholtz · Kelvin Γ · viscous decay',
  NeuralVortex: 'FNO surrogate · own CFD data · W&B',
  'text2sql-rag': 'Spider benchmark · sqlglot validator · clean-room',
  'vortex-tracker': 'OpenCV · diameter + speed · IISc May 2025',
  Athera: 'AI automation · SMB workflows · no public client list',
  Elevyx: 'founding dev · lead recovery · ended May 2026',
  'cursor-llm-council': 'multi-model council · Cursor · no yes-men',
  trade_bot: 'NSE bulk deals · WhatsApp alerts · research dash'
};

const TIER_ORDER = ['featured', 'lab', 'inflight', 'founder', 'archived', 'other'];
const TIER_LABELS = {
  featured: 'CASE FILES',
  lab: 'LAB',
  inflight: 'OTHER PROJECTS',
  founder: 'FOUNDER',
  archived: 'ARCHIVED',
  other: 'OTHER'
};

export function padStat(n){
  return n >= 100 ? String(n) : String(n).padStart(2, '0');
}

export function tierForRepo(name, description = ''){
  if (REPO_TIERS.featured.includes(name)) return 'featured';
  if (REPO_TIERS.lab.includes(name)) return 'lab';
  if (REPO_TIERS.inflight.includes(name)) return 'inflight';
  if (REPO_TIERS.founder.includes(name)) return 'founder';
  if (/archived/i.test(description || '')) return 'archived';
  return 'other';
}

export function visibleRepos(repos){
  return repos.filter(r => !r.fork && !REPO_HIDDEN.has(r.name));
}

export function categorizeRepos(repos){
  const visible = visibleRepos(repos);
  const buckets = Object.fromEntries(TIER_ORDER.map(t => [t, []]));

  for (const repo of visible){
    const tier = tierForRepo(repo.name, repo.description);
    buckets[tier].push(repo);
  }

  for (const tier of TIER_ORDER){
    const order = REPO_TIERS[tier];
    if (Array.isArray(order) && order.length){
      buckets[tier].sort((a, b) => {
        const ia = order.indexOf(a.name);
        const ib = order.indexOf(b.name);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      });
    } else {
      buckets[tier].sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  return { visible, buckets };
}

export function inflightCount(buckets){
  return buckets.inflight.length;
}

async function ghFetch(url){
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

export async function fetchAllRepos(){
  try {
    const raw = sessionStorage.getItem(GH_CACHE_KEY);
    if (raw){
      const { t, repos } = JSON.parse(raw);
      if (Date.now() - t < GH_CACHE_TTL && Array.isArray(repos)) return repos;
    }
  } catch { /* ignore corrupt cache */ }

  let repos = [];
  let page = 1;

  while (true){
    const batch = await ghFetch(
      `https://api.github.com/users/${GH_USER}/repos?per_page=100&page=${page}&type=owner&sort=updated`
    );
    if (!batch.length) break;
    repos = repos.concat(batch);
    if (batch.length < 100) break;
    page++;
  }

  try {
    sessionStorage.setItem(GH_CACHE_KEY, JSON.stringify({ t: Date.now(), repos }));
  } catch { /* quota */ }

  return repos;
}

export function relAge(iso){
  if (!iso) return '';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export function renderRepoIndex(buckets, host){
  if (!host) return;

  const parts = [];
  for (const tier of TIER_ORDER){
    const list = buckets[tier];
    if (!list.length) continue;

    parts.push(`<div class="ri-tier"><span class="ri-label">${TIER_LABELS[tier]}</span><ul class="ri-list">`);
    for (const repo of list){
      const proof = PROOF_LINES[repo.name] || (repo.language ? repo.language : 'open source');
      const label = REPO_DISPLAY[repo.name] || repo.name;
      const desc = repo.description
        ? repo.description
            .replace(/archived[.,]?\s*/i, '')
            .replace(/—\s*,\s*/g, '— ')
            .trim()
        : proof;
      const upd = relAge(repo.pushed_at);
      parts.push(
        `<li><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" data-cur="repo">` +
        `<b>${label}${upd ? `<i class="ri-upd">upd ${upd}</i>` : ''}</b><span>${desc}</span></a></li>`
      );
    }
    parts.push('</ul></div>');
  }

  host.innerHTML = parts.join('');
}
