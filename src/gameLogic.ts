import type { Furniture, GameState, ItemType } from "./types.ts";
import { ITEM_DEFINITIONS } from "./items.ts";
import { GRID_SIZE, CENTER } from "./constants.ts";

export interface PlacementPayload {
  type: ItemType;
  x: number;
  y: number;
  z: number;
  rotation?: number;
}

export function getOccupiedTiles(item: Furniture): { x: number; y: number }[] {
  const def = ITEM_DEFINITIONS[item.type];
  const tiles: { x: number; y: number }[] = [{ x: item.x, y: item.y }];

  if (def.size > 1) {
    const rotation = item.rotation || 0;
    const dx = Math.round(Math.sin(rotation));
    const dy = Math.round(Math.cos(rotation));

    for (let i = 1; i < def.size; i++) {
      tiles.push({ x: item.x + dx * i, y: item.y + dy * i });
    }
  }
  return tiles;
}

export function hasHorizontalConnections(item: Furniture, state: GameState): boolean {
  const def = ITEM_DEFINITIONS[item.type];
  if (!def.connectable) return false;
  const tiles = getOccupiedTiles(item);
  return state.furniture.some((other) => {
    if (other.id === item.id || other.type !== item.type || other.z !== item.z || other.rotation !== item.rotation) return false;
    const otherTiles = getOccupiedTiles(other);
    return tiles.some((t1) =>
      otherTiles.some((t2) => {
        const dx = Math.abs(t1.x - t2.x);
        const dy = Math.abs(t1.y - t2.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
      })
    );
  });
}

export function getGridOccupancy(state: GameState): boolean[][] {
  const grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(false));

  for (const item of state.furniture) {
    if (item.z === 0) {
      const tiles = getOccupiedTiles(item);
      for (const tile of tiles) {
        if (tile.x >= 0 && tile.x < GRID_SIZE && tile.y >= 0 && tile.y < GRID_SIZE) {
          grid[tile.y][tile.x] = true;
        }
      }
    }
  }
  return grid;
}

export function stepBallerina(state: GameState): GameState {
  if (state.status !== "playing") return state;

  const next: GameState = { ...state, ballerina: { ...state.ballerina } };
  next.ballerina.x = next.ballerina.targetX;
  next.ballerina.y = next.ballerina.targetY;

  const grid = getGridOccupancy(next);
  const { x, y } = next.ballerina;

  const possibleMoves = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ].filter(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;
    return nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !grid[ny][nx];
  });

  if (possibleMoves.length === 0) {
    next.status = "game_over";
    next.ballerina.isDancing = false;
  } else if (Math.random() < 0.5) {
    next.ballerina.isDancing = true;
  } else {
    const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    next.ballerina.targetX = x + move.dx;
    next.ballerina.targetY = y + move.dy;
    next.ballerina.isDancing = false;
  }

  return next;
}

export function placeFurniture(state: GameState, payload: PlacementPayload): GameState | null {
  if (state.status !== "playing") return null;

  const { type, x, y, z, rotation: manualRotation } = payload;
  const def = ITEM_DEFINITIONS[type];
  if (!def) return null;

  let rotation = manualRotation !== undefined ? manualRotation : 0;

  // Rotation Strategies
  if (manualRotation === undefined && def.rotationStrategy === "faceNearest" && def.facingType) {
    const targets = state.furniture.filter((f) => f.type === def.facingType);
    if (targets.length > 0) {
      let nearest = targets[0];
      let minDist = Infinity;
      for (const t of targets) {
        const dist = Math.abs(t.x - x) + Math.abs(t.y - y);
        if (dist < minDist) { minDist = dist; nearest = t; }
      }
      const dx = nearest.x - x;
      const dy = nearest.y - y;
      if (Math.abs(dx) > Math.abs(dy)) rotation = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
      else rotation = dy > 0 ? 0 : Math.PI;
    }
  } else if (manualRotation === undefined && def.rotationStrategy === "faceAwayFromWall") {
    const distLeft = x, distRight = GRID_SIZE - 1 - x;
    const distTop = y, distBottom = GRID_SIZE - 1 - y;
    const minDist = Math.min(distLeft, distRight, distTop, distBottom);
    if (minDist === distTop) rotation = 0;
    else if (minDist === distBottom) rotation = Math.PI;
    else if (minDist === distLeft) rotation = Math.PI / 2;
    else if (minDist === distRight) rotation = -Math.PI / 2;
  }

  const newItem: Furniture = {
    id: Math.random().toString(36).substring(2, 9),
    type,
    x,
    y,
    z,
    rotation,
  };

  const newTiles = getOccupiedTiles(newItem);

  // Validate bounds
  if (newTiles.some((t) => t.x < 0 || t.x >= GRID_SIZE || t.y < 0 || t.y >= GRID_SIZE)) return null;

  // Check Ballerina
  if (z === 0 && newTiles.some((t) => t.x === state.ballerina.targetX && t.y === state.ballerina.targetY)) return null;

  // Check Occupancy & Stacking
  const existingAtLevel = state.furniture.filter((f) => f.z === z);
  const isOccupied = existingAtLevel.some((f) => {
    const tiles = getOccupiedTiles(f);
    return tiles.some((t1) => newTiles.some((t2) => t1.x === t2.x && t1.y === t2.y));
  });

  if (isOccupied) {
    if (def.stackable) {
      const baseItem = state.furniture.find((f) => {
        if (f.type !== type || f.z !== z) return false;
        const tiles = getOccupiedTiles(f);
        return tiles.length === newTiles.length && tiles.every((t1, i) => t1.x === newTiles[i].x && t1.y === newTiles[i].y);
      });
      if (!baseItem) return null;
      if (baseItem.z !== 0) return null;
      if (hasHorizontalConnections(baseItem, state)) return null;

      newItem.z = baseItem.z + 1;
      newItem.rotation = baseItem.rotation;

      const occupiedAtNewLevel = state.furniture.some((f) => {
        if (f.z !== newItem.z) return false;
        const tiles = getOccupiedTiles(f);
        return tiles.some((t1) => newTiles.some((t2) => t1.x === t2.x && t1.y === t2.y));
      });
      if (occupiedAtNewLevel) return null;
    } else {
      return null;
    }
  }

  // Joining Logic (inherit rotation from identical adjacent item)
  if (def.connectable) {
    const adjacentIdentical = state.furniture.find((f) => {
      if (f.type !== type || f.z !== newItem.z) return false;

      const isStackedOn = state.furniture.some((top) => {
        if (top.z !== f.z + 1) return false;
        const topTiles = getOccupiedTiles(top);
        const fTiles = getOccupiedTiles(f);
        return topTiles.some((t1) => fTiles.some((t2) => t1.x === t2.x && t1.y === t2.y));
      });
      if (isStackedOn) return false;

      const tiles = getOccupiedTiles(f);
      return tiles.some((t1) =>
        newTiles.some((t2) => {
          const dx = Math.abs(t1.x - t2.x);
          const dy = Math.abs(t1.y - t2.y);
          return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
        })
      );
    });

    if (adjacentIdentical) {
      const originalRotation = newItem.rotation;
      newItem.rotation = adjacentIdentical.rotation;

      if (def.size > 1) {
        const matchesFootprint = (tiles1: { x: number; y: number }[], tiles2: { x: number; y: number }[]) => {
          if (tiles1.length !== tiles2.length) return false;
          const set1 = new Set(tiles1.map((t) => `${t.x},${t.y}`));
          const set2 = new Set(tiles2.map((t) => `${t.x},${t.y}`));
          for (const t of set1) if (!set2.has(t)) return false;
          return true;
        };

        const possibleHeads = [
          { x: newTiles[0].x, y: newTiles[0].y },
          { x: newTiles[1].x, y: newTiles[1].y },
        ];

        let foundValid = false;
        for (const h of possibleHeads) {
          const testItem = { ...newItem, x: h.x, y: h.y };
          const testTiles = getOccupiedTiles(testItem as Furniture);
          if (matchesFootprint(testTiles, newTiles)) {
            newItem.x = h.x;
            newItem.y = h.y;
            foundValid = true;
            break;
          }
        }

        if (!foundValid) newItem.rotation = originalRotation;
      }

      // Re-validate occupancy with new rotation
      const updatedTiles = getOccupiedTiles(newItem);
      const stillOccupied = existingAtLevel.some((f) => {
        const tiles = getOccupiedTiles(f);
        return tiles.some((t1) => updatedTiles.some((t2) => t1.x === t2.x && t1.y === t2.y));
      });
      if (stillOccupied) {
        newItem.rotation = originalRotation;
        newItem.x = x;
        newItem.y = y;
      }
    }
  }

  // Adjacency check for floor items
  if (newItem.z === 0) {
    const finalTiles = getOccupiedTiles(newItem);
    const isAdjacentToWall = finalTiles.some((t) => t.x === 0 || t.x === GRID_SIZE - 1 || t.y === 0 || t.y === GRID_SIZE - 1);
    const isAdjacentToFurniture = state.furniture.some((f) => {
      if (f.z !== 0) return false;
      const tiles = getOccupiedTiles(f);
      return tiles.some((t1) => finalTiles.some((t2) => Math.abs(t1.x - t2.x) + Math.abs(t1.y - t2.y) === 1));
    });
    if (!isAdjacentToWall && !isAdjacentToFurniture) return null;
  }

  const newFurniture = [...state.furniture, newItem];

  // Update faceNearest rotations for existing items
  const updatedFurniture = newFurniture.map((item) => {
    const itemDef = ITEM_DEFINITIONS[item.type];
    if (itemDef.rotationStrategy === "faceNearest" && itemDef.facingType === type) {
      const targets = newFurniture.filter((f) => f.type === type);
      let nearest = targets[0];
      let minDist = Infinity;
      for (const t of targets) {
        const dist = Math.abs(t.x - item.x) + Math.abs(t.y - item.y);
        if (dist < minDist) { minDist = dist; nearest = t; }
      }
      const dx = nearest.x - item.x;
      const dy = nearest.y - item.y;
      const newRotation = Math.abs(dx) > Math.abs(dy)
        ? (dx > 0 ? Math.PI / 2 : -Math.PI / 2)
        : (dy > 0 ? 0 : Math.PI);
      return { ...item, rotation: newRotation };
    }
    return item;
  });

  return { ...state, furniture: updatedFurniture };
}

export function createInitialState(): GameState {
  return {
    furniture: [],
    ballerina: {
      x: CENTER,
      y: CENTER,
      targetX: CENTER,
      targetY: CENTER,
      isDancing: false,
    },
    status: "playing",
  };
}
