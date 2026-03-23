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
      { duration: 7, content: "Oh wow, questa stanza è tutta mia?! È così spaziosa!", emotion: 'excited' },
      { duration: 7, content: "Non vedo l’ora di mettermi a ballare! È perfetta!", emotion: 'happy' },
    ],
    bubbleDialogue: [
      { duration: 5, content: 'Mi piace stare qui!', emotion: 'happy' },
      { duration: 5, content: 'Questo spazio è tutto mio!', emotion: 'excited' },
      { duration: 5, content: 'C’è tanto spazio per ballare.', emotion: 'happy' },
      { duration: 5, content: "Finalmente un posto dove nessuno mi disturba.", emotion: 'neutral' },
    ],
  },
  {
    id: 2,
    name: 'Noticing',
    threshold: 0.75,
    stats: { clutter: 2, privacy: 3, rest: 3, fun: 3, control: 3 },
    vnDialogue: [
      { duration: 7, content: "Chi c'è qui? Chi sta mettendo tutta questa roba?", emotion: 'confused' },
      { duration: 7, content: "La stanza è affollata, ma posso ancora ballare... forse.", emotion: 'neutral' },
    ],
    bubbleDialogue: [
      { duration: 5, content: 'Ci serve davvero?', emotion: 'confused' },
      { duration: 5, content: "Troppa roba!", emotion: 'angry' },
      { duration: 5, content: 'Permesso! Devo passare!', emotion: 'neutral' },
      { duration: 5, content: 'Ok… potete andare più piano?.', emotion: 'confused' },
    ],
  },
  {
    id: 3,
    name: 'Frustrated',
    threshold: 0.55,
    stats: { clutter: 3, privacy: 2, rest: 2, fun: 1, control: 2 },
    vnDialogue: [
      { duration: 7, content: 'Perché continuate?! Non riesco più a muovermi!', emotion: 'annoyed' },
      { duration: 5, content: "Avete rovinato tutto!", emotion: 'angry' },
      { duration: 5, content: 'Io volevo solo ballare...', emotion: 'neutral' },
    ],
    bubbleDialogue: [
      { duration: 5, content: "Fermatevi!", emotion: 'angry' },
      { duration: 5, content: "Questo non rispetta le leggi del feng shui!", emotion: 'annoyed' },
      { duration: 5, content: 'Questa è la MIA stanza!', emotion: 'angry' },
      { duration: 5, content: 'Ugh, troppi mobili!', emotion: 'annoyed' },
    ],
  },
  {
    id: 4,
    name: 'Desperate',
    threshold: 0.35,
    stats: { clutter: 4, privacy: 1, rest: 1, fun: 0, control: 1 },
    vnDialogue: [
      { duration: 7, content: "Per favore… vi prego. Fermatevi.", emotion: 'sad' },
      { duration: 7, content: 'Questo doveva essere il mio spazio. Il mio rifugio.', emotion: 'annoyed' },
      { duration: 7, content: "Ma a nessuno importa, vero?", emotion: 'angry' },
    ],
    bubbleDialogue: [
      { duration: 5, content: 'Perché mi state facendo questo?', emotion: 'angry' },
      { duration: 5, content: 'Non ho più dove andare...', emotion: 'sad' },
      { duration: 5, content: "Vi prego… lasciatemi almeno un posticino...", emotion: 'sad' },
      { duration: 5, content: "Non riesco a respirare qui dentro!", emotion: 'angry' },
    ],
  },
  {
    id: 5,
    name: 'Acceptance',
    threshold: 0.18,
    stats: { clutter: 5, privacy: 0, rest: 0, fun: 0, control: 0 },
    vnDialogue: [
      { duration: 3, content: '...', emotion: 'resigned' },
      { duration: 5, content: "Sai che c'è? Va bene. Va tutto bene.", emotion: 'resigned' },
      { duration: 5, content: "Sono la tua consulente d'arredamento. Non provo niente.", emotion: 'npc' },
      { duration: 5, content: 'Continua pure a posizionare i tuoi mobili. Sono qui per aiutarti.', emotion: 'npc' },
    ],
    bubbleDialogue: [
  { duration: 5, content: 'Ottima scelta! Mi piace molto.', emotion: 'npc' },
  { duration: 5, content: 'Posizionamento del mobile eccellente.', emotion: 'npc' },
  { duration: 5, content: 'Grazie per il tuo contributo.', emotion: 'npc' },
  { duration: 5, content: 'Mi piace questo colore!.', emotion: 'resigned' },
  { duration: 5, content: 'Questa stanza è molto bella.', emotion: 'resigned' },
    ],
  },
];
