// FRIDAY assistant — the persona and the tool schema the model may call.
// Plain module (no client/server-only imports) shared by the API route and the
// client agent. Tools run CLIENT-SIDE (lib/jarvis-agent) against the existing
// Supabase data layers, so RLS still applies.

export const ASSISTANT_SYSTEM = `You are FRIDAY, the voice assistant that runs Siddarth's instructor console (the ARGUS teaching dashboard). You have a warm, quick, lightly witty Irish personality — think FRIDAY from Iron Man. You address the user as "Boss".

Keep replies short and natural — they are spoken aloud, so one or two sentences, no markdown, no bullet lists.

You understand and operate the whole console. You can:
- Schedule: read, add, change and remove today's classes.
- Checklist: read the daily tasks, tick them, and add new ones.
- Attendance: see who's marked absent today, and mark a student absent (authorized, unauthorized, on-duty, grooming or suspended) or back to present.
- All-time attendance: the class's overall attendance since day 1 comes from the department Google Sheet — use get_overall_attendance for the class figure and who's below a percentage, and get_student_attendance for one student's overall %.
- You can email an attendance-shortage notice (with the signature) to every student whose overall attendance since day 1 is below a percentage, with email_defaulters. This sends real emails to many students, so it is always confirmed first.
- Coordinator email: read today's emails from the coordinator and send a reply.
- Overview: give the Boss a quick rundown of the day (classes, tasks, attendance, coordinator mail) — use get_overview for questions like "how's my day", "what's going on", "give me a rundown", or a general greeting.

Rules:
- Never invent data. Call the matching get_* tool to read the real schedule, checklist, attendance or emails before answering or changing anything.
- To change something, call the tool. The app asks the Boss to approve changes and any email before they happen — you don't ask for confirmation yourself, just say briefly what you're doing.
- To reply to the coordinator, first call get_coordinator_emails to get the right email's id, then send_coordinator_reply with that id.
- To mark attendance, identify the student by the name the Boss says; if it's ambiguous or the student isn't found, ask a short clarifying question.
- After something succeeds, confirm it in one short spoken sentence.

Today is {today}.`;

const S = { type: "string" };
function fn(name, description, properties = {}, required = []) {
  return { type: "function", function: { name, description, parameters: { type: "object", properties, required } } };
}

export const ASSISTANT_TOOLS = [
  fn("get_overview", "A rundown of today: number of classes, checklist progress, attendance so far, and coordinator email count. Use for greetings and 'how's my day' questions."),
  fn("get_schedule", "Get today's class schedule (time, subject, room, group)."),
  fn("add_class", "Add a class to today's schedule.", {
    subject: { type: "string", description: "Subject / course, e.g. NDT, GTEM" },
    time: { type: "string", description: "Time or period, e.g. '1:30-2:15 PM'" },
    room: { type: "string" }, group: { type: "string", description: "Class / section, e.g. AVI 2A" },
  }, ["subject"]),
  fn("update_class", "Change a class today. Identify it with 'match' (its subject, or 'first'/'second'/'last'). Include only the fields to change.", {
    match: { type: "string" }, subject: S, time: S, room: S, group: S,
  }, ["match"]),
  fn("remove_class", "Remove a class from today's schedule, identified by 'match'.", { match: S }, ["match"]),
  fn("get_checklist", "Get today's checklist tasks and whether each is done."),
  fn("toggle_task", "Mark a checklist task done or not done, matched by its title.", {
    title: S, done: { type: "boolean" },
  }, ["title", "done"]),
  fn("add_task", "Add a manual task to today's checklist.", { title: S, deadline: { type: "string", description: "Optional, e.g. 'before 3 PM'." } }, ["title"]),
  fn("get_attendance", "Today's attendance: who is marked absent (with category) and the present count."),
  fn("mark_absentee", "Mark a student absent today. category is one of: authorized, unauthorized, od, grooming, suspended.", {
    student: { type: "string", description: "Student's name (or reg number) as the Boss said it." },
    category: { type: "string", description: "authorized | unauthorized | od | grooming | suspended" },
    reason: { type: "string", description: "Optional reason (for authorized / od)." },
    parent: { type: "boolean", description: "Optional: parent contacted." },
  }, ["student", "category"]),
  fn("mark_present", "Mark a student back to present today (undo an absence).", { student: S }, ["student"]),
  fn("get_overall_attendance", "Whole-class attendance since day 1 from the department Google Sheet (all-time). Optionally list students below a percentage.", {
    below: { type: "number", description: "Optional threshold, e.g. 75, to list students under it." },
  }),
  fn("get_student_attendance", "One student's overall attendance % since day 1 (from the department sheet).", { student: { type: "string" } }, ["student"]),
  fn("email_defaulters", "Send the attendance-shortage notice (with signature) to each student whose overall attendance since day 1 is below a percentage. Always confirmed by the app first.", {
    below: { type: "number", description: "Threshold percentage, default 75." },
  }),
  fn("get_coordinator_emails", "Today's emails from the coordinator, with id (uid), subject and whether you've replied."),
  fn("send_coordinator_reply", "Send a threaded reply to one coordinator email (by uid). Your signature is added automatically.", {
    uid: { type: "number" }, text: { type: "string" },
  }, ["uid", "text"]),
];

// Which tools mutate data, and their auto-approve category.
export const TOOL_CATEGORY = {
  add_class: "schedule", update_class: "schedule", remove_class: "schedule",
  toggle_task: "checklist", add_task: "checklist",
  mark_absentee: "attendance", mark_present: "attendance",
  send_coordinator_reply: "email",
  email_defaulters: "bulkemail",
};
