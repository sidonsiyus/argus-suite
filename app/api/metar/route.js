// Server-side METAR proxy — aviationweather.gov blocks browser (CORS) requests,
// so we fetch it here and return it same-origin. Reliable, no worker dependency.
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") || "").toUpperCase().replace(/[^A-Z0-9,]/g, "");
  if (!ids) return Response.json({ error: "ids required", metar: [] }, { status: 400 });

  try {
    const r = await fetch(`https://aviationweather.gov/api/data/metar?ids=${ids}&format=json`, {
      headers: { "User-Agent": "argus-aviation-terminal", accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) return Response.json({ error: `upstream ${r.status}`, metar: [] }, { status: 200 });
    const d = await r.json();
    const list = (Array.isArray(d) ? d : []).map((m) => ({
      icao: m.icaoId,
      rawOb: m.rawOb,
      fltCat: m.fltCat || null,
      wdir: m.wdir ?? null,
      wspd: m.wspd ?? null,
      wgst: m.wgst ?? null,
      visib: m.visib ?? null,
      temp: m.temp ?? null,
      dewp: m.dewp ?? null,
      altim: m.altim ?? null,
      wxString: m.wxString || null,
      name: m.name || null,
    }));
    return Response.json({ metar: list, now: Date.now() }, {
      status: 200,
      headers: { "cache-control": "public, max-age=120, s-maxage=120" },
    });
  } catch {
    return Response.json({ error: "fetch failed", metar: [] }, { status: 200 });
  }
}
