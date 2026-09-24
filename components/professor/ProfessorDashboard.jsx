"use client";

/*
 * Professor / instructor dashboard — the logged-in face of the homepage.
 * Rendered by app/page.js when a faculty Supabase session is present, so it
 * lives on the SAME site (madebysid.space), just a gated view of the home route.
 *
 * P1: shell — time-based greeting, today's-schedule readout (placeholder until
 * P2), a compact live ticker, and tabbed tool navigation. Each tool tab is a
 * described placeholder that later phases fill in.
 */
import { useEffect, useMemo, useState } from "react";
import { useNews } from "@/lib/useNews";
import { signOut } from "@/lib/lms";

const TABS = [
  { id: "overview", label: "Overview", icon: "◉" },
  { id: "schedule", label: "Schedule", icon: "🗓" },
  { id: "ticker", label: "Ticker", icon: "📣" },
  { id: "notes", label: "Notes", icon: "📚" },
  { id: "attendance", label: "Attendance", icon: "✓" },
  { id: "marks", label: "Marks", icon: "％" },
];

function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function firstName(session) {
  const meta = session?.user?.user_metadata || {};
  const full = meta.full_name || meta.name;
  if (full) return String(full).trim().split(/\s+/)[0];
  const email = session?.user?.email || "";
  if (email) {
    const local = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    if (local) return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return "Sid";
}

/* compact live ticker (keeps the wire running inside the dashboard) */
function DashTicker() {
  const news = useNews();
  const items = news.status === "ok" ? news.items.slice(0, 12) : [];
  return (
    <div className="prof-ticker" aria-label="Live headlines">
      <span className="prof-ticker-tag">WIRE</span>
      <div className="prof-ticker-track">
        {items.length ? (
          <div className="prof-ticker-run">
            {[...items, ...items].map((it, i) => (
              <a key={i} className="prof-ticker-item" href={it.link || it.url || "#"} target="_blank" rel="noopener noreferrer">
                <i />{it.title}
              </a>
            ))}
          </div>
        ) : (
          <span className="prof-ticker-idle">{news.status === "loading" ? "Tuning the wire…" : "Wire offline"}</span>
        )}
      </div>
    </div>
  );
}

function Placeholder({ title, phase, points }) {
  return (
    <div className="prof-panel">
      <div className="prof-panel-h">
        <h2>{title}</h2>
        <span className="prof-chip">{phase}</span>
      </div>
      <p className="prof-panel-lead">This tool is being built in the current project. Here's what it will do:</p>
      <ul className="prof-list">{points.map((p, i) => <li key={i}>{p}</li>)}</ul>
    </div>
  );
}

export default function ProfessorDashboard({ session }) {
  const [tab, setTab] = useState("overview");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const name = useMemo(() => firstName(session), [session]);
  const greeting = greetingFor(now.getHours());
  const dateLine = now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // P2 will replace this with the saved schedule for today.
  const scheduleText = "No schedule set for today yet — add one in the Schedule tab (upload a timetable image or type it in).";

  function speak() {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(`${greeting}, Professor ${name}. ${scheduleText}`);
      u.rate = 1; u.pitch = 1;
      synth.speak(u);
    } catch { /* speech unsupported — ignore */ }
  }

  async function doSignOut() {
    try { await signOut(); } catch { /* ignore */ }
  }

  return (
    <div className="prof-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bg-grad" aria-hidden="true" />
      <div className="bg-grid" aria-hidden="true" />

      <header className="prof-top">
        <div className="prof-brand">
          <div className="prof-brand-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" opacity=".4" /><circle cx="12" cy="12" r="4.4" />
              <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" /><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div>
            <div className="prof-brand-name">ARGUS</div>
            <div className="prof-brand-sub">Instructor Console</div>
          </div>
        </div>
        <div className="prof-top-spacer" />
        <span className="prof-who">{session?.user?.email}</span>
        <button className="prof-btn ghost" onClick={doSignOut}>Sign out</button>
      </header>

      <DashTicker />

      <nav className="prof-tabs" aria-label="Instructor tools">
        {TABS.map((t) => (
          <button key={t.id} className={"prof-tab" + (tab === t.id ? " on" : "")} onClick={() => setTab(t.id)}>
            <span className="prof-tab-ic" aria-hidden>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      <main className="prof-main">
        {tab === "overview" && (
          <>
            <section className="prof-hero">
              <div className="prof-hero-eyebrow"><i />{dateLine}</div>
              <h1>{greeting},<br /><span className="accent">Professor {name}.</span></h1>
              <p className="prof-sched">{scheduleText}</p>
              <div className="prof-hero-cta">
                <button className="prof-btn primary" onClick={speak}>🔊 Read my day</button>
                <button className="prof-btn ghost" onClick={() => setTab("schedule")}>Set today's schedule →</button>
              </div>
            </section>

            <section className="prof-grid">
              {TABS.filter((t) => t.id !== "overview").map((t) => (
                <button key={t.id} className="prof-card" onClick={() => setTab(t.id)}>
                  <span className="prof-card-ic" aria-hidden>{t.icon}</span>
                  <b>{t.label}</b>
                  <small>{CARD_BLURB[t.id]}</small>
                </button>
              ))}
            </section>
          </>
        )}

        {tab === "schedule" && (
          <Placeholder title="Class Schedule" phase="Next up · P2" points={[
            "Upload a photo of your timetable — AI reads it into a structured day.",
            "Or type your schedule manually for any day.",
            "The dashboard greets you with the day's classes and can read them aloud.",
          ]} />
        )}
        {tab === "ticker" && (
          <Placeholder title="Ticker Manager" phase="P3" points={[
            "Post your own announcements into the site's news ticker.",
            "Set active/expiry so notices retire themselves.",
            "Your items ride alongside the live aviation headlines.",
          ]} />
        )}
        {tab === "notes" && (
          <div className="prof-panel">
            <div className="prof-panel-h"><h2>Notes Library</h2><span className="prof-chip">Live</span></div>
            <p className="prof-panel-lead">Categorise and upload course notes by subject. This uses your existing Ground School library — it'll be embedded here in P4.</p>
            <div className="prof-hero-cta">
              <a className="prof-btn primary" href="/ground-school/admin">Upload / manage notes →</a>
              <a className="prof-btn ghost" href="/ground-school">Browse library →</a>
            </div>
          </div>
        )}
        {tab === "attendance" && (
          <Placeholder title="Attendance" phase="P5" points={[
            "Native rebuild of the ARGUS attendance dashboard on Supabase.",
            "Daily marking, day-lock, OCR scan, full analytics.",
            "Exports: DOCX register & defaulter letters, CSV, PDF, PNG, and Google Sheets push.",
          ]} />
        )}
        {tab === "marks" && (
          <Placeholder title="Marks" phase="P6" points={[
            "Per-subject grid: each student against CAT-1, CAT-2, Model and End-Semester.",
            "Editable max marks per assessment.",
            "Analytics: class averages, pass/fail, and per-student progression.",
          ]} />
        )}
      </main>

      <footer className="prof-foot">ARGUS · Instructor Console · made by sid</footer>
    </div>
  );
}

const CARD_BLURB = {
  schedule: "Upload or type your day's timetable",
  ticker: "Post announcements to the news wire",
  notes: "Upload & categorise course notes",
  attendance: "Mark, analyse & export attendance",
  marks: "Enter CAT / Model / End-Sem marks",
};

const CSS = `
.prof-root{position:relative;min-height:100vh;color:var(--ink);font-family:var(--sans)}
.prof-top{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:12px;padding:12px 20px;background:var(--topbar-bg);backdrop-filter:saturate(1.4) blur(12px);border-bottom:1px solid var(--line)}
.prof-brand{display:flex;align-items:center;gap:11px}
.prof-brand-mark{width:34px;height:34px;color:var(--accent)}
.prof-brand-name{font-weight:800;letter-spacing:.14em;font-size:14px}
.prof-brand-sub{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--dim)}
.prof-top-spacer{flex:1}
.prof-who{font-family:var(--mono);font-size:11px;color:var(--dim)}
.prof-btn{font-family:var(--sans);font-size:13px;font-weight:600;border-radius:10px;padding:9px 15px;cursor:pointer;border:1px solid var(--line-2);background:var(--panel);color:var(--ink);transition:.15s}
.prof-btn:hover{border-color:var(--accent);color:var(--accent)}
.prof-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}
.prof-btn.primary:hover{filter:brightness(1.06);color:#fff}
.prof-btn.ghost{background:transparent}
.prof-ticker{display:flex;align-items:center;gap:10px;padding:7px 20px;background:var(--console);color:var(--console-ink);overflow:hidden;border-bottom:1px solid var(--line)}
.prof-ticker-tag{flex:none;font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;color:var(--gold);border:1px solid rgba(226,171,65,.4);border-radius:5px;padding:2px 7px}
.prof-ticker-track{flex:1;overflow:hidden;position:relative;-webkit-mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent);mask-image:linear-gradient(90deg,transparent,#000 4%,#000 96%,transparent)}
.prof-ticker-run{display:inline-flex;gap:30px;white-space:nowrap;animation:profwire 60s linear infinite}
@keyframes profwire{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.prof-ticker-item{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--console-ink);text-decoration:none;opacity:.9}
.prof-ticker-item i{width:5px;height:5px;border-radius:50%;background:var(--gold);flex:none}
.prof-ticker-idle{font-family:var(--mono);font-size:11px;color:var(--dim)}
@media(prefers-reduced-motion:reduce){.prof-ticker-run{animation:none}}
.prof-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:14px 20px 0;max-width:1120px;margin:0 auto;width:100%}
.prof-tab{display:inline-flex;align-items:center;gap:7px;font-family:var(--sans);font-size:13px;font-weight:600;color:var(--dim);background:transparent;border:1px solid transparent;border-radius:10px;padding:9px 14px;cursor:pointer;transition:.15s}
.prof-tab:hover{color:var(--ink);background:var(--fill-weak)}
.prof-tab.on{color:var(--accent);background:var(--accent-soft);border-color:var(--accent)}
.prof-tab-ic{font-size:14px}
.prof-main{max-width:1120px;margin:0 auto;width:100%;padding:22px 20px 60px}
.prof-hero{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:34px 30px;box-shadow:var(--shadow-md);position:relative;overflow:hidden}
.prof-hero-eyebrow{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin-bottom:14px}
.prof-hero-eyebrow i{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)}
.prof-hero h1{font-family:var(--serif);font-size:clamp(30px,5vw,46px);line-height:1.05;font-weight:800;margin:0 0 14px;letter-spacing:-.02em}
.prof-hero h1 .accent{color:var(--accent)}
.prof-sched{font-size:15px;color:var(--ink-soft);max-width:62ch;line-height:1.55;margin:0 0 20px}
.prof-hero-cta{display:flex;gap:10px;flex-wrap:wrap}
.prof-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;margin-top:20px}
.prof-card{text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:15px;padding:18px;cursor:pointer;transition:.16s;display:flex;flex-direction:column;gap:5px;color:var(--ink)}
.prof-card:hover{transform:translateY(-2px);border-color:var(--accent);box-shadow:var(--shadow-md)}
.prof-card-ic{font-size:22px;margin-bottom:4px}
.prof-card b{font-size:15px;font-weight:700}
.prof-card small{font-size:12.5px;color:var(--dim);line-height:1.4}
.prof-panel{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:26px;box-shadow:var(--shadow-sm)}
.prof-panel-h{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.prof-panel-h h2{font-family:var(--serif);font-size:24px;font-weight:800;margin:0}
.prof-chip{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);border:1px solid rgba(226,171,65,.4);border-radius:20px;padding:3px 10px}
.prof-panel-lead{font-size:14px;color:var(--ink-soft);margin:0 0 14px;line-height:1.55}
.prof-list{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:8px}
.prof-list li{font-size:14px;color:var(--ink-soft);line-height:1.5}
.prof-foot{text-align:center;font-family:var(--mono);font-size:11px;color:var(--faint);padding:26px 20px 40px}
`;
