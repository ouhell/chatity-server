/*
  Warnings:

  - You are about to drop the column `receiver_id` on the `FriendRequest` table. All the data in the column will be lost.
  - You are about to drop the column `sender_id` on the `FriendRequest` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `FriendRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_sender_id_fkey";

-- AlterTable
ALTER TABLE "FriendRequest" DROP COLUMN "receiver_id",
DROP COLUMN "sender_id",
ADD COLUMN     "receiverId" UUID NOT NULL,
ADD COLUMN     "senderId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "FriendShip" (
    "friendAId" UUID NOT NULL,
    "friendBId" UUID NOT NULL,

    CONSTRAINT "FriendShip_pkey" PRIMARY KEY ("friendAId","friendBId")
);

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_friendAId_fkey" FOREIGN KEY ("friendAId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_friendBId_fkey" FOREIGN KEY ("friendBId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
