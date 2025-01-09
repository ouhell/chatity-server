import { AuthenticatedSocket } from "@/types/sockets/socketTypes";
import { WebSocket } from "ws";

export class ConversationHub {
  private static rooms: Map<string, Map<WebSocket, AuthenticatedSocket>> =
    new Map();

  public static joinConvoRoom(conversationId: string, as: AuthenticatedSocket) {
    const conversationRoom = this.rooms.get(conversationId);
    if (!conversationRoom) return;
    if (conversationRoom.has(as.ws)) return;
    conversationRoom.set(as.ws, as);
    as.conversationRooms.push(conversationId);
  }

  public static leaveConvoRoom(
    conversationId: string,
    as: AuthenticatedSocket
  ) {
    const conversationRoom = this.rooms.get(conversationId);
    if (!conversationRoom) return;
    if (!conversationRoom.has(as.ws)) return;
    conversationRoom.delete(as.ws);
    as.conversationRooms = as.conversationRooms.filter(
      (id) => id !== conversationId
    );
  }
}
