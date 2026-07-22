import subprocess, base64, re, json, sys

sys.stdout.reconfigure(encoding="utf-8")

# Athera portfolio
raw = subprocess.check_output(
    ["gh", "api", "repos/Siddarthb07/Athera/contents/portfolio.html", "--jq", ".content"],
    text=True,
)
html = base64.b64decode(raw).decode("utf-8", "replace")
nums = re.findall(r'class="number">([^<]+)</div>\s*<div class="label">([^<]+)', html)
print("ATHERA_STATS", nums)
blurbs = re.findall(r"<p>([^<]{20,200})</p>", html)
print("ATHERA_BLURBS")
for b in blurbs[:15]:
    print(" -", b[:160])

# index.html GoEmotions line
idx = open(r"C:\Users\siddu\gh-audit\siddarthb\index.html", encoding="utf-8").read()
for line in idx.splitlines():
    if "0.19" in line or "GoEmotions" in line or "94.0" in line:
        print("INDEX:", line.strip()[:200])

# VidhiSetu variants in workspace via simple walk of key files
variants = {}
for path in [
    r"C:\Users\siddu\gh-audit\siddarthb\index.html",
    r"C:\Users\siddu\gh-audit\siddarthb\src\js\main.js",
    r"C:\Users\siddu\gh-audit\siddarthb\src\js\mascot.js",
    r"C:\Users\siddu\gh-audit\siddarthb\src\js\github.js",
    r"C:\Users\siddu\gh-audit\siddarthb\src\styles\main.css",
]:
    text = open(path, encoding="utf-8").read()
    for v in ["VidhiSetu", "VidhiSethu", "VIDHISETHU", "vidhisetu", "vidhisethu", "Lexprobe", "LEXPROBE"]:
        c = len(re.findall(re.escape(v), text))
        if c:
            variants.setdefault(v, []).append((path.split("siddarthb\\")[-1], c))
print("SPELLINGS", variants)

# GeoQuant: confirm no report.json in tree
tree = json.loads(
    subprocess.check_output(
        ["gh", "api", "repos/Siddarthb07/GeoQuant/git/trees/main?recursive=1"], text=True
    )
)
paths = [t["path"] for t in tree["tree"]]
print("GEOQUANT_HAS_REPORT_JSON", any("report.json" in p for p in paths))
print("GEOQUANT_ARTIFACT_PATHS", [p for p in paths if "artifact" in p.lower() or "report" in p.lower()])

# Health AUDIT expected metrics label
raw = subprocess.check_output(
    ["gh", "api", "repos/Siddarthb07/Drift/contents/ml/AUDIT_AND_DESIGN.md", "--jq", ".content"],
    text=True,
)
t = base64.b64decode(raw).decode()
i = t.find("Expected metrics")
print("HEALTH_EXPECTED:", t[i : i + 180].replace("\n", " | "))

# TinyLlama manifest arousal
raw = subprocess.check_output(
    [
        "gh",
        "api",
        "repos/Siddarthb07/Anima/contents/benchmarks/reports/latest_tinyllama_1.1b_chat_v1.0_manifest.json",
        "--jq",
        ".content",
    ],
    text=True,
)
m = json.loads(base64.b64decode(raw))
for e in m.get("entries", []):
    if e.get("benchmark") == "go_emotions":
        print("GOEMOTIONS_ENTRY", {k: e[k] for k in e if "pearson" in k or k in ("benchmark", "status", "metrics")})
