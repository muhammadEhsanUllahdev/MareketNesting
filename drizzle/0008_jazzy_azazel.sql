ALTER TABLE "stores" RENAME COLUMN "name" TO "store_name";--> statement-breakpoint
ALTER TABLE "stores" DROP CONSTRAINT "stores_category_id_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "store_description" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "business_phone" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "business_website" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "tax_id" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "business_address" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "category_id";--> statement-breakpoint
ALTER TABLE "stores" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "store_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "store_description";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "business_type";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "business_address";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "business_phone";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "business_website";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "tax_id";