-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "passwordChangeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "schoolId" TEXT;
