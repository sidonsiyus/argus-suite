// Server-side faculty gate for professor-console API routes.
//
// The instructor console signs in with the *browser* Supabase client, and its
// session token lives in localStorage (see lib/supabase.js) — not in cookies —
// so a route handler can't read it the usual SSR way. Instead the client sends
// its access token as `Authorization: Bearer <token>`, and we validate here that
// the token belongs to a real user AND that user passes `is_faculty()`.
//
// This matters: these routes hold a powerful mailbox token, so they must never
// act for a non-faculty caller.
import { createClient } from "@supabase/supabase-js";

export async function requireFaculty(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { ok: false, status: 503, error: "supabase_unconfigured" };

  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "no_token" };

  // A per-request client that carries the caller's token on every call, so both
  // getUser() and the is_faculty() RPC run as that user (RLS applies).
  const supabase = createClient(url, anon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) return { ok: false, status: 401, error: "invalid_token" };

  const { data: isFaculty, error: facErr } = await supabase.rpc("is_faculty");
  if (facErr) return { ok: false, status: 500, error: "faculty_check_failed" };
  if (!isFaculty) return { ok: false, status: 403, error: "not_faculty" };

  return { ok: true, user: userData.user };
}
