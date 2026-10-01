"use client";

/*
 * Checklist deadline reminders for the console. Every 30 s (and when the tab regains
 * focus) it reads today's checklist, asks lib/reminders which alerts are due, and
 * shows each one as an in-app toast — plus, if enabled, a desktop notification and
 * FRIDAY saying it aloud. Fired alerts and snoozes are remembered per day, so
 * reloading the page doesn't replay them.
 *
 * Limits worth knowing: this runs inside the open console tab (a background tab is
 * fine, a closed one isn't) — there is no server-side push.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { getTasks } from "@/lib/tasks";
import { buildReminderTasks, computeAlerts, spokenBatch } from "@/lib/reminders";
import { speakJarvis } from "@/lib/jarvis-voice";

const SETTINGS_KEY = "reminders_v1";
const FIRED_KEY = (day) => `reminders_fired_v1_${day}`;
const SNOOZE_KEY = "reminders_snooze_v1";
const DEFAULTS = { enabled: true, notify: false, speak: false, lead: 30 };
const TICK_MS = 30000;
const SNOOZE_MIN = 10;

const dayOf = (d) => d.toLocaleDateString("en-CA");
const read = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } };

export function useReminders({ schedule, coordinator, nowFn } = {}) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [toasts, setToasts] = useState([]);
  const [permission, setPermission] = useState("default"); // default | granted | denied | unsupported

  const latest = useRef({});
  latest.current = { settings, schedule, coordinator, nowFn: nowFn || (() => new Date()), permission };
  const fired = useRef({ day: "", ids: new Set() });
  const snoozed = useRef({}); // id -> { until, alert }

  useEffect(() => {
    setSettings({ ...DEFAULTS, ...read(SETTINGS_KEY, {}) });
    snoozed.current = read(SNOOZE_KEY, {});
    setPermission(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  const update = useCallback((patch) => {
    setSettings((s) => { const next = { ...s, ...patch }; write(SETTINGS_KEY, next); return next; });
  }, []);

  const show = useCallback((alerts) => {
    const { settings: st, permission: perm } = latest.current;
    // a "due" alert replaces the earlier "due in N minutes" toast for the same task
    setToasts((cur) => [
      ...cur.filter((x) => !alerts.some((a) => a.kind === "due" && a.key === x.key)),
      ...alerts.filter((a) => !cur.some((x) => x.id === a.id)),
    ]);
    if (st.notify && perm === "granted") {
      alerts.forEach((a) => {
        try {
          const n = new Notification("ARGUS · Reminder", { body: a.text, tag: a.id });
          n.onclick = () => { try { window.focus(); } catch { /* ignore */ } };
        } catch { /* notification blocked */ }
      });
    }
    if (st.speak) speakJarvis(spokenBatch(alerts)).catch(() => {});
  }, []);

  const checkNow = useCallback(async () => {
    const { settings: st, schedule: sc, coordinator: co, nowFn: nf } = latest.current;
    if (!st.enabled) return;
    const now = nf();
    const day = dayOf(now);
    if (fired.current.day !== day) fired.current = { day, ids: new Set(read(FIRED_KEY(day), [])) };

    let rows = [];
    try { rows = await getTasks(day); } catch { /* checklist table missing → fixed tasks only */ }
    const tasks = buildReminderTasks({ rows, schedule: sc || [], coordinator: co });
    const alerts = computeAlerts({ tasks, now, day, leadMin: st.lead, fired: fired.current.ids });

    // snoozed alerts whose time has come (and whose task is still open)
    const nowMs = now.getTime();
    Object.entries(snoozed.current).forEach(([id, s]) => {
      if (s.until > nowMs) return;
      delete snoozed.current[id];
      const task = tasks.find((x) => x.key === s.alert.key);
      if (task && !task.done) alerts.push({ ...s.alert, id: `${id}|again${nowMs}`, text: `Reminder: ${s.alert.text}`, spoken: s.alert.spoken });
    });
    write(SNOOZE_KEY, snoozed.current);

    // a task finished since its toast appeared → take the toast down
    setToasts((cur) => cur.filter((t) => { const task = tasks.find((x) => x.key === t.key); return t.key === "test" || (task && !task.done); }));

    if (!alerts.length) return;
    alerts.forEach((a) => { if (!a.id.includes("|again")) fired.current.ids.add(a.id); });
    write(FIRED_KEY(day), [...fired.current.ids]);
    show(alerts);
  }, [show]);

  useEffect(() => {
    const first = setTimeout(checkNow, 2500);
    const id = setInterval(checkNow, TICK_MS);
    const onVis = () => { if (document.visibilityState === "visible") checkNow(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", checkNow);
    return () => { clearTimeout(first); clearInterval(id); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", checkNow); };
  }, [checkNow]);

  const dismiss = useCallback((id) => setToasts((cur) => cur.filter((t) => t.id !== id)), []);

  const snooze = useCallback((alert, minutes = SNOOZE_MIN) => {
    const now = latest.current.nowFn().getTime();
    const base = alert.id.replace(/\|again\d+$/, "");
    snoozed.current[base] = { until: now + minutes * 60000, alert: { ...alert, id: base } };
    write(SNOOZE_KEY, snoozed.current);
    setToasts((cur) => cur.filter((t) => t.id !== alert.id));
  }, []);

  // Asks the browser for notification permission (must come from a click).
  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") { setPermission("unsupported"); return "unsupported"; }
    let p = Notification.permission;
    if (p === "default") { try { p = await Notification.requestPermission(); } catch { /* ignore */ } }
    setPermission(p);
    if (p === "granted") update({ notify: true });
    return p;
  }, [update]);

  const testReminder = useCallback(() => {
    const id = `test|${Date.now()}`;
    show([{ id, key: "test", kind: "soon", title: "Test reminder", deadlineLabel: "", minsLeft: 0, text: "This is a test reminder — if you can see (and hear) this, reminders are working.", spoken: "Boss, this is a test reminder. Reminders are working.", task: { key: "test" } }]);
  }, [show]);

  return { settings, update, toasts, dismiss, snooze, permission, requestPermission, testReminder, checkNow };
}
