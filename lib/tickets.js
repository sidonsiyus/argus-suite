"use client";

// Bug reports / tickets — faculty-only reads & updates (RLS). Public inserts
// happen server-side in /api/report-bug.
import { supabase, supabaseConfigured } from "@/lib/supabase";

export async function getTickets({ status } = {}) {
  if (!supabaseConfigured || !supabase) return [];
  let q = supabase
    .from("bug_reports")
    .select("id, created_at, message, page, email, user_agent, status, resolved_at")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function setTicketStatus(id, status) {
  const { data: auth } = await supabase.auth.getUser();
  const patch = status === "resolved"
    ? { status, resolved_at: new Date().toISOString(), resolved_by: auth?.user?.id ?? null }
    : { status: "open", resolved_at: null, resolved_by: null };
  const { error } = await supabase.from("bug_reports").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteTicket(id) {
  const { error } = await supabase.from("bug_reports").delete().eq("id", id);
  if (error) throw error;
}
