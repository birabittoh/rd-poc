import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { motion } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { CaptureManager } from './CaptureManager';
import { ITEM_DEFINITIONS } from '../items';
import { COLORS } from '../constants';

interface LoadingScreenProps {
  onLoadingComplete: (captures: Record<string, string>) => void;
}

// Cache key versioned by total variant count — auto-invalidates when items change
const TOTAL_VARIANTS = Object.values(ITEM_DEFINITIONS).reduce(
  (sum, def) => sum + (def.variants || 1),
  0
);
const CACHE_KEY = `hd_captures_v${TOTAL_VARIANTS}`;

function readCache(): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    // Ignore errors when reading cache
  }
  return null;
}

function writeCache(captures: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(captures));
  } catch {
    // Storage full or unavailable — silently skip
  }
}

function ModelPreloader({ onReady }: { onReady: () => void }) {
  useGLTF(`${import.meta.env.BASE_URL}ballerina.glb`);
  useEffect(() => {
    onReady();
  }, [onReady]);
  return null;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [cachedCaptures] = useState<Record<string, string> | null>(readCache);
  const [capturesProgress, setCapturesProgress] = useState(cachedCaptures ? 1 : 0);
  const [assetsProgress, setAssetsProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [captures, setCaptures] = useState<Record<string, string> | null>(cachedCaptures);
  const [logoError, setLogoError] = useState(false);
  const [currentItem, setCurrentItem] = useState<{
    label: string;
    current: number;
    total: number;
  } | null>(null);

  // Preload core assets: ballerina.glb, bgm.mp3 and sign.png
  useEffect(() => {
    const assets = ['ballerina.glb', 'bgm.mp3', 'sign.png'];
    let loadedCount = 0;

    const loadAsset = async (name: string) => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}${name}`);
        if (!response.ok) throw new Error(`Failed to load ${name}`);

        if (name === 'sign.png') {
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          setCaptures((prev) => (prev ? { ...prev, sign: dataUrl } : { sign: dataUrl }));
        } else {
          // Just blob it for caching purposes
          await response.blob();
        }
      } catch (err) {
        console.warn(`Asset preloading failed for ${name}:`, err);
      } finally {
        loadedCount++;
        setAssetsProgress(loadedCount / assets.length);
        if (loadedCount === assets.length) {
          setAssetsLoaded(true);
        }
      }
    };

    assets.forEach(loadAsset);
  }, []);

  // Final completion check
  useEffect(() => {
    if (assetsLoaded && modelReady && capturesDone && captures?.sign) {
      onLoadingComplete(captures);
    }
  }, [assetsLoaded, modelReady, capturesDone, captures, onLoadingComplete]);

  const handleComplete = useCallback(
    (newCaptures: Record<string, string>) => {
      setCaptures((prev) => {
        const merged = { ...newCaptures, ...prev }; // Keep sign from prev if it exists
        writeCache(merged);
        return merged;
      });
    },
    [writeCache]
  );

  const handleCurrentItem = useCallback((label: string, current: number, total: number) => {
    setCurrentItem({ label, current, total });
  }, []);

  const capturesDone = capturesProgress >= 1;

  // Calculate overall progress:
  // If captures are cached (100%), overall progress should be assetsProgress
  // If not cached, it should be weighted average
  const overallProgress = cachedCaptures
    ? assetsProgress
    : assetsProgress * 0.3 + capturesProgress * 0.7;

  const done = assetsLoaded && modelReady && capturesDone;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center font-sans text-white"
      style={{ backgroundColor: COLORS.BACKGROUND }}
    >
      {/* Hidden canvas for model parsing */}
      <div style={{ position: 'absolute', top: -1000, left: -1000, pointerEvents: 'none' }}>
        <Canvas>
          <Suspense fallback={null}>
            <ModelPreloader onReady={() => setModelReady(true)} />
          </Suspense>
        </Canvas>
      </div>
      <div className="w-72">
        <div className="mb-8 text-center flex flex-col items-center h-40 justify-center">
          {!logoError ? (
            <img
              src={`${import.meta.env.BASE_URL}logo.webp`}
              alt="MyRoom logo"
              className="h-40 w-auto opacity-90"
              onError={() => setLogoError(true)}
            />
          ) : (
            <h1 className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">MyRoom</h1>
          )}
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5 min-h-[4rem] justify-center">
          {done ? (
            <p className="text-sm text-zinc-400 text-center">
              {cachedCaptures ? 'Ready (using cached previews)' : 'Ready'}
            </p>
          ) : !assetsLoaded ? (
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                Downloading assets
              </p>
              <p className="text-sm font-medium text-zinc-300">
                {Math.round(assetsProgress * 100)}%
              </p>
            </div>
          ) : !capturesDone ? (
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
                Rendering previews
              </p>
              {currentItem ? (
                <p className="text-sm font-medium text-zinc-300 capitalize">
                  {currentItem.label}
                  <span className="ml-2 font-mono text-xs text-zinc-600">
                    {currentItem.current} / {currentItem.total}
                  </span>
                </p>
              ) : (
                <p className="text-sm font-medium text-zinc-300 animate-pulse">Initializing…</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-600 text-center uppercase tracking-widest animate-pulse">
              Finalizing…
            </p>
          )}
        </div>
      </div>

      {!cachedCaptures && (
        <CaptureManager
          onComplete={handleComplete}
          onProgress={setCapturesProgress}
          onCurrentItem={handleCurrentItem}
        />
      )}
    </div>
  );
}
