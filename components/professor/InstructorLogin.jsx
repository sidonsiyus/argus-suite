"use client";

/*
 * Instructor login modal, opened from the public homepage. On success the
 * homepage's auth listener swaps the page into the Professor Dashboard, so
 * there is no separate login route — same site, same URL.
 */
import { useEffect, useState } from "react";
import { signIn } from "@/lib/lms";
import { supabaseConfigured } from "@/lib/supabase";

export default function InstructorLogin({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await signIn(email.trim(), password);
      onClose(); // session change is picked up by the homepage listener
    } catch (e2) {
      setErr(e2?.message || "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ilog-ovl" onClick={onClose}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ilog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Instructor login">
        <div className="ilog-eyebrow">Instructor access</div>
        <h2>Sign in</h2>
        {!supabaseConfigured ? (
          <p className="ilog-note">Supabase keys aren't set yet — add them to <code>.env.local</code> to enable login.</p>
        ) : (
          <form onSubmit={submit}>
            <label className="ilog-label">Email
              <input className="ilog-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required autoFocus />
            </label>
            <label className="ilog-label">Password
              <input className="ilog-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
            {err && <div className="ilog-err">{err}</div>}
            <div className="ilog-cta">
              <button type="button" className="ilog-btn ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="ilog-btn primary" disabled={busy}>{busy ? "Signing in…" : "Sign in →"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const CSS = `
.ilog-ovl{position:fixed;inset:0;z-index:200;background:rgba(10,15,14,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px}
.ilog{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--line-2);border-radius:16px;padding:26px;box-shadow:var(--shadow-md);color:var(--ink);font-family:var(--sans)}
.ilog-eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.ilog h2{font-family:var(--serif);font-size:24px;font-weight:800;margin:6px 0 18px}
.ilog-note{font-size:13px;color:var(--dim);line-height:1.5}
.ilog-label{display:flex;flex-direction:column;gap:6px;font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);margin-bottom:14px}
.ilog-input{font-family:var(--sans);font-size:14px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:9px;padding:10px 12px;outline:none}
.ilog-input:focus{border-color:var(--accent)}
.ilog-err{font-family:var(--mono);font-size:12px;color:var(--red);margin-bottom:12px}
.ilog-cta{display:flex;gap:10px;justify-content:flex-end;margin-top:4px}
.ilog-btn{font-family:var(--sans);font-size:13px;font-weight:600;border-radius:10px;padding:9px 16px;cursor:pointer;border:1px solid var(--line-2);background:transparent;color:var(--ink);transition:.15s}
.ilog-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.ilog-btn.primary:disabled{opacity:.6;cursor:default}
.ilog-btn.ghost:hover{border-color:var(--accent);color:var(--accent)}
`;
