CREATE TABLE "promotions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"promo_code" varchar NOT NULL,
	"discount_type" varchar NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"minimum_purchase" numeric(10, 2) DEFAULT '0',
	"usage_limit" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "promotions_promo_code_unique" UNIQUE("promo_code")
);
