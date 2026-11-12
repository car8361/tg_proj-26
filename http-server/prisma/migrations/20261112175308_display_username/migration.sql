/*
  Warnings:

  - Added the required column `display_username` to the `chat_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "chat_users" ADD COLUMN     "display_username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;
