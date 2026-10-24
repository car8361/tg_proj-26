/*
  Warnings:

  - You are about to drop the column `relation` on the `relations` table. All the data in the column will be lost.
  - You are about to drop the column `target_id` on the `relations` table. All the data in the column will be lost.
  - You are about to drop the `friend_requests` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[owner_id,other_id]` on the table `relations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chat_id` to the `chat_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `privilage` to the `chat_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chat_owner_id` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `other_id` to the `relations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationship` to the `relations` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "privilage" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('FRIEND', 'BLOCKED', 'INVITE_OUTGOING', 'INVITE_INGOING');

-- DropForeignKey
ALTER TABLE "relations" DROP CONSTRAINT "relations_target_id_fkey";

-- DropIndex
DROP INDEX "relations_owner_id_target_id_key";

-- AlterTable
ALTER TABLE "chat_messages" ADD COLUMN     "chat_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "chat_users" ADD COLUMN     "privilage" "privilage" NOT NULL;

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "chat_name" TEXT NOT NULL DEFAULT 'Nový chat',
ADD COLUMN     "chat_owner_id" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;

-- AlterTable
ALTER TABLE "relations" DROP COLUMN "relation",
DROP COLUMN "target_id",
ADD COLUMN     "other_id" BIGINT NOT NULL,
ADD COLUMN     "relationship" "RelationshipType" NOT NULL;

-- DropTable
DROP TABLE "friend_requests";

-- DropEnum
DROP TYPE "RelationType";

-- CreateIndex
CREATE UNIQUE INDEX "relations_owner_id_other_id_key" ON "relations"("owner_id", "other_id");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_chat_owner_id_fkey" FOREIGN KEY ("chat_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relations" ADD CONSTRAINT "relations_other_id_fkey" FOREIGN KEY ("other_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
