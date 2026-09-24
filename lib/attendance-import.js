"use client";

// Professor console — one-time import of the legacy ARGUS attendance backup
// (roster + per-day absentees, incl. history) into the Supabase attendance
// model. Matches backup students to the roster by reg number, else by name.

const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

// legacy status → new category
const STATUS_MAP = {
  informed: "auth", authorized: "auth",
  unauthorized: "unauth", unauth: "unauth",
  od: "od",
  groom: "groom", grooming: "groom",
  susp: "susp", suspended: "susp",
};

// Build a per-day plan: everyone present, overridden by that day's absentees.
export function planImport(backup, roster) {
  const byName = new Map(), byReg = new Map();
  roster.forEach((r) => {
    byName.set(norm(r.full_name), r);
    if (r.reg_no) byReg.set(String(r.reg_no).trim(), r);
  });
  const match = (a) => (a.reg && byReg.get(String(a.reg).trim())) || byName.get(norm(a.name)) || null;

  // dedupe days by date (last occurrence wins)
  const dayMap = new Map();
  const push = (date, absentees) => { if (date) dayMap.set(date, absentees || []); };
  push(backup?.params?.pDate, backup?.absentees);
  (backup?.history || []).forEach((h) => push(h?.params?.pDate, h?.absentees));

  const unmatched = new Set();
  const days = [];
  for (const [day, absentees] of dayMap) {
    const entries = {};
    roster.forEach((r) => { entries[r.id] = { cat: "present", reason: "", parent: false }; });
    absentees.forEach((a) => {
      const stu = match(a);
      if (!stu) { unmatched.add(a.name); return; }
      const cat = STATUS_MAP[String(a.status || "").toLowerCase()] || "unauth";
      entries[stu.id] = { cat, reason: a.reason || "", parent: a.parent === "Y" || a.parent === true };
    });
    days.push({ day, entries, absentCount: absentees.length });
  }
  days.sort((a, b) => (a.day < b.day ? -1 : 1));
  return { days, unmatched: [...unmatched] };
}
