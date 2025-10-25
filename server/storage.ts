import {
  users,
  categories,
  categoryTranslations,
  categoryFeatures,
  products,
  productTranslations,
  productSpecifications,
  productFaqs,
  orders,
  orderItems,
  stores,
  wishlists,
  carts,
  type User,
  type InsertUser,
  type Order,
  type OrderItem,
  type InsertOrder,
  type InsertOrderItem,
  type Store,
  type InsertStore,
  type Wishlist,
  type InsertWishlist,
  type Cart,
  type InsertCart,
  transactions,
  InsertTransaction,
  Transaction,
  promotions,
  packages,
  stockAlerts,
  carriers,
  shippingOptions,
  shippingRates,
  shippingConfig,
  shippingZones,
  shippingZoneCarriers,
  addresses,
  withdrawalRequests,
  shipments,
} from "@shared/schema";
import { db } from "./db";
import type * as session from "express-session";
import {
  eq,
  and,
  sql,
  desc,
  inArray,
  isNull,
  lt,
  gte,
  lte,
  count,
  sum,
  avg,
  or,
  ilike,
  asc,
  gt,
} from "drizzle-orm";

import { startOfMonth, endOfMonth, subMonths } from "date-fns";

const now = new Date();
const currentMonthStart = startOfMonth(now);
const currentMonthEnd = endOfMonth(now);

const previousMonthStart = startOfMonth(subMonths(now, 1));
const previousMonthEnd = endOfMonth(subMonths(now, 1));

function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

// Update IStorage interface to include all required methods
export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    sellers: number;
    onHold: number;
  }>;
  setPasswordResetToken(
    email: string,
    token: string,
    expiry: Date
  ): Promise<boolean>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(userId: string): Promise<boolean>;
  updatePassword(userId: string, hashedPassword: string): Promise<boolean>;
  setEmailVerificationToken(userId: string, token: string): Promise<boolean>;
  verifyEmail(token: string): Promise<User | undefined>;
  updateSellerStatus(userId: string, status: string): Promise<boolean>;
  getPendingSellers(): Promise<User[]>;
  deleteUser(userId: string): Promise<boolean>;
  updateUser(userId: string, updates: Partial<User>): Promise<User | undefined>;

  // Categories
  getCategoriesWithTranslations(language: string): Promise<any[]>;

  // Products
  getProductsWithTranslations(options: {
    language: string;
    featured?: boolean;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]>;
  getAllProductsWithTranslations(
    limit?: number,
    offset?: number
  ): Promise<{ items: any[]; total: number }>;
  getProductWithTranslations(productId: string, language: string): Promise<any>;
  createProduct(productData: any): Promise<any>;
  getProductForEdit(productId: string, vendorId: string): Promise<any>;
  getProductsByVendor(vendorId: string, language?: string): Promise<any[]>;
  updateProductStock(
    productId: string,
    newStock: number,
    vendorId: string
  ): Promise<any>;
  deleteProduct(productId: string, vendorId: string): Promise<any>;
  deleteProductAsAdmin(productId: string): Promise<any>;
  createProductWithDetails(productData: any): Promise<any>;
  updateProductWithDetails(
    productId: string,
    vendorId: string,
    productData: any
  ): Promise<any>;
  seedDummyProducts(vendorId: string): Promise<void>;
  getSellersWithProducts(): Promise<any[]>;

  // Vendors
  getVendors(): Promise<any[]>;

  // Orders
  getOrdersByUserId(userId: string): Promise<any[]>;
  getOrdersByVendorId(vendorId: string): Promise<any[]>;
  getAllOrders(): Promise<any[]>;
  getOrderWithItems(orderId: string): Promise<any>;
  createOrder(orderData: any): Promise<any>;
  createOrderItem(orderItemData: any): Promise<any>;
  updateOrderStatus(orderId: string, status: string): Promise<boolean>;

  // Store management
  getAllStores(): Promise<any[]>;
  getStoreById(id: string): Promise<Store | undefined>;
  getStoreByOwnerId(ownerId: string): Promise<Store | undefined>;
  createStore(storeData: InsertStore): Promise<Store>;
  updateStore(id: string, updates: Partial<Store>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;

  // Wishlist management
  addToWishlist(userId: string, productId: string): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: string): Promise<boolean>;
  getUserWishlist(userId: string): Promise<any[]>;
  isProductInWishlist(userId: string, productId: string): Promise<boolean>;

  // Cart management
  addToCart(userId: string, productId: string, quantity: number): Promise<Cart>;
  updateCartQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean>;
  removeFromCart(userId: string, productId: string): Promise<boolean>;
  getUserCart(userId: string): Promise<any[]>;
  getCartItemCount(userId: string): Promise<number>;
  clearCart(userId: string): Promise<boolean>;
  getStoreStats(): Promise<{
    totalStores: number;
    activeStores: number;
    onHoldStores: number;
    totalRevenue: string;
  }>;

  // Dashboard statistics
  getClientDashboardStats(userId: string): Promise<any>;
  getSellerDashboardStats(userId: string): Promise<any>;
  getAdminDashboardStats(): Promise<any>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any;

  private checkDatabase(): boolean {
    if (!db) {
      console.warn("Database not available");
      return false;
    }
    return true;
  }

  private async executeWithFallback<T>(
    operation: () => Promise<T>,
    fallback: T
  ): Promise<T> {
    if (!this.checkDatabase()) {
      return fallback;
    }
    try {
      return await operation();
    } catch (error) {
      console.error("Database operation failed:", error);
      return fallback;
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.executeWithFallback(async () => {
      const [user] = await db!
        .select()
        .from(users)
        .where(and(eq(users.id, id), isNull(users.deletedAt)));
      return user || undefined;
    }, undefined);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.executeWithFallback(async () => {
      const [user] = await db!
        .select()
        .from(users)
        .where(eq(users.username, username));
      return user || undefined;
    }, undefined);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.executeWithFallback(async () => {
      const [user] = await db!
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user || undefined;
    }, undefined);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) {
      throw new Error("Database not available, cannot create user");
    }
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      if (!db) {
        console.warn("Database not available, returning empty array");
        return [];
      }
      const result = await db
        .select()
        .from(users)
        .where(isNull(users.deletedAt))
        .orderBy(desc(users.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    sellers: number;
    onHold: number;
  }> {
    try {
      if (!db) {
        console.warn("Database not available, returning empty stats");
        return { totalUsers: 0, activeUsers: 0, sellers: 0, onHold: 0 };
      }
      const [stats] = await db
        .select({
          totalUsers: sql<number>`COUNT(*)`,
          activeUsers: sql<number>`COUNT(CASE WHEN ${users.isActive} = true THEN 1 END)`,
          sellers: sql<number>`COUNT(CASE WHEN ${users.role} = 'seller' THEN 1 END)`,
          onHold: sql<number>`COUNT(CASE WHEN ${users.status} = 'On Hold' THEN 1 END)`,
        })
        .from(users);

      return stats || { totalUsers: 0, activeUsers: 0, sellers: 0, onHold: 0 };
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return { totalUsers: 0, activeUsers: 0, sellers: 0, onHold: 0 };
    }
  }

  async setPasswordResetToken(
    email: string,
    token: string,
    expiry: Date
  ): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .update(users)
        .set({
          resetToken: token,
          resetTokenExpiry: expiry,
        })
        .where(eq(users.email, email));
      return true;
    }, false);
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return this.executeWithFallback(async () => {
      const [user] = await db!
        .select()
        .from(users)
        .where(
          and(
            eq(users.resetToken, token),
            sql`${users.resetTokenExpiry} > NOW()`
          )
        );
      return user || undefined;
    }, undefined);
  }

  async clearPasswordResetToken(userId: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .update(users)
        .set({
          resetToken: null,
          resetTokenExpiry: null,
        })
        .where(eq(users.id, userId));
      return true;
    }, false);
  }

  async updatePassword(
    userId: string,
    hashedPassword: string
  ): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      return true;
    }, false);
  }

  async setEmailVerificationToken(
    userId: string,
    token: string
  ): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .update(users)
        .set({
          emailVerificationToken: token,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      return true;
    }, false);
  }

  async verifyEmail(token: string): Promise<User | undefined> {
    return this.executeWithFallback(async () => {
      const [user] = await db!
        .select()
        .from(users)
        .where(eq(users.emailVerificationToken, token));

      if (user) {
        // Mark email as verified and clear token
        await db!
          .update(users)
          .set({
            emailVerified: true,
            emailVerificationToken: null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        // Return updated user
        const [updatedUser] = await db!
          .select()
          .from(users)
          .where(eq(users.id, user.id));

        return updatedUser;
      }

      return undefined;
    }, undefined);
  }

  async updateSellerStatus(userId: string, status: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .update(users)
        .set({
          sellerStatus: status,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      return true;
    }, false);
  }

  async getPendingSellers(): Promise<User[]> {
    return this.executeWithFallback(async () => {
      const pendingSellers = await db!
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, "seller"),
            eq(users.emailVerified, true),
            eq(users.sellerStatus, "pending")
          )
        );
      return pendingSellers;
    }, []);
  }

  async getCategoriesWithTranslations(language: string): Promise<any[]> {
    return this.executeWithFallback(async () => {
      const result = await db!
        .select({
          id: categories.id,
          slug: categories.slug,
          icon: categories.icon,
          name: categoryTranslations.name,
          description: categoryTranslations.description,
        })
        .from(categories)
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, language)
          )
        )
        .where(and(eq(categories.isActive, true), isNull(categories.deletedAt)))
        .orderBy(categories.sortOrder);

      return result;
    }, []);
  }

  async getProductsWithTranslations(options: {
    language: string;
    featured?: boolean;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      let whereConditions = [eq(products.isActive, true)];

      if (options.featured) {
        whereConditions.push(eq(products.isFeatured, true));
      }

      if (options.categoryId) {
        whereConditions.push(eq(products.categoryId, options.categoryId));
      }

      if (!db) throw new Error("Database not available");

      let query = db
        .select({
          id: products.id,
          vendorId: products.vendorId,
          categoryId: products.categoryId,
          slug: products.slug,
          sku: products.sku,
          brand: products.brand,
          price: products.price,
          originalPrice: products.originalPrice,
          stock: products.stock,
          images: products.images,
          isFeatured: products.isFeatured,
          rating: products.rating,
          reviewCount: products.reviewCount,
          name: productTranslations.name,
          description: productTranslations.description,
          shortDescription: productTranslations.shortDescription,
          vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        })
        .from(products)
        .leftJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, options.language)
          )
        )
        .leftJoin(users, eq(users.id, products.vendorId))
        .where(and(...whereConditions));

      if (options.limit) {
        query = query.limit(options.limit) as any;
      }

      if (options.offset) {
        query = query.offset(options.offset) as any;
      }

      const result = await query;

      // If we have products, fetch their FAQs and specifications
      if (result.length > 0) {
        const productIds = result.map((p) => p.id);

        // Get specifications for all products
        const specificationsResult = await db
          .select({
            productId: productSpecifications.productId,
            featureName: productSpecifications.featureName,
            featureValue: productSpecifications.featureValue,
          })
          .from(productSpecifications)
          .where(inArray(productSpecifications.productId, productIds));

        // Get FAQs for all products
        const faqsResult = await db
          .select({
            productId: productFaqs.productId,
            question: productFaqs.question,
            answer: productFaqs.answer,
          })
          .from(productFaqs)
          .where(inArray(productFaqs.productId, productIds));

        // Group specifications by product ID
        const specificationsByProduct: { [productId: string]: any[] } = {};
        specificationsResult.forEach((spec) => {
          if (!specificationsByProduct[spec.productId]) {
            specificationsByProduct[spec.productId] = [];
          }
          specificationsByProduct[spec.productId].push({
            featureName: spec.featureName,
            featureValue: spec.featureValue,
          });
        });

        // Group FAQs by product ID
        const faqsByProduct: { [productId: string]: any[] } = {};
        faqsResult.forEach((faq) => {
          if (!faqsByProduct[faq.productId]) {
            faqsByProduct[faq.productId] = [];
          }
          faqsByProduct[faq.productId].push({
            question: faq.question,
            answer: faq.answer,
          });
        });

        // Add specifications and FAQs to each product
        return result.map((product) => ({
          ...product,
          specifications: specificationsByProduct[product.id] || [],
          faqs: faqsByProduct[product.id] || [],
        }));
      }

      return result;
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  }


  async getPopularProductsWithGrowth(opts?: {
    sellerId?: string;
    lang?: string;
    limit?: number;
  }): Promise<any[]> {
    return this.executeWithFallback(async () => {
      const sellerId = opts?.sellerId ?? undefined;
      const lang = (opts?.lang || "en").split("-")[0].toLowerCase();
      const limit = opts?.limit ? Number(opts.limit) : 5;

      // build where condition
      const baseWhere = and(
        eq(orders.status, "delivered"),
        eq(products.isActive, true),
        isNull(products.deletedAt)
      );
      const whereCond = sellerId ? and(baseWhere, eq(products.vendorId, sellerId)) : baseWhere;

      // main aggregation: total sold & revenue per product (localized name if available)

      const rows = await db
        .select({
          productId: products.id,
          vendorId: products.vendorId,
          sku: products.sku,
          images: products.images,
          price: products.price,
          // use translation.name only (products has no name column)
          localizedName: sql<string>`COALESCE(${productTranslations.name}, '')`,
          totalSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          totalRevenue: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS numeric)), 0)`,
          rating: products.rating,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .leftJoin(
          productTranslations,
          and(eq(productTranslations.productId, products.id), eq(productTranslations.language, lang))
        )
        .where(whereCond)
        .groupBy(
          products.id,
          products.vendorId,
          products.sku,
          products.images,
          products.price,
          productTranslations.name,
          products.rating
        )
        .orderBy(desc(sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`), desc(products.rating))
        .limit(limit);
      const productIds = (rows || []).map((r: any) => r.productId).filter(Boolean);
      if (productIds.length === 0) return [];

      // previous month stats (sold, revenue) using module-level previousMonthStart/End
      const prevMonthStats = await db
        .select({
          productId: orderItems.productId,
          soldPrev: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          revenuePrev: sql<number>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS numeric)), 0)`,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            inArray(orderItems.productId, productIds),
            gte(orders.createdAt, previousMonthStart),
            lte(orders.createdAt, previousMonthEnd),
            eq(orders.status, "delivered")
          )
        )
        .groupBy(orderItems.productId);

      const prevMap: Record<string, { soldPrev: number; revenuePrev: number }> = {};
      prevMonthStats.forEach((p: any) => {
        prevMap[p.productId] = { soldPrev: Number(p.soldPrev || 0), revenuePrev: Number(p.revenuePrev || 0) };
      });

      // fetch all translations for these products
      const allTranslations = await db
        .select({
          productId: productTranslations.productId,
          language: productTranslations.language,
          name: productTranslations.name,
          description: productTranslations.description,
          highlights: productTranslations.highlights,
          shortDescription: productTranslations.shortDescription,
        })
        .from(productTranslations)
        .where(inArray(productTranslations.productId, productIds));

      const translationsMap: Record<string, Record<string, any>> = {};
      allTranslations.forEach((t: any) => {
        translationsMap[t.productId] = translationsMap[t.productId] || {};
        translationsMap[t.productId][t.language] = {
          name: t.name,
          description: t.description,
          highlights: t.highlights,
          shortDescription: t.shortDescription,
        };
      });

      // map rows to final result with growth calculations
      const result = (rows || []).map((r: any) => {
        const translations = translationsMap[r.productId] || {};
        const prev = prevMap[r.productId] || { soldPrev: 0, revenuePrev: 0 };

        const growthSold =
          prev.soldPrev > 0
            ? ((Number(r.totalSold) - Number(prev.soldPrev)) / prev.soldPrev) * 100
            : prev.soldPrev === 0 && Number(r.totalSold) === 0
              ? 0
              : 100;

        const growthRevenue =
          prev.revenuePrev > 0
            ? ((Number(r.totalRevenue) - Number(prev.revenuePrev)) / prev.revenuePrev) * 100
            : prev.revenuePrev === 0 && Number(r.totalRevenue) === 0
              ? 0
              : 100;

        const displayName =
          (r.localizedName && String(r.localizedName).trim()) ||
          translations[lang]?.name ||
          Object.values(translations)[0]?.name ||
          r.sku ||
          "";

        return {
          id: r.productId,
          vendorId: r.vendorId,
          sku: r.sku,
          images: r.images || [],
          price: r.price,
          name: displayName,
          translations,
          totalSold: Number(r.totalSold || 0),
          totalRevenue: Number(r.totalRevenue || 0),
          rating: Number(r.rating || 0),
          soldGrowth: Number(growthSold.toFixed(1)),
          revenueGrowth: Number(growthRevenue.toFixed(1)),
        };
      });

      return result;
    }, [] as any[]);
  }

  // New method to get ALL products with ALL translations for frontend filtering
  // async getAllProductsWithTranslations(): Promise<any[]> {
  //   try {
  //     if (!db) throw new Error("Database not available");

  //     // Get all products from active stores only
  //     const productsResult = await db
  //       .select({
  //         id: products.id,
  //         vendorId: products.vendorId,
  //         categoryId: products.categoryId,
  //         categoryName: categoryTranslations.name,
  //         slug: products.slug,
  //         sku: products.sku,
  //         price: products.price,
  //         originalPrice: products.originalPrice,
  //         stock: products.stock,
  //         images: products.images,
  //         isFeatured: products.isFeatured,
  //         rating: products.rating,
  //         reviewCount: products.reviewCount,
  //         isActive: products.isActive,
  //         status: products.status,
  //         brand: products.brand,
  //         createdAt: products.createdAt,
  //         vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
  //       })
  //       .from(products)
  //       .leftJoin(users, eq(users.id, products.vendorId))
  //       .leftJoin(stores, eq(stores.ownerId, products.vendorId))
  //       .leftJoin(categories, eq(categories.id, products.categoryId))
  //       .leftJoin(
  //         categoryTranslations,
  //         and(
  //           eq(categoryTranslations.categoryId, categories.id),
  //           eq(categoryTranslations.language, "en")
  //         )
  //       )
  //       .where(
  //         and(
  //           eq(products.isActive, true),
  //           // eq(stores.status, "active"),
  //           isNull(products.deletedAt)
  //           // isNull(stores.deletedAt),
  //         )
  //       )
  //       .orderBy(desc(products.createdAt));

  //     // Get ALL translations for these products
  //     const productIds = productsResult.map((p) => p.id);

  //     if (productIds.length === 0) {
  //       return [];
  //     }

  //     const translationsResult = await db
  //       .select({
  //         productId: productTranslations.productId,
  //         language: productTranslations.language,
  //         name: productTranslations.name,
  //         description: productTranslations.description,
  //         highlights: productTranslations.highlights,
  //       })
  //       .from(productTranslations)
  //       .where(inArray(productTranslations.productId, productIds));

  //     // Group translations by product ID and language
  //     const translationsByProduct: {
  //       [productId: string]: { [language: string]: any };
  //     } = {};

  //     translationsResult.forEach((translation) => {
  //       if (!translationsByProduct[translation.productId]) {
  //         translationsByProduct[translation.productId] = {};
  //       }
  //       translationsByProduct[translation.productId][translation.language] = {
  //         name: translation.name,
  //         description: translation.description,
  //         highlights: translation.highlights,
  //       };
  //     });

  //     // Combine products with their translations
  //     const result = productsResult.map((product) => ({
  //       ...product,
  //       name: translationsByProduct[product.id]?.en?.name || "Untitled Product",
  //       translations: translationsByProduct[product.id] || {},
  //     }));

  //     return result;
  //   } catch (error) {
  //     console.error("Error fetching all products:", error);
  //     return [];
  //   }
  // }

  async getFeaturedProductsWithTranslations(): Promise<{
    items: any[];
    total: number;
  }> {
    try {
      if (!db) throw new Error("Database not available");

      const [{ total }] = await db
        .select({ total: sql<number>`COUNT(*) AS INTEGER` })
        .from(products)
        .where(and(eq(products.isActive, true), isNull(products.deletedAt)));

      const productsResult = await db
        .select({
          id: products.id,
          vendorId: products.vendorId,
          categoryId: products.categoryId,
          categoryName: categoryTranslations.name,
          slug: products.slug,
          sku: products.sku,
          price: products.price,
          originalPrice: products.originalPrice,
          stock: products.stock,
          images: products.images,
          isFeatured: products.isFeatured,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isActive: products.isActive,
          status: products.status,
          brand: products.brand,
          createdAt: products.createdAt,
          vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        })
        .from(products)
        .leftJoin(users, eq(users.id, products.vendorId))
        .leftJoin(stores, eq(stores.ownerId, products.vendorId))
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, "en")
          )
        )
        .where(and(eq(products.isActive, true), isNull(products.deletedAt)))
        .orderBy(desc(products.createdAt));

      const productIds = productsResult.map((p) => p.id);
      if (productIds.length === 0) {
        return { items: [], total };
      }

      const translationsResult = await db
        .select({
          productId: productTranslations.productId,
          language: productTranslations.language,
          name: productTranslations.name,
          description: productTranslations.description,
          highlights: productTranslations.highlights,
        })
        .from(productTranslations)
        .where(inArray(productTranslations.productId, productIds));

      const translationsByProduct: Record<string, Record<string, any>> = {};

      translationsResult.forEach((t) => {
        if (!translationsByProduct[t.productId]) {
          translationsByProduct[t.productId] = {};
        }
        translationsByProduct[t.productId][t.language] = {
          name: t.name,
          description: t.description,
          highlights: t.highlights,
        };
      });

      const items = productsResult.map((product) => ({
        ...product,
        name: translationsByProduct[product.id]?.en?.name || "Untitled Product",
        translations: translationsByProduct[product.id] || {},
      }));

      return { items, total };
    } catch (error) {
      console.error("❌ Error fetching all products with translations:", error);
      return { items: [], total: 0 };
    }
  }

  //   async getAllProductsWithTranslations(
  //   limit: number = 15,
  //   offset: number = 0,
  //   category?: string
  // ): Promise<{ items: any[]; total: number }> {
  //   try {
  //     if (!db) throw new Error("Database not available");

  //     const whereConditions = [
  //       eq(products.isActive, true),
  //       isNull(products.deletedAt)
  //     ];

  //     if (category) {
  //       whereConditions.push(eq(categoryTranslations.name, category));
  //     }

  //     // --- 1️⃣ Count total active products (for pagination info)
  //     const [{ total }] = await db
  //       .select({ total: sql<number>`COUNT(*) AS INTEGER` })
  //       .from(products)
  //       .leftJoin(categories, eq(categories.id, products.categoryId))
  //       .leftJoin(
  //         categoryTranslations,
  //         and(
  //           eq(categoryTranslations.categoryId, categories.id),
  //           eq(categoryTranslations.language, "en")
  //         )
  //       )
  //       .where(and(...whereConditions));      // --- 2️⃣ Get paginated products
  //     const productsResult = await db
  //       .select({
  //         id: products.id,
  //         vendorId: products.vendorId,
  //         categoryId: products.categoryId,
  //         categoryName: categoryTranslations.name,
  //         slug: products.slug,
  //         sku: products.sku,
  //         price: products.price,
  //         originalPrice: products.originalPrice,
  //         stock: products.stock,
  //         images: products.images,
  //         isFeatured: products.isFeatured,
  //         rating: products.rating,
  //         reviewCount: products.reviewCount,
  //         isActive: products.isActive,
  //         status: products.status,
  //         brand: products.brand,
  //         createdAt: products.createdAt,
  //         vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
  //       })
  //       .from(products)
  //       .leftJoin(users, eq(users.id, products.vendorId))
  //       .leftJoin(stores, eq(stores.ownerId, products.vendorId))
  //       .leftJoin(categories, eq(categories.id, products.categoryId))
  //       .leftJoin(
  //         categoryTranslations,
  //         and(
  //           eq(categoryTranslations.categoryId, categories.id),
  //           eq(categoryTranslations.language, "en")
  //         )
  //       )
  //       .where(and(...whereConditions))
  //       .orderBy(desc(products.createdAt))
  //       .limit(limit)
  //       .offset(offset);

  //     const productIds = productsResult.map((p) => p.id);
  //     if (productIds.length === 0) {
  //       return { items: [], total };
  //     }

  //     // --- 3️⃣ Get all translations for these products
  //     const translationsResult = await db
  //       .select({
  //         productId: productTranslations.productId,
  //         language: productTranslations.language,
  //         name: productTranslations.name,
  //         description: productTranslations.description,
  //         highlights: productTranslations.highlights,
  //       })
  //       .from(productTranslations)
  //       .where(inArray(productTranslations.productId, productIds));

  //     // --- 4️⃣ Group translations by product + language
  //     const translationsByProduct: Record<string, Record<string, any>> = {};

  //     translationsResult.forEach((t) => {
  //       if (!translationsByProduct[t.productId]) {
  //         translationsByProduct[t.productId] = {};
  //       }
  //       translationsByProduct[t.productId][t.language] = {
  //         name: t.name,
  //         description: t.description,
  //         highlights: t.highlights,
  //       };
  //     });

  //     // --- 5️⃣ Combine products with translations
  //     const items = productsResult.map((product) => ({
  //       ...product,
  //       name: translationsByProduct[product.id]?.en?.name || "Untitled Product",
  //       translations: translationsByProduct[product.id] || {},
  //     }));

  //     return { items, total };
  //   } catch (error) {
  //     console.error("❌ Error fetching all products with translations:", error);
  //     return { items: [], total: 0 };
  //   }
  // }

  async getProductsBySearchQuery(
    query: string,
    filters: any = {},
    category?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ items: any[]; total: number }> {
    try {
      const pattern = `%${query}%`;
      const conditions: any[] = [
        or(
          ilike(productTranslations.name, pattern),
          ilike(productTranslations.description, pattern),
          ilike(products.brand, pattern)
        ),
        eq(products.isActive, true),
        isNull(products.deletedAt),
      ];
      if (category) {
        conditions.push(eq(categoryTranslations.name, category));
      }

      if (filters.minPrice)
        conditions.push(gte(products.price, filters.minPrice));
      if (filters.maxPrice)
        conditions.push(lte(products.price, filters.maxPrice));
      if (filters.availability === "in_stock")
        conditions.push(gt(products.stock, 0));
      if (filters.rating) conditions.push(gte(products.rating, filters.rating));

      // 🧠 Sort logic
      let orderBy: any = desc(products.createdAt);
      if (filters.sort === "price_low_to_high") orderBy = asc(products.price);
      if (filters.sort === "price_high_to_low") orderBy = desc(products.price);
      if (filters.sort === "newest") orderBy = desc(products.createdAt);

      const queryBuilder = db
        .select({
          id: products.id,
          name: productTranslations.name,
          description: productTranslations.description,
          brand: products.brand,
          price: products.price,
          stock: products.stock,
          images: products.images,
          categoryId: products.categoryId,
        })
        .from(products)
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, "en")
          )
        )
        .leftJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, "en")
          )
        )
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset);

      const productsResult = await queryBuilder;
      const total = productsResult.length;

      return { items: productsResult, total };
    } catch (error) {
      console.error("❌ Error in getProductsBySearchQuery:", error);
      return { items: [], total: 0 };
    }
  }

  async getAllProductsWithTranslations(
    limit: number = 15,
    offset: number = 0,
    category?: string,
    filters: {
      minPrice?: number | null;
      maxPrice?: number | null;
      rating?: number | null;
      availability?: string | null;
      sort?: string | null;
      brand?: string | null;
    } = {}
  ): Promise<{ items: any[]; total: number }> {
    try {
      if (!db) throw new Error("Database not available");

      const whereConditions = [
        eq(products.isActive, true),
        isNull(products.deletedAt),
      ];

      // --- Category filter
      if (category) {
        whereConditions.push(eq(categoryTranslations.name, category));
      }

      // --- Price range
      if (filters.minPrice) {
        whereConditions.push(sql`${products.price} >= ${filters.minPrice}`);
      }
      if (filters.maxPrice) {
        whereConditions.push(sql`${products.price} <= ${filters.maxPrice}`);
      }

      // --- Rating
      if (filters.rating) {
        whereConditions.push(sql`${products.rating} >= ${filters.rating}`);
      }

      // --- Availability
      if (filters.availability === "inStock") {
        whereConditions.push(sql`${products.stock} > 0`);
      } else if (filters.availability === "outOfStock") {
        whereConditions.push(sql`${products.stock} = 0`);
      }

      // --- Brand filter
      if (filters.brand) {
        whereConditions.push(eq(products.brand, filters.brand));
      }

      // --- Total count for pagination
      const [{ total }] = await db
        .select({ total: sql<number>`COUNT(*) AS INTEGER` })
        .from(products)
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, "en")
          )
        )
        .where(and(...whereConditions));

      // --- Sorting
      let orderByClause: any = desc(products.createdAt);
      if (filters.sort === "price_asc")
        orderByClause = sql`${products.price} ASC`;
      if (filters.sort === "price_desc")
        orderByClause = sql`${products.price} DESC`;
      if (filters.sort === "rating_desc")
        orderByClause = sql`${products.rating} DESC`;
      if (filters.sort === "newest") orderByClause = desc(products.createdAt);

      // --- Fetch products
      const productsResult = await db
        .select({
          id: products.id,
          vendorId: products.vendorId,
          categoryId: products.categoryId,
          categoryName: categoryTranslations.name,
          slug: products.slug,
          sku: products.sku,
          price: products.price,
          originalPrice: products.originalPrice,
          stock: products.stock,
          brand: products.brand,
          images: products.images,
          isFeatured: products.isFeatured,
          rating: products.rating,
          reviewCount: products.reviewCount,
          createdAt: products.createdAt,
          vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        })
        .from(products)
        .leftJoin(users, eq(users.id, products.vendorId))
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, "en")
          )
        )
        .where(and(...whereConditions))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      const productIds = productsResult.map((p) => p.id);
      if (productIds.length === 0) return { items: [], total };

      // --- Translations
      const translationsResult = await db
        .select({
          productId: productTranslations.productId,
          language: productTranslations.language,
          name: productTranslations.name,
          description: productTranslations.description,
          highlights: productTranslations.highlights,
        })
        .from(productTranslations)
        .where(inArray(productTranslations.productId, productIds));

      const translationsByProduct: Record<string, Record<string, any>> = {};
      translationsResult.forEach((t) => {
        if (!translationsByProduct[t.productId])
          translationsByProduct[t.productId] = {};
        translationsByProduct[t.productId][t.language] = {
          name: t.name,
          description: t.description,
          highlights: t.highlights,
        };
      });

      const items = productsResult.map((product) => ({
        ...product,
        name: translationsByProduct[product.id]?.en?.name || "Untitled Product",
        translations: translationsByProduct[product.id] || {},
      }));

      return { items, total };
    } catch (error) {
      console.error("❌ Error fetching products with translations:", error);
      return { items: [], total: 0 };
    }
  }

  async getProductWithTranslations(
    productId: string,
    language: string
  ): Promise<any> {
    try {
      const [result] = await db
        .select({
          id: products.id,
          vendorId: products.vendorId,
          categoryId: products.categoryId,
          slug: products.slug,
          sku: products.sku,
          brand: products.brand,
          price: products.price,
          originalPrice: products.originalPrice,
          stock: products.stock,
          images: products.images,
          isFeatured: products.isFeatured,
          rating: products.rating,
          reviewCount: products.reviewCount,
          name: productTranslations.name,
          description: productTranslations.description,
          shortDescription: productTranslations.shortDescription,
          vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        })
        .from(products)
        .leftJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, language)
          )
        )
        .leftJoin(users, eq(users.id, products.vendorId))
        .where(and(eq(products.id, productId), eq(products.isActive, true)));

      if (!result) {
        return null;
      }

      // Fetch specifications for this product
      const specifications = await db
        .select({
          featureName: productSpecifications.featureName,
          featureValue: productSpecifications.featureValue,
        })
        .from(productSpecifications)
        .where(eq(productSpecifications.productId, productId));

      // Fetch FAQs for this product
      const faqs = await db
        .select({
          question: productFaqs.question,
          answer: productFaqs.answer,
        })
        .from(productFaqs)
        .where(eq(productFaqs.productId, productId));

      return {
        ...result,
        specifications,
        faqs,
      };
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  async createProduct(productData: any): Promise<any> {
    try {
      // Create the product
      const [product] = await db
        .insert(products)
        .values({
          vendorId: productData.vendorId,
          categoryId: productData.categoryId,
          slug:
            productData.name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "") +
            "-" +
            Date.now(),
          sku: productData.productNumber || `PRD-${Date.now()}`,
          price: productData.price.toString(),
          originalPrice: productData.originalPrice?.toString(),
          stock: productData.stockQuantity || 0,
          images: productData.images || [],
          isFeatured: productData.isFeatured,
          isActive: true,
          rating: "0.0",
          reviewCount: 0,
        })
        .returning();

      // Create product translations for default language (English)
      await db.insert(productTranslations).values({
        productId: product.id,
        language: "en",
        name: productData.name,
        description: productData.description,
        shortDescription: productData.highlights || "",
      });

      return {
        ...product,
        name: productData.name,
        description: productData.description,
        shortDescription: productData.highlights || "",
      };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  // async createProductWithDetails(productData: any): Promise<any> {
  //   try {
  //     // Generate slug from primary name (prefer English, fallback to French)
  //     const primaryName =
  //       productData.translations.en?.name ||
  //       productData.translations.fr?.name ||
  //       "product";
  //     const slug =
  //       primaryName
  //         .toLowerCase()
  //         .replace(/\s+/g, "-")
  //         .replace(/[^a-z0-9-]/g, "") +
  //       "-" +
  //       Date.now();

  //     // Create the main product
  //     const [product] = await db
  //       .insert(products)
  //       .values({
  //         vendorId: productData.vendorId,
  //         categoryId: productData.categoryId,
  //         slug,
  //         sku:
  //           productData.sku ||
  //           `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
  //         brand: productData.brand || "Unknown Brand",
  //         price: productData.price.toString(),
  //         originalPrice: productData.originalPrice?.toString(),
  //         purchasePrice: productData.purchasePrice?.toString(),
  //         minThreshold: productData.minThreshold?.toString(),
  //         suggestedQuantity: productData.suggestedQuantity?.toString(),
  //         stock: productData.stock || 0,
  //         images: productData.images || [],
  //         isFeatured: productData.is_featured,
  //         isActive: productData.status === "active",
  //         replenishmentStatus: productData.replenishmentStatus ?? "on_hold",
  //         rating: "0.0",
  //         reviewCount: 0,
  //       })
  //       .returning();

  //     // Create product translations for all provided languages
  //     const translationPromises = Object.entries(productData.translations).map(
  //       ([language, translation]: [string, any]) => {
  //         if (translation.name) {
  //           return db.insert(productTranslations).values({
  //             productId: product.id,
  //             language,
  //             name: translation.name,
  //             description: translation.description || "",
  //             shortDescription: translation.shortDescription || "",
  //             highlights: translation.highlights || "",
  //           });
  //         }
  //         return Promise.resolve();
  //       }
  //     );

  //     await Promise.all(translationPromises.filter((p) => p));

  //     // Create product specifications
  //     if (productData.specifications && productData.specifications.length > 0) {
  //       const specificationPromises = productData.specifications.map(
  //         (spec: any, index: number) => {
  //           if (spec.featureName && spec.featureValue) {
  //             return db.insert(productSpecifications).values({
  //               productId: product.id,
  //               featureName: spec.featureName,
  //               featureValue: spec.featureValue,
  //               featureType: spec.featureType || "text",
  //               sortOrder: index,
  //             });
  //           }
  //           return Promise.resolve();
  //         }
  //       );

  //       await Promise.all(specificationPromises.filter((p: any) => p));
  //     }

  //     // Create product FAQs
  //     if (productData.faqs && productData.faqs.length > 0) {
  //       const faqPromises = productData.faqs.map((faq: any, index: number) => {
  //         if (faq.question && faq.answer) {
  //           return db.insert(productFaqs).values({
  //             productId: product.id,
  //             question: faq.question,
  //             answer: faq.answer,
  //             sortOrder: index,
  //             isActive: true,
  //           });
  //         }
  //         return Promise.resolve();
  //       });

  //       await Promise.all(faqPromises.filter((p: any) => p));
  //     }

  //     // Update store product count
  //     await db
  //       .update(stores)
  //       .set({
  //         productCount: sql`${stores.productCount} + 1`,
  //         updatedAt: new Date(),
  //       })
  //       .where(eq(stores.ownerId, productData.vendorId));

  //     // Return product with primary language translation
  //     const primaryTranslation =
  //       productData.translations.en ||
  //       productData.translations.fr ||
  //       Object.values(productData.translations)[0];
  //     return {
  //       ...product,
  //       name: primaryTranslation?.name || "Unnamed Product",
  //       description: primaryTranslation?.description || "",
  //       shortDescription: primaryTranslation?.shortDescription || "",
  //     };
  //   } catch (error) {
  //     console.error("Error creating product with details:", error);
  //     throw error;
  //   }
  // }

  async createProductWithDetails(productData: any): Promise<any> {
    try {
      if (
        !productData.translations ||
        Object.keys(productData.translations).length === 0
      ) {
        throw new Error(
          "At least one product translation (e.g. English) is required."
        );
      }

      const primaryName =
        productData.translations.en?.name ||
        productData.translations.fr?.name ||
        "Unnamed Product";

      const slug =
        primaryName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") +
        "-" +
        Date.now();

      const [product] = await db
        .insert(products)
        .values({
          vendorId: productData.vendorId,
          categoryId: productData.categoryId,
          slug,
          sku:
            productData.sku ||
            `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          brand: productData.brand || "Unknown",
          price: productData.price?.toString() || "0",
          originalPrice: productData.originalPrice?.toString() || "0",
          purchasePrice: productData.purchasePrice?.toString() || null,
          minThreshold: productData.minThreshold?.toString() || null,
          suggestedQuantity: productData.suggestedQuantity?.toString() || null,
          stock: productData.stock ?? 0,
          images: productData.images || [],
          isFeatured: productData.isFeatured ?? false, // ✅ fixed naming
          isActive:
            productData.status === "active" ||
            productData.isActive === true ||
            !productData.status,
          replenishmentStatus: productData.replenishmentStatus ?? "on_hold",
          rating: "0.0",
          reviewCount: 0,
        })
        .returning();

      // 🌐 Insert translations for each language
      const translationPromises = Object.entries(productData.translations).map(
        ([language, translation]: [string, any]) => {
          if (translation.name) {
            return db.insert(productTranslations).values({
              productId: product.id,
              language,
              name: translation.name,
              description: translation.description || "",
              shortDescription: translation.shortDescription || "",
              highlights: translation.highlights || "",
            });
          }
          return Promise.resolve();
        }
      );
      await Promise.all(translationPromises);

      // ⚙️ Insert specifications (if provided)
      if (productData.specifications?.length) {
        const specPromises = productData.specifications.map(
          (spec: any, index: number) => {
            if (spec.featureName && spec.featureValue) {
              return db.insert(productSpecifications).values({
                productId: product.id,
                featureName: spec.featureName,
                featureValue: spec.featureValue,
                featureType: spec.featureType || "text",
                sortOrder: index,
              });
            }
            return Promise.resolve();
          }
        );
        await Promise.all(specPromises);
      }

      // ❓ Insert FAQs (if provided)
      if (productData.faqs?.length) {
        const faqPromises = productData.faqs.map((faq: any, index: number) => {
          if (faq.question && faq.answer) {
            return db.insert(productFaqs).values({
              productId: product.id,
              question: faq.question,
              answer: faq.answer,
              sortOrder: index,
              isActive: true,
            });
          }
          return Promise.resolve();
        });
        await Promise.all(faqPromises);
      }

      // 🏪 Safely increment store’s product count
      const storeExists = await db
        .select()
        .from(stores)
        .where(eq(stores.ownerId, productData.vendorId))
        .limit(1);

      if (storeExists.length > 0) {
        await db
          .update(stores)
          .set({
            productCount: sql`${stores.productCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(stores.ownerId, productData.vendorId));
      }

      // 🏁 Return product with its primary translation
      const primaryTranslation =
        productData.translations.en ||
        productData.translations.fr ||
        Object.values(productData.translations)[0];

      return {
        ...product,
        name: primaryTranslation?.name || "Unnamed Product",
        description: primaryTranslation?.description || "",
        shortDescription: primaryTranslation?.shortDescription || "",
      };
    } catch (error) {
      console.error("❌ Error creating product with details:", error);
      throw error;
    }
  }

  async getProductForEdit(productId: string, vendorId: string): Promise<any> {
    try {
      // Get the basic product information
      const [product] = await db!
        .select()
        .from(products)
        .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)))
        .limit(1);

      if (!product) {
        return null;
      }

      // Get all translations for this product
      const translations = await db!
        .select()
        .from(productTranslations)
        .where(eq(productTranslations.productId, productId));

      // Get specifications
      const specifications = await db!
        .select()
        .from(productSpecifications)
        .where(eq(productSpecifications.productId, productId))
        .orderBy(productSpecifications.sortOrder);

      // Get FAQs
      const faqs = await db!
        .select()
        .from(productFaqs)
        .where(eq(productFaqs.productId, productId))
        .orderBy(productFaqs.sortOrder);

      // Organize translations by language
      const translationsByLanguage: any = {};
      translations.forEach((translation) => {
        translationsByLanguage[translation.language] = {
          name: translation.name,
          description: translation.description,
          highlights: translation.highlights,
        };
      });

      // Transform images array to extract URLs for edit mode
      const imageUrls = Array.isArray(product.images)
        ? product.images.map((img: any) =>
          typeof img === "string" ? img : img?.url || img
        )
        : [];

      return {
        ...product,
        images: imageUrls, // Use transformed image URLs
        status: product.isActive ? "active" : "inactive",
        translations: translationsByLanguage,
        specifications,
        faqs,
      };
    } catch (error) {
      console.error("Error fetching product for edit:", error);
      return null;
    }
  }

  async getProductsByVendor(
    vendorId: string,
    language: string = "en"
  ): Promise<any[]> {
    try {
      if (!db) throw new Error("Database not available");

      // 1) Fetch products
      const productsResult = await db
        .select({
          id: products.id,
          vendorId: products.vendorId,
          categoryId: products.categoryId,
          categoryName: categoryTranslations.name,
          slug: products.slug,
          sku: products.sku,
          brand: products.brand,
          price: products.price,
          originalPrice: products.originalPrice,
          stock: products.stock,
          images: products.images,
          isFeatured: products.isFeatured,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isActive: products.isActive,
          vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        })
        .from(products)
        .leftJoin(users, eq(users.id, products.vendorId))
        .leftJoin(categories, eq(categories.id, products.categoryId))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, language)
          )
        )
        .where(
          and(
            eq(products.vendorId, vendorId),
            eq(products.isActive, true),
            isNull(products.deletedAt)
          )
        )
        .orderBy(desc(products.createdAt));

      if (productsResult.length === 0) return [];

      const productIds = productsResult.map((p) => p.id);

      // 2) Fetch all translations, FAQs and specifications in bulk (single DB calls)
      const [translationsResult, faqsResult, specificationsResult] =
        await Promise.all([
          db
            .select({
              productId: productTranslations.productId,
              language: productTranslations.language,
              name: productTranslations.name,
              description: productTranslations.description,
              highlights: productTranslations.highlights,
            })
            .from(productTranslations)
            .where(inArray(productTranslations.productId, productIds)),
          db
            .select({
              productId: productFaqs.productId,
              question: productFaqs.question,
              answer: productFaqs.answer,
              sortOrder: productFaqs.sortOrder,
            })
            .from(productFaqs)
            .where(
              and(
                inArray(productFaqs.productId, productIds),
                eq(productFaqs.isActive, true)
              )
            )
            .orderBy(productFaqs.sortOrder),
          db
            .select({
              productId: productSpecifications.productId,
              featureName: productSpecifications.featureName,
              featureValue: productSpecifications.featureValue,
              featureType: productSpecifications.featureType,
              sortOrder: productSpecifications.sortOrder,
            })
            .from(productSpecifications)
            .where(inArray(productSpecifications.productId, productIds))
            .orderBy(productSpecifications.sortOrder),
        ]);

      // 3) Group translations/faqs/specs by product id
      const translationsByProduct: { [productId: string]: any } = {};
      translationsResult.forEach((tr) => {
        translationsByProduct[tr.productId] =
          translationsByProduct[tr.productId] || {};
        translationsByProduct[tr.productId][tr.language] = {
          name: tr.name,
          description: tr.description,
          highlights: tr.highlights,
        };
      });

      const faqsByProduct: { [productId: string]: any[] } = {};
      faqsResult.forEach((f) => {
        faqsByProduct[f.productId] = faqsByProduct[f.productId] || [];
        faqsByProduct[f.productId].push({
          question: f.question,
          answer: f.answer,
        });
      });

      const specificationsByProduct: { [productId: string]: any[] } = {};
      specificationsResult.forEach((s) => {
        specificationsByProduct[s.productId] =
          specificationsByProduct[s.productId] || [];
        specificationsByProduct[s.productId].push({
          featureName: s.featureName,
          featureValue: s.featureValue,
          featureType: s.featureType,
        });
      });

      // 4) Compose final results without per-item DB calls
      const productsWithDetails = productsResult.map((product) => {
        const imageUrls = Array.isArray(product.images)
          ? product.images.map((img: any) =>
            typeof img === "string" ? img : img?.url || img
          )
          : [];

        const translations = translationsByProduct[product.id] || {};
        const name =
          translations[language]?.name ||
          translations["en"]?.name ||
          "Untitled Product";

        return {
          ...product,
          images: imageUrls,
          status: product.isActive ? "active" : "inactive",
          price: product.price?.toString?.() ?? String(product.price ?? "0"),
          originalPrice:
            product.originalPrice?.toString?.() ??
            product.originalPrice ??
            null,
          rating: parseFloat(product.rating || "0"),
          faqs: faqsByProduct[product.id] || [],
          specifications: specificationsByProduct[product.id] || [],
          name,
          translations,
        };
      });

      return productsWithDetails;
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      return [];
    }
  }

  // async getProductsByVendor(
  //   vendorId: string,
  //   language: string = "en"
  // ): Promise<any[]> {
  //   try {
  //     if (!db) throw new Error("Database not available");

  //     // First, get all products by vendor
  //     const productsResult = await db
  //       .select({
  //         id: products.id,
  //         vendorId: products.vendorId,
  //         categoryId: products.categoryId,
  //         categoryName: categoryTranslations.name,
  //         slug: products.slug,
  //         sku: products.sku,
  //         brand: products.brand,
  //         price: products.price,
  //         originalPrice: products.originalPrice,
  //         stock: products.stock,
  //         images: products.images,
  //         isFeatured: products.isFeatured,
  //         rating: products.rating,
  //         reviewCount: products.reviewCount,
  //         isActive: products.isActive,
  //         vendorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
  //       })
  //       .from(products)
  //       .leftJoin(users, eq(users.id, products.vendorId))
  //       .leftJoin(categories, eq(categories.id, products.categoryId))
  //       .leftJoin(
  //         categoryTranslations,
  //         and(
  //           eq(categoryTranslations.categoryId, categories.id),
  //           eq(categoryTranslations.language, language)
  //         )
  //       )
  //       .where(
  //         and(
  //           eq(products.vendorId, vendorId),
  //           eq(products.isActive, true),
  //           isNull(products.deletedAt)
  //         )
  //       )
  //       .orderBy(desc(products.createdAt));

  //     // Then, get ALL translations for these products
  //     const productIds = productsResult.map((p) => p.id);

  //     if (productIds.length === 0) {
  //       return [];
  //     }

  //     const translationsResult = await db
  //       .select({
  //         productId: productTranslations.productId,
  //         language: productTranslations.language,
  //         name: productTranslations.name,
  //         description: productTranslations.description,
  //         highlights: productTranslations.highlights,
  //       })
  //       .from(productTranslations)
  //       .where(inArray(productTranslations.productId, productIds));

  //     // Group translations by product ID and language
  //     const translationsByProduct: {
  //       [productId: string]: { [language: string]: any };
  //     } = {};

  //     translationsResult.forEach((translation) => {
  //       if (!translationsByProduct[translation.productId]) {
  //         translationsByProduct[translation.productId] = {};
  //       }
  //       translationsByProduct[translation.productId][translation.language] = {
  //         name: translation.name,
  //         description: translation.description,
  //         highlights: translation.highlights,
  //       };
  //     });

  //     // Combine products with their translations
  //     const result = productsResult.map((product) => ({
  //       ...product,
  //       name:
  //         translationsByProduct[product.id]?.[language]?.name ||
  //         "Untitled Product",
  //       translations: translationsByProduct[product.id] || {},
  //     }));

  //     // Fetch FAQs and specifications for each product
  //     const productsWithDetails = await Promise.all(
  //       result.map(async (product) => {
  //         // Transform images array to extract URLs
  //         const imageUrls = Array.isArray(product.images)
  //           ? product.images.map((img: any) =>
  //               typeof img === "string" ? img : img?.url || img
  //             )
  //           : [];

  //         // Get FAQs
  //         const faqs = await db
  //           .select({
  //             question: productFaqs.question,
  //             answer: productFaqs.answer,
  //           })
  //           .from(productFaqs)
  //           .where(
  //             and(
  //               eq(productFaqs.productId, product.id),
  //               eq(productFaqs.isActive, true)
  //             )
  //           )
  //           .orderBy(productFaqs.sortOrder);

  //         // Get specifications
  //         const specifications = await db
  //           .select({
  //             featureName: productSpecifications.featureName,
  //             featureValue: productSpecifications.featureValue,
  //             featureType: productSpecifications.featureType,
  //           })
  //           .from(productSpecifications)
  //           .where(eq(productSpecifications.productId, product.id))
  //           .orderBy(productSpecifications.sortOrder);

  //         return {
  //           ...product,
  //           images: imageUrls, // Use transformed image URLs
  //           status: product.isActive ? "active" : "inactive",
  //           price: product.price.toString(),
  //           originalPrice: product.originalPrice?.toString(),
  //           rating: parseFloat(product.rating || "0"),
  //           faqs: faqs || [],
  //           specifications: specifications || [],
  //         };
  //       })
  //     );

  //     return productsWithDetails;
  //   } catch (error) {
  //     console.error("Error fetching vendor products:", error);
  //     return [];
  //   }
  // }

  // Shipments Api's

  async getShipments() {
    return await db
      .select({
        id: shipments.id,
        orderId: shipments.orderId,
        customerName: shipments.customerName,
        customerPhone: shipments.customerPhone,
        origin: shipments.origin,
        destination: shipments.destination,
        carrierId: shipments.carrierId,
        carrierName: carriers.name,
        status: shipments.status,
        trackingNumber: shipments.trackingNumber,
        estimatedDelivery: shipments.estimatedDelivery,
        actualDelivery: shipments.actualDelivery,
        weight: shipments.weight,
        value: shipments.value,
        shippingCost: shipments.shippingCost,
        notes: shipments.notes,
        createdAt: shipments.createdAt,
        updatedAt: shipments.updatedAt,
      })
      .from(shipments)
      .leftJoin(carriers, eq(shipments.carrierId, carriers.id))
      .orderBy(desc(shipments.createdAt));
  }

  // ✅ Create new shipment
  async createShipment(data: any) {
    const newShipment = {
      orderId: data.orderId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      origin: data.origin,
      destination: data.destination,
      carrierId: data.carrierId || null,
      status: data.status || "en_preparation",
      trackingNumber: data.trackingNumber,
      estimatedDelivery: data.estimatedDelivery
        ? new Date(data.estimatedDelivery)
        : null,
      actualDelivery: data.actualDelivery
        ? new Date(data.actualDelivery)
        : null,
      weight: data.weight,
      value: data.value,
      shippingCost: data.shippingCost,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.insert(shipments).values(newShipment).returning();
    return result[0];
  }

  // ✅ Update shipment
  async updateShipment(id: string, data: any) {
    const [updated] = await db
      .update(shipments)
      .set({
        ...data,
        estimatedDelivery: data.estimatedDelivery
          ? new Date(data.estimatedDelivery)
          : null,
        actualDelivery: data.actualDelivery
          ? new Date(data.actualDelivery)
          : null,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, id))
      .returning();
    return updated;
  }

  // ✅ Delete shipment
  async deleteShipment(id: string) {
    await db.delete(shipments).where(eq(shipments.id, id));
    return { success: true };
  }

  // ✅ Fetch analytics properly (by status, carrier, and origin)
  async getShipmentsAnalytics() {
    const statusCounts = await db
      .select({
        status: shipments.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(shipments)
      .groupBy(shipments.status);

    const carrierCounts = await db
      .select({
        carrierId: shipments.carrierId,
        carrierName: carriers.name,
        count: sql<number>`COUNT(*)`,
      })
      .from(shipments)
      .leftJoin(carriers, eq(shipments.carrierId, carriers.id))
      .groupBy(shipments.carrierId, carriers.name);

    const zoneCounts = await db
      .select({
        zone: shipments.origin,
        count: sql<number>`COUNT(*)`,
      })
      .from(shipments)
      .groupBy(shipments.origin);

    return {
      statusCounts,
      carrierCounts,
      zoneCounts,
    };
  }

  async getVendors(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: users.id,
          name: sql<string>`${users.firstName} || ' ' || ${users.lastName}`.as(
            "name"
          ),
          email: users.email,
          avatar: users.avatar,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(and(eq(users.role, "seller"), eq(users.isActive, true)))
        .limit(10);

      return result.map((vendor) => ({
        ...vendor,
        description: `Professional seller since ${new Date(
          vendor.createdAt
        ).getFullYear()}`,
        rating: 4.5 + Math.random() * 0.5, // Mock rating
        productCount: Math.floor(Math.random() * 2000) + 100, // Mock product count
      }));
    } catch (error) {
      console.error("Error fetching vendors:", error);
      return [];
    }
  }

  async updateProductWithDetails(
    productId: string,
    vendorId: string,
    productData: any
  ): Promise<any> {
    try {
      // Update the main product
      await db
        .update(products)
        .set({
          categoryId: productData.categoryId,
          sku: productData.sku,
          brand: productData.brand,
          price: productData.price.toString(),
          originalPrice: productData.originalPrice?.toString(),
          stock: productData.stock || 0,
          images: productData.images || [],
          isActive: productData.status === "active",
          updatedAt: new Date(),
          isFeatured: productData.isFeatured,
        })
        .where(
          and(eq(products.id, productId), eq(products.vendorId, vendorId))
        );

      // Update translations
      if (productData.translations) {
        for (const [language, translation] of Object.entries(
          productData.translations
        )) {
          const translationData = translation as any;
          if (translationData.name) {
            await db
              .update(productTranslations)
              .set({
                name: translationData.name,
                description: translationData.description || "",
                shortDescription: translationData.shortDescription || "",
                highlights: translationData.highlights || "",
              })
              .where(
                and(
                  eq(productTranslations.productId, productId),
                  eq(productTranslations.language, language)
                )
              );
          }
        }
      }

      // Update specifications
      if (productData.specifications) {
        // Delete existing specifications
        await db
          .delete(productSpecifications)
          .where(eq(productSpecifications.productId, productId));

        // Insert new specifications
        if (productData.specifications.length > 0) {
          const specificationPromises = productData.specifications.map(
            (spec: any, index: number) => {
              if (spec.featureName && spec.featureValue) {
                return db.insert(productSpecifications).values({
                  productId,
                  featureName: spec.featureName,
                  featureValue: spec.featureValue,
                  featureType: spec.featureType || "text",
                  sortOrder: index,
                });
              }
              return Promise.resolve();
            }
          );

          await Promise.all(specificationPromises.filter((p: any) => p));
        }
      }

      // Update FAQs
      if (productData.faqs) {
        // Delete existing FAQs
        await db
          .delete(productFaqs)
          .where(eq(productFaqs.productId, productId));

        // Insert new FAQs
        if (productData.faqs.length > 0) {
          const faqPromises = productData.faqs.map(
            (faq: any, index: number) => {
              if (faq.question && faq.answer) {
                return db.insert(productFaqs).values({
                  productId,
                  question: faq.question,
                  answer: faq.answer,
                  sortOrder: index,
                  isActive: true,
                });
              }
              return Promise.resolve();
            }
          );

          await Promise.all(faqPromises.filter((p: any) => p));
        }
      }

      // Return success message
      return { id: productId, message: "Product updated successfully" };
    } catch (error) {
      console.error("Error updating product with details:", error);
      throw error;
    }
  }

  // async getClientDashboardStats(userId: string): Promise<any> {
  //   try {
  //     // In a real implementation, these would be actual database queries
  //     return {
  //       totalOrders: 12,
  //       wishlistItems: 24,
  //       reviewsWritten: 8,
  //       totalSpent: "1,234",
  //     };
  //   } catch (error) {
  //     console.error("Error fetching client dashboard stats:", error);
  //     return {
  //       totalOrders: 0,
  //       wishlistItems: 0,
  //       reviewsWritten: 0,
  //       totalSpent: "0",
  //     };
  //   }
  // }

  async getClientDashboardStats(userId: string): Promise<any> {
    try {
      if (!db) throw new Error("Database not available");

      const [{ totalOrders }] = await db
        .select({ totalOrders: sql<number>`COUNT(*)` })
        .from(orders)
        .where(eq(orders.userId, userId));

      const [{ wishlistItems }] = await db
        .select({ wishlistItems: sql<number>`COUNT(*)` })
        .from(wishlists)
        .where(eq(wishlists.userId, userId));

      // const [{ reviewsWritten }] =
      //   await db
      //     .select({ reviewsWritten: sql<number>`COUNT(*)` })
      //     .from(reviews)
      //     .where(eq(reviews.userId, userId));

      const [{ totalSpent }] = await db
        .select({
          totalSpent: sql<string>`COALESCE(SUM(${orders.totalAmount}), '0')`,
        })
        .from(orders)
        .where(eq(orders.userId, userId));

      return {
        totalOrders: Number(totalOrders) || 0,
        wishlistItems: Number(wishlistItems) || 0,
        // reviewsWritten: Number(reviewsWritten) || 0,
        totalSpent: Number(totalSpent).toLocaleString(),
      };
    } catch (error) {
      console.error("❌ Error fetching client dashboard stats:", error);
      return {
        totalOrders: 0,
        wishlistItems: 0,
        reviewsWritten: 0,
        totalSpent: "0",
      };
    }
  }

  async getSellerDashboardStats(userId: string): Promise<any> {
    try {
      if (!db) throw new Error("Database not available");

      // Products total (active)
      const productsCountRow = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(products)
        .where(and(eq(products.vendorId, userId), eq(products.isActive, true)));
      const totalProducts = Number(productsCountRow[0]?.count ?? 0);

      // Promotions total
      // const promotionsCountRow = await db
      //   .select({ count: sql<number>`COUNT(*)::int` })
      //   .from(promotions)
      //   .where(eq(promotions.vendorId, userId));
      // const totalPromotions = Number(promotionsCountRow[0]?.count ?? 0);
      const totalPromotions = 10; // Mocked for now


      // Revenue: sum of orderItems.totalPrice for completed orders for this vendor
      const currentRevenueRow = await db
        .select({ total: sql<number>`COALESCE(SUM(${orderItems.totalPrice}),0)` })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(products.vendorId, userId),
            eq(orders.status, "delivered"),
            gte(orders.createdAt, currentMonthStart),
            lte(orders.createdAt, currentMonthEnd)
          )
        );
      const previousRevenueRow = await db
        .select({ total: sql<number>`COALESCE(SUM(${orderItems.totalPrice}),0)` })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(products.vendorId, userId),
            eq(orders.status, "delivered"),
            gte(orders.createdAt, previousMonthStart),
            lte(orders.createdAt, previousMonthEnd)
          )
        );

      const currentRevenue = Number(currentRevenueRow[0]?.total ?? 0);
      const previousRevenue = Number(previousRevenueRow[0]?.total ?? 0);

      // Orders count (distinct orders) current / previous
      const currentOrdersRow = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${orders.id})::int` })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(products.vendorId, userId),
            eq(orders.status, "delivered"),
            gte(orders.createdAt, currentMonthStart),
            lte(orders.createdAt, currentMonthEnd)
          )
        );

      const previousOrdersRow = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${orders.id})::int` })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(products.vendorId, userId),
            eq(orders.status, "delivered"),
            gte(orders.createdAt, previousMonthStart),
            lte(orders.createdAt, previousMonthEnd)
          )
        );

      const currentOrdersCount = Number(currentOrdersRow[0]?.count ?? 0);
      const previousOrdersCount = Number(previousOrdersRow[0]?.count ?? 0);

      // Products created in current / previous month (growth)
      const currentProductsRow = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(products)
        .where(
          and(
            eq(products.vendorId, userId),
            gte(products.createdAt, currentMonthStart),
            lte(products.createdAt, currentMonthEnd)
          )
        );

      const previousProductsRow = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(products)
        .where(
          and(
            eq(products.vendorId, userId),
            gte(products.createdAt, previousMonthStart),
            lte(products.createdAt, previousMonthEnd)
          )
        );

      const currentProductsCount = Number(currentProductsRow[0]?.count ?? 0);
      const previousProductsCount = Number(previousProductsRow[0]?.count ?? 0);

      // Promotions created in current / previous month (growth)
      // const currentPromotionsRow = await db
      //   .select({ count: sql<number>`COUNT(*)::int` })
      //   .from(promotions)
      //   .where(
      //     and(
      //       eq(promotions.vendorId, userId),
      //       gte(promotions.createdAt, currentMonthStart),
      //       lte(promotions.createdAt, currentMonthEnd)
      //     )
      //   );

      // const previousPromotionsRow = await db
      //   .select({ count: sql<number>`COUNT(*)::int` })
      //   .from(promotions)
      //   .where(
      //     and(
      //       eq(promotions.vendorId, userId),
      //       gte(promotions.createdAt, previousMonthStart),
      //       lte(promotions.createdAt, previousMonthEnd)
      //     )
      //   );

      // const currentPromotionsCount = Number(currentPromotionsRow[0]?.count ?? 0);
      // const previousPromotionsCount = Number(previousPromotionsRow[0]?.count ?? 0);
      const currentPromotionsCount = 5; // Mocked for now
      const previousPromotionsCount = 6; // Mocked for now
      // percentage helpers (reuse existing getPercentageChange)
      const revenueChange = getPercentageChange(currentRevenue, previousRevenue);
      const ordersChange = getPercentageChange(currentOrdersCount, previousOrdersCount);
      const productsChange = getPercentageChange(currentProductsCount, previousProductsCount);
      const promotionsChange = getPercentageChange(currentPromotionsCount, previousPromotionsCount);

      return {
        turnover: Math.round(currentRevenue),
        turnoverChange: Math.round(revenueChange),
        orders: currentOrdersCount,
        ordersChange: Math.round(ordersChange),
        products: totalProducts,
        productsChange: Math.round(productsChange),
        promotions: totalPromotions,
        promotionsChange: Math.round(promotionsChange),
      };
    } catch (error) {
      console.error("Error fetching seller dashboard stats:", error);
      return {
        turnover: 0,
        turnoverChange: 0,
        orders: 0,
        ordersChange: 0,
        products: 0,
        productsChange: 0,
        promotions: 0,
        promotionsChange: 0,
      };
    }
  }


  async getAdminDashboardStats(): Promise<any> {
    try {
      // approved shops count (int)
      const shopsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(stores)
        .where(eq(stores.status, "approved"))
        .then((rows) => Number(rows[0]?.count ?? 0));

      // clients count (int)
      const clientCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(
          and(
            eq(users.role, "client"),
            eq(users.emailVerified, true),
            eq(users.isActive, true)
          )
        )
        .then((rows) => Number(rows[0]?.count ?? 0));

      // completed orders count (int)
      const ordersCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(eq(orders.status, "completed"))
        .then((rows) => Number(rows[0]?.count ?? 0));

      // total revenue: 5% of totalAmount for completed orders (number -> int)
      const totalRevenue = await db
        .select({
          total: sql<number>`COALESCE(SUM(${orders.totalAmount} * 0.05), 0)`,
        })
        .from(orders)
        .where(eq(orders.status, "completed"))
        .then((rows) => Number(rows[0]?.total ?? 0));

      // current / previous orders counts (ints)
      const currentOrdersCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(
          and(
            eq(orders.status, "completed"),
            gte(orders.createdAt, currentMonthStart),
            lte(orders.createdAt, currentMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.count ?? 0));

      const previousOrdersCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(orders)
        .where(
          and(
            eq(orders.status, "completed"),
            gte(orders.createdAt, previousMonthStart),
            lte(orders.createdAt, previousMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.count ?? 0));

      const ordersChange = getPercentageChange(
        currentOrdersCount,
        previousOrdersCount
      );

      // current / previous clients (ints)
      const currentClientsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(
          and(
            eq(users.role, "client"),
            eq(users.emailVerified, true),
            eq(users.isActive, true),
            gte(users.createdAt, currentMonthStart),
            lte(users.createdAt, currentMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.count ?? 0));

      const previousClientsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(
          and(
            eq(users.role, "client"),
            eq(users.emailVerified, true),
            eq(users.isActive, true),
            gte(users.createdAt, previousMonthStart),
            lte(users.createdAt, previousMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.count ?? 0));

      const clientsChange = getPercentageChange(
        currentClientsCount,
        previousClientsCount
      );

      // current / previous shops (ints)
      const currentShopsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(stores)
        .where(
          and(
            eq(stores.status, "approved"),
            gte(stores.createdAt, currentMonthStart),
            lte(stores.createdAt, currentMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.count ?? 0));

      const previousShopsCount = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(stores)
        .where(
          and(
            eq(stores.status, "approved"),
            gte(stores.createdAt, previousMonthStart),
            lte(stores.createdAt, previousMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.count ?? 0));

      const shopsChange = getPercentageChange(
        currentShopsCount,
        previousShopsCount
      );

      // revenue for current / previous month (number -> int)
      const currentRevenue = await db
        .select({
          total: sql<number>`COALESCE(SUM(${orders.totalAmount} * 0.05), 0)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.status, "completed"),
            gte(orders.createdAt, currentMonthStart),
            lte(orders.createdAt, currentMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.total ?? 0));

      const previousRevenue = await db
        .select({
          total: sql<number>`COALESCE(SUM(${orders.totalAmount} * 0.05), 0)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.status, "completed"),
            gte(orders.createdAt, previousMonthStart),
            lte(orders.createdAt, previousMonthEnd)
          )
        )
        .then((rows) => Number(rows[0]?.total ?? 0));

      const revenueChange = getPercentageChange(
        currentRevenue,
        previousRevenue
      );

      // Return all values as integers (counts & revenue floored)
      return {
        totalRevenue: Math.floor(totalRevenue),
        totalSellers: Math.floor(shopsCount),
        totalOrders: Math.floor(ordersCount),
        totalClients: Math.floor(clientCount),

        revenueChange: Math.round(revenueChange),
        clientsChange: Math.round(clientsChange),
        shopsChange: Math.round(shopsChange),
        ordersChange: Math.round(ordersChange),
      };
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      return {
        totalRevenue: 0,
        totalSellers: 0,
        totalOrders: 0,
        totalClients: 0,

        revenueChange: 0,
        clientsChange: 0,
        shopsChange: 0,
        ordersChange: 0,
      };
    }
  }

  // async getOrdersByUserId(userId: string): Promise<any[]> {
  //   try {
  //     const result = await db
  //       .select({
  //         id: orders.id,
  //         status: orders.status,
  //         totalAmount: orders.totalAmount,
  //         createdAt: orders.createdAt,
  //         updatedAt: orders.updatedAt,
  //       })
  //       .from(orders)
  //       .where(eq(orders.userId, userId))
  //       .orderBy(desc(orders.createdAt));

  //     return result;
  //   } catch (error) {
  //     console.error("Error fetching user orders:", error);
  //     return [];
  //   }
  // }

  // async getStockAlertsBySellerId(sellerId: string, lang = "en") {
  //   const rows = await db
  //     .select({
  //       id: products.id,
  //       sku: products.sku,
  //       productName: productTranslations.name,
  //       stock: products.stock,
  //       minThreshold: products.minThreshold,
  //       price: products.price,
  //       images: products.images,
  //       storeName: stores.storeName,
  //     })
  //     .from(products)
  //     .innerJoin(
  //       productTranslations,
  //       and(
  //         eq(productTranslations.productId, products.id),
  //         eq(productTranslations.language, lang)
  //       )
  //     )
  //     .leftJoin(stores, eq(products.vendorId, stores.ownerId))
  //     .where(eq(products.vendorId, sellerId));

  //   return rows
  //     .filter((r) => (r.stock ?? 0) <= (r.minThreshold ?? 0))
  //     .map((r) => {
  //       const minT = Number(r.minThreshold ?? 10);
  //       const currentStock = Number(r.stock ?? 0);
  //       let alertType: "critical" | "important" | "medium" = "medium";
  //       if (currentStock === 0) alertType = "critical";
  //       else if (currentStock <= Math.ceil(minT * 0.5)) alertType = "important";
  //       const suggestedQty = Math.max(minT * 2 - currentStock, 0);
  //       return {
  //         id: r.id,
  //         sku: r.sku,
  //         productName: r.productName,
  //         thumbnail: (r.images && r.images[0]?.url) || null,
  //         supplier: r.storeName || null,
  //         currentStock,
  //         minThreshold: minT,
  //         suggestedQty,
  //         unitCost: Number(r.price ?? 0),
  //         totalCost: suggestedQty * Number(r.price ?? 0),
  //         alertType,
  //         message:
  //           currentStock === 0
  //             ? "Out of stock"
  //             : `Low stock: only ${currentStock} left`,
  //         status: "active",
  //         createdAt: new Date().toISOString(),
  //       };
  //     });
  // }

  // Shipping Methods

  // async getShippingZonesBySeller(sellerId: string) {
  //   return await db
  //     .select({
  //       id: shippingZones.id,
  //       zoneName: shippingZones.zoneName,
  //       isActive: shippingZones.isActive,
  //       createdAt: shippingZones.createdAt,
  //     })
  //     .from(shippingZones)
  //     .where(eq(shippingZones.sellerId, sellerId))
  //     .orderBy(desc(shippingZones.createdAt));
  // }

  // async createShippingZone(sellerId: string, zoneName: string) {
  //   const [zone] = await db
  //     .insert(shippingZones)
  //     .values({ sellerId, zoneName })
  //     .returning();
  //   return zone;
  // }

  // async deleteShippingZone(sellerId: string, zoneId: string) {
  //   return await db
  //     .delete(shippingZones)
  //     .where(
  //       and(eq(shippingZones.id, zoneId), eq(shippingZones.sellerId, sellerId))
  //     );
  // }

  // async getShippingMethods(zoneId: string) {
  //   return await db
  //     .select({
  //       id: shippingMethods.id,
  //       methodName: shippingMethods.methodName,
  //       price: shippingMethods.price,
  //       estimatedDays: shippingMethods.estimatedDays,
  //       isActive: shippingMethods.isActive,
  //       carrierId: shippingMethods.carrierId,
  //       carrierName: carriers.name,
  //     })
  //     .from(shippingMethods)
  //     .leftJoin(carriers, eq(carriers.id, shippingMethods.carrierId))
  //     .where(eq(shippingMethods.zoneId, zoneId))
  //     .orderBy(desc(shippingMethods.methodName));
  // }

  // async createShippingMethod(
  //   zoneId: string,
  //   data: {
  //     methodName: string;
  //     price: string;
  //     estimatedDays?: number;
  //     carrierId?: string;
  //   }
  // ) {
  //   const [method] = await db
  //     .insert(shippingMethods)
  //     .values({
  //       zoneId,
  //       methodName: data.methodName,
  //       price: data.price,
  //       estimatedDays: data.estimatedDays,
  //       carrierId: data.carrierId,
  //     })
  //     .returning();
  //   return method;
  // }

  // async getCarriers() {
  //   return await db
  //     .select({
  //       id: carriers.id,
  //       name: carriers.name,
  //       trackingUrl: carriers.trackingUrl,
  //       isActive: carriers.isActive,
  //     })
  //     .from(carriers)
  //     .orderBy(desc(carriers.name));
  // }

  // async createCarrier(name: string, trackingUrl?: string) {
  //   const [carrier] = await db
  //     .insert(carriers)
  //     .values({ name, trackingUrl })
  //     .returning();
  //   return carrier;
  // }

  // async createShipment(
  //   orderId: string,
  //   data: {
  //     methodId: string;
  //     trackingNumber?: string;
  //     labelUrl?: string;
  //   }
  // ) {
  //   const [shipment] = await db
  //     .insert(shipments)
  //     .values({
  //       orderId,
  //       methodId: data.methodId,
  //       trackingNumber: data.trackingNumber,
  //       labelUrl: data.labelUrl,
  //       status: "shipped",
  //       shippedAt: new Date(),
  //     })
  //     .returning();
  //   return shipment;
  // }

  // async getShipmentsByOrder(orderId: string) {
  //   return await db
  //     .select({
  //       id: shipments.id,
  //       trackingNumber: shipments.trackingNumber,
  //       status: shipments.status,
  //       shippedAt: shipments.shippedAt,
  //       deliveredAt: shipments.deliveredAt,
  //       carrierName: carriers.name,
  //       methodName: shippingMethods.methodName,
  //     })
  //     .from(shipments)
  //     .innerJoin(shippingMethods, eq(shipments.methodId, shippingMethods.id))
  //     .leftJoin(carriers, eq(carriers.id, shippingMethods.carrierId))
  //     .where(eq(shipments.orderId, orderId));
  // }

  // Admin Revenue API

  async getShopRevenues() {
    const shopList = await db
      .select({
        id: stores.id,
        storeName: stores.storeName,
        ownerId: stores.ownerId,
        storeStatus: stores.status,
        ownerEmail: users.email,
        ownerName: users.username,
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id));

    const transactionsData = await db
      .select({
        sellerId: transactions.sellerId,
        amount: transactions.amount,
        status: transactions.status,
      })
      .from(transactions);

    return shopList.map((shop) => {
      const shopTransactions = transactionsData.filter(
        (t) => t.sellerId === shop.ownerId
      );

      const totalRevenue = shopTransactions.reduce(
        (sum, t) => sum + Number(t.amount || 0),
        0
      );
      const commission = totalRevenue * 0.1;
      const pendingAmount = shopTransactions
        .filter((t) => t.status === "pending")
        .reduce((sum, t) => sum + Number(t.amount || 0), 0);

      return {
        ...shop,
        totalRevenue,
        commission,
        pendingAmount,
        monthlyGrowth: Math.round(Math.random() * 40 - 10),
        orders: shopTransactions.length,
        paymentStatus: pendingAmount > 0 ? "pending" : "paid",
      };
    });
  }

  // 🔹 Get global shop stats
  async getShopRevenueStats() {
    const [stats] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        totalCommission: sql<number>`COALESCE(SUM(${transactions.amount} * 0.1), 0)`,
      })
      .from(transactions);
    const [pendingStats] = await db
      .select({
        totalPending: sql<number>`COALESCE(SUM(${withdrawalRequests.amount}), 0)`,
      })
      .from(withdrawalRequests)
      .where(inArray(withdrawalRequests.status, ["pending", "approved"]));

    const [activeShops] = await db
      .select({
        activeShopsCount: sql<number>`COUNT(*)`,
      })
      .from(stores)
      .where(eq(stores.status, "approved"));

    return {
      ...stats,
      totalPending: pendingStats.totalPending || 0,
      activeShopsCount: activeShops.activeShopsCount || 0,
    };
  }

  // 🔹 Get a specific shop’s revenue details
  async getShopRevenueById(shopId: string) {
    const [shop] = await db
      .select({
        id: stores.id,
        storeName: stores.storeName,
        ownerId: stores.ownerId,
        storeStatus: stores.status,
        ownerEmail: users.email,
        ownerName: users.username,
      })
      .from(stores)
      .leftJoin(users, eq(stores.ownerId, users.id))
      .where(eq(stores.id, shopId));

    if (!shop) return null;

    const transactionsList = await db
      .select()
      .from(transactions)
      .where(eq(transactions.sellerId, shop.ownerId));

    const totalRevenue = transactionsList.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );
    const commission = totalRevenue * 0.1;
    const pendingAmount = transactionsList
      .filter((t) => t.status === "pending")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return {
      ...shop,
      totalRevenue,
      commission,
      pendingAmount,
      orders: transactionsList.length,
    };
  }

  // 🔹 Mark pending transactions as paid for a shop
  async markShopTransactionsPaid(shopId: string) {
    const shop = await db
      .select({ ownerId: stores.ownerId })
      .from(stores)
      .where(eq(stores.id, shopId));

    if (!shop[0]) throw new Error("Shop not found");

    await db
      .update(transactions)
      .set({ status: "completed" })
      .where(eq(transactions.sellerId, shop[0].ownerId));

    return { success: true };
  }

  // Withdrawal API
  async getSellerWithdrawals(sellerId: string) {
    const requests = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.sellerId, sellerId))
      .orderBy(withdrawalRequests.createdAt);
    return requests;
  }

  // --- Seller: Create a withdrawal request
  async createWithdrawalRequest(sellerId: string, data: any) {
    const result = await db
      .insert(withdrawalRequests)
      .values({
        sellerId,
        amount: data.amount,
        bankAccountInfo: data.bankAccountInfo,
        status: "pending",
      })
      .returning();
    return result[0];
  }

  // --- Admin: Approve or reject
  async updateWithdrawalStatus(
    id: string,
    status: string,
    adminNotes?: string
  ) {
    const result = await db
      .update(withdrawalRequests)
      .set({
        status,
        adminNotes: adminNotes || null,
        processedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, id))
      .returning();
    return result[0];
  }

  // --- Admin: Get all withdrawals
  async getAllWithdrawals() {
    const results = await db.select().from(withdrawalRequests);
    return results;
  }

  // Seller API

  async getSellerProfile(sellerId: string): Promise<any | null> {
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        storeName: stores.storeName,
        storeDescription: stores.storeDescription,
      })
      .from(users)
      .leftJoin(stores, eq(users.id, stores.ownerId))
      .where(eq(users.id, sellerId))
      .limit(1);

    return user[0] || null;
  }

  async updateSellerProfile(
    sellerId: string,
    data: { email?: string; storeName?: string; storeDescription?: string }
  ): Promise<any> {
    const [updatedStore] = await db
      .update(stores)
      .set({
        storeName: data.storeName,
        storeDescription: data.storeDescription,
        updatedAt: new Date(),
      })
      .where(eq(stores.ownerId, sellerId))
      .returning({
        id: stores.id,
        storeName: stores.storeName,
        storeDescription: stores.storeDescription,
        updatedAt: stores.updatedAt,
      });

    if (data.email) {
      await db
        .update(users)
        .set({
          email: data.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, sellerId));
    }

    return {
      ...updatedStore,
      email: data.email || undefined,
    };
  }

  // Address API
  async getUserAddresses(userId: string) {
    return await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.createdAt));
  }

  async addUserAddress(userId: string, data: any) {
    return await db.insert(addresses).values({
      userId,
      fullName: data.full_name,
      phone: data.phone,
      street: data.street,
      city: data.city,
      postalCode: data.postal_code,
      country: data.country,
      state: data.state,
      isDefault: data.is_default,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateUserAddress(userId: string, addressId: string, data: any) {
    const [updated] = await db
      .update(addresses)
      .set({
        fullName: data.fullName,
        phone: data.phone,
        street: data.street,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefault: data.isDefault,
        updatedAt: new Date(),
      })
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
      .returning();
    return updated;
  }

  async deleteUserAddress(userId: string, addressId: string) {
    await db
      .delete(addresses)
      .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
    return { success: true };
  }

  // Statistics API

  async getClientStatistics(userId: string, language: string = "en") {
    const [orderStats] = await db
      .select({
        totalOrders: count(orders.id),
        totalSpent: sum(orders.totalAmount),
      })
      .from(orders)
      .where(eq(orders.userId, userId));

    const [favCount] = await db
      .select({ count: count() })
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    const [avgRating] = await db
      .select({
        rating: avg(products.rating),
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orders.userId, userId));

    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${orders.createdAt}, 'Mon')`,
        ordersCount: count(orders.id),
        totalAmount: sum(orders.totalAmount),
      })
      .from(orders)
      .where(eq(orders.userId, userId))
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'Mon')`)
      .orderBy(sql`MIN(${orders.createdAt})`);

    const categoryStats = await db
      .select({
        categoryName: categoryTranslations.name,
        totalAmount: sum(orderItems.totalPrice),
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(
        categoryTranslations,
        and(
          eq(categoryTranslations.categoryId, categories.id),
          eq(categoryTranslations.language, language)
        )
      )
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(orders.userId, userId))
      .groupBy(categoryTranslations.name);

    const totalSpentValue = Number(orderStats?.totalSpent || 0);
    const categoriesData = categoryStats.map((c) => ({
      name: c.categoryName,
      amount: Number(c.totalAmount || 0),
      percentage:
        totalSpentValue > 0
          ? Math.round((Number(c.totalAmount) / totalSpentValue) * 100)
          : 0,
    }));

    return {
      totalOrders: orderStats?.totalOrders || 0,
      totalSpent: totalSpentValue,
      favoriteItems: favCount?.count || 0,
      averageRating: Number(avgRating?.rating || 0).toFixed(1),
      monthlyData: monthlyData.map((m) => ({
        month: m.month,
        orders: Number(m.ordersCount),
        amount: Number(m.totalAmount || 0),
      })),
      categoriesData,
    };
  }

  // Carriers
  async getCarriers() {
    return await db.select().from(carriers);
  }

  async createCarrier(data: any) {
    const carrier = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      website: data.website,
      supportPhone: data.supportPhone,
      contactInfo: data.contactInfo,
      maxWeight: data.maxWeight,
      basePrice: data.basePrice,
      deliversNationwide: data.deliversNationwide,
      trackingUrl: data.trackingUrl,
      apiKey: data.apiKey,
      isActive: data.isActive,
      createdAt: new Date(),
    };

    return await db.insert(carriers).values(carrier).returning();
  }

  async updateCarrier(id: string, data: any) {
    const allowedFields = [
      "name",
      "description",
      "website",
      "supportPhone",
      "contactInfo",
      "maxWeight",
      "basePrice",
      "deliversNationwide",
      "trackingUrl",
      "apiKey",
      "isActive",
    ] as const;

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    updates.updatedAt = new Date();

    return await db.update(carriers).set(updates).where(eq(carriers.id, id));
  }

  async deleteCarrier(id: string) {
    return await db.delete(carriers).where(eq(carriers.id, id));
  }

  // Shipping Rates

  async getShippingRates() {
    return await db
      .select({
        id: shippingRates.id,
        zone: shippingRates.zone,
        weightMin: shippingRates.weightMin,
        weightMax: shippingRates.weightMax,
        price: shippingRates.price,
        carrierId: shippingRates.carrierId,
      })
      .from(shippingRates);
  }

  async createShippingRate(data: any) {
    const rate = {
      id: crypto.randomUUID(),
      carrierId: data.carrierId,
      zone: data.zone,
      weightMin: data.weightMin,
      weightMax: data.weightMax,
      price: data.price,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.insert(shippingRates).values(rate).returning();
  }

  async updateShippingRate(id: string, data: any) {
    const allowed = ["zone", "weightMin", "weightMax", "price", "isActive"];
    const updates: Record<string, any> = {};
    for (const field of allowed) {
      if (data[field] !== undefined) updates[field] = data[field];
    }
    updates.updatedAt = new Date();

    return await db
      .update(shippingRates)
      .set(updates)
      .where(eq(shippingRates.id, id));
  }

  async deleteShippingRate(id: string) {
    return await db.delete(shippingRates).where(eq(shippingRates.id, id));
  }

  // Config
  async getShippingConfig(sellerId: string) {
    return await db
      .select()
      .from(shippingConfig)
      .where(eq(shippingConfig.sellerId, sellerId))
      .limit(1);
  }

  async createShippingConfig(sellerId: string, data: any) {
    const config = {
      id: crypto.randomUUID(),
      sellerId,
      freeShippingThreshold: data.freeShippingThreshold,
      maxWeight: data.maxWeight,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.insert(shippingConfig).values(config).returning();
  }

  async updateShippingConfig(sellerId: string, data: any) {
    const updates = {
      freeShippingThreshold: data.freeShippingThreshold,
      maxWeight: data.maxWeight,
      updatedAt: new Date(),
    };
    return await db
      .update(shippingConfig)
      .set(updates)
      .where(eq(shippingConfig.sellerId, sellerId));
  }

  // Shipping Zones

  async getZonesByShop(shopId: string) {
    // get zones
    const zones = await db
      .select({
        id: shippingZones.id,
        name: shippingZones.name,
        cities: shippingZones.cities,
        isActive: shippingZones.isActive,
        createdAt: shippingZones.createdAt,
        updatedAt: shippingZones.updatedAt,
      })
      .from(shippingZones)
      .where(eq(shippingZones.shopId, shopId))
      .orderBy(desc(shippingZones.createdAt));

    if (zones.length === 0) return [];

    const zoneIds = zones.map((z) => z.id);

    // get carriers for those zones
    const carriersData = await db
      .select({
        zoneId: shippingZoneCarriers.zoneId,
        carrierId: carriers.id,
        carrierName: carriers.name,
        price: shippingZoneCarriers.price,
        deliveryTime: shippingZoneCarriers.deliveryTime,
        carrierActive: shippingZoneCarriers.isActive,
      })
      .from(shippingZoneCarriers)
      .innerJoin(carriers, eq(shippingZoneCarriers.carrierId, carriers.id))
      .where(inArray(shippingZoneCarriers.zoneId, zoneIds));

    // map carriers into zones
    return zones.map((zone) => ({
      ...zone,
      carriers: carriersData.filter((c) => c.zoneId === zone.id),
    }));
  }

  async getZoneWithCarriers(zoneId: string) {
    return await db
      .select({
        zoneId: shippingZones.id,
        zoneName: shippingZones.name,
        cities: shippingZones.cities,
        carriers: sql`json_agg(json_build_object(
        'id', ${shippingZoneCarriers.id},
        'carrierId', ${shippingZoneCarriers.carrierId},
        'carrierName', ${carriers.name},
        'price', ${shippingZoneCarriers.price},
        'deliveryTime', ${shippingZoneCarriers.deliveryTime},
        'isActive', ${shippingZoneCarriers.isActive}
      ))`.mapWith((v: any) => v),
      })
      .from(shippingZones)
      .leftJoin(
        shippingZoneCarriers,
        eq(shippingZoneCarriers.zoneId, shippingZones.id)
      )
      .leftJoin(carriers, eq(carriers.id, shippingZoneCarriers.carrierId))
      .where(eq(shippingZones.id, zoneId))
      .groupBy(shippingZones.id);
  }

  // create zone (and optionally carriers rows in two steps)
  async createZone(shopId: string, data: any) {
    const normalizedCities =
      typeof data.cities === "string"
        ? data.cities
          .split(/[\s,;]+/)
          .map((c: string) => c.trim())
          .filter((c: string) => c.length > 0)
        : Array.isArray(data.cities)
          ? data.cities.map((c: string) => c.trim())
          : [];
    const zone = {
      id: crypto.randomUUID(),
      shopId,
      name: data.name,
      cities: normalizedCities || [],
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const [created] = await db.insert(shippingZones).values(zone).returning();

    if (data.zoneCarriers && Array.isArray(data.zoneCarriers)) {
      const zoneCarrierRows = data.zoneCarriers.map((c: any) => ({
        id: crypto.randomUUID(),
        zoneId: created.id,
        carrierId: c.carrierId,
        price: c.price,
        deliveryTime: c.deliveryTime,
        isActive: c.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.insert(shippingZoneCarriers).values(zoneCarrierRows);
    }
    return created;
  }

  async updateZone(id: string, data: any) {
    const allowed = ["name", "cities", "isActive"];
    const updates: Record<string, any> = {};
    for (const f of allowed) if (data[f] !== undefined) updates[f] = data[f];
    updates.updatedAt = new Date();
    await db.update(shippingZones).set(updates).where(eq(shippingZones.id, id));

    if (data.zoneCarriers) {
      await db
        .delete(shippingZoneCarriers)
        .where(eq(shippingZoneCarriers.zoneId, id));
      const rows = data.zoneCarriers.map((c: any) => ({
        id: crypto.randomUUID(),
        zoneId: id,
        carrierId: c.carrierId,
        price: c.price,
        deliveryTime: c.deliveryTime,
        isActive: c.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      if (rows.length) await db.insert(shippingZoneCarriers).values(rows);
    }
    return true;
  }

  async deleteZone(id: string) {
    return await db.delete(shippingZones).where(eq(shippingZones.id, id));
  }

  // Shipping Options
  async getShippingOptions(carrierId: string) {
    return await db
      .select({
        id: shippingOptions.id,
        region: shippingOptions.region,
        length: shippingOptions.length,
        width: shippingOptions.width,
        height: shippingOptions.height,
        maxWeight: shippingOptions.maxWeight,
        basePrice: shippingOptions.basePrice,
        pricePerKg: shippingOptions.pricePerKg,
        deliveryTime: shippingOptions.deliveryTime,
        isActive: shippingOptions.isActive,
        carrierId: shippingOptions.carrierId,
        carrierName: carriers.name,
      })
      .from(shippingOptions)
      .innerJoin(carriers, eq(carriers.id, shippingOptions.carrierId))
      .where(eq(shippingOptions.carrierId, carrierId));
  }

  async createShippingOption(data: any) {
    const option = {
      id: crypto.randomUUID(),
      carrierId: data.carrierId,
      region: data.region,
      length: data.length,
      width: data.width,
      height: data.height,
      maxWeight: data.maxWeight,
      basePrice: data.basePrice,
      pricePerKg: data.pricePerKg,
      deliveryTime: data.deliveryTime,
      isActive: data.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await db.insert(shippingOptions).values(option).returning();
  }

  async updateShippingOption(id: string, data: any) {
    const allowedFields = [
      "region",
      "length",
      "width",
      "height",
      "maxWeight",
      "basePrice",
      "pricePerKg",
      "deliveryTime",
      "isActive",
    ] as const;

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }

    updates.updatedAt = new Date();

    return await db
      .update(shippingOptions)
      .set(updates)
      .where(eq(shippingOptions.id, id));
  }

  async deleteShippingOption(id: string) {
    return await db.delete(shippingOptions).where(eq(shippingOptions.id, id));
  }

  async getStockAlertsBySellerId(sellerId: string, lang = "en") {
    return await db
      .select({
        id: stockAlerts.id,
        alertType: stockAlerts.alertType,
        status: stockAlerts.status,
        message: stockAlerts.message,
        // currentStock: stockAlerts.currentStock,
        createdAt: stockAlerts.createdAt,
        resolvedBy: stockAlerts.resolvedBy,
        resolvedAt: stockAlerts.resolvedAt,
        productId: stockAlerts.productId,
        productName: productTranslations.name,
      })
      .from(stockAlerts)
      .innerJoin(products, eq(products.id, stockAlerts.productId))
      .innerJoin(
        productTranslations,
        and(
          eq(productTranslations.productId, products.id),
          eq(productTranslations.language, lang)
        )
      )
      .where(eq(stockAlerts.sellerId, sellerId))
      .orderBy(desc(stockAlerts.createdAt));
  }

  async getReplenishmentBySellerId(sellerId: string, lang = "en") {
    try {
      const lowStockProducts = await db
        .select({
          id: products.id,
          sku: products.sku,
          brand: products.brand,
          price: products.purchasePrice,
          stock: products.stock,
          images: products.images,
          storeName: stores.storeName,
          productName: productTranslations.name,
          minThreshold: products.minThreshold,
          suggestedQuantity: products.suggestedQuantity,
          replenishmentStatus: products.replenishmentStatus,
        })
        .from(products)
        .innerJoin(stores, eq(products.vendorId, stores.ownerId))
        .innerJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, lang)
          )
        )
        .where(and(eq(products.vendorId, sellerId), lt(products.stock, 10)));

      return lowStockProducts.map((p) => {
        const minThreshold = 10;
        const suggestedQty = Math.max(minThreshold * 2 - Number(p.stock), 0);
        return {
          ...p,
          suggestedQty,
          totalCost: suggestedQty * Number(p.price),
        };
      });
    } catch (error) {
      console.error("Error fetching replenishment:", error);
      return [];
    }
  }

  async getCustomersWithVendors(vendorId: string): Promise<any[]> {
    return this.executeWithFallback(async () => {
      const result = await db!
        .select({
          userId: orders.userId,
          vendorId: products.vendorId,
          fullname: orders.customerName,
          email: orders.customerEmail,
          phone: orders.customerPhone,
          // status: orders.status,
          status: users.status,
          totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          joinDate: sql<string>`MIN(${orders.createdAt})`,
          averageBasket: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
          totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(products.id, orderItems.productId))
        .innerJoin(users, eq(users.id, orders.userId))
        .where(
          and(
            isNull(products.deletedAt),
            isNull(orders.deletedAt),
            eq(products.vendorId, vendorId)
          )
        )
        .groupBy(
          orders.userId,
          products.vendorId,
          orders.customerName,
          orders.customerEmail,
          orders.customerPhone,
          users.status
        );

      return result;
    }, []);
  }


  async getSellerTrend(vendorId: string) {
    try {
      // Aggregate total sales and orders per month
      const results = await db
        .select({
          month: sql<string>`TO_CHAR(${orders.createdAt}, 'Mon')`, // PostgreSQL style month abbreviation
          monthIndex: sql<number>`EXTRACT(MONTH FROM ${orders.createdAt})`,
          sales: sql<number>`SUM(${orderItems.totalPrice})`,
          ordersCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(and(eq(products.vendorId, vendorId), isNull(orders.deletedAt)))
        .groupBy(sql`EXTRACT(MONTH FROM ${orders.createdAt})`, sql`TO_CHAR(${orders.createdAt}, 'Mon')`)
        .orderBy(sql`EXTRACT(MONTH FROM ${orders.createdAt})`);

      // Normalize data: ensure all months appear even if zero need fix
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];

      // const trend = months.map((m, i) => {
      //   const match = results.find((r) => r.monthIndex === i + 1);
      //   return {
      //     month: m,
      //     sales: match?.sales || 0,
      //     orders: match?.ordersCount || 0,
      //   };
      // });
      const trend = months.map((m, i) => {
        // Find matching month result using 1-based index
        const match = results.find((r) => {
          // Convert month abbreviation to index (1-12)
          const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(r.month) + 1;
          return monthIndex === i + 1;
        });

        return {
          month: m,
          sales: Number(match?.sales || 0),
          orders: Number(match?.ordersCount || 0),
        };
      });
      return trend;
    } catch {
      return [];
    }

  }


  async getOrdersByUserId(userId: string, lang = "en") {
    try {
      // 1. Get all orders for the user
      const userOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      if (userOrders.length === 0) return [];

      // 2. Get all items for these orders in one query
      const orderIds = userOrders.map((o) => o.id);

      const allItems = await db
        .select({
          orderId: orderItems.orderId,
          id: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          name: productTranslations.name,
          images: products.images,
          vendorName: stores.storeName,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(users, eq(products.vendorId, users.id))
        .innerJoin(stores, eq(products.vendorId, stores.ownerId))
        .innerJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, lang)
          )
        )
        .where(inArray(orderItems.orderId, orderIds));

      // 3. Group items by orderId
      const itemsByOrder = allItems.reduce((acc, item) => {
        acc[item.orderId] = acc[item.orderId] || [];
        acc[item.orderId].push({
          id: item.id,
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          product: {
            name: item.name,
            images: item.images || [],
          },
          vendorName: item.vendorName,
        });
        return acc;
      }, {} as Record<string, any[]>);

      // 4. Attach items to orders
      return userOrders.map((order) => ({
        ...order,
        items: itemsByOrder[order.id] || [],
      }));
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }
  }
  async getOrdersByVendorId(vendorId: string): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          status: orders.status,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          customerEmail: users.email,
          customerAvatar: users.avatar,
        })
        .from(orders)
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(products.id, orderItems.productId))
        .innerJoin(users, eq(users.id, orders.userId))
        .where(eq(products.vendorId, vendorId))
        .groupBy(orders.id, users.id)
        .orderBy(desc(orders.createdAt));

      return result;
    } catch (error) {
      console.error("Error fetching vendor orders:", error);
      return [];
    }
  }

  async getCustomerDetails(userId: string): Promise<any | null> {
    try {
      // Step 1: fetch user
      const [user] = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          avatar: users.avatar,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) return null;

      // Step 2: fetch aggregated stats
      const [stats] = await db
        .select({
          totalOrders: sql<number>`COUNT(*)`,
          totalSpent: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
          averageOrderValue: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
          lastOrderDate: sql<string>`MAX(${orders.createdAt})`,
          joinDate: sql<string>`MIN(${orders.createdAt})`,
        })
        .from(orders)
        .where(eq(orders.userId, userId));

      // Step 3: fetch order history
      const orderHistory = await db
        .select({
          id: orders.id,
          orderNumber: orders.id, // or your order number field
          status: orders.status,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt,
          itemCount: sql<number>`(SELECT COUNT(*) FROM ${orderItems} WHERE ${orderItems.orderId} = ${orders.id})`,
        })
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt));

      return {
        ...user,
        stats,
        orderHistory,
      };
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return null;
    }
  }

  // async getSellerOrders(vendorId: string): Promise<any[]> {
  //   return this.executeWithFallback(async () => {
  //     const result = await db!
  //       .select({
  //         orderId: orders.id,
  //         orderNumber: orders.orderNumber,
  //         customerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
  //         customerEmail: users.email,
  //         status: orders.status,
  //         payment: orders.paymentStatus,
  //         amount: orders.totalAmount,
  //         date: orders.createdAt,
  //         actions: orders.actions,
  //       })
  //       .from(orderItems)
  //       .innerJoin(products, eq(orderItems.productId, products.id))
  //       .innerJoin(orders, eq(orderItems.orderId, orders.id))
  //       .innerJoin(users, eq(orders.userId, users.id))
  //       .where(and(eq(products.vendorId, vendorId), isNull(orders.deletedAt)))
  //       .orderBy(desc(orders.createdAt));

  //     return result;
  //   }, []);
  // }

  async getPackages(): Promise<any[]> {
    try {
      const rows = await db
        .select({
          id: packages.id,
          name: packages.name,
          description: packages.description,
          price: packages.price,
          billing: packages.billing,
          commission: packages.commission,
          maxProducts: packages.maxProducts,
          isActive: packages.isActive,
          createdAt: packages.createdAt,
          updatedAt: packages.updatedAt,
        })
        .from(packages)
        .orderBy(desc(packages.createdAt));

      return rows.map((row) => ({
        ...row,
        price: parseFloat(row.price as any),
      }));
    } catch (error) {
      console.error("Error fetching packages:", error);
      return [];
    }
  }

  async getPromotions(): Promise<any[]> {
    try {
      const rows = await db
        .select({
          id: promotions.id,
          promoCode: promotions.promoCode,
          discountType: promotions.discountType,
          value: promotions.value,
          startDate: promotions.startDate,
          endDate: promotions.endDate,
          minimumPurchase: promotions.minimumPurchase,
          usageLimit: promotions.usageLimit,
          isActive: promotions.isActive,
          createdAt: promotions.createdAt,
          updatedAt: promotions.updatedAt,
        })
        .from(promotions)
        .orderBy(desc(promotions.createdAt));

      return rows.map((row) => ({
        ...row,
        value: parseFloat(row.value as any),
        minimumPurchase: row.minimumPurchase
          ? parseFloat(row.minimumPurchase as any)
          : null,
      }));
    } catch (error) {
      console.error("Error fetching promotions:", error);
      return [];
    }
  }

  async getSellerOrders(vendorId: string, lang: string = "en"): Promise<any[]> {
    try {
      const rows = await db
        .select({
          orderId: orders.id,
          orderNumber: orders.orderNumber,
          userId: orders.userId,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          paymentMethod: orders.paymentMethod,
          totalAmount: orders.totalAmount,
          trackingNumber: orders.trackingNumber,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          shippingAddress: orders.shippingAddress,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          itemId: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          productName: productTranslations.name,
          productSku: products.sku,
          shippingOption: orders.shippingOption,
          storeName: stores.storeName,
          categoryName: categoryTranslations.name,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(users, eq(orders.userId, users.id))
        .innerJoin(stores, eq(products.vendorId, stores.ownerId))
        .leftJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, lang)
          )
        )
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(
          categoryTranslations,
          and(
            eq(categoryTranslations.categoryId, categories.id),
            eq(categoryTranslations.language, lang)
          )
        )

        .where(and(eq(products.vendorId, vendorId), isNull(orders.deletedAt)))
        .orderBy(desc(orders.createdAt));

      const ordersMap: Record<string, any> = {};

      for (const row of rows) {
        if (!ordersMap[row.orderId]) {
          ordersMap[row.orderId] = {
            id: row.orderId,
            orderNumber: row.orderNumber,
            userId: row.userId,
            status: row.status,
            paymentStatus: row.paymentStatus,
            paymentMethod: row.paymentMethod,
            totalAmount: row.totalAmount,
            trackingNumber: row.trackingNumber,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            shippingAddress: {
              ...(typeof row.shippingAddress === "object" &&
                row.shippingAddress !== null
                ? row.shippingAddress
                : { shippingAddress: row.shippingAddress }),
              email: row.email,
              firstName: row.firstName,
              lastName: row.lastName,
            },
            shippingOption: row.shippingOption,
            items: [],
          };
        }

        ordersMap[row.orderId].items.push({
          id: row.itemId,
          productId: row.productId,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          totalPrice: row.totalPrice,
          product: {
            name: row.productName,
            sku: row.productSku,
            storeName: row.storeName,
            categoryName: row.categoryName,
          },
        });
      }

      return Object.values(ordersMap);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      return [];
    }
  }

  async getAllOrders(): Promise<any[]> {
    try {
      const rows = await db
        .select({
          orderId: orders.id,
          orderNumber: orders.orderNumber,
          userId: orders.userId,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          paymentMethod: orders.paymentMethod,
          totalAmount: orders.totalAmount,
          vendorName: products.vendorId,
          trackingNumber: orders.trackingNumber,
          deliveryDate: orders.createdAt,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          shippingAddress: orders.shippingAddress,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          itemId: orderItems.id,
          productId: orderItems.productId,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          productName: productTranslations.name,
          productSku: products.sku,
          shippingOption: orders.shippingOption,
        })
        .from(orders)
        .innerJoin(users, eq(users.id, orders.userId))
        .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
        .innerJoin(products, eq(products.id, orderItems.productId))
        .leftJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, "en")
          )
        )
        .orderBy(desc(orders.createdAt));

      const ordersMap: Record<string, any> = {};

      for (const row of rows) {
        if (!ordersMap[row.orderId]) {
          ordersMap[row.orderId] = {
            id: row.orderId,
            orderNumber: row.orderNumber,
            userId: row.userId,
            status: row.status,
            paymentStatus: row.paymentStatus,
            paymentMethod: row.paymentMethod,
            totalAmount: row.totalAmount,
            vendorName: row.vendorName,
            itemCount: 0,
            trackingNumber: row.trackingNumber,
            createdAt: row.createdAt,
            shippingAddress: {
              ...(typeof row.shippingAddress === "object" &&
                row.shippingAddress !== null
                ? row.shippingAddress
                : { shippingAddress: row.shippingAddress }),
              email: row.email,
              firstName: row.firstName,
              lastName: row.lastName,
            },
            shippingOption: row.shippingOption,
            items: [],
          };
        }

        ordersMap[row.orderId].items.push({
          id: row.itemId,
          productId: row.productId,
          quantity: row.quantity,
          unitPrice: row.unitPrice,
          totalPrice: row.totalPrice,
          product: {
            name: row.productName,
            sku: row.productSku,
          },
        });

        ordersMap[row.orderId].itemCount = ordersMap[row.orderId].items.length;
      }

      return Object.values(ordersMap);
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return [];
    }
  }

  async getOrderWithItems(orderId: string): Promise<any> {
    try {
      // Get order details
      const [orderDetails] = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          status: orders.status,
          totalAmount: orders.totalAmount,
          shippingAddress: orders.shippingAddress,
          createdAt: orders.createdAt,
          customerName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
          customerEmail: users.email,
          customerAvatar: users.avatar,
        })
        .from(orders)
        .innerJoin(users, eq(users.id, orders.userId))
        .where(eq(orders.id, orderId));

      if (!orderDetails) return null;

      // Get order items
      const items = await db
        .select({
          id: orderItems.id,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          productName: productTranslations.name,
          productDescription: productTranslations.shortDescription,
        })
        .from(orderItems)
        .innerJoin(products, eq(products.id, orderItems.productId))
        .leftJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, "en")
          )
        )
        .where(eq(orderItems.orderId, orderId));

      return {
        ...orderDetails,
        items,
      };
    } catch (error) {
      console.error("Error fetching order with items:", error);
      return null;
    }
  }

  async seedDummyProducts(vendorId: string): Promise<void> {
    try {
      if (!db) throw new Error("Database not available");

      // Get categories first
      const categories = await this.getCategoriesWithTranslations("en");
      if (categories.length === 0) return;

      const dummyProducts = [
        {
          name: "Athletic Sneakers",
          categoryId: categories[0]?.id,
          sku: "DUMMY-SNEAKERS",
          price: "89.99",
          originalPrice: "109.99",
          stock: 12,
          images: [{ url: "/api/placeholder/400/400", uploadMethod: "url" }],
          isFeatured: true,
          translations: {
            en: {
              name: "Athletic Sneakers",
              description:
                "<p>Experience ultimate comfort with these premium athletic sneakers. Featuring advanced cushioning technology and breathable mesh upper, these shoes are perfect for running, walking, or everyday wear.</p>",
              highlights:
                "<ul><li>Advanced cushioning technology</li><li>Breathable mesh upper</li><li>Non-slip rubber outsole</li><li>Lightweight design</li></ul>",
            },
            fr: {
              name: "Baskets Athlétiques",
              description:
                "<p>Découvrez le confort ultime avec ces baskets athlétiques premium. Dotées d'une technologie d'amortissement avancée et d'une tige en mesh respirant, ces chaussures sont parfaites pour la course, la marche ou le port quotidien.</p>",
              highlights:
                "<ul><li>Technologie d'amortissement avancée</li><li>Tige en mesh respirant</li><li>Semelle extérieure antidérapante</li><li>Design léger</li></ul>",
            },
            ar: {
              name: "أحذية رياضية",
              description:
                "<p>اختبر الراحة المطلقة مع هذه الأحذية الرياضية المتميزة. تتميز بتقنية توسيد متقدمة وجزء علوي من الشبك القابل للتنفس، هذه الأحذية مثالية للجري والمشي أو الارتداء اليومي.</p>",
              highlights:
                "<ul><li>تقنية توسيد متقدمة</li><li>جزء علوي من الشبك القابل للتنفس</li><li>نعل خارجي مقاوم للانزلاق</li><li>تصميم خفيف الوزن</li></ul>",
            },
          },
        },
        {
          name: "Cotton T-Shirt",
          categoryId: categories[1]?.id || categories[0]?.id,
          sku: "DUMMY-TSHIRT",
          price: "24.99",
          originalPrice: null,
          stock: 25,
          images: [{ url: "/api/placeholder/400/400", uploadMethod: "url" }],
          isFeatured: false,
          translations: {
            en: {
              name: "Premium Cotton T-Shirt",
              description:
                "<p>A classic premium cotton t-shirt that combines comfort with style. Made from 100% organic cotton, this shirt offers exceptional softness and durability for everyday wear.</p>",
              highlights:
                "<ul><li>100% organic cotton</li><li>Pre-shrunk fabric</li><li>Reinforced seams</li><li>Machine washable</li></ul>",
            },
            fr: {
              name: "T-Shirt en Coton Premium",
              description:
                "<p>Un t-shirt classique en coton premium qui allie confort et style. Fabriqué à partir de coton 100% biologique, ce t-shirt offre une douceur et une durabilité exceptionnelles pour un port quotidien.</p>",
              highlights:
                "<ul><li>Coton 100% biologique</li><li>Tissu pré-rétréci</li><li>Coutures renforcées</li><li>Lavable en machine</li></ul>",
            },
            ar: {
              name: "تي شيرت قطني فاخر",
              description:
                "<p>تي شيرت كلاسيكي من القطن الفاخر يجمع بين الراحة والأناقة. مصنوع من القطن العضوي 100%، يوفر هذا القميص نعومة ومتانة استثنائية للارتداء اليومي.</p>",
              highlights:
                "<ul><li>قطن عضوي 100%</li><li>قماش مقلص مسبقاً</li><li>خياطة معززة</li><li>قابل للغسل في الغسالة</li></ul>",
            },
          },
        },
        {
          name: "Wireless Headphones",
          categoryId: categories[0]?.id,
          sku: "DUMMY-HEADPHONES",
          price: "149.99",
          originalPrice: "199.99",
          stock: 8,
          images: [{ url: "/api/placeholder/400/400", uploadMethod: "url" }],
          isFeatured: true,
          translations: {
            en: {
              name: "Premium Wireless Headphones",
              description:
                "<p>Immerse yourself in crystal-clear audio with these premium wireless headphones. Featuring active noise cancellation, 30-hour battery life, and superior comfort for extended listening sessions.</p>",
              highlights:
                "<ul><li>Active noise cancellation</li><li>30-hour battery life</li><li>Premium leather cushions</li><li>Bluetooth 5.0 connectivity</li></ul>",
            },
            fr: {
              name: "Casque Sans Fil Premium",
              description:
                "<p>Plongez-vous dans un audio cristallin avec ce casque sans fil premium. Doté d'une annulation active du bruit, d'une autonomie de 30 heures et d'un confort supérieur pour des sessions d'écoute prolongées.</p>",
              highlights:
                "<ul><li>Annulation active du bruit</li><li>Autonomie de 30 heures</li><li>Coussins en cuir premium</li><li>Connectivité Bluetooth 5.0</li></ul>",
            },
            ar: {
              name: "سماعات لاسلكية فاخرة",
              description:
                "<p>انغمس في صوت واضح كالكريستال مع هذه السماعات اللاسلكية الفاخرة. تتميز بإلغاء الضوضاء النشط وعمر بطارية 30 ساعة وراحة فائقة لجلسات الاستماع الطويلة.</p>",
              highlights:
                "<ul><li>إلغاء الضوضاء النشط</li><li>عمر بطارية 30 ساعة</li><li>وسائد جلدية فاخرة</li><li>اتصال البلوتوث 5.0</li></ul>",
            },
          },
        },
        {
          name: "Smart Watch",
          categoryId: categories[0]?.id,
          sku: "DUMMY-WATCH",
          price: "299.99",
          originalPrice: null,
          stock: 0,
          images: [{ url: "/api/placeholder/400/400", uploadMethod: "url" }],
          isFeatured: false,
          translations: {
            en: {
              name: "Advanced Smart Watch",
              description:
                "<p>Stay connected and track your fitness goals with this advanced smart watch. Features comprehensive health monitoring, GPS tracking, and seamless smartphone integration.</p>",
              highlights:
                "<ul><li>Heart rate monitoring</li><li>Built-in GPS</li><li>Sleep tracking</li><li>7-day battery life</li></ul>",
            },
            fr: {
              name: "Montre Connectée Avancée",
              description:
                "<p>Restez connecté et suivez vos objectifs de fitness avec cette montre connectée avancée. Dispose d'un monitoring de santé complet, d'un suivi GPS et d'une intégration transparente avec les smartphones.</p>",
              highlights:
                "<ul><li>Surveillance du rythme cardiaque</li><li>GPS intégré</li><li>Suivi du sommeil</li><li>Autonomie de 7 jours</li></ul>",
            },
            ar: {
              name: "ساعة ذكية متقدمة",
              description:
                "<p>ابق متصلاً وتتبع أهداف اللياقة البدنية مع هذه الساعة الذكية المتقدمة. تتميز بمراقبة صحية شاملة وتتبع نظام تحديد المواقع وتكامل سلس مع الهواتف الذكية.</p>",
              highlights:
                "<ul><li>مراقبة معدل ضربات القلب</li><li>نظام تحديد المواقع المدمج</li><li>تتبع النوم</li><li>عمر بطارية 7 أيام</li></ul>",
            },
          },
        },
      ];

      for (const productData of dummyProducts) {
        // Check if product already exists
        const existingProduct = await db
          .select()
          .from(products)
          .where(eq(products.sku, productData.sku))
          .limit(1);

        if (existingProduct.length === 0) {
          // Create the product
          const [product] = await db
            .insert(products)
            .values({
              vendorId: vendorId,
              categoryId: productData.categoryId,
              slug:
                productData.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "") +
                "-" +
                Date.now(),
              sku: productData.sku,
              price: productData.price,
              originalPrice: productData.originalPrice,
              stock: productData.stock,
              images: productData.images,
              isFeatured: productData.isFeatured,
              isActive: true,
              rating: "4.5",
              reviewCount: Math.floor(Math.random() * 50) + 10,
            })
            .returning();

          // Create product translations for all languages
          const translationPromises = Object.entries(
            productData.translations
          ).map(([language, translation]) =>
            db.insert(productTranslations).values({
              productId: product.id,
              language,
              name: translation.name,
              description: translation.description,
              highlights: translation.highlights,
            })
          );

          await Promise.all(translationPromises);
        }
      }
    } catch (error) {
      console.error("Error seeding dummy products:", error);
    }
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();
    const enhancedOrderData = {
      ...orderData,
      orderNumber,
    };
    const [order] = await db
      .insert(orders)
      .values(enhancedOrderData)
      .returning();
    return order;
  }

  async createTransaction(
    transactionData: InsertTransaction
  ): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(transactionData)
      .returning();
    return transaction;
  }

  private async generateOrderNumber(): Promise<string> {
    // Generate order number in format CMD-XXXX
    const prefix = "CMD";
    const randomNumber = Math.floor(Math.random() * 9000) + 1000; // 4-digit random number
    return `${prefix}-${randomNumber}`;
  }

  async createOrderItem(orderItemData: InsertOrderItem): Promise<OrderItem> {
    if (!db) throw new Error("Database not available");
    const [orderItem] = await db
      .insert(orderItems)
      .values(orderItemData)
      .returning();
    return orderItem;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, orderId));
      return true;
    }, false);
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      // Soft delete the user instead of permanent deletion
      await db!
        .update(users)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      return true;
    }, false);
  }

  async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    return this.executeWithFallback(async () => {
      const [updatedUser] = await db!
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    }, undefined);
  }

  async getAllStores(): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: stores.id,
          ownerId: stores.ownerId,
          name: stores.storeName,
          codeStore: stores.codeStore,
          // categoryId: stores.categoryId,
          description: stores.storeDescription,
          status: stores.status,
          createdAt: stores.createdAt,
          updatedAt: stores.updatedAt,
          subscriptionEnd: stores.subscriptionEnd,
          lastActionAt: stores.lastActionAt,
          messagesSent: stores.messagesSent,
          totalRevenue: stores.totalRevenue,
          productCount: stores.productCount,
          orderCount: stores.orderCount,
          ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          ownerEmail: users.email,
          // categoryName: sql<string>`COALESCE(category_trans.name, 'Uncategorized')`,
        })
        .from(stores)
        .leftJoin(
          users,
          and(eq(stores.ownerId, users.id), isNull(users.deletedAt))
        )
        // .leftJoin(
        //   categories,
        //   and(
        //     eq(stores.categoryId, categories.id),
        //     isNull(categories.deletedAt)
        //   )
        // )
        // .leftJoin(
        //   sql`(
        //     SELECT DISTINCT ON (category_id) category_id, name
        //     FROM category_translations
        //     WHERE language = 'en'
        //   ) AS category_trans`,
        //   sql`category_trans.category_id = ${categories.id}`
        // )
        .where(isNull(stores.deletedAt))
        .orderBy(desc(stores.createdAt));
      return result;
    } catch (error) {
      console.error("Error fetching stores:", error);
      return [];
    }
  }

  async getStoreById(id: string): Promise<Store | undefined> {
    try {
      const [store] = await db
        .select({
          id: stores.id,
          ownerId: stores.ownerId,
          name: stores.storeName,
          codeStore: stores.codeStore,
          // categoryId: stores.categoryId,
          description: stores.storeDescription,
          status: stores.status,
          createdAt: stores.createdAt,
          updatedAt: stores.updatedAt,
          subscriptionEnd: stores.subscriptionEnd,
          lastActionAt: stores.lastActionAt,
          messagesSent: stores.messagesSent,
          totalRevenue: stores.totalRevenue,
          productCount: stores.productCount,
          orderCount: stores.orderCount,
          ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          ownerEmail: users.email,
        })
        .from(stores)
        .leftJoin(users, eq(stores.ownerId, users.id))
        // .leftJoin(categories, eq(stores.categoryId, categories.id))
        // .leftJoin(
        //   sql`(
        //     SELECT DISTINCT ON (category_id) category_id, name
        //     FROM category_translations
        //     WHERE language = 'en'
        //   ) AS category_trans`,
        //   sql`category_trans.category_id = ${categories.id}`
        // )
        .where(eq(stores.id, id));
      return store as Store | undefined;
    } catch (error) {
      console.error("Error fetching store:", error);
      return undefined;
    }
  }

  async getStoreByOwnerId(ownerId: string): Promise<Store | undefined> {
    try {
      const [store] = await db
        .select({
          id: stores.id,
          ownerId: stores.ownerId,
          name: stores.storeName,
          codeStore: stores.codeStore,
          // categoryId: stores.categoryId,
          description: stores.storeDescription,
          status: stores.status,
          suspensionReason: stores.suspensionReason,
          createdAt: stores.createdAt,
          updatedAt: stores.updatedAt,
          subscriptionEnd: stores.subscriptionEnd,
          lastActionAt: stores.lastActionAt,
          messagesSent: stores.messagesSent,
          totalRevenue: stores.totalRevenue,
          productCount: stores.productCount,
          orderCount: stores.orderCount,
          ownerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
          ownerEmail: users.email,
        })
        .from(stores)
        .leftJoin(users, eq(stores.ownerId, users.id))
        // .leftJoin(categories, eq(stores.categoryId, categories.id))
        // .leftJoin(
        //   sql`(
        //     SELECT DISTINCT ON (category_id) category_id, name
        //     FROM category_translations
        //     WHERE language = 'en'
        //   ) AS category_trans`,
        //   sql`category_trans.category_id = ${categories.id}`
        // )
        .where(eq(stores.ownerId, ownerId));
      return store as Store | undefined;
    } catch (error) {
      console.error("Error fetching store by owner:", error);
      return undefined;
    }
  }

  async createStore(storeData: any): Promise<Store> {
    try {
      const codeStore = `STORE-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}`;
      const businessAddress = {
        street: storeData.ownerAddressStreet,
        city: storeData.ownerAddressCity,
        zipCode: storeData.ownerAddressZipCode,
        country: storeData.ownerAddressCountry,
      };
      const storeRes = {
        codeStore,
        storeName: storeData.name,
        storeDescription: storeData.description,
        ownerId: storeData.ownerId,
        businessPhone: storeData.ownerPhone,
        businessWebsite: storeData.website,
        taxId: storeData.taxId,
        businessAddress,
      };
      const [store] = await db.insert(stores).values(storeRes).returning();
      return store;
    } catch (error) {
      console.error("Error creating store:", error);
      throw error;
    }
  }

  async updateStore(
    id: string,
    updates: Partial<Store>
  ): Promise<Store | undefined> {
    return this.executeWithFallback(async () => {
      const [updatedStore] = await db!
        .update(stores)
        .set({ ...updates, updatedAt: new Date(), lastActionAt: new Date() })
        .where(eq(stores.id, id))
        .returning();
      return updatedStore;
    }, undefined);
  }

  async deleteStore(id: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .update(stores)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(stores.id, id));
      return true;
    }, false);
  }

  async getStoreStats(): Promise<{
    totalStores: number;
    activeStores: number;
    onHoldStores: number;
    totalRevenue: string;
  }> {
    return this.executeWithFallback(
      async () => {
        const stats = await db!
          .select({
            totalStores: sql<number>`COUNT(*)::int`,
            activeStores: sql<number>`COUNT(CASE WHEN status = 'approved' THEN 1 END)::int`,
            onHoldStores: sql<number>`COUNT(CASE WHEN status IN ('pending_validation', 'suspended') THEN 1 END)::int`,
            totalRevenue: sql<string>`COALESCE(SUM(total_revenue), 0)::text`,
          })
          .from(stores);
        return (
          stats[0] || {
            totalStores: 0,
            activeStores: 0,
            onHoldStores: 0,
            totalRevenue: "0",
          }
        );
      },
      { totalStores: 0, activeStores: 0, onHoldStores: 0, totalRevenue: "0" }
    );
  }

  async deleteProduct(productId: string, vendorId: string): Promise<any> {
    return this.executeWithFallback(async () => {
      const existingProduct = await db!
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, productId),
            eq(products.vendorId, vendorId),
            isNull(products.deletedAt)
          )
        )
        .limit(1);

      if (existingProduct.length === 0) {
        return null;
      }

      const orderItemsCount = await db!
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(orderItems)
        .where(eq(orderItems.productId, productId));

      if (orderItemsCount[0].count > 0) {
        const softDeletedProduct = await db!
          .update(products)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(eq(products.id, productId), eq(products.vendorId, vendorId))
          )
          .returning();

        if (softDeletedProduct.length > 0) {
          await db!
            .update(stores)
            .set({
              productCount: sql`GREATEST(${stores.productCount} - 1, 0)`,
              updatedAt: new Date(),
            })
            .where(eq(stores.ownerId, vendorId));
        }

        return softDeletedProduct[0] || null;
      }

      const softDeletedProduct = await db!
        .update(products)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)))
        .returning();

      // Update store product count (decrement by 1)
      if (softDeletedProduct.length > 0) {
        await db!
          .update(stores)
          .set({
            productCount: sql`GREATEST(${stores.productCount} - 1, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(stores.ownerId, vendorId));
      }

      return softDeletedProduct[0] || null;
    }, null);
  }

  async deleteProductAsAdmin(productId: string): Promise<any> {
    return this.executeWithFallback(async () => {
      // First check if the product exists (admin can delete any product)
      const existingProduct = await db!
        .select()
        .from(products)
        .where(and(eq(products.id, productId), isNull(products.deletedAt)))
        .limit(1);

      if (existingProduct.length === 0) {
        return null; // Product not found
      }

      const product = existingProduct[0];

      // Check if the product has any associated order items
      const orderItemsCount = await db!
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(orderItems)
        .where(eq(orderItems.productId, productId));

      if (orderItemsCount[0].count > 0) {
        throw new Error("PRODUCT_HAS_ORDERS");
      }

      // Soft delete the product (mark as deleted instead of permanent deletion)
      const softDeletedProduct = await db!
        .update(products)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId))
        .returning();

      // Update store product count (decrement by 1)
      if (softDeletedProduct.length > 0) {
        await db!
          .update(stores)
          .set({
            productCount: sql`GREATEST(${stores.productCount} - 1, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(stores.ownerId, product.vendorId));
      }

      return softDeletedProduct[0] || null;
    }, null);
  }

  async updateProductStock(
    productId: string,
    newStock: number,
    vendorId: string
  ): Promise<any> {
    return this.executeWithFallback(async () => {
      // Update the product stock
      const [updatedProduct] = await db!
        .update(products)
        .set({
          stock: newStock,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, productId), eq(products.vendorId, vendorId)))
        .returning();

      return updatedProduct;
    }, null);
  }

  async getSellersWithProducts(): Promise<any[]> {
    return this.executeWithFallback(async () => {
      if (!db) throw new Error("Database not available");

      const sellersQuery = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          storeName: stores.storeName,
          storeStatus: stores.status,
          storeId: stores.id,
          productCount: sql<number>`COUNT(${products.id})::int`.as(
            "productCount"
          ),
        })
        .from(users)
        .leftJoin(stores, eq(stores.ownerId, users.id))
        .leftJoin(
          products,
          and(eq(products.vendorId, users.id), isNull(products.deletedAt))
        )
        .where(and(eq(users.role, "seller"), isNull(users.deletedAt)))
        .groupBy(
          users.id,
          users.username,
          users.email,
          users.firstName,
          users.lastName,
          users.role,
          users.status,
          users.createdAt,
          stores.storeName,
          stores.status,
          stores.id
        )
        .orderBy(desc(users.createdAt));

      return sellersQuery.map((seller) => ({
        ...seller,
        name:
          seller.storeName ||
          `${seller.firstName} ${seller.lastName}`.trim() ||
          seller.username,
      }));
    }, []);
  }

  // Wishlist management methods
  async addToWishlist(userId: string, productId: string): Promise<Wishlist> {
    return this.executeWithFallback(async () => {
      // Check if item is already in wishlist
      const existing = await db!
        .select()
        .from(wishlists)
        .where(
          and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      // Add to wishlist
      const [wishlistItem] = await db!
        .insert(wishlists)
        .values({ userId, productId })
        .returning();

      return wishlistItem;
    }, {} as Wishlist);
  }

  async removeFromWishlist(
    userId: string,
    productId: string
  ): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .delete(wishlists)
        .where(
          and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
        );
      return true;
    }, false);
  }

  async getUserWishlist(userId: string): Promise<any[]> {
    return this.executeWithFallback(async () => {
      const rows = await db!
        .select({
          id: wishlists.id,
          productId: products.id,
          productName: productTranslations.name,
          productLang: productTranslations.language,
          productDesc: productTranslations.shortDescription,
          price: products.price,
          originalPrice: products.originalPrice,
          images: products.images,
          rating: products.rating,
          brand: products.brand,
          stock: products.stock,
          sku: products.sku,
          isActive: products.isActive,
          categoryId: categories.id,
          categoryName: categoryTranslations.name,
          categoryLang: categoryTranslations.language,
          reviewCount: products.reviewCount,
          createdAt: wishlists.createdAt,
        })
        .from(wishlists)
        .innerJoin(products, eq(wishlists.productId, products.id))
        .innerJoin(
          productTranslations,
          eq(productTranslations.productId, products.id)
        )
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(
          categoryTranslations,
          eq(categoryTranslations.categoryId, categories.id)
        )
        .where(and(eq(wishlists.userId, userId), isNull(products.deletedAt)))
        .orderBy(desc(wishlists.createdAt));

      // Group by productId
      const grouped = rows.reduce((acc, row) => {
        let item = acc.find((i) => i.productId === row.productId);
        if (!item) {
          item = {
            id: row.id,
            productId: row.productId,
            price: row.price,
            originalPrice: row.originalPrice,
            images: row.images,
            rating: row.rating,
            brand: row.brand,
            stock: row.stock,
            sku: row.sku,
            isActive: row.isActive,
            reviewCount: row.reviewCount,
            createdAt: row.createdAt,
            translations: [],
            category: {
              id: row.categoryId,
              translations: [],
            },
          };
          acc.push(item);
        }

        // add product translation if not exists
        if (!item.translations.find((t) => t.language === row.productLang)) {
          item.translations.push({
            language: row.productLang,
            name: row.productName,
            description: row.productDesc,
          });
        }

        // add category translation if not exists
        if (
          row.categoryLang &&
          !item.category.translations.find(
            (t) => t.language === row.categoryLang
          )
        ) {
          item.category.translations.push({
            language: row.categoryLang,
            name: row.categoryName,
          });
        }

        return acc;
      }, [] as any[]);

      return grouped;
    }, []);
  }

  async isProductInWishlist(
    userId: string,
    productId: string
  ): Promise<boolean> {
    return this.executeWithFallback(async () => {
      const result = await db!
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(wishlists)
        .where(
          and(eq(wishlists.userId, userId), eq(wishlists.productId, productId))
        );

      return result[0].count > 0;
    }, false);
  }

  // Cart management methods
  async addToCart(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<Cart> {
    return this.executeWithFallback(async () => {
      // Check if item is already in cart
      const existing = await db!
        .select()
        .from(carts)
        .where(and(eq(carts.userId, userId), eq(carts.productId, productId)))
        .limit(1);

      if (existing.length > 0) {
        // Update quantity
        const [updatedCart] = await db!
          .update(carts)
          .set({
            quantity: existing[0].quantity + quantity,
            updatedAt: new Date(),
          })
          .where(eq(carts.id, existing[0].id))
          .returning();
        return updatedCart;
      }

      // Add new item to cart
      const [cartItem] = await db!
        .insert(carts)
        .values({ userId, productId, quantity })
        .returning();

      return cartItem;
    }, {} as Cart);
  }

  async updateCartQuantity(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<boolean> {
    return this.executeWithFallback(async () => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        await db!
          .delete(carts)
          .where(and(eq(carts.userId, userId), eq(carts.productId, productId)));
      } else {
        // Update quantity
        await db!
          .update(carts)
          .set({ quantity, updatedAt: new Date() })
          .where(and(eq(carts.userId, userId), eq(carts.productId, productId)));
      }
      return true;
    }, false);
  }

  async removeFromCart(userId: string, productId: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!
        .delete(carts)
        .where(and(eq(carts.userId, userId), eq(carts.productId, productId)));
      return true;
    }, false);
  }

  async getSellerTransactions(sellerId: string) {
    return await db
      .select({
        transactionId: transactions.id,
        orderId: transactions.orderId,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
        orderNumber: orders.orderNumber,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
      })
      .from(transactions)
      .innerJoin(orders, eq(transactions.orderId, orders.id))
      .where(eq(transactions.sellerId, sellerId))
      .orderBy(desc(transactions.createdAt));
  }

  async getUserCart(userId: string): Promise<any[]> {
    return this.executeWithFallback(async () => {
      const cartItems = await db!
        .select({
          id: carts.id,
          productId: products.id,
          vendorId: products.vendorId,
          name: productTranslations.name,
          description: productTranslations.shortDescription,
          price: products.price,
          originalPrice: products.originalPrice,
          images: products.images,
          quantity: carts.quantity,
          stock: products.stock,
          createdAt: carts.createdAt,
        })
        .from(carts)
        .innerJoin(products, eq(carts.productId, products.id))
        .innerJoin(
          productTranslations,
          and(
            eq(productTranslations.productId, products.id),
            eq(productTranslations.language, "en")
          )
        )
        .where(and(eq(carts.userId, userId), isNull(products.deletedAt)))
        .orderBy(desc(carts.createdAt));

      return cartItems;
    }, []);
  }

  async getCartItemCount(userId: string): Promise<number> {
    return this.executeWithFallback(async () => {
      const result = await db!
        .select({
          total: sql<number>`COALESCE(SUM(quantity), 0)::int`,
        })
        .from(carts)
        .where(eq(carts.userId, userId));

      return result[0].total;
    }, 0);
  }

  async clearCart(userId: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!.delete(carts).where(eq(carts.userId, userId));
      return true;
    }, false);
  }

  async deletePromotion(promotionId: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!.delete(promotions).where(eq(promotions.id, promotionId));
      return true;
    }, false);
  }
  async deletePackage(packageId: string): Promise<boolean> {
    return this.executeWithFallback(async () => {
      await db!.delete(packages).where(eq(packages.id, packageId));
      return true;
    }, false);
  }
  async getStoreInfoByUserId(userId: string): Promise<Store | undefined> {
    try {
      const [store] = await db
        .select({
          storeName: stores.storeName,
          storeDescription: stores.storeDescription,
        })
        .from(stores)
        .where(eq(stores.ownerId, userId));
      return store || undefined;
    } catch (error) {
      console.error("Error fetching store by user ID:", error);
      return undefined;
    }
  }
}
export const storage = new DatabaseStorage();
