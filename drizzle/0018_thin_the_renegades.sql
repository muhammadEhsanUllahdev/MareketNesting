CREATE TABLE "store_deliveries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" varchar NOT NULL,
	"zone" text NOT NULL,
	"price" integer NOT NULL,
	"delivery_time" text NOT NULL,
	"max_weight" integer,
	"instructions" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
