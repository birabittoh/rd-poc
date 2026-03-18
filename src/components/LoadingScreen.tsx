import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CaptureManager } from './CaptureManager';

interface LoadingScreenProps {
  onLoadingComplete: (captures: Record<string, string>) => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-900 font-sans text-white">
      <div className="w-64">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold tracking-widest text-indigo-500 uppercase">
            Home Decorator
          </h1>
          <p className="text-sm text-zinc-500">Preparing assets & variants</p>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </div>

        <div className="mt-2 text-right text-xs font-mono text-zinc-600">
          {Math.round(progress * 100)}%
        </div>
      </div>

      <CaptureManager onComplete={onLoadingComplete} onProgress={setProgress} />
    </div>
  );
}
