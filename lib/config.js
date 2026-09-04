// Shared constants for the live homepage widgets.
// These reuse the same Cloudflare worker the Argus radar uses.

export const FLIGHT_PROXY = "https://flight-proxy.jhrishi7.workers.dev";

// Default terminal for METAR/TAF (Chennai / MAA). Change to any ICAO code.
export const DEFAULT_ICAO = "VOMM";

// Fallback location if geolocation is unavailable/declined (Chennai, IN).
export const FALLBACK_LOC = { lat: 13.0827, lon: 80.2707, label: "Chennai, IN" };

// Windy embed centre for the India weather map.
export const WINDY = { lat: 22.5, lon: 80, zoom: 5 };
