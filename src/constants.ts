export const GRID_SIZE = 9;
export const TILE_SIZE = 1;
export const CENTER = Math.floor(GRID_SIZE / 2);

export const COLORS = {
  WALL: '#D4AFCD',
  FLOOR: '#E2C290',
  BACKGROUND: '#0B0033',
  DOOR_BORDER: '#D4AFCD',
  DOOR: '#820263',
  DOOR_HANDLE: '#E2C290',
};

export const PREMADE_MESSAGES = [
  'Hello everyone!',
  "Can't wait to start!",
  "Let's go!",
  'Nice to meet you all',
  'Ready!',
  'This is exciting!',
  'Good luck everyone!',
  'Hi there!',
];

export const CHAT_COOLDOWN = 2; // seconds

export const EMOJI_LIST = [
  { emoji: '💖', sfx: 'pop', unlocksAtPhase: 0 },
  { emoji: '🥳', sfx: 'squee', unlocksAtPhase: 0 },
  { emoji: '😍', sfx: 'aww', unlocksAtPhase: 0 },
  { emoji: '🐰', sfx: 'jump', unlocksAtPhase: 1 },
  { emoji: '✨', sfx: 'sparkle', unlocksAtPhase: 1 },
  { emoji: '👀', sfx: 'ooh', unlocksAtPhase: 1 },
  { emoji: '💋', sfx: 'kiss', unlocksAtPhase: 2 },
  { emoji: '🎉', sfx: 'firecracker', unlocksAtPhase: 2 },
  { emoji: '👹', sfx: 'neighbor', unlocksAtPhase: 2 },
  { emoji: '👻', sfx: 'ghost', unlocksAtPhase: 3 },
  { emoji: '👽', sfx: 'alien', unlocksAtPhase: 3 },
  { emoji: '📣', sfx: 'airhorn', unlocksAtPhase: 4 },
  { emoji: '👏', sfx: 'applause', unlocksAtPhase: 4 },
] as const;
