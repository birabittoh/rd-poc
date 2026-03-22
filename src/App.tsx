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
  Bed,
  LayoutGrid,
  Square,
  Columns2,
  Coffee,
  X,
  RectangleVertical,
  ScanLine,
  Music,
  Settings,
  ArrowRight,
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
import { COLORS, EMOJI_LIST } from './constants';
import { EmojiParticles, createParticle, Particle } from './components/EmojiParticles';
import { preloadAllSfx, playSfx } from './sfx';
import { sliderToVolume } from './settings';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { SettingsModal } from './components/SettingsModal';
import {
  INITIAL_COINS,
  INITIAL_SPARKLES,
  DEFAULT_UNLOCKED_EMOJIS,
  EMOJI_COIN_REWARDS,
  EMOJI_UNLOCK_COSTS,
  ITEM_COIN_COSTS,
  ITEM_SPARKLE_REWARDS,
  ITEM_MAX_PLACEMENTS,
  ENFORCE_FURNITURE_LIMIT,
} from './economy';

const VARIANT_STORAGE_KEY = 'rd-poc:lastVariants';
const USER_ID_KEY = 'rd-poc:userId';

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

const FLOOR_ITEMS = Object.values(ITEM_DEFINITIONS)
  .filter((d) => d.category === 'floor')
  .sort((a, b) => ITEM_SPARKLE_REWARDS[a.type] - ITEM_SPARKLE_REWARDS[b.type]);
const SURFACE_ITEMS = Object.values(ITEM_DEFINITIONS)
  .filter((d) => d.category === 'surface')
  .sort((a, b) => ITEM_SPARKLE_REWARDS[a.type] - ITEM_SPARKLE_REWARDS[b.type]);

export default function App() {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}

function AppInner() {
  const { settings } = useSettings();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [placementPath, setPlacementPath] = useState<{ x: number; y: number }[]>([]);
  const [appState, setAppState] = useState<
    'loading' | 'ready' | 'entering' | 'waiting' | 'playing'
  >('loading');
  const [variantCaptures, setVariantCaptures] = useState<Record<string, string>>({});
  const [signUrl, setSignUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [menuView, setMenuView] = useState<'purchase' | 'earn'>('earn');
  const [particles, setParticles] = useState<Particle[]>([]);
  const settingsRef = useRef(settings);
  const bottomPanelRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Waiting room state
  const [waitingUsers, setWaitingUsers] = useState<{ name: string; online: boolean }[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUser, setCurrentUser] = useState<{ uuid: string; name: string } | null>(null);
  const [released, setReleased] = useState(false);
  const [releaseTimestamp, setReleaseTimestamp] = useState<string>('');

  // Economy state
  const [coins, setCoins] = useState(INITIAL_COINS);
  const [sparkles, setSparkles] = useState(INITIAL_SPARKLES);
  const [unlockedEmojis, setUnlockedEmojis] = useState<number[]>([...DEFAULT_UNLOCKED_EMOJIS]);
  const [itemPlacements, setItemPlacements] = useState<Record<string, number>>({});
  const [coinPulse, setCoinPulse] = useState(false);
  const [sparklePulse, setSparklePulse] = useState(false);

  // Keep settings ref in sync for use in callbacks
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Sync BGM volume with settings changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.audio.bgmMuted ? 0 : sliderToVolume(settings.audio.bgmVolume);
    }
  }, [settings.audio.bgmMuted, settings.audio.bgmVolume]);

  // Preload SFX audio
  useEffect(() => {
    preloadAllSfx();
  }, []);

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
      setIsDemoMode(false);
      const savedUuid = localStorage.getItem(USER_ID_KEY);
      socket.send(JSON.stringify({ type: 'register', uuid: savedUuid }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'state') {
        receivedState = true;
        setGameState(data.state);
      } else if (data.type === 'registered') {
        localStorage.setItem(USER_ID_KEY, data.uuid);
        setCurrentUser({ uuid: data.uuid, name: data.name });
        setReleaseTimestamp(data.releaseTimestamp);
        setCoins(data.coins ?? INITIAL_COINS);
        setSparkles(data.sparkles ?? INITIAL_SPARKLES);
        setUnlockedEmojis(data.unlockedEmojis ?? [...DEFAULT_UNLOCKED_EMOJIS]);
        setItemPlacements(data.itemPlacements ?? {});
      } else if (data.type === 'currency_update') {
        setCoins(data.coins);
        setSparkles(data.sparkles);
        setUnlockedEmojis(data.unlockedEmojis);
        setItemPlacements(data.itemPlacements ?? {});
        if (data.earned?.coins) {
          setCoinPulse(true);
          setTimeout(() => setCoinPulse(false), 600);
        }
        if (data.earned?.sparkles) {
          setSparklePulse(true);
          setTimeout(() => setSparklePulse(false), 600);
        }
      } else if (data.type === 'user_list') {
        setWaitingUsers(data.users);
      } else if (data.type === 'chat_broadcast') {
        setChatMessages((prev) => [...prev, data.message]);
      } else if (data.type === 'release') {
        setReleased(true);
      } else if (data.type === 'emoji_broadcast') {
        const entry = EMOJI_LIST[data.index];
        if (!entry) return;
        // Spawn particle from fixed receive point (upper-left of bottom panel area)
        const panelEl = document.getElementById('bottom-panel');
        const rx = panelEl ? panelEl.getBoundingClientRect().left + 40 : 80;
        const ry = panelEl ? panelEl.getBoundingClientRect().top + 20 : window.innerHeight - 200;
        setParticles((prev) => [...prev, createParticle(entry.emoji, rx, ry)]);
        if (!settingsRef.current.audio.sfxMuted) {
          playSfx(entry.sfx, sliderToVolume(settingsRef.current.audio.sfxVolume));
        }
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
        // Start background music when transitioning from waiting to playing
        if (!audioRef.current) {
          const audio = new Audio(`${import.meta.env.BASE_URL}bgm.mp3`);
          audio.loop = true;
          audio.volume = settings.audio.bgmMuted ? 0 : sliderToVolume(settings.audio.bgmVolume);
          audio
            .play()
            .then(() => {
              audioRef.current = audio;
            })
            .catch((err) => {
              console.warn('Audio play failed:', err);
            });
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [released, appState, settings.audio.bgmMuted, settings.audio.bgmVolume]);

  // Demo mode: run ballerina loop locally
  useEffect(() => {
    if (!isDemoMode) return;
    const interval = setInterval(() => {
      setGameState((prev) => (prev ? stepBallerina(prev) : prev));
    }, 2000);
    return () => clearInterval(interval);
  }, [isDemoMode]);

  const handlePlace = (x: number, y: number, z: number, rotationOverride?: number) => {
    if (!selectedItem || gameState?.status !== 'playing') return;

    // Check affordability and placement limit
    const itemCost = ITEM_COIN_COSTS[selectedItem];
    if (coins < itemCost) return;
    if (ENFORCE_FURNITURE_LIMIT) {
      const maxP = ITEM_MAX_PLACEMENTS[selectedItem];
      if ((itemPlacements[selectedItem] || 0) >= maxP) return;
    }

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
      const result = placeFurniture(gameState!, payload);
      if (result) {
        setGameState(result);
        // Local economy in demo mode
        setCoins((c) => c - itemCost);
        setCoinPulse(false);
        const sparkleReward = ITEM_SPARKLE_REWARDS[selectedItem];
        setSparkles((s) => s + sparkleReward);
        setItemPlacements((prev) => ({
          ...prev,
          [selectedItem]: (prev[selectedItem] || 0) + 1,
        }));
        setSparklePulse(true);
        setTimeout(() => setSparklePulse(false), 600);
      }
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

  const handleEmojiClick = (index: number, e: React.MouseEvent) => {
    if (!unlockedEmojis.includes(index)) return;
    const entry = EMOJI_LIST[index];
    if (!entry) return;
    // Spawn particle from click position
    const x = e.clientX;
    const y = e.clientY;
    setParticles((prev) => [...prev, createParticle(entry.emoji, x, y)]);
    if (!settings.audio.sfxMuted) {
      playSfx(entry.sfx, sliderToVolume(settings.audio.sfxVolume));
    }
    // Broadcast to server
    if (ws) {
      ws.send(JSON.stringify({ type: 'emoji', index }));
    }
    // Demo mode: local coin reward
    if (isDemoMode) {
      const reward = EMOJI_COIN_REWARDS[index];
      setCoins((c) => c + reward);
      setCoinPulse(true);
      setTimeout(() => setCoinPulse(false), 600);
    }
  };

  const handleEmojiUnlock = (index: number) => {
    if (unlockedEmojis.includes(index)) return;
    const cost = EMOJI_UNLOCK_COSTS[index];
    if (sparkles < cost) return;

    if (isDemoMode) {
      setSparkles((s) => s - cost);
      setUnlockedEmojis((prev) => [...prev, index]);
    } else if (ws) {
      ws.send(JSON.stringify({ type: 'unlock_emoji', index }));
    }
  };

  const handleParticleEnd = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleEnter = () => {
    setAppState((prev) => (prev === 'ready' ? 'entering' : prev));

    // Small delay to allow the flash to peak
    setTimeout(() => {
      setAppState((prev) => {
        if (prev !== 'entering') return prev;
        // If waiting room is enabled and not yet released, go to waiting
        // In demo mode, the waiting room is always skipped
        const hasWaitingRoom = !!releaseTimestamp && !isDemoMode;
        if (hasWaitingRoom && !released) {
          return 'waiting';
        }

        // Start background music if we're going straight to playing
        if (!audioRef.current) {
          const audio = new Audio(`${import.meta.env.BASE_URL}bgm.mp3`);
          audio.loop = true;
          audio.volume = settings.audio.bgmMuted ? 0 : sliderToVolume(settings.audio.bgmVolume);
          audio
            .play()
            .then(() => {
              audioRef.current = audio;
            })
            .catch((err) => {
              console.warn('Audio play failed:', err);
            });
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
  const isPlacementDisabled = gameState && gameState.status !== 'playing';

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
      {/* Settings Button */}
      {appState !== 'waiting' && (
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-zinc-800/80 backdrop-blur-md text-zinc-100 border border-white/10 shadow-lg hover:bg-zinc-700/80 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Currency HUD - top right */}
      {showRoom && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <div
            className={cn(
              'flex items-center gap-1.5 bg-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg transition-all duration-300',
              sparklePulse && 'ring-2 ring-yellow-400/50 shadow-yellow-400/20'
            )}
          >
            <span
              className={cn(
                'text-lg transition-transform duration-300',
                sparklePulse && 'scale-125'
              )}
            >
              ✨
            </span>
            <span className="text-sm font-bold text-zinc-100 tabular-nums">{sparkles}</span>
          </div>
          <div
            className={cn(
              'flex items-center gap-1.5 bg-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg transition-all duration-300',
              coinPulse && 'ring-2 ring-amber-400/50 shadow-amber-400/20'
            )}
          >
            <span
              className={cn(
                'text-lg transition-transform duration-300',
                coinPulse && 'scale-125'
              )}
            >
              🪙
            </span>
            <span className="text-sm font-bold text-zinc-100 tabular-nums">{coins}</span>
          </div>
        </div>
      )}

      {/* 3D Canvas - only rendered when playing */}
      {showRoom && (
        <div className="absolute inset-0">
          <Canvas
            key={`${settings.video.antialiasing}`}
            shadows={settings.video.shadows ? { type: settings.video.highQualityShadows ? THREE.PCFShadowMap : THREE.BasicShadowMap } : false}
            dpr={settings.video.highResolution ? [1, 2] : [1, 1]}
            gl={{ failIfMajorPerformanceCaveat: false, powerPreference: 'default', antialias: settings.video.antialiasing }}
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
              castShadow={settings.video.shadows}
              shadow-mapSize={settings.video.highQualityShadows ? [2048, 2048] : [512, 512]}
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

      {/* Emoji Particles Overlay */}
      <EmojiParticles particles={particles} onParticleEnd={handleParticleEnd} />

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

        <div id="bottom-panel" ref={bottomPanelRef} className="bg-zinc-800/80 backdrop-blur-xl p-3 rounded-2xl shadow-2xl pointer-events-auto border border-white/10 flex flex-col gap-2 max-w-2xl w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Purchase menu - furniture lists */}
            {menuView === 'purchase' && !selectedItem && (
              <motion.div
                key="purchase-menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2 relative"
              >
                <button
                  onClick={() => setMenuView('earn')}
                  className="absolute top-1.5 right-1.5 z-20 p-2 rounded-xl bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors border border-white/5 shadow-lg"
                  aria-label="Back to Earn"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                <ScrollContainer title="Floor">
                  {FLOOR_ITEMS.map((item) => {
                    const placed = itemPlacements[item.type] || 0;
                    const maxP = ITEM_MAX_PLACEMENTS[item.type];
                    const maxedOut = ENFORCE_FURNITURE_LIMIT && placed >= maxP;
                    return (
                      <FurnitureButton
                        key={item.type}
                        type={item.type}
                        label={item.label}
                        icon={ITEM_ICONS[item.type]}
                        selected={selectedItem === item.type}
                        disabled={isPlacementDisabled || maxedOut}
                        onClick={() => {
                          if (maxedOut || coins < ITEM_COIN_COSTS[item.type]) return;
                          setSelectedItem(item.type);
                          setSelectedVariant(loadSavedVariants()[item.type] ?? 0);
                          setPlacementPath([]);
                        }}
                        price={ITEM_COIN_COSTS[item.type]}
                        affordable={coins >= ITEM_COIN_COSTS[item.type]}
                        remaining={ENFORCE_FURNITURE_LIMIT ? maxP - placed : undefined}
                        max={ENFORCE_FURNITURE_LIMIT ? maxP : undefined}
                        sparkleReward={ITEM_SPARKLE_REWARDS[item.type]}
                      />
                    );
                  })}
                </ScrollContainer>

                <ScrollContainer title="Surface">
                  {SURFACE_ITEMS.map((item) => {
                    const placed = itemPlacements[item.type] || 0;
                    const maxP = ITEM_MAX_PLACEMENTS[item.type];
                    const maxedOut = ENFORCE_FURNITURE_LIMIT && placed >= maxP;
                    return (
                      <FurnitureButton
                        key={item.type}
                        type={item.type}
                        label={item.label}
                        icon={ITEM_ICONS[item.type]}
                        selected={selectedItem === item.type}
                        disabled={isPlacementDisabled || !hasFreeSurface || maxedOut}
                        onClick={() => {
                          if (maxedOut || coins < ITEM_COIN_COSTS[item.type]) return;
                          setSelectedItem(item.type);
                          setSelectedVariant(loadSavedVariants()[item.type] ?? 0);
                          setPlacementPath([]);
                        }}
                        isOrnament
                        price={ITEM_COIN_COSTS[item.type]}
                        affordable={coins >= ITEM_COIN_COSTS[item.type]}
                        remaining={ENFORCE_FURNITURE_LIMIT ? maxP - placed : undefined}
                        max={ENFORCE_FURNITURE_LIMIT ? maxP : undefined}
                        sparkleReward={ITEM_SPARKLE_REWARDS[item.type]}
                      />
                    );
                  })}
                </ScrollContainer>
              </motion.div>
            )}

            {/* Variant picker (from purchase) */}
            {selectedItem && (
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

            {/* Earn menu - emoji buttons */}
            {menuView === 'earn' && !selectedItem && (
              <motion.div
                key="earn-menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <button
                  onClick={() => setMenuView('purchase')}
                  className="absolute top-1.5 right-1.5 z-20 p-2 rounded-xl bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors border border-white/5 shadow-lg"
                  aria-label="Go to Purchase"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                <ScrollContainer title="Earn">
                  {EMOJI_LIST.map((entry, i) => {
                    const isUnlocked = unlockedEmojis.includes(i);
                    const unlockCost = EMOJI_UNLOCK_COSTS[i];
                    const canAffordUnlock = sparkles >= unlockCost;
                    const coinReward = EMOJI_COIN_REWARDS[i];

                    return (
                      <button
                        key={i}
                        onClick={(e) => {
                          if (isUnlocked) {
                            handleEmojiClick(i, e);
                          } else {
                            handleEmojiUnlock(i);
                          }
                        }}
                        className={cn(
                          'relative p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 min-w-[64px] shrink-0',
                          isUnlocked
                            ? 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-600 hover:text-white active:scale-95'
                            : canAffordUnlock
                              ? 'bg-zinc-700/30 text-zinc-400 hover:bg-zinc-600/50 hover:text-zinc-200 border border-dashed border-yellow-500/30'
                              : 'bg-zinc-800/50 text-zinc-500 opacity-60'
                        )}
                      >
                        <span className="text-xl relative">
                          {entry.emoji}
                          {!isUnlocked && (
                            <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                          )}
                        </span>
                        <span className="text-[10px] font-medium capitalize">{entry.sfx}</span>
                        {isUnlocked ? (
                          <span className="text-[9px] font-bold text-amber-400">
                            +{coinReward} 🪙
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'text-[9px] font-bold',
                              canAffordUnlock ? 'text-yellow-400' : 'text-zinc-500'
                            )}
                          >
                            {unlockCost} ✨
                          </span>
                        )}
                      </button>
                    );
                  })}
                </ScrollContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="mt-4 relative h-6 flex items-center justify-center w-full">
          <p className="text-sm text-zinc-400 font-medium tracking-wide">
            {selectedItem
              ? `Select a ${isOrnament ? 'surface' : 'floor tile'} to place ${ITEM_DEFINITIONS[selectedItem].label ?? selectedItem.replace('_', ' ')}`
              : menuView === 'earn'
                ? 'Tap an emoji to earn coins'
                : 'Select an item to place'}
          </p>
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

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
