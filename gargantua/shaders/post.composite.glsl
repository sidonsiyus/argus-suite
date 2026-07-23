// ─────────────────────────────────────────────────────────────────────────────
// GARGANTUA · Stage 4 — composite
//
// Combines the linear HDR render with the bloom pyramid, then grades it:
// chromatic aberration, ACES, vignette, film grain.
//
// Two constraints shape the order of operations here:
//   · the horizon must stay at *exactly* zero — so grain is gated by luminance
//     and never lifts black pixels off the floor
//   · the critical curve must stay sharp — so bloom is added around it rather
//     than blurred into it, and the sharp scene always dominates the sum
// ─────────────────────────────────────────────────────────────────────────────
precision highp float;
varying vec2 vUv;

uniform sampler2D tScene;
uniform sampler2D tB0;
uniform sampler2D tB1;
uniform sampler2D tB2;
uniform sampler2D tB3;

uniform vec2  uRes;
uniform float uExposure;
uniform float uBloom;
uniform float uVignette;
uniform float uGrain;
uniform float uChroma;
uniform float uTime;
uniform float uPostOn;     // 0 = pass the render through untouched (debug views)

vec3 ACESFilm(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

void main() {
    vec2 uv = vUv;

    // debug views 1–8 bypass the grade entirely
    if (uPostOn < 0.5) {
        gl_FragColor = vec4(texture2D(tScene, uv).rgb, 1.0);
        return;
    }

    // ── chromatic aberration: radial, so the centre stays clean ─────────────
    vec2  d   = uv - 0.5;
    float amt = uChroma * dot(d, d);
    vec3 scene;
    scene.r = texture2D(tScene, uv + d * amt).r;
    scene.g = texture2D(tScene, uv).g;
    scene.b = texture2D(tScene, uv - d * amt).b;

    // ── bloom pyramid ───────────────────────────────────────────────────────
    // Weighted hard toward the tight levels. The widest level has a radius of
    // roughly 64 px and was washing straight across the shadow, turning the
    // horizon grey and softening the critical curve — exactly the two things
    // this image cannot give up.
    // With the shadow protected by the mask below, the wider levels can be let
    // back in — they are what give the halo its reach.
    vec3 bloom = texture2D(tB0, uv).rgb * 0.44
               + texture2D(tB1, uv).rgb * 0.28
               + texture2D(tB2, uv).rgb * 0.18
               + texture2D(tB3, uv).rgb * 0.10;

    // The horizon emits nothing, so no lens scatter belongs inside it. The main
    // pass hands the mask across in alpha; without this the widest bloom level
    // washes the shadow to a milky grey and blunts the critical curve.
    float lit = texture2D(tScene, uv).a;
    vec3 col = scene + bloom * uBloom * lit;

    // ── grade ───────────────────────────────────────────────────────────────
    col *= uExposure;
    col = ACESFilm(col);
    col = pow(col, vec3(1.0 / 2.2));

    float vig = smoothstep(1.15, 0.30, length(d) * 1.42);
    col *= mix(1.0, vig, uVignette);

    // Grain, gated by luminance. Ungated additive grain would lift the horizon
    // off pure black, which is the one thing this image cannot afford.
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    float g = hash12(uv * uRes + fract(uTime) * 717.13) - 0.5;
    col += g * uGrain * smoothstep(0.0, 0.055, luma);

    gl_FragColor = vec4(max(col, 0.0), 1.0);
}
