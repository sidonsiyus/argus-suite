"use client";

// JARVIS voice — builds the spoken briefing and plays it. Speech comes from the
// server TTS route (Fish Audio / Edge neural voice); if that's unavailable it
// falls back to the browser's own speech synthesis so it never goes silent.
import { supabase } from "@/lib/supabase";

// "01.30-2.15" → "1:30 PM" (afternoon classes 1–7 read as PM, matching lib/tasks).
function speakTime(timeStr) {
  const start = String(timeStr || "").split("-")[0].trim();
  const m = start.match(/(\d{1,2})[.:](\d{2})/);
  if (!m) return start;
  let h = +m[1];
  const min = m[2];
  const ampm = h >= 1 && h <= 7 ? "PM" : h === 12 ? "PM" : "AM";
  return `${h}:${min} ${ampm}`;
}

// Compose the JARVIS morning briefing from today's schedule entries.
export function buildBriefing(entries, { greeting = "Good morning", honorific = "Sir" } = {}) {
  const classes = (entries || []).filter((e) => e.subject || e.time);
  if (!classes.length) {
    return `${greeting}, ${honorific}. You have no classes scheduled today. Have a productive day.`;
  }
  let s = `${greeting}, ${honorific}. Here is your schedule for the day. You have ${classes.length} ${classes.length === 1 ? "class" : "classes"}. `;
  classes.forEach((c, i) => {
    const lead = i === 0 ? "First" : i === classes.length - 1 ? "And finally" : "Then";
    const subj = c.subject || "a class";
    const grp = c.group ? ` with ${c.group}` : "";
    const time = c.time ? ` at ${speakTime(c.time)}` : "";
    const room = c.room ? `, in room ${c.room}` : "";
    s += `${lead}, ${subj}${grp}${time}${room}. `;
  });
  return s + `Have a productive day, ${honorific}.`;
}

let currentAudio = null;

export function stopJarvis() {
  try { if (currentAudio) { currentAudio.pause(); currentAudio = null; } } catch { /* ignore */ }
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

function browserSpeak(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return false;
    const u = new SpeechSynthesisUtterance(text);
    // Prefer a deep British male voice if the OS has one.
    const voices = synth.getVoices() || [];
    const pick = voices.find((v) => /ryan|daniel|arthur|george|uk english male|british/i.test(`${v.name} ${v.lang}`))
      || voices.find((v) => /en-GB/i.test(v.lang)) || null;
    if (pick) u.voice = pick;
    u.rate = 1; u.pitch = 1;
    synth.speak(u);
    return true;
  } catch { return false; }
}

// Speak the given text. Returns which engine was used ("fish"/"edge"/"browser").
export async function speakJarvis(text) {
  stopJarvis();
  const clean = String(text || "").trim();
  if (!clean) return null;

  try {
    let token = "";
    try { token = (await supabase.auth.getSession()).data?.session?.access_token || ""; } catch { /* not signed in */ }
    const res = await fetch("/api/professor/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ text: clean }),
    });
    if (res.ok) {
      const provider = res.headers.get("X-TTS-Provider") || "server";
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
      return provider;
    }
  } catch { /* fall through to browser speech */ }

  return browserSpeak(clean) ? "browser" : null;
}
