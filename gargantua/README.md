# GARGANTUA — Schwarzschild Black Hole Raytracer

**Stage 3 · lensed starfield.** Every pixel integrates a real null geodesic of
the Schwarzschild metric in a full-screen fragment shader. There is no mesh, no
texture, no sprite, no cube map and no video anywhere in the image — the shadow,
the photon ring, the lensed disk, its beaming, and the entire sky are all
consequences of the integration.

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
| 2 | redshift factor g on the disk |
| 3 | equatorial-plane crossings per ray (linear, decodable) |
| 4 | deflection α scaled to π |
| 5 | integrator step count |
| 6 | impact parameter b |
| 7 | escape direction as RGB |
| 8 | photon ring isolated |
| 9 | unlensed sky — same tonemap as view 0, so it is a true A/B |

---

## The physics

Geometric units, `G = c = 1`, mass `M = 1`, so every length is in units of M.

| quantity | value |
|---|---|
| event horizon | `r = 2M` |
| photon sphere | `r = 3M` |
| ISCO (disk inner edge) | `r = 6M` |
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

### The disk

The geodesic is watched for sign changes of its height above the equatorial
plane, so a single ray can strike the disk more than once. That is where the arc
over the top of the hole and the sliver underneath come from — they are the far
side of the disk, lifted into view by gravity.

Each crossing is shaded with

| quantity | form |
|---|---|
| Keplerian rate | `Ω = √(M/r³)` |
| redshift + beaming | `g = √(1 − 3M/r) / (1 − Ω·b_z)` |
| intensity boost | `I_obs = g⁴ · I_emit` |
| observed colour | `T_obs = g · T_emit`, through the Planckian locus |
| temperature profile | `T ∝ r^(−3/4)·[1 − √(r_in/r)]^(1/4)`, peaking at `1.361 r_in` |
| turbulence | fbm advected at the local `Ω`, so the disk shears as it turns |

`b_z = L_z/E` is the photon's angular momentum about the disk axis — constant
along the whole geodesic, and the only quantity the Doppler term needs.

### The sky

Generated procedurally in the shader and sampled with the *lensed* direction
that comes back from the geodesic, so it is bent by the hole for free.

- **Stars** in three layers of a hashed cell grid, with a magnitude
  distribution weighted heavily toward faint, stellar colours from blue-white
  to warm, and fine diffraction crosses on the brightest few.
- **Milky Way** as a Gaussian band about a tilted galactic pole, structured with
  3D fbm, with dust lanes cutting a darker channel through the middle and a
  raised star density inside the band.
- **Nebula wash** from a low-frequency fbm.

One subtlety worth naming: near the critical curve the magnification compresses
a huge patch of sky into a few pixels, so neighbouring pixels sample wildly
different directions. Left alone the starfield boils into aliasing noise there.
The star size is therefore widened in step with the deflection, which smears
those regions into the smooth average they should be rather than sparkling.

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

### Stage 2 — the disk

| check | result |
|---|---|
| disk inner edge | `6.0 M` — exactly the ISCO |
| temperature normalisation | peak of `x^(3/4)(1−√x)^(1/4)` = 0.487871 at `x = 0.73469`, i.e. `r = 1.3611 r_in` |
| colour gradient (beaming off) | R/B rises **1.061 → 1.204** from inner to outer disk: hot inside, cool outside |
| peak brightness | 191/255 — no clipping |

**Multi-crossing.** Counting equatorial-plane crossings per ray:

| crossings | share of frame |
|---|---|
| 0 | 8.5 % |
| 1 | 80.7 % |
| 2 | **10.7 %** |
| 3 | 0.2 % |

Over a tenth of the image is light that crossed the disk plane more than once.
The band just above the shadow reads **223.9** against a background sky of
**59.1** — the far side of the disk really is lifted over the hole.

**Doppler beaming**, measured below the tonemap knee so nothing clips:

| configuration | left | right | L/R |
|---|---|---|---|
| rotation **+** | 26.27 | 44.40 | **0.592** |
| rotation **−** | 43.84 | 26.48 | **1.655** |
| beaming **off** | 39.78 | 40.11 | 0.992 |

The asymmetry is 1.69× and it **mirrors exactly when the rotation is reversed**,
then vanishes when the term is switched off. That three-way test is what makes
it beaming rather than a lighting accident.

### Stage 3 — the sky

**Is the sky actually lensed?** Comparing view 0 against view 9 (identical
camera, identical tonemap), block-averaged so thin features cannot alias, with
the shadow excluded:

| screen radius | mean \|lensed − unlensed\| |
|---|---|
| just outside the shadow | 13.61 |
| inner | **18.24** |
| middle | 9.41 |
| outer | 5.87 |
| frame edge | 7.74 |

Distortion peaks in the strong-lensing annulus just beyond the shadow and falls
off outward — **1.8×** stronger near the hole than at the frame edge. That is the
expected 1/b behaviour. Note the deflection is still around 10° even at the
frame edge at this camera distance, so the lensing is global, not local.

| check | result |
|---|---|
| Milky Way band | row-brightness contrast **8.15×** across the frame |
| star field | mean sky luminance 26, peak 243, 5.8 % of pixels above 60 |
| composition at r = 30M | shadow 4.4 % · sky 63.3 % · stars 6.2 % · disk 19.3 % · hot core 6.7 % |
| sky mean luminance | 16.3 — deep, not grey |
| disk colour | rgb(101,83,58), R/B = **1.74** |

### Stage 1 invariants, re-checked with the disk in

| check | result |
|---|---|
| shadow radius at r = 20M | 14.2801° vs 14.2690° — **0.077 %** |
| horizon black level | **0** — still pure black |
| debug views 0–9 | all distinct and non-degenerate |
| console errors | **none** |

### Look, after retuning

Measured at r = 42M, inclination ~7°, over the whole frame:

| region | share of frame | notes |
|---|---|---|
| shadow (pure black) | 2.7 % | exactly 0 on every channel |
| sky | 86.7 % | mean luminance **13** — deep, not grey |
| disk body | 2.9 % | rgb(174,143,81), **R/B = 2.15** — gold |
| beamed hot core | 2.8 % | rgb(241,234,221), R/B = 1.09 — warm white, not clipped |

Before the retune the disk sat at R/B ≈ 1.0 (grey) with the beamed side clipped
flat, and the placeholder sky filled the frame at roughly four times this
brightness. Three things fixed it: ACES instead of the naive knee, a much darker
sky (gamma lifts small linear values far more than it looks like it should), and
a narrower, cooler disk — 3500 K peak across a 6–15M annulus.

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

- The lat/long calibration cage is still available (`uSkyGrid > 0`) and remains
  the clearest way to *see* the lensing directly, but it is off by default now
  that there is a real sky.
- Tone mapping is now Narkowicz's ACES filmic approximation, pulled forward
  from Stage 4 because the old `x/(1+x)` knee crushed the beamed side of the
  disk to flat white. Bloom, vignette, grain and chromatic aberration still
  arrive in Stage 4.
- The disk is razor thin: emission is evaluated exactly at the plane crossing
  rather than integrated through a vertical profile. A thickness model would
  soften the edge-on silhouette.
- `uTempScale` (4700 K at the profile peak) sets the disk's absolute
  temperature. It is a free parameter in reality — accretion rate and hole mass
  fix it — so it is tuned here for legibility rather than derived.
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
