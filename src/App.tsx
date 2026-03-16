import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import { RotateCcw, Sprout, Lamp, Flower2, Table, Armchair, Book, Laptop, Tv, Library, Lightbulb, Timer, Bed, LayoutGrid, Square, Columns2, Coffee } from "lucide-react";
import { GameState, ItemType } from "./types";
import { ITEM_DEFINITIONS } from "./items";
import { PLACEMENT_COOLDOWN } from "./constants";
import { PlacementPayload, placeFurniture, stepBallerina, createInitialState } from "./gameLogic";
import { FurnitureButton, cn } from "./components/FurnitureButton";
import { Room } from "./components/Room";
import { ScrollContainer } from "./components/ScrollContainer";
import { VariantPreview } from "./components/VariantPreview";

const WS_URL = import.meta.env.VITE_APP_URL
  ? import.meta.env.VITE_APP_URL.replace("http", "ws")
  : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;

const ITEM_ICONS: Record<ItemType, React.ReactNode> = {
  table: <Table />,
  chair: <Armchair />,
  plant: <Sprout />,
  library: <Library />,
  floor_lamp: <Lightbulb />,
  bed: <Bed />,
  laptop: <Laptop />,
  tv: <Tv />,
  vase: <Flower2 />,
  book: <Book />,
  lamp: <Lamp />,
  drawer: <LayoutGrid />,
  bedside_table: <Square />,
  wardrobe: <Columns2 />,
  coffee_table: <Coffee />,
};

const FLOOR_ITEMS = Object.values(ITEM_DEFINITIONS).filter(d => d.category === "floor");
const SURFACE_ITEMS = Object.values(ITEM_DEFINITIONS).filter(d => d.category === "surface");

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [placementPath, setPlacementPath] = useState<{ x: number, y: number }[]>([]);
  const [cooldown, setCooldown] = useState(0);

  // WebSocket connection with demo mode fallback
  useEffect(() => {
    let enteredDemoMode = false;
    let receivedState = false;

    const enterDemoMode = () => {
      if (enteredDemoMode) return;
      enteredDemoMode = true;
      setIsDemoMode(true);
      setGameState(createInitialState());
    };

    const socket = new WebSocket(WS_URL);
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "state") {
        receivedState = true;
        setGameState(data.state);
      } else if (data.type === "cooldown") {
        setCooldown(data.remaining);
      }
    };

    socket.onerror = () => {
      if (!receivedState) enterDemoMode();
    };

    socket.onclose = () => {
      if (!receivedState) enterDemoMode();
    };

    return () => socket.close();
  }, []);

  // Demo mode: run ballerina loop locally
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setGameState(prev => prev ? stepBallerina(prev) : prev);
    }, 2000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  // Demo mode: cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handlePlace = (x: number, y: number, z: number, rotationOverride?: number) => {
    if (!selectedItem || gameState?.status !== "playing" || cooldown > 0) return;

    const def = ITEM_DEFINITIONS[selectedItem];
    let payload: PlacementPayload | null = null;

    if (rotationOverride !== undefined) {
      payload = { type: selectedItem, x, y, z, rotation: rotationOverride };
    } else if (def.size > 1) {
      if (placementPath.length === 0) {
        setPlacementPath([{ x, y }]);
        return;
      } else {
        const head = placementPath[0];
        const dx = x - head.x;
        const dy = y - head.y;

        if (Math.abs(dx) + Math.abs(dy) !== 1) return;

        let rotation = 0;
        if (dx === 1) rotation = Math.PI / 2;
        else if (dx === -1) rotation = -Math.PI / 2;
        else if (dy === 1) rotation = 0;
        else if (dy === -1) rotation = Math.PI;

        payload = { type: selectedItem, x: head.x, y: head.y, z, rotation, variant: selectedVariant };
      }
    } else {
      payload = { type: selectedItem, x, y, z, variant: selectedVariant };
    }

    if (!payload) return;

    setSelectedItem(null);
    setPlacementPath([]);

    if (isDemoMode) {
      setGameState(prev => prev ? (placeFurniture(prev, payload!) ?? prev) : prev);
    } else if (ws) {
      ws.send(JSON.stringify({ type: "place_furniture", payload }));
    }
  };

  const resetGame = () => {
    if (isDemoMode) {
      setGameState(createInitialState());
    } else if (ws) {
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
            placementPath={placementPath}
            onPlace={handlePlace}
          />
        </Canvas>
      </div>

      {/* Demo mode badge */}
      {isDemoMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-amber-500/90 backdrop-blur-md text-black font-bold px-4 py-1.5 rounded-full text-sm tracking-widest shadow-lg pointer-events-none select-none">
          DEMO
        </div>
      )}

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

        {selectedItem && ITEM_DEFINITIONS[selectedItem].variants && ITEM_DEFINITIONS[selectedItem].variants! > 1 && (
          <div className="mb-3 bg-zinc-800/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl pointer-events-auto border border-white/10 max-w-2xl w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ScrollContainer title="Select Variant">
              {Array.from({ length: ITEM_DEFINITIONS[selectedItem].variants! }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(i)}
                  className={cn(
                    "relative rounded-xl transition-all duration-300 overflow-hidden ring-2 ring-inset",
                    selectedVariant === i
                      ? "ring-indigo-500 bg-indigo-500/10 scale-110 shadow-lg shadow-indigo-500/20"
                      : "ring-white/5 bg-zinc-700/30 hover:bg-zinc-700/50 hover:ring-white/10"
                  )}
                >
                  <VariantPreview type={selectedItem} variant={i} />
                  {selectedVariant === i && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                  )}
                </button>
              ))}
            </ScrollContainer>
          </div>
        )}

        <div className="bg-zinc-800/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl pointer-events-auto border border-white/10 flex flex-col gap-2 max-w-2xl w-full">
          <ScrollContainer title="Floor">
            {FLOOR_ITEMS.map((item) => (
              <FurnitureButton
                key={item.type}
                type={item.type}
                icon={ITEM_ICONS[item.type]}
                selected={selectedItem === item.type}
                disabled={isPlacementDisabled}
                onClick={() => {
                  setSelectedItem(selectedItem === item.type ? null : item.type);
                  setSelectedVariant(0);
                  setPlacementPath([]);
                }}
              />
            ))}
          </ScrollContainer>

          <ScrollContainer title="Surface">
            {SURFACE_ITEMS.map((item) => (
              <FurnitureButton
                key={item.type}
                type={item.type}
                icon={ITEM_ICONS[item.type]}
                selected={selectedItem === item.type}
                disabled={isPlacementDisabled}
                onClick={() => {
                  setSelectedItem(selectedItem === item.type ? null : item.type);
                  setSelectedVariant(0);
                  setPlacementPath([]);
                }}
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
