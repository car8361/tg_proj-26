-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "picture" TEXT NOT NULL DEFAULT 'https://bucket.dnck.dev/grouppicture/people.png';

-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;
