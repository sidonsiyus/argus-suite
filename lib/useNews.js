"use client";

import { useEffect, useState } from "react";

const NEWS_PROXY = "https://news-proxy.jhrishi7.workers.dev/news";

// Word-boundary match so "plane" doesn't hit "planet" / "explanation", etc.
const AVIATION = /\b(aviation|aviate|aircraft|airplane|airplanes|aeroplane|airline|airlines|airliner|airliners|airport|airports|airfield|airspace|airway|airways|flight|flights|flying|flyover|jet|jets|jetliner|boeing|airbus|embraer|bombardier|cessna|pilot|pilots|cockpit|runway|runways|takeoff|take-off|landing|touchdown|hangar|aerospace|helicopter|helicopters|chopper|drone|drones|uav|turbulence|fuselage|faa|easa|icao|iata|ntsb|dgca|plane|planes|spacex|nasa|isro|rocket|satellite|satellites|spacecraft|astronaut)\b/i;

function isAviation(a) {
  return AVIATION.test(`${a?.title || ""} ${a?.source || ""}`);
}

// Local calendar day, as YYYY-MM-DD (en-CA gives that format in any locale).
const dayKey = () => new Date().toLocaleDateString("en-CA");

// Single shared fetch for the news wire + newsdesk. Refreshes once a day:
// on load, again at the next local midnight (then every 24h), and whenever the
// tab is revisited on a new calendar day. Filters to aviation/aerospace stories,
// falling back to the raw feed only if nothing matches so sections never go empty.
export function useNews() {
  const [state, setState] = useState({ status: "loading", items: [], source: "", aviationOnly: true, day: "" });

  useEffect(() => {
    let alive = true;
    let lastDay = null;
    async function load() {
      try {
        const r = await fetch(NEWS_PROXY, { cache: "no-store" });
        const d = await r.json();
        const all = (d && d.items) || [];
        const av = all.filter(isAviation);
        const items = av.length ? av : all;
        if (!alive) return;
        lastDay = dayKey();
        setState({ status: items.length ? "ok" : "empty", items, source: (d && d.source) || "", aviationOnly: av.length > 0, day: lastDay });
      } catch {
        // keep any headlines we already have; only show error on a cold failure
        if (alive) setState((s) => ({ ...s, status: s.items.length ? "ok" : "error" }));
      }
    }

    load();

    // fire at the next local midnight (+30s guard), then every 24h
    let dayInterval;
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 30);
    const midnightTimer = setTimeout(() => {
      load();
      dayInterval = setInterval(load, 24 * 60 * 60 * 1000);
    }, nextMidnight - now);

    // if the tab was left open (or reopened) into a new day, refresh on focus
    const onVisible = () => {
      if (document.visibilityState === "visible" && lastDay && dayKey() !== lastDay) load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      clearTimeout(midnightTimer);
      clearInterval(dayInterval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return state;
}

// "12 Aug" style short date from an ISO-ish string.
export function shortDate(s) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d)) return String(s);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
