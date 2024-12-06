/*
  Warnings:

  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `extension` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isEdited` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ConversationRole" AS ENUM ('ADMIN', 'CHATTER');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BASIC', 'ADMIN');

-- AlterEnum
ALTER TYPE "FileType" ADD VALUE 'AUDIO';

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "extension" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "conversationId" UUID NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isEdited" BOOLEAN NOT NULL,
ADD COLUMN     "recordingId" UUID,
ADD COLUMN     "senderId" UUID NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "oauthIdentifier" VARCHAR(255),
ADD COLUMN     "role" "UserRole" NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- DropTable
DROP TABLE "Person";

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255),
    "isPublic" BOOLEAN NOT NULL,
    "isDui" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationUser" (
    "userId" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "role" "ConversationRole" NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ConversationUser_pkey" PRIMARY KEY ("userId","conversationId")
);

-- CreateTable
CREATE TABLE "UserBlackList" (
    "blackListerId" UUID NOT NULL,
    "blackListedId" UUID NOT NULL,

    CONSTRAINT "UserBlackList_pkey" PRIMARY KEY ("blackListedId","blackListerId")
);

-- CreateTable
CREATE TABLE "ConversationRequest" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,

    CONSTRAINT "ConversationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationUser" ADD CONSTRAINT "ConversationUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationUser" ADD CONSTRAINT "ConversationUser_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlackList" ADD CONSTRAINT "UserBlackList_blackListerId_fkey" FOREIGN KEY ("blackListerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlackList" ADD CONSTRAINT "UserBlackList_blackListedId_fkey" FOREIGN KEY ("blackListedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRequest" ADD CONSTRAINT "ConversationRequest_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRequest" ADD CONSTRAINT "ConversationRequest_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
