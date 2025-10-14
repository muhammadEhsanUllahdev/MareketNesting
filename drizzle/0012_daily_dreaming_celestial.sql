CREATE TABLE "carriers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"website" text,
	"support_phone" text,
	"contact_info" text,
	"max_weight" integer,
	"base_price" integer DEFAULT 0,
	"delivers_nationwide" boolean DEFAULT false,
	"tracking_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shipping_options" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"carrier_id" varchar NOT NULL,
	"name" text NOT NULL,
	"delivery_time" text,
	"price_adjustment" integer DEFAULT 0,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "shipping_options" ADD CONSTRAINT "shipping_options_carrier_id_carriers_id_fk" FOREIGN KEY ("carrier_id") REFERENCES "public"."carriers"("id") ON DELETE cascade ON UPDATE no action;