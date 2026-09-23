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
const OVERRIDES = {};

export const DETAIL = { ...SEED, ...OVERRIDES };
