import React from "react";
import { Box } from "@react-three/drei";
import { FurnitureProps } from "../../types";

export function Wardrobe({ localConn, variant }: FurnitureProps) {
  const width = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
  const posX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);

  let wardrobeColor = "#5c3a21";
  let doorColor = "#8b5a2b";
  if (variant === 1) {
    wardrobeColor = "#edf2f7";
    doorColor = "#cbd5e0";
  } else if (variant === 2) {
    wardrobeColor = "#1f2937";
    doorColor = "#111827";
  } else if (variant === 3) {
    wardrobeColor = "#78350f";
    doorColor = "#92400e";
  }

  return (
    <group position={[0, 0, -0.2]}>
      <Box
        args={[width, 1.8, 0.6]}
        position={[posX, 0.9, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={wardrobeColor} roughness={0.4} />
      </Box>
      {/* Doors */}
      <Box
        args={[width - 0.1, 1.7, 0.05]}
        position={[posX, 0.9, 0.3]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={doorColor} roughness={0.4} />
      </Box>
      {/* Vertical line between doors */}
      <Box args={[0.02, 1.7, 0.06]} position={[posX, 0.9, 0.3]} receiveShadow>
        <meshStandardMaterial color={wardrobeColor} />
      </Box>
      {/* Handles */}
      <Box
        args={[0.05, 0.2, 0.05]}
        position={[posX - 0.1, 0.9, 0.33]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#d4d4d8" />
      </Box>
      <Box
        args={[0.05, 0.2, 0.05]}
        position={[posX + 0.1, 0.9, 0.33]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#d4d4d8" />
      </Box>
    </group>
  );
}
