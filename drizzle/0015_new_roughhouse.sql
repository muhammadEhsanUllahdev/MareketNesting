ALTER TABLE "shipping_options" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "region" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "length" integer;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "width" integer;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "max_weight" integer;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "base_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "price_per_kg" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "shipping_options" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "shipping_options" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "shipping_options" DROP COLUMN "price_adjustment";