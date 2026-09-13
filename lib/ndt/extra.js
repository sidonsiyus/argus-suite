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

  /* ═══════════════════════ UNIT II ═══════════════════════ */
  "2.1": {
    deepDives: [
      { t: "Capillary action, felt in daily life", p: "The same force that pulls penetrant into a crack pulls coffee up a sugar cube, ink up blotting paper and water up a paper towel. A narrow gap plus a wetting liquid equals suction. In LPT the 'narrow gap' is the crack and the 'wetting liquid' is the penetrant — which is why the liquid's ability to wet the surface matters so much." },
      { t: "Why porous parts are a no-go", p: "Capillary action doesn't distinguish a crack from the millions of tiny pores in a porous casting or unglazed ceramic. Penetrant floods the whole surface, the developer lights up everywhere, and a real crack is lost in the noise. That's the physical reason LPT is limited to non-porous materials." },
    ],
    caseStudy: {
      title: "The un-cleaned weld", tag: "LPT · Field lesson",
      context: "A welded bracket was dye-penetrant inspected in the field. The weld had been ground but not degreased, leaving a film of cutting oil in the surface.",
      challenge: "A fatigue crack ran along the weld toe — but the oil film sat in the crack opening, blocking it.",
      approach: "Penetrant was applied over the oily surface. Capillary action could not pull dye past the oil into the crack, so no penetrant entered the flaw. The part 'passed'.",
      finding: "A re-inspection after proper solvent cleaning showed a clear continuous-line indication along the weld toe — the crack had been there all along.",
      outcome: "The procedure was revised to require verified degreasing and a water-break test before penetrant, and the inspector re-trained on the primacy of cleaning.",
      lesson: "In LPT, cleaning is not a preliminary — it is the inspection. A blocked crack is an invisible crack.",
    },
    myth: { claim: "Applying more penetrant finds more flaws.", truth: "Sensitivity comes from clean, open flaws and correct dwell — not flooding. Excess penetrant just means more to remove and more background noise." },
  },
  "2.2": {
    deepDives: [
      { t: "Sensitivity levels are a real scale", p: "Fluorescent penetrants are graded from low to ultra-high sensitivity. Higher sensitivity finds finer cracks but also lights up more irrelevant surface texture, so you match the level to the criticality of the part — a rotating engine part earns ultra-high sensitivity; a bracket does not." },
      { t: "Why fluorescent wins for critical work", p: "The human eye detects a small glowing green mark against pure black far more readily than a small red mark against a light background. That contrast advantage is why fluorescent penetrant in a dark booth under UV is the standard for the most critical aerospace inspections despite the extra setup." },
    ],
    caseStudy: {
      title: "Choosing a penetrant for turbine blades", tag: "Fluorescent · Aerospace",
      context: "A shop inspects cast turbine blades with fine surface-connected porosity around cooling holes — flaws near the limit of detectability.",
      challenge: "Visible red dye under white light was not reliably showing the finest indications; some blades of concern read ambiguous.",
      approach: "The shop switched to an ultra-high-sensitivity, post-emulsifiable fluorescent penetrant read under UV in a darkened booth, giving far greater contrast and control over removal.",
      finding: "Indications that were invisible under white-light dye now glowed clearly, and marginal blades were correctly rejected.",
      outcome: "Fluorescent post-emulsifiable inspection became the standard for that critical part family.",
      lesson: "Penetrant choice is a sensitivity decision — match the family and grade to the smallest flaw that must be found.",
    },
    myth: { claim: "All penetrants are basically the same red dye.", truth: "They range from simple visible dye to ultra-high-sensitivity fluorescent, with different removal families — each a different sensitivity for a different job." },
  },
  "2.3": {
    deepDives: [
      { t: "The developer is a blotter and a magnifier", p: "Because the developer draws penetrant sideways as it wicks it out, the resulting indication is several times wider than the crack itself. A crack a few microns wide can produce an indication you can see across the room — the developer effectively magnifies the flaw." },
      { t: "Too much of a good thing", p: "A thick developer film buries indications; a patchy one misses them. The target is a thin, even, uniform coat — which is why non-aqueous solvent developers sprayed from an aerosol, drying to a smooth white film, are prized for the most sensitive visible-dye work." },
    ],
    caseStudy: {
      title: "The buried indication", tag: "Developer · Technique",
      context: "During a dye-penetrant inspection, an inspector applied a heavy, uneven coat of solvent developer to 'be sure it was covered'.",
      challenge: "A fine crack had penetrant in it, but the thick white film absorbed the small bleed-out and masked it.",
      approach: "On a supervised re-test, the same part was developed with a thin, even aerosol film and a full developing time was allowed before reading.",
      finding: "A clear red line bled through within a minute — the crack that the heavy coat had hidden.",
      outcome: "The procedure specified a thin even developer film and a minimum developing time before inspection.",
      lesson: "Development is a technique, not a dusting — thin, even, and given time is what reveals weak indications.",
    },
    myth: { claim: "A thicker developer coat gives a clearer result.", truth: "A thick coat buries weak indications. A thin, even film plus adequate developing time is what makes fine flaws readable." },
  },
  "2.4": {
    deepDives: [
      { t: "The one-line summary of LPT's reach", p: "If the flaw breaks the surface and the part isn't porous, LPT can probably find it cheaply. If the flaw is subsurface, or the part is porous or very rough, look elsewhere. That single sentence covers most method-selection decisions involving penetrant." },
      { t: "Why rough surfaces cause false calls", p: "A rough or pitted surface traps penetrant in its texture the way a crack does. After removal, leftover penetrant in the roughness bleeds into the developer and mimics indications — 'false' indications that aren't real flaws, forcing extra cleaning or a different method." },
    ],
    caseStudy: {
      title: "Right flaw, wrong method", tag: "Selection · Casting",
      context: "An inspector was asked to confirm a suspected internal shrinkage cavity in a thick casting using penetrant testing.",
      challenge: "The cavity was internal — it did not break the surface anywhere accessible.",
      approach: "Penetrant testing found nothing, correctly, because there was no surface opening for dye to enter. The part was then radiographed.",
      finding: "Radiography clearly imaged the internal shrinkage cavity that LPT physically could never have detected.",
      outcome: "The inspection plan was corrected: LPT for surface flaws, RT/UT for internal ones — the two used together.",
      lesson: "Knowing a method's limits prevents a false 'all clear' — LPT sees only what breaks the surface.",
    },
    myth: { claim: "A clean LPT result means the part has no flaws at all.", truth: "It means no surface-breaking flaws were found. Internal porosity, shrinkage and inclusions are invisible to penetrant." },
  },
  "2.5": {
    deepDives: [
      { t: "Dwell time is doing invisible work", p: "During the dwell, nothing looks like it's happening — but capillary action is quietly pulling penetrant deep into flaws. Cut the dwell short and shallow or tight cracks never fill, so they never show. The dwell is specified for a reason; patience is part of the method." },
      { t: "The removal knife-edge", p: "Removing excess penetrant is the trickiest step. Over-wash and you rinse penetrant back out of fine flaws (misses); under-wash and background dye hides indications (masking). Controlled, gentle removal — and stopping at the right point — is where skill shows." },
    ],
    caseStudy: {
      title: "Over-washed to a pass", tag: "Procedure · Removal",
      context: "A water-washable fluorescent inspection was run with a strong water spray to 'get the surface really clean' before developing.",
      challenge: "Fine fatigue cracks had penetrant in them — but the aggressive wash pulled the dye back out of the tightest flaws.",
      approach: "A controlled re-inspection used a gentle, timed wash and monitored the background under UV to stop at the right point.",
      finding: "Tight crack indications that the strong wash had emptied now fluoresced clearly.",
      outcome: "The procedure fixed the wash pressure, distance and time, and required checking the background before developing.",
      lesson: "Removal is a controlled step, not a scrub — over-washing empties the very flaws you are trying to find.",
    },
    myth: { claim: "The cleaner you wash the surface, the better the result.", truth: "Over-washing removes penetrant from fine flaws and hides them. Removal must be controlled — clean the surface, not the cracks." },
  },
  "2.6": {
    deepDives: [
      { t: "Why a parallel crack hides", p: "Magnetic flux only leaks where a flaw blocks its path. A crack lying along the field lines barely interrupts them, so almost no field leaks out and few particles gather — the flaw can be invisible. Turn the field 90° and the same crack now blocks the flux and lights up. That's why parts are magnetised in two directions." },
      { t: "MT's edge over penetrant", p: "Because the leakage field extends slightly beyond the metal surface, MT can reveal flaws just below the surface — not only ones that break it. Penetrant, needing an actual surface opening, cannot. On ferromagnetic parts that near-surface reach is a real advantage." },
    ],
    caseStudy: {
      title: "The crack the field missed", tag: "MPT · Orientation",
      context: "A steel shaft was magnetised in one direction and inspected. It passed. A second inspection magnetised it in the perpendicular direction.",
      challenge: "A crack running along the shaft's length lay parallel to the first field, so it produced almost no leakage and no particle build-up.",
      approach: "Re-magnetised with a circular field (current through the shaft), the crack now lay across the flux and leaked strongly.",
      finding: "A clear line of particles formed along the previously-missed longitudinal crack.",
      outcome: "The procedure required magnetization in two perpendicular directions for every such part.",
      lesson: "A flaw parallel to the field can be invisible — always cross the flaw with the field, in more than one direction.",
    },
    myth: { claim: "Magnetic particle testing works on any metal.", truth: "Only ferromagnetic materials (most steels) can carry the flux MT relies on. Aluminium and most stainless steels can't be tested this way." },
  },
  "2.7": {
    deepDives: [
      { t: "Right-hand rule, in practice", p: "Point your thumb along the current and your fingers curl the way the magnetic field loops — that's the circular field of direct magnetization, wrapping around the current path and perfect for finding cracks that run along the part. Flip the geometry (a coil around the part) and you get a field along the axis instead, for cracks that run across it." },
      { t: "Contact burns and why yokes are loved", p: "Passing heavy current through a part via contacts can arc and leave burn marks — a defect in itself. A yoke induces the field with no electrical contact, so there's no arc-burn risk, which (with its portability) is why the yoke is the default for field and weld MT." },
    ],
    caseStudy: {
      title: "Two fields for one weld", tag: "MPT · Technique",
      context: "A structural steel weld had to be inspected for both transverse and longitudinal cracks in the field with a portable kit.",
      challenge: "A single field direction would find one crack orientation and miss the other.",
      approach: "A yoke was applied first across the weld (longitudinal field) to reveal transverse cracks, then rotated 90° along the weld to catch longitudinal cracks — two passes covering both orientations, contact-free.",
      finding: "A transverse toe crack showed on the first orientation; the perpendicular pass confirmed no longitudinal cracking.",
      outcome: "The two-orientation yoke technique became the standard weld-inspection routine.",
      lesson: "Magnetization technique is chosen for flaw orientation — cover all orientations with more than one field direction.",
    },
    myth: { claim: "One magnetization does the whole part.", truth: "One field direction misses flaws parallel to it. Real MT magnetises in at least two perpendicular directions to catch all orientations." },
  },
  "2.8": {
    deepDives: [
      { t: "Wet vs dry, in one line", p: "Dry powder is forgiving on rough surfaces and great in the field; wet suspension carries particles into the tightest flaws for higher sensitivity on smooth, critical parts. Fluorescent grades of either, read under UV, push sensitivity higher still." },
      { t: "Timing is everything: continuous method", p: "Particles have to be present while the leakage field exists. In the continuous method they're applied during magnetization so they're pulled into the leakage field at full strength — more sensitive than relying on a part's weaker residual field afterwards." },
    ],
    caseStudy: {
      title: "Fluorescent bench finds the fine crack", tag: "MPT · Media",
      context: "A critical steel gear was inspected on a wet-bench MT unit using fluorescent particles under UV, after a dry-powder field check had passed it.",
      challenge: "A very fine grinding crack at a tooth root was below what the dry powder on the rough-ish surface had shown.",
      approach: "The wet fluorescent suspension flowed particles into the fine crack during magnetization (continuous method), and UV made the faint indication glow.",
      finding: "A bright fluorescent line appeared at the tooth root — a fine crack the dry check had not resolved.",
      outcome: "Critical gears were routed to fluorescent wet-bench MT rather than dry field inspection.",
      lesson: "Media and method set sensitivity — wet fluorescent particles applied during magnetization find the finest flaws.",
    },
    myth: { claim: "The particles find the flaw on their own.", truth: "The magnetic leakage field finds the flaw; the particles only make it visible — and only if they're present while the part is magnetised." },
  },
  "2.9": {
    deepDives: [
      { t: "Residual magnetism is not harmless", p: "A left-over field quietly attracts iron swarf into bearings, tugs at nearby instruments, and can deflect a welding arc so the next weld goes wrong. For precision and aerospace parts, 'demagnetise and verify' is a required close-out, not an optional tidy-up." },
      { t: "Why AC, decreasing, works", p: "Demagnetization repeatedly flips the material's magnetic domains back and forth while steadily weakening the push, so their net alignment spirals down toward zero. Withdrawing a part slowly from an AC coil, or an electronic decaying-AC cycle, does exactly this." },
    ],
    caseStudy: {
      title: "The bearing that kept failing", tag: "Residual field · Service",
      context: "A shaft that had been magnetic-particle inspected was returned to service without demagnetization. Its bearings began failing prematurely.",
      challenge: "No crack or material fault could be found — the bearings simply kept collecting metallic debris and wearing out.",
      approach: "A field indicator showed the shaft still carried a strong residual magnetic field, which was attracting fine iron particles straight into the bearing races.",
      finding: "Residual magnetism from the MT step — never removed — was the root cause of the debris and wear.",
      outcome: "Demagnetization and a gauss-meter check below the specified limit became a mandatory final step after MT.",
      lesson: "Finish the job: residual magnetism must be removed and verified, or the inspection itself can cause failures.",
    },
    myth: { claim: "Once you've inspected the part, you're done.", truth: "A magnetised part must be demagnetised and verified — left-over magnetism attracts debris and disturbs machining, welding and instruments." },
  },

  /* ═══════════════════════ UNIT III ═══════════════════════ */
  "3.1": {
    deepDives: [
      { t: "Why a void shows up as a hot (or cold) spot", p: "A void or delamination is a poor conductor of heat. In active thermography you flash-heat the surface and film it cooling: over sound material heat drains away into the bulk quickly, but over a void the heat is trapped near the surface, so that patch stays hotter for longer and glows in the image. Reverse the setup (heat from behind) and the void appears cold instead." },
      { t: "Emissivity can fool you", p: "A shiny bolt head next to dull painted metal can look 'hot' in a thermal image even at the same temperature, simply because the shiny surface radiates less and reflects surroundings. Good thermographers correct for emissivity or apply a high-emissivity coating so the camera reads true temperature, not surface finish." },
    ],
    caseStudy: {
      title: "Delamination in a composite panel", tag: "Aerospace · Active thermography",
      context: "A carbon-fibre control surface was suspected of internal delamination after a minor impact, but the surface looked perfect and X-ray showed little.",
      challenge: "A flat delamination between plies removes almost no volume, so radiography struggled to see it, and nothing was visible externally.",
      approach: "Flash active thermography: the panel was pulsed with a bright flash and filmed as it cooled. Sound areas drained heat evenly; the delamination trapped heat near the surface.",
      finding: "A clear warm patch appeared over the delamination in the cooling sequence — mapping its size and location without any contact.",
      outcome: "Thermography became a standard rapid screen for impact damage on composite structures.",
      lesson: "Thermography sees flaws by how they disturb heat flow — ideal for the flat delaminations that defeat other methods.",
    },
    myth: { claim: "A thermal camera measures temperature perfectly, whatever the surface.", truth: "It reads radiation, which depends on emissivity. A shiny surface can read wrongly unless emissivity is corrected or a coating is applied." },
  },
  "3.2": {
    deepDives: [
      { t: "When contact still wins", p: "Liquid crystals give beautiful, high-resolution surface maps for a few dollars, and in a lab or wind tunnel that vivid detail can beat an expensive camera. Contact isn't always a drawback — sometimes it's the cheapest way to see a temperature field in fine detail." },
      { t: "The distance advantage", p: "Because IR cameras read radiation remotely, they inspect things you can't or shouldn't touch — energised switchgear, spinning machinery, a furnace wall — and cover a whole panel in one frame. That reach is why non-contact dominates field thermography." },
    ],
    caseStudy: {
      title: "The overheating connector", tag: "Passive IR · Electrical",
      context: "An electrical panel was surveyed on-line with a handheld infrared camera during a routine condition-monitoring round.",
      challenge: "A loose, high-resistance connection can overheat and fail — but opening every panel to touch every joint is slow and risky while energised.",
      approach: "Non-contact IR camera survey from a safe distance imaged the whole panel's temperature at once.",
      finding: "One connector glowed far hotter than its neighbours — a loose joint developing resistance heating, invisible to the eye.",
      outcome: "The connection was re-torqued at the next planned outage, averting an unplanned failure and possible fire.",
      lesson: "Non-contact thermography inspects energised, hot or moving equipment safely and over wide areas at once.",
    },
    myth: { claim: "You must touch a part to measure its temperature.", truth: "Infrared cameras read a surface's radiation remotely — no contact — which is exactly why they can inspect live and moving equipment." },
  },
  "3.3": {
    deepDives: [
      { t: "Narrow band, by design", p: "Each liquid-crystal formulation 'plays' colour over a narrow temperature window — a few degrees. That's a feature: within the band you get exquisite resolution of small temperature differences. Outside it, the coating is just black. You pick the crystal to bracket the temperatures you care about." },
      { t: "Black backing and even light", p: "Liquid crystals are semi-transparent, so a black backing makes the played colours vivid, and even, glare-free lighting is essential — a reflection can masquerade as a temperature change. Technique, not just chemistry, decides the quality of the map." },
    ],
    caseStudy: {
      title: "Mapping a hot-spot on a circuit board", tag: "Liquid crystal · Electronics",
      context: "An electronics lab needed a fine-detail map of where a dense circuit board was running hot, without an expensive thermal microscope.",
      challenge: "The temperature differences were small and localised, over a tiny area — hard to resolve with a general-purpose IR camera.",
      approach: "A thermochromic liquid-crystal film matched to the expected temperature band was applied over a black backing and photographed under even light.",
      finding: "A vivid colour map pinpointed the hottest component to sub-millimetre detail against the calibration.",
      outcome: "The board layout was revised to spread the heat, and liquid crystals became the lab's cheap high-resolution thermal tool.",
      lesson: "Applied and calibrated well, liquid crystals give high-resolution surface maps at a fraction of a camera's cost.",
    },
    myth: { claim: "Liquid crystals work over any temperature range.", truth: "Each formulation changes colour only over a narrow band. You choose the crystal to match the temperatures of interest." },
  },
  "3.4": {
    deepDives: [
      { t: "Cooled vs uncooled, in one line", p: "Uncooled thermal (microbolometer) cameras are the affordable, robust workhorses — fine for maintenance surveys. Cooled photon-detector cameras are the high-speed, high-sensitivity instruments needed for fast active thermography and demanding research — but they carry a cryogenic cooler and a big price tag." },
      { t: "Waveband matters", p: "Long-wave cameras suit near-room-temperature scenes (most building and electrical work); mid-wave cameras suit hotter targets and some high-speed work. Matching the camera's waveband to the target's temperature is part of getting a clean, sensitive image." },
    ],
    caseStudy: {
      title: "Choosing a camera for flash thermography", tag: "Detectors · Active IR",
      context: "A composites shop wanted to move from spot checks to fast flash active thermography of whole panels.",
      challenge: "Their uncooled maintenance camera was too slow and insensitive to catch the brief thermal transient after a flash before it dissipated.",
      approach: "They evaluated a cooled photon-detector, mid-wave camera with high frame rate and thermal sensitivity, matched to the fast cooling transient.",
      finding: "The cooled camera resolved subtle, fast temperature differences the uncooled unit smeared out — small delaminations now showed clearly.",
      outcome: "The cooled camera was adopted for active thermography; the uncooled one stayed for passive maintenance rounds.",
      lesson: "Detector type drives capability — cooled photon detectors give the speed and sensitivity active thermography needs.",
    },
    myth: { claim: "All thermal cameras are basically equivalent.", truth: "Uncooled thermal detectors are cheap and slow; cooled photon detectors are fast and highly sensitive — very different tools for different jobs." },
  },
  "3.5": {
    deepDives: [
      { t: "Passive vs active, the key split", p: "Passive thermography reads heat the part already has — great for finding things that are supposed to be at a different temperature (hot joints, warm bearings). Active thermography creates the heat difference on purpose with a flash or pulse, so it can reveal hidden structural flaws that are at the same temperature until you stimulate them." },
      { t: "It's the sequence, not the snapshot", p: "Modern active thermography analyses how the surface temperature evolves after the stimulus, frame by frame, not a single image. Flaws reveal themselves by changing the timing of the cooling — techniques like pulse-phase thermography extract them from the whole sequence." },
    ],
    caseStudy: {
      title: "Finding a water-ingress void", tag: "Active IR · Honeycomb",
      context: "A honeycomb sandwich panel was suspected of trapped water and disbonds after service — both invisible externally.",
      challenge: "Water and disbonds change the panel's thermal behaviour subtly and are missed by a single snapshot.",
      approach: "Pulsed active thermography heated the panel and recorded the full cooling sequence, which was processed to enhance the timing anomalies.",
      finding: "Regions of trapped water and disbond showed as clear anomalies in the processed sequence, mapping the damage.",
      outcome: "The technique was added to the maintenance manual for honeycomb inspection.",
      lesson: "Active thermography analyses the cooling sequence, not one frame — that's what reveals hidden structural flaws.",
    },
    myth: { claim: "Thermography just takes a heat picture.", truth: "Active thermography applies a heat pulse and analyses the whole cooling sequence over time — that's how it uncovers hidden delaminations and disbonds." },
  },
  "3.6": {
    deepDives: [
      { t: "No contact chemistry, just fields", p: "Unlike penetrant (which needs clean open flaws) or ultrasonics (which needs a couplant), eddy current works through a thin coating and needs no coupling medium — the coil never has to touch bare metal. That makes it fast and clean, ideal for rapid scanning of many fastener holes." },
      { t: "Frequency is your depth dial", p: "Because eddy currents crowd toward the surface (skin effect), raising the frequency makes the inspection shallower and more surface-sensitive, while lowering it reaches deeper. Choosing the frequency is choosing your depth of interest — a fundamental ET setup decision." },
    ],
    caseStudy: {
      title: "Cracks around fastener holes", tag: "Eddy current · Airframe",
      context: "An aircraft skin has thousands of fastener holes where fatigue cracks initiate — a classic aging-aircraft inspection.",
      challenge: "The cracks are tiny, at the edge of holes, often under paint, and there are far too many holes to inspect slowly.",
      approach: "An eddy-current probe (couplant-free, working through the paint) was scanned around each hole, its impedance signal flagging any crack.",
      finding: "Small edge cracks invisible to the eye produced clear eddy-current signals, and the whole area was screened quickly.",
      outcome: "Eddy-current hole inspection became a routine, fast part of the maintenance program.",
      lesson: "Eddy current is fast, couplant-free and works through coatings — ideal for high-volume surface crack screening on conductors.",
    },
    myth: { claim: "Eddy current works on any material.", truth: "It only works on electrically conductive materials, and only near the surface. Non-conductors and deep flaws are out of reach." },
  },
  "3.7": {
    deepDives: [
      { t: "Differential probes ignore the boring stuff", p: "A differential probe compares two nearby spots, so slow, uniform changes (gradual conductivity drift, gentle lift-off) cancel out and only abrupt changes — like a crack edge — produce a signal. That's why differential probes are the go-to for crack detection, while absolute probes are used when you actually want to measure the slow changes (conductivity, thickness)." },
      { t: "Lift-off: nuisance and tool", p: "Lift-off — the probe rising off the surface — produces a large signal in a characteristic direction on the impedance plane. Operators learn to 'null out' or mentally separate it from crack signals. Turned around and calibrated, that same lift-off signal becomes a coating-thickness gauge." },
    ],
    caseStudy: {
      title: "Reading the impedance plane", tag: "Probes · Interpretation",
      context: "A trainee kept calling cracks on an aluminium part that turned out to be lift-off as the probe rocked on a curved surface.",
      challenge: "Lift-off and a real crack both move the impedance-plane signal — but in different directions the trainee hadn't learned to separate.",
      approach: "On a calibration block with a known crack, the instructor showed how lift-off signals run in one direction and crack signals in another, and how to null lift-off.",
      finding: "Once the signal directions were understood, the false 'cracks' were correctly identified as lift-off, and a genuine crack stood out clearly.",
      outcome: "Interpretation training on reference standards became mandatory before live inspection.",
      lesson: "The impedance plane separates effects by direction — reading it correctly is what turns ET signals into reliable calls.",
    },
    myth: { claim: "Any eddy-current signal means a flaw.", truth: "Lift-off, edges and conductivity all move the signal. The direction and shape on the impedance plane distinguish a real crack from a benign effect." },
  },
  "3.8": {
    deepDives: [
      { t: "Encircling coils test at production speed", p: "Feed a bar or tube through an encircling coil and its whole circumference is inspected continuously as it passes — no scanning a probe around by hand. That's why encircling coils are the backbone of high-speed inspection of tube, bar and wire in the mill." },
      { t: "Remote field: seeing the far wall", p: "Ordinary eddy currents die out in a thick tube wall, but the remote-field technique reads the field that has travelled through the wall and back, so a probe inside the tube can assess the full wall thickness — the standard way to find wall-thinning in heat-exchanger tubes accessible only from inside." },
    ],
    caseStudy: {
      title: "Heat-exchanger tube inspection", tag: "Remote-field ET · Tubes",
      context: "A power-plant heat exchanger has thousands of thin metal tubes that thin from corrosion and erosion over years — accessible only from the inside.",
      challenge: "You cannot get a probe to the outside of the tubes, and standard eddy current can't see through the full wall thickness.",
      approach: "An internal remote-field eddy-current probe was pulled through each tube, reading the through-wall field to assess wall thickness along its length.",
      finding: "Tubes with significant wall loss were identified and mapped, before any leaked.",
      outcome: "The worst tubes were plugged or replaced during the planned outage, avoiding an in-service leak.",
      lesson: "Remote-field ET inspects tube walls from the inside — the right arrangement makes an impossible geometry inspectable.",
    },
    myth: { claim: "Eddy current can only scan a flat surface with a hand probe.", truth: "Encircling coils test bars and tubes through their cross-section, and remote-field probes inspect tube walls from inside — the arrangement is chosen to fit the geometry." },
  },
  "3.9": {
    deepDives: [
      { t: "Fast and sensitive, but shallow", p: "Eddy current beats most methods for speed and for sensitivity to tiny surface cracks, and it needs no couplant. The catch is depth: the skin effect keeps it near the surface, so a deep internal flaw is a job for ultrasonics or radiography, not ET." },
      { t: "Calibrate or guess", p: "Because many effects move the signal, ET is only trustworthy when calibrated on reference standards with known flaws and interpreted by a trained operator. Without that, lift-off and edges generate false calls and real cracks can be dismissed as noise." },
    ],
    caseStudy: {
      title: "The right tool for the wrong depth", tag: "ET limits · Selection",
      context: "An inspector was asked to use eddy current to find a suspected deep internal flaw in a thick aluminium forging.",
      challenge: "The flaw was well below the surface — beyond the shallow reach of eddy currents at any usable frequency.",
      approach: "ET, correctly, found nothing at depth; the part was then inspected ultrasonically, which reaches through the volume.",
      finding: "Ultrasound clearly detected the deep internal flaw that eddy current physically could not reach.",
      outcome: "The procedure reserved ET for surface/near-surface work and UT for depth — playing to each method's strength.",
      lesson: "Know the depth limit: eddy current is a surface method — deep flaws belong to ultrasonics or radiography.",
    },
    myth: { claim: "If eddy current finds nothing, the part is flaw-free.", truth: "ET is shallow. A clean ET result rules out surface/near-surface flaws only — deep internal flaws need UT or RT." },
  },

  /* ═══════════════════════ UNIT IV ═══════════════════════ */
  "4.1": {
    deepDives: [
      { t: "Time is distance", p: "The whole of pulse-echo UT rests on one idea: sound travels at a known, constant speed in a given material, so the time an echo takes to return is a direct measure of how far it travelled. Halve the round-trip time, multiply by the speed, and you have the depth of the flaw. Everything else is refinement." },
      { t: "Why air is the enemy", p: "Sound reflects almost completely at a metal–air boundary, so even a hair-thin air gap between probe and part bounces the pulse straight back and nothing enters. That's why UT always needs a couplant — a gel or water film — to carry the sound across the gap into the metal." },
    ],
    caseStudy: {
      title: "Sizing a crack by echo timing", tag: "Pulse-echo · Weld",
      context: "A thick steel weld showed a suspect indication; the inspector needed to know how deep the flaw sat, not just that it was there.",
      challenge: "Surface methods can't reach an internal weld flaw, and knowing its depth is essential to judge severity.",
      approach: "A pulse-echo probe was placed over the weld. The instrument timed the flaw echo against the known back-wall echo, and the sound speed converted that time into a depth.",
      finding: "The flaw sat mid-wall at a depth calculated from its echo arrival time — accurate enough to assess against acceptance limits.",
      outcome: "The weld was dispositioned on measured depth, not guesswork, and repaired to the correct extent.",
      lesson: "UT turns echo timing into depth — reaching, locating and sizing internal flaws no surface method can touch.",
    },
    myth: { claim: "Ultrasound works fine with the probe just held against dry metal.", truth: "A dry air gap reflects the sound back — nothing enters. UT needs a couplant (gel or water) to carry sound into the part." },
  },
  "4.2": {
    deepDives: [
      { t: "One crystal, two jobs", p: "In pulse-echo the same piezoelectric crystal is the loudspeaker and the microphone: it's pulsed to shout a sound wave into the part, then immediately switched to listen for the whisper coming back. The piezoelectric effect runs both ways, which is why a single probe can send and receive." },
      { t: "Dual-element beats the dead zone", p: "Right after a single crystal pulses, it 'rings', creating a dead zone near the surface where echoes are masked. A dual-element probe uses separate transmit and receive crystals so the receiver isn't blinded by the transmit ring — giving much better near-surface resolution for thin walls and corrosion." },
    ],
    caseStudy: {
      title: "Immersion scanning a turbine disc", tag: "Transducers · Immersion",
      context: "A critical turbine disc needed high-resolution volumetric inspection with a permanent record, far beyond what hand-scanning could give.",
      challenge: "Manual contact scanning is slow, variable, and can't easily produce a clean, repeatable C-scan image of the whole disc.",
      approach: "The disc was inspected in an immersion tank, the sound coupling through water to a scanning transducer moved on a precise mechanical bridge, building a full C-scan.",
      finding: "The immersion C-scan mapped internal indications across the disc at high resolution, with a recordable image for the file.",
      outcome: "Immersion scanning became the standard for that critical rotating part.",
      lesson: "Transducer setup drives capability — immersion coupling gives the automation and resolution critical parts demand.",
    },
    myth: { claim: "You need a separate microphone to hear the echo.", truth: "The same piezoelectric crystal both launches the pulse and receives the echo — voltage makes it move, an echo makes it generate voltage." },
  },
  "4.3": {
    deepDives: [
      { t: "Why pulse-echo won", p: "Through-transmission needs access to both sides and only tells you a flaw is somewhere in the path — no depth. Pulse-echo needs just one side and times each echo, so it locates flaws in depth and gives thickness from the back wall. One-sided access plus depth information is why pulse-echo dominates." },
      { t: "The back wall tells tales", p: "The back-wall echo is a free flaw detector: if it suddenly drops or disappears while you scan, something in between is scattering or blocking the sound — a strong hint of a flaw or heavy attenuation, even before you see a distinct flaw echo." },
    ],
    caseStudy: {
      title: "Lost back-wall echo", tag: "Pulse-echo · Screening",
      context: "During a pulse-echo scan of a plate, the steady back-wall echo suddenly vanished over one region.",
      challenge: "There was no obvious, sharp flaw echo — just the disappearance of the expected back-wall signal.",
      approach: "The inspector treated the loss of back-wall echo as a red flag and worked the area with different angles and gain.",
      finding: "A lamination parallel to the surface was scattering the sound sideways, killing the back-wall echo — a real, significant flaw.",
      outcome: "The laminated region was mapped and rejected.",
      lesson: "In pulse-echo, a lost back-wall echo is itself a flaw indication — read what's missing, not just what appears.",
    },
    myth: { claim: "Through-transmission and pulse-echo are interchangeable.", truth: "Through-transmission needs two sides and gives no depth; pulse-echo needs one side and locates flaws in depth. They answer different questions." },
  },
  "4.4": {
    deepDives: [
      { t: "Beam angle chases the crack", p: "A straight beam sees a lamination beautifully but runs straight past a vertical weld crack. Tilt the beam with a wedge and it can bounce off the far wall and hit that crack side-on. Choosing the angle is choosing which flaw orientation you'll actually reflect off of — orientation is everything in UT." },
      { t: "Skip and half-skip", p: "An angle beam travels in a zig-zag, reflecting off the back wall. The 'half-skip' path hits the weld directly; the 'full-skip' path reaches it after one bounce off the far wall. Inspectors move the probe over specific skip distances to sweep the whole weld cross-section with the angled beam." },
    ],
    caseStudy: {
      title: "The weld crack the straight beam missed", tag: "Angle beam · Weld",
      context: "A butt weld passed a straight-beam scan but was suspect, so an angle-beam inspection was ordered.",
      challenge: "A vertical lack-of-fusion crack in the weld lay along the straight-beam path — almost no reflection came back.",
      approach: "An angle-beam shear-wave probe interrogated the weld from the side, its refracted beam hitting the flat crack face square-on.",
      finding: "A strong angle-beam echo revealed the lack-of-fusion crack the straight beam had run parallel to and missed.",
      outcome: "The weld was rejected and repaired; angle-beam scanning became mandatory for such welds.",
      lesson: "Match the beam angle to the expected flaw orientation — a straight beam alone can pass a serious weld crack.",
    },
    myth: { claim: "A straight-down beam finds every internal flaw.", truth: "It only reflects off flaws facing it. A crack lying along the beam is nearly invisible — that's why angle beams exist." },
  },
  "4.5": {
    deepDives: [
      { t: "A, B, C — three views of one echo set", p: "The same echoes can be shown three ways: the A-scan is the raw amplitude-vs-depth trace you read to detect and size; the B-scan stacks A-scans along a line into a side-view cross-section; the C-scan maps the strongest echo at each x-y position into a top-down picture of flaw extent. Pick the view that answers your question." },
      { t: "Gain and gates, the two big knobs", p: "Gain lifts weak echoes out of the noise (too much and everything saturates); gates are depth windows that automatically flag or measure echoes inside them. Setting gain to a reference reflector and placing gates over the region of interest is the heart of a good UT setup." },
    ],
    caseStudy: {
      title: "C-scan maps a delamination", tag: "Scans · Composite",
      context: "A composite panel had a suspected delamination of unknown size after an impact.",
      challenge: "A single A-scan tells you a flaw is under the probe, but not its overall shape and extent across the panel.",
      approach: "An automated scan collected A-scans across the whole panel and assembled them into a C-scan — a top-down colour map of echo strength.",
      finding: "The C-scan revealed the full footprint of the delamination as a clear coloured region, sizing the damage.",
      outcome: "Repair scope was set directly from the C-scan map.",
      lesson: "The presentation matters: a C-scan turns many A-scans into a picture of a flaw's true extent.",
    },
    myth: { claim: "A-scan, B-scan and C-scan are different machines.", truth: "They're three ways of displaying the same ultrasonic echoes — a trace, a cross-section, and a top-down map." },
  },
  "4.6": {
    deepDives: [
      { t: "Steering with time, not motion", p: "A phased-array probe never moves to aim its beam. By firing its many elements a few billionths of a second apart, the little wavefronts add up in a chosen direction — change the timing and the beam swings to a new angle or focus. It's beam-steering by arithmetic." },
      { t: "A picture, live", p: "Because PAUT sweeps a fan of angles and assembles the echoes, it paints a live cross-sectional (sectorial) image of the weld as you hold the probe still — turning UT from a single flickering trace into an interpretable, recordable picture." },
    ],
    caseStudy: {
      title: "One probe, full weld coverage", tag: "PAUT · Weld",
      context: "A thick pipeline weld needed full-volume inspection quickly, with a permanent record for the client.",
      challenge: "Covering a whole weld cross-section with a single-angle probe means many passes and no easy image.",
      approach: "A phased-array probe swept a fan of angles (a sectorial scan) from a fixed position, imaging the full weld cross-section in real time and recording it.",
      finding: "Flaws showed up in the live sectorial image with their position in the weld clear at a glance, and the whole weld was covered fast.",
      outcome: "PAUT replaced multi-pass single-probe scanning for the project's critical welds.",
      lesson: "Phased array steers and focuses electronically to image a whole weld from a fixed probe — faster, fuller, recordable.",
    },
    myth: { claim: "Phased array needs to physically rock the probe to change angle.", truth: "It changes angle by changing element timing — the beam is steered electronically with no probe motion." },
  },
  "4.7": {
    deepDives: [
      { t: "Sizing by tips, not by loudness", p: "Conventional UT sizes a crack by how loud its echo is — but a badly angled crack echoes weakly and gets under-sized. TOFD instead times the faint waves that diffract from the crack's top and bottom tips; the difference in their arrival times gives the crack height directly, almost regardless of orientation or amplitude." },
      { t: "Detect with one, size with the other", p: "TOFD is superb at sizing through-wall height but has blind zones near the surfaces. So critical welds are often inspected with pulse-echo or PAUT to detect and locate flaws, and TOFD to size them accurately — the methods cover each other's weaknesses." },
    ],
    caseStudy: {
      title: "Accurate crack height for fitness-for-service", tag: "TOFD · Pressure equipment",
      context: "A crack was found in a pressure-vessel weld; the decision to run, repair or replace hinged on its exact through-wall height.",
      challenge: "Amplitude-based sizing was giving inconsistent numbers depending on probe angle — not good enough for a fitness-for-service assessment.",
      approach: "TOFD straddled the weld and timed the diffracted signals from the crack's upper and lower tips to compute its through-wall height directly.",
      finding: "TOFD gave a consistent, accurate crack height, repeatable between operators.",
      outcome: "The vessel was assessed on reliable data and safely returned to service with a monitoring interval.",
      lesson: "TOFD's time-based sizing is accurate and repeatable where amplitude sizing wanders — the right tool to size a crack.",
    },
    myth: { claim: "A bigger echo always means a bigger flaw.", truth: "Echo height depends on orientation, so it can under-size a crack. TOFD sizes by diffraction timing, independent of amplitude." },
  },
  "4.8": {
    deepDives: [
      { t: "The method that only listens", p: "Every other NDT method interrogates the part with an external energy. Acoustic emission does the opposite — it stays silent and listens, because the signal is generated by the flaw itself as it grows. That means AE only reacts to active, propagating damage, not to old, stable flaws." },
      { t: "Load is the trigger", p: "A crack that isn't growing makes no sound. AE therefore needs the structure to be stressed — during a proof test or in service — so that active flaws release their stress-wave bursts. No load, no emission." },
    ],
    caseStudy: {
      title: "Listening to a pressure vessel", tag: "Acoustic emission · Proof test",
      context: "A large pressure vessel was proof-tested after repair; the operator wanted to know if any crack was actively growing under pressure.",
      challenge: "Scanning every inch of a huge vessel is impractical, and a stable old flaw isn't the concern — an active, growing one is.",
      approach: "A sparse array of AE sensors was mounted over the vessel. As pressure was raised, the system listened for emission bursts and recorded their parameters.",
      finding: "A cluster of high-energy emissions appeared from one region as pressure rose — an active flaw announcing itself.",
      outcome: "That zone was then inspected with UT to size the flaw; the rest of the vessel, silent, was cleared.",
      lesson: "AE listens to the whole structure under load and reacts only to active damage — pointing other methods to the spot.",
    },
    myth: { claim: "Acoustic emission finds every flaw in a part.", truth: "AE only detects active, growing flaws that emit stress waves under load. A stable, non-growing flaw stays silent." },
  },
  "4.9": {
    deepDives: [
      { t: "Global, not local", p: "Scanning methods inspect a small footprint at a time; AE watches an entire vessel, tank or pipeline at once from a handful of sensors. That whole-structure coverage is AE's superpower — and why it's used for proof tests and continuous monitoring of large assets." },
      { t: "Find the where, then measure with another method", p: "AE's arrival-time triangulation tells you where damage is active, but not exactly how big it is. The workflow is: AE locates and flags the active zone, then UT or RT goes to that spot to characterise and size the flaw. AE is the early-warning system; the others are the ruler." },
    ],
    caseStudy: {
      title: "Pinpointing damage on a storage tank", tag: "AE · Location",
      context: "A large storage tank floor was suspected of active corrosion cracking, but excavating and scanning the whole floor was hugely expensive.",
      challenge: "You cannot practically scan an entire tank floor — you need to know where to look.",
      approach: "AE sensors around the tank listened during a controlled fill; arrival-time differences triangulated the active emission sources to specific zones.",
      finding: "Emissions localised to a few areas of the floor, which were then targeted for detailed follow-up inspection.",
      outcome: "Only the flagged zones were opened up and repaired, saving enormous inspection cost.",
      lesson: "AE's source location turns 'inspect everything' into 'inspect here' — a global tool that directs the local ones.",
    },
    myth: { claim: "Acoustic emission measures how big a flaw is.", truth: "AE locates and flags active damage in real time; UT or RT is then used to size it. AE is early-warning and location, not sizing." },
  },

  /* ═══════════════════════ UNIT V ═══════════════════════ */
  "5.1": {
    deepDives: [
      { t: "A void is 'missing' material", p: "Radiography sees a void because that path has less material to absorb the beam, so more radiation reaches the film and it darkens there. That's also why a tight crack aligned across the beam can be missed — it removes almost no material along the beam path, so it barely changes the darkness. Alignment matters." },
      { t: "X-ray tube vs gamma source", p: "An X-ray tube can be switched off and its energy tuned by voltage — safer and adjustable, but it needs power. A gamma source (like Ir-192) is a small radioactive pellet that is always emitting, needs no power and reaches tight spots — ideal in the field, but it can't be turned off and demands strict handling." },
    ],
    caseStudy: {
      title: "Porosity in a pipeline weld", tag: "Radiography · Gamma",
      context: "A cross-country pipeline weld had to be inspected on-site, far from any power, for internal porosity and slag before the line went into service.",
      challenge: "The flaws were internal and volumetric — invisible to surface methods — and there was no electricity for an X-ray tube.",
      approach: "A portable gamma source (Ir-192) was positioned inside/around the pipe and film wrapped around the weld; the radiation cast a shadow image of the weld interior.",
      finding: "The developed radiograph clearly showed clusters of porosity and a line of slag as darker spots against the weld image.",
      outcome: "The weld was cut out and re-made, then re-radiographed to acceptance before the line was commissioned.",
      lesson: "Radiography images internal volumetric flaws, and gamma sources bring that capability to the field with no power.",
    },
    myth: { claim: "Radiography reveals every flaw equally well.", truth: "It excels at volumetric flaws (porosity, inclusions) but a tight crack aligned across the beam removes little material and can be missed — orientation matters." },
  },
  "5.2": {
    deepDives: [
      { t: "Why film survived so long", p: "Film gives extraordinary spatial resolution and a permanent, tamper-evident record you can archive for decades — qualities that kept it the code standard long after digital arrived. Its weaknesses are real, though: chemicals, processing time, and a fresh sheet burned on every shot." },
      { t: "CR vs DR, the digital split", p: "Direct digital radiography (DR) uses a flat panel that shows the image in seconds — fast but the panel is bulky and pricey. Computed radiography (CR) keeps a film-like reusable cassette that you scan afterward — more portable and cheaper per shot, at the cost of the scanning step. Field work often prefers CR; production lines prefer DR." },
    ],
    caseStudy: {
      title: "From darkroom to instant image", tag: "Imaging · Digital",
      context: "A fabrication shop ran a film darkroom with hours of processing turnaround, slowing weld sign-off.",
      challenge: "Chemical processing, film cost and turnaround time were bottlenecking production and inspection.",
      approach: "They moved to digital radiography: a flat-panel DR detector for the line and portable CR plates for awkward field welds — both feeding a computer for instant viewing and archiving.",
      finding: "Images appeared in seconds, could be enhanced on screen, and were stored digitally — no chemicals, no darkroom.",
      outcome: "Turnaround collapsed from hours to minutes and per-shot cost fell; film was retained only for a few archival cases.",
      lesson: "Digital radiography keeps the physics and gains speed, processing and storage — film's high resolution now rarely worth its overhead.",
    },
    myth: { claim: "Digital radiography and film are entirely different physics.", truth: "The X-ray physics is identical — only the detector changes. Film records chemically; DR/CR record electronically and instantly." },
  },
  "5.3": {
    deepDives: [
      { t: "Scatter is the enemy of contrast", p: "Radiation that scatters sideways inside the part fogs the film with a general grey haze that washes out real detail. Filters (metal in the beam) and lead screens (against the film) both soak up scatter, which is why a well-filtered, screened radiograph looks crisp while a bare one looks muddy." },
      { t: "Two kinds of screen", p: "Lead screens intensify by emitting electrons and, crucially, absorb scatter — so they sharpen. Fluorescent screens intensify by glowing with light, which is very efficient (short exposures) but the light spreads slightly and softens the image. Sharpness vs speed: pick your screen accordingly." },
    ],
    caseStudy: {
      title: "The muddy radiograph", tag: "Filters & screens · Contrast",
      context: "A thick steel casting produced radiographs so foggy that small flaws couldn't be resolved.",
      challenge: "Heavy scatter from the thick, dense part was fogging the film and destroying contrast.",
      approach: "A copper filter was added to the beam to harden it and cut scatter, and lead intensifying screens were placed against the film to absorb scatter and intensify the image.",
      finding: "Contrast improved dramatically — the fog cleared and fine flaws became visible, with a shorter exposure to boot.",
      outcome: "Filters and lead screens became standard for the thick-casting radiography procedure.",
      lesson: "Filters and screens are not optional extras — they cut scatter and lift the contrast that reveals small flaws.",
    },
    myth: { claim: "Filters and screens just slow the exposure down.", truth: "They cut scatter and intensify the image — improving contrast and sharpness while often allowing a shorter exposure." },
  },
  "5.4": {
    deepDives: [
      { t: "A radiograph is a shadow", p: "Everything about image sharpness follows from shadow geometry. A small light source casts crisp shadows; a big one casts fuzzy ones. So a small focal spot, the part pressed against the film, and a long source-to-film distance all sharpen the radiograph — exactly like getting a crisp hand-shadow on a wall." },
      { t: "Inverse-square cuts both ways", p: "The inverse-square law is why doubling the distance quarters the intensity (so you need 4× the exposure time), and it's also the radiographer's best safety friend: stepping a few metres back slashes the dose. Distance for sharpness costs time; distance for safety saves your dose." },
    ],
    caseStudy: {
      title: "Chasing a sharper image", tag: "Geometry · Unsharpness",
      context: "Fine cracks in a weld were coming out blurred on the radiograph and being missed.",
      challenge: "Geometric unsharpness — edge blur — was smearing the small crack indications below detectability.",
      approach: "The setup was changed: a smaller focal-spot tube was used, the film was placed in tight contact with the part, and the source-to-film distance was increased.",
      finding: "Edge sharpness improved markedly and the fine cracks became clearly visible (at the cost of a longer exposure).",
      outcome: "The improved geometry was written into the procedure for fine-flaw weld radiography.",
      lesson: "Small source, part on film, long distance — shadow geometry decides whether fine flaws are sharp enough to see.",
    },
    myth: { claim: "Where you put the source and film doesn't affect image quality.", truth: "Focal-spot size and source-to-film distance set geometric unsharpness — poor geometry blurs fine flaws out of existence." },
  },
  "5.5": {
    deepDives: [
      { t: "Speed vs detail", p: "Fast films need little exposure but have coarser grain, so they resolve less; fine-grain films see tiny flaws but demand longer exposures. The radiographer trades exposure time against the detail the job needs — critical parts get slow, fine-grain, high-contrast film." },
      { t: "Read the curve's slope", p: "The steepness of the characteristic (H&D) curve is the film's contrast: a steep slope means a tiny difference in thickness (a small flaw) produces a big, visible difference in film darkness. Choosing a high-contrast film and exposing onto the steep part of its curve is how small flaws are made visible." },
    ],
    caseStudy: {
      title: "Landing on the curve", tag: "Film · Characteristic curve",
      context: "Radiographs of a component were coming out either too light or too dark, and marginal flaws weren't reproducible.",
      challenge: "Exposures were landing on the flat, low-contrast toe and shoulder of the film's characteristic curve, where flaws barely register.",
      approach: "Using the H&D curve, exposures were adjusted to place the image density in the steep, high-contrast middle of the curve, on a fine-grain film.",
      finding: "The radiographs now sat in the useful density range with high contrast, and marginal flaws showed consistently.",
      outcome: "Exposure was standardised to the film's optimal density band.",
      lesson: "Film density must land in the steep, high-contrast part of the characteristic curve — that's where small flaws become visible.",
    },
    myth: { claim: "Any properly-developed film shows flaws equally well.", truth: "Only if the density lands in the steep, high-contrast region of its characteristic curve. Too light or too dark, and small flaws vanish." },
  },
  "5.6": {
    deepDives: [
      { t: "The IQI proves the picture, not the part", p: "A penetrameter never finds a flaw — it's a known, standard gauge that proves the radiograph is sensitive enough. If the required IQI wire or hole is visible, you've demonstrated the image could reveal a flaw of that size. No visible IQI feature, no valid radiograph, however clean the part looks." },
      { t: "Charts kill the guesswork", p: "Without an exposure chart, getting the right film density is trial and error — retake after retake. A chart built for your film and setup turns thickness + material into kV and mA·min directly, giving a good film first time and repeatable results across operators." },
    ],
    caseStudy: {
      title: "The radiograph that didn't count", tag: "IQI · Quality",
      context: "A weld radiograph looked clean and was about to be accepted — until the reviewer checked the penetrameter.",
      challenge: "The required IQI wire was not visible on the film, meaning the radiograph's sensitivity was unproven.",
      approach: "Because the IQI feature wasn't resolved, the radiograph was rejected as invalid regardless of how clean the weld looked, and the shot was retaken with corrected exposure until the IQI showed.",
      finding: "On the valid re-shot (IQI now visible), a small flaw that the under-sensitive first film had hidden was revealed.",
      outcome: "IQI verification before acceptance was enforced, and exposure charts tightened to hit sensitivity first time.",
      lesson: "A clean-looking radiograph is worthless if the IQI isn't visible — the penetrameter certifies you could have seen a flaw.",
    },
    myth: { claim: "If a radiograph looks clean, the weld is good.", truth: "Only if the penetrameter proves the required sensitivity. An under-exposed radiograph can look clean and still hide flaws." },
  },
  "5.7": {
    deepDives: [
      { t: "One chart, many metals", p: "Rather than build a separate exposure chart for every material, radiographers use equivalence factors: multiply the part's thickness by its factor to get the equivalent thickness of a reference metal (usually steel), then read the steel chart. Ten millimetres of aluminium 'looks like' only a couple of millimetres of steel to the beam." },
      { t: "High-Z blocks hard", p: "Attenuation climbs steeply with atomic number, so lead and copper block radiation far more than aluminium or magnesium of the same thickness. A high equivalence factor warns you a part will need much more penetration (higher energy or longer exposure) than its thickness alone suggests." },
    ],
    caseStudy: {
      title: "Wrong settings for aluminium", tag: "Equivalence · Exposure",
      context: "An operator used steel exposure settings on an aluminium part of the same thickness and got a badly over-exposed, black film.",
      challenge: "Aluminium attenuates far less than steel, so steel settings dumped far too much radiation through the light part.",
      approach: "Using aluminium's low equivalence factor, the actual thickness was converted to a much smaller equivalent steel thickness, and the exposure chart read for that — far less exposure.",
      finding: "The corrected exposure gave a properly-dense, readable radiograph of the aluminium part.",
      outcome: "Equivalence factors were built into the shop's exposure procedure for non-steel materials.",
      lesson: "Convert to equivalent thickness before choosing exposure — a material's attenuation, not just its thickness, sets the settings.",
    },
    myth: { claim: "Same thickness means same exposure, whatever the metal.", truth: "Attenuation depends on density and atomic number. Aluminium and lead of equal thickness need very different exposures — hence equivalence factors." },
  },
  "5.8": {
    deepDives: [
      { t: "Live vs frozen", p: "Fluoroscopy trades resolution for motion: you watch a live radiographic image and can rotate the part to catch a flaw at the right angle, ideal for fast screening. Film and xeroradiography freeze one high-fidelity exposure. Pick live inspection when you need to move and screen quickly; pick a static exposure when you need the highest resolution and a record." },
      { t: "Xero's edge enhancement", p: "Xeroradiography's electrostatic process naturally sharpens edges, making cracks and boundaries pop against the background — a different look from film's smooth greyscale, useful where edge-defined flaws matter." },
    ],
    caseStudy: {
      title: "Rotating a casting under fluoroscopy", tag: "Fluoroscopy · Real-time",
      context: "A complex cast component needed rapid screening for internal flaws across a whole production batch.",
      challenge: "A tight internal crack only shows when the beam aligns with it — and taking a static film at many angles for every part was far too slow.",
      approach: "Each casting was placed under a real-time fluoroscopy system and rotated live while the inspector watched the moving image for the angle that revealed a flaw.",
      finding: "Flaws that a single fixed-angle film might have missed appeared as the part turned, and the batch was screened quickly.",
      outcome: "Fluoroscopy became the fast first-pass screen, with film used only to document rejects at high resolution.",
      lesson: "Real-time fluoroscopy lets you move the part to find the revealing angle — speed and motion where film would be too slow.",
    },
    myth: { claim: "All radiography produces a single fixed image.", truth: "Fluoroscopy gives a live, moving image you can inspect in real time while rotating the part — not every method makes a static exposure." },
  },
  "5.9": {
    deepDives: [
      { t: "Why CT beats a flat radiograph", p: "A normal radiograph flattens everything along the beam into one shadow, so overlapping features hide each other and you can't tell a flaw's depth. CT takes many views around the part and reconstructs true cross-sections — so it resolves exactly where a flaw sits in three dimensions and measures internal geometry. The price is time and expensive kit." },
      { t: "CR: reusable, portable, digital", p: "Computed radiography keeps a film-like cassette workflow but the plate is reusable and read out digitally — no chemicals, images you can process and store, and portability for the field. It's the practical bridge many shops take from film to fully digital." },
    ],
    caseStudy: {
      title: "CT finds it in 3-D", tag: "Computed tomography · Casting",
      context: "A complex additive-manufactured part had suspected internal porosity, but overlapping features made a flat radiograph impossible to interpret.",
      challenge: "On a 2-D radiograph the internal geometry superimposed, hiding whether porosity was present and exactly where.",
      approach: "The part was CT-scanned: hundreds of projections were taken around it and reconstructed into 3-D cross-sectional slices of the interior.",
      finding: "CT resolved the porosity precisely in three dimensions, giving its exact location, size and depth inside the part.",
      outcome: "The build parameters were corrected, and CT became the acceptance tool for that critical AM part.",
      lesson: "CT reconstructs many views into 3-D — resolving flaw position and internal geometry a flat radiograph can only superimpose.",
    },
    myth: { claim: "A single radiograph tells you exactly where a flaw is in 3-D.", truth: "A flat radiograph superimposes everything along the beam. Only CT, from many views, resolves a flaw's true position in three dimensions." },
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
