-- AlterTable
ALTER TABLE "email_codes" ALTER COLUMN "due_until" SET DEFAULT now() + interval '5 minutes' ;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "description" VARCHAR(512),
ADD COLUMN     "picture" VARCHAR(128) NOT NULL DEFAULT 'https://bucket.dnck.dev/pfp/default-avatar-icon-of-social-media-user-vector.jpg';
