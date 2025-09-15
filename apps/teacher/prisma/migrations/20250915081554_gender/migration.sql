/*
  Warnings:

  - Added the required column `gender` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "gender" TEXT NOT NULL;
