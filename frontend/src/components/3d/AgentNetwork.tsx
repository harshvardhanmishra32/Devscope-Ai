"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, QuadraticBezierLine, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface AgentNodeProps {
  position: [number, number, number];
  color: string;
  name: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitOffset: number;
}

function AgentNode({ position, color, name, orbitRadius, orbitSpeed, orbitOffset }: AgentNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Orbit around the center (0,0,0) where the AI Core is
      const time = state.clock.getElapsedTime() * orbitSpeed + orbitOffset;
      groupRef.current.position.x = Math.cos(time) * orbitRadius;
      groupRef.current.position.z = Math.sin(time) * orbitRadius;
    }
    
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={meshRef}>
          {/* Use a stylized crystalline shape (Octahedron) for Agents */}
          <octahedronGeometry args={[0.6, 0]} />
          <meshPhysicalMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.4}
            transmission={0.9} 
            opacity={1} 
            metalness={0.2} 
            roughness={0.1}
            ior={1.5}
            thickness={2}
          />
        </mesh>
        
        {/* Core of the agent */}
        <Sphere args={[0.2, 16, 16]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>

        <Text 
          position={[0, -1, 0]} 
          fontSize={0.25} 
          color="#e2e8f0" 
          anchorX="center" 
          anchorY="middle" 
          font="https://fonts.gstatic.com/s/outfit/v11/QGYyz_MVcBeNP4NjuGObqx1XmO1I4Q.woff2"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}

// Draw a pulsating line between two points
function DataStream({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) {
  const lineRef = useRef<any>(null);

  useFrame((state) => {
    if (lineRef.current?.material) {
      // Pulse opacity
      lineRef.current.material.opacity = 0.3 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
    }
  });

  // Calculate mid point for bezier curve to bend it outward
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + 2, 
    (start[2] + end[2]) / 2
  ];

  return (
    <QuadraticBezierLine
      ref={lineRef}
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={1.5}
      dashed={true}
      dashScale={20}
      dashSize={1}
      dashOffset={0}
      transparent
      opacity={0.5}
    />
  );
}

export default function AgentNetwork() {
  const agents = [
    { name: "Recruiter Agent", color: "#3b82f6", radius: 7, speed: 0.1, offset: 0 },
    { name: "Resume Agent", color: "#8b5cf6", radius: 6, speed: 0.15, offset: 2 },
    { name: "GitHub Agent", color: "#10b981", radius: 8, speed: 0.12, offset: 4 },
    { name: "Project Reviewer", color: "#f59e0b", radius: 7.5, speed: 0.18, offset: 1 },
    { name: "Career Coach", color: "#ec4899", radius: 6.5, speed: 0.14, offset: 3 },
  ];

  return (
    <group>
      {agents.map((agent, i) => (
        <AgentNode 
          key={i} 
          name={agent.name} 
          color={agent.color} 
          position={[0, (i % 2 === 0 ? 1 : -1) * 2, 0]} // Varies Y position
          orbitRadius={agent.radius}
          orbitSpeed={agent.speed}
          orbitOffset={agent.offset}
        />
      ))}

      {/* Visualize connections between AI Core (0,0,0) and the orbit paths */}
      {/* We can't easily dynamically track moving nodes for the Line component without complex state sharing in r3f, 
          so we will visualize static pathways or ambient data streams */}
      <DataStream start={[0, 0, 0]} end={[7, 1, 0]} color="#3b82f6" />
      <DataStream start={[0, 0, 0]} end={[-6, -1, 3]} color="#8b5cf6" />
      <DataStream start={[0, 0, 0]} end={[0, 2, -8]} color="#10b981" />
    </group>
  );
}
