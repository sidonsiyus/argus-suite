"use client";

import { createClient } from "@supabase/supabase-js";

// These are PUBLIC values (safe to ship in the browser). Row-Level Security,
// not secrecy, is what protects the data. Put them in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

// A single shared client, or null when the keys aren't set yet (dev before setup).
export const supabase = supabaseConfigured ? createClient(url, anon) : null;

// Bucket that stores the note files.
export const NOTES_BUCKET = "notes";
