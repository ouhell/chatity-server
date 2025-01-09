import {
  AuthenticatedSocket,
  UnauthenticatedSocket,
} from "@/types/sockets/socketTypes";
import { WebSocket } from "ws";
import { ConversationHub } from "../rooms/ConversationHub";

export class SocketAuthenticator {
  private static authenticatedSockets: Map<WebSocket, AuthenticatedSocket> =
    new Map();
  private static unauthenticatedSockets: Map<WebSocket, UnauthenticatedSocket> =
    new Map();

  public static getAuthenticatedSocket(ws: WebSocket) {
    return this.authenticatedSockets.get(ws);
  }

  public static removeAuthenticatedSocket(ws: WebSocket) {
    const authenticatedWS = this.getAuthenticatedSocket(ws);
    if (!authenticatedWS) return;

    authenticatedWS.conversationRooms.forEach((conversationId) => {
      ConversationHub.leaveConvoRoom(conversationId, authenticatedWS);
    });

    this.authenticatedSockets.delete(ws);
  }

  public static authenticateSocket(ws: WebSocket, username: string) {
    if (this.authenticatedSockets.has(ws)) return;

    if (!this.unauthenticatedSockets.has(ws)) return;
    this.removeUnauthenticatedSocket(ws);
    this.authenticatedSockets.set(ws, {
      user: {
        name: username,
      },
      ws: ws,
      conversationRooms: [],
    });
  }
  public static getUnauthenticatedSocket(ws: WebSocket) {
    return this.unauthenticatedSockets.get(ws);
  }

  public static removeUnauthenticatedSocket(ws: WebSocket) {
    this.unauthenticatedSockets.delete(ws);
  }

  public static registerUnauthenticatedSocket(ws: WebSocket) {
    if (
      this.unauthenticatedSockets.has(ws) ||
      this.authenticatedSockets.has(ws)
    )
      return;

    this.unauthenticatedSockets.set(ws, {
      entredAt: Date.now(),
      ws: ws,
    });
  }
}
