import React, { useMemo } from 'react';
import { GameState, ItemType } from '../types';
import { ITEM_DEFINITIONS } from '../items';
import { GRID_SIZE, TILE_SIZE, COLORS } from '../constants';
import { FurnitureModel } from './FurnitureModel';
import { BallerinaModel } from './BallerinaModel';
import { DynamicWalls } from './DynamicWalls';
import { HangingBulb } from './HangingBulb';
import { useSettings } from '../contexts/SettingsContext';
import { getOccupiedTiles, placeFurniture } from '../gameLogic';

export function Room({
  gameState,
  selectedItem,
  placementPath,
  onPlace,
}: {
  gameState: GameState;
  selectedItem: ItemType | null;
  placementPath: { x: number; y: number }[];
  onPlace: (x: number, y: number, z: number, rotation?: number) => void;
}) {
  const { settings } = useSettings();
  const itemDef = selectedItem ? ITEM_DEFINITIONS[selectedItem] : null;
  const isOrnament = itemDef?.category === 'surface';

  const surfaceOccupied = useMemo(
    () => new Set(gameState.furniture.filter((f) => f.z > 0).map((f) => `${f.x},${f.y}`)),
    [gameState.furniture]
  );

  const connectionsMap = useMemo(() => {
    const map = new Map<string, { top: boolean; right: boolean; bottom: boolean; left: boolean }>();
    gameState.furniture.forEach((f) => {
      map.set(f.id, { top: false, right: false, bottom: false, left: false });
    });

    gameState.furniture.forEach((f) => {
      const def = ITEM_DEFINITIONS[f.type];
      if (!def.connectable) return;
      const conn = map.get(f.id)!;
      const tiles = getOccupiedTiles(f);

      const isActuallyStackable = def.stackable;
      if (f.type !== 'tv' && isActuallyStackable) {
        const isStacked = gameState.furniture.some(
          (other) =>
            (other.z === f.z + 1 || (f.z > 0 && other.z === f.z - 1)) &&
            other.x === f.x &&
            other.y === f.y
        );
        if (isStacked) return;
      }

      gameState.furniture.forEach((other) => {
        if (
          other.id === f.id ||
          other.type !== f.type ||
          other.z !== f.z ||
          other.rotation !== f.rotation
        )
          return;

        const otherDef = ITEM_DEFINITIONS[other.type];
        if (f.type !== 'tv' && otherDef.stackable) {
          const otherIsStacked = gameState.furniture.some(
            (s) =>
              (s.z === other.z + 1 || (other.z > 0 && s.z === other.z - 1)) &&
              s.x === other.x &&
              s.y === other.y
          );
          if (otherIsStacked) return;
        }

        const otherTiles = getOccupiedTiles(other);
        const sidesOnly = def.connectableDirections !== 'all';
        const rot = f.rotation || 0;
        const allowX = !sidesOnly || Math.abs(Math.round(Math.cos(rot))) === 1;
        const allowY = !sidesOnly || Math.abs(Math.round(Math.sin(rot))) === 1;

        tiles.forEach((t1) => {
          otherTiles.forEach((t2) => {
            if (allowY && t1.x === t2.x && t1.y === t2.y - 1) conn.bottom = true;
            if (allowY && t1.x === t2.x && t1.y === t2.y + 1) conn.top = true;
            if (allowX && t1.y === t2.y && t1.x === t2.x - 1) conn.right = true;
            if (allowX && t1.y === t2.y && t1.x === t2.x + 1) conn.left = true;
          });
        });
      });
    });
    return map;
  }, [gameState.furniture]);

  const validSpots = useMemo(() => {
    const spots = new Set<string>();
    if (selectedItem && !isOrnament) {
      for (let gy = 0; gy < GRID_SIZE; gy++) {
        for (let gx = 0; gx < GRID_SIZE; gx++) {
          if (itemDef?.size && itemDef.size > 1) {
            if (placementPath.length === 0) {
              const canStart = [
                { dx: 1, dy: 0, rot: Math.PI / 2 },
                { dx: -1, dy: 0, rot: -Math.PI / 2 },
                { dx: 0, dy: 1, rot: 0 },
                { dx: 0, dy: -1, rot: Math.PI },
              ].some(
                (o) =>
                  !!placeFurniture(gameState, {
                    type: selectedItem,
                    x: gx,
                    y: gy,
                    z: 0,
                    rotation: o.rot,
                  })
              );
              if (canStart) spots.add(`${gx},${gy}`);
            } else {
              const head = placementPath[placementPath.length - 1] || placementPath[0]; // Logic safety
              const dx = gx - head.x;
              const dy = gy - head.y;
              if (Math.abs(dx) + Math.abs(dy) === 1) {
                let rot = 0;
                if (dx === 1) rot = Math.PI / 2;
                else if (dx === -1) rot = -Math.PI / 2;
                else if (dy === 1) rot = 0;
                else if (dy === -1) rot = Math.PI;
                if (
                  !!placeFurniture(gameState, {
                    type: selectedItem,
                    x: head.x,
                    y: head.y,
                    z: 0,
                    rotation: rot,
                  })
                ) {
                  spots.add(`${gx},${gy}`);
                }
              }
            }
          } else {
            if (!!placeFurniture(gameState, { type: selectedItem, x: gx, y: gy, z: 0 })) {
              spots.add(`${gx},${gy}`);
            }
          }
        }
      }
    }
    return spots;
  }, [selectedItem, isOrnament, itemDef, placementPath, gameState]);

  return (
    <group position={[-(GRID_SIZE * TILE_SIZE) / 2, 0, -(GRID_SIZE * TILE_SIZE) / 2]}>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[(GRID_SIZE * TILE_SIZE) / 2, 0, (GRID_SIZE * TILE_SIZE) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE]} />
        <meshStandardMaterial color={COLORS.FLOOR} roughness={settings.video.lightReflections ? 0.1 : 0.8} metalness={settings.video.lightReflections ? 0.2 : 0} />
      </mesh>

      {/* Grid Tiles */}
      {Array.from({ length: GRID_SIZE }).map((_, y) =>
        Array.from({ length: GRID_SIZE }).map((_, x) => {
          const isHighlight = validSpots.has(`${x},${y}`);
          const highlightColor = itemDef?.size && itemDef.size > 1 ? '#3b82f6' : '#6366f1';
          const isPath = placementPath.some((p) => p.x === x && p.y === y);

          return (
            <mesh
              key={`floor-${x}-${y}`}
              position={[x * TILE_SIZE + TILE_SIZE / 2, 0.01, y * TILE_SIZE + TILE_SIZE / 2]}
              rotation={[-Math.PI / 2, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (isHighlight || isPath) onPlace(x, y, 0);
              }}
              onPointerOver={(e) => {
                if (isHighlight || isPath) {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                }
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto';
              }}
              frustumCulled={false}
              renderOrder={5}
            >
              <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
              <meshBasicMaterial
                color={isPath ? highlightColor : isHighlight ? highlightColor : '#d4d4d8'}
                transparent
                opacity={isPath ? 0.8 : isHighlight ? 0.4 : 0.1}
                depthWrite={false}
              />
            </mesh>
          );
        })
      )}

      {/* Furniture */}
      {gameState.furniture.map((f) => {
        const fDef = ITEM_DEFINITIONS[f.type];
        const isSurface = !!fDef.surfaceHeight;
        const hasOrnament = surfaceOccupied.has(`${f.x},${f.y}`);
        const isHighlight =
          selectedItem &&
          isOrnament &&
          isSurface &&
          !hasOrnament &&
          (() => {
            // Optimization: check item count and sparkles before calling complex logic
            if (!!placeFurniture(gameState, { type: selectedItem, x: f.x, y: f.y, z: 1 })) return true;
            return false;
          })();

        const floorItem =
          f.z > 0
            ? gameState.furniture.find(
                (other) => other.z === 0 && other.x === f.x && other.y === f.y
              )
            : null;
        const currentSurfaceHeight =
          f.z === 0 ? 0 : floorItem ? (ITEM_DEFINITIONS[floorItem.type].surfaceHeight ?? 1) : 1;

        const conn = connectionsMap.get(f.id);
        const isJoined = conn && (conn.top || conn.right || conn.bottom || conn.left);

        const isStackable =
          selectedItem &&
          ITEM_DEFINITIONS[selectedItem].stackable &&
          selectedItem === f.type &&
          f.z === 0 &&
          !isJoined;

        return (
          <group
            key={f.id}
            position={[
              f.x * TILE_SIZE + TILE_SIZE / 2,
              currentSurfaceHeight,
              f.y * TILE_SIZE + TILE_SIZE / 2,
            ]}
            rotation={[0, f.rotation || 0, 0]}
            onClick={(e) => {
              if (isStackable) {
                e.stopPropagation();
                onPlace(f.x, f.y, f.z, f.rotation);
              }
            }}
            onPointerOver={(e) => {
              if (isStackable) {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            <FurnitureModel
              type={f.type}
              connections={connectionsMap.get(f.id)}
              rotation={f.rotation || 0}
              z={f.z}
              variant={f.variant}
            />

            {/* Surface Highlight for Ornaments */}
            {isSurface && (
              <mesh
                position={[0, (fDef.surfaceHeight ?? 0) + 0.05, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isHighlight) onPlace(f.x, f.y, 1);
                }}
                onPointerOver={(e) => {
                  if (isHighlight) {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                  }
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'auto';
                }}
                frustumCulled={false}
                renderOrder={5}
              >
                <planeGeometry args={[TILE_SIZE * 0.8, TILE_SIZE * 0.8]} />
                <meshBasicMaterial
                  color="#f59e0b"
                  transparent
                  opacity={isHighlight ? 0.6 : 0}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Ballerina */}
      <BallerinaModel
        ballerina={gameState.ballerina}
        bubbleDialogue={gameState.phaseState?.bubbleActive ? gameState.phaseState.bubbleDialogue : null}
      />

      {/* Dynamic Walls */}
      <DynamicWalls />

      {/* Hanging Bulb at center */}
      <group position={[GRID_SIZE / 2, 0, GRID_SIZE / 2]}>
         <HangingBulb />
      </group>
    </group>
  );
}
