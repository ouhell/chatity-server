import express from "express";
import { isAuthenticated } from "../../middleware/authentication/authCheckMiddlewares";
import MessageController from "@/controllers/v1/MessageController";

export const ConversationRouter = express.Router();

ConversationRouter.get(
  "/api/v1/conversations/:conversationId/messages",
  isAuthenticated(),
  MessageController.fetchMessages
);

ConversationRouter.post(
  "/api/v1/conversations/:conversationId/messages",
  isAuthenticated(),
  MessageController.postMessage
);
