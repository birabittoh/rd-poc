import { GameState, ItemType, Furniture } from '../types';
import { ITEM_DEFINITIONS } from '../items';
import { GRID_SIZE, TILE_SIZE } from '../constants';
import { FurnitureModel } from './FurnitureModel';
import { BallerinaModel } from './BallerinaModel';
import { DynamicWalls } from './DynamicWalls';

function getOccupiedTiles(item: Furniture) {
  const def = ITEM_DEFINITIONS[item.type];
  const tiles: { x: number; y: number }[] = [{ x: item.x, y: item.y }];

  if (def.size > 1) {
    const rotation = item.rotation || 0;
    const dx = Math.round(Math.sin(rotation));
    const dy = Math.round(Math.cos(rotation));

    for (let i = 1; i < def.size; i++) {
      tiles.push({
        x: item.x + dx * i,
        y: item.y + dy * i,
      });
    }
  }
  return tiles;
}

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
  const itemDef = selectedItem ? ITEM_DEFINITIONS[selectedItem] : null;
  const isOrnament = itemDef?.category === 'surface';

  // Calculate grid occupancy
  const floorOccupied = new Set<string>();
  gameState.furniture
    .filter((f) => f.z === 0)
    .forEach((f) => {
      getOccupiedTiles(f).forEach((t) => floorOccupied.add(`${t.x},${t.y}`));
    });

  const surfaceOccupied = new Set(
    gameState.furniture.filter((f) => f.z > 0).map((f) => `${f.x},${f.y}`)
  );

  const isAdjacentToWallOrFurniture = (x: number, y: number) => {
    if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) return true;
    if (floorOccupied.has(`${x - 1},${y}`)) return true;
    if (floorOccupied.has(`${x + 1},${y}`)) return true;
    if (floorOccupied.has(`${x},${y - 1}`)) return true;
    if (floorOccupied.has(`${x},${y + 1}`)) return true;
    return false;
  };

  const connectionsMap = new Map<
    string,
    { top: boolean; right: boolean; bottom: boolean; left: boolean }
  >();
  gameState.furniture.forEach((f) => {
    connectionsMap.set(f.id, { top: false, right: false, bottom: false, left: false });
  });

  gameState.furniture.forEach((f) => {
    const def = ITEM_DEFINITIONS[f.type];
    if (!def.connectable) return;
    const conn = connectionsMap.get(f.id)!;
    const tiles = getOccupiedTiles(f);

    // Constraint: No horizontal connections if stacked (except for non-stackable items with ornaments or TVs)
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

      // Constraint: Other item also cannot be stacked (except for non-stackable items or TVs)
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

  return (
    <group position={[-(GRID_SIZE * TILE_SIZE) / 2, 0, -(GRID_SIZE * TILE_SIZE) / 2]}>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[(GRID_SIZE * TILE_SIZE) / 2, 0, (GRID_SIZE * TILE_SIZE) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE]} />
        <meshStandardMaterial color="#e4e4e7" roughness={0.1} metalness={0.2} />
      </mesh>

      {/* Grid Tiles */}
      {Array.from({ length: GRID_SIZE }).map((_, y) =>
        Array.from({ length: GRID_SIZE }).map((_, x) => {
          const isOccupied = floorOccupied.has(`${x},${y}`);
          const isBallerinaTarget =
            gameState.ballerina.targetX === x && gameState.ballerina.targetY === y;

          let isHighlight = false;
          let highlightColor = '#6366f1'; // Indigo default

          if (selectedItem && !isOrnament) {
            if (itemDef?.size && itemDef.size > 1) {
              highlightColor = '#3b82f6'; // Blue for multi-tile
              if (placementPath.length === 0) {
                const canPlaceFromHere = [
                  { dx: 1, dy: 0 },
                  { dx: -1, dy: 0 },
                  { dx: 0, dy: 1 },
                  { dx: 0, dy: -1 },
                ].some((offset) => {
                  const nx = x + offset.dx;
                  const ny = y + offset.dy;
                  if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return false;
                  if (floorOccupied.has(`${nx},${ny}`)) return false;
                  return isAdjacentToWallOrFurniture(x, y) || isAdjacentToWallOrFurniture(nx, ny);
                });
                isHighlight = !isOccupied && !isBallerinaTarget && canPlaceFromHere;
              } else {
                const head = placementPath[0];
                const dist = Math.abs(x - head.x) + Math.abs(y - head.y);
                // Check if the resulting footprint is adjacent to wall or furniture
                const isFootprintAdjacent =
                  isAdjacentToWallOrFurniture(head.x, head.y) || isAdjacentToWallOrFurniture(x, y);
                isHighlight =
                  dist === 1 && !isOccupied && !isBallerinaTarget && isFootprintAdjacent;
              }
            } else {
              isHighlight = !isOccupied && !isBallerinaTarget && isAdjacentToWallOrFurniture(x, y);
            }
          }

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
        const isHighlight = selectedItem && isOrnament && isSurface && !hasOrnament;

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
      <BallerinaModel ballerina={gameState.ballerina} />

      {/* Dynamic Walls */}
      <DynamicWalls />
    </group>
  );
}
