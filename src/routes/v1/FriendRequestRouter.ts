import FriendShipController from "@/controllers/v1/FriendShipController";
import { isAuthenticated } from "@/middleware/authentication/authCheckMiddlewares";
import express from "express";

export const FriendShipRouter = express.Router();

FriendShipRouter.get(
  "/api/v1/friends",
  isAuthenticated(),
  FriendShipController.fetchFriends
);

FriendShipRouter.get(
  "/api/v1/friend-requests",
  isAuthenticated(),
  FriendShipController.fetchFriendRequests
);

FriendShipRouter.patch(
  "/api/v1/friend-requests",
  isAuthenticated(),
  FriendShipController.acceptRequest
);

FriendShipRouter.get(
  "/api/v1/friends-request/:first/:second",
  isAuthenticated(),
  FriendShipController.fetchFriendRequestById
);

FriendShipRouter.delete(
  "/api/v1/friend-requests/:senderId/:receiverId",
  isAuthenticated(),
  FriendShipController.deleteRequest
);
