import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { Ballerina } from '../types';
import { TILE_SIZE } from '../constants';

export function BallerinaModel({ ballerina }: { ballerina: Ballerina }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Interpolate position
    const targetX = ballerina.targetX * TILE_SIZE + TILE_SIZE / 2;
    const targetZ = ballerina.targetY * TILE_SIZE + TILE_SIZE / 2;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      5 * delta
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      5 * delta
    );

    // Look at target if moving
    if (
      Math.abs(targetX - groupRef.current.position.x) > 0.01 ||
      Math.abs(targetZ - groupRef.current.position.z) > 0.01
    ) {
      const angle = Math.atan2(
        targetX - groupRef.current.position.x,
        targetZ - groupRef.current.position.z
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        10 * delta
      );
    }

    // Dance animation
    if (ballerina.isDancing) {
      groupRef.current.rotation.y += delta * 4;
      timeRef.current += delta;
      groupRef.current.position.y = Math.abs(Math.sin(timeRef.current * 8)) * 0.2;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        10 * delta
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        ballerina.x * TILE_SIZE + TILE_SIZE / 2,
        0,
        ballerina.y * TILE_SIZE + TILE_SIZE / 2,
      ]}
    >
      {/* Simple Ballerina Representation */}
      <Cylinder args={[0, 0.3, 0.8]} position={[0, 0.4, 0]} castShadow>
        <meshStandardMaterial color="#fbcfe8" />
      </Cylinder>
      <Sphere args={[0.15]} position={[0, 0.9, 0]} castShadow>
        <meshStandardMaterial color="#fcd34d" />
      </Sphere>
      {/* Arms */}
      <Box args={[0.8, 0.05, 0.05]} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color="#fcd34d" />
      </Box>
    </group>
  );
}
