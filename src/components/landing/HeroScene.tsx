'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { createRoot, type Root } from 'react-dom/client';
import * as THREE from 'three';

const CAMERA_POSITION: [number, number, number] = [9.5, 12.5, 17.5];
const CAMERA_TARGET: [number, number, number] = [0, 2.7, 0];
const WIDE_OFFSET_X = 3.0;

type Tone = 'paid' | 'partial' | 'pending' | 'overdue' | 'vacant';

export interface PinCopy {
  name: string;
  status: string;
  amount: string;
}

export interface Copy {
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

export interface Pointer {
  x: number;
  y: number;
}

const TONE_HEX: Record<Tone, string> = {
  paid: '#5ef2b4',
  partial: '#f0c05a',
  pending: '#8fb4e8',
  overdue: '#ff7f6e',
  vacant: '#17352c',
};

const delay = (seconds: number) => ({ '--d': `${seconds}s` } as React.CSSProperties);

const W = 3.8;
const D = 2.6;
const H = 6;

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
const N = WINDOWS.length;
const PIN_PAID = 20 + 3 * 3 + 2;
const PIN_OVERDUE = 20 + 1 * 3 + 0;

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
  tex.anisotropy = 4;
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
  const lastState = useRef({ x: -9999, y: -9999, visible: true });

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
  }, [children]);

  const vec = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    if (!groupRef.current || !elRef.current) return;
    vec.setFromMatrixPosition(groupRef.current.matrixWorld);
    vec.project(camera);
    if (vec.z > 1) {
      if (lastState.current.visible) {
        elRef.current.style.display = 'none';
        lastState.current.visible = false;
      }
      return;
    }
    if (!lastState.current.visible) {
      elRef.current.style.display = 'block';
      lastState.current.visible = true;
    }
    const x = Math.round((vec.x * 0.5 + 0.5) * size.width);
    const y = Math.round((-(vec.y * 0.5) + 0.5) * size.height);
    if (Math.abs(x - lastState.current.x) >= 1 || Math.abs(y - lastState.current.y) >= 1) {
      elRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      lastState.current.x = x;
      lastState.current.y = y;
    }
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
            className="whitespace-nowrap rounded-lg border border-white/20 bg-[#f3ecd9] px-3 py-1.5 shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
            style={{ minWidth: '8.5rem' }}
          >
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE_HEX[tone] }} />
              <p className="text-[11px] font-semibold text-[#10241c]">{copy.name}</p>
            </div>
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
    let changed = false;

    for (let i = 0; i < N; i++) {
      if (!sim.started[i] && sim.t >= sim.delay[i]) {
        sim.started[i] = true;
        sim.tgt[i].set(TONE_HEX[sim.final[i]]);
        sim.pulse[i] = 1;
        changed = true;
      }
    }

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
          changed = true;
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
          changed = true;
        }
      }
    }

    const k = 1 - Math.exp(-d * 6);
    for (let i = 0; i < N; i++) {
      if (sim.pulse[i] > 0.001 || !sim.cur[i].equals(sim.tgt[i])) {
        sim.cur[i].lerp(sim.tgt[i], k);
        sim.pulse[i] = Math.max(0, sim.pulse[i] - d * 1.6);
        changed = true;
      }
    }

    if (changed) {
      write();
    }

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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]}>
        <planeGeometry args={[13, 9.75]} />
        <meshBasicMaterial map={tex.paper} color="#d8d0b8" transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]} renderOrder={1}>
        <planeGeometry args={[7.4, 5.6]} />
        <meshBasicMaterial map={tex.shadow} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#17584a" roughness={0.78} />
      </mesh>

      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <mesh key={k} position={[0, k + 0.02, 0]}>
          <boxGeometry args={[W + 0.16, 0.08, D + 0.16]} />
          <meshStandardMaterial color="#e9e0c8" roughness={0.8} />
        </mesh>
      ))}

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

      <mesh position={[0, 0.5, D / 2 + 0.012]}>
        <planeGeometry args={[W * 0.8, 0.62]} />
        <meshBasicMaterial color="#f2cf7a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.9, D / 2 + 0.24]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[W * 0.9, 0.06, 0.56]} />
        <meshStandardMaterial color="#e0b24f" roughness={0.6} />
      </mesh>

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

export default function HeroScene({
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
      dpr={[1, 1.5]}
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
