import {
  AuthenticatedSocket,
  SocketMessage,
  socketMessageTemplate,
  UnauthenticatedSocket,
} from "@/types/sockets/socketTypes";
import { Server, WebSocket } from "ws";
import { ConversationHub } from "./rooms/ConversationHub";
import { SocketAuthenticator } from "./authentication/SocketAuthenticator";

let unAuthenticatedSockets: UnauthenticatedSocket[] = [];

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

    const isAuthenticated = SocketAuthenticator.authenticateSocket(ws, name);
    if (!isAuthenticated) return;
    ws.on("message", async (data) => {
      const message = socketMessageTemplate.parse(data);
      socketMessagesRouting(ws, message);
    });
  });
});

async function socketMessagesRouting(ws: WebSocket, message: SocketMessage) {
  if (ws.readyState !== WebSocket.OPEN) return;
  const authWS = SocketAuthenticator.getAuthenticatedSocket(ws);
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
