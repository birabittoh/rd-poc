import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function Mirror({ localConn, variant }: FurnitureProps) {
  const width = 0.75 + (localConn.right ? 0.125 : 0) + (localConn.left ? 0.125 : 0);
  const posX = (localConn.right ? 0.0625 : 0) - (localConn.left ? 0.0625 : 0);

  let frameColor = '#5c3a21';
  if (variant === 1) frameColor = '#b7791f';
  else if (variant === 2) frameColor = '#1f2937';
  else if (variant === 3) frameColor = '#f8fafc';

  // Non-reflective matte glass stand-in
  const glassColor = '#c8dce8';

  return (
    <group position={[0, 0, -0.37]}>
      {/* Outer frame */}
      <Box args={[width, 1.6, 0.06]} position={[posX, 0.85, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </Box>
      {/* Mirror face */}
      <Box args={[width - 0.1, 1.5, 0.02]} position={[posX, 0.85, 0.04]} receiveShadow>
        <meshStandardMaterial color={glassColor} roughness={0.05} metalness={0.1} />
      </Box>
      {/* Bottom foot-rail */}
      <Box args={[width - 0.1, 0.05, 0.08]} position={[posX, 0.04, 0.01]} castShadow receiveShadow>
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </Box>
    </group>
  );
}
