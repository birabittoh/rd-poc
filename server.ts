import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const PORT = 3000;
const GRID_SIZE = 9; // 9x9 grid, center is (4, 4)
const CENTER = Math.floor(GRID_SIZE / 2);

type ItemType = "table" | "chair" | "plant" | "lamp" | "vase";
type PlacementType = "floor" | "surface";

interface Furniture {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  z: number; // 0 for floor, 1 for surface
}

interface Ballerina {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isDancing: boolean;
}

interface GameState {
  furniture: Furniture[];
  ballerina: Ballerina;
  status: "playing" | "game_over";
}

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

const clients = new Set<WebSocket>();

function broadcastState() {
  const message = JSON.stringify({ type: "state", state: gameState });
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
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

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.send(JSON.stringify({ type: "state", state: gameState }));

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "place_furniture") {
          if (gameState.status !== "playing") return;
          
          const { type, x, y, z } = message.payload;
          
          // Validate placement
          if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
          
          // Check if ballerina is there
          if (z === 0 && x === gameState.ballerina.targetX && y === gameState.ballerina.targetY) return;

          // Check if tile is already occupied
          const isOccupied = gameState.furniture.some(f => f.x === x && f.y === y && f.z === z);
          if (isOccupied) return;

          const id = Math.random().toString(36).substring(2, 9);
          gameState.furniture.push({ id, type, x, y, z });
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
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
