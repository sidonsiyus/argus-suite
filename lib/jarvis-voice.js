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

// Describe one class as a natural clause: "NDT with AVI 2A at 1:30 PM, in room 706".
function classPhrase(c) {
  const subj = c.subject || "a class";
  const grp = c.group ? ` with ${c.group}` : "";
  const time = c.time ? ` at ${speakTime(c.time)}` : "";
  const room = c.room ? `, in room ${c.room}` : "";
  return `${subj}${grp}${time}${room}`;
}

// Compose the JARVIS morning briefing — conversational, so the voice reads it
// naturally (contractions, commas for pacing; the TTS route adds the prosody).
export function buildBriefing(entries, { greeting = "Good morning", honorific = "Boss" } = {}) {
  const classes = (entries || []).filter((e) => e.subject || e.time);
  if (!classes.length) {
    return `${greeting}, ${honorific}. You don't have any classes scheduled today. Enjoy the day.`;
  }
  if (classes.length === 1) {
    return `${greeting}, ${honorific}. Here's your day. Your only class is ${classPhrase(classes[0])}. That's it — have a productive day, ${honorific}.`;
  }
  const n = classes.length;
  let s = `${greeting}, ${honorific}. Here's your schedule for the day. You have ${n} classes. `;
  classes.forEach((c, i) => {
    const lead = i === 0 ? "First up is" : i === n - 1 ? "And lastly," : i === 1 ? "After that," : "Then,";
    s += `${lead} ${classPhrase(c)}. `;
  });
  return s + `That's everything — have a productive day, ${honorific}.`;
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
    const pick = voices.find((v) => /emily|orla|siobhan|ireland|irish/i.test(`${v.name} ${v.lang}`))
      || voices.find((v) => /en-IE/i.test(v.lang))
      || voices.find((v) => /female|samantha|karen|moira|fiona|serena/i.test(v.name))
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
