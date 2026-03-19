import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureProps } from '../../types';

// Deterministic hue per book using golden ratio, offset per shelf row
const GOLDEN = 137.508;
function getBookColor(shelfI: number, x: number) {
  const hue = (shelfI * 97 + Math.abs(x) * 1000 * GOLDEN) % 360;
  return `hsl(${hue}, 55%, 32%)`;
}

function getBookHeight(shelfI: number, x: number) {
  return 0.2 + (Math.sin(shelfI * 13 + x * 20) * 0.05 + 0.05);
}

export function Library({ localConn, variant }: FurnitureProps) {
  const libWidth = 0.8 + (localConn.right ? 0.1 : 0) + (localConn.left ? 0.1 : 0);
  const libPosX = (localConn.right ? 0.05 : 0) - (localConn.left ? 0.05 : 0);

  const shelfWidth = 0.7 + (localConn.right ? 0.15 : 0) + (localConn.left ? 0.15 : 0);
  const shelfPosX = (localConn.right ? 0.075 : 0) - (localConn.left ? 0.075 : 0);

  let libColor = '#5c3a21';
  let shelfColor = '#8b5a2b';
  if (variant === 1) {
    libColor = '#4a5568';
    shelfColor = '#718096';
  } else if (variant === 2) {
    libColor = '#1f2937';
    shelfColor = '#374151';
  } else if (variant === 3) {
    libColor = '#f8fafc';
    shelfColor = '#e2e8f0';
  }

  const height = 2.2;
  const shelfYs = [0.3, 0.68, 1.06, 1.44, 1.82];

  return (
    <group position={[0, 0, -0.35]}>
      {/* Cabinet body */}
      <Box
        args={[libWidth, height, 0.3]}
        position={[libPosX, height / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={libColor} roughness={0.4} />
      </Box>

      {/* Shelves */}
      {shelfYs.map((y) => (
        <Box
          key={y}
          args={[shelfWidth, 0.05, 0.25]}
          position={[shelfPosX, y, 0.08]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={shelfColor} roughness={0.4} />
        </Box>
      ))}

      {/* Books on each shelf */}
      {shelfYs.map((shelfY, shelfI) => {
        const bookCount = Math.floor(shelfWidth / 0.07); // Pack them tighter
        const bookSpacing = shelfWidth / bookCount;
        const startX = shelfPosX - shelfWidth / 2 + bookSpacing / 2;

        return Array.from({ length: bookCount }).map((_, i) => {
          const x = startX + i * bookSpacing;
          const bookH = getBookHeight(shelfI, x);
          const bookD = 0.18 + (Math.cos(x * 50) * 0.02); // Slight depth variety
          const tilt = Math.sin(x * 120 + shelfI) * 0.1; // Slight lean for "filled" look

          return (
            <Box
              key={`${shelfI}-${i}`}
              args={[bookSpacing - 0.005, bookH, bookD]}
              position={[x, shelfY + 0.025 + bookH / 2, 0.12]}
              rotation={[0, 0, tilt]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color={getBookColor(shelfI, x)} roughness={0.5} />
            </Box>
          );
        });
      })}
    </group>
  );
}
