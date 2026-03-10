import React from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { ItemType } from "../types";

export function FurnitureModel({ type, connections, rotation }: { type: ItemType, connections?: { top: boolean, right: boolean, bottom: boolean, left: boolean }, rotation?: number }) {
  const conn = connections || { top: false, right: false, bottom: false, left: false };
  let localConn = { ...conn };
  const rotIndex = Math.round((rotation || 0) / (Math.PI / 2));
  const normalizedRot = ((rotIndex % 4) + 4) % 4;
  if (normalizedRot === 1) {
    localConn = { top: conn.right, right: conn.top, bottom: conn.left, left: conn.bottom };
  } else if (normalizedRot === 2) {
    localConn = { top: conn.bottom, right: conn.left, bottom: conn.top, left: conn.right };
  } else if (normalizedRot === 3) {
    localConn = { top: conn.left, right: conn.bottom, bottom: conn.right, left: conn.top };
  }

  switch (type) {
    case "table": {
      const width = 0.9 + (localConn.right ? 0.05 : 0) + (localConn.left ? 0.05 : 0);
      const depth = 0.9 + (localConn.bottom ? 0.05 : 0) + (localConn.top ? 0.05 : 0);
      const posX = (localConn.right ? 0.025 : 0) - (localConn.left ? 0.025 : 0);
      const posZ = (localConn.bottom ? 0.025 : 0) - (localConn.top ? 0.025 : 0);
      
      const showTopLeft = !localConn.left && !localConn.top;
      const showTopRight = !localConn.right && !localConn.top;
      const showBottomLeft = !localConn.left && !localConn.bottom;
      const showBottomRight = !localConn.right && !localConn.bottom;

      return (
        <group>
          <Box
            args={[width, 0.1, depth]}
            position={[posX, 0.95, posZ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#8b5a2b" roughness={0.4} />
          </Box>
          {showTopLeft && (
            <Cylinder
              args={[0.05, 0.05, 0.9]}
              position={[-0.4, 0.45, -0.4]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
          {showTopRight && (
            <Cylinder
              args={[0.05, 0.05, 0.9]}
              position={[0.4, 0.45, -0.4]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
          {showBottomLeft && (
            <Cylinder
              args={[0.05, 0.05, 0.9]}
              position={[-0.4, 0.45, 0.4]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
          {showBottomRight && (
            <Cylinder
              args={[0.05, 0.05, 0.9]}
              position={[0.4, 0.45, 0.4]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
        </group>
      );
    }
    case "chair": {
      const seatWidth = 0.6 + (localConn.right ? 0.2 : 0) + (localConn.left ? 0.2 : 0);
      const seatDepth = 0.6 + (localConn.bottom ? 0.2 : 0) + (localConn.top ? 0.2 : 0);
      const seatPosX = (localConn.right ? 0.1 : 0) - (localConn.left ? 0.1 : 0);
      const seatPosZ = (localConn.bottom ? 0.1 : 0) - (localConn.top ? 0.1 : 0);

      const backWidth = 0.6 + (localConn.right ? 0.2 : 0) + (localConn.left ? 0.2 : 0);
      const backPosX = (localConn.right ? 0.1 : 0) - (localConn.left ? 0.1 : 0);

      const showTopLeft = !localConn.left && !localConn.top;
      const showTopRight = !localConn.right && !localConn.top;
      const showBottomLeft = !localConn.left && !localConn.bottom;
      const showBottomRight = !localConn.right && !localConn.bottom;

      return (
        <group>
          <Box
            args={[seatWidth, 0.1, seatDepth]}
            position={[seatPosX, 0.5, seatPosZ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#a0522d" roughness={0.4} />
          </Box>
          <Box args={[backWidth, 0.6, 0.1]} position={[backPosX, 0.8, -0.25]} castShadow receiveShadow>
            <meshStandardMaterial color="#a0522d" roughness={0.4} />
          </Box>
          {showTopLeft && (
            <Cylinder
              args={[0.04, 0.04, 0.5]}
              position={[-0.25, 0.25, -0.25]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
          {showTopRight && (
            <Cylinder
              args={[0.04, 0.04, 0.5]}
              position={[0.25, 0.25, -0.25]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
          {showBottomLeft && (
            <Cylinder
              args={[0.04, 0.04, 0.5]}
              position={[-0.25, 0.25, 0.25]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
          {showBottomRight && (
            <Cylinder
              args={[0.04, 0.04, 0.5]}
              position={[0.25, 0.25, 0.25]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#5c3a21" roughness={0.4} />
            </Cylinder>
          )}
        </group>
      );
    }
    case "plant":
      return (
        <group>
          <Cylinder args={[0.2, 0.15, 0.4]} position={[0, 0.2, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#d2b48c" roughness={0.4} />
          </Cylinder>
          <Sphere args={[0.3]} position={[0, 0.6, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#22c55e" roughness={0.4} />
          </Sphere>
          <Sphere args={[0.2]} position={[0.15, 0.8, 0.1]} castShadow receiveShadow>
            <meshStandardMaterial color="#16a34a" roughness={0.4} />
          </Sphere>
          <Sphere args={[0.25]} position={[-0.1, 0.7, -0.15]} castShadow receiveShadow>
            <meshStandardMaterial color="#15803d" roughness={0.4} />
          </Sphere>
        </group>
      );
    case "lamp":
      return (
        <group>
          <Cylinder args={[0.1, 0.15, 0.1]} position={[0, 0.05, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#71717a" roughness={0.4} />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.6]} position={[0, 0.35, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#d4d4d8" roughness={0.4} />
          </Cylinder>
          <Cylinder args={[0.15, 0.25, 0.3]} position={[0, 0.7, 0]} castShadow>
            <meshStandardMaterial color="#fef08a" transparent opacity={0.9} />
          </Cylinder>
          <pointLight
            position={[0, 0.7, 0]}
            intensity={1.2}
            color="#fef08a"
            distance={5}
            castShadow
            shadow-bias={-0.001}
          />
        </group>
      );
    case "vase":
      return (
        <group>
          <Cylinder args={[0.1, 0.08, 0.3]} position={[0, 0.15, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#38bdf8" roughness={0.4} />
          </Cylinder>
          <Sphere args={[0.15]} position={[0, 0.4, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#ec4899" roughness={0.4} />
          </Sphere>
          <Sphere args={[0.1]} position={[0.1, 0.45, 0.1]} castShadow receiveShadow>
            <meshStandardMaterial color="#f472b6" roughness={0.4} />
          </Sphere>
          <Sphere args={[0.12]} position={[-0.1, 0.5, -0.05]} castShadow receiveShadow>
            <meshStandardMaterial color="#db2777" roughness={0.4} />
          </Sphere>
        </group>
      );
    case "library": {
      const libWidth = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
      const libPosX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);
      
      const shelfWidth = 0.7 + (localConn.right ? 0.15 : 0) + (localConn.left ? 0.15 : 0);
      const shelfPosX = (localConn.right ? 0.075 : 0) - (localConn.left ? 0.075 : 0);

      return (
        <group position={[0, 0, -0.35]}>
          <Box args={[libWidth, 1.5, 0.3]} position={[libPosX, 0.75, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#5c3a21" roughness={0.4} />
          </Box>
          {/* Shelves */}
          <Box args={[shelfWidth, 0.05, 0.25]} position={[shelfPosX, 0.3, 0.05]} castShadow receiveShadow><meshStandardMaterial color="#8b5a2b" roughness={0.4} /></Box>
          <Box args={[shelfWidth, 0.05, 0.25]} position={[shelfPosX, 0.7, 0.05]} castShadow receiveShadow><meshStandardMaterial color="#8b5a2b" roughness={0.4} /></Box>
          <Box args={[shelfWidth, 0.05, 0.25]} position={[shelfPosX, 1.1, 0.05]} castShadow receiveShadow><meshStandardMaterial color="#8b5a2b" roughness={0.4} /></Box>
          {/* Books */}
          <Box args={[0.1, 0.2, 0.18]} position={[-0.2, 0.425, 0.06]} castShadow receiveShadow><meshStandardMaterial color="#ef4444" roughness={0.4} /></Box>
          <Box args={[0.08, 0.22, 0.18]} position={[0, 0.435, 0.06]} castShadow receiveShadow><meshStandardMaterial color="#3b82f6" roughness={0.4} /></Box>
          <Box args={[0.12, 0.18, 0.18]} position={[0.2, 0.415, 0.06]} castShadow receiveShadow><meshStandardMaterial color="#10b981" roughness={0.4} /></Box>
        </group>
      );
    }
    case "floor_lamp":
      return (
        <group>
          <Cylinder args={[0.15, 0.15, 0.05]} position={[0, 0.025, 0]} castShadow receiveShadow><meshStandardMaterial color="#3f3f46" roughness={0.4} /></Cylinder>
          <Cylinder args={[0.02, 0.02, 1.2]} position={[0, 0.6, 0]} castShadow receiveShadow><meshStandardMaterial color="#71717a" roughness={0.4} /></Cylinder>
          <Cylinder args={[0.2, 0.3, 0.4]} position={[0, 1.3, 0]} castShadow receiveShadow><meshStandardMaterial color="#fef08a" transparent opacity={0.9} /></Cylinder>
          <pointLight position={[0, 1.3, 0]} intensity={1.5} color="#fef08a" distance={6} castShadow shadow-bias={-0.001} />
        </group>
      );
    case "laptop":
      return (
        <group>
          {/* Base */}
          <Box args={[0.4, 0.02, 0.3]} position={[0, 0.01, 0]} castShadow receiveShadow><meshStandardMaterial color="#d4d4d8" roughness={0.4} /></Box>
          {/* Screen */}
          <Box args={[0.4, 0.3, 0.02]} position={[0, 0.16, -0.14]} rotation={[-0.2, 0, 0]} castShadow receiveShadow><meshStandardMaterial color="#a1a1aa" roughness={0.4} /></Box>
          {/* Screen Inner */}
          <Box args={[0.36, 0.26, 0.01]} position={[0, 0.16, -0.13]} rotation={[-0.2, 0, 0]}><meshStandardMaterial color="#0ea5e9" /></Box>
        </group>
      );
    case "book":
      return (
        <group rotation={[0, Math.random(), 0]}>
          <Box args={[0.2, 0.05, 0.3]} position={[0, 0.025, 0]} castShadow receiveShadow><meshStandardMaterial color="#8b5cf6" roughness={0.4} /></Box>
          <Box args={[0.18, 0.04, 0.28]} position={[0, 0.025, 0]} receiveShadow><meshStandardMaterial color="#f8fafc" /></Box>
        </group>
      );
    case "tv":
      return (
        <group>
          {/* Stand */}
          <Box args={[0.3, 0.02, 0.2]} position={[0, 0.01, 0]} castShadow receiveShadow><meshStandardMaterial color="#27272a" roughness={0.4} /></Box>
          <Cylinder args={[0.02, 0.02, 0.1]} position={[0, 0.06, 0]} castShadow receiveShadow><meshStandardMaterial color="#3f3f46" roughness={0.4} /></Cylinder>
          {/* Screen */}
          <Box args={[0.8, 0.5, 0.05]} position={[0, 0.36, 0]} castShadow receiveShadow><meshStandardMaterial color="#18181b" roughness={0.4} /></Box>
          {/* Screen Inner */}
          <Box args={[0.76, 0.46, 0.01]} position={[0, 0.36, 0.026]}><meshStandardMaterial color="#10b981" /></Box>
        </group>
      );
  }
}
