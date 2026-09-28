"use client";

// Site-wide "Report a bug" widget. A small floating button opens a form; the
// report is stored as a ticket and emailed to the site owner. Available on every
// page (mounted in the root layout). Bottom-left, to avoid the FRIDAY orb.
import { useState } from "react";

export default function BugReport() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (message.trim().length < 5 || state === "sending") return;
    setState("sending"); setErr("");
    try {
      const res = await fetch("/api/report-bug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), email: email.trim(), hp, page: typeof window !== "undefined" ? window.location.href : "" }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "failed");
      setState("sent"); setMessage(""); setEmail("");
      setTimeout(() => { setOpen(false); setState("idle"); }, 2200);
    } catch (e2) {
      setState("error");
      setErr(e2?.message === "rate_limited" ? "Too many reports just now — please try again in a few minutes." : "Couldn't send the report. Please try again.");
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!open && (
        <button className="bug-fab" onClick={() => setOpen(true)} aria-label="Report a bug" title="Report a bug">
          <span aria-hidden>🐞</span> Report a bug
        </button>
      )}

      {open && (
        <div className="bug-card" role="dialog" aria-label="Report a bug">
          <div className="bug-head">
            <b>Report a bug</b>
            <button className="bug-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          {state === "sent" ? (
            <div className="bug-done">Thanks! Your report has been sent. 🙌</div>
          ) : (
            <form onSubmit={submit}>
              <p className="bug-lead">Found something broken or off? Tell us what happened — it goes straight to the developer.</p>
              <textarea
                className="bug-msg"
                placeholder="What went wrong? What were you doing when it happened?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                autoFocus
                maxLength={5000}
              />
              <input
                className="bug-email"
                type="email"
                placeholder="Your email (optional, if you'd like a reply)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* honeypot — hidden from humans */}
              <input className="bug-hp" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} aria-hidden="true" />
              {state === "error" && <div className="bug-err">{err}</div>}
              <div className="bug-actions">
                <span className="bug-note">The current page is included automatically.</span>
                <button type="submit" className="bug-send" disabled={message.trim().length < 5 || state === "sending"}>
                  {state === "sending" ? "Sending…" : "Send report"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}

const CSS = `
.bug-fab{position:fixed;left:16px;bottom:16px;z-index:55;display:inline-flex;align-items:center;gap:7px;font-family:var(--font-sans,system-ui);font-size:12.5px;font-weight:600;color:#fff;background:#1f2937;border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:9px 14px;cursor:pointer;box-shadow:0 6px 22px rgba(0,0,0,.28);opacity:.9}
.bug-fab:hover{opacity:1;transform:translateY(-1px)}
.bug-card{position:fixed;left:16px;bottom:16px;z-index:56;width:min(340px,calc(100vw - 24px));background:#fff;color:#111;border:1px solid rgba(0,0,0,.12);border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.32);overflow:hidden;font-family:var(--font-sans,system-ui)}
@media(prefers-color-scheme:dark){.bug-card{background:#161a20;color:#e7e7e7;border-color:rgba(255,255,255,.12)}}
.bug-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(128,128,128,.2)}
.bug-head b{font-size:14px}
.bug-x{border:none;background:none;font-size:14px;cursor:pointer;color:inherit;opacity:.6}
.bug-x:hover{opacity:1}
.bug-card form{padding:14px}
.bug-lead{font-size:12.5px;line-height:1.5;color:inherit;opacity:.75;margin:0 0 10px}
.bug-msg,.bug-email{width:100%;box-sizing:border-box;font-family:inherit;font-size:13.5px;color:inherit;background:rgba(128,128,128,.08);border:1px solid rgba(128,128,128,.3);border-radius:9px;padding:10px 11px;outline:none}
.bug-msg{resize:vertical;margin-bottom:8px}
.bug-msg:focus,.bug-email:focus{border-color:#3b82f6}
.bug-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.bug-err{font-size:12px;color:#e5484d;margin-top:8px}
.bug-actions{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;flex-wrap:wrap}
.bug-note{font-size:10.5px;opacity:.6}
.bug-send{flex:none;font-family:inherit;font-size:13px;font-weight:700;border:none;border-radius:9px;padding:9px 16px;background:#3b82f6;color:#fff;cursor:pointer}
.bug-send:disabled{opacity:.5;cursor:default}
.bug-done{padding:22px 16px;text-align:center;font-size:14px}
`;
