/*
  Warnings:

  - Added the required column `email` to the `email_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "email_codes" ADD COLUMN     "due_until" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '5 minutes' ,
ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "email_codes" ADD CONSTRAINT "email_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
