import React from 'react';
import { Box, Cylinder } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function TV({ localConn, variant }: FurnitureProps) {
  const isConnectedH = localConn.left || localConn.right;
  const width = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
  const posX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);
  const height = isConnectedH ? 1.0 : 0.5;
  const screenY = isConnectedH ? 0.61 : 0.36;

  // Calculate inner screen dimensions to remove seams
  const innerWidth = width - (localConn.right ? 0 : 0.02) - (localConn.left ? 0 : 0.02);
  const innerPosX = posX + (localConn.right ? 0.01 : 0) - (localConn.left ? 0.01 : 0);

  let screenColor = '#1e3a8a';
  let lightColor = '#3b82f6';
  if (variant === 1) {
    screenColor = '#065f46';
    lightColor = '#10b981';
  } else if (variant === 2) {
    screenColor = '#991b1b';
    lightColor = '#ef4444';
  } else if (variant === 3) {
    screenColor = '#78350f';
    lightColor = '#f59e0b';
  }

  return (
    <group>
      {!isConnectedH && (
        <>
          {/* Stand */}
          <Box args={[0.3, 0.02, 0.2]} position={[0, 0.01, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#27272a" roughness={0.4} />
          </Box>
          <Cylinder args={[0.02, 0.02, 0.1]} position={[0, 0.06, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#3f3f46" roughness={0.4} />
          </Cylinder>
        </>
      )}
      {/* Screen */}
      <Box args={[width, height, 0.05]} position={[posX, screenY, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#18181b" roughness={0.4} />
      </Box>
      {/* Screen Inner */}
      <Box args={[innerWidth, height - 0.04, 0.01]} position={[innerPosX, screenY, 0.026]}>
        <meshStandardMaterial color={screenColor} emissive={lightColor} emissiveIntensity={0.5} />
      </Box>
      <pointLight position={[posX, screenY, 0.2]} distance={4} intensity={0.8} color={lightColor} />
    </group>
  );
}
