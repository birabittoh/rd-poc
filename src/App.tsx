import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import { RotateCcw, Sprout, Lamp, Flower2, Table, Armchair, Book, Laptop, Tv, Library, Lightbulb, Timer } from "lucide-react";
import { GameState, ItemType } from "./types";
import { FurnitureButton, cn } from "./components/FurnitureButton";
import { Room } from "./components/Room";
import { ScrollContainer } from "./components/ScrollContainer";

const WS_URL = import.meta.env.VITE_APP_URL
  ? import.meta.env.VITE_APP_URL.replace("http", "ws")
  : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

const FLOOR_ITEMS: { type: ItemType; icon: React.ReactNode }[] = [
  { type: "table", icon: <Table /> },
  { type: "chair", icon: <Armchair /> },
  { type: "plant", icon: <Sprout /> },
  { type: "library", icon: <Library /> },
  { type: "floor_lamp", icon: <Lightbulb /> },
];

const SURFACE_ITEMS: { type: ItemType; icon: React.ReactNode }[] = [
  { type: "laptop", icon: <Laptop /> },
  { type: "tv", icon: <Tv /> },
  { type: "vase", icon: <Flower2 /> },
  { type: "book", icon: <Book /> },
  { type: "lamp", icon: <Lamp /> },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "state") {
        setGameState(data.state);
      } else if (data.type === "cooldown") {
        setCooldown(data.remaining);
      }
    };

    return () => socket.close();
  }, []);

  const handlePlace = (x: number, y: number, z: number) => {
    if (!ws || !selectedItem || gameState?.status !== "playing" || cooldown > 0) return;

    // Check if placement is valid
    const isOrnament = selectedItem === "lamp" || selectedItem === "vase" || selectedItem === "laptop" || selectedItem === "book" || selectedItem === "tv";
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
      <div className="flex h-full items-center justify-center bg-zinc-900 text-white">
        Connecting to server...
      </div>
    );
  }

  const isOrnament = selectedItem === "lamp" || selectedItem === "vase" || selectedItem === "laptop" || selectedItem === "book" || selectedItem === "tv";

  const isPlacementDisabled = cooldown > 0 || (gameState && gameState.status !== "playing");

  return (
    <div className="relative h-full w-full bg-zinc-900 overflow-hidden font-sans text-zinc-100">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 2]}
          gl={{ failIfMajorPerformanceCaveat: false, powerPreference: "default" }}
        >
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
            selectedItem={isPlacementDisabled ? null : selectedItem}
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

        <div className="bg-zinc-800/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl pointer-events-auto border border-white/10 flex flex-col gap-2 max-w-2xl w-full">
          <ScrollContainer title="Floor">
            {FLOOR_ITEMS.map((item) => (
              <FurnitureButton
                key={item.type}
                type={item.type}
                icon={item.icon}
                selected={selectedItem === item.type}
                disabled={isPlacementDisabled}
                onClick={() =>
                  setSelectedItem(selectedItem === item.type ? null : item.type)
                }
              />
            ))}
          </ScrollContainer>

          <ScrollContainer title="Surface">
            {SURFACE_ITEMS.map((item) => (
              <FurnitureButton
                key={item.type}
                type={item.type}
                icon={item.icon}
                selected={selectedItem === item.type}
                disabled={isPlacementDisabled}
                onClick={() =>
                  setSelectedItem(selectedItem === item.type ? null : item.type)
                }
                isOrnament
              />
            ))}
          </ScrollContainer>
        </div>
        <div className="mt-4 relative h-6 flex items-center justify-center w-full">
          <p className={cn(
            "text-sm text-zinc-400 font-medium tracking-wide transition-opacity duration-300",
            cooldown > 0 ? "opacity-0" : "opacity-100"
          )}>
            {selectedItem
              ? `Select a ${isOrnament ? "surface" : "floor tile"} to place ${selectedItem}`
              : "Select an item to place"}
          </p>

          {cooldown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-zinc-800/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2">
                <Timer className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="text-sm font-medium">Wait {cooldown}s before placing the next item</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
