-- CreateTable
CREATE TABLE "public"."AwradBook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverImageUrl" TEXT,

    CONSTRAINT "AwradBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AwradChapter" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "audioUrl" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AwradChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AwradLine" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "arabicText" TEXT NOT NULL,
    "transliteration" TEXT,
    "translation" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "AwradLine_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AwradChapter" ADD CONSTRAINT "AwradChapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "public"."AwradBook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AwradLine" ADD CONSTRAINT "AwradLine_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."AwradChapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
