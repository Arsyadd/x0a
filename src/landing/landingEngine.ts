// @ts-nocheck
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PHASES, STAGES, AGENTS, SCOPE_FAMILIES, SCOPE_ITEMS, RULES,
  JOURNEYS, ARCH_P, ARCH, LEVEL_TEXT, PROMPTS, WS_ECO, WS_STEPS,
  WS_TREE_GROUPS, WS_GATE, WS_TESTS
} from './landingData';
import { stageArt } from './landingArt';

gsap.registerPlugin(ScrollTrigger);

let isLandingActive = true;
let resetLandingScroll: (() => void) | null = null;

export function setLandingActive(active: boolean) {
  isLandingActive = active;
  if (active) {
    if (resetLandingScroll) resetLandingScroll();
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }
}

if (typeof window !== 'undefined') {
  (window as any).__x0a_setLandingActive = setLandingActive;
}

export function runLandingEngine(onLaunchApp: () => void) {
  const $ = (s: string, c: any = document) => c.querySelector(s);
  const $$ = (s: string, c: any = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  root.classList.add('js');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  function wrapWords(el: any) {
    if (!el) return;
    const frag = document.createDocumentFragment();
    Array.from(el.childNodes).forEach((node: any) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((tok: string) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = tok; frag.appendChild(s);
        });
      } else {
        if (node.classList) node.classList.add('w');
        frag.appendChild(node);
      }
    });
    el.textContent = '';
    el.appendChild(frag);
  }

  function splitChars(el: any) {
    const words = el.textContent.split(' ');
    el.textContent = '';
    words.forEach((w: string, wi: number) => {
      const ws = document.createElement('span'); ws.className = 'word';
      Array.from(w).forEach((chr: string) => {
        const c = document.createElement('span'); c.className = 'ch'; c.textContent = chr; ws.appendChild(c);
      });
      el.appendChild(ws);
      if (wi < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
    return $$('.ch', el);
  }

  function rollify() {
    $$('[data-roll]').forEach((el: any) => {
      if (el.querySelector('.roll')) return;
      const t = el.textContent.trim();
      el.textContent = '';
      const w = document.createElement('span'); w.className = 'roll';
      const i = document.createElement('span'); i.className = 'roll__in';
      const a = document.createElement('span'); a.textContent = t;
      const b = document.createElement('span'); b.textContent = t; b.setAttribute('aria-hidden', 'true');
      i.append(a, b); w.appendChild(i); el.appendChild(w);
    });
  }

  const LIGHT = { bg: [233, 236, 244], fg: [15, 18, 48] };
  const DARK = { bg: [12, 15, 43], fg: [237, 239, 252] };
  const theme = { v: 0 };
  function applyTheme(v: number) {
    theme.v = v;
    const mix = (a: number[], b: number[]) => a.map((x, i) => Math.round(lerp(x, b[i], v)));
    const bg = mix(LIGHT.bg, DARK.bg), fg = mix(LIGHT.fg, DARK.fg);
    root.style.setProperty('--bg', `rgb(${bg})`);
    root.style.setProperty('--fg', `rgb(${fg})`);
    root.style.setProperty('--muted', `rgba(${fg},.62)`);
    root.style.setProperty('--line', `rgba(${fg},.16)`);
    root.style.setProperty('--panel', `rgba(${bg},.72)`);
  }
  applyTheme(0);

  const base = { x: .36, y: .2, scale: 1, amp: .24, freq: 1.25, speed: .35, facet: 0, shift: 0, rings: 1, ny: .36, na: 1, ns: 1 };
  const P = (o: any) => Object.assign({}, base, o);
  const PRESETS: Record<string, any> = {
    hero:         P({ x: .56, y: .02, scale: 1, ny: .34, ns: .78, na: .55 }),
    manifesto:    P({ x: -.5, y: .02, scale: .62, amp: .13, freq: 1.6, speed: .22, facet: 1, shift: .3, rings: .55, ny: .16, na: .28 }),
    lifecycle:    P({ x: .32, y: .2, scale: .7, amp: .2, freq: 1.0, speed: .3, facet: 0, shift: .62, rings: .3, ny: .16, na: .25 }),
    agents:       P({ x: .5, y: -.1, scale: .8, amp: .18, freq: 1.3, speed: .3, facet: .5, shift: .35, rings: .5, ny: .16, na: .2 }),
    evidence:     P({ x: .52, y: .12, scale: .7, amp: .12, freq: 1.1, speed: .25, facet: 1, shift: .7, rings: .4, ny: .16, na: .22 }),
    gate:         P({ x: -.55, y: -.5, scale: .45, amp: .16, freq: 1.8, speed: .25, facet: .6, shift: .5, rings: .5, ny: .16, na: .18 }),
    rules:        P({ x: .55, y: 0, scale: .62, amp: .1, freq: 1.2, speed: .25, facet: 1, shift: .2, rings: .4, ny: .16, na: .18 }),
    workspace:    P({ x: .45, y: .18, scale: .95, amp: .18, freq: 1.0, speed: .3, facet: 0, shift: .45, rings: .2, ny: .16, na: .25 }),
    architecture: P({ x: -.52, y: -.35, scale: .5, amp: .16, freq: 1.4, speed: .28, facet: .4, shift: .85, rings: .5, ny: -.2, na: .18 }),
    ecosystems:   P({ x: .55, y: 0, scale: .75, amp: .2, freq: 1.4, speed: .3, facet: 0, shift: .15, rings: .6, ny: .16, na: .2 }),
    scope:        P({ x: -.5, y: .05, scale: .68, amp: .22, freq: 1.7, speed: .32, facet: .35, shift: .4, rings: .5, ny: .16, na: .22 }),
    journeys:     P({ x: .5, y: .05, scale: .7, amp: .2, freq: 1.5, speed: .3, facet: .2, shift: .55, rings: .5, ny: .16, na: .18 }),
    cta:          P({ x: .5, y: .12, scale: 1, amp: .26, freq: 1.1, speed: .4, facet: 0, shift: .8, rings: 1, ny: .16, na: .3 })
  };

  const life = (o: any) => Object.assign({}, PRESETS.lifecycle, o);
  PRESETS['phase-0'] = life({ shift: .1, facet: 0, freq: 1.0 });
  PRESETS['phase-1'] = life({ shift: .4, facet: .6, freq: 1.4 });
  PRESETS['phase-2'] = life({ shift: .75, facet: .3, freq: 2.0, amp: .28, speed: .5 });
  PRESETS['phase-3'] = life({ shift: .9, facet: 1, freq: .9, amp: .1 });
  PRESETS['phase-4'] = life({ shift: .55, facet: 0, freq: 1.2, speed: .5 });

  const eco = (o: any) => Object.assign({}, PRESETS.ecosystems, o);
  PRESETS['eco-evm']      = eco({ freq: 1.1, amp: .2, facet: 0, shift: .05 });
  PRESETS['eco-solana']   = eco({ freq: 1.9, amp: .24, facet: .2, shift: .3, speed: .55 });
  PRESETS['eco-move']     = eco({ freq: 1.0, amp: .1, facet: 1, shift: .5, scale: .85 });
  PRESETS['eco-cosmos']   = eco({ freq: 1.5, amp: .18, facet: .5, shift: .65 });
  PRESETS['eco-starknet'] = eco({ freq: 2.4, amp: .3, facet: 0, shift: .8, speed: .7, scale: .9 });
  PRESETS['eco-near']     = eco({ freq: .9, amp: .14, facet: .8, shift: .2 });
  PRESETS['eco-polkadot'] = eco({ freq: 1.7, amp: .22, facet: .3, shift: .9, scale: .9 });
  PRESETS['eco-cardano']  = eco({ freq: .8, amp: .07, facet: 1, shift: .4, scale: .78 });

  const S = Object.assign({}, PRESETS.hero, { scale: .0001, amp: .75, kick: 0 });
  function setMood(name: string, opts?: any) {
    const p = PRESETS[name];
    if (!p) return;
    gsap.to(S, Object.assign({ duration: (opts && opts.d) || 1.6, ease: 'expo.out', overwrite: 'auto' }, p));
  }

  // Smooth scroll
  const smooth = { target: window.scrollY, current: window.scrollY, vel: 0, velS: 0, locked: false, enabled: !reduce };
  let lastSet = window.scrollY;
  let prevY = window.scrollY;
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  resetLandingScroll = () => {
    smooth.target = 0;
    smooth.current = 0;
    lastSet = 0;
    prevY = 0;
    smooth.locked = false;
  };

  window.addEventListener('wheel', e => {
    if (!isLandingActive) return;
    if (e.ctrlKey || !smooth.enabled) return;
    if (e.target && e.target.closest && e.target.closest('[data-native-scroll]')) return;
    e.preventDefault();
    if (smooth.locked) return;
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 32; else if (e.deltaMode === 2) dy *= window.innerHeight;
    smooth.target = clamp(smooth.target + dy, 0, maxScroll());
  }, { passive: false });

  window.addEventListener('scroll', () => {
    if (!isLandingActive) return;
    if (Math.abs(window.scrollY - lastSet) > 2) {
      smooth.current = smooth.target = lastSet = window.scrollY;
    }
  }, { passive: true });

  function jumpTo(y: number) {
    y = clamp(y, 0, maxScroll());
    smooth.target = smooth.current = lastSet = y;
    window.scrollTo(0, y);
    ScrollTrigger.update();
  }

  function tickScroll(dt: number) {
    if (smooth.enabled && !smooth.locked) {
      const d = smooth.target - smooth.current;
      if (Math.abs(d) > .08) {
        smooth.current += d * (1 - Math.exp(-dt * 6));
        lastSet = smooth.current;
        window.scrollTo(0, smooth.current);
      }
    }
    const y = window.scrollY;
    smooth.vel = y - prevY;
    prevY = y;
    smooth.velS += (smooth.vel - smooth.velS) * .12;
  }

  // Pointer
  const ptr = { x: 0, y: 0, px: -999, py: -999, speed: 0, speedS: 0, active: false, onOrb: false };
  window.addEventListener('pointermove', e => {
    const dx = e.clientX - ptr.px, dy = e.clientY - ptr.py;
    if (ptr.active) ptr.speed = Math.min(80, Math.hypot(dx, dy));
    ptr.px = e.clientX; ptr.py = e.clientY;
    ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.y = -((e.clientY / window.innerHeight) * 2 - 1);
    ptr.active = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { ptr.active = false; });

  // WebGL Orb
  const NOISE = `
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0);
    const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;
    vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;
    vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }`;

  const VERT = `
  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform float uPoke;
  uniform float uEnergy;
  uniform float uPointerOn;
  uniform vec3 uPointer;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDisp;
  ${NOISE}
  float disp(vec3 p){
    float a = uAmp * (1.0 + uEnergy * 1.1);
    float f = uFreq * (1.0 + uEnergy * 0.35);
    float n = snoise(p * f + vec3(0.0, uTime, uTime * 0.6));
    float m = snoise(p * f * 2.3 - vec3(uTime * 0.8, 0.0, uTime)) * 0.32;
    float d = (n + m) * a;
    float k = distance(p, uPointer);
    d += uPoke * uPointerOn * exp(-k * k * 7.0);
    return d;
  }
  void main(){
    vec3 n = normalize(position);
    vec3 up = abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 t = normalize(cross(n, up));
    vec3 b = cross(n, t);
    float e = 0.012;
    float d0 = disp(n);
    vec3 na = normalize(n + t * e);
    vec3 nb = normalize(n + b * e);
    vec3 p0 = n * (1.0 + d0);
    vec3 p1 = na * (1.0 + disp(na));
    vec3 p2 = nb * (1.0 + disp(nb));
    vec3 nn = normalize(cross(p1 - p0, p2 - p0));
    vNormal = normalize(normalMatrix * nn);
    vec4 mv = modelViewMatrix * vec4(p0, 1.0);
    vView = mv.xyz;
    vDisp = d0;
    gl_Position = projectionMatrix * mv;
  }`;

  const FRAG = `
  uniform float uTime;
  uniform float uFacet;
  uniform float uShift;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  uniform vec3 uC4;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDisp;

  vec3 studio(vec3 r){
    float h = r.y * 0.5 + 0.5;
    vec3 col = mix(uC1 * 0.22, vec3(0.94, 0.95, 1.0), smoothstep(0.1, 0.95, h));
    float b1 = smoothstep(0.80, 0.94, dot(r, normalize(vec3(-0.55, 0.65, 0.55))));
    float b2 = smoothstep(0.86, 0.97, dot(r, normalize(vec3(0.85, 0.10, 0.50))));
    float b3 = smoothstep(0.80, 0.95, dot(r, normalize(vec3(0.05, -0.45, 0.90))));
    col += vec3(1.0) * b1 * 1.2 + uC4 * b2 * 0.9 + uC3 * b3 * 0.5;
    return col;
  }
  void main(){
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vView);
    vec3 qc = N * 2.4 + 0.5;
    vec3 q = floor(qc);
    float ql = length(q);
    vec3 Nq = ql > 0.01 ? q / ql : N;
    N = normalize(mix(N, Nq, uFacet));
    vec3 qf = abs(fract(qc) - 0.5) * 2.0;
    float seam = 1.0 - min(min(qf.x, qf.y), qf.z);
    float edge = smoothstep(0.90, 0.995, seam) * uFacet;
    float ndv = clamp(dot(N, V), 0.0, 1.0);
    float fres = pow(1.0 - ndv, 3.0);
    vec3 R = reflect(-V, N);
    vec3 env = studio(R);
    float f = abs(fract(ndv * 1.3 + vDisp * 2.4 + uShift + uTime * 0.03) * 2.0 - 1.0);
    vec3 film = mix(uC1, uC2, smoothstep(0.0, 0.5, f));
    film = mix(film, uC3, smoothstep(0.5, 1.0, f));
    vec3 L = normalize(vec3(-0.5, 0.8, 0.6));
    float diff = max(dot(N, L), 0.0);
    float spec = pow(max(dot(R, L), 0.0), 80.0);
    vec3 col = film * (0.42 + 0.8 * diff);
    col = mix(col, env, 0.16 + 0.5 * fres);
    col += uC4 * pow(1.0 - ndv, 5.0) * 0.55;
    col += vec3(spec) * 1.3;
    col += uC2 * edge * 0.65;
    gl_FragColor = vec4(col, 1.0);
  }`;

  function initGL() {
    const canvas = $('#gl');
    if (!canvas) return null;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (err) { return null; }
    if (!renderer || !renderer.getContext()) return null;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
    camera.position.set(0, 0, 6);
    const rig = new THREE.Group();
    scene.add(rig);

    const C = h => new THREE.Color(h);
    const PL = [C(0x4B3DFF), C(0xE4DEFF), C(0x241C7A), C(0xC7BDFF)];
    const PD = [C(0x372BC9), C(0xC7BDFF), C(0x140F3D), C(0x9C8CFF)];
    const INK = C(0x0F1230), PAPER = C(0xEDEFFC), PVIOLET = C(0x4B3DFF), PVIOLET_D = C(0x9C8CFF);

    const uniforms = {
      uTime: { value: 0 }, uAmp: { value: .24 }, uFreq: { value: 1.25 }, uPoke: { value: .12 },
      uEnergy: { value: 0 }, uPointerOn: { value: 0 }, uPointer: { value: new THREE.Vector3(0, 0, 1) },
      uFacet: { value: 0 }, uShift: { value: 0 },
      uC1: { value: new THREE.Color() }, uC2: { value: new THREE.Color() },
      uC3: { value: new THREE.Color() }, uC4: { value: new THREE.Color() }
    };
    const seg = window.innerWidth < 800 ? 96 : 160;
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(1, seg, seg),
      new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })
    );
    rig.add(orb);

    const proxy = new THREE.Mesh(new THREE.SphereGeometry(1.08, 24, 16), new THREE.MeshBasicMaterial({ visible: false }));
    rig.add(proxy);

    const rings = [];
    function makeRing(r, tilt, spd) {
      const g = new THREE.Group();
      g.rotation.set(tilt[0], tilt[1], tilt[2]);
      const pts = [];
      for (let i = 0; i <= 180; i++) { const a = (i / 180) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); }
      const mat = new THREE.LineBasicMaterial({ color: 0x0F1230, transparent: true, opacity: .35 });
      g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
      const pivot = new THREE.Object3D();
      const satMat = new THREE.MeshBasicMaterial({ color: 0x0F1230 });
      const sat = new THREE.Mesh(new THREE.BoxGeometry(.062, .062, .062), satMat);
      sat.position.set(r, 0, 0);
      pivot.add(sat); g.add(pivot); rig.add(g);
      rings.push({ g, pivot, spd, mat, satMat, sat });
    }
    makeRing(1.85, [1.2, .3, 0], .35);
    makeRing(2.1, [.5, -.6, .4], -.22);
    makeRing(2.4, [1.6, .2, 1.0], .15);

    const cage = new THREE.Group();
    rig.add(cage);
    const cageR = 1.55;
    const PHI = (1 + Math.sqrt(5)) / 2;
    const icoV = [
      [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
      [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
      [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
    ].map(v => new THREE.Vector3(v[0], v[1], v[2]).normalize());
    const icoF = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];
    const icoE = (() => {
      const seen = new Set(), out = [];
      icoF.forEach(f => {
        for (let i = 0; i < 3; i++) {
          const a = f[i], b = f[(i + 1) % 3];
          const key = a < b ? a + '_' + b : b + '_' + a;
          if (!seen.has(key)) { seen.add(key); out.push([a, b]); }
        }
      });
      return out;
    })();

    const edgePos = new Float32Array(icoE.length * 6);
    icoE.forEach(([a, b], i) => {
      const pa = icoV[a], pb = icoV[b];
      edgePos.set([pa.x * cageR, pa.y * cageR, pa.z * cageR], i * 6);
      edgePos.set([pb.x * cageR, pb.y * cageR, pb.z * cageR], i * 6 + 3);
    });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x0F1230, transparent: true, opacity: .34 });
    const edges = new THREE.LineSegments(edgeGeo, edgeMat);
    cage.add(edges);

    const nodeGeo = new THREE.BoxGeometry(.082, .082, .082);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x0F1230 });
    const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, icoV.length);
    cage.add(nodes);
    const nodeM = new THREE.Matrix4(), nodeQ = new THREE.Quaternion(), nodeS = new THREE.Vector3(1, 1, 1), nodeP = new THREE.Vector3();
    const nodeAxis = new THREE.Vector3(.6, .8, .2).normalize();

    const PN = 9;
    const pulses = Array.from({ length: PN }, () => ({ e: (Math.random() * icoE.length) | 0, t: Math.random(), spd: .3 + Math.random() * .45 }));
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(PN * 3);
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    const pulseMat = new THREE.PointsMaterial({ size: .05, color: 0x4B3DFF, transparent: true, opacity: .8, depthWrite: false, sizeAttenuation: true });
    const pulsePts = new THREE.Points(pulseGeo, pulseMat);
    cage.add(pulsePts);

    const N = 260, arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 2.6 + Math.random() * 3.2, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * .8;
      arr[i * 3 + 2] = r * Math.cos(ph) - 1.5;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: .026, color: 0x0F1230, transparent: true, opacity: .45, depthWrite: false }));
    scene.add(dust);

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const local = new THREE.Vector3();
    const ink = new THREE.Color();
    const ptrS = { x: 0, y: 0 };
    let T = 0, lastA = 1, lastW = 0, lastH = 0;

    function resize(force?: boolean) {
      const w = window.innerWidth, h = window.innerHeight;
      if (!force && w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w; lastH = h;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 800 ? 1.5 : 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize(true);
    window.addEventListener('resize', () => resize(false));

    function update(dt: number) {
      const u = uniforms;
      T += dt * (.25 + S.speed * (reduce ? .3 : 1));
      u.uTime.value = T;
      u.uAmp.value = S.amp + (S.kick || 0);
      u.uFreq.value = S.freq;
      u.uFacet.value = clamp(S.facet, 0, 1);
      u.uShift.value = S.shift;
      const energy = reduce ? 0 : clamp(Math.abs(smooth.velS) * .0075, 0, 1);
      u.uEnergy.value += (energy - u.uEnergy.value) * .1;
      for (let i = 0; i < 4; i++) u['uC' + (i + 1)].value.copy(PL[i]).lerp(PD[i], theme.v);

      const aspect = camera.aspect;
      const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const halfW = halfH * aspect;
      const narrow = aspect < .85;
      const compact = narrow || window.innerWidth <= 1024;
      const fit = narrow ? Math.min(1, aspect * 1.05) * .9 * (S.ns || 1) : 1;
      const sc = Math.max(S.scale, .0001) * fit;
      rig.scale.setScalar(sc);
      rig.position.x = narrow ? 0 : S.x * halfW;
      rig.position.y = (narrow ? S.ny : S.y) * halfH - (reduce ? 0 : clamp(smooth.velS * .004, -.5, .5));

      ptrS.x += (ptr.x - ptrS.x) * .06;
      ptrS.y += (ptr.y - ptrS.y) * .06;
      camera.position.x = ptrS.x * .35;
      camera.position.y = ptrS.y * .2;
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      rig.rotation.y = ptrS.x * .35;
      rig.rotation.x = -ptrS.y * .25;
      orb.rotation.y += dt * (.08 + S.speed * .25);
      orb.rotation.z = Math.sin(T * .3) * .1;
      rig.updateMatrixWorld(true);

      ndc.set(ptr.x, ptr.y);
      ray.setFromCamera(ndc, camera);
      const hit = ptr.active && sc > .05 ? ray.intersectObject(proxy, false)[0] : null;
      ptr.onOrb = !!hit;
      if (hit) {
        local.copy(hit.point);
        orb.worldToLocal(local);
        local.normalize();
        u.uPointer.value.lerp(local, .3);
      }
      u.uPointerOn.value += ((hit ? 1 : 0) - u.uPointerOn.value) * (hit ? .12 : .06);
      ptr.speed *= .9;
      ptr.speedS += (ptr.speed - ptr.speedS) * .15;
      u.uPoke.value = .1 + clamp(ptr.speedS * .006, 0, .25);

      ink.copy(INK).lerp(PAPER, theme.v);
      const touch = u.uPointerOn.value;
      rings.forEach((r, i) => {
        r.pivot.rotation.z = T * r.spd * 3;
        r.g.rotation.z += dt * .03 * (i % 2 ? 1 : -1);
        r.mat.opacity = .38 * S.rings;
        r.mat.color.copy(ink);
        r.satMat.color.copy(ink);
        r.sat.visible = S.rings > .05;
        r.sat.rotation.x = T * .7 + i * 2;
        r.sat.rotation.y = T * .5 + i;
      });

      cage.rotation.y = T * .11;
      cage.rotation.x = Math.sin(T * .17) * .22;
      cage.rotation.z = Math.cos(T * .09) * .08;
      const latOn = S.rings > .05;
      edges.visible = nodes.visible = pulsePts.visible = latOn;
      if (latOn) {
        edgeMat.opacity = (.3 + touch * .18) * S.rings;
        edgeMat.color.copy(ink);
        nodeMat.color.copy(ink);
        const nodeBeat = 1 + u.uEnergy.value * .6 + touch * .5;
        for (let i = 0; i < icoV.length; i++) {
          const s = (.85 + Math.sin(T * 2 + i * 1.7) * .15) * nodeBeat;
          nodeS.set(s, s, s);
          nodeP.set(icoV[i].x * cageR, icoV[i].y * cageR, icoV[i].z * cageR);
          nodeQ.setFromAxisAngle(nodeAxis, T * .6 + i);
          nodeM.compose(nodeP, nodeQ, nodeS);
          nodes.setMatrixAt(i, nodeM);
        }
        nodes.instanceMatrix.needsUpdate = true;

        const pulseSpeed = 1 + u.uEnergy.value * 1.8 + touch * 1.2;
        for (let i = 0; i < PN; i++) {
          const p = pulses[i];
          p.t += dt * p.spd * pulseSpeed;
          if (p.t >= 1) { p.t = 0; p.e = (Math.random() * icoE.length) | 0; }
          const [a, b] = icoE[p.e];
          const ea = icoV[a], eb = icoV[b];
          const tt = p.t * p.t * (3 - 2 * p.t);
          pulsePos[i * 3] = (ea.x + (eb.x - ea.x) * tt) * cageR;
          pulsePos[i * 3 + 1] = (ea.y + (eb.y - ea.y) * tt) * cageR;
          pulsePos[i * 3 + 2] = (ea.z + (eb.z - ea.z) * tt) * cageR;
        }
        pulseGeo.attributes.position.needsUpdate = true;
        pulseMat.opacity = clamp((.55 + touch * .3 + u.uEnergy.value * .25) * S.rings * 1.3, 0, .95);
        pulseMat.color.copy(PVIOLET).lerp(PVIOLET_D, theme.v);
      }

      dust.rotation.y = T * .02 + window.scrollY * .0003;
      dust.material.color.copy(ink);

      const a = compact ? S.na : 1;
      if (Math.abs(a - lastA) > .01) { canvas.style.opacity = a.toFixed(2); lastA = a; }

      renderer.render(scene, camera);
    }
    return { update };
  }

  // Work cards
  function buildWork() {
    const track = $('#lifecycleTrack');
    if (!track) return;
    track.innerHTML = STAGES.map((p, i) => `
      <article class="card">
        <button class="card__link" type="button" data-cursor="view" aria-label="Open details: ${p.name}">
          <div class="card__cover"><div class="card__art">${stageArt(i, 'c', p.phase)}</div><span class="card__num">${String(i + 1).padStart(2, '0')}</span></div>
        </button>
        <div class="card__meta"><h3>${p.name}</h3><p>${p.agent}</p></div>
      </article>`).join('');
  }

  let lifePhase = 0, stageIdx = -1, moodActive = 'hero';
  function setStage(i: number) {
    if (i === stageIdx) return;
    stageIdx = i;
    const s = STAGES[i];
    if (!s) return;
    const stageNumEl = $('#stageNum');
    const stagePhaseEl = $('#stagePhase');
    if (stageNumEl) stageNumEl.textContent = String(i + 1).padStart(2, '0');
    if (stagePhaseEl) stagePhaseEl.textContent = PHASES[s.phase].name;
    if (s.phase !== lifePhase) {
      lifePhase = s.phase;
      if (moodActive === 'lifecycle') setMood('phase-' + lifePhase, { d: 1.2 });
    }
  }

  // Agents
  function renderAgent(a: any) {
    const ul = (arr: any[]) => '<ul>' + arr.map(x => `<li>${x}</li>`).join('') + '</ul>';
    const perm = [];
    if (a.reads) perm.push(`<div><h4>Reads</h4>${ul(a.reads)}</div>`);
    if (a.writes) perm.push(`<div><h4>Writes</h4>${ul(a.writes)}</div>`);
    if (a.cannot) perm.push(`<div class="perm--no"><h4>Cannot</h4>${ul(a.cannot)}</div>`);
    if (a.note) perm.push(`<div><h4>Access</h4>${ul([a.note])}</div>`);
    return `<h3>${a.name} agent</h3><p class="role">${a.role}</p>` +
      `<ul class="does">${a.does.map((d: string) => `<li>${d}</li>`).join('')}</ul>` +
      (perm.length ? `<div class="perm">${perm.join('')}</div>` : '');
  }

  function buildAgents() {
    const list = $('#agentList'), panel = $('#agentPanel');
    if (!list || !panel) return;
    let cur = -1;
    list.innerHTML = AGENTS.map((a, i) =>
      `<li class="agent"><button type="button" class="agent__btn" aria-pressed="false"><span>${a.name}</span><span class="agent__idx">${String(i + 1).padStart(2, '0')}</span></button></li>`).join('');
    const items = $$('.agent', list);
    function show(i: number, instant?: boolean) {
      if (i === cur) return;
      cur = i;
      items.forEach((li, k) => {
        li.classList.toggle('is-active', k === i);
        $('button', li).setAttribute('aria-pressed', String(k === i));
      });
      if (instant || reduce) { panel.innerHTML = renderAgent(AGENTS[i]); return; }
      gsap.killTweensOf(panel);
      gsap.to(panel, { opacity: 0, y: 8, duration: .18, ease: 'power2.in', onComplete: () => {
        panel.innerHTML = renderAgent(AGENTS[i]);
        gsap.fromTo(panel, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .7, ease: 'expo.out' });
      } });
      gsap.to(S, { shift: (.1 + i * .17) % 1, freq: 1.1 + (i % 4) * .35, facet: i % 3 === 0 ? 1 : .2, duration: 1.3, ease: 'expo.out', overwrite: 'auto' });
    }
    items.forEach((li, i) => $('button', li).addEventListener('click', () => show(i)));
    show(0, true);
  }

  // Scope
  function buildScope() {
    const filters = $('#scopeFilters'), list = $('#scopeList'), panel = $('#scopePanel');
    if (!filters || !list || !panel) return;
    const famKeys = Object.keys(SCOPE_FAMILIES);
    filters.innerHTML = famKeys.map(k => `<button type="button" data-f="${k}" aria-pressed="false" style="--pc:${SCOPE_FAMILIES[k].c}"><i></i>${SCOPE_FAMILIES[k].name}</button>`).join('');
    list.innerHTML = SCOPE_ITEMS.map(([label, fam], i) =>
      `<li class="scope__item" data-family="${fam}"><button type="button" data-i="${i}" style="--pc:${SCOPE_FAMILIES[fam].c}">${label}</button></li>`).join('');
    const items = $$('.scope__item', list);

    function showFamily(key: string) {
      const f = SCOPE_FAMILIES[key];
      panel.innerHTML = `<p class="scope__fam" style="--pc:${f.c}">${f.name}</p><h3>${f.name}</h3><p class="role">${f.blurb}</p>`;
    }
    function showItem(i: number) {
      const [label, fam] = SCOPE_ITEMS[i], f = SCOPE_FAMILIES[fam];
      panel.innerHTML = `<p class="scope__fam" style="--pc:${f.c}">${f.name}</p><h3>${label}</h3><p class="role">${f.blurb}</p>`;
    }
    showFamily(famKeys[0]);

    filters.addEventListener('click', (e: any) => {
      const b = e.target.closest('button'); if (!b) return;
      const on = b.getAttribute('aria-pressed') !== 'true';
      $$('button', filters).forEach((x: any) => x.setAttribute('aria-pressed', String(x === b && on)));
      const active = on ? b.dataset.f : null;
      items.forEach((li: any) => li.classList.toggle('is-dim', !!active && li.dataset.family !== active));
      items.forEach((li: any) => li.classList.remove('is-active'));
      if (active) showFamily(active); else showFamily(famKeys[0]);
    });
    list.addEventListener('click', (e: any) => {
      const b = e.target.closest('button'); if (!b) return;
      items.forEach((li: any) => li.classList.remove('is-active'));
      b.closest('li').classList.add('is-active');
      showItem(+b.dataset.i);
    });
  }

  // Rules
  function initRules() {
    const list = $('#rulesList');
    if (!list) return;
    list.innerHTML = RULES.map((r, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `<li class="rule" data-k="${n}">
        <button type="button" class="rule__head" aria-expanded="false" aria-controls="rule-${n}">
          <span class="rule__num">${n}</span><span class="rule__txt">${r.rule}</span><span class="rule__plus" aria-hidden="true"></span>
        </button>
        <div class="rule__body" id="rule-${n}"><div class="rule__inner">
          <p class="rule__tag">Enforced by \u2014 ${r.by}</p>
          <p>${r.why}</p>
        </div></div>
      </li>`;
    }).join('');
    $$('.rule', list).forEach((li: any) => {
      const head = $('.rule__head', li), body = $('.rule__body', li);
      head.addEventListener('click', () => {
        const refresh = () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); };
        if (li.classList.contains('is-open')) {
          li.classList.remove('is-open'); head.setAttribute('aria-expanded', 'false');
          if (reduce) gsap.set(body, { height: 0 }); else gsap.to(body, { height: 0, duration: .6, ease: 'expo.out', onComplete: refresh });
        } else {
          li.classList.add('is-open'); head.setAttribute('aria-expanded', 'true');
          if (reduce) gsap.set(body, { height: 'auto' }); else gsap.to(body, { height: 'auto', duration: .7, ease: 'expo.out', onComplete: refresh });
        }
      });
    });
  }

  // Journeys
  function buildJourneys() {
    const tabs = $('#jrTabs'), panel = $('#jrPanel');
    if (!tabs || !panel) return;
    let cur = -1;
    tabs.innerHTML = JOURNEYS.map(j => `<li><button type="button" class="jr__tab" aria-pressed="false"><b>${j.name}</b><span>${j.sub}</span></button></li>`).join('');
    const btns = $$('.jr__tab', tabs);
    function show(i: number, instant?: boolean) {
      if (i === cur) return;
      cur = i;
      btns.forEach((b: any, k: number) => { b.classList.toggle('is-active', k === i); b.setAttribute('aria-pressed', String(k === i)); });
      const j = JOURNEYS[i];
      panel.innerHTML = `<h3>${j.name}</h3><ol class="flow">${j.steps.map((s: string, n: number) => `<li><b>${n + 1}</b>${s}</li>`).join('')}</ol>`;
      if (!instant && !reduce) {
        gsap.from($$('.flow li', panel), { opacity: 0, y: 12, duration: .6, ease: 'expo.out', stagger: .035 });
        gsap.to(S, { shift: (.2 + i * .23) % 1, freq: 1.2 + i * .3, duration: 1.3, ease: 'expo.out', overwrite: 'auto' });
      }
    }
    btns.forEach((b: any, i: number) => b.addEventListener('click', () => show(i)));
    show(0, true);
  }

  // Architecture
  function buildArch() {
    const steps = $('#archSteps'), legend = $('#archLegend');
    if (!steps || !legend) return;
    const flat: any[] = []; ARCH.forEach(b => b.nodes.forEach(n => flat.push(n)));
    const p2 = (n: number) => String(n).padStart(2, '0');

    steps.innerHTML = '<div class="steps__line"><div class="steps__fill"></div></div>' +
      ARCH.map((b, bi) => `${bi ? `<p class="arch__band">${b.band}</p>` : `<p class="arch__band arch__band--first">${b.band}</p>`}` +
        b.nodes.map(n => { const i = flat.indexOf(n), pr = ARCH_P[n.p]; return `<article class="step alayer" data-p="${n.p}" style="--pc:${pr.c}">
          <span class="step__dot">${p2(i + 1)}</span>
          <div class="alayer__head"><h3>${n.t}</h3><span class="alayer__tag">${pr.name}</span></div>
          <p class="alayer__flow"><b>From</b> ${i === 0 ? 'your request' : flat[i - 1].t}<span class="alayer__sep"></span><b>To</b> ${i === flat.length - 1 ? 'every future run' : flat[i + 1].t}</p>
          <p>${n.more}</p>
        </article>`; }).join('')).join('') +
      `<div class="arch__loop glass">
        <svg class="arch__loopicon" viewBox="0 0 48 48" aria-hidden="true"><path d="M14 10a16 16 0 1 1-9 14.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M6 6v9h9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <p>Every confirmed incident becomes a root cause, a regression test and a rule. It closes the loop back into the specialist agents, so the next run starts one lesson safer.</p>
      </div>`;

    legend.innerHTML = Object.keys(ARCH_P).map(k => `<button type="button" data-p="${k}" aria-pressed="false" style="--pc:${ARCH_P[k].c}"><i></i>${ARCH_P[k].name}</button>`).join('');
    const layers = $$('.alayer', steps);
    legend.addEventListener('click', (e: any) => {
      const b = e.target.closest('button'); if (!b) return;
      const on = b.getAttribute('aria-pressed') !== 'true';
      $$('button', legend).forEach((x: any) => x.setAttribute('aria-pressed', String(x === b && on)));
      layers.forEach((el: any) => el.classList.toggle('is-dim', on && el.dataset.p !== b.dataset.p));
    });

    gsap.to('#archSteps .steps__fill', { scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#archSteps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    if (!reduce) gsap.from('.arch__loop', { opacity: 0, y: 30, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.arch__loop', start: 'top 92%', once: true } });
  }

  // Workspace
  const ECO_ICON = {
    evm: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 17 10 10 18 3 10Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 2V18M3 10H17" stroke="currentColor" stroke-width="1" opacity=".45"/></svg>',
    solana: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6.5h12M5.5 10h12M3 13.5h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    sui: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.4c3 3.9 5.4 7.1 5.4 10a5.4 5.4 0 1 1-10.8 0c0-2.9 2.4-6.1 5.4-10Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    aptos: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3 17.3 16.2H2.7Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 3V16.2M6.2 9.6H13.8" stroke="currentColor" stroke-width="1" opacity=".45"/></svg>',
    cosmos: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="1.6" fill="currentColor"/><ellipse cx="10" cy="10" rx="8" ry="3.1" fill="none" stroke="currentColor" stroke-width="1.1"/><ellipse cx="10" cy="10" rx="8" ry="3.1" fill="none" stroke="currentColor" stroke-width="1.1" transform="rotate(60 10 10)"/><ellipse cx="10" cy="10" rx="8" ry="3.1" fill="none" stroke="currentColor" stroke-width="1.1" transform="rotate(120 10 10)"/></svg>',
    starknet: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2 11.9 8.1 18 10 11.9 11.9 10 18 8.1 11.9 2 10 8.1 8.1Z" fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/></svg>',
    near: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.2 16V9.2a5.8 5.8 0 0 1 11.6 0V16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4.2 16h3.1M12.7 16h3.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    polkadot: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="4.2" r="1.7" fill="currentColor"/><circle cx="4.3" cy="14.3" r="1.7" fill="currentColor"/><circle cx="15.7" cy="14.3" r="1.7" fill="currentColor"/></svg>',
    cardano: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="6.6" cy="7.2" r="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="13.4" cy="7.2" r="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="10" cy="13.6" r="2.5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>'
  };

  function initWorkspace() {
    const rootEl = $('#ws');
    if (!rootEl) return;
    const st = { eco: 'evm', net: 'Testnet', k: -1, max: -1, signed: false, incident: false, tab: 'stream', auto: true, doc: null, timer: null, live: false };
    const q0 = (s: string) => $(s, rootEl);
    const li = (a: any[], cls?: string) => a.map(x => `<li${cls ? ` class="${cls}"` : ''}>${x}</li>`).join('');
    const ico = {
      play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>',
      pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor"/></svg>',
      step: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2.5v11l7-5.5zM11 2.5h2v11h-2z" fill="currentColor"/></svg>',
      reset: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5a5.5 5.5 0 1 0 5.2 3.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 .5v4l-3-2z" fill="currentColor" transform="rotate(20 8 3)"/></svg>'
    };

    rootEl.innerHTML = `
      <div class="ws__bar">
        <span class="ws__dots" aria-hidden="true"><i></i><i></i><i></i></span>
        <div class="ws__id"><span class="ws__title">Lending protocol</span><span class="ws__exec">exec-7f3a</span></div>
        <span class="ws__status" id="wsStatus">Ready</span>
      </div>
      <div class="ws__controls">
        <div class="ws__ecopicker" role="group" aria-label="Ecosystem">${Object.keys(WS_ECO).map(k => `<button type="button" class="ws__chip" data-eco="${k}" aria-pressed="${k === 'evm'}"><span class="ws__chipIcon">${ECO_ICON[k]}</span><span class="ws__chipText"><b>${WS_ECO[k].name}</b><small>${WS_ECO[k].family}</small></span></button>`).join('')}</div>
      </div>
      <div class="ws__env" id="wsEnvBar">
        <div class="seg seg--net" role="group" aria-label="Network">
          <button type="button" class="seg__b" data-net="Devnet" aria-pressed="false"><i class="netdot netdot--devnet"></i>Devnet</button>
          <button type="button" class="seg__b" data-net="Testnet" aria-pressed="true"><i class="netdot netdot--testnet"></i>Testnet</button>
          <button type="button" class="seg__b" data-net="Mainnet" aria-pressed="false"><i class="netdot netdot--mainnet"></i>Mainnet</button>
        </div>
        <dl class="ws__envlist">
          <div class="ws__envitem"><dt>Network</dt><dd id="wsEnvChain"></dd></div>
          <div class="ws__envitem"><dt>Consensus</dt><dd id="wsEnvConsensus"></dd></div>
          <div class="ws__envitem"><dt>Explorer</dt><dd id="wsEnvExplorer"></dd></div>
          <div class="ws__envitem"><dt>Gas token</dt><dd id="wsEnvGas"></dd></div>
          <div class="ws__envitem"><dt>Est. fee</dt><dd id="wsEnvFee"></dd></div>
        </dl>
        <span class="ws__envrisk" id="wsEnvRisk" hidden>Live network \u00b7 real funds \u00b7 no silent deploys</span>
      </div>
      <div class="ws__body">
        <aside class="ws__left"><p class="ws__label">Project explorer</p><ul class="ws__tree" id="wsTree">${WS_TREE_GROUPS.map(g => `<li class="ws__treegroup" aria-hidden="true"><span>${g[0]}</span></li>` + g[1].map(t => `<li><button type="button" data-doc="${t[0]}"><span>${t[1]}</span><i></i></button></li>`).join('')).join('')}</ul></aside>
        <div class="ws__center">
          <div class="ws__tabs" role="tablist">${[['stream', 'AI stream'], ['terminal', 'Terminal'], ['diff', 'Diff'], ['tests', 'Tests']].map(t => `<button type="button" role="tab" data-tab="${t[0]}" aria-selected="${t[0] === 'stream'}">${t[1]}</button>`).join('')}</div>
          <div class="ws__view" id="wsView"></div>
          <div class="ws__doc" id="wsDoc" hidden></div>
        </div>
        <aside class="ws__right">
          <p class="ws__label">Contract operations</p>
          <dl class="ws__kv"><div><dt>Ecosystem</dt><dd id="wsEco"></dd></div><div><dt>Family</dt><dd id="wsFamily"></dd></div><div><dt>Network</dt><dd id="wsNet"></dd></div><div><dt>Tools</dt><dd id="wsTools"></dd></div><div><dt>Security</dt><dd id="wsSec">Waiting</dd></div></dl>
          <p class="ws__label">Deployment gate</p>
          <ul class="ws__gate" id="wsGate">${WS_GATE.map(g => `<li data-k="${g[0]}"><button type="button" data-why="${g[0]}">${g[1]}</button></li>`).join('')}</ul>
          <p class="ws__why" id="wsWhy">Select a check to see what backs it.</p>
          <button type="button" class="ws__sign" id="wsSign" disabled>Review transaction preview</button>
          <div class="ws__live" id="wsLive" hidden>
            <div class="ws__conf" id="wsConf"><span>Confirmations</span><i></i><i></i><i></i></div>
            <svg class="ws__spark" id="wsSpark" viewBox="0 0 200 48" preserveAspectRatio="none" aria-hidden="true"><polyline id="wsLine" points="" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/></svg>
            <button type="button" class="ws__incident" id="wsIncident" hidden>Simulate an incident</button>
            <p class="ws__mem" id="wsMem" hidden></p>
          </div>
        </aside>
      </div>
      <div class="ws__foot">
        <div class="ws__ctl">
          <button type="button" id="wsPlay" aria-label="Run the lifecycle">${ico.play}<span>Run</span></button>
          <button type="button" id="wsStep" aria-label="Next step">${ico.step}<span>Step</span></button>
          <button type="button" id="wsReset" aria-label="Reset">${ico.reset}<span>Reset</span></button>
        </div>
        <ol class="ws__rail" id="wsRail">${WS_STEPS.map((s, n) => `<li><button type="button" data-step="${n}" style="--c:${PHASES[s.ph].c}" aria-label="Step ${n + 1}, ${PHASES[s.ph].name}"></button></li>`).join('')}</ol>
        <span class="ws__phase" id="wsPhase">Understand</span>
      </div>
      <div class="ws__modal" id="wsModal" hidden>
        <div class="ws__sheet" role="dialog" aria-modal="true" aria-label="Transaction preview">
          <p class="ws__sheetkicker">Transaction preview</p>
          <h4>Review before you sign</h4>
          <div class="ws__sheetrisk" id="wsSheetRisk" hidden>You're about to sign a live <b>Mainnet</b> transaction with real funds. This can't be undone.</div>
          <dl class="ws__kv ws__kv--wide" id="wsPrev"></dl>
          <label class="ws__check"><input type="checkbox" id="wsC1"><span>I reviewed the expected state changes.</span></label>
          <label class="ws__check" id="wsC2row" hidden><input type="checkbox" id="wsC2"><span>I confirm the target network is Mainnet.</span></label>
          <div class="ws__sheetbtn"><button type="button" id="wsReject">Reject</button><button type="button" id="wsApprove" disabled>Sign in wallet</button></div>
          <p class="ws__note" id="wsWallet"></p>
        </div>
      </div>`;

    const modal = q0('#wsModal');
    document.body.appendChild(modal);
    const q = (s: string) => $(s, rootEl) || $(s, document);
    const qa = (s: string) => $$(s, rootEl);
    const view = q('#wsView'), docEl = q('#wsDoc'), spark = { pts: [], line: q('#wsLine') };
    const ecoFn = () => WS_ECO[st.eco];

    const kv = (rows: any[]) => '<dl class="wd__kv">' + rows.map(r => `<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('') + '</dl>';
    const ul = (a: any[]) => '<ul class="wd__list">' + li(a) + '</ul>';

    function docFor(key: string, k: number) {
      const e = ecoFn(), reached = (at: number) => k >= at;
      const D = {
        spec: ['SPEC-v2', `<p>An immutable snapshot. Every downstream artifact references this version.</p>${ul(['Project intent', 'Functional', 'Non-functional', 'Security', 'Economic', 'Chain and VM', 'Deployment', 'Monitoring', 'Upgrade', 'Acceptance criteria'])}`],
        threat: ['Threat model', `<p>Assets: vault balances, the admin role. Actors: admin, depositor, attacker. Trust boundary: the contract and its dependencies.</p><h5>Invariants</h5>${ul(['Unauthorized users cannot mint', 'Withdrawals never exceed balance', 'Only the Treasury role can withdraw funds'])}`],
        arch: ['Architecture', `<p>Native ${e.lang} design, with a small state model.</p>${ul(['Vault: holds and releases funds', 'Oracle adapter: prices, read-only', 'Governance: roles behind a timelock'])}<h5>State model</h5><p class="wd__chips"><span>CREATED</span><span>ACTIVE</span><span>PAUSED</span></p>`],
        adr: ['Decision records', ul(['ADR-001: use the native design patterns of the target VM', 'ADR-002: pin the toolchain and build in an isolated worker', 'ADR-004: upgrades go through a timelock'])],
        src: ['Source tree', `<p>Generated for ${e.lang}.</p>${ul(e.files)}`],
        deps: ['Dependencies', `<p>Pinned and scanned.</p>${ul(e.deps)}`],
        build: ['Build evidence', kv([['Isolation', 'Ephemeral container, non-root, no network'], ['Toolchain', 'Version pinned'], ['Artifact hash', '7be2\u2026d04f'], ['Manifest', 'Reproducible']])],
        test: ['Test evidence', `<p>Thirteen layers, run with ${e.tools}.</p>${kv([['Tests', '24 passed, 0 failed'], ['Fuzz runs', '256'], ['Invariants', 'All hold']])}`],
        find: ['Security findings', `<div class="wd__find"><b>HIGH</b><span>${e.finding}</span></div><p>${reached(9) ? 'Patched, re-tested, and a regression test was added.' : 'Root cause identified. An auto-fix attempt is next, capped at three.'}</p>`],
        patch: ['Patch', '<p>The auto-fix diff is in the Diff tab.</p>'],
        sim: ['Simulation scenarios', ul(['Deploy', 'Initialize', 'Deposit', 'Manipulate oracle', 'Borrow', 'Withdraw'])],
        art: ['Artifact', kv([['Artifact hash', '7be2\u2026d04f'], ['Target', `${e.net[st.net]}, ${e.target}`], ['Estimated fee', e.fee[st.net]], ['Signed', k >= 13 ? 'Yes' : 'Not yet']])],
        dep: ['Deployment record', kv([['Transaction', '0x5c9e\u2026a71d'], ['Confirmations', `${k >= 15 ? 3 : 1} of 3`], ['Chain state', k >= 15 ? 'Reconciled' : 'Tracking']])],
        ver: ['Verification', ul(['Source matches', 'Metadata matches', 'Bytecode or program matches', 'Compiler configuration matches', 'Owner and roles as specified', 'Initialization as specified'])],
        inc: ['Incident report', kv([['Detected', 'Specification drift'], ['Evidence', 'Preserved, hashed'], ['Replay', 'Ready in an isolated environment'], ['Recommended', 'Pause and rotate the role'], ['Status', 'Waiting for your approval']])],
        audit: ['Audit trail', `<p>Every action carries the same execution ID.</p>${ul(WS_STEPS.slice(0, k + 1).map((s, n) => `exec-7f3a / ${String(n + 1).padStart(2, '0')} / ${s.who}`))}`]
      };
      return D[key];
    }

    function derive(k: number) {
      const d = { tree: new Set(), gate: new Set(), st: 'Ready', sec: ['Waiting', ''], term: [], stream: [], diff: 'none', conf: 0, mon: 0, ready: false, mem: false };
      for (let n = 0; n <= k; n++) {
        const s = WS_STEPS[n];
        (s.tree || []).forEach(x => d.tree.add(x)); (s.gate || []).forEach(x => d.gate.add(x));
        if (s.st) d.st = s.st; if (s.sec) d.sec = s.sec; if (s.term) d.term.push(s.term);
        if (s.diff) d.diff = s.diff; if (s.conf) d.conf = s.conf; if (s.mon) d.mon = s.mon; if (s.ready) d.ready = true; if (s.mem) d.mem = true;
        d.stream.push(s);
      }
      d.ready = d.ready && !st.signed;
      return d;
    }

    function render() {
      const e = ecoFn(), k = st.k, d = derive(k);
      q('#wsEco').textContent = e.name; q('#wsFamily').textContent = e.family; q('#wsNet').textContent = st.net; q('#wsTools').textContent = e.tools;
      q('#wsEnvChain').textContent = e.net[st.net]; q('#wsEnvConsensus').textContent = e.consensus; q('#wsEnvExplorer').textContent = e.explorer;
      q('#wsEnvGas').textContent = e.gas; q('#wsEnvFee').textContent = e.fee[st.net]; q('#wsEnvRisk').hidden = st.net !== 'Mainnet';
      const sec = q('#wsSec'); sec.textContent = d.sec[0]; sec.className = d.sec[1];
      q('#wsStatus').textContent = k < 0 ? 'Ready' : (st.net === 'Mainnet' && d.st === 'Deploying' ? 'Deploying to Mainnet' : d.st);
      qa('#wsTree li').forEach(li2 => { const btn = $('button', li2); if (!btn) return; const key = btn.dataset.doc; li2.classList.toggle('is-done', d.tree.has(key)); li2.classList.toggle('is-open', st.doc === key); });
      qa('#wsGate li').forEach(li2 => li2.classList.toggle('is-done', d.gate.has(li2.dataset.k)));
      qa('.ws__tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === st.tab)));
      qa('#wsRail button').forEach((b, n) => { b.classList.toggle('is-done', n <= k); b.classList.toggle('is-now', n === k); b.disabled = n > st.max; });
      q('#wsPhase').textContent = k < 0 ? 'Understand' : PHASES[WS_STEPS[k].ph].name;
      rootEl.classList.add('has-progress');
      rootEl.style.setProperty('--pct', (Math.max(0, k + 1) / WS_STEPS.length * 100).toFixed(1) + '%');
      const waiting = k === 12 && !st.signed, holding = k === 17 && !st.incident, end = k >= WS_STEPS.length - 1;
      q('#wsPlay').innerHTML = (st.timer ? ico.pause + '<span>Pause</span>' : ico.play + `<span>${end ? 'Replay' : waiting ? 'Waiting' : 'Run'}</span>`);
      q('#wsPlay').disabled = waiting || holding;
      q('#wsStep').disabled = waiting || holding || end;
      const sign = q('#wsSign'); sign.disabled = !d.ready; sign.classList.toggle('is-ready', d.ready);
      sign.textContent = st.signed ? 'Signed and deployed' : 'Review transaction preview';
      q('#wsLive').hidden = k < 13;
      qa('#wsConf i').forEach((i, n) => i.classList.toggle('is-on', n < d.conf));
      q('#wsIncident').hidden = !(k === 17 && !st.incident);
      const mem = q('#wsMem'); mem.hidden = !d.mem; if (d.mem) mem.textContent = `Security memory: ${e.rule.toLowerCase()}. Checked in every future run.`;
      rootEl.classList.toggle('is-alert', d.mon === 2 && !d.mem);

      if (st.doc) {
        const dc = docFor(st.doc, k), lockedAt = { spec: 1, threat: 2, arch: 3, adr: 3, src: 4, deps: 4, build: 5, test: 6, find: 7, patch: 8, sim: 10, art: 5, dep: 14, ver: 16, inc: 19, audit: 20 }[st.doc], open = d.tree.has(st.doc) || (st.doc === 'art' && k >= 5);
        docEl.hidden = false; view.hidden = true;
        docEl.innerHTML = `<div class="wd__head"><h4>${dc[0]}</h4><button type="button" data-close>Back</button></div>` + (open ? dc[1] : `<p class="wd__lock">Not produced yet. It appears at step ${lockedAt + 1} of the lifecycle.</p><button type="button" class="wd__go" data-go="${lockedAt}">Go to that step</button>`);
      } else { docEl.hidden = true; view.hidden = false; renderView(d); }
    }

    function renderView(d: any) {
      const e = ecoFn();
      if (st.tab === 'stream') {
        view.className = 'ws__view ws__stream';
        view.innerHTML = d.stream.length ? d.stream.map((s, n) => `<button type="button" class="${s.warn ? 'is-warn' : ''}${n === st.k ? ' is-new' : ''}" ${s.key ? `data-doc="${s.key}"` : ''}><b>${s.who}</b> ${s.msg(e)}</button>`).join('') : '<p class="ws__empty">Press Run to start the lifecycle, or pick an ecosystem first.</p>';
      } else if (st.tab === 'terminal') {
        view.className = 'ws__view ws__term';
        view.innerHTML = '<p class="t-dim">worker-07 &middot; isolated, pinned toolchain, no network, no secrets</p>' + (d.term.length ? d.term.map((t: string) => `<p class="t-cmd">$ ${e.cmd[t][0]}</p><p class="${t === 'scan' ? 't-warn' : 't-ok'}">${e.cmd[t][1]}</p>`).join('') : '<p class="t-dim">Nothing has run yet.</p>');
      } else if (st.tab === 'diff') {
        view.className = 'ws__view ws__diff';
        if (d.diff === 'none') view.innerHTML = '<p class="ws__empty">No findings yet. When the security engine finds something, the fix appears here.</p>';
        else {
          view.innerHTML = `<p class="t-dim">${e.file} &middot; ${d.diff === 'patched' ? 'patch applied and re-tested' : 'proposed by the auto-fix agent'}</p><pre class="${d.diff === 'patched' ? 'is-patched' : ''}">${e.diff.map(l => `<span class="dl dl--${l[0] === '+' ? 'add' : l[0] === '-' ? 'del' : 'ctx'}${d.diff === 'found' && l[0] === '+' ? ' is-ghost' : ''}">${l[0] === ' ' ? '&nbsp;' : l[0]} ${l[1].replace(/</g, '&lt;')}</span>`).join('')}</pre>`;
        }
      } else {
        view.className = 'ws__view ws__tests';
        view.innerHTML = WS_TESTS.map(t => { const s = st.k >= t[1] ? 'pass' : st.k === t[1] - 1 ? 'run' : 'wait'; return `<div class="wt wt--${s}"><span>${t[0]}</span><i><b></b></i><em>${s === 'pass' ? 'pass' : s === 'run' ? 'running' : 'queued'}</em></div>`; }).join('');
      }
      if (st.tab === 'stream' || st.tab === 'terminal') view.scrollTop = view.scrollHeight;
    }

    function go(k: number, fromUser?: boolean) {
      st.k = Math.max(-1, Math.min(WS_STEPS.length - 1, k)); st.max = Math.max(st.max, st.k);
      const s = WS_STEPS[st.k];
      if (s && s.tab && st.auto && !st.doc) st.tab = s.tab;
      if (fromUser && st.doc) st.doc = null;
      render();
    }
    function stop() { clearInterval(st.timer); st.timer = null; }
    function tick() {
      const k = st.k, s = WS_STEPS[k];
      if (s && s.wait && !st.signed) { const resume = !!st.timer; stop(); render(); autoSign(resume); return; }
      if ((s && s.hold && !st.incident) || k >= WS_STEPS.length - 1) { stop(); render(); return; }
      go(k + 1);
      const n = WS_STEPS[st.k];
      if ((n && n.hold && !st.incident) || st.k >= WS_STEPS.length - 1) { stop(); render(); }
    }
    function autoSign(resume?: boolean) {
      const attempt = () => {
        if (st.signed || st.k !== 12) return;
        if (!q('#wsModal').hidden) { setTimeout(attempt, 500); return; }
        st.signed = true; go(13); render();
        if (resume) run();
      };
      setTimeout(attempt, reduce ? 0 : 900);
    }
    function run() { if (st.timer) return; st.doc = null; if (st.k >= WS_STEPS.length - 1) reset(); st.timer = setInterval(tick, 1050); tick(); render(); }
    function reset() { stop(); Object.assign(st, { k: -1, max: -1, signed: false, incident: false, auto: true, tab: 'stream', doc: null }); spark.pts = []; render(); }

    function openPreview() {
      const e = ecoFn();
      q('#wsSheetRisk').hidden = st.net !== 'Mainnet';
      q('#wsPrev').innerHTML = [['Network', e.net[st.net]], ['Target', e.target], ['Parameters', 'Constructor defaults from SPEC-v2'], ['State changes', 'Contract created, roles assigned'], ['Fee', e.fee[st.net]], ['Artifact hash', '7be2\u2026d04f'], ['Simulation', 'Passed, 6 of 6'], ['Risks', 'None above policy threshold']].map(r => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join('');
      q('#wsC1').checked = false; q('#wsC2').checked = false; q('#wsC2row').hidden = st.net !== 'Mainnet'; q('#wsApprove').disabled = true; q('#wsWallet').textContent = '';
      q('#wsModal').hidden = false; q('#wsC1').focus({ preventScroll: true });
    }
    const closePreview = () => { if (modal.hidden) return; modal.hidden = true; const b = q('#wsSign'); if (b && !b.disabled) b.focus({ preventScroll: true }); };
    const canApprove = () => { q('#wsApprove').disabled = !(q('#wsC1').checked && (st.net !== 'Mainnet' || q('#wsC2').checked)); };
    function approve() {
      q('#wsApprove').disabled = true; q('#wsWallet').textContent = 'Waiting for your wallet to sign. x0a never sees your keys.';
      setTimeout(() => { modal.hidden = true; st.signed = true; go(13); st.timer = setInterval(tick, 1050); render(); }, reduce ? 0 : 1300);
    }

    function pulse() {
      const d = derive(st.k); if (d.mon < 1 || !st.live) return;
      const v = 30 + Math.sin(Date.now() / 420) * 4 + Math.random() * 5;
      spark.pts.push(d.mon === 2 && spark.pts.length % 40 > 34 ? 6 : v); if (spark.pts.length > 50) spark.pts.shift();
      const dx = 200 / 49; spark.line.setAttribute('points', spark.pts.map((y, n) => `${(n * dx).toFixed(1)},${y.toFixed(1)}`).join(' '));
      q('#wsSpark').classList.toggle('is-bad', d.mon === 2 && !d.mem);
    }
    setInterval(pulse, 520);

    const onClick = (ev: any) => {
      if (ev.target === modal) { closePreview(); return; }
      const t = ev.target.closest('button, input'); if (!t) return;
      if (t.dataset.eco) { t.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }); st.eco = t.dataset.eco; qa('[data-eco]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); reset(); run(); }
      else if (t.dataset.net) { st.net = t.dataset.net; qa('[data-net]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); render(); }
      else if (t.dataset.tab) { st.tab = t.dataset.tab; st.auto = false; st.doc = null; render(); }
      else if (t.dataset.doc) { st.doc = st.doc === t.dataset.doc ? null : t.dataset.doc; render(); }
      else if (t.hasAttribute('data-close')) { st.doc = null; render(); }
      else if (t.dataset.go) { stop(); st.doc = null; go(Number(t.dataset.go), true); }
      else if (t.dataset.why) { const g = WS_GATE.find(x => x[0] === t.dataset.why); q('#wsWhy').textContent = g[2]; qa('#wsGate li').forEach(l => l.classList.toggle('is-picked', l.dataset.k === g[0])); }
      else if (t.dataset.step) { stop(); go(Number(t.dataset.step), true); }
      else if (t.id === 'wsPlay') { st.timer ? (stop(), render()) : run(); }
      else if (t.id === 'wsStep') { stop(); tick(); }
      else if (t.id === 'wsReset') reset();
      else if (t.id === 'wsSign') openPreview();
      else if (t.id === 'wsReject') closePreview();
      else if (t.id === 'wsApprove') approve();
      else if (t.id === 'wsC1' || t.id === 'wsC2') canApprove();
      else if (t.id === 'wsIncident') { st.incident = true; go(18); st.timer = setInterval(tick, 1100); }
    };
    rootEl.addEventListener('click', onClick);
    modal.addEventListener('click', onClick);
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closePreview(); });

    render();
    if (reduce) { st.signed = false; go(12); return; }
    ScrollTrigger.create({
      trigger: rootEl, start: 'top 75%', end: 'bottom 15%',
      onToggle: self => {
        st.live = self.isActive;
        if (self.isActive && st.k < 0) run();
      }
    });
  }

  // Services accordion
  let svcOpen = null;
  const serviceMoodName = () => (svcOpen ? 'eco-' + svcOpen.dataset.mood : 'ecosystems');

  function initServices() {
    const items = $$('.svc');
    let rT;
    const refreshSoon = () => { clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 80); };
    const openItem = (el: any, instant?: boolean) => {
      el.classList.add('is-open');
      $('.svc__head', el).setAttribute('aria-expanded', 'true');
      const b = $('.svc__body', el);
      if (instant) gsap.set(b, { height: 'auto' });
      else gsap.to(b, { height: 'auto', duration: .9, ease: 'expo.out', onComplete: refreshSoon });
      svcOpen = el;
    };
    const closeItem = (el: any) => {
      el.classList.remove('is-open');
      $('.svc__head', el).setAttribute('aria-expanded', 'false');
      gsap.to($('.svc__body', el), { height: 0, duration: .7, ease: 'expo.out', onComplete: refreshSoon });
      if (svcOpen === el) svcOpen = null;
    };
    items.forEach(el => {
      $('.svc__head', el).addEventListener('click', () => {
        if (el.classList.contains('is-open')) closeItem(el);
        else { if (svcOpen) closeItem(svcOpen); openItem(el); }
        setMood(serviceMoodName(), { d: 1.2 });
      });
      el.addEventListener('pointerenter', (e: any) => { if (e.pointerType !== 'touch') setMood('eco-' + el.dataset.mood, { d: 1.1 }); });
      el.addEventListener('pointerleave', (e: any) => { if (e.pointerType !== 'touch') setMood(serviceMoodName(), { d: 1.1 }); });
    });
    openItem(items[0], true);
  }

  // Levels
  function initLevels() {
    const list = $('#levelsList'), out = $('#levelsOut');
    const svcs = $$('.svc');
    if (!list || !out || !svcs.length) return;
    const btns = $$('button', list);
    function apply(lv: number) {
      btns.forEach((b: any) => b.setAttribute('aria-pressed', String(+b.dataset.lv === lv)));
      if (lv < 0) {
        svcs.forEach(s => s.classList.remove('is-below-level'));
        out.textContent = 'Level 0 means the network is registered but not yet executable. Level 8 covers the complete lifecycle, including upgrades, migration and incident replay.';
        return;
      }
      svcs.forEach(s => s.classList.toggle('is-below-level', +s.dataset.level < lv));
      const reach = svcs.filter(s => +s.dataset.level >= lv).length;
      out.textContent = LEVEL_TEXT[lv] + ' ' + reach + ' of ' + svcs.length + ' listed ecosystems currently reach this level.';
    }
    btns.forEach((b: any) => {
      const lv = +b.dataset.lv;
      b.addEventListener('click', () => apply(b.getAttribute('aria-pressed') === 'true' ? -1 : lv));
    });
  }

  // Stage cards sheet
  const caseEl = $('#case'), caseBg = $('#caseBg'), caseCover = $('#caseCover'), casePanel = $('#casePanel'), caseSlot = $('#caseSlot');
  let caseOpen = false, caseBusy = false, openCover = null, openBtn = null, caseIdx = 0, originIdx = 0;
  const pad2 = (n: number) => String(n).padStart(2, '0');

  function depth(el: any, e: any) {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  }
  function playCover() {
    caseCover.classList.remove('play');
    void caseCover.offsetWidth;
    caseCover.classList.add('play');
  }
  const slotRect = () => { const r = caseSlot.getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width, height: r.height }; };

  function fillCase(i: number) {
    const p = STAGES[i];
    $('#caseNum').textContent = pad2(i + 1);
    $('#casePhase').textContent = PHASES[p.phase].name;
    $('#caseTitle').textContent = p.name;
    $('#caseAgent').textContent = p.agent;
    $('#caseText').textContent = p.text;
    $('#caseOut').textContent = p.out;
    $('#caseChips').innerHTML = p.chips.map(c => `<li>${c}</li>`).join('');
    const prev = STAGES[i - 1], next = STAGES[i + 1];
    $('#casePrev').disabled = !prev; $('#caseNext').disabled = !next;
    $('#casePrev b').textContent = prev ? prev.name : '';
    $('#caseNext b').textContent = next ? next.name : '';
    casePanel.scrollTop = 0;
  }

  function openCase(i: number, btn: any) {
    if (caseOpen || caseBusy) return;
    caseOpen = true; caseBusy = true;
    caseIdx = originIdx = i; openBtn = btn; openCover = $('.card__cover', btn);
    const r = openCover.getBoundingClientRect();
    const radius = getComputedStyle(openCover).borderRadius;
    caseCover.innerHTML = stageArt(i, 'o', STAGES[i].phase);
    playCover();
    fillCase(i);
    caseEl.classList.add('is-open');
    caseEl.setAttribute('aria-hidden', 'false');
    smooth.locked = true;
    openCover.style.visibility = 'hidden';
    gsap.set(caseCover, { top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: radius, opacity: 1 });
    gsap.set(caseBg, { opacity: 0 });
    gsap.set('.case__anim', { opacity: 0 });
    const t = slotRect();
    gsap.timeline({ onComplete: () => { caseBusy = false; casePanel.focus({ preventScroll: true }); } })
      .to(caseBg, { opacity: 1, duration: .5, ease: 'power2.out' }, 0)
      .to(caseCover, { top: t.top, left: t.left, width: t.width, height: t.height, borderRadius: 22, duration: 1.05, ease: 'expo.inOut' }, 0)
      .fromTo('.case__anim', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .08 }, .6);
  }

  function stepCase(d: number) {
    const j = caseIdx + d;
    if (!caseOpen || caseBusy || j < 0 || j >= STAGES.length) return;
    caseBusy = true; caseIdx = j;
    gsap.timeline({ onComplete: () => { caseBusy = false; } })
      .to('.case__body', { opacity: 0, y: 14, duration: .2, ease: 'power2.in' }, 0)
      .to(caseCover, { opacity: 0, duration: .25, ease: 'power2.in' }, 0)
      .add(() => { caseCover.innerHTML = stageArt(j, 'o', STAGES[j].phase); playCover(); fillCase(j); }, .27)
      .to(caseCover, { opacity: 1, duration: .5, ease: 'power2.out' }, .29)
      .fromTo('.case__body', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .8, ease: 'expo.out' }, .29);
  }

  function closeCase() {
    if (!caseOpen || caseBusy) return;
    caseBusy = true;
    const done = () => {
      caseEl.classList.remove('is-open');
      caseEl.setAttribute('aria-hidden', 'true');
      openCover.style.visibility = '';
      smooth.locked = false;
      jumpTo(window.scrollY);
      if (openBtn) openBtn.focus({ preventScroll: true });
      caseOpen = false; caseBusy = false;
    };
    const tl = gsap.timeline({ onComplete: done });
    tl.to('.case__anim', { opacity: 0, y: -16, duration: .35, ease: 'power2.in', stagger: .03 }, 0);
    if (caseIdx === originIdx) {
      const r = openCover.getBoundingClientRect();
      const radius = getComputedStyle(openCover).borderRadius;
      tl.to(caseCover, { top: r.top, left: r.left, width: r.width, height: r.height, borderRadius: radius, duration: .95, ease: 'expo.inOut' }, .1)
        .to(caseBg, { opacity: 0, duration: .5, ease: 'power2.in' }, .55);
    } else {
      tl.to(caseCover, { opacity: 0, duration: .5, ease: 'power2.in' }, .1)
        .to(caseBg, { opacity: 0, duration: .5, ease: 'power2.in' }, .3);
    }
  }

  function initCards() {
    $$('.card__link').forEach((btn: any, i: number) => {
      btn.addEventListener('click', () => openCase(i, btn));
      if (finePointer && !reduce) {
        const cover = $('.card__cover', btn);
        btn.addEventListener('pointermove', e => depth(cover, e));
        btn.addEventListener('pointerleave', () => { cover.style.setProperty('--px', 0); cover.style.setProperty('--py', 0); });
      }
    });
    if (finePointer) {
      caseCover.addEventListener('pointermove', e => depth(caseCover, e));
      caseCover.addEventListener('pointerleave', () => { caseCover.style.setProperty('--px', 0); caseCover.style.setProperty('--py', 0); });
      caseCover.addEventListener('pointerenter', playCover);
    }
    caseCover.addEventListener('click', playCover);
    $('#caseClose')?.addEventListener('click', closeCase);
    $('#casePrev')?.addEventListener('click', () => stepCase(-1));
    $('#caseNext')?.addEventListener('click', () => stepCase(1));
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape' && caseOpen) closeCase();
      else if (caseOpen && e.key === 'ArrowRight') stepCase(1);
      else if (caseOpen && e.key === 'ArrowLeft') stepCase(-1);
    });
  }

  // Hero interactive chars
  const hero = { title: $('.hero__title'), chars: [], ready: false };
  function prepHero() {
    $$('.hero__title .line__in').forEach(l => {
      splitChars(l).forEach((el: any) => hero.chars.push({ el, ox: 0, oy: 0, x: 0, y: 0, r: 0, set: false }));
    });
  }
  function measureChars() {
    if (!hero.ready || !hero.chars.length) return;
    const tr = hero.title.getBoundingClientRect();
    hero.chars.forEach((c: any) => {
      const r = c.el.getBoundingClientRect();
      c.ox = r.left + r.width / 2 - tr.left - c.x;
      c.oy = r.top + r.height / 2 - tr.top - c.y;
    });
  }
  function tickChars(dt: number) {
    if (!hero.ready || !finePointer || reduce) return;
    const rc = hero.title.getBoundingClientRect();
    if (rc.bottom < 0) return;
    const R = 170, k = 1 - Math.exp(-dt * 9);
    for (let i = 0; i < hero.chars.length; i++) {
      const c = hero.chars[i];
      let tx = 0, ty = 0, tr = 0;
      if (ptr.active) {
        const dx = rc.left + c.ox - ptr.px, dy = rc.top + c.oy - ptr.py;
        const d = Math.hypot(dx, dy);
        if (d < R) {
          const f = 1 - d / R, f2 = f * f, inv = 1 / (d || 1);
          tx = dx * inv * f2 * 38; ty = dy * inv * f2 * 38; tr = (dx / R) * f2 * 16;
        }
      }
      c.x += (tx - c.x) * k; c.y += (ty - c.y) * k; c.r += (tr - c.r) * k;
      if (tx === 0 && ty === 0 && Math.abs(c.x) < .02 && Math.abs(c.y) < .02) {
        if (c.set) { c.el.style.transform = ''; c.set = false; c.x = c.y = c.r = 0; }
        continue;
      }
      c.el.style.transform = `translate3d(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px,0) rotate(${c.r.toFixed(2)}deg)`;
      c.set = true;
    }
  }

  // Marquee
  const mq = { track: $('#marqueeTrack'), x: 0, half: 0, dir: -1 };
  const mqB = { track: $('#marqueeTrackB'), x: 0, half: 0 };
  function buildMarquee() {
    if (!mq.track) return;
    const names = ['EVM', 'Solana', 'CosmWasm', 'Sui', 'Aptos', 'Starknet', 'NEAR', 'Polkadot', 'Cardano', 'And more'];
    const dot = '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="currentColor"/></svg>';
    const set = '<div class="marquee__item">' + names.map(n => `<span>${n}</span>${dot}`).join('') + '</div>';
    mq.track.innerHTML = set + set;
    if (mqB.track) {
      const caps = ['Spec locking', 'Threat modeling', 'Fuzzing', 'Formal verification', 'Simulation', 'Wallet approval', 'Incident replay', 'Security memory'];
      const setB = '<div class="marquee__item">' + caps.map(n => `<span>${n}</span>${dot}`).join('') + '</div>';
      mqB.track.innerHTML = setB + setB;
    }
  }
  function measureMarquee() { if (mq.track) mq.half = mq.track.scrollWidth / 2; if (mqB.track) mqB.half = mqB.track.scrollWidth / 2; }
  function tickMarquee(dt: number) {
    if (!mq.track || !mq.half) return;
    const v = smooth.velS;
    if (v > .5) mq.dir = -1; else if (v < -.5) mq.dir = 1;
    const baseSpd = reduce ? 0 : 60;
    mq.x += mq.dir * (baseSpd + Math.abs(v) * 45) * dt;
    if (mq.x <= -mq.half) mq.x += mq.half;
    if (mq.x > 0) mq.x -= mq.half;
    const skew = reduce ? 0 : clamp(-v * .08, -8, 8);
    mq.track.style.transform = `translate3d(${mq.x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    if (mqB.track && mqB.half) {
      mqB.x -= mq.dir * (baseSpd * .7 + Math.abs(v) * 30) * dt;
      if (mqB.x <= -mqB.half) mqB.x += mqB.half;
      if (mqB.x > 0) mqB.x -= mqB.half;
      mqB.track.style.transform = `translate3d(${mqB.x.toFixed(2)}px,0,0) skewX(${skew.toFixed(2)}deg)`;
    }
  }

  // Cursor
  const cur = { el: $('#cursor'), ring: $('#cursorRing'), dot: $('#cursorDot'), label: $('#cursorLabel'), rx: 0, ry: 0, shown: false };
  function initCursor() {
    if (!finePointer) return;
    root.classList.add('has-cursor');
    document.addEventListener('pointerover', (e: any) => {
      const t = e.target.closest ? e.target.closest('[data-cursor], a, button') : null;
      cur.el.classList.remove('is-link', 'is-view');
      if (!t) return;
      if (t.dataset.cursor === 'view') { cur.el.classList.add('is-view'); cur.label.textContent = t.dataset.label || 'View'; }
      else cur.el.classList.add('is-link');
    });
    document.addEventListener('pointerleave', () => cur.el.classList.remove('is-on'));
  }
  function tickCursor(dt: number) {
    if (!finePointer || !ptr.active) return;
    if (!cur.shown) { cur.shown = true; cur.rx = ptr.px; cur.ry = ptr.py; cur.el.classList.add('is-on'); }
    else if (!cur.el.classList.contains('is-on')) cur.el.classList.add('is-on');
    const k = 1 - Math.exp(-dt * 14);
    cur.rx += (ptr.px - cur.rx) * k; cur.ry += (ptr.py - cur.ry) * k;
    cur.dot.style.transform = `translate3d(${ptr.px}px,${ptr.py}px,0)`;
    cur.ring.style.transform = `translate3d(${cur.rx.toFixed(1)}px,${cur.ry.toFixed(1)}px,0)`;
  }

  // Nav, Menu & Page transitions
  const nav = $('#nav'), progress = $('#progress');
  const menu = $('#menu'), menuBtn = $('#menuBtn');
  const wipe = $('#wipe'), wipeLabel = $('#wipeLabel');
  let menuOpen = false, transitioning = false, workST = null, maxS = 0;

  function tickNav() {
    if (menuOpen) { nav.classList.remove('is-hidden'); return; }
    const y = window.scrollY;
    if (y < 90 || smooth.vel < -4) nav.classList.remove('is-hidden');
    else if (smooth.vel > 4 && y > 160) nav.classList.add('is-hidden');
  }
  function tickProgress() {
    progress.style.transform = 'scaleX(' + (maxS > 0 ? clamp(window.scrollY / maxS, 0, 1) : 0).toFixed(4) + ')';
  }

  function setMenu(open: boolean) {
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    smooth.locked = open;
    if (open) {
      menu.classList.add('is-open');
      gsap.to(menu, { clipPath: 'inset(0% 0% 0% 0%)', duration: .9, ease: 'expo.inOut', overwrite: 'auto' });
      gsap.fromTo('.menu a', { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .07, delay: .3 });
    } else {
      gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'expo.inOut', overwrite: 'auto', onComplete: () => { if (!menuOpen) menu.classList.remove('is-open'); } });
    }
  }

  function sectionY(sel: string) {
    if (sel === '#top') return 0;
    if (sel === '#lifecycle' && workST) return workST.start;
    const el = $(sel);
    return el ? el.getBoundingClientRect().top + window.scrollY : 0;
  }

  function goTo(sel: string, label?: string) {
    if (transitioning || smooth.locked) return;
    if (reduce) { jumpTo(sectionY(sel)); return; }
    transitioning = true; smooth.locked = true;
    wipeLabel.textContent = label || '';
    gsap.timeline({ onComplete: () => { transitioning = false; smooth.locked = false; } })
      .set(wipe, { clipPath: 'inset(100% 0% 0% 0%)', pointerEvents: 'auto' })
      .to(wipe, { clipPath: 'inset(0% 0% 0% 0%)', duration: .75, ease: 'expo.inOut' })
      .fromTo(wipeLabel, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: 'expo.out' }, '-=.35')
      .add(() => jumpTo(sectionY(sel)))
      .to(wipe, { clipPath: 'inset(0% 0% 100% 0%)', duration: .85, ease: 'expo.inOut' }, '+=.2')
      .set(wipe, { pointerEvents: 'none' });
  }

  function initNav() {
    $$('[data-goto]').forEach((a: any) => a.addEventListener('click', (e: any) => {
      e.preventDefault();
      if (menuOpen) setMenu(false);
      goTo(a.dataset.goto, a.dataset.label || '');
    }));
    menuBtn?.addEventListener('click', () => setMenu(!menuOpen));
    window.addEventListener('pointermove', () => $('#hint')?.classList.add('is-gone'), { once: true });
  }

  // Hero prompt typewriter
  function initPrompt() {
    const box = $('#promptText'), chips = $('#promptChips');
    if (!box || !chips) return;
    const tags = (p: any) => p.tags.map((t: string, k: number) => `<li style="--i:${k}">${t}</li>`).join('');
    if (reduce) { box.textContent = PROMPTS[0].q; chips.innerHTML = tags(PROMPTS[0]); chips.classList.add('is-on'); return; }
    let pi = 0, ci = 0;
    const visible = () => window.scrollY < window.innerHeight * .9 && !document.hidden;
    const type = () => {
      if (!visible()) { setTimeout(type, 500); return; }
      const p = PROMPTS[pi];
      if (ci <= p.q.length) { box.textContent = p.q.slice(0, ci++); setTimeout(type, 40 + Math.random() * 45); }
      else {
        chips.innerHTML = tags(p);
        requestAnimationFrame(() => requestAnimationFrame(() => chips.classList.add('is-on')));
        setTimeout(erase, 2800);
      }
    };
    const erase = () => {
      chips.classList.remove('is-on');
      setTimeout(() => { chips.innerHTML = ''; }, 500);
      const back = () => {
        if (ci > 0) { box.textContent = PROMPTS[pi].q.slice(0, --ci); setTimeout(back, 16); }
        else { pi = (pi + 1) % PROMPTS.length; setTimeout(type, 400); }
      };
      setTimeout(back, 450);
    };
    type();
  }

  const SPY: Record<string, string> = { top: 'Intro', manifesto: 'Manifesto', lifecycle: 'Lifecycle', agents: 'Agents', evidence: 'Evidence', gate: 'Safety', rules: 'Rules', workspace: 'Workspace', architecture: 'Architecture', ecosystems: 'Ecosystems', scope: 'Scope', journeys: 'Journeys', start: 'Start' };
  function showSpy(i: number, total: number, id: string) {
    const el = $('#spy');
    if (!el) return;
    const p2 = (n: number) => String(n).padStart(2, '0');
    $('#spyNum').textContent = p2(i + 1) + ' / ' + p2(total);
    $('#spyName').textContent = SPY[id] || id;
    el.classList.add('is-on');
  }

  function initScroll() {
    const zone = (trigger: string, start: string, end: string, from: number, to: number) => ScrollTrigger.create({
      trigger, start, end,
      onUpdate: s => applyTheme(lerp(from, to, s.progress)),
      onLeave: () => applyTheme(to),
      onLeaveBack: () => applyTheme(from)
    });

    gsap.to('.hero__title', { y: () => window.innerHeight * .2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });

    wrapWords($('#manifestoText'));
    gsap.fromTo($$('#manifestoText .w'), { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .1, duration: .4,
      scrollTrigger: { trigger: '#manifestoText', start: 'top 80%', end: 'bottom 50%', scrub: true } });
    if (!reduce) gsap.from('.manifesto__more .tags li', { opacity: 0, y: 16, duration: .8, ease: 'expo.out', stagger: .04,
      scrollTrigger: { trigger: '.manifesto__more', start: 'top 88%', once: true } });

    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      const track = $('#lifecycleTrack');
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const tween = gsap.to(track, { x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: '#lifecycle', start: 'top top', end: () => '+=' + Math.round(dist() * .7), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: self => setStage(Math.round(self.progress * (STAGES.length - 1))) } });
      workST = tween.scrollTrigger;
      $$('.card__art').forEach((a: any) => gsap.fromTo(a, { xPercent: -4 }, { xPercent: 4, ease: 'none',
        scrollTrigger: { trigger: a.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
      return () => { workST = null; };
    });

    let prevTheme = 0;
    $$('main > section[id]').forEach((sec: any, i: number) => {
      const cur = sec.dataset.theme === 'dark' ? 1 : 0;
      if (i > 0 && cur !== prevTheme) zone('#' + sec.id, 'top 85%', 'top 35%', prevTheme, cur);
      prevTheme = cur;
    });

    gsap.fromTo($$('.levels__list li'), { opacity: .22 }, { opacity: 1, ease: 'none', stagger: .12, duration: .3,
      scrollTrigger: { trigger: '.levels__list', start: 'top 88%', end: 'bottom 60%', scrub: true } });

    gsap.to('.steps__fill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 60%', end: 'bottom 60%', scrub: true } });
    $$('.step').forEach((s: any) => ScrollTrigger.create({
      trigger: s, start: 'top 62%',
      onEnter: () => s.classList.add('is-active'),
      onLeaveBack: () => s.classList.remove('is-active')
    }));

    $$('.claim').forEach((c: any) => ScrollTrigger.create({
      trigger: c, start: 'top 74%',
      onEnter: () => c.classList.add('is-checked'),
      onLeaveBack: () => c.classList.remove('is-checked')
    }));
    gsap.fromTo($$('.chain li'), { opacity: .25 }, { opacity: 1, ease: 'none', stagger: .12, duration: .3,
      scrollTrigger: { trigger: '.chain', start: 'top 90%', end: 'bottom 62%', scrub: true } });

    if (!reduce) {
      $$('.ledger, .ws').forEach((g: any) => gsap.from(g, { clipPath: 'inset(10% 5% 10% 5% round 22px)', opacity: 0, y: 40, duration: 1.2, ease: 'expo.out', clearProps: 'clipPath',
        scrollTrigger: { trigger: g, start: 'top 88%', once: true } }));
      gsap.from('.mega span', { yPercent: 45, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.mega', start: 'top 95%', once: true } });
      gsap.from('.rule', { opacity: 0, y: 24, duration: .9, ease: 'expo.out', stagger: .05,
        scrollTrigger: { trigger: '.rules__list', start: 'top 86%', once: true } });
      $$('.reveal').forEach((el: any) => gsap.from($$('.line__in', el), { yPercent: 118, duration: 1.3, ease: 'expo.out', stagger: .09,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } }));
      gsap.from('#ctaRow > *', { y: 32, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1,
        scrollTrigger: { trigger: '#ctaRow', start: 'top 92%', once: true } });
    }
  }

  function initMoods() {
    const ids = $$('main > section[id]').map((s: any) => s.id);
    const nameOf = (id: string) => (id === 'top' ? 'hero' : id === 'start' ? 'cta' : id);
    const pick = (name: string) => (name === 'ecosystems' ? serviceMoodName() : name === 'lifecycle' ? 'phase-' + lifePhase : name);
    const list = ids.map((id, i) => {
      const next = ids[i + 1], name = nameOf(id);
      return { name, st: ScrollTrigger.create({
        trigger: '#' + id, start: 'top 55%',
        endTrigger: '#' + (next || id), end: next ? 'top 55%' : 'bottom bottom',
        onToggle: self => { if (self.isActive) { moodActive = name; setMood(pick(name)); showSpy(i, ids.length, id); } }
      }) };
    });
    ScrollTrigger.refresh();
    const active = list.find(o => o.st.isActive);
    moodActive = active ? active.name : 'hero';
    setMood(pick(moodActive), { d: 1.4 });
  }

  function startIntro() {
    smooth.locked = true;
    const loader = $('#loader');
    const done = () => { hero.ready = true; $$('.hero .line').forEach((l: any) => { l.style.overflow = 'visible'; }); measureChars(); initMoods(); initPrompt(); };
    if (reduce) {
      if (loader) loader.remove();
      Object.assign(S, { scale: 1, amp: PRESETS.hero.amp });
      smooth.locked = false;
      done();
      return;
    }
    const count = $('#count'), bar = $('.loader__bar i'), counter = { v: 0 };
    gsap.timeline({ onComplete: done })
      .from('.loader__word span', { yPercent: 110, duration: 1, ease: 'expo.out' }, 0)
      .to(counter, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => {
          if (count) count.textContent = Math.round(counter.v);
          if (bar) bar.style.transform = 'scaleX(' + (counter.v / 100) + ')';
        } }, 0)
      .to(loader, { yPercent: -100, duration: 1.15, ease: 'expo.inOut' }, 1.9)
      .set(loader, { display: 'none' })
      .fromTo(S, { scale: .0001, amp: .75 }, { scale: 1, amp: PRESETS.hero.amp, duration: 2.4, ease: 'expo.out' }, 2.3)
      .from('.hero .line__in', { yPercent: 118, duration: 1.4, ease: 'expo.out', stagger: .1 }, 2.45)
      .from('.nav__logo, .nav__links li, .nav__cta, .nav__menu', { y: -26, opacity: 0, duration: 1, ease: 'expo.out', stagger: .07 }, 2.7)
      .from('.hero__badge', { y: 20, opacity: 0, duration: 1, ease: 'expo.out' }, 2.4)
      .from('.prompt', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out' }, 2.95)
      .from('.hero__foot > *', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1 }, 3.05)
      .from('.hero__hint', { opacity: 0, duration: 1 }, 3.4)
      .add(() => { smooth.locked = false; }, 3.3);
  }

  // Build all components
  buildWork();
  buildMarquee();
  buildAgents();
  buildJourneys();
  buildArch();
  rollify();
  prepHero();
  initCursor();
  initNav();
  initCards();
  initServices();
  initLevels();
  buildScope();
  initRules();
  initWorkspace();

  const gl = initGL();
  if (!gl) root.classList.add('no-webgl');

  ScrollTrigger.addEventListener('refresh', () => { measureMarquee(); measureChars(); maxS = maxScroll(); });
  
  function tickLoop(time: number, deltaTime: number) {
    if (!isLandingActive) return;
    const dt = Math.min(deltaTime / 1000, .05);
    tickScroll(dt);
    tickNav();
    tickProgress();
    tickCursor(dt);
    tickMarquee(dt);
    tickChars(dt);
    if (gl) gl.update(dt);
  }
  gsap.ticker.add(tickLoop);

  initScroll();
  measureMarquee();
  maxS = maxScroll();
  startIntro();
}
