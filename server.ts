import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

import { PLACEMENT_COOLDOWN } from "./src/constants.ts";
import { GameState } from "./src/types.ts";
import { stepBallerina, placeFurniture, createInitialState } from "./src/gameLogic.ts";

const PORT = 3000;
const PLACEMENT_COOLDOWN_MS = PLACEMENT_COOLDOWN * 1000;

let gameState: GameState = createInitialState();

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

// Game loop
setInterval(() => {
  gameState = stepBallerina(gameState);
  broadcastState();
}, 2000);

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
        } else if (message.type === "reset") {
          gameState = createInitialState();
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
