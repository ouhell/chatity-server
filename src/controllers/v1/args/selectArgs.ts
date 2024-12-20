import { Prisma } from "@prisma/client";

export const userSelectArgs: Prisma.UserDefaultArgs = {
  select: {
    id: true,
    imageUrl: true,
    role: true,
    email: true,
    username: true,
  },
};
