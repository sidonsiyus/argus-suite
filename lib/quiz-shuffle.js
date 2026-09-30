// Shuffle a quiz question's options while tracking which one is correct.
//
// The authored question banks put the correct answer at position B ~96% of the
// time, so "always pick B" aced every quiz and exam. Shuffling at display time
// fixes that without touching the data.
//
// Deterministic on purpose: the order is derived from the question text (plus an
// optional `nonce`), so a question renders the same way on every render and on
// the server (no hydration mismatch). Exams pass a per-attempt nonce to get a
// fresh order each time they're started.

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

// mulberry32 PRNG
function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleOptions(q, nonce = "") {
  const n = q.options.length;
  const order = Array.from({ length: n }, (_, i) => i);
  const rand = rng(hash(String(q.q) + "|" + nonce));
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}
