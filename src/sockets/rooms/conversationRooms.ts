import { AuthenticatedSocket } from "@/types/sockets/socketTypes";
import { WebSocket } from "ws";
export const conversationRooms = new Map<
  string,
  Map<WebSocket, AuthenticatedSocket>
>();
