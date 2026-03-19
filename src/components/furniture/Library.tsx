import React from 'react';
import { Box } from '@react-three/drei';
import { FurnitureProps } from '../../types';

const BOOKS = [
  // [xOffset, height, depth]
  [-0.28, 0.24, 0.18],
  [-0.18, 0.22, 0.18],
  [-0.08, 0.26, 0.18],
  [0.02, 0.2, 0.18],
  [0.12, 0.23, 0.18],
  [0.22, 0.21, 0.18],
  [0.3, 0.25, 0.18],
];

// Deterministic hue per book using golden ratio, offset per shelf row
const GOLDEN = 137.508;
function bookColor(shelfI: number, bookI: number) {
  const hue = (shelfI * 97 + bookI * GOLDEN) % 360;
  return `hsl(${hue}, 55%, 32%)`;
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
      {shelfYs.map((shelfY, shelfI) =>
        BOOKS.map(([xOff, bookH, bookD], i) => (
          <Box
            key={`${shelfI}-${i}`}
            args={[0.075, bookH, bookD]}
            position={[xOff, shelfY + 0.025 + bookH / 2, 0.12]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={bookColor(shelfI, i)} roughness={0.5} />
          </Box>
        ))
      )}
    </group>
  );
}
