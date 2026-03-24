import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

import { PREMADE_MESSAGES, CHAT_COOLDOWN, EMOJI_LIST } from './src/constants.ts';
import type { GameState, ChatMessage } from './src/types.ts';
import {
  stepBallerina,
  placeFurniture,
  createInitialState,
  checkPhaseTransition,
  forceAdvancePhase,
  tryTriggerBubble,
  checkBubbleExpiry,
  tickVnAdvance,
} from './src/gameLogic.ts';
import {
  INITIAL_COINS,
  INITIAL_SPARKLES,
  DEFAULT_UNLOCKED_EMOJIS,
  EMOJI_COIN_REWARDS,
  EMOJI_UNLOCK_COSTS,
  ITEM_COIN_COSTS,
  ITEM_SPARKLE_REWARDS,
  ITEM_MAX_PLACEMENTS,
  ENFORCE_FURNITURE_LIMIT,
} from './src/economy.ts';
import type { ItemType } from './src/types.ts';

const PORT = parseInt(process.env.PORT || '3000', 10);
const CHAT_COOLDOWN_MS = CHAT_COOLDOWN * 1000;
const MAX_CHAT_HISTORY = 100;

// Cheats mode
const CHEATS = process.env.CHEATS === 'true';
if (CHEATS) console.log('CHEATS enabled: all users start with 99999 coins and 99999 sparkles');

// Release timestamp (optional)
const RELEASE_TIMESTAMP_STR = process.env.RELEASE_TIMESTAMP || '';
const RELEASE_TIMESTAMP = RELEASE_TIMESTAMP_STR
  ? new Date(RELEASE_TIMESTAMP_STR).getTime()
  : null;

if (RELEASE_TIMESTAMP !== null) {
  if (isNaN(RELEASE_TIMESTAMP)) {
    console.error(`Invalid RELEASE_TIMESTAMP: "${RELEASE_TIMESTAMP_STR}"`);
    process.exit(1);
  }
  console.log(`Waiting room enabled. Release at: ${new Date(RELEASE_TIMESTAMP).toISOString()}`);
}

let gameState: GameState = createInitialState();

const clients = new Map<WebSocket, string>(); // ws -> ip

// --- Waiting room state ---
interface ServerUser {
  uuid: string;
  name: string;
  coins: number;
  sparkles: number;
  unlockedEmojis: number[];
  itemPlacements: Record<string, number>; // itemType -> count placed by this user
  online: boolean;
  ws: WebSocket | null;
}

const waitingRoomUsers = new Map<string, ServerUser>(); // uuid -> user
const wsToUuid = new Map<WebSocket, string>(); // ws -> uuid (reverse lookup)
let userCounter = 0;
let released = false;

function logAction(ws: WebSocket, action: string, data: any = {}) {
  const ip = clients.get(ws) || 'unknown';
  const uuid = wsToUuid.get(ws) || 'anonymous';
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip,
    uuid,
    action,
    ...data,
  };
  console.log(JSON.stringify(logEntry));
}
const chatHistory: ChatMessage[] = [];
const chatCooldowns = new Map<string, number>(); // uuid -> last chat timestamp

function generateChatId(): string {
  return crypto.randomUUID();
}

function broadcastToAll(message: string) {
  for (const [client] of clients.entries()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function broadcastUserList() {
  const users = Array.from(waitingRoomUsers.values()).map((u) => ({
    name: u.name,
    online: u.online,
  }));
  broadcastToAll(JSON.stringify({ type: 'user_list', users }));
}

function broadcastChatMessage(msg: ChatMessage) {
  chatHistory.push(msg);
  if (chatHistory.length > MAX_CHAT_HISTORY) {
    chatHistory.shift();
  }
  broadcastToAll(JSON.stringify({ type: 'chat_broadcast', message: msg }));
}

function sendCurrencyUpdate(
  ws: WebSocket,
  user: ServerUser,
  earned?: { coins?: number; sparkles?: number },
  emojiUnlocked?: number
) {
  ws.send(
    JSON.stringify({
      type: 'currency_update',
      coins: user.coins,
      sparkles: user.sparkles,
      unlockedEmojis: user.unlockedEmojis,
      itemPlacements: user.itemPlacements,
      ...(earned && { earned }),
      ...(emojiUnlocked !== undefined && { emojiUnlocked }),
    })
  );
}

function handleRegister(ws: WebSocket, incomingUuid: string | null) {
  let user: ServerUser | undefined;

  if (incomingUuid) {
    user = waitingRoomUsers.get(incomingUuid);
  }

  if (user) {
    // Returning user
    // If old ws is still in maps, clean it up
    if (user.ws && user.ws !== ws) {
      wsToUuid.delete(user.ws);
    }
    user.online = true;
    user.ws = ws;
    wsToUuid.set(ws, user.uuid);
    logAction(ws, 'login', { status: 'returning', name: user.name });
  } else {
    // New user
    const uuid = crypto.randomUUID();
    const name = `user${String(userCounter++).padStart(4, '0')}`;
    user = {
      uuid,
      name,
      coins: CHEATS ? 99999 : INITIAL_COINS,
      sparkles: CHEATS ? 99999 : INITIAL_SPARKLES,
      unlockedEmojis: [...DEFAULT_UNLOCKED_EMOJIS],
      itemPlacements: {},
      online: true,
      ws,
    };
    waitingRoomUsers.set(uuid, user);
    wsToUuid.set(ws, uuid);
    logAction(ws, 'login', { status: 'new', name: user.name });
  }

  // Send registration confirmation
  ws.send(
    JSON.stringify({
      type: 'registered',
      uuid: user.uuid,
      name: user.name,
      coins: user.coins,
      sparkles: user.sparkles,
      unlockedEmojis: user.unlockedEmojis,
      itemPlacements: user.itemPlacements,
      releaseTimestamp: RELEASE_TIMESTAMP_STR,
      cheats: CHEATS,
    })
  );

  // Send chat history
  for (const msg of chatHistory) {
    ws.send(JSON.stringify({ type: 'chat_broadcast', message: msg }));
  }

  // Broadcast join message
  broadcastChatMessage({
    id: generateChatId(),
    type: 'system',
    text: `${user.name} has joined`,
    timestamp: Date.now(),
  });

  broadcastUserList();

  // If already released, tell this client immediately
  if (released) {
    ws.send(JSON.stringify({ type: 'release' }));
  }
}

function handleChat(ws: WebSocket, messageIndex: number) {
  const uuid = wsToUuid.get(ws);
  if (!uuid) return;

  const user = waitingRoomUsers.get(uuid);
  if (!user) return;

  // Validate message index
  if (messageIndex < 0 || messageIndex >= PREMADE_MESSAGES.length) return;

  // Enforce cooldown
  const now = Date.now();
  const lastChat = chatCooldowns.get(uuid) || 0;
  if (now - lastChat < CHAT_COOLDOWN_MS) return;
  chatCooldowns.set(uuid, now);

  broadcastChatMessage({
    id: generateChatId(),
    type: 'user',
    sender: user.name,
    text: PREMADE_MESSAGES[messageIndex],
    timestamp: now,
  });
}

function handleDisconnect(ws: WebSocket) {
  const uuid = wsToUuid.get(ws);
  if (uuid) {
    const user = waitingRoomUsers.get(uuid);
    if (user) {
      logAction(ws, 'logout', { name: user.name });
      user.online = false;
      user.ws = null;

      broadcastChatMessage({
        id: generateChatId(),
        type: 'system',
        text: `${user.name} has left`,
        timestamp: Date.now(),
      });

      broadcastUserList();
    }
    wsToUuid.delete(ws);
  }
  clients.delete(ws);
}

// --- Game state broadcasting ---

function broadcastState() {
  const stateMessage = JSON.stringify({ type: 'state', state: gameState });
  for (const [client] of clients.entries()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stateMessage);
    }
  }
}

// Game loop - only step ballerina when released (or when no waiting room)
setInterval(() => {
  if (!RELEASE_TIMESTAMP || released) {
    gameState = stepBallerina(gameState);
  }
  // Advance VN dialogue and expire speech bubbles
  gameState = tickVnAdvance(gameState);
  gameState = checkBubbleExpiry(gameState);
  broadcastState();
}, 2000);

// Release timestamp check
if (RELEASE_TIMESTAMP !== null) {
  if (Date.now() >= RELEASE_TIMESTAMP) {
    released = true;
    console.log('Release timestamp already passed, starting in released mode.');
  } else {
    const releaseCheck = setInterval(() => {
      if (Date.now() >= RELEASE_TIMESTAMP) {
        released = true;
        clearInterval(releaseCheck);
        console.log('Release timestamp reached! Broadcasting release to all clients.');
        broadcastToAll(JSON.stringify({ type: 'release' }));
      }
    }, 1000);
  }
}

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) ||
      'unknown';
    clients.set(ws, ip);

    // Send initial game state
    ws.send(JSON.stringify({ type: 'state', state: gameState }));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'place_furniture') {
          // Block placement during VN dialogue
          if (gameState.phaseState.vnActive) return;

          // Look up user for economy
          const uuid = wsToUuid.get(ws);
          if (!uuid) return;
          const user = waitingRoomUsers.get(uuid);
          if (!user) return;

          const itemType = message.payload?.type;
          if (!itemType || !(itemType in ITEM_COIN_COSTS)) return;

          const typedItemType = itemType as ItemType;
          const cost = ITEM_COIN_COSTS[typedItemType];
          if (user.coins < cost) {
            logAction(ws, 'transaction_failed', { reason: 'insufficient_coins', itemType: typedItemType });
            ws.send(JSON.stringify({ type: 'transaction_failed', reason: 'insufficient_coins' }));
            return;
          }

          // Enforce per-user placement limit
          const currentPlacements = user.itemPlacements[typedItemType] || 0;
          if (ENFORCE_FURNITURE_LIMIT) {
            const maxPlacements = ITEM_MAX_PLACEMENTS[typedItemType];
            if (currentPlacements >= maxPlacements) {
              ws.send(JSON.stringify({ type: 'transaction_failed', reason: 'placement_limit_reached' }));
              return;
            }
          }

          const newState = placeFurniture(gameState, message.payload);
          if (!newState) {
            logAction(ws, 'placement_failed', {
              itemType: typedItemType,
              coords: { x: message.payload.x, y: message.payload.y, z: message.payload.z },
            });
            return;
          }

          logAction(ws, 'place_furniture', {
            itemType: typedItemType,
            variant: message.payload.variant,
            coords: { x: message.payload.x, y: message.payload.y, z: message.payload.z },
          });

          // Deduct coins, award sparkles, track placement
          user.coins -= cost;
          user.itemPlacements[typedItemType] = currentPlacements + 1;
          const sparkleReward = ITEM_SPARKLE_REWARDS[typedItemType];
          user.sparkles += sparkleReward;

          gameState = newState;

          // Phase transitions only for floor items
          if (message.payload.z === 0) {
            const afterPhase = checkPhaseTransition(gameState);
            if (afterPhase !== gameState) {
              gameState = afterPhase;
            } else {
              gameState = tryTriggerBubble(gameState);
            }
          }

          broadcastState();
          sendCurrencyUpdate(ws, user, { sparkles: sparkleReward });
        } else if (message.type === 'skip_phase' && CHEATS) {
          gameState = forceAdvancePhase(gameState);
          broadcastState();
        } else if (message.type === 'reset') {
          gameState = createInitialState();
          broadcastState();
        } else if (message.type === 'register') {
          handleRegister(ws, message.uuid ?? null);
        } else if (message.type === 'chat' && RELEASE_TIMESTAMP !== null) {
          handleChat(ws, message.messageIndex);
        } else if (message.type === 'emoji') {
          const emojiIndex = message.index;
          if (typeof emojiIndex !== 'number' || emojiIndex < 0 || emojiIndex >= EMOJI_LIST.length) return;

          // Look up user for economy
          const uuid = wsToUuid.get(ws);
          if (!uuid) return;
          const user = waitingRoomUsers.get(uuid);
          if (!user) return;

          // Validate emoji is unlocked
          if (!user.unlockedEmojis.includes(emojiIndex)) return;

          // Award coins
          const coinReward = EMOJI_COIN_REWARDS[emojiIndex];
          user.coins += coinReward;
          sendCurrencyUpdate(ws, user, { coins: coinReward });

          // Broadcast emoji to other clients
          const broadcastMsg = JSON.stringify({ type: 'emoji_broadcast', index: emojiIndex });
          for (const [client] of clients.entries()) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(broadcastMsg);
            }
          }
        } else if (message.type === 'unlock_emoji') {
          const emojiIndex = message.index;
          if (typeof emojiIndex !== 'number' || emojiIndex < 0 || emojiIndex >= EMOJI_LIST.length) return;

          const uuid = wsToUuid.get(ws);
          if (!uuid) return;
          const user = waitingRoomUsers.get(uuid);
          if (!user) return;

          // Already unlocked?
          if (user.unlockedEmojis.includes(emojiIndex)) return;

          // Phase locked?
          const emojiDef = EMOJI_LIST[emojiIndex];
          if (gameState.phaseState.currentPhase < emojiDef.unlocksAtPhase) {
            ws.send(JSON.stringify({ type: 'transaction_failed', reason: 'phase_locked' }));
            return;
          }

          // Check sparkles
          const cost = EMOJI_UNLOCK_COSTS[emojiIndex];
          if (user.sparkles < cost) {
            ws.send(JSON.stringify({ type: 'transaction_failed', reason: 'insufficient_sparkles' }));
            return;
          }

          // Deduct sparkles, unlock emoji
          user.sparkles -= cost;
          user.unlockedEmojis.push(emojiIndex);
          logAction(ws, 'unlock_emoji', {
            emojiIndex,
            emoji: emojiDef.emoji,
          });
          sendCurrencyUpdate(ws, user, undefined, emojiIndex);
        }
      } catch (e) {
        console.error('Invalid message', e);
      }
    });

    ws.on('close', () => {
      handleDisconnect(ws);
    });
  });

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
