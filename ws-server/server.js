// ws-server/server.js
import { WebSocketServer } from "ws";

const PORT = process.env.PORT || 8787;
const wss = new WebSocketServer({ port: PORT });

const peers = new Map(); // ws -> { id, room }

function broadcast(room, payload, exceptWs = null) {
  const msg = JSON.stringify(payload);
  for (const [ws, meta] of peers.entries()) {
    if (ws.readyState === 1 && meta?.room === room && ws !== exceptWs) {
      ws.send(msg);
    }
  }
}

wss.on("connection", (ws) => {
  peers.set(ws, { id: null, room: "default" });

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      return;
    }

    // handshake
    if (data.type === "HELLO") {
      const meta = peers.get(ws) || {};
      meta.id = data.id || null;
      meta.room = data.room || "default";
      peers.set(ws, meta);

      ws.send(JSON.stringify({ type: "WELCOME", room: meta.room }));
      broadcast(meta.room, { type: "PEERS_CHANGED" });
      return;
    }

    // relay alerts
    if (data.type === "ALERT") {
      const meta = peers.get(ws);
      const room = meta?.room || "default";
      broadcast(room, data, ws);
      return;
    }
  });

  ws.on("close", () => {
    const meta = peers.get(ws);
    peers.delete(ws);
    broadcast(meta?.room || "default", { type: "PEERS_CHANGED" });
  });
});

console.log(`✅ WebSocket relay running on ws://0.0.0.0:${PORT}`);
