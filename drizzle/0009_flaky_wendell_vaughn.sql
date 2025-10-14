ALTER TABLE "products" ADD COLUMN "purchase_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "min_thresold" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "suggested_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "replenishment_status" text DEFAULT 'on_hold' NOT NULL;