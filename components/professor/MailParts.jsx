"use client";

/*
 * Shared building blocks for writing email in the console:
 *   • useContacts()      — autofill list: recent → most-emailed (Sent folder) →
 *                          coordinator → students (roster emails)
 *   • <RecipientInput/>  — chip field (To / Cc) with suggestions
 *   • <AttachmentPicker/> — attach files (count + size capped)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { getRoster } from "@/lib/attendance";
import { fetchMailContacts, readAttachments } from "@/lib/coordinator-mail";
import { MAX_ATTACHMENTS, MAX_TOTAL_BYTES } from "@/lib/mail-attachments";

const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/;
const RECENT_KEY = "mail_recent_v1";
const TAG_LABEL = { recent: "recent", frequent: "often", coordinator: "coordinator", student: "student" };

function loadRecent() {
  try {
    const a = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
  } catch { return []; }
}

// Remember addresses just emailed, so they surface first next time.
export function rememberRecipients(emails) {
  try {
    const next = [...(emails || []).map((e) => String(e).toLowerCase()), ...loadRecent()]
      .filter((e, i, a) => a.indexOf(e) === i)
      .slice(0, 50);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* storage unavailable */ }
}

export function useContacts(coordinator) {
  const [roster, setRoster] = useState([]);
  const [sent, setSent] = useState([]);
  const [tick, setTick] = useState(0); // bump to re-read "recent" after a send

  useEffect(() => {
    let alive = true;
    getRoster().then((r) => { if (alive) setRoster(r || []); }).catch(() => {});
    fetchMailContacts().then((c) => { if (alive) setSent(c || []); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const contacts = useMemo(() => {
    const map = new Map();
    const add = (email, name, tag) => {
      const e = String(email || "").trim().toLowerCase();
      if (!EMAIL_RE.test(e)) return;
      const cur = map.get(e);
      if (cur) { if (!cur.name && name) cur.name = name; return; }
      map.set(e, { email: e, name: name || "", tag });
    };
    loadRecent().forEach((e) => add(e, "", "recent"));
    sent.forEach((c) => add(c.address, c.name, "frequent"));
    if (coordinator) add(coordinator, "Coordinator", "coordinator");
    roster.forEach((r) => add(r.email, r.full_name, "student"));
    return [...map.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent, roster, coordinator, tick]);

  return { contacts, refreshRecent: () => setTick((t) => t + 1) };
}

/* ── chip field with autofill ── */
export function RecipientInput({ label, hint, value, onChange, contacts = [], placeholder }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);

  const chosen = useMemo(() => new Set(value.map((v) => v.toLowerCase())), [value]);
  const q = text.trim().toLowerCase();
  const matches = useMemo(() => {
    const pool = contacts.filter((c) => !chosen.has(c.email));
    if (!q) return pool.slice(0, 6);
    return pool.filter((c) => c.email.includes(q) || (c.name || "").toLowerCase().includes(q)).slice(0, 8);
  }, [contacts, chosen, q]);
  useEffect(() => { setHi(0); }, [q]);

  const nameOf = useMemo(() => Object.fromEntries(contacts.map((c) => [c.email, c.name])), [contacts]);

  // Turn any valid addresses in `raw` into chips; leave the rest in the box.
  function commit(raw) {
    const parts = String(raw || "").split(/[\s,;]+/).filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    const rest = [];
    parts.forEach((p) => {
      const e = p.toLowerCase();
      if (EMAIL_RE.test(e)) { if (!next.includes(e)) next.push(e); } else rest.push(p);
    });
    if (next.length !== value.length) onChange(next);
    setText(rest.join(" "));
  }
  function pick(c) { if (!chosen.has(c.email)) onChange([...value, c.email]); setText(""); setHi(0); }

  function onKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, Math.max(matches.length - 1, 0))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Escape") { setOpen(false); }
    else if (e.key === "," || e.key === ";") { e.preventDefault(); commit(text); }
    else if (e.key === "Enter" || e.key === "Tab") {
      if (EMAIL_RE.test(text.trim())) { e.preventDefault(); commit(text); }
      else if (q && matches[hi]) { e.preventDefault(); pick(matches[hi]); }
      else if (e.key === "Enter") e.preventDefault(); // never submit a form from here
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  }
  function onText(v) {
    // pasted lists ("a@x.com, b@y.com" or space-separated) become chips at once
    if (/[,;]/.test(v) || /@\S*\s+\S*@/.test(v)) { commit(v); return; }
    setText(v);
    setOpen(true);
  }

  return (
    <div className="mp-field">
      <div className="mp-label">{label}{hint && <span className="mp-hint"> {hint}</span>}</div>
      <div className="mp-box" onClick={(e) => e.currentTarget.querySelector("input")?.focus()}>
        {value.map((e) => (
          <span className="mp-chip" key={e} title={nameOf[e] ? `${nameOf[e]} <${e}>` : e}>
            {nameOf[e] ? <><b>{nameOf[e].split(" ")[0]}</b> <i>{e}</i></> : e}
            <button type="button" className="mp-chip-x" onClick={() => onChange(value.filter((v) => v !== e))} aria-label={`Remove ${e}`}>✕</button>
          </span>
        ))}
        <input
          className="mp-in"
          value={text}
          placeholder={value.length ? "" : placeholder}
          onChange={(e) => onText(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => { commit(text); setOpen(false); }}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {open && matches.length > 0 && (
        <div className="mp-menu" role="listbox">
          {!q && <div className="mp-menu-h">Common contacts</div>}
          {matches.map((c, i) => (
            <button
              type="button" role="option" aria-selected={i === hi}
              key={c.email} className={"mp-opt" + (i === hi ? " on" : "")}
              onMouseDown={(e) => { e.preventDefault(); pick(c); }}
              onMouseEnter={() => setHi(i)}
            >
              <span className="mp-opt-main"><b>{c.name || c.email}</b>{c.name && <i>{c.email}</i>}</span>
              <span className="mp-opt-tag">{TAG_LABEL[c.tag]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const fmtSize = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB");

/* ── attachments ── */
export function AttachmentPicker({ files, onChange }) {
  const ref = useRef(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onPick(e) {
    // Copy out of the live FileList BEFORE resetting the input — clearing `value`
    // empties that list, which would silently attach nothing.
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;
    setBusy(true); setErr("");
    try {
      const { list, error } = await readAttachments(picked, files);
      onChange(list);
      if (error) setErr(error);
    } catch (e2) { setErr(e2?.message || "Could not attach that file."); }
    finally { setBusy(false); }
  }

  return (
    <div className="mp-attach">
      <input ref={ref} type="file" multiple hidden onChange={onPick} />
      <div className="mp-attach-row">
        <button type="button" className="mp-attach-btn" onClick={() => ref.current?.click()} disabled={busy || files.length >= MAX_ATTACHMENTS}>
          {busy ? "Attaching…" : "📎 Attach files"}
        </button>
        <span className="mp-hint">up to {MAX_ATTACHMENTS} files · {fmtSize(MAX_TOTAL_BYTES)} total</span>
      </div>
      {files.length > 0 && (
        <div className="mp-files">
          {files.map((f, i) => (
            <span className="mp-file" key={f.filename + i}>
              📎 {f.filename} <i>{fmtSize(f.size)}</i>
              <button type="button" className="mp-chip-x" onClick={() => onChange(files.filter((_, k) => k !== i))} aria-label={`Remove ${f.filename}`}>✕</button>
            </span>
          ))}
        </div>
      )}
      {err && <div className="mp-err">{err}</div>}
    </div>
  );
}

export const MAIL_PARTS_CSS = `
.mp-field{position:relative;display:flex;flex-direction:column;gap:6px}
.mp-label{font-family:var(--mono);font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}
.mp-hint{font-family:var(--mono);font-size:10px;letter-spacing:0;text-transform:none;color:var(--faint)}
.mp-box{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-height:44px;background:var(--panel);border:1px solid var(--line-2);border-radius:10px;padding:6px 8px;cursor:text}
.mp-box:focus-within{border-color:var(--accent)}
.mp-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;font-size:12.5px;color:var(--ink);background:var(--accent-soft);border:1px solid color-mix(in srgb,var(--accent) 35%,transparent);border-radius:20px;padding:3px 6px 3px 10px}
.mp-chip b{font-weight:700}
.mp-chip i{font-style:normal;font-family:var(--mono);font-size:10.5px;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mp-chip-x{flex:none;border:none;background:none;color:var(--dim);font-size:11px;cursor:pointer;padding:1px 3px;border-radius:50%}
.mp-chip-x:hover{color:var(--red)}
.mp-in{flex:1;min-width:140px;border:none;outline:none;background:transparent;font-family:var(--sans);font-size:14px;color:var(--ink);padding:5px 4px}
.mp-menu{position:absolute;left:0;right:0;top:100%;z-index:30;margin-top:4px;background:var(--panel);border:1px solid var(--line-2);border-radius:11px;box-shadow:var(--shadow-md);overflow:hidden}
.mp-menu-h{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);padding:8px 12px 4px}
.mp-opt{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;background:none;border:none;padding:8px 12px;cursor:pointer;color:var(--ink)}
.mp-opt.on{background:var(--accent-soft)}
.mp-opt-main{display:flex;flex-direction:column;min-width:0}
.mp-opt-main b{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mp-opt-main i{font-style:normal;font-family:var(--mono);font-size:10.5px;color:var(--dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mp-opt-tag{flex:none;font-family:var(--mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim);border:1px solid var(--line);border-radius:20px;padding:1px 7px}
.mp-attach{display:flex;flex-direction:column;gap:8px}
.mp-attach-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.mp-attach-btn{font-family:var(--sans);font-size:12.5px;font-weight:600;color:var(--ink);background:var(--panel);border:1px dashed var(--line-2);border-radius:9px;padding:8px 13px;cursor:pointer}
.mp-attach-btn:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.mp-attach-btn:disabled{opacity:.5;cursor:default}
.mp-files{display:flex;flex-wrap:wrap;gap:6px}
.mp-file{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:5px 7px 5px 10px}
.mp-file i{font-style:normal;font-family:var(--mono);font-size:10.5px;color:var(--dim)}
.mp-err{font-size:12px;color:var(--red)}
`;
