import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { PHASES, EMOTION_EMOJI, type PhaseState } from '../phases';

const BASE_URL = import.meta.env.BASE_URL;

export function VnOverlay({ phaseState, showEmojiBadge = true }: { phaseState: PhaseState; showEmojiBadge?: boolean }) {
  const [imgError, setImgError] = useState<string | null>(null);

  if (!phaseState.vnActive) return null;

  const phase = PHASES[phaseState.currentPhase];
  if (!phase) return null;

  const line = phase.vnDialogue[phaseState.vnLineIndex];
  if (!line) return null;

  const emoji = EMOTION_EMOJI[line.emotion];
  const imgSrc = `${BASE_URL}vn/${line.emotion}.webp`;
  const showImage = imgError !== line.emotion;

  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-end pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Character image */}
      <div className="relative flex-1 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {showImage && (
            <motion.img
              key={`${phaseState.currentPhase}-${phaseState.vnLineIndex}`}
              src={imgSrc}
              alt={line.emotion}
              className="max-h-[40vh] md:max-h-[50vh] w-auto object-contain drop-shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onError={() => setImgError(line.emotion)}
            />
          )}
        </AnimatePresence>
        {!showImage && emoji && (
          <span className="text-8xl md:text-9xl drop-shadow-2xl">{emoji}</span>
        )}
      </div>

      {/* Textbox */}
      <div className="relative w-full max-w-2xl mx-4 mb-52 md:mb-56">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${phaseState.currentPhase}-${phaseState.vnLineIndex}`}
            className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Emotion emoji badge */}
            {showEmojiBadge && emoji && (
              <span className="absolute -top-4 -left-2 text-2xl drop-shadow-md bg-zinc-800 rounded-full w-10 h-10 flex items-center justify-center border border-white/10">
                {emoji}
              </span>
            )}

            {/* Dialogue content */}
            <p className="text-lg md:text-xl text-zinc-100 font-medium leading-relaxed text-center">
              {line.content}
            </p>

            {/* Auto-advance progress bar */}
            <div className="mt-3 h-0.5 w-full bg-zinc-700/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-400/70 rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: line.duration, ease: 'linear' }}
              />
            </div>

            {/* Phase indicator */}
            <p className="mt-2 text-xs text-zinc-500 text-center tracking-wider uppercase">
              {phase.name}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
