import { db } from "./db";
import {
  users,
  categories,
  categoryTranslations,
  products,
  productTranslations,
  orders,
  orderItems,
  stores,
} from "@shared/schema";
import { hashPassword } from "./auth";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if data already exists
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("📋 Database already has data, skipping seed.");
      return;
    }

    // 1. Create Users (Admin, Sellers, Clients)
    console.log("👥 Creating users...");

    // Admin
    const adminUser = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@devnaza.com",
        password: await hashPassword("admin123456"),
        firstName: "System",
        lastName: "Administrator",
        role: "admin",
        avatar:
          "https://ui-avatars.com/api/?name=System+Administrator&background=6366f1&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "en",
        sellerStatus: null,
      })
      .returning();

    // Sellers
    const sellerUser = await db
      .insert(users)
      .values({
        username: "techstore_seller",
        email: "seller@devnaza.com",
        password: await hashPassword("seller123456"),
        firstName: "Ahmed",
        lastName: "Benali",
        role: "seller",
        avatar:
          "https://ui-avatars.com/api/?name=Ahmed+Benali&background=10b981&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "en",
        sellerStatus: "approved",
      })
      .returning();
    await db.insert(stores).values({
      ownerId: sellerUser[0].id,
      storeName: "Tech Store",
      codeStore: "TECH001",
      storeDescription: "Electronics and gadgets store.",
      businessPhone: "+123456789",
      businessWebsite: "https://techstore.example.com",
      businessAddress: {
        street: "12 Main Street",
        city: "Algiers",
        zipCode: "16000",
        country: "Algeria",
      },
      status: "approved",
    });

    const aliSeller = await db
      .insert(users)
      .values({
        username: "ali_seller",
        email: "ali.seller@example.com",
        password: await hashPassword("seller123456"),
        firstName: "Ali",
        lastName: "Khan",
        role: "seller",
        avatar:
          "https://ui-avatars.com/api/?name=Ali+Khan&background=14b8a6&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "en",
        sellerStatus: "approved",
      })
      .returning();
    await db.insert(stores).values({
      ownerId: aliSeller[0].id,
      storeName: "Ali Electronics",
      codeStore: "ALI001",
      storeDescription: "Affordable electronics and accessories.",
      businessPhone: "+92-300-1234567",
      businessWebsite: "https://ali-electronics.example.com",
      businessAddress: {
        street: "45 Tech Road",
        city: "Lahore",
        zipCode: "54000",
        country: "Pakistan",
      },
      status: "approved",
    });

    const hinaSeller = await db
      .insert(users)
      .values({
        username: "hina_seller",
        email: "hina.seller@example.com",
        password: await hashPassword("seller123456"),
        firstName: "Hina",
        lastName: "Malik",
        role: "seller",
        avatar:
          "https://ui-avatars.com/api/?name=Hina+Malik&background=f472b6&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "fr",
        sellerStatus: "pending",
      })
      .returning();
    await db.insert(stores).values({
      ownerId: hinaSeller[0].id,
      storeName: "Hina Fashion",
      codeStore: "HINA001",
      storeDescription: "Trendy clothing and accessories.",
      businessPhone: "+92-333-9876543",
      businessWebsite: "https://hinafashion.example.com",
      businessAddress: {
        street: "89 Fashion Street",
        city: "Karachi",
        zipCode: "74000",
        country: "Pakistan",
      },
      status: "pending_validation",
    });

    // Clients
    const clientUser1 = await db
      .insert(users)
      .values({
        username: "sara_client",
        email: "sara@devnaza.com",
        password: await hashPassword("client123456"),
        firstName: "Sara",
        lastName: "Djouad",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Sara+Djouad&background=f59e0b&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "fr",
        sellerStatus: null,
      })
      .returning();

    const clientUser2 = await db
      .insert(users)
      .values({
        username: "mohamed_client",
        email: "mohamed@devnaza.com",
        password: await hashPassword("client123456"),
        firstName: "Mohamed",
        lastName: "Kaddour",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Mohamed+Kaddour&background=ef4444&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "ar",
        sellerStatus: null,
      })
      .returning();

    const usmanClient = await db
      .insert(users)
      .values({
        username: "usman_client",
        email: "usman@example.com",
        password: await hashPassword("client123456"),
        firstName: "Usman",
        lastName: "Ali",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Usman+Ali&background=0ea5e9&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "en",
        sellerStatus: null,
      })
      .returning();

    const aishaClient = await db
      .insert(users)
      .values({
        username: "aisha_client",
        email: "aisha@example.com",
        password: await hashPassword("client123456"),
        firstName: "Aisha",
        lastName: "Yousuf",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Aisha+Yousuf&background=9333ea&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "ar",
        sellerStatus: null,
      })
      .returning();

    // Extra demo clients from before
    await db.insert(users).values([
      {
        username: "jean_dupont",
        email: "jean.dupont@example.com",
        password: await hashPassword("password123"),
        firstName: "Jean",
        lastName: "Dupont",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Jean+Dupont&background=3b82f6&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "fr",
        sellerStatus: null,
      },
      {
        username: "marie_martin",
        email: "marie.martin@example.com",
        password: await hashPassword("password123"),
        firstName: "Marie",
        lastName: "Martin",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Marie+Martin&background=ec4899&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "fr",
        sellerStatus: null,
      },
      {
        username: "pierre_durand",
        email: "pierre.durand@example.com",
        password: await hashPassword("password123"),
        firstName: "Pierre",
        lastName: "Durand",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Pierre+Durand&background=10b981&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "fr",
        sellerStatus: null,
      },
      {
        username: "sophie_bernard",
        email: "sophie.bernard@example.com",
        password: await hashPassword("password123"),
        firstName: "Sophie",
        lastName: "Bernard",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Sophie+Bernard&background=f59e0b&color=fff",
        isActive: false,
        emailVerified: true,
        preferredLanguage: "fr",
        sellerStatus: null,
      },
      {
        username: "luc_moreau",
        email: "luc.moreau@example.com",
        password: await hashPassword("password123"),
        firstName: "Luc",
        lastName: "Moreau",
        role: "seller",
        avatar:
          "https://ui-avatars.com/api/?name=Luc+Moreau&background=6366f1&color=fff",
        isActive: true,
        emailVerified: true,
        preferredLanguage: "fr",
        sellerStatus: "approved",
      },
      {
        username: "julie_legrand",
        email: "julie.legrand@example.com",
        password: await hashPassword("password123"),
        firstName: "Julie",
        lastName: "Legrand",
        role: "client",
        avatar:
          "https://ui-avatars.com/api/?name=Julie+Legrand&background=ef4444&color=fff",
        isActive: false,
        emailVerified: false,
        preferredLanguage: "fr",
        sellerStatus: null,
      },
    ]);

    const sellerId = sellerUser[0].id;
    const aliSellerId = aliSeller[0].id;
    const clientId = clientUser1[0].id;

    // Categories
    console.log("📂 Creating categories...");
    const electronicsCategory = await db
      .insert(categories)
      .values({
        slug: "electronics",
        icon: "smartphone",
        isActive: true,
        sortOrder: 1,
      })
      .returning();
    const fashionCategory = await db
      .insert(categories)
      .values({ slug: "fashion", icon: "shirt", isActive: true, sortOrder: 2 })
      .returning();
    const homeCategory = await db
      .insert(categories)
      .values({
        slug: "home-garden",
        icon: "home",
        isActive: true,
        sortOrder: 3,
      })
      .returning();

    // Products (original ones + Ali's)
    console.log("📱 Creating products...");
    const product1 = await db
      .insert(products)
      .values({
        vendorId: sellerId,
        categoryId: electronicsCategory[0].id,
        slug: "samsung-galaxy-s24-ultra",
        sku: "SAM-S24-ULTRA-256",
        price: "1299.99",
        originalPrice: "1399.99",
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&w=400&h=400",
        ],
        isActive: true,
        isFeatured: true,
        rating: "4.8",
        reviewCount: 156,
      })
      .returning();

    const aliProduct1 = await db
      .insert(products)
      .values({
        vendorId: aliSellerId,
        categoryId: electronicsCategory[0].id,
        slug: "ali-smartwatch",
        sku: "ALI-SMART-01",
        price: "149.99",
        originalPrice: "199.99",
        stock: 30,
        images: [
          "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=400&h=400",
        ],
        isActive: true,
        isFeatured: true,
        rating: "4.4",
        reviewCount: 42,
      })
      .returning();

    // Orders
    console.log("📦 Creating orders...");
    const order1 = await db
      .insert(orders)
      .values({
        userId: clientId,
        status: "packed",
        totalAmount: "1375.97",
        shippingAddress: {
          street: "123 Main Street",
          city: "Algiers",
          state: "Algiers",
          zipCode: "16000",
          country: "Algeria",
        },
      })
      .returning();

    const usmanOrder = await db
      .insert(orders)
      .values({
        userId: usmanClient[0].id,
        status: "packed",
        totalAmount: "149.99",
        shippingAddress: {
          street: "12 Street",
          city: "Lahore",
          state: "Punjab",
          zipCode: "54000",
          country: "Pakistan",
        },
      })
      .returning();

    const aishaOrder = await db
      .insert(orders)
      .values({
        userId: aishaClient[0].id,
        status: "on-way",
        totalAmount: "1299.99",
        shippingAddress: {
          street: "45 Avenue",
          city: "Karachi",
          state: "Sindh",
          zipCode: "74000",
          country: "Pakistan",
        },
      })
      .returning();

    await db.insert(orderItems).values([
      {
        orderId: order1[0].id,
        productId: product1[0].id,
        quantity: 1,
        unitPrice: "1299.99",
        totalPrice: "1299.99",
      },
      {
        orderId: usmanOrder[0].id,
        productId: aliProduct1[0].id,
        quantity: 1,
        unitPrice: "149.99",
        totalPrice: "149.99",
      },
    ]);

    console.log(
      "✅ Database seeded successfully with extended users and data!"
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log("Seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
