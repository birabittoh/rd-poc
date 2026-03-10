import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GRID_SIZE, TILE_SIZE } from "../constants";

export function DynamicWalls() {
  const mat0 = useRef<THREE.MeshStandardMaterial>(null);
  const mat1 = useRef<THREE.MeshStandardMaterial>(null);
  const mat2 = useRef<THREE.MeshStandardMaterial>(null);
  const mat3 = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ camera }) => {
    // Determine which walls block the view based on camera angle
    // In @react-three/fiber, the default orientation might mean we need to adjust this.
    // Let's use the camera position directly to decide which walls are "front" and "right" from the viewer's perspective.

    const x = camera.position.x;
    const z = camera.position.z;

    // 0: Back (z = 0), 1: Right (x = GRID_SIZE), 2: Front (z = GRID_SIZE), 3: Left (x = 0)
    const opacities = [1, 1, 1, 1];

    // If camera is at positive X, positive Z (standard isometric view),
    // then the walls at GRID_SIZE (Front and Right) are the ones that could block the view.

    // Front wall (z = GRID_SIZE)
    if (z > (GRID_SIZE * TILE_SIZE) / 2) {
        opacities[2] = 0.1;
    }
    // Right wall (x = GRID_SIZE)
    if (x > (GRID_SIZE * TILE_SIZE) / 2) {
        opacities[1] = 0.1;
    }
    // Back wall (z = 0)
    if (z < (GRID_SIZE * TILE_SIZE) / 2) {
        opacities[0] = 0.1;
    }
    // Left wall (x = 0)
    if (x < (GRID_SIZE * TILE_SIZE) / 2) {
        opacities[3] = 0.1;
    }

    if (mat0.current) mat0.current.opacity = opacities[0];
    if (mat1.current) mat1.current.opacity = opacities[1];
    if (mat2.current) mat2.current.opacity = opacities[2];
    if (mat3.current) mat3.current.opacity = opacities[3];
  });

  const wallHeight = 4;
  const half = (GRID_SIZE * TILE_SIZE) / 2;

  return (
    <group>
      {/* Back Wall (z = 0) */}
      <mesh position={[half, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial
          ref={mat0}
          color="#f4f4f5"
          transparent
          opacity={1}
          roughness={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Right Wall (x = GRID_SIZE) */}
      <mesh
        position={[GRID_SIZE * TILE_SIZE, wallHeight / 2, half]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial
          ref={mat1}
          color="#f4f4f5"
          transparent
          opacity={1}
          roughness={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Front Wall (z = GRID_SIZE) */}
      <mesh
        position={[half, wallHeight / 2, GRID_SIZE * TILE_SIZE]}
        receiveShadow
      >
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial
          ref={mat2}
          color="#f4f4f5"
          transparent
          opacity={1}
          roughness={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Left Wall (x = 0) */}
      <mesh
        position={[0, wallHeight / 2, half]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <boxGeometry args={[GRID_SIZE * TILE_SIZE, wallHeight, 0.2]} />
        <meshStandardMaterial
          ref={mat3}
          color="#f4f4f5"
          transparent
          opacity={1}
          roughness={0.4}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
