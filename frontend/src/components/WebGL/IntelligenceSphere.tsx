"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function NeuralGlobe() {
  const globeRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Rotate globe and particle systems on every frame tick
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    if (globeRef.current) {
      globeRef.current.rotation.y = elapsed * 0.15;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = -elapsed * 0.08;
      particlesRef.current.rotation.x = Math.sin(elapsed * 0.05) * 0.1;
    }
  });

  // Generate 400 neural particle points
  const particleCount = 400;
  const positions = React.useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.2 + Math.random() * 0.5; // Orbiting just outside the sphere
      
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <group>
      {/* 1. Core Glassmorphic Globe */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <MeshDistortMaterial
          color="#6366f1"
          roughness={0.1}
          metalness={0.1}
          distort={0.15}
          speed={1.5}
          transmission={0.9}
          thickness={1.2}
          ior={1.5}
          clearcoat={1.0}
        />
      </Sphere>

      {/* 2. Neural Particle Array */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#06b6d4"
          size={0.035}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>
      
      {/* 3. Floating Node Highlights (GitHub, Resume, Career) */}
      <mesh position={[1.5, 1.2, 1.2]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#d946ef" />
      </mesh>
      <mesh position={[-1.6, -0.8, 1.4]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
}

export default function IntelligenceSphere() {
  return (
    <div className="w-full h-[450px] relative">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#d946ef" />
        <NeuralGlobe />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
}
