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
  const [progress, setProgress] = useState(cachedCaptures ? 1 : 0);
  const [currentItem, setCurrentItem] = useState<{
    label: string;
    current: number;
    total: number;
  } | null>(null);

  // If cache hit: notify parent on mount, no CaptureManager needed
  useEffect(() => {
    if (cachedCaptures) {
      onLoadingComplete(cachedCaptures);
    }
  }, [cachedCaptures, onLoadingComplete]);

  const handleComplete = useCallback(
    (captures: Record<string, string>) => {
      writeCache(captures);
      onLoadingComplete(captures);
    },
    [onLoadingComplete]
  );

  const handleCurrentItem = useCallback((label: string, current: number, total: number) => {
    setCurrentItem({ label, current, total });
  }, []);

  const done = progress >= 1;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 font-sans text-white">
      <div className="w-72">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">
            Home Decorator
          </h1>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: cachedCaptures ? 1 : 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          />
        </div>

        <div className="mt-3 flex flex-col gap-1">
          {done ? (
            <p className="text-sm text-zinc-400 text-center">
              {cachedCaptures ? 'Loaded from cache' : 'Ready'}
            </p>
          ) : currentItem ? (
            <>
              <p className="text-xs text-zinc-500 uppercase tracking-widest text-center">
                Rendering variant previews
              </p>
              <p className="text-sm font-medium text-zinc-300 text-center capitalize">
                {currentItem.label}
                <span className="ml-2 font-mono text-xs text-zinc-600">
                  {currentItem.current} / {currentItem.total}
                </span>
              </p>
            </>
          ) : (
            <p className="text-xs text-zinc-600 text-center uppercase tracking-widest">
              Initializing…
            </p>
          )}
        </div>
      </div>

      {!cachedCaptures && (
        <CaptureManager
          onComplete={handleComplete}
          onProgress={setProgress}
          onCurrentItem={handleCurrentItem}
        />
      )}
    </div>
  );
}
