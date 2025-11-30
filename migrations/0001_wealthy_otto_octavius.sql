ALTER TABLE "user" ADD COLUMN "strapiId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "age";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_strapiId_unique" UNIQUE("strapiId");