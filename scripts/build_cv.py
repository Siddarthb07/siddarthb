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

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "Siddarth_Boggarapu_Resume.pdf"
SCHOOL = ROOT / "assets" / "Siddarth_Boggarapu_School_Activity_Record.pdf"

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
            "Student in Bangalore. Built an 8-bit breadboard computer from 74HC logic chips, "
            "plus software that measures language models, correlates security alerts, and refuses "
            "answers it cannot support. CSET / SaTML submissions are <b>under review</b> "
            "(not accepted, not published).",
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
    story.append(Paragraph("Discrete-logic CPU — built 8-bit breadboard computer", s["role"]))
    story.append(Paragraph("74HC logic on six breadboards · ESP8266 loads the program only · not a simulated CPU", s["meta"]))
    story += bullets([
        "Built the processor from 74HC chips: registers, adder, decoders, and a 555 clock, on six solderless breadboards.",
        "The ESP8266 NodeMCU only writes the program into SRAM from USB. It is not the processor, and it is not tied to the CPU 5 V supply.",
        "Wired instructions: load, add, subtract, AND, OR, XOR, show the result on LEDs, halt, and no-operation. Jump and jump-if-zero are not wired.",
        "Check program the machine is built to run: load 5, add 7, show 12 (binary 0000 1100), then halt. Clock can free-run or single-step.",
    ], s)

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
        "CLI: ingest, seal, train, calibrate, eval, ask, chat, dash. Footprint-first design, not dense-LLM parity.",
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
        "Discrete-logic CPU: built 8-bit 74HC breadboard computer (see project above). ESP8266 is the loader only.",
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
        "Badminton, swimming, Model UN; two SWEA school trips (three days each); 50+ hours of community service.",
    ], s)

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Portfolio dossier (live widgets + GitHub index): https://siddarthb07.github.io/siddarthb/",
        s["contact"],
    ))

    doc.build(story)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


def school_styles():
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle(
            "Kicker", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=8, leading=10, textColor=ACCENT, alignment=TA_CENTER, spaceAfter=2,
        ),
        "name": ParagraphStyle(
            "SName", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=16, leading=19, textColor=INK, alignment=TA_CENTER, spaceAfter=2,
        ),
        "contact": ParagraphStyle(
            "SContact", parent=base["Normal"], fontName="Helvetica",
            fontSize=9, leading=12, textColor=MUTED, alignment=TA_CENTER, spaceAfter=8,
        ),
        "note": ParagraphStyle(
            "SNote", parent=base["Normal"], fontName="Helvetica",
            fontSize=9.5, leading=13, textColor=INK, spaceAfter=8,
        ),
        "h": ParagraphStyle(
            "SH", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=11, leading=14, textColor=ACCENT, spaceBefore=10, spaceAfter=3,
        ),
        "role": ParagraphStyle(
            "SRole", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=10.5, leading=13, textColor=INK, spaceBefore=6, spaceAfter=1,
        ),
        "body": ParagraphStyle(
            "SBody", parent=base["Normal"], fontName="Helvetica",
            fontSize=9.5, leading=12.5, textColor=INK, spaceAfter=2,
        ),
        "limit": ParagraphStyle(
            "SLimit", parent=base["Normal"], fontName="Helvetica-Oblique",
            fontSize=9, leading=12, textColor=MUTED, spaceAfter=4, leftIndent=8,
        ),
    }


def entry(s, title, lines, limit):
    flow = [Paragraph(title, s["role"])]
    for line in lines:
        flow.append(Paragraph(line, s["body"]))
    flow.append(Paragraph(f"Limit: {limit}", s["limit"]))
    return flow


def build_school():
    s = school_styles()
    doc = SimpleDocTemplate(
        str(SCHOOL), pagesize=letter,
        leftMargin=0.7 * inch, rightMargin=0.7 * inch,
        topMargin=0.6 * inch, bottomMargin=0.6 * inch,
        title="Siddarth Boggarapu — school activity record",
        author="Siddarth Boggarapu",
    )
    story = [
        Paragraph("FOR SCHOOL REVIEW", s["kicker"]),
        Paragraph("SIDDARTH BOGGARAPU", s["name"]),
        Paragraph(
            "Bangalore, India · siddarthb078@gmail.com<br/>"
            "GitHub: Siddarthb07 · Portfolio: siddarthb07.github.io/siddarthb<br/>"
            "School name / grade / counselor: ________________________________",
            s["contact"],
        ),
        Paragraph(
            "Activity record for the school to review before it approves documents "
            "connected to SAT registration or score reporting. This is not a College Board form, "
            "an admission ticket, or a photo ID. It is the list of work the school can check. "
            "Each item states what was actually done and the limit on that claim.",
            s["note"],
        ),
        Paragraph("BUILT COMPUTER", s["h"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=0, spaceAfter=4),
    ]
    story += entry(
        s,
        "Discrete-logic CPU — built 8-bit breadboard computer",
        [
            "I built the processor on six solderless breadboards from 74HC logic chips "
            "(registers, adder, decoders, and a 555 clock). It is a real wired computer, not a diagram and not a program pretending to be a CPU.",
            "An ESP8266 NodeMCU only loads the program into the SRAM from a USB port. It is not the processor. Its ground is shared with the CPU. Its 5 V pin is not connected to the CPU supply.",
            "Instructions that are wired: load a number, add, subtract, AND, OR, XOR, copy the result to output LEDs, halt, and no-operation. "
            "The machine can free-run or single-step.",
            "The check program is four bytes: load 5, add 7, show the result, halt. The output LEDs should read 0000 1100 (12), then the halt light stays on.",
        ],
        "Jump and jump-if-zero are not wired, so this is not a general-purpose computer with branches. "
        "The memory chip is 32K, but this build uses addresses 0 to 15. No custom silicon and no fabricated PCB.",
    )
    story += [
        Paragraph("PROJECTS THE SCHOOL CAN OPEN", s["h"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=0, spaceAfter=4),
    ]
    story += entry(
        s,
        "Anima — language-model meter (public)",
        [
            "Reads internal activations of open language models and estimates valence, arousal, and uncertainty per token. A guard recommends abstaining when the reading looks unreliable.",
            "On the project’s own validity rubric, TinyLlama 1.1B scored 94/100 (the project’s publication bar was 60). On GoEmotions, valence correlation was about 0.19.",
        ],
        "This does not mean the model has feelings. 94/100 is a project rubric, not an official exam score. The 0.19 correlation is weak.",
    )
    story += entry(
        s,
        "Corvex — multi-host alert correlator (public)",
        [
            "Combines weak alerts from many computers into one campaign timeline. Sensors exist for Windows and macOS. Live quarantine is locked off. A person stays in control.",
            "Results that hold are on synthetic practice fleets, including a small sealed set (3 attack packs and 5 benign packs).",
        ],
        "Not validated on a real company’s network or on a large set of purely normal traffic. Not a commercial security product.",
    )
    story += entry(
        s,
        "BumbleBee — closed-corpus question answering (private repository)",
        [
            "Answers from a fixed document pack, cites the passage, or refuses. It does not use a Hugging Face transformer as the product.",
            "On the sealed pack, ordinary BM25 search still scores higher in-domain F1 (0.136) than the correlator (0.122), on about 2,070 items.",
        ],
        "Not a ChatGPT-class model. A perfect score on a small skills checklist is not the same as the core answerer. No patent has been filed.",
    )
    story += entry(
        s,
        "Orqis — technical cofounder, live product",
        [
            "Backend for a tool that detects a software agent stuck in a loop, explains it, and opens a patch for a person to review before anything merges.",
        ],
        "It does not silently push to the main branch. No customer count is claimed here.",
    )
    story += [
        Paragraph("WORK AND SCHOOL-ADJACENT ACTIVITY", s["h"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=0, spaceAfter=4),
    ]
    story += entry(
        s,
        "Indian Institute of Science — aerodynamics intern, May 2025 (10 days)",
        [
            "Lab exposure to vortex-ring formation. During the internship I built vortex-tracker, which measures ring diameter and speed from video with OpenCV.",
        ],
        "Later propeller and vortex-ring simulations were my own follow-on work, not an IISc assignment.",
    )
    story += entry(
        s,
        "Vegam Solutions — engineering intern",
        [
            "2025 Q3: water-based air-filtration prototype under shop constraints.",
            "2026 Q1: one month full-time on natural-language to SQL, under NDA.",
        ],
        "No client deliverable or internal metric from the NDA role is included.",
    )
    story += entry(
        s,
        "Athera (athera.digital) — founder",
        [
            "Websites and automation for small businesses for 6+ months. Two client websites and an in-progress AI HR build.",
        ],
        "Client names are private and are not listed.",
    )
    story += entry(
        s,
        "Evex — event company, Bangalore",
        [
            "Hosted 20+ school graduation parties. About INR 5 lakh profit.",
        ],
        "This is operations and delivery, not a software product.",
    )
    story += entry(
        s,
        "VidhiSetu — Indian legal research tool, closed beta",
        [
            "Natural-language research over an Indian legal corpus, with a citation check that drops unsupported claims. Informal feedback from 2 law agencies and 3 lawyers. The application stays private.",
        ],
        "Not a public legal product and not a substitute for a lawyer.",
    )
    story += entry(
        s,
        "Papers",
        [
            "CSET (security experimentation) and SaTML (trustworthy machine learning) submissions are under review.",
        ],
        "Not accepted and not published. Do not list them as publications.",
    )
    story += [
        Paragraph("SCHOOL LIFE", s["h"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=0, spaceAfter=4),
    ]
    story += entry(
        s,
        "Football, service, and other school activities",
        [
            "School football team for 4 years. State-level CBSE tournament. Goa Globe 2024, team 2nd place. Also ESSB / GameON.",
            "Websites for Project Thrive, Project Lighthouse, and Arogi Foundation. 50+ hours of community service.",
            "Model UN; badminton; swimming; two SWEA school trips (three days each). Past competitive skating at ForceOne Academy. Motorcycle track training, trained and not certified.",
        ],
        "2nd place is the team result at Goa Globe 2024, not an individual national ranking.",
    )
    story += [
        Paragraph("WHAT THIS RECORD DOES NOT SAY", s["h"]),
        HRFlowable(width="100%", thickness=0.7, color=RULE, spaceBefore=0, spaceAfter=4),
        Paragraph(
            "No SAT score is stated, because this packet is for the school’s approval step, not a score report. "
            "No school name or grade is filled in above; the school should write those. "
            "GodFather and GeoQuant are paper-trading research only and are not investment results. "
            "Drift is not a medical device. Neural Sync (EEG) is still in progress.",
            s["body"],
        ),
        Spacer(1, 14),
        Paragraph("Student signature: ___________________________ &nbsp;&nbsp; Date: ______________", s["body"]),
        Paragraph("School official: _______________________________ &nbsp;&nbsp; Date: ______________", s["body"]),
        Spacer(1, 8),
        Paragraph(
            "Same facts as the CV at https://siddarthb07.github.io/siddarthb/ — resume PDF in that site’s assets folder.",
            s["contact"],
        ),
    ]
    doc.build(story)
    print(f"Wrote {SCHOOL} ({SCHOOL.stat().st_size} bytes)")


if __name__ == "__main__":
    build()
    build_school()
