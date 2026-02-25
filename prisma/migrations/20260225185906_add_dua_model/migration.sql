-- CreateTable
CREATE TABLE "public"."Dua" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "arabic" TEXT NOT NULL,
    "transliteration" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "tags" TEXT[],

    CONSTRAINT "Dua_pkey" PRIMARY KEY ("id")
);
