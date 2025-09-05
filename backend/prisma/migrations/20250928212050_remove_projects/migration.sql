/*
  Warnings:

  - You are about to drop the column `projectId` on the `Tag` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Project" DROP CONSTRAINT "Project_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Tag" DROP CONSTRAINT "Tag_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamMember" DROP CONSTRAINT "TeamMember_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropIndex
DROP INDEX "public"."Tag_name_projectId_key";

-- AlterTable
ALTER TABLE "public"."Tag" DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "projectId";

-- DropTable
DROP TABLE "public"."Project";

-- DropTable
DROP TABLE "public"."TeamMember";
