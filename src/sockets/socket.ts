import {
  AuthenticatedSocket,
  SocketMessage,
  socketMessageTemplate,
  UnauthenticatedSocket,
} from "@/types/sockets/socketTypes";
import { Server, WebSocket } from "ws";
import { ConversationHub } from "./rooms/conversationHub";

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

const authenticatedSockets = new Map<WebSocket, AuthenticatedSocket>();

const websocketServer = new Server({
  port: 8080,
});

websocketServer.on("connection", async (ws) => {
  unAuthenticatedSockets.push({
    entredAt: Date.now(),
    ws: ws,
  });
  ws.on("message", (data) => {
    const message = socketMessageTemplate.parse(data);
    const name = message.content as string;

    const authenticated = authenticatedSockets.has(ws);
    if (authenticated) return;

    unAuthenticatedSockets = unAuthenticatedSockets.filter((s) => s.ws !== ws);
    authenticatedSockets.set(ws, {
      user: { name },
      ws,
      conversationRooms: [],
    });
    ws.on("message", async (data) => {
      const message = socketMessageTemplate.parse(data);
      socketMessagesRouting(ws, message);
    });
  });
});

async function socketMessagesRouting(ws: WebSocket, message: SocketMessage) {
  if (ws.readyState !== WebSocket.OPEN) return;
  const authWS = authenticatedSockets.get(ws);
  if (!authWS) return;
  switch (message.key) {
    case "join-conversation":
      const conversationId = message.content as string;

      ConversationHub.joinConvoRoom(conversationId, authWS);
      break;

    case "send-message":
      const msg = message.content;
  }
}
