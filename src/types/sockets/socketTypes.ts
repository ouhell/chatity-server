import { z } from "zod";
import { WebSocket } from "ws";
export type UnauthenticatedSocket = {
  entredAt: number;
  ws: WebSocket;
};

export type AuthenticatedSocket = {
  user: {
    name: string;
  };
  ws: WebSocket;
};

export const socketMessageTemplate = z.object({
  key: z.string(),
  content: z.any(),
  sentAt: z.number(),
});

export type SocketMessage = z.infer<typeof socketMessageTemplate>;
