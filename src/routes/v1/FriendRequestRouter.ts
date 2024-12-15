import FriendRequestController from "@/controllers/v1/FriendRequestController";
import express from "express";

export const FriendRequestRouter = express.Router();

FriendRequestRouter.patch(
  "/api/v1/friend-request",
  FriendRequestController.acceptRequest
);

FriendRequestRouter.delete(
  "/api/v1/friend-request/:senderId/:receiverId",
  FriendRequestController.deleteFriendRequest
);
