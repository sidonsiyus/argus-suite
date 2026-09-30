"use client";

/*
 * Voice for the AI tutors (NDT + GTEM).
 *   • Listening: the browser's SpeechRecognition (Chrome / Edge / Safari), set to
 *     Indian English. Push-to-talk: tap the mic, speak, it sends when you stop.
 *   • Speaking: a natural neural voice from /api/tutor-tts (chunked by sentence,
 *     with the next chunk fetched while the current one plays). If that's
 *     unavailable it falls back to the browser's own voice.
 * Everything is interruptible: starting the mic, tapping stop, or asking again
 * silences the current reply (which also stops it from "hearing itself").
 */
import { useCallback, useEffect, useRef, useState } from "react";

const AUTOSPEAK_KEY = "tutor_voice_autospeak_v1";
const CHUNK_MAX = 500;      // chars per later TTS request (server caps at 1200)
const FIRST_CHUNK_MAX = 220; // the first one is small so speech starts fast

// Markdown → plain spoken text (no "asterisk asterisk", no bullet glyphs, no URLs).
export function toSpeech(md) {
  return String(md || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[|>#*_~^]/g, " ")
    .replace(/\s*\n\s*/g, ". ")
    .replace(/\.\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Split into chunks for TTS. The FIRST chunk is kept small so speech starts
// quickly (synthesis time grows with length: ~1.6 s for 260 chars vs ~6 s for
// 1000); later chunks can be larger because they're fetched while the previous
// one plays. Breaks on sentence ends, then commas, then spaces.
export function splitForSpeech(text, max = CHUNK_MAX, firstMax = FIRST_CHUNK_MAX) {
  const out = [];
  let cur = "";
  const limit = () => (out.length === 0 ? firstMax : max);
  const sentences = String(text || "").match(/[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g) || [];

  // where to cut a too-long run: last comma/semicolon in the back half, else last space
  const cutPoint = (str, lim) => {
    const head = str.slice(0, lim + 1);
    const soft = Math.max(head.lastIndexOf(", "), head.lastIndexOf("; "), head.lastIndexOf(": "));
    if (soft >= lim * 0.5) return soft + 1;
    const sp = head.lastIndexOf(" ");
    return sp > 0 ? sp : lim;
  };

  for (const raw of sentences) {
    let s = raw;
    while (s.length > limit()) {
      if (cur) { out.push(cur.trim()); cur = ""; continue; } // flush, then re-check against the new limit
      const cut = cutPoint(s, limit());
      out.push(s.slice(0, cut).trim());
      s = s.slice(cut);
    }
    if ((cur + s).length > limit()) { out.push(cur.trim()); cur = s; } else cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

export function recognitionSupported() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

async function fetchChunk(text, module) {
  try {
    const r = await fetch("/api/tutor-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, module }),
    });
    if (!r.ok) return null;
    return URL.createObjectURL(await r.blob());
  } catch { return null; }
}

export function useTutorVoice({ heardRef, module = "ndt", lang = "en-IN" } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [speakingId, setSpeakingId] = useState(null);
  const [error, setError] = useState("");
  const [autoSpeak, setAutoSpeakState] = useState(false);

  const recRef = useRef(null);
  const audioRef = useRef(null);
  const token = useRef(0); // bumped to cancel whatever is currently being spoken
  const mounted = useRef(true); // a late answer arriving after the student left must stay silent

  useEffect(() => {
    mounted.current = true;
    setSupported(recognitionSupported());
    try { setAutoSpeakState(localStorage.getItem(AUTOSPEAK_KEY) === "1"); } catch { /* storage blocked */ }
  }, []);

  const setAutoSpeak = useCallback((v) => {
    setAutoSpeakState(!!v);
    try { localStorage.setItem(AUTOSPEAK_KEY, v ? "1" : "0"); } catch { /* ignore */ }
  }, []);

  const stopSpeaking = useCallback(() => {
    token.current += 1;
    try { audioRef.current?.pause(); } catch { /* ignore */ }
    audioRef.current = null;
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    setSpeakingId(null);
  }, []);

  const playUrl = useCallback((url, my) => new Promise((resolve) => {
    const a = new Audio(url);
    audioRef.current = a;
    const done = () => { try { URL.revokeObjectURL(url); } catch { /* ignore */ } resolve(); };
    a.onended = done; a.onerror = done; a.onpause = done;
    if (my !== token.current) { done(); return; }
    a.play().catch(done);
  }), []);

  const browserSpeak = useCallback((text, my) => new Promise((resolve) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth || my !== token.current) { resolve(); return; }
      const u = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices() || [];
      const v = voices.find((x) => /en-IN/i.test(x.lang)) || voices.find((x) => /en-GB/i.test(x.lang)) || voices.find((x) => /^en/i.test(x.lang));
      if (v) u.voice = v;
      u.rate = 1;
      u.onend = () => resolve(); u.onerror = () => resolve();
      synth.speak(u);
    } catch { resolve(); }
  }), []);

  // Speak `text` (markdown ok). `id` marks which message is being read.
  const speak = useCallback(async (text, id) => {
    if (!mounted.current) return;
    stopSpeaking();
    const chunks = splitForSpeech(toSpeech(text));
    if (!chunks.length) return;
    const my = token.current;
    setSpeakingId(id ?? "x");
    try {
      let next = fetchChunk(chunks[0], module);
      const release = (p) => p.then((u) => { if (u) URL.revokeObjectURL(u); });
      for (let i = 0; i < chunks.length; i++) {
        const current = next;
        const hasMore = i + 1 < chunks.length;
        if (hasMore) next = fetchChunk(chunks[i + 1], module); // prefetch while this plays
        const url = await current;
        if (my !== token.current) { if (url) URL.revokeObjectURL(url); if (hasMore) release(next); return; } // interrupted
        if (!url) { if (hasMore) release(next); await browserSpeak(chunks.slice(i).join(" "), my); break; } // server voice unavailable
        await playUrl(url, my);
        if (my !== token.current) { if (hasMore) release(next); return; } // interrupted mid-chunk
      }
    } finally {
      if (my === token.current) setSpeakingId(null);
    }
  }, [module, stopSpeaking, playUrl, browserSpeak]);

  const stopListening = useCallback(() => { try { recRef.current?.stop(); } catch { /* ignore */ } }, []);

  const startListening = useCallback(() => {
    const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) { setError("Voice input isn't supported in this browser — try Chrome or Edge, or type your question."); return; }
    stopSpeaking(); // never listen to our own voice
    setError("");
    const rec = new SR();
    recRef.current = rec;
    rec.lang = lang; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript; else live += r[0].transcript;
      }
      setInterim((finalText + live).trim());
    };
    rec.onerror = (e) => {
      const code = e?.error;
      if (code === "not-allowed" || code === "service-not-allowed") setError("Microphone access is blocked — allow it in your browser's site settings, then try again.");
      else if (code === "no-speech") setError("I didn't catch anything — tap the mic and try again.");
      else if (code === "audio-capture") setError("No microphone was found.");
      else if (code === "network") setError("Voice recognition needs an internet connection.");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      const t = finalText.trim();
      if (t) heardRef?.current?.(t);
    };
    setListening(true);
    try { rec.start(); } catch { setListening(false); }
  }, [lang, heardRef, stopSpeaking]);

  const toggleMic = useCallback(() => { if (listening) stopListening(); else startListening(); }, [listening, startListening, stopListening]);

  useEffect(() => () => { // unmount: go quiet, and stay quiet
    mounted.current = false;
    token.current += 1;
    try { recRef.current?.abort?.(); } catch { /* ignore */ }
    try { audioRef.current?.pause(); } catch { /* ignore */ }
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  }, []);

  return { supported, listening, interim, speakingId, error, autoSpeak, setAutoSpeak, toggleMic, speak, stopSpeaking, clearError: () => setError("") };
}
