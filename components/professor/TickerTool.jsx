"use client";

/*
 * Ticker Manager — post custom announcements that ride in the site's news wire
 * alongside the live aviation headlines. Active, in-window items are readable by
 * everyone (public homepage); only faculty can create/edit/remove them.
 */
import { useCallback, useEffect, useState } from "react";
import { listTickerItems, addTickerItem, updateTickerItem, deleteTickerItem } from "@/lib/professor";

function fmtWhen(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}
function isExpired(it) { return it.expires_at && new Date(it.expires_at) <= new Date(); }

export default function TickerTool({ onChanged }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [message, setMessage] = useState("");
  const [href, setHref] = useState("");
  const [priority, setPriority] = useState(0);
  const [expires, setExpires] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoaded(false);
    try { setItems(await listTickerItems()); setStatus(""); }
    catch (e) { setStatus(e?.message || "Could not load — is the ticker_items table set up?"); }
    finally { setLoaded(true); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true); setStatus("");
    try {
      await addTickerItem({
        message,
        href,
        priority,
        active: true,
        expires_at: expires ? new Date(expires).toISOString() : null,
      });
      setMessage(""); setHref(""); setPriority(0); setExpires("");
      await load(); onChanged?.();
      setStatus("Announcement posted to the wire.");
    } catch (e2) { setStatus(e2?.message || "Post failed."); }
    finally { setBusy(false); }
  }

  async function toggle(it) {
    try { await updateTickerItem(it.id, { active: !it.active }); await load(); onChanged?.(); }
    catch (e) { setStatus(e?.message || "Update failed."); }
  }
  async function remove(it) {
    if (!confirm("Delete this announcement?")) return;
    try { await deleteTickerItem(it.id); await load(); onChanged?.(); }
    catch (e) { setStatus(e?.message || "Delete failed."); }
  }

  return (
    <div className="prof-panel">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Ticker Manager</h2>
        <span className="prof-chip">Live</span>
      </div>
      <p className="prof-panel-lead">Post your own announcements — they show in the site's news wire (for everyone) alongside the live headlines. Set an expiry so notices retire themselves.</p>

      <form className="tk-form" onSubmit={add}>
        <input className="tk-msg" placeholder="Announcement (e.g. 'CAT-2 marks published — check MENTOR OS')" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} required />
        <div className="tk-row2">
          <input className="tk-in" placeholder="Link (optional)" value={href} onChange={(e) => setHref(e.target.value)} />
          <label className="tk-mini">Priority
            <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} min={-5} max={10} />
          </label>
          <label className="tk-mini">Expires
            <input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </label>
          <button className="prof-btn primary" type="submit" disabled={busy}>{busy ? "Posting…" : "Post"}</button>
        </div>
      </form>

      {status && <div className="tk-status">{status}</div>}

      <div className="tk-list">
        {!loaded ? (
          <div className="tk-empty">Loading…</div>
        ) : items.length === 0 ? (
          <div className="tk-empty">No announcements yet.</div>
        ) : (
          items.map((it) => {
            const expired = isExpired(it);
            const live = it.active && !expired;
            return (
              <div key={it.id} className={"tk-item" + (live ? " on" : "")}>
                <span className={"tk-dot" + (live ? " live" : "")} />
                <div className="tk-body">
                  <div className="tk-text">{it.message}</div>
                  <div className="tk-meta">
                    {live ? "On air" : expired ? "Expired" : "Paused"}
                    {it.priority ? ` · priority ${it.priority}` : ""}
                    {it.expires_at ? ` · until ${fmtWhen(it.expires_at)}` : ""}
                    {it.href ? " · has link" : ""}
                  </div>
                </div>
                <button className="tk-act" onClick={() => toggle(it)} title={it.active ? "Pause" : "Resume"}>{it.active ? "Pause" : "Resume"}</button>
                <button className="tk-act del" onClick={() => remove(it)} title="Delete">Delete</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const CSS = `
.tk-form{display:flex;flex-direction:column;gap:10px;margin-bottom:8px}
.tk-msg{font-family:var(--sans);font-size:14px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:10px;padding:11px 13px;outline:none}
.tk-msg:focus{border-color:var(--accent)}
.tk-row2{display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end}
.tk-in{flex:1;min-width:180px;font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:9px;padding:9px 11px;outline:none}
.tk-in:focus{border-color:var(--accent)}
.tk-mini{display:flex;flex-direction:column;gap:5px;font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
.tk-mini input{font-family:var(--sans);font-size:13px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:8px 10px}
.tk-mini input[type=number]{width:82px}
.tk-status{font-family:var(--mono);font-size:12px;color:var(--dim);background:var(--fill-weak);border-radius:8px;padding:9px 12px;margin:10px 0}
.tk-list{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.tk-empty{font-family:var(--mono);font-size:12px;color:var(--faint);padding:12px 0}
.tk-item{display:flex;align-items:center;gap:12px;background:var(--panel-2);border:1px solid var(--line);border-radius:11px;padding:11px 14px}
.tk-item.on{border-color:rgba(31,143,86,.4)}
.tk-dot{width:8px;height:8px;border-radius:50%;background:var(--faint);flex:none}
.tk-dot.live{background:var(--green);box-shadow:0 0 8px var(--green)}
.tk-body{flex:1;min-width:0}
.tk-text{font-size:14px;color:var(--ink);line-height:1.4}
.tk-meta{font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;color:var(--dim);margin-top:3px}
.tk-act{flex:none;font-family:var(--sans);font-size:12px;font-weight:600;border:1px solid var(--line-2);background:transparent;color:var(--ink);border-radius:8px;padding:7px 12px;cursor:pointer;transition:.15s}
.tk-act:hover{border-color:var(--accent);color:var(--accent)}
.tk-act.del:hover{border-color:var(--red);color:var(--red)}
`;
