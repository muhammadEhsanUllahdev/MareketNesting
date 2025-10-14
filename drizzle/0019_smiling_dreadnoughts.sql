ALTER TABLE "orders" ADD COLUMN "zone_id" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "carrier_id" varchar DEFAULT '';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_option" jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_zone_id_shipping_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."shipping_zones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_carrier_id_carriers_id_fk" FOREIGN KEY ("carrier_id") REFERENCES "public"."carriers"("id") ON DELETE no action ON UPDATE no action;