"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

function RepositoryPlanet({ 
  position, 
  color, 
  name, 
  size, 
  orbitSpeed, 
  orbitOffset, 
  distance 
}: { 
  position?: [number, number, number], 
  color: string, 
  name: string,
  size: number,
  orbitSpeed: number,
  orbitOffset: number,
  distance: number
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime() * orbitSpeed + orbitOffset;
      groupRef.current.position.x = Math.cos(time) * distance;
      groupRef.current.position.z = Math.sin(time) * distance;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef} position={position || [0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={0.2}
            roughness={0.4}
            metalness={0.6}
          />
        </mesh>
        
        {/* Atmosphere glow */}
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[size, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.1} />
        </mesh>

        <Text 
          position={[0, -size - 0.5, 0]} 
          fontSize={0.3} 
          color="#ffffff" 
          anchorX="center" 
          anchorY="middle"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}

export default function GithubUniverse() {
  const repos = [
    { name: "DevScopeAI", size: 1.5, color: "#4f46e5", distance: 0, speed: 0, offset: 0 }, // Central "Sun"
    { name: "NextJS-Boilerplate", size: 0.6, color: "#10b981", distance: 4, speed: 0.2, offset: 0 },
    { name: "FastAPI-Microservice", size: 0.8, color: "#f59e0b", distance: 7, speed: 0.1, offset: 2 },
    { name: "Docker-Configs", size: 0.4, color: "#3b82f6", distance: 3, speed: 0.3, offset: 4 },
    { name: "React-UI-Library", size: 0.7, color: "#ec4899", distance: 9, speed: 0.08, offset: 1 },
  ];

  return (
    <group>
      {repos.map((repo, idx) => (
        <RepositoryPlanet 
          key={idx}
          name={repo.name}
          size={repo.size}
          color={repo.color}
          distance={repo.distance}
          orbitSpeed={repo.speed}
          orbitOffset={repo.offset}
        />
      ))}

      {/* Orbit Rings */}
      {[3, 4, 7, 9].map((radius, idx) => (
        <mesh key={idx} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
