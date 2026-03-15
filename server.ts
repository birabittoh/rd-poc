import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

import { PLACEMENT_COOLDOWN } from "./src/constants.ts";
import { ItemType, Furniture, GameState, Ballerina } from "./src/types.ts";
import { ITEM_DEFINITIONS } from "./src/items.ts";

const PORT = 3000;
const GRID_SIZE = 9; // 9x9 grid, center is (4, 4)
const CENTER = Math.floor(GRID_SIZE / 2);
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

function getOccupiedTiles(item: Furniture) {
  const def = ITEM_DEFINITIONS[item.type];
  const tiles: { x: number; y: number }[] = [{ x: item.x, y: item.y }];

  if (def.size > 1) {
    const rotation = item.rotation || 0;
    const dx = Math.round(Math.sin(rotation));
    const dy = Math.round(Math.cos(rotation));

    for (let i = 1; i < def.size; i++) {
      tiles.push({
        x: item.x + dx * i,
        y: item.y + dy * i,
      });
    }
  }
  return tiles;
}

function getGridOccupancy() {
  const grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(false));

  for (const item of gameState.furniture) {
    if (item.z === 0) {
      const tiles = getOccupiedTiles(item);
      for (const tile of tiles) {
        if (tile.x >= 0 && tile.x < GRID_SIZE && tile.y >= 0 && tile.y < GRID_SIZE) {
          grid[tile.y][tile.x] = true;
        }
      }
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

          const { type, x, y, z, rotation: manualRotation } = message.payload;
          const def = ITEM_DEFINITIONS[type as ItemType];
          if (!def) return;

          let rotation = manualRotation || 0;

          // Rotation Strategies
          if (def.rotationStrategy === "faceNearest" && def.facingType) {
            const targets = gameState.furniture.filter((f) => f.type === def.facingType);
            if (targets.length > 0) {
              let nearest = targets[0];
              let minDist = Infinity;
              for (const t of targets) {
                const dist = Math.abs(t.x - x) + Math.abs(t.y - y);
                if (dist < minDist) {
                  minDist = dist;
                  nearest = t;
                }
              }
              const dx = nearest.x - x;
              const dy = nearest.y - y;
              if (Math.abs(dx) > Math.abs(dy)) {
                rotation = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
              } else {
                rotation = dy > 0 ? 0 : Math.PI;
              }
            }
          } else if (def.rotationStrategy === "faceAwayFromWall") {
            const distLeft = x;
            const distRight = GRID_SIZE - 1 - x;
            const distTop = y;
            const distBottom = GRID_SIZE - 1 - y;
            const minDist = Math.min(distLeft, distRight, distTop, distBottom);
            if (minDist === distTop) rotation = 0;
            else if (minDist === distBottom) rotation = Math.PI;
            else if (minDist === distLeft) rotation = Math.PI / 2;
            else if (minDist === distRight) rotation = -Math.PI / 2;
          }

          const newItem: Furniture = {
            id: Math.random().toString(36).substring(2, 9),
            type: type as ItemType,
            x,
            y,
            z,
            rotation,
          };

          const newTiles = getOccupiedTiles(newItem);

          // Validate bounds
          if (newTiles.some((t) => t.x < 0 || t.x >= GRID_SIZE || t.y < 0 || t.y >= GRID_SIZE)) return;

          // Check Ballerina
          if (z === 0 && newTiles.some((t) => t.x === gameState.ballerina.targetX && t.y === gameState.ballerina.targetY)) return;

          // Check Occupancy & Stacking
          const existingAtLevel = gameState.furniture.filter((f) => f.z === z);
          const isOccupied = existingAtLevel.some((f) => {
            const tiles = getOccupiedTiles(f);
            return tiles.some((t1) => newTiles.some((t2) => t1.x === t2.x && t1.y === t2.y));
          });

          if (isOccupied) {
            if (def.stackable) {
              // Try to stack
              const baseItem = gameState.furniture.find((f) => {
                if (f.type !== type || f.z !== z) return false;
                const tiles = getOccupiedTiles(f);
                return (
                  tiles.length === newTiles.length &&
                  tiles.every((t1, i) => t1.x === newTiles[i].x && t1.y === newTiles[i].y) &&
                  f.rotation === rotation
                );
              });
              if (baseItem) {
                // Stack it
                newItem.z = baseItem.z + 1;
                // Re-check stacking at new level
                const occupiedAtNewLevel = gameState.furniture.some((f) => {
                  if (f.z !== newItem.z) return false;
                  const tiles = getOccupiedTiles(f);
                  return tiles.some((t1) => newTiles.some((t2) => t1.x === t2.x && t1.y === t2.y));
                });
                if (occupiedAtNewLevel) return;
              } else {
                return;
              }
            } else {
              return;
            }
          }

          // Joining Logic (Inherit rotation from identical adjacent item)
          if (def.connectable) {
            const adjacentIdentical = gameState.furniture.find((f) => {
              if (f.type !== type || f.z !== newItem.z) return false;
              const tiles = getOccupiedTiles(f);
              return tiles.some((t1) => newTiles.some((t2) => Math.abs(t1.x - t2.x) + Math.abs(t1.y - t2.y) === 1));
            });
            if (adjacentIdentical) {
              newItem.rotation = adjacentIdentical.rotation;
              // Recalculate tiles with inherited rotation
              const updatedTiles = getOccupiedTiles(newItem);
              // Re-validate occupancy with new rotation
              const stillOccupied = existingAtLevel.some((f) => {
                const tiles = getOccupiedTiles(f);
                return tiles.some((t1) => updatedTiles.some((t2) => t1.x === t2.x && t1.y === t2.y));
              });
              if (stillOccupied) {
                // If it can't join with that rotation, just use original
                newItem.rotation = rotation;
              }
            }
          }

          // Adjacency check for floor items
          if (newItem.z === 0) {
            const isAdjacentToWall = newTiles.some((t) => t.x === 0 || t.x === GRID_SIZE - 1 || t.y === 0 || t.y === GRID_SIZE - 1);
            const isAdjacentToFurniture = gameState.furniture.some((f) => {
              if (f.z !== 0) return false;
              const tiles = getOccupiedTiles(f);
              return tiles.some((t1) => newTiles.some((t2) => Math.abs(t1.x - t2.x) + Math.abs(t1.y - t2.y) === 1));
            });
            if (!isAdjacentToWall && !isAdjacentToFurniture) return;
          }

          gameState.furniture.push(newItem);
          cooldowns.set(ip, now + PLACEMENT_COOLDOWN_MS);

          // Update related items rotations
          for (const item of gameState.furniture) {
            const itemDef = ITEM_DEFINITIONS[item.type];
            if (itemDef.rotationStrategy === "faceNearest" && itemDef.facingType === type) {
              const targets = gameState.furniture.filter((f) => f.type === type);
              let nearest = targets[0];
              let minDist = Infinity;
              for (const t of targets) {
                const dist = Math.abs(t.x - item.x) + Math.abs(t.y - item.y);
                if (dist < minDist) {
                  minDist = dist;
                  nearest = t;
                }
              }
              const dx = nearest.x - item.x;
              const dy = nearest.y - item.y;
              if (Math.abs(dx) > Math.abs(dy)) {
                item.rotation = dx > 0 ? Math.PI / 2 : -Math.PI / 2;
              } else {
                item.rotation = dy > 0 ? 0 : Math.PI;
              }
            }
          }

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
