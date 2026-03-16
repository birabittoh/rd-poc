import React from "react";
import { Box, Cylinder } from "@react-three/drei";
import { FurnitureProps } from "../../types";

export function Chair({ localConn, variant }: FurnitureProps) {
  const seatWidth =
    0.6 + (localConn.right ? 0.2 : 0) + (localConn.left ? 0.2 : 0);
  const seatDepth =
    0.6 + (localConn.bottom ? 0.2 : 0) + (localConn.top ? 0.2 : 0);
  const seatPosX = (localConn.right ? 0.1 : 0) - (localConn.left ? 0.1 : 0);
  const seatPosZ = (localConn.bottom ? 0.1 : 0) - (localConn.top ? 0.1 : 0);

  const backWidth =
    0.6 + (localConn.right ? 0.2 : 0) + (localConn.left ? 0.2 : 0);
  const backPosX = (localConn.right ? 0.1 : 0) - (localConn.left ? 0.1 : 0);

  const showTopLeft = !localConn.left && !localConn.top;
  const showTopRight = !localConn.right && !localConn.top;
  const showBottomLeft = !localConn.left && !localConn.bottom;
  const showBottomRight = !localConn.right && !localConn.bottom;

  let chairColor = "#a0522d";
  let legColor = "#5c3a21";
  if (variant === 1) {
    chairColor = "#3b82f6";
    legColor = "#1e40af";
  } else if (variant === 2) {
    chairColor = "#ef4444";
    legColor = "#991b1b";
  } else if (variant === 3) {
    chairColor = "#10b981";
    legColor = "#065f46";
  }

  const isTall = variant === 1 || variant === 2;

  if (variant === 4 || variant === 5 || variant === 6 || variant === 7) {
    // Armchair / sofa variant — armrests hide on connected sides to form a couch
    const sofaWidth =
      0.8 + (localConn.right ? 0.2 : 0) + (localConn.left ? 0.2 : 0);
    const sofaPosX = (localConn.right ? 0.1 : 0) - (localConn.left ? 0.1 : 0);
    const leftArmX = sofaPosX - sofaWidth / 2 + 0.06;
    const rightArmX = sofaPosX + sofaWidth / 2 - 0.06;

    // variant 4: camel, 5: slate blue, 6: terracotta, 7: green
    let fabricColor = "#b89268";
    let sofaDark = "#7a5c38";
    if (variant === 5) {
      fabricColor = "#7b9eb5";
      sofaDark = "#4a6f8a";
    } else if (variant === 6) {
      fabricColor = "#c4714a";
      sofaDark = "#8b4a2e";
    } else if (variant === 7) {
      fabricColor = "#6abf7a";
      sofaDark = "#2e7d45";
    }
    const legCol = "#3d2210";

    return (
      <group>
        {/* Base */}
        <Box
          args={[sofaWidth, 0.32, 0.72]}
          position={[sofaPosX, 0.16, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={sofaDark} roughness={0.6} />
        </Box>
        {/* Seat cushion */}
        <Box
          args={[sofaWidth - 0.05, 0.13, 0.62]}
          position={[sofaPosX, 0.385, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={fabricColor} roughness={0.8} />
        </Box>
        {/* Back rest */}
        <Box
          args={[sofaWidth, 0.5, 0.15]}
          position={[sofaPosX, 0.62, -0.285]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={sofaDark} roughness={0.6} />
        </Box>
        {/* Back cushion */}
        <Box
          args={[sofaWidth - 0.05, 0.44, 0.09]}
          position={[sofaPosX, 0.63, -0.26]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={fabricColor} roughness={0.8} />
        </Box>
        {/* Left armrest */}
        {!localConn.left && (
          <Box
            args={[0.12, 0.22, 0.68]}
            position={[leftArmX, 0.44, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={sofaDark} roughness={0.6} />
          </Box>
        )}
        {/* Right armrest */}
        {!localConn.right && (
          <Box
            args={[0.12, 0.22, 0.68]}
            position={[rightArmX, 0.44, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={sofaDark} roughness={0.6} />
          </Box>
        )}
        {/* Front-left leg */}
        {!localConn.left && (
          <Box
            args={[0.07, 0.16, 0.07]}
            position={[sofaPosX - sofaWidth / 2 + 0.1, 0.08, 0.28]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={legCol} roughness={0.4} />
          </Box>
        )}
        {/* Front-right leg */}
        {!localConn.right && (
          <Box
            args={[0.07, 0.16, 0.07]}
            position={[sofaPosX + sofaWidth / 2 - 0.1, 0.08, 0.28]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={legCol} roughness={0.4} />
          </Box>
        )}
        {/* Back-left leg */}
        {!localConn.left && (
          <Box
            args={[0.07, 0.16, 0.07]}
            position={[sofaPosX - sofaWidth / 2 + 0.1, 0.08, -0.22]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={legCol} roughness={0.4} />
          </Box>
        )}
        {/* Back-right leg */}
        {!localConn.right && (
          <Box
            args={[0.07, 0.16, 0.07]}
            position={[sofaPosX + sofaWidth / 2 - 0.1, 0.08, -0.22]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={legCol} roughness={0.4} />
          </Box>
        )}
      </group>
    );
  }

  return (
    <group>
      <Box
        args={[seatWidth, 0.1, seatDepth]}
        position={[seatPosX, 0.5, seatPosZ]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={chairColor} roughness={0.4} />
      </Box>
      <Box
        args={[backWidth, isTall ? 0.8 : 0.6, 0.1]}
        position={[backPosX, isTall ? 0.9 : 0.8, -0.25]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={chairColor} roughness={0.4} />
      </Box>
      {showTopLeft && (
        <Cylinder
          args={[0.04, 0.04, 0.5]}
          position={[-0.25, 0.25, -0.25]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={legColor} roughness={0.4} />
        </Cylinder>
      )}
      {showTopRight && (
        <Cylinder
          args={[0.04, 0.04, 0.5]}
          position={[0.25, 0.25, -0.25]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={legColor} roughness={0.4} />
        </Cylinder>
      )}
      {showBottomLeft && (
        <Cylinder
          args={[0.04, 0.04, 0.5]}
          position={[-0.25, 0.25, 0.25]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={legColor} roughness={0.4} />
        </Cylinder>
      )}
      {showBottomRight && (
        <Cylinder
          args={[0.04, 0.04, 0.5]}
          position={[0.25, 0.25, 0.25]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={legColor} roughness={0.4} />
        </Cylinder>
      )}
    </group>
  );
}
