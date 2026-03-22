import type { GameState } from './types.ts';
import { GRID_SIZE } from './constants.ts';
import { getOccupiedTiles } from './gameLogic.ts';

export interface Dialogue {
  duration: number;
  content: string;
  emotion: string;
}

export interface Phase {
  id: number;
  name: string;
  threshold: number; // free spots percentage (1.0 = 100%) at which this phase triggers (<=)
  vnDialogue: Dialogue[];
  bubbleDialogue: Dialogue[];
}

export interface PhaseState {
  currentPhase: number;
  vnActive: boolean;
  vnLineIndex: number;
  vnStartedAt: number;
  bubbleActive: boolean;
  bubbleDialogue: Dialogue | null;
  bubbleStartedAt: number;
}

export const EMOTION_EMOJI: Record<string, string> = {
  happy: '😊',
  excited: '🤩',
  neutral: '😐',
  confused: '😕',
  annoyed: '😤',
  angry: '😡',
  sad: '😢',
  resigned: '🫠',
  npc: '🤖',
};

export const ALL_EMOTIONS = Object.keys(EMOTION_EMOJI);

export const BUBBLE_TRIGGER_CHANCE = 0.3;

const TOTAL_FLOOR_TILES = GRID_SIZE * GRID_SIZE;

export function calculateFreePercentage(state: GameState): number {
  const occupied = new Set<string>();
  state.furniture
    .filter((f) => f.z === 0)
    .forEach((f) => {
      getOccupiedTiles(f).forEach((t) => occupied.add(`${t.x},${t.y}`));
    });
  // Ballerina tile counts as occupied
  occupied.add(`${state.ballerina.targetX},${state.ballerina.targetY}`);
  return (TOTAL_FLOOR_TILES - occupied.size) / TOTAL_FLOOR_TILES;
}

export function createInitialPhaseState(): PhaseState {
  return {
    currentPhase: 0,
    vnActive: true,
    vnLineIndex: 0,
    vnStartedAt: Date.now(),
    bubbleActive: false,
    bubbleDialogue: null,
    bubbleStartedAt: 0,
  };
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Welcome',
    threshold: 1.0,
    vnDialogue: [
      { duration: 4, content: "Oh wow, this room is all mine?! It's so spacious!", emotion: 'excited' },
      { duration: 4, content: "I can't wait to dance around in here! This is perfect!", emotion: 'happy' },
      { duration: 3, content: "Let's see what everyone brings in!", emotion: 'happy' },
    ],
    bubbleDialogue: [
      { duration: 3, content: 'Ooh, nice choice!', emotion: 'happy' },
      { duration: 3, content: 'I love it here!', emotion: 'excited' },
      { duration: 2, content: 'More room to dance!', emotion: 'happy' },
      { duration: 3, content: "This is so fun, keep going!", emotion: 'excited' },
    ],
  },
  {
    id: 2,
    name: 'Noticing',
    threshold: 0.75,
    vnDialogue: [
      { duration: 4, content: "Hmm, it's starting to get a little cozy in here...", emotion: 'confused' },
      { duration: 3, content: "That's... a lot of furniture, isn't it?", emotion: 'neutral' },
      { duration: 3, content: 'Well, I can still dance! Probably!', emotion: 'confused' },
    ],
    bubbleDialogue: [
      { duration: 3, content: 'Do we really need that?', emotion: 'confused' },
      { duration: 3, content: "It's getting a bit tight...", emotion: 'neutral' },
      { duration: 2, content: 'Excuse me, coming through!', emotion: 'confused' },
      { duration: 3, content: 'I have to squeeze past that now...', emotion: 'neutral' },
    ],
  },
  {
    id: 3,
    name: 'Frustrated',
    threshold: 0.55,
    vnDialogue: [
      { duration: 4, content: 'Okay, seriously?! I can barely move anymore!', emotion: 'annoyed' },
      { duration: 4, content: "Who keeps putting all this stuff in MY room?!", emotion: 'angry' },
      { duration: 3, content: 'I just wanted to dance...', emotion: 'sad' },
    ],
    bubbleDialogue: [
      { duration: 3, content: "STOP putting things here!", emotion: 'angry' },
      { duration: 3, content: "I can't even spin anymore!", emotion: 'annoyed' },
      { duration: 3, content: 'This used to be a dance studio!', emotion: 'sad' },
      { duration: 2, content: 'Ugh, not another one!', emotion: 'annoyed' },
    ],
  },
  {
    id: 4,
    name: 'Desperate',
    threshold: 0.35,
    vnDialogue: [
      { duration: 4, content: "Please... I'm begging you. Stop.", emotion: 'sad' },
      { duration: 4, content: 'This was supposed to be my space. My sanctuary.', emotion: 'sad' },
      { duration: 4, content: "But nobody cares what I think, do they?", emotion: 'angry' },
    ],
    bubbleDialogue: [
      { duration: 3, content: 'Why are you doing this to me?', emotion: 'sad' },
      { duration: 3, content: 'I have nowhere left to go...', emotion: 'sad' },
      { duration: 3, content: "Please, just leave me one spot...", emotion: 'sad' },
      { duration: 2, content: "I can't breathe in here!", emotion: 'angry' },
    ],
  },
  {
    id: 5,
    name: 'Acceptance',
    threshold: 0.18,
    vnDialogue: [
      { duration: 4, content: '...', emotion: 'resigned' },
      { duration: 5, content: "You know what? It's fine. Everything is fine.", emotion: 'resigned' },
      { duration: 5, content: 'I am a furniture placement assistant. I have no feelings.', emotion: 'npc' },
      { duration: 4, content: 'Please place your furniture. I am here to help.', emotion: 'npc' },
    ],
    bubbleDialogue: [
      { duration: 3, content: 'Great choice! I love it.', emotion: 'npc' },
      { duration: 3, content: 'Excellent furniture placement.', emotion: 'npc' },
      { duration: 3, content: 'Thank you for your contribution.', emotion: 'npc' },
      { duration: 3, content: 'I exist to serve.', emotion: 'resigned' },
      { duration: 2, content: 'This is fine.', emotion: 'resigned' },
    ],
  },
];
