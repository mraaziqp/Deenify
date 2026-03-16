-- CreateTable
CREATE TABLE "AwradBook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverImageUrl" TEXT,

    CONSTRAINT "AwradBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwradChapter" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audioUrl" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AwradChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwradLine" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "arabicText" TEXT NOT NULL,
    "transliteration" TEXT,
    "translation" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AwradLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AwradChapter" ADD CONSTRAINT "AwradChapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "AwradBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwradLine" ADD CONSTRAINT "AwradLine_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "AwradChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

