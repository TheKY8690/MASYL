CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"website_url" varchar(500),
	"logo_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "brands" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "crawled_events" RENAME COLUMN "cafe_id" TO "brand_id";--> statement-breakpoint
ALTER TABLE "crawled_events" DROP CONSTRAINT "crawled_events_cafe_id_cafes_id_fk";
--> statement-breakpoint
ALTER TABLE "discounts" ALTER COLUMN "cafe_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "cafes" ADD COLUMN "brand_id" uuid;--> statement-breakpoint
ALTER TABLE "discounts" ADD COLUMN "brand_id" uuid;--> statement-breakpoint
ALTER TABLE "cafes" ADD CONSTRAINT "cafes_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawled_events" ADD CONSTRAINT "crawled_events_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "brands select for authenticated" ON "brands" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "brands write for admin" ON "brands" AS PERMISSIVE FOR ALL TO "authenticated" USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');