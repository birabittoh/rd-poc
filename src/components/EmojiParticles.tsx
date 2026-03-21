import React, { useEffect, useRef } from 'react';

export interface Particle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  drift: number;
  duration: number;
  wobbleAmp: number;
  wobbleFreq: number;
  phase: number;
}

interface EmojiParticlesProps {
  particles: Particle[];
  onParticleEnd: (id: string) => void;
}

let nextId = 0;
export function createParticle(emoji: string, x: number, y: number): Particle {
  return {
    id: `p-${nextId++}-${Date.now()}`,
    emoji,
    x,
    y,
    drift: (Math.random() - 0.5) * 50,
    duration: 3.5 + Math.random() * 1.5,
    wobbleAmp: 8 + Math.random() * 15,
    wobbleFreq: 1 + Math.random() * 1.5, // 1–2.5 full cycles
    phase: Math.random() * Math.PI * 2, // random start phase
  };
}

function ParticleSpan({
  particle,
  onEnd,
}: {
  particle: Particle;
  onEnd: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { duration, phase, wobbleFreq, wobbleAmp, drift } = particle;
    // Measure emoji size to center it on the spawn point
    const halfW = el.offsetWidth / 2;
    const halfH = el.offsetHeight / 2;
    // Initial wobble offset so first frame starts at (0,0) visually
    const initialWobbleX = Math.sin(phase) * wobbleAmp;
    const start = performance.now();
    const durationMs = duration * 1000;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);

      // Vertical: linear rise (travel 40% of viewport height max)
      const y = -t * window.innerHeight * 0.4;
      // Horizontal: sine wobble (subtract initial offset so it starts at 0) + linear drift
      const wobbleX =
        Math.sin(phase + t * wobbleFreq * Math.PI * 2) * wobbleAmp - initialWobbleX;
      const driftX = t * drift;
      // Opacity: fully visible until 40%, then fade out
      const opacity = t > 0.4 ? 1 - (t - 0.4) / 0.6 : 1;

      el.style.transform = `translate(${wobbleX + driftX - halfW}px, ${y - halfH}px)`;
      el.style.opacity = String(opacity);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onEndRef.current();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      ref={ref}
      className="absolute pointer-events-none select-none text-2xl"
      style={{
        left: particle.x,
        top: particle.y,
      }}
    >
      {particle.emoji}
    </span>
  );
}

export function EmojiParticles({ particles, onParticleEnd }: EmojiParticlesProps) {
  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <ParticleSpan key={p.id} particle={p} onEnd={() => onParticleEnd(p.id)} />
      ))}
    </div>
  );
}
