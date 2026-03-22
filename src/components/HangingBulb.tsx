import React from 'react';
import { Sphere, Cylinder } from '@react-three/drei';
import { useSettings } from '../contexts/SettingsContext';

export function HangingBulb() {
  const { settings } = useSettings();
  return (
    <group position={[0, 4, 0]}>
      {/* Cable hanging from the ceiling */}
      <Cylinder args={[0.01, 0.01, 1]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#222222" />
      </Cylinder>

      {/* Bulb Socket */}
      <Cylinder args={[0.04, 0.04, 0.1]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Glass Bulb */}
      <Sphere args={[0.1, 16, 16]} position={[0, -0.6, 0]}>
        <meshStandardMaterial
          color="#fff5d7"
          emissive="#fff5d7"
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
        <pointLight intensity={settings.video.lightReflections ? 1 : 0} distance={10} color="#fff5d7" castShadow />
      </Sphere>
    </group>
  );
}
