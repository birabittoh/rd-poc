import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function MirrorOrnament({ variant }: FurnitureProps) {
  let frameColor = '#5c3a21';
  if (variant === 1) frameColor = '#b7791f';
  else if (variant === 2) frameColor = '#1f2937';
  else if (variant === 3) frameColor = '#f8fafc';

  const glassColor = '#c8dce8';

  return (
    <group>
      {/* Base */}
      <Box args={[0.2, 0.04, 0.12]} position={[0, 0.02, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </Box>
      {/* Stand post */}
      <Box args={[0.03, 0.16, 0.03]} position={[0, 0.12, -0.01]} castShadow receiveShadow>
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </Box>
      {/* Outer frame */}
      <Box args={[0.28, 0.36, 0.04]} position={[0, 0.32, -0.01]} castShadow receiveShadow>
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </Box>
      {/* Mirror face */}
      <Box args={[0.22, 0.3, 0.02]} position={[0, 0.32, 0.02]} receiveShadow>
        <meshStandardMaterial color={glassColor} roughness={0.05} metalness={0.1} />
      </Box>
    </group>
  );
}
