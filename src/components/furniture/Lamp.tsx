import React from 'react';
import { Cylinder } from '@react-three/drei';
import { FurnitureProps } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

export function Lamp({ variant }: FurnitureProps) {
  const { settings } = useSettings();
  let lampColor = '#fef08a';
  if (variant === 1) lampColor = '#fca5a5';
  else if (variant === 2) lampColor = '#93c5fd';
  else if (variant === 3) lampColor = '#86efac';

  return (
    <group>
      <Cylinder args={[0.1, 0.15, 0.1]} position={[0, 0.05, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#71717a" roughness={0.4} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 0.6]} position={[0, 0.35, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#d4d4d8" roughness={0.4} />
      </Cylinder>
      <Cylinder
        args={[0.15, 0.25, 0.3]}
        position={[0, 0.7, 0]}
        castShadow
        frustumCulled={false}
        renderOrder={10}
      >
        <meshStandardMaterial color={lampColor} alphaHash opacity={0.9} />
      </Cylinder>
      <pointLight
        position={[0, 0.7, 0]}
        intensity={settings.video.lightReflections ? 1.2 : 0}
        color={lampColor}
        distance={5}
        castShadow
        shadow-bias={-0.001}
      />
    </group>
  );
}
