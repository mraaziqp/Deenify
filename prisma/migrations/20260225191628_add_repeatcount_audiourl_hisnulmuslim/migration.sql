/*
  Warnings:

  - You are about to drop the column `reciter` on the `QuranMedia` table. All the data in the column will be lost.
  - You are about to drop the column `surahNumber` on the `QuranMedia` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `QuranMedia` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `QuranMedia` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `QuranMedia` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `QuranMedia` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dua" ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "repeatCount" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "QuranMedia" DROP COLUMN "reciter",
DROP COLUMN "surahNumber",
DROP COLUMN "thumbnailUrl",
DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "url";

