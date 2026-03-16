import React from "react";
import { Box } from "@react-three/drei";
import { FurnitureProps } from "../../types";

export function Book({ variant }: FurnitureProps) {
  let bookColor = "#8b5cf6";
  if (variant === 1) bookColor = "#ef4444";
  else if (variant === 2) bookColor = "#10b981";
  else if (variant === 3) bookColor = "#f59e0b";

  return (
    <group rotation={[0, Math.random(), 0]}>
      <Box
        args={[0.2, 0.05, 0.3]}
        position={[0, 0.025, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={bookColor} roughness={0.4} />
      </Box>
      <Box args={[0.18, 0.04, 0.28]} position={[0, 0.025, 0]} receiveShadow>
        <meshStandardMaterial color="#f8fafc" />
      </Box>
    </group>
  );
}
