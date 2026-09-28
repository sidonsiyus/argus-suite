// madebysid.space/internship → the VISTAS Internship Portal.
// It's a separate root-deployed app (Vite SPA + its own backend on Vercel), so
// we redirect rather than proxy — proxying a root SPA under a subpath would
// break its asset and API paths. Override the target with INTERNSHIP_URL.
export const dynamic = "force-dynamic";

const TARGET = process.env.INTERNSHIP_URL || "https://vistas-internship-portal.vercel.app";

export function GET() {
  // 307 (temporary) so the target can be changed later without cache lock-in.
  return Response.redirect(TARGET, 307);
}
