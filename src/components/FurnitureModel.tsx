import React from "react";
import { Box, Cylinder, Sphere } from "@react-three/drei";
import { ItemType } from "../types";

export function FurnitureModel({ type, connections, rotation, z, variant }: { type: ItemType, connections?: { top: boolean, right: boolean, bottom: boolean, left: boolean }, rotation?: number, z?: number, variant?: number }) {
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

      let mainColor = "#8b5a2b";
      let legColor = "#5c3a21";
      if (variant === 1) { mainColor = "#e2e8f0"; legColor = "#94a3b8"; }
      else if (variant === 2) { mainColor = "#1f2937"; legColor = "#111827"; }
      else if (variant === 3) { mainColor = "#d97706"; legColor = "#92400e"; }

      const isModern = variant === 1 || variant === 2;

      return (
        <group>
          <Box
            args={[width, 0.1, depth]}
            position={[posX, 0.95, posZ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={mainColor} roughness={0.4} />
          </Box>
          {showTopLeft && (
            isModern ? (
              <Box args={[0.08, 0.9, 0.08]} position={[-0.4, 0.45, -0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Box>
            ) : (
              <Cylinder args={[0.05, 0.05, 0.9]} position={[-0.4, 0.45, -0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Cylinder>
            )
          )}
          {showTopRight && (
            isModern ? (
              <Box args={[0.08, 0.9, 0.08]} position={[0.4, 0.45, -0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Box>
            ) : (
              <Cylinder args={[0.05, 0.05, 0.9]} position={[0.4, 0.45, -0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Cylinder>
            )
          )}
          {showBottomLeft && (
            isModern ? (
              <Box args={[0.08, 0.9, 0.08]} position={[-0.4, 0.45, 0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Box>
            ) : (
              <Cylinder args={[0.05, 0.05, 0.9]} position={[-0.4, 0.45, 0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Cylinder>
            )
          )}
          {showBottomRight && (
            isModern ? (
              <Box args={[0.08, 0.9, 0.08]} position={[0.4, 0.45, 0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Box>
            ) : (
              <Cylinder args={[0.05, 0.05, 0.9]} position={[0.4, 0.45, 0.4]} castShadow receiveShadow>
                <meshStandardMaterial color={legColor} roughness={0.4} />
              </Cylinder>
            )
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

      let chairColor = "#a0522d";
      let legColor = "#5c3a21";
      if (variant === 1) { chairColor = "#3b82f6"; legColor = "#1e40af"; }
      else if (variant === 2) { chairColor = "#ef4444"; legColor = "#991b1b"; }
      else if (variant === 3) { chairColor = "#10b981"; legColor = "#065f46"; }

      const isTall = variant === 1 || variant === 2;

      return (
        <group>
          <Box
            args={[seatWidth, 0.1, seatDepth]}
            position={[seatPosX, 0.5, seatPosZ]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={chairColor} roughness={0.4} />
          </Box>
          <Box args={[backWidth, isTall ? 0.8 : 0.6, 0.1]} position={[backPosX, isTall ? 0.9 : 0.8, -0.25]} castShadow receiveShadow>
            <meshStandardMaterial color={chairColor} roughness={0.4} />
          </Box>
          {showTopLeft && (
            <Cylinder args={[0.04, 0.04, 0.5]} position={[-0.25, 0.25, -0.25]} castShadow receiveShadow>
              <meshStandardMaterial color={legColor} roughness={0.4} />
            </Cylinder>
          )}
          {showTopRight && (
            <Cylinder args={[0.04, 0.04, 0.5]} position={[0.25, 0.25, -0.25]} castShadow receiveShadow>
              <meshStandardMaterial color={legColor} roughness={0.4} />
            </Cylinder>
          )}
          {showBottomLeft && (
            <Cylinder args={[0.04, 0.04, 0.5]} position={[-0.25, 0.25, 0.25]} castShadow receiveShadow>
              <meshStandardMaterial color={legColor} roughness={0.4} />
            </Cylinder>
          )}
          {showBottomRight && (
            <Cylinder args={[0.04, 0.04, 0.5]} position={[0.25, 0.25, 0.25]} castShadow receiveShadow>
              <meshStandardMaterial color={legColor} roughness={0.4} />
            </Cylinder>
          )}
        </group>
      );
    }
    case "plant":
      const potColor = variant === 1 ? "#71717a" : (variant === 2 ? "#3f3f46" : (variant === 3 ? "#92400e" : "#d2b48c"));
      const leafColor1 = variant === 3 ? "#b91c1c" : "#22c55e";
      const leafColor2 = variant === 3 ? "#991b1b" : "#16a34a";
      const leafColor3 = variant === 3 ? "#7f1d1d" : "#15803d";

      const isBoxy = variant === 1 || variant === 2;

      return (
        <group>
          <Cylinder args={[0.2, 0.15, 0.4]} position={[0, 0.2, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={potColor} roughness={0.4} />
          </Cylinder>
          {isBoxy ? (
            <>
              <Box args={[0.4, 0.4, 0.4]} position={[0, 0.6, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={leafColor1} roughness={0.4} />
              </Box>
              <Box args={[0.3, 0.3, 0.3]} position={[0.15, 0.8, 0.1]} castShadow receiveShadow>
                <meshStandardMaterial color={leafColor2} roughness={0.4} />
              </Box>
              <Box args={[0.35, 0.35, 0.35]} position={[-0.1, 0.7, -0.15]} castShadow receiveShadow>
                <meshStandardMaterial color={leafColor3} roughness={0.4} />
              </Box>
            </>
          ) : (
            <>
              <Sphere args={[0.3]} position={[0, 0.6, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={leafColor1} roughness={0.4} />
              </Sphere>
              <Sphere args={[0.2]} position={[0.15, 0.8, 0.1]} castShadow receiveShadow>
                <meshStandardMaterial color={leafColor2} roughness={0.4} />
              </Sphere>
              <Sphere args={[0.25]} position={[-0.1, 0.7, -0.15]} castShadow receiveShadow>
                <meshStandardMaterial color={leafColor3} roughness={0.4} />
              </Sphere>
            </>
          )}
        </group>
      );
    case "lamp":
      let lampColor = "#fef08a";
      if (variant === 1) lampColor = "#fca5a5";
      else if (variant === 2) lampColor = "#93c5fd";
      else if (variant === 3) lampColor = "#86efac";

      return (
        <group>
          <Cylinder args={[0.1, 0.15, 0.1]} position={[0, 0.05, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#71717a" roughness={0.4} />
          </Cylinder>
          <Cylinder args={[0.02, 0.02, 0.6]} position={[0, 0.35, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#d4d4d8" roughness={0.4} />
          </Cylinder>
          <Cylinder args={[0.15, 0.25, 0.3]} position={[0, 0.7, 0]} castShadow frustumCulled={false} renderOrder={10}>
            <meshStandardMaterial color={lampColor} transparent opacity={0.9} depthWrite={false} />
          </Cylinder>
          <pointLight
            position={[0, 0.7, 0]}
            intensity={1.2}
            color={lampColor}
            distance={5}
            castShadow
            shadow-bias={-0.001}
          />
        </group>
      );
    case "vase":
      let vaseColor = "#38bdf8";
      if (variant === 1) vaseColor = "#fbbf24";
      else if (variant === 2) vaseColor = "#a855f7";
      else if (variant === 3) vaseColor = "#10b981";

      const flowerColor1 = variant === 2 ? "#f472b6" : (variant === 3 ? "#fbbf24" : "#ec4899");

      return (
        <group>
          <Cylinder args={[0.1, 0.08, 0.3]} position={[0, 0.15, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={vaseColor} roughness={0.4} />
          </Cylinder>
          <Sphere args={[0.15]} position={[0, 0.4, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={flowerColor1} roughness={0.4} />
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

      let libColor = "#5c3a21";
      let shelfColor = "#8b5a2b";
      if (variant === 1) { libColor = "#4a5568"; shelfColor = "#718096"; }
      else if (variant === 2) { libColor = "#1f2937"; shelfColor = "#374151"; }
      else if (variant === 3) { libColor = "#f8fafc"; shelfColor = "#e2e8f0"; }

      return (
        <group position={[0, 0, -0.35]}>
          <Box args={[libWidth, 1.5, 0.3]} position={[libPosX, 0.75, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={libColor} roughness={0.4} />
          </Box>
          {/* Shelves */}
          <Box args={[shelfWidth, 0.05, 0.25]} position={[shelfPosX, 0.3, 0.08]} castShadow receiveShadow><meshStandardMaterial color={shelfColor} roughness={0.4} /></Box>
          <Box args={[shelfWidth, 0.05, 0.25]} position={[shelfPosX, 0.7, 0.08]} castShadow receiveShadow><meshStandardMaterial color={shelfColor} roughness={0.4} /></Box>
          <Box args={[shelfWidth, 0.05, 0.25]} position={[shelfPosX, 1.1, 0.08]} castShadow receiveShadow><meshStandardMaterial color={shelfColor} roughness={0.4} /></Box>
          {/* Books */}
          <Box args={[0.1, 0.2, 0.18]} position={[-0.2, 0.45, 0.12]} castShadow receiveShadow><meshStandardMaterial color="#ef4444" roughness={0.4} /></Box>
          <Box args={[0.08, 0.22, 0.18]} position={[0, 0.46, 0.12]} castShadow receiveShadow><meshStandardMaterial color="#3b82f6" roughness={0.4} /></Box>
          <Box args={[0.12, 0.18, 0.18]} position={[0.2, 0.44, 0.12]} castShadow receiveShadow><meshStandardMaterial color="#10b981" roughness={0.4} /></Box>
        </group>
      );
    }
    case "floor_lamp":
      let floorLampColor = "#fef08a";
      if (variant === 1) floorLampColor = "#a7f3d0";
      else if (variant === 2) floorLampColor = "#fca5a5";
      else if (variant === 3) floorLampColor = "#fbbf24";

      const baseColor = variant === 2 ? "#18181b" : "#3f3f46";

      return (
        <group>
          <Cylinder args={[0.15, 0.15, 0.05]} position={[0, 0.025, 0]} castShadow receiveShadow><meshStandardMaterial color={baseColor} roughness={0.4} /></Cylinder>
          <Cylinder args={[0.02, 0.02, 1.2]} position={[0, 0.6, 0]} castShadow receiveShadow><meshStandardMaterial color="#71717a" roughness={0.4} /></Cylinder>
          <Cylinder args={[0.2, 0.3, 0.4]} position={[0, 1.3, 0]} castShadow receiveShadow frustumCulled={false} renderOrder={10}><meshStandardMaterial color={floorLampColor} transparent opacity={0.9} depthWrite={false} /></Cylinder>
          <pointLight position={[0, 1.3, 0]} intensity={1.5} color={floorLampColor} distance={6} castShadow shadow-bias={-0.001} />
        </group>
      );
    case "laptop":
      let laptopColor = "#d4d4d8";
      let screenColor = "#0ea5e9";
      if (variant === 1) { laptopColor = "#27272a"; screenColor = "#ef4444"; }
      else if (variant === 2) { laptopColor = "#fcd34d"; screenColor = "#10b981"; }
      else if (variant === 3) { laptopColor = "#f472b6"; screenColor = "#ffffff"; }

      return (
        <group>
          {/* Base */}
          <Box args={[0.4, 0.02, 0.3]} position={[0, 0.01, 0]} castShadow receiveShadow><meshStandardMaterial color={laptopColor} roughness={0.4} /></Box>
          {/* Screen */}
          <Box args={[0.4, 0.3, 0.02]} position={[0, 0.16, -0.14]} rotation={[-0.2, 0, 0]} castShadow receiveShadow><meshStandardMaterial color={variant === 1 ? "#3f3f46" : (variant === 3 ? "#ec4899" : "#a1a1aa")} roughness={0.4} /></Box>
          {/* Screen Inner */}
          <Box args={[0.36, 0.26, 0.01]} position={[0, 0.16, -0.13]} rotation={[-0.2, 0, 0]}><meshStandardMaterial color={screenColor} emissive={screenColor} emissiveIntensity={0.5} /></Box>
          <pointLight position={[0, 0.2, 0.1]} distance={2} intensity={0.4} color={screenColor} />
        </group>
      );
    case "book":
      let bookColor = "#8b5cf6";
      if (variant === 1) bookColor = "#ef4444";
      else if (variant === 2) bookColor = "#10b981";
      else if (variant === 3) bookColor = "#f59e0b";

      return (
        <group rotation={[0, Math.random(), 0]}>
          <Box args={[0.2, 0.05, 0.3]} position={[0, 0.025, 0]} castShadow receiveShadow><meshStandardMaterial color={bookColor} roughness={0.4} /></Box>
          <Box args={[0.18, 0.04, 0.28]} position={[0, 0.025, 0]} receiveShadow><meshStandardMaterial color="#f8fafc" /></Box>
        </group>
      );
    case "tv": {
      const isConnectedH = localConn.left || localConn.right;
      const width = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
      const posX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);
      const height = isConnectedH ? 1.0 : 0.5;
      const screenY = isConnectedH ? 0.61 : 0.36;

      // Calculate inner screen dimensions to remove seams
      const innerWidth = width - (localConn.right ? 0 : 0.02) - (localConn.left ? 0 : 0.02);
      const innerPosX = posX + (localConn.right ? 0.01 : 0) - (localConn.left ? 0.01 : 0);

      let screenColor = "#1e3a8a";
      let lightColor = "#3b82f6";
      if (variant === 1) { screenColor = "#065f46"; lightColor = "#10b981"; }
      else if (variant === 2) { screenColor = "#991b1b"; lightColor = "#ef4444"; }
      else if (variant === 3) { screenColor = "#78350f"; lightColor = "#f59e0b"; }

      return (
        <group>
          {!isConnectedH && (
            <>
              {/* Stand */}
              <Box args={[0.3, 0.02, 0.2]} position={[0, 0.01, 0]} castShadow receiveShadow><meshStandardMaterial color="#27272a" roughness={0.4} /></Box>
              <Cylinder args={[0.02, 0.02, 0.1]} position={[0, 0.06, 0]} castShadow receiveShadow><meshStandardMaterial color="#3f3f46" roughness={0.4} /></Cylinder>
            </>
          )}
          {/* Screen */}
          <Box args={[width, height, 0.05]} position={[posX, screenY, 0]} castShadow receiveShadow><meshStandardMaterial color="#18181b" roughness={0.4} /></Box>
          {/* Screen Inner */}
          <Box args={[innerWidth, height - 0.04, 0.01]} position={[innerPosX, screenY, 0.026]}><meshStandardMaterial color={screenColor} emissive={lightColor} emissiveIntensity={0.5} /></Box>
          <pointLight position={[posX, screenY, 0.2]} distance={4} intensity={0.8} color={lightColor} />
        </group>
      );
    }
    case "drawer": {
      const width = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
      const posX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);

      let drawerColor = "#5c3a21";
      let frontColor = "#8b5a2b";
      if (variant === 1) { drawerColor = "#e2e8f0"; frontColor = "#f8fafc"; }
      else if (variant === 2) { drawerColor = "#1f2937"; frontColor = "#374151"; }
      else if (variant === 3) { drawerColor = "#475569"; frontColor = "#64748b"; }

      return (
        <group position={[0, 0, -0.1]}>
          <Box args={[width, 0.8, 0.8]} position={[posX, 0.4, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={drawerColor} roughness={0.4} />
          </Box>
          {/* Drawer fronts */}
          {[0.2, 0.55].map((y, i) => (
            <group key={i} position={[posX, y, 0.4]}>
               <Box args={[width - 0.1, 0.3, 0.05]} castShadow receiveShadow>
                 <meshStandardMaterial color={frontColor} roughness={0.4} />
               </Box>
               <Box args={[0.2, 0.05, 0.05]} position={[0, 0, 0.03]} castShadow receiveShadow>
                 <meshStandardMaterial color="#d4d4d8" roughness={0.4} />
               </Box>
            </group>
          ))}
        </group>
      );
    }
    case "bedside_table":
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
    case "wardrobe": {
      const width = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
      const posX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);

      let wardrobeColor = "#5c3a21";
      let doorColor = "#8b5a2b";
      if (variant === 1) { wardrobeColor = "#edf2f7"; doorColor = "#cbd5e0"; }
      else if (variant === 2) { wardrobeColor = "#1f2937"; doorColor = "#111827"; }
      else if (variant === 3) { wardrobeColor = "#78350f"; doorColor = "#92400e"; }

      return (
        <group position={[0, 0, -0.2]}>
          <Box args={[width, 1.8, 0.6]} position={[posX, 0.9, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={wardrobeColor} roughness={0.4} />
          </Box>
          {/* Doors */}
          <Box args={[width - 0.1, 1.7, 0.05]} position={[posX, 0.9, 0.3]} castShadow receiveShadow>
            <meshStandardMaterial color={doorColor} roughness={0.4} />
          </Box>
          {/* Vertical line between doors */}
          <Box args={[0.02, 1.7, 0.06]} position={[posX, 0.9, 0.3]} receiveShadow>
            <meshStandardMaterial color={wardrobeColor} />
          </Box>
          {/* Handles */}
          <Box args={[0.05, 0.2, 0.05]} position={[posX - 0.1, 0.9, 0.33]} castShadow receiveShadow>
            <meshStandardMaterial color="#d4d4d8" />
          </Box>
          <Box args={[0.05, 0.2, 0.05]} position={[posX + 0.1, 0.9, 0.33]} castShadow receiveShadow>
            <meshStandardMaterial color="#d4d4d8" />
          </Box>
        </group>
      );
    }
    case "bed": {
      const showRailLeft = !localConn.left;
      const showRailRight = !localConn.right;

      const width = 0.9 + (localConn.right ? 0.05 : 0) + (localConn.left ? 0.05 : 0);
      const posX = (localConn.right ? 0.025 : 0) - (localConn.left ? 0.025 : 0);

      const isTopBunk = (z || 0) > 0;

      let frameColor = "#8b5a2b";
      let railColor = "#5c3a21";
      let blanketColor = "#3b82f6";
      if (variant === 1) { frameColor = "#475569"; railColor = "#1e293b"; blanketColor = "#ec4899"; }
      else if (variant === 2) { frameColor = "#f8fafc"; railColor = "#e2e8f0"; blanketColor = "#10b981"; }
      else if (variant === 3) { frameColor = "#1e2937"; railColor = "#0f172a"; blanketColor = "#f59e0b"; }

      return (
        <group>
          {/* Main Frame / Mattress */}
          <Box args={[width, 0.4, 1.9]} position={[posX, 0.2, 0.5]} castShadow receiveShadow>
            <meshStandardMaterial color="#f8fafc" roughness={0.6} />
          </Box>
          {/* Base Frame */}
          <Box args={[width + 0.05, 0.15, 2]} position={[posX, 0.075, 0.5]} castShadow receiveShadow>
            <meshStandardMaterial color={frameColor} roughness={0.4} />
          </Box>
          {/* Left Rail */}
          {showRailLeft && (
            <Box args={[0.05, 0.3, 2]} position={[-0.45, 0.25, 0.5]} castShadow receiveShadow>
              <meshStandardMaterial color={railColor} roughness={0.4} />
            </Box>
          )}
          {/* Right Rail */}
          {showRailRight && (
            <Box args={[0.05, 0.3, 2]} position={[0.45, 0.25, 0.5]} castShadow receiveShadow>
              <meshStandardMaterial color={railColor} roughness={0.4} />
            </Box>
          )}
          {/* Head Cushion */}
          <Box args={[0.8, 0.12, 0.4]} position={[posX, 0.41, -0.2]} castShadow receiveShadow>
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </Box>
          {/* Headboard */}
          <Box args={[width + 0.05, variant === 1 ? 0.6 : 0.8, 0.05]} position={[posX, variant === 1 ? 0.3 : 0.4, -0.475]} castShadow receiveShadow>
            <meshStandardMaterial color={railColor} roughness={0.4} />
          </Box>
          {/* Blanket */}
          <Box
            args={[width + (localConn.left || localConn.right ? 0.05 : -0.05), 0.02, 1.2]}
            position={[posX, 0.41, 0.8]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={blanketColor} roughness={0.6} />
          </Box>
          {/* Bunk bed supports (4 corner posts and ladder) */}
          {isTopBunk && (
            <group>
              {/* Four posts extending down to ground level */}
              {/* Front Left */}
              <Box args={[0.08, 1, 0.08]} position={[-0.45, -0.5, -0.45]} castShadow receiveShadow>
                <meshStandardMaterial color="#5c3a21" roughness={0.4} />
              </Box>
              {/* Front Right */}
              <Box args={[0.08, 1, 0.08]} position={[0.45, -0.5, -0.45]} castShadow receiveShadow>
                <meshStandardMaterial color="#5c3a21" roughness={0.4} />
              </Box>
              {/* Back Left (at position 1.45 instead of 0.45 because bed is size 2) */}
              <Box args={[0.08, 1, 0.08]} position={[-0.45, -0.5, 1.45]} castShadow receiveShadow>
                <meshStandardMaterial color="#5c3a21" roughness={0.4} />
              </Box>
              {/* Back Right */}
              <Box args={[0.08, 1, 0.08]} position={[0.45, -0.5, 1.45]} castShadow receiveShadow>
                <meshStandardMaterial color={railColor} roughness={0.4} />
              </Box>
              {/* Ladder on the side (opposite to cushion side) */}
              <group position={[showRailRight ? 0.48 : -0.48, -0.5, 0.9]}>
                <Box args={[0.04, 1, 0.04]} position={[0, 0, -0.2]} castShadow receiveShadow>
                  <meshStandardMaterial color={railColor} roughness={0.4} />
                </Box>
                <Box args={[0.04, 1, 0.04]} position={[0, 0, 0.2]} castShadow receiveShadow>
                  <meshStandardMaterial color={railColor} roughness={0.4} />
                </Box>
                {/* Steps */}
                {[0, 0.2, 0.4, 0.6, 0.8].map((y, i) => (
                  <Box key={i} args={[0.02, 0.04, 0.4]} position={[0, y - 0.45, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={railColor} roughness={0.4} />
                  </Box>
                ))}
              </group>
            </group>
          )}
        </group>
      );
    }
  }
}
