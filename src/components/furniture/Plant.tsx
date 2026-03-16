import React from 'react';
import { Box, Cylinder, Sphere } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function Plant({ variant }: FurnitureProps) {
  const potColor =
    variant === 1 ? '#71717a' : variant === 2 ? '#3f3f46' : variant === 3 ? '#92400e' : '#d2b48c';
  const leafColor1 = variant === 3 ? '#b91c1c' : '#22c55e';
  const leafColor2 = variant === 3 ? '#991b1b' : '#16a34a';
  const leafColor3 = variant === 3 ? '#7f1d1d' : '#15803d';

  const isBoxy = variant === 1 || variant === 2;

  return (
    <group>
      <Cylinder args={[0.2, 0.15, 0.4]} position={[0, 0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={potColor} roughness={0.4} />
      </Cylinder>
      {isBoxy ? (
        <>
          <Box args={[0.4, 0.4, 0.4]} position={[0, 0.6, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={leafColor1} roughness={0.4} />
          </Box>
          <Box args={[0.3, 0.3, 0.3]} position={[0.15, 0.8, 0.1]} castShadow receiveShadow>
            <meshStandardMaterial color={leafColor2} roughness={0.4} />
          </Box>
          <Box args={[0.35, 0.35, 0.35]} position={[-0.1, 0.7, -0.15]} castShadow receiveShadow>
            <meshStandardMaterial color={leafColor3} roughness={0.4} />
          </Box>
        </>
      ) : (
        <>
          <Sphere args={[0.3]} position={[0, 0.6, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={leafColor1} roughness={0.4} />
          </Sphere>
          <Sphere args={[0.2]} position={[0.15, 0.8, 0.1]} castShadow receiveShadow>
            <meshStandardMaterial color={leafColor2} roughness={0.4} />
          </Sphere>
          <Sphere args={[0.25]} position={[-0.1, 0.7, -0.15]} castShadow receiveShadow>
            <meshStandardMaterial color={leafColor3} roughness={0.4} />
          </Sphere>
        </>
      )}
    </group>
  );
}
