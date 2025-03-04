/*
  Warnings:

  - Added the required column `height` to the `MessageImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `MessageImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `MessageImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MessageImage" ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;
