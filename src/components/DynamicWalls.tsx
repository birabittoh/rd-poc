import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GRID_SIZE, TILE_SIZE } from '../constants';

export function DynamicWalls() {
  const mat0 = useRef<THREE.MeshStandardMaterial>(null);
  const mat1 = useRef<THREE.MeshStandardMaterial>(null);
  const mat2 = useRef<THREE.MeshStandardMaterial>(null);
  const mat3 = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ camera }) => {
    // Determine which walls block the view based on camera angle
    const angle = Math.atan2(camera.position.x, camera.position.z);

    // Normalize angle to 0-2PI
    let normalizedAngle = angle;
    if (normalizedAngle < 0) normalizedAngle += Math.PI * 2;

    // 0: Back (z = 0), 1: Right (x = GRID_SIZE), 2: Front (z = GRID_SIZE), 3: Left (x = 0)
    const newOpacities = [1, 1, 1, 1];

    // Simple heuristic based on octants
    if (normalizedAngle >= 0 && normalizedAngle < Math.PI * 0.5) {
      newOpacities[1] = 0.1;
      newOpacities[2] = 0.1;
    } else if (normalizedAngle >= Math.PI * 0.5 && normalizedAngle < Math.PI) {
      newOpacities[0] = 0.1;
      newOpacities[1] = 0.1;
    } else if (normalizedAngle >= Math.PI && normalizedAngle < Math.PI * 1.5) {
      newOpacities[0] = 0.1;
      newOpacities[3] = 0.1;
    } else {
      newOpacities[2] = 0.1;
      newOpacities[3] = 0.1;
    }

    const mats = [mat0, mat1, mat2, mat3];
    mats.forEach((mat, i) => {
      if (mat.current) {
        mat.current.opacity = newOpacities[i];
        mat.current.depthWrite = newOpacities[i] >= 1;
      }
    });
  });

  const wallHeight = 4;
  const half = (GRID_SIZE * TILE_SIZE) / 2;

  return (
    <group>
      {/* Back Wall (z = 0) */}
      <mesh position={[half, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial ref={mat0} color="#f4f4f5" transparent opacity={1} roughness={0.4} />
      </mesh>

      {/* Right Wall (x = GRID_SIZE) */}
      <mesh
        position={[GRID_SIZE * TILE_SIZE, wallHeight / 2, half]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial ref={mat1} color="#f4f4f5" transparent opacity={1} roughness={0.4} />
      </mesh>

      {/* Front Wall (z = GRID_SIZE) */}
      <mesh position={[half, wallHeight / 2, GRID_SIZE * TILE_SIZE]} receiveShadow>
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial ref={mat2} color="#f4f4f5" transparent opacity={1} roughness={0.4} />
      </mesh>

      {/* Left Wall (x = 0) */}
      <mesh position={[0, wallHeight / 2, half]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial ref={mat3} color="#f4f4f5" transparent opacity={1} roughness={0.4} />
      </mesh>
    </group>
  );
}
