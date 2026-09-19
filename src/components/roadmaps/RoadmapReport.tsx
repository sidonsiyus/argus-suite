import React from "react";
import { CohortRoadmaps } from "@/lib/data/roadmaps";
import { PrintButton } from "./PrintButton";

const CSS = `
.rpt { background:#ffffff; color:#191918; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif; max-width:820px; margin:0 auto; padding:24px; }
.rpt * { box-sizing:border-box; }
.rpt-toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; }
.rpt-toolbar span { font-size:12px; color:#858480; }
.rpt-cover { background:linear-gradient(120deg,#062820,#0a352c); color:#f2fbf7; border-radius:16px; padding:28px 26px; margin-bottom:24px; }
.rpt-eyebrow { font-family:ui-monospace,Menlo,monospace; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:#86efac; font-weight:700; }
.rpt-cover h1 { font-size:26px; margin:8px 0 4px; letter-spacing:-.01em; }
.rpt-sub { font-size:13px; color:#96dfc1; }
.rpt-stats { margin-top:16px; display:flex; gap:20px; flex-wrap:wrap; }
.rpt-stat { }
.rpt-stat b { display:block; font-size:22px; }
.rpt-stat span { font-size:11px; color:#96dfc1; text-transform:uppercase; letter-spacing:.06em; }
.rpt-track { border:1px solid #eae9e4; border-radius:14px; padding:18px; margin-bottom:18px; }
.rpt-track-head { display:flex; align-items:center; gap:12px; margin-bottom:8px; }
.rpt-track-head .ico { font-size:26px; }
.rpt-track-head h2 { font-size:17px; margin:0; }
.rpt-track-head .auth { font-size:11px; color:#575653; font-family:ui-monospace,Menlo,monospace; text-transform:uppercase; letter-spacing:.05em; }
.rpt-summary { font-size:12.5px; color:#575653; margin:4px 0 10px; line-height:1.5; }
.rpt-exam { font-size:11.5px; color:#191918; background:#f7f7f5; border:1px solid #eae9e4; border-radius:8px; padding:8px 10px; margin:0 0 12px; line-height:1.5; }
.rpt-stage { display:flex; align-items:flex-start; gap:12px; padding:8px 0; border-top:1px solid #f0efec; }
.rpt-stage:first-child { border-top:none; }
.rpt-stage .num { width:24px; height:24px; border-radius:50%; background:#059669; color:#fff; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex:none; }
.rpt-stage .num.empty { background:#dcdad4; color:#575653; }
.rpt-stage .body { flex:1; }
.rpt-stage .t { font-size:13px; font-weight:600; }
.rpt-stage .t .ph { font-size:10px; color:#858480; font-weight:400; margin-left:6px; font-family:ui-monospace,Menlo,monospace; text-transform:uppercase; letter-spacing:.05em; }
.rpt-stage .o { font-size:11.5px; color:#575653; margin-top:2px; line-height:1.45; }
.rpt-stage .cnt { font-size:11px; color:#059669; font-weight:700; white-space:nowrap; }
.rpt-table { width:100%; border-collapse:collapse; margin-top:14px; font-size:11.5px; }
.rpt-table th { text-align:left; font-family:ui-monospace,Menlo,monospace; font-size:9px; letter-spacing:.06em; text-transform:uppercase; color:#575653; padding:6px 8px; border-bottom:1.5px solid #eae9e4; }
.rpt-table td { padding:6px 8px; border-bottom:1px solid #f0efec; color:#191918; }
.rpt-table td.tab { font-variant-numeric:tabular-nums; }
.rpt-badge { font-size:9px; padding:1px 6px; border-radius:20px; }
.rpt-badge.est { background:#f7f7f5; color:#858480; border:1px solid #eae9e4; }
.rpt-badge.con { background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; }
.rpt-foot { text-align:center; font-size:10px; color:#858480; margin-top:20px; }
@media print {
  .no-print { display:none !important; }
  .rpt { padding:0; max-width:none; }
  .rpt-track { page-break-inside:avoid; }
  .rpt-cover { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .rpt-stage .num, .rpt-badge.con { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
}
@page { margin:14mm; }
`;

function fmtDate() {
  try {
    return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export function RoadmapReport({ data }: { data: CohortRoadmaps }) {
  return (
    <div className="rpt">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="rpt-toolbar no-print">
        <PrintButton />
        <span>Tip: in the print dialog choose “Save as PDF”.</span>
      </div>

      <div className="rpt-cover">
        <div className="rpt-eyebrow">ARGUS · MENTOR OS</div>
        <h1>Cohort Career Roadmap Report</h1>
        <div className="rpt-sub">B.Sc. Aeronautical Science · Batch 2025–2028 · Section A</div>
        <div className="rpt-stats">
          <div className="rpt-stat"><b>{data.totalStudents}</b><span>Cadets</span></div>
          <div className="rpt-stat"><b>{data.tracks.length}</b><span>Career tracks</span></div>
          <div className="rpt-stat"><b>{fmtDate()}</b><span>Generated</span></div>
        </div>
      </div>

      {data.tracks.map((track) => {
        const pct = track.stageCount > 1 ? Math.round((track.avgStageIndex / (track.stageCount - 1)) * 100) : 0;
        const dist = new Map<number, number>();
        track.students.forEach((s) => dist.set(s.stageIndex, (dist.get(s.stageIndex) || 0) + 1));
        return (
          <section className="rpt-track" key={track.slug}>
            <div className="rpt-track-head">
              <span className="ico">{track.icon}</span>
              <div>
                <h2>{track.title}</h2>
                <span className="auth">{track.authority} · {track.studentCount} cadets · avg {pct}%</span>
              </div>
            </div>
            <p className="rpt-summary">{track.summary}</p>
            {track.examGuidance && (
              <p className="rpt-exam"><b>Exam guidance:</b> {track.examGuidance}</p>
            )}

            {track.stages.map((s, i) => {
              const count = dist.get(i) || 0;
              return (
                <div className="rpt-stage" key={s.key}>
                  <div className={"num" + (count === 0 ? " empty" : "")}>{i + 1}</div>
                  <div className="body">
                    <div className="t">{s.title} <span className="ph">{s.phase}</span></div>
                    <div className="o">{s.objective}</div>
                  </div>
                  <div className="cnt">{count > 0 ? `${count} cadet${count === 1 ? "" : "s"}` : ""}</div>
                </div>
              );
            })}

            {track.students.length > 0 && (
              <table className="rpt-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cadet</th>
                    <th>Reg No</th>
                    <th>Current stage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {track.students.map((st, idx) => (
                    <tr key={st.id}>
                      <td className="tab">{idx + 1}</td>
                      <td>{st.name}</td>
                      <td className="tab">{st.regNo}</td>
                      <td>{st.stageIndex + 1}. {track.stages[st.stageIndex]?.title || "—"}</td>
                      <td><span className={"rpt-badge " + (st.estimated ? "est" : "con")}>{st.estimated ? "Estimated" : "Confirmed"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}

      <div className="rpt-foot">Generated by ARGUS · MENTOR OS · {fmtDate()}</div>
    </div>
  );
}
