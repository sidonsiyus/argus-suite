ARGUS SUITE — Aviation Engineering Interactive Lab Suite
=========================================================

WHAT'S IN THIS FOLDER
  index.html                        Portal landing page — radial hub (loads at your root URL)
  argus.html                        ARGUS — live flight tracker (the all-seeing radar)
  pyrgos.html                       PYRGOS — air-traffic-control tower simulator (NEW)
  aircraft-cutaway-explorer.html    3-D cutaway + flight simulator
  wind-tunnel-simulator.html        Subsonic / transonic / supersonic aerodynamics
  technical-drawing-lab.html        CATIA V5 technical drawing lab (24PBAV32)
  ndt-inspection-bay.html           Non-destructive testing course (24MBAV31)
  aircraft-maintenance-hangar.html  Virtual maintenance hangar
  worker.js                         Cloudflare Worker for ARGUS + PYRGOS (deployed SEPARATELY — see below)

THE LANDING PAGE
  index.html is a radial hub: the seven modules orbit a central ARGUS SUITE mark, each
  with its own colour halo. Click a module in the circle to launch it. Below the circle,
  the colour-matched "How to use" buttons open a quick-start guide for each module.

HOW TO DEPLOY THE WEBSITE
  1. Upload every .html file in this folder together (keep them side by side).
     - Netlify: drag this whole folder onto the Netlify dashboard.
     - Any static host: put these files at the site root.
  2. Visit your site root — index.html loads automatically and links to the others.
  Do NOT rename index.html: on a static host it is the default page served at "/".
  Other files can be renamed only if you also update DOMAINS[].file in index.html.

ABOUT THE LIVE MODULES (argus.html + pyrgos.html)
  ARGUS and PYRGOS use the internet — they stream live aircraft data through your
  Cloudflare Worker, already pointed at:
      https://flight-proxy.jhrishi7.workers.dev
  PYRGOS live radar, LIVE IN inbounds, and the server dot work on the current worker.

  (RE)DEPLOY worker.js if you want PYRGOS's ⟳ live METAR button to work:
      - Cloudflare dashboard > Workers > your worker > paste worker.js > Deploy
  This worker.js adds a /metar endpoint (real weather) on top of the existing /flights.
  worker.js is NOT part of the website upload — it runs on Cloudflare, not your host.

  The other five modules are fully self-contained and work offline.

made by sid
