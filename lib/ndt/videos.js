// Curated YouTube videos per session, keyed by session id → [{ id, title }].
// Sourced by topic search; edit freely. Sessions without an entry show a
// "search on YouTube" link for the topic until curated IDs are added.
export const VIDEOS = {
  /* ── Unit I ── */
  "1.1": [
    { id: "reRaF_pZY5g", title: "NDT — introduction, necessity, applications & methods" },
    { id: "zwAI4nwBoP0", title: "Non-Destructive Testing explained: types, methods & applications" },
  ],
  "1.2": [
    { id: "aZJ0P-WPNzg", title: "Destructive vs Non-Destructive Testing — the difference" },
    { id: "HUJm4YIt678", title: "Destructive / mechanical test — tensile testing" },
  ],
  "1.3": [
    { id: "QMpaqg5tEuQ", title: "Non-Destructive Testing — a comprehensive overview" },
    { id: "zwAI4nwBoP0", title: "NDT methods: types & industrial applications" },
  ],
  "1.4": [{ id: "QMpaqg5tEuQ", title: "NDT overview — detecting manufacturing defects" }],
  "1.5": [{ id: "zwAI4nwBoP0", title: "NDT methods & their applications" }],
  "1.6": [{ id: "reRaF_pZY5g", title: "Why NDT matters — necessity & applications" }],
  "1.7": [{ id: "QMpaqg5tEuQ", title: "NDT overview — capabilities & limits" }],
  "1.8": [{ id: "zwAI4nwBoP0", title: "NDT methods and material considerations" }],
  "1.9": [
    { id: "efyoauYXA38", title: "Visual examination — naked eye, visual aids & borescopes" },
    { id: "5qxZe6TFhFM", title: "Video borescope — remote visual inspection" },
  ],

  /* ── Unit II ── */
  "2.1": [
    { id: "AMGdAHnP6mI", title: "Dye penetrant test — principles, pros & cons" },
    { id: "b3mi03oRtao", title: "Dye penetrant inspection — full procedure" },
  ],
  "2.2": [{ id: "zow14e0KuQw", title: "Fluorescent penetrant inspection" }],
  "2.3": [{ id: "b3mi03oRtao", title: "Penetrant procedure — applying the developer" }],
  "2.4": [{ id: "AMGdAHnP6mI", title: "Dye penetrant — advantages & limitations" }],
  "2.5": [
    { id: "b3mi03oRtao", title: "Liquid penetrant testing — step-by-step procedure" },
    { id: "zow14e0KuQw", title: "Fluorescent penetrant procedure" },
  ],
  "2.6": [
    { id: "yKh8uVWKtwo", title: "Magnetic particle inspection for welding" },
    { id: "AEBOrri2cB0", title: "Magnetic particle testing — wet visible method (Birring)" },
  ],
  "2.7": [
    { id: "yRv9vzTaHEA", title: "Magnetic particle testing using a yoke — procedure" },
    { id: "u8Rbt4hGR-w", title: "AC yoke with black-ink technique" },
  ],
  "2.8": [{ id: "AEBOrri2cB0", title: "Magnetic particles — wet visible method & inspection" }],
  "2.9": [{ id: "yRv9vzTaHEA", title: "Magnetic particle testing procedure (incl. finishing steps)" }],

  /* ── seeds for later units (used when those units are built) ── */
  // Eddy current (Unit III): JLFE2yN8Z2o, Xavt2-o06bI
  // Ultrasonic (Unit IV): 1fusgvvgGGs
  // Radiography (Unit V): BMuRKahAghA
};
