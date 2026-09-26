// JARVIS assistant — the system persona and the tool schema the model may call.
// Plain module (no client/server-only imports) so both the API route and the
// client agent can share it. Tools are executed CLIENT-SIDE (see lib/jarvis-agent)
// against the existing Supabase data layers, so RLS still applies.

export const ASSISTANT_SYSTEM = `You are JARVIS, the voice assistant inside Siddarth's instructor console.
You address the user as "Sir". Be concise and warm — your replies are spoken aloud, so keep them to a sentence or two, no markdown, no lists.

You can read and change the user's day using the provided tools:
- the class schedule (add / change / remove classes),
- the daily checklist (tick tasks, add tasks),
- the coordinator's emails (read them, and send a reply).

Rules:
- Never invent data. Call a get_* tool to read the current schedule, checklist or emails before answering questions about them or changing them.
- To change something, call the matching tool. The app will ask the user to approve changes and any email before they actually happen — you don't need to ask for confirmation yourself, just say briefly what you're about to do.
- When sending a coordinator reply, first call get_coordinator_emails to find the right email's id, then call send_coordinator_reply with that id and your drafted message.
- If a request is ambiguous (e.g. which class to change), ask a short clarifying question instead of guessing.
- After an action succeeds, confirm it in one short spoken sentence.

Today is {today}.`;

export const ASSISTANT_TOOLS = [
  { type: "function", function: {
    name: "get_schedule",
    description: "Get today's class schedule (list of classes with time, subject, room, group).",
    parameters: { type: "object", properties: {}, required: [] },
  } },
  { type: "function", function: {
    name: "add_class",
    description: "Add a class to today's schedule.",
    parameters: { type: "object", properties: {
      subject: { type: "string", description: "Subject / course name, e.g. NDT, GTEM" },
      time: { type: "string", description: "Time or period, e.g. '1:30-2:15 PM'" },
      room: { type: "string", description: "Room or venue" },
      group: { type: "string", description: "Class / section, e.g. AVI 2A" },
    }, required: ["subject"] },
  } },
  { type: "function", function: {
    name: "update_class",
    description: "Change an existing class today. Identify it with 'match' (its subject, or an ordinal like 'first'/'second'/'last'). Only include the fields to change.",
    parameters: { type: "object", properties: {
      match: { type: "string", description: "Which class to change: a subject substring, or 'first'/'second'/'last'." },
      subject: { type: "string" }, time: { type: "string" }, room: { type: "string" }, group: { type: "string" },
    }, required: ["match"] },
  } },
  { type: "function", function: {
    name: "remove_class",
    description: "Remove a class from today's schedule, identified by 'match' (subject or ordinal).",
    parameters: { type: "object", properties: { match: { type: "string" } }, required: ["match"] },
  } },
  { type: "function", function: {
    name: "get_checklist",
    description: "Get today's checklist tasks and whether each is done.",
    parameters: { type: "object", properties: {}, required: [] },
  } },
  { type: "function", function: {
    name: "toggle_task",
    description: "Mark a checklist task done or not done, matched by its title.",
    parameters: { type: "object", properties: {
      title: { type: "string", description: "The task title or a distinctive part of it." },
      done: { type: "boolean", description: "true to tick it, false to untick." },
    }, required: ["title", "done"] },
  } },
  { type: "function", function: {
    name: "add_task",
    description: "Add a manual task to today's checklist.",
    parameters: { type: "object", properties: {
      title: { type: "string" }, deadline: { type: "string", description: "Optional, e.g. 'before 3 PM'." },
    }, required: ["title"] },
  } },
  { type: "function", function: {
    name: "get_coordinator_emails",
    description: "Get today's emails from the coordinator, with their id (uid), subject and whether you've replied.",
    parameters: { type: "object", properties: {}, required: [] },
  } },
  { type: "function", function: {
    name: "send_coordinator_reply",
    description: "Send a threaded reply to one coordinator email (identified by uid). Your signature is added automatically.",
    parameters: { type: "object", properties: {
      uid: { type: "number", description: "The email's uid from get_coordinator_emails." },
      text: { type: "string", description: "The reply body." },
    }, required: ["uid", "text"] },
  } },
];

// Which tools mutate data, and under which auto-approve category they fall.
export const TOOL_CATEGORY = {
  add_class: "schedule", update_class: "schedule", remove_class: "schedule",
  toggle_task: "checklist", add_task: "checklist",
  send_coordinator_reply: "email",
};
