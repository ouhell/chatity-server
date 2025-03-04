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
    fileSize: 1000 * 1000 * 5, // 5 mega bytes
  },
  // fileFilter: (_, file, cb) => {
  //   console.log("file inspection ", file.fieldname, file.size);
  //   file.
  //   if (file.fieldname === "images") {
  //     // filesize less than 5 mb accept the file
  //     if (file.size <= 1000 * 1000 * 5) {
  //       return cb(null, true);
  //     }
  //   }

  //   if (file.fieldname === "audio") {
  //     // file size less than 10 mb
  //     if (file.size <= 1000 * 1000 * 10) {
  //       return cb(null, true);
  //     }
  //   }

  //   // automatic rejection
  //   return cb(null, false);
  // },
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
