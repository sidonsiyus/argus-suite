"use client";

// Small presentational pieces for the tutor's voice features (mic, per-answer
// "Listen", read-aloud toggle). Logic lives in lib/tutor-voice; these only read
// the object returned by useTutorVoice(). Styled with the CSS variables that the
// NDT and GTEM themes both define (--red, --grad, --panel2, --line, …).

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

// Only rendered when the browser can do speech recognition (Chrome / Edge / Safari).
export function MicButton({ voice, disabled }) {
  if (!voice.supported) return null;
  return (
    <button
      type="button"
      className={"tv-mic" + (voice.listening ? " on" : "")}
      onClick={voice.toggleMic}
      disabled={disabled && !voice.listening}
      aria-pressed={voice.listening}
      aria-label={voice.listening ? "Stop listening" : "Ask by voice"}
      title={voice.listening ? "Tap to stop" : "Ask by voice"}
    >
      {voice.listening ? <span className="tv-stop" /> : <MicIcon />}
    </button>
  );
}

// Read one tutor answer aloud (or stop it).
export function SpeakButton({ voice, id, text }) {
  const speaking = voice.speakingId === id;
  return (
    <button
      type="button"
      className={"tv-speak" + (speaking ? " on" : "")}
      onClick={() => (speaking ? voice.stopSpeaking() : voice.speak(text, id))}
      aria-label={speaking ? "Stop reading this answer" : "Read this answer aloud"}
    >
      {speaking ? "■ Stop" : "🔊 Listen"}
    </button>
  );
}

// Read-answers-aloud toggle + any voice error / listening hint.
export function VoiceFoot({ voice }) {
  return (
    <div className="tv-foot">
      {voice.listening && <div className="tv-live" role="status"><i /> Listening… speak your doubt, then pause</div>}
      {voice.error && !voice.listening && (
        <div className="tv-err" role="alert">{voice.error} <button type="button" onClick={voice.clearError}>dismiss</button></div>
      )}
      <label className="tv-toggle">
        <input type="checkbox" checked={voice.autoSpeak} onChange={(e) => voice.setAutoSpeak(e.target.checked)} />
        <span>Read answers aloud</span>
      </label>
      {voice.supported && <span className="tv-hint">Questions asked by voice are always answered aloud.</span>}
    </div>
  );
}

export const TUTOR_VOICE_CSS = `
.tv-who{display:flex;align-items:center;gap:8px}
.tv-speak{border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:20px;padding:1px 8px;font-family:var(--mono);font-size:9px;letter-spacing:.04em;cursor:pointer;line-height:1.6}
.tv-speak:hover{color:var(--red);border-color:var(--red)}
.tv-speak.on{color:#fff;background:var(--red);border-color:var(--red)}
.tv-mic{flex:none;width:38px;height:38px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--line);background:var(--panel2);color:var(--ink);cursor:pointer;transition:border-color .15s,color .15s}
.tv-mic:hover:not(:disabled){border-color:var(--red);color:var(--red)}
.tv-mic:disabled{opacity:.45;cursor:default}
.tv-mic.on{background:var(--red);border-color:var(--red);color:#fff;animation:tvpulse 1.4s ease-out infinite}
.tv-stop{width:11px;height:11px;border-radius:2px;background:#fff;display:block}
@keyframes tvpulse{0%{box-shadow:0 0 0 0 var(--red-soft),0 0 0 0 rgba(255,255,255,0)}70%{box-shadow:0 0 0 10px transparent}100%{box-shadow:0 0 0 0 transparent}}
.tv-foot{display:flex;flex-direction:column;gap:5px;margin-top:8px}
.tv-live{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--red);font-weight:600}
.tv-live i{width:7px;height:7px;border-radius:50%;background:var(--red);animation:tvblink 1s infinite}
@keyframes tvblink{50%{opacity:.25}}
.tv-err{font-size:11px;line-height:1.45;color:var(--red)}
.tv-err button{background:none;border:none;color:var(--muted);font-size:10px;text-decoration:underline;cursor:pointer;padding:0 0 0 4px}
.tv-toggle{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--sub,var(--ink));cursor:pointer;user-select:none}
.tv-toggle input{accent-color:var(--red);cursor:pointer}
.tv-hint{font-size:10px;color:var(--muted);line-height:1.4}
@media(prefers-reduced-motion:reduce){.tv-mic.on,.tv-live i{animation:none}}
`;
