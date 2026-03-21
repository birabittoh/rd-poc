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
    drift: (Math.random() - 0.5) * 120,
    duration: 2.5 + Math.random() * 1.5,
    wobbleAmp: 15 + Math.random() * 40,
    wobbleFreq: 1.5 + Math.random() * 3, // 1.5–4.5 full cycles
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    const durationMs = particle.duration * 1000;
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);

      // Vertical: ease-out rise
      const y = -t * window.innerHeight;
      // Horizontal: sine wobble + linear drift
      const wobbleX =
        Math.sin(particle.phase + t * particle.wobbleFreq * Math.PI * 2) *
        particle.wobbleAmp;
      const driftX = t * particle.drift;
      // Opacity: fully visible until 70%, then fade
      const opacity = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;

      el.style.transform = `translate(${wobbleX + driftX}px, ${y}px)`;
      el.style.opacity = String(opacity);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        onEnd();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [particle, onEnd]);

  return (
    <span
      ref={ref}
      className="absolute pointer-events-none select-none text-2xl -translate-x-1/2"
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
