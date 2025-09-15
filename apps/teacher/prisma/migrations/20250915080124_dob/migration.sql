/*
  Warnings:

  - Added the required column `dob` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Teacher" ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL;
