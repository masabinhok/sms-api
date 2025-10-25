/*
  Warnings:

  - You are about to drop the column `class` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Student` table. All the data in the column will be lost.
  - The `rollNumber` column on the `Student` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[classId,rollNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "class",
DROP COLUMN "section",
ADD COLUMN     "classId" TEXT NOT NULL,
DROP COLUMN "rollNumber",
ADD COLUMN     "rollNumber" SERIAL NOT NULL;

-- CreateIndex
CREATE INDEX "Student_classId_idx" ON "public"."Student"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_classId_rollNumber_key" ON "public"."Student"("classId", "rollNumber");
