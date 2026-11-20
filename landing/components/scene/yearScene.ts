/* The year as an object: a drum of 365 slips, five rows by 73 columns, one slip
   per night. Scroll moves the camera around, then inside, the drum; the nights
   you "keep" light up in moonlight, and two stay paper white: the days of grace.

   Plain three.js, no postprocessing. One InstancedMesh (365 boxes), one moon,
   a field of stars. Lit state, hover lift and the intro are driven per instance
   on the GPU so a frame costs almost nothing. */

import * as THREE from "three";
import {
  GRACE_NIGHTS,
  KEPT_NIGHTS,
  KEPT_ORDER,
  NIGHTS,
  SCENE_EVENTS,
  tonightIndex,
  type HoverDetail,
} from "./night";

const COLS = 73;
const ROWS = 5;
const RADIUS = 7.2;
const PITCH = 1.46;
const SLIP_W = 0.5;
const SLIP_H = 1.24;
const SLIP_D = 0.07;

const GROUND = 0x0a0b0f;
const SLATE = 0x252b3d;
const PAPER = 0xebe7dc;
const MOON = 0xa9c1d9;

type V3 = readonly [number, number, number];

interface Pose {
  cam: V3;
  look: V3;
  fov: number;
  /** Shift of the scene on screen, as a fraction of the canvas. vx > 0 moves it right, vy > 0 up. */
  vx: number;
  vy: number;
  yaw: number;
  /** How many nights are lit (of 363). */
  lit: number;
  moon: V3;
  moonS: number;
  /** How much of the scene shows through behind text (canvas opacity). */
  dim: number;
  /** Extra darkening on the text side of the screen: strength 0..1, and where it ends as a fraction of the width. */
  calm: number;
  calmX: number;
}

const OVERVIEW_LOOK: V3 = [0, 0, 0];

/** Stops, in page order. Each is held while its section is on screen. */
const BASE_STOPS: Record<string, Pose> = {
  hero: { cam: [0, 3.6, 25.5], look: [0, 0.2, 0], fov: 34, vx: 0.3, vy: -0.01, yaw: -0.35, lit: 70, moon: [0, 6.2, -10.4], moonS: 1.2, dim: 0.95, calm: 0.45, calmX: 0.52 },
  instead: { cam: [-2, 5, 26], look: [2, 0, 0], fov: 34, vx: 0.3, vy: -0.14, yaw: 0.4, lit: 60, moon: [-5.7, 9, -9.6], moonS: 1.1, dim: 0.45, calm: 0.7, calmX: 0.52 },
  rule: { cam: [-1.6, 0.8, 12.2], look: [0, 0, 3.5], fov: 38, vx: -0.14, vy: 0, yaw: 0, lit: 8, moon: [-6.5, 4.6, 0], moonS: 0.8, dim: 0.5, calm: 0.7, calmX: 0.52 },
  loop: { cam: [3, 6, 24], look: OVERVIEW_LOOK, fov: 34, vx: -0.3, vy: -0.16, yaw: 1.5, lit: 120, moon: [8.9, 8.4, -11.4], moonS: 1.1, dim: 0.45, calm: 0.7, calmX: 0.52 },
  inside: { cam: [0, 7, 25], look: OVERVIEW_LOOK, fov: 34, vx: 0.32, vy: -0.2, yaw: 2.6, lit: 180, moon: [-9, 8, -14], moonS: 1.1, dim: 0.3, calm: 0, calmX: 0.5 },
  "year-in": { cam: [0, 0.1, 0], look: [-2.6, 0, 6.7], fov: 78, vx: 0, vy: 0, yaw: 0, lit: 24, moon: [0, 0.2, 0], moonS: 0.4, dim: 1, calm: 0, calmX: 0.5 },
  "year-out": { cam: [0, 3.2, 22], look: [0, 0, 0], fov: 36, vx: 0.24, vy: 0, yaw: 3.45, lit: KEPT_NIGHTS, moon: [2.2, 5.6, -13.9], moonS: 1.1, dim: 1, calm: 0, calmX: 0.5 },
  reflection: { cam: [0, 5.5, 26], look: OVERVIEW_LOOK, fov: 34, vx: 0.32, vy: -0.16, yaw: 4.2, lit: KEPT_NIGHTS, moon: [-11, 8, -12], moonS: 1.1, dim: 0.45, calm: 0.7, calmX: 0.52 },
  principles: { cam: [0, 6, 26], look: OVERVIEW_LOOK, fov: 34, vx: -0.32, vy: -0.16, yaw: 4.9, lit: KEPT_NIGHTS, moon: [11, 8, -12], moonS: 1.1, dim: 0.3, calm: 0, calmX: 0.5 },
  faq: { cam: [0, 6, 27], look: OVERVIEW_LOOK, fov: 34, vx: 0.34, vy: -0.2, yaw: 5.6, lit: KEPT_NIGHTS, moon: [-11, 8, -12], moonS: 1.1, dim: 0.3, calm: 0, calmX: 0.5 },
  close: { cam: [0, 3, 22], look: OVERVIEW_LOOK, fov: 34, vx: 0, vy: 0.04, yaw: 6.5, lit: KEPT_NIGHTS, moon: [0, 3.8, -14], moonS: 1.4, dim: 0.6, calm: 0, calmX: 0.5 },
};

const ORDER = ["hero", "instead", "rule", "loop", "inside", "year", "reflection", "principles", "faq", "close"] as const;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Hold the first and last quarter of a segment, ease through the middle. */
const plateau = (t: number) => smooth(clamp((t - 0.22) / 0.56));
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    cam: lerp3(a.cam, b.cam, t),
    look: lerp3(a.look, b.look, t),
    fov: lerp(a.fov, b.fov, t),
    vx: lerp(a.vx, b.vx, t),
    vy: lerp(a.vy, b.vy, t),
    yaw: lerp(a.yaw, b.yaw, t),
    lit: lerp(a.lit, b.lit, t),
    moon: lerp3(a.moon, b.moon, t),
    moonS: lerp(a.moonS, b.moonS, t),
    dim: lerp(a.dim, b.dim, t),
    calm: lerp(a.calm, b.calm, t),
    calmX: lerp(a.calmX, b.calmX, t),
  };
}

/** Slip i in drum space: column-major, so a lit frontier sweeps round five slips at a time. */
function slipTransform(i: number, out: THREE.Matrix4) {
  const col = Math.floor(i / ROWS);
  const row = i % ROWS;
  const theta = (col / COLS) * Math.PI * 2;
  const pos = new THREE.Vector3(Math.sin(theta) * RADIUS, (row - (ROWS - 1) / 2) * PITCH, Math.cos(theta) * RADIUS);
  const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), theta);
  out.compose(pos, quat, new THREE.Vector3(1, 1, 1));
}

const thetaOfNight = (n: number) => (Math.floor(n / ROWS) / COLS) * Math.PI * 2;

export interface YearScene {
  dispose: () => void;
}

export function createYearScene(canvas: HTMLCanvasElement): YearScene {
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reduceQuery.matches;
  const onReduce = () => (reduced = reduceQuery.matches);
  reduceQuery.addEventListener("change", onReduce);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(GROUND, 0);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(GROUND, 0.014);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 220);

  /* ── Lights ───────────────────────────────────────────────── */
  scene.add(new THREE.HemisphereLight(0x3a4666, 0x07080c, 0.9));
  const key = new THREE.DirectionalLight(MOON, 2.1);
  key.position.set(-6, 9, 12);
  scene.add(key);
  const lamp = new THREE.PointLight(MOON, 0, 0, 1.4);
  scene.add(lamp);

  /* ── Moon: a real photograph (NASA, CC0), always facing the camera ─────── */
  const moonTex = new THREE.TextureLoader().load("/photos/moon.jpg");
  moonTex.colorSpace = THREE.SRGBColorSpace;
  moonTex.repeat.set(0.88, 0.88);
  moonTex.offset.set(0.06, 0.06);
  moonTex.anisotropy = 4;
  const moonMat = new THREE.MeshBasicMaterial({ map: moonTex, color: 0xd3dceb, toneMapped: false, fog: false });
  const moon = new THREE.Mesh(new THREE.CircleGeometry(1, 96), moonMat);
  scene.add(moon);

  const haloCanvas = document.createElement("canvas");
  haloCanvas.width = haloCanvas.height = 256;
  {
    const g = haloCanvas.getContext("2d");
    if (g) {
      const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(169,193,217,0.55)");
      grad.addColorStop(0.35, "rgba(169,193,217,0.16)");
      grad.addColorStop(1, "rgba(169,193,217,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, 256, 256);
    }
  }
  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const halo = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, toneMapped: false }),
  );
  scene.add(halo);

  // Inside the year the moon becomes the lamp you carry.
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(1, 28, 18),
    new THREE.MeshBasicMaterial({ color: 0xe9f0f8, toneMapped: false, fog: false }),
  );
  orb.visible = false;
  scene.add(orb);

  /* ── Stars ────────────────────────────────────────────────── */
  const starCount = 650;
  const starPos = new Float32Array(starCount * 3);
  const starCol = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 70 + Math.random() * 60;
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    starPos.set([r * s * Math.cos(a), r * u, r * s * Math.sin(a)], i * 3);
    const b = 0.35 + Math.random() * 0.65;
    starCol.set([b, b, b * 0.97], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
  const starMat = new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, fog: false });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  /* ── The drum ─────────────────────────────────────────────── */
  const drum = new THREE.Group();
  scene.add(drum);

  const geo = new THREE.BoxGeometry(SLIP_W, SLIP_H, SLIP_D);
  const litAttr = new THREE.InstancedBufferAttribute(new Float32Array(NIGHTS), 1);
  litAttr.setUsage(THREE.DynamicDrawUsage);
  const hoverAttr = new THREE.InstancedBufferAttribute(new Float32Array(NIGHTS), 1);
  hoverAttr.setUsage(THREE.DynamicDrawUsage);
  const delayAttr = new THREE.InstancedBufferAttribute(new Float32Array(NIGHTS), 1);
  geo.setAttribute("aLit", litAttr);
  geo.setAttribute("aHover", hoverAttr);
  geo.setAttribute("aDelay", delayAttr);

  const uIntro = { value: 0 };
  const uMoon = { value: new THREE.Color(MOON) };
  const uPaper = { value: new THREE.Color(0xfff0cf) };
  const uCalm = { value: 0 };
  const uCalmX = { value: 0.5 };
  const uRes = { value: new THREE.Vector2(1, 1) };
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.42, metalness: 0.3 });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uIntro = uIntro;
    shader.uniforms.uMoon = uMoon;
    shader.uniforms.uPaper = uPaper;
    shader.uniforms.uCalm = uCalm;
    shader.uniforms.uCalmX = uCalmX;
    shader.uniforms.uRes = uRes;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float aLit;\nattribute float aHover;\nattribute float aDelay;\nuniform float uIntro;\nvarying float vLit;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vLit = aLit;
        float grow = clamp((uIntro - aDelay) / 0.9, 0.0, 1.0);
        grow = grow * grow * (3.0 - 2.0 * grow);
        transformed *= grow * (1.0 + aHover * 0.08);
        transformed.z += aHover * 0.42 + (1.0 - grow) * -1.2;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uMoon;\nuniform vec3 uPaper;\nuniform float uCalm;\nuniform float uCalmX;\nuniform vec2 uRes;\nvarying float vLit;")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vLit >= 0.0 ? uMoon * vLit * 0.62 : uPaper * (-vLit) * 0.95;")
      // The side of the screen where the words are is quieter, so grey text never sits on a bright slip.
      .replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\ngl_FragColor.rgb *= 1.0 - uCalm * (1.0 - smoothstep(uCalmX * 0.5, uCalmX, gl_FragCoord.x / uRes.x));",
      );
  };

  const slips = new THREE.InstancedMesh(geo, mat, NIGHTS);
  const m4 = new THREE.Matrix4();
  const tint = new THREE.Color();
  const graceSet = new Set(GRACE_NIGHTS);
  for (let i = 0; i < NIGHTS; i++) {
    slipTransform(i, m4);
    slips.setMatrixAt(i, m4);
    tint.set(graceSet.has(i) ? PAPER : SLATE);
    if (!graceSet.has(i)) tint.multiplyScalar(0.78 + ((i * 2654435761) % 1000) / 1000 * 0.4);
    slips.setColorAt(i, tint);
    // The intro sweeps round the drum column by column.
    delayAttr.setX(i, (Math.floor(i / ROWS) / COLS) * 1.25 + (i % ROWS) * 0.03);
  }
  slips.instanceMatrix.needsUpdate = true;
  if (slips.instanceColor) slips.instanceColor.needsUpdate = true;
  slips.frustumCulled = false;
  drum.add(slips);

  const rank = new Int16Array(NIGHTS).fill(-1);
  KEPT_ORDER.forEach((n, r) => (rank[n] = r));

  /* ── Page layout → camera stops ───────────────────────────── */
  interface Anchor {
    id: string;
    y: number;
  }
  let anchors: Anchor[] = [];
  let yearTop = 0;
  let yearSpan = 1;
  const tonight = tonightIndex();
  const tonightYaw = -thetaOfNight(tonight);
  const stops: Record<string, Pose> = {};
  {
    // Unwrap yaw so the drum never spins the long way round between two stops.
    let prev = 0;
    for (const [id, p] of Object.entries(BASE_STOPS)) {
      let yaw = id === "rule" ? tonightYaw : p.yaw;
      yaw += Math.round((prev - yaw) / (Math.PI * 2)) * Math.PI * 2;
      stops[id] = { ...p, yaw };
      if (id === "rule") {
        // Face tonight's slip, whichever of the five rows it sits in.
        const y = ((tonight % ROWS) - (ROWS - 1) / 2) * PITCH;
        stops[id] = { ...stops[id], cam: [p.cam[0], y + 0.8, p.cam[2]], look: [p.look[0], y, p.look[2]] };
      }
      prev = yaw;
    }
  }

  function layout() {
    const sy = window.scrollY;
    const vh = window.innerHeight;
    const next: Anchor[] = [];
    for (const id of ORDER) {
      const el = document.querySelector<HTMLElement>(`[data-stop="${id}"]`);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const top = r.top + sy;
      if (id === "year") {
        yearTop = top;
        yearSpan = Math.max(1, r.height - vh);
        next.push({ id: "year-in", y: top + vh / 2 });
        next.push({ id: "year-out", y: top + r.height - vh / 2 });
      } else {
        next.push({ id, y: top + r.height / 2 });
      }
    }
    anchors = next;
  }

  function adapt(p: Pose, aspect: number): Pose {
    if (aspect >= 0.95) return p;
    const out = clamp(0.62 / aspect, 1, 2.1);
    const look = new THREE.Vector3(...p.look);
    const cam = new THREE.Vector3(...p.cam).sub(look).multiplyScalar(p.fov > 60 ? 1 : out).add(look);
    return {
      ...p,
      calm: 0,
      cam: [cam.x, cam.y, cam.z],
      fov: p.fov > 60 ? Math.min(100, p.fov * 1.3) : p.fov,
      vx: 0,
      vy: p.fov > 60 ? 0 : p.vy * 0.3 + 0.26,
    };
  }

  function poseAt(f: number): Pose {
    if (anchors.length === 0) return stops.hero;
    if (f <= anchors[0].y) return stops[anchors[0].id];
    const last = anchors[anchors.length - 1];
    if (f >= last.y) return stops[last.id];
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i];
      const b = anchors[i + 1];
      if (f < b.y) {
        if (a.id === "year-in" && b.id === "year-out") return yearPose(clamp((window.scrollY - yearTop) / yearSpan));
        return lerpPose(stops[a.id], stops[b.id], plateau((f - a.y) / (b.y - a.y)));
      }
    }
    return stops[last.id];
  }

  /** Inside the drum: the lamp stays put, you turn slowly while the nights light up all round you,
   *  then step out to see all 363 and the two that stay paper white. */
  function yearPose(p: number): Pose {
    const k = clamp(p / 0.84);
    const lit = lerp(stops["year-in"].lit, KEPT_NIGHTS, smooth(k));
    const a = -0.45 + k * Math.PI * 1.6;
    const inside: Pose = {
      ...stops["year-in"],
      look: [Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS],
      lit,
    };
    if (p <= 0.84) return inside;
    return lerpPose(inside, stops["year-out"], smooth((p - 0.84) / 0.16));
  }

  /* ── State ────────────────────────────────────────────────── */
  const cur: Pose = { ...stops.hero };
  let litCount = cur.lit;
  const litNow = new Float32Array(NIGHTS);
  const hoverNow = new Float32Array(NIGHTS);
  let fade = 0;
  let kickT = 1;
  let tonightKept = false;
  let tonightPulse = 0;
  let hovered = -1;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, inside: false, cx: 0, cy: 0 };
  let width = 1;
  let height = 1;
  let raf = 0;
  let last = performance.now();

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.6 : 2);
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    renderer.getDrawingBufferSize(uRes.value);
    camera.aspect = width / height;
    layout();
  }

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function onPointerMove(e: PointerEvent) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    pointer.cx = e.clientX;
    pointer.cy = e.clientY;
    const target = e.target as HTMLElement | null;
    pointer.inside = e.pointerType === "mouse" && !!target?.closest("[data-scene-hover]");
  }

  function pick() {
    let next = -1;
    if (pointer.inside && !reduced) {
      ndc.set(pointer.x, pointer.y);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(slips, false)[0];
      if (hit && hit.instanceId !== undefined) next = hit.instanceId;
    }
    if (next !== hovered) {
      hovered = next;
      const detail: HoverDetail | null =
        next < 0
          ? null
          : { night: next + 1, x: pointer.cx, y: pointer.cy, kept: litNow[next] > 0.5, grace: graceSet.has(next) };
      window.dispatchEvent(new CustomEvent(SCENE_EVENTS.hover, { detail }));
    } else if (next >= 0) {
      window.dispatchEvent(
        new CustomEvent(SCENE_EVENTS.hover, {
          detail: { night: next + 1, x: pointer.cx, y: pointer.cy, kept: litNow[next] > 0.5, grace: graceSet.has(next) } satisfies HoverDetail,
        }),
      );
    }
  }

  function onKeep() {
    tonightKept = true;
    tonightPulse = 1;
    if (!reduced) kickT = 0;
  }

  const lookV = new THREE.Vector3();
  const camV = new THREE.Vector3();
  let pickClock = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    try {
      step(now);
    } catch (err) {
      canvas.dataset.error = String(err);
      console.error("[year scene]", err);
    }
  }

  function step(now: number) {
    if (document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    uIntro.value = reduced ? 4 : Math.min(4, uIntro.value + dt * 1.15);

    const target = adapt(poseAt(window.scrollY + window.innerHeight / 2), camera.aspect);
    const k = reduced ? 1 : 1 - Math.exp(-dt * 4.5);
    cur.cam = lerp3(cur.cam, target.cam, k);
    cur.look = lerp3(cur.look, target.look, k);
    cur.fov = lerp(cur.fov, target.fov, k);
    cur.vx = lerp(cur.vx, target.vx, k);
    cur.vy = lerp(cur.vy, target.vy, k);
    cur.yaw = lerp(cur.yaw, target.yaw, k);
    cur.moon = lerp3(cur.moon, target.moon, k);
    cur.moonS = lerp(cur.moonS, target.moonS, k);
    cur.dim = lerp(cur.dim, target.dim, k);
    cur.calm = lerp(cur.calm, target.calm, k);
    cur.calmX = lerp(cur.calmX, target.calmX, k);
    uCalm.value = cur.calm;
    uCalmX.value = cur.calmX;
    fade = Math.min(1, fade + dt * 0.8);
    const boost = kickT < 1 ? Math.sin(kickT * Math.PI) : 0;
    const dimNow = lerp(reduced ? target.dim : cur.dim, 1, boost * 0.85);
    canvas.style.opacity = String(dimNow * (reduced ? 1 : fade * fade * (3 - 2 * fade)));
    litCount = lerp(litCount, target.lit, reduced ? 1 : 1 - Math.exp(-dt * 3));

    // Pointer parallax: the camera leans a little toward the cursor.
    pointer.sx = lerp(pointer.sx, reduced ? 0 : pointer.x, 1 - Math.exp(-dt * 3));
    pointer.sy = lerp(pointer.sy, reduced ? 0 : pointer.y, 1 - Math.exp(-dt * 3));

    const t = now / 1000;
    // The drum breathes: a slow sway, wider while the hero is on screen.
    const heroness = clamp(1 - window.scrollY / (window.innerHeight * 0.8));
    drum.rotation.y = cur.yaw + (reduced ? 0 : Math.sin(t * 0.16) * (0.035 + 0.1 * heroness));
    stars.rotation.y = reduced ? 0 : t * 0.004 + window.scrollY * 0.00006;

    camV.set(cur.cam[0] + pointer.sx * 0.7, cur.cam[1] + pointer.sy * 0.45, cur.cam[2]);
    lookV.set(cur.look[0], cur.look[1], cur.look[2]);
    // Keeping tonight pushes the camera in toward the slip as it lights, then eases back.
    kickT = Math.min(1, kickT + dt * 0.5);
    if (kickT < 1) camV.lerp(lookV, Math.sin(kickT * Math.PI) * 0.18);
    camera.position.copy(camV);
    camera.lookAt(lookV);
    camera.fov = cur.fov;
    camera.setViewOffset(width, height, -cur.vx * width, cur.vy * height, width, height);
    camera.updateProjectionMatrix();

    const inside = clamp(1 - camV.length() / 5);
    const bob = reduced ? 0 : Math.sin(t * 0.4) * 0.12;
    moon.position.set(cur.moon[0] + pointer.sx * -0.5, cur.moon[1] + bob, cur.moon[2]);
    moon.quaternion.copy(camera.quaternion);
    moon.scale.setScalar(cur.moonS * (1 - inside));
    moon.visible = inside < 0.98;
    halo.position.copy(moon.position);
    halo.quaternion.copy(camera.quaternion);
    halo.scale.setScalar(cur.moonS * 5.2 * (1 - inside * 0.6));
    orb.position.copy(moon.position);
    orb.scale.setScalar(0.34 * inside + 0.0001);
    orb.visible = inside > 0.02;
    lamp.position.copy(moon.position);
    lamp.intensity = inside * 16;

    // Per-slip state.
    let dirtyLit = false;
    let dirtyHover = false;
    tonightPulse = Math.max(0, tonightPulse - dt * 0.7);
    for (let i = 0; i < NIGHTS; i++) {
      const r = rank[i];
      let want = r >= 0 && r < litCount ? 1 : 0;
      if (!reduced && want > 0.5 && want < 1.2) want *= 1 + 0.16 * Math.sin(t * 1.1 + i * 1.7); // lit nights shimmer
      if (i === tonight) {
        want = tonightKept ? 1 + tonightPulse * 1.6 : 0.3 + (reduced ? 0 : 0.18 * Math.sin(t * 2.2));
      }
      if (graceSet.has(i)) want = litCount >= KEPT_NIGHTS - 1 ? -(0.7 + (reduced ? 0 : 0.18 * Math.sin(t * 1.6))) : 0;
      const cl = litNow[i];
      const nl = reduced ? want : cl + (want - cl) * Math.min(1, dt * 7);
      if (Math.abs(nl - cl) > 0.0005) {
        litNow[i] = nl;
        litAttr.setX(i, nl);
        dirtyLit = true;
      }
      const wantH = i === hovered ? 1 : 0;
      const ch = hoverNow[i];
      const nh = reduced ? wantH : ch + (wantH - ch) * Math.min(1, dt * 12);
      if (Math.abs(nh - ch) > 0.002) {
        hoverNow[i] = nh;
        hoverAttr.setX(i, nh);
        dirtyHover = true;
      }
    }
    if (dirtyLit) litAttr.needsUpdate = true;
    if (dirtyHover) hoverAttr.needsUpdate = true;

    pickClock += dt;
    if (pickClock > 0.05) {
      pickClock = 0;
      pick();
    }

    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener(SCENE_EVENTS.keep, onKeep);
  const ro = new ResizeObserver(layout);
  ro.observe(document.body);
  resize();
  document.fonts?.ready.then(layout).catch(() => undefined);
  raf = requestAnimationFrame(frame);

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener(SCENE_EVENTS.keep, onKeep);
      reduceQuery.removeEventListener("change", onReduce);
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      starGeo.dispose();
      starMat.dispose();
      moon.geometry.dispose();
      moonMat.dispose();
      moonTex.dispose();
      halo.geometry.dispose();
      (halo.material as THREE.Material).dispose();
      haloTex.dispose();
      orb.geometry.dispose();
      (orb.material as THREE.Material).dispose();
      renderer.dispose();
    },
  };
}
