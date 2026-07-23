# GARGANTUA — Schwarzschild Black Hole Raytracer

**Stage 1 · physics core.** Every pixel integrates a real null geodesic of the
Schwarzschild metric in a full-screen fragment shader. There is no mesh, no
texture, no sprite and no video anywhere in the image — the shadow, its radius
and the photon ring are all consequences of the integration.

---

## Running it

The page fetches its shaders at runtime, so it must be served over http(s)
rather than opened from disk. No build step, no package install.

```bash
cd gargantua
python3 -m http.server 8080
# then open http://localhost:8080/
```

Any static server works (`npx serve`, nginx, Apache, GitHub Pages…).

## Layout

```
gargantua/
  index.html                     shell, HUD, import map
  main.js                        renderer, camera, uniforms, instrumentation
  shaders/gargantua.vert.glsl    full-screen pass
  shaders/gargantua.frag.glsl    the geodesic integrator — the whole subject
  lib/three.module.js            three.js r160 (vendored, local)
  lib/OrbitControls.js           orbit camera (vendored, local)
```

## Controls

| input | action |
|---|---|
| drag | orbit the observer |
| scroll | dolly in / out (clamped outside 2M) |
| `0`–`9` | debug views |
| `H` | hide / show the HUD |
| `R` | reset the camera |
| `V` | run a shadow measurement and print it to the console |

### Debug views

| # | view |
|---|---|
| 0 | beauty pass |
| 1 | capture mask — black = photon crossed the horizon |
| 2 | deflection α, heat ramp |
| 3 | closest approach r_min |
| 4 | deflection α scaled to π |
| 5 | integrator step count |
| 6 | impact parameter b |
| 7 | escape direction as RGB |
| 8 | photon ring isolated |
| 9 | unlensed sky, for comparison against view 0 |

---

## The physics

Geometric units, `G = c = 1`, mass `M = 1`, so every length is in units of M.

| quantity | value |
|---|---|
| event horizon | `r = 2M` |
| photon sphere | `r = 3M` |
| critical impact parameter | `b_c = 3√3 M = 5.196152…M` |

Each ray defines a plane through the origin. In that plane the null geodesic
obeys

```
d²u/dφ² + u = 3 M u²        u = 1/r
```

integrated with **RK4**, the step tightened near the photon sphere where
neighbouring rays diverge exponentially and the critical curve gets its detail.

Two details matter more than they look:

1. **The initial condition carries a `√(1 − 2M/r₀)` factor.** It converts the
   ray angle measured in the static observer's local frame into the coordinate
   derivative. Omitting it puts the shadow at the wrong radius.
2. **The escape is solved, not stepped.** As `u → 0` the equation reduces to
   `u'' = −u`, so the asymptote lies exactly `Δφ = atan2(u, −u′)` beyond the last
   sample. Terminating on the step grid instead leaves up to one step of false
   bending — which showed up as a spurious 0.048 rad deflection *in flat space*
   until it was fixed.

---

## Verification

All figures below are measured, not asserted.

### Integrator against closed-form results

| test | result | expected |
|---|---|---|
| capture threshold | `b = 5.196152 M` | `3√3 M = 5.196152 M` (**3.4×10⁻⁶ %** error) |
| flat-space control (M = 0) | `α = 2.4×10⁻⁷ rad` | exactly 0 |
| weak field, b = 10⁴M | `α/(4M/b) = 1.00085` | → 1 |
| weak field, b = 10³M | `α/(4M/b) = 1.00302` | → 1 |
| 2nd order, b = 50M | `α = 0.085084` | series `0.084712` (0.44%) |
| photon sphere, b → b_c⁺ | `r_min → 3.0025M` | → 3M |
| ring divergence | `Δα ≈ 2.28–2.30` per decade | `ln 10 = 2.3026` |

The last line is the photon ring's signature: α diverges logarithmically as
b → b_c, adding roughly `ln 10` of extra winding for every factor of ten closer
to the critical curve.

### Rendered image against theory

Shadow angular radius for a static observer,
`sin θ = b_c·√(1 − 2M/r) / r`, measured by scanning the capture mask in the
framebuffer:

| camera r | measured | analytic | error | shadow edge |
|---|---|---|---|---|
| 12M | 23.2839° | 23.2837° | **0.001 %** | 323 px |
| 20M | 14.2771° | 14.2690° | 0.056 % | 191 px |
| 35M | 8.2628° | 8.2885° | 0.310 % | 109 px |
| 60M | 4.8737° | 4.8845° | 0.221 % | 64 px |

Residuals grow as the shadow shrinks because the measurement quantises to whole
pixels — at 64 px a single pixel is already 0.35 % of the radius.

At r = 8M the shadow (34.2°) is wider than the frustum, so the edge leaves the
screen and the HUD reports that instead of reporting a wrong number.

### Image quality

| check | result |
|---|---|
| horizon black level | **0** on every channel — pure black |
| photon ring | peak 1 px outside the shadow edge, **2.1× sky brightness** |
| debug views 0–9 | all render distinct, non-degenerate content |
| console errors | **none** |
| shader compile / link | clean |

### Performance

Measured on SwiftShader — a pure-CPU rasteriser with no GPU at all — so treat
these as a worst case, not as what the project runs at:

| step budget | ms/frame @ 640×480 |
|---|---|
| 150 | 977 |
| 1000 | 1094 |

Raising the budget from 150 to 1000 steps costs only ~12 %: almost every ray
terminates in well under a hundred steps, and only **0.07 %** run to the end of
the budget. Those are the near-critical rays that make the photon ring, so the
detail is nearly free. Real GPU numbers have not been measured here and will be
far higher.

---

## Known limits of this stage

- The sky is a deliberate placeholder — a lat/long cage that makes the lensing
  legible and measurable. The procedural starfield and Milky Way arrive in
  Stage 3.
- The photon ring is about a pixel wide, which is physically right (it is a
  caustic) but reads thin until Stage 4's bloom spreads it.
- Anti-aliasing is off by default (`uAA = 1`). `GARGANTUA.uniforms.uAA.value = 2`
  supersamples 2×2 and visibly cleans the critical curve at 4× the cost.
- Rays that exhaust the step budget are treated as captured. They lie within
  ~0.1 % of b_c and would orbit many times, so counting them as black is
  defensible and shifts the shadow edge by well under the pixel quantisation.

## Live handles

`window.GARGANTUA` exposes `uniforms`, `camera`, `controls`, `renderer`,
`verifyShadow()`, `shadowAngle(r)`, `setDebug(n)` and `consts` for inspection
from the console.
