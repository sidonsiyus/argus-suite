// Bright-pass extraction with a soft knee, so the bloom fades in gradually
// instead of switching on at a hard threshold and banding.
precision highp float;
varying vec2 vUv;

uniform sampler2D tScene;
uniform float uThreshold;
uniform float uKnee;

void main() {
    vec3 c = texture2D(tScene, vUv).rgb;
    float l = max(max(c.r, c.g), c.b);

    float k = max(uKnee, 1e-4);
    float soft = clamp(l - uThreshold + k, 0.0, 2.0 * k);
    soft = soft * soft / (4.0 * k);
    float contrib = max(soft, l - uThreshold) / max(l, 1e-5);

    gl_FragColor = vec4(c * contrib, 1.0);
}
