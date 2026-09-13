// Deep per-session content, keyed by session id. Rendered by the session view
// as the detailed lesson body. Populated unit-by-unit; sessions without an
// entry fall back to their curriculum `points`.
// Shape: { overview, sections:[{h, p, list?}], keyTerms:[{t,d}], applications:[], takeaways:[] }

export const DETAIL = {
  /* ═══════════════════════ UNIT I ═══════════════════════ */
  "1.1": {
    overview:
      "Every engineered component that flies, spins, or carries load is a promise: that it will behave as designed under the stresses of service. Testing is how that promise is verified. Before we can appreciate Non-Destructive Testing, we have to understand what testing is for, why aviation treats it as non-negotiable, and the single most important distinction in the field — whether the test destroys the thing it measures.",
    sections: [
      { h: "What 'testing' really means in engineering",
        p: "Testing is the controlled, repeatable evaluation of a material or component to confirm it meets its design intent — strength, dimensions, freedom from defects, and fitness for its service environment. It converts an assumption ('this part is sound') into evidence. A test is only useful if it is sensitive to the thing that would cause failure, and if its result can be trusted and repeated. In engineering practice, testing spans the whole life of a part: incoming raw-material checks, in-process verification during manufacture, final acceptance, and periodic in-service inspection through the part's operating life.",
        list: ["Design verification — does the part meet the drawing and the spec?", "Quality control — is this batch free of manufacturing defects?", "Fitness-for-service — is this in-service part still safe to keep using?"] },
      { h: "Why aviation cannot compromise on it",
        p: "In most industries a failed part is an inconvenience; in aviation it can be a catastrophe with no second chance. Aircraft structures are deliberately designed light, which means they operate closer to their limits and are exposed to millions of fatigue cycles, temperature swings, corrosion and impact damage. A crack too small to see today can grow to critical size in service. Because of this, airworthiness authorities mandate inspection at defined intervals, and every inspection must be documented, traceable and performed by certified personnel. Testing is not a formality here — it is the barrier between a latent defect and a lost aircraft.",
        list: ["Weight-optimised structures run near their design limits", "Fatigue, corrosion and impact accumulate damage over thousands of hours", "Regulation (airworthiness directives, maintenance schedules) makes inspection mandatory and auditable"] },
      { h: "The great divide: destructive vs non-destructive",
        p: "All testing splits into two families. Destructive testing loads or cuts a representative sample until it fails or is sectioned, yielding precise bulk properties — but the sample is consumed and can never fly. Non-Destructive Testing evaluates the actual part using a probing energy (light, dye, magnetism, electric current, sound or radiation) that interacts with defects without harming the component, so the part remains fit for service. Destructive testing answers 'how strong is this material?'; NDT answers 'is this specific part sound, right now, without breaking it?'." },
    ],
    keyTerms: [
      { t: "Defect / Flaw", d: "A discontinuity in a material (crack, void, inclusion) that may reduce its ability to perform." },
      { t: "Discontinuity", d: "Any interruption in the normal structure of a part; becomes a 'defect' only when it exceeds acceptance limits." },
      { t: "Fitness-for-service", d: "A judgement that a part, despite any indications found, is safe to continue in operation." },
      { t: "Airworthiness", d: "The demonstrated condition of an aircraft/component being safe and legal to fly." },
    ],
    applications: [
      "Acceptance inspection of newly manufactured turbine blades and airframe fittings",
      "Scheduled maintenance checks (A/B/C/D checks) that keep an airliner airworthy",
      "Incoming inspection of raw billets and forgings before machining",
    ],
    takeaways: [
      "Testing converts an assumption of soundness into documented evidence.",
      "Aviation mandates inspection because failures are catastrophic and structures run near their limits.",
      "Destructive tests consume a sample for bulk properties; NDT inspects the real part and leaves it serviceable.",
    ],
  },

  "1.2": {
    overview:
      "Destructive and non-destructive testing are not rivals — they answer different questions and are used together. Understanding exactly where each one wins is the foundation for choosing an inspection strategy. This session contrasts the two on principle, coverage, repeatability, and what they actually measure.",
    sections: [
      { h: "How destructive (mechanical) testing works",
        p: "Mechanical tests apply a known, increasing load to a standardised specimen and record how it responds. A tensile test pulls a machined bar until it necks and breaks, producing a stress–strain curve that yields modulus, yield strength, ultimate strength and elongation. Hardness tests press an indenter into the surface and measure the impression. Impact tests (Charpy, Izod) strike a notched bar to measure toughness. Fatigue tests cycle the load thousands of times to find endurance limits. Every one of these ends with a specimen that is deformed or broken — the information is bought at the cost of the sample.",
        list: ["Tensile — strength, ductility, modulus from a stress–strain curve", "Hardness — resistance to indentation", "Impact — toughness / energy absorbed to fracture", "Fatigue — life under cyclic loading"] },
      { h: "How non-destructive testing works",
        p: "NDT introduces a probing energy that interacts with discontinuities but not with the part's integrity. Penetrant dye is drawn into surface cracks by capillary action; a magnetic field leaks at cracks in steel and gathers iron particles; eddy currents are disturbed by flaws in conductors; ultrasonic pulses echo from internal boundaries; radiation casts a shadow of internal density. In each case we read the interaction — a change in signal, an image, a visible indication — and infer the presence, size and location of a flaw, while the part stays whole.",
        list: ["A probing energy interacts with the flaw, not the part's strength", "We read the interaction (signal, image, indication) and infer the flaw", "The component is unharmed and returns to service"] },
      { h: "Side-by-side: the real trade-off",
        p: "Destructive testing gives precise bulk properties but only for the sacrificed sample, so coverage is statistical — you test a few and assume the rest match. NDT gives flaw information for the actual part and can be applied to 100% of production and repeated throughout service, but it infers rather than directly measures strength. The mature approach uses destructive testing to qualify a material and process, then NDT to police every part made and every part in service." },
    ],
    keyTerms: [
      { t: "Stress–strain curve", d: "Plot of load per area vs deformation; the fingerprint of a material's mechanical behaviour." },
      { t: "Bulk property", d: "A property of the material as a whole (e.g. yield strength), as opposed to a local flaw." },
      { t: "100% inspection", d: "Inspecting every part produced — feasible with NDT, impossible with destructive tests." },
      { t: "Sampling", d: "Testing a representative subset and inferring the rest — inherent to destructive testing." },
    ],
    applications: [
      "Material qualification of a new titanium alloy by destructive tensile/fatigue testing",
      "NDT screening of every forged landing-gear component coming off the line",
      "Combining coupon fatigue data with in-service NDT to manage crack growth",
    ],
    takeaways: [
      "Destructive = sample-based, one-shot, direct bulk properties.",
      "NDT = part-based, repeatable, flaw-focused, enabling 100% and in-service inspection.",
      "They are complementary: qualify the material destructively, police every part with NDT.",
    ],
  },

  "1.3": {
    overview:
      "There is no single 'NDT machine' — there is a toolbox of methods, each exploiting a different physical interaction. Choosing well starts with knowing the family: the classical six methods and the fundamental split between techniques that see the surface and those that see through the volume.",
    sections: [
      { h: "The classical six methods",
        p: "Six methods form the backbone of industrial NDT, each named for the energy it uses. Visual (VT) uses light and the eye. Liquid Penetrant (PT) uses dye and capillary action. Magnetic Particle (MT) uses magnetic leakage fields. Eddy Current (ET) uses induced electric currents. Ultrasonic (UT) uses high-frequency sound. Radiography (RT) uses X- or gamma rays. Newer methods — thermography, acoustic emission, phased-array UT — extend the family, but these six are where every inspector starts.",
        list: ["VT — Visual Testing (light)", "PT — Liquid Penetrant Testing (dye + capillarity)", "MT — Magnetic Particle Testing (magnetic field)", "ET — Eddy Current Testing (induced current)", "UT — Ultrasonic Testing (sound)", "RT — Radiographic Testing (X/γ radiation)"] },
      { h: "Surface vs volumetric — the key division",
        p: "The single most useful way to organise the methods is by where they can 'see'. Surface methods (VT, PT, MT, ET) are extremely sensitive to flaws at or just beneath the surface, but cannot reach deep inside. Volumetric methods (UT, RT) probe through the thickness and reveal internal defects, at the cost of more equipment, skill and often access to two sides. A surface-breaking fatigue crack is a job for PT or ET; internal porosity in a casting is a job for RT or UT.",
        list: ["Surface & near-surface: VT, PT, MT, ET — cheap, fast, surface-sensitive", "Volumetric (through-thickness): UT, RT — reach internal flaws, need more skill/kit"] },
      { h: "Matching method to job",
        p: "Method selection is driven by the material (magnetic? conductive?), the expected flaw (surface or internal, its orientation), the geometry and access, and the required sensitivity. No method is universally best — real inspection plans layer several. Across industries the mix differs: aerospace leans on ET and UT and RT; oil & gas on UT and RT for welds; rail on ultrasonic wheel and axle testing." },
    ],
    keyTerms: [
      { t: "Surface method", d: "Detects flaws at or very near the surface (VT, PT, MT, ET)." },
      { t: "Volumetric method", d: "Detects flaws through the thickness of the part (UT, RT)." },
      { t: "Probing energy", d: "The physical agent (light, dye, field, current, sound, radiation) a method uses to interact with flaws." },
      { t: "Sensitivity", d: "The smallest flaw a method can reliably detect under given conditions." },
    ],
    applications: [
      "Aerospace: ET on fastener holes, UT on spars, RT on welds and castings",
      "Oil & gas: UT and RT for pipeline weld integrity",
      "Automotive & rail: MT on crankshafts, UT on rails and axles",
    ],
    takeaways: [
      "The classical six: VT, PT, MT, ET (surface) and UT, RT (volumetric).",
      "Surface vs volumetric is the most useful mental split.",
      "Selection follows material, flaw type/orientation, geometry, access and required sensitivity.",
    ],
  },

  "1.4": {
    overview:
      "NDT earns its keep by catching the specific defects that manufacturing introduces — in welds, castings and forgings — before they leave the factory or fail in service. This session connects real defect types to the methods that find them, and to whether the flaw breaks the surface or hides within.",
    sections: [
      { h: "Where defects come from",
        p: "Manufacturing processes each have signature defects. Welding traps gas as porosity, fails to fuse (lack of fusion), cracks on cooling, and leaves slag inclusions. Casting suffers shrinkage cavities, gas porosity, cold shuts and inclusions as the metal solidifies unevenly. Forging and rolling create laps, seams and internal bursts, and can open laminations from rolled stock. Machining and grinding can introduce surface cracks and residual stress. Knowing the process tells the inspector what to look for and where.",
        list: ["Welds — porosity, lack of fusion, cracks, slag inclusions", "Castings — shrinkage, gas porosity, cold shuts, inclusions", "Forgings/rolled — laps, seams, bursts, laminations"] },
      { h: "Surface vs subsurface detection",
        p: "The defect's location dictates the method. Surface-breaking flaws are caught by PT (any material) or MT (ferromagnetic) and confirmed visually. Flaws just beneath the surface reveal themselves to MT and ET. Deep, internal flaws need the volumetric methods — RT images porosity and inclusions well; UT excels at planar flaws like cracks and lack of fusion and can size them. Often two methods are used together: RT to characterise volumetric flaws and UT to catch and size tight cracks that RT can miss.",
        list: ["Surface-breaking → PT, MT, VT", "Near-surface → MT, ET", "Internal/volumetric → RT (volumetric flaws), UT (planar flaws, sizing)"] },
      { h: "Case studies in practice",
        p: "A welded pressure boundary is radiographed to reveal porosity and slag, and ultrasonically inspected for lack of fusion at the weld root. A cast turbine component is radiographed for shrinkage and inspected by PT for surface cracks. A forged shaft is magnetic-particle inspected for laps and quench cracks. Each pairing reflects the defect's nature — planar or volumetric, surface or internal." },
    ],
    keyTerms: [
      { t: "Porosity", d: "Gas bubbles trapped in solidifying metal, appearing as rounded voids." },
      { t: "Lack of fusion", d: "A weld defect where the weld metal fails to fuse with the base metal — a planar flaw." },
      { t: "Inclusion", d: "Foreign matter (slag, oxide) embedded in the metal." },
      { t: "Lamination", d: "A flat, planar separation, usually from rolled plate, parallel to the surface." },
    ],
    applications: [
      "Weld inspection of aircraft engine mounts and pressure systems",
      "Casting inspection of turbine blades and structural fittings",
      "Forging inspection of shafts, discs and landing-gear parts",
    ],
    takeaways: [
      "Each manufacturing process has signature defects — know the process, know the flaw.",
      "Location (surface vs internal) and shape (planar vs volumetric) drive method choice.",
      "RT and UT are complementary for internal flaws: RT for volumetric, UT for planar and sizing.",
    ],
  },

  "1.5": {
    overview:
      "NDT does more than count flaws — it can measure the condition and properties of a material without cutting it open. Material characterization uses the NDT signal itself as a gauge of conductivity, thickness, hardness, microstructure or residual stress, which is powerful for monitoring ageing assets.",
    sections: [
      { h: "The idea of characterization",
        p: "In flaw detection we ask 'is there a defect?'. In characterization we ask 'what is the material's condition?' — and answer it from the same measured response. Because NDT signals depend on physical properties (electrical conductivity, acoustic velocity, magnetic permeability, X-ray attenuation), a calibrated measurement of the signal becomes a measurement of the property. No specimen is destroyed; the part itself is the gauge.",
        list: ["Flaw detection asks: is there a defect?", "Characterization asks: what is the material's condition/property?", "Both read the same NDT signal — calibration turns it into a property value"] },
      { h: "Techniques and what they reveal",
        p: "Eddy current conductivity measurement sorts alloys and verifies heat treatment and heat damage, because conductivity tracks composition and temper. Ultrasonic velocity relates to elastic modulus and can detect changes in microstructure or degradation. Ultrasonic thickness gauging monitors wall loss from corrosion. Backscatter and attenuation relate to density and porosity. Magnetic and Barkhausen-noise methods sense residual stress and hardness in steels.",
        list: ["Eddy current conductivity → alloy/temper/heat-damage sorting", "Ultrasonic velocity → elastic modulus, microstructure", "Ultrasonic thickness → corrosion/erosion wall loss", "Attenuation/backscatter → density, porosity"] },
      { h: "Why it matters over a part's life",
        p: "Characterization turns NDT into a health monitor. Tracking conductivity, thickness or velocity over successive inspections reveals slow degradation — corrosion thinning, creep, fatigue or heat damage — long before a discrete crack appears. For ageing aircraft and long-life plant, this trend data underpins safe life-extension decisions." },
    ],
    keyTerms: [
      { t: "Conductivity (IACS)", d: "Electrical conductivity, often as % of pure copper; sensitive to alloy and temper." },
      { t: "Acoustic velocity", d: "Speed of sound in the material; linked to elastic modulus and microstructure." },
      { t: "Residual stress", d: "Locked-in stress remaining after manufacture; affects fatigue life." },
      { t: "Life-cycle monitoring", d: "Tracking a property over time to detect gradual degradation." },
    ],
    applications: [
      "Sorting aluminium alloy tempers and detecting heat damage after a fire or overheat",
      "Ultrasonic thickness mapping of corroding fuselage skins and pipework",
      "Monitoring microstructural change in high-temperature engine components",
    ],
    takeaways: [
      "Characterization reads the NDT signal as a gauge of a material property.",
      "Conductivity, velocity, thickness and attenuation each reveal condition without destruction.",
      "Trending these properties detects slow degradation and supports life extension.",
    ],
  },

  "1.6": {
    overview:
      "If NDT costs money and skill, why does every serious industry invest in it heavily? Because the return is overwhelming — economically, operationally and in safety. This session lays out the merits that justify NDT programmes.",
    sections: [
      { h: "Economic and operational benefits",
        p: "Because parts survive inspection, good components are kept in service rather than scrapped, and marginal ones are found before they fail expensively. NDT lets maintenance be planned rather than reactive: inspecting on a schedule prevents the far greater cost of unplanned failure, secondary damage and downtime. It also reduces waste — defective material is caught early in manufacture, before value is added by further machining and assembly.",
        list: ["Serviceable parts reused, not scrapped", "Planned inspection replaces costly unplanned failure", "Defects caught early, before more value is added"] },
      { h: "Real-time and in-service inspection",
        p: "Many NDT methods work on assembled, even operating, structures without disassembly. Ultrasonic and eddy-current checks are performed on installed components; acoustic emission listens to a whole structure while it is pressurised. This means condition can be assessed where the part actually works, minimising teardown, and continuous or periodic monitoring can track a known flaw's growth instead of removing the part.",
        list: ["Inspect assembled/operating structures without teardown", "Monitor known flaws over time rather than scrapping the part", "Assess condition in the real service environment"] },
      { h: "Regulatory and safety advantages",
        p: "NDT produces the documented, repeatable evidence that safety cases and airworthiness regulations demand. It provides the technical basis for accept/reject decisions, for life-extension of ageing assets, and for demonstrating compliance with codes and airworthiness directives. Above all, it prevents failures — the ultimate justification." },
    ],
    keyTerms: [
      { t: "Planned maintenance", d: "Inspection/servicing on a schedule to prevent failure, versus reactive repair." },
      { t: "Downtime", d: "Time a system is out of service; unplanned downtime is far costlier than planned." },
      { t: "Airworthiness directive", d: "A mandatory regulatory instruction, often requiring specific NDT inspections." },
      { t: "Traceability", d: "Documented, auditable record of what was inspected, how, and by whom." },
    ],
    applications: [
      "Scheduled fleet inspections that keep aircraft flying safely and legally",
      "In-service ultrasonic monitoring of a known, sub-critical crack under an AD",
      "Early rejection of defective billets, saving downstream machining cost",
    ],
    takeaways: [
      "Parts are reused not scrapped, and failures are prevented not repaired.",
      "Many methods inspect assembled, in-service structures without teardown.",
      "NDT supplies the documented evidence regulation and safety cases require.",
    ],
  },

  "1.7": {
    overview:
      "No method is magic. Every NDT technique has a floor below which flaws are missed, materials or geometries it cannot handle, and a dependence on operator skill and calibrated equipment. Honest inspection means knowing these limits as well as the strengths.",
    sections: [
      { h: "Sensitivity and detection limits",
        p: "Each method has a smallest flaw it can reliably detect, and that limit depends on flaw orientation as much as size. Ultrasonics is superb at planar flaws facing the beam but can miss the same crack if it lies parallel to the beam. Radiography sees volumetric flaws well but can miss tight cracks unless the beam aligns with them. There is always a probability of detection below 100% — small, tight or awkwardly oriented flaws can slip through.",
        list: ["A minimum detectable flaw size exists for every method", "Flaw orientation matters as much as size", "Detection is probabilistic, never guaranteed"] },
      { h: "Material and geometry constraints",
        p: "Physics rules methods in or out. Magnetic Particle needs a ferromagnetic material; Eddy Current needs a conductor; Ultrasonics needs a couplant and reasonable access; Radiography needs access to two sides and raises safety and shielding issues. Rough surfaces defeat penetrant and eddy current; complex or thick geometry limits UT and RT; restricted access can rule out whole methods.",
        list: ["Material: MT needs ferromagnetics, ET needs conductors", "Access & geometry: UT/RT need suitable access and thickness", "Surface finish: roughness degrades PT and ET"] },
      { h: "Operator skill and cost",
        p: "Most methods infer flaws from an indication that a human must interpret, so results depend heavily on trained, certified operators and on properly calibrated equipment. Skilled interpretation separates real flaws from harmless indications; poor technique produces both misses and false calls. Advanced methods (phased array, CT) add significant equipment cost. NDT is only as reliable as the person and the kit behind it." },
    ],
    keyTerms: [
      { t: "Probability of detection (POD)", d: "The likelihood that a flaw of a given size will actually be found." },
      { t: "False indication", d: "A signal that looks like a flaw but isn't (geometry, surface, noise)." },
      { t: "Orientation dependence", d: "How detectability changes with the flaw's angle to the probing energy." },
      { t: "Certification (e.g. Level I/II/III)", d: "Formal qualification levels for NDT operators." },
    ],
    applications: [
      "Choosing UT beam angles to catch cracks of the expected orientation in a weld",
      "Rejecting eddy-current use on a painted, rough surface in favour of another method",
      "Requiring Level II certified operators for critical airframe inspections",
    ],
    takeaways: [
      "Every method has a detection floor and strong orientation dependence.",
      "Material, geometry, access and surface finish rule methods in or out.",
      "Reliability hinges on certified operators and calibrated equipment.",
    ],
  },

  "1.8": {
    overview:
      "Whether a method will work at all comes down to physics — specifically, the material's magnetic, electrical, acoustic and density properties. This session connects those physical characteristics to method selection, with the aviation alloys you will actually inspect.",
    sections: [
      { h: "The properties that matter",
        p: "Four material properties govern most method choices. Ferromagnetism decides whether Magnetic Particle Testing is possible — only steels and a few alloys respond. Electrical conductivity decides Eddy Current Testing — it needs a conductor, and the conductivity value itself carries information. Acoustic impedance (density × sound velocity) governs Ultrasonics — reflections occur where impedance changes, so it defines what UT can 'see'. Density and atomic number govern Radiography — they set how strongly a material absorbs X-rays and hence the contrast of the image.",
        list: ["Ferromagnetism → enables MT", "Electrical conductivity → enables ET (and characterization)", "Acoustic impedance → governs UT reflection", "Density / atomic number → governs RT attenuation and contrast"] },
      { h: "How physics selects the method",
        p: "Match the property to the method and the answer often writes itself. A non-magnetic, non-conductive composite rules out both MT and ET, pushing you to PT, UT or RT. A ferromagnetic steel weld invites MT for surface cracks and UT for internal flaws. An aluminium fastener hole suits eddy current. The inspector reads the material first and lets its properties narrow the toolbox.",
        list: ["Non-magnetic, non-conductive → PT / UT / RT", "Ferromagnetic steel → MT (+ UT for volume)", "Conductive aluminium/titanium → ET (surface), UT (volume)"] },
      { h: "Aviation alloys in practice",
        p: "Aluminium alloys (2024, 7075) are light, conductive and non-magnetic — ideal for eddy current on skins and fastener holes, and UT for thicker sections. Titanium alloys (Ti-6Al-4V) are strong, corrosion-resistant and non-magnetic — inspected by ET, UT and RT. Steels used in landing gear and engines are ferromagnetic — perfect for MT, with UT for internal integrity. Carbon-fibre composites are non-metallic — inspected by UT, thermography and RT. The alloy dictates the method mix." },
    ],
    keyTerms: [
      { t: "Ferromagnetic", d: "Strongly attracted by, and able to concentrate, a magnetic field (e.g. most steels)." },
      { t: "Acoustic impedance", d: "Density × sound velocity; reflections occur where it changes across a boundary." },
      { t: "Attenuation", d: "The reduction of a signal (sound or radiation) as it passes through material." },
      { t: "Atomic number (Z)", d: "Number of protons; higher-Z materials absorb X-rays more strongly." },
    ],
    applications: [
      "Eddy-current inspection of aluminium fuselage skins and rivet holes",
      "Magnetic-particle inspection of steel landing-gear forgings",
      "Ultrasonic and thermographic inspection of composite control surfaces",
    ],
    takeaways: [
      "Magnetic, electrical, acoustic and density properties decide which method can work.",
      "Read the material first — its physics narrows the toolbox.",
      "Aviation alloys pair predictably with methods: Al→ET/UT, steel→MT/UT, composite→UT/IR/RT.",
    ],
  },

  /* ═══════════════════════ UNIT II ═══════════════════════ */
  "2.1": {
    overview:
      "Liquid Penetrant Testing is the most widely used surface method in the world — cheap, simple, and astonishingly sensitive to surface-breaking flaws on almost any non-porous material. Its whole power comes from one everyday piece of physics: capillary action, the same force that pulls water up a narrow tube. Get the surface clean and a coloured liquid will find cracks the eye cannot.",
    sections: [
      { h: "What LPT is and why it matters",
        p: "Liquid Penetrant Testing (also called dye penetrant inspection, DPI or PT) reveals flaws that break the surface of a part by drawing a coloured or fluorescent liquid into them and then blotting it back out to form a visible indication. It works on metals, ceramics, glass, plastics and more — anything non-porous — and needs no electricity or magnetism, which is why it is used everywhere from aerospace shop floors to field weld inspection.",
        list: ["Detects surface-breaking flaws on non-porous materials", "No power, no magnetism — portable and low-cost", "Standard for cracks in welds, castings, machined and forged parts"] },
      { h: "The principle: capillary action",
        p: "A surface-breaking crack is a very narrow channel. When penetrant is applied and left to dwell, capillary action — the attraction between the liquid and the crack walls — pulls the penetrant deep into the flaw, even against gravity. Excess penetrant is then removed from the surface, and a developer is applied that reverses the capillary action, wicking the trapped penetrant back out where it bleeds into a visible, magnified indication of the flaw.",
        list: ["Penetrant is drawn into the crack by capillary action during the dwell", "Excess is removed from the surface", "Developer wicks it back out into a visible, enlarged indication"] },
      { h: "Why cleaning is everything",
        p: "Capillary action only works if the crack is open and clean. Oil, grease, paint, rust, water or leftover machining fluid will block the opening and stop penetrant entering — the flaw becomes invisible. This is why pre-cleaning is not a preliminary but the single most important step in LPT: a poorly cleaned part gives false confidence. The surface must be dry and free of contaminants before penetrant is ever applied." },
    ],
    keyTerms: [
      { t: "Capillary action", d: "The attraction that draws a liquid into a narrow space such as a crack — the basis of LPT." },
      { t: "Penetrant", d: "The coloured or fluorescent liquid drawn into surface flaws." },
      { t: "Dwell time", d: "The time penetrant is left on the part so it can seep into flaws." },
      { t: "Indication", d: "The visible bleed-out of penetrant that marks a flaw after developing." },
    ],
    applications: [
      "Surface-crack inspection of welds on airframe and engine components",
      "Machined and forged parts where fatigue cracks break the surface",
      "Non-magnetic materials (aluminium, titanium, plastics) unsuitable for MT",
    ],
    takeaways: [
      "LPT finds surface-breaking flaws on any non-porous material by capillary action.",
      "The sequence is penetrant → dwell → remove excess → develop → inspect.",
      "Cleaning is the make-or-break step: contamination blocks the flaw and hides it.",
    ],
  },
  "2.2": {
    overview:
      "Not all penetrants are equal. Their performance is governed by physical properties — viscosity, surface tension, wettability — and they are grouped into families by how you see them (visible dye vs fluorescent) and how you remove them (water-washable, solvent-removable, post-emulsifiable). Choosing the right penetrant is choosing the right sensitivity for the job.",
    sections: [
      { h: "The properties that make a penetrant work",
        p: "A good penetrant must enter tiny flaws quickly and hold there. Low viscosity lets it flow and penetrate; the right surface tension and good wettability (a low contact angle) let it spread over the surface and creep into cracks; and it must resist evaporation during dwell. These properties trade off — a penetrant tuned for the finest cracks behaves differently from a general-purpose one, which is why penetrants come in sensitivity levels.",
        list: ["Viscosity — low enough to flow into fine flaws", "Surface tension & wettability — spread and creep into cracks", "Volatility — must not dry out during the dwell"] },
      { h: "Visible vs fluorescent",
        p: "Visible (dye) penetrants are usually red and are read under ordinary white light — simple and portable, ideal for field work. Fluorescent penetrants glow bright yellow-green under ultraviolet (black) light in a darkened area, giving far higher contrast and sensitivity for the finest cracks, at the cost of a UV setup and a dark booth. Fluorescent methods dominate critical aerospace inspection; visible dye dominates field and general work.",
        list: ["Visible dye — red, white-light, portable, lower sensitivity", "Fluorescent — glows under UV, higher contrast and sensitivity"] },
      { h: "Removal families",
        p: "Penetrants are also classified by removal method. Water-washable penetrants contain an emulsifier and rinse straight off with water — fast but can over-wash fine flaws. Solvent-removable penetrants are wiped off with a solvent-dampened cloth — controllable, common in field kits. Post-emulsifiable penetrants are the most sensitive: a separate emulsifier is applied to make the surface penetrant water-removable, giving tight control over how much is washed away.",
        list: ["Water-washable — quick, but can over-remove", "Solvent-removable — controllable, portable aerosol kits", "Post-emulsifiable — highest sensitivity, extra emulsifier step"] },
    ],
    keyTerms: [
      { t: "Viscosity", d: "A liquid's resistance to flow; low viscosity helps penetrant enter fine flaws." },
      { t: "Wettability", d: "How well a liquid spreads on a surface; high wettability aids penetration." },
      { t: "Fluorescent penetrant", d: "Penetrant that glows under UV light for high-contrast, high-sensitivity inspection." },
      { t: "Post-emulsifiable", d: "A penetrant made water-removable by a separate emulsifier step — highest sensitivity." },
    ],
    applications: [
      "Fluorescent post-emulsifiable systems for critical turbine and airframe parts",
      "Solvent-removable aerosol dye kits for field and maintenance inspection",
      "Selecting sensitivity level to match the smallest flaw that must be found",
    ],
    takeaways: [
      "Viscosity, surface tension and wettability decide how well a penetrant works.",
      "Visible dye is portable and simple; fluorescent is far more sensitive under UV.",
      "Removal family (water-washable / solvent / post-emulsifiable) sets control and sensitivity.",
    ],
  },
  "2.3": {
    overview:
      "The developer is the quiet hero of LPT. After the flaw is filled with penetrant and the excess removed, it is the developer that pulls the trapped penetrant back to the surface and spreads it into a bright, magnified indication you can actually see. Without a good developer, even a well-penetrated flaw stays invisible.",
    sections: [
      { h: "What the developer does",
        p: "A developer is applied as a thin, even, usually white coating after excess penetrant is removed. It acts as a blotter: its fine porous structure reverses the capillary action, drawing penetrant out of the flaw and spreading it sideways so the indication becomes wider and more visible than the crack itself. Against the white developer background, a red dye indication or a glowing fluorescent one stands out sharply, effectively magnifying the flaw.",
        list: ["Blots trapped penetrant back out of the flaw", "Spreads and magnifies the indication", "Provides a contrasting background for high visibility"] },
      { h: "Types of developer",
        p: "Dry powder developers are fluffy powders dusted onto fluorescent inspections. Wet developers come as water-suspendable or water-soluble powders mixed with water and applied by dip or spray. Non-aqueous (solvent-based) developers are suspended in a fast-drying solvent and sprayed from an aerosol, leaving a very even white film — the most sensitive and the standard for visible dye work. Each suits a different penetrant system and part.",
        list: ["Dry powder — for fluorescent systems", "Water-suspendable / soluble — dip or spray, batch work", "Non-aqueous (solvent) — aerosol, most sensitive, visible dye"] },
      { h: "Getting the interaction right",
        p: "Results depend on the penetrant and developer working together correctly. Applying too much developer buries indications under a thick film; too little fails to draw penetrant out. Correct development time lets weak indications bleed out and grow before inspection. The best results come from matching developer type to the penetrant, applying an even film, and allowing the specified developing time before reading." },
    ],
    keyTerms: [
      { t: "Developer", d: "A coating that draws trapped penetrant out of a flaw and magnifies the indication." },
      { t: "Developing time", d: "The interval allowing penetrant to bleed out into a visible indication." },
      { t: "Non-aqueous developer", d: "Solvent-suspended developer sprayed as an even film — highest sensitivity." },
      { t: "Bleed-out", d: "The spreading of penetrant from a flaw into a visible indication on the developer." },
    ],
    applications: [
      "Non-aqueous developer aerosols for high-contrast visible-dye weld inspection",
      "Dry powder developers in fluorescent inspection lines for turbine parts",
      "Controlling developing time to reveal fine, slow-bleeding cracks",
    ],
    takeaways: [
      "The developer blots penetrant out of the flaw and magnifies it against a white background.",
      "Types: dry powder, water-based, and non-aqueous solvent (most sensitive).",
      "Even application and correct developing time make weak indications readable.",
    ],
  },
  "2.4": {
    overview:
      "LPT is popular because it is cheap, simple and works on almost anything non-porous — but it has hard limits. It sees only what breaks the surface, it is unforgiving of poor cleaning, and it struggles on rough or porous materials. Knowing exactly where it wins and where it fails is what makes it useful rather than misleading.",
    sections: [
      { h: "Advantages of LPT",
        p: "LPT's strengths are practicality and reach. It is inexpensive and needs minimal equipment; it is portable and works in the field; it inspects complex shapes and large areas in one operation; and it works on virtually any non-porous material — metals, ceramics, glass and plastics — including the non-magnetic materials that magnetic particle testing cannot touch. It also gives a directly visible indication that is easy to interpret.",
        list: ["Low cost, simple, portable — minimal equipment", "Works on complex shapes and large areas at once", "Any non-porous material, including non-magnetic ones"] },
      { h: "Limitations of LPT",
        p: "Its central limit is that it detects only surface-breaking flaws — anything subsurface is completely invisible to it. It is highly sensitive to cleanliness: contamination or leftover fluid blocks flaws and produces misses. It cannot be used on porous materials, which soak up penetrant everywhere and mask indications, and very rough surfaces trap penetrant and cause false indications. It is also relatively slow because of the multi-step, dwell-dependent process.",
        list: ["Surface-breaking flaws only — nothing subsurface", "Extremely sensitive to cleaning and surface condition", "Unsuitable for porous or very rough surfaces"] },
      { h: "Where to use it well",
        p: "LPT shines at inspecting weld toes, machined surfaces, castings and non-magnetic components for surface cracks, porosity that breaks the surface, and leaks. It is the natural choice when the flaw of concern reaches the surface and the material rules out magnetic particle testing. When subsurface integrity matters, it is paired with a volumetric method rather than relied on alone." },
    ],
    keyTerms: [
      { t: "Surface-breaking flaw", d: "A discontinuity open to the surface — the only kind LPT can detect." },
      { t: "False indication", d: "An apparent flaw caused by rough surface or trapped penetrant, not a real defect." },
      { t: "Porous material", d: "A material with open pores that soak up penetrant, masking indications — unsuitable for LPT." },
      { t: "Interpretation", d: "Judging whether an indication is a real, relevant flaw." },
    ],
    applications: [
      "Weld-toe and machined-surface crack inspection across aerospace parts",
      "Leak detection in thin-walled vessels and tanks",
      "First-line surface inspection paired with UT/RT for internal integrity",
    ],
    takeaways: [
      "LPT is cheap, portable and works on any non-porous material, magnetic or not.",
      "It only finds surface-breaking flaws and is highly sensitive to cleaning.",
      "Porous and very rough surfaces defeat it — pair with a volumetric method for internal flaws.",
    ],
  },
  "2.5": {
    overview:
      "LPT is a disciplined six-step sequence, and skipping or rushing any step costs you the flaw. This session walks the procedure end to end — clean, penetrant, dwell, remove, develop, inspect — and how to read the indications it produces.",
    sections: [
      { h: "The six steps",
        p: "1) Pre-clean the surface so flaws are open and dry. 2) Apply penetrant evenly over the area. 3) Dwell — allow time (often 5–30 minutes) for capillary action to draw penetrant into flaws. 4) Remove excess penetrant from the surface using the correct method (water, solvent or emulsifier) without over-washing. 5) Apply developer as a thin even film and allow developing time. 6) Inspect under the correct light — white light for dye, UV in a darkened area for fluorescent — and evaluate.",
        list: ["Pre-clean → apply penetrant → dwell", "Remove excess → apply developer → develop", "Inspect under the correct light and evaluate"] },
      { h: "Reading the indications",
        p: "Indications tell a story by their shape. A continuous line indicates a crack or a cold shut. An intermittent line is often a crack that is partly filled or tight. Rounded indications point to porosity or gas holes breaking the surface. Widely dispersed dots can mean general porosity or, sometimes, poor cleaning. The inspector distinguishes relevant indications (real flaws) from non-relevant ones (from geometry) and false ones (from contamination or rough surface).",
        list: ["Continuous line — crack / cold shut", "Intermittent line — tight or partly-filled crack", "Rounded / dispersed — porosity or gas holes"] },
      { h: "Discipline decides the result",
        p: "Because every step depends on the one before, LPT rewards discipline: adequate dwell, correct removal (over-washing empties fine flaws, under-washing leaves background that hides them), even developer, and full developing time before reading. Rushing any step turns a sound method into a source of missed or false indications." },
    ],
    keyTerms: [
      { t: "Pre-clean", d: "Removing contaminants so flaws are open to penetrant — the first, critical step." },
      { t: "Over-washing", d: "Removing so much penetrant that fine flaws are emptied and missed." },
      { t: "Relevant indication", d: "An indication caused by an actual flaw, versus geometry or contamination." },
      { t: "Cold shut", d: "A casting flaw where two metal streams failed to fuse, seen as a continuous line." },
    ],
    applications: [
      "Standardised PT procedures on production weld and casting inspection lines",
      "Field dye-penetrant kits for on-aircraft surface crack checks",
      "Training inspectors to distinguish relevant, non-relevant and false indications",
    ],
    takeaways: [
      "The six steps: clean, penetrant, dwell, remove excess, develop, inspect.",
      "Indication shape reveals the flaw type — line vs rounded vs dispersed.",
      "Each step depends on the last; discipline in dwell, removal and developing is everything.",
    ],
  },
  "2.6": {
    overview:
      "Magnetic Particle Testing turns invisible surface and near-surface cracks in steel into visible lines of iron powder. Magnetise a ferromagnetic part and a crack disturbs the magnetic field, forcing some of it to leak out of the surface — and that tiny leakage field grabs magnetic particles, drawing a picture of the flaw. It is fast, sensitive and a workhorse of steel inspection.",
    sections: [
      { h: "A little magnetism",
        p: "A magnetic field runs through a ferromagnetic material as continuous lines of flux, much like current through a wire. Ferromagnetic materials — most steels, iron, and some nickel and cobalt alloys — concentrate and carry this flux strongly. As long as the flux flows uninterrupted below the surface, nothing shows. The method depends entirely on the material being ferromagnetic; aluminium, most stainless steels and non-metals cannot be tested this way.",
        list: ["Magnetic flux flows through the part as continuous field lines", "Ferromagnetic materials carry flux strongly", "Only ferromagnetic materials can be inspected by MT"] },
      { h: "The principle: flux leakage",
        p: "When a crack or discontinuity interrupts the flux path, the field cannot stay entirely inside the metal — it bulges out of the surface on either side of the flaw, creating a local 'leakage field' with tiny north and south poles at the crack edges. If fine magnetic particles are present, they are attracted to and bridge this leakage field, piling up directly over the flaw and forming a visible indication far wider than the crack itself.",
        list: ["A flaw interrupts the flux and forces a leakage field out of the surface", "The leakage field acts like a tiny magnet with poles at the crack", "Magnetic particles gather at the leakage field, outlining the flaw"] },
      { h: "Field direction and material",
        p: "A flaw only disturbs the flux if it lies across the field — a crack parallel to the field barely leaks and can be missed. So the field must be oriented across the expected flaw, which is why parts are magnetised in more than one direction (longitudinal and circular fields). And because it all depends on carrying flux, MT is limited to ferromagnetic materials with enough permeability to sustain a strong field.",
        list: ["Flaws across the field leak strongly; flaws parallel to it are missed", "Longitudinal and circular fields are used to catch all orientations", "Restricted to ferromagnetic materials"] },
    ],
    keyTerms: [
      { t: "Ferromagnetic", d: "Able to be strongly magnetised and to carry magnetic flux (e.g. most steels)." },
      { t: "Magnetic flux", d: "The magnetic field flowing through the material as continuous lines." },
      { t: "Leakage field", d: "The magnetic field that bulges out of the surface at a flaw, attracting particles." },
      { t: "Permeability", d: "How readily a material carries magnetic flux." },
    ],
    applications: [
      "Surface and near-surface crack detection in steel landing-gear forgings",
      "Weld inspection on ferromagnetic structural and engine components",
      "Crankshafts, shafts and fasteners where fatigue cracks initiate at the surface",
    ],
    takeaways: [
      "MT works only on ferromagnetic materials by carrying magnetic flux.",
      "A flaw across the flux creates a surface leakage field that gathers magnetic particles.",
      "Flaws must lie across the field, so parts are magnetised in more than one direction.",
    ],
  },
  "2.7": {
    overview:
      "You cannot find a crack the field runs parallel to — so magnetising the part correctly is the heart of MPT. This session covers how a field is put into a part (directly by passing current, or indirectly by inducing it) and the practical yoke and coil techniques that set the field's direction relative to the flaw you are hunting.",
    sections: [
      { h: "Direct vs indirect magnetization",
        p: "In direct magnetization, current is passed through the part itself (via contacts or a central conductor). By the right-hand rule the current creates a circular magnetic field around the current path, ideal for finding cracks that run along the length of the part. In indirect magnetization, the part is placed in a magnetic field produced by an external source — a yoke or a coil — without passing current through the part, inducing a field in it.",
        list: ["Direct — current through the part creates a circular field", "Indirect — an external yoke or coil induces the field", "Circular fields find longitudinal flaws; longitudinal fields find transverse flaws"] },
      { h: "The yoke method",
        p: "A yoke is a C-shaped electromagnet (or permanent magnet) placed with its two poles on the surface. It drives a longitudinal magnetic field through the region between the poles — perfect for detecting cracks that lie transverse (across) the line between the poles. Yokes are portable, need no electrical contact with the part (so no risk of arc burns), and are the standard tool for field and weld inspection.",
        list: ["A C-shaped electromagnet spanning the inspection area", "Creates a longitudinal field between its poles", "Finds cracks transverse to the pole line; portable and contactless"] },
      { h: "The coil method",
        p: "Passing current through a coil that encircles the part creates a strong longitudinal field along the part's axis — ideal for detecting transverse cracks in long parts like shafts and bars. Coil magnetization is a form of indirect magnetization and is combined with circular methods so that, between them, flaws of every orientation are covered. Choosing direct vs indirect and yoke vs coil is really choosing which flaw orientation you want to reveal.",
        list: ["A coil around the part gives a longitudinal (axial) field", "Reveals transverse cracks in long parts (shafts, bars)", "Combined with circular methods to cover all flaw orientations"] },
    ],
    keyTerms: [
      { t: "Direct magnetization", d: "Passing current through the part to create a circular magnetic field." },
      { t: "Yoke", d: "A C-shaped electromagnet that induces a longitudinal field between its poles." },
      { t: "Coil (encircling) method", d: "A coil around the part producing an axial field for transverse flaws." },
      { t: "Circular field", d: "A field looping around a current path; reveals longitudinal flaws." },
    ],
    applications: [
      "Portable yoke inspection of welds and structural steel in the field",
      "Coil magnetization of shafts and bars for transverse fatigue cracks",
      "Multi-direction magnetization to guarantee all flaw orientations are covered",
    ],
    takeaways: [
      "Direct magnetization (current through part) gives a circular field; indirect (yoke/coil) gives a longitudinal one.",
      "Field direction must cross the flaw — parts are magnetised in more than one direction.",
      "Yoke = portable, contactless, transverse cracks; coil = axial field for long parts.",
    ],
  },
  "2.8": {
    overview:
      "The magnetic field does the finding, but the particles do the showing. This session covers the inspection media — wet and dry, visible and fluorescent magnetic particles — and how they are applied while the part is magnetised so they migrate to leakage fields and outline surface and near-surface flaws.",
    sections: [
      { h: "Types of magnetic particles",
        p: "Magnetic particles are finely divided ferromagnetic powder, engineered to be mobile and highly attracted to weak leakage fields. Dry particles are coloured powders (grey, red, yellow) dusted onto the part — good for rough surfaces and portable field work. Wet particles are suspended in a liquid carrier (water or light oil) and flowed over the part — the suspension carries particles into fine flaws, giving higher sensitivity. Both come in visible colours or fluorescent grades that glow under UV.",
        list: ["Dry powder — good on rough surfaces, field-portable", "Wet suspension — higher sensitivity for fine flaws", "Visible (coloured) or fluorescent (UV) grades"] },
      { h: "Application and detection",
        p: "Timing matters: particles must be present while the part is magnetised so the leakage field can attract and hold them. In the continuous method, particles are applied during magnetization; in the residual method they are applied after, relying on the part's remnant field. As particles reach a leakage field they bridge across the flaw and pile up, forming an indication that is read directly — under white light for visible particles, or UV in a darkened area for fluorescent.",
        list: ["Particles applied while (or just after) the part is magnetised", "They migrate to and bridge the leakage field", "Read under white light or UV depending on particle type"] },
      { h: "What it reveals",
        p: "Because the leakage field extends a little below the surface, MT reveals both surface-breaking flaws and slightly sub-surface flaws in ferromagnetic parts — a small but valuable edge over penetrant, which sees only what actually breaks the surface. Sensitivity falls off quickly with depth, so it remains a surface and near-surface method." },
    ],
    keyTerms: [
      { t: "Magnetic particles", d: "Fine ferromagnetic powder, wet or dry, that gathers at leakage fields." },
      { t: "Continuous method", d: "Applying particles while the part is being magnetised for best sensitivity." },
      { t: "Wet suspension", d: "Particles carried in liquid for higher sensitivity to fine flaws." },
      { t: "Near-surface flaw", d: "A flaw just below the surface that MT can still reveal." },
    ],
    applications: [
      "Fluorescent wet-bench MT of critical steel engine and gear components",
      "Dry-powder yoke inspection of welds and rough field surfaces",
      "Detecting slightly sub-surface flaws that penetrant would miss",
    ],
    takeaways: [
      "Particles come dry or wet, visible or fluorescent — chosen for surface and sensitivity.",
      "They must be present while the part is magnetised to gather at leakage fields.",
      "MT reveals surface and slightly sub-surface flaws in ferromagnetic parts.",
    ],
  },
  "2.9": {
    overview:
      "After magnetic particle testing, a part can hold onto residual magnetism — and that leftover field is not harmless. It attracts iron debris, disturbs machining and welding, and can throw off instruments. Demagnetization removes it, and understanding residual magnetism is part of doing MT responsibly.",
    sections: [
      { h: "Why demagnetize",
        p: "Once magnetised, a ferromagnetic part often retains some field (remanence). This residual magnetism can attract fine iron filings and swarf that interfere with moving parts and bearings, deflect nearby compasses and instruments, disturb subsequent welding arcs, and cause chips to cling during machining. For many aerospace and precision parts, verifying the part is demagnetised below a specified limit is a required final step.",
        list: ["Attracts iron debris into bearings and moving parts", "Disturbs welding arcs and machining", "Deflects instruments; often limited by specification"] },
      { h: "How demagnetization works",
        p: "Demagnetization drives the material through repeated magnetic reversals of steadily decreasing strength, shrinking the magnetic domains' net alignment back toward zero. The classic method passes the part through, or applies, an alternating current (AC) field whose amplitude is gradually reduced — for example by slowly withdrawing the part from an AC coil, or by an electronic decaying-AC cycle. Heating the part above its Curie point also removes magnetism but is rarely practical.",
        list: ["Apply a reversing field of decreasing amplitude", "AC coil withdrawal or electronic decaying AC", "Heating above the Curie temperature (rarely used)"] },
      { h: "Managing residual magnetism",
        p: "Residual magnetism is measured with a field indicator (gauss meter); acceptance limits are set by specification. If a part reads above the limit it is re-demagnetised and re-checked. Some MT techniques even use the residual field deliberately (the residual method), but where downstream operations or service demand it, demagnetization and verification close out the inspection." },
    ],
    keyTerms: [
      { t: "Residual magnetism (remanence)", d: "The magnetic field a part retains after being magnetised." },
      { t: "Demagnetization", d: "Removing residual magnetism by reversing fields of decreasing strength." },
      { t: "Curie point", d: "The temperature above which a material loses its ferromagnetism." },
      { t: "Gauss meter", d: "An instrument that measures residual magnetic field strength." },
    ],
    applications: [
      "Demagnetising and verifying engine and bearing components after MT",
      "Removing residual fields before welding or precision machining",
      "Field-indicator checks against specification limits on finished parts",
    ],
    takeaways: [
      "Residual magnetism attracts debris and disturbs machining, welding and instruments.",
      "Demagnetization applies a reversing field of decreasing amplitude (usually AC).",
      "Residual field is measured with a gauss meter and must meet a specified limit.",
    ],
  },

  /* ═══════════════════════ UNIT III ═══════════════════════ */
  "3.1": {
    overview:
      "Thermography inspects a part by watching how heat moves through it. A flaw — a delamination, a void, a debond — disturbs the flow of heat, and that disturbance shows up as a warm or cool patch on the surface. An infrared camera turns that invisible temperature map into an image, letting you see inside without touching the part.",
    sections: [
      { h: "The idea of thermal imaging",
        p: "Everything above absolute zero radiates infrared energy in proportion to its temperature. A thermal (infrared) camera measures that radiation and paints a false-colour map of surface temperature. In NDT the trick is that subsurface features change how heat conducts to the surface: a void or delamination is a poor conductor, so heat piles up (or fails to arrive) above it, creating a hot or cold spot the camera can see.",
        list: ["All bodies emit infrared radiation set by their temperature", "A camera maps that radiation to a temperature image", "Subsurface flaws disturb heat flow → hot/cold spots on the surface"] },
      { h: "Heat transfer and infrared basics",
        p: "Heat moves three ways: conduction (through the solid), convection (via a fluid) and radiation (as infrared). Thermography relies on conduction differences inside the part and on the radiation the surface emits. How strongly a surface radiates depends on its emissivity — a dull black surface radiates efficiently, a shiny metal one poorly — which is why surface condition strongly affects a thermographic result.",
        list: ["Conduction, convection and radiation carry heat", "The camera reads emitted infrared radiation", "Emissivity (surface finish) governs how well a surface radiates"] },
    ],
    keyTerms: [
      { t: "Infrared radiation", d: "Heat energy radiated by all bodies, imaged by a thermal camera." },
      { t: "Emissivity", d: "How efficiently a surface radiates infrared; dull dark surfaces are high, shiny metals low." },
      { t: "Thermal contrast", d: "The temperature difference between a flaw region and sound material." },
      { t: "Delamination", d: "A separation between layers (e.g. in composites) that blocks heat flow." },
    ],
    applications: [
      "Detecting delaminations and disbonds in aircraft composite structures",
      "Finding overheating electrical connections and components",
      "Mapping heat loss and moisture in structures and insulation",
    ],
    takeaways: [
      "Thermography images surface temperature to reveal subsurface flaws.",
      "Flaws disturb heat flow, creating hot or cold spots on the surface.",
      "Emissivity and surface condition strongly affect the result.",
    ],
  },
  "3.2": {
    overview:
      "There are two ways to read a part's temperature: touch it with a material that changes colour with heat (contact), or read its infrared radiation from a distance with a camera (non-contact). Each has a place — liquid crystals are cheap and vivid; infrared cameras are fast, remote and cover large areas.",
    sections: [
      { h: "Contact — liquid crystal thermography",
        p: "Thermochromic liquid crystals are coatings that change colour with temperature. Applied to a surface, they map the temperature field directly as a spectrum of colours you can photograph — red-to-blue across a narrow band. They are inexpensive and give vivid, high-resolution maps, but they must physically contact the surface, work over a narrow temperature range, and only show surface temperature.",
        list: ["Thermochromic coatings change colour with temperature", "Give a vivid, direct colour map on the surface", "Narrow temperature range; surface contact required"] },
      { h: "Non-contact — infrared cameras",
        p: "Infrared cameras read the radiation a surface emits without touching it, imaging temperature remotely, quickly and over large areas. They work at a distance (useful for hot, moving or inaccessible parts), cover wide fields of view, and record digital images for analysis. They cost more and depend on knowing the surface emissivity, but they are the mainstream tool for modern thermographic inspection.",
        list: ["Remote — no contact, works on hot/moving/inaccessible parts", "Fast, wide-area, digital images for analysis", "Requires knowledge of surface emissivity"] },
    ],
    keyTerms: [
      { t: "Liquid crystal thermography", d: "Contact method using thermochromic coatings that change colour with temperature." },
      { t: "Infrared camera", d: "A non-contact instrument that images a surface's temperature from its radiation." },
      { t: "Thermochromic", d: "Changing colour with temperature." },
      { t: "Field of view", d: "The area a camera images at once." },
    ],
    applications: [
      "Liquid-crystal mapping of temperature fields on small components",
      "Infrared-camera survey of large composite panels and structures",
      "Remote inspection of energised or hot equipment",
    ],
    takeaways: [
      "Contact (liquid crystal) gives a vivid surface colour map but needs contact and a narrow range.",
      "Non-contact (IR camera) is remote, fast and wide-area, but needs emissivity data.",
      "Both read surface temperature to infer subsurface condition.",
    ],
  },
  "3.3": {
    overview:
      "Liquid-crystal thermography turns temperature into colour you can see and photograph — but it only works if the coating is applied evenly, calibrated to a colour-temperature scale, and read correctly. This session covers the practical technique.",
    sections: [
      { h: "Coating and calibration",
        p: "Thermochromic liquid crystals are sprayed or filmed onto the surface as a thin, even layer, usually over a black backing so the colours read clearly. Each formulation responds over a specific narrow temperature band, so the crystal is chosen to match the temperatures of interest, and a calibration relates each colour to a temperature. An uneven coat or the wrong band gives misleading colours.",
        list: ["Spray or film a thin, even thermochromic layer (often on black)", "Choose a crystal formulation matching the temperature band", "Calibrate colour to temperature against a reference"] },
      { h: "Visualization, advantages and limits",
        p: "Under even lighting the coating displays a colour map that is photographed and compared to the calibration to read temperatures and spot anomalies. The method is cheap, gives vivid high-resolution surface maps, and needs no expensive camera — but it is limited to a narrow temperature range, only shows surface temperature, requires contact, and the coating must be applied and often removed each time.",
        list: ["Photograph the colour map and read against the calibration", "Cheap, vivid, high spatial resolution", "Narrow range, surface-only, contact and coating required"] },
    ],
    keyTerms: [
      { t: "Thermochromic liquid crystal", d: "A coating whose colour maps to temperature over a narrow band." },
      { t: "Calibration", d: "Relating each displayed colour to a known temperature." },
      { t: "Colour-play band", d: "The narrow temperature range over which the crystal changes colour." },
      { t: "Surface temperature", d: "The temperature at the surface — all that this method shows." },
    ],
    applications: [
      "High-resolution temperature mapping of electronic and small mechanical parts",
      "Flow and heat-transfer visualization in wind-tunnel and lab work",
      "Low-cost thermal surveys where an IR camera isn't available",
    ],
    takeaways: [
      "Liquid crystals must be applied evenly and calibrated colour-to-temperature.",
      "They give cheap, vivid, high-resolution surface maps.",
      "They are limited to a narrow range, surface-only, and need contact.",
    ],
  },
  "3.4": {
    overview:
      "Infrared is a band of the spectrum, not a single thing, and the detectors that sense it come in two families with very different behaviour. Understanding the IR regions and the thermal-vs-photon detector trade-off explains why some cameras are cheap and slow while others are cooled, fast and sensitive.",
    sections: [
      { h: "The infrared regions",
        p: "Infrared sits just beyond visible red light and is split into near, mid and far (long-wave) bands. Thermal imaging of everyday temperatures uses the mid- and long-wave regions, where objects near room temperature radiate most strongly. The band a camera works in sets what it sees best — long-wave cameras suit ambient-temperature scenes, mid-wave suit hotter targets.",
        list: ["IR lies beyond visible red: near, mid and far (long-wave)", "Room-temperature objects radiate most in mid/long-wave", "The camera's band sets what it images best"] },
      { h: "Thermal vs photon detectors",
        p: "Thermal detectors (such as microbolometers) absorb IR and change a physical property with the resulting temperature rise — they are uncooled, cheap and robust but slower and less sensitive. Photon (quantum) detectors directly convert IR photons to an electrical signal in a semiconductor, giving high sensitivity and speed, but they must be cryogenically cooled and are expensive. The choice trades cost against sensitivity, resolution and speed.",
        list: ["Thermal (bolometer) — uncooled, cheap, robust, slower", "Photon (quantum) — cooled, fast, very sensitive, costly", "Sensitivity, speed and resolution trade against cost"] },
    ],
    keyTerms: [
      { t: "Microbolometer", d: "An uncooled thermal detector that changes resistance with absorbed heat." },
      { t: "Photon detector", d: "A cooled detector that converts IR photons directly to signal — high sensitivity." },
      { t: "Long-wave IR", d: "The infrared band best for imaging near-room-temperature objects." },
      { t: "Thermal sensitivity (NETD)", d: "The smallest temperature difference a camera can resolve." },
    ],
    applications: [
      "Uncooled microbolometer cameras for general maintenance thermography",
      "Cooled photon-detector cameras for high-speed active thermography",
      "Selecting a waveband to match target temperature",
    ],
    takeaways: [
      "Infrared splits into near, mid and far (long-wave) regions.",
      "Thermal detectors are cheap and uncooled; photon detectors are cooled, fast and sensitive.",
      "The choice trades cost against sensitivity, speed and resolution.",
    ],
  },
  "3.5": {
    overview:
      "A thermographic inspection is more than a camera — it's an instrument chain and a technique. The biggest technique decision is whether to read the heat a part already has (passive) or to apply a heat pulse and watch it dissipate (active), which is what turns thermography into a powerful flaw-detection tool.",
    sections: [
      { h: "The instrument chain",
        p: "A thermographic system is the IR camera plus the optics, the display and recording, and increasingly the software that processes image sequences. Scanners and line cameras cover large or moving surfaces; recorders capture the time-evolution of temperature. Modern systems store digital image sequences so the way a surface heats and cools can be analysed, not just a single snapshot.",
        list: ["IR camera, optics, display and recorder", "Scanners/line cameras for large or moving areas", "Software analyses temperature sequences over time"] },
      { h: "Active vs passive thermography",
        p: "Passive thermography reads the natural temperature differences a part already has — a hot electrical joint, a warm bearing. Active thermography deliberately applies a heat stimulus (a flash lamp, a heat pulse, or a modulated source) and films how the surface temperature evolves: sound material dissipates heat evenly, while flaws slow or trap it, appearing as anomalies in the cooling sequence. Active thermography is what reveals hidden delaminations and disbonds.",
        list: ["Passive — read the heat the part already has", "Active — apply a heat pulse and watch it dissipate", "Flaws disturb the cooling sequence and stand out"] },
    ],
    keyTerms: [
      { t: "Passive thermography", d: "Imaging the natural temperature differences a part already has." },
      { t: "Active thermography", d: "Applying a heat stimulus and imaging how the surface cools." },
      { t: "Flash thermography", d: "Active thermography using a brief, intense light flash as the stimulus." },
      { t: "Thermogram", d: "A single thermal image or frame in a sequence." },
    ],
    applications: [
      "Flash active thermography of composite panels for delaminations",
      "Passive surveys of electrical switchgear for hot connections",
      "Aerospace, electrical and mechanical condition monitoring",
    ],
    takeaways: [
      "A thermographic system is a camera plus optics, recording and analysis software.",
      "Passive reads existing heat; active applies a pulse and watches it dissipate.",
      "Active thermography reveals hidden delaminations and disbonds.",
    ],
  },
  "3.6": {
    overview:
      "Eddy Current Testing uses electromagnetism to find flaws in conductors without touching the metal directly. An alternating-current coil induces swirling eddy currents in the part; a crack disrupts them, and that disruption reflects back into the coil as a measurable change. No couplant, no contact chemistry — just fields.",
    sections: [
      { h: "Electromagnetic induction",
        p: "When an AC coil is brought near a conductor, its changing magnetic field induces circulating electric currents — eddy currents — in the surface of the part. These eddy currents create their own opposing magnetic field, which loads the coil and changes its electrical impedance. The instrument watches that impedance: a smooth, defect-free conductor gives a steady baseline.",
        list: ["An AC coil's changing field induces eddy currents in a conductor", "Eddy currents create an opposing field that loads the coil", "The instrument reads the coil's impedance"] },
      { h: "Interaction with defects",
        p: "A crack or discontinuity forces the eddy currents to divert around it, changing their strength and path. That change alters the opposing field and therefore the coil's impedance, producing a signal on the instrument's impedance-plane display. Because it senses the eddy currents directly, ET is extremely sensitive to tiny surface and near-surface cracks in conductive materials.",
        list: ["A flaw diverts the eddy currents and changes their path", "That changes the coil's impedance → a signal", "Very sensitive to fine surface / near-surface cracks"] },
      { h: "Properties of eddy currents",
        p: "Eddy currents are strongest at the surface and weaken with depth — the 'skin effect'. How deep they penetrate depends on the excitation frequency (higher frequency = shallower, more surface-sensitive) and on the material's conductivity and permeability. Choosing the frequency tunes the inspection between fine surface sensitivity and greater depth, which is central to using ET well.",
        list: ["Skin effect — eddy currents are strongest at the surface", "Higher frequency = shallower penetration, more surface-sensitive", "Depth also depends on conductivity and permeability"] },
    ],
    keyTerms: [
      { t: "Eddy currents", d: "Circulating currents induced in a conductor by a changing magnetic field." },
      { t: "Impedance", d: "The coil's opposition to AC; its change is the ET signal." },
      { t: "Skin effect", d: "The tendency of eddy currents to concentrate near the surface." },
      { t: "Frequency", d: "The excitation frequency that sets penetration depth and sensitivity." },
    ],
    applications: [
      "Surface fatigue-crack detection in aircraft skins and fastener holes",
      "Sorting alloys and verifying heat treatment by conductivity",
      "Inspecting heat-exchanger and boiler tubes",
    ],
    takeaways: [
      "An AC coil induces eddy currents; a flaw disturbs them, changing the coil's impedance.",
      "ET is very sensitive to fine surface and near-surface cracks in conductors.",
      "Frequency sets penetration depth (skin effect) — a key inspection choice.",
    ],
  },
  "3.7": {
    overview:
      "The probe is where eddy current testing meets the part, and its design decides what the method can do. Absolute, differential and reflection probes each read the part differently; coil geometry and shielding tune sensitivity and focus; and the instrument turns the coil's impedance into a signal you can interpret.",
    sections: [
      { h: "Probe types",
        p: "An absolute probe uses a single coil and reads the part against a fixed reference — good for measuring conductivity, thickness and gradual changes. A differential probe uses two coils that compare adjacent regions of the part, so it responds strongly to abrupt changes like cracks while ignoring slow drift — excellent for crack detection. A reflection (driver-pickup) probe separates the exciting coil from the sensing coil for tuned performance.",
        list: ["Absolute — one coil vs a reference; conductivity/thickness", "Differential — two coils compare adjacent regions; great for cracks", "Reflection — separate driver and pickup coils"] },
      { h: "Coil design and shielding",
        p: "The coil's size and shape set the trade-off between sensitivity and coverage: a small coil resolves fine flaws but covers little area; a larger one covers more but resolves less. Shielding (ferrite cores or metal shields) focuses the field to a smaller footprint, improving resolution and reducing interference from nearby edges and features.",
        list: ["Coil size trades resolution against coverage", "Shielding focuses the field to a smaller footprint", "Better resolution and less edge interference"] },
      { h: "Instrumentation",
        p: "The instrument drives the coil with an AC excitation, measures the resulting impedance, and processes and displays it — most usefully on an impedance-plane display where different effects (lift-off, cracks, conductivity) appear as signals in different directions. Reading those directions and shapes is how an operator separates a real flaw from lift-off or a benign feature.",
        list: ["Drive the coil, measure impedance, process and display", "Impedance-plane display separates effects by direction", "Interpretation distinguishes flaws from lift-off and features"] },
    ],
    keyTerms: [
      { t: "Absolute probe", d: "A single-coil probe reading the part against a reference." },
      { t: "Differential probe", d: "A two-coil probe comparing adjacent regions — strong on cracks." },
      { t: "Lift-off", d: "The signal change as the probe rises off the surface; a key effect to separate from flaws." },
      { t: "Impedance plane", d: "The display where different effects appear as signals in different directions." },
    ],
    applications: [
      "Differential probes for fatigue-crack detection around fastener holes",
      "Absolute probes for conductivity and coating-thickness measurement",
      "Shielded probes for inspecting near edges and complex geometry",
    ],
    takeaways: [
      "Absolute probes suit conductivity/thickness; differential probes excel at cracks.",
      "Coil size and shielding trade resolution against coverage and focus the field.",
      "The impedance-plane display separates cracks from lift-off by signal direction.",
    ],
  },
  "3.8": {
    overview:
      "How the coil is arranged around the part decides which jobs eddy current can do. Surface probes scan a face; encircling coils inspect bars and tubes as they pass through; remote-field techniques see through tube walls; and lift-off is turned from a nuisance into a coating-thickness gauge.",
    sections: [
      { h: "Coil arrangements",
        p: "A surface (probe) coil is placed on and scanned across a surface to find cracks — the most common arrangement. An encircling coil surrounds a bar, wire or tube so the whole cross-section is inspected as the part passes through, ideal for high-speed production testing. An internal (bobbin) coil runs inside a tube. Lift-off — the gap between coil and surface — changes the signal and, calibrated, becomes a measurement of non-conductive coating thickness.",
        list: ["Surface probe — scanned over a face for cracks", "Encircling coil — bars/tubes tested through the cross-section", "Lift-off calibrated to measure coating thickness"] },
      { h: "Remote field eddy current",
        p: "Standard eddy currents can't see through a thick tube wall, but the remote-field technique can: it uses the field that travels through the wall and back, letting an internal probe assess wall thinning and defects from the far side. It is widely used to inspect the walls of heat-exchanger and boiler tubes that are only accessible from the inside.",
        list: ["Uses the field that passes through and back along the tube wall", "An internal probe assesses the full wall thickness", "Standard for heat-exchanger and boiler tube inspection"] },
      { h: "Applications",
        p: "Together these arrangements cover crack detection on surfaces, conductivity sorting of materials, coating-thickness gauging, and tube-wall inspection. Matching the arrangement to the geometry — face, bar, tube, internal — is how eddy current is deployed across aerospace, power and manufacturing.",
        list: ["Crack detection, conductivity sorting, coating thickness", "Tube-wall inspection by remote field", "Arrangement chosen to match the part geometry"] },
    ],
    keyTerms: [
      { t: "Surface probe", d: "A coil scanned over a surface to detect cracks." },
      { t: "Encircling coil", d: "A coil surrounding a bar or tube to inspect its full cross-section." },
      { t: "Remote-field ET", d: "A technique using the through-wall field to inspect tube walls from inside." },
      { t: "Coating thickness", d: "Non-conductive coating measured via the lift-off signal." },
    ],
    applications: [
      "Encircling-coil testing of bar and tube stock at production speed",
      "Remote-field inspection of heat-exchanger tube walls",
      "Lift-off-based paint and coating thickness measurement",
    ],
    takeaways: [
      "Surface probes find cracks; encircling coils test bars and tubes through the cross-section.",
      "Remote-field ET inspects tube walls from the inside.",
      "Calibrated lift-off measures non-conductive coating thickness.",
    ],
  },
  "3.9": {
    overview:
      "Eddy current is fast, sensitive and needs no couplant — a favourite for surface crack detection on conductors. But it only works on conductive materials, it is shallow, and its signals take skill to read. Knowing these bounds is what separates reliable ET from false calls.",
    sections: [
      { h: "Benefits and constraints",
        p: "ET's strengths are speed, high sensitivity to tiny surface cracks, no need for a couplant or contact chemistry, and the ability to measure conductivity and coating thickness as a bonus. Its constraints are real: it works only on electrically conductive materials, it is limited to surface and near-surface depths (the skin effect), it is sensitive to lift-off and edge effects, and complex geometry can confuse the signal.",
        list: ["Fast, very sensitive, no couplant, measures conductivity/thickness", "Conductive materials only; shallow (surface/near-surface)", "Sensitive to lift-off, edges and geometry"] },
      { h: "Interpretation and evaluation",
        p: "Because so many effects change the coil's impedance — cracks, lift-off, conductivity, edges — the operator must read the impedance-plane signal by its direction and shape to separate a real flaw from a benign effect. Calibration on reference standards with known flaws sets the response, and skilled interpretation rejects the false indications that lift-off and geometry create. ET is only as reliable as the person reading the display.",
        list: ["Many effects move the signal — read direction and shape", "Calibrate on reference standards with known flaws", "Skilled interpretation rejects false indications"] },
    ],
    keyTerms: [
      { t: "Couplant-free", d: "ET needs no coupling medium, unlike ultrasonics." },
      { t: "Edge effect", d: "A signal disturbance as the probe nears an edge — a source of false calls." },
      { t: "Reference standard", d: "A calibration block with known flaws used to set the ET response." },
      { t: "Signal interpretation", d: "Reading the impedance-plane signal to separate flaws from benign effects." },
    ],
    applications: [
      "Rapid fastener-hole and skin crack inspection on aircraft",
      "Conductivity sorting and heat-treat verification",
      "Rejecting lift-off/edge false calls through calibrated interpretation",
    ],
    takeaways: [
      "ET is fast, sensitive and couplant-free but works only on conductors and is shallow.",
      "Lift-off, edges and geometry cause false signals.",
      "Calibration and skilled impedance-plane interpretation make it reliable.",
    ],
  },

  /* ═══════════════════════ UNIT IV ═══════════════════════ */
  "4.1": {
    overview:
      "Ultrasonic Testing sends pulses of high-frequency sound into a part and listens for the echoes. Sound travels cleanly through solid metal but reflects wherever it meets a boundary — the back wall, or a hidden flaw. By timing and measuring those echoes, UT reveals internal defects and thickness that no surface method can reach.",
    sections: [
      { h: "Wave propagation",
        p: "UT uses sound far above hearing — typically 0.5 to 20 MHz. The sound travels through the material as waves: longitudinal (compression) waves push and pull along the direction of travel, while shear (transverse) waves vibrate across it and are used for angled inspection. Each wave type travels at a characteristic speed set by the material, and that speed links time-of-flight to distance.",
        list: ["High-frequency sound (0.5–20 MHz) travels through the solid", "Longitudinal (compression) and shear (transverse) waves", "Each travels at a material-specific speed — time maps to distance"] },
      { h: "Interaction with materials and defects",
        p: "Sound reflects wherever the acoustic impedance changes — at the back wall, and at any flaw (a crack, void or inclusion) whose interface differs from the surrounding metal. A flaw facing the beam reflects a strong echo back to the probe; the time it takes to return tells you how deep the flaw is, and the echo height hints at its size. Sound also refracts and scatters at boundaries, which angled and rough inspections must account for.",
        list: ["Reflection occurs where acoustic impedance changes (flaws, back wall)", "Echo timing gives flaw depth; echo height hints at size", "Refraction and scatter occur at boundaries"] },
    ],
    keyTerms: [
      { t: "Longitudinal wave", d: "A compression wave vibrating along its direction of travel." },
      { t: "Shear wave", d: "A transverse wave vibrating across its direction of travel; used for angle-beam work." },
      { t: "Acoustic impedance", d: "Density × sound velocity; reflections occur where it changes." },
      { t: "Time of flight", d: "The travel time of a pulse, converted to distance/depth." },
    ],
    applications: [
      "Detecting and depth-sizing internal cracks and lack of fusion in welds",
      "Thickness gauging of corroding walls and structures",
      "Finding laminations and internal flaws in plate and forgings",
    ],
    takeaways: [
      "UT sends high-frequency sound into a part and times the echoes.",
      "Reflections occur wherever acoustic impedance changes — flaws and back wall.",
      "Echo timing gives depth; echo height hints at size.",
    ],
  },
  "4.2": {
    overview:
      "The transducer is the heart of ultrasonic testing — it turns electricity into sound and sound back into electricity, using the piezoelectric effect. Contact, immersion and dual-element designs package that crystal for different jobs, from hand scanning a weld to automated tank inspection.",
    sections: [
      { h: "The piezoelectric principle",
        p: "A piezoelectric crystal changes shape when a voltage is applied and, conversely, generates a voltage when it is deformed by a returning sound wave. In pulse-echo UT the same crystal is pulsed to launch a sound wave into the part and then listens for the echo, converting the returning pressure back into an electrical signal the instrument displays. This two-way transduction is what makes a single probe both source and receiver.",
        list: ["Voltage deforms the crystal → it launches a sound pulse", "A returning echo deforms the crystal → it generates a voltage", "One crystal can both send and receive (pulse-echo)"] },
      { h: "Transducer types",
        p: "A contact probe is pressed onto the part through a thin couplant film — the everyday hand-scanning tool. An immersion probe works with the part underwater, so sound couples through the water without touching — ideal for automated, high-resolution scanning. A dual-element (TR) probe has separate transmit and receive crystals, which improves near-surface resolution and suits thickness gauging and corrosion mapping.",
        list: ["Contact — pressed on through couplant; general hand scanning", "Immersion — coupled through water; automated, high-resolution", "Dual-element (TR) — separate send/receive; near-surface & thickness"] },
    ],
    keyTerms: [
      { t: "Piezoelectric effect", d: "A crystal that converts voltage to strain and strain to voltage — the basis of the probe." },
      { t: "Couplant", d: "A gel or liquid that carries sound from probe into the part (air blocks ultrasound)." },
      { t: "Immersion testing", d: "Coupling sound through water for automated, high-resolution scanning." },
      { t: "Dual-element probe", d: "A probe with separate transmit and receive crystals for near-surface work." },
    ],
    applications: [
      "Contact probes for manual weld and forging inspection",
      "Immersion scanning of precision aerospace components",
      "Dual-element probes for corrosion thickness mapping",
    ],
    takeaways: [
      "A piezoelectric crystal converts voltage to sound and sound back to voltage.",
      "Contact, immersion and dual-element probes suit different jobs.",
      "Ultrasound needs a couplant — air stops it.",
    ],
  },
  "4.3": {
    overview:
      "There are two basic ways to arrange an ultrasonic test: send sound through the part to a receiver on the far side (through-transmission), or send and receive from the same side and time the echoes (pulse-echo). Pulse-echo is by far the more common because it needs access to only one side and locates flaws by depth.",
    sections: [
      { h: "Through-transmission",
        p: "In through-transmission a transmitter on one face sends sound straight through to a receiver on the opposite face. A flaw in the path blocks or scatters sound, so the received signal drops — a loss of transmission signals a defect. It is simple and good for detecting the presence of flaws in thin or attenuating materials, but it needs access to both sides and does not tell you the flaw's depth.",
        list: ["Transmitter and receiver on opposite faces", "A flaw reduces the received signal", "Needs two-sided access; gives no depth"] },
      { h: "Pulse-echo",
        p: "In pulse-echo a single probe sends a pulse and then receives the echoes it produces. The instrument times each echo: the back-wall echo confirms the thickness, and any earlier echo reveals a flaw at a depth given by its arrival time. Because it needs only one side and locates flaws in depth, pulse-echo is the workhorse of ultrasonic inspection — for welds, forgings and thickness gauging alike.",
        list: ["One probe sends and receives from the same side", "Echo timing locates flaws by depth; back-wall echo gives thickness", "One-sided access — the standard method"] },
    ],
    keyTerms: [
      { t: "Through-transmission", d: "Sound sent across the part; a flaw reduces the received signal." },
      { t: "Pulse-echo", d: "One probe sends and receives; echo timing locates flaws by depth." },
      { t: "Back-wall echo", d: "The reflection from the far surface; confirms thickness and coupling." },
      { t: "Loss of back-wall echo", d: "A dropped back-wall echo that can itself indicate a flaw or attenuation." },
    ],
    applications: [
      "Pulse-echo weld and forging inspection with depth location",
      "Through-transmission screening of thin or highly attenuating panels",
      "Thickness gauging from the back-wall echo",
    ],
    takeaways: [
      "Through-transmission needs two sides and shows flaws as lost signal, no depth.",
      "Pulse-echo needs one side and locates flaws by echo timing.",
      "Pulse-echo is the standard method for most inspection.",
    ],
  },
  "4.4": {
    overview:
      "Sound can enter a part straight down or at an angle, and the choice decides which flaws you can find. Straight (normal) beams look for flaws parallel to the surface; angle beams refract the sound sideways to reach cracks in welds and features the straight beam would run past.",
    sections: [
      { h: "Straight beam — principle and use",
        p: "A straight (normal) beam enters perpendicular to the surface and travels straight down. It reflects strongly off anything lying parallel to the surface — laminations in plate, the back wall for thickness, and flat internal flaws facing the beam. It is the simplest inspection and the basis of thickness gauging, but it is blind to flaws oriented along the beam, such as a vertical crack in a weld.",
        list: ["Sound enters perpendicular; travels straight down", "Finds laminations, back wall, flat flaws facing the beam", "Blind to flaws parallel to the beam direction"] },
      { h: "Angle beam — principle and use",
        p: "An angle-beam probe uses a wedge to refract the sound into the part at an angle (often as a shear wave), so it can reach flaws the straight beam misses. Weld inspection depends on it: the angled beam bounces off the far wall and interrogates the weld from the side, catching cracks and lack of fusion oriented across the straight-beam path. The operator moves the probe to sweep the beam through the weld volume.",
        list: ["A wedge refracts sound into the part at an angle", "Reaches weld cracks and off-axis flaws the straight beam misses", "Standard for weld inspection (with skip/half-skip geometry)"] },
    ],
    keyTerms: [
      { t: "Straight (normal) beam", d: "Sound entering perpendicular to the surface." },
      { t: "Angle beam", d: "Sound refracted into the part at an angle to reach off-axis flaws." },
      { t: "Wedge", d: "The angled block that refracts the beam to the required angle." },
      { t: "Skip distance", d: "The surface distance for the angled beam to reflect off the far wall and back." },
    ],
    applications: [
      "Straight-beam lamination checks and thickness gauging of plate",
      "Angle-beam inspection of weld cracks and lack of fusion",
      "Sweeping the beam through a weld volume by probe movement",
    ],
    takeaways: [
      "Straight beams find flaws parallel to the surface and measure thickness.",
      "Angle beams reach weld cracks and off-axis flaws the straight beam misses.",
      "Flaw orientation drives the choice of beam angle.",
    ],
  },
  "4.5": {
    overview:
      "An ultrasonic instrument generates the pulse, amplifies the echoes and shows them — and how it shows them matters. The three data presentations — A-scan, B-scan and C-scan — turn the same echoes into a trace, a cross-section, or a top-down map, each answering a different question.",
    sections: [
      { h: "Pulser/receiver and signal path",
        p: "The pulser fires a short, high-voltage spike that makes the transducer ring and launch a pulse; the receiver amplifies the tiny returning echoes and processes them (gain, filtering, gating) for display. Gain sets sensitivity, and gates flag echoes within a chosen depth window — the controls an operator adjusts to bring a flaw echo up out of the noise without saturating the display.",
        list: ["Pulser fires the probe; receiver amplifies and processes echoes", "Gain sets sensitivity; gates watch a depth window", "Careful setup lifts the flaw echo above the noise"] },
      { h: "A-scan, B-scan and C-scan",
        p: "An A-scan is the basic trace — echo amplitude versus time (depth) at one probe position; it is what the operator reads to detect and size a flaw. A B-scan builds a cross-sectional (side) view by combining A-scans as the probe moves along a line, showing flaw depth and length in profile. A C-scan builds a plan (top-down) map of the part, colour-coding the strongest echo at each position — ideal for imaging the extent of flaws over an area.",
        list: ["A-scan — amplitude vs time (depth) at one point", "B-scan — cross-sectional (side) view along a line", "C-scan — plan (top-down) map over an area"] },
    ],
    keyTerms: [
      { t: "A-scan", d: "The basic echo-amplitude-vs-time trace read to detect and size flaws." },
      { t: "B-scan", d: "A cross-sectional view built from A-scans along a line." },
      { t: "C-scan", d: "A top-down plan map of the part colour-coded by echo strength." },
      { t: "Gate", d: "A depth window that flags or measures echoes within it." },
    ],
    applications: [
      "A-scan flaw detection and depth sizing in manual inspection",
      "C-scan imaging of delamination extent in composites",
      "B-scan corrosion profiling along a line",
    ],
    takeaways: [
      "The pulser/receiver fires the probe and amplifies echoes; gain and gates tune the display.",
      "A-scan = trace, B-scan = cross-section, C-scan = plan map.",
      "Each presentation answers a different question about the flaw.",
    ],
  },
  "4.6": {
    overview:
      "Phased Array Ultrasonic Testing replaces a single crystal with an array of many small elements, fired with tiny timed delays. By choosing the delays, the beam is steered and focused electronically — sweeping through a weld from a stationary probe, and building a live cross-sectional image.",
    sections: [
      { h: "The principle of phased array",
        p: "A PAUT probe contains many small piezoelectric elements in a row. Each element is pulsed at a precisely calculated instant — the 'phasing'. Because the little wavelets from all the elements add up constructively in a chosen direction and depth, the combined beam can be aimed and focused simply by changing the timing, with no moving parts. 'Phased' refers to the timing; 'array' to the many elements.",
        list: ["Many small elements pulsed with programmed time delays", "Wavelets add up to form a beam aimed by the timing", "No moving parts — the beam is shaped electronically"] },
      { h: "Beam steering, focusing and imaging",
        p: "By stepping the delay laws, the beam sweeps through a range of angles (a sectorial scan) and focal depths, interrogating a whole weld volume from one probe position. The returning echoes are assembled into a live, colour-coded sectorial image that shows flaws in cross-section in real time. This speed, coverage and imaging make PAUT a powerful upgrade over single-probe UT for complex geometries and welds.",
        list: ["Delay laws sweep the beam through angles and focal depths", "Echoes build a live sectorial (cross-section) image", "Fast, full-coverage weld inspection from a fixed probe"] },
    ],
    keyTerms: [
      { t: "Phased array", d: "An array of elements pulsed with timed delays to form and steer a beam." },
      { t: "Delay law (focal law)", d: "The set of element timings that aims and focuses the beam." },
      { t: "Sectorial scan (S-scan)", d: "A fan of beam angles building a cross-sectional image." },
      { t: "Beam steering", d: "Aiming the beam electronically by changing the delays." },
    ],
    applications: [
      "Weld inspection with full-volume coverage from a fixed probe",
      "Complex aerospace geometries and curved parts",
      "Real-time sectorial imaging for faster, recordable inspection",
    ],
    takeaways: [
      "PAUT fires many elements with timed delays to steer and focus the beam electronically.",
      "It sweeps a weld volume from a fixed probe and builds a live cross-section image.",
      "It upgrades single-probe UT for coverage, speed and complex geometry.",
    ],
  },
  "4.7": {
    overview:
      "Time of Flight Diffraction sizes flaws by a subtler signal than a reflection — the tiny waves that diffract from the tips of a crack. Because it measures arrival time rather than echo height, TOFD sizes through-wall crack height accurately and repeatably, making it a powerful complement to conventional and phased-array UT.",
    sections: [
      { h: "Diffraction-based sizing",
        p: "TOFD uses two angled probes, one either side of a weld — one transmits, the other receives. When the sound meets a crack, weak waves diffract from the crack's upper and lower tips and travel to the receiver. By timing these diffracted signals, the technique calculates the depth of each tip and hence the through-wall height of the crack — directly, from time of flight, not from how big the echo is.",
        list: ["A transmit and a receive probe straddle the weld", "Waves diffract from the crack's tips", "Tip arrival times give tip depths → crack height"] },
      { h: "Comparison and advantages",
        p: "Conventional pulse-echo sizing relies on echo amplitude, which varies with flaw orientation and can under-size a badly oriented crack. TOFD's time-based sizing is largely independent of amplitude and orientation, so it sizes accurately and repeatably. It also screens a weld quickly in a single pass and leaves a recordable image, which is why TOFD is widely used — often paired with pulse-echo or PAUT — for critical weld inspection and monitoring crack growth.",
        list: ["Amplitude-independent — accurate, repeatable through-wall sizing", "Fast single-pass weld screening with a recordable image", "Often combined with pulse-echo / PAUT for detection + sizing"] },
    ],
    keyTerms: [
      { t: "Diffraction", d: "The bending of waves around a crack tip — the signal TOFD measures." },
      { t: "Tip diffraction", d: "Weak signals from a crack's upper and lower tips used to size it." },
      { t: "Through-wall height", d: "The extent of a crack through the thickness — what TOFD sizes." },
      { t: "Lateral wave", d: "The surface wave in TOFD used as a timing reference." },
    ],
    applications: [
      "Accurate through-wall sizing of weld cracks in pressure equipment",
      "Fast single-pass weld screening with a permanent record",
      "Monitoring crack growth over successive inspections",
    ],
    takeaways: [
      "TOFD times the waves diffracted from crack tips to size through-wall height.",
      "It is amplitude- and orientation-independent, so sizing is accurate and repeatable.",
      "It complements pulse-echo/PAUT: they detect, TOFD sizes.",
    ],
  },
  "4.8": {
    overview:
      "Acoustic Emission is different from every other method: it doesn't send anything into the part — it listens. A growing crack or yielding material releases tiny bursts of stress-wave energy, and sensitive sensors detect these emissions in real time, catching flaws at the moment they become active under load.",
    sections: [
      { h: "Stress-wave emission",
        p: "When a material is stressed, active damage — a crack advancing, fibres breaking, plastic deformation — suddenly releases stored elastic energy as a transient stress wave that ripples out through the structure. Piezoelectric AE sensors mounted on the surface pick up these waves and convert them to electrical signals. Uniquely, the signal comes from the flaw itself, not from an external source, so AE detects damage as it happens.",
        list: ["Active damage releases a burst of stress-wave energy", "Surface-mounted sensors detect the emission", "The signal comes from the flaw itself, in real time"] },
      { h: "AE parameters",
        p: "Each emission (a 'hit') is characterised by parameters extracted from its waveform: amplitude (how strong), counts (threshold crossings), energy, rise time and duration. These parameters classify the source — distinguishing significant crack growth from benign noise like friction — and their pattern over time shows whether damage is stable or accelerating. Multiple sensors also let the source be located by comparing arrival times.",
        list: ["Amplitude, counts, energy, rise time, duration per hit", "Parameters classify the source and its severity", "Arrival-time differences locate the source"] },
    ],
    keyTerms: [
      { t: "Acoustic emission", d: "Transient stress waves released by active damage in a stressed material." },
      { t: "Hit", d: "A single detected emission event." },
      { t: "Amplitude / counts / energy", d: "Waveform parameters used to characterise each emission." },
      { t: "Source location", d: "Finding the emitting flaw by comparing sensor arrival times." },
    ],
    applications: [
      "Monitoring pressure vessels during a proof test for active cracks",
      "Detecting fibre breakage and delamination growth in composites under load",
      "Real-time structural health monitoring during operation",
    ],
    takeaways: [
      "AE listens for the stress waves that active damage emits — the flaw is the source.",
      "Waveform parameters classify and rank each emission.",
      "Multiple sensors locate the active source by arrival-time differences.",
    ],
  },
  "4.9": {
    overview:
      "Because Acoustic Emission monitors a whole structure at once and only reacts to active flaws, it is used where you need to watch large or critical assets under load in real time — pressure vessels, pipelines, aircraft and composites — flagging and locating damage as it grows rather than scanning inch by inch.",
    sections: [
      { h: "Structural monitoring under load",
        p: "AE comes into its own during proof tests and in-service operation, when the structure is under stress. A sparse array of sensors watches the entire vessel, pipeline or airframe simultaneously; as pressure or load rises, any active crack or debond announces itself with emissions. This whole-structure, real-time coverage is impossible with scanning methods, making AE ideal for large pressure vessels, storage tanks and pipelines.",
        list: ["Watches the whole structure at once, under load", "Active flaws emit as stress rises during a proof test or operation", "Ideal for large vessels, tanks and pipelines"] },
      { h: "Source location and its role among methods",
        p: "By comparing the arrival times of an emission at several sensors, AE triangulates where the active source is — so a follow-up inspection with UT or RT can go straight to the spot to characterise and size the flaw. AE is thus a global 'early-warning and location' tool rather than a sizing tool: it tells you where damage is active and how it is progressing, and the other methods then confirm and measure it.",
        list: ["Triangulates the active source from sensor arrival times", "A global early-warning and location tool", "UT/RT then confirm and size the flaw it points to"] },
    ],
    keyTerms: [
      { t: "Proof test", d: "A controlled overpressure/overload during which AE watches for active flaws." },
      { t: "Global monitoring", d: "Watching a whole structure at once, unlike scanning methods." },
      { t: "Zone location", d: "Locating an emitting source from multi-sensor arrival times." },
      { t: "Early warning", d: "AE's role in flagging active damage before failure." },
    ],
    applications: [
      "Pressure-vessel and storage-tank proof testing",
      "Pipeline and bridge structural health monitoring",
      "Composite structure monitoring under fatigue loading",
    ],
    takeaways: [
      "AE monitors whole structures under load and reacts only to active flaws.",
      "It locates the active source for follow-up by UT/RT.",
      "It is a global early-warning and location tool, not a sizing method.",
    ],
  },

  /* ═══════════════════════ UNIT V ═══════════════════════ */
  "5.1": {
    overview:
      "Radiography is the X-ray vision of NDT. Penetrating radiation is passed through a part and onto a detector behind it; denser or thicker material absorbs more, thinner material or a void absorbs less, so the shadow image records the internal structure. Where there's a flaw, the radiation gets through more easily and the film darkens — the defect appears.",
    sections: [
      { h: "How X-rays are generated",
        p: "In an X-ray tube, electrons are accelerated by a high voltage and slammed into a metal target; the sudden deceleration converts some of their energy into X-rays. Higher tube voltage produces more penetrating (harder) radiation for thicker sections. Gamma rays, an alternative source, come from radioactive isotopes (like Iridium-192) and need no power — useful in the field. Either way, a beam of penetrating radiation is aimed through the part.",
        list: ["An X-ray tube accelerates electrons into a target → X-rays", "Higher voltage = more penetrating (harder) radiation", "Gamma rays from isotopes are a portable alternative"] },
      { h: "Absorption, scattering and transmission",
        p: "As radiation passes through the part, some is absorbed, some scattered, and some transmitted through to the detector. How much is absorbed depends on the material's density, atomic number and thickness — more material absorbs more. A void or crack is a bit of 'missing' material, so more radiation gets through that path and the detector (film) darkens there, revealing the flaw as a darker region against the surrounding image.",
        list: ["Radiation is absorbed, scattered and transmitted through the part", "More/denser material absorbs more (attenuation)", "A void transmits more → a darker area on the film reveals it"] },
    ],
    keyTerms: [
      { t: "X-ray tube", d: "A device that produces X-rays by firing electrons at a target." },
      { t: "Gamma source", d: "A radioactive isotope (e.g. Ir-192) producing penetrating gamma rays without power." },
      { t: "Attenuation", d: "The reduction of the radiation beam as it passes through material." },
      { t: "Radiographic contrast", d: "The density difference on the film between a flaw and sound material." },
    ],
    applications: [
      "Imaging internal porosity, inclusions and cracks in welds and castings",
      "Inspecting complex assemblies and internal structure non-invasively",
      "Field gamma radiography of pipeline welds where power is unavailable",
    ],
    takeaways: [
      "Radiography passes penetrating radiation through a part to cast a shadow image.",
      "Denser/thicker material absorbs more; a void transmits more and darkens the film.",
      "X-rays come from a tube (needs power); gamma rays from isotopes (portable).",
    ],
  },
  "5.2": {
    overview:
      "Radiography's image can be captured on traditional film or by modern digital detectors. Film gives superb resolution and a permanent record but needs chemical processing; filmless (digital) methods give instant, computer-handled images — direct detectors read out immediately, while computed radiography uses reusable imaging plates.",
    sections: [
      { h: "Film-based radiography",
        p: "Classic radiography exposes a sheet of silver-halide film placed behind the part. The radiation forms a latent image that is chemically developed, fixed and dried into a permanent radiograph read on a light box. Film offers very high spatial resolution and an archival record, which is why it remained the standard for decades, but it is slow, uses chemicals, and each exposure consumes a film.",
        list: ["Silver-halide film records a latent image behind the part", "Chemical development produces a permanent radiograph", "High resolution and archival, but slow and chemical-dependent"] },
      { h: "Filmless (digital) techniques",
        p: "Digital radiography replaces film with electronic detectors. Direct digital radiography (DR) uses a flat-panel detector that converts radiation straight into a digital image displayed in seconds. Computed radiography (CR) uses a reusable photostimulable phosphor imaging plate that is exposed like film, then read out by a laser scanner into a digital image and erased for reuse. Digital methods are faster, need no chemicals, and allow image processing, storage and easy sharing.",
        list: ["Direct (DR) — a flat-panel detector gives an instant digital image", "Computed (CR) — a reusable imaging plate read out by a laser scanner", "Fast, chemical-free, processable and easy to store/share"] },
    ],
    keyTerms: [
      { t: "Latent image", d: "The invisible exposure pattern on film before development." },
      { t: "Digital radiography (DR)", d: "Direct capture with a flat-panel detector — instant image." },
      { t: "Computed radiography (CR)", d: "Reusable imaging plate read by a laser scanner into a digital image." },
      { t: "Imaging plate", d: "The reusable photostimulable phosphor plate used in CR." },
    ],
    applications: [
      "Film radiography for high-resolution archival weld records",
      "Digital DR for fast production and in-line inspection",
      "Portable CR for field weld inspection with reusable plates",
    ],
    takeaways: [
      "Film gives high-resolution permanent radiographs but needs chemical processing.",
      "Digital DR captures instantly; CR uses reusable imaging plates read by a scanner.",
      "Digital methods are faster, chemical-free and easily stored and processed.",
    ],
  },
  "5.3": {
    overview:
      "Two accessories quietly improve almost every radiograph: filters that clean up the beam, and intensifying screens that amplify the image so less exposure is needed. Both raise image quality — better contrast and sharpness — for the same or shorter exposure.",
    sections: [
      { h: "Filters",
        p: "A filter is a thin sheet of metal (often lead or copper) placed in the beam to absorb the softer, lower-energy and scattered radiation that would otherwise fog the film and blur contrast. By 'hardening' the beam and cutting scatter, filters improve the clarity and contrast of the radiograph, especially on thicker or scatter-prone parts.",
        list: ["A metal sheet (lead/copper) in the beam", "Absorbs soft, scattered radiation that fogs the film", "Hardens the beam → better contrast and clarity"] },
      { h: "Intensifying screens",
        p: "Intensifying screens sit in contact with the film. Lead screens emit electrons under radiation that intensify the film's exposure and also absorb scatter; fluorescent screens glow (emit light) under radiation, exposing the film with light as well as radiation. Both intensify the latent image so a shorter exposure achieves the required film density — saving time and reducing dose — with lead screens favoured where sharpness matters most.",
        list: ["Screens contact the film to intensify the image", "Lead screens emit electrons and absorb scatter (sharp)", "Fluorescent screens glow to expose the film (fast)"] },
      { h: "Purpose and advantages",
        p: "Together, filters and screens deliver better contrast, less scatter fog, and shorter exposures for a given image quality. The trade-off is that fluorescent screens, while fast, can slightly reduce sharpness, so the choice balances speed against resolution for the job.",
        list: ["Better contrast and less scatter", "Shorter exposures for the required density", "Speed (fluorescent) vs sharpness (lead) trade-off"] },
    ],
    keyTerms: [
      { t: "Filter", d: "A metal sheet that absorbs soft, scattered radiation to improve contrast." },
      { t: "Intensifying screen", d: "A screen against the film that amplifies the exposure to shorten it." },
      { t: "Lead screen", d: "A screen emitting electrons and absorbing scatter — favoured for sharpness." },
      { t: "Scatter", d: "Radiation deflected off its path that fogs the film and reduces contrast." },
    ],
    applications: [
      "Lead screens for high-sharpness weld radiography",
      "Filters to cut scatter on thick or high-scatter castings",
      "Fluorescent screens where exposure time must be minimised",
    ],
    takeaways: [
      "Filters absorb soft, scattered radiation to improve contrast.",
      "Intensifying screens amplify the image so exposures can be shorter.",
      "Lead screens favour sharpness; fluorescent screens favour speed.",
    ],
  },
  "5.4": {
    overview:
      "A radiograph is a shadow, and like any shadow its sharpness and brightness follow simple geometry. The source size and the source-to-film distance set how blurry the edges are, and the inverse-square law governs how intensity falls off with distance — the physics behind every exposure setup.",
    sections: [
      { h: "Source size, distance and unsharpness",
        p: "Radiation comes from a small but finite spot (the focal spot). Because it isn't a perfect point, edges in the image are blurred by a fuzzy penumbra — 'geometric unsharpness'. A smaller focal spot gives sharper edges. Increasing the source-to-film distance also sharpens the image (and reduces magnification/distortion), while keeping the part close to the film minimises blur. Good geometry — small source, part near film, long distance — gives the crispest radiograph.",
        list: ["A finite focal spot blurs edges (geometric unsharpness)", "A smaller focal spot → sharper edges", "Longer source-to-film distance and part near film → sharper"] },
      { h: "The inverse-square law",
        p: "Radiation spreads out from the source, so its intensity falls off as the inverse square of the distance: double the distance and the intensity drops to one quarter. This governs exposure — moving the source further away for sharpness costs a lot of intensity (and thus longer exposure time), and it also underpins radiation safety, since stepping back sharply reduces dose.",
        list: ["Intensity ∝ 1 / distance²", "Double the distance → one quarter the intensity", "Drives exposure time and radiation-safety distances"] },
    ],
    keyTerms: [
      { t: "Focal spot", d: "The small area on the target where X-rays originate; smaller is sharper." },
      { t: "Geometric unsharpness", d: "Edge blur caused by the finite focal-spot size and geometry." },
      { t: "Source-to-film distance (SFD)", d: "The source-to-detector distance; longer sharpens but reduces intensity." },
      { t: "Inverse-square law", d: "Intensity falls as 1/distance² from the source." },
    ],
    applications: [
      "Choosing SFD and focal spot for the required image sharpness",
      "Calculating exposure changes when distance changes (inverse-square)",
      "Setting radiation-safety exclusion distances",
    ],
    takeaways: [
      "A small focal spot, part near the film, and long distance give the sharpest image.",
      "Geometric unsharpness comes from the finite focal-spot size.",
      "Intensity follows the inverse-square law — double the distance, quarter the intensity.",
    ],
  },
  "5.5": {
    overview:
      "A radiographic film's usefulness comes down to a few properties — graininess, density, speed and contrast — and how they relate is captured in the characteristic (H&D) curve of film density versus exposure. Reading that curve is how radiographers pick and control film for the image quality they need.",
    sections: [
      { h: "Film properties",
        p: "Four properties define a film. Graininess is the visible texture of the silver grains — finer grain gives higher resolution. Density is how dark the developed film is (measured as optical density). Speed is how much exposure the film needs — fast films need less exposure but tend to be grainier. Contrast is how much the film density changes for a given change in exposure — high contrast makes small thickness differences (flaws) stand out. These trade off: fine-grain, high-contrast films give the best detail but need more exposure.",
        list: ["Graininess — grain texture; finer = higher resolution", "Density — how dark the film is (optical density)", "Speed — exposure needed; Contrast — density change per exposure change"] },
      { h: "The characteristic (H&D) curve",
        p: "Plotting film density against the logarithm of relative exposure gives the characteristic curve — an S-shape. Its steepness (gradient) is the film's contrast: a steep curve means small exposure differences produce big density differences, so flaws are easy to see. The curve also shows the useful density range and where the film is under- or over-exposed. Radiographers use it to choose a film and set exposures that land the image in the high-contrast part of the curve.",
        list: ["Density vs log relative exposure — an S-shaped curve", "Steepness = contrast; steeper reveals smaller flaws", "Guides film choice and exposure to hit the useful range"] },
    ],
    keyTerms: [
      { t: "Optical density", d: "How dark a developed radiograph is; must fall in a readable range." },
      { t: "Film speed", d: "How much exposure a film needs; faster films are grainier." },
      { t: "Film contrast", d: "The density change per unit exposure change; higher reveals smaller flaws." },
      { t: "Characteristic (H&D) curve", d: "Film density plotted against log relative exposure." },
    ],
    applications: [
      "Selecting fine-grain, high-contrast film for critical flaw detection",
      "Setting exposure to land the radiograph in the useful density range",
      "Using the H&D curve to compare and control films",
    ],
    takeaways: [
      "Film is defined by graininess, density, speed and contrast — which trade off.",
      "The characteristic (H&D) curve plots density vs log exposure.",
      "Its steepness is contrast; steeper film reveals smaller flaws.",
    ],
  },
  "5.6": {
    overview:
      "How do you prove a radiograph is actually good enough to trust? You put a penetrameter (IQI) in the shot — a small gauge whose visibility proves the required sensitivity was achieved. And exposure charts take the guesswork out of settings, relating thickness and material to the exposure that gives a good film.",
    sections: [
      { h: "Penetrameters (Image Quality Indicators)",
        p: "A penetrameter, or IQI, is a small standardised gauge — a set of stepped thicknesses or wires, or a plaque with drilled holes — made of a material similar to the part and placed on it during exposure. If the required feature of the IQI (a given wire or hole) is visible on the radiograph, it proves the image has enough sensitivity to reveal a flaw of that size. The IQI doesn't find flaws; it certifies that the radiograph could.",
        list: ["A small standard gauge (wires or drilled holes) placed on the part", "Its visible feature proves the achieved sensitivity", "Certifies image quality — it doesn't detect flaws itself"] },
      { h: "Exposure charts",
        p: "An exposure chart relates material thickness (and type), radiation energy (kV or source) and source-to-film distance to the exposure (mA·min) needed for a correctly-dense film. Built for a given film and setup, the chart lets the radiographer read off settings instead of guessing, giving consistent, good-quality radiographs and controlling the process — fewer retakes and repeatable results.",
        list: ["Relate thickness, energy and distance to exposure", "Read off settings for a correctly-dense film", "Consistent quality, fewer retakes"] },
    ],
    keyTerms: [
      { t: "Penetrameter / IQI", d: "A gauge whose visibility proves the radiograph's sensitivity." },
      { t: "Sensitivity", d: "The smallest thickness change (flaw) the radiograph can reveal." },
      { t: "Exposure chart", d: "A chart relating thickness/energy/distance to the required exposure." },
      { t: "Exposure (mA·min)", d: "The product of tube current and time that sets film density." },
    ],
    applications: [
      "Placing IQIs to certify weld radiograph sensitivity to code",
      "Using exposure charts to set kV and mA·min for a thickness",
      "Reducing retakes with charted, repeatable exposures",
    ],
    takeaways: [
      "A penetrameter (IQI) proves the radiograph has enough sensitivity — it doesn't find flaws.",
      "Its visible wire/hole certifies the achieved image quality.",
      "Exposure charts relate thickness, energy and distance to the right exposure.",
    ],
  },
  "5.7": {
    overview:
      "Different materials block radiation by different amounts, so a settings that suits steel is wrong for aluminium or copper. Radiographic equivalence factors convert one material's thickness into the radiographically 'equivalent' thickness of a reference, letting you reuse exposure data across materials.",
    sections: [
      { h: "The equivalent-thickness concept",
        p: "Because attenuation depends on the material, 10 mm of a dense metal blocks far more radiation than 10 mm of a light one. A radiographic equivalence factor expresses how strongly a material attenuates relative to a reference material (often steel): multiply the actual thickness by the factor to get the equivalent reference thickness, then use the reference's exposure chart. This lets one set of exposure data serve many materials.",
        list: ["Attenuation differs by material for the same thickness", "Equivalence factor relates a material to a reference (e.g. steel)", "Actual thickness × factor = equivalent reference thickness"] },
      { h: "Influence of material type",
        p: "The factor is driven by density and atomic number: high-Z, dense materials (lead, copper, steel) attenuate strongly and have high equivalence factors; light materials (aluminium, magnesium) attenuate weakly and have low factors. Knowing a material's equivalence factor lets a radiographer set the right energy and exposure without a separate chart for every metal — and warns when a material will need much more (or less) penetration.",
        list: ["Density and atomic number set the equivalence factor", "High-Z materials attenuate more (higher factor)", "Enables reusing exposure data across materials"] },
    ],
    keyTerms: [
      { t: "Equivalence factor", d: "A multiplier converting a material's thickness to an equivalent reference thickness." },
      { t: "Reference material", d: "The material (often steel) that exposure charts are built for." },
      { t: "Atomic number (Z)", d: "A key driver of X-ray attenuation; higher Z absorbs more." },
      { t: "Equivalent thickness", d: "The reference-material thickness that attenuates like the real part." },
    ],
    applications: [
      "Converting aluminium/copper thickness to equivalent steel for exposure",
      "Setting energy for high-Z parts that attenuate strongly",
      "Reusing one exposure chart across several materials",
    ],
    takeaways: [
      "Equivalence factors convert a material's thickness to an equivalent reference thickness.",
      "Density and atomic number drive the factor — high-Z materials attenuate more.",
      "This lets exposure data be reused across different materials.",
    ],
  },
  "5.8": {
    overview:
      "Not all radiography makes a fixed picture. Fluoroscopy gives a live, moving radiographic image for real-time inspection, and xeroradiography uses an electrostatic plate to produce an edge-enhanced image — two techniques that trade the permanent film for speed or edge detail.",
    sections: [
      { h: "Fluoroscopy — real-time imaging",
        p: "In fluoroscopy the radiation passes through the part onto a fluorescent screen (today, an image intensifier and camera) that glows to form a live image on a monitor. Because it's real-time, the part can be moved and rotated while watching, making it fast for high-volume screening and for inspecting moving or complex assemblies. The trade-off versus film is lower resolution and no permanent, high-fidelity record (though digital fluoroscopy records video).",
        list: ["Radiation → fluorescent screen/intensifier → live monitor image", "Real-time: move and rotate the part while viewing", "Fast, dynamic — but lower resolution than film"] },
      { h: "Xeroradiography and real-time vs static",
        p: "Xeroradiography records the image on a charged (electrostatic) plate rather than film; the charge pattern is developed into an image that strongly enhances edges, making cracks and boundaries stand out. It is a static image like film but with edge enhancement. The broader distinction is dynamic vs static: fluoroscopy is a live, moving inspection, while film and xeroradiography are single fixed exposures — you choose speed and motion versus resolution and record.",
        list: ["Xeroradiography — electrostatic plate, edge-enhanced static image", "Real-time (fluoroscopy) vs static (film, xero)", "Trade motion/speed against resolution and a permanent record"] },
    ],
    keyTerms: [
      { t: "Fluoroscopy", d: "Real-time radiographic imaging on a fluorescent screen/intensifier." },
      { t: "Image intensifier", d: "A device that brightens the faint fluoroscopic image for viewing." },
      { t: "Xeroradiography", d: "Radiography on an electrostatic plate giving an edge-enhanced image." },
      { t: "Real-time inspection", d: "Viewing the radiographic image live as the part moves." },
    ],
    applications: [
      "Real-time fluoroscopic screening of high-volume or moving parts",
      "Edge-enhanced xeroradiography for crack detection",
      "Dynamic inspection of assemblies that must be rotated while viewed",
    ],
    takeaways: [
      "Fluoroscopy gives a live, moving radiographic image for real-time inspection.",
      "Xeroradiography uses an electrostatic plate for an edge-enhanced static image.",
      "The choice trades motion and speed against resolution and a permanent record.",
    ],
  },
  "5.9": {
    overview:
      "The frontier of radiography is digital and three-dimensional. Computed Radiography reads a reusable imaging plate into a digital image, and Computed Tomography goes further — combining hundreds of views into a full 3-D reconstruction of a part's interior, slice by slice.",
    sections: [
      { h: "Computed Radiography (CR)",
        p: "CR replaces film with a reusable photostimulable phosphor imaging plate. The plate is exposed like film, storing a latent image; a laser scanner then reads it out into a digital image, and the plate is erased for reuse. CR bridges film and full digital: it keeps a film-like workflow (portable cassettes) while gaining digital processing, storage and no chemicals — popular for field and portable radiography.",
        list: ["A reusable phosphor imaging plate stores the latent image", "A laser scanner reads it out into a digital image", "Film-like workflow, digital benefits, no chemicals"] },
      { h: "Computed Tomography (CT)",
        p: "CT takes many radiographic projections around the part and mathematically reconstructs them into cross-sectional slices — and stacks the slices into a full 3-D model of the interior. Unlike a single radiograph, which superimposes everything along the beam, CT resolves exactly where a flaw is in three dimensions and measures internal geometry precisely. It is powerful for complex castings, additive-manufactured parts and, of course, medical imaging — at the cost of time and expensive equipment.",
        list: ["Many projections reconstructed into cross-sectional slices", "Slices stacked into a full 3-D model of the interior", "Resolves flaw position in 3-D; costly and slower"] },
    ],
    keyTerms: [
      { t: "Computed Radiography (CR)", d: "Reusable imaging-plate radiography read out digitally by a laser scanner." },
      { t: "Computed Tomography (CT)", d: "Reconstructing many projections into 3-D cross-sections of a part." },
      { t: "Reconstruction", d: "The mathematical process turning projections into slices." },
      { t: "Voxel", d: "A 3-D pixel in the reconstructed CT volume." },
    ],
    applications: [
      "Portable CR for field weld radiography with reusable plates",
      "CT of complex castings and additive-manufactured parts for internal geometry",
      "3-D flaw location and dimensional metrology of internal features",
    ],
    takeaways: [
      "CR uses a reusable imaging plate read out digitally — film-like but chemical-free.",
      "CT reconstructs many views into 3-D cross-sections of the interior.",
      "CT resolves exactly where a flaw is in three dimensions — powerful but costly.",
    ],
  },

  "1.9": {
    overview:
      "Visual inspection is the oldest, most widely used and most underestimated NDT method. It is the first thing an inspector does and often the last check before a part returns to service. Done well it is remarkably powerful; done casually it is where flaws are missed. This session covers direct and aided techniques and the human factors that set its true limits.",
    sections: [
      { h: "Unaided (direct) visual inspection",
        p: "Direct visual testing is the naked eye examining a surface under adequate light and from an appropriate angle and distance. It finds visible, surface-breaking features: cracks, corrosion, dents, misalignment, missing fasteners, leaks, discolouration and wear. Its effectiveness depends on controllables — lighting level and angle, viewing distance (typically arm's length or closer), surface cleanliness, and the inspector's visual acuity. Proper lighting alone dramatically changes what is seen; a raking (low-angle) light throws surface features into relief.",
        list: ["The eye under good lighting, angle and distance", "Finds cracks, corrosion, dents, leaks, wear, missing parts", "Lighting angle and cleanliness dominate what is seen"] },
      { h: "Aided visual inspection",
        p: "Tools extend the eye's reach and resolution. Magnifiers and loupes resolve fine cracks; mirrors and borescopes (rigid or flexible, now usually with a camera) see into cavities, ducts, engine interiors and behind structure; fibrescopes and video-scopes record and measure; cameras document findings. Aided VT is what makes internal engine and structure inspection possible without disassembly, and it turns a subjective look into a recorded, measurable examination.",
        list: ["Magnifiers/loupes — resolve fine features", "Borescopes/fibrescopes — see into cavities and engines", "Cameras/video-scopes — record and measure indications"] },
      { h: "Limitations and human factors",
        p: "Visual testing only finds flaws that are visible on the surface — nothing subsurface, and nothing too fine to resolve. But its dominant limitation is human: fatigue, boredom, distraction, poor lighting, time pressure and expectation all raise the miss rate. Because the inspector is the instrument, reliability is managed through good ergonomics, adequate lighting, structured search patterns, defined acceptance criteria, and rest — not just through better eyesight." },
    ],
    keyTerms: [
      { t: "Direct VT", d: "Unaided visual inspection with the naked eye (within defined distance/angle)." },
      { t: "Aided VT", d: "Visual inspection assisted by magnifiers, mirrors, borescopes or cameras." },
      { t: "Borescope", d: "An optical/video probe for viewing inside cavities and machinery." },
      { t: "Raking light", d: "Low-angle lighting that casts shadows to reveal surface relief." },
    ],
    applications: [
      "Pre-flight and walk-around inspection of airframe and control surfaces",
      "Borescope inspection of gas-turbine blades and combustors without engine teardown",
      "Post-repair verification before a part is signed back into service",
    ],
    takeaways: [
      "Visual is the first and most-used method — powerful when done deliberately.",
      "Aided tools (borescopes, cameras) extend reach and turn a look into a record.",
      "Its real limit is human: lighting, fatigue and attention drive the miss rate.",
    ],
  },
};
