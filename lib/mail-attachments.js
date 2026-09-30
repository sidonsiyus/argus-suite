// Shared rules for outgoing email attachments (used by the client picker and
// re-checked server-side). Attachments travel as base64 inside the JSON body, and
// serverless hosts cap request bodies at ~4.5 MB — base64 inflates by a third —
// so the total raw size is capped at 3 MB.

export const MAX_ATTACHMENTS = 5;
export const MAX_TOTAL_BYTES = 3_000_000;

// Decoded byte length of a base64 string.
export function base64Bytes(b64) {
  const s = String(b64 || "");
  const pad = s.endsWith("==") ? 2 : s.endsWith("=") ? 1 : 0;
  return Math.floor((s.length * 3) / 4) - pad;
}

function cleanName(name) {
  return String(name || "attachment")
    .replace(/[\\/]+/g, "_")
    .replace(/[\u0000-\u001f"<>|?*]/g, "")
    .trim()
    .slice(0, 120) || "attachment";
}

// Validate + normalize attachments from a request body.
// Returns { ok: true, list } or { ok: false, error }.
export function sanitizeAttachments(input) {
  if (input == null) return { ok: true, list: [] };
  if (!Array.isArray(input)) return { ok: false, error: "bad_attachments" };
  if (input.length > MAX_ATTACHMENTS) return { ok: false, error: "too_many_attachments" };

  let total = 0;
  const list = [];
  for (const a of input) {
    const content = String(a?.content || "");
    if (!content || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)) return { ok: false, error: "bad_attachments" };
    total += base64Bytes(content);
    if (total > MAX_TOTAL_BYTES) return { ok: false, error: "attachments_too_large" };
    const ct = String(a?.contentType || "");
    list.push({
      filename: cleanName(a?.filename),
      content,
      contentType: /^[\w.+-]+\/[\w.+-]+$/.test(ct) ? ct : "application/octet-stream",
    });
  }
  return { ok: true, list };
}
