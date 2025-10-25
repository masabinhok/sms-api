/*
  Warnings:

  - You are about to drop the column `classes` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `subjects` on the `Teacher` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Teacher" DROP COLUMN "classes",
DROP COLUMN "subjects",
ADD COLUMN     "classIds" TEXT[],
ADD COLUMN     "subjectIds" TEXT[];

-- CreateIndex
CREATE INDEX "Teacher_email_idx" ON "public"."Teacher"("email");
