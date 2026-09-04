// Separable 9-tap Gaussian. Run once horizontally and once vertically per level
// of the bloom pyramid.
precision highp float;
varying vec2 vUv;

uniform sampler2D tSrc;
uniform vec2 uDir;        // one texel along the axis being blurred

void main() {
    vec3 s = vec3(0.0);
    s += texture2D(tSrc, vUv + uDir * -4.0).rgb * 0.0162;
    s += texture2D(tSrc, vUv + uDir * -3.0).rgb * 0.0540;
    s += texture2D(tSrc, vUv + uDir * -2.0).rgb * 0.1216;
    s += texture2D(tSrc, vUv + uDir * -1.0).rgb * 0.1946;
    s += texture2D(tSrc, vUv                ).rgb * 0.2270;
    s += texture2D(tSrc, vUv + uDir *  1.0).rgb * 0.1946;
    s += texture2D(tSrc, vUv + uDir *  2.0).rgb * 0.1216;
    s += texture2D(tSrc, vUv + uDir *  3.0).rgb * 0.0540;
    s += texture2D(tSrc, vUv + uDir *  4.0).rgb * 0.0162;
    gl_FragColor = vec4(s, 1.0);
}
