import React from 'react';
import { Box, Cylinder } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function Table({ localConn, variant }: FurnitureProps) {
  const width = 0.9 + (localConn.right ? 0.05 : 0) + (localConn.left ? 0.05 : 0);
  const depth = 0.9 + (localConn.bottom ? 0.05 : 0) + (localConn.top ? 0.05 : 0);
  const posX = (localConn.right ? 0.025 : 0) - (localConn.left ? 0.025 : 0);
  const posZ = (localConn.bottom ? 0.025 : 0) - (localConn.top ? 0.025 : 0);

  const showTopLeft = !localConn.left && !localConn.top;
  const showTopRight = !localConn.right && !localConn.top;
  const showBottomLeft = !localConn.left && !localConn.bottom;
  const showBottomRight = !localConn.right && !localConn.bottom;

  let mainColor = '#8b5a2b';
  let legColor = '#5c3a21';
  if (variant === 1) {
    mainColor = '#e2e8f0';
    legColor = '#94a3b8';
  } else if (variant === 2) {
    mainColor = '#1f2937';
    legColor = '#111827';
  } else if (variant === 3) {
    mainColor = '#d97706';
    legColor = '#92400e';
  }

  const isModern = variant === 1 || variant === 2;

  return (
    <group>
      <Box args={[width, 0.1, depth]} position={[posX, 0.95, posZ]} castShadow receiveShadow>
        <meshStandardMaterial color={mainColor} roughness={0.4} />
      </Box>
      {showTopLeft &&
        (isModern ? (
          <Box args={[0.08, 0.9, 0.08]} position={[-0.4, 0.45, -0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Box>
        ) : (
          <Cylinder args={[0.05, 0.05, 0.9]} position={[-0.4, 0.45, -0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Cylinder>
        ))}
      {showTopRight &&
        (isModern ? (
          <Box args={[0.08, 0.9, 0.08]} position={[0.4, 0.45, -0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Box>
        ) : (
          <Cylinder args={[0.05, 0.05, 0.9]} position={[0.4, 0.45, -0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Cylinder>
        ))}
      {showBottomLeft &&
        (isModern ? (
          <Box args={[0.08, 0.9, 0.08]} position={[-0.4, 0.45, 0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Box>
        ) : (
          <Cylinder args={[0.05, 0.05, 0.9]} position={[-0.4, 0.45, 0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Cylinder>
        ))}
      {showBottomRight &&
        (isModern ? (
          <Box args={[0.08, 0.9, 0.08]} position={[0.4, 0.45, 0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Box>
        ) : (
          <Cylinder args={[0.05, 0.05, 0.9]} position={[0.4, 0.45, 0.4]} castShadow receiveShadow>
            <meshStandardMaterial color={legColor} roughness={0.4} />
          </Cylinder>
        ))}
    </group>
  );
}
