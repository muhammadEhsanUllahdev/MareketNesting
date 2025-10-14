import { pgTable, varchar, text, sql } from "drizzle-orm/pg-core";

export const productTranslations = pgTable("product_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id"),
  language: text("language"),
  name: text("name"),
  description: text("description"),
  shortDescription: text("short_description"),
  highlights: text("highlights"),
});

export async function up(db: any) {
  await db.execute(sql`ALTER TABLE product_translations ADD COLUMN IF NOT EXISTS highlights TEXT`);
}

export async function down(db: any) {
  await db.execute(sql`ALTER TABLE product_translations DROP COLUMN IF EXISTS highlights`);
}
