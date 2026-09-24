"use client";

/*
 * Notes tool — categorise by subject and upload course notes, inside the
 * console. Reuses the existing Ground School store (lib/lms + Supabase);
 * reads are public, writes are faculty-only via RLS.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  listSubjects, listNotes, noteCounts, createSubject, deleteSubject,
  uploadNote, deleteNote, publicUrl, fmtSize, fileKind,
} from "@/lib/lms";

export default function NotesTool() {
  const [subjects, setSubjects] = useState([]);
  const [counts, setCounts] = useState({});
  const [sel, setSel] = useState(null);        // selected subject id
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const loadSubjects = useCallback(async () => {
    setLoaded(false);
    try {
      const [subs, c] = await Promise.all([listSubjects(), noteCounts()]);
      setSubjects(subs); setCounts(c);
      setSel((cur) => cur || subs[0]?.id || null);
      setStatus("");
    } catch (e) { setStatus(e?.message || "Could not load — is Ground School set up in Supabase?"); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const loadNotes = useCallback(async (id) => {
    if (!id) { setNotes([]); return; }
    try { setNotes(await listNotes(id)); } catch (e) { setStatus(e?.message || "Could not load notes."); }
  }, []);
  useEffect(() => { loadNotes(sel); }, [sel, loadNotes]);

  async function addSubject(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true); setStatus("");
    try {
      const s = await createSubject(newName.trim(), newCode.trim() || null);
      setNewName(""); setNewCode("");
      await loadSubjects(); setSel(s.id);
      setStatus(`Subject “${s.name}” created.`);
    } catch (e2) { setStatus(e2?.message || "Could not create subject."); }
    finally { setBusy(false); }
  }

  async function removeSubject(s) {
    if (!confirm(`Delete “${s.name}” and all its notes? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteSubject(s.id);
      setSel(null);
      await loadSubjects();
      setStatus(`Deleted “${s.name}”.`);
    } catch (e) { setStatus(e?.message || "Delete failed."); }
    finally { setBusy(false); }
  }

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !sel) return;
    setBusy(true); setStatus(`Uploading ${file.name}…`);
    try {
      await uploadNote(sel, title.trim(), file);
      setTitle("");
      await Promise.all([loadNotes(sel), loadSubjects()]);
      setStatus(`Uploaded ${file.name}.`);
    } catch (e2) { setStatus(e2?.message || "Upload failed."); }
    finally { setBusy(false); }
  }

  async function removeNote(n) {
    if (!confirm(`Delete “${n.title || n.filename}”?`)) return;
    setBusy(true);
    try { await deleteNote(n); await Promise.all([loadNotes(sel), loadSubjects()]); setStatus("Note deleted."); }
    catch (e) { setStatus(e?.message || "Delete failed."); }
    finally { setBusy(false); }
  }

  const selSubject = subjects.find((s) => s.id === sel);

  return (
    <div className="prof-panel">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Notes Library</h2>
        <span className="prof-chip">Live</span>
        <a className="nt-ext" href="/ground-school" target="_blank" rel="noopener noreferrer">Student view ↗</a>
      </div>
      <p className="prof-panel-lead">Categorise by subject and upload notes. Students browse and download these in Ground School.</p>

      <div className="nt-wrap">
        {/* subjects */}
        <aside className="nt-subs">
          <form className="nt-newsub" onSubmit={addSubject}>
            <input placeholder="New subject name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input placeholder="Code (opt.)" value={newCode} onChange={(e) => setNewCode(e.target.value)} className="nt-code" />
            <button className="prof-btn primary" type="submit" disabled={busy}>Add</button>
          </form>
          <div className="nt-sublist">
            {!loaded ? <div className="nt-empty">Loading…</div>
              : subjects.length === 0 ? <div className="nt-empty">No subjects yet — add one above.</div>
              : subjects.map((s) => (
                <button key={s.id} className={"nt-sub" + (s.id === sel ? " on" : "")} onClick={() => setSel(s.id)}>
                  <span className="nt-sub-name">{s.name}</span>
                  <span className="nt-sub-meta">{s.code ? s.code + " · " : ""}{counts[s.id] || 0}</span>
                </button>
              ))}
          </div>
        </aside>

        {/* notes for the selected subject */}
        <section className="nt-notes">
          {selSubject ? (
            <>
              <div className="nt-notes-h">
                <b>{selSubject.name}</b>
                <div className="nt-notes-actions">
                  <input ref={fileRef} type="file" hidden onChange={onFile} />
                  <input className="nt-title" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <button className="prof-btn primary" onClick={() => fileRef.current?.click()} disabled={busy}>⭱ Upload note</button>
                  <button className="prof-btn ghost" onClick={() => removeSubject(selSubject)} disabled={busy}>Delete subject</button>
                </div>
              </div>
              {notes.length === 0 ? (
                <div className="nt-empty">No notes in this subject yet.</div>
              ) : (
                <div className="nt-list">
                  {notes.map((n) => (
                    <div className="nt-note" key={n.id}>
                      <span className="nt-kind">{fileKind(n.filename)}</span>
                      <div className="nt-note-body">
                        <a href={publicUrl(n.path)} target="_blank" rel="noopener noreferrer" className="nt-note-title">{n.title || n.filename}</a>
                        <div className="nt-note-meta">{n.filename} · {fmtSize(n.size)} · {new Date(n.created_at).toLocaleDateString()}</div>
                      </div>
                      <button className="nt-del" onClick={() => removeNote(n)} title="Delete">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="nt-empty">Select or create a subject to manage its notes.</div>
          )}
        </section>
      </div>

      {status && <div className="nt-status">{status}</div>}
    </div>
  );
}

const CSS = `
.nt-ext{margin-left:auto;font-family:var(--mono);font-size:11px;color:var(--dim);text-decoration:none}
.nt-ext:hover{color:var(--accent)}
.nt-wrap{display:grid;grid-template-columns:260px 1fr;gap:16px;margin-top:6px}
.nt-newsub{display:flex;gap:6px;margin-bottom:10px}
.nt-newsub input{flex:1;min-width:0;font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.nt-newsub .nt-code{max-width:80px}
.nt-newsub input:focus{border-color:var(--accent);outline:none}
.nt-sublist{display:flex;flex-direction:column;gap:5px;max-height:420px;overflow:auto}
.nt-sub{display:flex;flex-direction:column;gap:2px;text-align:left;background:var(--panel-2);border:1px solid var(--line);border-radius:9px;padding:9px 12px;cursor:pointer;color:var(--ink);transition:.14s}
.nt-sub:hover{border-color:var(--accent)}
.nt-sub.on{border-color:var(--accent);background:var(--accent-soft)}
.nt-sub-name{font-size:13.5px;font-weight:600}
.nt-sub-meta{font-family:var(--mono);font-size:10px;color:var(--dim)}
.nt-notes{min-width:0}
.nt-notes-h{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-bottom:12px}
.nt-notes-h b{font-family:var(--serif);font-size:18px}
.nt-notes-actions{display:flex;gap:8px;margin-left:auto;flex-wrap:wrap;align-items:center}
.nt-title{font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.nt-list{display:flex;flex-direction:column;gap:7px}
.nt-note{display:flex;align-items:center;gap:12px;background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.nt-kind{flex:none;font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.05em;color:var(--accent);background:var(--accent-soft);border-radius:6px;padding:5px 7px;min-width:38px;text-align:center}
.nt-note-body{flex:1;min-width:0}
.nt-note-title{font-size:14px;font-weight:600;color:var(--ink);text-decoration:none}
.nt-note-title:hover{color:var(--accent);text-decoration:underline}
.nt-note-meta{font-family:var(--mono);font-size:10.5px;color:var(--dim);margin-top:2px}
.nt-del{flex:none;border:1px solid var(--line);background:transparent;color:var(--faint);border-radius:8px;width:30px;height:30px;cursor:pointer}
.nt-del:hover{color:var(--red);border-color:var(--red)}
.nt-empty{font-family:var(--mono);font-size:12px;color:var(--faint);padding:16px 2px}
.nt-status{margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--dim);background:var(--fill-weak);border-radius:8px;padding:9px 12px}
@media(max-width:720px){.nt-wrap{grid-template-columns:1fr}}
`;
