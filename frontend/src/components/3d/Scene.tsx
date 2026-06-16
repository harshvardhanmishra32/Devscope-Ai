"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Text, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import AICore from './AICore';
import AgentNetwork from './AgentNetwork';


function Particles() {
  const count = 1000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#8a2be2" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

import GithubUniverse from './GithubUniverse';
import KnowledgeGraph from './KnowledgeGraph';
import DeveloperHologram from './DeveloperHologram';

interface SceneProps {
  route: string;
}

export default function Scene({ route }: SceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
      {/* Dynamic Lighting for the OS */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#4f46e5" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ec4899" />
      <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={2} color="#00ffff" castShadow />
      
      {/* Deep Space / Intelligence Void Background */}
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={1} />
      <Particles />

      {/* Conditional Rendering based on Route */}
      {route === '/github' ? (
        <GithubUniverse />
      ) : route === '/resume' ? (
        <KnowledgeGraph />
      ) : route === '/about' ? (
        <DeveloperHologram />
      ) : (
        <group>
          <AICore />
          <AgentNetwork />
        </group>
      )}
      
      {/* Interactive Controls can be added later if needed */}
    </Canvas>
  );
}

