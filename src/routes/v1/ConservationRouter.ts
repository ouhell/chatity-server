import express from "express";
import ConversationController from "../../controllers/v1/ConversationController";
import { isAuthenticated } from "../../middleware/authentication/authCheckMiddlewares";
export const ConversationRouter = express.Router();

ConversationRouter.get(
  "/api/v1/conversations",
  ConversationController.fetchConversations
);

ConversationRouter.get(
  "/api/v1/conversations/:conversationId/messages",
  isAuthenticated(),
  ConversationController.fetchConversationMessages
);

ConversationRouter.post(
  "/api/v1/conversations/:conversationId/messages",
  ConversationController.postConversationMessage
);
