import React from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { ItemType } from "../types";

export function FurnitureModel({ type }: { type: ItemType }) {
  switch (type) {
    case "table":
      return (
        <group>
          <Box
            args={[0.9, 0.1, 0.9]}
            position={[0, 0.95, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#8b5a2b" />
          </Box>
          <Cylinder
            args={[0.05, 0.05, 0.9]}
            position={[-0.4, 0.45, -0.4]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
          <Cylinder
            args={[0.05, 0.05, 0.9]}
            position={[0.4, 0.45, -0.4]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
          <Cylinder
            args={[0.05, 0.05, 0.9]}
            position={[-0.4, 0.45, 0.4]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
          <Cylinder
            args={[0.05, 0.05, 0.9]}
            position={[0.4, 0.45, 0.4]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
        </group>
      );
    case "chair":
      return (
        <group>
          <Box
            args={[0.6, 0.1, 0.6]}
            position={[0, 0.5, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#a0522d" />
          </Box>
          <Box args={[0.6, 0.6, 0.1]} position={[0, 0.8, -0.25]} castShadow>
            <meshStandardMaterial color="#a0522d" />
          </Box>
          <Cylinder
            args={[0.04, 0.04, 0.5]}
            position={[-0.25, 0.25, -0.25]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
          <Cylinder
            args={[0.04, 0.04, 0.5]}
            position={[0.25, 0.25, -0.25]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
          <Cylinder
            args={[0.04, 0.04, 0.5]}
            position={[-0.25, 0.25, 0.25]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
          <Cylinder
            args={[0.04, 0.04, 0.5]}
            position={[0.25, 0.25, 0.25]}
            castShadow
          >
            <meshStandardMaterial color="#5c3a21" />
          </Cylinder>
        </group>
      );
    case "plant":
      return (
        <group>
          <Cylinder args={[0.2, 0.15, 0.4]} position={[0, 0.2, 0]} castShadow>
            <meshStandardMaterial color="#d2b48c" />
          </Cylinder>
          <Sphere args={[0.3]} position={[0, 0.6, 0]} castShadow>
            <meshStandardMaterial color="#22c55e" />
          </Sphere>
          <Sphere args={[0.2]} position={[0.15, 0.8, 0.1]} castShadow>
            <meshStandardMaterial color="#16a34a" />
          </Sphere>
          <Sphere args={[0.25]} position={[-0.1, 0.7, -0.15]} castShadow>
            <meshStandardMaterial color="#15803d" />
          </Sphere>
        </group>
      );
    case "lamp":
      return (
        <group>
          <Cylinder args={[0.1, 0.15, 0.1]} position={[0, 0.05, 0]} castShadow>
            <meshStandardMaterial color="#71717a" />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.6]} position={[0, 0.35, 0]} castShadow>
            <meshStandardMaterial color="#d4d4d8" />
          </Cylinder>
          <Cylinder args={[0.15, 0.25, 0.3]} position={[0, 0.7, 0]} castShadow>
            <meshStandardMaterial color="#fef08a" transparent opacity={0.9} />
          </Cylinder>
          <pointLight
            position={[0, 0.7, 0]}
            intensity={0.5}
            color="#fef08a"
            distance={3}
          />
        </group>
      );
    case "vase":
      return (
        <group>
          <Cylinder args={[0.1, 0.08, 0.3]} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#38bdf8" />
          </Cylinder>
          <Sphere args={[0.15]} position={[0, 0.4, 0]} castShadow>
            <meshStandardMaterial color="#ec4899" />
          </Sphere>
          <Sphere args={[0.1]} position={[0.1, 0.45, 0.1]} castShadow>
            <meshStandardMaterial color="#f472b6" />
          </Sphere>
          <Sphere args={[0.12]} position={[-0.1, 0.5, -0.05]} castShadow>
            <meshStandardMaterial color="#db2777" />
          </Sphere>
        </group>
      );
  }
}
