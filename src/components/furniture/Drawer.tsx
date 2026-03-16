import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function Drawer({ localConn, variant }: FurnitureProps) {
  const width = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
  const posX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);

  let drawerColor = '#5c3a21';
  let frontColor = '#8b5a2b';
  if (variant === 1) {
    drawerColor = '#e2e8f0';
    frontColor = '#f8fafc';
  } else if (variant === 2) {
    drawerColor = '#1f2937';
    frontColor = '#374151';
  } else if (variant === 3) {
    drawerColor = '#475569';
    frontColor = '#64748b';
  }

  return (
    <group position={[0, 0, -0.1]}>
      <Box args={[width, 0.8, 0.8]} position={[posX, 0.4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={drawerColor} roughness={0.4} />
      </Box>
      {/* Drawer fronts */}
      {[0.2, 0.55].map((y, i) => (
        <group key={i} position={[posX, y, 0.4]}>
          <Box args={[width - 0.1, 0.3, 0.05]} castShadow receiveShadow>
            <meshStandardMaterial color={frontColor} roughness={0.4} />
          </Box>
          <Box args={[0.2, 0.05, 0.05]} position={[0, 0, 0.03]} castShadow receiveShadow>
            <meshStandardMaterial color="#d4d4d8" roughness={0.4} />
          </Box>
        </group>
      ))}
    </group>
  );
}
