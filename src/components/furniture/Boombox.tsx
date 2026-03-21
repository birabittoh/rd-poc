import React, { useRef, useMemo } from 'react';
import { Box, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FurnitureProps } from '../../types';

export function Boombox({ variant }: FurnitureProps) {
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
    return Array.from({ length: 5 }).map((_, i) => ({
      pos: new THREE.Vector3(0, 0.2, 0),
      speed: 0.01 + (i * 0.005),
      offset: (i * Math.PI * 0.4),
      scale: 0.1 + (i * 0.02),
      phase: (i * Math.PI * 0.5),
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Pulse animation
    if (groupRef.current) {
      const pulse = 1 + Math.sin(t * 10) * 0.05;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }

    // Particle animation
    if (notesRef.current) {
      notesRef.current.children.forEach((child, i) => {
        const note = notes[i];
        const localT = (t + note.phase) % 2;
        const progress = localT / 2;

        child.position.y = 0.2 + progress * 0.5;
        child.position.x = Math.sin(t * 5 + note.offset) * 0.2;
        child.position.z = Math.cos(t * 5 + note.offset) * 0.2;
        child.scale.setScalar(note.scale * (1 - progress));
        child.rotation.y = t * 2;
        child.visible = progress < 1;
      });
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
      <group ref={notesRef}>
        {notes.map((_, i) => (
          <group key={i}>
             {/* Simple musical note representation using two boxes */}
            <Box args={[0.02, 0.15, 0.02]} position={[0.04, 0, 0]}>
              <meshStandardMaterial color={accentColor} />
            </Box>
            <Box args={[0.08, 0.02, 0.02]} position={[0, 0.06, 0]}>
              <meshStandardMaterial color={accentColor} />
            </Box>
            <Sphere args={[0.03, 8, 8]} position={[-0.01, -0.06, 0]}>
              <meshStandardMaterial color={accentColor} />
            </Sphere>
          </group>
        ))}
      </group>
    </group>
  );
}
