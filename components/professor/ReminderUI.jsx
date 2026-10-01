"use client";

// Reminder UI: toasts for alerts that have fired, and the bell + settings popover
// that lives in the checklist rail. State and timing live in lib/useReminders.
import { useEffect, useRef, useState } from "react";

export function ReminderToasts({ rem, onGoto }) {
  if (!rem.toasts.length) return null;
  return (
    <div className="rm-toasts" role="region" aria-label="Reminders" aria-live="polite">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {rem.toasts.map((t) => {
        const t0 = t.task || {};
        const canOpen = !!(t0.goto || t0.link);
        return (
          <div key={t.id} className={"rm-toast " + t.kind}>
            <div className="rm-ic" aria-hidden>{t.kind === "due" ? "⏰" : "🔔"}</div>
            <div className="rm-main">
              <div className="rm-text">{t.text}</div>
              <div className="rm-actions">
                {canOpen && (
                  <button className="rm-btn primary" onClick={() => { if (t0.goto) onGoto?.(t0.goto, t0.gotoSub); else window.open(t0.link, "_blank", "noopener,noreferrer"); rem.dismiss(t.id); }}>Open →</button>
                )}
                {t.key !== "test" && <button className="rm-btn" onClick={() => rem.snooze(t)}>Snooze 10 min</button>}
                <button className="rm-btn ghost" onClick={() => rem.dismiss(t.id)}>Dismiss</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ReminderBell({ rem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { settings: st, permission } = rem;

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const notifyHelp =
    permission === "unsupported" ? "This browser doesn't support desktop notifications."
    : permission === "denied" ? "Blocked — allow notifications for this site in your browser settings."
    : permission === "granted" ? "" : "Your browser will ask for permission.";

  return (
    <div className="rm-bell-wrap" ref={ref}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <button className={"rm-bell" + (st.enabled ? " on" : "")} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Reminder settings" title={st.enabled ? "Reminders on" : "Reminders off"}>
        {st.enabled ? "🔔" : "🔕"}
      </button>
      {open && (
        <div className="rm-pop" role="dialog" aria-label="Reminder settings">
          <div className="rm-pop-h">Deadline reminders</div>
          <label className="rm-row">
            <input type="checkbox" checked={st.enabled} onChange={(e) => rem.update({ enabled: e.target.checked })} />
            <span>Remind me about checklist deadlines</span>
          </label>
          <label className="rm-row sel">
            <span>Warn me</span>
            <select value={st.lead} disabled={!st.enabled} onChange={(e) => rem.update({ lead: +e.target.value })}>
              {[10, 15, 30, 60].map((m) => <option key={m} value={m}>{m} minutes before</option>)}
            </select>
          </label>
          <label className="rm-row">
            <input
              type="checkbox" checked={st.notify && permission === "granted"} disabled={!st.enabled || permission === "unsupported" || permission === "denied"}
              onChange={(e) => { if (!e.target.checked) rem.update({ notify: false }); else if (permission === "granted") rem.update({ notify: true }); else rem.requestPermission(); }}
            />
            <span>Desktop notifications</span>
          </label>
          {notifyHelp && <div className="rm-help">{notifyHelp}</div>}
          <label className="rm-row">
            <input type="checkbox" checked={st.speak} disabled={!st.enabled} onChange={(e) => rem.update({ speak: e.target.checked })} />
            <span>FRIDAY says it aloud</span>
          </label>
          <div className="rm-foot">
            <button className="rm-btn" onClick={() => { rem.testReminder(); setOpen(false); }}>Send a test</button>
          </div>
          <div className="rm-help">Works while the console is open in a browser tab (a background tab is fine).</div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.rm-toasts{position:fixed;top:74px;right:18px;z-index:66;display:flex;flex-direction:column;gap:10px;width:min(370px,calc(100vw - 36px));font-family:var(--sans)}
.rm-toast{display:flex;gap:11px;background:var(--panel);color:var(--ink);border:1px solid var(--line);border-left:4px solid var(--gold);border-radius:13px;padding:12px 13px;box-shadow:0 14px 40px rgba(0,0,0,.35);animation:rmin .25s ease-out}
.rm-toast.due{border-left-color:var(--red)}
@keyframes rmin{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.rm-toast{animation:none}}
.rm-ic{font-size:20px;line-height:1.2}
.rm-main{flex:1;min-width:0}
.rm-text{font-size:13px;font-weight:600;line-height:1.45}
.rm-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
.rm-btn{font-family:var(--sans);font-size:11.5px;font-weight:700;border:1px solid var(--line-2);background:var(--panel-2);color:var(--ink);border-radius:8px;padding:5px 10px;cursor:pointer}
.rm-btn:hover{border-color:var(--accent);color:var(--accent)}
.rm-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.rm-btn.primary:hover{color:#fff;filter:brightness(1.07)}
.rm-btn.ghost{background:transparent;color:var(--dim)}
.rm-bell-wrap{position:relative}
.rm-bell{width:30px;height:30px;border-radius:9px;border:1px solid var(--line);background:var(--panel-2);font-size:14px;cursor:pointer;line-height:1}
.rm-bell.on{border-color:color-mix(in srgb,var(--accent) 50%,transparent)}
.rm-bell:hover{border-color:var(--accent)}
.rm-pop{position:absolute;right:0;top:36px;z-index:40;width:270px;background:var(--panel);border:1px solid var(--line-2);border-radius:13px;box-shadow:0 18px 50px rgba(0,0,0,.35);padding:13px;display:flex;flex-direction:column;gap:9px;text-align:left}
.rm-pop-h{font-family:var(--serif);font-size:14px;font-weight:800}
.rm-row{display:flex;align-items:center;gap:9px;font-size:12.5px;color:var(--ink);cursor:pointer}
.rm-row input[type=checkbox]{accent-color:var(--accent);width:15px;height:15px;flex:none}
.rm-row.sel{justify-content:space-between}
.rm-row select{font-family:var(--sans);font-size:12px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line-2);border-radius:7px;padding:4px 6px}
.rm-help{font-size:11px;color:var(--dim);line-height:1.45}
.rm-foot{display:flex;gap:8px}
`;
