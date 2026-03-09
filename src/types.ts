export type ItemType =
  | "table"
  | "chair"
  | "plant"
  | "lamp"
  | "vase"
  | "library"
  | "floor_lamp"
  | "laptop"
  | "book"
  | "tv";

export interface Furniture {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  z: number;
  rotation?: number;
}

export interface Ballerina {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isDancing: boolean;
}

export interface GameState {
  furniture: Furniture[];
  ballerina: Ballerina;
  status: "playing" | "game_over";
}
