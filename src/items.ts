import type { ItemType, ItemDefinition } from "./types.ts";

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  table: { type: "table", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall", interactable: true },
  chair: { type: "chair", category: "floor", size: 1, connectable: true, rotationStrategy: "faceInteractable" },
  plant: { type: "plant", category: "floor", size: 1, rotationStrategy: "faceAwayFromWall" },
  library: { type: "library", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall" },
  floor_lamp: { type: "floor_lamp", category: "floor", size: 1, rotationStrategy: "faceAwayFromWall" },
  bed: { type: "bed", category: "floor", size: 2, stackable: true, connectable: true, rotationStrategy: "manual" },
  laptop: { type: "laptop", category: "surface", size: 1, rotationStrategy: "faceNearest", facingType: "chair", interactable: true },
  tv: { type: "tv", category: "surface", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall", interactable: true },
  vase: { type: "vase", category: "surface", size: 1 },
  book: { type: "book", category: "surface", size: 1, interactable: true },
  lamp: { type: "lamp", category: "surface", size: 1 },
  drawer: { type: "drawer", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall" },
  bedside_table: { type: "bedside_table", category: "floor", size: 1, rotationStrategy: "faceAwayFromWall" },
  wardrobe: { type: "wardrobe", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall" },
};
