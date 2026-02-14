const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8787;
const wss = new WebSocketServer({ port: PORT });

console.log(` WebSocket relay running on ws://0.0.0.0:${PORT}`);

wss.on("connection", (ws) => {
  console.log("📲 client connected");

  ws.on("message", (raw) => {
    const msg = raw.toString();
    console.log("📨 relay got:", msg);

    // broadcast to everyone else
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(msg);
      }
    });
  });

  ws.on("close", () => {
    console.log(" client disconnected");
  });
});
