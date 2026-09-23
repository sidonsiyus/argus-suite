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

const OVERRIDES = { ...UNIT1, ...UNIT2 };

export const DETAIL = { ...SEED, ...OVERRIDES };
