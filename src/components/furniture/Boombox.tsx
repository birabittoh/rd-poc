import React, { useRef, useMemo } from 'react';
import { Box, Sphere } from '@react-three/drei';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { SVGLoader } from 'three-stdlib';
import { FurnitureProps } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

// Musical note SVG paths
const NOTE_SVGS = [
  // Eighth note
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M70,10 L70,70 C70,81 61,90 50,90 C39,90 30,81 30,70 C30,59 39,50 50,50 L50,20 L70,20 L70,10 Z" fill="white"/></svg>',
  // Two beamed eighth notes
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M30,20 L80,10 L80,70 C80,81 71,90 60,90 C49,90 40,81 40,70 C40,59 49,50 60,50 L60,30 L40,35 L40,75 C40,86 31,95 20,95 C9,95 0,86 0,75 C0,64 9,55 20,55 L20,20 Z" fill="white"/></svg>',
];

function NoteParticle({ color, type, phase, offset, scale }: { color: string, type: number, phase: number, offset: number, scale: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const svg = useLoader(SVGLoader, `data:image/svg+xml;utf8,${NOTE_SVGS[type]}`);

  const shapes = useMemo(() => {
    return svg.paths.flatMap(p => SVGLoader.createShapes(p));
  }, [svg]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    const localT = (t + phase) % 2;
    const progress = localT / 2;

    meshRef.current.position.y = 0.2 + progress * 0.8;
    meshRef.current.position.x = Math.sin(t * 3 + offset) * 0.3;
    meshRef.current.position.z = Math.cos(t * 3 + offset) * 0.3;
    meshRef.current.scale.setScalar(scale * (1 - progress));
    meshRef.current.rotation.y = t * 2;
    meshRef.current.visible = progress < 1;
  });

  return (
    <group ref={meshRef}>
      {shapes.map((shape, i) => (
        <mesh key={i} rotation={[Math.PI, 0, 0]} scale={0.005} position={[-0.25, 0.25, 0]}>
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function Boombox({ variant }: FurnitureProps) {
  const { settings } = useSettings();
  const groupRef = useRef<THREE.Group>(null);
  const notesRef = useRef<THREE.Group>(null);

  let mainColor = '#333333';
  let accentColor = '#ff0000';
  if (variant === 1) {
    mainColor = '#ffffff';
    accentColor = '#0077ff';
  } else if (variant === 2) {
    mainColor = '#ffd700';
    accentColor = '#000000';
  } else if (variant === 3) {
    mainColor = '#ff00ff';
    accentColor = '#00ffff';
  }

  // Particle data for musical notes
  const notes = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => ({
      type: i % 2,
      offset: (i * Math.PI * 0.33),
      scale: 0.3 + (i * 0.04),
      phase: (i * Math.PI * 0.4),
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Pulse animation
    if (groupRef.current) {
      const pulse = 1 + Math.sin(t * 10) * 0.05;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      <group ref={groupRef} position={[0, 0.15, 0]}>
        {/* Main Body */}
        <Box args={[0.6, 0.3, 0.2]} castShadow receiveShadow>
          <meshStandardMaterial color={mainColor} roughness={0.5} />
        </Box>

        {/* Speakers */}
        <Sphere args={[0.1, 16, 16]} position={[-0.2, 0, 0.11]} castShadow receiveShadow>
          <meshStandardMaterial color="#111111" />
        </Sphere>
        <Sphere args={[0.1, 16, 16]} position={[0.2, 0, 0.11]} castShadow receiveShadow>
          <meshStandardMaterial color="#111111" />
        </Sphere>

        {/* Handle */}
        <Box args={[0.4, 0.05, 0.05]} position={[0, 0.18, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={accentColor} />
        </Box>

        {/* Buttons/Display */}
        <Box args={[0.15, 0.1, 0.02]} position={[0, 0.05, 0.1]} castShadow receiveShadow>
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.5} />
        </Box>
      </group>

      {/* Musical Note Particles */}
      {settings.video.particleEffects && (
        <group ref={notesRef}>
          {notes.map((note, i) => (
            <NoteParticle
              key={i}
              color={accentColor}
              type={note.type}
              phase={note.phase}
              offset={note.offset}
              scale={note.scale}
            />
          ))}
        </group>
      )}
    </group>
  );
}
