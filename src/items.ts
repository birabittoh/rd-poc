import { ItemType, ItemDefinition } from "./types";

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  table: { type: "table", category: "floor", size: 1, connectable: true },
  chair: { type: "chair", category: "floor", size: 1, connectable: true, rotationStrategy: "faceNearest", facingType: "table" },
  plant: { type: "plant", category: "floor", size: 1 },
  library: { type: "library", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall" },
  floor_lamp: { type: "floor_lamp", category: "floor", size: 1 },
  bed: { type: "bed", category: "floor", size: 2, stackable: true, connectable: true, rotationStrategy: "manual" },
  laptop: { type: "laptop", category: "surface", size: 1, rotationStrategy: "faceNearest", facingType: "chair" },
  tv: { type: "tv", category: "surface", size: 1, rotationStrategy: "faceNearest", facingType: "chair" },
  vase: { type: "vase", category: "surface", size: 1 },
  book: { type: "book", category: "surface", size: 1 },
  lamp: { type: "lamp", category: "surface", size: 1 },
};
