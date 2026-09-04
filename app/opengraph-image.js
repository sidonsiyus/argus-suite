import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ARGUS · Aviation Terminal";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: 72, background: "#0a100e", color: "#e9f1ec",
          fontFamily: "sans-serif", position: "relative",
        }}
      >
        {/* radar rings, right side */}
        <div style={{ position: "absolute", right: -140, top: 40, display: "flex" }}>
          <svg width="620" height="620" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#2fd6c2" strokeWidth="0.4" opacity="0.35" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#2fd6c2" strokeWidth="0.4" opacity="0.3" />
            <circle cx="50" cy="50" r="22" fill="none" stroke="#2fd6c2" strokeWidth="0.4" opacity="0.25" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="#2fd6c2" strokeWidth="0.4" opacity="0.25" />
            <path d="M50 50 L50 4 A46 46 0 0 1 82 18 Z" fill="#2fd6c2" opacity="0.16" />
            <line x1="4" y1="50" x2="96" y2="50" stroke="#2fd6c2" strokeWidth="0.3" opacity="0.2" />
            <line x1="50" y1="4" x2="50" y2="96" stroke="#2fd6c2" strokeWidth="0.3" opacity="0.2" />
            <path d="M64 34 l4 3 -6 1 z" fill="#e0a83c" />
            <path d="M38 62 l4 3 -6 1 z" fill="#2fd6c2" />
            <path d="M58 66 l4 3 -6 1 z" fill="#4a9eff" />
          </svg>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 6, color: "#2fd6c2", fontFamily: "monospace" }}>
          <div style={{ width: 13, height: 13, borderRadius: 7, background: "#2fd6c2", display: "flex" }} />
          <span>ALL-SEEING · AVIATION TERMINAL</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>Every aircraft in the sky.</div>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, color: "#2fd6c2" }}>Nothing off the scope.</div>
          <div style={{ fontSize: 26, color: "#93a49b", marginTop: 26, maxWidth: 720 }}>
            Live flight & satellite tracking, ATC and flight-ops simulators, engineering labs, careers, research and a notes library.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "monospace" }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 10, color: "#e9f1ec" }}>ARGUS</div>
          <div style={{ fontSize: 22, color: "#e0a83c", letterSpacing: 2 }}>www.madebysid.space</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
