"use client";

/*
 * Day close dialog — the end-of-day routine in one place (see lib/day-close.js).
 * Shows each step, what it would do and whether it's possible, asks once before
 * anything is sent, then runs the chosen steps and reports each result.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { dayKey } from "@/lib/professor";
import { loadDayCloseState, runDayClose } from "@/lib/day-close";
import { ABSENTEE_CATS, DEFAULT_ABSENTEE_CATS, buildAbsenteeItems } from "@/lib/absentee-mail";

const STEP_TITLES = {
  sheet: "Push to the Google Sheet",
  absentees: "Email the absentees",
  tick: "Tick “Send today’s attendance report message”",
  lock: "Lock the day",
};
const ORDER = ["sheet", "absentees", "tick", "lock"];
const SHORT = { sheet: "sheet", absentees: "absentee emails", tick: "checklist", lock: "locked" };

const timeOf = (iso) => { const d = new Date(iso); return isNaN(d) ? "" : d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }); };

export default function DayClose({ onClose, onGoto, onDone }) {
  const day = useMemo(() => dayKey(), []);
  const [st, setSt] = useState(null);
  const [err, setErr] = useState("");
  const [pick, setPick] = useState({});
  const [cats, setCats] = useState({ ...DEFAULT_ABSENTEE_CATS });
  const [phase, setPhase] = useState("plan"); // plan | confirm | running | done
  const [results, setResults] = useState({});

  const load = useCallback(async () => {
    setErr("");
    try {
      const s = await loadDayCloseState(day);
      setSt(s);
      const prev = s.previous?.results || {};
      const was = (k) => prev[k]?.status === "done";
      setPick({
        sheet: s.saved && s.sheetReady && !was("sheet"),
        absentees: s.saved && s.mailConfigured && !was("absentees"),
        tick: s.saved && !s.alreadyTicked && !was("tick"),
        lock: s.saved && !s.locked && !was("lock"),
      });
    } catch (e) { setErr(e?.message || "Could not load today's attendance."); }
  }, [day]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape" && phase !== "running") onClose?.(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [phase, onClose]);

  const built = useMemo(
    () => (st ? buildAbsenteeItems({ roster: st.roster, recs: st.recs, cats, dateLabel: st.dayLabel, form: st.form }) : null),
    [st, cats]
  );

  // Why a step can't run (null = it can).
  const blocked = useMemo(() => {
    if (!st) return {};
    if (!st.saved) { const why = "Today's attendance hasn't been saved yet."; return { sheet: why, absentees: why, tick: why, lock: why }; }
    return {
      sheet: st.sheetReady ? null : "The Google Sheet isn't connected (Attendance → Mark day → ⚙).",
      absentees: !st.mailConfigured ? "The mailbox isn't connected." : !built.items.length ? (built.missing.length ? "None of the absentees has an email on file." : "No one is marked in the chosen categories.") : null,
      tick: st.alreadyTicked ? "Already ticked." : null,
      lock: st.locked ? "Already locked." : null,
    };
  }, [st, built]);

  const chosen = ORDER.filter((k) => pick[k] && !blocked[k]);
  const emailCount = (pick.absentees && !blocked.absentees ? built.items.length : 0);

  async function run() {
    setPhase("running"); setResults({});
    const eff = Object.fromEntries(ORDER.map((k) => [k, !!pick[k] && !blocked[k]]));
    const { results: res } = await runDayClose({
      state: st, pick: eff, cats,
      onStep: (k, patch) => setResults((r) => ({ ...r, [k]: patch })),
    });
    setResults(res);
    setPhase("done");
    onDone?.();
  }

  const prev = st?.previous;
  const prevLine = prev ? ORDER.filter((k) => prev.results?.[k]?.status === "done").map((k) => `${SHORT[k]} ✓`).join(" · ") : "";

  return (
    <div className="dc-ovl" onClick={() => phase !== "running" && onClose?.()} role="dialog" aria-label="Close the day">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="dc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dc-head">
          <div><b>Close the day</b><span>{st?.dayLabel || ""}</span></div>
          <button className="dc-x" onClick={onClose} disabled={phase === "running"} aria-label="Close">✕</button>
        </div>

        {err && <div className="dc-err">{err} <button className="dc-link" onClick={load}>retry</button></div>}
        {!st && !err && <div className="dc-empty">Checking today's attendance…</div>}

        {st && (
          <div className="dc-body">
            <div className="dc-stats">
              <span><b>{st.stats.strength}</b> students</span>
              {st.saved && <>
                <span className="p"><b>{st.stats.present}</b> present</span>
                <span className="o"><b>{st.stats.od}</b> OD</span>
                <span className="a"><b>{st.stats.absent}</b> absent</span>
              </>}
              {st.locked && <span className="l">🔒 locked</span>}
            </div>

            {!st.saved && (
              <div className="dc-warn">
                Today's attendance hasn't been saved yet, so there's nothing to close.
                <button className="dc-btn" onClick={() => { onClose?.(); onGoto?.("attendance"); }}>Go to Mark day →</button>
              </div>
            )}
            {prev && (
              <div className="dc-note">Already run today at <b>{timeOf(prev.at)}</b>{prevLine ? ` — ${prevLine}` : ""}. Steps that finished are unchecked so nothing is sent twice.</div>
            )}

            <div className="dc-steps">
              {ORDER.map((k) => {
                const r = results[k]; const why = blocked[k]; const disabled = !!why || phase !== "plan";
                return (
                  <div key={k} className={"dc-step" + (why ? " off" : "") + (r ? " " + r.status : "")}>
                    <label className="dc-chk">
                      <input type="checkbox" checked={!!pick[k] && !why} disabled={disabled} onChange={(e) => setPick((p) => ({ ...p, [k]: e.target.checked }))} />
                      <span className="dc-t">{STEP_TITLES[k]}</span>
                      {r && <span className={"dc-badge " + r.status}>{r.status === "running" ? "…" : r.status === "done" ? "✓ done" : r.status === "partial" ? "partial" : r.status === "failed" ? "✗ failed" : "skipped"}</span>}
                    </label>
                    <div className="dc-d">
                      {r?.detail ? r.detail
                        : why ? why
                        : k === "sheet" ? `${st.sheetName}: ${st.stats.present}P · ${st.stats.absent}A · ${st.stats.od}OD`
                        : k === "absentees" ? `${built.items.length} email${built.items.length === 1 ? "" : "s"}${built.missing.length ? ` · ${built.missing.length} skipped (no email)` : ""}`
                        : k === "tick" ? "marks today's report message as done" : "no further edits after this"}
                    </div>
                    {k === "absentees" && !why && phase === "plan" && (
                      <div className="dc-cats">
                        {ABSENTEE_CATS.map((c) => (
                          <label key={c.k} className={"dc-cat" + (cats[c.k] ? " on" : "")}>
                            <input type="checkbox" checked={!!cats[c.k]} onChange={(e) => setCats((x) => ({ ...x, [c.k]: e.target.checked }))} />{c.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="dc-foot">
              {phase === "plan" && (
                <>
                  <span className="dc-sum">{chosen.length ? `${chosen.length} step${chosen.length === 1 ? "" : "s"} selected${emailCount ? ` · ${emailCount} email${emailCount === 1 ? "" : "s"}` : ""}` : "Nothing selected"}</span>
                  <button className="dc-btn ghost" onClick={onClose}>Cancel</button>
                  <button className="dc-btn primary" disabled={!chosen.length} onClick={() => setPhase("confirm")}>Close the day →</button>
                </>
              )}
              {phase === "confirm" && (
                <div className="dc-confirm">
                  <span>{emailCount ? <>This sends <b>{emailCount}</b> email{emailCount === 1 ? "" : "s"} and can’t be unsent. </> : null}Go ahead?</span>
                  <button className="dc-btn ghost" onClick={() => setPhase("plan")}>Back</button>
                  <button className="dc-btn primary" onClick={run}>Yes, close the day</button>
                </div>
              )}
              {phase === "running" && <span className="dc-sum">Working… please keep this open.</span>}
              {phase === "done" && (
                <>
                  <span className="dc-sum">{Object.values(results).some((r) => r.status === "failed" || r.status === "partial") ? "Finished with some problems — see above." : "All done for the day ✅"}</span>
                  <button className="dc-btn primary" onClick={onClose}>Close</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CSS = `
.dc-ovl{position:fixed;inset:0;z-index:70;background:rgba(6,8,12,.6);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:18px;font-family:var(--sans)}
.dc-modal{width:min(640px,100%);max-height:90vh;display:flex;flex-direction:column;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.45);overflow:hidden}
.dc-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--line)}
.dc-head b{font-family:var(--serif);font-size:19px;font-weight:800;margin-right:10px}
.dc-head span{font-family:var(--mono);font-size:11px;color:var(--dim)}
.dc-x{border:none;background:none;color:var(--dim);font-size:16px;cursor:pointer}
.dc-x:disabled{opacity:.4;cursor:default}
.dc-body{overflow:auto;padding:16px 20px 20px;display:flex;flex-direction:column;gap:12px}
.dc-empty,.dc-err{padding:34px 20px;text-align:center;font-size:13.5px;color:var(--dim)}
.dc-err{color:var(--red)}
.dc-stats{display:flex;gap:16px;flex-wrap:wrap;font-size:12.5px;color:var(--dim);font-family:var(--mono)}
.dc-stats b{color:var(--ink);font-size:15px}.dc-stats .p b{color:var(--green)}.dc-stats .a b{color:var(--red)}.dc-stats .o b{color:var(--gold)}
.dc-warn{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;background:color-mix(in srgb,var(--gold) 12%,transparent);border:1px solid color-mix(in srgb,var(--gold) 45%,transparent);border-radius:11px;padding:11px 13px;font-size:13px}
.dc-note{background:var(--panel-2);border:1px solid var(--line);border-radius:10px;padding:9px 12px;font-size:12px;color:var(--ink-soft);line-height:1.5}
.dc-steps{display:flex;flex-direction:column;gap:8px}
.dc-step{background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:11px 13px}
.dc-step.off{opacity:.6}
.dc-step.done{border-color:color-mix(in srgb,var(--green) 50%,transparent)}
.dc-step.failed{border-color:color-mix(in srgb,var(--red) 55%,transparent)}
.dc-step.partial{border-color:color-mix(in srgb,var(--gold) 55%,transparent)}
.dc-chk{display:flex;align-items:center;gap:10px;cursor:pointer}
.dc-chk input{accent-color:var(--accent);width:16px;height:16px;flex:none}
.dc-t{font-size:13.5px;font-weight:600;flex:1}
.dc-badge{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;border-radius:20px;padding:2px 9px;border:1px solid var(--line-2);color:var(--dim)}
.dc-badge.done{color:var(--green);border-color:color-mix(in srgb,var(--green) 45%,transparent)}
.dc-badge.failed{color:var(--red);border-color:color-mix(in srgb,var(--red) 45%,transparent)}
.dc-badge.partial,.dc-badge.running{color:var(--gold);border-color:rgba(226,171,65,.45)}
.dc-d{margin:5px 0 0 26px;font-size:12px;color:var(--dim);line-height:1.5;word-break:break-word}
.dc-cats{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 0 26px}
.dc-cat{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;border:1px solid var(--line);border-radius:20px;padding:4px 10px;cursor:pointer;color:var(--dim)}
.dc-cat.on{color:var(--accent);border-color:var(--accent);background:var(--accent-soft)}
.dc-cat input{accent-color:var(--accent)}
.dc-link{background:none;border:none;padding:0;margin:6px 0 0 26px;color:var(--accent);font-size:12px;font-weight:600;cursor:pointer}
.dc-pre{margin:8px 0 0 26px;white-space:pre-wrap;font-family:var(--mono);font-size:11.5px;line-height:1.55;color:var(--ink-soft);background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:10px}
.dc-foot{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px}
.dc-sum{flex:1;font-size:12.5px;color:var(--ink-soft)}
.dc-confirm{display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;background:var(--accent-soft);border:1px solid var(--accent);border-radius:11px;padding:11px 13px;font-size:13px}
.dc-confirm span{flex:1}
.dc-btn{font-family:var(--sans);font-size:13px;font-weight:700;border-radius:10px;padding:9px 16px;cursor:pointer;border:1px solid var(--line-2);background:var(--panel);color:var(--ink)}
.dc-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.dc-btn.ghost{background:transparent}
.dc-btn:disabled{opacity:.5;cursor:default}
`;
