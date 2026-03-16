import React from 'react';
import { Cylinder, Sphere } from '@react-three/drei';
import { FurnitureProps } from '../../types';

export function Vase({ variant }: FurnitureProps) {
  let vaseColor = '#38bdf8';
  if (variant === 1) vaseColor = '#fbbf24';
  else if (variant === 2) vaseColor = '#a855f7';
  else if (variant === 3) vaseColor = '#10b981';

  const flowerColor1 = variant === 2 ? '#f472b6' : variant === 3 ? '#fbbf24' : '#ec4899';

  return (
    <group>
      <Cylinder args={[0.1, 0.08, 0.3]} position={[0, 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={vaseColor} roughness={0.4} />
      </Cylinder>
      <Sphere args={[0.15]} position={[0, 0.4, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={flowerColor1} roughness={0.4} />
      </Sphere>
      <Sphere args={[0.1]} position={[0.1, 0.45, 0.1]} castShadow receiveShadow>
        <meshStandardMaterial color="#f472b6" roughness={0.4} />
      </Sphere>
      <Sphere args={[0.12]} position={[-0.1, 0.5, -0.05]} castShadow receiveShadow>
        <meshStandardMaterial color="#db2777" roughness={0.4} />
      </Sphere>
    </group>
  );
}
