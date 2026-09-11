"use client";
/*
 * Faithful port of public/argus-dashboard.html into the site as a client route.
 * Not a redesign — the original markup, stylesheet and vanilla JS are carried
 * over verbatim. The stylesheet is scoped under #argus-legacy (via the build
 * script scratchpad/port-legacy.js) so it can't collide with globals.css, and
 * the original inline scripts run in global scope so their inline onclick
 * handlers resolve exactly as before.
 *
 * Regenerate legacy-data.js after editing the HTML:
 *   node scripts/port-legacy.js
 */
import { useEffect, useRef } from "react";
import { EXTERNAL_SRCS, LEGACY_CSS, BODY_HTML, LEGACY_JS } from "./legacy-data";

export default function AttendanceLegacy() {
  const hostRef = useRef(null);

  useEffect(() => {
    // Boot exactly once per page load. The original script declares top-level
    // const/let in global scope, so running it twice (React StrictMode in dev,
    // or an SPA re-mount) would throw "already declared" — guard against that.
    if (typeof window === "undefined") return;
    const host = hostRef.current;
    if (!host) return;

    if (window.__argusLegacyBooted) {
      // Already booted this page load: just make sure the markup is present.
      if (!host.firstChild) host.innerHTML = BODY_HTML;
      return;
    }
    window.__argusLegacyBooted = true;

    host.innerHTML = BODY_HTML;

    const added = [];
    const runInline = () => {
      const s = document.createElement("script");
      s.textContent = LEGACY_JS; // runs synchronously in global scope
      s.setAttribute("data-argus-legacy", "js");
      document.body.appendChild(s);
      added.push(s);
    };

    // Load external libs (docx CDN) first, then the app code. Failures are
    // non-fatal — the export handlers already guard for a missing lib.
    let i = 0;
    const loadNext = () => {
      if (i >= EXTERNAL_SRCS.length) { runInline(); return; }
      const src = EXTERNAL_SRCS[i++];
      if (document.querySelector('script[src="' + src + '"]')) { loadNext(); return; }
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.onload = loadNext;
      s.onerror = loadNext;
      s.setAttribute("data-argus-legacy", "lib");
      document.head.appendChild(s);
      added.push(s);
    };
    loadNext();

    // Intentionally no teardown: the legacy app is a full-page singleton and
    // its globals must persist. Navigating away and back reuses them.
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEGACY_CSS + "\n#argus-legacy{position:fixed;inset:0;overflow:auto}" }} />
      <div id="argus-legacy" ref={hostRef} suppressHydrationWarning />
    </>
  );
}
