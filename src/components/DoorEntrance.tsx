import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DoorEntranceProps {
  onEnter: () => void;
}

export function DoorEntrance({ onEnter }: DoorEntranceProps) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(onEnter, 1000);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-zinc-950 text-white font-sans overflow-hidden">
      <AnimatePresence>
        {!isOpening ? (
          <motion.div
            key="door-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 cursor-pointer"
            onClick={handleOpen}
          >
            <div
              className="group relative"
              style={{ perspective: '1200px' }}
            >
              <div className="relative w-48 h-72 rounded-t-full bg-zinc-900 border-4 border-zinc-800 shadow-2xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-24 h-24 text-zinc-700 group-hover:text-indigo-400 transition-colors duration-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                >
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>

                {/* Door handle */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-800 group-hover:bg-indigo-400 transition-colors" />
              </div>

              {/* Hover effect glow */}
              <div className="absolute inset-0 rounded-t-full bg-indigo-500/0 group-hover:bg-indigo-500/5 blur-2xl transition-all duration-700" />
            </div>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-sm font-bold tracking-[0.3em] text-zinc-600 uppercase"
            >
              Click to Enter
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="door-opening"
            className="fixed inset-0 flex items-center justify-center pointer-events-none"
            style={{ perspective: '1200px' }}
          >
            {/* The actual door flipping open */}
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -110, x: -100, scale: 1.1 }}
              transition={{ duration: 1.2, ease: [0.45, 0, 0.55, 1] }}
              className="w-48 h-72 rounded-t-full bg-zinc-900 border-4 border-zinc-800 shadow-2xl flex items-center justify-center origin-left z-20"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-24 h-24 text-indigo-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-400" />
            </motion.div>

            {/* The light spilling from behind the door */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 2, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 bg-white/20 blur-3xl z-10 origin-left"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen flash transition */}
      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
