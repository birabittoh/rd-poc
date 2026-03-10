import { Furniture, ItemType } from "./types.ts";
import { GRID_SIZE } from "./constants.ts";

export type OrientationStrategy = (
  x: number,
  y: number,
  furniture: Furniture[],
) => number;

export const faceAwayFromWall: OrientationStrategy = (x, y) => {
  const distLeft = x;
  const distRight = GRID_SIZE - 1 - x;
  const distTop = y;
  const distBottom = GRID_SIZE - 1 - y;
  const minDist = Math.min(distLeft, distRight, distTop, distBottom);

  if (minDist === distTop) return 0;
  if (minDist === distBottom) return Math.PI;
  if (minDist === distLeft) return Math.PI / 2;
  return -Math.PI / 2;
};

export const faceNearest = (
  targetTypes: ItemType[],
  fallback: OrientationStrategy = faceAwayFromWall,
): OrientationStrategy => {
  return (x, y, furniture) => {
    const targets = furniture.filter((f) => targetTypes.includes(f.type));
    if (targets.length === 0) return fallback(x, y, furniture);

    let nearest = targets[0];
    let minDist = Infinity;
    for (const t of targets) {
      const dist = Math.abs(t.x - x) + Math.abs(t.y - y);
      if (dist < minDist) {
        minDist = dist;
        nearest = t;
      }
    }

    const dx = nearest.x - x;
    const dy = nearest.y - y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      return dy > 0 ? 0 : Math.PI;
    }
  };
};

export interface ItemDefinition {
  type: ItemType;
  isOrnament: boolean;
  findRotation: OrientationStrategy;
  rotationTriggers?: ItemType[]; // Types that, when placed, should trigger a rotation update for this item
}

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  table: {
    type: "table",
    isOrnament: false,
    findRotation: () => 0,
  },
  chair: {
    type: "chair",
    isOrnament: false,
    findRotation: faceNearest(["table"]),
    rotationTriggers: ["table"],
  },
  plant: {
    type: "plant",
    isOrnament: false,
    findRotation: () => Math.random() * Math.PI * 2,
  },
  library: {
    type: "library",
    isOrnament: false,
    findRotation: faceAwayFromWall,
  },
  floor_lamp: {
    type: "floor_lamp",
    isOrnament: false,
    findRotation: () => 0,
  },
  laptop: {
    type: "laptop",
    isOrnament: true,
    findRotation: faceNearest(["chair"]),
    rotationTriggers: ["chair"],
  },
  tv: {
    type: "tv",
    isOrnament: true,
    findRotation: faceNearest(["chair"]),
    rotationTriggers: ["chair"],
  },
  vase: {
    type: "vase",
    isOrnament: true,
    findRotation: () => 0,
  },
  book: {
    type: "book",
    isOrnament: true,
    findRotation: () => Math.random() * Math.PI * 2,
  },
  lamp: {
    type: "lamp",
    isOrnament: true,
    findRotation: () => 0,
  },
};
