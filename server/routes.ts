import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import { storage } from "./storage";
import { db } from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  users,
  notifications,
  type InsertNotification,
  categories,
  categoryTranslations,
  categoryFeatures,
  products,
  insertCategorySchema,
  insertCategoryTranslationSchema,
  insertCategoryFeatureSchema,
  orders,
  orderItems,
  transactions,
  promotions,
  packages,
  carts,
  stockAlerts,
  storeDeliveries,
  carriers,
  shippingZones,
  shippingZoneCarriers,
  payments,
} from "@shared/schema";
import { z } from "zod";
import { eq, desc, and, isNull, inArray, sql } from "drizzle-orm";
import Stripe from "stripe";
import { emailService } from "./emailService";
import createStripePaymentRouter from "./services/stripe-payment-service";
import session from "express-session";
import { create } from "domain";

// Global Socket.IO server instance
let io: SocketIOServer;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage_multer,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded images statically
  app.use("/uploads", express.static(uploadsDir));

  // Image upload API endpoint
  app.post("/api/upload/images", upload.array("images", 8), (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const uploadedFiles = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        path: `/uploads/${file.filename}`,
        size: file.size,
      }));

      res.json({
        message: "Images uploaded successfully",
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      res.status(500).json({ error: "Failed to upload images" });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    const lang = (req.query.lang as string) || "en";
    const excludeSuper = req.query.excludeSuper === "true";
    try {
      const categories = await storage.getCategoriesWithTranslations(lang);

      // Filter out supercategories if requested
      const filteredCategories = excludeSuper
        ? categories.filter((cat) => cat.type !== "supercategory")
        : categories;

      res.json(filteredCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Public Category Features API (for sellers)
  app.get("/api/categories/:id/features", async (req, res) => {
    const categoryId = req.params.id;

    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      const category = await db
        .select({
          id: categories.id,
          type: categories.type,
          parentId: categories.parentId,
          slug: categories.slug,
          icon: categories.icon,
          imageUrl: categories.imageUrl,
          isActive: categories.isActive,
          isFeatured: categories.isFeatured,
          sortOrder: categories.sortOrder,
          metadata: categories.metadata,
          createdAt: categories.createdAt,
          updatedAt: categories.updatedAt,
        })
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

      if (category.length === 0) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Fetch features separately
      const features = await db
        .select()
        .from(categoryFeatures)
        .where(eq(categoryFeatures.categoryId, categoryId));

      res.json(features || []);
    } catch (error) {
      console.error("Error fetching category features:", error);
      res.status(500).json({ error: "Failed to fetch category features" });
    }
  });

  // Admin Categories Management API
  app.get("/api/admin/categories", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Fetch categories with relations (exclude soft deleted)
      const categoriesWithData = await db.query.categories.findMany({
        where: isNull(categories.deletedAt),
        with: {
          translations: true,
          features: true,
        },
      });

      // Calculate subcategory count and product count for each category
      const categoriesWithCount = await Promise.all(
        categoriesWithData.map(async (category) => {
          const subcategoryCount = categoriesWithData.filter(
            (subcat) => subcat.parentId === category.id
          ).length;

          let productCount = 0;

          if (category.type === "super") {
            // For supercategories, count products in all child categories
            const childCategories = categoriesWithData.filter(
              (child) => child.parentId === category.id
            );

            if (childCategories.length > 0) {
              const childCategoryIds = childCategories.map((child) => child.id);
              const productCountResult = await db
                .select({ count: sql<number>`COUNT(*)::int` })
                .from(products)
                .where(
                  and(
                    inArray(products.categoryId, childCategoryIds),
                    eq(products.isActive, true),
                    isNull(products.deletedAt)
                  )
                );
              productCount = productCountResult[0]?.count || 0;
            }
          } else if (category.type === "standard") {
            // For standard categories, count products directly assigned to this category
            const productCountResult = await db
              .select({ count: sql<number>`COUNT(*)::int` })
              .from(products)
              .where(
                and(
                  eq(products.categoryId, category.id),
                  eq(products.isActive, true),
                  isNull(products.deletedAt)
                )
              );
            productCount = productCountResult[0]?.count || 0;
          }

          return {
            ...category,
            subcategoryCount,
            productCount,
          };
        })
      );

      res.json(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching admin categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Create Category
  app.post("/api/admin/categories", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const categorySchema = z.object({
      type: z.string(),
      parentId: z.string().optional(),
      slug: z.string(),
      icon: z.string(),
      imageUrl: z.string().optional(),
      isActive: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      sortOrder: z.number().default(0),
      metadata: z.record(z.any()).default({}),
      translations: z.array(
        z.object({
          language: z.string(),
          name: z.string(),
          description: z.string().optional(),
          seoTitle: z.string().optional(),
          seoDescription: z.string().optional(),
          seoKeywords: z.string().optional(),
        })
      ),
      features: z
        .array(
          z.object({
            name: z.string(),
            type: z.string(),
            value: z.string().optional(),
            isRequired: z.boolean().default(false),
            options: z.array(z.string()).default([]),
            sortOrder: z.number().default(0),
          })
        )
        .default([]),
    });

    try {
      console.log(
        "🚀 Server: POST /api/admin/categories - Request body:",
        req.body
      );
      const data = categorySchema.parse(req.body);
      console.log("✅ Server: Schema validation passed:", data);

      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Create category
      const [category] = await db
        .insert(categories)
        .values({
          type: data.type,
          parentId: data.parentId || null,
          slug: data.slug,
          icon: data.icon,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
          isFeatured: data.isFeatured,
          sortOrder: data.sortOrder,
          metadata: data.metadata,
        })
        .returning();

      // Create translations
      if (data.translations.length > 0) {
        await db.insert(categoryTranslations).values(
          data.translations.map((trans) => ({
            categoryId: category.id,
            language: trans.language,
            name: trans.name,
            description: trans.description,
            seoTitle: trans.seoTitle,
            seoDescription: trans.seoDescription,
            seoKeywords: trans.seoKeywords,
          }))
        );
      }

      // Create features
      if (data.features.length > 0) {
        await db.insert(categoryFeatures).values(
          data.features.map((feature, index) => ({
            categoryId: category.id,
            name: feature.name,
            type: feature.type,
            value: feature.value || null,
            isRequired: feature.isRequired,
            options: feature.options,
            sortOrder: feature.sortOrder || index,
          }))
        );
      }

      // Fetch the complete category with relations
      const createdCategory = await db.query.categories.findFirst({
        where: eq(categories.id, category.id),
        with: {
          translations: true,
          features: true,
        },
      });

      res.status(201).json(createdCategory);
    } catch (error) {
      console.error("❌ Server: Error creating category:", error);
      if (error instanceof z.ZodError) {
        console.error("🔍 Server: Validation errors:", error.errors);
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      console.error("💥 Server: Database or other error:", error);
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Update Category
  app.put("/api/admin/categories/:id", async (req, res) => {
    console.log("Req got it for update cat");
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const categoryId = req.params.id;
    const updateSchema = z.object({
      type: z.string().optional(),
      parentId: z.string().optional(),
      slug: z.string().optional(),
      icon: z.string().optional(),
      imageUrl: z.string().optional(),
      isActive: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
      sortOrder: z.number().optional(),
      metadata: z.record(z.any()).optional(),
      translations: z
        .array(
          z.object({
            id: z.string().optional(),
            language: z.string(),
            name: z.string(),
            description: z.string().optional(),
            seoTitle: z.string().optional(),
            seoDescription: z.string().optional(),
            seoKeywords: z.string().optional(),
          })
        )
        .optional(),
      features: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string(),
            type: z.string(),
            value: z.string().optional(),
            isRequired: z.boolean().default(false),
            options: z.array(z.string()).default([]),
            sortOrder: z.number().default(0),
          })
        )
        .optional(),
    });

    try {
      const data = updateSchema.parse(req.body);

      // Update category
      const updateData: any = {};
      if (data.type !== undefined) updateData.type = data.type;
      if (data.parentId !== undefined) updateData.parentId = data.parentId;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.isFeatured !== undefined)
        updateData.isFeatured = data.isFeatured;
      if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
      if (data.metadata !== undefined) updateData.metadata = data.metadata;
      updateData.updatedAt = new Date();

      if (Object.keys(updateData).length > 1) {
        // More than just updatedAt
        await db
          .update(categories)
          .set(updateData)
          .where(eq(categories.id, categoryId));
      }

      // Update translations if provided
      if (data.translations) {
        // Delete existing translations
        await db
          .delete(categoryTranslations)
          .where(eq(categoryTranslations.categoryId, categoryId));

        // Insert new translations
        if (data.translations.length > 0) {
          await db.insert(categoryTranslations).values(
            data.translations.map((trans) => ({
              categoryId,
              language: trans.language,
              name: trans.name,
              description: trans.description,
              seoTitle: trans.seoTitle,
              seoDescription: trans.seoDescription,
              seoKeywords: trans.seoKeywords,
            }))
          );
        }
      }

      // Update features if provided
      if (data.features) {
        // Delete existing features
        await db
          .delete(categoryFeatures)
          .where(eq(categoryFeatures.categoryId, categoryId));

        // Insert new features
        if (data.features.length > 0) {
          await db.insert(categoryFeatures).values(
            data.features.map((feature, index) => ({
              categoryId,
              name: feature.name,
              type: feature.type,
              value: feature.value || null,
              isRequired: feature.isRequired,
              options: feature.options,
              sortOrder: feature.sortOrder || index,
            }))
          );
        }
      }

      // Fetch updated category
      const updatedCategory = await db.query.categories.findFirst({
        where: eq(categories.id, categoryId),
        with: {
          translations: true,
          features: true,
        },
      });

      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  // Create Supercategory
  app.post("/api/admin/supercategories", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const createSchema = z.object({
      nameFr: z.string().min(1, "French name is required"),
      nameEn: z.string().min(1, "English name is required"),
      nameAr: z.string().optional(),
      descriptionFr: z.string().optional(),
      descriptionEn: z.string().optional(),
      descriptionAr: z.string().optional(),
      icon: z.string().optional(),
      mainImageUrl: z.string().url().optional().or(z.literal("")),
      isFeatured: z.boolean().default(false),
      isVisible: z.boolean().default(true),
      seoTitleFr: z.string().optional(),
      seoTitleEn: z.string().optional(),
      seoTitleAr: z.string().optional(),
      seoDescriptionFr: z.string().optional(),
      seoDescriptionEn: z.string().optional(),
      seoDescriptionAr: z.string().optional(),
      seoKeywordsFr: z.string().optional(),
      seoKeywordsEn: z.string().optional(),
      seoKeywordsAr: z.string().optional(),
      enabledFeatures: z.array(z.string()).default([]),
    });

    try {
      const data = createSchema.parse(req.body);

      // Generate slug from French name
      const slug = data.nameFr
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Create supercategory (category with type="super")
      const [newCategory] = await db
        .insert(categories)
        .values({
          type: "super",
          parentId: null,
          slug,
          icon: data.icon || "star",
          imageUrl: data.mainImageUrl || "",
          isActive: data.isVisible,
          isFeatured: data.isFeatured,
          sortOrder: 0,
          metadata: { enabledFeatures: data.enabledFeatures },
        })
        .returning();

      // Create translations
      const translations = [
        {
          categoryId: newCategory.id,
          language: "fr",
          name: data.nameFr,
          description: data.descriptionFr,
          seoTitle: data.seoTitleFr,
          seoDescription: data.seoDescriptionFr,
          seoKeywords: data.seoKeywordsFr,
        },
        {
          categoryId: newCategory.id,
          language: "en",
          name: data.nameEn,
          description: data.descriptionEn,
          seoTitle: data.seoTitleEn,
          seoDescription: data.seoDescriptionEn,
          seoKeywords: data.seoKeywordsEn,
        },
      ];

      if (data.nameAr) {
        translations.push({
          categoryId: newCategory.id,
          language: "ar",
          name: data.nameAr,
          description: data.descriptionAr,
          seoTitle: data.seoTitleAr,
          seoDescription: data.seoDescriptionAr,
          seoKeywords: data.seoKeywordsAr,
        });
      }

      await db.insert(categoryTranslations).values(translations);

      // Fetch the complete category with translations
      const categoryWithTranslations = await db.query.categories.findFirst({
        where: eq(categories.id, newCategory.id),
        with: {
          translations: true,
          features: true,
        },
      });

      res.status(201).json(categoryWithTranslations);
    } catch (error) {
      console.error("Error creating supercategory:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create supercategory" });
    }
  });

  // Delete Category
  app.delete("/api/admin/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const categoryId = req.params.id;

    try {
      // Check if category has children
      const children = await db.query.categories.findMany({
        where: eq(categories.parentId, categoryId),
      });

      if (children.length > 0) {
        return res
          .status(400)
          .json({ error: "Cannot delete category with subcategories" });
      }

      // Check if this category is used in any supercategory (has a parent)
      const categoryToDelete = await db.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });

      if (categoryToDelete?.parentId) {
        return res.status(400).json({
          error:
            "Cannot delete category that is part of a supercategory. Please remove it from the supercategory first.",
        });
      }

      // Check if category has any products (exclude soft deleted products)
      const productsInCategory = await db.query.products.findMany({
        where: and(
          eq(products.categoryId, categoryId),
          isNull(products.deletedAt)
        ),
      });

      if (productsInCategory.length > 0) {
        return res.status(400).json({
          error: `Cannot delete category that contains ${productsInCategory.length} active product(s). Please move or delete the products first.`,
        });
      }

      // Soft delete the category instead of permanent deletion
      await db
        .update(categories)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(categories.id, categoryId));

      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Get Category by ID
  app.get("/api/admin/categories/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const categoryId = req.params.id;

    try {
      const category = await db.query.categories.findFirst({
        where: eq(categories.id, categoryId),
        with: {
          translations: true,
          features: true,
          parent: {
            with: {
              translations: true,
            },
          },
          children: {
            with: {
              translations: true,
            },
          },
        },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Get supercategories only (type="super")
  app.get("/api/admin/supercategories", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const supercategories = await db.query.categories.findMany({
        where: and(eq(categories.type, "super"), isNull(categories.deletedAt)),
        with: {
          translations: true,
          features: true,
          children: {
            where: isNull(categories.deletedAt),
            with: {
              translations: true,
            },
          },
        },
        orderBy: [categories.sortOrder, categories.createdAt],
      });

      // Calculate product count for each supercategory by counting products in child categories
      const supercategoriesWithProductCount = await Promise.all(
        supercategories.map(async (supercategory) => {
          if (supercategory.children && supercategory.children.length > 0) {
            const childCategoryIds = supercategory.children.map(
              (child) => child.id
            );

            // Count products in all child categories
            const productCountResult = await db
              .select({ count: sql<number>`COUNT(*)::int` })
              .from(products)
              .where(
                and(
                  inArray(products.categoryId, childCategoryIds),
                  eq(products.isActive, true)
                )
              );

            return {
              ...supercategory,
              productCount: productCountResult[0]?.count || 0,
            };
          } else {
            return {
              ...supercategory,
              productCount: 0,
            };
          }
        })
      );

      res.json(supercategoriesWithProductCount);
    } catch (error) {
      console.error("Error fetching supercategories:", error);
      res.status(500).json({ error: "Failed to fetch supercategories" });
    }
  });

  // Get standard categories only (type="standard") - for template selection
  app.get("/api/admin/categories/standard", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const standardCategories = await db.query.categories.findMany({
        where: eq(categories.type, "standard"),
        with: {
          translations: true,
        },
        orderBy: [categories.sortOrder, categories.createdAt],
      });

      res.json(standardCategories);
    } catch (error) {
      console.error("Error fetching standard categories:", error);
      res.status(500).json({ error: "Failed to fetch standard categories" });
    }
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      // Return all products with all translations for frontend filtering
      const products = await storage.getAllProductsWithTranslations();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    const lang = (req.query.lang as string) || "en";
    const productId = req.params.id;

    try {
      const product = await storage.getProductWithTranslations(productId, lang);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Create product API with comprehensive data
  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const {
        name,
        description,
        shortDescription,
        translations,
        specifications = [],
        faqs = [],
        ...productData
      } = req.body;

      // Use multilingual translations if provided, fallback to single language for backward compatibility
      const productTranslations = translations || {
        en: { name, description, shortDescription },
      };

      // Create the main product with multilingual support
      const product = await storage.createProductWithDetails({
        ...productData,
        vendorId: req.user.id,
        images: req.body.images || [],
        translations: productTranslations,
        specifications,
        faqs,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);

      // Handle specific database constraint errors
      if (error.code === "23505") {
        if (error.constraint === "products_sku_unique") {
          return res.status(400).json({
            error: "SKU already exists. Please use a different SKU.",
            field: "sku",
          });
        }
      }

      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Update Product
  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.id;
      const {
        name,
        description,
        shortDescription,
        translations,
        specifications = [],
        faqs = [],
        ...productData
      } = req.body;

      // Use multilingual translations if provided, fallback to single language for backward compatibility
      const productTranslations = translations || {
        en: { name, description, shortDescription },
      };

      // Update the product with multilingual support
      const updatedProduct = await storage.updateProductWithDetails(
        productId,
        req.user.id,
        {
          ...productData,
          images: req.body.images || [],
          translations: productTranslations,
          specifications,
          faqs,
        }
      );

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);

      // Handle specific database constraint errors
      if (error.code === "23505") {
        if (error.constraint === "products_sku_unique") {
          return res.status(400).json({
            error: "SKU already exists. Please use a different SKU.",
            field: "sku",
          });
        }
      }

      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Delete Product
  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.id;

      // Delete the product (this will cascade delete translations, specs, and FAQs)
      const deletedProduct = await storage.deleteProduct(
        productId,
        req.user.id
      );

      if (!deletedProduct) {
        return res.status(404).json({
          error: "Product not found or you don't have permission to delete it",
        });
      }

      res.json({
        message: "Product deleted successfully",
        product: deletedProduct,
      });
    } catch (error) {
      console.error("Error deleting product:", error);

      if (error.message === "PRODUCT_HAS_ORDERS") {
        return res.status(400).json({
          error:
            "Cannot delete product with existing orders. This product is referenced in customer orders and cannot be removed to maintain order history.",
        });
      }

      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Get seller's products
  app.get("/api/seller/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      // Return all products by vendor with all translations for frontend filtering
      const products = await storage.getProductsByVendor(req.user.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Get product for editing (with all translations)
  app.get("/api/seller/products/:id/edit", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.id;
      const product = await storage.getProductForEdit(productId, req.user.id);

      if (!product) {
        return res.status(404).json({
          error: "Product not found or you don't have permission to edit it",
        });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product for edit:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Adjust product stock
  app.patch("/api/seller/products/:id/adjust-stock", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    const adjustmentSchema = z.object({
      adjustmentType: z.enum(["increase", "decrease"]),
      quantity: z.number().positive(),
      reason: z.string().min(1),
      notes: z.string().optional(),
      alsoPriceAdjust: z.boolean().optional(),
      newPrice: z.number().positive().optional(),
    });

    try {
      const productId = req.params.id;
      const adjustmentData = adjustmentSchema.parse(req.body);

      // Get current product to verify ownership and current stock
      const product = await storage.getProductForEdit(productId, req.user.id);
      if (!product) {
        return res.status(404).json({
          error: "Product not found or you don't have permission to modify it",
        });
      }

      // Calculate new stock level
      let newStock = product.stock;
      if (adjustmentData.adjustmentType === "increase") {
        newStock += adjustmentData.quantity;
      } else {
        newStock = Math.max(0, newStock - adjustmentData.quantity);
      }

      // Update the product stock
      const updatedProduct = await storage.updateProductStock(
        productId,
        newStock,
        req.user.id
      );

      if (!updatedProduct) {
        return res
          .status(404)
          .json({ error: "Failed to update product stock" });
      }

      // Log the stock adjustment for audit trail
      console.log(`Stock adjustment for product ${productId}:`, {
        sellerId: req.user.id,
        oldStock: product.stock,
        newStock,
        adjustmentType: adjustmentData.adjustmentType,
        quantity: adjustmentData.quantity,
        reason: adjustmentData.reason,
        notes: adjustmentData.notes,
      });

      res.json({
        message: "Stock adjusted successfully",
        product: updatedProduct,
        oldStock: product.stock,
        newStock,
      });
    } catch (error) {
      console.error("Error adjusting product stock:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid adjustment data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to adjust stock" });
    }
  });

  // Seed dummy products for seller
  app.post("/api/seller/seed-products", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      await storage.seedDummyProducts(req.user.id);
      res.json({ message: "Dummy products created successfully" });
    } catch (error) {
      console.error("Error seeding dummy products:", error);
      res.status(500).json({ error: "Failed to create dummy products" });
    }
  });

  // Get seller's store status
  app.get("/api/seller/store/status", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const store = await storage.getStoreByOwnerId(req.user.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json({
        id: store.id,
        name: store.name,
        status: store.status,
        suspensionReason: store.suspensionReason,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      });
    } catch (error) {
      console.error("Error fetching seller store status:", error);
      res.status(500).json({ error: "Failed to fetch store status" });
    }
  });

  // Product inquiry/query API
  app.post("/api/products/:id/inquiry", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { message, customerEmail, customerName } = req.body;
    const productId = req.params.id;

    try {
      // Get product details to find the seller
      const product = await storage.getProductWithTranslations(productId, "en");
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Create notification for seller about product inquiry
      await createNotification({
        userId: product.vendorId,
        type: "product_inquiry",
        title: "Product Inquiry",
        message: `${
          customerName || req.user?.firstName
        } asked about your product: ${product.name}`,
        data: {
          productId: product.id,
          productName: product.name,
          customerMessage: message,
          customerEmail: customerEmail || req.user?.email,
          customerId: req.user?.id,
        },
        isRead: false,
      });

      res.json({ success: true, message: "Inquiry sent successfully" });
    } catch (error) {
      console.error("Error sending product inquiry:", error);
      res.status(500).json({ error: "Failed to send inquiry" });
    }
  });

  // Vendors API
  app.get("/api/vendors", async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });

  // Dashboard stats APIs
  app.get("/api/dashboard/client", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "client") {
      return res.sendStatus(401);
    }

    try {
      const stats = await storage.getClientDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching client dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/seller", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const stats = await storage.getSellerDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching seller dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/admin", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const stats = await storage.getAdminDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // User Management API
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const roleFilter = req.query.role as string;
      const users = await storage.getAllUsers();

      // Filter by role if specified
      const filteredUsers = roleFilter
        ? users.filter((user) => user.role === roleFilter)
        : users;

      res.json(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/users/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "Failed to fetch user stats" });
    }
  });

  // Create user by admin
  app.post("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const createUserSchema = z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email(),
      username: z.string().min(3),
      password: z.string().min(6),
      role: z.enum(["client", "seller", "admin"]),
      isActive: z.boolean().default(true),
    });

    try {
      const userData = createUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "User with this email already exists" });
      }

      const existingUsername = await storage.getUserByUsername(
        userData.username
      );
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        emailVerified: true, // Admin-created users are pre-verified
        preferredLanguage: "en",
        sellerStatus: userData.role === "seller" ? "approved" : null,
      });

      // Don't return the password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/admin/users/create-test-users", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      // Create additional test users
      await db.insert(users).values([
        {
          username: "test_user_1",
          email: "test1@example.com",
          password: await hashPassword("password123"),
          firstName: "Test",
          lastName: "User One",
          role: "client",
          avatar:
            "https://ui-avatars.com/api/?name=Test+User+One&background=3b82f6&color=fff",
          isActive: true,
          emailVerified: true,
          preferredLanguage: "en",
          sellerStatus: null,
        },
        {
          username: "test_user_2",
          email: "test2@example.com",
          password: await hashPassword("password123"),
          firstName: "Test",
          lastName: "User Two",
          role: "seller",
          avatar:
            "https://ui-avatars.com/api/?name=Test+User+Two&background=10b981&color=fff",
          isActive: true,
          emailVerified: true,
          preferredLanguage: "en",
          sellerStatus: "approved",
        },
        {
          username: "test_user_3",
          email: "test3@example.com",
          password: await hashPassword("password123"),
          firstName: "Test",
          lastName: "User Three",
          role: "client",
          avatar:
            "https://ui-avatars.com/api/?name=Test+User+Three&background=f59e0b&color=fff",
          isActive: false,
          emailVerified: false,
          preferredLanguage: "en",
          sellerStatus: null,
        },
      ]);

      res.json({ message: "Test users created successfully" });
    } catch (error) {
      console.error("Error creating test users:", error);
      res.status(500).json({ error: "Failed to create test users" });
    }
  });

  // Delete user endpoint
  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const userId = req.params.id;
      const success = await storage.deleteUser(userId);

      if (success) {
        res.json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Update user endpoint
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const userId = req.params.id;
      const { status, role } = req.body;
      const isActive = status === "Active";

      const userRole = role.toLowerCase();

      const updates = {
        isActive,
        status, // Store the actual status string
        role: userRole,
      };

      const updatedUser = await storage.updateUser(userId, updates);

      if (updatedUser) {
        res.json(updatedUser);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Store Management API
  app.get("/api/admin/stores", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const stores = await storage.getAllStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

 app.get("/api/admin/stores/stats", async (req, res) => {
  if (!req.isAuthenticated() || req.user?.role !== "admin") {
    return res.sendStatus(401);
  }

  try {
    const stats = await storage.getStoreStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching store stats:", error);
    res.status(500).json({ error: "Failed to fetch store stats" });
  }
});


  app.get("/api/admin/stores/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const store = await storage.getStoreById(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ error: "Failed to fetch store" });
    }
  });

  app.post("/api/admin/stores", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const {
        name,
        ownerEmail,
        categoryId,
        description,
        ownerPhone,
        website,
        taxId,
        ownerAddressStreet,
        ownerAddressCity,
        ownerAddressZipCode,
        ownerAddressCountry,
      } = req.body;

      // Find owner by email
      const owner = await storage.getUserByEmail(ownerEmail);
      if (!owner) {
        return res
          .status(400)
          .json({ error: "Owner not found with provided email" });
      }

      const storeData = {
        ownerId: owner.id,
        name,
        categoryId,
        description,
        ownerPhone,
        website,
        taxId,
        ownerAddressStreet,
        ownerAddressCity,
        ownerAddressZipCode,
        ownerAddressCountry,
        status: "pending_validation",
      };

      const store = await storage.createStore(storeData);
      res.status(201).json(store);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ error: "Failed to create store" });
    }
  });

  app.patch("/api/admin/stores/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { status, messagesSent, suspensionReason } = req.body;
      const updates: Partial<any> = {};

      if (status) updates.status = status;
      if (messagesSent !== undefined) updates.messagesSent = messagesSent;
      if (suspensionReason !== undefined)
        updates.suspensionReason = suspensionReason;

      const updatedStore = await storage.updateStore(req.params.id, updates);

      if (!updatedStore) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json(updatedStore);
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ error: "Failed to update store" });
    }
  });

  app.delete("/api/admin/stores/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const success = await storage.deleteStore(req.params.id);

      if (success) {
        res.json({ message: "Store deleted successfully" });
      } else {
        res.status(404).json({ error: "Store not found" });
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ error: "Failed to delete store" });
    }
  });

  // Admin Products Management API - Get sellers with their products
  app.get("/api/admin/sellers-with-products", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const sellers = await storage.getSellersWithProducts();
      res.json(sellers);
    } catch (error) {
      console.error("Error fetching sellers with products:", error);
      res.status(500).json({ error: "Failed to fetch sellers with products" });
    }
  });

  // Admin Products Management API - Get products for specific seller
  app.get("/api/admin/sellers/:id/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const sellerId = req.params.id;
      const products = await storage.getProductsByVendor(sellerId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      res.status(500).json({ error: "Failed to fetch seller products" });
    }
  });

  // Admin - Delete any product
  app.delete("/api/admin/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.id;

      // Admin can delete any product, so we pass null as vendorId to skip ownership check
      const deletedProduct = await storage.deleteProductAsAdmin(productId);

      if (!deletedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({
        message: "Product deleted successfully",
        product: deletedProduct,
      });
    } catch (error) {
      console.error("Error deleting product:", error);

      if (error.message === "PRODUCT_HAS_ORDERS") {
        return res.status(400).json({
          error:
            "Cannot delete product with existing orders. This product is referenced in customer orders and cannot be removed to maintain order history.",
        });
      }

      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Admin - Get all products
  app.get("/api/admin/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const products = await storage.getAllProductsWithTranslations();
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  // Admin - Update product
  app.put("/api/admin/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.id;
      const {
        name,
        description,
        shortDescription,
        translations,
        specifications = [],
        faqs = [],
        categoryId,
        ...productData
      } = req.body;

      // Use multilingual translations if provided, fallback to single language for backward compatibility
      const productTranslations = translations || {
        en: { name, description, shortDescription },
      };

      // Update the product with multilingual support
      const product = await storage.updateProductWithDetails(productId, {
        ...productData,
        categoryId: categoryId || productData.category,
        images: req.body.images || [],
        translations: productTranslations,
        specifications,
        faqs,
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);

      // Handle specific database constraint errors
      if (error.code === "23505") {
        if (error.constraint === "products_sku_unique") {
          return res.status(400).json({
            error: "SKU already exists. Please use a different SKU.",
            field: "sku",
          });
        }
      }

      res.status(500).json({ error: "Failed to update product" });
    }
  });

  // Admin - Bulk upload products from CSV
  app.post(
    "/api/admin/products/bulk-upload",
    upload.single("csvFile"),
    async (req, res) => {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.sendStatus(401);
      }

      if (!req.file) {
        return res.status(400).json({ error: "No CSV file provided" });
      }

      try {
        const csvContent = req.file.buffer.toString("utf-8");
        const lines = csvContent
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);

        if (lines.length < 2) {
          return res.status(400).json({
            error: "CSV file must contain at least a header and one data row",
          });
        }

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/"/g, ""));
        const dataRows = lines.slice(1);

        let created = 0;
        const errors: string[] = [];

        for (let i = 0; i < dataRows.length; i++) {
          const rowIndex = i + 2; // +2 because we skip header and arrays are 0-indexed

          try {
            const values = dataRows[i]
              .split(",")
              .map((v) => v.trim().replace(/"/g, ""));

            if (values.length !== headers.length) {
              errors.push(`Row ${rowIndex}: Column count mismatch`);
              continue;
            }

            const rowData: any = {};
            headers.forEach((header, index) => {
              rowData[header] = values[index] || "";
            });

            // Validate required fields
            const requiredFields = [
              "name",
              "description",
              "sku",
              "price",
              "categoryId",
              "vendorId",
            ];
            const missingFields = requiredFields.filter(
              (field) => !rowData[field]
            );

            if (missingFields.length > 0) {
              errors.push(
                `Row ${rowIndex}: Missing required fields: ${missingFields.join(
                  ", "
                )}`
              );
              continue;
            }

            // Parse specifications from CSV format
            const specifications: Array<{ name: string; value: string }> = [];
            if (rowData.specifications_name && rowData.specifications_value) {
              const specNames = rowData.specifications_name
                .split(";")
                .map((s: string) => s.trim());
              const specValues = rowData.specifications_value
                .split(";")
                .map((s: string) => s.trim());

              for (
                let j = 0;
                j < Math.min(specNames.length, specValues.length);
                j++
              ) {
                if (specNames[j] && specValues[j]) {
                  specifications.push({
                    name: specNames[j],
                    value: specValues[j],
                  });
                }
              }
            }

            // Parse FAQs from CSV format
            const faqs: Array<{ question: string; answer: string }> = [];
            if (rowData.faqs_question && rowData.faqs_answer) {
              const questions = rowData.faqs_question
                .split(";")
                .map((q: string) => q.trim());
              const answers = rowData.faqs_answer
                .split(";")
                .map((a: string) => a.trim());

              for (
                let j = 0;
                j < Math.min(questions.length, answers.length);
                j++
              ) {
                if (questions[j] && answers[j]) {
                  faqs.push({ question: questions[j], answer: answers[j] });
                }
              }
            }

            // Parse images from CSV format
            const images: string[] = [];
            if (rowData.images) {
              images.push(
                ...rowData.images
                  .split(";")
                  .map((img: string) => img.trim())
                  .filter((img: string) => img)
              );
            }

            // Build translations object
            const translations: any = {};
            if (rowData.translations_en_name) {
              translations.en = {
                name: rowData.translations_en_name,
                description:
                  rowData.translations_en_description || rowData.description,
                shortDescription:
                  rowData.translations_en_shortDescription ||
                  rowData.shortDescription,
              };
            }
            if (rowData.translations_fr_name) {
              translations.fr = {
                name: rowData.translations_fr_name,
                description: rowData.translations_fr_description,
                shortDescription: rowData.translations_fr_shortDescription,
              };
            }
            if (rowData.translations_ar_name) {
              translations.ar = {
                name: rowData.translations_ar_name,
                description: rowData.translations_ar_description,
                shortDescription: rowData.translations_ar_shortDescription,
              };
            }

            // If no translations provided, use default values
            if (Object.keys(translations).length === 0) {
              translations.en = {
                name: rowData.name,
                description: rowData.description,
                shortDescription: rowData.shortDescription,
              };
            }

            // Create the product
            const productData = {
              name: rowData.name,
              description: rowData.description,
              shortDescription: rowData.shortDescription || "",
              sku: rowData.sku,
              price: parseFloat(rowData.price),
              originalPrice: rowData.originalPrice
                ? parseFloat(rowData.originalPrice)
                : null,
              stock: parseInt(rowData.stock) || 0,
              categoryId: rowData.categoryId,
              vendorId: rowData.vendorId,
              brand: rowData.brand || "",
              images,
              isFeatured:
                rowData.isFeatured === "true" || rowData.isFeatured === "1",
              isActive:
                rowData.isActive !== "false" && rowData.isActive !== "0", // default true
              specifications,
              faqs,
              translations,
            };

            await storage.createProductWithDetails(productData);
            created++;
          } catch (error: any) {
            errors.push(`Row ${rowIndex}: ${error.message || "Unknown error"}`);
          }
        }

        res.json({
          message: `Bulk upload completed. ${created} products created.`,
          created,
          errors: errors.length > 0 ? errors : undefined,
        });
      } catch (error) {
        console.error("Error processing CSV bulk upload:", error);
        res.status(500).json({ error: "Failed to process CSV file" });
      }
    }
  );

  // Admin - Create product for any store
  app.post("/api/admin/products", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const {
        name,
        description,
        shortDescription,
        translations,
        specifications = [],
        faqs = [],
        vendorId,
        ...productData
      } = req.body;

      if (!vendorId) {
        return res.status(400).json({ error: "vendorId is required" });
      }

      // Use multilingual translations if provided, fallback to single language for backward compatibility
      const productTranslations = translations || {
        en: { name, description, shortDescription },
      };

      // Create the main product with multilingual support
      const product = await storage.createProductWithDetails({
        ...productData,
        vendorId,
        images: req.body.images || [],
        translations: productTranslations,
        specifications,
        faqs,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);

      // Handle specific database constraint errors
      if (error.code === "23505") {
        if (error.constraint === "products_sku_unique") {
          return res.status(400).json({
            error: "SKU already exists. Please use a different SKU.",
            field: "sku",
          });
        }
      }

      res.status(500).json({ error: "Failed to create product" });
    }
  });

  // Admin Revenue API
  app.get("/api/admin/shop-revenues", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }
    const data = await storage.getShopRevenues();
    res.json(data);
  });

  app.get("/api/admin/shop-revenues/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }
    const stats = await storage.getShopRevenueStats();
    return res.json(stats);
  });

  app.get("/api/admin/shop-revenues/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }
    const { id } = req.params;
    const shop = await storage.getShopRevenueById(id);
    if (!shop) return res.status(404).json({ error: "Shop not found" });
    return res.json(shop);
  });

  app.patch("/api/admin/shop-revenues/pay/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }
    const { id } = req.params;
    const result = await storage.markShopTransactionsPaid(id);
    return res.json(result);
  });

  // Seller Profile API

  app.get("/api/seller/profile", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }
    const userId = req.user?.id || "";
    const result = await storage.getSellerProfile(userId);
    res.json(result);
  });

  app.patch("/api/seller/profile", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }
    const userId = req.user?.id || "";
    const { email, storeName, storeDescription } = req.body;
    try {
      const updatedProfile = await storage.updateSellerProfile(userId, {
        email,
        storeName,
        storeDescription,
      });
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating seller profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Client Profile API
  app.get("/api/user/profile", async (req, res) => {
    const userId = req.user?.id || "";
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    res.json(user || {});
  });

  app.patch(
    "/api/user/profile/avatar",
    upload.single("avatar"),
    async (req, res) => {
      const userId = req.user?.id || "";
      if (!req.file) {
        return res.status(400).json({ error: "No avatar file provided" });
      }
      try {
        const avatarUrl = `/uploads/${req.file.filename}`;
        const [updatedUser] = await db
          .update(users)
          .set({ avatar: avatarUrl, updatedAt: new Date() })
          .where(eq(users.id, userId))
          .returning({
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            avatar: users.avatar,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          });
        if (!updatedUser)
          return res.status(404).json({ error: "User not found" });
        res.json({ success: true, user: updatedUser });
      } catch (error) {
        console.error("Error updating avatar:", error);
        res.status(500).json({ error: "Failed to update avatar" });
      }
    }
  );

  app.patch("/api/user/profile", async (req, res) => {
    const userId = req.user?.id || "";
    const { firstName, lastName, username, email } = req.body;

    try {
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName,
          lastName,
          username,
          email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
          email: users.email,
        });

      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.post("/api/user/change-password", async (req, res) => {
    try {
      const userId = req.user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Utilisateur non authentifié" });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Champs manquants" });
      }

      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) {
        return res.status(404).json({ error: "Utilisateur introuvable" });
      }

      const isValid = await comparePasswords(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Mot de passe actuel incorrect" });
      }

      const newHashedPassword = await hashPassword(newPassword);

      await db
        .update(users)
        .set({ password: newHashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        message: "Mot de passe mis à jour avec succès",
      });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      res.status(500).json({ error: "Erreur interne du serveur" });
    }
  });

  // Payments Endpoints
  app.get("/api/user/payments", async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId));
    res.json(result);
  });

  app.post("/api/user/payments", async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { type, cardNumber, expiry, holderName, isDefault } = req.body;
    const [newPayment] = await db
      .insert(payments)
      .values({ userId, type, cardNumber, expiry, holderName, isDefault })
      .returning();
    res.json(newPayment);
  });

  app.patch("/api/user/payments/:id", async (req, res) => {
    const { id } = req.params;
    const { type, cardNumber, expiry, holderName, isDefault } = req.body;
    const [updatedPayment] = await db
      .update(payments)
      .set({
        type,
        cardNumber,
        expiry,
        holderName,
        isDefault,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, id))
      .returning();
    res.json(updatedPayment);
  });

  app.delete("/api/user/payments/:id", async (req, res) => {
    const { id } = req.params;
    await db.delete(payments).where(eq(payments.id, id));
    res.json({ success: true });
  });

  // Address API

  app.get("/api/user/addresses", async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await storage.getUserAddresses(userId);
    res.json(result);
  });

  app.post("/api/user/addresses", async (req, res) => {
    const userId = req.user?.id;
    const data = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const address = await storage.addUserAddress(userId, data);
    res.json(address);
  });

  app.patch("/api/user/addresses/:id", async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const data = req.body;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const updated = await storage.updateUserAddress(userId, id, data);
    res.json(updated);
  });

  app.delete("/api/user/addresses/:id", async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const result = await storage.deleteUserAddress(userId, id);
    res.json(result);
  });

  // Statistics API
  app.get("/api/client/statistics", async (req, res) => {
    try {
      const userId = req.user?.id || "";
      const stats = await storage.getClientStatistics(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching client statistics:", error);
      res.status(500).json({ error: "Failed to fetch client statistics" });
    }
  });

  // Shipping API

  app.get("/api/carriers", async (req, res) => {
    const carriers = await storage.getCarriers();
    res.json(carriers);
  });

  app.post("/api/carriers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const carrier = await storage.createCarrier(req.body);
    res.json(carrier);
  });

  app.put("/api/carriers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.updateCarrier(req.params.id, req.body);
    res.json({ success: true });
  });

  app.delete("/api/carriers/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteCarrier(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/carriers/:carrierId/options", async (req, res) => {
    const { carrierId } = req.params;
    const options = await storage.getShippingOptions(carrierId);
    res.json(options);
  });

  app.post("/api/carriers/:carrierId/options", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const { carrierId } = req.params;
    const data = {
      ...req.body,
      carrierId,
    };

    try {
      const option = await storage.createShippingOption(data);
      res.json(option);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create shipping option" });
    }
  });

  app.put("/api/shipping-options/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.updateShippingOption(req.params.id, req.body);
    res.json({ success: true });
  });

  app.delete("/api/shipping-options/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteShippingOption(req.params.id);
    res.json({ success: true });
  });

  // Get delivery by store (one shop)
  app.get("/api/store-delivery/:shopId", async (req, res) => {
    const { shopId } = req.params;
    const delivery = await db
      .select()
      .from(storeDeliveries)
      .where(eq(storeDeliveries.shopId, shopId));
    res.json(delivery[0] || null);
  });

  // Create
  app.post("/api/store-delivery/:shopId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const shopId = req.user.id;
    const payload = { ...req.body, shopId, createdAt: new Date() };
    const inserted = await db
      .insert(storeDeliveries)
      .values(payload)
      .returning();
    res.json(inserted[0]);
  });

  // Update
  app.put("/api/store-delivery/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const updates = { ...req.body, updatedAt: new Date() };
    await db
      .update(storeDeliveries)
      .set(updates)
      .where(eq(storeDeliveries.id, req.params.id));
    res.json({ success: true });
  });

  // Delete
  app.delete("/api/store-delivery/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    await db
      .delete(storeDeliveries)
      .where(eq(storeDeliveries.id, req.params.id));
    res.json({ success: true });
  });

  // Shipping Rates

  app.get("/api/shipping-rates", async (req, res) => {
    const rates = await storage.getShippingRates();
    res.json(rates);
  });

  app.post("/api/shipping-rates", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const rate = await storage.createShippingRate(req.body);
    res.json(rate);
  });

  app.put("/api/shipping-rates/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.updateShippingRate(req.params.id, req.body);
    res.json({ success: true });
  });

  app.delete("/api/shipping-rates/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteShippingRate(req.params.id);
    res.json({ success: true });
  });

  // Config
  app.get("/api/shipping-config", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const config = await storage.getShippingConfig(req.user.id);
    res.json(config);
  });

  app.put("/api/shipping-config", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    const existing = await storage.getShippingConfig(req.user.id);

    if (!existing || existing.length === 0) {
      const config = await storage.createShippingConfig(req.user.id, req.body);
      res.json(config);
    } else {
      await storage.updateShippingConfig(req.user.id, req.body);
      res.json({ success: true });
    }
  });

  // Shipping Zones

  app.get("/api/zones", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const zones = await storage.getZonesByShop(req.user.id);
    res.json(zones);
  });

  // Get single zone with carriers
  app.get("/api/zones/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const zone = await storage.getZoneWithCarriers(req.params.id);
    res.json(zone?.[0] ?? null);
  });

  // Create zone
  app.post("/api/zones", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const created = await storage.createZone(req.user.id, req.body);
    res.json(created);
  });

  // Update zone (also updates zoneCarriers)
  app.put("/api/zones/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.updateZone(req.params.id, req.body);
    res.json({ success: true });
  });

  // Delete zone
  app.delete("/api/zones/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteZone(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/shipping/options-by-city", async (req, res) => {
    try {
      const { city } = req.query;
      if (!city || typeof city !== "string") {
        return res.status(400).json({ error: "City is required" });
      }

      const zones = await db
        .select()
        .from(shippingZones)
        .where(
          sql`${shippingZones.cities} @> ${sql.raw(`'["${city}"]'::jsonb`)}`
        );

      if (!zones || zones.length === 0) {
        return res.json({ options: [] });
      }

      const zoneIds = zones.map((z) => z.id);

      const allOptions = await db
        .select({
          zoneId: shippingZoneCarriers.zoneId,
          carrierId: carriers.id,
          carrierName: carriers.name,
          price: shippingZoneCarriers.price,
          deliveryTime: shippingZoneCarriers.deliveryTime,
        })
        .from(shippingZoneCarriers)
        .innerJoin(carriers, eq(carriers.id, shippingZoneCarriers.carrierId))
        .where(inArray(shippingZoneCarriers.zoneId, zoneIds));

      const uniqueOptions = Object.values(
        allOptions.reduce((acc, opt) => {
          if (!acc[opt.carrierId]) acc[opt.carrierId] = opt;
          return acc;
        }, {} as Record<string, (typeof allOptions)[number]>)
      );

      res.json({ options: uniqueOptions });
    } catch (error) {
      console.error("Error fetching shipping options:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // // Get all zones for seller
  // app.get("/api/shipping/zones", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "seller")
  //     return res.sendStatus(401);

  //   const zones = await storage.getShippingZonesBySeller(req.user.id);
  //   res.json(zones);
  // });

  // // Create zone
  // app.post("/api/shipping/zones", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "seller")
  //     return res.sendStatus(401);

  //   const { zoneName } = req.body;
  //   const newZone = await storage.createShippingZone(req.user.id, zoneName);
  //   res.json(newZone);
  // });

  // // Delete zone
  // app.delete("/api/shipping/zones/:id", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "seller")
  //     return res.sendStatus(401);

  //   const { id } = req.params;
  //   await storage.deleteShippingZone(req.user.id, id);
  //   res.json({ success: true });
  // });

  // app.get("/api/shipping/zones/:zoneId/methods", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "seller")
  //     return res.sendStatus(401);

  //   const { zoneId } = req.params;
  //   const methods = await storage.getShippingMethods(zoneId);
  //   res.json(methods);
  // });

  // app.post("/api/shipping/zones/:zoneId/methods", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "seller")
  //     return res.sendStatus(401);

  //   const { zoneId } = req.params;
  //   const { methodName, price, estimatedDays, carrierId } = req.body;
  //   const method = await storage.createShippingMethod(zoneId, {
  //     methodName,
  //     price,
  //     estimatedDays,
  //     carrierId,
  //   });
  //   res.json(method);
  // });

  // app.get("/api/admin/carriers", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "admin")
  //     return res.sendStatus(401);

  //   const carriersList = await storage.getCarriers();
  //   res.json(carriersList);
  // });

  // app.post("/api/admin/carriers", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "admin")
  //     return res.sendStatus(401);

  //   const { name, trackingUrl } = req.body;
  //   const carrier = await storage.createCarrier(name, trackingUrl);
  //   res.json(carrier);
  // });

  // app.post("/api/orders/:id/shipments", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "seller")
  //     return res.sendStatus(401);

  //   const { id } = req.params;
  //   const { methodId, trackingNumber, labelUrl } = req.body;
  //   const shipment = await storage.createShipment(id, {
  //     methodId,
  //     trackingNumber,
  //     labelUrl,
  //   });
  //   res.json(shipment);
  // });

  // Stock Alerts API

  app.get("/api/stock-alerts", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller")
      return res.sendStatus(401);
    const alerts = await storage.getStockAlertsBySellerId(
      req.user.id,
      req.user.preferredLanguage ?? "en"
    );
    res.json(alerts);
  });

  // Resolve single alert
  app.post("/api/stock-alerts/:id/resolve", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller")
      return res.sendStatus(401);
    const { id } = req.params;

    await db
      .update(stockAlerts)
      .set({
        status: "resolved",
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
      })
      .where(eq(stockAlerts.id, id));
    res.json({ success: true });
  });

  app.delete("/api/stock-alerts/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;

      await db
        .delete(stockAlerts)
        .where(
          and(eq(stockAlerts.id, id), eq(stockAlerts.sellerId, req.user.id))
        );

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting stock alert:", error);
      res.status(500).json({ error: "Failed to delete stock alert" });
    }
  });

  // Replenishment API

  app.get("/api/replenishment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      if (req.user?.role !== "seller") {
        return res
          .status(403)
          .json({ error: "Only sellers can view replenishment" });
      }

      const products = await storage.getReplenishmentBySellerId(req.user.id);

      res.json(products);
    } catch (error) {
      console.error("Error fetching replenishment:", error);
      res.status(500).json({ error: "Failed to fetch replenishment" });
    }
  });

  app.post("/api/replenishment/order", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const { productIds } = req.body;
      if (!productIds || !Array.isArray(productIds)) {
        return res.status(400).json({ error: "Invalid productIds" });
      }
      await db
        .update(products)
        .set({ replenishmentStatus: "order" })
        .where(
          and(
            eq(products.vendorId, req.user.id),
            inArray(products.id, productIds)
          )
        );

      res.json({ success: true });
    } catch (error) {
      console.error("Error creating replenishment order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/replenishment/:id/reStock", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.id;
      if (!productId) {
        return res.status(400).json({ error: "Invalid productId" });
      }

      const [item] = await db
        .select({
          id: products.id,
          stock: products.stock,
          suggestedQuantity: products.suggestedQuantity,
        })
        .from(products)
        .where(
          and(eq(products.vendorId, req.user.id), eq(products.id, productId))
        );

      if (!item) {
        return res.status(404).json({ error: "Product not found" });
      }

      const newStock = Number(item.stock) + Number(item.suggestedQuantity);

      await db
        .update(products)
        .set({ stock: newStock, replenishmentStatus: "restocked" })
        .where(eq(products.id, item.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error creating replenishment order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Orders API
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      let orders;
      if (req.user?.role === "seller") {
        orders = await storage.getOrdersByVendorId(req.user.id);
      } else if (req.user?.role === "admin") {
        orders = await storage.getAllOrders();
      } else {
        orders = await storage.getOrdersByUserId(req.user.id);
      }
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const orderId = req.params.id;

    try {
      const order = await storage.getOrderWithItems(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  // Checkout API - creates order from cart
  // app.post("/api/checkout", async (req, res) => {
  //   if (!req.isAuthenticated()) {
  //     return res.sendStatus(401);
  //   }

  //   try {
  //     const { shippingAddress, paymentMethod } = req.body;

  //     // Get user's cart items
  //     const cartItems = await storage.getUserCart(req.user!.id);
  //     if (cartItems.length === 0) {
  //       return res.status(400).json({ error: "Cart is empty" });
  //     }

  //     // Calculate total amount
  //     const totalAmount = cartItems.reduce(
  //       (total, item) => total + (item.price * item.quantity),
  //       0
  //     );

  //     // Get vendor name from first item (assuming single vendor for now)
  //     const vendorName = cartItems[0]?.brand || "Unknown Store";

  //     // Create order
  //     const order = await storage.createOrder({
  //       userId: req.user!.id,
  //       totalAmount: totalAmount.toString(),
  //       status: "pending",
  //       paymentStatus: "pending",
  //       paymentMethod,
  //       shippingAddress,
  //       vendorName,
  //       itemCount: cartItems.length,
  //       trackingNumber: `TRK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
  //     });

  //     // Add order items from cart
  //     for (const item of cartItems) {
  //       await storage.createOrderItem({
  //         orderId: order.id,
  //         productId: item.productId,
  //         quantity: item.quantity,
  //         unitPrice: item.price.toString(),
  //         totalPrice: (item.price * item.quantity).toString(),
  //       });

  //       // Notify seller about new order
  //       await createNotification({
  //         userId: item.vendorId,
  //         type: "new_order",
  //         title: "New Order Received",
  //         message: `You have a new order #${order.orderNumber} for ${item.quantity}x ${item.name}`,
  //         data: {
  //           orderId: order.id,
  //           orderNumber: order.orderNumber,
  //           productId: item.productId,
  //           productName: item.name,
  //           quantity: item.quantity,
  //           customerName: `${req.user!.firstName} ${req.user!.lastName}`,
  //         },
  //         isRead: false,
  //       });
  //     }

  //     // Clear user's cart
  //     await storage.clearCart(req.user!.id);

  //     // Notify customer about order confirmation
  //     await createNotification({
  //       userId: req.user!.id,
  //       type: "order_confirmation",
  //       title: "Order Confirmed",
  //       message: `Your order #${order.orderNumber} has been confirmed and is being processed`,
  //       data: {
  //         orderId: order.id,
  //         orderNumber: order.orderNumber,
  //         totalAmount,
  //         itemCount: cartItems.length,
  //       },
  //       isRead: false,
  //     });

  //     res.status(201).json({ success: true, order });
  //   } catch (error) {
  //     console.error("Error processing checkout:", error);
  //     res.status(500).json({ error: "Failed to process checkout" });
  //   }
  // });

  app.get("/api/seller/transactions", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const sellerId = req.user.id;
      const list = await storage.getSellerTransactions(sellerId);
      res.json(list);
    } catch (error) {
      console.error("Error fetching seller transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.get("/api/seller/revenue", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "seller") {
      return res.sendStatus(401);
    }

    try {
      const sellerId = req.user.id;

      // Fetch completed transactions for this seller
      const rows = await db
        .select({
          transactionId: transactions.id,
          orderId: transactions.orderId,
          amount: transactions.amount,
          currency: transactions.currency,
          status: transactions.status,
          paymentMethod: transactions.paymentMethod,
          createdAt: transactions.createdAt,
          customerName: orders.customerName,
          customerEmail: orders.customerEmail,
          orderNumber: orders.orderNumber,
        })
        .from(transactions)
        .innerJoin(orders, eq(transactions.orderId, orders.id))
        .where(
          and(
            eq(transactions.sellerId, sellerId),
            eq(transactions.status, "completed")
          )
        )
        .orderBy(desc(transactions.createdAt));

      const totalRevenue = rows.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0
      );

      res.json({
        totalRevenue: totalRevenue.toFixed(2),
        currency: rows[0]?.currency || "usd",
        revenue: rows,
      });
    } catch (error) {
      console.error("Error fetching revenue:", error);
      res.status(500).json({ error: "Failed to fetch revenue" });
    }
  });

  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  //   apiVersion: "2025-08-27.basil",
  // });

  // app.post("/api/checkout/payment", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "client") {
  //     return res.sendStatus(401);
  //   }

  //   const checkoutSchema = z.object({
  //     cartItems: z.array(
  //       z.object({
  //         productId: z.string(),
  //         quantity: z.number().min(1),
  //         price: z.string(),
  //       })
  //     ),
  //     shippingAddress: z.object({
  //       fullName: z.string(),
  //       phone: z.string(),
  //       street: z.string(),
  //       city: z.string(),
  //       state: z.string(),
  //       zipCode: z.string(),
  //       email: z.string().email(),
  //     }),
  //     amount: z.number().min(1),
  //     currency: z.string().default("usd"),
  //   });

  //   try {
  //     console.log("🚀 Server: POST /api/checkout/payment - body:", req.body);

  //     const data = checkoutSchema.parse(req.body);
  //     console.log("✅ Validation passed:", data);

  //     if (!db) {
  //       return res.status(500).json({ error: "Database not available" });
  //     }

  //     // 1. Fetch vendorId for all cart items
  //     const productIds = data.cartItems.map((i) => i.productId);

  //     const productVendors = await db
  //       .select({
  //         id: products.id,
  //         vendorId: products.vendorId,
  //       })
  //       .from(products)
  //       .where(inArray(products.id, productIds));

  //     const vendorMap = Object.fromEntries(
  //       productVendors.map((p) => [p.id, p.vendorId])
  //     );

  //     // 2. Enrich cart items with vendorId
  //     const enrichedCartItems = data.cartItems.map((item) => ({
  //       ...item,
  //       vendorId: vendorMap[item.productId],
  //     }));

  //     // 3. Create Stripe PaymentIntent
  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: Math.round(data.amount * 100),
  //       currency: data.currency,
  //       description: `Order for ${data.shippingAddress.fullName}`,
  //       payment_method_types: ["card"],
  //       receipt_email: data.shippingAddress.email,
  //       shipping: {
  //         name: data.shippingAddress.fullName,
  //         phone: data.shippingAddress.phone,
  //         address: {
  //           line1: data.shippingAddress.street,
  //           city: data.shippingAddress.city,
  //           state: data.shippingAddress.state,
  //           postal_code: data.shippingAddress.zipCode,
  //         },
  //       },
  //     });

  //     const createdAt = new Date();
  //     const deliveryDate = new Date();
  //     deliveryDate.setDate(createdAt.getDate() + 7);

  //     // 4. Insert "pending" order
  //     const [newOrder] = await db
  //       .insert(orders)
  //       .values({
  //         orderNumber: `ORD-${Date.now()}`,
  //         userId: String(req.user.id),
  //         customerName: data.shippingAddress.fullName,
  //         customerEmail: data.shippingAddress.email,
  //         customerPhone: data.shippingAddress.phone,
  //         totalAmount: String(data.amount),
  //         currency: data.currency,
  //         status: "pending",
  //         paymentIntentId: paymentIntent.id,
  //         shippingAddress: {
  //           ...data.shippingAddress,
  //           country: data.shippingAddress.state,
  //         },
  //         createdAt,
  //         deliveryDate,
  //       })
  //       .returning();

  //     // 5. Create one transaction per seller
  //     const sellerTotals = enrichedCartItems.reduce((acc, item) => {
  //       acc[item.vendorId] =
  //         (acc[item.vendorId] || 0) + item.quantity * parseFloat(item.price);
  //       return acc;
  //     }, {} as Record<string, number>);

  //     for (const [sellerId, amount] of Object.entries(sellerTotals)) {
  //       await db.insert(transactions).values({
  //         orderId: newOrder.id,
  //         sellerId,
  //         amount: amount.toFixed(2),
  //         currency: data.currency,
  //         status: "pending",
  //         paymentMethod: "card",
  //       });
  //     }

  //     // 6. Insert order items
  //     if (enrichedCartItems.length > 0) {
  //       await db.insert(orderItems).values(
  //         enrichedCartItems.map((item) => ({
  //           orderId: newOrder.id,
  //           productId: item.productId,
  //           quantity: item.quantity,
  //           unitPrice: item.price,
  //           totalPrice: (item.quantity * parseFloat(item.price)).toString(),
  //         }))
  //       );
  //     }

  //     // 7. Decrease stock
  //     for (const item of enrichedCartItems) {
  //       await db
  //         .update(products)
  //         .set({
  //           stock: sql`${products.stock} - ${item.quantity}`,
  //         })
  //         .where(eq(products.id, item.productId));
  //     }

  //     res.status(201).json({
  //       clientSecret: paymentIntent.client_secret,
  //       orderId: newOrder.id,
  //     });
  //   } catch (error) {
  //     console.error("❌ Error in /api/checkout/payment:", error);
  //     if (error instanceof z.ZodError) {
  //       return res.status(400).json({
  //         error: "Invalid data",
  //         details: error.errors,
  //       });
  //     }
  //     res.status(500).json({ error: "Payment failed" });
  //   }
  // });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-08-27.basil",
  });

  app.use(
    createStripePaymentRouter({
      stripe,
      // webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      // dbClient: db,
    })
  );
  // app.post("/api/checkout/payment", async (req, res) => {
  //   console.log("💳 PaymentIntent request received", new Date().toISOString());
  //   if (!req.isAuthenticated() || req.user?.role !== "client") {
  //     return res.sendStatus(401);
  //   }

  //   const checkoutSchema = z.object({
  //     cartItems: z.array(
  //       z.object({
  //         productId: z.string(),
  //         quantity: z.number().min(1),
  //         price: z.string(),
  //       })
  //     ),
  //     shippingAddress: z.object({
  //       fullName: z.string(),
  //       phone: z.string(),
  //       street: z.string(),
  //       city: z.string(),
  //       state: z.string(),
  //       zipCode: z.string(),
  //       email: z.string().email(),
  //     }),
  //     amount: z.number().min(1),
  //     currency: z.string().default("usd"),
  //   });

  //   try {
  //     console.log("🚀 Server: POST /api/checkout/payment - body:", req.body);

  //     const data = checkoutSchema.parse(req.body);
  //     console.log("✅ Validation passed:", data);

  //     if (!db) {
  //       return res.status(500).json({ error: "Database not available" });
  //     }

  //     // 1. Fetch vendorId for all cart items
  //     const productIds = data.cartItems.map((i) => i.productId);

  //     const productVendors = await db
  //       .select({
  //         id: products.id,
  //         vendorId: products.vendorId,
  //       })
  //       .from(products)
  //       .where(inArray(products.id, productIds));

  //     const vendorMap = Object.fromEntries(
  //       productVendors.map((p) => [p.id, p.vendorId])
  //     );

  //     // 2. Enrich cart items with vendorId
  //     const enrichedCartItems = data.cartItems.map((item) => ({
  //       ...item,
  //       vendorId: vendorMap[item.productId],
  //     }));

  //     // 3. Create Stripe PaymentIntent
  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: Math.round(data.amount * 100),
  //       currency: data.currency,
  //       description: `Order for ${data.shippingAddress.fullName}`,
  //       payment_method_types: ["card"],
  //       receipt_email: data.shippingAddress.email,
  //       shipping: {
  //         name: data.shippingAddress.fullName,
  //         phone: data.shippingAddress.phone,
  //         address: {
  //           line1: data.shippingAddress.street,
  //           city: data.shippingAddress.city,
  //           state: data.shippingAddress.state,
  //           postal_code: data.shippingAddress.zipCode,
  //         },
  //       },
  //     });

  //     const createdAt = new Date();
  //     const deliveryDate = new Date();
  //     deliveryDate.setDate(createdAt.getDate() + 7);

  //     // 4. Insert "pending" order
  //     const [newOrder] = await db
  //       .insert(orders)
  //       .values({
  //         orderNumber: `ORD-${Date.now()}`,
  //         userId: String(req.user.id),
  //         customerName: data.shippingAddress.fullName,
  //         customerEmail: data.shippingAddress.email,
  //         customerPhone: data.shippingAddress.phone,
  //         totalAmount: String(data.amount),
  //         currency: data.currency,
  //         status: "pending",
  //         paymentIntentId: paymentIntent.id,
  //         shippingAddress: {
  //           ...data.shippingAddress,
  //           country: data.shippingAddress.state,
  //         },
  //         createdAt,
  //         deliveryDate,
  //       })
  //       .returning();

  //     // 5. Create one transaction per seller
  //     const sellerTotals = enrichedCartItems.reduce((acc, item) => {
  //       acc[item.vendorId] =
  //         (acc[item.vendorId] || 0) + item.quantity * parseFloat(item.price);
  //       return acc;
  //     }, {} as Record<string, number>);

  //     for (const [sellerId, amount] of Object.entries(sellerTotals)) {
  //       await db.insert(transactions).values({
  //         orderId: newOrder.id,
  //         sellerId,
  //         amount: amount.toFixed(2),
  //         currency: data.currency,
  //         status: paymentIntent.status,
  //         paymentMethod: "card",
  //       });
  //     }

  //     // 6. Insert order items
  //     if (enrichedCartItems.length > 0) {
  //       await db.insert(orderItems).values(
  //         enrichedCartItems.map((item) => ({
  //           orderId: newOrder.id,
  //           productId: item.productId,
  //           quantity: item.quantity,
  //           unitPrice: item.price,
  //           totalPrice: (item.quantity * parseFloat(item.price)).toString(),
  //         }))
  //       );
  //     }

  //     // 7. Decrease stock
  //     for (const item of enrichedCartItems) {
  //       await db
  //         .update(products)
  //         .set({
  //           stock: sql`${products.stock} - ${item.quantity}`,
  //         })
  //         .where(eq(products.id, item.productId));
  //     }

  //     // 8. Remove purchased items from cart
  //     await db
  //       .delete(carts)
  //       .where(
  //         and(
  //           eq(carts.userId, String(req.user.id)),
  //           inArray(carts.productId, productIds)
  //         )
  //       );

  //     res.status(201).json({
  //       clientSecret: paymentIntent.client_secret,
  //       orderId: newOrder.id,
  //     });
  //   } catch (error) {
  //     console.error("❌ Error in /api/checkout/payment:", error);
  //     if (error instanceof z.ZodError) {
  //       return res.status(400).json({
  //         error: "Invalid data",
  //         details: error.errors,
  //       });
  //     }
  //     res.status(500).json({ error: "Payment failed" });
  //   }
  // });

  // app.post("/api/checkout/payment", async (req, res) => {
  //   if (!req.isAuthenticated() || req.user?.role !== "client") {
  //     return res.sendStatus(401);
  //   }

  //   const checkoutSchema = z.object({
  //     cartItems: z.array(
  //       z.object({
  //         productId: z.string(),
  //         quantity: z.number().min(1),
  //         price: z.string(),
  //         vendorId: z.string(),
  //       })
  //     ),
  //     shippingAddress: z.object({
  //       fullName: z.string(),
  //       phone: z.string(),
  //       street: z.string(),
  //       city: z.string(),
  //       state: z.string(),
  //       zipCode: z.string(),
  //       // country: z.string(),
  //       email: z.string().email(),
  //     }),
  //     amount: z.number().min(1),
  //     currency: z.string().default("usd"),
  //   });

  //   try {
  //     console.log("🚀 Server: POST /api/checkout/payment - body:", req.body);

  //     const data = checkoutSchema.parse(req.body);
  //     console.log("✅ Validation passed:", data);

  //     if (!db) {
  //       return res.status(500).json({ error: "Database not available" });
  //     }

  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount: Math.round(data.amount * 100),
  //       currency: data.currency,
  //       description: `Order for ${data.shippingAddress.fullName}`,
  //       payment_method_types: ["card"],
  //       receipt_email: data.shippingAddress.email, // required for invoice/export rules
  //       shipping: {
  //         name: data.shippingAddress.fullName,
  //         phone: data.shippingAddress.phone,
  //         address: {
  //           line1: data.shippingAddress.street,
  //           city: data.shippingAddress.city,
  //           state: data.shippingAddress.state,
  //           postal_code: data.shippingAddress.zipCode,
  //           // country: data.shippingAddress.country, // also needed here
  //         },
  //       },
  //     });

  //     // 2. Insert "pending" order into DB
  //     const [newOrder] = await db
  //       .insert(orders)
  //       .values({
  //         orderNumber: `ORD-${Date.now()}`, // Generate a unique order number
  //         userId: String(req.user.id), // Ensure userId is a string
  //         customerName: data.shippingAddress.fullName,
  //         customerEmail: data.shippingAddress.email,
  //         customerPhone: data.shippingAddress.phone,
  //         // Add customer phone (optional)
  //         totalAmount: String(data.amount), // Convert totalAmount to string if required
  //         currency: data.currency,
  //         status: "pending",
  //         paymentIntentId: paymentIntent.id,
  //         shippingAddress: {
  //           ...data.shippingAddress,
  //           country: data.shippingAddress.state, // Replace "US" with the appropriate default or dynamic value
  //         },
  //       })
  //       .returning()
  //       .then(
  //         (result) =>
  //           result.map((item) => ({
  //             ...item,
  //             totalAmount: Number(item.totalAmount),
  //           })) as {
  //             id: string;
  //             userId: string;
  //             totalAmount: number;
  //             currency: string;
  //             status: string;
  //             paymentIntentId: string;
  //             shippingAddress: any;
  //           }[]
  //       );
  //     // After inserting newOrder
  //     const sellerTotals = data.cartItems.reduce((acc, item) => {
  //       acc[item.vendorId] =
  //         (acc[item.vendorId] || 0) + item.quantity * parseFloat(item.price);
  //       return acc;
  //     }, {} as Record<string, number>);

  //     for (const [sellerId, amount] of Object.entries(sellerTotals)) {
  //       await db.insert(transactions).values({
  //         orderId: newOrder.id,
  //         sellerId,
  //         amount: amount.toFixed(2),
  //         currency: data.currency,
  //         status: "pending",
  //         paymentMethod: "card",
  //       });
  //     }

  //     // 3. Insert order items
  //     if (data.cartItems.length > 0) {
  //       await db.insert(orderItems).values(
  //         data.cartItems.map((item) => ({
  //           orderId: newOrder.id,
  //           productId: item.productId,
  //           quantity: item.quantity,
  //           unitPrice: item.price,
  //           totalPrice: (item.quantity * parseFloat(item.price)).toString(),
  //         }))
  //       );
  //     }

  //     // 4. Decrease stock from products table
  //     for (const item of data.cartItems) {
  //       await db
  //         .update(products)
  //         .set({
  //           stock: sql`${products.stock} - ${item.quantity}`,
  //         })
  //         .where(eq(products.id, item.productId));
  //     }

  //     res.status(201).json({
  //       clientSecret: paymentIntent.client_secret,
  //       orderId: newOrder.id,
  //     });
  //   } catch (error) {
  //     console.error("❌ Error in /api/checkout/payment:", error);
  //     if (error instanceof z.ZodError) {
  //       return res.status(400).json({
  //         error: "Invalid data",
  //         details: error.errors,
  //       });
  //     }
  //     res.status(500).json({ error: "Payment failed" });
  //   }
  // });

  app.post("/api/checkout", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { shippingAddress, paymentMethod } = req.body;

      // Get user's cart items
      const cartItems = await storage.getUserCart(req.user!.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      // Get vendor name from first item (assuming single vendor for now)
      const vendorName = cartItems[0]?.brand || "Unknown Store";
      const createdAt = new Date();
      const deliveryDate = new Date();
      deliveryDate.setDate(createdAt.getDate() + 7);
      // Create order
      const order = await storage.createOrder({
        userId: req.user!.id,
        customerName: shippingAddress.fullName,
        customerEmail: shippingAddress.email,
        customerPhone: shippingAddress.phone || "N/A",
        totalAmount: totalAmount.toString(),
        status: "pending",
        paymentStatus: "pending",
        paymentMethod,
        shippingAddress,
        vendorName,
        itemCount: cartItems.length,
        trackingNumber: `TRK-${Math.random()
          .toString(36)
          .substr(2, 8)
          .toUpperCase()}`,
        deliveryDate,
      });

      // After creating the order
      await storage.createTransaction({
        orderId: order.id,
        sellerId: cartItems[0]?.vendorId || "",
        amount: totalAmount.toString(),
        currency: "usd",
        status: "pending",
        paymentMethod,
      });

      // Add order items from cart
      for (const item of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price.toString(),
          totalPrice: (item.price * item.quantity).toString(),
        });

        // Notify seller about new order
        await createNotification({
          userId: item.vendorId,
          type: "new_order",
          title: "New Order Received",
          message: `You have a new order #${order.orderNumber} for ${item.quantity}x ${item.name}`,
          data: {
            orderId: [order.id],
            orderNumber: [order.orderNumber],
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            customerName: [`${req.user!.firstName} ${req.user!.lastName}`],
          },
          isRead: false,
        });
      }

      // Clear user's cart
      await storage.clearCart(req.user!.id);

      // Notify customer about order confirmation
      await createNotification({
        userId: req.user!.id,
        type: "order_confirmation",
        title: "Order Confirmed",
        message: `Your order #${order.orderNumber} has been confirmed and is being processed`,
        data: {
          orderId: [order.id],
          orderNumber: [order.orderNumber],
          totalAmount,
          itemCount: [cartItems.length],
        },
        isRead: false,
      });

      res.status(201).json({ success: true, order });
    } catch (error) {
      console.error("Error processing checkout:", error);
      res.status(500).json({ error: "Failed to process checkout" });
    }
  });

  // Create order API
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const { items, shippingAddress, totalAmount } = req.body;

      // Create order
      const order = await storage.createOrder({
        userId: req.user!.id,
        totalAmount,
        status: "pending",
        shippingAddress,
      });

      // Add order items
      for (const item of items) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });

        // Get product details to notify seller
        const product = await storage.getProductWithTranslations(
          item.productId,
          "en"
        );
        if (product) {
          // Notify seller about new order
          await createNotification({
            userId: product.vendorId,
            type: "new_order",
            title: "New Order Received",
            message: `You have a new order for ${item.quantity}x ${product.name}`,
            data: {
              orderId: order.id,
              productId: item.productId,
              productName: product.name,
              quantity: item.quantity,
              customerName: `${req.user!.firstName} ${req.user!.lastName}`,
            },
            isRead: false,
          });
        }
      }

      // Notify customer about order confirmation
      await createNotification({
        userId: req.user!.id,
        type: "order_confirmation",
        title: "Order Confirmed",
        message: `Your order #${order.id.slice(
          -8
        )} has been confirmed and is being processed`,
        data: {
          orderId: order.id,
          totalAmount,
          itemCount: items.length,
        },
        isRead: false,
      });

      res.status(201).json({ success: true, order });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Update order status API (for sellers/admins)
  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { status } = req.body;
    const orderId = req.params.id;

    try {
      const order = await storage.getOrderWithItems(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update order status
      await storage.updateOrderStatus(orderId, status);

      // Notify customer about status change
      const statusMessages = {
        processing: "Your order is now being processed",
        shipped: "Your order has been shipped! Track your package",
        delivered: "Your order has been delivered. Thank you for shopping!",
        cancelled: "Your order has been cancelled",
      };

      await createNotification({
        userId: order.userId,
        type: "order_status_update",
        title: "Order Status Update",
        message: `Order #${orderId.slice(-8)}: ${
          statusMessages[status] || "Status updated"
        }`,
        data: {
          orderId: orderId,
          newStatus: status,
          orderTotal: order.totalAmount,
        },
        isRead: false,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Create offer/promotion API (for admins)
  app.post("/api/offers", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(403);
    }

    const { title, description, discountPercentage, expiresAt, targetUsers } =
      req.body;

    try {
      // Determine which users to notify
      let userIds = [];
      if (targetUsers === "all") {
        const allUsers = await storage.getAllUsers();
        userIds = allUsers.filter((u) => u.role === "client").map((u) => u.id);
      } else if (Array.isArray(targetUsers)) {
        userIds = targetUsers;
      }

      // Create notifications for targeted users
      for (const userId of userIds) {
        await createNotification({
          userId: userId,
          type: "offer",
          title: "Special Offer!",
          message: `${title} - ${discountPercentage}% off! ${description}`,
          data: {
            offerTitle: title,
            description,
            discountPercentage,
            expiresAt,
            offerCode: `SAVE${discountPercentage}`,
          },
          isRead: false,
        });
      }

      res.json({
        success: true,
        message: `Offer sent to ${userIds.length} users`,
        notificationsSent: userIds.length,
      });
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ error: "Failed to create offer" });
    }
  });

  // Notifications API
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(
          req.user?.role === "admin"
            ? isNull(notifications.userId)
            : eq(notifications.userId, req.user!.id)
        )
        .orderBy(desc(notifications.createdAt))
        .limit(50);

      res.json(userNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: "Failed to update notification" });
    }
  });

  app.delete("/api/notifications/:id/delete", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      await db.delete(notifications).where(eq(notifications.id, req.params.id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: "Failed to delete notification" });
    }
  });

  // Seller approval/rejection by admin
  app.patch("/api/users/:id/seller-status", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(403);
    }

    const { status } = req.body; // approved, rejected, pending
    const userId = req.params.id;

    try {
      // Update seller status
      const [updatedUser] = await db
        .update(users)
        .set({ sellerStatus: status })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create notification for the seller
      const notificationMessage =
        status === "approved"
          ? "Congratulations! Your seller account has been approved. You can now start selling."
          : status === "rejected"
          ? "Your seller application has been rejected. Please contact support for more information."
          : "Your seller application is under review.";

      await createNotification({
        userId: updatedUser.id,
        type: `seller_${status}`,
        title:
          status === "approved"
            ? "Seller Account Approved"
            : status === "rejected"
            ? "Seller Application Rejected"
            : "Seller Application Updated",
        message: notificationMessage,
        data: { sellerStatus: status, adminId: req.user.id },
        isRead: false,
      });

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating seller status:", error);
      res.status(500).json({ error: "Failed to update seller status" });
    }
  });

  // Wishlist API endpoints
  app.get("/api/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const wishlistItems = await storage.getUserWishlist(req.user!.id);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ error: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.productId;
      const wishlistItem = await storage.addToWishlist(req.user!.id, productId);
      res.json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(500).json({ error: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.productId;
      const success = await storage.removeFromWishlist(req.user!.id, productId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ error: "Failed to remove from wishlist" });
    }
  });

  app.get("/api/wishlist/:productId/check", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ inWishlist: false });
    }

    try {
      const productId = req.params.productId;
      const inWishlist = await storage.isProductInWishlist(
        req.user!.id,
        productId
      );
      res.json({ inWishlist });
    } catch (error) {
      console.error("Error checking wishlist:", error);
      res.json({ inWishlist: false });
    }
  });

  // Cart API endpoints
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const cartItems = await storage.getUserCart(req.user!.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.get("/api/cart/count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ count: 0 });
    }

    try {
      const count = await storage.getCartItemCount(req.user!.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching cart count:", error);
      res.json({ count: 0 });
    }
  });

  app.post("/api/cart/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.productId;
      const { quantity = 1 } = req.body;
      const cartItem = await storage.addToCart(
        req.user!.id,
        productId,
        quantity
      );
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add to cart" });
    }
  });

  app.patch("/api/cart/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.productId;
      const { quantity } = req.body;
      const success = await storage.updateCartQuantity(
        req.user!.id,
        productId,
        quantity
      );
      res.json({ success });
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      res.status(500).json({ error: "Failed to update cart quantity" });
    }
  });

  app.delete("/api/cart/:productId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const productId = req.params.productId;
      const success = await storage.removeFromCart(req.user!.id, productId);
      res.json({ success });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ error: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    try {
      const success = await storage.clearCart(req.user!.id);
      res.json({ success });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  app.post("/api/send-email", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { to, subject, text, html } = req.body;
    try {
      await emailService.sendEmail({ to, subject, text, html });
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });
  // Flag order for review, cancel it, and notify customer

  app.post("/api/orders/:orderId/flag", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }

    const { orderId } = req.params;
    const { reason, severity, description, freezeFunds, notifyTeam, escalate } =
      req.body;

    try {
      // 1. Update order status -> cancelled
      await db
        .update(orders)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // 2. Log the flag (optional: save in a separate table)
      // await db.insert(orderFlags).values({
      //   orderId,
      //   reason,
      //   severity,
      //   description,
      //   freezeFunds,
      //   notifyTeam,
      //   escalate,
      //   createdAt: new Date(),
      // });

      // 3. Fetch customer info
      const [order] = await db
        .select({
          email: users.email,
          orderNumber: orders.orderNumber,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(orders)
        .innerJoin(users, eq(users.id, orders.userId))
        .where(eq(orders.id, orderId));

      // 4. Send email to customer
      await emailService.sendEmail({
        to: order.email,
        subject: `Votre commande #${order.orderNumber} a été annulée`,
        html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color:#d9534f;">Commande annulée pour raisons de sécurité</h2>
          <p>Bonjour ${order.firstName || "client"},</p>
          <p>
            Nous vous informons que votre commande <strong>#${
              order.orderNumber
            }</strong> 
            a été annulée suite à une révision de sécurité.
          </p>

          <div style="background:#f8d7da; padding:12px; border-radius:8px; margin:15px 0;">
            <p><strong>Raison :</strong> ${reason}</p>
            <p><strong>Niveau :</strong> ${severity}</p>
            <p><strong>Détails :</strong> ${description}</p>
          </div>

          <p>
            Cette mesure vise à protéger nos clients contre d’éventuelles fraudes.
            Si vous pensez qu’il s’agit d’une erreur, veuillez contacter notre service client.
          </p>

          <p>Merci pour votre compréhension,</p>
          <p><strong>L’équipe Sécurité</strong></p>
        </div>
      `,
      });

      res.json({
        success: true,
        message: "Order flagged, cancelled, and email sent",
      });
    } catch (error) {
      console.error("Error flagging order:", error);
      res.status(500).json({ error: "Failed to flag order" });
    }
  });

  app.post("/api/orders/:orderId/cancel", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { orderId } = req.params;

    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      // Update order status
      await db
        .update(orders)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Fetch order and user info
      const [order] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerEmail: orders.customerEmail,
          email: users.email,
          customerName: orders.customerName,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, orderId));

      // Send email to customer
      if (order?.email) {
        await emailService.sendEmail({
          to: order.email,
          subject: `Confirmation d'annulation - Commande #${order.orderNumber}`,
          html: `
        <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
          <h2 style="color: #d9534f;">Votre commande a été annulée ❌</h2>
          <p>Bonjour ${order.customerName || "Cher client"},</p>
          <p>
            Nous vous confirmons que votre commande 
            <strong>#${order.orderNumber}</strong> a été annulée avec succès.
          </p>

          <p>Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre service client.</p>
          <p>Merci pour votre confiance et à bientôt !</p>

          <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 13px; color: #777;">
            Ceci est un email automatique, merci de ne pas y répondre directement. 
            Pour toute question, veuillez contacter notre service client.
          </p>
        </div>
      `,
        });
      }

      res.json({
        success: true,
        message: "Order cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({ error: "Failed to cancel order" });
    }
  });

  app.post("/api/orders/:orderId/refund", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { orderId } = req.params;
    const { type, amount, reason, restockItems, notifyCustomer, notes } =
      req.body;

    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }

      await db
        .update(orders)
        .set({
          status: "refunded",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // 2. Log the flag (optional: save in a separate table)
      // await db.insert(orderFlags).values({
      //   orderId,
      //   reason,
      //   severity,
      //   description,
      //   freezeFunds,
      //   notifyTeam,
      //   escalate,
      //   createdAt: new Date(),
      // });

      // 3. Fetch customer info
      const [order] = await db
        .select({
          email: users.email,
          orderNumber: orders.orderNumber,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(orders)
        .innerJoin(users, eq(users.id, orders.userId))
        .where(eq(orders.id, orderId));

      // 4. Send email to customer
      await emailService.sendEmail({
        to: order.email,
        subject: `Votre commande #${order.orderNumber} a été annulée`,
        html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color:#d9534f;">Commande annulée pour raisons de sécurité</h2>
          <p>Bonjour ${order.firstName || "client"},</p>
          <p>
            Nous vous informons que votre commande <strong>#${
              order.orderNumber
            }</strong> 
            a été annulée suite à une révision de sécurité.
          </p>

          <div style="background:#f8d7da; padding:12px; border-radius:8px; margin:15px 0;">
            <p><strong>Raison :</strong> ${reason}</p>
          </div>

          <p>
            Cette mesure vise à protéger nos clients contre d’éventuelles fraudes.
            Si vous pensez qu’il s’agit d’une erreur, veuillez contacter notre service client.
          </p>

          <p>Merci pour votre compréhension,</p>
          <p><strong>L’équipe Sécurité</strong></p>
        </div>
      `,
      });

      res.json({
        success: true,
        message: "Order flagged, cancelled, and email sent",
      });
    } catch (error) {
      console.error("Error flagging order:", error);
      res.status(500).json({ error: "Failed to flag order" });
    }
  });
  app.post("/api/orders/:orderId/ship", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const { orderId } = req.params;
    const { carrier, trackingNumber, estimatedDelivery, notes } = req.body;

    try {
      if (!db) {
        return res.status(500).json({ error: "Database not available" });
      }
      // Update order in DB
      await db
        .update(orders)
        .set({
          status: "shipped",
          // carrier,
          trackingNumber: trackingNumber,
          // deliveryDate: estimatedDelivery,
          // shippingNotes: notes,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Get order details for email
      const [order] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerEmail: orders.customerEmail,
          email: users.email,
          customerName: orders.customerName,
        })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, orderId));

      // Send email if customer email exists
      if (order?.email) {
        await emailService.sendEmail({
          to: order.email,
          subject: `Confirmation d'expédition - Commande #${order.orderNumber}`,
          html: `
    <div style="font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6;">
      <h2 style="color: #2a7ae4;">Votre commande a été expédiée ✅</h2>
      <p>Bonjour ${order.customerName || "Cher client"},</p>
      <p>
        Nous avons le plaisir de vous informer que votre commande 
        <strong>#${order.orderNumber}</strong> a été expédiée.
      </p>

      <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px;">
        <p style="margin: 0;"><strong>Transporteur :</strong> ${carrier}</p>
        <p style="margin: 0;"><strong>Numéro de suivi :</strong> ${trackingNumber}</p>
        <p style="margin: 0;"><strong>Date de livraison estimée :</strong> ${
          estimatedDelivery || "Non précisée"
        }</p>
        ${
          notes
            ? `<p style="margin: 0;"><strong>Instructions :</strong> ${notes}</p>`
            : ""
        }
      </div>

      <p>
        Vous pouvez suivre l’évolution de votre livraison grâce au numéro de suivi fourni par le transporteur.
      </p>

      <p>Merci pour votre confiance et à bientôt !</p>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 13px; color: #777;">
        Ceci est un email automatique, merci de ne pas y répondre directement. 
        Pour toute question, veuillez contacter notre service client.
      </p>
    </div>
  `,
        });
      }

      res.json({
        success: true,
        message: "Order shipped and customer notified",
      });
    } catch (error) {
      console.error("Error shipping order:", error);
      res.status(500).json({ error: "Failed to mark order as shipped" });
    }
  });

  app.get("/api/customers", async (req, res) => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        return res.sendStatus(401);
      }
      const customers = await storage.getCustomersWithVendors(vendorId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/seller/orders", async (req, res) => {
    try {
      const vendorId = req.user?.id;

      if (!vendorId) {
        return res.sendStatus(401);
      }

      const orders = await storage.getSellerOrders(vendorId);

      res.json(orders);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
      res.status(500).json({ error: "Failed to fetch seller orders" });
    }
  });

  // Routes for Packages
  app.get("/api/admin/packages", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.sendStatus(401);
      }

      const packages = await storage.getPackages();

      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ error: "Failed to fetch packages" });
    }
  });

  app.post("/api/admin/packages", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const createSchema = z.object({
      name: z.string().min(3, "Package name is required"),
      description: z.string().optional(),
      price: z.number().positive("Price must be greater than 0"),
      billing: z.enum(["monthly", "yearly"], {
        errorMap: () => ({ message: "Billing must be monthly or yearly" }),
      }),
      commission: z
        .number()
        .min(0)
        .max(100, "Commission must be between 0 and 100"),
      maxProducts: z.number().int().positive("Max products must be positive"),
      isActive: z.boolean().default(true),
    });

    try {
      const data = createSchema.parse(req.body);

      const [newPackage] = await db
        .insert(packages)
        .values({
          name: data.name,
          description: data.description ?? null,
          price: data.price,
          billing: data.billing,
          commission: data.commission,
          maxProducts: data.maxProducts,
          isActive: data.isActive,
          createdAt: new Date(),
        })
        .returning();

      res.status(201).json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create package" });
    }
  });

  app.put("/api/admin/packages/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const updateSchema = z.object({
      name: z.string().min(3).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      billing: z.enum(["monthly", "yearly"]).optional(),
      commission: z.number().min(0).max(100).optional(),
      maxProducts: z.number().int().positive().optional(),
      isActive: z.boolean().optional(),
    });

    try {
      const { id } = req.params;
      const data = updateSchema.parse(req.body);

      const updateData: any = { updatedAt: new Date() };
      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.billing !== undefined) updateData.billing = data.billing;
      if (data.commission !== undefined)
        updateData.commission = data.commission;
      if (data.maxProducts !== undefined)
        updateData.maxProducts = data.maxProducts;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const [updatedPackage] = await db
        .update(packages)
        .set(updateData)
        .where(eq(packages.id, id))
        .returning();

      if (!updatedPackage) {
        return res.status(404).json({ error: "Package not found" });
      }

      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update package" });
    }
  });

  app.delete("/api/admin/packages/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;
      const success = await storage.deletePackage(id);

      if (!success) {
        return res
          .status(404)
          .json({ error: "Package not found or already deleted" });
      }

      res.json({ success });
    } catch (error) {
      console.error("Error deleting package:", error);
      res.status(500).json({ error: "Failed to delete package" });
    }
  });

  // Routes for Promotions
  app.get("/api/admin/promotions", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin") {
        return res.sendStatus(401);
      }

      const promotions = await storage.getPromotions();

      res.json(promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.post("/api/admin/promotions", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const createSchema = z.object({
      promoCode: z.string().min(3, "Promo code is required"),
      discountType: z.enum(["percentage", "fixed"]),
      value: z.number().positive(),
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().transform((val) => new Date(val)),
      minimumPurchase: z.number().default(0),
      usageLimit: z.number().optional(),
      isActive: z.boolean().default(false),
    });

    try {
      const data = createSchema.parse(req.body);

      const [newPromotion] = await db
        .insert(promotions)
        .values({
          promoCode: data.promoCode,
          discountType: data.discountType,
          value: data.value,
          startDate: data.startDate,
          endDate: data.endDate,
          minimumPurchase: data.minimumPurchase,
          usageLimit: data.usageLimit ?? null,
          isActive: data.isActive,
          createdAt: new Date(),
        })
        .returning();

      res.status(201).json(newPromotion);
    } catch (error) {
      console.error("Error creating promotion:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create promotion" });
    }
  });

  app.put("/api/admin/promotions/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    const updateSchema = z.object({
      promoCode: z.string().optional(),
      discountType: z.enum(["percentage", "fixed"]).optional(),
      value: z.number().positive().optional(),
      startDate: z
        .string()
        .transform((val) => new Date(val))
        .optional(),
      endDate: z
        .string()
        .transform((val) => new Date(val))
        .optional(),
      minimumPurchase: z.number().optional(),
      usageLimit: z.number().optional(),
      isActive: z.boolean().optional(),
    });

    try {
      const { id } = req.params;
      const data = updateSchema.parse(req.body);

      const updateData: any = { updatedAt: new Date() };
      if (data.promoCode !== undefined) updateData.promoCode = data.promoCode;
      if (data.discountType !== undefined)
        updateData.discountType = data.discountType;
      if (data.value !== undefined) updateData.value = data.value;
      if (data.startDate !== undefined) updateData.startDate = data.startDate;
      if (data.endDate !== undefined) updateData.endDate = data.endDate;
      if (data.minimumPurchase !== undefined)
        updateData.minimumPurchase = data.minimumPurchase;
      if (data.usageLimit !== undefined)
        updateData.usageLimit = data.usageLimit;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      const [updatedPromotion] = await db
        .update(promotions)
        .set(updateData)
        .where(eq(promotions.id, id))
        .returning();

      if (!updatedPromotion) {
        return res.status(404).json({ error: "Promotion not found" });
      }

      res.json(updatedPromotion);
    } catch (error) {
      console.error("Error updating promotion:", error);
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update promotion" });
    }
  });

  app.delete("/api/admin/promotions/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { id } = req.params;
      const success = await storage.deletePromotion(id);

      if (!success) {
        return res
          .status(404)
          .json({ error: "Promotion not found or already deleted" });
      }

      res.json({ success });
    } catch (error) {
      console.error("Error deleting promotion:", error);
      res.status(500).json({ error: "Failed to delete promotion" });
    }
  });

  // get customer details base on customer id
  app.get("/api/customers/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    const customerId = req.params.id;

    try {
      const customer = await storage.getCustomerDetails(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  function safeLogout(req, res, next) {
    if (typeof req.logout === "function") {
      // Passport >=0.6 requires a callback
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
        }
        res.redirect("/auth");
      });
    } else {
      // fallback: just destroy session
      req.session.destroy(() => {
        res.redirect("/auth");
      });
    }
  }

  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);

    // If DB error, kill session and redirect to /auth
    if (
      String(err).includes("too many clients") ||
      String(err).includes("Failed to deserialize")
    ) {
      // req.logout(() => {
      //   res.redirect("/auth");
      // });
      return safeLogout(req, res, next);
      return;
    }

    res.status(500).json({ error: "Internal Server Error" });
  });

  // Create HTTP server and Socket.IO
  const httpServer = createServer(app);

  // Set up Socket.IO with CORS for development
  io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: true,
      credentials: true,
    },
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user to their personal room for targeted notifications
    socket.on("join-user-room", (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Join admins to admin room for admin notifications
    socket.on("join-admin-room", () => {
      socket.join("admin-room");
      console.log("User joined admin room");
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return httpServer;
}

// Notification helper functions
export async function createNotification(notification: InsertNotification) {
  try {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();

    // Emit to specific user or all admins
    if (notification.userId) {
      io.to(`user-${notification.userId}`).emit(
        "notification",
        newNotification
      );
    } else {
      // Global notification (for admins)
      io.to("admin-room").emit("notification", newNotification);
    }

    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export function getSocketIO() {
  return io;
}
