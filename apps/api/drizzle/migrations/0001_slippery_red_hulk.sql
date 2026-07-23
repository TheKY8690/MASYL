ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "users can view own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING (auth.uid() = "profiles"."id");--> statement-breakpoint
CREATE POLICY "users can update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (auth.uid() = "profiles"."id");