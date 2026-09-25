# Professor Console — setup

The instructor console lives on the homepage (`app/page.js`). When a **faculty**
Supabase user signs in (via the top-bar **Instructor** button), the homepage
becomes the console; logged-out visitors see the normal public site. It reuses
the existing `public.is_faculty()` function that already gates MENTOR OS and
Ground School.

## 1. Run the migrations (Supabase → SQL Editor, the `sid-lms` project)

Run these once, in order. All are idempotent and faculty-only via RLS
(`is_faculty()`); the only public read is *active* ticker announcements.

| # | File | Adds |
|---|------|------|
| 1 | `supabase/migrations/20260924_professor_schedules.sql` | `schedules` — per-day class timetable |
| 2 | `supabase/migrations/20260924_ticker_items.sql` | `ticker_items` — homepage announcements (public read of active) |
| 3 | `supabase/migrations/20260924_attendance.sql` | `attendance_records`, `attendance_days` |
| 4 | `supabase/migrations/20260924_attendance_detail.sql` | absence category / reason / parent-contacted columns |
| 5 | `supabase/migrations/20260925_marks.sql` | `mark_subjects`, `marks` |
| 6 | `supabase/migrations/20260925_tasks.sql` | `tasks` — daily checklist |

If a tool shows a raw *"Could not find the table … in the schema cache"* right
after running a migration, run once: `NOTIFY pgrst, 'reload schema';`

Notes / Ground School (Notes tab) reuse the existing `subjects` / `notes`
tables — no new migration.

## 2. Environment (`.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already set for the site.
- `OPENROUTER_API_KEY` — enables the timetable OCR (Schedule) and attendance
  photo scan. Optional `OPENROUTER_VISION_MODEL` (defaults to the site model).
- `HOSTINGER_MAIL_TOKEN` — **required for the Coordinator tab.** A Hostinger Mail
  API token: in the webmail (mail.hostinger.com) → **Settings → Agentic Mail →
  API Access → Create API token**, copy the value once, and set it here. Stays
  server-side (no `NEXT_PUBLIC_` prefix). Order-scoped: it can only touch your
  own mailboxes. Optional companions:
  - `HOSTINGER_MAILBOX` — the mailbox address to use when the token's order has
    more than one (defaults to the first).
  - `COORDINATOR_EMAIL` — the sender to track (defaults to
    `adityamaddipati9999@gmail.com`).
  - `CONSOLE_TZ` — timezone for "today" (defaults to `Asia/Kolkata`).
  Without the token the Coordinator tab shows a "not connected" note and the
  checklist row is hidden — nothing else breaks.

## 3. Integrations (no setup, but good to know)

- **Google Sheet push** (Attendance → Push to Sheet) defaults to the legacy
  worker `https://argus-attend.jhrishi7.workers.dev/`. It only needs the writer
  **secret**, read from your browser's `argus_writer_secret` (set once via the
  ⚙ in the Mark-day view if missing).
- **Roster** is the shared `students` table, cohort **AERO-2025-28** — the same
  roster used by attendance, marks and MENTOR OS.

## Tools

- **Schedule** — upload the department "Daily Classroom Monitoring Report" image;
  it extracts only *your* periods (NDT / GTEM / Mentoring Hour taught by
  Siddharth), or type the day manually. Drives the greeting + the MIRA deadlines.
- **Ticker** — post announcements into the site news wire (active/expiry).
- **Notes** — categorise & upload course notes (Ground School store).
- **Attendance** — absentee-first daily marking (AUTH/UNAUTH/GROOM/OD/SUSP +
  reason + parent), day lock, OCR scan, analytics + defaulters, exports
  (CSV/DOCX register + defaulter letters, PDF, PNG), Sheet push, WhatsApp, and
  the **Report** sub-tab (copyable message + the exact 5-section MH COCKPIT .docx).
- **Marks** — per-subject grid (CAT-1 / CAT-2 / Model / End-Sem) with editable
  max marks and analytics.
- **Coordinator** — today's emails from the coordinator (via the Hostinger Mail
  API), reply inline (threaded, sent from your mailbox); each reply flags the
  original `\Answered` upstream, so the mailbox is the source of truth. Clears to
  "All done for the day" once every email is answered. Needs `HOSTINGER_MAIL_TOKEN`.
- **Checklist rail** — four fixed daily deliverables (MIRA is per-class and its
  deadline advances through the day), a live **coordinator-emails** row (ticks
  when all are replied), plus manual tasks.
