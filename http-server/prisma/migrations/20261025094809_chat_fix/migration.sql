/*
  Warnings:

  - You are about to drop the column `chat_owner_id` on the `chats` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_chat_owner_id_fkey";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "chat_owner_id",
ALTER COLUMN "chat_name" SET DEFAULT 'New chat';

-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;
