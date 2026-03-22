import React from 'react';
import { Cylinder } from '@react-three/drei';
import { FurnitureProps } from '../../types';
import { useSettings } from '../../contexts/SettingsContext';

export function FloorLamp({ variant }: FurnitureProps) {
  const { settings } = useSettings();
  let floorLampColor = '#fef08a';
  if (variant === 1) floorLampColor = '#a7f3d0';
  else if (variant === 2) floorLampColor = '#fca5a5';
  else if (variant === 3) floorLampColor = '#fbbf24';

  const baseColor = variant === 2 ? '#18181b' : '#3f3f46';

  return (
    <group>
      <Cylinder args={[0.15, 0.15, 0.05]} position={[0, 0.025, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={baseColor} roughness={0.4} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 1.2]} position={[0, 0.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#71717a" roughness={0.4} />
      </Cylinder>
      <Cylinder
        args={[0.2, 0.3, 0.4]}
        position={[0, 1.3, 0]}
        castShadow
        receiveShadow
        frustumCulled={false}
        renderOrder={10}
      >
        <meshStandardMaterial color={floorLampColor} transparent opacity={0.9} depthWrite={false} />
      </Cylinder>
      <pointLight
        position={[0, 1.3, 0]}
        intensity={settings.video.lightReflections ? 1.5 : 0}
        color={floorLampColor}
        distance={6}
        castShadow
        shadow-bias={-0.001}
      />
    </group>
  );
}
