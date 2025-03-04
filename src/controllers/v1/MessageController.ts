import { Request, RequestHandler } from "express";
import { errorCatch } from "../../utils/libs/errors/errorCatch";
import prisma from "../../database/databaseClient";
import { getParamStr } from "../../utils/libs/params/paramsOperations";
import { ApiError } from "@/utils/libs/errors/ApiError";
import { z } from "zod";
import sharp from "sharp";
import { generateImageScalers } from "@/utils/libs/img/imageScaling";
import { parseMessageFiles } from "@/utils/libs/upload/messageFileManagement";
import { OnlineStorage } from "@/utils/libs/upload/OnlineStorage";

const FriendshipIdTemplate = z.object({
  friendAId: z.string().trim().min(1),
  friendBId: z.string().trim().min(1),
});

type FriendShipId = z.infer<typeof FriendshipIdTemplate>;

const checkPrivateMessagesGetAccess = async (
  req: Request,
  friendshipId: FriendShipId
) => {
  const user = req.session.user!;
  const friendship = await prisma.friendShip.findFirst({
    where: {
      friendAId: friendshipId.friendAId,
      friendBId: friendshipId.friendBId,
    },
  });

  if (!friendship) return "friendship cannot be found";

  const isFriend =
    friendship.friendAId === user.id || friendship.friendBId === user.id;

  if (!isFriend) return "user is not a part of the friendship";

  const isBlocked =
    (friendship.blockedFriendA && user.id === friendship.friendAId) ||
    (friendship.blockedFriendB && user.id === friendship.friendBId);

  if (isBlocked) return "user is blocked";

  return true;
};

const checkMessagesGetAccess = async (req: Request) => {
  const friendshipParam = req.query.friendshipId;

  const friendshipId = friendshipParam
    ? FriendshipIdTemplate.parse(friendshipParam)
    : undefined;

  if (friendshipId) {
    return await checkPrivateMessagesGetAccess(req, friendshipId);
  }
  return "no further access modifier provided";
};

export const fetchMessages: RequestHandler = errorCatch(
  async (req, res, next) => {
    const user = req.session.user!;
    const query = req.query;
    const cursorId = getParamStr(query.cursorId);
    const conversationId = req.params.conversationId;

    if (!conversationId) {
      return next(ApiError.badRequest("no conversation id provided"));
    }

    const accessError = await checkMessagesGetAccess(req);
    if (accessError !== true) {
      return next(ApiError.forbidden(accessError));
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
      },
      take: 50,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        images: {
          select: {
            messageId: true,
            imageId: true,
            image: {
              select: {
                url: true,
                createdAt: true,
                type: true,
                name: true,
                id: true,
              },
            },
          },
        },
        recording: {
          select: {
            id: true,
            createdAt: true,
            extension: true,
            name: true,
            url: true,
            type: true,
          },
        },
      },
    });

    res.status(200).json(messages);
  }
);

const checkPrivateMessagePostAccess = async (
  req: Request,
  friendshipId: FriendShipId
) => {
  const user = req.session.user!;
  const conversationId = req.params.conversationId;
  const friendship = await prisma.friendShip.findFirst({
    where: {
      friendAId: friendshipId.friendAId,
      friendBId: friendshipId.friendBId,
    },
  });

  if (!friendship) return "friendship can not be found";

  const isFriendShipConvo = friendship.conversationId === conversationId;

  if (!isFriendShipConvo)
    return "the conversationId does not belong to the friendship";

  const isFriend =
    friendship.friendAId === user.id || friendship.friendBId === user.id;

  if (!isFriend) return "user is not a friend";

  const isBlocked =
    (friendship.blockedFriendA && user.id === friendship.friendAId) ||
    (friendship.blockedFriendB && user.id === friendship.friendBId);

  if (isBlocked) return "use is blocked";

  return true;
};

const checkMessagePostAccess = async (req: Request) => {
  const query = req.query;
  const friendshipParam = query.friendshipId;

  const friendshipId = friendshipParam
    ? FriendshipIdTemplate.parse(friendshipParam)
    : undefined;

  if (friendshipId) {
    return await checkPrivateMessagePostAccess(req, friendshipId);
  }

  return "no further access modifier provided";
};

const postMessageBodyTemplate = z.object({
  // conversationId: z.string().trim().min(1),
  content: z.string().trim().min(1),
});

export const postMessage = errorCatch(async (req, res, next) => {
  const user = req.session.user!;

  const allowedAccess = await checkMessagePostAccess(req);

  if (allowedAccess !== true) {
    return next(ApiError.forbidden(allowedAccess));
  }
  //   const conversationId = getParamStr(req.query.conversationId) ?? req.params.conversationId;
  const conversationId = req.params.conversationId;
  const body = postMessageBodyTemplate.parse(req.body);

  const filesData = await parseMessageFiles(req);

  const newMessage = await prisma.$transaction(async () => {
    let createdFiles: string[] = [];
    if (filesData) {
      const images = filesData.images;

      for (const img of images) {
        const resp = await OnlineStorage.storeImage(img);
        img.metaData.key = resp.key;
      }

      const ids = await prisma.file.createManyAndReturn({
        data: images.map((img) => ({
          name: img.metaData.name,
          extension: img.metaData.format,
          key: img.metaData.key!,
          type: "IMAGE",
          url: "",
        })),
        select: { id: true },
      });

      createdFiles = ids.map((val) => val.id);

      return await prisma.message.create({
        data: {
          conversationId: conversationId,
          content: body.content,
          senderId: user.id,
          images: createdFiles.length
            ? {
                createMany: {
                  data: createdFiles.map((id) => ({ imageId: id })),
                  skipDuplicates: true,
                },
              }
            : undefined,
        },
        include: {
          images: { include: { image: true } },
        },
      });
    }
  });

  if (!newMessage) {
    return next(ApiError.forbidden("failed to upload"));
  }
  res.status(201).json(newMessage);
});

export default { postMessage, fetchMessages };
