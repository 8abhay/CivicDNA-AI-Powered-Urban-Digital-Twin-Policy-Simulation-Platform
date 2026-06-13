import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type StressMode = "normal" | "flood" | "traffic" | "outbreak";

function Buildings({ stress, mode }: { stress: number; mode: StressMode }) {
  const group = useRef<THREE.Group>(null);
  const buildings = useMemo(() => {
    const arr: { x: number; z: number; h: number; color: string }[] = [];
    const N = 14;
    for (let i = -N; i <= N; i += 2) {
      for (let j = -N; j <= N; j += 2) {
        if (Math.abs(i) < 2 && Math.abs(j) < 2) continue; // central plaza
        const dist = Math.hypot(i, j);
        const h = Math.max(0.6, 6 - dist * 0.18 + Math.random() * 2);
        const isCore = dist < 6;
        arr.push({
          x: i + (Math.random() - 0.5) * 0.6,
          z: j + (Math.random() - 0.5) * 0.6,
          h,
          color: isCore ? "#1f2a44" : "#172033",
        });
      }
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  const accent = mode === "flood" ? "#38bdf8" : mode === "traffic" ? "#f0abfc" : mode === "outbreak" ? "#f87171" : "#6ee7ff";

  return (
    <group ref={group}>
      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={mode === "flood" ? "#0e2541" : "#0b1424"} />
      </mesh>
      {/* grid lines */}
      <gridHelper args={[80, 40, accent, "#1a2540"]} position={[0, 0.01, 0]} />

      {buildings.map((b, i) => {
        const wobble = Math.sin(i + stress * 0.05) * 0.4;
        const heat = mode === "outbreak" ? Math.max(0, Math.sin(i * 0.7) * stress * 0.01) : 0;
        return (
          <mesh key={i} position={[b.x, b.h / 2 + wobble * (mode === "traffic" ? 0.05 : 0), b.z]} castShadow>
            <boxGeometry args={[1.2, b.h, 1.2]} />
            <meshStandardMaterial
              color={b.color}
              emissive={mode === "outbreak" ? "#7f1d1d" : accent}
              emissiveIntensity={0.05 + heat + (stress / 100) * 0.25}
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
        );
      })}

      {/* central data spire */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 10, 6]} />
        <meshStandardMaterial color="#0a0f1c" emissive={accent} emissiveIntensity={0.6 + stress / 200} />
      </mesh>
      <mesh position={[0, 10.5, 0]}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} wireframe />
      </mesh>

      {/* flood plane */}
      {mode === "flood" && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05 + (stress / 100) * 1.5, 0]}>
          <planeGeometry args={[80, 80]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.35 + (stress / 100) * 0.3} emissive="#38bdf8" emissiveIntensity={0.2} />
        </mesh>
      )}
    </group>
  );
}

export default function CityTwinClient({ stress, mode }: { stress: number; mode: StressMode }) {
  return (
    <Canvas shadows camera={{ position: [22, 18, 22], fov: 45 }} dpr={[1, 2]}>
      <color attach="background" args={["#0a0f1c"]} />
      <fog attach="fog" args={["#0a0f1c", 28, 70]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[12, 18, 8]} intensity={1.1} castShadow />
      <Stars radius={80} depth={20} count={1500} factor={3} saturation={0} fade speed={0.3} />
      <Buildings stress={stress} mode={mode} />
      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} minDistance={18} maxDistance={50} />
    </Canvas>
  );
}