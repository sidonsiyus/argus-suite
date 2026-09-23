// GTEM — deep per-session lessons, keyed by session id.
// P0 seeds every session from the curriculum (overview + sections + takeaways)
// so the platform is fully navigable; richer hand-authored content is layered
// in per unit and simply overrides the matching id below.
import { ALL_SESSIONS } from "./curriculum";

function seed(s) {
  return {
    overview: s.summary,
    sections: s.points.map((p) => ({ h: p.t, p: p.d })),
    takeaways: s.points.map((p) => p.t),
  };
}

const SEED = Object.fromEntries(ALL_SESSIONS.map((s) => [s.id, seed(s)]));

// ── Hand-authored overrides (added per unit) ──
// Unit I — Fundamentals & Performance. Deep, exam-ready lessons.
const UNIT1 = {
  "1.1": {
    overview:
      "Every propulsion device obeys the same physics: store energy, convert it, and throw mass backwards to be pushed forwards. Before any engine hardware, you need the language of energy, Newton's laws, and the force–work–power chain — because thrust is not magic, it is Newton's third law made into metal.",
    sections: [
      { h: "Energy — potential and kinetic", p: "Potential energy is stored (chemical energy in jet fuel); kinetic energy is energy of motion (the fast jet leaving the nozzle). A gas turbine is fundamentally an energy converter: it releases the chemical PE of fuel as heat, then turns that heat into the KE of a rearward-moving gas stream. Nothing is created — energy only changes form, and every conversion leaks some as waste heat." },
      { h: "Newton's laws of motion", p: "First law (inertia): air keeps its state of motion until a force acts. Second law (F = ṁ·a, or for a fluid F = ṁ·ΔV): force equals the rate of change of momentum — the more mass per second you accelerate, and the more you change its velocity, the more force. Third law (action–reaction): accelerate a mass of air aft and an equal, opposite force pushes the aircraft forward. That reaction is thrust." },
      { h: "Force, work, power & energy", p: "Force is a push/pull (newtons). Work = force × distance (joules) — a running engine on a test stand makes thrust but zero propulsive work until the aircraft moves. Power = work ÷ time (watts) — the rate of doing work, and why thrust × true airspeed gives thrust power. Velocity and acceleration link them: acceleration is how fast velocity changes, and it is acceleration of the air mass that the engine is really 'selling'." },
      { h: "Why it matters for the engine", p: "Thrust = ṁ_air × (V_jet − V_inlet). This single relationship, straight from Newton's second law, explains every design choice ahead: move more air (bigger fan, higher bypass) or move it faster (higher jet velocity). The rest of the module is how the hardware does exactly this, efficiently and reliably." },
    ],
    takeaways: [
      "Thrust is Newton's third law: accelerate air aft, get pushed forward",
      "F = ṁ·ΔV — thrust comes from mass flow rate AND velocity change",
      "Energy is only converted, never created; every step wastes some heat",
      "Power = thrust × true airspeed — a static engine does no propulsive work",
    ],
  },
  "1.2": {
    overview:
      "Air is the working fluid of a gas turbine. Follow one parcel of air from the intake to the nozzle and you can read the whole engine as a story of its pressure, temperature, density and velocity changing — each component doing a specific, predictable thing to those four properties.",
    sections: [
      { h: "Thermodynamic properties of air", p: "The state of the air is set by pressure (P), temperature (T) and density (ρ), tied together by the gas law P = ρRT. Raise pressure and temperature rises; add heat and the gas wants to expand. The compressor, combustor, turbine and nozzle each push these properties in a known direction, and knowing the direction is how you diagnose a healthy — or sick — gas path." },
      { h: "Airflow through the engine (continuity)", p: "Mass flow is conserved: ṁ = ρ·A·V is the same at every station in steady flow. So where area A narrows or density ρ falls, velocity V must rise, and vice-versa. What the compressor swallows, the turbine and nozzle must pass. This continuity equation is the backbone of gas-path reasoning." },
      { h: "Pressure & temperature variation", p: "Compressor: P up, T up, V roughly held. Combustor: heat added at ~constant P, T soars, V slightly up. Turbine: P down, T down as energy is extracted, V up. Nozzle: remaining P converted to a big rise in V. Plotting P, T and V station-by-station gives the classic gas-turbine profile you will use again and again." },
      { h: "Reading the gas path", p: "Because each component's effect is predictable, technicians and engineers use station pressures and temperatures (e.g. EPR, EGT) to judge engine health. An abnormal temperature or pressure at a station points straight to the component responsible — the whole discipline of engine monitoring rests on this thermodynamic map." },
    ],
    takeaways: [
      "Air is the working fluid; P, T, ρ and V describe its state everywhere",
      "Continuity: ṁ = ρAV is constant — narrowing area speeds the flow up",
      "Compressor raises P&T; combustor spikes T at const P; turbine/nozzle drop P",
      "Station P and T readings are how engine health is actually monitored",
    ],
  },
  "1.3": {
    overview:
      "The Brayton (Joule) cycle is the idealised thermodynamic cycle every gas turbine approximates: continuous compression, constant-pressure heat addition, and expansion. Understand its four processes and the P–V / T–S diagrams and you understand why higher pressure ratio and turbine temperature mean more work.",
    sections: [
      { h: "The four processes", p: "1→2 isentropic compression (compressor raises P and T with no heat exchange, ideally). 2→3 constant-pressure heat addition (combustor burns fuel, T rises sharply at nearly constant pressure). 3→4 isentropic expansion (turbine + nozzle extract work and accelerate gas, P and T fall). 4→1 constant-pressure heat rejection (the atmosphere completes the open cycle)." },
      { h: "Constant-pressure heat addition", p: "The defining feature of the gas turbine is that combustion happens at essentially constant pressure, unlike the constant-volume burn of a piston engine. This is what allows continuous, steady flow rather than discrete bangs — and it is why the combustor is a flow-through can, not a sealed cylinder." },
      { h: "Compression, combustion & turbine work balance", p: "The compressor consumes a large slice of the turbine's output just to keep running. The turbine extracts exactly enough energy from the hot gas to drive the compressor (and fan/accessories); everything left over is available as thrust (turbojet/fan) or shaft power (turboprop/shaft). This split is the heart of engine design." },
      { h: "Why pressure ratio matters", p: "On the P–V diagram, the enclosed area is the net work per cycle. Raising the pressure ratio enlarges that area and lifts thermal efficiency — up to the limit set by turbine material temperature. Modern engines chase ever-higher overall pressure ratios and turbine entry temperatures for exactly this reason." },
    ],
    takeaways: [
      "Brayton cycle: compress → burn at constant P → expand → reject heat",
      "Constant-pressure combustion enables continuous, steady flow",
      "The turbine drives the compressor; the surplus is thrust or shaft power",
      "Higher pressure ratio + turbine temp = more work and better thermal efficiency",
    ],
  },
  "1.4": {
    overview:
      "The turbojet and the turbofan are the two jet-propulsion workhorses. The turbojet sends all its air through the core; the turbofan diverts most of it around the core as a bypass stream. That one difference reshapes noise, efficiency and the whole character of the engine.",
    sections: [
      { h: "Turbojet arrangement & operation", p: "Intake → compressor → combustor → turbine → nozzle, in one line. All air passes through the core and leaves as a high-velocity jet. Simple and capable of high speeds, but noisy and thirsty at subsonic cruise because it makes thrust from a small mass of very fast gas — the least propulsively efficient way to do it below the sound barrier." },
      { h: "Turbofan arrangement & operation", p: "A large fan at the front is driven by the turbine. Some air (the core/hot stream) goes through the engine; most (the bypass/cold stream) is ducted around it and accelerated modestly by the fan. The two streams combine — directly or in a mixer — to produce thrust from a large mass of air moving at moderate speed." },
      { h: "Core vs bypass flow", p: "Core flow feeds combustion and drives the turbines. Bypass flow makes most of the thrust in a high-bypass engine (a modern airliner fan can make 80%+ of thrust cold). Because propulsive efficiency improves when you move more air slowly rather than less air quickly, the bypass stream is why turbofans dominate airline service." },
      { h: "Spools and staging", p: "Both engines split compression across LP and HP spools running on concentric shafts at different speeds, letting each stage work near its best. In a turbofan the fan is usually on the LP spool. This multi-spool arrangement keeps the compressor stable across the operating range — a theme picked up in Unit II." },
    ],
    takeaways: [
      "Turbojet: all air through the core, one fast jet — high speed, poor cruise economy",
      "Turbofan: a fan diverts a large bypass stream around the core",
      "High-bypass fans make most thrust from cold air moving slowly = efficient & quiet",
      "LP/HP spools let each compressor stage run near its optimum speed",
    ],
    keyTerms: [
      { t: "Bypass stream", d: "The cold air ducted around the core by the fan; makes most of the thrust in a high-bypass turbofan." },
      { t: "Core (hot) stream", d: "Air that passes through compressor, combustor and turbine; drives the machinery and adds some jet thrust." },
      { t: "Spool", d: "A shaft plus the compressor and turbine it links, running as one rotating assembly (e.g. LP spool, HP spool)." },
      { t: "Mixer", d: "A lobed device that blends hot and cold streams before a common nozzle to recover thrust and cut noise." },
    ],
    applications: [
      "High-bypass turbofans power virtually every modern jet airliner (e.g. CFM56, GEnx, Trent families).",
      "Low-bypass augmented turbofans power fighters, trading efficiency for high thrust-to-weight and supersonic dash.",
      "Pure turbojets survive mainly in legacy, missile and some high-speed applications.",
    ],
  },
  "1.5": {
    overview:
      "When the turbine's job is to turn a shaft instead of making a jet, you get the turboprop (shaft drives a propeller) and the turboshaft (shaft drives a rotor, pump or generator). Both extract almost all the gas energy as shaft power, leaving little residual thrust.",
    sections: [
      { h: "Turboprop arrangement & operation", p: "A gas-generator core drives a power turbine, which — through a reduction gearbox — turns a propeller. The propeller does the actual work of moving air; the exhaust jet contributes only a small fraction of thrust. Turboprops give excellent fuel economy and short-field performance at low-to-medium speeds and altitudes." },
      { h: "Turboshaft arrangement & operation", p: "Essentially a turboprop without the propeller: the power turbine's shaft output drives a helicopter main rotor, an APU generator, a ship or a pump. Residual jet thrust is negligible and often deliberately suppressed. The design goal is maximum, controllable shaft power." },
      { h: "Free vs fixed turbine", p: "A fixed (direct-drive) turbine is mechanically tied to the gas generator — simple but less flexible. A free (independent) power turbine spins on its own shaft, aerodynamically coupled to the core by the gas stream only. This decouples load speed from core speed, so a helicopter rotor can hold constant RPM while the core varies, and start loads are far gentler." },
      { h: "Reduction gearbox", p: "Turbine shafts spin far too fast for a propeller or rotor, so a reduction gearbox drops the speed (and multiplies torque) to a usable range. The gearbox is a critical, highly-stressed component and a defining feature of turboprop/turboshaft engines that pure jets do not need." },
    ],
    takeaways: [
      "Turboprop: power turbine + gearbox drive a propeller; jet thrust is minor",
      "Turboshaft: shaft power for rotors/pumps/generators; negligible thrust",
      "A free power turbine decouples load speed from core speed for flexibility",
      "A reduction gearbox converts high shaft RPM into usable prop/rotor speed",
    ],
  },
  "1.6": {
    overview:
      "No single engine type is best everywhere. Turboprop, turbofan, turbojet and turboshaft each own a region of the speed–altitude–mission map, set by the fundamental trade between jet velocity and propulsive efficiency.",
    sections: [
      { h: "Speed & altitude suitability", p: "Turboprops excel at low speed and altitude (below ~0.5 Mach) — the propeller moves a huge mass of air efficiently but loses out as tip speeds approach sonic. High-bypass turbofans dominate 0.75–0.85 Mach airline cruise. Low-bypass and pure turbojets suit high subsonic/supersonic flight where a fast jet is finally efficient." },
      { h: "Thrust vs efficiency trade", p: "Propulsive efficiency is highest when jet velocity is only slightly above flight velocity — i.e. move lots of air slowly. That favours high bypass at cruise. But a slow jet limits top speed, so fast aircraft accept lower bypass and a faster, less efficient jet. Every engine choice sits somewhere on this curve." },
      { h: "Selecting an engine", p: "The airframe's mission decides: a regional turboprop for short, slow sectors; a high-bypass turbofan for an efficient airliner; a low-bypass augmented turbofan for a fighter; a turboshaft for a helicopter. Noise limits, fuel cost, maintenance and unit price all weigh in alongside raw performance." },
      { h: "The unifying idea", p: "All four are the same core gas generator with different ways of using its energy — as a fast jet, a bypass stream, a propeller, or a shaft. Recognising this shared DNA makes the comparison intuitive rather than a list to memorise." },
    ],
    takeaways: [
      "Turboprop = slow/low; turbofan = subsonic cruise; turbojet = high/fast; turboshaft = shaft power",
      "Propulsive efficiency peaks when jet speed is just above flight speed",
      "High bypass trades peak jet speed for cruise economy and low noise",
      "All four share one gas-generator core, used four different ways",
    ],
  },
  "1.7": {
    overview:
      "Thrust looks simple on a test stand but is the resultant of pressure and momentum forces acting over every internal surface. Build it up properly — gross thrust, momentum drag, net thrust, and the pressure term when the nozzle chokes — and the thrust equation stops being a formula to memorise.",
    sections: [
      { h: "Gross & net thrust", p: "Gross thrust is the total rearward push at the nozzle: F_g = ṁ·V_jet (+ pressure term). Momentum drag (ram drag) is the rearward loss from decelerating incoming air relative to the aircraft: ṁ·V_inlet. Net thrust — what actually accelerates the aircraft — is the difference: F_n = ṁ(V_jet − V_inlet). On the ground V_inlet ≈ 0, so gross ≈ net; in the cruise, momentum drag is large." },
      { h: "The choked nozzle & pressure thrust", p: "When exhaust reaches sonic velocity the nozzle 'chokes' — flow can't accelerate further in a simple convergent nozzle, and the exit pressure stays above ambient. That leftover pressure adds a pressure-thrust term: F = ṁ·V_jet + (P_exit − P_ambient)·A_exit. High-power and high-altitude operation frequently runs choked, so this term is not a footnote." },
      { h: "Thrust distribution & the resultant", p: "Thrust is not made 'at the nozzle' — it is the net of forward and rearward pressure forces on every component surface: the compressor casing and combustor push forward, the turbine and exhaust push aft, and the algebraic sum is net thrust. This is why a cracked or eroded component can quietly rob thrust." },
      { h: "Levers on thrust", p: "From F_n = ṁ(V_jet − V_inlet): raise mass flow (open the throttle, bigger fan), raise jet velocity (more fuel, reheat), or reduce inlet losses. Ambient conditions matter too — colder, denser air raises ṁ and thrust, which is why performance is quoted against temperature and altitude (session 1.12)." },
    ],
    takeaways: [
      "Net thrust = gross thrust − momentum (ram) drag = ṁ(V_jet − V_inlet)",
      "A choked nozzle adds a pressure-thrust term (P_exit − P_amb)·A_exit",
      "Thrust is the resultant of pressure forces on every internal surface",
      "Raise mass flow or jet velocity, or cut inlet loss, to raise thrust",
    ],
    keyTerms: [
      { t: "Gross thrust", d: "The total rearward push at the nozzle, ṁ·V_jet plus any pressure term." },
      { t: "Momentum (ram) drag", d: "Rearward loss from decelerating incoming air relative to the aircraft, ṁ·V_inlet." },
      { t: "Net thrust", d: "Gross thrust minus momentum drag — what actually accelerates the aircraft." },
      { t: "Choked nozzle", d: "A nozzle whose exit flow has reached sonic velocity, leaving exit pressure above ambient." },
    ],
    applications: [
      "Take-off performance charts are built from net thrust at the day's temperature and pressure altitude.",
      "The choked-nozzle pressure term matters most at high power and high altitude.",
      "Gas-path pressure balance explains why eroded or cracked components quietly lose thrust.",
    ],
  },
  "1.8": {
    overview:
      "To compare engines fairly you need common yardsticks: thrust horsepower and equivalent shaft horsepower put jets and props on one scale, and specific fuel consumption exposes which engine actually sips fuel for the work it does.",
    sections: [
      { h: "Thrust horsepower (THP)", p: "A static jet makes thrust but no power. THP = (thrust × true airspeed) ÷ a constant (≈ 375 for lb·mph→hp, or thrust×V for SI watts). It expresses the useful propulsive power a jet delivers at a given speed — so the same engine's 'power' rises with airspeed, a crucial idea when comparing to a shaft engine." },
      { h: "Equivalent shaft horsepower (ESHP)", p: "A turboprop makes both shaft power (the propeller) and a little residual jet thrust. ESHP combines them: ESHP = SHP + (residual jet thrust × V)/(propeller efficiency × constant). It is the single number that fairly rates a turboprop's total output, letting it be compared against other props and, via THP, against jets." },
      { h: "Specific fuel consumption (SFC)", p: "SFC is fuel burned per unit of thrust (TSFC, e.g. kg/h per kN) or per unit power (BSFC/PSFC for shaft engines). Lower is better. It is the headline economy metric because it normalises fuel burn against how much useful output the engine produces — a big thirsty engine can still have excellent SFC." },
      { h: "Why these parameters matter", p: "THP, ESHP and SFC let an engineer compare a turboprop, a turbofan and a turbojet on common ground, and let an airline compare the true operating cost of competing engines. They convert raw thrust and fuel-flow numbers into decision-grade figures of merit." },
    ],
    takeaways: [
      "THP = thrust × true airspeed — a jet's 'power' grows with speed",
      "ESHP combines shaft power and residual jet thrust for turboprops",
      "SFC = fuel burned per unit thrust (or power); lower is better",
      "These metrics put very different engines on one comparable scale",
    ],
  },
  "1.9": {
    overview:
      "Only a fraction of the fuel's chemical energy ends up as useful propulsion. Thermal efficiency measures the core's conversion of heat to mechanical/kinetic energy; propulsive efficiency measures how well the jet's energy becomes thrust work; their product is overall efficiency — and both must be high.",
    sections: [
      { h: "Thermal efficiency", p: "η_thermal = useful mechanical/kinetic energy produced ÷ heat energy released by the fuel. It is governed mainly by the pressure ratio and turbine entry temperature (the Brayton cycle result from 1.3). Losses come from imperfect combustion, friction, and heat carried away in the exhaust. Typical modern cores reach ~40–50%." },
      { h: "Propulsive efficiency", p: "η_propulsive = thrust power delivered to the aircraft ÷ kinetic energy added to the air. It is highest when the jet velocity is only a little above flight velocity — move a lot of air slowly. A pure turbojet at cruise wastes energy as fast, hot exhaust; a high-bypass fan recovers much of it, reaching ~70–80%." },
      { h: "Overall efficiency", p: "η_overall = η_thermal × η_propulsive — the true fuel-to-thrust figure, directly linked to SFC. Because the two multiply, a great core (high thermal) with a poor jet match (low propulsive) still gives mediocre overall efficiency. This is precisely why the industry moved to high-bypass turbofans." },
      { h: "Where the fuel's energy goes", p: "Of the fuel energy in: a large share leaves as hot exhaust and unrecovered kinetic energy, some as mechanical and combustion losses, and only the remainder becomes propulsive work. Visualising this energy budget makes clear why chasing both efficiencies — hotter, higher-pressure cores AND higher bypass — pays off." },
    ],
    takeaways: [
      "Thermal η: heat → mechanical/kinetic energy, set by pressure ratio & turbine temp",
      "Propulsive η: jet KE → thrust work, best when jet speed ≈ flight speed",
      "Overall η = thermal × propulsive — both must be high; it drives SFC",
      "High-bypass turbofans win by lifting propulsive efficiency",
    ],
  },
  "1.10": {
    overview:
      "Two design levers shape a modern engine's economy and noise more than any other: the bypass ratio (how much air goes around the core) and the engine/overall pressure ratio (how hard the air is squeezed). Both push toward better fuel burn — within limits.",
    sections: [
      { h: "By-pass ratio (BPR)", p: "BPR = mass of bypass (cold) air ÷ mass of core (hot) air. A pure turbojet is 0:1; early fans ~1:1; modern airliners 5:1 to 12:1, and geared fans higher still. Raising BPR means a bigger, slower-turning fan moving more air at lower jet velocity — better propulsive efficiency, lower SFC, and dramatically less jet noise, at the cost of a larger, heavier nacelle and more drag." },
      { h: "Engine pressure ratio (EPR)", p: "EPR is the ratio of turbine-exhaust total pressure to compressor-inlet total pressure — a directly measurable thrust-setting parameter on many engines. Overall pressure ratio (OPR) is the total compression from inlet to combustor. Higher OPR lifts thermal efficiency (from the Brayton cycle) up to the limit set by turbine material temperature and compressor delivery temperature." },
      { h: "Effect on economy & noise", p: "Higher BPR: lower SFC and much quieter — the single biggest reason airliner engines have grown fans over decades. Higher OPR: better thermal efficiency and lower fuel burn, but demands stronger, hotter-running hot-section materials and careful surge-margin management. The two levers are pulled together for the best overall efficiency." },
      { h: "The limits", p: "BPR is capped by fan diameter, nacelle drag, weight and ground clearance (which drove the geared turbofan). OPR is capped by compressor-delivery and turbine-entry temperatures. Design is the art of pushing both as far as materials, weight and cost allow." },
    ],
    takeaways: [
      "BPR = bypass air ÷ core air; higher BPR = lower SFC and much less noise",
      "EPR is a measurable thrust-setting parameter; OPR sets thermal efficiency",
      "Higher pressure ratio improves economy up to material-temperature limits",
      "BPR is limited by fan size/weight/drag; OPR by hot-section temperatures",
    ],
    keyTerms: [
      { t: "Bypass ratio (BPR)", d: "Mass of bypass air divided by mass of core air; higher means quieter and more efficient." },
      { t: "Engine pressure ratio (EPR)", d: "Turbine-exhaust total pressure divided by inlet total pressure; a measurable thrust setting." },
      { t: "Overall pressure ratio (OPR)", d: "Total compression from inlet to combustor; drives thermal efficiency." },
      { t: "Geared turbofan", d: "A fan driven through a reduction gearbox so fan and LP turbine each run at their best speed, enabling very high BPR." },
    ],
    applications: [
      "Airliner engine families have grown BPR over decades to cut fuel burn and meet noise rules.",
      "Pilots set take-off thrust to an EPR or N1 target derived from these parameters.",
      "The geared turbofan (e.g. PW1000G) pushed BPR higher without an oversized LP turbine.",
    ],
  },
  "1.11": {
    overview:
      "Walk the gas path station by station and track pressure, temperature and velocity together. Each component's signature on these three quantities is the diagnostic map you use to understand — and troubleshoot — a running engine.",
    sections: [
      { h: "Pressure changes", p: "Pressure climbs steadily through the compressor stages to a peak at compressor delivery, is held roughly constant through the combustor (Brayton's constant-pressure burn), then falls across the turbine as energy is extracted, and drops further through the nozzle to near-ambient. The compressor-delivery pressure is the high point of the whole engine." },
      { h: "Temperature changes", p: "Temperature rises modestly with pressure through the compressor, then spikes to its maximum just after combustion — the turbine entry temperature (TET), the hottest and most life-limiting point in the engine. It then falls across the turbine and nozzle as energy is given up. TET is limited by turbine material and cooling capability (Unit II)." },
      { h: "Velocity changes", p: "Velocity is deliberately managed: diffusers slow the air (raising pressure) before the combustor so the flame is stable; the turbine keeps velocity moderate while extracting work; the nozzle then accelerates the gas hard, converting the remaining pressure into the high jet velocity that makes thrust. Ducts and nozzles are velocity-shaping tools." },
      { h: "Reading the profile together", p: "Plotted together, P, T and V give the canonical gas-turbine profile. The trade between pressure and velocity (continuity, session 1.2) is visible everywhere: slow the flow to build pressure, then speed it up to make thrust. Mastering this profile is what lets you reason about any station or fault." },
    ],
    takeaways: [
      "Pressure peaks at compressor delivery, held in the combustor, falls after",
      "Temperature peaks just after combustion (TET) — the life-limiting point",
      "Diffusers slow flow for stable combustion; the nozzle speeds it for thrust",
      "P, T and V trade against each other via continuity all along the gas path",
    ],
  },
  "1.12": {
    overview:
      "An engine's rated thrust is not a single number — it depends on speed, altitude and outside air temperature, and it is deliberately capped to protect the hot section. Ratings, flat rating and operating limits are how an engine is used safely across its whole envelope.",
    sections: [
      { h: "Engine ratings & static thrust", p: "Engines are certified at several ratings — take-off (highest, time-limited), maximum continuous, climb and cruise — each defining allowable thrust for a condition and duration. Static thrust is the sea-level, zero-airspeed figure on the test stand; installed and in-flight thrust differ because of ram effect, intake losses and bleed/power offtakes." },
      { h: "Effect of speed, altitude & hot climate", p: "Altitude: as air thins, mass flow and thus thrust fall (partly offset by ram at speed and colder air up high). Airspeed: ram recovery raises pressure and can recover some thrust, but momentum drag grows. Ambient temperature: hot air is less dense, so mass flow and thrust drop — a hot-and-high day is the worst case for take-off performance." },
      { h: "Flat rating", p: "Rather than let take-off thrust vary wildly with temperature, engines are 'flat rated': the control system holds a constant certified thrust up to a corner (kink-point) temperature, below which the engine could make more but is held back to a common figure. Above the corner temperature, thrust is allowed to fall. Flat rating guarantees a dependable thrust on cold days while protecting the hot section from over-temperature." },
      { h: "Limitations that protect the engine", p: "Hard limits — maximum EGT/TET, maximum N1/N2 shaft speeds, maximum EPR, oil and vibration limits — bound operation to protect blade life and structural integrity. Exceeding them (an over-temp or over-speed) can require inspection or component replacement. Ratings and flat rating exist so pilots get consistent, usable thrust without ever crossing these limits." },
    ],
    takeaways: [
      "Ratings (take-off, climb, cruise) cap thrust by condition and time",
      "Thrust falls with altitude and with rising ambient temperature",
      "Flat rating holds constant thrust up to a corner temp, protecting the hot section",
      "EGT/TET, shaft-speed and EPR limits bound operation to protect blade life",
    ],
  },
};

// Unit II — Engine Construction. Module-by-module build and operation.
const UNIT2 = {
  "2.1": {
    overview:
      "The inlet is the engine's first component and its unsung hero: it must deliver clean, smooth, subsonic air to the compressor face across the entire flight envelope — from a static ground run to high-altitude cruise — with the least possible pressure loss and distortion.",
    sections: [
      { h: "Purpose of the inlet", p: "The compressor can only accept air below a certain (subsonic) speed and needs it as uniform as possible. The inlet's job is to slow the incoming air, recover as much of its pressure as possible (pressure recovery), and present a smooth, even flow to the first compressor stage — whatever the aircraft is doing." },
      { h: "Compressor inlet ducts", p: "The duct's shape controls how the air arrives. A well-designed duct diffuses the flow gently, avoiding separation and swirl. Bends, length and area change all introduce distortion, so duct design is a careful balance between the airframe's packaging needs and the compressor's appetite for clean flow." },
      { h: "Subsonic vs supersonic inlets", p: "A subsonic inlet is essentially a divergent diffuser that slows and pressurises the air. A supersonic inlet must first decelerate the flow through controlled shock waves before the subsonic diffuser, often using variable geometry (ramps, cones, spikes) to manage the shocks efficiently across the speed range." },
      { h: "Ram recovery", p: "As the aircraft speeds up, the inlet converts the air's velocity into a useful pressure rise — 'ram'. Good ram recovery raises the pressure delivered to the compressor and helps offset the thrust lost with altitude, which is why inlet efficiency directly affects installed engine performance." },
    ],
    takeaways: [
      "The inlet slows air to a speed the compressor can accept, with minimal loss",
      "Duct shape controls pressure recovery and flow distortion",
      "Subsonic inlets diffuse; supersonic inlets manage shock waves first",
      "Good ram recovery raises delivered pressure and installed thrust",
    ],
    keyTerms: [
      { t: "Pressure recovery", d: "The fraction of the air's total pressure the inlet preserves as it slows the flow." },
      { t: "Flow distortion", d: "Non-uniform pressure/velocity at the compressor face; erodes surge margin and performance." },
      { t: "Ram effect", d: "The pressure rise from decelerating fast incoming air — grows with airspeed." },
      { t: "Diffuser", d: "A divergent duct that slows a flow and raises its static pressure." },
    ],
    applications: [
      "Podded airliner nacelles use a simple, highly efficient pitot inlet optimised for subsonic cruise.",
      "Supersonic fighters use variable ramps or cones to stay efficient from subsonic to supersonic.",
      "Inlet distortion is a major concern for engines buried in an airframe (S-ducts).",
    ],
  },
  "2.2": {
    overview:
      "Where and how the inlet is arranged — podded, buried, side-mounted, chin, or an S-duct — changes distortion, drag, weight and how well the engine and airframe get along. Configuration is an airframe-level decision with direct engine consequences.",
    sections: [
      { h: "Inlet configurations", p: "Podded (nacelle) inlets hang the engine in clean air for best pressure recovery — the airliner standard. Buried inlets save drag and signature but feed the engine through long, often curved ducts. Side-mounted and chin inlets suit fighters and some business jets, trading recovery for packaging and stealth." },
      { h: "Effect on performance", p: "Any distortion at the compressor face reduces surge margin and can cut thrust or trigger stall. The more the duct bends or the more the inlet sits in disturbed airframe flow (boundary layer, angle of attack), the more distortion the engine must tolerate — a real limit on installed performance." },
      { h: "S-ducts and boundary-layer control", p: "Buried engines often use an S-shaped duct to hide the compressor face; the bends generate secondary flows and distortion that must be managed with vortex generators or careful shaping. Boundary-layer diverters or bleed keep the sluggish airframe boundary layer out of the inlet." },
      { h: "Design trade-offs", p: "Pressure recovery is balanced against weight, drag, radar signature and manufacturing cost. There is no universally 'best' inlet — only the best inlet for a given mission, which is why airliners and fighters look so different at the front." },
    ],
    takeaways: [
      "Podded inlets give the best recovery; buried inlets save drag/signature",
      "Distortion at the compressor face cuts surge margin and thrust",
      "S-ducts hide the compressor face but add distortion to manage",
      "Inlet choice trades recovery against weight, drag, signature and cost",
    ],
  },
  "2.3": {
    overview:
      "There are two fundamentally different ways to raise air pressure in a gas turbine: the axial compressor, which pushes air straight through many blade rows, and the centrifugal compressor, which flings it outward. Each dominates a different class of engine.",
    sections: [
      { h: "Axial compressor", p: "Air flows parallel to the shaft through alternating rows of rotating (rotor) and stationary (stator) blades. Each stage adds a modest pressure rise, but stacking many stages gives a high overall pressure ratio at high mass flow in a slim, low-drag engine — ideal for large turbofans and turbojets." },
      { h: "Centrifugal compressor", p: "An impeller accelerates air radially outward; a diffuser then converts that velocity into pressure. A single stage can give a large pressure rise in a short, rugged, cheap package that tolerates foreign objects well — but the large frontal area adds drag, limiting its use to smaller engines." },
      { h: "How each raises pressure", p: "The axial relies on many small aerodynamic pressure rises; the centrifugal on one big centrifugal (radial) acceleration plus diffusion. Some engines combine them — several axial stages feeding a final centrifugal stage — to get the best of both in small turboprops and helicopter engines." },
      { h: "Applications", p: "Axial compressors power virtually all large aircraft engines. Centrifugal compressors dominate APUs, small turboshafts and turboprops, and early jet engines. The choice follows the required mass flow, pressure ratio, frontal-area limits and cost." },
    ],
    takeaways: [
      "Axial: air flows straight through many rotor/stator stages — high flow, slim engine",
      "Centrifugal: an impeller flings air outward for a big per-stage pressure rise",
      "Centrifugals are short, rugged and cheap but have large frontal area",
      "Axials power large engines; centrifugals suit APUs and small turboprops",
    ],
    keyTerms: [
      { t: "Rotor / stator", d: "Rotating blades add energy; stationary vanes recover it as pressure and re-align the flow." },
      { t: "Stage", d: "One rotor row plus its stator row; overall pressure ratio is the product of the stage rises." },
      { t: "Impeller", d: "The rotating disc of a centrifugal compressor that accelerates air radially outward." },
      { t: "Diffuser (compressor)", d: "Passages that slow the fast impeller-exit air to convert velocity into pressure." },
    ],
    applications: [
      "Large turbofans (CFM56, Trent) use multi-stage axial compressors on two or three spools.",
      "The PT6 turboprop combines axial stages with a final centrifugal stage.",
      "APUs and small helicopter engines favour compact centrifugal compressors.",
    ],
  },
  "2.4": {
    overview:
      "Ice on the inlet and nose cone is dangerous: it distorts the airflow and, when it sheds, can be ingested and damage the compressor. Ice-protection systems keep the critical front surfaces above freezing using engine heat or electrical power.",
    sections: [
      { h: "Why ice protection matters", p: "Supercooled water striking the cold inlet lip, nose cone (spinner) and guide vanes forms ice that reshapes the flow path, reduces mass flow and can break off in chunks. Ingested ice can nick or crack compressor blades, so the front of the engine must be kept ice-free in icing conditions." },
      { h: "Hot-air anti-ice", p: "The most common system bleeds hot air from the compressor and ducts it through the inlet lip and, on some engines, the nose cowl and struts, keeping them warm enough to prevent ice forming. It is simple and effective but costs a little engine performance because the bleed air is diverted from making thrust." },
      { h: "Electrical anti-ice", p: "Electrical heating elements protect small, critical items like pressure/temperature probes and, on some engines, the spinner. Electrical systems can be finely controlled and don't cost bleed air, but draw generator power and add wiring and control complexity." },
      { h: "Anti-ice vs de-ice", p: "Anti-ice systems run continuously to prevent ice forming; de-ice systems let a thin layer build and then shed it periodically. Engine inlets are almost always anti-iced (continuous), because shed ice is exactly what must be avoided at the compressor face." },
    ],
    takeaways: [
      "Inlet ice distorts flow and, when shed, can damage the compressor",
      "Hot-air anti-ice uses compressor bleed to warm the lip and cowl",
      "Electrical anti-ice protects probes and some spinners without bleed cost",
      "Engine inlets are anti-iced (continuous prevention), not de-iced",
    ],
  },
  "2.5": {
    overview:
      "A compressor's behaviour is captured on its map — pressure ratio against mass flow, crossed by speed lines and bounded by the surge line. Staying on the working line, with margin to spare, keeps the engine stable; and the big front fan must be balanced to run smoothly.",
    sections: [
      { h: "The compressor map", p: "The map plots pressure ratio (vertical) against corrected mass flow (horizontal), with curved lines of constant corrected speed and contours of efficiency. It is the single most important picture of compressor behaviour, showing exactly how the compressor responds as the engine is throttled and conditions change." },
      { h: "Working line & surge margin", p: "In operation the compressor runs along a working (operating) line set by the downstream turbine and nozzle. Above it lies the surge line, where flow breaks down. The vertical gap between them is the surge margin — the safety buffer the engine must keep at all times, especially during rapid throttle changes." },
      { h: "Fan balancing", p: "The large fan is a massive rotating mass; even tiny imbalances cause vibration that fatigues structures and annoys passengers. Trim balancing adds small weights at the fan to cancel imbalance, measured by vibration sensors — a routine but essential piece of engine maintenance." },
      { h: "Corrected parameters", p: "Because compressor behaviour depends on the incoming air's temperature and pressure, engineers use 'corrected' speed and mass flow (referenced to standard conditions) so one map applies at any altitude and temperature. This is why the map's axes are corrected, not raw, quantities." },
    ],
    takeaways: [
      "The compressor map plots pressure ratio vs mass flow with speed & efficiency lines",
      "The working line must stay clear of the surge line — that gap is surge margin",
      "Trim balancing cancels fan imbalance to control vibration",
      "Corrected speed and flow let one map apply at any altitude/temperature",
    ],
  },
  "2.6": {
    overview:
      "When compressor airflow breaks down you get stall or surge — from a localised blade stall to a violent, full-engine flow reversal. Knowing the difference, the causes and the effects is core to understanding compressor operation and engine handling.",
    sections: [
      { h: "Compressor stall", p: "Stall is a local aerodynamic breakdown: air separates from one or more blades when their angle of attack is too high (too little airflow for the rotational speed). It may be a rotating stall cell that travels around the annulus, causing vibration and localised loss without necessarily stopping the engine." },
      { h: "Compressor surge", p: "Surge is the severe case — a complete, momentary reversal of flow through the whole compressor as the pressure downstream overwhelms the compressor's ability to hold it. It is often audible as a loud bang, can flare the engine, and imposes large mechanical and thermal shocks. Repeated surges can damage the engine." },
      { h: "Causes", p: "Anything that pushes the operating point toward the surge line: inlet distortion, rapid throttle slams, ingestion of ice/birds/FOD, blade damage or contamination (fouling), a failed bleed valve or variable vane, or operating far off-design. Surge margin exists precisely to absorb these disturbances." },
      { h: "Effects & recovery", p: "Stall/surge cause thrust loss, high EGT, vibration and noise. Modern controls detect and recover by opening bleeds, adjusting fuel and repositioning variable vanes. Crews are trained to reduce power and follow procedures; engineers investigate the cause, since surge is a symptom of something wrong upstream." },
    ],
    takeaways: [
      "Stall = local blade flow separation; surge = full-engine flow reversal",
      "Surge is violent — a bang, thrust loss, high EGT and mechanical shock",
      "Distortion, throttle slams, FOD, fouling or vane/bleed faults trigger it",
      "Surge margin absorbs disturbances; controls detect and recover from surge",
    ],
  },
  "2.7": {
    overview:
      "The compressor is optimised for one design point, but the engine must run from idle to full power. Airflow-control devices — bleed valves and variable vanes — keep it stable everywhere else by matching the airflow to the blade geometry.",
    sections: [
      { h: "Bleed valves", p: "At low speeds the front stages pump more air than the back stages can swallow, pushing the front toward stall. Bleed (blow-off) valves dump this excess air overboard or into the bypass, relieving the mismatch and keeping the front stages stable during starting and low-power operation." },
      { h: "Variable inlet guide vanes & stator vanes", p: "Variable IGVs and variable stator vanes (VSVs) rotate to change the angle at which air meets the following rotor. By keeping the blade incidence correct as speed changes, they let the compressor run efficiently and stall-free across a wide range instead of only at its design point." },
      { h: "Why airflow control matters", p: "Together, bleeds and variable vanes widen the stable operating range and increase surge margin, letting a high-pressure-ratio compressor accelerate smoothly from idle to full power without stalling. Without them, high-ratio multi-stage compressors simply could not be operated safely off-design." },
      { h: "Scheduling and control", p: "The engine control unit schedules vane angles and bleed opening against corrected speed (and sometimes temperature), continuously trimming the compressor's geometry to the operating point. A stuck vane or bleed is a classic cause of poor acceleration or surge." },
    ],
    takeaways: [
      "Bleed valves dump excess low-speed air to keep the front stages from stalling",
      "Variable IGVs/stators rotate to keep blade incidence correct across the range",
      "Airflow control widens the stable range and boosts surge margin",
      "The control unit schedules vanes and bleeds against corrected speed",
    ],
  },
  "2.8": {
    overview:
      "In the combustor, fuel meets air and burns continuously, releasing the heat that powers the whole engine — while keeping the flame stable and protecting the metal liner from the very heat it creates. It is a masterclass in staging airflow.",
    sections: [
      { h: "Construction: can, annular, can-annular", p: "Can (tubular) combustors use separate flame tubes; annular combustors use one continuous ring for light weight and even flow; can-annular combines separate liners inside a common annular casing. Modern engines overwhelmingly use annular combustors for their compactness and uniform outlet temperature." },
      { h: "Primary, secondary & dilution zones", p: "Only about a quarter of the air enters the primary zone for combustion at the right fuel-air ratio; the secondary (intermediate) zone completes the burn; the dilution zone mixes in the remaining air to cool the gas to a temperature the turbine can survive and to shape the outlet temperature profile." },
      { h: "Cooling and liner protection", p: "A film of cool air is fed along the inside of the liner walls to shield the metal from the flame, which is far hotter than the liner could otherwise withstand. Managing this cooling air while still burning fuel efficiently is one of the combustor designer's hardest jobs." },
      { h: "Principles of operation", p: "The combustor must maintain stable, efficient combustion from idle to full power and altitude relight, avoid hot spots that damage the turbine, keep pressure loss low, and increasingly minimise emissions (NOx, smoke). Lean-burn and staged-injection designs chase low emissions without losing stability." },
    ],
    takeaways: [
      "Combustors come as can, annular or can-annular; annular dominates modern engines",
      "Air is staged: primary burns, secondary completes, dilution cools the gas",
      "A film of cooling air shields the liner from flame far hotter than the metal",
      "Combustion must stay stable and clean from idle to altitude relight",
    ],
    keyTerms: [
      { t: "Flame tube / liner", d: "The perforated inner shell that contains the flame and admits staged air." },
      { t: "Primary zone", d: "Where fuel burns at near-stoichiometric ratio for a stable flame." },
      { t: "Dilution zone", d: "Where remaining air cools the gas to a turbine-safe temperature and shapes the profile." },
      { t: "Annular combustor", d: "A single continuous ring-shaped combustor — light, compact, even outlet temperature." },
    ],
    applications: [
      "Virtually all modern airliner engines use annular combustors.",
      "Low-emissions combustors (DAC, lean-burn) reduce NOx for airport air-quality rules.",
      "Altitude relight capability is a certification requirement for the combustor.",
    ],
  },
  "2.9": {
    overview:
      "The turbine extracts the energy the combustor put in: nozzle guide vanes accelerate and swirl the hot gas onto rotating blades, which spin the compressor and fan. It is where heat and pressure become shaft work — under brutal temperature and stress.",
    sections: [
      { h: "Operation & characteristics", p: "Nozzle guide vanes (NGVs) sit ahead of each turbine rotor, accelerating the gas and turning it to the correct angle to strike the rotating blades efficiently. The rotor blades then extract work, dropping the gas pressure and temperature. Multiple stages progressively extract energy for the LP and HP spools." },
      { h: "Turbine blade types", p: "Impulse blading extracts energy purely from the gas's change in direction (pressure drop across the NGVs); reaction blading extracts it from a pressure drop across the moving blades themselves; most real turbines use impulse-reaction blading that varies from root to tip to suit the changing gas conditions along the blade." },
      { h: "Blade-to-disk attachment", p: "Each blade is held in the disk by a fir-tree root — a serrated dovetail that spreads the enormous centrifugal load (each small blade can pull with tonnes of force at speed) into the disk. The fit allows for thermal expansion and is one of the most highly engineered joints in the engine." },
      { h: "Turbine vs compressor", p: "The turbine does the reverse of the compressor: where the compressor adds energy against a rising pressure (hard, prone to stall), the turbine extracts energy with a falling pressure (aerodynamically easier). That is why a few turbine stages can drive many compressor stages." },
    ],
    takeaways: [
      "NGVs accelerate and turn the hot gas onto the rotating turbine blades",
      "Impulse, reaction and impulse-reaction blading extract energy differently",
      "Fir-tree roots spread each blade's tonnes of centrifugal load into the disk",
      "Falling pressure makes turbines efficient — few stages drive many compressor stages",
    ],
    keyTerms: [
      { t: "Nozzle guide vane (NGV)", d: "Stationary vane that accelerates and turns hot gas onto the turbine rotor." },
      { t: "Impulse blading", d: "Extracts energy from the gas's change of direction, at constant blade pressure." },
      { t: "Reaction blading", d: "Extracts energy from a pressure drop across the moving blades." },
      { t: "Fir-tree root", d: "Serrated blade root that locks the blade into the disk against centrifugal load." },
    ],
    applications: [
      "HP turbines drive the HP compressor; LP turbines drive the fan/LP compressor.",
      "Single-crystal blades and thermal-barrier coatings push turbine entry temperatures higher.",
      "NGV and blade condition are key items in borescope inspections.",
    ],
  },
  "2.10": {
    overview:
      "Turbine blades are the hardest-working parts in the engine: red-hot, spun at enormous speed, and expected to last thousands of hours. Centrifugal stress plus high temperature cause creep — and the fight against it drives some of aerospace's most advanced materials and cooling.",
    sections: [
      { h: "Stress on turbine blades", p: "Spinning at speed, each blade experiences huge centrifugal (tensile) stress pulling it out of the disk, plus bending from the gas load and vibratory (fatigue) stresses — all while glowing hot. The combination of high stress and high temperature is what makes turbine-blade design so demanding." },
      { h: "Creep", p: "Creep is slow, permanent elongation of the blade under sustained stress at high temperature. Over time the blade literally stretches; if unchecked it can touch the casing or fail. Creep life sets a hard limit on how hot and how fast a turbine can run, and it is a primary life-limiting mechanism for hot-section parts." },
      { h: "Blade cooling", p: "To run the gas hotter than the blade metal could survive, cool compressor air is fed through internal serpentine passages and out through tiny holes to form a protective film over the blade surface. Film cooling and internal convection let blades operate in gas hundreds of degrees above their melting point." },
      { h: "Advanced materials", p: "Nickel-based superalloys, directionally-solidified and single-crystal castings (which remove weak grain boundaries), and ceramic thermal-barrier coatings all raise the temperature a blade can tolerate. Each advance buys higher turbine entry temperature — and therefore more thrust and efficiency." },
    ],
    takeaways: [
      "Blades face centrifugal, bending and vibratory stress — while red-hot",
      "Creep is slow permanent stretch under stress + heat; it limits blade life",
      "Internal passages and film cooling let blades run above the gas's metal-melting temp",
      "Single-crystal alloys and thermal-barrier coatings raise allowable temperature",
    ],
    keyTerms: [
      { t: "Creep", d: "Time-dependent permanent deformation under stress at high temperature." },
      { t: "Film cooling", d: "A layer of cool air bled through blade holes to shield the surface from hot gas." },
      { t: "Single-crystal blade", d: "A blade cast as one crystal, removing grain boundaries that weaken it in creep." },
      { t: "Thermal-barrier coating", d: "A ceramic layer that insulates the blade metal from the hot gas." },
    ],
    applications: [
      "Turbine entry temperature has risen decade on decade thanks to cooling and materials.",
      "Creep and fatigue set the certified life limits of hot-section components.",
      "Blade cooling airflow is itself a performance cost carefully optimised by designers.",
    ],
  },
  "2.11": {
    overview:
      "The exhaust system turns the gas leaving the turbine into useful jet velocity and manages what's left. Nozzle shape — convergent, convergent-divergent or variable-area — decides how efficiently the remaining pressure becomes thrust, and choking sets the limit.",
    sections: [
      { h: "Exhaust construction", p: "Behind the turbine, an exhaust cone (tail cone) and struts straighten the swirling gas and smooth the flow, while the jet pipe carries it to the nozzle. In turbofans a mixer may blend the hot and cold streams. The whole assembly must survive high temperature and contribute minimal pressure loss." },
      { h: "Nozzle types", p: "A simple convergent nozzle suits subsonic engines: it accelerates the gas up to (at most) the local speed of sound. For supersonic jet velocities a convergent-divergent (con-di) nozzle is needed, where the divergent section accelerates the already-sonic flow to supersonic speed." },
      { h: "Choking", p: "When the gas reaches sonic velocity at the convergent throat, the nozzle is 'choked' — it can pass no more velocity, and exit pressure stays above ambient. This is the normal high-power condition and is exactly what adds the pressure-thrust term met in Unit I. A con-di nozzle relieves choking to reach supersonic exit." },
      { h: "Variable-area nozzles", p: "Military engines with reheat (afterburning) need a nozzle whose area can change: opening the nozzle when reheat lights (to pass the extra volume) and closing it for dry thrust. Variable-area nozzles keep the engine matched across reheat and flight condition — a complex, heavily-cooled mechanism." },
    ],
    takeaways: [
      "The exhaust cone and struts straighten the gas before the nozzle",
      "Convergent nozzles for subsonic jets; convergent-divergent for supersonic",
      "A choked nozzle passes sonic flow and leaves exit pressure above ambient",
      "Variable-area nozzles match reheat and flight condition on military engines",
    ],
  },
  "2.12": {
    overview:
      "Two jobs finish the gas path: making the engine quieter, and helping the aircraft stop. Noise reduction tames the roar of the jet and fan; thrust reversers redirect thrust forward on landing — powerful tools with strict safety interlocks.",
    sections: [
      { h: "Engine noise reduction", p: "Jet noise comes mainly from the violent mixing of fast exhaust with still air. High bypass already cuts it by lowering jet velocity; chevrons (the saw-tooth edges on modern nozzles) smooth the mixing further; acoustic liners in the inlet and bypass duct absorb fan noise. Together they let big engines meet strict airport noise limits." },
      { h: "Thrust reversers", p: "Reversers redirect engine thrust forward to help decelerate the aircraft after touchdown. Cascade (cold-stream) reversers open blocker doors that turn the bypass air through cascade vanes; clamshell/bucket reversers deflect the exhaust; both convert forward thrust into a retarding force, sparing the wheel brakes." },
      { h: "Operation & safety", p: "Reversers are among the most safety-critical systems: they may deploy only on the ground, with weight-on-wheels and other interlocks, and are designed to fail safe (stow) if anything is wrong. An in-flight deployment is catastrophic, so the interlock and monitoring design is exhaustive." },
      { h: "Why it matters", p: "Noise reduction is essential for airport access and community relations; thrust reversal shortens landing rolls and improves safety on wet or contaminated runways. Neither makes thrust, but both are indispensable to operating a modern engine in service." },
    ],
    takeaways: [
      "Jet noise comes from exhaust mixing; chevrons, liners and high bypass reduce it",
      "Reversers redirect thrust forward to help stop the aircraft after landing",
      "Cascade reversers turn bypass air; clamshell reversers deflect the exhaust",
      "Reversers deploy only on the ground under strict, fail-safe interlocks",
    ],
    keyTerms: [
      { t: "Chevron", d: "Saw-tooth nozzle trailing edge that smooths exhaust mixing to cut jet noise." },
      { t: "Acoustic liner", d: "Sound-absorbing panels in the inlet/bypass duct that damp fan noise." },
      { t: "Cascade reverser", d: "A reverser that turns bypass air forward through cascade vanes behind blocker doors." },
      { t: "Interlock", d: "A safety condition (e.g. weight-on-wheels) that must be met before a reverser can deploy." },
    ],
    applications: [
      "Chevron nozzles appear on the 787/GEnx and many modern airliners.",
      "Cascade (cold-stream) reversers are standard on high-bypass airliner engines.",
      "Reverser interlocks are a heavily certified, fail-safe safety system.",
    ],
  },
};

// Unit III — Fuel, Ignition & Starting. Metering, FADEC, starting and light-up.
const UNIT3 = {
  "3.1": {
    overview:
      "The fuel system's job sounds simple — get fuel to the burner — but it must deliver clean, precisely metered fuel matched to thrust demand across every condition, from a freezing high-altitude relight to a hot-day take-off, without ever letting the engine surge, overtemp or flame out.",
    sections: [
      { h: "Purpose of the fuel system", p: "Supply clean, filtered fuel at the right pressure and flow for whatever the engine is being asked to do. Too little fuel and the flame goes out; too much and the engine surges or over-temperatures. The system must schedule fuel correctly for starting, acceleration, steady running and deceleration." },
      { h: "Main components", p: "A low-pressure (boost) pump lifts fuel from the tank; filters clean it; a high-pressure pump raises it to injection pressure; the fuel control unit (FCU) meters exactly the right flow; a flow divider and spray nozzles atomise it into the combustor. A fuel/oil heat exchanger warms the fuel (preventing ice) while cooling the oil." },
      { h: "Fuel scheduling", p: "The heart of the system is scheduling: fuel flow is set as a function of throttle position, engine speed, pressures and temperatures. Acceleration schedules give enough fuel to spool up briskly but stay clear of the surge and over-temperature limits; deceleration schedules avoid dropping below the flame-out boundary." },
      { h: "Atomisation & spray pattern", p: "Fuel must leave the nozzles as a fine, correctly-shaped spray so it mixes and burns cleanly. Poor atomisation causes hot streaks that damage the turbine, carbon build-up and poor light-up — which is why nozzle condition is a routine maintenance concern." },
    ],
    takeaways: [
      "The fuel system delivers clean, metered fuel matched to thrust demand",
      "Boost pump → filter → HP pump → FCU → flow divider → spray nozzles",
      "Scheduling avoids surge/over-temp (too much) and flame-out (too little)",
      "Good atomisation is essential for clean burning and turbine protection",
    ],
    keyTerms: [
      { t: "Fuel control unit (FCU)", d: "The device that meters exactly the right fuel flow for the engine's condition." },
      { t: "Flow divider", d: "Splits metered fuel between primary and secondary nozzle manifolds as pressure rises." },
      { t: "Fuel/oil heat exchanger", d: "Warms fuel (preventing ice) while cooling engine oil." },
      { t: "Atomisation", d: "Breaking fuel into a fine spray so it mixes and burns cleanly." },
    ],
    applications: [
      "Fuel heating prevents ice crystals from blocking filters at altitude.",
      "Spray-nozzle condition is checked because hot streaks damage the turbine.",
      "Fuel scheduling underlies safe acceleration without surge or over-temperature.",
    ],
  },
  "3.2": {
    overview:
      "Fuel metering is the balancing act at the centre of engine control: give the engine enough fuel to accelerate crisply, but never so much that it surges or over-temperatures — and never so little that the flame blows out. Getting the schedule right is what makes an engine responsive and safe.",
    sections: [
      { h: "Metering principle", p: "Fuel flow is scheduled against the operating point — throttle demand, engine speed (N), compressor delivery pressure and temperature. The control continuously computes the fuel flow that will move the engine toward the demanded thrust while respecting every limit." },
      { h: "Acceleration & deceleration limits", p: "During acceleration, over-fuelling would push the compressor toward surge and spike the turbine temperature, so the schedule caps fuel below those limits — the engine accelerates as fast as is safe, no faster. During deceleration, under-fuelling risks flame-out, so a minimum-fuel schedule holds the flame in." },
      { h: "Hydromechanical vs electronic", p: "Older engines used clever hydromechanical fuel control units (HMUs) — networks of valves, cams and governors that computed the schedule mechanically. Modern engines use electronic control (FADEC) that schedules fuel digitally with far greater precision and adaptability, though a hydromechanical metering valve often still does the physical work." },
      { h: "Why precise metering matters", p: "Precise metering gives responsive, repeatable thrust, protects the hot section, minimises fuel burn and enables built-in protections. It is the difference between an engine that spools smoothly and one that surges or over-temps on a throttle slam." },
    ],
    takeaways: [
      "Fuel flow is scheduled against throttle, speed, pressure and temperature",
      "Acceleration schedules stay below surge and over-temp limits",
      "Deceleration schedules stay above the flame-out limit",
      "Hydromechanical units are giving way to precise electronic (FADEC) control",
    ],
  },
  "3.3": {
    overview:
      "FADEC — Full Authority Digital Engine Control — is the brain of the modern engine. A digital computer with complete authority over fuel and engine geometry reads a constellation of sensors and schedules everything precisely, protecting the engine and cutting crew workload to a single throttle lever.",
    sections: [
      { h: "What FADEC does", p: "The electronic engine control (EEC) has full authority: it alone decides fuel flow, variable-vane angles, bleed positions and start sequencing, within certified limits. The pilot commands thrust with the throttle; FADEC works out exactly how to deliver it safely and efficiently at the current conditions." },
      { h: "Sensors & actuators", p: "FADEC reads spool speeds (N1/N2), temperatures (EGT/TET), pressures (P and EPR), throttle position, and air data. It commands the fuel metering valve, variable stator vanes, bleed valves, the starter and ignition. It is a closed loop: measure, compute, actuate, repeat, many times a second." },
      { h: "Benefits", p: "Optimised performance at every condition; built-in protection against over-speed, over-temperature and surge; automatic starting; reduced crew workload; and continuous diagnostics that record faults and support maintenance. Dual-channel redundancy keeps a single failure from stopping the engine." },
      { h: "Redundancy & safety", p: "A FADEC has two independent channels (A and B); if the active channel fails, the standby takes over seamlessly. This redundancy, plus the certified limits built into the software, is why an authority-full digital controller is trusted with the whole engine." },
    ],
    takeaways: [
      "FADEC is a digital computer with full authority over fuel and engine geometry",
      "It reads speeds, temperatures and pressures; commands fuel, vanes and bleeds",
      "Benefits: optimised performance, protection, auto-start, diagnostics, low workload",
      "Dual-channel redundancy keeps a single failure from stopping the engine",
    ],
    keyTerms: [
      { t: "FADEC", d: "Full Authority Digital Engine Control — the computer that fully controls the engine." },
      { t: "EEC", d: "Electronic Engine Control — the computer unit at the heart of a FADEC system." },
      { t: "Full authority", d: "The controller alone commands fuel and geometry, within certified limits." },
      { t: "Dual-channel", d: "Two independent control channels for redundancy; one takes over if the other fails." },
    ],
    applications: [
      "Every modern airliner engine (CFM56, LEAP, Trent, GEnx) is FADEC-controlled.",
      "FADEC records fault data that drives on-condition maintenance.",
      "Automatic surge and over-temperature protection are built into the EEC software.",
    ],
  },
  "3.4": {
    overview:
      "Seeing the whole fuel system laid out — low-pressure and high-pressure circuits, heat exchange, filtration, metering and distribution — shows how the components of sessions 3.1–3.3 connect into one coherent path from tank to flame.",
    sections: [
      { h: "System layout", p: "Fuel travels from the aircraft tanks through a low-pressure circuit (boost pump, LP filter, fuel/oil heat exchanger) to the high-pressure circuit (HP pump, metering unit, HP filter) and finally to the flow divider and nozzles. Each stage prepares the fuel — pressurised, warmed, cleaned and metered — for clean combustion." },
      { h: "Fuel/oil heat exchanger", p: "Engine oil runs hot and fuel runs cold; passing them through a heat exchanger warms the fuel (melting any ice crystals and preventing filter icing) while cooling the oil. It is a neat two-for-one that solves fuel icing and oil cooling at once." },
      { h: "Nozzles & flow divider", p: "As engine demand rises, fuel pressure increases; the flow divider progressively brings in primary then secondary nozzle circuits so the spray pattern stays correct across the range. Duplex (two-stage) nozzles atomise well at both low and high flows." },
      { h: "Shut-off and safety", p: "A high-pressure shut-off valve (often the fire handle's job) can cut fuel to the engine instantly, and drain provisions catch residual fuel after shut-down to prevent pooling and fire. These features make the plumbing not just functional but safe." },
    ],
    takeaways: [
      "LP circuit (boost, filter, heat exchanger) feeds the HP circuit (pump, metering)",
      "The fuel/oil heat exchanger warms fuel and cools oil in one unit",
      "The flow divider stages nozzle circuits to keep the spray pattern correct",
      "An HP shut-off valve can cut fuel instantly for fire safety",
    ],
  },
  "3.5": {
    overview:
      "A gas turbine can't start itself: the starter must spin the core up to a speed where enough air is flowing that, once fuel and ignition are added, combustion becomes self-sustaining. Understanding the start envelope is key to recognising when a start goes wrong.",
    sections: [
      { h: "Purpose of the starter", p: "The starter rotates the HP spool to establish airflow through the compressor and combustor before fuel and ignition are introduced. Without that airflow, fuel would simply pool and a light-up would be impossible or dangerous. The starter keeps driving until the engine can accelerate on its own." },
      { h: "The start sequence & envelope", p: "Key speeds define the start: the starter spins the core; at a set speed fuel and ignition are introduced; light-off occurs (EGT rises); the engine accelerates; at self-sustaining speed the starter can drop out; the engine then continues to idle. Each step has a target and a time limit." },
      { h: "Hung & hot starts", p: "A hung start is when the engine lights but stalls at a low speed below idle — not enough energy to accelerate. A hot start is when EGT rises too fast or too high, threatening the turbine. Both require the start to be aborted (fuel off) to protect the engine, and both point to a fault to investigate." },
      { h: "Monitoring the start", p: "The crew (or FADEC) watches N2 rise, EGT after fuel-on, N1 following, and fuel flow. A healthy start shows a prompt light-off, EGT peaking within limits, and a smooth acceleration to idle. Deviations are the early warning of a hung, hot or no-start." },
    ],
    takeaways: [
      "The starter spins the core to establish airflow before fuel and ignition",
      "Start speeds: crank → fuel/ignition on → light-off → self-sustaining → idle",
      "A hung start stalls below idle; a hot start over-temps — both must be aborted",
      "Watch N2, EGT, N1 and fuel flow to confirm a healthy start",
    ],
    keyTerms: [
      { t: "Self-sustaining speed", d: "The speed above which the engine can accelerate without the starter." },
      { t: "Light-off", d: "The moment combustion begins, shown by a rising EGT after fuel-on." },
      { t: "Hung start", d: "The engine lights but stalls below idle speed — abort required." },
      { t: "Hot start", d: "EGT rises too high or too fast during start — abort to protect the turbine." },
    ],
    applications: [
      "Start limits and abort criteria are memory items for flight crews.",
      "FADEC automates start sequencing and aborts abnormal starts on modern engines.",
      "Hot/hung starts are logged and investigated as hot-section and fuel-system clues.",
    ],
  },
  "3.6": {
    overview:
      "There are several ways to turn a gas turbine over for starting — a pneumatic air-turbine motor, an electric starter, or bleed air from an APU or another running engine. Each suits a different aircraft and operating context.",
    sections: [
      { h: "Pneumatic (air) starter", p: "The airline norm: a compact air-turbine motor drives the HP spool through a gearbox, spun by high-pressure air. It is light and powerful for its size. The air comes from an APU, a ground air cart, or cross-bleed from another running engine." },
      { h: "Electric starter / starter-generator", p: "Small engines (and increasingly large ones) use an electric starter, often a starter-generator that motors the engine for start and then generates electrical power once running. It needs no air supply but draws heavy electrical current during start." },
      { h: "APU & cross-bleed", p: "The auxiliary power unit (APU) is a small gas turbine that supplies the bleed air (and electrical power) to start the main engines on the ground. Cross-bleed uses air from an already-running engine to start the others — useful when no APU or ground cart is available." },
      { h: "Choosing a system", p: "The choice follows aircraft size, available air/electrical power and philosophy: pneumatic for most airliners (light, powerful), electric for small aircraft and more-electric designs. Both must deliver enough torque to reach self-sustaining speed within the start time limit." },
    ],
    takeaways: [
      "Pneumatic air-turbine starters are the airline norm — light and powerful",
      "Electric starters (often starter-generators) suit small and more-electric engines",
      "The APU supplies bleed air/power; cross-bleed uses another running engine",
      "System choice follows aircraft size and available air/electrical power",
    ],
  },
  "3.7": {
    overview:
      "Ignition provides the spark that lights the fire during starting and relight. Because it must ignite an atomised fuel-air mixture reliably — even at altitude in cold, thin air — engines use high-energy capacitor-discharge ignition, far more powerful than a car's spark plug.",
    sections: [
      { h: "Ignition principle", p: "A high-voltage, high-energy spark jumps the gap of an igniter plug in the combustor, igniting the atomised fuel-air mixture. Once the flame is established and self-sustaining, ignition is usually switched off — the flame then propagates continuously without further sparks." },
      { h: "High-energy ignition", p: "A capacitor-discharge exciter stores electrical energy and releases it as an intense spark many joules strong — vastly more energetic than automotive ignition — so it can light a cold, poorly-atomised mixture at altitude. The characteristic loud 'tick... tick' during start is the exciter firing." },
      { h: "When ignition is on", p: "Ignition runs during start and relight, and is selected on for take-off and landing, and in heavy rain, icing or turbulence — any time a flame-out is more likely and an immediate automatic relight is wanted. Otherwise it is off to save igniter-plug life." },
      { h: "Continuous vs automatic", p: "Continuous ignition keeps sparking as a precaution; automatic (FADEC-commanded) ignition fires the igniters only when needed, e.g. on detecting a flame-out. Modern engines lean on automatic ignition to protect plug life while guaranteeing relight." },
    ],
    takeaways: [
      "A high-energy spark ignites the atomised fuel-air mixture in the combustor",
      "Capacitor-discharge exciters give sparks far stronger than automotive ignition",
      "Ignition is on for start/relight and selected for take-off, landing and bad weather",
      "Once the flame is self-sustaining, ignition can be switched off",
    ],
    keyTerms: [
      { t: "Igniter plug", d: "The combustor spark device — surface-discharge or air-gap type." },
      { t: "Exciter", d: "The unit that stores energy and releases it as a high-energy spark." },
      { t: "Capacitor-discharge", d: "Ignition that stores charge in a capacitor and dumps it for an intense spark." },
      { t: "Relight", d: "Re-igniting the combustor after a flame-out, often at altitude." },
    ],
    applications: [
      "Continuous ignition is selected for take-off, landing and severe weather.",
      "Altitude relight capability is a certification requirement.",
      "The 'tick' during start is the capacitor-discharge exciter firing.",
    ],
  },
  "3.8": {
    overview:
      "The ignition circuit is short but carries lethal energy: an exciter steps up and stores the charge, shielded high-tension leads carry the pulse, and igniter plugs create the spark. Knowing the parts — and the danger — is essential for safe maintenance.",
    sections: [
      { h: "Ignition exciter", p: "The exciter takes low-voltage input, steps it up and stores energy in a capacitor, then discharges it as a high-energy pulse to the igniter. It may be a single- or dual-channel unit feeding one or two igniters. Its stored charge is dangerous even after power is removed." },
      { h: "Igniter plugs", p: "Igniter plugs sit in the combustor and create the spark. Surface-discharge (surface-gap) plugs let the spark track across a semiconductor surface; air-gap plugs jump a gap like a spark plug. They erode with use and are periodically inspected and replaced." },
      { h: "High-tension leads", p: "Shielded, sometimes air-cooled high-tension leads carry the intense pulse from exciter to igniter without radiating interference or arcing. Their shielding also protects technicians and other systems from the high-energy discharge." },
      { h: "Maintenance safety", p: "Because the exciter stores lethal energy, strict procedures apply: switch off, wait the specified time and follow discharge/lock-out procedures before disconnecting leads or touching igniters. Ignition energy has killed — it is treated with the same respect as any lethal-voltage system." },
    ],
    takeaways: [
      "The exciter steps up and stores energy, then discharges it to the igniter",
      "Surface-discharge and air-gap igniter plugs create the combustor spark",
      "Shielded high-tension leads carry the pulse safely and quietly",
      "The exciter holds lethal charge — lock-out and wait before touching ignition",
    ],
  },
  "3.9": {
    overview:
      "A start is a choreography: starter, ignition and fuel introduced in the right order and timing, watched on the gauges until the engine stabilises at idle. On modern engines FADEC runs the whole dance and aborts if anything looks wrong.",
    sections: [
      { h: "Sequence of events", p: "Typical order: starter engaged → HP spool (N2) accelerates → ignition on → fuel on at the scheduled speed → light-off (EGT rises) → engine accelerates → starter cuts out at self-sustaining speed → ignition off → engine stabilises at idle. Each step has a target speed and a time limit." },
      { h: "Monitoring the start", p: "The key gauges tell the story: N2 must rise steadily, EGT must show a prompt light-off and peak within limits, N1 must follow, and fuel flow must be in range. A healthy start is smooth and prompt; a sluggish N2, slow light-off or fast-climbing EGT signals trouble." },
      { h: "Automatic start control", p: "FADEC sequences the modern start automatically: it engages the starter, times fuel and ignition, monitors EGT and speeds, and aborts (fuel off, motor over) if it detects a hot, hung or no-start. This removes timing errors and protects the engine far better than manual starts." },
      { h: "Ground vs air starts", p: "Ground starts use the starter and APU/ground air; air (in-flight) starts may use windmilling airflow plus ignition, or an assisted start within a defined envelope of speed and altitude. Knowing the relight envelope matters for engine-out situations." },
    ],
    takeaways: [
      "Start order: starter → N2 rise → ignition → fuel → light-off → idle",
      "Confirm the start on N2, EGT, N1 and fuel flow",
      "FADEC sequences and protects the start, aborting abnormal ones",
      "Air starts use windmilling or assistance within a defined relight envelope",
    ],
  },
  "3.10": {
    overview:
      "Fuel, ignition and starting are also the most hazardous systems to work around: an engine can ingest or blast a person, ignition energy can kill, and fuel can burn. Maintenance safety is not paperwork — it is what keeps technicians alive on the ramp.",
    sections: [
      { h: "Intake & exhaust danger zones", p: "A running engine's intake can ingest a person, and its exhaust blast can throw one across the ramp — both extend well beyond the engine. Defined hazard zones, clear communication and never entering the intake danger area with the engine running are absolute rules." },
      { h: "High-energy ignition safety", p: "Ignition exciters store lethal energy that persists after power-off. Before working on ignition, technicians switch it off, wait the specified discharge time and follow lock-out/tag-out — treating the system as live until proven safe. Careless contact has been fatal." },
      { h: "Fuel handling & fire safety", p: "Fuel handling demands bonding/grounding to prevent static ignition, spill containment, no ignition sources, and a fire watch with the right extinguisher. Vapours, not just liquid, are the hazard, so ventilation and housekeeping matter as much as the fuel itself." },
      { h: "A safety mindset", p: "These systems reward discipline and punish shortcuts. Following the procedures — zones, lock-out, bonding, fire watch — every time, without exception, is what separates a routine job from an accident. Safety culture is part of the engineering." },
    ],
    takeaways: [
      "Intake ingestion and exhaust blast zones extend well beyond the engine",
      "Ignition exciters hold lethal energy — lock out and wait before touching them",
      "Fuel work needs bonding, spill control, no ignition sources and a fire watch",
      "Discipline with the procedures, every time, is what prevents accidents",
    ],
  },
  "3.11": {
    overview:
      "Bringing Unit III together: fuel, ignition and starting are three systems that must act in perfect concert for a normal start and run. Seeing how they interact — and how their faults present — consolidates the whole unit.",
    sections: [
      { h: "System integration", p: "A start needs all three: the starter provides airflow, ignition provides the spark, and fuel provides the energy — introduced in the right order and timing. In steady running, fuel metering (FCU/FADEC) holds the operating point while ignition rests and the starter is disengaged. The systems hand off cleanly from start to run." },
      { h: "Common faults", p: "No-start (no light-off) often points to fuel or ignition; a hot start to over-fuelling or a hot-section issue; a hung start to insufficient starter torque or air. Vibration, EGT and fuel-flow patterns during start help localise which system is at fault." },
      { h: "Linking components to events", p: "Mapping each component to the event it controls — starter to core acceleration, igniter to light-off, FCU/FADEC to fuel schedule — turns a list of parts into a working mental model of the start and run. This mapping is what troubleshooting relies on." },
      { h: "Consolidation", p: "With the three systems understood together, the normal start becomes readable on the gauges and abnormal starts become diagnosable. This integrated view is the goal of the unit and the foundation for Unit IV's instruments and Unit V's monitoring." },
    ],
    takeaways: [
      "Starting, ignition and fuel systems act in concert for a start and run",
      "No-start points to fuel/ignition; hot start to over-fuel; hung start to torque/air",
      "Mapping components to events builds the model troubleshooting needs",
      "An integrated view makes normal starts readable and faults diagnosable",
    ],
  },
  "3.12": {
    overview:
      "Consolidating Unit III with worked scenarios and troubleshooting: diagnose start and fuel faults from their symptoms, compare hydromechanical and FADEC control, and confirm mastery of fuel, ignition and starting.",
    sections: [
      { h: "Scenario analysis", p: "Given a set of start symptoms — say a slow N2 rise with no EGT, or a rapid EGT climb toward the limit — reason from symptom to likely cause to the confirming check. This is exactly the structured diagnosis Unit V will formalise, practised here on start and fuel faults." },
      { h: "Hydromechanical vs FADEC", p: "Comparing the two control philosophies sharpens understanding: the HMU computes schedules mechanically and robustly but rigidly; FADEC computes them digitally with adaptability, protection and diagnostics. Knowing both explains why the industry moved to FADEC and what it gained." },
      { h: "Discussion points", p: "Why is ignition selected for take-off and landing? Why must acceleration fuel stay below the surge line? What distinguishes a hung from a hot start? Working these questions aloud cements the cause-and-effect links across the unit." },
      { h: "Self-assessment", p: "Confirm you can name the fuel-path components in order, describe a normal start on the gauges, explain FADEC's authority and redundancy, and state the safety rules for ignition and fuel. That mastery is the entry ticket to instruments and monitoring." },
    ],
    takeaways: [
      "Reason from start symptoms to likely cause to a confirming check",
      "Compare HMU and FADEC to see what digital control gained",
      "Explain ignition selection, fuel limits and start-fault types",
      "Confirm mastery of the fuel path, normal start and safety rules",
    ],
  },
};

// Unit IV — Indication & Power Augmentation. Reading the engine, and boosting it.
const UNIT4 = {
  "4.1": {
    overview:
      "Turbine temperature is the single most important thing to watch: it limits engine life and thrust because the hot section runs closest to its material limits. EGT and interstage turbine temperature (ITT) are the crew's window onto the hottest, most vulnerable parts of the engine.",
    sections: [
      { h: "Why temperature is measured", p: "The turbine entry is the hottest point in the engine and the first thing to be damaged by over-fuelling or a fault. Since a probe cannot survive directly in the turbine-entry gas, temperature is sampled just downstream (EGT, at the exhaust) or between turbine stages (ITT) as a protected proxy for the true turbine-entry temperature." },
      { h: "EGT & ITT", p: "A ring of thermocouples samples the gas temperature and averages it. EGT (exhaust gas temperature) is measured in the exhaust; ITT (interstage turbine temperature) between turbine stages. Both track the hot-section temperature the crew must keep within limits, especially during start and take-off." },
      { h: "Reading the gauge", p: "The gauge has a normal band, a caution band and a red-line limit. Brief exceedances are time-limited and must be logged, because they consume hot-section life. A steadily rising EGT at a fixed thrust over many flights signals hot-section deterioration — the basis of trend monitoring in Unit V." },
      { h: "EGT margin", p: "New or freshly-overhauled engines run cooler for a given thrust; as they wear, EGT for the same thrust creeps up. The gap to the red-line — the EGT margin — shrinks over the engine's life and is a headline health indicator that drives washing, inspection and removal planning." },
    ],
    takeaways: [
      "Turbine temperature limits engine life and thrust — so it is watched closely",
      "EGT (exhaust) and ITT (between stages) proxy the true turbine-entry temperature",
      "Exceedances are time-limited and logged — they consume hot-section life",
      "Shrinking EGT margin over time signals hot-section deterioration",
    ],
    keyTerms: [
      { t: "EGT", d: "Exhaust gas temperature — thermocouple-sampled temperature in the exhaust." },
      { t: "ITT", d: "Interstage turbine temperature — sampled between turbine stages." },
      { t: "Thermocouple", d: "A junction of two metals producing a voltage proportional to temperature." },
      { t: "EGT margin", d: "The gap between operating EGT and the red-line; shrinks as the engine wears." },
    ],
    applications: [
      "EGT limits are memory items for start and take-off.",
      "EGT-margin trends drive compressor washing and hot-section inspection.",
      "A hot start is caught by watching EGT during the start sequence.",
    ],
  },
  "4.2": {
    overview:
      "Thrust can't be read directly in flight, so it is inferred from a pressure or speed parameter. Engine pressure ratio (EPR) and fan speed (N1) are the two primary thrust-setting references — the numbers a crew sets and confirms for take-off, climb and cruise.",
    sections: [
      { h: "Engine pressure ratio (EPR)", p: "EPR is the ratio of turbine-discharge (or jet-pipe) total pressure to compressor-inlet total pressure. It closely reflects the pressure rise doing the propulsive work, so it is a good thrust proxy — favoured by some manufacturers (e.g. classic Pratt & Whitney and Rolls-Royce engines). It needs accurate, clean pressure probes." },
      { h: "Turbine-discharge / jet-pipe pressure", p: "The pressures used to form EPR — measured at the inlet and at turbine discharge or in the jet pipe — are themselves indications of how hard the engine is working. Their ratio cancels out ambient pressure changes, making EPR a stable thrust reference across altitude." },
      { h: "N1 as thrust set", p: "Many modern engines (e.g. CFM, GE) use fan speed (N1) as the thrust-setting parameter instead of EPR. N1 is robust and simple to measure and, for a high-bypass fan that makes most of the thrust, is a direct proxy for thrust. Pilots set a target N1 for each phase of flight." },
      { h: "EPR vs N1", p: "EPR directly reflects the pressure doing the work but depends on clean, accurate probes; N1 is robust and simple but a slightly less direct thrust proxy. Manufacturers choose one as primary; crews set take-off thrust to the relevant target computed for the day's conditions." },
    ],
    takeaways: [
      "Thrust is inferred from a parameter — EPR or N1 — not measured directly",
      "EPR = turbine-discharge / inlet total pressure — reflects the propulsive pressure rise",
      "N1 (fan speed) is a robust thrust reference for high-bypass engines",
      "Manufacturers pick EPR or N1 as primary; crews set targets per flight phase",
    ],
  },
  "4.3": {
    overview:
      "Oil pressure, oil temperature and fuel flow are the lifeblood gauges. They reveal whether the engine's bearings and gears are being lubricated and cooled, and how much fuel it is burning — corroborating the primary parameters and catching problems the thrust gauges don't show.",
    sections: [
      { h: "Oil pressure & temperature", p: "Oil lubricates and cools the bearings and gears; loss of oil pressure is a serious, time-critical emergency because bearings fail quickly without it. Oil temperature confirms the oil is doing its cooling job and isn't overheating. Together they are a direct read on the engine's mechanical health." },
      { h: "Fuel flow", p: "Fuel flow shows consumption in real time and, cross-checked against thrust and speed, reveals abnormal operation. An unexpectedly high fuel flow for a given thrust, or a mismatch with the schedule, is a clue to a fault or deterioration. It also underlies fuel-planning and range calculations." },
      { h: "Cross-checking", p: "The fluid gauges corroborate the primary engine parameters: a genuine thrust change should be consistent across N1/EPR, EGT and fuel flow. A parameter that moves alone (say EGT up but fuel flow unchanged) points to an instrumentation or specific-component issue rather than a real thrust change." },
      { h: "Why they matter", p: "Many in-flight engine problems announce themselves first on the oil or fuel gauges — a dropping oil pressure, a rising oil temperature, an odd fuel flow. Reading them alongside the thrust and temperature gauges is what turns raw numbers into an understanding of engine health." },
    ],
    takeaways: [
      "Oil pressure/temperature confirm lubrication and cooling — loss is time-critical",
      "Fuel flow reveals consumption and, cross-checked, abnormal operation",
      "Fluid gauges corroborate the primary parameters (N1/EPR, EGT)",
      "A parameter moving alone points to an instrument or component fault",
    ],
  },
  "4.4": {
    overview:
      "Modern engines don't present a wall of separate dials — EICAS (Boeing) and ECAM (Airbus) gather every parameter into one coherent, colour-coded, alerting display. The engine indication system is where all of Unit IV's signals come together for the crew.",
    sections: [
      { h: "Integrated engine displays", p: "EICAS (Engine Indicating and Crew Alerting System) and ECAM (Electronic Centralised Aircraft Monitor) show the primary parameters — N1, EGT, N2, fuel flow, oil, vibration — as gauges and digits, with limits drawn on. They replace dozens of individual instruments with one clear, prioritised picture." },
      { h: "Alerting & exceedance", p: "The display uses colour bands (green normal, amber caution, red limit) and generates messages when a parameter approaches or crosses a limit, or when a system fault occurs. It draws the crew's attention to what matters and, on Airbus, can present the corrective procedure automatically." },
      { h: "Crew interpretation", p: "The integrated display supports both routine thrust setting (reading N1/EPR against the target) and fault diagnosis (spotting the one parameter out of family, reading the alert message, following the checklist). It turns raw sensor data into decision-grade information." },
      { h: "Redundancy & recording", p: "These systems are redundant and continuously record parameters, feeding both the crew and the maintenance ground-station. The same data that alerts the crew in flight becomes the trend and fault history that drives on-condition maintenance (Unit V)." },
    ],
    takeaways: [
      "EICAS/ECAM gather all engine parameters into one coherent, alerting display",
      "Colour bands and messages flag caution and limit conditions",
      "The display supports both thrust setting and fault diagnosis",
      "Recorded parameters feed maintenance trend monitoring on the ground",
    ],
    keyTerms: [
      { t: "EICAS", d: "Engine Indicating and Crew Alerting System (Boeing) — integrated engine/alert display." },
      { t: "ECAM", d: "Electronic Centralised Aircraft Monitor (Airbus) — displays parameters and procedures." },
      { t: "Exceedance", d: "A parameter crossing a limit; flagged, time-limited and logged." },
      { t: "Red-line", d: "The maximum permissible value of a parameter, drawn on the gauge." },
    ],
    applications: [
      "EICAS/ECAM replace dozens of individual engine instruments.",
      "Airbus ECAM presents the corrective procedure with the fault.",
      "Recorded EICAS/ECAM data feeds ground-based trend monitoring.",
    ],
  },
  "4.5": {
    overview:
      "Spool speed — N1, N2 (and N3 on three-spool engines) — is a fundamental engine parameter, shown as a percentage of a datum rather than raw RPM. It sets thrust, confirms mechanical condition, and is guarded by overspeed protection.",
    sections: [
      { h: "N1 / N2 speeds", p: "Each spool's rotational speed is displayed as a percentage of a reference (100% is a defined design speed, not necessarily the maximum). N1 is the LP spool/fan; N2 the HP spool; N3 the intermediate spool on three-spool engines. Percentages let very different actual RPMs be read on one intuitive scale." },
      { h: "Speed sensing", p: "Speed is sensed by tacho-generators (a small generator whose output frequency/voltage tracks RPM) or by phonic-wheel/variable-reluctance probes that count gear-tooth or blade passages. The signals feed the indication system and the engine control, which both need accurate speed data." },
      { h: "Overspeed protection", p: "Excessive rotor speed can burst a disk — a catastrophic, uncontained failure. Overspeed protection (limits enforced by the FADEC, and independent mechanical or electronic overspeed governors) cuts fuel or otherwise limits the engine before a destructive overspeed can occur." },
      { h: "Speed in operation", p: "N1 or N2 is often the thrust-setting reference (session 4.2), and both are watched during start and acceleration. A speed that lags or leads its expected value, or an N1/N2 relationship out of family, is an early diagnostic clue to a compressor or spool problem." },
    ],
    takeaways: [
      "Spool speeds N1/N2(/N3) are shown as a percentage of a design datum",
      "Tacho-generators and phonic-wheel probes sense the RPM",
      "Overspeed protection prevents catastrophic disk burst",
      "Speed sets thrust and gives early diagnostic clues when out of family",
    ],
  },
  "4.6": {
    overview:
      "Vibration is the engine telling you about its mechanical health. Accelerometers on the cases detect the imbalance and rubbing that precede a failure, letting a problem be caught — and often balanced out — before it becomes damage.",
    sections: [
      { h: "Why monitor vibration", p: "A healthy rotor runs smoothly; rising vibration signals imbalance (a lost or moved blade, ice, fouling), bearing wear, or a rub. Because vibration climbs before an outright failure, monitoring it gives early warning and is one of the most valuable condition indicators an engine has." },
      { h: "Sensors", p: "Accelerometers (and on some engines velocity or proximity probes) are mounted on the engine cases, typically near the bearings. They feed a vibration monitoring unit that measures the level and, on advanced systems, the frequency content — the vibration signature of the engine." },
      { h: "Interpreting levels", p: "Vibration is displayed as a level (e.g. in ips or units) with a caution and limit threshold. A steady low level is healthy; a rising trend or a sudden step calls for investigation. Tracking the vibration at each spool's rotational frequency (tracked-order) helps pinpoint whether the fan, a spool or a bearing is the source." },
      { h: "Acting on vibration", p: "A high fan vibration is often cured by trim balancing (session 2.5). Vibration at a bearing frequency, or accompanied by oil-debris findings, points to a bearing and may require removal. Vibration monitoring thus links directly to balancing, oil analysis and the on-condition maintenance of Unit V." },
    ],
    takeaways: [
      "Rising vibration signals imbalance, bearing wear or a rub — early warning",
      "Case-mounted accelerometers feed a vibration monitoring unit",
      "Levels have caution/limit thresholds; trends and steps prompt investigation",
      "Tracked-order analysis localises the source (fan, spool, bearing)",
    ],
    keyTerms: [
      { t: "Accelerometer", d: "A vibration sensor mounted on the engine case, usually near a bearing." },
      { t: "Tracked-order", d: "Vibration measured at a spool's rotational frequency to localise the source." },
      { t: "Trim balancing", d: "Adding small weights to cancel fan imbalance and reduce vibration." },
      { t: "ips", d: "Inches per second — a common unit of vibration velocity." },
    ],
    applications: [
      "High fan vibration is routinely cured by trim balancing.",
      "Vibration plus oil-debris findings point to a failing bearing.",
      "Vibration trends feed the engine health-monitoring picture.",
    ],
  },
  "4.7": {
    overview:
      "A turboprop or turboshaft makes shaft power, not jet thrust, so its primary output gauge is torque. Torque — and torque combined with RPM — tells the crew exactly how much power the engine is delivering to the propeller or rotor.",
    sections: [
      { h: "Torque measurement", p: "A torquemeter senses the twist in the shaft (or the reaction in the reduction gearbox) under load — the more power transmitted, the more the shaft twists. This twist is measured hydraulically, electrically or by phase-shift between two points on the shaft, and displayed as torque (or a percentage of a rated value)." },
      { h: "Shaft horsepower", p: "Power is torque times rotational speed: SHP = torque × RPM (with the appropriate constant). Because a turboprop usually runs its propeller at a governed constant speed, torque alone becomes a direct read of power — which is why torque is the primary power-setting gauge on these engines." },
      { h: "Use in operation", p: "The crew sets and monitors power on the torque gauge, respecting a torque limit that protects the gearbox and shaft. Torque is cross-checked with ITT/EGT and Ng (gas-generator speed): a target power is a combination of torque within its limit and temperature within its limit, whichever is reached first." },
      { h: "Why not just thrust?", p: "For a shaft engine the useful output is power delivered to a propeller or rotor, and residual jet thrust is minor. Measuring torque captures that useful output directly, in a way a jet thrust parameter (EPR/N1) never could — which is why indication differs between jet and shaft engines." },
    ],
    takeaways: [
      "Torque is the primary output gauge for turboprops and turboshafts",
      "A torquemeter senses shaft twist under load",
      "Power (SHP) = torque × RPM — at constant prop speed, torque reads power",
      "Torque is limited to protect the gearbox and cross-checked with ITT/Ng",
    ],
  },
  "4.8": {
    overview:
      "Sometimes the dry engine isn't enough — a hot-and-high take-off or a combat manoeuvre needs thrust beyond the normal rating. Power augmentation supplies it in two families: boosting mass flow with injection, or adding heat downstream with afterburning.",
    sections: [
      { h: "Why augment thrust", p: "Thrust falls with altitude and rising temperature (Unit I), so on a hot, high day an engine may not make its rated take-off thrust. Military aircraft also need bursts of extra thrust for take-off, climb and combat. Augmentation temporarily boosts thrust above the dry rating to meet these needs." },
      { h: "Injection vs afterburning", p: "The two families work differently. Injection (water or water-methanol) adds mass and cools the air, increasing density and mass flow through the core to restore lost thrust — mostly used to recover hot-day take-off thrust on older engines. Afterburning (reheat) burns extra fuel in the jet pipe to add energy and jet velocity — a much larger boost used on military engines." },
      { h: "Trade-offs", p: "Augmentation is never free. Injection needs a consumable water supply that limits its duration. Afterburning roughly can raise thrust by half or more but at a huge fuel cost and added complexity (spray bars, flame holder, variable nozzle) and heat load. Both consume engine life and are used only when genuinely needed." },
      { h: "When each is used", p: "Water/water-methanol injection is a take-off thrust restorer, historically common on early jets and some turboprops. Afterburning is the military solution for large, brief thrust boosts. Civil high-bypass engines generally use neither — they are simply sized to make enough dry thrust." },
    ],
    takeaways: [
      "Augmentation gives thrust beyond the dry rating for hot/high or combat needs",
      "Injection boosts mass flow (density); afterburning adds heat and jet velocity",
      "Injection restores hot-day take-off thrust; afterburning gives a big military boost",
      "Both cost fuel, complexity and life — used only when needed",
    ],
    keyTerms: [
      { t: "Power augmentation", d: "Temporarily boosting thrust above the dry rating." },
      { t: "Injection", d: "Adding water/water-methanol to raise air density and mass flow." },
      { t: "Afterburning (reheat)", d: "Burning extra fuel in the jet pipe for a large thrust boost." },
      { t: "Dry rating", d: "The engine's thrust without any augmentation." },
    ],
    applications: [
      "Water injection restored take-off thrust on early jets like the 707/KC-135.",
      "Afterburners power military fighters for take-off, climb and combat.",
      "Modern civil high-bypass engines are simply sized to avoid augmentation.",
    ],
  },
  "4.9": {
    overview:
      "Water injection is the simplest augmentation: spray water into the incoming air (or the combustor), and the denser, cooler charge lets the engine swallow more mass and make more thrust — restoring what a hot day took away.",
    sections: [
      { h: "Principle", p: "Thrust depends on mass flow (Unit I). Injecting water increases the density of the charge — the water adds mass and its evaporation cools the air, raising density further — so more mass flows through the engine at the same volume, and thrust rises. It is a way to buy back the mass flow lost to hot, thin air." },
      { h: "Where injected", p: "Water may be injected at the compressor inlet (cooling and densifying the incoming air) or into the combustor/diffuser (adding mass to the gas and limiting temperature). Inlet injection mainly boosts mass flow; combustor injection also lets more fuel be burned within temperature limits." },
      { h: "Limitations", p: "The water is a consumable carried in a dedicated tank, so injection lasts only for the take-off run — typically a minute or two — until the tank empties. It adds weight and plumbing, needs demineralised water to avoid deposits, and is only worthwhile where hot-day thrust recovery is genuinely needed." },
      { h: "Legacy and decline", p: "Water injection was common on early jets and some turboprops to guarantee take-off thrust on hot days. As engines grew more powerful and efficient, most civil types no longer need it — but it remains a clear illustration of the mass-flow principle behind thrust." },
    ],
    takeaways: [
      "Water injection raises charge density, increasing mass flow and thrust",
      "Injected at the compressor inlet or the combustor/diffuser",
      "Limited by a consumable water tank — good for a short take-off boost only",
      "Common on early jets; a clear demonstration of the mass-flow principle",
    ],
  },
  "4.10": {
    overview:
      "Add methanol to the injection water and you get two benefits: antifreeze that stops the water freezing at altitude and in cold tanks, and extra combustible energy that further helps restore hot-and-high take-off thrust.",
    sections: [
      { h: "The water-methanol mix", p: "A blend of water and methanol (a light alcohol) is used instead of plain water. The methanol lowers the freezing point so the mixture won't ice up in cold conditions, and, being combustible, it adds a little fuel energy when it reaches the combustor — a small extra thrust contribution on top of the mass-flow effect." },
      { h: "Thrust restoration", p: "Like plain water, the mixture restores thrust lost to high ambient temperature by boosting mass flow; the methanol's energy content adds to this. The result is a dependable recovery of take-off thrust on hot days, which is the whole purpose of the system." },
      { h: "System considerations", p: "The mixture is metered and its quantity managed for the take-off run — enough for the boost, not so much as to over-fuel or over-cool. Handling methanol adds toxicity and flammability considerations, and the ratio of water to methanol is specified for the engine and climate." },
      { h: "Why the mix matters", p: "Plain water alone can freeze and offers no energy; methanol solves both, making the augmentation usable across climates. It is a neat example of engineering a consumable to do more than one job — antifreeze and fuel in one additive." },
    ],
    takeaways: [
      "Water-methanol: methanol is antifreeze plus a little combustible energy",
      "Restores hot-day take-off thrust by boosting mass flow, with an energy bonus",
      "Metered quantity is managed for the take-off run",
      "The mix makes injection usable across cold and hot climates",
    ],
  },
  "4.11": {
    overview:
      "The afterburner — reheat — is the big hammer of thrust augmentation: burn extra fuel in the jet pipe, in the exhaust's spare oxygen, and get a large thrust boost. It is spectacularly thirsty, so it is used only in bursts, with a variable nozzle to match.",
    sections: [
      { h: "Afterburning principle", p: "The core exhaust still contains plenty of unburned oxygen (the combustor runs overall lean). Spraying fuel into the jet pipe and burning it there adds heat, raising the exhaust temperature and velocity and so the thrust — a boost of typically 40–70% over dry thrust, without any extra rotating machinery." },
      { h: "Components", p: "Afterburning needs spray bars (fuel injectors) across the jet pipe, flame holders (bluff bodies that create sheltered low-velocity wakes where the flame can anchor in the fast gas stream), an igniter, and screech/liner cooling. Crucially it needs a variable-area nozzle to open when reheat lights, passing the greatly increased exhaust volume." },
      { h: "The variable nozzle", p: "When the afterburner lights, the exhaust's volume jumps; if the nozzle didn't open, the back-pressure would disturb the core and could surge the compressor. The variable-area nozzle opens in step with reheat and closes for dry thrust, keeping the engine matched — an essential, heavily-cooled mechanism." },
      { h: "Cost", p: "Afterburner fuel flow is enormous — it can double or more the total fuel burn for its thrust boost — and it adds heat, weight and complexity. So reheat is used briefly: take-off, rapid climb, transonic acceleration and combat. It is a military tool; civil engines don't use it." },
    ],
    takeaways: [
      "Afterburning burns extra fuel in the jet pipe's spare oxygen for +40–70% thrust",
      "Needs spray bars, flame holders and a variable-area nozzle",
      "The nozzle opens with reheat to pass the extra volume and avoid surge",
      "Hugely thirsty — used briefly for take-off, climb and combat on military engines",
    ],
    keyTerms: [
      { t: "Afterburner / reheat", d: "Burning fuel in the jet pipe for a large thrust boost." },
      { t: "Flame holder", d: "A bluff body creating a sheltered wake where the reheat flame anchors." },
      { t: "Spray bars", d: "Fuel injectors across the jet pipe that feed the afterburner." },
      { t: "Variable-area nozzle", d: "A nozzle that opens with reheat to pass the extra exhaust volume." },
    ],
    applications: [
      "Fighters use afterburners for take-off, transonic dash and combat.",
      "The variable nozzle's 'petals' opening is the visible sign of reheat.",
      "Civil engines avoid afterburning because of its enormous fuel cost.",
    ],
  },
  "4.12": {
    overview:
      "Consolidating Unit IV: read a full instrument set to judge engine condition and set thrust, and reason about which augmentation suits a given scenario. This is the crew's-eye and engineer's-eye synthesis of indication and augmentation.",
    sections: [
      { h: "Instrument interpretation", p: "Given a gauge set — N1/EPR, EGT, N2, fuel flow, oil, vibration — read it as a system: is thrust set correctly, is any parameter out of family, is EGT margin healthy, is vibration normal? Diagnosing condition from the whole picture, not one dial, is the skill the unit builds." },
      { h: "Augmentation reasoning", p: "Match the augmentation to the need: hot-day take-off thrust recovery on an older engine → water or water-methanol injection; a large brief military boost → afterburning; a modern civil requirement → neither, size the engine dry. Knowing why each fits its scenario is the goal." },
      { h: "Cross-checking parameters", p: "A real thrust change shows up consistently across the parameters; an instrument fault or a specific-component problem shows one parameter moving alone. Practising this cross-check turns a set of numbers into a confident diagnosis — the foundation for Unit V's troubleshooting." },
      { h: "Self-assessment", p: "Confirm you can name each gauge and its limit, explain EPR vs N1 and EGT margin, describe vibration and torque indication, and choose the right augmentation for a scenario. That mastery readies you for monitoring and ground operation." },
    ],
    takeaways: [
      "Read the whole instrument set as a system to judge condition and set thrust",
      "Match augmentation to the need: injection for hot-day, afterburning for military",
      "A real thrust change is consistent across parameters; a fault moves one alone",
      "Confirm mastery of indication and augmentation before monitoring",
    ],
  },
};

// Unit V — Monitoring & Ground Operation. Keeping engines healthy in service.
const UNIT5 = {
  "5.1": {
    overview:
      "Modern engines are maintained on condition, not just on the calendar: their parameters are watched over time so problems are caught and fixed before they become failures. Engine health monitoring is the philosophy that ties the whole of Unit V together.",
    sections: [
      { h: "On-condition maintenance", p: "Rather than replacing parts purely on fixed intervals, on-condition maintenance keeps an engine in service as long as the evidence says it is healthy, and acts when the evidence says otherwise. This maximises availability and life while preserving safety — but it depends entirely on good monitoring data." },
      { h: "Data sources", p: "The health picture is built from several streams: recorded flight parameters (EGT margin, fuel flow, speeds, vibration), oil analysis (chip detectors and spectrometric analysis), vibration monitoring, and periodic borescope inspection. Each sees a different aspect; together they give a rounded view of engine condition." },
      { h: "The goal — predict and prevent", p: "The aim is to spot slow degradation and incipient faults early enough to plan a wash, an inspection or a removal on the ground, at a convenient time, rather than suffer an in-flight failure or an unscheduled stoppage. Prediction turns maintenance from reactive to proactive." },
      { h: "How the streams combine", p: "No single indicator is conclusive; the skill is in correlating them. Rising EGT plus a shrinking wash response points to fouling or hot-section wear; rising vibration plus oil metal points to a bearing. Reading the streams together — the theme of this unit — is what makes health monitoring powerful." },
    ],
    takeaways: [
      "On-condition maintenance keeps engines in service on evidence, not just intervals",
      "Data comes from flight parameters, oil analysis, vibration and borescope",
      "The goal is to predict and prevent — catch degradation before failure",
      "Correlating the streams, not one indicator, gives the real health picture",
    ],
    keyTerms: [
      { t: "On-condition maintenance", d: "Maintaining an engine on the evidence of its condition rather than fixed intervals." },
      { t: "Engine health monitoring", d: "Watching engine parameters over time to detect degradation and faults." },
      { t: "EGT margin", d: "The gap between operating EGT and the red-line; a headline health indicator." },
      { t: "Trend", d: "The direction a parameter drifts over many flights, revealing slow change." },
    ],
    applications: [
      "Airlines run ground stations that trend engine data flight by flight.",
      "Health monitoring plans washes, inspections and removals in advance.",
      "Correlated indicators localise a fault to a specific module.",
    ],
  },
  "5.2": {
    overview:
      "Running an engine on the ground — from a simple idle check to a full-power run or an instrumented test-cell verification — confirms performance, proves repairs and surveys for leaks and vibration. It is a routine but disciplined and hazardous activity.",
    sections: [
      { h: "Purpose of ground runs", p: "Ground runs verify that an engine performs to specification, confirm that maintenance has been done correctly (a leak check after a component change, an idle and acceleration check after adjustment), and survey vibration and handling. They are how a maintainer proves an engine is fit before it flies." },
      { h: "The test cell", p: "For full performance verification, an engine is run in an instrumented test cell that measures actual thrust, fuel flow, temperatures, pressures and speeds under controlled conditions. The cell corrects readings to standard conditions so the engine can be compared against its acceptance specification after overhaul." },
      { h: "Procedures", p: "A ground run follows a set sequence: pre-run checks and area clearance, start, warm-up, stabilise at each required power, record the parameters, then a controlled cool-down and shut-down. Rushing warm-up or cool-down thermally shocks the engine, so the discipline of the procedure protects the hardware." },
      { h: "Safety context", p: "A ground run is one of the most hazardous maintenance tasks — the engine's intake and exhaust zones (session 5.4) are live, noise is extreme, and high power is being made near people and equipment. Ground running is therefore tightly proceduralised, with trained crews and clear communication." },
    ],
    takeaways: [
      "Ground runs verify performance, prove repairs and survey leaks/vibration",
      "Instrumented test cells measure actual thrust and full performance",
      "The procedure — warm-up, stabilise, record, cool-down — protects the engine",
      "Ground running is hazardous and tightly proceduralised",
    ],
  },
  "5.3": {
    overview:
      "Troubleshooting turns a symptom into a confirmed cause through structured reasoning: read the indications and history, list the possible causes, test to narrow them, and confirm the fault. It is the disciplined detective work at the heart of engine maintenance.",
    sections: [
      { h: "Structured diagnosis", p: "The method is always the same: observe the symptom, list the possible causes, devise tests that distinguish between them, and act on the confirmed cause. Guessing and swapping parts wastes time and money; a structured symptom→causes→tests→fault path is faster and more reliable." },
      { h: "Using indications", p: "The engine's own gauges, messages and recorded trends localise the problem. A high EGT for a given thrust, a vibration at a bearing frequency, an oil-pressure drop, a slow start — each narrows the field. FADEC fault codes and EICAS/ECAM messages often point directly at the affected system." },
      { h: "Common faults", p: "Recurring engine faults have recognisable signatures: high vibration (imbalance, bearing), high EGT/shrinking margin (fouling, hot-section wear), oil-system problems (leaks, seal wear, bearing debris), and start faults (fuel, ignition, starter). Knowing the typical signatures speeds diagnosis." },
      { h: "History and context", p: "A fault is easier to solve with context: recent maintenance, the flight profile, weather, and the trend leading up to it. A vibration that appeared right after a blade change, or an EGT rise that has been trending for months, tells a very different story — history is part of the evidence." },
    ],
    takeaways: [
      "Structured diagnosis: symptom → possible causes → tests → confirmed fault",
      "Gauges, messages and trends localise the problem",
      "Common faults (vibration, EGT, oil, start) have recognisable signatures",
      "History and context are part of the diagnostic evidence",
    ],
    keyTerms: [
      { t: "Structured diagnosis", d: "Reasoning from symptom to cause via possible causes and discriminating tests." },
      { t: "Fault signature", d: "The characteristic pattern of indications a particular fault produces." },
      { t: "Fault code", d: "A FADEC/EICAS message pointing at the affected system or component." },
      { t: "Fault isolation", d: "Narrowing the possible causes down to the confirmed one." },
    ],
    applications: [
      "FADEC fault codes and EICAS/ECAM messages speed fault isolation.",
      "Vibration frequency content distinguishes fan from bearing faults.",
      "Trend history separates a sudden fault from long-term degradation.",
    ],
  },
  "5.4": {
    overview:
      "Around a running engine, people and equipment are protected by understanding the hazard zones and following the discipline that keeps everyone clear. Ground operation safety is not optional — the intake and exhaust can kill or maim in an instant.",
    sections: [
      { h: "Danger zones", p: "A running engine's intake can ingest a person or loose object with lethal suction, and its exhaust blast can hurl objects and people over a wide area behind it. Both zones grow with power (as shown in the augmentation unit) and are marked and briefed; nobody enters the intake hazard area with the engine running." },
      { h: "Personal safety", p: "Extreme noise demands hearing protection at all times near a running engine. Personnel keep clear of the zones, secure loose clothing and items, and maintain clear communication with the operator so the engine is never advanced with someone in a hazard area. Situational awareness is everything." },
      { h: "FOD & housekeeping", p: "Foreign object debris is both a hazard to the engine (session 5.11) and evidence of poor housekeeping. Keeping the ramp and intake area scrupulously clear of tools, hardware and debris protects the engine from ingestion and the people from ingested-object or blast injury. FOD discipline is a shared safety culture." },
      { h: "A culture of discipline", p: "As with fuel and ignition safety in Unit III, ground-operation safety rewards unbroken discipline: zones respected, hearing protected, communication maintained, area kept clear, every time. Most engine-ground accidents trace to a lapse in one of these — which is why the rules are absolute." },
    ],
    takeaways: [
      "Intake suction and exhaust blast zones can kill — they grow with power",
      "Hearing protection, clear zones and communication protect personnel",
      "FOD discipline protects both the engine and the people around it",
      "Unbroken safety discipline prevents the lapses that cause accidents",
    ],
  },
  "5.5": {
    overview:
      "Trend monitoring reads the slow drift of key parameters over many flights to spot degradation long before it triggers a warning. A shrinking EGT margin, creeping fuel flow or a shifting speed relationship are the early fingerprints of a gradually deteriorating engine.",
    sections: [
      { h: "What trend monitoring is", p: "Rather than reading a parameter once, trend monitoring plots it — corrected to standard conditions — over hundreds of flights to reveal its drift. A single reading can look normal; the trend shows whether the engine is slowly getting hotter, thirstier or rougher. It converts scattered data into a clear direction of travel." },
      { h: "EGT margin", p: "The most watched trend is EGT margin — the gap between the EGT at a reference thrust and the red-line. A healthy engine holds its margin; a shrinking margin signals hot-section deterioration or fouling. When the margin trends down toward a threshold, action (wash, inspection, removal planning) is scheduled." },
      { h: "Acting on trends", p: "A recognised shift in a trend triggers a response: a step change may mean a specific event (a bird strike, a bleed fault), while a steady drift means gradual wear or fouling. The response — a compressor wash to recover fouling losses, a borescope to inspect, or planning a removal — is matched to what the trend indicates." },
      { h: "Multiple parameters together", p: "Trends are read as a set. A shrinking EGT margin that recovers after a wash was fouling; one that doesn't is hot-section wear. Fuel flow, N1/N2 relationship and vibration trends corroborate the diagnosis. As throughout the unit, the correlation across trends is where the insight lies." },
    ],
    takeaways: [
      "Trend monitoring plots corrected parameters over many flights to see drift",
      "A shrinking EGT margin is the headline trend for hot-section health",
      "A step change means an event; a steady drift means gradual wear/fouling",
      "Reading trends together separates fouling (wash-recoverable) from real wear",
    ],
    keyTerms: [
      { t: "Trend monitoring", d: "Plotting corrected parameters over many flights to reveal drift." },
      { t: "EGT margin trend", d: "The change in EGT margin over time; the key hot-section health indicator." },
      { t: "Corrected parameter", d: "A reading referenced to standard conditions so flights can be compared." },
      { t: "Step vs drift", d: "A sudden shift (an event) versus a gradual change (wear or fouling)." },
    ],
    applications: [
      "A recovered EGT margin after a wash confirms fouling was the cause.",
      "Fuel-flow and speed trends corroborate the EGT-margin diagnosis.",
      "Trend thresholds trigger scheduled inspection or removal planning.",
    ],
  },
  "5.6": {
    overview:
      "The oil carries the story of the engine's internal wear. Magnetic chip detectors capture metallic debris, and spectrometric oil analysis measures wear-metal concentrations — together revealing which bearing or gear is starting to fail, before it does.",
    sections: [
      { h: "Chip detection", p: "Magnetic chip detectors (magnetic plugs) sit in the oil system and capture ferrous debris shed by wearing components. A technician inspects the captured chips: a few fine particles may be normal, but flakes or a growing quantity — especially of a particular size or shape — signal a component beginning to break down." },
      { h: "Spectrometric oil analysis (SOAP)", p: "SOAP measures the concentration of wear metals dissolved or suspended in an oil sample — iron, chromium, nickel, silver, copper and others. Because different components are made of different alloys, the metal that is rising points to the specific part that is wearing (a silver-plated bearing, a steel gear, and so on)." },
      { h: "Interpretation", p: "The power is in the trend and the pattern: a steadily rising iron level, or a sudden jump in a bearing-alloy metal, localises the wear. Analysts compare against baselines and alarm limits, and correlate with chip-detector findings and vibration to build confidence before acting on an engine." },
      { h: "Why oil analysis matters", p: "Bearings and gears are hidden inside the engine, but their wear metals reach the oil. Oil analysis is therefore a window into the internal mechanical health that no external gauge provides — catching an incipient bearing failure while it is still just a rising number, not a stoppage." },
    ],
    takeaways: [
      "Magnetic chip detectors capture metallic wear debris for inspection",
      "SOAP measures wear-metal concentrations in an oil sample",
      "The rising metal points to the specific alloy/component wearing",
      "Oil analysis reveals hidden internal wear no external gauge can see",
    ],
    keyTerms: [
      { t: "Chip detector", d: "A magnetic plug that captures ferrous wear debris from the oil." },
      { t: "SOAP", d: "Spectrometric Oil Analysis Programme — measures wear-metal concentrations." },
      { t: "Wear metals", d: "Metals shed by components; their alloy identifies the wearing part." },
      { t: "Baseline", d: "The normal wear-metal level against which trends and alarms are judged." },
    ],
    applications: [
      "A rising bearing-alloy metal flags an incipient bearing failure.",
      "Chip-detector debris plus SOAP trends confirm a wear problem.",
      "Oil analysis is combined with vibration to localise the source.",
    ],
  },
  "5.7": {
    overview:
      "Vibration monitoring in service uses spectra and trends to tell fan imbalance from a bearing or blade problem. It is the same accelerometer data as the flight-deck gauge, but analysed for frequency content to localise the source and guide balancing or removal.",
    sections: [
      { h: "In-service vibration", p: "Engines are monitored both for broadband vibration level and for tracked-order vibration — the amplitude at each spool's rotational frequency. A rising level flags a problem; the frequency content tells you where it is. This data is trended over many flights just like EGT margin." },
      { h: "Diagnosis by frequency", p: "Vibration at the fan/LP rotational frequency points to fan imbalance (a moved, damaged or fouled blade, or ice); vibration at the HP frequency to the HP spool; vibration at non-synchronous or bearing-defect frequencies to a bearing. Reading the spectrum turns 'the engine is rough' into 'the number-3 bearing is failing'." },
      { h: "Balancing", p: "When the problem is fan imbalance, trim balancing (introduced in Unit II) restores smooth running by adding small correction weights, guided by the measured vibration amplitude and phase. It is a routine, effective fix that avoids an unnecessary engine removal." },
      { h: "When to remove", p: "Vibration at a bearing frequency, especially with corroborating oil-debris findings, is not a balancing problem — it points to internal wear that may require removal. Distinguishing a balance issue (fixable on-wing) from a bearing issue (removal) is exactly what frequency analysis enables." },
    ],
    takeaways: [
      "In-service vibration is trended as level and tracked-order (per-spool) amplitude",
      "Frequency content localises the source: fan, a spool, or a bearing",
      "Fan imbalance is cured on-wing by trim balancing",
      "Bearing-frequency vibration (with oil debris) points to removal, not balancing",
    ],
  },
  "5.8": {
    overview:
      "The borescope lets a technician inspect the inside of an engine — compressor, combustor and turbine — through small access ports, without a costly teardown. It is the eyes of on-condition maintenance, finding cracks, burning, erosion and FOD deep inside.",
    sections: [
      { h: "What borescoping finds", p: "A flexible (or rigid) borescope with its own light and camera reveals internal defects invisible from outside: cracks, burning and distortion in the combustor and turbine, blade erosion and coating loss, tip rubs, and FOD damage in the compressor. It turns the sealed interior of the engine into an inspectable surface." },
      { h: "Access & technique", p: "Engines are designed with borescope ports at key stations. The scope is inserted through a port and, using a manual or motorised turning tool to rotate the rotor, the technician inspects blades one by one, stage by stage. Good technique — lighting, orientation, systematic coverage — is essential not to miss a defect." },
      { h: "Recording defects", p: "Findings are measured (many scopes have measurement capability) and compared against the manual's allowable limits, then photographed and logged. A defect within limits is monitored; one beyond limits drives repair or removal. The record supports the airworthiness decision and future trend comparison." },
      { h: "Why borescoping matters", p: "It is the bridge between the indirect evidence (trends, oil, vibration) and direct inspection: when the numbers suggest a hot-section problem, a borescope confirms and locates it without removing the engine. Scheduled and diagnostic borescopes are central to keeping engines on-wing safely." },
    ],
    takeaways: [
      "A borescope inspects the engine interior through access ports — no teardown",
      "It finds cracks, burning, erosion, coating loss and FOD internally",
      "Rotor-turning tools allow blade-by-blade, stage-by-stage inspection",
      "Findings are measured against limits, logged, and drive the disposition",
    ],
    keyTerms: [
      { t: "Borescope", d: "A flexible/rigid optical probe for inspecting the engine interior through ports." },
      { t: "Borescope port", d: "A designed access opening at a key engine station." },
      { t: "Turning tool", d: "A device to rotate the rotor so each blade can be inspected." },
      { t: "Allowable limits", d: "Manual-defined thresholds separating serviceable, repairable and reject defects." },
    ],
    applications: [
      "A trend-flagged hot-section problem is confirmed by borescope without removal.",
      "Scheduled borescopes are a routine on-condition maintenance task.",
      "Measured, logged findings support the airworthiness disposition.",
    ],
  },
  "5.9": {
    overview:
      "An inspection finding is only useful against a standard. Manufacturer and regulatory limits define what is serviceable, what is repairable, and what must be rejected — and the documentation of every inspection and disposition is what keeps the engine airworthy on paper as well as in metal.",
    sections: [
      { h: "Limits & criteria", p: "The engine manuals define, for every part and defect type, the allowable damage and wear limits — how deep a nick, how long a crack, how much erosion or coating loss is acceptable, and where. These criteria turn a subjective 'that looks worn' into an objective, repeatable judgement anyone can apply consistently." },
      { h: "Serviceable, repairable, reject", p: "Every finding is judged against the limits into one of three dispositions: serviceable (within limits, return to service, perhaps monitor), repairable (beyond serviceable but restorable by a defined repair), or reject (beyond repair, replace). Getting this judgement right is the core of inspection work." },
      { h: "Documentation", p: "Inspections and their dispositions are recorded — what was inspected, what was found, how it was measured, and the decision made. This record proves the airworthiness of the engine, supports trend comparison over time, and is a legal and regulatory requirement, not mere paperwork." },
      { h: "Why standards matter", p: "Standards make maintenance safe and consistent across technicians, shops and time. Without defined limits and documentation, the same defect might be passed by one inspector and rejected by another. The rulebook is what makes on-condition maintenance trustworthy." },
    ],
    takeaways: [
      "Manuals define allowable damage and wear limits for every part and defect",
      "Findings are dispositioned serviceable, repairable or reject",
      "Every inspection and disposition is documented for airworthiness",
      "Standards make maintenance consistent and trustworthy across people and time",
    ],
  },
  "5.10": {
    overview:
      "Compressors get dirty in service — salt, dust and industrial haze foul the blades, eroding efficiency and eating EGT margin. Compressor washing removes the fouling and recovers much of the lost performance, saving fuel and hot-section life.",
    sections: [
      { h: "Why wash", p: "Airborne salt, dust and pollutants gradually coat the compressor blades, roughening them and changing their aerodynamics. This fouling reduces mass flow and compressor efficiency, which raises fuel burn and EGT for a given thrust — eating into the EGT margin. Much of this loss is recoverable simply by cleaning the blades." },
      { h: "Wash methods", p: "On-line (or 'performance') washing sprays cleaning fluid into the running engine at low power for routine, frequent cleaning. Off-line (or 'crank'/'motoring') washing motors the engine without firing it and washes it more thoroughly for a bigger recovery. The method is chosen for the level of fouling and the recovery needed." },
      { h: "Benefits", p: "A good wash recovers compressor efficiency, lowering fuel flow and EGT for the same thrust and restoring EGT margin. On a fleet, regular washing yields measurable fuel savings, cooler running (longer hot-section life) and better trend-monitoring baselines. It is one of the cheapest performance-recovery actions available." },
      { h: "Wash and trends", p: "Washing ties directly to trend monitoring (session 5.5): a shrinking EGT margin that recovers after a wash was fouling; one that doesn't is genuine hot-section wear. So the wash both restores performance and helps diagnose whether a trend is recoverable — a neat two-for-one." },
    ],
    takeaways: [
      "Fouling roughens compressor blades, cutting efficiency and EGT margin",
      "On-line washing is routine; off-line (crank) washing recovers more",
      "Washing lowers fuel flow and EGT, restoring margin and saving fuel",
      "A wash-recoverable EGT trend confirms fouling vs real hot-section wear",
    ],
    keyTerms: [
      { t: "Fouling", d: "Salt/dust/pollutant deposits on compressor blades that reduce efficiency." },
      { t: "On-line wash", d: "Washing the running engine at low power for routine cleaning." },
      { t: "Off-line (crank) wash", d: "Motoring the engine without firing for a more thorough wash." },
      { t: "Performance recovery", d: "The regained efficiency (lower fuel/EGT) after cleaning." },
    ],
    applications: [
      "Airlines wash compressors regularly for measurable fuel savings.",
      "A crank wash is used when a bigger performance recovery is needed.",
      "Wash response confirms whether an EGT trend is fouling or wear.",
    ],
  },
  "5.11": {
    overview:
      "Foreign object damage is the engine's ever-present threat: birds, ice, runway debris and misplaced tools that nick, dent or destroy blades. Understanding the sources, the effects and — above all — the prevention is essential to keeping engines safe.",
    sections: [
      { h: "Sources of FOD", p: "FOD comes from the ramp (loose hardware, stones, debris), from nature (birds, hail, ice shed from the airframe or inlet), and from maintenance itself (tools, fasteners and rags left behind). Anything the engine can ingest is a potential FOD source, which is why cleanliness and tool control are so heavily emphasised." },
      { h: "Effects", p: "Ingested objects strike the fast-moving blades, causing nicks and dents that raise stress and can start fatigue cracks, or, in severe cases (a large bird, a big ice slab), bending or liberating blades. Even small nicks degrade performance and must be blended or monitored; major FOD can destroy an engine and cause an in-flight shutdown." },
      { h: "Prevention", p: "Prevention is the whole game: FOD walks to clear the ramp, inlet covers when parked, strict tool control and shift hand-over counts in maintenance, and design measures (bird-strike certification, ice protection). Because FOD is caused by lapses, prevention is a discipline and a culture, not a device." },
      { h: "FOD and the wider unit", p: "FOD ties into ground safety (a running engine can ingest debris and people), borescope inspection (finding the resulting damage), and inspection standards (judging a nick against limits). It is a thread running through the whole of monitoring and ground operation." },
    ],
    takeaways: [
      "FOD sources: ramp debris, birds/ice, and maintenance tools left behind",
      "Effects range from stress-raising nicks to liberated blades and shutdowns",
      "Prevention is discipline: FOD walks, inlet covers, tool control, design measures",
      "FOD links ground safety, borescope inspection and inspection standards",
    ],
  },
  "5.12": {
    overview:
      "The capstone of the module: diagnose engine health by combining trend, oil, vibration and borescope evidence, decide whether to wash, inspect, repair or remove, and confirm mastery of monitoring and ground operation.",
    sections: [
      { h: "Evidence integration", p: "Real engine decisions rest on correlating the streams. A shrinking EGT margin that recovers after a wash was fouling; one that doesn't, with corroborating borescope findings, is hot-section wear. Rising vibration at a bearing frequency with SOAP metal is a bearing. The whole unit builds to this integrated reading." },
      { h: "Decision making", p: "From the combined evidence flows the action: wash (recoverable fouling), borescope (confirm and locate a suspected internal defect), repair (a finding beyond serviceable but restorable), or remove (a finding beyond repair, or a confirmed bearing/hot-section failure). Matching action to evidence is the maintainer's judgement." },
      { h: "Ground-operation mastery", p: "Alongside diagnosis, the unit demands safe practice: respecting hazard zones, running engines by procedure, and preventing FOD. A competent engine person is both a good diagnostician and a disciplined, safe operator — the two go together." },
      { h: "Self-assessment", p: "Confirm you can describe on-condition monitoring and its data streams, read an EGT-margin trend, interpret oil and vibration findings, perform a borescope inspection against limits, and state the ground-safety and FOD rules. That mastery closes the Gas Turbine Engine Module." },
    ],
    takeaways: [
      "Integrate trend, oil, vibration and borescope evidence to judge health",
      "Match the action — wash, inspect, repair, remove — to the evidence",
      "Safe ground operation and FOD prevention are part of mastery",
      "Confirm command of monitoring and ground operation to close the module",
    ],
  },
};

const OVERRIDES = { ...UNIT1, ...UNIT2, ...UNIT3, ...UNIT4, ...UNIT5 };

export const DETAIL = { ...SEED, ...OVERRIDES };
