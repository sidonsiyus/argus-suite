// Absentee emails — the categories, default wording and message-building shared by
// the Report tab ("Email absentees") and the Day-close flow. Pure functions: no
// network, no React, so both callers (and tests) behave identically.

export const ABSENTEE_CATS = [
  { k: "auth", label: "Authorized" },
  { k: "unauth", label: "Unauthorized" },
  { k: "groom", label: "Grooming" },
  { k: "susp", label: "Suspended" },
];
export const DEFAULT_ABSENTEE_CATS = { auth: true, unauth: true, groom: false, susp: false };

export const ABSENTEE_STATUS_WORD = { auth: "Authorized (informed)", unauth: "Unauthorized", groom: "Grooming", susp: "Suspended" };
export const ABSENTEE_DEFAULT_SUBJECT = "Attendance Notice — {date}";
export const ABSENTEE_DEFAULT_BODY = `Dear {name},

Our records show that you were marked absent ({status}) on {date}{reasonClause}.

If you believe this is an error, please contact your class in-charge at the earliest. Kindly ensure your attendance is regularised.

Regards,
{incharge}
{institution}`;

// Replace {placeholders}; unknown ones are left as-is so typos are visible.
export function fillTemplate(tpl, ctx) {
  return String(tpl).replace(/\{(\w+)\}/g, (_, k) => (k in ctx ? ctx[k] : `{${k}}`));
}

// Students marked with one of the chosen categories, with their email (may be "").
// recs: { student_id: { cat, reason, parent } }; cats: { auth: true, … }.
export function absenteeRecipients({ roster, recs, cats }) {
  const out = [];
  (roster || []).forEach((r) => {
    const cat = recs?.[r.id]?.cat;
    if (!cat || !cats?.[cat]) return;
    out.push({
      id: r.id, name: r.full_name, cat,
      email: String(r.email || "").trim(),
      status: ABSENTEE_STATUS_WORD[cat] || "Absent",
      reason: recs[r.id]?.reason || "",
    });
  });
  return out;
}

export function buildAbsenteeEmail(r, { subjectTpl = ABSENTEE_DEFAULT_SUBJECT, bodyTpl = ABSENTEE_DEFAULT_BODY, dateLabel = "", form = {} } = {}) {
  const ctx = {
    name: r.name, status: r.status, date: dateLabel,
    reason: r.reason || "",
    reasonClause: r.reason ? ` for the reason: ${r.reason}` : "",
    incharge: form?.incharge || "Class In-charge",
    institution: form?.institution || "",
  };
  return {
    to: r.email,
    subject: fillTemplate(subjectTpl, ctx).trim() || "Attendance Notice",
    text: fillTemplate(bodyTpl, ctx),
  };
}

// Everything needed to send: the emails for students who have an address, plus the
// students who were skipped because they have none.
export function buildAbsenteeItems({ roster, recs, cats, dateLabel, form, subjectTpl, bodyTpl }) {
  const recipients = absenteeRecipients({ roster, recs, cats });
  const withEmail = recipients.filter((r) => r.email);
  const missing = recipients.filter((r) => !r.email);
  return { recipients, withEmail, missing, items: withEmail.map((r) => buildAbsenteeEmail(r, { subjectTpl, bodyTpl, dateLabel, form })) };
}
