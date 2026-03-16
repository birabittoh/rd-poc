import type { ItemType, ItemDefinition } from "./types.ts";

export const ITEM_DEFINITIONS: Record<ItemType, ItemDefinition> = {
  table: { type: "table", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall", interactable: true, surfaceHeight: 1.0, variants: 2 },
  chair: { type: "chair", category: "floor", size: 1, connectable: true, rotationStrategy: "faceInteractable", variants: 2 },
  plant: { type: "plant", category: "floor", size: 1, rotationStrategy: "faceAwayFromWall", variants: 2 },
  library: { type: "library", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall", variants: 2 },
  floor_lamp: { type: "floor_lamp", category: "floor", size: 1, rotationStrategy: "faceAwayFromWall", variants: 2 },
  bed: { type: "bed", category: "floor", size: 2, stackable: true, connectable: true, rotationStrategy: "manual", variants: 2 },
  laptop: { type: "laptop", category: "surface", size: 1, rotationStrategy: "faceNearest", facingType: "chair", interactable: true, variants: 2 },
  tv: { type: "tv", category: "surface", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall", interactable: true, variants: 2 },
  vase: { type: "vase", category: "surface", size: 1, variants: 2 },
  book: { type: "book", category: "surface", size: 1, interactable: true, variants: 2 },
  lamp: { type: "lamp", category: "surface", size: 1, variants: 2 },
  drawer: { type: "drawer", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall", surfaceHeight: 0.8, variants: 2 },
  bedside_table: { type: "bedside_table", category: "floor", size: 1, rotationStrategy: "faceAwayFromWall", surfaceHeight: 0.5, variants: 2 },
  wardrobe: { type: "wardrobe", category: "floor", size: 1, connectable: true, rotationStrategy: "faceAwayFromWall", variants: 2 },
};
