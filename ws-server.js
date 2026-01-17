import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import fetch from "node-fetch";

const server = http.createServer();
const wss = new WebSocketServer({ server });

wss.on("connection", ws => {
  ws.on("message", async msg => {
    try {
      const req = JSON.parse(msg.toString());

      const res = await fetch(req.url, {
        method: req.method || "GET",
        headers: req.headers || {},
        body: req.body || null
      });

      const text = await res.text();

      ws.send(JSON.stringify({
        id: req.id,
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body: text
      }));
    } catch (e) {
      ws.send(JSON.stringify({
        error: true,
        message: e.message
      }));
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("WS server listening on port " + PORT);
});
