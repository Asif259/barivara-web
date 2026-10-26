'use client';
import {
  Component,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { createRoot, type Root } from 'react-dom/client';
import * as THREE from 'three';
import { useLanguage } from '@/stores/language-store';

/* -------------------------------------------------------------------------- */
/*  Tunables                                                                   */
/* -------------------------------------------------------------------------- */

const CAMERA_POSITION: [number, number, number] = [9.5, 12.5, 17.5];
const CAMERA_TARGET: [number, number, number] = [0, 2.7, 0];
const WIDE_OFFSET_X = 3.0; // how far right the building sits on desktop

/* -------------------------------------------------------------------------- */
/*  Copy                                                                       */
/* -------------------------------------------------------------------------- */

type Lang = 'bn' | 'en';
type Tone = 'paid' | 'partial' | 'pending' | 'overdue' | 'vacant';

interface PinCopy {
  name: string;
  status: string;
  amount: string;
}

interface Copy {
  title: [string, string];
  lead: string;
  primary: string;
  secondary: string;
  support: string[];
  legend: Record<Tone, string>;
  sample: string;
  pinPaid: PinCopy;
  pinOverdue: PinCopy;
}

const COPY: Record<Lang, Copy> = {
  bn: {
    title: ['কাগজের খাতা থেকে', 'পরিষ্কার ডিজিটাল খতিয়ানে'],
    lead: 'একাধিক বাড়ি, ইউনিট আর ভাড়াটিয়া—সব এক জায়গায়। চুক্তি, মাসিক ভাড়া, পেমেন্ট আর রসিদ, বাংলায়, আপনার নিজের হাতে।',
    primary: 'শুরু করুন',
    secondary: 'লগ ইন',
    support: ['বাংলা-প্রথম', 'বাংলা / English', 'প্রিন্ট-রেডি A4 রসিদ'],
    legend: { paid: 'পরিশোধিত', partial: 'আংশিক', pending: 'বাকি', overdue: 'মেয়াদোত্তীর্ণ', vacant: 'খালি' },
    sample: 'নমুনা তথ্য দিয়ে দেখানো হয়েছে',
    pinPaid: { name: 'ফ্ল্যাট ৪বি', status: 'পরিশোধিত', amount: '৳১৩,৩০০' },
    pinOverdue: { name: 'ফ্ল্যাট ২এ', status: 'মেয়াদোত্তীর্ণ', amount: '৳১২,০০০' },
  },
  en: {
    title: ['From the paper khata', 'to a clear digital ledger'],
    lead: 'Properties, units and tenants in one place. Agreements, monthly rent, payments and receipts, in Bangla, in your own hands.',
    primary: 'Get started',
    secondary: 'Log in',
    support: ['Bangla-first', 'Bangla / English', 'Print-ready A4 receipts'],
    legend: { paid: 'Paid', partial: 'Partial', pending: 'Pending', overdue: 'Overdue', vacant: 'Vacant' },
    sample: 'Shown with sample data',
    pinPaid: { name: 'Flat 4B', status: 'Paid', amount: '৳13,300' },
    pinOverdue: { name: 'Flat 2A', status: 'Overdue', amount: '৳12,000' },
  },
};

/* -------------------------------------------------------------------------- */
/*  Palette + styles                                                           */
/* -------------------------------------------------------------------------- */

const TONE_HEX: Record<Tone, string> = {
  paid: '#5ef2b4',
  partial: '#f0c05a',
  pending: '#8fb4e8',
  overdue: '#ff7f6e',
  vacant: '#17352c',
};

const LEGEND_HEX: Record<Tone, string> = { ...TONE_HEX, vacant: '#56756a' };
const SLIP_BAR: Record<Tone, string> = {
  paid: '#12664f',
  partial: '#c8921f',
  pending: '#4a78b8',
  overdue: '#d4503f',
  vacant: '#56756a',
};

const FONT_BODY = "'Noto Sans Bengali','Inter',system-ui,-apple-system,'Segoe UI',sans-serif";
const FONT_DISPLAY = "'Noto Serif Bengali','Source Serif 4',Georgia,'Times New Roman',serif";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@500;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,700&family=Noto+Sans+Bengali:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');

.hx-in{animation:hx-rise .85s cubic-bezier(.22,1,.36,1) backwards;animation-delay:var(--d,0s)}
@keyframes hx-rise{from{opacity:0;transform:translate3d(0,18px,0)}}

.hx-underline{
  background-image:linear-gradient(#e8c468,#e8c468);
  background-repeat:no-repeat;background-position:0 100%;background-size:100% 3px;
  padding-bottom:.1em;
  -webkit-box-decoration-break:clone;box-decoration-break:clone;
  animation:hx-draw 1.1s cubic-bezier(.6,0,.2,1) backwards;animation-delay:var(--d,0s);
}
@keyframes hx-draw{from{background-size:0% 3px}}

.hx-dot{animation:hx-ping 2.4s ease-out infinite;animation-delay:var(--d,0s)}
@keyframes hx-ping{0%{box-shadow:0 0 0 0 rgba(243,236,217,.55)}100%{box-shadow:0 0 0 12px rgba(243,236,217,0)}}

.hx-line{transform-origin:left center;animation:hx-grow .5s cubic-bezier(.22,1,.36,1) backwards;animation-delay:calc(var(--d,0s) + .15s)}
@keyframes hx-grow{from{transform:scaleX(0)}}

.hx-slip{animation:hx-slip .6s cubic-bezier(.22,1,.36,1) backwards;animation-delay:calc(var(--d,0s) + .45s)}
@keyframes hx-slip{from{opacity:0;transform:translate3d(-8px,0,0) rotate(-2deg)}}

@media (prefers-reduced-motion:reduce){
  .hx-in,.hx-underline,.hx-dot,.hx-line,.hx-slip{animation:none!important}
}
`;

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');
const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

/* -------------------------------------------------------------------------- */
/*  Building data                                                              */
/* -------------------------------------------------------------------------- */

const W = 3.8; // width  (x)
const D = 2.6; // depth  (z)
const H = 6; //   height (y), ground floor = shop, floors 1-5 = flats

interface Win {
  p: [number, number, number];
  ry: number;
  n: [number, number, number];
}

function buildWindows(): Win[] {
  const out: Win[] = [];
  const cols = [-1.28, -0.43, 0.43, 1.28];
  for (let r = 1; r <= 5; r++) {
    for (const x of cols) out.push({ p: [x, r + 0.56, D / 2 + 0.012], ry: 0, n: [0, 0, 1] });
  }
  const zs = [-0.8, 0, 0.8];
  for (let r = 1; r <= 5; r++) {
    for (const z of zs) out.push({ p: [W / 2 + 0.012, r + 0.56, z], ry: Math.PI / 2, n: [1, 0, 0] });
  }
  return out;
}

const WINDOWS = buildWindows();
const N = WINDOWS.length; // 35
const PIN_PAID = 20 + 3 * 3 + 2; // side face, floor 4, rightmost column
const PIN_OVERDUE = 20 + 1 * 3 + 0; // side face, floor 2, leftmost column

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeStatuses(): Tone[] {
  const rng = mulberry32(7);
  const out = WINDOWS.map((): Tone => {
    const r = rng();
    if (r < 0.56) return 'paid';
    if (r < 0.7) return 'pending';
    if (r < 0.8) return 'partial';
    if (r < 0.88) return 'overdue';
    return 'vacant';
  });
  out[PIN_PAID] = 'paid';
  out[PIN_OVERDUE] = 'overdue';
  return out;
}

const introDelay = (w: Win) =>
  0.7 + w.p[1] * 0.2 + (w.n[2] === 1 ? (w.p[0] + 1.9) * 0.07 : 0.35 + (w.p[2] + 0.8) * 0.07);

/* -------------------------------------------------------------------------- */
/*  Procedural textures (client only; Scene mounts after hydration)           */
/* -------------------------------------------------------------------------- */

function inkStroke(g: CanvasRenderingContext2D, x: number, y: number, len: number, rng: () => number) {
  g.strokeStyle = 'rgba(12,38,31,0.5)';
  g.lineWidth = 2;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x, y);
  let cx0 = x;
  while (cx0 < x + len) {
    const nx = cx0 + 6 + rng() * 5;
    g.quadraticCurveTo(cx0 + 3, y - 3 - rng() * 5, nx, y + (rng() - 0.5) * 3);
    cx0 = nx;
  }
  g.stroke();
}

function makePaperTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 768;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const rng = mulberry32(21);

  g.fillStyle = '#efe6cf';
  g.fillRect(0, 0, 1024, 768);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(110,90,50,${0.03 + rng() * 0.05})`;
    g.fillRect(rng() * 1024, rng() * 768, 1 + rng() * 2, 1 + rng() * 2);
  }

  g.fillStyle = 'rgba(18,102,79,0.10)';
  g.fillRect(40, 60, 944, 36);

  g.strokeStyle = 'rgba(18,102,79,0.30)';
  g.lineWidth = 1;
  for (let y = 96; y < 740; y += 30) {
    g.beginPath();
    g.moveTo(40, y);
    g.lineTo(984, y);
    g.stroke();
  }
  for (const x of [250, 470, 700, 880]) {
    g.beginPath();
    g.moveTo(x, 60);
    g.lineTo(x, 740);
    g.stroke();
  }
  g.strokeStyle = 'rgba(190,74,66,0.55)';
  g.lineWidth = 1.5;
  for (const x of [96, 103]) {
    g.beginPath();
    g.moveTo(x, 60);
    g.lineTo(x, 740);
    g.stroke();
  }

  for (let y = 126; y < 720; y += 30) {
    inkStroke(g, 120, y - 8, 40 + rng() * 90, rng);
    inkStroke(g, 262, y - 8, 30 + rng() * 140, rng);
    inkStroke(g, 482, y - 8, 20 + rng() * 60, rng);
    const len = 30 + rng() * 40;
    inkStroke(g, 690 - len, y - 8, len, rng);
    if (rng() < 0.62) {
      g.strokeStyle = 'rgba(18,140,110,0.85)';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(770 + rng() * 8, y - 6);
      g.lineTo(776 + rng() * 8, y + 1);
      g.lineTo(790 + rng() * 8, y - 16);
      g.stroke();
    }
  }

  // Dissolve the page into the dark: elliptical alpha mask
  g.globalCompositeOperation = 'destination-in';
  g.save();
  g.translate(512, 384);
  g.scale(1, 0.75);
  const rg = g.createRadialGradient(0, 0, 150, 0, 0, 500);
  rg.addColorStop(0, 'rgba(0,0,0,1)');
  rg.addColorStop(0.55, 'rgba(0,0,0,0.85)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg;
  g.fillRect(-512, -512, 1024, 1024);
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeRadialTexture(stops: Array<[number, string]>): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  const rg = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  for (const [at, color] of stops) rg.addColorStop(at, color);
  g.fillStyle = rg;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

/* -------------------------------------------------------------------------- */
/*  3D: the tower                                                              */
/* -------------------------------------------------------------------------- */

interface Pointer {
  x: number;
  y: number;
}

function SafeHtml({
  position,
  children,
}: {
  position: [number, number, number];
  children: ReactNode;
}) {
  const { gl, camera, size } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const elRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;
    const parent = gl.domElement.parentElement;
    if (!parent) return;

    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';
    el.style.pointerEvents = 'none';
    el.style.willChange = 'transform';
    parent.appendChild(el);
    elRef.current = el;

    const root = createRoot(el);
    rootRef.current = root;

    return () => {
      unmountedRef.current = true;
      if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
      setTimeout(() => {
        root.unmount();
      }, 0);
    };
  }, [gl]);

  useEffect(() => {
    if (rootRef.current && !unmountedRef.current) {
      rootRef.current.render(children);
    }
  });

  const vec = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!groupRef.current || !elRef.current) return;
    vec.setFromMatrixPosition(groupRef.current.matrixWorld);
    vec.project(camera);
    if (vec.z > 1) {
      elRef.current.style.display = 'none';
      return;
    }
    elRef.current.style.display = 'block';
    const x = (vec.x * 0.5 + 0.5) * size.width;
    const y = (-(vec.y * 0.5) + 0.5) * size.height;
    elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  return <group ref={groupRef} position={position} />;
}

function Pin({
  position,
  tone,
  copy,
  startAt,
}: {
  position: [number, number, number];
  tone: Tone;
  copy: PinCopy;
  startAt: number;
}) {
  return (
    <SafeHtml position={position}>
      <div className="pointer-events-none relative" style={delay(startAt)}>
        <span
          className="hx-dot absolute -left-[5px] -top-[5px] h-2.5 w-2.5 rounded-full"
          style={{ background: TONE_HEX[tone] }}
        />
        <span className="hx-line absolute left-1 top-0 block h-px w-14 bg-[#f3ecd9]/55" />
        <div className="absolute left-[3.75rem] top-0 -translate-y-1/2">
          <div
            className="hx-slip w-[11.5rem] rounded-[3px] bg-[#f3ecd9] py-2 pl-3 pr-3 text-[#10241c] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7)]"
            style={{ borderLeft: `4px solid ${SLIP_BAR[tone]}` }}
          >
            <p className="text-[13px] font-semibold leading-tight">{copy.name}</p>
            <p className="mt-1 flex items-baseline justify-between gap-3 text-[12px] text-[#41584d]">
              <span>{copy.status}</span>
              <span className="font-semibold text-[#10241c]">{copy.amount}</span>
            </p>
          </div>
        </div>
      </div>
    </SafeHtml>
  );
}

function Tower({
  progress,
  pointer,
  desktop,
  copy,
}: {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<Pointer>;
  desktop: boolean;
  copy: Copy;
}) {
  const { size } = useThree();
  const group = useRef<THREE.Group>(null);
  const winRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const tex = useMemo(
    () => ({
      paper: makePaperTexture(),
      glow: makeRadialTexture([
        [0, 'rgba(255,255,255,0.95)'],
        [0.35, 'rgba(255,255,255,0.35)'],
        [1, 'rgba(255,255,255,0)'],
      ]),
      shadow: makeRadialTexture([
        [0, 'rgba(0,0,0,0.65)'],
        [0.6, 'rgba(0,0,0,0.3)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
    }),
    [],
  );
  useEffect(
    () => () => {
      tex.paper.dispose();
      tex.glow.dispose();
      tex.shadow.dispose();
    },
    [tex],
  );

  const simRef = useRef({
    final: makeStatuses(),
    cur: WINDOWS.map(() => new THREE.Color(TONE_HEX.vacant)),
    tgt: WINDOWS.map(() => new THREE.Color(TONE_HEX.vacant)),
    pulse: new Float32Array(N),
    started: new Array<boolean>(N).fill(false),
    delay: WINDOWS.map(introDelay),
    t: 0,
    nextTick: 5.5,
    ticks: 0,
    rng: mulberry32(99),
  });

  const write = () => {
    const win = winRef.current;
    const glow = glowRef.current;
    const sim = simRef.current;
    if (!win || !glow) return;
    for (let i = 0; i < N; i++) {
      const w = WINDOWS[i];
      const s = 1 + sim.pulse[i] * 0.32;
      dummy.rotation.set(0, w.ry, 0);
      dummy.scale.set(s, s, 1);
      dummy.position.set(w.p[0], w.p[1], w.p[2]);
      dummy.updateMatrix();
      win.setMatrixAt(i, dummy.matrix);
      win.setColorAt(i, sim.cur[i]);
      dummy.position.set(w.p[0] + w.n[0] * 0.025, w.p[1], w.p[2] + w.n[2] * 0.025);
      dummy.updateMatrix();
      glow.setMatrixAt(i, dummy.matrix);
      glow.setColorAt(i, sim.cur[i]);
    }
    win.instanceMatrix.needsUpdate = true;
    glow.instanceMatrix.needsUpdate = true;
    if (win.instanceColor) win.instanceColor.needsUpdate = true;
    if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
  };

  useLayoutEffect(() => {
    write();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, rawDelta) => {
    const sim = simRef.current;
    const d = Math.min(rawDelta, 0.05);
    sim.t += d;

    // Intro wave: windows light up bottom to top
    for (let i = 0; i < N; i++) {
      if (!sim.started[i] && sim.t >= sim.delay[i]) {
        sim.started[i] = true;
        sim.tgt[i].set(TONE_HEX[sim.final[i]]);
        sim.pulse[i] = 1;
      }
    }

    // Afterwards the ledger keeps living: rent comes in, now and then a new bill lands
    if (sim.t > sim.nextTick) {
      sim.nextTick += 1.5;
      sim.ticks += 1;
      if (sim.ticks % 4 === 0) {
        const paid: number[] = [];
        for (let i = 0; i < N; i++) if (sim.final[i] === 'paid' && i !== PIN_PAID) paid.push(i);
        if (paid.length) {
          const i = paid[Math.floor(sim.rng() * paid.length)];
          sim.final[i] = 'pending';
          sim.tgt[i].set(TONE_HEX.pending);
          sim.pulse[i] = 0.6;
        }
      } else {
        const open: number[] = [];
        for (let i = 0; i < N; i++) {
          const s = sim.final[i];
          if ((s === 'pending' || s === 'partial' || s === 'overdue') && i !== PIN_OVERDUE) open.push(i);
        }
        if (open.length) {
          const i = open[Math.floor(sim.rng() * open.length)];
          sim.final[i] = 'paid';
          sim.tgt[i].set(TONE_HEX.paid);
          sim.pulse[i] = 1;
        }
      }
    }

    const k = 1 - Math.exp(-d * 6);
    for (let i = 0; i < N; i++) {
      sim.cur[i].lerp(sim.tgt[i], k);
      sim.pulse[i] = Math.max(0, sim.pulse[i] - d * 1.6);
    }
    write();

    // Rig: responsive placement, scroll, pointer, idle sway
    const g = group.current;
    if (g) {
      const wide = size.width / size.height > 1.15;
      const p = progress.current;
      const follow = 1 - Math.exp(-d * 3);
      const targetX = wide ? WIDE_OFFSET_X : 0;
      const targetScale = (wide ? 1 : 0.92) * (1 - p * 0.08);
      g.position.x += (targetX - g.position.x) * follow;
      g.position.y = -p * 0.9;
      g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * follow);
      const yaw = -0.18 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05 + pointer.current.x * 0.22 + p * 0.6;
      g.rotation.y += (yaw - g.rotation.y) * (1 - Math.exp(-d * 2.2));
    }
    state.camera.lookAt(CAMERA_TARGET[0], CAMERA_TARGET[1], CAMERA_TARGET[2]);
  });

  const initialX = size.width / size.height > 1.15 ? WIDE_OFFSET_X : 0;

  return (
    <group ref={group} position={[initialX, 0, 0]} rotation={[0, -0.75, 0]}>
      {/* The khata page */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[13, 9.75]} />
        <meshBasicMaterial map={tex.paper} color="#d8d0b8" transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} renderOrder={1}>
        <planeGeometry args={[7.4, 5.6]} />
        <meshBasicMaterial map={tex.shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Body */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#17584a" roughness={0.78} />
      </mesh>

      {/* Floor slabs */}
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <mesh key={k} position={[0, k + 0.02, 0]}>
          <boxGeometry args={[W + 0.16, 0.08, D + 0.16]} />
          <meshStandardMaterial color="#e9e0c8" roughness={0.8} />
        </mesh>
      ))}

      {/* Balconies */}
      {[2, 3, 4, 5].map((r) => (
        <group key={r}>
          <mesh position={[0, r - 0.02, D / 2 + 0.17]}>
            <boxGeometry args={[W * 0.9, 0.06, 0.34]} />
            <meshStandardMaterial color="#e9e0c8" roughness={0.8} />
          </mesh>
          <mesh position={[0, r + 0.15, D / 2 + 0.33]}>
            <boxGeometry args={[W * 0.9, 0.28, 0.03]} />
            <meshStandardMaterial color="#0c2b23" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Roof: parapet, water tank, stair head */}
      <mesh position={[0, H + 0.18, 0]}>
        <boxGeometry args={[W + 0.2, 0.3, D + 0.2]} />
        <meshStandardMaterial color="#e9e0c8" roughness={0.8} />
      </mesh>
      <mesh position={[-1.1, H + 0.68, -0.4]}>
        <cylinderGeometry args={[0.42, 0.42, 0.7, 24]} />
        <meshStandardMaterial color="#9fb8ae" roughness={0.6} />
      </mesh>
      <mesh position={[0.95, H + 0.5, -0.3]}>
        <boxGeometry args={[0.95, 0.6, 0.95]} />
        <meshStandardMaterial color="#cfc6ad" roughness={0.85} />
      </mesh>

      {/* Shopfront */}
      <mesh position={[0, 0.5, D / 2 + 0.012]}>
        <planeGeometry args={[W * 0.8, 0.62]} />
        <meshBasicMaterial color="#f2cf7a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.9, D / 2 + 0.24]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[W * 0.9, 0.06, 0.56]} />
        <meshStandardMaterial color="#e0b24f" roughness={0.6} />
      </mesh>

      {/* Windows: one ledger entry each */}
      <instancedMesh ref={winRef} args={[undefined, undefined, N]} frustumCulled={false}>
        <planeGeometry args={[0.5, 0.6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, N]} frustumCulled={false} renderOrder={2}>
        <planeGeometry args={[1.3, 1.5]} />
        <meshBasicMaterial
          map={tex.glow}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </instancedMesh>

      {desktop && (
        <>
          <Pin
            position={[W / 2 + 0.06, WINDOWS[PIN_PAID].p[1], WINDOWS[PIN_PAID].p[2]]}
            tone="paid"
            copy={copy.pinPaid}
            startAt={2.4}
          />
          <Pin
            position={[W / 2 + 0.06, WINDOWS[PIN_OVERDUE].p[1], WINDOWS[PIN_OVERDUE].p[2]]}
            tone="overdue"
            copy={copy.pinOverdue}
            startAt={2.9}
          />
        </>
      )}
    </group>
  );
}

function Scene({
  progress,
  pointer,
  desktop,
  active,
  copy,
  onReady,
}: {
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<Pointer>;
  desktop: boolean;
  active: boolean;
  copy: Copy;
  onReady: () => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: CAMERA_POSITION, fov: 28, near: 1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        window.requestAnimationFrame(() => onReady());
      }}
    >
      <ambientLight intensity={0.9} color="#cfe9df" />
      <directionalLight position={[6, 10, 8]} intensity={2.4} color="#fff0d2" />
      <directionalLight position={[-8, 5, -6]} intensity={1.6} color="#2dc2bd" />
      <Tower progress={progress} pointer={pointer} desktop={desktop} copy={copy} />
    </Canvas>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fallbacks: static poster + error boundary                                  */
/* -------------------------------------------------------------------------- */

function Poster({ className }: { className?: string }) {
  const pattern: Tone[][] = [
    ['paid', 'partial', 'paid', 'vacant'],
    ['paid', 'paid', 'pending', 'paid'],
    ['paid', 'vacant', 'paid', 'overdue'],
    ['pending', 'paid', 'partial', 'paid'],
    ['paid', 'paid', 'paid', 'vacant'],
  ];
  return (
    <div
      aria-hidden="true"
      className={cx(
        'pointer-events-none absolute inset-0 flex items-end justify-center lg:justify-end lg:pr-[9%]',
        className,
      )}
    >
      <svg viewBox="0 0 420 520" className="h-[92%] w-auto" role="presentation">
        <ellipse cx="210" cy="450" rx="205" ry="64" fill="#e8dfc6" opacity="0.9" />
        <ellipse cx="210" cy="450" rx="150" ry="44" fill="none" stroke="#12664f" strokeOpacity="0.25" />
        <ellipse cx="210" cy="450" rx="100" ry="28" fill="none" stroke="#12664f" strokeOpacity="0.25" />
        <rect x="104" y="96" width="196" height="12" fill="#e9e0c8" />
        <rect x="132" y="70" width="34" height="28" rx="4" fill="#9fb8ae" />
        <rect x="104" y="108" width="196" height="324" fill="#17584a" />
        <polygon points="300,108 352,128 352,414 300,432" fill="#0f4034" />
        {pattern.map((row, r) =>
          row.map((tone, c) => (
            <rect
              key={`${r}-${c}`}
              x={118 + c * 46}
              y={128 + r * 56}
              width="30"
              height="36"
              rx="1"
              fill={TONE_HEX[tone]}
              opacity={tone === 'vacant' ? 1 : 0.85}
            />
          )),
        )}
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <rect key={k} x="98" y={106 + k * 56} width="208" height="4" fill="#e9e0c8" opacity="0.9" />
        ))}
        <rect x="118" y="404" width="168" height="20" fill="#f2cf7a" />
        <rect x="108" y="398" width="188" height="6" fill="#e0b24f" />
      </svg>
    </div>
  );
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                       */
/* -------------------------------------------------------------------------- */

export default function Hero() {
  const language = useLanguage();
  const lang: Lang = language === 'en' ? 'en' : 'bn';
  const t = COPY[lang];
  const bn = lang === 'bn';

  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const pointer = useRef<Pointer>({ x: 0, y: 0 });

  const [mode, setMode] = useState<'loading' | '3d' | 'static'>('loading');
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [desktop, setDesktop] = useState(false);

  // Capability check: WebGL, reduced motion, weak devices
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let webgl = false;
      try {
        const probe = document.createElement('canvas');
        webgl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
      } catch {
        webgl = false;
      }
      const weak =
        window.innerWidth < 360 ||
        (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2);
      setMode(webgl && !reduced && !weak ? '3d' : 'static');
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // Desktop breakpoint (callouts are desktop only)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Pause rendering when the hero is off-screen
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '120px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Scroll progress + pointer parallax
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, window.innerHeight)));
      progress.current = p;
      if (!reduced) el.style.setProperty('--p', p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      };
    };
    const onLeave = () => {
      pointer.current = { x: 0, y: 0 };
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!reduced && finePointer) {
      el.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', onLeave);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const show3d = mode === '3d';

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative isolate min-h-[100svh] overflow-hidden bg-[#06110d] text-[#f3ecd9]"
      style={{ fontFamily: FONT_BODY }}
    >
      <style>{CSS}</style>

      {/* Atmosphere: one soft emerald pool behind the building */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_55%_at_70%_52%,rgba(18,102,79,0.5),transparent_72%)]"
      />

      {/* Scene: top band on mobile, full bleed on desktop */}
      <div className="absolute inset-x-0 top-0 h-[56svh] lg:inset-0 lg:h-auto" aria-hidden="true">
        <Poster className={cx('transition-opacity duration-700', show3d && ready ? 'opacity-0' : 'opacity-100')} />
        {show3d ? (
          <SceneBoundary onError={() => setMode('static')}>
            <Scene
              progress={progress}
              pointer={pointer}
              desktop={desktop}
              active={active}
              copy={t}
              onReady={() => setReady(true)}
            />
          </SceneBoundary>
        ) : null}
      </div>

      {/* Readability veil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[30svh] bg-[linear-gradient(180deg,transparent_0%,rgba(6,17,13,0.92)_24%,#06110d_42%)] lg:inset-0 lg:bg-[linear-gradient(90deg,#06110d_0%,#06110d_28%,rgba(6,17,13,0.72)_44%,rgba(6,17,13,0.05)_66%,transparent_100%)]"
      />

      {/* Copy */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col justify-center px-5 pb-24 pt-[46svh] sm:px-8 lg:pb-16 lg:pt-24">
        <div
          className="max-w-xl lg:max-w-[40rem]"
          style={{
            opacity: 'calc(1 - var(--p, 0) * 1.2)',
            transform: 'translate3d(0, calc(var(--p, 0) * -36px), 0)',
          }}
        >
          <h1
            className={cx(
              'text-balance',
              bn ? 'leading-[1.3] tracking-normal' : 'leading-[1.08] tracking-[-0.02em]',
            )}
            style={{ fontFamily: FONT_DISPLAY }}
          >
            <span
              className="hx-in block text-[clamp(2.1rem,4.3vw,3.4rem)] font-bold text-[#f3ecd9]"
              style={delay(0.05)}
            >
              {t.title[0]}
            </span>
            <span
              className="hx-in mt-1 block text-[clamp(2.1rem,4.3vw,3.4rem)] font-medium text-[#8fe9c4]"
              style={delay(0.2)}
            >
              <span className="hx-underline" style={delay(1.0)}>
                {t.title[1]}
              </span>
            </span>
          </h1>

          <p
            className={cx(
              'hx-in mt-7 max-w-[34rem] text-[15px] text-[#b9cdc4] sm:text-base',
              bn ? 'leading-8' : 'leading-relaxed',
            )}
            style={delay(0.4)}
          >
            {t.lead}
          </p>

          <div className="hx-in mt-9 flex flex-wrap items-center gap-3" style={delay(0.55)}>
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#7ff0c2] px-7 text-[15px] font-semibold text-[#06110d] shadow-[0_12px_40px_-12px_rgba(127,240,194,0.6)] transition-colors hover:bg-[#a6f7d6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7ff0c2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06110d]"
            >
              {t.primary}
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#f3ecd9]/25 px-7 text-[15px] font-medium text-[#f3ecd9] transition-colors hover:border-[#f3ecd9]/55 hover:bg-[#f3ecd9]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f3ecd9]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06110d]"
            >
              {t.secondary}
            </Link>
          </div>

          <ul className="hx-in mt-9 flex flex-wrap items-center gap-y-2 text-[13px] text-[#9db3a8]" style={delay(0.7)}>
            {t.support.map((item, i) => (
              <li key={item} className={cx(i > 0 && 'ml-4 border-l border-[#f3ecd9]/15 pl-4')}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key for the window colours + sample-data note */}
      <div className="absolute inset-x-5 bottom-5 z-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-2 text-xs text-[#8fa89c] sm:inset-x-8">
        <p>{t.sample}</p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {(Object.keys(LEGEND_HEX) as Tone[]).map((tone) => (
            <li key={tone} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="h-2 w-2 rounded-[2px]" style={{ background: LEGEND_HEX[tone] }} />
              {t.legend[tone]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}