ALTER TABLE "cafes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "crawled_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "discounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "cafes select for authenticated" ON "cafes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "cafes insert for seller or admin" ON "cafes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = "cafes"."owner_id" OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "cafes update for owner or admin" ON "cafes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = "cafes"."owner_id" OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "cafes delete for admin" ON "cafes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "crawled events admin only" ON "crawled_events" AS PERMISSIVE FOR ALL TO "authenticated" USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "discounts select for authenticated" ON "discounts" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("discounts"."status" = 'active' OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "discounts insert for authenticated" ON "discounts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = "discounts"."created_by" OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "discounts update for owner or admin" ON "discounts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = "discounts"."created_by" OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "discounts delete for admin" ON "discounts" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "user reports select for reporter or admin" ON "user_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid() = "user_reports"."reporter_id" OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "user reports insert for authenticated" ON "user_reports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (auth.uid() = "user_reports"."reporter_id");--> statement-breakpoint
CREATE POLICY "user reports update for admin" ON "user_reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');--> statement-breakpoint
CREATE POLICY "user reports delete for admin" ON "user_reports" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');