import React, { useEffect, useRef, useState } from 'react';

export interface Particle {
  id: string;
  emoji: string;
  x: number;
  y: number;
  drift: number;
  duration: number;
  wobbleAmp: number;
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
    const timer = setTimeout(onEnd, particle.duration * 1000);
    return () => clearTimeout(timer);
  }, [particle.duration, onEnd]);

  return (
    <span
      ref={ref}
      className="absolute pointer-events-none select-none text-2xl"
      style={{
        left: particle.x,
        top: particle.y,
        '--drift': `${particle.drift}px`,
        '--wobble-amp': `${particle.wobbleAmp}px`,
        '--float-duration': `${particle.duration}s`,
        animation: `emoji-float var(--float-duration) ease-out forwards, emoji-wobble var(--float-duration) ease-in-out forwards`,
      } as React.CSSProperties}
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
