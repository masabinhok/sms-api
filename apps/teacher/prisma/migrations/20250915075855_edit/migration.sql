/*
  Warnings:

  - You are about to drop the `TeacherClass` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeacherSubject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TeacherClass" DROP CONSTRAINT "TeacherClass_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeacherSubject" DROP CONSTRAINT "TeacherSubject_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "classes" TEXT[],
ADD COLUMN     "subjects" TEXT[];

-- DropTable
DROP TABLE "public"."TeacherClass";

-- DropTable
DROP TABLE "public"."TeacherSubject";

-- DropEnum
DROP TYPE "public"."Class";

-- DropEnum
DROP TYPE "public"."Subject";
