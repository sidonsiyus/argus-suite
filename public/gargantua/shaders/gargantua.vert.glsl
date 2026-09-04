// Fullscreen pass. The geometry is a single clip-space triangle pair; all of
// the work happens in the fragment shader.
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
