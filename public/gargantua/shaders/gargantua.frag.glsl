// ─────────────────────────────────────────────────────────────────────────────
// GARGANTUA · Stage 2 — Schwarzschild raytracer + relativistic accretion disk
//
// Every pixel integrates a real null geodesic. Nothing is a mesh, a texture,
// a sprite or a video. New in this stage:
//
//   · multi-crossing disk      the geodesic is watched for equatorial-plane
//                              crossings, so one ray can strike the disk more
//                              than once — that is where the arc over the top
//                              of the hole and the sliver underneath come from
//   · Doppler beaming          g = sqrt(1-3M/r) / (1 - Omega*b_z)
//   · gravitational redshift   folded into the same g
//   · relativistic boosting    I_obs = g^4 I_emit,  T_obs = g*T_emit
//   · Shakura-Sunyaev profile  T ~ r^(-3/4) * [1 - sqrt(r_isco/r)]^(1/4)
//   · sheared turbulence       noise advected at the local Keplerian rate, so
//                              the inner disk winds up faster than the outer
//
// Geometric units G = c = 1.  horizon 2M · photon sphere 3M · ISCO 6M
//                             critical impact parameter b_c = 3*sqrt(3)*M
// ─────────────────────────────────────────────────────────────────────────────
precision highp float;

varying vec2 vUv;

uniform vec2  uRes;
uniform vec3  uCamPos;
uniform mat4  uCamMat;
uniform float uTanHalfFov;
uniform float uAspect;
uniform float uM;
uniform int   uMaxSteps;
uniform int   uDebug;
uniform int   uAA;
uniform float uSkyGrid;
uniform float uRingGain;
uniform float uTime;

// disk controls
uniform float uDiskIn;        // inner edge (ISCO = 6M)
uniform float uDiskOut;       // outer edge
uniform float uDiskOpacity;   // 1 = optically thick
uniform float uDiskBright;
uniform float uTempScale;     // peak colour temperature, kelvin
uniform float uTurb;          // turbulence depth 0..1
uniform float uFlowSpeed;     // animation rate of the orbital shear
uniform float uDoppler;       // 1 = beaming + redshift on, 0 = off (A/B test)

// sky
uniform float uStarBright;
uniform float uStarDensity;
uniform float uMilkyWay;
uniform float uNebula;
uniform float uSpinSign;      // +1 / -1, flips the direction of rotation

#define MAX_STEPS 1400
const float PI = 3.14159265358979;
const vec3  DISK_N = vec3(0.0, 1.0, 0.0);   // disk lies in the y = 0 plane

// ── small procedural noise kit ───────────────────────────────────────────────
float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
}
vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
}
float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float vnoise3(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash33(i + vec3(0,0,0)).x, n100 = hash33(i + vec3(1,0,0)).x;
    float n010 = hash33(i + vec3(0,1,0)).x, n110 = hash33(i + vec3(1,1,0)).x;
    float n001 = hash33(i + vec3(0,0,1)).x, n101 = hash33(i + vec3(1,0,1)).x;
    float n011 = hash33(i + vec3(0,1,1)).x, n111 = hash33(i + vec3(1,1,1)).x;
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
               mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
}
float fbm3(vec3 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * vnoise3(p); p *= 2.07; a *= 0.5; }
    return s;
}
float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
    return s;
}

// Planckian locus (Neil Bartlett's approximation). Kelvin in, RGB out.
vec3 blackbody(float K) {
    K = clamp(K, 1000.0, 40000.0);
    float t = K / 100.0;
    float r, g, b;
    if (t <= 66.0) r = 255.0;
    else           r = 329.698727446 * pow(max(t - 60.0, 1e-3), -0.1332047592);
    if (t <= 66.0) g = 99.4708025861 * log(t) - 161.1195681661;
    else           g = 288.1221695283 * pow(max(t - 60.0, 1e-3), -0.0755148492);
    if (t >= 66.0) b = 255.0;
    else if (t <= 19.0) b = 0.0;
    else b = 138.5177312231 * log(t - 10.0) - 305.0447927307;
    return clamp(vec3(r, g, b) / 255.0, 0.0, 1.0);
}

// ── the disk ─────────────────────────────────────────────────────────────────
// r    radius of the plane crossing
// pxz  crossing point in the disk plane, for the noise field
// bz   L_z/E for this photon — constant along the whole geodesic
vec3 diskEmission(float r, vec2 pxz, float bz, out float alpha) {
    alpha = 0.0;
    float M = uM;
    if (r < uDiskIn || r > uDiskOut) return vec3(0.0);

    float Om = uSpinSign * sqrt(M / (r * r * r));      // Keplerian angular rate

    // Redshift and beaming in one factor:
    //   numerator   sqrt(1-3M/r)   gravitational shift + orbital time dilation
    //   denominator (1 - Om*b_z)   Doppler from the orbital motion
    float g = 1.0;
    if (uDoppler > 0.5) {
        float gsr = sqrt(max(1.0 - 3.0 * M / r, 1e-4));
        g = gsr / max(1.0 - Om * bz, 1e-3);
    }

    // Shakura-Sunyaev thin-disk temperature, normalised so the peak is 1
    float x = clamp(uDiskIn / r, 0.0, 1.0);
    // 0.48773 is the maximum of x^(3/4)(1-sqrt(x))^(1/4), so T peaks at exactly 1
    float T = pow(x, 0.75) * pow(max(1.0 - sqrt(x), 0.0), 0.25) / 0.48773;

    // turbulence advected with the local flow, so the disk shears as it turns
    float ang = Om * uTime * uFlowSpeed * 40.0;
    float ca = cos(-ang), sa = sin(-ang);
    vec2  q  = vec2(ca * pxz.x - sa * pxz.y, sa * pxz.x + ca * pxz.y);
    float n1 = fbm(q * 0.55);
    float n2 = fbm(q * 1.90 + 11.3);
    float dens = mix(1.0, (0.45 + 1.15 * n1) * (0.65 + 0.7 * n2), uTurb);

    // soft inner and outer edges
    // Tight inner lip, and an outer fade that starts early so the disk reads as
    // a ribbon rather than a cushion.
    float edge = smoothstep(0.0, 0.045, (r - uDiskIn) / max(uDiskIn, 1e-3))
               * (1.0 - smoothstep(0.42, 1.0, (r - uDiskIn) / max(uDiskOut - uDiskIn, 1e-3)));

    float flux = pow(T, 4.0) * dens * edge;            // Stefan-Boltzmann
    vec3  col  = blackbody(uTempScale * T * g);        // observed colour temperature
    float g4   = g * g * g * g;                        // specific-intensity boost

    alpha = clamp(uDiskOpacity * dens * edge * 1.35, 0.0, 1.0);
    return col * flux * g4 * uDiskBright;
}

// ── outcome of one traced geodesic ───────────────────────────────────────────
struct Ray {
    int   hit;
    vec3  dir;
    float defl;
    float rMin;
    float b;
    int   steps;
    vec3  disk;
    float trans;
    int   cross;        // crossings that actually struck disk material
    int   planeCross;   // every equatorial-plane crossing — the lensing signature
    float gFirst;
    float rHit;
};

Ray traceGeodesic(vec3 p, vec3 d) {
    Ray R;
    R.hit = 0; R.dir = d; R.defl = 0.0; R.steps = 0;
    R.disk = vec3(0.0); R.trans = 1.0; R.cross = 0; R.planeCross = 0;
    R.gFirst = 1.0; R.rHit = 0.0;

    float M  = uM;
    float r0 = length(p);
    R.rMin = r0;
    R.b = 0.0;

    if (r0 <= 2.0 * M) { R.hit = 1; return R; }

    vec3  er     = p / r0;
    float cosPsi = dot(d, er);
    vec3  tvec   = d - cosPsi * er;
    float sinPsi = length(tvec);

    if (sinPsi < 1e-7) {                     // radial ray: no angular momentum
        R.hit = (cosPsi < 0.0) ? 1 : 0;
        return R;
    }
    vec3 eh = tvec / sinPsi;

    float f0 = 1.0 - 2.0 * M / r0;
    float sf = sqrt(max(f0, 1e-9));
    R.b = r0 * sinPsi / sf;

    // Angular momentum about the disk axis per unit energy — constant along the
    // geodesic, and the only thing the Doppler term needs.
    vec3  nrm = normalize(cross(er, eh));
    float bz  = R.b * dot(nrm, DISK_N);

    // s(phi) = A cos phi + B sin phi is the height above the disk plane up to a
    // positive factor r, so its sign changes are exactly the plane crossings.
    float A = dot(er, DISK_N);
    float B = dot(eh, DISK_N);
    bool  planar = (abs(A) < 1e-5 && abs(B) < 1e-5);

    float u   = 1.0 / r0;
    float w   = -sf * cosPsi / (r0 * sinPsi);
    float phi = 0.0;
    float psi = acos(clamp(cosPsi, -1.0, 1.0));

    float uHor = 1.0 / (2.0 * M);
    float rEsc = max(400.0 * M, 4.0 * r0);
    float uEsc = 1.0 / rEsc;
    float uPh  = 1.0 / (3.0 * M);

    for (int i = 0; i < MAX_STEPS; i++) {
        if (i >= uMaxSteps) break;
        R.steps = i;

        float uP = u, wP = w, phiP = phi;

        float prox = abs(1.0 - u / uPh);
        float h = clamp(0.020 * (0.25 + 4.0 * prox), 0.0025, 0.055);

        // RK4 on  u' = w ,  w' = 3M u^2 - u
        float a1u = w;                   float a1w = 3.0 * M * u * u - u;
        float q2  = u + 0.5 * h * a1u;   float a2u = w + 0.5 * h * a1w;
        float a2w = 3.0 * M * q2 * q2 - q2;
        float q3  = u + 0.5 * h * a2u;   float a3u = w + 0.5 * h * a2w;
        float a3w = 3.0 * M * q3 * q3 - q3;
        float q4  = u + h * a3u;         float a4u = w + h * a3w;
        float a4w = 3.0 * M * q4 * q4 - q4;

        u += (h / 6.0) * (a1u + 2.0 * a2u + 2.0 * a3u + a4u);
        w += (h / 6.0) * (a1w + 2.0 * a2w + 2.0 * a3w + a4w);
        phi += h;

        if (u > 0.0) R.rMin = min(R.rMin, 1.0 / u);

        // ── equatorial plane crossing ────────────────────────────────────────
        if (!planar && u > 0.0 && uP > 0.0) {
            float sP = A * cos(phiP) + B * sin(phiP);
            float sN = A * cos(phi)  + B * sin(phi);
            if (sP * sN < 0.0) {
                R.planeCross += 1;
                float fr   = sP / (sP - sN);
                float phiC = phiP + fr * (phi - phiP);
                float uC   = mix(uP, u, fr);
                if (uC > 0.0) {
                    float rC = 1.0 / uC;
                    if (R.trans > 0.01 && rC >= uDiskIn && rC <= uDiskOut) {
                        vec3  pc = rC * (cos(phiC) * er + sin(phiC) * eh);
                        float al;
                        vec3  em = diskEmission(rC, vec2(pc.x, pc.z), bz, al);
                        if (al > 0.0) {
                            if (R.cross == 0) {
                                R.rHit = rC;
                                float Om = uSpinSign * sqrt(M / (rC * rC * rC));
                                R.gFirst = sqrt(max(1.0 - 3.0 * M / rC, 1e-4))
                                         / max(1.0 - Om * bz, 1e-3);
                            }
                            R.cross += 1;
                            R.disk  += R.trans * em * al;   // front to back
                            R.trans *= (1.0 - al);
                        }
                    }
                }
            }
        }

        if (u >= uHor) { R.hit = 1; R.defl = phi; return R; }

        // Escape: near u -> 0 the equation is u'' = -u, so the asymptote lies
        // exactly atan2(u, -u') beyond the last sample. Solving it rather than
        // stopping on the step grid keeps flat space at exactly zero bending.
        if (u <= uEsc && wP < 0.0) {
            float dphi = atan(max(uP, 0.0), -wP);
            float phiA = phiP + dphi;
            R.dir  = normalize(cos(phiA) * er + sin(phiA) * eh);
            R.defl = phiA - psi;
            return R;
        }
    }

    R.hit = 1;                 // out of budget: a near-critical spiral
    R.defl = phi;
    return R;
}

// ── procedural sky: starfield + Milky Way ────────────────────────────────────
// Generated entirely in the shader — no texture, no cube map. The direction fed
// in is the *lensed* one that came back from the geodesic, so everything here is
// bent by the hole for free.
//
// `blur` widens the stars where the lensing magnification compresses the sky.
// Near the critical curve neighbouring pixels sample wildly different
// directions, and without this the starfield would boil into aliasing noise.

const vec3 GAL_N = vec3(0.3104, 0.8280, -0.4670);   // galactic pole

// One layer of stars. A single cell is sampled and the star is kept away from
// the cell walls, which is much cheaper than a 27-cell neighbourhood search and
// visually indistinguishable at these densities.
vec3 starLayer(vec3 d, float scale, float size, float blur, float gain) {
    vec3 p = d * scale;
    vec3 cell = floor(p), f = fract(p);
    vec3 h = hash33(cell);

    // magnitude distribution: mostly faint, a few bright
    float mag = pow(h.z, 7.0);
    if (mag < 0.0025) return vec3(0.0);

    vec3  sp = vec3(0.25) + 0.5 * h;
    float dd = length(f - sp);
    float sz = size * blur;
    float core = exp(-dd * dd / sz);
    if (core < 0.004) return vec3(0.0);

    // stellar colour: mostly blue-white, some warm
    float warm = step(0.78, fract(h.x * 7.31));
    vec3 tint = mix(mix(vec3(0.72, 0.82, 1.0), vec3(1.0), h.y),
                    vec3(1.00, 0.80, 0.62), warm);

    // fine diffraction cross on the brightest few
    float spike = 0.0;
    if (mag > 0.35) {
        vec2 q = (f - sp).xy;
        spike = (exp(-abs(q.x) * 46.0 - abs(q.y) * 5.0)
               + exp(-abs(q.y) * 46.0 - abs(q.x) * 5.0)) * 0.30 * mag;
    }
    return tint * (core + spike) * mag * gain;
}

vec3 skyProbe(vec3 d, float blur) {
    blur = clamp(blur, 1.0, 24.0);

    // ── Milky Way ───────────────────────────────────────────────────────────
    float gd   = dot(d, GAL_N);                     // 0 on the galactic plane
    float band = exp(-gd * gd / 0.0455);

    float clump = fbm3(d * 3.1);
    float lane  = fbm3(d * 6.7 + 21.7);
    // dust lanes cut a dark channel through the middle of the band
    float dust  = smoothstep(0.36, 0.72, lane) * exp(-gd * gd / 0.0125);

    vec3 mwWarm = vec3(0.058, 0.045, 0.034);
    vec3 mwCool = vec3(0.020, 0.026, 0.048);
    vec3 mw = mix(mwCool, mwWarm, clamp(clump * 1.35, 0.0, 1.0))
            * band * (0.35 + 1.5 * clump) * (1.0 - 0.82 * dust);

    // ── deep-space background + faint nebula wash ───────────────────────────
    vec3 base = mix(vec3(0.0011, 0.0008, 0.0028),
                    vec3(0.0026, 0.0017, 0.0052), 0.5 + 0.5 * d.y);
    float neb = fbm3(d * 1.7 + 4.2);
    base += vec3(0.0075, 0.0030, 0.0140) * pow(clamp(neb, 0.0, 1.0), 2.4) * uNebula;

    vec3 col = base + mw * uMilkyWay;

    // ── stars ───────────────────────────────────────────────────────────────
    float dens = uStarDensity;
    // the band is denser in stars, as it should be
    float bandBoost = 1.0 + 1.6 * band;
    vec3 st = starLayer(d, 260.0 * dens, 0.00028, blur, 1.00) * bandBoost
            + starLayer(d, 118.0 * dens, 0.00055, blur, 1.55) * bandBoost
            + starLayer(d,  47.0 * dens, 0.00115, blur, 2.30);
    col += st * uStarBright;      // scales the stars only, not the whole sky

    // Optional calibration cage. Off by default, but it remains the clearest way
    // to see the lensing directly — set uSkyGrid > 0 to overlay it.
    if (uSkyGrid > 0.001) {
        float lat = asin(clamp(d.y, -1.0, 1.0));
        float lon = atan(d.z, d.x);
        float st = PI / 12.0;
        float gl1 = abs(fract(lat / st + 0.5) - 0.5);
        float gl2 = abs(fract(lon / st + 0.5) - 0.5);
        float line = max(1.0 - smoothstep(0.0, 0.02, gl1),
                         1.0 - smoothstep(0.0, 0.02, gl2));
        col += vec3(0.10, 0.30, 0.55) * line * uSkyGrid;
    }

    return col;
}

vec3 heat(float t) {
    t = clamp(t, 0.0, 1.0);
    return clamp(vec3(1.5 * t - 0.2, 1.6 * t * (1.0 - t) * 1.6, 1.4 * (1.0 - t) - 0.15),
                 0.0, 1.0);
}

vec4 shade(vec3 ro, vec3 rd) {
    Ray R = traceGeodesic(ro, rd);
    float M = uM;
    float bc = 3.0 * sqrt(3.0) * M;

    // ── debug views ──────────────────────────────────────────────────────────
    if (uDebug == 1) return vec4((R.hit == 1) ? vec3(0.0) : vec3(1.0), 1.0);
    if (uDebug == 2) {                                    // redshift factor g
        if (R.cross == 0) return vec4(0.0, 0.0, 0.0, 1.0);
        return vec4(heat(clamp((R.gFirst - 0.4) / 1.6, 0.0, 1.0)), 1.0);
    }
    if (uDebug == 3) return vec4(vec3(float(R.planeCross) / 4.0), 1.0);
    if (uDebug == 4) return vec4((R.hit == 1) ? vec3(0.0) : heat(R.defl / PI), 1.0);
    if (uDebug == 5) return vec4(heat(float(R.steps) / float(uMaxSteps)), 1.0);
    if (uDebug == 6) return vec4(heat(R.b / (4.0 * bc)), 1.0);
    if (uDebug == 7) return vec4((R.hit == 1) ? vec3(0.0) : R.dir * 0.5 + 0.5, 1.0);
    if (uDebug == 8) {
        if (R.hit == 1) return vec4(0.0, 0.0, 0.0, 1.0);
        return vec4(heat(clamp(R.defl / PI / 3.0, 0.0, 1.0)), 1.0);
    }
    if (uDebug == 9) return vec4(skyProbe(normalize(rd), 1.0), 1.0);

    // ── beauty ───────────────────────────────────────────────────────────────
    vec3 bg = vec3(0.0);
    if (R.hit == 0) {
        // Strongly deflected rays sample a compressed patch of sky, so widen the
        // stars in step with the magnification instead of aliasing.
        float blur = 1.0 + 26.0 * max(R.defl - 0.45, 0.0);
        bg = skyProbe(R.dir, blur);
        float nHalf = R.defl / PI;
        float ring  = smoothstep(0.85, 1.35, nHalf) * 0.55
                    + smoothstep(1.85, 2.35, nHalf) * 1.10
                    + smoothstep(2.85, 3.35, nHalf) * 2.20;
        bg += vec3(1.0, 0.86, 0.62) * ring * uRingGain;
    }
    // alpha carries the horizon mask: 0 where the photon fell in. The composite
    // uses it to keep bloom out of the shadow, so the hole stays absolutely
    // black instead of going milky.
    return vec4(R.disk + bg * R.trans, (R.hit == 1) ? 0.0 : 1.0);
}

void main() {
    vec3 ro = uCamPos;
    vec4 acc = vec4(0.0);
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
    vec4 out4 = acc * inv;      // averaging alpha too antialiases the mask edge

    // Linear HDR out — exposure, bloom and the whole grade happen in the
    // composite pass. Views 1-8 already produce display-ready values and are
    // passed straight through there.
    gl_FragColor = out4;
}
