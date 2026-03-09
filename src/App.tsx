import React, { useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrthographicCamera,
  OrbitControls,
  useGLTF,
  Box,
  Sphere,
  Cylinder,
} from "@react-three/drei";
import * as THREE from "three";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RotateCcw, Sofa, Lamp, Flower2, Table, Armchair } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const GRID_SIZE = 9;
const TILE_SIZE = 1;
const CENTER = Math.floor(GRID_SIZE / 2);

type ItemType = "table" | "chair" | "plant" | "lamp" | "vase";

interface Furniture {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  z: number;
}

interface Ballerina {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isDancing: boolean;
}

interface GameState {
  furniture: Furniture[];
  ballerina: Ballerina;
  status: "playing" | "game_over";
}

const WS_URL = import.meta.env.VITE_APP_URL
  ? import.meta.env.VITE_APP_URL.replace("http", "ws")
  : `ws://${window.location.host}`;

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "state") {
        setGameState(data.state);
      }
    };

    return () => socket.close();
  }, []);

  const handlePlace = (x: number, y: number, z: number) => {
    if (!ws || !selectedItem || gameState?.status !== "playing") return;

    // Check if placement is valid
    const isOrnament = selectedItem === "lamp" || selectedItem === "vase";
    if (isOrnament && z === 0) return; // Must be on surface
    if (!isOrnament && z > 0) return; // Must be on floor

    ws.send(
      JSON.stringify({
        type: "place_furniture",
        payload: { type: selectedItem, x, y, z },
      }),
    );
    setSelectedItem(null);
  };

  const resetGame = () => {
    if (ws) {
      ws.send(JSON.stringify({ type: "reset" }));
    }
  };

  if (!gameState) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900 text-white">
        Connecting to server...
      </div>
    );
  }

  const isOrnament = selectedItem === "lamp" || selectedItem === "vase";

  return (
    <div className="relative h-screen w-full bg-zinc-900 overflow-hidden font-sans text-zinc-100">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas shadows>
          <OrthographicCamera
            makeDefault
            position={[10, 10, 10]}
            zoom={40}
            near={-100}
            far={100}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2.5}
            minPolarAngle={Math.PI / 6}
          />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          <Room
            gameState={gameState}
            selectedItem={selectedItem}
            onPlace={handlePlace}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center pointer-events-none">
        {gameState.status === "game_over" && (
          <div className="mb-8 bg-red-500/90 backdrop-blur-md text-white px-8 py-4 rounded-2xl shadow-2xl pointer-events-auto flex flex-col items-center transform transition-all animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-bold mb-2">Game Over!</h2>
            <p className="text-red-100 mb-4">The ballerina is stuck.</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-white text-red-600 font-bold rounded-full hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}

        <div className="bg-zinc-800/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl pointer-events-auto border border-white/10 flex gap-4">
          <FurnitureButton
            type="table"
            icon={<Table />}
            selected={selectedItem === "table"}
            onClick={() =>
              setSelectedItem(selectedItem === "table" ? null : "table")
            }
          />
          <FurnitureButton
            type="chair"
            icon={<Armchair />}
            selected={selectedItem === "chair"}
            onClick={() =>
              setSelectedItem(selectedItem === "chair" ? null : "chair")
            }
          />
          <FurnitureButton
            type="plant"
            icon={<Sofa />}
            selected={selectedItem === "plant"}
            onClick={() =>
              setSelectedItem(selectedItem === "plant" ? null : "plant")
            }
          />
          <div className="w-px bg-white/10 mx-2" />
          <FurnitureButton
            type="lamp"
            icon={<Lamp />}
            selected={selectedItem === "lamp"}
            onClick={() =>
              setSelectedItem(selectedItem === "lamp" ? null : "lamp")
            }
            isOrnament
          />
          <FurnitureButton
            type="vase"
            icon={<Flower2 />}
            selected={selectedItem === "vase"}
            onClick={() =>
              setSelectedItem(selectedItem === "vase" ? null : "vase")
            }
            isOrnament
          />
        </div>
        <p className="mt-4 text-sm text-zinc-400 font-medium tracking-wide">
          {selectedItem
            ? `Select a ${isOrnament ? "surface" : "floor tile"} to place ${selectedItem}`
            : "Select an item to place"}
        </p>
      </div>
    </div>
  );
}

function FurnitureButton({
  type,
  icon,
  selected,
  onClick,
  isOrnament,
}: {
  type: ItemType;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  isOrnament?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-200",
        selected
          ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105"
          : "bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600 hover:text-white",
      )}
    >
      {icon}
      <span className="text-xs font-medium capitalize">{type}</span>
      {isOrnament && (
        <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          Top
        </span>
      )}
    </button>
  );
}

function Room({
  gameState,
  selectedItem,
  onPlace,
}: {
  gameState: GameState;
  selectedItem: ItemType | null;
  onPlace: (x: number, y: number, z: number) => void;
}) {
  const isOrnament = selectedItem === "lamp" || selectedItem === "vase";

  // Calculate grid occupancy
  const floorOccupied = new Set(
    gameState.furniture.filter((f) => f.z === 0).map((f) => `${f.x},${f.y}`),
  );
  const surfaceOccupied = new Set(
    gameState.furniture.filter((f) => f.z > 0).map((f) => `${f.x},${f.y}`),
  );

  return (
    <group
      position={[-(GRID_SIZE * TILE_SIZE) / 2, 0, -(GRID_SIZE * TILE_SIZE) / 2]}
    >
      {/* Floor */}
      <mesh
        receiveShadow
        position={[
          (GRID_SIZE * TILE_SIZE) / 2,
          -0.1,
          (GRID_SIZE * TILE_SIZE) / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE]} />
        <meshStandardMaterial color="#e4e4e7" />
      </mesh>

      {/* Grid Tiles */}
      {Array.from({ length: GRID_SIZE }).map((_, y) =>
        Array.from({ length: GRID_SIZE }).map((_, x) => {
          const isOccupied = floorOccupied.has(`${x},${y}`);
          const isBallerinaTarget =
            gameState.ballerina.targetX === x &&
            gameState.ballerina.targetY === y;
          const isHighlight =
            selectedItem && !isOrnament && !isOccupied && !isBallerinaTarget;

          return (
            <mesh
              key={`floor-${x}-${y}`}
              position={[
                x * TILE_SIZE + TILE_SIZE / 2,
                0.01,
                y * TILE_SIZE + TILE_SIZE / 2,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (isHighlight) onPlace(x, y, 0);
              }}
              onPointerOver={(e) => {
                if (isHighlight) {
                  e.stopPropagation();
                  document.body.style.cursor = "pointer";
                }
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
              <meshBasicMaterial
                color={isHighlight ? "#6366f1" : "#d4d4d8"}
                transparent
                opacity={isHighlight ? 0.4 : 0.1}
              />
            </mesh>
          );
        }),
      )}

      {/* Furniture */}
      {gameState.furniture.map((f) => {
        const isTable = f.type === "table";
        const hasOrnament = surfaceOccupied.has(`${f.x},${f.y}`);
        const isHighlight =
          selectedItem && isOrnament && isTable && !hasOrnament;

        return (
          <group
            key={f.id}
            position={[
              f.x * TILE_SIZE + TILE_SIZE / 2,
              f.z === 0 ? 0 : 1,
              f.y * TILE_SIZE + TILE_SIZE / 2,
            ]}
          >
            <FurnitureModel type={f.type} />

            {/* Surface Highlight for Ornaments */}
            {isTable && (
              <mesh
                position={[0, 1.05, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isHighlight) onPlace(f.x, f.y, 1);
                }}
                onPointerOver={(e) => {
                  if (isHighlight) {
                    e.stopPropagation();
                    document.body.style.cursor = "pointer";
                  }
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <planeGeometry args={[TILE_SIZE * 0.8, TILE_SIZE * 0.8]} />
                <meshBasicMaterial
                  color="#f59e0b"
                  transparent
                  opacity={isHighlight ? 0.6 : 0}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Ballerina */}
      <BallerinaModel ballerina={gameState.ballerina} />

      {/* Dynamic Walls */}
      <DynamicWalls />
    </group>
  );
}

function FurnitureModel({ type }: { type: ItemType }) {
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

function BallerinaModel({ ballerina }: { ballerina: Ballerina }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Interpolate position
    const targetX = ballerina.targetX * TILE_SIZE + TILE_SIZE / 2;
    const targetZ = ballerina.targetY * TILE_SIZE + TILE_SIZE / 2;

    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      5 * delta,
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      5 * delta,
    );

    // Look at target if moving
    if (
      Math.abs(targetX - groupRef.current.position.x) > 0.01 ||
      Math.abs(targetZ - groupRef.current.position.z) > 0.01
    ) {
      const angle = Math.atan2(
        targetX - groupRef.current.position.x,
        targetZ - groupRef.current.position.z,
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        angle,
        10 * delta,
      );
    }

    // Dance animation
    if (ballerina.isDancing) {
      groupRef.current.rotation.y += delta * 4;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.1;
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        10 * delta,
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[
        ballerina.x * TILE_SIZE + TILE_SIZE / 2,
        0,
        ballerina.y * TILE_SIZE + TILE_SIZE / 2,
      ]}
    >
      {/* Simple Ballerina Representation */}
      <Cylinder args={[0, 0.3, 0.8]} position={[0, 0.4, 0]} castShadow>
        <meshStandardMaterial color="#fbcfe8" />
      </Cylinder>
      <Sphere args={[0.15]} position={[0, 0.9, 0]} castShadow>
        <meshStandardMaterial color="#fcd34d" />
      </Sphere>
      {/* Arms */}
      <Box args={[0.8, 0.05, 0.05]} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color="#fcd34d" />
      </Box>
    </group>
  );
}

function DynamicWalls() {
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

    if (mat0.current) mat0.current.opacity = newOpacities[0];
    if (mat1.current) mat1.current.opacity = newOpacities[1];
    if (mat2.current) mat2.current.opacity = newOpacities[2];
    if (mat3.current) mat3.current.opacity = newOpacities[3];
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
        />
      </mesh>
    </group>
  );
}
