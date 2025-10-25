-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'VIEW', 'EXPORT');

-- CreateEnum
CREATE TYPE "public"."EntityType" AS ENUM ('USER', 'STUDENT', 'TEACHER', 'ADMIN', 'CLASS', 'SUBJECT', 'ASSIGNMENT', 'GRADE', 'ATTENDANCE', 'SCHOOL_SETTINGS');

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" "public"."Role" NOT NULL,
    "username" TEXT,
    "action" "public"."ActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "entityType" "public"."EntityType" NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "public"."Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_action_idx" ON "public"."Activity"("action");

-- CreateIndex
CREATE INDEX "Activity_entityType_idx" ON "public"."Activity"("entityType");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "public"."Activity"("createdAt");
