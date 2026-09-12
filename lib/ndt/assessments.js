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
  "1.9": [
    { q: "Unaided visual inspection is limited to…", options: ["Internal flaws", "Visible, surface-breaking features", "Sub-surface porosity", "Grain boundaries"], answer: 1, explain: "The naked eye can only see flaws that are visible on the surface." },
    { q: "A borescope is an example of…", options: ["A destructive test", "An aided visual inspection tool", "A radiographic film", "A penetrant"], answer: 1, explain: "Borescopes extend visual reach into cavities — aided visual inspection." },
    { q: "A major human factor limiting visual testing is…", options: ["Excess magnetism", "Operator fatigue and attention", "Skin effect", "Capillary action"], answer: 1, explain: "Fatigue, lighting and attention drive miss rates in visual inspection." },
  ],
};
