CREATE TABLE "shipments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" varchar NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"carrier_id" varchar,
	"status" text NOT NULL,
	"tracking_number" text NOT NULL,
	"estimated_delivery" timestamp,
	"actual_delivery" timestamp,
	"weight" text,
	"value" text,
	"shipping_cost" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_carrier_id_carriers_id_fk" FOREIGN KEY ("carrier_id") REFERENCES "public"."carriers"("id") ON DELETE no action ON UPDATE no action;