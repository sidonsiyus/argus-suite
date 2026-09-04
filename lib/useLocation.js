"use client";

import { useEffect, useState } from "react";
import { FALLBACK_LOC } from "./config";

// Resolves the viewer's location once (with a 6s cap), falling back to Chennai.
// `precise` is true only when the browser returned real coordinates.
export function useLocation() {
  const [loc, setLoc] = useState({ ...FALLBACK_LOC, precise: false, settled: false });

  useEffect(() => {
    let done = false;
    const settle = (next) => {
      if (done) return;
      done = true;
      setLoc({ ...next, settled: true });
    };

    if (!("geolocation" in navigator)) {
      settle({ ...FALLBACK_LOC, precise: false });
      return;
    }
    const timer = setTimeout(() => settle({ ...FALLBACK_LOC, precise: false }), 6000);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        clearTimeout(timer);
        settle({ lat: p.coords.latitude, lon: p.coords.longitude, label: "", precise: true });
      },
      () => {
        clearTimeout(timer);
        settle({ ...FALLBACK_LOC, precise: false });
      },
      { timeout: 5500, maximumAge: 600000 }
    );
    return () => clearTimeout(timer);
  }, []);

  return loc;
}
