export type ItemType =
  | 'table'
  | 'chair'
  | 'plant'
  | 'lamp'
  | 'vase'
  | 'library'
  | 'floor_lamp'
  | 'laptop'
  | 'book'
  | 'tv'
  | 'bed'
  | 'drawer'
  | 'bedside_table'
  | 'wardrobe'
  | 'coffee_table'
  | 'mirror'
  | 'mirror_ornament';

export interface ItemDefinition {
  type: ItemType;
  category: 'floor' | 'surface';
  size: number;
  stackable?: boolean;
  connectable?: boolean;
  interactable?: boolean;
  surfaceHeight?: number;
  label?: string;
  connectableDirections?: 'sides' | 'all';
  rotationStrategy?:
    | 'faceNearest'
    | 'faceAwayFromWall'
    | 'manual'
    | 'inherit'
    | 'faceInteractable'
    | 'faceChair';
  facingType?: ItemType;
  variants?: number;
  previewAdjustCamera?: number;
}

export interface Furniture {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  z: number;
  rotation?: number;
  variant?: number;
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
  status: 'playing' | 'game_over';
}

export interface Connections {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface FurnitureProps {
  localConn: Connections;
  variant?: number;
  z?: number;
}

// --- Waiting Room Types ---

export interface WaitingRoomUser {
  uuid: string;
  name: string;
  coins: number;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'system';
  sender?: string;
  text: string;
  timestamp: number;
}
