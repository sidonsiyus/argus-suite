// GTEM — curated YouTube videos per session, keyed by session id → [{ id, title }].
// IDs verified via YouTube search; each is a reputable aviation/engineering source.
// Missing entries fall back to a "search on YouTube" link for the topic.
export const VIDEOS = {
  // ── Unit I · Fundamentals & Performance ──
  "1.1": [{ id: "L24Wf0VlTE0", title: "How Jet Engines Work (Animagraffs)" }],
  "1.2": [{ id: "LDotzmLwTcw", title: "Gas Turbine Working Principle — 3D Animation" }],
  "1.3": [{ id: "B9sDz_fQ26w", title: "The Brayton Cycle — T-S & P-V Diagrams" }],
  "1.4": [{ id: "7v-lyKce7U8", title: "How Does a Turbofan Engine Work? (MTU)" }],
  "1.5": [{ id: "B_p3_9si5D4", title: "The Best Turboprop Explanation (Captain Joe × P&W)" }],
  "1.6": [{ id: "9Gmeqq6ukCQ", title: "Turbojet vs Turbofan vs Turboprop vs Turboshaft" }],
  "1.7": [{ id: "0mmB_BOMWIE", title: "Jet Engine Thrust — First Principles" }],
  "1.8": [{ id: "K68S-gNerso", title: "Thrust Specific Fuel Consumption Explained" }],
  "1.9": [{ id: "buM7MHO9vLE", title: "Thermal, Propulsive & Overall Efficiency" }],
  "1.10": [{ id: "5-AtpO-s--Y", title: "Turbofan Bypass Ratio Explained" }],
  "1.11": [{ id: "sACBRNP9anI", title: "Gas Turbine Engine Performance" }],
  "1.12": [{ id: "HFkN1f4SJSQ", title: "Flat Rating of an Engine" }],

  // ── Unit II · Engine Construction ──
  "2.1": [{ id: "AJXaa3rGBf4", title: "Gas Turbine Engine Air Intake Design" }],
  "2.2": [{ id: "636ANEHgEOo", title: "How a Supersonic Jet Engine Inlet Works" }],
  "2.3": [{ id: "wYXyKF-vuuQ", title: "Centrifugal vs Axial Compressors on Jet Engines" }],
  "2.4": [{ id: "K7R0wzM2y6M", title: "Wing & Engine Anti-Ice Systems (Captain Joe)" }],
  "2.5": [{ id: "XgFhMb7KWU8", title: "Compressor Map — Surge Line & Operating Point" }],
  "2.6": [{ id: "7MYh2KtEUQk", title: "Compressor Stall Explained (Mentour Pilot)" }],
  "2.7": [{ id: "lcC4B0kpBWo", title: "How a Compressor Bleed Valve Works" }],
  "2.8": [{ id: "e3OIq7S8y68", title: "The Combustor — Explained" }],
  "2.9": [{ id: "jCzRRfWMDNg", title: "The Turbine Nozzle — A Closer Look (AgentJayZ)" }],
  "2.10": [{ id: "1tM96B77n0U", title: "The Birth of a Turbine Blade (Safran)" }],
  "2.11": [{ id: "ZVmusVOdcOI", title: "Gas Turbine Exhaust Nozzles" }],
  "2.12": [{ id: "s5EDKCIKll0", title: "Cascade Thrust Reverser Operation" }],

  // ── Unit III · Fuel, Ignition & Starting ──
  "3.1": [{ id: "uh-FxVYUx-k", title: "Engine Fuel Systems (Part 1)" }],
  "3.2": [{ id: "xywtE-qx-hU", title: "Hydromechanical Fuel Control Unit" }],
  "3.3": [{ id: "3Nl11tSz4OE", title: "What is FADEC?" }],
  "3.4": [{ id: "zqeQmlB-DFM", title: "Gas Turbine Fuel System — Overview" }],
  "3.5": [{ id: "7JVRj-sWJOQ", title: "How an Aircraft Jet Engine Starts" }],
  "3.6": [{ id: "8QwXNPB4Frs", title: "Gas Turbine Air Starters" }],
  "3.7": [{ id: "vOPip1zjgns", title: "Ignition Systems" }],
  "3.8": [{ id: "HhEKEpvZ4lo", title: "Turbine Engine Igniters (Champion)" }],
  "3.9": [{ id: "7rz53ZgaWn4", title: "Starting a Turbofan — 737 CFM56-7B" }],
  "3.10": [{ id: "HEM5UP5vmqA", title: "Jet Engine Running — Safety Distances" }],
  "3.11": [{ id: "AdCcbBhondA", title: "How a Jet Engine Works — Starting" }],
  "3.12": [{ id: "6bBAWnbFImI", title: "Hung, Wet & Hot Engine Starts (737 Sim)" }],

  // ── Unit IV · Indication & Power Augmentation ──
  "4.1": [{ id: "WxpMVyTB_B8", title: "What is Exhaust Gas Temperature (EGT)?" }],
  "4.2": [{ id: "bqXohXPw6R0", title: "Engine Thrust Measurement — EPR, N1, EGT, N2" }],
  "4.3": [{ id: "6F8FZeSYsl4", title: "Aircraft Engine Oil System" }],
  "4.4": [{ id: "LI3MrwqC-Dk", title: "EICAS vs ECAM" }],
  "4.5": [{ id: "RcwuWnpzVdE", title: "Single-Spool vs Multi-Spool Engines" }],
  "4.6": [{ id: "fptmRT2VpKQ", title: "Aircraft Engine Vibration Detection" }],
  "4.7": [{ id: "DiyKblUxs-g", title: "Turboprop Torque, ITT, NP & %NG Explained" }],
  "4.8": [{ id: "6Z0CDZ_9cWo", title: "Thrust Augmentation" }],
  "4.9": [{ id: "ZVYM0awvTS4", title: "Water Injection — Restoring Thrust" }],
  "4.10": [{ id: "HeiPmZvO7gg", title: "Water-Methanol Injection" }],
  "4.11": [{ id: "g3awv7eeubA", title: "How an Afterburner Works (Captain Joe)" }],
  "4.12": [{ id: "T5AyvI8f4rU", title: "Reading Engine Indications — N1, EGT, N2, FF" }],

  // ── Unit V · Monitoring & Ground Operation ──
  "5.1": [{ id: "JxfmNCo9ooA", title: "Engine Health Monitoring (Safran)" }],
  "5.2": [{ id: "bpqa-NLNRzY", title: "Max-Thrust Test — GE90-115B" }],
  "5.3": [{ id: "XvJyhI0qInU", title: "Gas Turbine Engine Repair & Overhaul" }],
  "5.4": [{ id: "HEM5UP5vmqA", title: "Jet Engine Running — Safety Distances" }],
  "5.5": [{ id: "Mke9Q4JGTT8", title: "EGT Margin — Why a Good Engine Gets Pulled" }],
  "5.6": [{ id: "_Wt8zSYw-jg", title: "Magnetic Chip Detector — Inspection & Explanation" }],
  "5.7": [{ id: "fptmRT2VpKQ", title: "Aircraft Engine Vibration Detection" }],
  "5.8": [{ id: "67GuA4gJYaw", title: "Inside an Engine — Borescope Inspection" }],
  "5.9": [{ id: "MLhDUPS2RN0", title: "A320 V2500 Engine Borescope Inspection" }],
  "5.10": [{ id: "4-0GOloDhHM", title: "Cyclean Engine Wash (Lufthansa Technik)" }],
  "5.11": [{ id: "1RFgS42vQtM", title: "Foreign Object Damage (FOD) — Why It Matters" }],
  "5.12": [{ id: "JxfmNCo9ooA", title: "Engine Health Monitoring (Safran)" }],
};
