// Per-session knowledge checks, keyed by session id. Each: { q, options[], answer(index), explain }.
// Filled unit-by-unit; sessions without an entry show no quiz yet.
export const QUIZ = {
  "1.1": [
    { q: "What best distinguishes non-destructive from destructive testing?", options: ["NDT is always cheaper", "NDT leaves the part fit for service", "NDT only works on metals", "NDT needs no operator"], answer: 1, explain: "NDT inspects the actual part without impairing its future usefulness; destructive testing consumes the sample." },
    { q: "Why is testing especially critical in aviation?", options: ["Parts are cheap to replace", "A single undetected flaw can be catastrophic", "Aircraft never fatigue", "Regulations don't apply"], answer: 1, explain: "Airworthiness depends on catching flaws before they cause failure, so inspection underpins aviation safety." },
    { q: "A tensile test that pulls a bar to failure is an example of…", options: ["Non-destructive testing", "Destructive testing", "Visual inspection", "Eddy current testing"], answer: 1, explain: "It consumes the specimen to measure bulk strength — destructive." },
  ],
  "1.2": [
    { q: "Which is a strength of NDT over destructive testing?", options: ["Measures bulk ductility", "Allows 100% inspection of parts", "Destroys fewer samples but still one per test", "Requires no calibration"], answer: 1, explain: "Because the part survives, every part can be inspected, not just a statistical sample." },
    { q: "Destructive testing is mainly used to…", options: ["Inspect in-service parts", "Qualify a material's bulk properties", "Find surface cracks", "Image internal structure"], answer: 1, explain: "Tensile/impact/hardness tests quantify material properties like strength and toughness." },
  ],
  "1.3": [
    { q: "Which method group finds INTERNAL (volumetric) flaws?", options: ["VT and PT", "MT and ET", "UT and RT", "PT and MT"], answer: 2, explain: "Ultrasonic and Radiography probe through the volume; VT/PT/MT/ET are surface methods." },
    { q: "Liquid Penetrant Testing detects…", options: ["Internal porosity only", "Surface-breaking flaws", "Sub-surface inclusions", "Grain size"], answer: 1, explain: "Penetrant can only enter flaws that break the surface." },
    { q: "Which is NOT one of the classical six NDT methods?", options: ["Eddy Current", "Ultrasonic", "Tensile", "Radiography"], answer: 2, explain: "Tensile testing is destructive; the six are VT, PT, MT, ET, UT, RT." },
  ],
  "1.4": [
    { q: "Weld porosity is most commonly detected by…", options: ["Radiography", "Tensile test", "Hardness test", "Weighing"], answer: 0, explain: "Volumetric porosity in welds shows up as darker spots on a radiograph." },
    { q: "A surface-breaking crack in a non-magnetic part is best found by…", options: ["Magnetic Particle", "Liquid Penetrant", "Radiography", "Nothing works"], answer: 1, explain: "PT works on non-magnetic materials for surface flaws; MT needs a ferromagnetic part." },
  ],
  "1.5": [
    { q: "Material characterization with NDT means…", options: ["Breaking a sample to test it", "Inferring material properties from an NDT response", "Only counting flaws", "Painting the surface"], answer: 1, explain: "Properties like conductivity or modulus are inferred from the measured NDT signal." },
    { q: "Eddy current is often used to characterize…", options: ["Acoustic velocity", "Electrical conductivity / heat treatment", "Film density", "Surface colour"], answer: 1, explain: "Conductivity relates to alloy and heat-treat condition, which eddy current can sort." },
  ],
  "1.6": [
    { q: "A key economic merit of NDT is that…", options: ["Parts are scrapped after testing", "Good parts are reused, not destroyed", "It needs no operator", "It replaces all design"], answer: 1, explain: "Because the part survives inspection, serviceable parts stay in use." },
    { q: "In-service inspection capability means NDT can…", options: ["Only test new parts", "Inspect assembled, operating structures", "Never be repeated", "Work only in a lab"], answer: 1, explain: "Many methods inspect installed, in-service components without disassembly." },
  ],
  "1.7": [
    { q: "A general limitation shared by NDT methods is…", options: ["They give bulk strength directly", "Each has a detection/sensitivity limit", "They never need operators", "They work on any geometry"], answer: 1, explain: "Every method has a smallest reliably-detectable flaw and orientation dependence." },
    { q: "Results of most NDT methods depend heavily on…", options: ["The colour of the part", "Trained, certified operators", "The weather only", "Nothing — fully automatic"], answer: 1, explain: "Operator skill and calibration strongly affect NDT reliability." },
  ],
  "1.8": [
    { q: "Magnetic Particle Testing requires the material to be…", options: ["Transparent", "Ferromagnetic", "Radioactive", "Porous"], answer: 1, explain: "MT relies on magnetising the part, so only ferromagnetic materials qualify." },
    { q: "Which property makes Eddy Current Testing possible?", options: ["Acoustic impedance", "Electrical conductivity", "Optical clarity", "Density alone"], answer: 1, explain: "Eddy currents can only be induced in electrically conductive materials." },
  ],
  "2.1": [
    { q: "What physical force draws penetrant into a surface crack?", options: ["Gravity", "Capillary action", "Magnetism", "Air pressure"], answer: 1, explain: "Capillary attraction between the liquid and the crack walls pulls penetrant in, even against gravity." },
    { q: "Why is pre-cleaning the most critical step in LPT?", options: ["It makes the part shiny", "Contaminants block the flaw so penetrant can't enter", "It removes the developer", "It magnetises the part"], answer: 1, explain: "Oil, rust or paint in the crack opening stop capillary action — the flaw becomes invisible." },
    { q: "LPT can be used on…", options: ["Only ferromagnetic metals", "Any non-porous material", "Only aluminium", "Porous castings"], answer: 1, explain: "It works on metals, ceramics, glass and plastics — anything non-porous, magnetic or not." },
  ],
  "2.2": [
    { q: "Which penetrant type offers the highest sensitivity?", options: ["Visible red dye", "Fluorescent under UV", "Water only", "Chalk"], answer: 1, explain: "Fluorescent penetrant glows under UV against a black background — far higher contrast for fine flaws." },
    { q: "A low viscosity helps a penetrant to…", options: ["Dry faster", "Flow into fine flaws", "Glow brighter", "Resist washing"], answer: 1, explain: "Low viscosity lets the liquid flow and penetrate narrow cracks." },
    { q: "Post-emulsifiable penetrants are known for…", options: ["Lowest cost", "Highest sensitivity with a separate emulsifier step", "No cleaning needed", "Working on porous parts"], answer: 1, explain: "An added emulsifier gives tight control of removal and the highest sensitivity." },
  ],
  "2.3": [
    { q: "The main job of the developer is to…", options: ["Clean the surface", "Draw penetrant out of the flaw and magnify it", "Add colour to the penetrant", "Demagnetise the part"], answer: 1, explain: "It blots trapped penetrant back out and spreads it into a wider, visible indication." },
    { q: "Which developer generally gives the highest sensitivity for visible dye?", options: ["Dry powder", "Water-soluble", "Non-aqueous (solvent)", "No developer"], answer: 2, explain: "Solvent-based non-aqueous developer forms a very even white film — most sensitive for dye work." },
    { q: "Applying too thick a developer film…", options: ["Improves contrast", "Can bury and hide weak indications", "Speeds up dwell", "Is always best"], answer: 1, explain: "A heavy film absorbs small bleed-outs and masks fine flaws — thin and even is the goal." },
  ],
  "2.4": [
    { q: "The fundamental limitation of LPT is that it detects…", options: ["Only internal flaws", "Only surface-breaking flaws", "Only in steel", "Only large flaws"], answer: 1, explain: "Penetrant can only enter flaws open to the surface; subsurface flaws are invisible." },
    { q: "LPT is unsuitable for…", options: ["Aluminium", "Porous materials", "Welds", "Titanium"], answer: 1, explain: "Porous materials soak up penetrant everywhere, masking real indications." },
    { q: "A key advantage of LPT over magnetic particle testing is that it…", options: ["Finds internal flaws", "Works on non-magnetic materials", "Needs no cleaning", "Is faster"], answer: 1, explain: "LPT works on any non-porous material, including the non-magnetic ones MT can't test." },
  ],
  "2.5": [
    { q: "What is the correct LPT step order?", options: ["Develop → clean → penetrant → inspect", "Clean → penetrant → dwell → remove excess → develop → inspect", "Penetrant → inspect → clean", "Remove → develop → penetrant"], answer: 1, explain: "Clean, apply penetrant, dwell, remove excess, develop, then inspect." },
    { q: "A continuous straight-line indication most likely means a…", options: ["Rounded pore", "Crack or cold shut", "Clean surface", "Fingerprint"], answer: 1, explain: "A continuous line is characteristic of a crack or cold shut." },
    { q: "Over-washing during excess removal can…", options: ["Improve sensitivity", "Empty penetrant from fine flaws and cause misses", "Speed developing", "Add contrast"], answer: 1, explain: "Aggressive washing pulls penetrant back out of tight flaws so they never show." },
  ],
  "2.6": [
    { q: "MPT can only be used on materials that are…", options: ["Transparent", "Ferromagnetic", "Non-metallic", "Radioactive"], answer: 1, explain: "It relies on carrying magnetic flux, so only ferromagnetic materials qualify." },
    { q: "A surface crack is revealed in MPT because it…", options: ["Glows under UV", "Creates a leakage field that attracts particles", "Absorbs dye", "Emits sound"], answer: 1, explain: "The flaw forces flux out of the surface; that leakage field gathers magnetic particles." },
    { q: "A crack lying parallel to the magnetic field will…", options: ["Show most strongly", "Be poorly detected or missed", "Demagnetise the part", "Glow green"], answer: 1, explain: "It barely interrupts the flux, so little leaks — which is why parts are magnetised in two directions." },
  ],
  "2.7": [
    { q: "Direct magnetization (current through the part) creates a…", options: ["Longitudinal field", "Circular field around the current path", "Radioactive field", "No field"], answer: 1, explain: "Current produces a circular field, ideal for longitudinal cracks." },
    { q: "A yoke produces which field between its poles?", options: ["Circular", "Longitudinal", "Random", "None"], answer: 1, explain: "The C-shaped yoke drives a longitudinal field, finding cracks transverse to the pole line." },
    { q: "Why is the yoke popular for field inspection?", options: ["It's radioactive", "Portable and needs no electrical contact (no arc burns)", "It finds internal flaws", "It needs no operator"], answer: 1, explain: "No current passes through the part, so there's no arc-burn risk, and it's portable." },
  ],
  "2.8": [
    { q: "For best sensitivity, magnetic particles should be applied…", options: ["Long after magnetising", "While the part is magnetised (continuous method)", "Before cleaning", "Never"], answer: 1, explain: "Particles must be present while the leakage field exists so they gather at flaws." },
    { q: "Wet magnetic particle suspension is generally chosen for…", options: ["Rough field surfaces", "Higher sensitivity to fine flaws", "Non-magnetic parts", "Demagnetising"], answer: 1, explain: "The liquid carries particles into the finest flaws for higher sensitivity." },
    { q: "Compared with penetrant, MPT can additionally reveal…", options: ["Deep internal flaws", "Slightly sub-surface flaws", "Colour changes", "Nothing extra"], answer: 1, explain: "The leakage field extends a little below the surface, so near-surface flaws show too." },
  ],
  "2.9": [
    { q: "Why must many parts be demagnetised after MT?", options: ["To add colour", "Residual magnetism attracts debris and disturbs machining/instruments", "To clean them", "To make them magnetic"], answer: 1, explain: "Leftover magnetism pulls in iron debris and disturbs welding, machining and instruments." },
    { q: "Demagnetization is usually achieved by applying a…", options: ["Steady DC field", "Reversing field of decreasing amplitude (AC)", "Coat of paint", "Penetrant"], answer: 1, explain: "Repeated reversals of decreasing strength drive the net magnetism toward zero." },
    { q: "Residual magnetic field is measured with a…", options: ["Thermometer", "Gauss meter / field indicator", "Micrometer", "Stopwatch"], answer: 1, explain: "A gauss meter checks residual field against the specified limit." },
  ],
  "1.9": [
    { q: "Unaided visual inspection is limited to…", options: ["Internal flaws", "Visible, surface-breaking features", "Sub-surface porosity", "Grain boundaries"], answer: 1, explain: "The naked eye can only see flaws that are visible on the surface." },
    { q: "A borescope is an example of…", options: ["A destructive test", "An aided visual inspection tool", "A radiographic film", "A penetrant"], answer: 1, explain: "Borescopes extend visual reach into cavities — aided visual inspection." },
    { q: "A major human factor limiting visual testing is…", options: ["Excess magnetism", "Operator fatigue and attention", "Skin effect", "Capillary action"], answer: 1, explain: "Fatigue, lighting and attention drive miss rates in visual inspection." },
  ],
};
