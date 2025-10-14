import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { number, z } from "zod";

// Users table with role-based access
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("client"), // client, seller, admin
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  status: text("status").notNull().default("Active"), // Active, Inactive, On Hold, Terminated
  preferredLanguage: text("preferred_language").notNull().default("en"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  sellerStatus: text("seller_status").default("pending"), // pending, approved, rejected (only for sellers)
  // Seller-specific fields
  // storeName: text("store_name"),
  // storeDescription: text("store_description"),
  // businessType: text("business_type"), // individual, company, partnership
  // businessAddress: text("business_address"),
  // businessPhone: text("business_phone"),
  // businessWebsite: text("business_website"),
  // taxId: text("tax_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete field
});

// Categories with multilingual support
export const categories = pgTable("categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull().default("standard"),
  parentId: varchar("parent_id"),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete field
});

export const categoryTranslations = pgTable("category_translations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  language: text("language").notNull(), // en, fr, ar
  name: text("name").notNull(),
  description: text("description"),
  // SEO fields
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
});

// Category features table for product attributes
export const categoryFeatures = pgTable("category_features", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  value: text("value"),
  isRequired: boolean("is_required").notNull().default(false),
  options: jsonb("options").$type<string[]>().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stockAlerts = pgTable("stock_alerts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id")
    .notNull()
    .references(() => users.id),
  alertType: text("alert_type").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"),
  resolvedBy: varchar("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
});

// Shipping Schemas

// export const shippingZones = pgTable("shipping_zones", {
//   id: varchar("id")
//     .primaryKey()
//     .default(sql`gen_random_uuid()`),
//   sellerId: varchar("seller_id")
//     .notNull()
//     .references(() => users.id, { onDelete: "cascade" }),
//   zoneName: text("zone_name").notNull(),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   isActive: boolean("is_active").notNull().default(true),
// });

// export const shippingZoneLocations = pgTable("shipping_zone_locations", {
//   id: varchar("id")
//     .primaryKey()
//     .default(sql`gen_random_uuid()`),
//   zoneId: varchar("zone_id")
//     .notNull()
//     .references(() => shippingZones.id, { onDelete: "cascade" }),
//   country: varchar("country").notNull(),
//   state: varchar("state"),
//   city: varchar("city"),
// });

export const carriers = pgTable("carriers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  website: text("website"),
  supportPhone: text("support_phone"),
  contactInfo: text("contact_info"),
  maxWeight: integer("max_weight"),
  basePrice: integer("base_price").default(0),
  deliversNationwide: boolean("delivers_nationwide").default(false),
  trackingUrl: text("tracking_url"),
  apiKey: text("api_key"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippingOptions = pgTable("shipping_options", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  carrierId: varchar("carrier_id")
    .notNull()
    .references(() => carriers.id, { onDelete: "cascade" }),
  region: text("region").notNull(),
  length: integer("length"),
  width: integer("width"),
  height: integer("height"),
  maxWeight: integer("max_weight"),
  basePrice: integer("base_price").notNull().default(0),
  pricePerKg: integer("price_per_kg").default(0),
  deliveryTime: text("delivery_time"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippingRates = pgTable("shipping_rates", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  carrierId: varchar("carrier_id")
    .notNull()
    .references(() => carriers.id, { onDelete: "cascade" }),
  zone: text("zone").notNull(),
  weightMin: integer("weight_min").notNull(),
  weightMax: integer("weight_max").notNull(),
  price: integer("price").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippingConfig = pgTable("shipping_config", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id")
    .notNull()
    .references(() => users.id),
  freeShippingThreshold: integer("free_shipping_threshold").default(0),
  maxWeight: integer("max_weight").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippingZones = pgTable("shipping_zones", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  name: text("name").notNull(),
  cities: jsonb("cities").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shippingZoneCarriers = pgTable("shipping_zone_carriers", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  zoneId: varchar("zone_id")
    .notNull()
    .references(() => shippingZones.id, { onDelete: "cascade" }),
  carrierId: varchar("carrier_id")
    .notNull()
    .references(() => carriers.id, { onDelete: "cascade" }),
  price: integer("price").notNull(),
  deliveryTime: text("delivery_time"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const storeDeliveries = pgTable("store_deliveries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  shopId: varchar("shop_id").notNull(),
  zone: text("zone").notNull(),
  price: integer("price").notNull(),
  deliveryTime: text("delivery_time").notNull(),
  maxWeight: integer("max_weight"),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// export const shippingMethods = pgTable("shipping_methods", {
//   id: varchar("id")
//     .primaryKey()
//     .default(sql`gen_random_uuid()`),
//   zoneId: varchar("zone_id")
//     .notNull()
//     .references(() => shippingZones.id, { onDelete: "cascade" }),
//   carrierId: varchar("carrier_id").references(() => carriers.id),
//   methodName: text("method_name").notNull(),
//   price: decimal("price", { precision: 10, scale: 2 }).notNull(),
//   estimatedDays: integer("estimated_days"),
//   isActive: boolean("is_active").notNull().default(true),
// });

// export const shipments = pgTable("shipments", {
//   id: varchar("id")
//     .primaryKey()
//     .default(sql`gen_random_uuid()`),
//   orderId: varchar("order_id")
//     .notNull()
//     .references(() => orders.id, { onDelete: "cascade" }),
//   methodId: varchar("method_id")
//     .notNull()
//     .references(() => shippingMethods.id),
//   trackingNumber: text("tracking_number"),
//   labelUrl: text("label_url"),
//   shippedAt: timestamp("shipped_at"),
//   deliveredAt: timestamp("delivered_at"),
//   status: text("status").notNull().default("pending"), // pending, shipped, delivered
// });

export const userSessions = pgTable(
  "user_sessions",
  {
    sid: varchar("sid").notNull(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire", {
      withTimezone: false,
      precision: 6,
    }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sid] }),
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Products with multilingual support
export const products = pgTable("products", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id")
    .notNull()
    .references(() => categories.id),
  slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(),
  brand: text("brand").notNull().default("Unknown Brand"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  minThreshold: integer("min_thresold").notNull().default(0),
  suggestedQuantity: integer("suggested_quantity").notNull().default(0),
  stock: integer("stock").notNull().default(0),
  images: jsonb("images")
    .$type<{ url: string; uploadMethod: "upload" | "url" | "existing" }[]>()
    .notNull()
    .default([]),
  status: text("status").notNull().default("active"),
  replenishmentStatus: text("replenishment_status")
    .notNull()
    .default("on_hold"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete field
});

export const productTranslations = pgTable("product_translations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  language: text("language").notNull(), // en, fr, ar
  name: text("name").notNull(),
  description: text("description"),
  shortDescription: text("short_description"),
  highlights: text("highlights"), // Product highlights/features
});

// Product specifications based on category features
export const productSpecifications = pgTable("product_specifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  featureName: text("feature_name").notNull(), // Weight, Color, Dimensions, etc.
  featureValue: text("feature_value").notNull(), // 2.5 kg, Red, 30x20x15 cm, etc.
  featureType: text("feature_type").notNull(), // text, number, boolean, select, color, url
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Product FAQs
export const productFaqs = pgTable("product_faqs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Orders
// export const orders = pgTable("orders", {
//   id: varchar("id")
//     .primaryKey()
//     .default(sql`gen_random_uuid()`),
//   orderNumber: text("order_number").notNull().unique(), // CMD-2845 format
//   userId: varchar("user_id")
//     .notNull()
//     .references(() => users.id),
//   status: text("status").notNull().default("pending"), // pending, in_preparation, in_delivery, delivered, cancelled
//   paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
//   paymentMethod: text("payment_method"), // Bank card, PayPal, etc.
//   totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
//   shippingAddress: jsonb("shipping_address")
//     .$type<{
//       street: string;
//       city: string;
//       state: string;
//       zipCode: string;
//       country: string;
//     }>()
//     .notNull(),
//   trackingNumber: text("tracking_number"), // TRK-12345678
//   vendorName: text("vendor_name"), // Store name for quick reference
//   itemCount: integer("item_count").notNull().default(1),
//   deliveryDate: timestamp("delivery_date"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
//   updatedAt: timestamp("updated_at").notNull().defaultNow(),
//   deletedAt: timestamp("deleted_at"), // Soft delete field
// });

export const addresses = pgTable("addresses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  street: text("street").notNull(),
  city: varchar("city", { length: 150 }).notNull(),
  state: varchar("state", { length: 150 }).notNull(),
  postalCode: varchar("postal_code", { length: 50 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  cardNumber: varchar("card_number", { length: 20 }),
  expiry: varchar("expiry", { length: 10 }),
  holderName: varchar("holder_name", { length: 100 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderNumber: text("order_number")
    .notNull()
    .unique()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  zoneId: varchar("zone_id").references(() => shippingZones.id),
  carrierId: varchar("carrier_id").references(() => carriers.id),

  shippingOption: jsonb("shipping_option").$type<{
    carrierName: string;
    region?: string;
    price: number;
    deliveryTime?: string;
  }>(),

  // Customer snapshot at the time of order
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),

  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paymentIntentId: text("payment_intent_id"),
  currency: text("currency").notNull().default("usd"),

  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  itemCount: integer("item_count").notNull().default(1),

  shippingAddress: jsonb("shipping_address")
    .$type<{
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    }>()
    .notNull(),

  actions: jsonb("actions")
    .$type<{
      canValidate: boolean;
      canRepay: boolean;
      canFreeze: boolean;
      canUnlock: boolean;
      canContact: boolean;
      canCall: boolean;
      canViewHistory: boolean;
      canReport: boolean;
      canCancel: boolean;
    }>()
    .notNull()
    .default({
      canValidate: false,
      canRepay: false,
      canFreeze: false,
      canUnlock: false,
      canContact: false,
      canCall: false,
      canViewHistory: false,
      canReport: false,
      canCancel: false,
    }),

  trackingNumber: text("tracking_number"), // TRK-12345678
  vendorName: text("vendor_name"), // Store name for quick reference
  deliveryDate: timestamp("delivery_date"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"), // Soft delete field
});

// export const orderItems = pgTable("order_items", {
//   id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
//   orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
//   productId: varchar("product_id").notNull().references(() => products.id),
//   quantity: integer("quantity").notNull(),
//   unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
//   totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
// });

export const orderItems = pgTable("order_items", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: varchar("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  orderId: varchar("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  paymentMethod: text("payment_method"), // card, PayPal, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  promoCode: varchar("promo_code").notNull().unique(),
  discountType: varchar("discount_type").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  minimumPurchase: decimal("minimum_purchase", {
    precision: 10,
    scale: 2,
  }).default("0"),
  usageLimit: integer("usage_limit").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const packages = pgTable("packages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  billing: varchar("billing", { length: 50 }).notNull(),
  commission: decimal("commission", { precision: 5, scale: 2 }).notNull(),
  maxProducts: integer("max_products").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, {
    relationName: "categoryParent",
  }),
  translations: many(categoryTranslations),
  features: many(categoryFeatures),
  products: many(products),
}));

export const categoryTranslationsRelations = relations(
  categoryTranslations,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoryTranslations.categoryId],
      references: [categories.id],
    }),
  })
);

export const categoryFeaturesRelations = relations(
  categoryFeatures,
  ({ one }) => ({
    category: one(categories, {
      fields: [categoryFeatures.categoryId],
      references: [categories.id],
    }),
  })
);

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(users, {
    fields: [products.vendorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  translations: many(productTranslations),
  specifications: many(productSpecifications),
  faqs: many(productFaqs),
  orderItems: many(orderItems),
}));

export const productTranslationsRelations = relations(
  productTranslations,
  ({ one }) => ({
    product: one(products, {
      fields: [productTranslations.productId],
      references: [products.id],
    }),
  })
);

export const productSpecificationsRelations = relations(
  productSpecifications,
  ({ one }) => ({
    product: one(products, {
      fields: [productSpecifications.productId],
      references: [products.id],
    }),
  })
);

export const productFaqsRelations = relations(productFaqs, ({ one }) => ({
  product: one(products, {
    fields: [productFaqs.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertCategoryTranslationSchema = createInsertSchema(
  categoryTranslations
).omit({
  id: true,
});

export const insertCategoryFeatureSchema = createInsertSchema(
  categoryFeatures
).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductTranslationSchema = createInsertSchema(
  productTranslations
).omit({
  id: true,
});

export const insertProductSpecificationSchema = createInsertSchema(
  productSpecifications
).omit({
  id: true,
  createdAt: true,
});

export const insertProductFaqSchema = createInsertSchema(productFaqs).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// export const insertShippingMethodSchema = createInsertSchema(
//   shippingMethods
// ).omit({
//   id: true,
// });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type InsertCategoryTranslation = z.infer<
  typeof insertCategoryTranslationSchema
>;

export type CategoryFeature = typeof categoryFeatures.$inferSelect;
export type InsertCategoryFeature = z.infer<typeof insertCategoryFeatureSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductTranslation = typeof productTranslations.$inferSelect;
export type InsertProductTranslation = z.infer<
  typeof insertProductTranslationSchema
>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// export type ShippingMethod = typeof shippingMethods.$inferSelect;
// export type InsertShippingMethod = z.infer<typeof insertShippingMethodSchema>;

// Stores table for managing seller stores
// storeName: text("store_name"),
// storeDescription: text("store_description"),
// businessType: text("business_type"), // individual, company, partnership
// businessAddress: text("business_address"),
// businessPhone: text("business_phone"),
// businessWebsite: text("business_website"),
// taxId: text("tax_id"),
export const stores = pgTable("stores", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  storeName: text("store_name").notNull(),
  codeStore: text("code_store").unique(),
  // categoryId: varchar("category_id").references(() => categories.id),
  storeDescription: text("store_description"),
  businessPhone: text("business_phone"),
  businessWebsite: text("business_website"),
  taxId: text("tax_id"),
  businessAddress: jsonb("business_address")
    .$type<{
      street: string;
      city: string;
      zipCode: string;
      country: string;
    }>()
    .notNull(),
  status: text("status").notNull().default("pending_validation"),
  suspensionReason: text("suspension_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  subscriptionEnd: timestamp("subscription_end"),
  lastActionAt: timestamp("last_action_at").defaultNow(),
  messagesSent: integer("messages_sent").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  productCount: integer("product_count").notNull().default(0),
  orderCount: integer("order_count").notNull().default(0),
  deletedAt: timestamp("deleted_at"), // Soft delete field
});

// Notifications table for real-time updates
export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, {
    onDelete: "cascade",
  }), // null for global notifications
  type: text("type").notNull(), // user_registration, seller_registration, seller_approval, seller_rejection, etc.
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").$type<Record<string, any>>().default({}), // Additional notification data
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Wishlist table
export const wishlists = pgTable("wishlists", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Cart table
export const carts = pgTable("carts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Wishlist relations
export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

// Cart relations
export const cartsRelations = relations(carts, ({ one }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [carts.productId],
    references: [products.id],
  }),
}));

// Update user relations to include wishlist and cart
export const usersRelationsUpdated = relations(users, ({ many }) => ({
  products: many(products),
  orders: many(orders),
  wishlists: many(wishlists),
  carts: many(carts),
}));

// Insert schemas
export const insertWishlistSchema = createInsertSchema(wishlists).omit({
  id: true,
  createdAt: true,
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Wishlist = typeof wishlists.$inferSelect;
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
