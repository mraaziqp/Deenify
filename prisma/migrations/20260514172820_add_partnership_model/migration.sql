-- CreateEnum
CREATE TYPE "public"."PartnershipStatus" AS ENUM ('PENDING', 'REVIEWING', 'ACTIVE', 'DECLINED');

-- CreateTable
CREATE TABLE "public"."Partnership" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "message" TEXT NOT NULL,
    "proposedRate" DOUBLE PRECISION,
    "status" "public"."PartnershipStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partnership_pkey" PRIMARY KEY ("id")
);
