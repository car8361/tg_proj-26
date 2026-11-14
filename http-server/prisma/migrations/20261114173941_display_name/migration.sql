-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "display_name" TEXT NOT NULL DEFAULT 'MYTESTINGDISPLAY';
