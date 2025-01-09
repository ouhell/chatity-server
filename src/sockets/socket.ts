import { Server, WebSocketServer, WebSocket } from "ws";
import { z } from "zod";

type UnauthenticatedSocket = {
  entredAt: number;
  ws: WebSocket;
};

let unAuthenticatedSockets: UnauthenticatedSocket[] = [];

setInterval(() => {
  const now = Date.now();
  const fiveMinutes = 1000 * 60 * 5;
  unAuthenticatedSockets.forEach((s) => {
    if (now - s.entredAt >= fiveMinutes) {
      s.ws.close();
    }
  });
  unAuthenticatedSockets = unAuthenticatedSockets.filter(
    (s) => s.ws.readyState !== WebSocket.CLOSED
  );
}, 5000);

type AuthenticatedSocket = {
  user: {
    name: string;
  };
  ws: WebSocket;
};

const authenticatedSockets = new Map<WebSocket, AuthenticatedSocket>();
const conversationRooms = new Map<
  string,
  Map<WebSocket, AuthenticatedSocket>
>();

const socketMessageTemplate = z.object({
  key: z.string(),
  content: z.any(),
  sentAt: z.number(),
});

type SocketMessage = z.infer<typeof socketMessageTemplate>;

const websocketServer = new Server({
  port: 8080,
});

websocketServer.on("connection", async (ws) => {
  ws.on("message", (data) => {
    const message = socketMessageTemplate.parse(data);
    const name = message.content as string;

    const authenticated = authenticatedSockets.has(ws);
    if (authenticated) return;

    unAuthenticatedSockets = unAuthenticatedSockets.filter((s) => s.ws !== ws);
    authenticatedSockets.set(ws, {
      user: { name },
      ws,
    });
    ws.on("message", async (data) => {
      const message = socketMessageTemplate.parse(data);
      socketMessagesRouting(ws, message);
    });
  });
});

async function socketMessagesRouting(ws: WebSocket, message: SocketMessage) {
  switch (message.key) {
    case "authenticate":
      const name = message.content as string;
      const authenticated = authenticatedSockets.has(ws);
      if (authenticated) return;

      unAuthenticatedSockets = unAuthenticatedSockets.filter(
        (s) => s.ws !== ws
      );
      authenticatedSockets.set(ws, {
        user: { name },
        ws,
      });
      break;
    case "join-conversation":
      const conversationId = message.content as string;

      const convRoom = conversationRooms.get(conversationId);
      if (!convRoom) return;
      if (convRoom.has(ws)) return;
      const authWs = authenticatedSockets.get(ws);
      if (!authWs) return;
      convRoom.set(ws, authWs);
      break;
  }
}
