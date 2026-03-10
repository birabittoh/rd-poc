import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

import { PLACEMENT_COOLDOWN, GRID_SIZE, CENTER } from "./src/constants.ts";
import { GameState, ItemType, Furniture } from "./src/types.ts";
import { ITEM_DEFINITIONS } from "./src/items.ts";

const PORT = 3000;
const PLACEMENT_COOLDOWN_MS = PLACEMENT_COOLDOWN * 1000;

let gameState: GameState = {
  furniture: [],
  ballerina: {
    x: CENTER,
    y: CENTER,
    targetX: CENTER,
    targetY: CENTER,
    isDancing: false,
  },
  status: "playing",
};

const clients = new Map<WebSocket, string>();
const cooldowns = new Map<string, number>();

function broadcastState() {
  const stateMessage = JSON.stringify({ type: "state", state: gameState });
  const now = Date.now();
  for (const [client, ip] of clients.entries()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(stateMessage);

      const cooldownEnd = cooldowns.get(ip) || 0;
      const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
      client.send(JSON.stringify({ type: "cooldown", remaining }));
    }
  }
}

function getGridOccupancy() {
  const grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(false));
  
  for (const item of gameState.furniture) {
    if (item.z === 0) {
      grid[item.y][item.x] = true;
    }
  }
  return grid;
}

function updateBallerina() {
  if (gameState.status !== "playing") return;

  // Finish current movement
  gameState.ballerina.x = gameState.ballerina.targetX;
  gameState.ballerina.y = gameState.ballerina.targetY;

  const grid = getGridOccupancy();
  const { x, y } = gameState.ballerina;

  const possibleMoves = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ].filter(({ dx, dy }) => {
    const nx = x + dx;
    const ny = y + dy;
    return nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !grid[ny][nx];
  });

  if (possibleMoves.length === 0) {
    // Stuck!
    gameState.status = "game_over";
    gameState.ballerina.isDancing = false;
  } else {
    // 50% chance to dance in place, 50% chance to move
    if (Math.random() < 0.5) {
      gameState.ballerina.isDancing = true;
    } else {
      const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      gameState.ballerina.targetX = x + move.dx;
      gameState.ballerina.targetY = y + move.dy;
      gameState.ballerina.isDancing = false;
    }
  }

  broadcastState();
}

// Game loop
setInterval(updateBallerina, 2000);

function updateRotations(triggeredBy: ItemType) {
  for (const item of gameState.furniture) {
    const definition = ITEM_DEFINITIONS[item.type];
    if (definition.rotationTriggers?.includes(triggeredBy)) {
      item.rotation = definition.findRotation(item.x, item.y, gameState.furniture);
    }
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress || "unknown";
    clients.set(ws, ip);

    ws.send(JSON.stringify({ type: "state", state: gameState }));
    const now = Date.now();
    const cooldownEnd = cooldowns.get(ip) || 0;
    const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
    ws.send(JSON.stringify({ type: "cooldown", remaining }));

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "place_furniture") {
          if (gameState.status !== "playing") return;
          
          const ip = clients.get(ws);
          if (!ip) return;

          const now = Date.now();
          const cooldownEnd = cooldowns.get(ip) || 0;
          if (now < cooldownEnd) return;

          const { type, x, y, z } = message.payload as { type: ItemType; x: number; y: number; z: number };
          const definition = ITEM_DEFINITIONS[type];
          if (!definition) return;
          
          // Validate placement
          if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
          
          // Check if ballerina is there
          if (z === 0 && x === gameState.ballerina.targetX && y === gameState.ballerina.targetY) return;

          // Check if tile is already occupied
          const isOccupied = gameState.furniture.some(f => f.x === x && f.y === y && f.z === z);
          if (isOccupied) return;

          // Adjacency check for floor items
          if (z === 0) {
            const isAdjacentToWall = x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1;
            const isAdjacentToFurniture = gameState.furniture.some(f => f.z === 0 && (Math.abs(f.x - x) + Math.abs(f.y - y) === 1));
            if (!isAdjacentToWall && !isAdjacentToFurniture) return;
          }

          const rotation = definition.findRotation(x, y, gameState.furniture);
          const id = Math.random().toString(36).substring(2, 9);
          gameState.furniture.push({ id, type, x, y, z, rotation });
          
          cooldowns.set(ip, now + PLACEMENT_COOLDOWN_MS);

          updateRotations(type);
          
          broadcastState();
        } else if (message.type === "reset") {
          gameState = {
            furniture: [],
            ballerina: {
              x: CENTER,
              y: CENTER,
              targetX: CENTER,
              targetY: CENTER,
              isDancing: false,
            },
            status: "playing",
          };
          broadcastState();
        }
      } catch (e) {
        console.error("Invalid message", e);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
