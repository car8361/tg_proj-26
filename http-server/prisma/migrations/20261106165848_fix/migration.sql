/*
  Warnings:

  - A unique constraint covering the columns `[user_id,chat_id]` on the table `chat_users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dm_key]` on the table `chats` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `privilage` on the `chat_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `type` to the `chats` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ChatEnum" AS ENUM ('DIRECT', 'GROUP');

-- CreateEnum
CREATE TYPE "PrivilageEnum" AS ENUM ('OWNER', 'ADMIN', 'USER');

-- AlterTable
ALTER TABLE "chat_users" DROP COLUMN "privilage",
ADD COLUMN     "privilage" "PrivilageEnum" NOT NULL;

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "dm_key" TEXT,
ADD COLUMN     "type" "ChatEnum" NOT NULL;

-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;

-- DropEnum
DROP TYPE "privilage";

-- CreateIndex
CREATE UNIQUE INDEX "chat_users_user_id_chat_id_key" ON "chat_users"("user_id", "chat_id");

-- CreateIndex
CREATE UNIQUE INDEX "chats_dm_key_key" ON "chats"("dm_key");
