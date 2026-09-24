"use client";

import { createClient } from "@supabase/supabase-js";

// These are PUBLIC values (safe to ship in the browser). Row-Level Security,
// not secrecy, is what protects the data. Put them in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

// Resilient auth-token storage: localStorage first, but if it's full (e.g. the
// legacy attendance dashboard's `argus_dash_v1` blob fills the ~5MB quota) or
// unavailable (private mode), fall back to in-memory so sign-in still works for
// the session instead of throwing "exceeded the quota". Non-destructive — it
// never deletes other keys. On the server it returns undefined so supabase-js
// uses its own default.
function makeResilientStorage() {
  if (typeof window === "undefined") return undefined;
  const mem = new Map();
  return {
    getItem(key) {
      try {
        const v = window.localStorage.getItem(key);
        if (v !== null) return v;
      } catch { /* ignore */ }
      return mem.has(key) ? mem.get(key) : null;
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value);
        mem.delete(key);
      } catch {
        mem.set(key, value); // quota full / unavailable → keep session in memory
      }
    },
    removeItem(key) {
      try { window.localStorage.removeItem(key); } catch { /* ignore */ }
      mem.delete(key);
    },
  };
}

// A single shared client, or null when the keys aren't set yet (dev before setup).
export const supabase = supabaseConfigured
  ? createClient(url, anon, {
      auth: {
        storage: makeResilientStorage(),
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Bucket that stores the note files.
export const NOTES_BUCKET = "notes";
