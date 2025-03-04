-- AlterTable
ALTER TABLE "MessageImage" ADD COLUMN     "backupImageId" UUID,
ADD COLUMN     "blurhash" TEXT;

-- AddForeignKey
ALTER TABLE "MessageImage" ADD CONSTRAINT "MessageImage_backupImageId_fkey" FOREIGN KEY ("backupImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;
