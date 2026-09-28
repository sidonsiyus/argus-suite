"use client";

/*
 * Tickets — the bug reports submitted from the site (via the floating "Report a
 * bug" widget). Faculty-only. Filter by status, resolve/reopen, delete.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { isMissingTable } from "@/lib/professor";
import { getTickets, setTicketStatus, deleteTicket } from "@/lib/tickets";

function when(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString(undefined, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
function pagePath(page) {
  if (!page) return "";
  try { const u = new URL(page); return u.pathname + u.search; } catch { return page; }
}

export default function TicketsTool() {
  const [filter, setFilter] = useState("open"); // open | resolved | all
  const [rows, setRows] = useState([]);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try { setRows(await getTickets({ status: filter })); setNeedsSetup(false); }
    catch (e) { if (isMissingTable(e)) setNeedsSetup(true); else setErr(e?.message || "Could not load tickets."); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => ({ shown: rows.length }), [rows]);

  async function resolve(t, to) {
    setBusy(t.id);
    try { await setTicketStatus(t.id, to); await load(); }
    catch (e) { setErr(e?.message || "Update failed."); }
    finally { setBusy(null); }
  }
  async function remove(t) {
    if (!confirm("Delete this ticket permanently?")) return;
    setBusy(t.id);
    try { await deleteTicket(t.id); await load(); }
    catch (e) { setErr(e?.message || "Delete failed."); }
    finally { setBusy(null); }
  }

  return (
    <div className="prof-panel tk-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="prof-panel-h">
        <h2>Tickets</h2>
        <span className="tk-sub">bug reports from the site</span>
        <div className="tk-sp" />
        <button className="tk-refresh" onClick={load} disabled={loading} title="Refresh">{loading ? "…" : "↻"}</button>
      </div>

      {needsSetup ? (
        <div className="tk-setup">Run <code>20261001_bug_reports.sql</code> in Supabase to enable tickets.</div>
      ) : (
        <>
          <div className="tk-tabs">
            {[["open", "Open"], ["resolved", "Resolved"], ["all", "All"]].map(([k, l]) => (
              <button key={k} className={"tk-tab" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>
            ))}
            <div className="tk-sp" />
            <span className="tk-count">{counts.shown} shown</span>
          </div>

          {err && <div className="att-err">{err}</div>}

          {loading ? <div className="att-empty">Loading…</div>
            : rows.length === 0 ? <div className="att-empty">No {filter === "all" ? "" : filter + " "}tickets.</div>
            : (
              <div className="tk-list">
                {rows.map((t) => (
                  <div key={t.id} className={"tk-item" + (t.status === "resolved" ? " done" : "")}>
                    <div className="tk-item-h">
                      <span className={"tk-badge " + t.status}>{t.status}</span>
                      <span className="tk-time">{when(t.created_at)}</span>
                      {t.page && <span className="tk-page" title={t.page}>{pagePath(t.page)}</span>}
                    </div>
                    <div className="tk-msg">{t.message}</div>
                    <div className="tk-item-f">
                      {t.email
                        ? <a className="tk-mail" href={`mailto:${t.email}?subject=Re:%20your%20bug%20report`}>{t.email}</a>
                        : <span className="tk-anon">no email given</span>}
                      <div className="tk-sp" />
                      {t.status === "open"
                        ? <button className="tk-btn" onClick={() => resolve(t, "resolved")} disabled={busy === t.id}>Resolve ✓</button>
                        : <button className="tk-btn ghost" onClick={() => resolve(t, "open")} disabled={busy === t.id}>Reopen</button>}
                      <button className="tk-btn x" onClick={() => remove(t)} disabled={busy === t.id} title="Delete">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </>
      )}
    </div>
  );
}

const CSS = `
.tk-root .prof-panel-h{align-items:center}
.tk-sub{font-family:var(--mono);font-size:11px;color:var(--dim)}
.tk-sp{flex:1}
.tk-refresh{flex:none;width:32px;height:32px;border-radius:9px;border:1px solid var(--line-2);background:var(--panel);color:var(--ink);font-size:15px;cursor:pointer}
.tk-refresh:hover{border-color:var(--accent);color:var(--accent)}
.tk-setup{font-size:13px;color:var(--ink-soft);background:var(--accent-soft);border:1px solid var(--accent);border-radius:10px;padding:11px 12px}
.tk-setup code{font-family:var(--mono);font-size:12px}
.tk-tabs{display:flex;align-items:center;gap:6px;margin-bottom:14px}
.tk-tab{font-family:var(--sans);font-size:12.5px;font-weight:600;color:var(--dim);background:var(--panel-2);border:1px solid var(--line);border-radius:8px;padding:7px 13px;cursor:pointer}
.tk-tab.on{color:#fff;background:var(--accent);border-color:var(--accent)}
.tk-count{font-family:var(--mono);font-size:10.5px;color:var(--faint)}
.tk-list{display:flex;flex-direction:column;gap:10px}
.tk-item{background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:12px 13px}
.tk-item.done{opacity:.62}
.tk-item-h{display:flex;align-items:center;gap:9px;margin-bottom:7px;flex-wrap:wrap}
.tk-badge{font-family:var(--mono);font-size:9px;letter-spacing:.08em;text-transform:uppercase;border-radius:20px;padding:2px 8px}
.tk-badge.open{color:var(--gold);border:1px solid rgba(226,171,65,.4)}
.tk-badge.resolved{color:var(--green);border:1px solid color-mix(in srgb,var(--green) 45%,transparent)}
.tk-time{font-family:var(--mono);font-size:10.5px;color:var(--dim)}
.tk-page{font-family:var(--mono);font-size:10.5px;color:var(--accent);background:var(--accent-soft);border-radius:6px;padding:1px 7px;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tk-msg{font-size:13.5px;line-height:1.55;color:var(--ink);white-space:pre-wrap;word-break:break-word;margin-bottom:9px}
.tk-item-f{display:flex;align-items:center;gap:8px}
.tk-mail{font-family:var(--mono);font-size:11px;color:var(--accent);text-decoration:none}
.tk-mail:hover{text-decoration:underline}
.tk-anon{font-family:var(--mono);font-size:11px;color:var(--faint)}
.tk-btn{flex:none;font-family:var(--sans);font-size:12px;font-weight:600;border:1px solid var(--accent);border-radius:8px;padding:6px 12px;background:var(--accent);color:#fff;cursor:pointer}
.tk-btn.ghost{background:transparent;color:var(--accent)}
.tk-btn.x{border-color:var(--line-2);background:transparent;color:var(--faint);padding:6px 9px}
.tk-btn.x:hover{color:var(--red);border-color:var(--red)}
.tk-btn:disabled{opacity:.5;cursor:default}
`;
