#!/usr/bin/env python3
"""Generate Siddarth Boggarapu CV PDF into assets/."""
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

OUT = Path(__file__).resolve().parents[1] / "assets" / "Siddarth_Boggarapu_Resume.pdf"

INK = HexColor("#111827")
MUTED = HexColor("#4b5563")
RULE = HexColor("#d1d5db")
ACCENT = HexColor("#0f766e")

def styles():
    base = getSampleStyleSheet()
    s = {
        "name": ParagraphStyle(
            "Name", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=16, leading=19, textColor=INK, alignment=TA_CENTER, spaceAfter=2
        ),
        "contact": ParagraphStyle(
            "Contact", parent=base["Normal"], fontName="Helvetica",
            fontSize=8.2, leading=11, textColor=MUTED, alignment=TA_CENTER, spaceAfter=6
        ),
        "summary": ParagraphStyle(
            "Summary", parent=base["Normal"], fontName="Helvetica",
            fontSize=8.5, leading=11.5, textColor=INK, alignment=TA_LEFT, spaceAfter=8
        ),
        "h": ParagraphStyle(
            "H", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=9.5, leading=12, textColor=ACCENT, spaceBefore=8, spaceAfter=3,
            tracking=0.4
        ),
        "role": ParagraphStyle(
            "Role", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=9, leading=11.5, textColor=INK, spaceBefore=4, spaceAfter=0
        ),
        "meta": ParagraphStyle(
            "Meta", parent=base["Normal"], fontName="Helvetica-Oblique",
            fontSize=7.8, leading=10, textColor=MUTED, spaceAfter=2
        ),
        "body": ParagraphStyle(
            "Body", parent=base["Normal"], fontName="Helvetica",
            fontSize=8.2, leading=10.8, textColor=INK, spaceAfter=1
        ),
        "bullet": ParagraphStyle(
            "Bullet", parent=base["Normal"], fontName="Helvetica",
            fontSize=8.1, leading=10.6, textColor=INK, leftIndent=10
        ),
    }
    return s

def bullets(items, s):
    flow = []
    for t in items:
        flow.append(Paragraph(f"• {t}", s["bullet"]))
    return flow

def section(title, s):
    return [
        Paragraph(title.upper(), s["h"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=0, spaceAfter=4),
    ]

def build():
    s = styles()
    doc = SimpleDocTemplate(
        str(OUT), pagesize=letter,
        leftMargin=0.55 * inch, rightMargin=0.55 * inch,
        topMargin=0.42 * inch, bottomMargin=0.42 * inch,
        title="Siddarth Boggarapu — CV",
        author="Siddarth Boggarapu",
    )
    story = []

    story += [
        Paragraph("SIDDARTH BOGGARAPU", s["name"]),
        Paragraph(
            "Bangalore, India<br/>"
            "GitHub: Siddarthb07 · Portfolio: siddarthb07.github.io/siddarthb · "
            "Email: siddarthb078@gmail.com · Athera: athera.digital",
            s["contact"],
        ),
        Paragraph(
            "Builder portfolio centered on systems that <b>verify, cite, and refuse</b> under uncertainty — "
            "LLM instrumentation, grounded QA, multi-host security correlation, paper trading research, "
            "agent ops, legal-tech RAG, and physical simulation. CSET / SaTML submissions are "
            "<b>under review</b> (not accepted, not published).",
            s["summary"],
        ),
    ]

    story += section("Research / workshop submissions (pending)", s)
    story.append(Paragraph("CSET · SaTML — under review", s["role"]))
    story.append(Paragraph("Security experimentation (CSET) and trustworthy ML (SaTML) · decisions pending", s["meta"]))
    story += bullets([
        "Submitted and under review. Not accepted or published.",
    ], s)

    story += section("Ventures and professional experience", s)

    story.append(Paragraph("Orqis — Technical cofounder", s["role"]))
    story.append(Paragraph("Live product · FastAPI · libcst · MCP · Redis · human review before merge", s["meta"]))
    story += bullets([
        "Owns backend for an agent-ops product: detect runaway loops, explain via MCP, open a reviewable patch/PR.",
        "Deterministic libcst remediations plus confidence-gated LLM assist; never silent-pushes the default branch.",
        "Live product with beta onboarding.",
    ], s)

    story.append(Paragraph("Athera (athera.digital) — Founder", s["role"]))
    story.append(Paragraph("AI automation and websites for small businesses · 6+ months", s["meta"]))
    story += bullets([
        "Two client websites plus an in-progress AI HR build for a client; client names private.",
        "Ops glue across sheets, Gmail, webhooks, and live deploys.",
    ], s)

    story.append(Paragraph("VidhiSetu (VidhiSethu / Lexprobe) — Founder / builder", s["role"]))
    story.append(Paragraph("Indian-legal RAG with citation audit · closed beta", s["meta"]))
    story += bullets([
        "Natural-language legal research over an Indian corpus; citation-audit layer filters unsupported claims.",
        "Refined with informal feedback from 2 law agencies and 3 lawyers; public architecture docs; application remains private.",
    ], s)

    story.append(Paragraph("Evex — Founder / lead, event company (Bangalore)", s["role"]))
    story.append(Paragraph("Operations and P&amp;L", s["meta"]))
    story += bullets([
        "Hosted 20+ school graduation parties across Bangalore; about INR 5 lakh profit.",
        "Leadership, logistics, and client delivery outside pure coding.",
    ], s)

    story += section("Internships", s)
    story.append(Paragraph("Indian Institute of Science (IISc) — Aerodynamics intern", s["role"]))
    story.append(Paragraph("May 2025 · 10 days", s["meta"]))
    story += bullets([
        "Lab exposure to vortex-ring formation and instability regimes.",
        "Built vortex-tracker (OpenCV ring diameter and propagation speed) during the internship.",
        "Follow-on propeller and vortex-ring simulation work was self-directed, on my own time.",
    ], s)

    story.append(Paragraph("Vegam Solutions — Engineering intern (two roles)", s["role"]))
    story.append(Paragraph("Air-filtration hardware (2025 Q3) · Text-to-SQL RAG, 1 month full-time (2026 Q1, NDA)", s["meta"]))
    story += bullets([
        "Hardware: end-to-end water-based air-filtration prototype under shop constraints.",
        "Software: NL→SQL retrieval with schema awareness and grounded refusal; public clean-room companion: text2sql-rag (Spider evaluation pending).",
    ], s)

    story += section("Selected projects (technical)", s)
    story.append(Paragraph("Anima — LLM interpretability meter (flagship)", s["role"]))
    story.append(Paragraph("Public · MIT · HF Spaces demo", s["meta"]))
    story += bullets([
        "Forward hooks into Hugging Face causal LMs; probe heads read valence, arousal, and uncertainty per token.",
        "Guard recommends abstaining when the readout looks unreliable (HaluEval / TruthfulQA fixtures).",
        "Benchmarked on five open models: TinyLlama 1.1B scored 94/100 on the weighted validity rubric (60 = publication bar); GoEmotions valence Pearson r ≈ 0.19.",
        "Technical: FastAPI + WebSocket stream, dashboard, public Spaces demo — meter, not a claim the model feels.",
    ], s)

    story.append(Paragraph("BumbleBee — Transformer-free CEC correlator (private)", s["role"]))
    story.append(Paragraph("Private repo · no Hugging Face transformer on the product path", s["meta"]))
    story += bullets([
        "Closed-corpus ask / cite / refuse: GRU local encoder → SoftCorrelator (sparsemax) → CoverageGate → cite or refuse.",
        "Skills (chat / math / code) short-circuit via packs/tools; hard asks fall back to CEC. Not a frontier next-token LLM.",
        "Honesty: on the sealed pack BM25 still leads in-domain F1; skills wins ≠ core CEC quality. Patent: nothing filed.",
        "CLI: ingest, seal, train, calibrate, eval, ask, chat, dash. Footprint-first (~24M params class) — not dense-LLM parity.",
    ], s)

    story.append(Paragraph("Corvex — Multi-host campaign correlator (flagship)", s["role"]))
    story.append(Paragraph("Public · MIT · sealed synthetic eval · claim_allowed=false by default", s["meta"]))
    story += bullets([
        "Fuses weak per-host detectors (lateral_auth, micro_exfil, recon_fanout) into ATT&amp;CK-shaped campaign timelines.",
        "Observe-only Windows/macOS sensors; live containment locked off by default (human stays in control).",
        "Holds on synthetic fleets — not validated on real enterprise telemetry or a pure-benign baseline yet.",
        "Technical: HMAC-signed EventEnvelopes + transitive correlator merge across hosts.",
    ], s)

    story.append(Paragraph("GodFather — Multi-agent NSE paper desk (private)", s["role"]))
    story.append(Paragraph("Private repo · paper / session-sim only · not investment advice", s["meta"]))
    story += bullets([
        "Scout / Risk / Session agents share one desk; Risk may cut size or force cash — never raise risk.",
        "Prior-session bulk/block BUY filings, open-range entry, same-day exits; CLAIMS.md honesty gates.",
        "Never sent a live broker order. Cut from the broader trade_bot lab.",
    ], s)

    story.append(Paragraph("Orqis — Agent-ops self-healing (also under Ventures)", s["role"]))
    story.append(Paragraph("Live product · detect → explain → patch → human review", s["meta"]))
    story += bullets([
        "Incident console for runaway tool loops; reviewable unified-diff / PR; refuse silent push.",
    ], s)

    story.append(Paragraph("VidhiSetu — Indian-legal RAG (also under Ventures)", s["role"]))
    story.append(Paragraph("Citation audit · closed beta · public architecture docs", s["meta"]))
    story += bullets([
        "Answers grounded in sources; unsupported claims filtered before response ships.",
    ], s)

    story.append(Paragraph("Drift — Clinical rule-based health risk tracker", s["role"]))
    story.append(Paragraph("ACC/AHA · FINDRISC · safety-gated experimental ML", s["meta"]))
    story += bullets([
        "Deterministic cardiovascular / diabetes risk calculators; ML path labeled experimental — not a medical device.",
        "Technical: Flask + SQLite; Fitbit / Google Fit optional sync.",
    ], s)

    story.append(Paragraph("GeoQuant — Algorithmic trading research platform", s["role"]))
    story.append(Paragraph("Walk-forward · cost-aware · honesty-first", s["meta"]))
    story += bullets([
        "MLP signals, news sentiment, paper trading, retraining. Walk-forward backtests (2022 to 2025): v1 failed (Sharpe −0.47, kept public); v2 trend + vol target reached Sharpe 1.36.",
        "Backtests only; not investment advice. Technical: PyTorch + FastAPI with costs inside the optimizer.",
    ], s)

    story.append(Paragraph("Aerospace / simulation / drone arc (self-directed)", s["role"]))
    story.append(Paragraph("Simulation + hardware learning · vortex-tracker built during the IISc internship", s["meta"]))
    story += bullets([
        "vortex-tracker (OpenCV diameter + speed) · Propeller-simulator (BEMT-style model, simplified) · Drone-Vortex-Ring-Simulation (reduced-order Helmholtz / Kelvin Γ; not CFD).",
        "NeuralVortex: early FNO-style volumetric surrogate (smoke-scale — not production accuracy).",
        "Homemade F450 quad + F550 hex builds; Pico FC learning firmware (props-off until tether tests pass).",
    ], s)

    story.append(Paragraph("Other supporting systems", s["role"]))
    story += bullets([
        "trade_bot: NSE bulk-deal ingest, scoring, WhatsApp alerts — lab that fed GodFather.",
        "text2sql-rag: Spider clean-room with schema linking, few-shot, sqlglot validation (evaluation pending).",
        "FleetControl: multi-host stub LLM memory pools + Anima probes.",
        "cursor-llm-council: multi-model Cursor council that resists yes-man answers.",
        "AI-BRAIN: voice-first daily OS (Whisper, local/cloud LLM, Qdrant RAG).",
        "Homelab: Raspberry Pi NAS + Pi-hole; Elevyx: wound-down real-estate lead recovery.",
    ], s)

    story += section("Hardware", s)
    story += bullets([
        "Multirotors: F450 quad + F550 hex (GPS / autonomous modes) — airframe, ESCs, FC tuning.",
        "Rovers: Bluetooth, line-follow, ultrasonic avoid; custom PCB plant-watering (soil moisture).",
        "Arduino / ESP32 toolkit including BLE macrodeck for workflow shortcuts.",
        "Neural Sync (in progress): low-cost 2-channel EEG research instrument — software-first, never mixes synthetic with live serial.",
    ], s)

    story += section("Community · sports", s)
    story += bullets([
        "Websites / volunteering: Project Thrive, Project Lighthouse, Arogi Foundation.",
        "Football: school team 4 years; state-level CBSE tournament; Goa Globe 2024, team 2nd place; ESSB / GameON.",
        "Past competitive skating (ForceOne Academy). Motorcycle track training (trained, not certified).",
        "Badminton, swimming, Model UN; 50+ hours of community service.",
    ], s)

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Portfolio dossier (live widgets + GitHub index): https://siddarthb07.github.io/siddarthb/",
        s["contact"],
    ))

    doc.build(story)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")

if __name__ == "__main__":
    build()
