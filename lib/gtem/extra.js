// GTEM — deep-dives, case files and myth-or-fact per session.
// Shapes: deepDives:[{t,p}], myth:{claim,truth}, caseStudy:{title,tag,context,challenge,approach,finding,outcome}.
// Unit I enriched on the hero sessions; more layered in per unit.

export const EXTRA = {
  "1.1": {
    myth: { claim: "A jet engine works by pushing against the air behind it, so it couldn't work in a vacuum — but that's also why planes fly.",
      truth: "The 'pushing against air' idea is a myth. Thrust is the reaction to accelerating a mass of air rearward (Newton's third law) — the engine carries its own reaction mass. A rocket, which carries oxidiser too, needs no outside air at all. A jet needs air only as its working fluid and oxidiser, not to 'push against'." },
    deepDives: [
      { t: "Why momentum, not just velocity, defines thrust", p: "It is tempting to think a faster exhaust always means more thrust. But thrust is the rate of change of momentum (ṁ·ΔV). Doubling mass flow at the same velocity change doubles thrust just as surely as doubling the velocity change — and moving more air slowly is far kinder to propulsive efficiency. This single insight is why engines grew fans instead of just hotter jets." },
    ],
  },
  "1.4": {
    myth: { claim: "In a modern airliner turbofan, the roaring hot exhaust from the core produces most of the thrust.",
      truth: "The opposite is true. In a high-bypass engine the cold bypass stream from the fan produces roughly 80% or more of the thrust; the core exhaust mainly exists to drive the fan and compressors. That's why big-fan engines are so much quieter and more efficient than early turbojets." },
    deepDives: [
      { t: "Mixed vs separate exhausts", p: "Some turbofans mix the hot and cold streams in a common nozzle (often with a lobed mixer) before exhausting; others keep them separate with concentric nozzles. Mixing can recover a little thrust and cut noise by smoothing the velocity difference between the streams, at the cost of some duct weight and length — an engineering trade made per engine and airframe." },
      { t: "The geared turbofan", p: "As bypass ratios climbed, the fan needed to turn slowly for efficiency while the LP turbine wanted to spin fast. The geared turbofan inserts a reduction gearbox between them, letting each run at its own best speed. It unlocked higher bypass ratios and lower noise, but added a large, highly-loaded gearbox to develop and certify." },
    ],
    caseStudy: {
      title: "From turbojet to high-bypass: the airliner revolution", tag: "Design evolution",
      context: "Early jet airliners used pure turbojets — powerful but loud and thirsty, making a small mass of very fast gas.",
      challenge: "Airlines needed lower fuel burn and communities demanded less noise as jet travel exploded in the 1960s–70s.",
      approach: "Engine makers added a large fan and bypass duct, moving most of the air around the core at moderate velocity instead of all of it through the core at high velocity.",
      finding: "Propulsive efficiency rose sharply and jet noise fell dramatically, because thrust now came from a large mass of slower air — exactly what the F = ṁ·ΔV relationship rewards.",
      outcome: "High-bypass turbofans became the universal airliner engine, cutting fuel burn and noise so much that pure turbojets vanished from commercial service.",
    },
  },
  "1.7": {
    myth: { claim: "The thrust figure quoted for an engine is the same in flight as it is on the ground.",
      truth: "Not quite. On the ground, inlet velocity is near zero so gross thrust ≈ net thrust. In flight, the momentum (ram) drag of fast incoming air is subtracted, so net thrust is lower than gross — though ram recovery and colder air aloft claw some of it back. Quoted 'static thrust' is a sea-level, zero-speed reference point, not the in-flight number." },
    deepDives: [
      { t: "Where the choked-nozzle pressure term comes from", p: "A simple convergent nozzle can only accelerate gas up to the local speed of sound at its throat. Beyond that operating point, extra pressure ratio can't be converted to more velocity in that nozzle, so the exhaust leaves at above-ambient pressure. That surplus pressure, acting over the exit area, is a genuine additional thrust term: (P_exit − P_ambient)·A_exit. High-power take-off and high-altitude cruise often run choked." },
    ],
  },
  "1.10": {
    myth: { claim: "Higher bypass ratio is always better, so engineers would make the fan as big as physically possible.",
      truth: "Higher BPR does cut fuel burn and noise, but not without limit. A bigger fan means a larger, heavier nacelle, more drag, ground-clearance problems and a fan/turbine speed mismatch. These penalties eventually outweigh the gains — which is exactly why the geared turbofan was developed to push BPR higher without an oversized, slow LP turbine." },
    deepDives: [
      { t: "EPR vs N1 as a thrust setting", p: "Two common ways to set thrust are EPR (engine pressure ratio, outlet/inlet total pressure) and N1 (fan speed). EPR directly reflects the pressure rise doing the work but needs accurate, clean pressure probes; N1 is robust and simple to measure but is a less direct proxy for thrust. Different manufacturers favour one or the other, and pilots set take-off thrust to the relevant target." },
    ],
  },
  "1.12": {
    caseStudy: {
      title: "Hot and high: why flat rating matters", tag: "Operational limits",
      context: "An airliner departs a high-altitude airport on a hot afternoon — thin, warm air that reduces engine mass flow.",
      challenge: "Thrust falls with density, yet the crew need a guaranteed, predictable thrust for take-off performance calculations.",
      approach: "The engine is flat rated: its control holds a constant certified thrust up to a corner (kink) temperature, giving up the extra thrust it could make on cold days.",
      finding: "Below the corner temperature the crew always get the same rated thrust; above it, thrust is allowed to reduce, and performance charts account for the loss.",
      outcome: "Flat rating delivers dependable take-off thrust across conditions while protecting the hot section from over-temperature — turning a variable engine into a predictable tool.",
    },
    myth: { claim: "Flat rating means the engine is running at its absolute maximum power on every take-off.",
      truth: "It's the reverse. On cooler days a flat-rated engine is deliberately held below the thrust it could physically produce, so that all take-offs share one certified figure. Only near the corner temperature is it near its limit. This restraint is what protects blade life and gives consistent performance." },
  },
};
