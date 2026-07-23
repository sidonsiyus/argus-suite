// ─────────────────────────────────────────────────────────────────────────────
// GARGANTUA · Stage 1 — application shell
//
// Sets up a full-screen fragment-shader pass, an orbiting observer, and the
// instrumentation used to check the render against closed-form Schwarzschild
// results. No build step: ES modules + an import map, three.js served locally.
// ─────────────────────────────────────────────────────────────────────────────
import * as THREE from 'three';
import { OrbitControls } from './lib/OrbitControls.js';

const G = {};                       // everything interesting hangs off here
window.GARGANTUA = G;

// ── constants of the geometry ────────────────────────────────────────────────
const M = 1.0;                      // mass in geometric units; sets all lengths
const R_HORIZON = 2 * M;
const R_PHOTON = 3 * M;
const B_CRIT = 3 * Math.sqrt(3) * M;   // 5.196152...M

// Angular radius of the shadow for a *static* observer at radius r:
//     sin θ = b_c · sqrt(1 - 2M/r) / r
// This is the number Stage 1 has to reproduce on screen.
function shadowAngle(r) {
    const s = (B_CRIT / r) * Math.sqrt(Math.max(1 - 2 * M / r, 0));
    return Math.asin(Math.min(1, s));
}
G.shadowAngle = shadowAngle;
G.consts = { M, R_HORIZON, R_PHOTON, B_CRIT };

const DEBUG_NAMES = [
    '0 · beauty', '1 · capture mask', '2 · winding φ', '3 · closest approach',
    '4 · deflection α', '5 · step count', '6 · impact parameter b',
    '7 · escape direction', '8 · photon ring', '9 · unlensed sky'
];

function fail(msg) {
    document.getElementById('errMsg').textContent = msg;
    document.getElementById('err').style.display = 'flex';
    const b = document.getElementById('boot'); if (b) b.style.display = 'none';
}

// ── boot ─────────────────────────────────────────────────────────────────────
async function boot() {
    // shaders are plain files fetched at runtime — keeps the "no build step"
    // promise, but it does mean the page must be served over http(s)
    let vert, frag;
    try {
        const [v, f] = await Promise.all([
            fetch('./shaders/gargantua.vert.glsl'),
            fetch('./shaders/gargantua.frag.glsl')
        ]);
        if (!v.ok || !f.ok) throw new Error(`shader fetch: ${v.status} / ${f.status}`);
        vert = await v.text();
        frag = await f.text();
    } catch (e) {
        fail('Could not load the shader files.\n\n' + e.message +
             '\n\nGARGANTUA must be served over http(s), not opened from disk.' +
             '\nRun:  python3 -m http.server 8080   then open  http://localhost:8080/');
        return;
    }

    const canvas = document.getElementById('view');
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas, antialias: false, powerPreference: 'high-performance'
        });
    } catch (e) {
        fail('WebGL is unavailable in this browser.\n\n' + e.message);
        return;
    }
    const DPR_CAP = 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();

    // The fragment shader builds its own rays, so this camera exists purely to
    // be driven by OrbitControls and read back as a frame.
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1e6);
    camera.position.set(0, 4.5, 26);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.2 * M;      // never let the observer inside 2M
    controls.maxDistance = 400 * M;
    controls.enablePan = false;
    controls.target.set(0, 0, 0);

    // The pass itself: one clip-space quad, all the physics in the fragment.
    const uniforms = {
        uRes:        { value: new THREE.Vector2(1, 1) },
        uCamPos:     { value: new THREE.Vector3() },
        uCamMat:     { value: new THREE.Matrix4() },
        uTanHalfFov: { value: Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) },
        uAspect:     { value: 1 },
        uM:          { value: M },
        uMaxSteps:   { value: 1000 },
        uDebug:      { value: 0 },
        uAA:         { value: 1 },
        uSkyGrid:    { value: 0.85 },
        uRingGain:   { value: 0.32 },
        uExposure:   { value: 1.0 }
    };
    G.uniforms = uniforms;

    const material = new THREE.ShaderMaterial({
        vertexShader: vert, fragmentShader: frag, uniforms,
        depthTest: false, depthWrite: false,
        extensions: { derivatives: true }   // fwidth() in the sky grid
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    scene.add(quad);

    // surface any GLSL compile failure instead of showing a black screen
    renderer.compile(scene, camera);
    const gl = renderer.getContext();
    const progs = renderer.info.programs;
    if (progs && progs.length) {
        const p = progs[0].program;
        if (p && !gl.getProgramParameter(p, gl.LINK_STATUS)) {
            fail('Shader failed to link.\n\n' + (gl.getProgramInfoLog(p) || 'no log'));
            return;
        }
    }
    G.shaderOK = true;

    // ── sizing ───────────────────────────────────────────────────────────────
    function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_CAP));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const buf = new THREE.Vector2();
        renderer.getDrawingBufferSize(buf);
        uniforms.uRes.value.set(buf.x, buf.y);
        uniforms.uAspect.value = w / h;
        uniforms.uTanHalfFov.value = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5);
        const el = document.getElementById('tRes');
        if (el) el.textContent = `${buf.x}×${buf.y}`;
    }
    window.addEventListener('resize', resize);
    resize();

    // ── WebGL context loss ───────────────────────────────────────────────────
    canvas.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        G.contextLost = true;
        const b = document.getElementById('boot');
        b.style.display = 'flex'; b.style.opacity = '1';
        b.querySelector('.t').textContent = 'GPU context lost — restoring…';
    });
    canvas.addEventListener('webglcontextrestored', () => {
        G.contextLost = false;
        resize();
        const b = document.getElementById('boot');
        b.style.opacity = '0'; setTimeout(() => { b.style.display = 'none'; }, 600);
    });

    // ── debug view buttons ───────────────────────────────────────────────────
    const btnWrap = document.getElementById('dbgBtns');
    for (let i = 0; i <= 9; i++) {
        const b = document.createElement('button');
        b.className = 'db' + (i === 0 ? ' on' : '');
        b.textContent = String(i);
        b.dataset.d = String(i);
        b.onclick = () => setDebug(i);
        btnWrap.appendChild(b);
    }
    function setDebug(i) {
        uniforms.uDebug.value = i;
        document.querySelectorAll('.db').forEach(b => b.classList.toggle('on', +b.dataset.d === i));
        document.getElementById('dbgName').textContent = DEBUG_NAMES[i];
    }
    G.setDebug = setDebug;

    // ── hotkeys ──────────────────────────────────────────────────────────────
    let hudHidden = false;
    window.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') { setDebug(+e.key); return; }
        const k = e.key.toLowerCase();
        if (k === 'h') {
            hudHidden = !hudHidden;
            document.querySelectorAll('.hud').forEach(el => el.style.display = hudHidden ? 'none' : '');
        } else if (k === 'r') {
            camera.position.set(0, 4.5, 26); controls.target.set(0, 0, 0); controls.update();
        } else if (k === 'v') {
            console.log('[GARGANTUA] shadow verification', showMeasurement());
        }
    });

    // ── measure the shadow straight off the framebuffer ──────────────────────
    // Walk a horizontal line out from the screen centre and find where the
    // capture mask flips. Converting that pixel radius through the camera
    // frustum gives the observed angular radius of the shadow, which is then
    // compared against the analytic value.
    function verifyShadow() {
        const prevDebug = uniforms.uDebug.value;
        uniforms.uDebug.value = 1;                 // capture mask: black in, white out
        renderer.render(scene, camera);

        const buf = new THREE.Vector2();
        renderer.getDrawingBufferSize(buf);
        const W = buf.x | 0, H = buf.y | 0;
        const cx = W >> 1, cy = H >> 1;
        const strip = new Uint8Array(W * 4);
        const glc = renderer.getContext();
        glc.readPixels(0, cy, W, 1, glc.RGBA, glc.UNSIGNED_BYTE, strip);

        // centre must be inside the shadow for this to mean anything
        const centreDark = strip[cx * 4] < 8;
        let edge = -1;
        for (let x = cx; x < W; x++) {
            if (strip[x * 4] > 128) { edge = x; break; }
        }
        uniforms.uDebug.value = prevDebug;

        if (!centreDark || edge < 0) {
            return { ok: false, reason: centreDark ? 'shadow edge off-screen' : 'centre not inside shadow' };
        }

        const rPix = edge - cx;
        // pixels -> angle through the frustum (uv is normalised by half-height)
        const tanHalf = uniforms.uTanHalfFov.value;
        const measured = Math.atan((rPix / (H / 2)) * tanHalf);
        const r = camera.position.length();
        const theory = shadowAngle(r);
        const errPct = Math.abs(measured - theory) / theory * 100;

        return {
            ok: true, cameraR: r, pixelRadius: rPix,
            measuredDeg: measured * 180 / Math.PI,
            theoryDeg: theory * 180 / Math.PI,
            errorPercent: errPct,
            bCrit: B_CRIT
        };
    }
    G.verifyShadow = verifyShadow;

    // ── HUD ──────────────────────────────────────────────────────────────────
    const el = id => document.getElementById(id);
    el('tM').textContent = M.toFixed(2);
    el('tH').textContent = R_HORIZON.toFixed(2) + ' M';
    el('tP').textContent = R_PHOTON.toFixed(2) + ' M';
    el('tB').textContent = B_CRIT.toFixed(4) + ' M';
    el('tSt').textContent = String(uniforms.uMaxSteps.value);

    let fFrames = 0, fLast = performance.now(), hudLast = 0;
    let lastCamKey = '', settledAt = 0, measuredKey = null;

    function showMeasurement() {
        const v = verifyShadow();
        if (v.ok) {
            el('tMe').textContent = v.measuredDeg.toFixed(3) + '\u00b0';
            const agree = el('tAg');
            agree.textContent = v.errorPercent.toFixed(2) + '% err';
            agree.className = v.errorPercent < 2 ? 'ok' : '';
        } else {
            el('tMe').textContent = '\u2014';
            el('tAg').textContent = v.reason;
            el('tAg').className = '';
        }
        return v;
    }
    G.showMeasurement = showMeasurement;

    function updateHUD(now) {
        fFrames++;
        if (now - fLast > 500) {
            el('tFps').textContent = Math.round(fFrames * 1000 / (now - fLast));
            fFrames = 0; fLast = now;
        }
        if (now - hudLast < 200) return;
        hudLast = now;

        const r = camera.position.length();
        el('tR').textContent = r.toFixed(2) + ' M';
        el('tTh').textContent = (shadowAngle(r) * 180 / Math.PI).toFixed(3) + '\u00b0';

        // Measuring means an extra full-frame render plus a readPixels stall, so
        // only do it once the view has actually stopped moving.
        const key = r.toFixed(4) + '|' + uniforms.uRes.value.x;
        if (key !== lastCamKey) { lastCamKey = key; settledAt = now; el('tAg').textContent = '\u2026'; }
        else if (measuredKey !== key && now - settledAt > 400) {
            measuredKey = key;
            showMeasurement();
        }
    }

    // ── frame ────────────────────────────────────────────────────────────────
    function frame(now) {
        requestAnimationFrame(frame);
        if (G.contextLost) return;
        controls.update();
        camera.updateMatrixWorld();
        uniforms.uCamPos.value.copy(camera.position);
        uniforms.uCamMat.value.copy(camera.matrixWorld);
        renderer.render(scene, camera);
        updateHUD(now);
    }

    G.renderer = renderer; G.camera = camera; G.controls = controls; G.scene = scene;
    G.ready = true;

    const b = document.getElementById('boot');
    b.style.opacity = '0';
    setTimeout(() => b.remove(), 650);

    requestAnimationFrame(frame);
}

boot().catch(e => fail('Unexpected start-up failure.\n\n' + (e && e.stack ? e.stack : e)));
