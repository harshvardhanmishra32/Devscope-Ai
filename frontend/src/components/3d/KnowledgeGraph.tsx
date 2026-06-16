"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Line, Float } from '@react-three/drei';
import * as THREE from 'three';

interface GraphNode {
  id: string;
  position: [number, number, number];
  color: string;
}

interface GraphLink {
  source: string;
  target: string;
}

export default function KnowledgeGraph() {
  const nodes: GraphNode[] = [
    { id: "Python", position: [0, 0, 0], color: "#3b82f6" }, // Center
    { id: "FastAPI", position: [3, 2, -1], color: "#10b981" },
    { id: "React", position: [-3, 1, 2], color: "#06b6d4" },
    { id: "Next.js", position: [-4, -1, 4], color: "#ffffff" },
    { id: "Docker", position: [2, -3, 1], color: "#3b82f6" },
    { id: "AWS", position: [4, -1, -3], color: "#f59e0b" },
    { id: "Machine Learning", position: [0, 4, -2], color: "#8b5cf6" },
    { id: "PostgreSQL", position: [-2, -2, -2], color: "#ec4899" },
  ];

  const links: GraphLink[] = [
    { source: "Python", target: "FastAPI" },
    { source: "Python", target: "Machine Learning" },
    { source: "React", target: "Next.js" },
    { source: "FastAPI", target: "Docker" },
    { source: "Docker", target: "AWS" },
    { source: "FastAPI", target: "PostgreSQL" },
    { source: "Python", target: "React" }, // Fullstack connection
  ];

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Slowly rotate the entire knowledge graph
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });

  // Helper to find node position by ID
  const getPos = (id: string) => nodes.find(n => n.id === id)?.position || [0, 0, 0];

  return (
    <group ref={groupRef}>
      {/* Draw Nodes */}
      {nodes.map((node) => (
        <Float key={node.id} speed={2} floatIntensity={0.5} rotationIntensity={0.5} position={node.position}>
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
          </Sphere>
          
          {/* Node Glow */}
          <Sphere args={[0.4, 16, 16]}>
            <meshBasicMaterial color={node.color} transparent opacity={0.2} />
          </Sphere>

          <Text 
            position={[0, -0.6, 0]} 
            fontSize={0.3} 
            color="#e2e8f0" 
            anchorX="center" 
            anchorY="middle"
          >
            {node.id}
          </Text>
        </Float>
      ))}

      {/* Draw Links */}
      {links.map((link, idx) => {
        const start = getPos(link.source);
        const end = getPos(link.target);
        
        return (
          <Line
            key={idx}
            points={[start, end]}
            color="#ffffff"
            lineWidth={1}
            transparent
            opacity={0.15}
          />
        );
      })}
    </group>
  );
}
