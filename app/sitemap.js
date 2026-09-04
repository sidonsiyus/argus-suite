const BASE = "https://www.madebysid.space";

// Portal routes + the standalone module pages in /public.
const MODULE_PATHS = [
  "/", "/ground-school",
  "/odyssey.html", "/argus.html", "/oracle.html", "/pyrgos.html",
  "/aircraft-cutaway-explorer.html", "/wind-tunnel-simulator.html",
  "/technical-drawing-lab.html", "/ndt-inspection-bay.html", "/aircraft-maintenance-hangar.html",
  "/ascent.html", "/halcyon.html", "/gargantua/index.html",
  "/argus-dashboard.html", "/muster.html", "/olympia.html", "/absence-audit-report.html",
];

export default function sitemap() {
  const now = new Date();
  return MODULE_PATHS.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.7,
  }));
}
