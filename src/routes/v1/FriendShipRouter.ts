import FriendShipController from "@/controllers/v1/FriendShipController";
import { isAuthenticated } from "@/middleware/authentication/authCheckMiddlewares";
import express from "express";

export const FriendShipRouter = express.Router();

FriendShipRouter.param("receiverId", (req, res, next, val) => {
  return next();
});

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

FriendShipRouter.get(
  "/api/v1/friends-request/:first/:second",
  isAuthenticated(),
  FriendShipController.fetchFriendRequestById
);

FriendShipRouter.post(
  "/api/v1/friend-requests/:receiverId",
  isAuthenticated(),
  FriendShipController.postFriendRequest
);

FriendShipRouter.put(
  "/api/v1/friend-requests/:senderId/:receiverId",
  isAuthenticated(),
  FriendShipController.acceptRequest
);

FriendShipRouter.delete(
  "/api/v1/friend-requests/:senderId/:receiverId",
  isAuthenticated(),
  FriendShipController.deleteRequest
);
