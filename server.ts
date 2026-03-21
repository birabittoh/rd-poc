import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

import { PLACEMENT_COOLDOWN, PREMADE_MESSAGES, CHAT_COOLDOWN } from './src/constants.ts';
import type { GameState, ChatMessage } from './src/types.ts';
import { stepBallerina, placeFurniture, createInitialState } from './src/gameLogic.ts';

const PORT = 3000;
const PLACEMENT_COOLDOWN_MS = PLACEMENT_COOLDOWN * 1000;
const CHAT_COOLDOWN_MS = CHAT_COOLDOWN * 1000;
const MAX_CHAT_HISTORY = 100;

// Release timestamp (optional)
const RELEASE_TIMESTAMP_STR = process.env.VITE_RELEASE_TIMESTAMP || '';
const RELEASE_TIMESTAMP = RELEASE_TIMESTAMP_STR
  ? new Date(RELEASE_TIMESTAMP_STR).getTime()
  : null;

if (RELEASE_TIMESTAMP !== null) {
  if (isNaN(RELEASE_TIMESTAMP)) {
    console.error(`Invalid VITE_RELEASE_TIMESTAMP: "${RELEASE_TIMESTAMP_STR}"`);
    process.exit(1);
  }
  console.log(`Waiting room enabled. Release at: ${new Date(RELEASE_TIMESTAMP).toISOString()}`);
}

let gameState: GameState = createInitialState();

const clients = new Map<WebSocket, string>(); // ws -> ip
const cooldowns = new Map<string, number>(); // ip -> cooldown end timestamp

// --- Waiting room state ---
interface ServerUser {
  uuid: string;
  name: string;
  coins: number;
  online: boolean;
  ws: WebSocket | null;
}

const waitingRoomUsers = new Map<string, ServerUser>(); // uuid -> user
const wsToUuid = new Map<WebSocket, string>(); // ws -> uuid (reverse lookup)
let userCounter = 0;
let released = false;
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
  } else {
    // New user
    const uuid = crypto.randomUUID();
    const name = `user${String(userCounter++).padStart(4, '0')}`;
    user = { uuid, name, coins: 100, online: true, ws };
    waitingRoomUsers.set(uuid, user);
    wsToUuid.set(ws, uuid);
  }

  // Send registration confirmation
  ws.send(
    JSON.stringify({
      type: 'registered',
      uuid: user.uuid,
      name: user.name,
      coins: user.coins,
      releaseTimestamp: RELEASE_TIMESTAMP_STR,
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
  const now = Date.now();
  for (const [client, ip] of clients.entries()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stateMessage);

      const cooldownEnd = cooldowns.get(ip) || 0;
      const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
      client.send(JSON.stringify({ type: 'cooldown', remaining }));
    }
  }
}

// Game loop
setInterval(() => {
  gameState = stepBallerina(gameState);
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
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress || 'unknown';
    clients.set(ws, ip);

    // Send initial game state
    ws.send(JSON.stringify({ type: 'state', state: gameState }));
    const now = Date.now();
    const cooldownEnd = cooldowns.get(ip) || 0;
    const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
    ws.send(JSON.stringify({ type: 'cooldown', remaining }));

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'place_furniture') {
          const ip = clients.get(ws);
          if (!ip) return;

          const now = Date.now();
          const cooldownEnd = cooldowns.get(ip) || 0;
          if (now < cooldownEnd) return;

          const newState = placeFurniture(gameState, message.payload);
          if (!newState) return;

          gameState = newState;
          cooldowns.set(ip, now + PLACEMENT_COOLDOWN_MS);
          broadcastState();
        } else if (message.type === 'reset') {
          gameState = createInitialState();
          broadcastState();
        } else if (message.type === 'register' && RELEASE_TIMESTAMP !== null) {
          handleRegister(ws, message.uuid ?? null);
        } else if (message.type === 'chat' && RELEASE_TIMESTAMP !== null) {
          handleChat(ws, message.messageIndex);
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
