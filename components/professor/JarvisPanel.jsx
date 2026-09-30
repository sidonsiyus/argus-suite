"use client";

/*
 * JARVIS — the conversational assistant. A floating orb opens a panel where you
 * talk (push-to-talk) or type; JARVIS reads/edits the schedule, ticks checklist
 * tasks, and replies to the coordinator via the agent loop (lib/jarvis-agent).
 * Changes and emails are confirmed before they run — unless you've switched that
 * category to auto in settings (then a short cancel-countdown is the safety net).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runJarvis } from "@/lib/jarvis-agent";
import { speakJarvis, stopJarvis } from "@/lib/jarvis-voice";

const SETTINGS_KEY = "friday_auto_v1";
const DEFAULT_SETTINGS = { schedule: false, checklist: false, attendance: false, email: false, freeemail: false, bulkemail: false, countdown: true };

function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")) }; }
  catch { return { ...DEFAULT_SETTINGS }; }
}

const CAT_LABEL = { schedule: "schedule", checklist: "checklist", attendance: "attendance", email: "coordinator email", freeemail: "email to anyone", bulkemail: "bulk student emails" };

// The animated FRIDAY orb — layered, seamless, reactive to state.
function FridayOrb({ state = "idle", size = 58, letter = true, className = "" }) {
  return (
    <span className={`fr-orb fr-${state} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <span className="fr-spin" />
      <span className="fr-spin fr-spin2" />
      <span className="fr-pulse" />
      <span className="fr-pulse fr-pulse2" />
      <span className="fr-core" />
      {letter && <span className="fr-face">F</span>}
    </span>
  );
}

export default function JarvisPanel() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState([]);          // {role:"user"|"jarvis", text}
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | thinking | working | speaking | nomic
  const [listening, setListening] = useState(false);
  const [pending, setPending] = useState(null);  // { action, resolve }
  const [countdown, setCountdown] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const historyRef = useRef([]);
  const recRef = useRef(null);
  const timerRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => { setSettings(loadSettings()); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log, pending, status]);
  useEffect(() => () => { stopJarvis(); try { recRef.current?.abort?.(); } catch { /* ignore */ } }, []);

  function saveSettings(next) {
    setSettings(next);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }

  // ── confirmation gate handed to the agent ──
  const confirm = useCallback((action) => new Promise((resolve) => {
    // Auto + no countdown → run immediately.
    if (action.auto && settings.countdown === false) { resolve(true); return; }
    setPending({ action, resolve });
  }), [settings.countdown]);

  function clearPending() { setPending(null); setCountdown(0); if (timerRef.current) clearInterval(timerRef.current); }
  function resolvePending(val) { if (pending) { pending.resolve(val); clearPending(); } }

  // countdown for auto-approved actions
  useEffect(() => {
    if (!pending?.action?.auto) return;
    setCountdown(5);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current); pending.resolve(true); setPending(null); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [pending]);

  const onEvent = useCallback((e) => {
    if (e.type === "thinking") setStatus("thinking");
    else if (e.type === "tool") setStatus("working");
  }, []);

  const submit = useCallback(async (text) => {
    const t = String(text || "").trim();
    if (!t || busy) return;
    setInput("");
    setLog((l) => [...l, { role: "user", text: t }]);
    setBusy(true); setStatus("thinking");
    try {
      const { reply, history } = await runJarvis({ userText: t, history: historyRef.current, settings, confirm, onEvent });
      historyRef.current = history;
      if (reply) {
        setLog((l) => [...l, { role: "jarvis", text: reply }]);
        setStatus("speaking");
        await speakJarvis(reply);
      }
    } catch (e) {
      setLog((l) => [...l, { role: "jarvis", text: `Sorry Sir — ${e?.message || "something went wrong."}` }]);
    } finally {
      setBusy(false); setStatus("idle");
    }
  }, [busy, settings, confirm, onEvent]);

  // ── speech recognition (push to talk) ──
  function startListening() {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setStatus("nomic"); return; }
    stopJarvis();
    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-GB"; rec.interimResults = true; rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => { setListening(false); const t = finalText.trim(); if (t) submit(t); };
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  }
  function toggleMic() { if (listening) { try { recRef.current?.stop(); } catch { /* ignore */ } setListening(false); } else startListening(); }

  const statusText = useMemo(() => ({
    idle: listening ? "Listening…" : "Ready",
    thinking: "Thinking…",
    working: "Working…",
    speaking: "Speaking…",
    nomic: "Voice input isn't supported in this browser — type instead.",
  })[status] || "Ready", [status, listening]);

  const orbState = listening ? "listening" : (status === "thinking" || status === "working") ? "thinking" : status === "speaking" ? "speaking" : "idle";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {!open && (
        <button className="jv-launch" onClick={() => setOpen(true)} title="FRIDAY" aria-label="Open FRIDAY">
          <FridayOrb state="idle" size={60} />
        </button>
      )}

      {open && (
        <div className="jv-panel" role="dialog" aria-label="FRIDAY assistant">
          <div className="jv-head">
            <FridayOrb state={orbState} size={30} letter={false} className="fr-head-orb" />
            <b>FRIDAY</b>
            <span className="jv-status">{statusText}</span>
            <div className="jv-head-sp" />
            <button className="jv-icon" onClick={() => setShowSettings((s) => !s)} title="Auto-approve settings">⚙</button>
            <button className="jv-icon" onClick={() => { stopJarvis(); setOpen(false); }} title="Close">✕</button>
          </div>

          {showSettings && (
            <div className="jv-settings">
              <div className="jv-settings-h">Act without asking</div>
              <p className="jv-settings-lead">When on, JARVIS performs that kind of change hands-free (default: ask first).</p>
              {["schedule", "checklist", "attendance", "email", "freeemail", "bulkemail"].map((k) => (
                <label key={k} className="jv-toggle">
                  <input type="checkbox" checked={!!settings[k]} onChange={(e) => saveSettings({ ...settings, [k]: e.target.checked })} />
                  Auto {CAT_LABEL[k]} {k === "email" && <em>(sends the coordinator reply)</em>}{k === "bulkemail" && <em>(emails many students at once)</em>}
                </label>
              ))}
              <label className="jv-toggle">
                <input type="checkbox" checked={settings.countdown !== false} onChange={(e) => saveSettings({ ...settings, countdown: e.target.checked })} />
                Show a 5-second cancel countdown before an auto action
              </label>
            </div>
          )}

          <div className="jv-log" ref={logRef}>
            {log.length === 0 && (
              <div className="jv-hint">
                <div className="jv-hint-h">At your service, Boss.</div>
                Try: <i>“Give me a rundown of my day.”</i> · <i>“Add a GTEM class at 2 PM in room 706.”</i> · <i>“Mark Rakesh absent, unauthorized.”</i> · <i>“Tick the attendance message task.”</i> · <i>“Any coordinator emails? Reply that the report is submitted.”</i>
              </div>
            )}
            {log.map((m, i) => (
              <div key={i} className={"jv-msg " + m.role}>{m.text}</div>
            ))}

            {pending && (
              <div className="jv-confirm">
                <div className="jv-confirm-t">{pending.action.auto ? "Auto — about to:" : "Confirm:"}</div>
                <div className="jv-confirm-body">{pending.action.description}</div>
                <div className="jv-confirm-btns">
                  {pending.action.auto ? (
                    <>
                      <button className="jv-btn ghost" onClick={() => resolvePending(false)}>Cancel</button>
                      <button className="jv-btn primary" onClick={() => resolvePending(true)}>Do it now{countdown ? ` (${countdown})` : ""}</button>
                    </>
                  ) : (
                    <>
                      <button className="jv-btn ghost" onClick={() => resolvePending(false)}>No</button>
                      <button className="jv-btn primary" onClick={() => resolvePending(true)}>{pending.action.category === "email" ? "Send" : "Yes"}</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <form className="jv-input" onSubmit={(e) => { e.preventDefault(); submit(input); }}>
            <button type="button" className={"jv-mic" + (listening ? " on" : "")} onClick={toggleMic} title="Push to talk" aria-label="Push to talk">{listening ? "◉" : "🎙"}</button>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={busy ? "FRIDAY is working…" : "Ask FRIDAY…"} disabled={busy} />
            <button type="submit" className="jv-send" disabled={busy || !input.trim()}>↑</button>
          </form>
        </div>
      )}
    </>
  );
}

const CSS = `
/* ── FRIDAY animated orb ── */
.jv-launch{position:fixed;right:22px;bottom:22px;z-index:60;border:none;background:none;padding:0;cursor:pointer}
.fr-orb{position:relative;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;
  --f1:#ffd27a;--f2:#ff9d3c;--f3:#ff5e3a;--f4:#c81d5e;
  background:radial-gradient(circle at 50% 42%, var(--f1), var(--f2) 42%, var(--f3) 70%, var(--f4) 100%);
  box-shadow:0 8px 34px rgba(255,94,58,.5), inset 0 0 18px rgba(255,255,255,.28);isolation:isolate}
.jv-launch:hover .fr-orb{filter:brightness(1.07)}
.fr-spin{position:absolute;inset:-3px;border-radius:50%;background:conic-gradient(from 0deg, transparent, rgba(255,210,122,.9), transparent 40%, rgba(255,94,58,.85), transparent 70%);-webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));animation:frspin 5.5s linear infinite;opacity:.9}
.fr-spin2{inset:-7px;animation-duration:9s;animation-direction:reverse;opacity:.5}
.fr-pulse{position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(255,150,80,.55);animation:frpulse 3s ease-out infinite}
.fr-pulse2{animation-delay:1.5s}
.fr-core{position:absolute;inset:14%;border-radius:50%;background:radial-gradient(circle at 45% 38%, rgba(255,255,255,.75), rgba(255,180,120,.15) 55%, transparent 70%);animation:frbreathe 3.4s ease-in-out infinite}
.fr-face{position:relative;z-index:2;font-family:var(--serif);font-weight:800;font-size:20px;color:#fff;text-shadow:0 1px 6px rgba(120,20,10,.5);letter-spacing:.02em}
.fr-head-orb{box-shadow:0 3px 12px rgba(255,94,58,.5)}
@keyframes frspin{to{transform:rotate(360deg)}}
@keyframes frpulse{0%{transform:scale(1);opacity:.65}100%{transform:scale(1.6);opacity:0}}
@keyframes frbreathe{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.08);opacity:1}}
/* state reactivity */
.fr-idle .fr-spin{animation-duration:7s}
.fr-thinking .fr-spin{animation-duration:1.6s}
.fr-thinking{box-shadow:0 8px 34px rgba(255,94,58,.7), inset 0 0 18px rgba(255,255,255,.35)}
.fr-listening{--f1:#a7f3d0;--f2:#34d399;--f3:#0ea5e9;--f4:#2563eb;box-shadow:0 8px 34px rgba(14,165,233,.55), inset 0 0 18px rgba(255,255,255,.3)}
.fr-listening .fr-pulse{animation-duration:1.5s;border-color:rgba(52,211,153,.7)}
.fr-listening .fr-spin{animation-duration:2.4s}
.fr-speaking .fr-core{animation-duration:.7s}
.fr-speaking .fr-pulse{animation-duration:1.1s}
@media(prefers-reduced-motion:reduce){.fr-spin,.fr-spin2,.fr-pulse,.fr-core{animation:none}}
.jv-panel{position:fixed;right:22px;bottom:22px;z-index:61;width:min(390px,calc(100vw - 24px));height:min(560px,calc(100vh - 40px));display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:18px;box-shadow:0 24px 70px rgba(0,0,0,.35);overflow:hidden;font-family:var(--sans)}
.jv-head{display:flex;align-items:center;gap:9px;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--panel-2)}
.jv-head b{font-family:var(--serif);letter-spacing:.04em}
.jv-dot{width:9px;height:9px;border-radius:50%;background:var(--faint)}
.jv-dot.on{background:#4da3ff;box-shadow:0 0 10px #4da3ff;animation:jvblink 1s infinite}
@keyframes jvblink{50%{opacity:.35}}
.jv-status{font-family:var(--mono);font-size:10.5px;color:var(--dim)}
.jv-head-sp{flex:1}
.jv-icon{width:28px;height:28px;border-radius:8px;border:1px solid var(--line-2);background:var(--panel);color:var(--ink);cursor:pointer;font-size:13px}
.jv-icon:hover{border-color:var(--accent);color:var(--accent)}
.jv-settings{padding:12px 14px;border-bottom:1px solid var(--line);background:var(--panel-2)}
.jv-settings-h{font-weight:700;font-size:13px;margin-bottom:3px}
.jv-settings-lead{font-size:11.5px;color:var(--dim);margin:0 0 9px}
.jv-toggle{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--ink);padding:4px 0}
.jv-toggle input{accent-color:var(--accent)}
.jv-toggle em{color:var(--gold);font-style:normal;font-size:11px}
.jv-log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.jv-hint{font-size:12.5px;color:var(--dim);line-height:1.6}
.jv-hint-h{font-family:var(--serif);font-size:15px;color:var(--ink);margin-bottom:6px}
.jv-hint i{color:var(--ink-soft)}
.jv-msg{max-width:85%;font-size:13.5px;line-height:1.5;padding:9px 12px;border-radius:12px;white-space:pre-wrap;word-break:break-word}
.jv-msg.user{align-self:flex-end;background:var(--accent);color:#fff;border-bottom-right-radius:4px}
.jv-msg.jarvis{align-self:flex-start;background:var(--panel-2);border:1px solid var(--line);color:var(--ink);border-bottom-left-radius:4px}
.jv-confirm{align-self:stretch;background:var(--accent-soft);border:1px solid var(--accent);border-radius:12px;padding:11px 12px}
.jv-confirm-t{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:5px}
.jv-confirm-body{font-size:13px;color:var(--ink);white-space:pre-wrap;line-height:1.45;margin-bottom:10px}
.jv-confirm-btns{display:flex;justify-content:flex-end;gap:8px}
.jv-btn{font-family:var(--sans);font-size:12.5px;font-weight:600;border-radius:9px;padding:7px 14px;cursor:pointer;border:1px solid var(--line-2);background:var(--panel);color:var(--ink)}
.jv-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.jv-btn.ghost:hover{border-color:var(--accent)}
.jv-input{display:flex;align-items:center;gap:8px;padding:11px 12px;border-top:1px solid var(--line)}
.jv-mic{flex:none;width:40px;height:40px;border-radius:50%;border:1px solid var(--line-2);background:var(--panel-2);color:var(--ink);cursor:pointer;font-size:16px}
.jv-mic.on{background:#e5484d;border-color:#e5484d;color:#fff;animation:jvblink 1s infinite}
.jv-input input{flex:1;min-width:0;font-family:var(--sans);font-size:14px;color:var(--ink);background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:11px 13px;outline:none}
.jv-input input:focus{border-color:var(--accent)}
.jv-send{flex:none;width:40px;height:40px;border-radius:50%;border:none;background:var(--accent);color:#fff;font-size:17px;font-weight:800;cursor:pointer}
.jv-send:disabled{opacity:.45;cursor:default}
@media(max-width:520px){.jv-panel{right:8px;bottom:8px}.jv-orb{right:14px;bottom:14px}}
`;
