"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

interface ScoreOrbProps {
  score?: number;
}

function OrbCore({ score = 87 }: ScoreOrbProps) {
  const orbRef = useRef<THREE.Mesh>(null);
  const ringXRef = useRef<THREE.Mesh>(null);
  const ringYRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (orbRef.current) {
      // Create a floating, pulsing animation
      orbRef.current.position.y = Math.sin(time * 1.5) * 0.08;
      orbRef.current.rotation.y = time * 0.25;
    }
    if (ringXRef.current) {
      ringXRef.current.rotation.x = time * 0.4;
      ringXRef.current.rotation.y = time * 0.1;
    }
    if (ringYRef.current) {
      ringYRef.current.rotation.y = -time * 0.5;
      ringYRef.current.rotation.z = time * 0.2;
    }
  });

  return (
    <group>
      {/* 1. Pulsing Icosahedron Core */}
      <Icosahedron ref={orbRef} args={[1.4, 2]}>
        <meshPhysicalMaterial
          color="#d946ef"
          wireframe={true}
          roughness={0.2}
          metalness={0.8}
          transmission={0.4}
          ior={1.3}
        />
      </Icosahedron>

      {/* 2. Concentric Orbiting Ring X */}
      <mesh ref={ringXRef}>
        <ringGeometry args={[1.8, 1.85, 64]} />
        <meshBasicMaterial color="#6366f1" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      {/* 3. Concentric Orbiting Ring Y */}
      <mesh ref={ringYRef}>
        <ringGeometry args={[2.1, 2.15, 64]} />
        <meshBasicMaterial color="#06b6d4" side={THREE.DoubleSide} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

export default function HolographicScoreOrb({ score = 87 }: ScoreOrbProps) {
  return (
    <div className="w-full h-full min-h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 4.5] }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={2.0} color="#d946ef" />
        <pointLight position={[-5, -5, -5]} intensity={1.0} color="#06b6d4" />
        <OrbCore score={score} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
