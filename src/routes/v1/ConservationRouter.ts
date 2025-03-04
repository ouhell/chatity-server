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

const messagesAudioUploader = multer({
  storage: multerStorage,
  limits: {
    fileSize: 1000 * 1000 * 10, // 10 mb,
    files: 1,
  },
});

const messagesFileUploader = multer({
  storage: multerStorage,
  limits: {
    // files: 20,
    fileSize: 1024 * 1024 * 5, // 5 mega bytes
  },
});

ConversationRouter.post(
  "/api/v1/conversations/:conversationId/messages",
  isAuthenticated(),
  messagesFileUploader.fields([
    { name: "images", maxCount: 10 },
    { name: "audio", maxCount: 1 },
    { name: "files", maxCount: 5 },
  ]),
  // messagesAudioUploader.array("audio"),

  MessageController.postMessage
);
