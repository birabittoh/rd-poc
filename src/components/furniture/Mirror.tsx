import React from "react";
import { Box, MeshReflectorMaterial } from "@react-three/drei";
import { FurnitureProps } from "../../types";

export function Mirror({ localConn, variant }: FurnitureProps) {
  const width = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
  const posX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);

  let frameColor = "#5c3a21";
  if (variant === 1) {
    frameColor = "#4a5568";
  } else if (variant === 2) {
    frameColor = "#1f2937";
  } else if (variant === 3) {
    frameColor = "#f8fafc";
  }

  return (
    <group position={[0, 0, -0.45]}>
      {/* Frame */}
      <Box
        args={[width, 1.9, 0.1]}
        position={[posX, 0.95, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </Box>

      {/* Mirror surface */}
      <mesh position={[posX, 0.95, 0.051]}>
        <planeGeometry args={[width - 0.1, 1.7]} />
        <MeshReflectorMaterial
          blur={[0, 0]}
          mixBlur={0}
          mixStrength={1}
          mixContrast={1}
          resolution={1024}
          mirror={1}
          depthScale={0}
          minDepthThreshold={0.9}
          maxDepthThreshold={1}
          color="#a0a0a0"
          metalness={0.5}
          roughness={0}
        />
      </mesh>
    </group>
  );
}
