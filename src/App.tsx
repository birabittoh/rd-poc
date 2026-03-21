import React, { useCallback, useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, OrbitControls } from '@react-three/drei';
import {
  RotateCcw,
  Sprout,
  Lamp,
  Flower2,
  Table,
  Armchair,
  Book,
  Laptop,
  Tv,
  Library,
  Lightbulb,
  Timer,
  Bed,
  LayoutGrid,
  Square,
  Columns2,
  Coffee,
  X,
  RectangleVertical,
  ScanLine,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GameState, ItemType, ChatMessage } from './types';
import { ITEM_DEFINITIONS } from './items';
import { PlacementPayload, placeFurniture, stepBallerina, createInitialState } from './gameLogic';
import { FurnitureButton } from './components/FurnitureButton';
import { cn } from './utils/cn';
import { Room } from './components/Room';
import { ScrollContainer } from './components/ScrollContainer';
import { VariantPreview } from './components/VariantPreview';
import { LoadingScreen } from './components/LoadingScreen';
import { DoorEntrance } from './components/DoorEntrance';
import { WaitingRoom } from './components/WaitingRoom';
import { motion, AnimatePresence } from 'motion/react';
import { COLORS } from './constants';

const VARIANT_STORAGE_KEY = 'rd-poc:lastVariants';
const USER_ID_KEY = 'rd-poc:userId';

const HAS_WAITING_ROOM = !!import.meta.env.VITE_RELEASE_TIMESTAMP;

function loadSavedVariants(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(VARIANT_STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveVariant(type: ItemType, variant: number) {
  const saved = loadSavedVariants();
  localStorage.setItem(VARIANT_STORAGE_KEY, JSON.stringify({ ...saved, [type]: variant }));
}

const WS_URL = import.meta.env.VITE_APP_URL
  ? import.meta.env.VITE_APP_URL.replace('http', 'ws')
  : `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

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
  mirror: <RectangleVertical />,
  mirror_ornament: <ScanLine />,
  boombox: <Music />,
};

const FLOOR_ITEMS = Object.values(ITEM_DEFINITIONS).filter((d) => d.category === 'floor');
const SURFACE_ITEMS = Object.values(ITEM_DEFINITIONS).filter((d) => d.category === 'surface');

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [placementPath, setPlacementPath] = useState<{ x: number; y: number }[]>([]);
  const [cooldown, setCooldown] = useState(0);
  const [appState, setAppState] = useState<
    'loading' | 'ready' | 'entering' | 'waiting' | 'playing'
  >('loading');
  const [variantCaptures, setVariantCaptures] = useState<Record<string, string>>({});
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Waiting room state
  const [waitingUsers, setWaitingUsers] = useState<{ name: string; online: boolean }[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<{ uuid: string; name: string } | null>(null);
  const [released, setReleased] = useState(false);
  const [releaseTimestamp, setReleaseTimestamp] = useState<string>('');

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWs(socket);

    socket.onopen = () => {
      // Register for waiting room if enabled
      if (HAS_WAITING_ROOM) {
        const savedUuid = localStorage.getItem(USER_ID_KEY);
        socket.send(JSON.stringify({ type: 'register', uuid: savedUuid }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'state') {
        receivedState = true;
        setGameState(data.state);
      } else if (data.type === 'cooldown') {
        setCooldown(data.remaining);
      } else if (data.type === 'registered') {
        localStorage.setItem(USER_ID_KEY, data.uuid);
        setCurrentUser({ uuid: data.uuid, name: data.name });
        setReleaseTimestamp(data.releaseTimestamp);
      } else if (data.type === 'user_list') {
        setWaitingUsers(data.users);
      } else if (data.type === 'chat_broadcast') {
        setChatMessages((prev) => [...prev, data.message]);
      } else if (data.type === 'release') {
        setReleased(true);
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

  // Transition from waiting to playing when released
  useEffect(() => {
    if (released && appState === 'waiting') {
      // Small delay for the fade animation
      const timer = setTimeout(() => {
        setAppState('playing');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [released, appState]);

  // Demo mode: run ballerina loop locally
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setGameState((prev) => (prev ? stepBallerina(prev) : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  // Demo mode: cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handlePlace = (x: number, y: number, z: number, rotationOverride?: number) => {
    if (!selectedItem || gameState?.status !== 'playing' || cooldown > 0) return;

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

        payload = {
          type: selectedItem,
          x: head.x,
          y: head.y,
          z,
          rotation,
          variant: selectedVariant,
        };
      }
    } else {
      payload = { type: selectedItem, x, y, z, variant: selectedVariant };
    }

    if (!payload) return;

    if (payload.variant !== undefined) saveVariant(selectedItem, payload.variant);
    setSelectedItem(null);
    setPlacementPath([]);

    if (isDemoMode) {
      setGameState((prev) => (prev ? (placeFurniture(prev, payload!) ?? prev) : prev));
    } else if (ws) {
      ws.send(JSON.stringify({ type: 'place_furniture', payload }));
    }
  };

  const resetGame = () => {
    if (isDemoMode) {
      setGameState(createInitialState());
    } else if (ws) {
      ws.send(JSON.stringify({ type: 'reset' }));
    }
  };

  const handleLoadingComplete = useCallback((captures: Record<string, string>) => {
    if (captures.sign) setSignUrl(captures.sign);
    setVariantCaptures((prev) => (Object.keys(prev).length > 0 ? prev : captures));
    setAppState((prev) => (prev === 'loading' ? 'ready' : prev));
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : 0.15;
      }
      return next;
    });
  };

  const handleEnter = () => {
    setAppState((prev) => (prev === 'ready' ? 'entering' : prev));
    // Start background music
    const audio = new Audio(`${import.meta.env.BASE_URL}bgm.mp3`);
    audio.loop = true;
    audio.volume = isMuted ? 0 : 0.10;
    audio
      .play()
      .then(() => {
        audioRef.current = audio;
      })
      .catch((err) => {
        console.warn('Audio play failed:', err);
      });

    // Small delay to allow the flash to peak
    setTimeout(() => {
      setAppState((prev) => {
        if (prev !== 'entering') return prev;
        // If waiting room is enabled and not yet released, go to waiting
        if (HAS_WAITING_ROOM && !released) {
          return 'waiting';
        }
        return 'playing';
      });
    }, 100);
  };

  const handleSendMessage = useCallback(
    (messageIndex: number) => {
      if (!ws || !currentUser) return;
      ws.send(JSON.stringify({ type: 'chat', uuid: currentUser.uuid, messageIndex }));
    },
    [ws, currentUser]
  );

  if (appState === 'loading') {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  if (!gameState) {
    return (
      <div
        className="flex h-full items-center justify-center text-white"
        style={{ backgroundColor: COLORS.BACKGROUND }}
      >
        Connecting to server...
      </div>
    );
  }

  const showRoom = appState === 'playing';

  const isOrnament = selectedItem ? ITEM_DEFINITIONS[selectedItem].category === 'surface' : false;
  const isPlacementDisabled = cooldown > 0 || (gameState && gameState.status !== 'playing');

  const surfaceOccupied = new Set(
    gameState.furniture.filter((f) => f.z > 0).map((f) => `${f.x},${f.y}`)
  );
  const hasFreeSurface = gameState.furniture.some(
    (f) =>
      ITEM_DEFINITIONS[f.type].surfaceHeight !== undefined && !surfaceOccupied.has(`${f.x},${f.y}`)
  );

  return (
    <div
      className="relative h-full w-full overflow-hidden font-sans text-zinc-100"
      style={{ backgroundColor: COLORS.BACKGROUND }}
    >
      {/* Mute Button */}
      {appState !== 'loading' && (
        <button
          onClick={toggleMute}
          className="absolute top-4 left-4 z-50 p-2 rounded-xl bg-zinc-800/80 backdrop-blur-md text-zinc-100 border border-white/10 shadow-lg hover:bg-zinc-700/80 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      )}

      {/* 3D Canvas - only rendered when playing */}
      {showRoom && (
        <div className="absolute inset-0">
          <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={[1, 2]}
            gl={{ failIfMajorPerformanceCaveat: false, powerPreference: 'default' }}
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
      )}

      {/* Demo mode badge */}
      {isDemoMode && showRoom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-amber-500/90 backdrop-blur-md text-black font-bold px-4 py-1.5 rounded-full text-sm tracking-widest shadow-lg pointer-events-none select-none">
          DEMO
        </div>
      )}

      {/* UI Overlay - only when playing */}
      {showRoom && <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center pointer-events-none">
        {gameState.status === 'game_over' && (
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

        <div className="bg-zinc-800/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl pointer-events-auto border border-white/10 flex flex-col gap-2 max-w-2xl w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {!selectedItem ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                <ScrollContainer title="Floor">
                  {FLOOR_ITEMS.map((item) => (
                    <FurnitureButton
                      key={item.type}
                      type={item.type}
                      label={item.label}
                      icon={ITEM_ICONS[item.type]}
                      selected={selectedItem === item.type}
                      disabled={isPlacementDisabled}
                      onClick={() => {
                        setSelectedItem(item.type);
                        setSelectedVariant(loadSavedVariants()[item.type] ?? 0);
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
                      label={item.label}
                      icon={ITEM_ICONS[item.type]}
                      selected={selectedItem === item.type}
                      disabled={isPlacementDisabled || !hasFreeSurface}
                      onClick={() => {
                        setSelectedItem(item.type);
                        setSelectedVariant(loadSavedVariants()[item.type] ?? 0);
                        setPlacementPath([]);
                      }}
                      isOrnament
                    />
                  ))}
                </ScrollContainer>
              </motion.div>
            ) : (
              <motion.div
                key="variants"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-1.5 right-1.5 z-20 p-2 rounded-xl bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors border border-white/5 shadow-lg"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <ScrollContainer
                  title={`${ITEM_DEFINITIONS[selectedItem].label ?? selectedItem.replace('_', ' ')}`}
                >
                  {Array.from({ length: ITEM_DEFINITIONS[selectedItem].variants || 1 }).map(
                    (_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={cn(
                          'relative p-1 rounded-xl transition-all duration-300 overflow-hidden ring-2 ring-inset shrink-0 my-1',
                          selectedVariant === i
                            ? 'ring-indigo-500 bg-indigo-500/10 scale-105 shadow-lg shadow-indigo-500/20'
                            : 'ring-white/5 bg-zinc-700/30 hover:bg-zinc-700/50 hover:ring-white/10'
                        )}
                      >
                        <VariantPreview
                          type={selectedItem}
                          variant={i}
                          capture={variantCaptures[`${selectedItem}_${i}`]}
                        />
                        {selectedVariant === i && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
                        )}
                      </button>
                    )
                  )}
                </ScrollContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-4 relative h-6 flex items-center justify-center w-full">
          <p
            className={cn(
              'text-sm text-zinc-400 font-medium tracking-wide transition-opacity duration-300',
              cooldown > 0 ? 'opacity-0' : 'opacity-100'
            )}
          >
            {selectedItem
              ? `Select a ${isOrnament ? 'surface' : 'floor tile'} to place ${ITEM_DEFINITIONS[selectedItem].label ?? selectedItem.replace('_', ' ')}`
              : 'Select an item to place'}
          </p>

          {cooldown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-zinc-800/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-xl flex items-center gap-2">
                <Timer className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="text-sm font-medium">
                  Wait {cooldown}s before placing the next item
                </span>
              </div>
            </div>
          )}
        </div>
      </div>}

      {/* Door entrance overlay */}
      <AnimatePresence>
        {appState === 'ready' && (
          <motion.div
            key="door"
            className="fixed inset-0 z-40"
            exit={{ opacity: 0, scale: 10 }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <DoorEntrance onEnter={handleEnter} signUrl={signUrl ?? '/sign.webp'} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Waiting room overlay */}
      <AnimatePresence>
        {appState === 'waiting' && (
          <motion.div
            key="waiting-room"
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            <WaitingRoom
              users={waitingUsers}
              messages={chatMessages}
              currentUser={currentUser}
              releaseTimestamp={releaseTimestamp}
              onSendMessage={handleSendMessage}
              released={released}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
