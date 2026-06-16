"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Trail } from '@react-three/drei';
import * as THREE from 'three';

export default function AICore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Group>(null);
  const ringRef2 = useRef<THREE.Group>(null);
  
  // Track mouse coordinates for reactivity
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useFrame((state) => {
    // Smoothly interpolate towards target mouse position
    const targetX = (state.pointer.x * Math.PI) / 4;
    const targetY = (state.pointer.y * Math.PI) / 4;
    
    setMousePos((prev) => ({
      x: THREE.MathUtils.lerp(prev.x, targetX, 0.1),
      y: THREE.MathUtils.lerp(prev.y, targetY, 0.1),
    }));

    if (coreRef.current) {
      coreRef.current.rotation.x = state.clock.getElapsedTime() * 0.1 + mousePos.y;
      coreRef.current.rotation.y = state.clock.getElapsedTime() * 0.15 + mousePos.x;
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      ringRef1.current.rotation.y = state.clock.getElapsedTime() * -0.1;
    }

    if (ringRef2.current) {
      ringRef2.current.rotation.x = state.clock.getElapsedTime() * -0.15;
      ringRef2.current.rotation.y = state.clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <group>
      {/* Central Neural Sphere */}
      <Sphere ref={coreRef} args={[2.5, 64, 64]}>
        <MeshDistortMaterial
          color="#1e1b4b"
          emissive="#4f46e5"
          emissiveIntensity={1.5}
          distort={0.4}
          speed={3}
          roughness={0.2}
          metalness={0.8}
          wireframe={true}
        />
      </Sphere>

      {/* Glowing Inner Core (Solid) */}
      <Sphere args={[2.2, 32, 32]}>
        <meshStandardMaterial
          color="#000000"
          emissive="#6366f1"
          emissiveIntensity={0.8}
          roughness={0.5}
        />
      </Sphere>

      {/* Data Rings */}
      <group ref={ringRef1}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.8, 0.02, 16, 100]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>
        {/* Particle moving along the ring */}
        <Trail width={0.5} color="#c084fc" length={5} decay={1} local>
          <mesh position={[3.8, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </Trail>
      </group>

      <group ref={ringRef2}>
        <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
          <torusGeometry args={[4.5, 0.015, 16, 100]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.4} />
        </mesh>
        <Trail width={0.8} color="#f472b6" length={4} decay={2} local>
          <mesh position={[4.5, 0, 0]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </Trail>
      </group>
    </group>
  );
}
