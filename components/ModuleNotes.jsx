"use client";

/*
 * Module notes & resources — a self-contained modal for a learning module
 * (NDT, GTEM…). Lists the notes uploaded to the matching subject (via the
 * console Notes tab), views PDFs natively and PPT/DOC/XLS via the Microsoft
 * Office Online embed viewer, and offers a download for every file.
 * Reads are public (anon), so any visitor can view/download.
 */
import { useCallback, useEffect, useState } from "react";
import { listSubjects, listNotes, publicUrl, fileKind, fmtSize } from "@/lib/lms";

const OFFICE_KINDS = ["PPT", "DOC", "XLS"];

export default function ModuleNotes({ module, onClose }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [viewing, setViewing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const subs = await listSubjects();
      const key = String(module).toUpperCase();
      const sub = subs.find((s) => String(s.name).toUpperCase() === key || String(s.code || "").toUpperCase() === key)
        || subs.find((s) => String(s.name).toUpperCase().includes(key));
      setSubject(sub || null);
      setNotes(sub ? await listNotes(sub.id) : []);
    } catch (e) { setErr(e?.message || "Could not load notes."); }
    finally { setLoading(false); }
  }, [module]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { if (viewing) setViewing(null); else onClose?.(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [viewing, onClose]);

  const fileUrl = (n) => publicUrl(n.path);
  const downloadUrl = (n) => { const u = fileUrl(n); return u + (u.includes("?") ? "&" : "?") + "download"; };
  const viewerSrc = (n) => {
    const url = fileUrl(n);
    const kind = fileKind(n.filename || n.title || "");
    if (kind === "PDF") return url;
    if (OFFICE_KINDS.includes(kind)) return "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(url);
    return null;
  };

  return (
    <div className="mn-overlay" onClick={onClose} role="dialog" aria-label={`${module} notes`}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="mn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mn-head">
          <b>{module} · Notes &amp; Resources</b>
          <button className="mn-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {viewing ? (
          <div className="mn-viewer">
            <div className="mn-viewer-bar">
              <button className="mn-back" onClick={() => setViewing(null)}>← Back</button>
              <span className="mn-viewer-t">{viewing.title}</span>
              <a className="mn-dl" href={downloadUrl(viewing)} target="_blank" rel="noopener noreferrer">⬇ Download</a>
            </div>
            {viewerSrc(viewing)
              ? <iframe className="mn-frame" src={viewerSrc(viewing)} title={viewing.title} allowFullScreen />
              : <div className="mn-noview">This file type can’t be previewed. <a href={downloadUrl(viewing)} target="_blank" rel="noopener noreferrer">Download it</a> instead.</div>}
          </div>
        ) : loading ? (
          <div className="mn-empty">Loading notes…</div>
        ) : err ? (
          <div className="mn-empty">{err}</div>
        ) : !subject || notes.length === 0 ? (
          <div className="mn-empty">No notes uploaded for {module} yet.</div>
        ) : (
          <div className="mn-list">
            {notes.map((n) => {
              const kind = fileKind(n.filename || n.title || "");
              const canView = !!viewerSrc(n);
              return (
                <div className="mn-item" key={n.id}>
                  <span className={"mn-kind k-" + kind}>{kind}</span>
                  <div className="mn-meta">
                    <div className="mn-t">{n.title}</div>
                    <div className="mn-s">{[kind, fmtSize(n.size)].filter(Boolean).join(" · ")}</div>
                  </div>
                  {canView && <button className="mn-btn" onClick={() => setViewing(n)}>View</button>}
                  <a className="mn-btn ghost" href={downloadUrl(n)} target="_blank" rel="noopener noreferrer">Download</a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
.mn-overlay{position:fixed;inset:0;z-index:9000;background:rgba(6,8,12,.66);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
.mn-modal{width:min(880px,100%);max-height:88vh;display:flex;flex-direction:column;background:#12161d;color:#e8ebf0;border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.55);overflow:hidden}
.mn-head{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid rgba(255,255,255,.1)}
.mn-head b{font-size:15px;letter-spacing:.02em}
.mn-x{border:none;background:none;color:#9aa4b2;font-size:16px;cursor:pointer}
.mn-x:hover{color:#fff}
.mn-list{overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.mn-item{display:flex;align-items:center;gap:12px;background:#1a1f28;border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:11px 13px}
.mn-kind{flex:none;width:44px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;letter-spacing:.04em;color:#fff;background:#3b4658}
.mn-kind.k-PDF{background:#c0392b}.mn-kind.k-PPT{background:#d24726}.mn-kind.k-DOC{background:#2b579a}.mn-kind.k-XLS{background:#1e7145}.mn-kind.k-IMG{background:#6b21a8}
.mn-meta{flex:1;min-width:0}
.mn-t{font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mn-s{font-size:11px;color:#8b95a5;margin-top:2px;font-family:ui-monospace,monospace}
.mn-btn{flex:none;font-size:12.5px;font-weight:700;border:1px solid #3b82f6;border-radius:8px;padding:8px 14px;background:#3b82f6;color:#fff;cursor:pointer;text-decoration:none}
.mn-btn:hover{filter:brightness(1.08)}
.mn-btn.ghost{background:transparent;color:#9dc0ff}
.mn-empty{padding:44px 20px;text-align:center;color:#8b95a5;font-size:14px}
.mn-viewer{display:flex;flex-direction:column;min-height:0;flex:1}
.mn-viewer-bar{display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.1)}
.mn-viewer-t{flex:1;min-width:0;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mn-back{border:1px solid rgba(255,255,255,.2);background:transparent;color:#e8ebf0;border-radius:8px;padding:7px 12px;font-size:12.5px;cursor:pointer}
.mn-dl{flex:none;font-size:12.5px;font-weight:700;color:#9dc0ff;text-decoration:none}
.mn-frame{flex:1;width:100%;min-height:60vh;border:none;background:#fff}
.mn-noview{padding:44px 20px;text-align:center;color:#8b95a5}
.mn-noview a,.mn-dl:hover{color:#fff}
@media(max-width:560px){.mn-frame{min-height:70vh}}
`;
