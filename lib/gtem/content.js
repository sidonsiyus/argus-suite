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

const OVERRIDES = { ...UNIT1 };

export const DETAIL = { ...SEED, ...OVERRIDES };
