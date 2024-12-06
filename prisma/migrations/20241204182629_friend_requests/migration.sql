/*
  Warnings:

  - You are about to drop the `ConversationRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ConversationRequest" DROP CONSTRAINT "ConversationRequest_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "ConversationRequest" DROP CONSTRAINT "ConversationRequest_sender_id_fkey";

-- DropTable
DROP TABLE "ConversationRequest";

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
