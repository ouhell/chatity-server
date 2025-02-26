import express from "express";
import { isAuthenticated } from "../../middleware/authentication/authCheckMiddlewares";
import MessageController from "@/controllers/v1/MessageController";
import multer from "multer";
import { multerStorage } from "@/utils/libs/upload/multerParams";

export const ConversationRouter = express.Router();

ConversationRouter.get(
  "/api/v1/conversations/:conversationId/messages",
  isAuthenticated(),
  MessageController.fetchMessages
);
const messageAudioUploader = multer({
  storage: multerStorage,
  limits: {
    files: 1,
    fieldSize: 1000 * 1000 * 10, // 10 mega bytes
  },
});
const messagesImageUploader = multer({
  storage: multerStorage,
  limits: {
    files: 10,
    fileSize: 1000 * 1000 * 5, // 5 mega bytes
  },
});

ConversationRouter.post(
  "/api/v1/conversations/:conversationId/messages",
  isAuthenticated(),
  messageAudioUploader.single("record"),
  messagesImageUploader.array("images"),
  MessageController.postMessage
);
