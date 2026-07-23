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
const R_ISCO = 6 * M;                  // innermost stable circular orbit
const B_CRIT = 3 * Math.sqrt(3) * M;   // 5.196152...M

// Angular radius of the shadow for a *static* observer at radius r:
//     sin θ = b_c · sqrt(1 - 2M/r) / r
// This is the number Stage 1 has to reproduce on screen.
function shadowAngle(r) {
    const s = (B_CRIT / r) * Math.sqrt(Math.max(1 - 2 * M / r, 0));
    return Math.asin(Math.min(1, s));
}
G.shadowAngle = shadowAngle;
G.consts = { M, R_HORIZON, R_PHOTON, R_ISCO, B_CRIT };

const DEBUG_NAMES = [
    '0 · beauty', '1 · capture mask', '2 · redshift factor g',
    '3 · plane crossings', '4 · deflection α', '5 · step count',
    '6 · impact parameter b', '7 · escape direction', '8 · photon ring',
    '9 · unlensed sky'
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
    let vert, frag, fBright, fBlur, fComposite;
    try {
        const names = ['gargantua.vert', 'gargantua.frag',
                       'post.bright', 'post.blur', 'post.composite'];
        const res = await Promise.all(names.map(n => fetch(`./shaders/${n}.glsl`)));
        const bad = res.find(r => !r.ok);
        if (bad) throw new Error(`shader fetch failed: ${bad.url} -> ${bad.status}`);
        const src = await Promise.all(res.map(r => r.text()));
        [vert, frag, fBright, fBlur, fComposite] = src;
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
    G.dprCap = 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, G.dprCap));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor(0x000000, 1);

    const scene = new THREE.Scene();

    // The fragment shader builds its own rays, so this camera exists purely to
    // be driven by OrbitControls and read back as a frame.
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1e6);
    camera.position.set(0, 5.0, 30);

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
        uSkyGrid:    { value: 0.0 },      // legacy calibration cage, off by default
        uStarBright:  { value: 1.0 },
        uStarDensity: { value: 1.0 },
        uMilkyWay:    { value: 1.0 },
        uNebula:      { value: 1.0 },
        uRingGain:   { value: 0.32 },
        uTime:       { value: 0 },

        // ── accretion disk ──────────────────────────────────────────────────
        uDiskIn:      { value: R_ISCO },   // ISCO: no stable orbits inside 6M
        uDiskOut:     { value: 15 * M },
        uDiskOpacity: { value: 1.0 },
        uDiskBright:  { value: 2.6 },
        uTempScale:   { value: 3500 },     // kelvin at the profile peak
        uTurb:        { value: 0.55 },
        uFlowSpeed:   { value: 1.0 },
        uDoppler:     { value: 1 },        // 0 disables beaming + redshift
        uSpinSign:    { value: 1 }         // flip to reverse the rotation
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

    // ── post-processing pipeline ────────────────────────────────────────────
    // Hand-rolled rather than EffectComposer, so the project stays at five
    // files with no extra example modules to vendor.
    const HALF = THREE.HalfFloatType;
    const rtOpts = { type: HALF, minFilter: THREE.LinearFilter,
                     magFilter: THREE.LinearFilter, depthBuffer: false, stencilBuffer: false };
    const rtScene = new THREE.WebGLRenderTarget(1, 1, rtOpts);

    const BLOOM_LEVELS = 4;
    const bloomRT = [];      // [level] = { a, b }  ping-pong pair
    for (let i = 0; i < BLOOM_LEVELS; i++) {
        bloomRT.push({ a: new THREE.WebGLRenderTarget(1, 1, rtOpts),
                       b: new THREE.WebGLRenderTarget(1, 1, rtOpts) });
    }

    // a scene of its own for the full-screen post passes
    const postScene = new THREE.Scene();
    const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postGeo = new THREE.PlaneGeometry(2, 2);
    const postQuad = new THREE.Mesh(postGeo, null);
    postQuad.frustumCulled = false;
    postScene.add(postQuad);

    const uBright = { tScene: { value: null }, uThreshold: { value: 1.25 }, uKnee: { value: 0.6 } };
    const matBright = new THREE.ShaderMaterial({
        vertexShader: vert, fragmentShader: fBright, uniforms: uBright,
        depthTest: false, depthWrite: false });

    const uBlur = { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } };
    const matBlur = new THREE.ShaderMaterial({
        vertexShader: vert, fragmentShader: fBlur, uniforms: uBlur,
        depthTest: false, depthWrite: false });

    const uComp = {
        tScene: { value: null }, tB0: { value: null }, tB1: { value: null },
        tB2: { value: null }, tB3: { value: null },
        uRes:      { value: new THREE.Vector2(1, 1) },
        uExposure: { value: 1.0 },
        uBloom:    { value: 0.95 },
        uVignette: { value: 0.55 },
        uGrain:    { value: 0.035 },
        uChroma:   { value: 0.0022 },
        uTime:     { value: 0 },
        uPostOn:   { value: 1 }
    };
    const matComposite = new THREE.ShaderMaterial({
        vertexShader: vert, fragmentShader: fComposite, uniforms: uComp,
        depthTest: false, depthWrite: false });
    G.post = uComp;

    function pass(mat, target) {
        postQuad.material = mat;
        renderer.setRenderTarget(target || null);
        renderer.render(postScene, postCam);
    }

    function renderFrame() {
        // 1. the physics, into a linear HDR buffer
        renderer.setRenderTarget(rtScene);
        renderer.render(scene, camera);

        const dbg = uniforms.uDebug.value;
        const beauty = (dbg === 0 || dbg === 9);
        uComp.uPostOn.value = beauty ? 1 : 0;

        if (beauty && uComp.uBloom.value > 0.0001) {
            // 2. bright pass into level 0
            uBright.tScene.value = rtScene.texture;
            pass(matBright, bloomRT[0].a);

            // 3. blur each level, then downsample into the next
            for (let i = 0; i < BLOOM_LEVELS; i++) {
                const w = bloomRT[i].a.width, h = bloomRT[i].a.height;
                uBlur.tSrc.value = bloomRT[i].a.texture;
                uBlur.uDir.value.set(1 / w, 0);
                pass(matBlur, bloomRT[i].b);
                uBlur.tSrc.value = bloomRT[i].b.texture;
                uBlur.uDir.value.set(0, 1 / h);
                pass(matBlur, bloomRT[i].a);
                if (i + 1 < BLOOM_LEVELS) {
                    uBlur.tSrc.value = bloomRT[i].a.texture;
                    uBlur.uDir.value.set(0, 0);           // pure downsample
                    pass(matBlur, bloomRT[i + 1].a);
                }
            }
        }

        // 4. composite to the screen
        uComp.tScene.value = rtScene.texture;
        uComp.tB0.value = bloomRT[0].a.texture;
        uComp.tB1.value = bloomRT[1].a.texture;
        uComp.tB2.value = bloomRT[2].a.texture;
        uComp.tB3.value = bloomRT[3].a.texture;
        pass(matComposite, null);
    }
    G.renderFrame = renderFrame;

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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, G.dprCap || 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const buf = new THREE.Vector2();
        renderer.getDrawingBufferSize(buf);
        uniforms.uRes.value.set(buf.x, buf.y);
        rtScene.setSize(buf.x, buf.y);
        uComp.uRes.value.set(buf.x, buf.y);
        for (let i = 0; i < BLOOM_LEVELS; i++) {
            const d = Math.pow(2, i + 1);
            const w = Math.max(1, Math.floor(buf.x / d));
            const h = Math.max(1, Math.floor(buf.y / d));
            bloomRT[i].a.setSize(w, h);
            bloomRT[i].b.setSize(w, h);
        }
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
        // the GPU threw away every texture and framebuffer; force three.js to
        // recreate them rather than quietly rendering into dead targets
        try{
            rtScene.dispose();
            bloomRT.forEach(b=>{ b.a.dispose(); b.b.dispose(); });
            material.needsUpdate = true;
            matBright.needsUpdate = true; matBlur.needsUpdate = true; matComposite.needsUpdate = true;
        }catch(_){}
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
            camera.position.set(0, 5.0, 30); controls.target.set(0, 0, 0); controls.update();
        } else if (k === 'v') {
            console.log('[GARGANTUA] shadow verification', showMeasurement());
        } else if (k === 'p') { toggleDrawer();
        } else if (k === 'a') { toggleAudio();
        } else if (k === 's') { saveScreenshot();
        } else if (k === 'u') { const u=shotURL(); console.log('[GARGANTUA] deterministic frame URL:\n'+u);
            try{ navigator.clipboard.writeText(u); toastMsg('Frame URL copied'); }catch(_){}
        } else if (k === 'escape') { stopPath();
        } else if (k === '[') { setQuality(quality==='high'?'medium':'low');
        } else if (k === ']') { setQuality(quality==='low'?'medium':'high'); }
    });

    // ── measure the shadow straight off the framebuffer ──────────────────────
    // Walk a horizontal line out from the screen centre and find where the
    // capture mask flips. Converting that pixel radius through the camera
    // frustum gives the observed angular radius of the shadow, which is then
    // compared against the analytic value.
    function verifyShadow() {
        const prevDebug = uniforms.uDebug.value;
        // Sync the camera into the uniforms first: callers may have moved it
        // without a frame having been drawn, and measuring a stale frame gives
        // a confidently wrong answer.
        camera.updateMatrixWorld();
        uniforms.uCamPos.value.copy(camera.position);
        uniforms.uCamMat.value.copy(camera.matrixWorld);
        uniforms.uDebug.value = 1;                 // capture mask: black in, white out
        renderFrame();                             // through the same path the eye sees

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


    /* ═══════════════════════════════════════════════════════════════════════
       STAGE 5 · CONTROL
       21 live parameters, presets, cinematic paths, quality profiles,
       persistence, deterministic screenshot mode, audio, and a context-loss
       recovery that actually rebuilds the render targets.
       ═══════════════════════════════════════════════════════════════════════ */

    // Which uniform object a parameter lives in: the physics pass or the grade.
    const SIM='sim', POST='post';
    const PARAMS = [
      // ── physics ────────────────────────────────────────────────────────
      {k:'uM',           src:SIM,  grp:'PHYSICS', label:'Mass M',            min:0.4,  max:2.0,  step:0.01, dp:2},
      {k:'uMaxSteps',    src:SIM,  grp:'PHYSICS', label:'Integration steps', min:120,  max:1400, step:10,   dp:0, int:true},
      // ── accretion disk ─────────────────────────────────────────────────
      {k:'uDiskIn',      src:SIM,  grp:'ACCRETION DISK', label:'Inner edge (ISCO)', min:3,  max:14,  step:0.1, dp:1, unit:'M'},
      {k:'uDiskOut',     src:SIM,  grp:'ACCRETION DISK', label:'Outer edge',        min:8,  max:40,  step:0.5, dp:1, unit:'M'},
      {k:'uDiskBright',  src:SIM,  grp:'ACCRETION DISK', label:'Brightness',        min:0,  max:6,   step:0.05,dp:2},
      {k:'uTempScale',   src:SIM,  grp:'ACCRETION DISK', label:'Peak temperature',  min:1800,max:12000,step:50, dp:0, unit:'K'},
      {k:'uDiskOpacity', src:SIM,  grp:'ACCRETION DISK', label:'Opacity',           min:0,  max:1,   step:0.01,dp:2},
      {k:'uTurb',        src:SIM,  grp:'ACCRETION DISK', label:'Turbulence',        min:0,  max:1,   step:0.01,dp:2},
      {k:'uFlowSpeed',   src:SIM,  grp:'ACCRETION DISK', label:'Flow speed',        min:0,  max:6,   step:0.05,dp:2},
      {k:'uDoppler',     src:SIM,  grp:'ACCRETION DISK', label:'Doppler beaming',   min:0,  max:1,   step:1,   dp:0, bool:true},
      {k:'uSpinSign',    src:SIM,  grp:'ACCRETION DISK', label:'Rotation',          min:-1, max:1,   step:2,   dp:0, spin:true},
      // ── sky ────────────────────────────────────────────────────────────
      {k:'uStarBright',  src:SIM,  grp:'SKY', label:'Star brightness', min:0, max:3,  step:0.02, dp:2},
      {k:'uStarDensity', src:SIM,  grp:'SKY', label:'Star density',    min:0.2,max:2.5,step:0.02, dp:2},
      {k:'uMilkyWay',    src:SIM,  grp:'SKY', label:'Milky Way',       min:0, max:3,  step:0.02, dp:2},
      {k:'uNebula',      src:SIM,  grp:'SKY', label:'Nebula',          min:0, max:3,  step:0.02, dp:2},
      {k:'uRingGain',    src:SIM,  grp:'SKY', label:'Photon ring gain',min:0, max:2,  step:0.01, dp:2},
      // ── grade ──────────────────────────────────────────────────────────
      {k:'uExposure',    src:POST, grp:'GRADE', label:'Exposure',            min:0.05,max:4, step:0.01,dp:2},
      {k:'uBloom',       src:POST, grp:'GRADE', label:'Bloom',               min:0,  max:3,  step:0.01,dp:2},
      {k:'uVignette',    src:POST, grp:'GRADE', label:'Vignette',            min:0,  max:1,  step:0.01,dp:2},
      {k:'uGrain',       src:POST, grp:'GRADE', label:'Film grain',          min:0,  max:0.2,step:0.002,dp:3},
      {k:'uChroma',      src:POST, grp:'GRADE', label:'Chromatic aberration',min:0,  max:0.02,step:0.0002,dp:4}
    ];
    const uniOf = p => (p.src===POST ? uComp : uniforms);
    const getP  = p => uniOf(p)[p.k].value;
    const setP  = (p,v) => { uniOf(p)[p.k].value = p.int ? Math.round(v) : v; };
    G.PARAMS = PARAMS;

    /* ── quality profiles ───────────────────────────────────────────────── */
    const QUALITY = {
      low:    {steps:320,  aa:1, dpr:1.0, bloom:true,  label:'LOW'},
      medium: {steps:700,  aa:1, dpr:1.5, bloom:true,  label:'MEDIUM'},
      high:   {steps:1200, aa:2, dpr:2.0, bloom:true,  label:'HIGH'}
    };
    let quality='medium';
    function setQuality(q){
      if(!QUALITY[q]) return;
      quality=q; const Q=QUALITY[q];
      uniforms.uMaxSteps.value=Q.steps;
      uniforms.uAA.value=Q.aa;
      G.dprCap=Q.dpr;
      resize();
      syncPanel();
      document.querySelectorAll('[data-q]').forEach(b=>b.classList.toggle('on', b.dataset.q===q));
    }
    G.setQuality=setQuality;

    /* ── presets ────────────────────────────────────────────────────────── */
    const PRESETS = {
      cinematic: { label:'CINEMATIC', cam:[0,5,30],
        v:{uDiskIn:6, uDiskOut:15, uDiskBright:2.6, uTempScale:3500, uDiskOpacity:1, uTurb:0.55,
           uFlowSpeed:1, uDoppler:1, uSpinSign:1, uStarBright:1, uStarDensity:1, uMilkyWay:1,
           uNebula:1, uRingGain:0.32, uExposure:1, uBloom:0.95, uVignette:0.55, uGrain:0.035, uChroma:0.0022}},
      scientific:{ label:'SCIENTIFIC', cam:[0,0,20],
        v:{uDiskIn:6, uDiskOut:18, uDiskBright:1.4, uTempScale:6500, uDiskOpacity:1, uTurb:0.2,
           uFlowSpeed:0.4, uDoppler:1, uSpinSign:1, uStarBright:0.7, uStarDensity:1.2, uMilkyWay:0.5,
           uNebula:0.3, uRingGain:0.8, uExposure:1.1, uBloom:0.2, uVignette:0, uGrain:0, uChroma:0}},
      poster:   { label:'POSTER', cam:[0,2.2,26],
        v:{uDiskIn:6, uDiskOut:13, uDiskBright:3.4, uTempScale:3100, uDiskOpacity:1, uTurb:0.7,
           uFlowSpeed:1.4, uDoppler:1, uSpinSign:1, uStarBright:1.3, uStarDensity:1.4, uMilkyWay:1.5,
           uNebula:1.6, uRingGain:0.5, uExposure:1.15, uBloom:1.6, uVignette:0.75, uGrain:0.02, uChroma:0.004}},
      polar:    { label:'POLAR', cam:[0,34,3],
        v:{uDiskIn:6, uDiskOut:20, uDiskBright:2.2, uTempScale:4200, uDiskOpacity:1, uTurb:0.6,
           uFlowSpeed:2.2, uDoppler:1, uSpinSign:1, uStarBright:1, uStarDensity:1, uMilkyWay:1.2,
           uNebula:1, uRingGain:0.30, uExposure:1, uBloom:1.1, uVignette:0.5, uGrain:0.03, uChroma:0.002}}
    };
    let presetName='cinematic';
    function applyPreset(name, moveCam){
      const P=PRESETS[name]; if(!P) return;
      presetName=name;
      for(const p of PARAMS) if(P.v[p.k]!=null) setP(p, P.v[p.k]);
      if(moveCam!==false && P.cam){ camera.position.set(P.cam[0],P.cam[1],P.cam[2]); controls.target.set(0,0,0); controls.update(); }
      syncPanel(); savePrefs();
      document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('on', b.dataset.preset===name));
    }
    G.applyPreset=applyPreset;

    /* ── cinematic camera paths ─────────────────────────────────────────── */
    /* Keyframes are (radius, elevation°, azimuth°, seconds). The camera is
       eased between them; OrbitControls is suspended while a path runs. */
    const PATHS = {
      orbit:  {label:'ORBIT',  keys:[[30,9,0,0],[30,9,180,14],[30,9,360,28]]},
      dive:   {label:'DIVE',   keys:[[70,22,0,0],[30,12,60,9],[12,5,110,17],[7.5,2,150,23]]},
      polar:  {label:'POLAR',  keys:[[34,86,0,0],[30,40,90,8],[26,6,170,17],[30,60,250,25]]},
      edge:   {label:'EDGE-ON',keys:[[42,1.5,0,0],[26,0.6,90,10],[18,0.3,180,19],[34,2,300,28]]}
    };
    let cine=null;
    function startPath(name){
      const P=PATHS[name]; if(!P) return;
      cine={name, keys:P.keys, t:0, dur:P.keys[P.keys.length-1][3]};
      controls.enabled=false;
      document.getElementById('cinebar').classList.add('on');
      document.getElementById('cineName').textContent=P.label;
      document.querySelectorAll('[data-path]').forEach(b=>b.classList.toggle('on', b.dataset.path===name));
    }
    function stopPath(){
      cine=null; controls.enabled=true;
      document.getElementById('cinebar').classList.remove('on');
      document.querySelectorAll('[data-path]').forEach(b=>b.classList.remove('on'));
    }
    G.startPath=startPath; G.stopPath=stopPath;
    G.stepPath=(dt)=>stepPath(dt);          // exposed so the path can be verified
    G.pathTime=()=>cine?cine.t:null;
    G.PATHS=PATHS;
    const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
    function stepPath(dt){
      if(!cine) return;
      cine.t+=dt;
      if(cine.t>=cine.dur){ cine.t=cine.dur; }
      const K=cine.keys;
      let i=0; while(i<K.length-2 && cine.t>K[i+1][3]) i++;
      const a=K[i], b=K[i+1]||K[i];
      const span=Math.max(1e-3,(b[3]-a[3]));
      const u=ease(Math.min(1,Math.max(0,(cine.t-a[3])/span)));
      const r  = a[0]+(b[0]-a[0])*u;
      const el = (a[1]+(b[1]-a[1])*u)*Math.PI/180;
      const az = (a[2]+(b[2]-a[2])*u)*Math.PI/180;
      camera.position.set(r*Math.cos(el)*Math.sin(az), r*Math.sin(el), r*Math.cos(el)*Math.cos(az));
      camera.lookAt(0,0,0); controls.target.set(0,0,0);
      const f=document.getElementById('cineFill'); if(f) f.style.width=(100*cine.t/cine.dur).toFixed(1)+'%';
      if(cine.t>=cine.dur) stopPath();
    }

    /* ── persistence ────────────────────────────────────────────────────── */
    const PREF_KEY='gargantua_prefs_v1';
    function savePrefs(){
      try{
        const v={}; PARAMS.forEach(p=>v[p.k]=getP(p));
        localStorage.setItem(PREF_KEY, JSON.stringify({v, quality, preset:presetName,
          cam:[camera.position.x,camera.position.y,camera.position.z], audio:audioOn}));
      }catch(_){}
    }
    function loadPrefs(){
      try{
        const d=JSON.parse(localStorage.getItem(PREF_KEY)||'null'); if(!d) return false;
        if(d.v) PARAMS.forEach(p=>{ if(d.v[p.k]!=null) setP(p,d.v[p.k]); });
        if(d.quality) setQuality(d.quality);
        if(d.preset) presetName=d.preset;
        if(d.cam) camera.position.set(d.cam[0],d.cam[1],d.cam[2]);
        return true;
      }catch(_){ return false; }
    }
    G.savePrefs=savePrefs;

    /* ── audio ──────────────────────────────────────────────────────────── */
    /* A drone generated from the orbital frequency at the ISCO, so the pitch is
       tied to the hole you are actually looking at rather than an arbitrary note. */
    let actx=null, audioOn=false, aNodes=null;
    function iscoHz(){
      const M=uniforms.uM.value, r=Math.max(uniforms.uDiskIn.value, 3.1);
      const omega=Math.sqrt(M/(r*r*r));      // geometric units
      return 42 + omega*260;                 // mapped into a low audible band
    }
    function audioStart(){
      try{
        actx = actx || new (window.AudioContext||window.webkitAudioContext)();
        if(actx.state==='suspended') actx.resume();
        if(aNodes) return;
        const g=actx.createGain(); g.gain.value=0.0; g.connect(actx.destination);
        const f=actx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=420; f.Q.value=0.7; f.connect(g);
        const o1=actx.createOscillator(), o2=actx.createOscillator(), o3=actx.createOscillator();
        o1.type='sine'; o2.type='sine'; o3.type='triangle';
        o1.connect(f); o2.connect(f); o3.connect(f);
        o1.start(); o2.start(); o3.start();
        aNodes={g,f,o1,o2,o3};
        g.gain.linearRampToValueAtTime(0.12, actx.currentTime+1.5);
      }catch(_){ audioOn=false; }
    }
    function audioStop(){
      if(!aNodes||!actx) return;
      try{
        aNodes.g.gain.linearRampToValueAtTime(0, actx.currentTime+0.5);
        const n=aNodes; aNodes=null;
        setTimeout(()=>{ try{ n.o1.stop(); n.o2.stop(); n.o3.stop(); }catch(_){} }, 700);
      }catch(_){}
    }
    function audioUpdate(){
      if(!aNodes||!actx) return;
      const base=iscoHz();
      const d=camera.position.length();
      const near=Math.max(0, Math.min(1, (60-d)/50));      // closer = brighter, louder
      aNodes.o1.frequency.setTargetAtTime(base,        actx.currentTime, 0.4);
      aNodes.o2.frequency.setTargetAtTime(base*1.008,  actx.currentTime, 0.4);
      aNodes.o3.frequency.setTargetAtTime(base*0.5,    actx.currentTime, 0.4);
      aNodes.f.frequency.setTargetAtTime(300+near*900,  actx.currentTime, 0.5);
      aNodes.g.gain.setTargetAtTime(0.05+near*0.13,     actx.currentTime, 0.6);
    }
    function toggleAudio(on){
      audioOn = (on==null) ? !audioOn : on;
      if(audioOn) audioStart(); else audioStop();
      const b=document.getElementById('btnAudio'); if(b) b.classList.toggle('on',audioOn);
      savePrefs();
    }
    G.toggleAudio=toggleAudio;

    /* ── the control drawer ─────────────────────────────────────────────── */
    function buildPanel(){
      const wrap=document.createElement('div');
      wrap.className='hud drawer'; wrap.id='drawer';
      let html=`<div class="dhead"><b>CONTROL · ${PARAMS.length} PARAMETERS</b>
        <button class="dclose" id="dClose">✕</button></div><div class="dbody">`;
      html+=`<div class="dgrp">PRESET</div><div class="btnrow">`+
        Object.keys(PRESETS).map(k=>`<button class="tbtn" data-preset="${k}">${PRESETS[k].label}</button>`).join('')+`</div>`;
      html+=`<div class="dgrp">QUALITY</div><div class="btnrow">`+
        Object.keys(QUALITY).map(k=>`<button class="tbtn" data-q="${k}">${QUALITY[k].label}</button>`).join('')+`</div>`;
      html+=`<div class="dgrp">CINEMATIC PATH</div><div class="btnrow">`+
        Object.keys(PATHS).map(k=>`<button class="tbtn amber" data-path="${k}">${PATHS[k].label}</button>`).join('')+
        `<button class="tbtn" id="pathStop">STOP</button></div>`;
      html+=`<div class="dgrp">AUDIO</div><div class="btnrow">
        <button class="tbtn" id="btnAudio">DRONE</button>
        <button class="tbtn" id="btnShot">SCREENSHOT</button>
        <button class="tbtn" id="btnReset">RESET ALL</button></div>`;
      let grp=null;
      for(const p of PARAMS){
        if(p.grp!==grp){ grp=p.grp; html+=`<div class="dgrp">${grp}</div>`; }
        html+=`<div class="prow" data-p="${p.k}">
          <div class="plab"><span>${p.label}</span><v id="v_${p.k}">—</v></div>
          <input type="range" id="s_${p.k}" min="${p.min}" max="${p.max}" step="${p.step}">
        </div>`;
      }
      html+=`</div>`;
      wrap.innerHTML=html;
      document.body.appendChild(wrap);

      const tab=document.createElement('button');
      tab.className='hud dtab'; tab.id='dTab'; tab.textContent='CONTROL';
      document.body.appendChild(tab);

      const cb=document.createElement('div');
      cb.className='hud cinebar'; cb.id='cinebar';
      cb.innerHTML=`<span id="cineName">PATH</span><div class="cbar"><div class="cfill" id="cineFill"></div></div>
        <button class="tbtn" id="cineStop" style="flex:0 0 auto">STOP</button>`;
      document.body.appendChild(cb);

      // wiring
      tab.onclick=()=>toggleDrawer(true);
      document.getElementById('dClose').onclick=()=>toggleDrawer(false);
      document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>applyPreset(b.dataset.preset));
      document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{ setQuality(b.dataset.q); savePrefs(); });
      document.querySelectorAll('[data-path]').forEach(b=>b.onclick=()=>startPath(b.dataset.path));
      document.getElementById('pathStop').onclick=stopPath;
      document.getElementById('cineStop').onclick=stopPath;
      document.getElementById('btnAudio').onclick=()=>toggleAudio();
      document.getElementById('btnShot').onclick=()=>saveScreenshot();
      document.getElementById('btnReset').onclick=()=>{ try{localStorage.removeItem(PREF_KEY);}catch(_){}
        applyPreset('cinematic'); setQuality('medium'); };
      for(const p of PARAMS){
        const el=document.getElementById('s_'+p.k);
        el.addEventListener('input',()=>{ setP(p, parseFloat(el.value)); paintValue(p); savePrefs(); });
      }
    }
    function paintValue(p){
      const el=document.getElementById('v_'+p.k); if(!el) return;
      const v=getP(p);
      el.textContent = p.bool ? (v>0.5?'ON':'OFF')
                     : p.spin ? (v>0?'PROGRADE':'RETROGRADE')
                     : v.toFixed(p.dp)+(p.unit?(' '+p.unit):'');
    }
    function syncPanel(){
      for(const p of PARAMS){
        const el=document.getElementById('s_'+p.k); if(el) el.value=getP(p);
        paintValue(p);
      }
    }
    let drawerOpen=false;
    function toggleDrawer(on){
      drawerOpen = (on==null)? !drawerOpen : on;
      document.getElementById('drawer').classList.toggle('open',drawerOpen);
      document.body.classList.toggle('drawer-open',drawerOpen);
    }
    G.toggleDrawer=toggleDrawer;

    /* ── screenshots, and the deterministic URL mode ────────────────────── */
    function frameHash(){
      const v={}; PARAMS.forEach(p=>v[p.k]=+getP(p).toFixed(5));
      return { p:v, q:quality, pre:presetName,
               c:[+camera.position.x.toFixed(3),+camera.position.y.toFixed(3),+camera.position.z.toFixed(3)],
               t:+uniforms.uTime.value.toFixed(3) };
    }
    function shotURL(){
      const d=frameHash();
      const q=new URLSearchParams();
      q.set('shot','1'); q.set('preset',d.pre); q.set('q',d.q);
      q.set('cam',d.c.join(',')); q.set('t',d.t);
      q.set('p', PARAMS.map(p=>+getP(p).toFixed(5)).join(','));
      return location.origin+location.pathname+'?'+q.toString();
    }
    G.shotURL=shotURL;
    function saveScreenshot(){
      renderFrame();
      try{
        const a=document.createElement('a');
        a.download='gargantua_'+Date.now()+'.png';
        a.href=renderer.domElement.toDataURL('image/png');
        a.click();
      }catch(e){ console.warn('screenshot failed', e); }
    }
    G.saveScreenshot=saveScreenshot;

    function applyURL(){
      const q=new URLSearchParams(location.search);
      if(!q.has('shot') && !q.has('preset') && !q.has('p')) return false;
      if(q.has('preset')) applyPreset(q.get('preset'), false);
      if(q.has('q')) setQuality(q.get('q'));
      if(q.has('p')){
        const vals=q.get('p').split(',').map(parseFloat);
        PARAMS.forEach((p,i)=>{ if(isFinite(vals[i])) setP(p,vals[i]); });
      }
      if(q.has('cam')){ const c=q.get('cam').split(',').map(parseFloat);
        if(c.length===3&&c.every(isFinite)){ camera.position.set(c[0],c[1],c[2]); controls.target.set(0,0,0); } }
      if(q.has('t')){ const t=parseFloat(q.get('t')); if(isFinite(t)) uniforms.uTime.value=t; }
      syncPanel();
      if(q.get('shot')==='1'){
        // deterministic: freeze the clock so the same URL is the same frame
        G.frozen=true;
        document.querySelectorAll('.hud').forEach(el=>{ if(el.id!=='shotNote') el.style.display='none'; });
        controls.enabled=false;
        if(q.get('dl')==='1') setTimeout(saveScreenshot, 900);
      }
      return true;
    }
    G.applyURL=applyURL;

    // ── HUD ──────────────────────────────────────────────────────────────────
    const el = id => document.getElementById(id);
    el('tM').textContent = M.toFixed(2);
    el('tH').textContent = R_HORIZON.toFixed(2) + ' M';
    el('tP').textContent = R_PHOTON.toFixed(2) + ' M';
    el('tB').textContent = B_CRIT.toFixed(4) + ' M';
    const iscoEl = el('tI'); if (iscoEl) iscoEl.textContent = R_ISCO.toFixed(2) + ' M';
    const dEl = el('tD');
    if (dEl) dEl.textContent = uniforms.uDiskIn.value.toFixed(1) + '–'
                             + uniforms.uDiskOut.value.toFixed(0) + ' M';
    el('tSt').textContent = String(uniforms.uMaxSteps.value);

    buildPanel();
    applyPreset('cinematic', false);
    const hadPrefs = loadPrefs();
    const fromURL = applyURL();
    if(!hadPrefs && !fromURL) applyPreset('cinematic', true);
    setQuality(quality);
    syncPanel();
    document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('on', b.dataset.preset===presetName));

    function toastMsg(m){
        let t=document.getElementById('gtoast');
        if(!t){ t=document.createElement('div'); t.id='gtoast'; t.className='hud';
            t.style.cssText='left:50%;bottom:96px;transform:translateX(-50%);background:rgba(6,10,16,.9);'+
              'border:1px solid var(--line2);border-radius:3px;padding:8px 15px;font-size:10px;'+
              'letter-spacing:.14em;color:var(--cyan);transition:opacity .4s';
            document.body.appendChild(t); }
        t.textContent=m; t.style.opacity='1';
        clearTimeout(t._h); t._h=setTimeout(()=>{ t.style.opacity='0'; }, 1600);
    }
    G.toast=toastMsg;

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
    const t0 = performance.now();
    let lastNow = performance.now();
    function frame(now) {
        requestAnimationFrame(frame);
        if (G.contextLost) return;
        const dt = Math.min(0.05, (now - lastNow) * 0.001); lastNow = now;
        if(!G.frozen) uniforms.uTime.value = (now - t0) * 0.001;
        stepPath(dt);
        if(audioOn) audioUpdate();
        controls.update();
        camera.updateMatrixWorld();
        uniforms.uCamPos.value.copy(camera.position);
        uniforms.uCamMat.value.copy(camera.matrixWorld);
        uComp.uTime.value = uniforms.uTime.value;
        renderFrame();
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
