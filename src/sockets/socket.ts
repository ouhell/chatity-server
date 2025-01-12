import {
  AuthenticatedSocket,
  SocketMessage,
  socketMessageTemplate,
  UnauthenticatedSocket,
} from "@/types/sockets/socketTypes";
import { Server, WebSocket } from "ws";
import { ConversationHub } from "./rooms/ConversationHub";
import { SocketAuthenticator } from "./authentication/SocketAuthenticator";
import logger from "@/utils/logger";
const parseSocketMessage = (message: any) => {
  if (typeof message !== "string") {
    console.log("typeof message", message);
    throw new Error("message is not json string");
  }

  const object = JSON.parse(message);

  return socketMessageTemplate.parse(object);
};

export const startSocketServer = () => {
  logger.info("STARTED SOCKET SERVER :::::::");
  const websocketServer = new Server({
    port: 8080,
  });

  websocketServer.on("connection", async (ws) => {
    console.log("socket connected");
    SocketAuthenticator.registerUnauthenticatedSocket(ws);

    ws.on("message", (data) => {
      const message = parseSocketMessage(data.toString());
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
};
