import React from "react";
import { Box } from "@react-three/drei";
import { FurnitureProps } from "../../types";

export function BedsideTable({ variant }: FurnitureProps) {
  let bedsideColor = "#8b5a2b";
  if (variant === 1) bedsideColor = "#1f2937";
  else if (variant === 2) bedsideColor = "#f8fafc";
  else if (variant === 3) bedsideColor = "#4b5563";

  return (
    <group>
      <Box args={[0.6, 0.5, 0.6]} position={[0, 0.25, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={bedsideColor} roughness={0.4} />
      </Box>
      {/* Drawer Handle */}
      <Box args={[0.2, 0.05, 0.05]} position={[0, 0.35, 0.3]} castShadow receiveShadow>
        <meshStandardMaterial color="#d4d4d8" roughness={0.4} />
      </Box>
    </group>
  );
}
