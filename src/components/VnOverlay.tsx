import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { PHASES, EMOTION_EMOJI, type PhaseState, type Stats } from '../phases';

const BASE_URL = import.meta.env.BASE_URL;

const STAT_LABELS: (keyof Stats)[] = ['clutter', 'privacy', 'rest', 'fun', 'control'];
const MAX_STAT = 5;
const RADAR_SIZE = 140;
const CENTER = RADAR_SIZE / 2;
const RADIUS = RADAR_SIZE * 0.38;

function getPoint(index: number, _value: number, total: number, r: number): [number, number] {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function RadarChart({ stats }: { stats: Stats }) {
  const n = STAT_LABELS.length;
  const gridLevels = [1, 2, 3, 4, 5];

  const dataPoints = STAT_LABELS.map((key, i) => getPoint(i, stats[key], n, (stats[key] / MAX_STAT) * RADIUS));
  const dataPath = dataPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + 'Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={RADAR_SIZE} height={RADAR_SIZE - 12} viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="overflow-visible" style={{ marginBottom: -10 }}>
        {/* Grid */}
        {gridLevels.map((level) => {
          const pts = STAT_LABELS.map((_, i) => getPoint(i, level, n, (level / MAX_STAT) * RADIUS));
          const path = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + 'Z';
          return <path key={level} d={path} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
        })}
        {/* Axes */}
        {STAT_LABELS.map((_, i) => {
          const [x, y] = getPoint(i, MAX_STAT, n, RADIUS);
          return <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <path d={dataPath} fill="rgba(99,102,241,0.35)" stroke="rgb(129,140,248)" strokeWidth="1.5" strokeLinejoin="round" />
        {/* Labels */}
        {STAT_LABELS.map((key, i) => {
          const [x, y] = getPoint(i, MAX_STAT, n, RADIUS + 14);
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] fill-zinc-400 font-medium uppercase tracking-wide"
              style={{ fontSize: '8px', fill: 'rgb(161,161,170)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              {key}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function VnOverlay({
  phaseState,
  showEmojiBadge = true,
  captures,
}: {
  phaseState: PhaseState;
  showEmojiBadge?: boolean;
  captures?: Record<string, string>;
}) {
  const [imgError, setImgError] = useState<string | null>(null);

  if (!phaseState.vnActive) return null;

  const phase = PHASES[phaseState.currentPhase];
  if (!phase) return null;

  const line = phase.vnDialogue[phaseState.vnLineIndex];
  if (!line) return null;

  const emoji = EMOTION_EMOJI[line.emotion];
  const imgSrc = captures?.[`vn_${line.emotion}`] || `${BASE_URL}vn/${line.emotion}.webp`;
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

      {/* Bottom content area */}
      <div className="relative w-full max-w-4xl px-4 mb-56 md:mb-60 flex flex-col md:flex-row md:items-end gap-4">

        {/* Radar chart — left on desktop, hidden on mobile in this container */}
        <div className="hidden md:block md:mb-0 md:pb-2 shrink-0">
          <div className="bg-zinc-900/70 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
            <RadarChart stats={phase.stats} />
          </div>
        </div>

        {/* Character image + Textbox stacked */}
        <div className="flex flex-col items-center flex-1 min-w-0">
          {/* Mobile-only header with chart and image */}
          <div className="flex md:hidden items-end w-full gap-2">
             {/* Mobile Chart - left */}
             <div className="bg-zinc-900/70 backdrop-blur-sm border border-white/10 rounded-2xl p-1 shrink-0 scale-75 origin-bottom-left">
                <RadarChart stats={phase.stats} />
             </div>
             {/* Mobile Character Image - right */}
             <div className="flex-1 flex justify-center">
               <AnimatePresence mode="wait">
                  {showImage && (
                    <motion.img
                      key={`${phaseState.currentPhase}-${phaseState.vnLineIndex}-mobile`}
                      src={imgSrc}
                      alt={line.emotion}
                      className="max-h-[25vh] w-auto object-contain drop-shadow-2xl"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      onError={() => setImgError(line.emotion)}
                    />
                  )}
               </AnimatePresence>
               {!showImage && emoji && (
                  <span className="text-6xl drop-shadow-2xl">{emoji}</span>
               )}
             </div>
          </div>

          {/* Desktop Character image — directly above textbox */}
          <div className="hidden md:block">
            <AnimatePresence mode="wait">
              {showImage && (
                <motion.img
                  key={`${phaseState.currentPhase}-${phaseState.vnLineIndex}`}
                  src={imgSrc}
                  alt={line.emotion}
                  className="md:max-h-[45vh] w-auto object-contain drop-shadow-2xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onError={() => setImgError(line.emotion)}
                />
              )}
            </AnimatePresence>
            {!showImage && emoji && (
              <span className="md:text-9xl drop-shadow-2xl">{emoji}</span>
            )}
          </div>

          {/* Textbox — no margin between it and the character image above */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${phaseState.currentPhase}-${phaseState.vnLineIndex}`}
              className="relative w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-5 shadow-2xl"
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
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
