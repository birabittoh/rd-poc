import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function Library({ localConn, variant }: FurnitureProps) {
  const libWidth = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
  const libPosX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);

  const shelfWidth = 0.7 + (localConn.right ? 0.15 : 0) + (localConn.left ? 0.15 : 0);
  const shelfPosX = (localConn.right ? 0.075 : 0) - (localConn.left ? 0.075 : 0);

  let libColor = '#5c3a21';
  let shelfColor = '#8b5a2b';
  if (variant === 1) {
    libColor = '#4a5568';
    shelfColor = '#718096';
  } else if (variant === 2) {
    libColor = '#1f2937';
    shelfColor = '#374151';
  } else if (variant === 3) {
    libColor = '#f8fafc';
    shelfColor = '#e2e8f0';
  }

  return (
    <group position={[0, 0, -0.35]}>
      <Box args={[libWidth, 1.5, 0.3]} position={[libPosX, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={libColor} roughness={0.4} />
      </Box>
      {/* Shelves */}
      <Box
        args={[shelfWidth, 0.05, 0.25]}
        position={[shelfPosX, 0.3, 0.08]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={shelfColor} roughness={0.4} />
      </Box>
      <Box
        args={[shelfWidth, 0.05, 0.25]}
        position={[shelfPosX, 0.7, 0.08]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={shelfColor} roughness={0.4} />
      </Box>
      <Box
        args={[shelfWidth, 0.05, 0.25]}
        position={[shelfPosX, 1.1, 0.08]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={shelfColor} roughness={0.4} />
      </Box>
      {/* Books */}
      <Box args={[0.1, 0.2, 0.18]} position={[-0.2, 0.45, 0.12]} castShadow receiveShadow>
        <meshStandardMaterial color="#ef4444" roughness={0.4} />
      </Box>
      <Box args={[0.08, 0.22, 0.18]} position={[0, 0.46, 0.12]} castShadow receiveShadow>
        <meshStandardMaterial color="#3b82f6" roughness={0.4} />
      </Box>
      <Box args={[0.12, 0.18, 0.18]} position={[0.2, 0.44, 0.12]} castShadow receiveShadow>
        <meshStandardMaterial color="#10b981" roughness={0.4} />
      </Box>
    </group>
  );
}
