import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import { RotateCcw, Sprout, Lamp, Flower2, Table, Armchair, Book, Laptop, Tv, Library, Lightbulb } from "lucide-react";
import { GameState, ItemType } from "./types";
import { FurnitureButton } from "./components/FurnitureButton";
import { Room } from "./components/Room";
import { ScrollContainer } from "./components/ScrollContainer";

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

        <div className="bg-zinc-800/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl pointer-events-auto border border-white/10 flex flex-col gap-2 max-w-2xl w-full">
          <ScrollContainer title="Floor">
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
              icon={<Sprout />}
              selected={selectedItem === "plant"}
              onClick={() =>
                setSelectedItem(selectedItem === "plant" ? null : "plant")
              }
            />
            <FurnitureButton
              type="library"
              icon={<Library />}
              selected={selectedItem === "library"}
              onClick={() =>
                setSelectedItem(selectedItem === "library" ? null : "library")
              }
            />
            <FurnitureButton
              type="floor_lamp"
              icon={<Lightbulb />}
              selected={selectedItem === "floor_lamp"}
              onClick={() =>
                setSelectedItem(selectedItem === "floor_lamp" ? null : "floor_lamp")
              }
            />
          </ScrollContainer>

          <ScrollContainer title="Surface">
            <FurnitureButton
              type="laptop"
              icon={<Laptop />}
              selected={selectedItem === "laptop"}
              onClick={() =>
                setSelectedItem(selectedItem === "laptop" ? null : "laptop")
              }
              isOrnament
            />
            <FurnitureButton
              type="tv"
              icon={<Tv />}
              selected={selectedItem === "tv"}
              onClick={() =>
                setSelectedItem(selectedItem === "tv" ? null : "tv")
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
            <FurnitureButton
              type="book"
              icon={<Book />}
              selected={selectedItem === "book"}
              onClick={() =>
                setSelectedItem(selectedItem === "book" ? null : "book")
              }
              isOrnament
            />
            <FurnitureButton
              type="lamp"
              icon={<Lamp />}
              selected={selectedItem === "lamp"}
              onClick={() =>
                setSelectedItem(selectedItem === "lamp" ? null : "lamp")
              }
              isOrnament
            />
          </ScrollContainer>
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
