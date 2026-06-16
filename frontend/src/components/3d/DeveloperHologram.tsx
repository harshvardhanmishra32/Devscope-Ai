"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Line, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface SkillNode {
  label: string;
  color: string;
  angleOffset: number;
  radius: number;
}

export default function DeveloperHologram() {
  const coreRef = useRef<THREE.Mesh>(null);
  const orbitalGroupRef = useRef<THREE.Group>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const skills: SkillNode[] = [
    { label: "AI Systems", color: "#a855f7", angleOffset: 0, radius: 4.5 },
    { label: "Software Engineering", color: "#3b82f6", angleOffset: Math.PI / 2, radius: 4.8 },
    { label: "System Design", color: "#10b981", angleOffset: Math.PI, radius: 4.2 },
    { label: "Cloud Native", color: "#ec4899", angleOffset: (3 * Math.PI) / 2, radius: 4.6 }
  ];

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Mouse responsiveness
    const targetX = (state.pointer.x * Math.PI) / 6;
    const targetY = (state.pointer.y * Math.PI) / 6;
    setMousePos((prev) => ({
      x: THREE.MathUtils.lerp(prev.x, targetX, 0.05),
      y: THREE.MathUtils.lerp(prev.y, targetY, 0.05),
    }));

    if (coreRef.current) {
      coreRef.current.rotation.x = elapsed * 0.15 + mousePos.y;
      coreRef.current.rotation.y = elapsed * 0.2 + mousePos.x;
    }

    if (orbitalGroupRef.current) {
      orbitalGroupRef.current.rotation.y = elapsed * 0.08 + mousePos.x;
      orbitalGroupRef.current.rotation.x = Math.sin(elapsed * 0.05) * 0.1 + mousePos.y;
    }
  });

  return (
    <group>
      {/* 1. Core Developer Crystal */}
      <Float speed={3} floatIntensity={1} rotationIntensity={1}>
        <Sphere ref={coreRef} args={[1.6, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#0f172a"
            emissive="#6366f1"
            emissiveIntensity={1.8}
            distort={0.45}
            speed={2.5}
            roughness={0.1}
            metalness={0.9}
            wireframe
          />
        </Sphere>
        {/* Pulsing Solid Core */}
        <Sphere args={[1.2, 32, 32]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#030712"
            emissive="#4f46e5"
            emissiveIntensity={1}
            roughness={0.4}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* 2. Orbiting Skill Networks */}
      <group ref={orbitalGroupRef}>
        {skills.map((skill, index) => {
          // Dynamic calculation of orbital coordinates
          const x = Math.cos(skill.angleOffset) * skill.radius;
          const z = Math.sin(skill.angleOffset) * skill.radius;
          const y = Math.sin(skill.angleOffset * 2) * 1.2;

          return (
            <group key={index} position={[x, y, z]}>
              <Float speed={2.5} floatIntensity={0.6} rotationIntensity={0.6}>
                {/* Glowing Node Point */}
                <Sphere args={[0.25, 16, 16]}>
                  <meshStandardMaterial
                    color={skill.color}
                    emissive={skill.color}
                    emissiveIntensity={1.2}
                    roughness={0.2}
                  />
                </Sphere>
                {/* Outer Glow Shield */}
                <Sphere args={[0.35, 16, 16]}>
                  <meshBasicMaterial
                    color={skill.color}
                    transparent
                    opacity={0.25}
                  />
                </Sphere>

                {/* Skill Label Floating below Node */}
                <Text
                  position={[0, -0.6, 0]}
                  fontSize={0.32}
                  color="#f8fafc"
                  anchorX="center"
                  anchorY="middle"
                  font="https://fonts.gstatic.com/s/outfit/v6/QGY9z_k624urqpPfL38.woff"
                >
                  {skill.label}
                </Text>
              </Float>

              {/* Connecting Web-Line back to Core */}
              <Line
                points={[[0, 0, 0], [-x, -y, -z]]}
                color={skill.color}
                lineWidth={1}
                transparent
                opacity={0.25}
              />
            </group>
          );
        })}

        {/* 3. Concentric Orbital Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[4.5, 0.012, 16, 100]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.15} />
        </mesh>
        <mesh rotation={[Math.PI / 2.2, Math.PI / 6, 0]}>
          <torusGeometry args={[4.8, 0.01, 16, 100]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.12} />
        </mesh>
      </group>
    </group>
  );
}
