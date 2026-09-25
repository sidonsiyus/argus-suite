// Config + shaping for the coordinator-email panel (server side).
//
// The coordinator is the person whose daily emails Siddharth must reply to.
// Address is not a secret, so it's a plain constant (override with env if it
// ever changes) rather than something the client has to know.
export const COORDINATOR_EMAIL =
  (process.env.COORDINATOR_EMAIL || "adityamaddipati9999@gmail.com").trim().toLowerCase();

// A sent reply (via inReplyTo) sets \Answered on the original, so the mailbox is
// the source of truth for "have I dealt with this one yet?".
export function hasAnsweredFlag(flags) {
  return Array.isArray(flags) && flags.some((f) => String(f).toLowerCase() === "\\answered");
}

// Slim a raw API message down to what the panel lists (bodies fetched lazily).
export function shapeMessage(m) {
  return {
    uid: m.uid,
    subject: m.subject || "(no subject)",
    date: m.date || null,
    from: { name: m.from?.name || "", address: m.from?.address || "" },
    answered: hasAnsweredFlag(m.flags),
    unseen: !!m.unseen,
    hasAttachments: Array.isArray(m.attachments) && m.attachments.length > 0,
  };
}
