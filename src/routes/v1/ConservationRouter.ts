import express from "express";
import {
  fetchConversationMessages,
  fetchConversations,
} from "../../controllers/v1/ConversationController";
import { isAuthenticated } from "../../middleware/authentication/authCheckMiddlewares";
export const ConservationRouter = express.Router();

ConservationRouter.get("/api/v1/conversations", fetchConversations);

ConservationRouter.get(
  "/api/v1/conversations/:conversationId",
  isAuthenticated(),
  fetchConversationMessages
);
