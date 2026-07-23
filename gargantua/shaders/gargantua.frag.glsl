// ─────────────────────────────────────────────────────────────────────────────
// GARGANTUA · Stage 1 — Schwarzschild null-geodesic raytracer
//
// Every pixel integrates a real null geodesic of the Schwarzschild metric.
// Nothing here is a mesh, a texture, a sprite or a fake. The shadow, its
// radius, and the photon ring all fall out of the integration.
//
// Working in geometric units G = c = 1, so the mass M sets every length:
//     event horizon      r = 2M
//     photon sphere      r = 3M
//     critical impact b_c = 3*sqrt(3)*M = 5.196152...M
//
// Orbit equation for a null geodesic in the plane of the ray:
//     d²u/dφ² + u = 3 M u²        with u = 1/r
// integrated with RK4, step size tightened near the photon sphere where the
// solution is stiff and the critical curve lives.
// ─────────────────────────────────────────────────────────────────────────────
precision highp float;

varying vec2 vUv;

uniform vec2  uRes;
uniform vec3  uCamPos;
uniform mat4  uCamMat;        // camera world matrix (local frame -> world)
uniform float uTanHalfFov;
uniform float uAspect;
uniform float uM;             // black hole mass, geometric units
uniform int   uMaxSteps;
uniform int   uDebug;         // 0..9
uniform int   uAA;            // 1 = one sample, 2 = 2x2 supersample
uniform float uSkyGrid;       // grid line intensity
uniform float uRingGain;      // photon-ring highlight gain
uniform float uExposure;

#define MAX_STEPS 1400
const float PI = 3.14159265358979;

// Outcome of one traced geodesic.
struct Ray {
    int   hit;        // 1 = crossed the horizon, 0 = escaped
    vec3  dir;        // asymptotic outgoing direction (escaped rays)
    float defl;       // deflection α = φ_asymptote − ψ  (exactly 0 in flat space)
    float rMin;       // closest approach, in units of M
    float b;          // impact parameter
    int   steps;
};

// ── the integrator ───────────────────────────────────────────────────────────
Ray traceGeodesic(vec3 p, vec3 d) {
    Ray R;
    R.hit = 0; R.dir = d; R.defl = 0.0; R.steps = 0;

    float M  = uM;
    float r0 = length(p);
    R.rMin = r0;

    // Camera inside the horizon: everything is black, no geodesic to trace.
    if (r0 <= 2.0 * M) { R.hit = 1; R.b = 0.0; return R; }

    vec3  er     = p / r0;             // radial basis vector at the camera
    float cosPsi = dot(d, er);         // ray angle to radial, in the static
    vec3  tvec   = d - cosPsi * er;    // observer's local orthonormal frame
    float sinPsi = length(tvec);

    // Purely radial ray — no angular momentum, so no bending at all.
    if (sinPsi < 1e-7) {
        R.b = 0.0;
        R.hit = (cosPsi < 0.0) ? 1 : 0;   // inward radial always falls in
        return R;
    }
    vec3 eh = tvec / sinPsi;           // tangential basis vector

    float f0 = 1.0 - 2.0 * M / r0;     // metric factor at the camera
    float sf = sqrt(max(f0, 1e-9));

    // Impact parameter b = r0 sinψ / sqrt(1 - 2M/r0).  Capture iff b < b_c.
    R.b = r0 * sinPsi / sf;

    // Initial conditions in u = 1/r.  The sqrt(1-2M/r0) converts the angle
    // measured in the observer's local frame into the coordinate derivative —
    // leaving it out shifts the shadow radius and is the classic mistake here.
    float u = 1.0 / r0;
    float w = -sf * cosPsi / (r0 * sinPsi);   // du/dφ
    float phi = 0.0;

    float uHor  = 1.0 / (2.0 * M);
    float rEsc  = max(400.0 * M, 4.0 * r0);
    float uEsc  = 1.0 / rEsc;
    float uPh   = 1.0 / (3.0 * M);

    float psi = acos(clamp(cosPsi, -1.0, 1.0));   // launch angle from radial

    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= uMaxSteps) break;
        R.steps = i;

        // keep the pre-step state: the asymptote is solved from it
        float uP = u, wP = w, phiP = phi;

        // Tighten the step near the photon sphere: that is where neighbouring
        // rays diverge and where the critical curve gets its sharpness.
        float prox = abs(1.0 - u / uPh);
        float h = clamp(0.020 * (0.25 + 4.0 * prox), 0.0025, 0.055);

        // RK4 on  u' = w ,  w' = 3M u² - u
        float a1u = w;
        float a1w = 3.0 * M * u * u - u;

        float u2 = u + 0.5 * h * a1u;
        float a2u = w + 0.5 * h * a1w;
        float a2w = 3.0 * M * u2 * u2 - u2;

        float u3 = u + 0.5 * h * a2u;
        float a3u = w + 0.5 * h * a2w;
        float a3w = 3.0 * M * u3 * u3 - u3;

        float u4 = u + h * a3u;
        float a4u = w + h * a3w;
        float a4w = 3.0 * M * u4 * u4 - u4;

        u += (h / 6.0) * (a1u + 2.0 * a2u + 2.0 * a3u + a4u);
        w += (h / 6.0) * (a1w + 2.0 * a2w + 2.0 * a3w + a4w);
        phi += h;

        if (u > 0.0) R.rMin = min(R.rMin, 1.0 / u);

        // Horizon crossing — the photon is gone.
        if (u >= uHor) {
            R.hit = 1; R.defl = phi; return R;
        }

        // Escaped. Near u → 0 the orbit equation reduces to u'' = −u, so the
        // asymptote is reached exactly Δφ = atan2(u, −u') later. Solving it
        // this way (rather than stopping on the step grid) is what keeps flat
        // space at precisely zero deflection instead of one step's worth.
        if (u <= uEsc && wP < 0.0) {
            float dphi = atan(max(uP, 0.0), -wP);
            float phiA = phiP + dphi;
            R.dir  = normalize(cos(phiA) * er + sin(phiA) * eh);
            R.defl = phiA - psi;
            return R;
        }
    }

    // Out of steps: almost always a near-critical ray spiralling on the photon
    // sphere. Those are physically captured in the limit.
    R.hit = 1;
    R.defl = phi;
    return R;
}

// ── stage-1 stand-in sky ─────────────────────────────────────────────────────
// A latitude/longitude cage on the celestial sphere. Deliberately plain: it is
// here so the lensing is legible and measurable. Stage 3 replaces it with the
// procedural starfield and Milky Way.
vec3 skyProbe(vec3 d) {
    float lat = asin(clamp(d.y, -1.0, 1.0));
    float lon = atan(d.z, d.x);

    vec3 base = mix(vec3(0.020, 0.030, 0.055),
                    vec3(0.045, 0.055, 0.085),
                    0.5 + 0.5 * d.y);

    // grid lines every 15 degrees
    float step_ = PI / 12.0;
    float gLat = abs(fract(lat / step_ + 0.5) - 0.5);
    float gLon = abs(fract(lon / step_ + 0.5) - 0.5);
    float wLat = fwidth(lat / step_) * 0.9 + 1e-4;
    float wLon = fwidth(lon / step_) * 0.9 + 1e-4;
    float line = max(1.0 - smoothstep(0.0, wLat, gLat),
                     1.0 - smoothstep(0.0, wLon, gLon));

    // faint checker so multiple images of the same patch are identifiable
    float chk = mod(floor(lat / step_) + floor(lon / step_), 2.0);
    base += chk * vec3(0.012, 0.010, 0.016);

    vec3 grid = mix(vec3(0.15, 0.55, 0.85), vec3(0.95, 0.75, 0.35),
                    0.5 + 0.5 * sin(lat * 3.0));
    return base + grid * line * uSkyGrid;
}

// heat ramp for the debug views
vec3 heat(float t) {
    t = clamp(t, 0.0, 1.0);
    return clamp(vec3(1.5 * t - 0.2, 1.6 * t * (1.0 - t) * 1.6, 1.4 * (1.0 - t) - 0.15),
                 0.0, 1.0);
}

// ── shading one sample ───────────────────────────────────────────────────────
vec3 shade(vec3 ro, vec3 rd) {
    Ray R = traceGeodesic(ro, rd);
    float M = uM;
    float bc = 3.0 * sqrt(3.0) * M;

    // debug views ------------------------------------------------------------
    if (uDebug == 1) return (R.hit == 1) ? vec3(0.0) : vec3(1.0);
    if (uDebug == 2) return (R.hit == 1) ? vec3(0.0) : heat(R.defl / (4.0 * PI));
    if (uDebug == 3) return (R.hit == 1) ? vec3(0.0) : heat((R.rMin - 2.0 * M) / (12.0 * M));
    if (uDebug == 4) return (R.hit == 1) ? vec3(0.0) : heat(R.defl / PI);
    if (uDebug == 5) return heat(float(R.steps) / float(uMaxSteps));
    if (uDebug == 6) return heat(R.b / (4.0 * bc));
    if (uDebug == 7) return (R.hit == 1) ? vec3(0.0) : R.dir * 0.5 + 0.5;
    if (uDebug == 8) {                       // photon ring isolated
        if (R.hit == 1) return vec3(0.0);
        return heat(clamp(R.defl / PI / 3.0, 0.0, 1.0));
    }
    if (uDebug == 9) return skyProbe(normalize(rd));   // unlensed sky reference

    // beauty pass ------------------------------------------------------------
    if (R.hit == 1) return vec3(0.0);        // the shadow: genuinely zero

    vec3 col = skyProbe(R.dir);

    // Photon ring. α diverges logarithmically as b → b_c, so successive
    // half-turns pile onto an ever thinner band at the critical curve. This is
    // the visible signature of the r = 3M photon sphere.
    float nHalf = R.defl / PI;
    float ring  = smoothstep(0.85, 1.35, nHalf) * 0.55
                + smoothstep(1.85, 2.35, nHalf) * 1.10
                + smoothstep(2.85, 3.35, nHalf) * 2.20;
    col += vec3(1.0, 0.86, 0.62) * ring * uRingGain;

    return col;
}

void main() {
    vec3 ro = uCamPos;
    vec3 acc = vec3(0.0);
    int n = (uAA > 1) ? 2 : 1;
    float inv = 1.0 / float(n * n);

    for (int sy = 0; sy < 2; sy++) {
        if (sy >= n) break;
        for (int sx = 0; sx < 2; sx++) {
            if (sx >= n) break;
            vec2 off = (n == 1) ? vec2(0.5)
                                : (vec2(float(sx), float(sy)) + 0.25) / float(n) + 0.25;
            vec2 uv  = (gl_FragCoord.xy + off - 0.5 - 0.5 * uRes) / uRes.y;
            vec3 dl  = normalize(vec3(uv.x * uTanHalfFov * 2.0,
                                      uv.y * uTanHalfFov * 2.0, -1.0));
            vec3 rd  = normalize((uCamMat * vec4(dl, 0.0)).xyz);
            acc += shade(ro, rd);
        }
    }
    vec3 col = acc * inv;

    if (uDebug == 0) col *= uExposure;

    gl_FragColor = vec4(col, 1.0);
}
