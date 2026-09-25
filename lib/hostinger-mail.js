// Server-only client for the Hostinger Mail API (api.mail.hostinger.com, v1).
//
// The API token is a SECRET — it lives in HOSTINGER_MAIL_TOKEN and never leaves
// the server (no NEXT_PUBLIC_ prefix, never returned to the browser). The token
// is order-scoped: it can read/send only mailboxes inside its own Hostinger
// order. Docs: https://api.mail.hostinger.com/
//
// This module is imported only from route handlers (app/api/professor/mail/*),
// never from a client component.

const BASE = "https://api.mail.hostinger.com";
const FOLDER = "INBOX";

export class HmError extends Error {
  constructor(code, status, message) {
    super(message || code);
    this.name = "HmError";
    this.code = code;
    this.status = status || 502;
  }
}

export function mailConfigured() {
  return Boolean(process.env.HOSTINGER_MAIL_TOKEN);
}

function token() {
  const t = process.env.HOSTINGER_MAIL_TOKEN;
  if (!t) throw new HmError("mail_unconfigured", 503, "HOSTINGER_MAIL_TOKEN is not set.");
  return t;
}

async function hfetch(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new HmError("network", 502, "Could not reach the mail server.");
  }
  if (res.status === 204) return null;
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok) {
    const code = json?.code || `http_${res.status}`;
    throw new HmError(code, res.status, json?.error || `Mail API error ${res.status}`);
  }
  return json?.data;
}

const enc = encodeURIComponent;

// Resolve — and cache for the process — the mailbox resourceId the token manages.
// Prefers HOSTINGER_MAILBOX (an address) when several mailboxes are in the order.
let _mailboxId = null;
export async function mailboxId() {
  if (_mailboxId) return _mailboxId;
  const me = await hfetch("/api/v1/me");
  const boxes = Array.isArray(me?.mailboxes) ? me.mailboxes : [];
  if (!boxes.length) throw new HmError("no_mailbox", 502, "The token cannot manage any mailbox.");
  const want = (process.env.HOSTINGER_MAILBOX || "").trim().toLowerCase();
  const pick = (want && boxes.find((b) => String(b.address).toLowerCase() === want)) || boxes[0];
  _mailboxId = pick.resourceId;
  return _mailboxId;
}

// Today's date as YYYY-MM-DD in the console's timezone (India by default).
// IMAP SINCE is date-granular, so "today" = since today's date.
export function todayInTz(tz = process.env.CONSOLE_TZ || "Asia/Kolkata") {
  return new Date().toLocaleDateString("en-CA", { timeZone: tz });
}

// Search INBOX for messages from a sender since a date (inclusive).
export async function searchFrom({ from, since, perPage = 100 }) {
  const id = await mailboxId();
  const data = await hfetch(
    `/api/v1/mailboxes/${enc(id)}/folders/${enc(FOLDER)}/messages/search?perPage=${perPage}&sort=-date`,
    { method: "POST", body: { from, since } }
  );
  return Array.isArray(data) ? data : [];
}

// The plain-text (and/or html) body of one message.
export async function messageText(uid) {
  const id = await mailboxId();
  return hfetch(`/api/v1/mailboxes/${enc(id)}/folders/${enc(FOLDER)}/messages/${enc(uid)}/text`);
}

// Send a reply. Passing `uid` threads it (copies Message-Id/References into
// In-Reply-To/References) AND flags the original \Answered — so the mailbox
// itself records that this email has been handled.
export async function sendReply({ to, subject, text, html, uid }) {
  const id = await mailboxId();
  const body = { to: Array.isArray(to) ? to : [to], subject };
  if (text) body.text = text;
  if (html) body.html = html;
  if (uid != null && uid !== "") body.inReplyTo = { folder: FOLDER, uid: Number(uid) };
  await hfetch(`/api/v1/mailboxes/${enc(id)}/send`, { method: "POST", body });
  return true;
}
