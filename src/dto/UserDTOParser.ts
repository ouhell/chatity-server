import { SessionUser } from "../types/session";
import { UserInfoDTO } from "../types/dto/UserDtos";
import { User } from "@prisma/client";

export const parseUserInfoFromSession = (
  sessionUser: SessionUser
): UserInfoDTO => {
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    username: sessionUser.username,
    picture_url: sessionUser.picture_url,
  };
};

export const parseUserInfoFromDb = (user: User): UserInfoDTO => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    picture_url: user.imageUrl,
  };
};
