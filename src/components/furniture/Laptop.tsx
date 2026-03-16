import React from "react";
import { Box } from "@react-three/drei";
import { FurnitureProps } from "../../types";

export function Laptop({ variant }: FurnitureProps) {
  let laptopColor = "#d4d4d8";
  let screenColor = "#0ea5e9";
  if (variant === 1) {
    laptopColor = "#27272a";
    screenColor = "#ef4444";
  } else if (variant === 2) {
    laptopColor = "#fcd34d";
    screenColor = "#10b981";
  } else if (variant === 3) {
    laptopColor = "#f472b6";
    screenColor = "#ffffff";
  }

  return (
    <group>
      {/* Base */}
      <Box args={[0.4, 0.02, 0.3]} position={[0, 0.01, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={laptopColor} roughness={0.4} />
      </Box>
      {/* Screen */}
      <Box
        args={[0.4, 0.3, 0.02]}
        position={[0, 0.16, -0.14]}
        rotation={[-0.2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={
            variant === 1 ? "#3f3f46" : variant === 3 ? "#ec4899" : "#a1a1aa"
          }
          roughness={0.4}
        />
      </Box>
      {/* Screen Inner */}
      <Box
        args={[0.36, 0.26, 0.01]}
        position={[0, 0.16, -0.13]}
        rotation={[-0.2, 0, 0]}
      >
        <meshStandardMaterial
          color={screenColor}
          emissive={screenColor}
          emissiveIntensity={0.5}
        />
      </Box>
      <pointLight
        position={[0, 0.2, 0.1]}
        distance={2}
        intensity={0.4}
        color={screenColor}
      />
    </group>
  );
}
