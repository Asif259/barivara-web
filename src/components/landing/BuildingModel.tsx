'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type Tone = 'paid' | 'partial' | 'pending' | 'overdue' | 'vacant';

const TONE_COLORS: Record<Tone, string> = {
  paid: '#5ef29a',
  partial: '#f0c05a',
  pending: '#9ec9ff',
  overdue: '#ff8d7d',
  vacant: '#263a33',
};

/** Deterministic pseudo-random so the facade looks the same on every render. */
function seeded(index: number) {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const FLOORS = 6;
const COLUMNS = 4;

const WINDOW_STATES: { column: number; floor: number; tone: Tone }[] = [
  { column: 0, floor: 5, tone: 'paid' },
  { column: 1, floor: 5, tone: 'pending' },
  { column: 2, floor: 5, tone: 'partial' },
  { column: 3, floor: 5, tone: 'vacant' },
  { column: 0, floor: 4, tone: 'paid' },
  { column: 1, floor: 4, tone: 'paid' },
  { column: 2, floor: 4, tone: 'overdue' },
  { column: 3, floor: 4, tone: 'paid' },
  { column: 0, floor: 3, tone: 'pending' },
  { column: 1, floor: 3, tone: 'paid' },
  { column: 2, floor: 3, tone: 'paid' },
  { column: 3, floor: 3, tone: 'partial' },
  { column: 0, floor: 2, tone: 'paid' },
  { column: 1, floor: 2, tone: 'vacant' },
  { column: 2, floor: 2, tone: 'paid' },
  { column: 3, floor: 2, tone: 'paid' },
  { column: 0, floor: 1, tone: 'paid' },
  { column: 1, floor: 1, tone: 'paid' },
  { column: 2, floor: 1, tone: 'pending' },
  { column: 3, floor: 1, tone: 'paid' },
  { column: 0, floor: 0, tone: 'paid' },
  { column: 1, floor: 0, tone: 'paid' },
  { column: 2, floor: 0, tone: 'paid' },
  { column: 3, floor: 0, tone: 'vacant' },
];

function toneFor(column: number, floor: number): Tone {
  const hit = WINDOW_STATES.find((w) => w.column === column && w.floor === floor);
  return hit ? hit.tone : 'vacant';
}

function WindowGrid() {
  const windows = useMemo(() => {
    const items: { key: string; position: [number, number, number]; color: string; intensity: number }[] = [];
    for (let floor = 0; floor < FLOORS; floor += 1) {
      for (let column = 0; column < COLUMNS; column += 1) {
        const tone = toneFor(column, floor);
        const lit = tone !== 'vacant';
        items.push({
          key: `${floor}-${column}`,
          position: [-1.86 + column * 1.24, 0.95 + floor * 1.98, 2.42],
          color: TONE_COLORS[tone],
          intensity: lit ? 1.35 + seeded(floor * COLUMNS + column) * 0.9 : 0.05,
        });
      }
    }
    return items;
  }, []);

  return (
    <group>
      {windows.map((w) => (
        <mesh key={`frame-${w.key}`} position={[w.position[0], w.position[1], 2.4]}>
          <planeGeometry args={[0.92, 1.34]} />
          <meshStandardMaterial color="#04120e" roughness={0.8} metalness={0.2} />
        </mesh>
      ))}
      {windows.map((w) => (
        <mesh key={w.key} position={w.position}>
          <planeGeometry args={[0.78, 1.18]} />
          <meshStandardMaterial
            color={w.color}
            emissive={w.color}
            emissiveIntensity={w.intensity}
            roughness={0.25}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}


function Balconies() {
  return (
    <group>
      {Array.from({ length: FLOORS }).map((_, floor) => (
        <group key={`balcony-${floor}`} position={[0, 0.05 + floor * 1.98, 2.72]}>
          <mesh castShadow>
            <boxGeometry args={[5.1, 0.12, 0.72]} />
            <meshStandardMaterial color="#0f3a2e" roughness={0.6} metalness={0.25} />
          </mesh>
          <mesh position={[0, 0.34, 0.33]}>
            <boxGeometry args={[5.1, 0.055, 0.055]} />
            <meshStandardMaterial color="#2f5f50" roughness={0.45} metalness={0.6} />
          </mesh>
          {Array.from({ length: 11 }).map((__, rail) => (
            <mesh key={`rail-${floor}-${rail}`} position={[-2.4 + rail * 0.48, 0.19, 0.33]}>
              <boxGeometry args={[0.035, 0.38, 0.035]} />
              <meshStandardMaterial color="#2a5447" roughness={0.5} metalness={0.55} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Building({ progress }: { progress: { current: number } }) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const p = Math.min(1, Math.max(0, progress.current));
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.55 + p * 0.45, 2.2, delta);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.05 - p * 0.05, 2.2, delta);
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, 0.15 - p * 1.4, 2, delta);
    }
    if (state.camera) {
      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, 9.2 + pointer.current.x * 0.55, 1.6, delta);
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, 7.4 + pointer.current.y * 0.35, 1.6, delta);
      state.camera.lookAt(0, 5.2, 0);
    }
    if (glow.current) {
      glow.current.intensity = 24 + Math.sin(state.clock.elapsedTime * 1.1) * 4;
    }
  });

  return (
    <group ref={group} position={[0, 0.15, 0]}>
      <mesh castShadow receiveShadow position={[0, 6.2, 0]}>
        <boxGeometry args={[5.3, 13.1, 5.3]} />
        <meshStandardMaterial color="#0b2a22" roughness={0.62} metalness={0.32} />
      </mesh>
      <mesh castShadow position={[-2.95, 4.6, -0.4]}>
        <boxGeometry args={[1.5, 9.9, 4.1]} />
        <meshStandardMaterial color="#082019" roughness={0.7} metalness={0.25} />
      </mesh>
      <mesh castShadow position={[2.75, 8.1, -0.9]}>
        <boxGeometry args={[1.35, 9.4, 3.2]} />
        <meshStandardMaterial color="#0a241d" roughness={0.7} metalness={0.22} />
      </mesh>

      <WindowGrid />
      <Balconies />


      {/* ground floor shopfront glow */}
      <mesh position={[0, 1.05, 2.47]}>
        <planeGeometry args={[4.6, 1.55]} />
        <meshStandardMaterial
          color="#e8c468"
          emissive="#e8c468"
          emissiveIntensity={0.5}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 1.05, 2.5]}>
        <boxGeometry args={[4.9, 1.85, 0.08]} />
        <meshStandardMaterial color="#07160f" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* roof parapet + water tank */}
      <mesh position={[0, 12.85, 0]}>
        <boxGeometry args={[5.6, 0.3, 5.6]} />
        <meshStandardMaterial color="#123b30" roughness={0.55} metalness={0.3} />
      </mesh>
      <mesh position={[1.2, 13.55, -0.6]}>
        <cylinderGeometry args={[0.55, 0.55, 0.9, 18]} />
        <meshStandardMaterial color="#1a4b3d" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh position={[-1.35, 13.35, 0.4]}>
        <boxGeometry args={[1.1, 0.75, 1.1]} />
        <meshStandardMaterial color="#103229" roughness={0.6} metalness={0.3} />
      </mesh>

      <pointLight ref={glow} position={[0, 3.2, 6.4]} color="#2dc2bd" distance={22} decay={2} />
    </group>
  );
}

function Ground() {
  const rings = useMemo(() => [4.2, 6.4, 9.2, 13.4], []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[22, 64]} />
        <meshStandardMaterial color="#04120e" roughness={0.95} metalness={0.05} />
      </mesh>
      {rings.map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[radius, radius + 0.035, 96]} />
          <meshBasicMaterial color="#1d6b57" transparent opacity={0.35} toneMapped={false} />
        </mesh>
      ))}
      <ContactShadows position={[0, 0.02, 0]} opacity={0.55} scale={26} blur={2.6} far={16} color="#000000" />
    </group>
  );
}

export default function BuildingModel({ progress }: { progress: { current: number } }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [9.2, 7.4, 12.4], fov: 33, near: 0.1, far: 80 }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor('#04100c', 0);
        scene.fog = new THREE.Fog('#04100c', 22, 46);
      }}
    >
      <ambientLight intensity={0.5} color="#9fd8c4" />
      <directionalLight
        castShadow
        position={[8, 16, 9]}
        intensity={2.1}
        color="#ffe6b8"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-10, 6, -6]} intensity={0.9} color="#2dc2bd" />
      <Building progress={progress} />
      <Ground />
    </Canvas>
  );
}
