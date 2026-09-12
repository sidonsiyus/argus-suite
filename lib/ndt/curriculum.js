// NDT Learning Bay — curriculum data (single source of truth).
// 5 units × 9 sessions = 45. Content transcribed from the lesson plan
// "NDT LP MH New R24 v2.0" (24MBAV31 · B.Sc Aviation · Sem III).
// Each session: { id, n, title, method, summary, points[], objectives(unit),
//   visual (component key in app/ndt/visuals), videos[] (YouTube), quiz[] }.

export const COURSE = {
  code: "24MBAV31",
  title: "Non-Destructive Testing",
  program: "B.Sc Aviation · Semester III",
  instructor: "Umakarthika V",
  hours: 45,
  books: [
    "Baldev Raj, Thavasimuthu & Jayakumar — Practical Non-Destructive Testing (Narosa, 2020)",
    "Ravi Prakash — Non-Destructive Testing Techniques (New Age Intl., 2019)",
    "ASM Metals Handbook Vol. 17 — NDE & Quality Control",
    "ASNT NDT Handbook (Vols. 1–7)",
    "Paul E. Mix — Introduction to Non-Destructive Testing (Wiley, 2021)",
  ],
};

export const UNITS = [
  /* ═══════════════════════ UNIT I ═══════════════════════ */
  {
    id: 1, code: "I", title: "Overview of NDT", accent: "#3b82f6", accent2: "#60a5fa",
    tag: "Foundations", icon: "◎",
    blurb: "What testing means in engineering, how NDT differs from destructive testing, the family of methods, and where each fits.",
    objectives: [
      "Compare and contrast NDT and mechanical testing",
      "Identify and describe various NDT methods",
      "Evaluate the merits and limitations of NDT methods",
      "Explain physical characteristics of materials",
      "Demonstrate visual inspection methods",
    ],
    sessions: [
      { id: "1.1", n: 1, title: "Introduction to Testing Methods", method: "Foundations", visual: "IntroTesting",
        summary: "Why we test engineering components at all, why it matters most in aviation, and the first great split — destructive versus non-destructive.",
        points: [
          { t: "Definition of testing in engineering", d: "Testing is the controlled evaluation of a material or component to confirm it meets design, safety and quality requirements before and during service." },
          { t: "Importance in aviation & industry", d: "In aviation a single undetected flaw can be catastrophic, so inspection underpins airworthiness, maintenance and certification." },
          { t: "Classification: destructive vs non-destructive", d: "Destructive tests consume the sample to measure properties; non-destructive tests inspect the actual part and leave it fit for service." },
        ] },
      { id: "1.2", n: 2, title: "NDT versus Mechanical Testing", method: "Comparison", visual: "NdtVsMech",
        summary: "Destructive mechanical tests measure bulk properties by breaking a sample; NDT reveals flaws in the real part without harming it.",
        points: [
          { t: "Principles of mechanical (destructive) testing", d: "Tensile, hardness, impact and fatigue tests load a specimen to failure to quantify strength, ductility and toughness." },
          { t: "Principles of non-destructive testing", d: "NDT uses a probing energy — light, dye, magnetism, sound, radiation — that interacts with defects but not with the part's integrity." },
          { t: "Comparative analysis", d: "Destructive = sample-based, one-shot, bulk properties. NDT = part-based, repeatable, flaw-focused, enabling 100% inspection." },
        ] },
      { id: "1.3", n: 3, title: "Overview of NDT Methods", method: "Method map", visual: "MethodMap",
        summary: "The six classical methods and how they split into surface techniques and volumetric techniques.",
        points: [
          { t: "Classification of NDT methods", d: "The core six: Visual (VT), Liquid Penetrant (PT), Magnetic Particle (MT), Eddy Current (ET), Ultrasonic (UT), Radiography (RT)." },
          { t: "Surface vs volumetric techniques", d: "VT/PT/MT/ET find surface & near-surface flaws; UT/RT probe through the volume to find internal defects." },
          { t: "Applications across industries", d: "Aerospace, power, oil & gas, rail, automotive and civil structures each lean on different method mixes." },
        ] },
      { id: "1.4", n: 4, title: "NDT for Manufacturing Defects", method: "Defects", visual: "DefectGallery",
        summary: "The defects that arise in welds, castings and forgings — and which NDT methods catch them, surface or subsurface.",
        points: [
          { t: "Common manufacturing defects", d: "Porosity, inclusions, cracks, laps, laminations, lack of fusion and shrinkage cavities." },
          { t: "Surface vs subsurface detection", d: "Surface flaws suit PT/MT/VT; subsurface flaws need UT/RT/ET depending on material and depth." },
          { t: "Case studies: welds, castings, forgings", d: "Weld porosity by RT, casting shrinkage by RT/UT, forging laps by MT — method chosen to defect type." },
        ] },
      { id: "1.5", n: 5, title: "NDT for Material Characterization", method: "Characterization", visual: "MaterialChar",
        summary: "Beyond flaw detection — NDT can measure properties: conductivity, thickness, hardness, microstructure and residual stress.",
        points: [
          { t: "Concept of material characterization", d: "Inferring material properties and condition from a measured NDT response rather than from a broken specimen." },
          { t: "NDT techniques for material properties", d: "Eddy current for conductivity/heat-treat, ultrasonic velocity for elastic modulus, backscatter for density." },
          { t: "Importance in life-cycle monitoring", d: "Tracking property drift (creep, fatigue, corrosion) keeps ageing assets safe in service." },
        ] },
      { id: "1.6", n: 6, title: "Merits of NDT", method: "Merits", visual: "MeritsScale",
        summary: "Why industry invests in NDT: economics, in-service inspection, and the safety/regulatory case.",
        points: [
          { t: "Economic & operational benefits", d: "Parts are reused not scrapped, downtime is planned, and failures are prevented rather than repaired." },
          { t: "Real-time & in-service inspection", d: "Many methods inspect assembled, operating structures without disassembly." },
          { t: "Regulatory & safety advantages", d: "NDT evidence supports airworthiness directives, codes and certification." },
        ] },
      { id: "1.7", n: 7, title: "Limitations of NDT", method: "Limits", visual: "LimitsRadar",
        summary: "Every method has a floor — detection limits, geometry and material constraints, operator skill and cost.",
        points: [
          { t: "Sensitivity & detection limits", d: "Each method has a smallest reliably-detectable flaw size and orientation dependence." },
          { t: "Material & geometry constraints", d: "Access, thickness, surface finish and material type rule methods in or out." },
          { t: "Operator skill & equipment cost", d: "Results depend on trained, certified operators and calibrated, sometimes costly, kit." },
        ] },
      { id: "1.8", n: 8, title: "Physical Characteristics of Materials", method: "Material physics", visual: "MaterialProps",
        summary: "The material properties — magnetic, electrical, acoustic, density — that decide which method will work.",
        points: [
          { t: "Material properties relevant to NDT", d: "Ferromagnetism (MT), conductivity (ET), acoustic impedance (UT), density/atomic number (RT)." },
          { t: "Influence on method selection", d: "A non-magnetic, non-conductive part rules out MT and ET; method choice follows physics." },
          { t: "Practical examples in aviation alloys", d: "Aluminium, titanium and steel alloys each pair with different preferred methods." },
        ] },
      { id: "1.9", n: 9, title: "Visual Inspection Techniques", method: "Visual (VT)", visual: "VisualInspect",
        summary: "The oldest and most-used method — direct and aided visual inspection, and the human factors that limit it.",
        points: [
          { t: "Unaided (direct) visual inspection", d: "The naked eye with good lighting and viewing angle — the first line of every inspection." },
          { t: "Aided visual inspection", d: "Magnifiers, borescopes, mirrors and cameras extend reach into cavities and small features." },
          { t: "Limitations & human factors", d: "Only surface-breaking, visible flaws; fatigue, lighting and attention drive miss rates." },
        ] },
    ],
  },

  /* ═══════════════════════ UNIT II ═══════════════════════ */
  {
    id: 2, code: "II", title: "Surface NDE Methods", accent: "#f59e0b", accent2: "#fbbf24",
    tag: "LPT & MPT", icon: "◐",
    blurb: "Two workhorse surface methods — liquid penetrant testing by capillary action, and magnetic particle testing by leakage fields.",
    objectives: [
      "Understand the principles, types and properties of Liquid Penetrant Testing",
      "Evaluate the advantages and limitations of Liquid Penetrant Testing",
      "Learn the theory and application of Magnetic Particle Testing",
      "Understand magnetization and demagnetization techniques in MPT",
      "Interpret and evaluate test indications in LPT and MPT",
    ],
    sessions: [
      { id: "2.1", n: 1, title: "Introduction to Liquid Penetrant Testing", method: "LPT", visual: "LptIntro",
        summary: "LPT finds surface-breaking cracks by drawing a coloured liquid into them by capillary action — after scrupulous cleaning.",
        points: [
          { t: "Overview of LPT", d: "Definition, purpose and industrial significance of penetrant testing." },
          { t: "Principles of LPT", d: "Capillary action pulls penetrant into surface-breaking cracks; a developer draws it back out to form an indication." },
          { t: "Importance of pre-cleaning", d: "Contaminants block capillary action, so cleaning before penetrant application is essential." },
        ] },
      { id: "2.2", n: 2, title: "Types & Properties of Penetrants", method: "LPT", visual: "PenetrantProps",
        summary: "What makes a good penetrant — viscosity, surface tension, wettability — and the visible vs fluorescent, solvent vs water families.",
        points: [
          { t: "Properties of penetrants", d: "Viscosity, surface tension and spreadability control how well liquid enters a flaw." },
          { t: "Classes of penetrants", d: "Visible (dye) and fluorescent penetrants, in decreasing sensitivity grades." },
          { t: "Solvent- vs water-based", d: "Removal method (solvent-removable, water-washable, post-emulsifiable) and their applications." },
        ] },
      { id: "2.3", n: 3, title: "Developers in LPT", method: "LPT", visual: "Developer",
        summary: "The developer is the blotter that pulls trapped penetrant back to the surface and spreads it into a visible indication.",
        points: [
          { t: "Purpose of developers", d: "Developers draw penetrant out of the flaw and increase contrast for detection." },
          { t: "Types of developers", d: "Dry powder, water-suspendable, water-soluble and solvent-based (non-aqueous) developers." },
          { t: "Penetrant–developer interaction", d: "Correct dwell and even developer film give the best, most legible indications." },
        ] },
      { id: "2.4", n: 4, title: "Advantages & Limitations of LPT", method: "LPT", visual: "LptProsCons",
        summary: "LPT is cheap, simple and works on most non-porous materials — but only finds surface-breaking flaws and needs clean, careful work.",
        points: [
          { t: "Advantages of LPT", d: "Low cost, simple, portable, works on complex shapes and most non-porous materials." },
          { t: "Limitations of LPT", d: "Surface-breaking flaws only; sensitive to cleaning; unsuitable for porous or very rough surfaces." },
          { t: "Where to use it effectively", d: "Weld toes, machined surfaces, castings — where flaws break the surface." },
        ] },
      { id: "2.5", n: 5, title: "LPT Testing Procedure", method: "LPT", visual: "LptProcedure",
        summary: "The six-step sequence: pre-clean → apply penetrant → dwell → remove excess → develop → inspect (and post-clean).",
        points: [
          { t: "Steps in LPT", d: "Pre-clean, apply penetrant, dwell time, remove excess, apply developer, inspect under correct light." },
          { t: "Practical demonstration", d: "Preparing and testing a sample with visible penetrants, start to finish." },
          { t: "Reading indications", d: "Continuous, intermittent, round and dispersed indications and what they imply." },
        ] },
      { id: "2.6", n: 6, title: "Introduction to Magnetic Particle Testing", method: "MPT", visual: "MptIntro",
        summary: "Magnetise a ferromagnetic part and a surface crack leaks a tiny field that gathers iron particles — a visible flaw signature.",
        points: [
          { t: "Theory of magnetism", d: "Magnetic fields, flux and how ferromagnetic materials concentrate field lines." },
          { t: "Principles of MPT", d: "A surface or near-surface flaw distorts the field and creates a leakage field that attracts particles." },
          { t: "Field types & material requirements", d: "Longitudinal and circular fields; only ferromagnetic materials can be tested." },
        ] },
      { id: "2.7", n: 7, title: "Magnetization Methods in MPT", method: "MPT", visual: "Magnetization",
        summary: "Direct vs indirect magnetization, and the practical yoke and coil techniques that set field direction relative to the flaw.",
        points: [
          { t: "Magnetization techniques", d: "Field direction must cross the expected flaw — flaws parallel to the field are missed." },
          { t: "Direct vs indirect magnetization", d: "Direct passes current through the part; indirect induces a field with a yoke or coil." },
          { t: "Yoke & coil methods", d: "Yoke gives a longitudinal field for transverse cracks; coil magnetises long axial parts." },
        ] },
      { id: "2.8", n: 8, title: "Inspection Materials & Method", method: "MPT", visual: "MptParticles",
        summary: "Wet and dry magnetic particles, fluorescent or visible, applied so they migrate to and outline leakage fields.",
        points: [
          { t: "Types of magnetic particles", d: "Dry powders and wet suspensions; visible and fluorescent, chosen for surface and sensitivity." },
          { t: "Application & detection", d: "Particles are applied while magnetised so they gather at leakage fields." },
          { t: "Surface & sub-surface defects", d: "MPT finds surface and slightly sub-surface flaws in ferromagnetic parts." },
        ] },
      { id: "2.9", n: 9, title: "Demagnetization & Residual Magnetism", method: "MPT", visual: "Demag",
        summary: "After testing, residual magnetism must be removed or it attracts debris and disturbs machining, welding and instruments.",
        points: [
          { t: "Principles of demagnetization", d: "Reversing and decaying an AC field drives residual magnetism back toward zero." },
          { t: "Methods of demagnetization", d: "AC coil withdrawal, decaying AC, and heating above the Curie point." },
          { t: "Residual magnetism", d: "Its impact on MPT results and downstream operations, and how to verify it is gone." },
        ] },
    ],
  },

  /* ═══════════════════════ UNIT III ═══════════════════════ */
  {
    id: 3, code: "III", title: "Thermography & Eddy Current", accent: "#ef4444", accent2: "#fb923c",
    tag: "IR & ET", icon: "◑",
    blurb: "Heat-based imaging of flaws by their thermal signature, and induced eddy currents that reveal cracks, conductivity and coatings.",
    objectives: [
      "Understand the principles of Thermography and its methods",
      "Evaluate the advantages and limitations of Thermography",
      "Learn the generation and properties of eddy currents",
      "Understand the components and applications of Eddy Current Testing",
      "Interpret and evaluate results from Thermography and Eddy Current Testing",
    ],
    sessions: [
      { id: "3.1", n: 1, title: "Thermography — Principles", method: "IR", visual: "ThermoPrinciple",
        summary: "Flaws change how heat flows through a part; an infrared image of the surface temperature reveals them.",
        points: [
          { t: "Concept of thermal imaging", d: "Mapping surface temperature to reveal subsurface features that disturb heat flow." },
          { t: "Heat transfer & infrared basics", d: "Conduction, convection and radiation; all bodies emit IR by their temperature." },
        ] },
      { id: "3.2", n: 2, title: "Contact & Non-contact Methods", method: "IR", visual: "ContactNonContact",
        summary: "Liquid-crystal coatings change colour with temperature (contact); infrared cameras read temperature from a distance (non-contact).",
        points: [
          { t: "Contact — liquid crystal thermography", d: "Thermochromic coatings map temperature by colour, in direct contact with the surface." },
          { t: "Non-contact — infrared cameras", d: "IR cameras image the temperature field remotely, quickly and over large areas." },
        ] },
      { id: "3.3", n: 3, title: "Applying Liquid Crystals", method: "IR", visual: "LiquidCrystal",
        summary: "How thermochromic liquid-crystal coatings are applied, calibrated to a colour–temperature scale, and read.",
        points: [
          { t: "Coating techniques", d: "Spraying or filming thermochromic liquid crystals evenly onto the surface." },
          { t: "Calibration & visualization", d: "Mapping colour to temperature against a reference scale." },
          { t: "Advantages & limitations", d: "Cheap and vivid, but narrow range and surface-only." },
        ] },
      { id: "3.4", n: 4, title: "IR Radiation & Detectors", method: "IR", visual: "IrDetectors",
        summary: "The infrared spectrum — near, mid, far — and the thermal and photon detectors that sense it, with their sensitivity trade-offs.",
        points: [
          { t: "IR regions", d: "Near, mid and far infrared bands and what each is good for." },
          { t: "Types of detectors", d: "Thermal detectors (bolometers) vs photon detectors (cooled semiconductors)." },
          { t: "Sensitivity & resolution", d: "The trade-off between thermal sensitivity, speed and spatial resolution." },
        ] },
      { id: "3.5", n: 5, title: "Instrumentation & Methods", method: "IR", visual: "ThermoInstrument",
        summary: "IR cameras, scanners and recorders, and the active vs passive thermography distinction.",
        points: [
          { t: "IR cameras, scanners, recorders", d: "The instrument chain that captures and stores the thermal image." },
          { t: "Active vs passive thermography", d: "Passive reads natural heat; active applies a heat pulse and watches it dissipate." },
          { t: "Applications", d: "Aerospace composites, electrical hot-spots and mechanical wear." },
        ] },
      { id: "3.6", n: 6, title: "Eddy Current — Generation", method: "ET", visual: "EddyGen",
        summary: "An AC coil induces circulating eddy currents in a conductor; a flaw disturbs them and reflects back into the coil.",
        points: [
          { t: "Electromagnetic induction", d: "A changing coil field induces eddy currents in a nearby conductor." },
          { t: "Interaction with defects", d: "Cracks divert eddy currents, changing the coil's impedance." },
          { t: "Properties of eddy currents", d: "Depth of penetration, skin effect and frequency dependence." },
        ] },
      { id: "3.7", n: 7, title: "Sensing Elements & Probes", method: "ET", visual: "EddyProbes",
        summary: "Absolute, differential and reflection probes; coil design and shielding; and the instrument that turns impedance into a signal.",
        points: [
          { t: "Probe types", d: "Absolute, differential and reflection (driver–pickup) probes." },
          { t: "Coil design & shielding", d: "Coil geometry and shielding tune sensitivity and focus." },
          { t: "Instrumentation", d: "Excitation, signal processing and impedance-plane display." },
        ] },
      { id: "3.8", n: 8, title: "Eddy Current Arrangements", method: "ET", visual: "EddyArrange",
        summary: "Lift-off, encircling-coil, surface-probe and remote-field configurations, each suited to a geometry and task.",
        points: [
          { t: "Coil arrangements", d: "Lift-off, encircling coil and surface probe configurations." },
          { t: "Remote field eddy current", d: "A technique for inspecting tube walls from the inside." },
          { t: "Applications", d: "Crack detection, conductivity sorting and coating-thickness gauging." },
        ] },
      { id: "3.9", n: 9, title: "Advantages & Limitations of ET", method: "ET", visual: "EtProsCons",
        summary: "Fast, no-couplant, sensitive to tiny surface cracks — but conductive materials only, shallow depth, and skill to read.",
        points: [
          { t: "Benefits & constraints", d: "Fast and sensitive, but limited to conductive materials and near-surface depth." },
          { t: "Interpretation & evaluation", d: "Reading impedance-plane signal patterns and rejecting false indications." },
        ] },
    ],
  },

  /* ═══════════════════════ UNIT IV ═══════════════════════ */
  {
    id: 4, code: "IV", title: "Ultrasonic & Acoustic Emission", accent: "#14b8a6", accent2: "#2dd4bf",
    tag: "UT & AE", icon: "◒",
    blurb: "High-frequency sound pulsed into a part echoes off internal flaws; acoustic emission listens for the sounds flaws make as they grow.",
    objectives: [
      "Understand the principle of Ultrasonic Testing and its methods",
      "Explore UT configurations and instrumentation",
      "Learn about Phased Array Ultrasound and Time of Flight Diffraction",
      "Understand the principle and parameters of Acoustic Emission Testing",
      "Explore the applications of Acoustic Emission and Ultrasonic Testing",
    ],
    sessions: [
      { id: "4.1", n: 1, title: "Principle of Ultrasonic Testing", method: "UT", visual: "UtPrinciple",
        summary: "Pulses of high-frequency sound travel through a part and reflect from boundaries and flaws by acoustic impedance mismatch.",
        points: [
          { t: "Wave propagation", d: "Longitudinal and shear waves travel through the material at characteristic speeds." },
          { t: "Interaction with materials & defects", d: "Reflection, refraction and scatter at boundaries and flaws." },
        ] },
      { id: "4.2", n: 2, title: "UT Transducers", method: "UT", visual: "Transducer",
        summary: "A piezoelectric crystal converts electrical pulses to sound and back; contact, immersion and dual-element designs suit different jobs.",
        points: [
          { t: "Piezoelectric principle", d: "A crystal deforms with voltage and generates voltage when struck by sound." },
          { t: "Transducer types", d: "Contact, immersion and dual-element (TR) probes." },
        ] },
      { id: "4.3", n: 3, title: "UT Methods", method: "UT", visual: "UtMethods",
        summary: "Through-transmission uses two probes across the part; pulse-echo uses one probe to send and receive.",
        points: [
          { t: "Transmission method", d: "A separate transmitter and receiver on opposite faces; flaws reduce received energy." },
          { t: "Pulse-echo method", d: "One probe sends a pulse and times echoes from the back wall and flaws." },
        ] },
      { id: "4.4", n: 4, title: "Straight & Angle Beam", method: "UT", visual: "BeamAngles",
        summary: "Straight (normal) beams find flaws parallel to the surface; angle beams reach flaws in welds and off-axis features.",
        points: [
          { t: "Principle & applications", d: "Normal-incidence vs refracted angle beams for different flaw orientations." },
          { t: "Typical defect detection", d: "Laminations by straight beam; weld cracks by angle beam." },
        ] },
      { id: "4.5", n: 5, title: "Instrumentation & Scans", method: "UT", visual: "ScanTypes",
        summary: "The pulser/receiver and display, and the three ways to present data — A-scan, B-scan and C-scan.",
        points: [
          { t: "Pulser/receiver & display", d: "Generating pulses, amplifying echoes and processing the signal." },
          { t: "A-scan, B-scan, C-scan", d: "Amplitude-vs-time trace, cross-section view and plan (top-down) map." },
        ] },
      { id: "4.6", n: 6, title: "Phased Array UT (PAUT)", method: "UT", visual: "PhasedArray",
        summary: "Many small elements fired with timed delays steer and focus the beam electronically — no probe movement needed.",
        points: [
          { t: "Principle of phased array", d: "An array of elements pulsed with programmed delays forms and steers the beam." },
          { t: "Beam steering & focusing", d: "Delay laws sweep the beam through angles and focal depths electronically." },
          { t: "Applications", d: "Weld inspection and complex aerospace geometries." },
        ] },
      { id: "4.7", n: 7, title: "Time of Flight Diffraction (TOFD)", method: "UT", visual: "Tofd",
        summary: "TOFD times the tiny diffracted waves from crack tips to size flaws precisely, largely independent of amplitude.",
        points: [
          { t: "Diffraction-based sizing", d: "Waves diffract from crack tips; timing them gives accurate through-wall size." },
          { t: "Comparison with conventional UT", d: "Amplitude-independent sizing and excellent repeatability." },
          { t: "Advantages in flaw sizing", d: "Fast weld screening with accurate height measurement." },
        ] },
      { id: "4.8", n: 8, title: "Acoustic Emission — Principle", method: "AE", visual: "AePrinciple",
        summary: "A growing crack or plastic deformation releases stress waves; sensors listen and locate the active source in real time.",
        points: [
          { t: "Stress-wave emission", d: "Crack growth and plastic deformation release transient elastic waves." },
          { t: "AE parameters", d: "Amplitude, counts, energy, RMS and rise time characterise each event." },
        ] },
      { id: "4.9", n: 9, title: "Applications of AE", method: "AE", visual: "AeApplications",
        summary: "AE monitors whole structures during loading — pressure vessels, pipelines, aircraft and composites — flagging active flaws.",
        points: [
          { t: "Structural monitoring", d: "Pressure vessels, pipelines, bridges and composite structures under load." },
          { t: "Source location", d: "Multiple sensors triangulate the active flaw from wave arrival times." },
        ] },
    ],
  },

  /* ═══════════════════════ UNIT V ═══════════════════════ */
  {
    id: 5, code: "V", title: "Radiography", accent: "#8b5cf6", accent2: "#a78bfa",
    tag: "RT", icon: "◓",
    blurb: "X-rays or gamma rays pass through a part and cast a shadow image; denser material and flaws change the exposure, revealing internal structure.",
    objectives: [
      "Understand the principles and interaction of X-rays with matter",
      "Explore film and film-less radiographic techniques",
      "Learn the geometric factors and characteristics of films",
      "Understand penetrameters and exposure charts",
      "Explore advanced radiographic techniques",
    ],
    sessions: [
      { id: "5.1", n: 1, title: "Principle & X-ray Interaction", method: "RT", visual: "RtPrinciple",
        summary: "X-rays are generated, pass through the part, and are absorbed, scattered or transmitted depending on thickness and density.",
        points: [
          { t: "X-ray generation", d: "High-energy electrons striking a target produce X-rays." },
          { t: "Absorption, scattering, transmission", d: "Denser/thicker material absorbs more, so flaws (voids) transmit more and darken the film." },
        ] },
      { id: "5.2", n: 2, title: "Imaging Techniques", method: "RT", visual: "RtImaging",
        summary: "Traditional film radiography versus filmless digital methods — direct (DR) and indirect (CR) detectors.",
        points: [
          { t: "Film-based radiography", d: "Radiation exposes a silver-halide film that is chemically developed." },
          { t: "Filmless techniques", d: "Digital radiography (direct) and computed radiography (indirect image plates)." },
        ] },
      { id: "5.3", n: 3, title: "Filters & Screens", method: "RT", visual: "FiltersScreens",
        summary: "Filters harden the beam and cut scatter; intensifying screens amplify the image so less exposure is needed.",
        points: [
          { t: "Types of filters", d: "Lead and copper filters absorb soft, scattered radiation." },
          { t: "Intensifying screens", d: "Fluorescent and lead screens intensify the latent image." },
          { t: "Purpose & advantages", d: "Better contrast, less scatter and shorter exposures." },
        ] },
      { id: "5.4", n: 4, title: "Geometry & Inverse-Square Law", method: "RT", visual: "Geometry",
        summary: "Source size and source-to-film distance set image sharpness; intensity falls off as the inverse square of distance.",
        points: [
          { t: "Source-to-film distance", d: "Greater distance sharpens the image but reduces intensity." },
          { t: "Source size & unsharpness", d: "A smaller focal spot gives a sharper edge (less penumbra)." },
          { t: "Inverse-square law", d: "Intensity ∝ 1/distance²; doubling the distance quarters the intensity." },
        ] },
      { id: "5.5", n: 5, title: "Films & Characteristic Curves", method: "RT", visual: "FilmCurve",
        summary: "Film graininess, density, speed and contrast, summarised by the characteristic (H&D) curve of density vs log-exposure.",
        points: [
          { t: "Graininess, density, speed, contrast", d: "The four properties that define a radiographic film." },
          { t: "Characteristic curves", d: "The H&D curve relates film density to log relative exposure." },
        ] },
      { id: "5.6", n: 6, title: "Penetrameters & Exposure Charts", method: "RT", visual: "Penetrameter",
        summary: "IQIs (penetrameters) prove the radiograph's sensitivity; exposure charts pick film and settings for a thickness.",
        points: [
          { t: "Penetrameters (IQI)", d: "Image Quality Indicators verify that the required sensitivity was achieved." },
          { t: "Exposure charts", d: "Charts relate thickness, energy and time for correct film selection and quality." },
        ] },
      { id: "5.7", n: 7, title: "Radiographic Equivalence", method: "RT", visual: "Equivalence",
        summary: "Different materials attenuate differently; equivalence factors convert one material's thickness to a reference for exposure.",
        points: [
          { t: "Equivalent thickness concept", d: "Converting a material's thickness to a radiographically equivalent reference." },
          { t: "Influence of material type", d: "Atomic number and density set how strongly a material attenuates." },
        ] },
      { id: "5.8", n: 8, title: "Fluoroscopy & Xeroradiography", method: "RT", visual: "Fluoroscopy",
        summary: "Real-time fluoroscopic imaging for moving inspection, and xeroradiography's edge-enhanced electrostatic image.",
        points: [
          { t: "Principle & applications", d: "Fluorescent screen gives a live image; xeroradiography uses an electrostatic plate." },
          { t: "Real-time vs static imaging", d: "Dynamic inspection versus a fixed exposure." },
        ] },
      { id: "5.9", n: 9, title: "Computed Radiography & CT", method: "RT", visual: "CtScan",
        summary: "Reusable digital image plates (CR) and computed tomography (CT) that reconstructs full 3-D cross-sections from many views.",
        points: [
          { t: "Digital image plates", d: "Reusable photostimulable plates read out by a laser scanner (CR)." },
          { t: "CT principle & advantages", d: "Many projections reconstruct 3-D internal structure — powerful in aerospace and medical." },
        ] },
    ],
  },
];

// Flat list of all 45 sessions with unit context attached.
export const ALL_SESSIONS = UNITS.flatMap((u) =>
  u.sessions.map((s) => ({ ...s, unitId: u.id, unitCode: u.code, unitTitle: u.title, accent: u.accent, accent2: u.accent2 }))
);
export const SESSION_COUNT = ALL_SESSIONS.length; // 45
