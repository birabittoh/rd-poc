import React from "react";
import { GameState, ItemType } from "../types";
import { GRID_SIZE, TILE_SIZE } from "../constants";
import { FurnitureModel } from "./FurnitureModel";
import { BallerinaModel } from "./BallerinaModel";
import { DynamicWalls } from "./DynamicWalls";

export function Room({
  gameState,
  selectedItem,
  onPlace,
}: {
  gameState: GameState;
  selectedItem: ItemType | null;
  onPlace: (x: number, y: number, z: number) => void;
}) {
  const isOrnament = selectedItem === "lamp" || selectedItem === "vase";

  // Calculate grid occupancy
  const floorOccupied = new Set(
    gameState.furniture.filter((f) => f.z === 0).map((f) => `${f.x},${f.y}`),
  );
  const surfaceOccupied = new Set(
    gameState.furniture.filter((f) => f.z > 0).map((f) => `${f.x},${f.y}`),
  );

  return (
    <group
      position={[-(GRID_SIZE * TILE_SIZE) / 2, 0, -(GRID_SIZE * TILE_SIZE) / 2]}
    >
      {/* Floor */}
      <mesh
        receiveShadow
        position={[
          (GRID_SIZE * TILE_SIZE) / 2,
          -0.1,
          (GRID_SIZE * TILE_SIZE) / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE]} />
        <meshStandardMaterial color="#e4e4e7" />
      </mesh>

      {/* Grid Tiles */}
      {Array.from({ length: GRID_SIZE }).map((_, y) =>
        Array.from({ length: GRID_SIZE }).map((_, x) => {
          const isOccupied = floorOccupied.has(`${x},${y}`);
          const isBallerinaTarget =
            gameState.ballerina.targetX === x &&
            gameState.ballerina.targetY === y;
          const isHighlight =
            selectedItem && !isOrnament && !isOccupied && !isBallerinaTarget;

          return (
            <mesh
              key={`floor-${x}-${y}`}
              position={[
                x * TILE_SIZE + TILE_SIZE / 2,
                0.01,
                y * TILE_SIZE + TILE_SIZE / 2,
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (isHighlight) onPlace(x, y, 0);
              }}
              onPointerOver={(e) => {
                if (isHighlight) {
                  e.stopPropagation();
                  document.body.style.cursor = "pointer";
                }
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
              <meshBasicMaterial
                color={isHighlight ? "#6366f1" : "#d4d4d8"}
                transparent
                opacity={isHighlight ? 0.4 : 0.1}
              />
            </mesh>
          );
        }),
      )}

      {/* Furniture */}
      {gameState.furniture.map((f) => {
        const isTable = f.type === "table";
        const hasOrnament = surfaceOccupied.has(`${f.x},${f.y}`);
        const isHighlight =
          selectedItem && isOrnament && isTable && !hasOrnament;

        return (
          <group
            key={f.id}
            position={[
              f.x * TILE_SIZE + TILE_SIZE / 2,
              f.z === 0 ? 0 : 1,
              f.y * TILE_SIZE + TILE_SIZE / 2,
            ]}
          >
            <FurnitureModel type={f.type} />

            {/* Surface Highlight for Ornaments */}
            {isTable && (
              <mesh
                position={[0, 1.05, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isHighlight) onPlace(f.x, f.y, 1);
                }}
                onPointerOver={(e) => {
                  if (isHighlight) {
                    e.stopPropagation();
                    document.body.style.cursor = "pointer";
                  }
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "auto";
                }}
              >
                <planeGeometry args={[TILE_SIZE * 0.8, TILE_SIZE * 0.8]} />
                <meshBasicMaterial
                  color="#f59e0b"
                  transparent
                  opacity={isHighlight ? 0.6 : 0}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Ballerina */}
      <BallerinaModel ballerina={gameState.ballerina} />

      {/* Dynamic Walls */}
      <DynamicWalls />
    </group>
  );
}
