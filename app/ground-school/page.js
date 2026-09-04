"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseConfigured } from "@/lib/supabase";
import { listSubjects, listNotes, noteCounts, publicUrl, fmtSize, fileKind } from "@/lib/lms";

function GsHeader() {
  return (
    <header className="topbar" id="top">
      <Link className="brand" href="/" style={{ gap: 12 }}>
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 2 8l10 5 10-5-10-5z" /><path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" /><path d="M22 8v6" />
          </svg>
        </div>
        <div>
          <div className="brand-name">GROUND SCHOOL</div>
          <div className="brand-sub">ARGUS · notes library</div>
        </div>
      </Link>
      <div className="topbar-spacer" />
      <Link className="kbtn" href="/">← Terminal</Link>
      <Link className="kbtn" href="/ground-school/admin">Admin</Link>
    </header>
  );
}

function NotConfigured() {
  return (
    <div className="gs-empty">
      <div className="gs-empty-title serif">Ground School isn’t connected yet</div>
      <p>Add your Supabase project keys to <code>.env.local</code> and run the setup SQL, then this fills with your subjects and notes. See <code>GROUND-SCHOOL-SETUP.md</code>.</p>
    </div>
  );
}

export default function GroundSchool() {
  const [subjects, setSubjects] = useState(null);
  const [counts, setCounts] = useState({});
  const [active, setActive] = useState(null);
  const [notes, setNotes] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseConfigured) return;
    (async () => {
      try {
        const [subs, cnt] = await Promise.all([listSubjects(), noteCounts()]);
        setSubjects(subs);
        setCounts(cnt);
        if (subs.length) setActive(subs[0]);
      } catch (e) { setErr(e.message || "Couldn’t load subjects."); setSubjects([]); }
    })();
  }, []);

  useEffect(() => {
    if (!active) { setNotes(null); return; }
    setNotes(null);
    listNotes(active.id).then(setNotes).catch((e) => { setErr(e.message); setNotes([]); });
  }, [active]);

  return (
    <>
      <div className="bg-grad" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />
      <GsHeader />

      <main className="shell">
        <section className="hero" style={{ padding: "44px 0 20px" }}>
          <div className="hero-eyebrow"><i />Ground School · study library</div>
          <h1 style={{ fontSize: "clamp(34px,5vw,54px)" }}>
            Notes for every <span className="accent">subject.</span>
          </h1>
          <p style={{ marginTop: 18 }}>Browse by subject and open or download the material. Updated by your instructor.</p>
        </section>

        {!supabaseConfigured ? (
          <NotConfigured />
        ) : (
          <div className="gs-layout">
            <aside className="gs-subs">
              <div className="gs-subs-head mono">Subjects</div>
              {subjects === null && <div className="gs-loading mono">Loading…</div>}
              {subjects && subjects.length === 0 && <div className="gs-loading mono">No subjects yet.</div>}
              {subjects && subjects.map((s) => (
                <button key={s.id} className={"gs-sub" + (active?.id === s.id ? " on" : "")} onClick={() => setActive(s)}>
                  <span className="gs-sub-name">{s.name}</span>
                  <span className="gs-sub-meta mono">{s.code ? s.code + " · " : ""}{counts[s.id] || 0}</span>
                </button>
              ))}
            </aside>

            <section className="gs-notes">
              {active && <div className="gs-notes-head"><span className="serif">{active.name}</span>{active.code && <span className="gs-code mono">{active.code}</span>}</div>}
              {err && <div className="gs-loading mono">{err}</div>}
              {active && notes === null && <div className="gs-loading mono">Loading notes…</div>}
              {active && notes && notes.length === 0 && <div className="gs-loading mono">No notes posted for this subject yet.</div>}
              {active && notes && notes.map((n) => (
                <a className="gs-note" key={n.id} href={publicUrl(n.path)} target="_blank" rel="noopener noreferrer">
                  <span className="gs-kind mono" data-k={fileKind(n.filename)}>{fileKind(n.filename)}</span>
                  <span className="gs-note-body">
                    <span className="gs-note-title">{n.title}</span>
                    <span className="gs-note-meta mono">{n.filename} · {fmtSize(n.size)} · {new Date(n.created_at).toLocaleDateString()}</span>
                  </span>
                  <span className="gs-note-go mono">Open →</span>
                </a>
              ))}
              {!active && subjects && subjects.length > 0 && <div className="gs-loading mono">Pick a subject to see its notes.</div>}
            </section>
          </div>
        )}
      </main>
    </>
  );
}
