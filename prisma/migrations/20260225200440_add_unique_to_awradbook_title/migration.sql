/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `AwradBook` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `Dua` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AwradBook_title_key" ON "AwradBook"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Dua_title_key" ON "Dua"("title");

