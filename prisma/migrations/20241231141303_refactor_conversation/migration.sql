/*
  Warnings:

  - You are about to drop the column `isDui` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the `ConversationUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[conversationId]` on the table `FriendShip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conversationId` to the `FriendShip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConversationUser" DROP CONSTRAINT "ConversationUser_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationUser" DROP CONSTRAINT "ConversationUser_userId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "isDui",
DROP COLUMN "isPublic",
DROP COLUMN "name";

-- AlterTable
ALTER TABLE "FriendShip" ADD COLUMN     "blockedFriendA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "blockedFriendB" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conversationId" UUID NOT NULL;

-- DropTable
DROP TABLE "ConversationUser";

-- CreateIndex
CREATE UNIQUE INDEX "FriendShip_conversationId_key" ON "FriendShip"("conversationId");

-- AddForeignKey
ALTER TABLE "FriendShip" ADD CONSTRAINT "FriendShip_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
