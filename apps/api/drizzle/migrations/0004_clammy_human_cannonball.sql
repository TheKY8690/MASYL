ALTER TABLE "profiles" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."provider";--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('google', 'kakao');--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "provider" SET DATA TYPE "public"."provider" USING "provider"::"public"."provider";