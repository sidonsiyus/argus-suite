// Enrichment layer merged into each session: expandable deep-dives, a real
// case file (case study), and a "myth vs fact" interactive. Keyed by session id.
// Shape: { deepDives:[{t,p}], caseStudy:{title,tag,context,challenge,approach,finding,outcome,lesson}, myth:{claim,truth} }

export const EXTRA = {
  /* ═══════════════════════ UNIT I ═══════════════════════ */
  "1.1": {
    deepDives: [
      { t: "The physics, in one line", p: "Every NDT method is just a way of shining some form of energy at a part and watching how a flaw disturbs it — light bouncing off a crack, dye creeping into it, a magnetic field leaking around it, sound echoing from it, or radiation passing through it. Learn to think 'what energy, what disturbance?' and every method makes sense." },
      { t: "Discontinuity vs defect — a distinction that matters", p: "Not every discontinuity is a defect. A rounded pore deep inside a low-stress region may be perfectly acceptable, while the same pore at a stress concentration is a rejectable defect. NDT finds discontinuities; engineering judgement and acceptance criteria decide which are defects. Calling everything a 'defect' leads to needless scrapping of good parts." },
      { t: "Who says how to inspect?", p: "Inspection is governed by codes and standards — ASME, ASTM, ISO, and in aviation the airworthiness authorities (FAA, EASA, DGCA) plus manufacturer maintenance manuals. Personnel are qualified under schemes like ASNT SNT-TC-1A or ISO 9712 (Levels I, II, III). The standard defines the method, acceptance limits and who is allowed to sign off." },
    ],
    caseStudy: {
      title: "Aloha Airlines Flight 243", tag: "1988 · Fuselage failure",
      context: "A 19-year-old Boeing 737 operating short island hops in a warm, salty Hawaiian environment had accumulated an unusually high number of pressurisation cycles — each flight pressurises and depressurises the fuselage like flexing a drink can.",
      challenge: "Multiple small fatigue cracks had initiated at rivet holes along a lap joint and were hidden by paint and structure. Individually tiny, they had linked up (multi-site damage) into a critical crack that visual walk-arounds had not caught.",
      approach: "In cruise the weakened upper fuselage skin failed explosively and a large section tore away. The aircraft landed, but a crew member was lost. Investigators used the wreckage and fleet-wide NDT (eddy current and detailed visual) to map the crack pattern.",
      finding: "The damage was fatigue + corrosion at fastener holes — exactly the surface and near-surface flaws that eddy current and careful visual inspection are designed to detect, but which the existing inspection interval and technique had missed.",
      outcome: "It triggered the FAA's Aging Aircraft Program: mandatory, more frequent NDT inspections of high-cycle fuselage joints, and eddy-current screening of fastener holes across the fleet.",
      lesson: "NDT is not paperwork — it is the barrier between a latent, invisible flaw and catastrophic failure. The right method at the right interval would have found this.",
    },
    myth: { claim: "If a part looks fine, it is fine.", truth: "The most dangerous flaws — fatigue cracks at rivet holes, internal porosity — are invisible to the naked eye. 'Looks fine' is the first check, never the last." },
  },

  "1.2": {
    deepDives: [
      { t: "Why you still need destructive testing", p: "NDT tells you whether a specific part has flaws, but it cannot directly tell you the material's yield strength or fatigue life. Those bulk 'design allowables' come from destructively testing many coupons. So a new alloy is first qualified destructively to set the numbers, and NDT then guarantees every production part matches the qualified material and is flaw-free." },
      { t: "Coverage: the statistics of sampling", p: "Destructive testing is inherently sampling — test 3 bars from a batch of 3,000 and you assume the rest are identical. That assumption fails if the batch is inhomogeneous. NDT closes the gap by inspecting 100%, catching the rogue part that sampling would statistically miss." },
    ],
    caseStudy: {
      title: "Qualifying a titanium fan disc", tag: "Engine · Ti-6Al-4V",
      context: "A jet-engine fan disc spins at enormous speed; a burst disc is uncontained and catastrophic. The manufacturer must both know the material's strength and guarantee every disc is flaw-free.",
      challenge: "Titanium forgings can contain 'hard alpha' inclusions — brittle nitrogen-rich zones that seed fatigue cracks — and these must be found in every single disc, not just a sample.",
      approach: "Destructive testing of forged coupons established the alloy's fatigue and fracture properties (the design allowables). Then every production disc is inspected volumetrically by ultrasonic testing to detect internal inclusions before machining and again after.",
      finding: "Destructive tests set the safe life; NDT (UT) polices each disc against internal defects the destructive tests could never check part-by-part.",
      outcome: "The pairing — destructive qualification plus 100% ultrasonic inspection — is now standard for rotating engine parts, and drove improvements in melt processes to reduce hard-alpha occurrence.",
      lesson: "Destructive and non-destructive testing are partners: one sets the numbers, the other guarantees every part meets them.",
    },
    myth: { claim: "NDT can replace destructive testing entirely.", truth: "NDT finds flaws but doesn't measure bulk strength. You still need destructive tests to establish the material properties NDT then protects." },
  },

  "1.3": {
    deepDives: [
      { t: "A quick method-picker", p: "Surface-breaking crack, any material → Liquid Penetrant. Surface/near-surface crack, steel → Magnetic Particle. Surface crack, conductor, no couplant → Eddy Current. Internal planar flaw or thickness → Ultrasonic. Internal volumetric flaw with a permanent image → Radiography. Anything visible → Visual, always first." },
      { t: "Why 'surface vs volumetric' is the master key", p: "If you remember only one thing, remember this split. It instantly halves your options: a fatigue crack breaking the surface never needs radiography, and internal porosity is invisible to penetrant. Matching the flaw's location to the method's reach is the single most common real-world decision." },
    ],
    caseStudy: {
      title: "Inspecting a welded engine mount", tag: "Airframe · Steel weld",
      context: "A tubular steel engine mount is welded and safety-critical — it carries the engine and must be free of both surface and internal weld defects.",
      challenge: "Welds can hide several defect types at once: surface-breaking toe cracks, internal porosity, slag inclusions and lack of fusion at the root. No single method sees them all.",
      approach: "Inspectors layer methods: visual first for gross defects and profile; magnetic particle for surface and near-surface cracks (the steel is ferromagnetic); and radiography (or UT) for internal porosity, slag and lack of fusion.",
      finding: "MT flagged a fine toe crack invisible to the eye; RT revealed a cluster of root porosity. Neither method alone would have passed the weld safely.",
      outcome: "The weld was repaired and re-inspected. The multi-method plan became the standard weld-inspection routine for the mount.",
      lesson: "Real inspection plans layer methods — surface plus volumetric — because each method sees only part of the picture.",
    },
    myth: { claim: "There's a single best NDT method.", truth: "No method is universally best. The right choice depends on the flaw, material, geometry and access — and serious parts get several methods layered together." },
  },

  "1.4": {
    deepDives: [
      { t: "Planar vs volumetric flaws — and why RT and UT disagree", p: "Radiography sees volumetric flaws (porosity, inclusions) well because they remove enough material to change the X-ray shadow. But a tight planar crack removes almost no volume, so RT can miss it unless the beam is aligned edge-on. Ultrasound is the opposite — it reflects strongly off the flat face of a planar crack. That's why welds often get both." },
      { t: "Process tells you where to look", p: "A skilled inspector reads the manufacturing route first. Cast part? Expect shrinkage and gas porosity near thick sections and feeders. Weld? Expect lack of fusion at the root and cracks at the toe. Forging? Expect laps and bursts along the grain flow. The process narrows the search before a probe touches the part." },
    ],
    caseStudy: {
      title: "Shrinkage in a cast turbine blade", tag: "Casting · Superalloy",
      context: "Turbine blades are precision-cast in nickel superalloy with internal cooling passages. Uneven solidification can leave shrinkage cavities in thick sections.",
      challenge: "A shrinkage cavity deep inside the blade root would not break the surface — invisible to penetrant and to the eye — yet it critically weakens the most highly stressed region.",
      approach: "Every blade is radiographed (and increasingly CT-scanned) to image internal shrinkage and porosity, and penetrant-tested for any surface-breaking flaws around the cooling holes.",
      finding: "RT revealed a shrinkage cavity in the root of one blade that all surface methods had passed. The blade was rejected before it ever entered an engine.",
      outcome: "Foundry gating and cooling were adjusted to reduce shrinkage, and 100% radiographic screening remained the gate before machining.",
      lesson: "Internal defects need volumetric methods — surface inspection alone would have let a critically weakened blade fly.",
    },
    myth: { claim: "If penetrant testing passes, the part is defect-free.", truth: "Penetrant only finds surface-breaking flaws. Internal porosity, shrinkage and inclusions pass it completely — they need RT or UT." },
  },

  "1.5": {
    deepDives: [
      { t: "The signal is the gauge", p: "In characterization the NDT reading itself becomes a measurement. Eddy-current conductivity in %IACS maps directly to alloy and heat-treat condition; ultrasonic velocity maps to elastic modulus; ultrasonic thickness maps to remaining wall. Calibrate against known standards and the instrument stops finding flaws and starts measuring properties." },
      { t: "Trending beats snapshots", p: "One thickness reading tells you today's wall; a series of readings over years tells you the corrosion rate and predicts when it will reach the minimum. Characterization's real power is the trend — spotting slow degradation long before a discrete flaw appears." },
    ],
    caseStudy: {
      title: "Heat damage after a lightning strike", tag: "Aluminium skin · Eddy current",
      context: "An aircraft is struck by lightning. The current can locally overheat aluminium skin, changing its temper and strength without leaving an obvious crack.",
      challenge: "The damage is metallurgical, not a flaw — the metal looks intact but may have been softened. How do you find weakened metal that isn't cracked?",
      approach: "Eddy-current conductivity mapping. Heat-affected aluminium changes its electrical conductivity, so a conductivity survey around the strike point reveals the extent of over-temperature damage.",
      finding: "The conductivity map showed a halo of altered metal around the strike entry — softened material that had to be assessed and, in the worst zone, replaced.",
      outcome: "Conductivity survey is now a standard post-lightning-strike inspection, defining exactly how much skin to repair.",
      lesson: "NDT measures material condition, not just cracks — the eddy-current signal itself becomes a gauge of heat damage.",
    },
    myth: { claim: "NDT only finds cracks and voids.", truth: "Calibrated NDT also measures properties — conductivity, thickness, modulus — turning the signal into a gauge of the material's condition." },
  },

  "1.6": {
    deepDives: [
      { t: "The economics in one comparison", p: "Reactive failure of a part in service can mean an uncontained event, secondary damage, an AOG (aircraft on ground) with lost revenue, and investigation. A scheduled NDT inspection costs a technician's time and some equipment. The ratio is not close — prevention is orders of magnitude cheaper than failure." },
      { t: "Retire-for-cause: keeping good parts flying", p: "Instead of scrapping every part at a fixed life ('safe life'), 'retire-for-cause' uses repeated NDT to keep a part in service until an actual flaw is found. This squeezes far more safe life out of expensive components — only possible because NDT can reliably re-inspect the same part over and over." },
    ],
    caseStudy: {
      title: "Managing a known crack under an AD", tag: "In-service · Ultrasonic monitoring",
      context: "An airworthiness directive identifies a wing-attachment fitting prone to fatigue cracking. Replacing every fitting immediately would ground the fleet.",
      challenge: "Some cracks exist but are sub-critical. How do you keep flying safely without scrapping serviceable structure?",
      approach: "Repeated ultrasonic inspection at a defined interval monitors each fitting. As long as any crack stays below the size that fracture mechanics says is safe, the part keeps flying; the interval guarantees it's re-checked before a crack could grow critical.",
      finding: "Most fittings were sound; a few had small cracks that were tracked and the parts replaced at a planned opportunity, not in an emergency.",
      outcome: "The fleet kept operating safely and economically while the manufacturer developed an improved fitting.",
      lesson: "Because NDT can re-inspect the same part reliably, it turns a fleet-grounding problem into managed, planned maintenance.",
    },
    myth: { claim: "Finding a crack means scrapping the part immediately.", truth: "A sub-critical crack can be monitored by repeat NDT and the part flown safely until a planned replacement — that's the whole basis of damage-tolerant design." },
  },

  "1.7": {
    deepDives: [
      { t: "Probability of Detection (POD)", p: "No method finds 100% of flaws. Reliability is expressed as a POD curve — the chance of finding a flaw versus its size. Inspections are designed around the flaw size that must be found with, say, 90% probability at 95% confidence (a90/95). Below that size, misses are expected, which is why inspection intervals assume some flaws slip through." },
      { t: "Orientation: the silent miss", p: "A crack's angle to the probing energy can matter more than its size. Ultrasound reflects strongly off a crack facing the beam but weakly off one edge-on; radiography sees a crack aligned with the beam but misses it across the beam. Skilled inspectors deliberately choose angles and directions to match the expected flaw orientation." },
    ],
    caseStudy: {
      title: "The crack radiography missed", tag: "Weld · RT vs UT",
      context: "A thick weld was radiographed and passed. Later, an ultrasonic re-inspection under a stricter procedure was ordered.",
      challenge: "Radiography had shown no rejectable indications — yet a planar crack was present. How did a 'passed' weld contain a crack?",
      approach: "The crack was a tight lack-of-fusion flaw lying nearly parallel to the film. It removed almost no volume, so it barely changed the X-ray shadow and fell below RT's detection floor for that orientation. Angle-beam ultrasound, which reflects off the flaw's flat face, found it clearly.",
      finding: "The flaw was real and significant; RT's limitation for tight planar flaws — not operator error — was why it was missed.",
      outcome: "The procedure was changed to require UT (or combined RT+UT) for critical thick welds where planar flaws are credible.",
      lesson: "Every method has blind spots. Knowing them — and layering methods — is what makes inspection trustworthy.",
    },
    myth: { claim: "If a good method passes a part, there are no flaws.", truth: "Each method has a detection floor and orientation blind spots. A tight, awkwardly-oriented crack can pass one method and be obvious to another." },
  },

  "1.8": {
    deepDives: [
      { t: "Four properties, four methods", p: "Ferromagnetism unlocks MT; electrical conductivity unlocks ET; acoustic impedance governs what UT can reflect off; density and atomic number govern RT contrast. Read those four properties for any material and the viable methods almost select themselves." },
      { t: "Why composites break the metal rules", p: "Carbon-fibre composites are non-magnetic and barely conductive, so MT and ET are out. They're layered and anisotropic, so ultrasound behaves differently than in metal. Delaminations (flat separations between plies) are the classic flaw — found by ultrasonic or thermographic methods tuned to the layup, not by the metal-inspection toolkit." },
    ],
    caseStudy: {
      title: "Two parts, two method sets", tag: "Selection · Steel vs composite",
      context: "A maintenance shop must inspect two parts arriving the same day: a steel landing-gear forging and a carbon-fibre control surface.",
      challenge: "The same crack-finding goal, but two completely different materials — the wrong method wastes time or finds nothing.",
      approach: "The steel forging is ferromagnetic → magnetic particle for surface cracks, ultrasonic for internal integrity. The composite is non-magnetic, non-conductive and layered → ultrasonic and thermography for delaminations and disbonds; MT and ET are physically impossible.",
      finding: "MT found a quench crack in the steel forging; a thermographic scan found a small disbond in the composite. Neither method could have done the other's job.",
      outcome: "The shop's method-selection guide is organised by material physics first, defect type second.",
      lesson: "Read the material's physics before choosing a method — it rules options in and out before you start.",
    },
    myth: { claim: "The same NDT method works on any material.", truth: "Physics forbids it — MT needs a ferromagnet, ET needs a conductor. The material's properties decide which methods are even possible." },
  },

  "1.9": {
    deepDives: [
      { t: "Lighting is half the method", p: "Visual testing lives or dies on light. A raking (low-angle) light throws surface relief into shadow and reveals cracks and dents invisible under flat lighting; adequate intensity (measured in lux) is specified in procedures. Change the lighting and you change what an inspector can find — before touching magnification." },
      { t: "The inspector is the instrument", p: "Unlike UT or RT, visual testing has no dial to calibrate except the human. Fatigue, expectation ('I've seen a hundred good ones'), time pressure and distraction all raise the miss rate. This is why serious programmes control search patterns, rest, lighting and independent second looks — managing the human, not just the eyesight." },
    ],
    caseStudy: {
      title: "Borescope find in an engine hot section", tag: "Aided VT · Turbine blade",
      context: "During a routine on-wing engine inspection, a technician runs a video borescope through the ports to view the turbine blades without removing the engine.",
      challenge: "The blades are buried deep inside the engine, in a hot section that would take days to disassemble. A crack there is invisible from outside and impossible to reach by hand.",
      approach: "A flexible video borescope is threaded to each blade stage. Using tip articulation, magnification and measurement, the inspector examines every blade edge and cooling hole and records the images.",
      finding: "A hairline crack at the trailing edge of one turbine blade was spotted and measured on the borescope image — a flaw that would have been invisible without aided visual inspection.",
      outcome: "The engine was scheduled for repair on the operator's terms, avoiding an in-flight failure and an unplanned removal.",
      lesson: "Aided visual inspection reaches where nothing else can without teardown — turning a look into a recorded, measurable examination.",
    },
    myth: { claim: "Visual inspection is basic and low-value.", truth: "It's the first and most-used method, and aided VT (borescopes) inspects engine interiors without teardown — powerful when done deliberately." },
  },
};
