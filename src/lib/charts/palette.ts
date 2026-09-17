"use client";

import { useEffect, useState } from "react";

/**
 * Chart palette bridge.
 *
 * MENTOR OS themes everything through CSS variables (see app/mentor-os/globals.css).
 * Recharts accepts `var(--x)` strings directly for stroke/fill, so most marks can
 * use the CHART tokens below and auto-adapt to light/dark. For the cases that need
 * a *resolved* colour (gradients, canvas, computing tints, or Recharts internals
 * that don't honour var()), `useChartPalette()` reads the computed values and
 * re-resolves whenever the theme class flips.
 */

// CSS-var-backed tokens — usable directly as Recharts stroke/fill props.
export const CHART = {
  emerald: "var(--accent-emerald)",
  amber: "var(--accent-amber)",
  blue: "var(--accent-blue)",
  rose: "var(--accent-rose)",
  ink: "var(--text-primary)",
  muted: "var(--text-muted)",
  grid: "var(--border-subtle)",
  surface: "var(--bg-surface)",
} as const;

// Ordered categorical series — distinct and accessible in both themes.
export const CHART_SERIES = [
  CHART.emerald,
  CHART.blue,
  CHART.amber,
  CHART.rose,
] as const;

// Validated categorical palette (dataviz skill reference instance). Fixed order,
// CVD-safe on the adjacent pairlist in both modes; first 3 clear all-pairs
// (scatter/bubble). Never cycle — a 9th series folds to "Other" or facets.
export const CATEGORICAL_LIGHT = [
  "#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948",
];
export const CATEGORICAL_DARK = [
  "#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767",
];
// Single-hue blue ordinal ramp for ordered stages (funnels/tiers). Light starts
// no lighter than step 250; dark no darker than step 600.
export const ORDINAL_LIGHT = ["#86b6ef", "#3987e5", "#256abf", "#184f95"];
export const ORDINAL_DARK = ["#184f95", "#256abf", "#3987e5", "#86b6ef"];

export interface ResolvedPalette {
  emerald: string;
  amber: string;
  blue: string;
  rose: string;
  ink: string;
  muted: string;
  grid: string;
  surface: string;
  series: string[];
  /** Validated categorical hues for the current theme (fixed order). */
  categorical: string[];
  /** Ordered ordinal ramp (light→dark meaning low→high) for the current theme. */
  ordinal: string[];
  isDark: boolean;
}

// Light-theme fallbacks so the first server/client paint is never colourless.
const FALLBACK: ResolvedPalette = {
  emerald: "#059669",
  amber: "#d97706",
  blue: "#2563eb",
  rose: "#e11d48",
  ink: "#191918",
  muted: "#858480",
  grid: "#eae9e4",
  surface: "#ffffff",
  series: ["#059669", "#2563eb", "#d97706", "#e11d48"],
  categorical: CATEGORICAL_LIGHT,
  ordinal: ORDINAL_LIGHT,
  isDark: false,
};

const VAR_MAP: Record<keyof Omit<ResolvedPalette, "series" | "isDark" | "categorical" | "ordinal">, string> = {
  emerald: "--accent-emerald",
  amber: "--accent-amber",
  blue: "--accent-blue",
  rose: "--accent-rose",
  ink: "--text-primary",
  muted: "--text-muted",
  grid: "--border-subtle",
  surface: "--bg-surface",
};

function resolve(): ResolvedPalette {
  if (typeof window === "undefined") return FALLBACK;
  const cs = getComputedStyle(document.documentElement);
  const read = (v: string, fb: string) => (cs.getPropertyValue(v).trim() || fb);
  const p = {
    emerald: read(VAR_MAP.emerald, FALLBACK.emerald),
    amber: read(VAR_MAP.amber, FALLBACK.amber),
    blue: read(VAR_MAP.blue, FALLBACK.blue),
    rose: read(VAR_MAP.rose, FALLBACK.rose),
    ink: read(VAR_MAP.ink, FALLBACK.ink),
    muted: read(VAR_MAP.muted, FALLBACK.muted),
    grid: read(VAR_MAP.grid, FALLBACK.grid),
    surface: read(VAR_MAP.surface, FALLBACK.surface),
    isDark: document.documentElement.classList.contains("dark"),
  };
  return {
    ...p,
    series: [p.emerald, p.blue, p.amber, p.rose],
    categorical: p.isDark ? CATEGORICAL_DARK : CATEGORICAL_LIGHT,
    ordinal: p.isDark ? ORDINAL_DARK : ORDINAL_LIGHT,
  };
}

/** Returns resolved hex chart colours, re-resolving when the theme class flips. */
export function useChartPalette(): ResolvedPalette {
  const [palette, setPalette] = useState<ResolvedPalette>(FALLBACK);

  useEffect(() => {
    setPalette(resolve());
    const obs = new MutationObserver(() => setPalette(resolve()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  return palette;
}
