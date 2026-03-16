import React from "react";
import { Box } from "@react-three/drei";
import { FurnitureProps } from "../../types";

export function Bed({ localConn, variant, z }: FurnitureProps) {
  const showRailLeft = !localConn.left;
  const showRailRight = !localConn.right;

  const width = 0.9 + (localConn.right ? 0.05 : 0) + (localConn.left ? 0.05 : 0);
  const posX = (localConn.right ? 0.025 : 0) - (localConn.left ? 0.025 : 0);

  const isTopBunk = (z || 0) > 0;

  let frameColor = "#8b5a2b";
  let railColor = "#5c3a21";
  let blanketColor = "#3b82f6";
  if (variant === 1) {
    frameColor = "#475569";
    railColor = "#1e293b";
    blanketColor = "#ec4899";
  } else if (variant === 2) {
    frameColor = "#f8fafc";
    railColor = "#e2e8f0";
    blanketColor = "#10b981";
  } else if (variant === 3) {
    frameColor = "#1e2937";
    railColor = "#0f172a";
    blanketColor = "#f59e0b";
  }

  return (
    <group>
      {/* Main Frame / Mattress */}
      <Box args={[width, 0.4, 1.9]} position={[posX, 0.2, 0.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </Box>
      {/* Base Frame */}
      <Box args={[width + 0.05, 0.15, 2]} position={[posX, 0.075, 0.5]} castShadow receiveShadow>
        <meshStandardMaterial color={frameColor} roughness={0.4} />
      </Box>
      {/* Left Rail */}
      {showRailLeft && (
        <Box args={[0.05, 0.3, 2]} position={[-0.45, 0.25, 0.5]} castShadow receiveShadow>
          <meshStandardMaterial color={railColor} roughness={0.4} />
        </Box>
      )}
      {/* Right Rail */}
      {showRailRight && (
        <Box args={[0.05, 0.3, 2]} position={[0.45, 0.25, 0.5]} castShadow receiveShadow>
          <meshStandardMaterial color={railColor} roughness={0.4} />
        </Box>
      )}
      {/* Head Cushion */}
      <Box args={[0.8, 0.12, 0.4]} position={[posX, 0.41, -0.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
      </Box>
      {/* Headboard */}
      <Box
        args={[width + 0.05, variant === 1 ? 0.6 : 0.8, 0.05]}
        position={[posX, variant === 1 ? 0.3 : 0.4, -0.475]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={railColor} roughness={0.4} />
      </Box>
      {/* Blanket */}
      <Box
        args={[width + (localConn.left || localConn.right ? 0.05 : -0.05), 0.02, 1.2]}
        position={[posX, 0.41, 0.8]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={blanketColor} roughness={0.6} />
      </Box>
      {/* Bunk bed supports (4 corner posts and ladder) */}
      {isTopBunk && (
        <group>
          {/* Four posts extending down to ground level */}
          {/* Front Left */}
          <Box args={[0.08, 1, 0.08]} position={[-0.45, -0.5, -0.45]} castShadow receiveShadow>
            <meshStandardMaterial color="#5c3a21" roughness={0.4} />
          </Box>
          {/* Front Right */}
          <Box args={[0.08, 1, 0.08]} position={[0.45, -0.5, -0.45]} castShadow receiveShadow>
            <meshStandardMaterial color="#5c3a21" roughness={0.4} />
          </Box>
          {/* Back Left (at position 1.45 instead of 0.45 because bed is size 2) */}
          <Box args={[0.08, 1, 0.08]} position={[-0.45, -0.5, 1.45]} castShadow receiveShadow>
            <meshStandardMaterial color="#5c3a21" roughness={0.4} />
          </Box>
          {/* Back Right */}
          <Box args={[0.08, 1, 0.08]} position={[0.45, -0.5, 1.45]} castShadow receiveShadow>
            <meshStandardMaterial color={railColor} roughness={0.4} />
          </Box>
          {/* Ladder on the side (opposite to cushion side) */}
          <group position={[showRailRight ? 0.48 : -0.48, -0.5, 0.9]}>
            <Box args={[0.04, 1, 0.04]} position={[0, 0, -0.2]} castShadow receiveShadow>
              <meshStandardMaterial color={railColor} roughness={0.4} />
            </Box>
            <Box args={[0.04, 1, 0.04]} position={[0, 0, 0.2]} castShadow receiveShadow>
              <meshStandardMaterial color={railColor} roughness={0.4} />
            </Box>
            {/* Steps */}
            {[0, 0.2, 0.4, 0.6, 0.8].map((y, i) => (
              <Box
                key={i}
                args={[0.02, 0.04, 0.4]}
                position={[0, y - 0.45, 0]}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial color={railColor} roughness={0.4} />
              </Box>
            ))}
          </group>
        </group>
      )}
    </group>
  );
}
