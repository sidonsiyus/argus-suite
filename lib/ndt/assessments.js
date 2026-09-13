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
  "3.1": [
    { q: "Thermography detects subsurface flaws because they…", options: ["Glow in the dark", "Disturb how heat flows to the surface", "Are magnetic", "Emit X-rays"], answer: 1, explain: "A void or delamination changes heat conduction, creating a hot or cold spot on the surface." },
    { q: "A surface property that strongly affects a thermographic result is…", options: ["Conductivity", "Emissivity", "Hardness", "Density"], answer: 1, explain: "Emissivity sets how well a surface radiates infrared; shiny surfaces can read wrongly." },
    { q: "Thermal cameras form an image from a surface's…", options: ["Sound", "Infrared radiation", "Magnetism", "X-rays"], answer: 1, explain: "All bodies radiate infrared by their temperature; the camera maps it." },
  ],
  "3.2": [
    { q: "Liquid crystal thermography is a…", options: ["Non-contact method", "Contact method using colour-changing coatings", "Radiographic method", "Magnetic method"], answer: 1, explain: "Thermochromic coatings contact the surface and change colour with temperature." },
    { q: "A key advantage of infrared cameras is that they…", options: ["Need contact", "Read temperature remotely, over wide areas", "Only work in the dark", "Require magnetism"], answer: 1, explain: "Non-contact IR imaging works at a distance on hot, moving or inaccessible parts." },
    { q: "Liquid crystals are limited by…", options: ["Working only under UV", "A narrow temperature range and needing contact", "Being radioactive", "Only working on steel"], answer: 1, explain: "Each formulation plays colour over a narrow band and must contact the surface." },
  ],
  "3.3": [
    { q: "Liquid-crystal coatings must be…", options: ["Applied thick and uneven", "Applied evenly and calibrated colour-to-temperature", "Magnetised", "Read under UV"], answer: 1, explain: "An even coat and a colour-temperature calibration are essential for a valid map." },
    { q: "Each liquid-crystal formulation changes colour over…", options: ["Any temperature", "A narrow temperature band", "Only below freezing", "Only above 500°C"], answer: 1, explain: "You choose the crystal to bracket the temperatures of interest." },
    { q: "Liquid crystals show only…", options: ["Internal flaws", "Surface temperature", "Magnetic fields", "X-ray density"], answer: 1, explain: "Like all thermography they read the surface, inferring subsurface condition." },
  ],
  "3.4": [
    { q: "An uncooled microbolometer is a…", options: ["Photon detector", "Thermal detector", "Magnetic sensor", "Piezoelectric element"], answer: 1, explain: "Thermal detectors absorb IR and change with the temperature rise — uncooled and robust." },
    { q: "Photon (quantum) detectors offer high sensitivity but require…", options: ["No power", "Cryogenic cooling", "A couplant", "Magnetisation"], answer: 1, explain: "They must be cooled and are more expensive, in return for speed and sensitivity." },
    { q: "Near-room-temperature objects radiate most strongly in the…", options: ["Ultraviolet", "Mid/long-wave infrared", "X-ray band", "Radio band"], answer: 1, explain: "Long-wave IR suits ambient scenes; the waveband is matched to the target." },
  ],
  "3.5": [
    { q: "Active thermography differs from passive in that it…", options: ["Reads existing heat only", "Applies a heat stimulus and watches it dissipate", "Uses magnetism", "Needs a couplant"], answer: 1, explain: "A flash or pulse creates the thermal contrast; flaws disturb the cooling." },
    { q: "Passive thermography is well suited to finding…", options: ["Hidden delaminations", "Naturally hot spots like loose electrical joints", "Internal porosity", "X-ray density"], answer: 1, explain: "It reads temperature differences the part already has." },
    { q: "Modern active thermography analyses…", options: ["A single frame", "How surface temperature evolves over time", "The magnetic field", "The sound echo"], answer: 1, explain: "The cooling sequence, not one snapshot, reveals hidden flaws." },
  ],
  "3.6": [
    { q: "Eddy currents are induced in a conductor by…", options: ["A steady magnet", "A changing (AC) magnetic field", "X-rays", "Heat"], answer: 1, explain: "An AC coil's changing field induces circulating eddy currents." },
    { q: "A flaw is detected in ET because it…", options: ["Emits light", "Diverts the eddy currents and changes the coil's impedance", "Gets hot", "Attracts particles"], answer: 1, explain: "The disturbed eddy currents change the coil impedance — the signal." },
    { q: "Raising the excitation frequency makes the inspection…", options: ["Deeper", "Shallower / more surface-sensitive", "Magnetic", "Slower"], answer: 1, explain: "The skin effect concentrates higher-frequency eddy currents near the surface." },
  ],
  "3.7": [
    { q: "Which probe is best for detecting cracks?", options: ["Absolute", "Differential", "Neither", "Both equally"], answer: 1, explain: "A differential probe compares adjacent regions, responding strongly to abrupt changes like cracks." },
    { q: "Lift-off is…", options: ["A type of crack", "The signal change as the probe rises off the surface", "A magnet", "A couplant"], answer: 1, explain: "It's a key effect to separate from flaw signals — and, calibrated, a thickness gauge." },
    { q: "The impedance-plane display helps by…", options: ["Adding colour", "Separating effects (cracks, lift-off) by signal direction", "Cooling the probe", "Magnetising the part"], answer: 1, explain: "Different effects appear as signals in different directions, aiding interpretation." },
  ],
  "3.8": [
    { q: "An encircling coil is used to inspect…", options: ["Flat plates only", "Bars and tubes through their cross-section", "Composites", "Nothing"], answer: 1, explain: "The part passes through the coil, inspecting the full circumference at speed." },
    { q: "Remote-field eddy current is used to inspect…", options: ["Surface paint", "Tube walls from the inside", "Magnets", "X-ray film"], answer: 1, explain: "It reads the through-wall field to assess wall thickness from inside a tube." },
    { q: "Calibrated lift-off can measure…", options: ["Crack depth", "Non-conductive coating thickness", "Temperature", "Hardness"], answer: 1, explain: "The lift-off signal, calibrated, becomes a coating-thickness gauge." },
  ],
  "3.9": [
    { q: "A fundamental limitation of eddy current testing is that it…", options: ["Needs a couplant", "Works only on conductors, near the surface", "Is very slow", "Only works on composites"], answer: 1, explain: "It requires an electrically conductive material and is shallow (skin effect)." },
    { q: "A strength of ET is that it…", options: ["Sees deep internal flaws", "Is fast, sensitive and needs no couplant", "Works on any material", "Needs no calibration"], answer: 1, explain: "It excels at rapid, sensitive surface-crack detection without a couplant." },
    { q: "ET signals are made reliable by…", options: ["Guessing", "Calibration on reference standards and skilled interpretation", "Heating the part", "Adding dye"], answer: 1, explain: "Reference standards and impedance-plane reading separate flaws from lift-off and edges." },
  ],

  "4.1": [
    { q: "In pulse-echo UT, the depth of a flaw is found from…", options: ["The colour of the echo", "The time the echo takes to return", "The couplant type", "The probe weight"], answer: 1, explain: "Sound speed is known, so echo travel time converts directly to depth." },
    { q: "Ultrasound reflects wherever there is a change in…", options: ["Colour", "Acoustic impedance", "Temperature", "Magnetism"], answer: 1, explain: "Boundaries and flaws reflect sound because acoustic impedance changes there." },
    { q: "Why does UT need a couplant?", options: ["To clean the part", "Air reflects the sound, so a couplant carries it into the metal", "To cool the probe", "To magnetise the part"], answer: 1, explain: "A dry air gap bounces the pulse back; couplant bridges it." },
  ],
  "4.2": [
    { q: "A UT transducer works by the…", options: ["Magnetic effect", "Piezoelectric effect", "Photoelectric effect", "Capillary effect"], answer: 1, explain: "A piezoelectric crystal converts voltage to sound and sound back to voltage." },
    { q: "An immersion probe couples sound through…", options: ["Air", "Water", "A magnet", "Dye"], answer: 1, explain: "The part is inspected underwater for automated, high-resolution scanning." },
    { q: "A dual-element probe improves…", options: ["Deep penetration", "Near-surface resolution", "Magnetisation", "Colour contrast"], answer: 1, explain: "Separate transmit/receive crystals avoid the near-surface dead zone." },
  ],
  "4.3": [
    { q: "Pulse-echo testing needs access to…", options: ["Both sides", "One side only", "No sides", "Three sides"], answer: 1, explain: "One probe sends and receives from the same side and times the echoes." },
    { q: "In through-transmission, a flaw is indicated by…", options: ["A brighter echo", "A drop in the received signal", "A colour change", "More heat"], answer: 1, explain: "A flaw blocks or scatters sound, reducing the through signal." },
    { q: "A back-wall echo confirms…", options: ["The flaw size", "The thickness and good coupling", "The magnetism", "The temperature"], answer: 1, explain: "The reflection from the far surface gives thickness and confirms coupling; its loss can flag a flaw." },
  ],
  "4.4": [
    { q: "A straight (normal) beam is blind to flaws that are…", options: ["Parallel to the surface", "Parallel to the beam direction", "Rounded", "Near the back wall"], answer: 1, explain: "It reflects off flaws facing it; a crack along the beam gives almost no echo." },
    { q: "Angle-beam probes are standard for inspecting…", options: ["Thickness", "Welds", "Colour", "Magnetism"], answer: 1, explain: "The refracted beam reaches weld cracks and lack of fusion the straight beam misses." },
    { q: "An angle beam is created using a…", options: ["Magnet", "Wedge", "Couplant only", "Filter"], answer: 1, explain: "A wedge refracts the sound into the part at the required angle." },
  ],
  "4.5": [
    { q: "An A-scan displays…", options: ["A top-down map", "Echo amplitude vs time (depth)", "A cross-section", "A colour photo"], answer: 1, explain: "It is the basic trace read to detect and size a flaw." },
    { q: "A C-scan gives a…", options: ["Side cross-section", "Top-down plan map of the part", "Single trace", "Temperature map"], answer: 1, explain: "It colour-codes the strongest echo at each position over an area." },
    { q: "A gate in a UT instrument is…", options: ["A physical door", "A depth window that flags/measures echoes", "A couplant", "A magnet"], answer: 1, explain: "Gates watch a chosen depth window for echoes." },
  ],
  "4.6": [
    { q: "A phased-array probe steers its beam by…", options: ["Moving the probe", "Firing elements with timed delays", "Changing couplant", "Heating the part"], answer: 1, explain: "Programmed element timings ('phasing') aim and focus the beam electronically." },
    { q: "A sectorial (S-)scan produces a…", options: ["Single trace", "Live cross-sectional image", "Magnetic map", "Temperature plot"], answer: 1, explain: "Sweeping a fan of angles builds a real-time cross-section." },
    { q: "A big advantage of PAUT over single-probe UT is…", options: ["No electricity needed", "Full-volume coverage and imaging from a fixed probe", "It works on non-metals only", "No calibration"], answer: 1, explain: "Electronic steering covers a weld and images it without moving the probe." },
  ],
  "4.7": [
    { q: "TOFD sizes a crack using…", options: ["Echo amplitude", "The timing of waves diffracted from the crack tips", "Colour", "Magnetism"], answer: 1, explain: "Tip-diffraction arrival times give the crack's through-wall height." },
    { q: "TOFD's sizing is prized because it is largely…", options: ["Colour-dependent", "Independent of amplitude and orientation", "Magnetic", "Temperature-based"], answer: 1, explain: "Time-based sizing avoids the under-sizing that amplitude methods suffer." },
    { q: "TOFD is often paired with pulse-echo/PAUT because…", options: ["It can't detect anything", "They detect and locate; TOFD sizes accurately", "It's cheaper", "It needs no operator"], answer: 1, explain: "The methods cover each other's weaknesses — detection plus accurate sizing." },
  ],
  "4.8": [
    { q: "Acoustic emission is unique among NDT methods because it…", options: ["Sends sound into the part", "Listens to stress waves emitted by the flaw itself", "Uses X-rays", "Uses dye"], answer: 1, explain: "The signal comes from active damage, not an external source." },
    { q: "AE only detects flaws that are…", options: ["Old and stable", "Active / growing under load", "Painted", "Magnetic"], answer: 1, explain: "A crack that isn't growing emits nothing; AE needs the structure stressed." },
    { q: "Which is an AE waveform parameter?", options: ["Emissivity", "Amplitude / counts / energy", "Lift-off", "Density"], answer: 1, explain: "Hits are characterised by amplitude, counts, energy, rise time and duration." },
  ],
  "4.9": [
    { q: "A key strength of AE for large structures is that it…", options: ["Scans inch by inch", "Monitors the whole structure at once under load", "Only works on small parts", "Needs no sensors"], answer: 1, explain: "A sparse sensor array watches an entire vessel or pipeline simultaneously." },
    { q: "AE locates an active source by…", options: ["Its colour", "Comparing arrival times at several sensors", "Its magnetism", "Its temperature"], answer: 1, explain: "Arrival-time differences triangulate the emitting flaw." },
    { q: "After AE flags an active zone, the flaw is usually sized by…", options: ["AE itself", "UT or RT", "Visual only", "Nothing"], answer: 1, explain: "AE is early-warning and location; UT/RT then confirm and measure." },
  ],

  "1.9": [
    { q: "Unaided visual inspection is limited to…", options: ["Internal flaws", "Visible, surface-breaking features", "Sub-surface porosity", "Grain boundaries"], answer: 1, explain: "The naked eye can only see flaws that are visible on the surface." },
    { q: "A borescope is an example of…", options: ["A destructive test", "An aided visual inspection tool", "A radiographic film", "A penetrant"], answer: 1, explain: "Borescopes extend visual reach into cavities — aided visual inspection." },
    { q: "A major human factor limiting visual testing is…", options: ["Excess magnetism", "Operator fatigue and attention", "Skin effect", "Capillary action"], answer: 1, explain: "Fatigue, lighting and attention drive miss rates in visual inspection." },
  ],
};
