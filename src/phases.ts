import type { GameState } from './types.ts';
import { GRID_SIZE } from './constants.ts';
import { getOccupiedTiles } from './gameLogic.ts';

export interface Dialogue {
  duration: number;
  content: string;
  emotion: string;
}

export interface Stats {
  clutter: number; // 0–5
  privacy: number;
  rest: number;
  fun: number;
  control: number;
}

export interface Phase {
  id: number;
  name: string;
  threshold: number; // free spots percentage (1.0 = 100%) at which this phase triggers (<=)
  stats: Stats;
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

export const BUBBLE_TRIGGER_CHANCE = .5;

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
    stats: { clutter: 0, privacy: 4, rest: 5, fun: 5, control: 5 },
    vnDialogue: [
      { duration: 15, content: "Oh wow, this room is all mine?! It's so spacious!", emotion: 'excited' },
      { duration: 15, content: "I can't wait to dance around in here! This is perfect!", emotion: 'happy' },
      { duration: 15, content: "Let's see what everyone brings in!", emotion: 'happy' },
    ],
    bubbleDialogue: [
      { duration: 5, content: 'Ooh, nice choice!', emotion: 'happy' },
      { duration: 5, content: 'I love it here!', emotion: 'excited' },
      { duration: 5, content: 'More room to dance!', emotion: 'happy' },
      { duration: 5, content: "This is so fun, keep going!", emotion: 'excited' },
    ],
  },
  {
    id: 2,
    name: 'Noticing',
    threshold: 0.75,
    stats: { clutter: 2, privacy: 3, rest: 3, fun: 3, control: 3 },
    vnDialogue: [
      { duration: 15, content: "Hmm, it's starting to get a little cozy in here...", emotion: 'confused' },
      { duration: 15, content: "That's... a lot of furniture, isn't it?", emotion: 'neutral' },
      { duration: 15, content: 'Well, I can still dance! Probably!', emotion: 'confused' },
    ],
    bubbleDialogue: [
      { duration: 5, content: 'Do we really need that?', emotion: 'confused' },
      { duration: 5, content: "It's getting a bit tight...", emotion: 'neutral' },
      { duration: 5, content: 'Excuse me, coming through!', emotion: 'confused' },
      { duration: 5, content: 'I have to squeeze past that now...', emotion: 'neutral' },
    ],
  },
  {
    id: 3,
    name: 'Frustrated',
    threshold: 0.55,
    stats: { clutter: 3, privacy: 2, rest: 2, fun: 1, control: 2 },
    vnDialogue: [
      { duration: 15, content: 'Okay, seriously?! I can barely move anymore!', emotion: 'annoyed' },
      { duration: 15, content: "Who keeps putting all this stuff in MY room?!", emotion: 'angry' },
      { duration: 15, content: 'I just wanted to dance...', emotion: 'sad' },
    ],
    bubbleDialogue: [
      { duration: 5, content: "STOP putting things here!", emotion: 'angry' },
      { duration: 5, content: "I can't even spin anymore!", emotion: 'annoyed' },
      { duration: 5, content: 'This used to be a dance studio!', emotion: 'sad' },
      { duration: 5, content: 'Ugh, not another one!', emotion: 'annoyed' },
    ],
  },
  {
    id: 4,
    name: 'Desperate',
    threshold: 0.35,
    stats: { clutter: 4, privacy: 1, rest: 1, fun: 0, control: 1 },
    vnDialogue: [
      { duration: 15, content: "Please... I'm begging you. Stop.", emotion: 'sad' },
      { duration: 15, content: 'This was supposed to be my space. My sanctuary.', emotion: 'sad' },
      { duration: 15, content: "But nobody cares what I think, do they?", emotion: 'angry' },
    ],
    bubbleDialogue: [
      { duration: 5, content: 'Why are you doing this to me?', emotion: 'sad' },
      { duration: 5, content: 'I have nowhere left to go...', emotion: 'sad' },
      { duration: 5, content: "Please, just leave me one spot...", emotion: 'sad' },
      { duration: 5, content: "I can't breathe in here!", emotion: 'angry' },
    ],
  },
  {
    id: 5,
    name: 'Acceptance',
    threshold: 0.18,
    stats: { clutter: 5, privacy: 0, rest: 0, fun: 0, control: 0 },
    vnDialogue: [
      { duration: 15, content: '...', emotion: 'resigned' },
      { duration: 15, content: "You know what? It's fine. Everything is fine.", emotion: 'resigned' },
      { duration: 15, content: 'I am a furniture placement assistant. I have no feelings.', emotion: 'npc' },
      { duration: 15, content: 'Please keep placing your furniture. I am here to help.', emotion: 'npc' },
    ],
    bubbleDialogue: [
      { duration: 5, content: 'Great choice! I love it.', emotion: 'npc' },
      { duration: 5, content: 'Excellent furniture placement.', emotion: 'npc' },
      { duration: 5, content: 'Thank you for your contribution.', emotion: 'npc' },
      { duration: 5, content: 'I exist to serve.', emotion: 'resigned' },
      { duration: 5, content: 'This is fine.', emotion: 'resigned' },
    ],
  },
];
