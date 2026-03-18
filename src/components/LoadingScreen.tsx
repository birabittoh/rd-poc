import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { CaptureManager } from './CaptureManager';
import { ITEM_DEFINITIONS } from '../items';

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
  } catch {}
  return null;
}

function writeCache(captures: Record<string, string>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(captures));
  } catch {
    // Storage full or unavailable — silently skip
  }
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [cachedCaptures] = useState<Record<string, string> | null>(readCache);
  const [capturesProgress, setCapturesProgress] = useState(cachedCaptures ? 1 : 0);
  const [assetsProgress, setAssetsProgress] = useState(0);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [captures, setCaptures] = useState<Record<string, string> | null>(cachedCaptures);
  const [logoError, setLogoError] = useState(false);
  const [currentItem, setCurrentItem] = useState<{
    label: string;
    current: number;
    total: number;
  } | null>(null);

  // Preload core assets: ballerina.glb and bgm.mp3
  useEffect(() => {
    const assets = ['ballerina.glb', 'bgm.mp3'];
    let loadedCount = 0;

    const loadAsset = async (name: string) => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}${name}`);
        if (!response.ok) throw new Error(`Failed to load ${name}`);
        // We don't need to do anything with the blob, the browser will cache it
        await response.blob();
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
    if (assetsLoaded && captures) {
      onLoadingComplete(captures);
    }
  }, [assetsLoaded, captures, onLoadingComplete]);

  const handleComplete = useCallback((newCaptures: Record<string, string>) => {
    writeCache(newCaptures);
    setCaptures(newCaptures);
  }, []);

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

  const done = assetsLoaded && capturesDone;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 font-sans text-white">
      <div className="w-72">
        <div className="mb-8 text-center flex flex-col items-center">
          {!logoError ? (
            <img
              src={`${import.meta.env.BASE_URL}logo.webp`}
              alt="My Room"
              className="h-12 w-auto mb-2 opacity-90"
              onError={() => setLogoError(true)}
            />
          ) : (
            <h1 className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">
              Home Decorator
            </h1>
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
