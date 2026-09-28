/* GitHub project registry. source of truth for public repo index + live stats */

export const GH_USER = 'Siddarthb07';
export const GH_CACHE_KEY = 'sb_gh_repos_v15';
export const GH_CACHE_TTL = 60 * 60 * 1000;

export const SITE = {
  caseFiles: 5,
  privateCaseFiles: 2,
  internships: 2,
  liveSims: 2,
  founderMonths: 6
};

/** Repos never shown in the public index (site source, profile readme, toys). */
export const REPO_HIDDEN = new Set([
  'Siddarthb07',
  'siddarthb',
  'first-contributions',
  'orqis-e2e-test',
  'vidhisetu-private'
]);

export const REPO_TIERS = {
  featured: ['Anima', 'bumblebee', 'corvex', 'GodFather', 'Orqis'],
  lab: ['Propeller-simulator', 'Drone-Vortex-Ring-Simulation', 'homelab-rpi', 'pi-hole-nas'],
  inflight: ['GeoQuant', 'Drift', 'NeuralVortex', 'text2sql-rag', 'vortex-tracker', 'cursor-llm-council', 'trade_bot', 'FleetControl'],
  founder: ['Athera', 'VidhiSethu'],
  archived: [
    'Elevyx',
    'AI-BRAIN',
    'AI-powered-whatsapp-chatbot',
    'AI-Risk-Prediction-',
    'health-tracker-v2',
    'cv2-volume-control',
    'webcam-sketcher',
    'project_thrive',
    'sign-language-cv'
  ]
};

/**
 * Private / external projects that never appear in the public GitHub owner list
 * but belong in the complete index (case files).
 */
export const INDEX_STUBS = [
  {
    name: 'bumblebee',
    html_url: '#case-2',
    description: 'private repo',
    pushed_at: null,
    language: null,
    fork: false,
    _stub: true,
    _tier: 'featured'
  },
  {
    name: 'GodFather',
    html_url: '#case-4',
    description: 'private repo',
    pushed_at: null,
    language: null,
    fork: false,
    _stub: true,
    _tier: 'featured'
  },
  {
    name: 'Orqis',
    html_url: 'https://orqis-auto-agent-dev-ops.vercel.app',
    description: 'cofounder · live product',
    pushed_at: null,
    language: null,
    fork: false,
    _stub: true,
    _tier: 'featured',
    _live: true
  }
];

/** Display aliases when the GitHub repo name differs from the brand. */
export const REPO_DISPLAY = {
  corvex: 'Corvex',
  bumblebee: 'BumbleBee',
  GodFather: 'GodFather',
  VidhiSethu: 'VidhiSetu',
  'Propeller-simulator': 'Propeller',
  'Drone-Vortex-Ring-Simulation': 'Drone VRS',
  'homelab-rpi': 'Homelab',
  'pi-hole-nas': 'Pi-hole NAS',
  'cursor-llm-council': 'LLM Council',
  'text2sql-rag': 'Text2SQL',
  'vortex-tracker': 'Vortex tracker',
  'AI-powered-whatsapp-chatbot': 'WA chatbot',
  'AI-Risk-Prediction-': 'Risk Pred.',
  'health-tracker-v2': 'Health v2',
  'cv2-volume-control': 'CV volume',
  'webcam-sketcher': 'Webcam sketch',
  'project_thrive': 'Thrive',
  'sign-language-cv': 'Sign CV'
};

const TIER_ORDER = ['featured', 'lab', 'inflight', 'founder', 'archived', 'other'];
const TIER_LABELS = {
  featured: 'CASES',
  lab: 'LAB',
  inflight: 'BUILD',
  founder: 'FOUNDER',
  archived: 'ARCHIVE',
  other: 'OTHER'
};

export function padStat(n){
  return n >= 100 ? String(n) : String(n).padStart(2, '0');
}

export function tierForRepo(name, description = '', forced){
  if (forced) return forced;
  if (REPO_TIERS.featured.includes(name)) return 'featured';
  if (REPO_TIERS.lab.includes(name)) return 'lab';
  if (REPO_TIERS.inflight.includes(name)) return 'inflight';
  if (REPO_TIERS.founder.includes(name)) return 'founder';
  if (REPO_TIERS.archived.includes(name)) return 'archived';
  if (/archived/i.test(description || '')) return 'archived';
  return 'other';
}

export function visibleRepos(repos){
  return repos.filter(r => !r.fork && !REPO_HIDDEN.has(r.name));
}

/** GitHub profile "public repos". all owned public repos, including forks. */
export function publicRepoCount(repos){
  return repos.length;
}

export function categorizeRepos(repos){
  const byName = new Map();
  for (const repo of visibleRepos(repos)){
    byName.set(repo.name, repo);
  }
  // Seed private/external case files so the index is complete.
  for (const stub of INDEX_STUBS){
    if (!byName.has(stub.name)) byName.set(stub.name, stub);
  }

  const buckets = Object.fromEntries(TIER_ORDER.map(t => [t, []]));
  for (const repo of byName.values()){
    const tier = tierForRepo(repo.name, repo.description, repo._tier);
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

  return { visible: [...byName.values()], buckets };
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

function escapeHtml(s){
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeHref(url){
  const raw = String(url || '');
  if (raw.startsWith('#')) return raw;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:') return 'https://github.com/Siddarthb07';
    if (
      u.hostname !== 'github.com' &&
      u.hostname !== 'www.github.com' &&
      !u.hostname.endsWith('.vercel.app')
    ) return 'https://github.com/Siddarthb07';
    return u.href;
  } catch {
    return 'https://github.com/Siddarthb07';
  }
}

export function renderRepoIndex(buckets, host){
  if (!host) return;

  const sections = [];
  for (const tier of TIER_ORDER){
    const list = buckets[tier];
    if (!list.length) continue;
    const tierLabel = TIER_LABELS[tier] || tier;
    const items = list.map(repo => {
      const label = REPO_DISPLAY[repo.name] || repo.name;
      const href = safeHref(repo.html_url);
      const isHash = href.startsWith('#');
      const soon = repo._stub && !repo._live ? ' <i class="ri-soon">private</i>' : '';
      const target = isHash ? '' : ' target="_blank" rel="noopener noreferrer"';
      const jump = isHash ? ` data-jump="${href === '#case-2' ? '4' : href === '#case-4' ? '6' : ''}"` : '';
      return (
        `<li class="ri-item" data-tier="${escapeHtml(tier)}">` +
        `<a href="${escapeHtml(href)}"${target}${jump} data-cur="repo">` +
        `${escapeHtml(label)}${soon}</a></li>`
      );
    });
    sections.push(
      `<section class="ri-col" data-tier="${escapeHtml(tier)}">` +
      `<h4 class="ri-col-label">${escapeHtml(tierLabel)}</h4>` +
      `<ul class="ri-list">${items.join('')}</ul></section>`
    );
  }

  host.innerHTML = sections.length
    ? `<div class="ri-board">${sections.join('')}</div>`
    : `<p class="ri-fallback">No public repos to list.</p>`;
}
