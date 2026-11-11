/*
  Warnings:

  - You are about to drop the column `chat_name` on the `chats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chat_users" ALTER COLUMN "privilage" SET DEFAULT 'USER';

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "chat_name",
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'New chat';

-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;
