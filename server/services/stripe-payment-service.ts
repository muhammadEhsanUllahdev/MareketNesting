// // server/services/stripe-payment-service.ts
// import express from "express";
// import { z } from "zod";
// import Stripe from "stripe";

// export default function createStripePaymentRouter({
//   stripe,
// }: {
//   stripe: Stripe;
// }) {
//   if (!stripe) throw new Error("Stripe instance required");

//   const router = express.Router();

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

//   // 1) Create PaymentIntent
//   router.post("/api/checkout/payment", express.json(), async (req, res) => {
//     try {
//       const data = checkoutSchema.parse(req.body);

//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(data.amount * 100),
//         currency: data.currency,
//         description: `Order for ${data.shippingAddress.fullName}`,
//         payment_method_types: ["card"],
//         receipt_email: data.shippingAddress.email,
//         shipping: {
//           name: data.shippingAddress.fullName,
//           phone: data.shippingAddress.phone,
//           address: {
//             line1: data.shippingAddress.street,
//             city: data.shippingAddress.city,
//             state: data.shippingAddress.state,
//             postal_code: data.shippingAddress.zipCode,
//           },
//         },
//       });

//       return res.status(201).json({
//         clientSecret: paymentIntent.client_secret,
//         paymentIntentId: paymentIntent.id,
//       });
//     } catch (err: any) {
//       console.error("❌ Error in /api/checkout/payment:", err);
//       return res.status(500).json({
//         error: "payment_creation_failed",
//         message: err.message,
//       });
//     }
//   });

//   // 2) Confirm PaymentIntent status
//   router.post("/api/checkout/confirm", express.json(), async (req, res) => {
//     try {
//       const { paymentIntentId } = req.body;
//       if (!paymentIntentId)
//         return res.status(400).json({ error: "paymentIntentId_required" });

//       const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

//       return res.json({
//         id: intent.id,
//         status: intent.status,
//       });
//     } catch (err: any) {
//       console.error("❌ Error in /api/checkout/confirm:", err);
//       return res.status(500).json({
//         error: "confirm_failed",
//         message: err.message,
//       });
//     }
//   });

//   return router;
// }
// server/services/stripe-payment-service.ts
import express from "express";
import { z } from "zod";
import Stripe from "stripe";
import { db } from "../db"; // adjust path to your db instance
import {
  orders,
  orderItems,
  transactions,
  products,
  stockAlerts,
} from "../../shared/schema";
import { eq, inArray, sql } from "drizzle-orm";

export default function createStripePaymentRouter({
  stripe,
}: {
  stripe: Stripe;
}) {
  if (!stripe) throw new Error("Stripe instance required");

  const router = express.Router();

  // Validation schema
  const checkoutSchema = z.object({
    cartItems: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().min(1),
        price: z.string(),
        vendorId: z.string(),
      })
    ),
    shippingAddress: z.object({
      fullName: z.string(),
      phone: z.string(),
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      email: z.string().email(),
    }),
    amount: z.number().min(1),
    currency: z.string().default("usd"),
    carrierId: z.string().optional(),
    zoneId: z.string().optional(),
    shippingOption: z
      .object({
        carrierName: z.string(),
        price: z.number(),
        deliveryTime: z.string().optional(),
      })
      .optional(),
  });

  // 1) Create PaymentIntent + insert PENDING order
  router.post("/api/checkout/payment", express.json(), async (req, res) => {
    try {
      const data = checkoutSchema.parse(req.body);

      // Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        description: `Order for ${data.shippingAddress.fullName}`,
        payment_method_types: ["card"],
        receipt_email: data.shippingAddress.email,
        shipping: {
          name: data.shippingAddress.fullName,
          phone: data.shippingAddress.phone,
          address: {
            line1: data.shippingAddress.street,
            city: data.shippingAddress.city,
            state: data.shippingAddress.state,
            postal_code: data.shippingAddress.zipCode,
          },
        },
      });

      const createdAt = new Date();
      const deliveryDate = new Date();
      deliveryDate.setDate(createdAt.getDate() + 7);

      // Insert pending order
      const [newOrder] = await db
        .insert(orders)
        .values({
          orderNumber: `ORD-${Date.now()}`,
          userId: String(req.user?.id),
          customerName: data.shippingAddress.fullName,
          customerEmail: data.shippingAddress.email,
          customerPhone: data.shippingAddress.phone,
          totalAmount: String(data.amount),
          currency: data.currency,
          status: "pending",
          paymentIntentId: paymentIntent.id,
          shippingAddress: {
            ...data.shippingAddress,
            country: data.shippingAddress.state,
          },
          createdAt,
          deliveryDate,
          carrierId: data.carrierId || null,
          zoneId: data.zoneId || null,
          shippingOption: data.shippingOption
            ? {
                carrierName: data.shippingOption.carrierName,
                price: data.shippingOption.price,
                deliveryTime: data.shippingOption.deliveryTime,
              }
            : null,
        })
        .returning();

      // Insert order items
      if (data.cartItems.length > 0) {
        await db.insert(orderItems).values(
          data.cartItems.map((item) => ({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: (item.quantity * parseFloat(item.price)).toString(),
          }))
        );

        // Decrease stock
        // for (const item of data.cartItems) {
        //   await db
        //     .update(products)
        //     .set({
        //       stock: sql`${products.stock} - ${item.quantity}`,
        //     })
        //     .where(eq(products.id, item.productId));
        // }

        for (const item of data.cartItems) {
          // Decrease stock
          const [updatedProduct] = await db
            .update(products)
            .set({ stock: sql`${products.stock} - ${item.quantity}` })
            .where(eq(products.id, item.productId))
            .returning();

          if (updatedProduct.stock <= updatedProduct.minThreshold) {
            await db.insert(stockAlerts).values({
              id: crypto.randomUUID(),
              productId: updatedProduct.id,
              sellerId: updatedProduct.vendorId,
              alertType: updatedProduct.stock === 0 ? "critical" : "important",
              message:
                updatedProduct.stock === 0
                  ? "Completely out of stock"
                  : `Low stock: only ${updatedProduct.stock} left`,
              createdAt: new Date(),
              status: "active",
            });
          }
        }
      }
      const sellerTotals = data.cartItems.reduce((acc, item) => {
        acc[item.vendorId] =
          (acc[item.vendorId] || 0) + item.quantity * parseFloat(item.price);
        return acc;
      }, {} as Record<string, number>);

      for (const [sellerId, amount] of Object.entries(sellerTotals)) {
        await db.insert(transactions).values({
          orderId: newOrder.id,
          sellerId,
          amount: amount.toFixed(2),
          currency: data.currency,
          status: "pending",
          paymentMethod: "card",
        });
      }

      //   // Insert single transaction (simplified — one vendor)
      //   await db.insert(transactions).values({
      //     orderId: newOrder.id,
      //     sellerId: "default", // ⚡ adjust if you support multiple vendors
      //     amount: data.amount.toFixed(2),
      //     currency: data.currency,
      //     status: "pending",
      //     paymentMethod: "card",
      //   });

      return res.status(201).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: newOrder.id,
      });
    } catch (err: any) {
      console.error("❌ Error in /api/checkout/payment:", err);
      return res.status(500).json({
        error: "payment_creation_failed",
        message: err.message,
      });
    }
  });

  // 2) Confirm PaymentIntent and update DB
  router.post("/api/checkout/confirm", express.json(), async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      if (!paymentIntentId) {
        return res.status(400).json({ error: "paymentIntentId_required" });
      }

      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

      const [order] = await db
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.paymentIntentId, paymentIntentId));

      if (!order) {
        return res.status(404).json({ error: "order_not_found" });
      }

      if (intent.status === "succeeded") {
        await db
          .update(orders)
          .set({ paymentStatus: "paid" })
          .where(eq(orders.paymentIntentId, paymentIntentId));

        await db
          .update(transactions)
          .set({ status: "paid" })
          .where(eq(transactions.orderId, order.id));
      } else if (
        intent.status === "canceled" ||
        intent.status === "requires_payment_method"
      ) {
        await db
          .update(orders)
          .set({ status: "failed" })
          .where(eq(orders.paymentIntentId, paymentIntentId));

        await db
          .update(transactions)
          .set({ status: "failed" })
          .where(eq(transactions.orderId, orders.id));
      }

      return res.json({ id: intent.id, status: intent.status });
    } catch (err: any) {
      console.error("❌ Error in /api/checkout/confirm:", err);
      return res.status(500).json({
        error: "confirm_failed",
        message: err.message,
      });
    }
  });

  return router;
}
