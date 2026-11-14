-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "display_name" DROP DEFAULT;
