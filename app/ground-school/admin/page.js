"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import {
  listSubjects, listNotes, noteCounts, createSubject, deleteSubject,
  uploadNote, deleteNote, signIn, signOut, fmtSize, fileKind,
} from "@/lib/lms";

function AdminHeader({ email, onSignOut }) {
  return (
    <header className="topbar" id="top">
      <Link className="brand" href="/ground-school" style={{ gap: 12 }}>
        <div className="brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 2 8l10 5 10-5-10-5z" /><path d="M6 10.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-5.5" /><path d="M22 8v6" />
          </svg>
        </div>
        <div><div className="brand-name">GROUND SCHOOL</div><div className="brand-sub">admin console</div></div>
      </Link>
      <div className="topbar-spacer" />
      <Link className="kbtn" href="/ground-school">View library</Link>
      {email && <button className="kbtn" onClick={onSignOut}>Sign out</button>}
    </header>
  );
}

export default function GroundSchoolAdmin() {
  const [session, setSession] = useState(undefined); // undefined = checking
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function doLogin(e) {
    e.preventDefault();
    setAuthErr(""); setBusy(true);
    try { await signIn(email.trim(), password); }
    catch (err) { setAuthErr(err.message || "Sign-in failed."); }
    finally { setBusy(false); }
  }

  if (!supabaseConfigured) {
    return (
      <><div className="bg-grad" /><div className="bg-grid" /><AdminHeader />
        <main className="shell"><div className="gs-empty" style={{ marginTop: 40 }}>
          <div className="gs-empty-title serif">Not connected yet</div>
          <p>Add your Supabase keys to <code>.env.local</code> and run the setup SQL — see <code>GROUND-SCHOOL-SETUP.md</code>.</p>
        </div></main>
      </>
    );
  }

  if (session === undefined) return <><div className="bg-grad" /><AdminHeader /><main className="shell"><div className="gs-loading mono" style={{ marginTop: 40 }}>Checking session…</div></main></>;

  if (!session) {
    return (
      <><div className="bg-grad" /><div className="bg-grid" /><AdminHeader />
        <main className="shell">
          <div className="gs-login">
            <div className="gs-login-eyebrow mono">Instructor access</div>
            <h1 className="serif">Sign in to manage notes</h1>
            <form onSubmit={doLogin} className="gs-form">
              <label className="gs-label">Email
                <input className="gs-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
              </label>
              <label className="gs-label">Password
                <input className="gs-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </label>
              {authErr && <div className="gs-err mono">{authErr}</div>}
              <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in →"}</button>
            </form>
            <p className="gs-hint mono">Create your instructor user in the Supabase dashboard (Auth → Users). Students never sign in.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <><div className="bg-grad" /><div className="bg-grid" />
      <AdminHeader email={session.user?.email} onSignOut={() => signOut()} />
      <main className="shell">
        <section className="hero" style={{ padding: "36px 0 14px" }}>
          <div className="hero-eyebrow"><i />Signed in · {session.user?.email}</div>
          <h1 style={{ fontSize: "clamp(30px,4.4vw,46px)" }}>Notes <span className="accent">console.</span></h1>
        </section>
        <AdminBoard />
      </main>
    </>
  );
}

function AdminBoard() {
  const [subjects, setSubjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [active, setActive] = useState(null);
  const [notes, setNotes] = useState([]);
  const [msg, setMsg] = useState("");

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function refreshSubjects(selectId) {
    const [subs, cnt] = await Promise.all([listSubjects(), noteCounts()]);
    setSubjects(subs); setCounts(cnt);
    const sel = selectId ? subs.find((s) => s.id === selectId) : (active ? subs.find((s) => s.id === active.id) : subs[0]);
    setActive(sel || subs[0] || null);
  }
  useEffect(() => { refreshSubjects().catch((e) => setMsg(e.message)); }, []);
  useEffect(() => { if (active) listNotes(active.id).then(setNotes).catch((e) => setMsg(e.message)); else setNotes([]); }, [active]);

  async function addSubject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try { const s = await createSubject(newName.trim(), newCode.trim()); setNewName(""); setNewCode(""); await refreshSubjects(s.id); setMsg("Subject added."); }
    catch (err) { setMsg(err.message); }
  }
  async function removeSubject(s) {
    if (!confirm(`Delete “${s.name}” and all its notes? This can’t be undone.`)) return;
    try { await deleteSubject(s.id); await refreshSubjects(); setMsg("Subject deleted."); }
    catch (err) { setMsg(err.message); }
  }
  async function doUpload(e) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!active || !file) { setMsg("Pick a subject and a file."); return; }
    setUploading(true); setMsg("");
    try {
      await uploadNote(active.id, title.trim(), file);
      setTitle(""); if (fileRef.current) fileRef.current.value = "";
      const [ns, cnt] = await Promise.all([listNotes(active.id), noteCounts()]);
      setNotes(ns); setCounts(cnt); setMsg("Uploaded.");
    } catch (err) { setMsg(err.message); }
    finally { setUploading(false); }
  }
  async function removeNote(n) {
    if (!confirm(`Delete “${n.title}”?`)) return;
    try { await deleteNote(n); const [ns, cnt] = await Promise.all([listNotes(active.id), noteCounts()]); setNotes(ns); setCounts(cnt); }
    catch (err) { setMsg(err.message); }
  }

  return (
    <div className="gs-admin">
      {msg && <div className="gs-msg mono">{msg}</div>}
      <div className="gs-admin-grid">
        {/* subjects column */}
        <div className="gs-panel">
          <div className="gs-panel-head mono">Subjects</div>
          <form className="gs-inline-form" onSubmit={addSubject}>
            <input className="gs-input" placeholder="Subject name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="gs-input sm" placeholder="Code" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
            <button className="btn btn-ghost" type="submit">Add</button>
          </form>
          <div className="gs-sub-list">
            {subjects.map((s) => (
              <div key={s.id} className={"gs-sub" + (active?.id === s.id ? " on" : "")}>
                <button className="gs-sub-pick" onClick={() => setActive(s)}>
                  <span className="gs-sub-name">{s.name}</span>
                  <span className="gs-sub-meta mono">{s.code ? s.code + " · " : ""}{counts[s.id] || 0} notes</span>
                </button>
                <button className="gs-del" title="Delete subject" onClick={() => removeSubject(s)}>✕</button>
              </div>
            ))}
            {subjects.length === 0 && <div className="gs-loading mono">No subjects yet — add one.</div>}
          </div>
        </div>

        {/* notes column */}
        <div className="gs-panel">
          <div className="gs-panel-head mono">{active ? `Notes · ${active.name}` : "Notes"}</div>
          {active ? (
            <>
              <form className="gs-upload" onSubmit={doUpload}>
                <input className="gs-input" placeholder="Note title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input className="gs-file" ref={fileRef} type="file" accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip" />
                <button className="btn btn-primary" type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload note"}</button>
              </form>
              <div className="gs-note-list">
                {notes.map((n) => (
                  <div className="gs-note" key={n.id}>
                    <span className="gs-kind mono">{fileKind(n.filename)}</span>
                    <span className="gs-note-body">
                      <span className="gs-note-title">{n.title}</span>
                      <span className="gs-note-meta mono">{n.filename} · {fmtSize(n.size)}</span>
                    </span>
                    <button className="gs-del" title="Delete note" onClick={() => removeNote(n)}>✕</button>
                  </div>
                ))}
                {notes.length === 0 && <div className="gs-loading mono">No notes yet for this subject.</div>}
              </div>
            </>
          ) : <div className="gs-loading mono">Add or pick a subject to upload notes.</div>}
        </div>
      </div>
    </div>
  );
}
