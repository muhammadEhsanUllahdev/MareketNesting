// // seed-products.ts
// import { products } from "./products-data";

// const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// export async function seedSellerProducts(apiBase = "") {
//   console.log(`🚀 Seeding ${products.length} products...`);

//   for (let i = 0; i < products.length; i++) {
//     const p = products[i];

//     // Back-compat top-level fields (your seller form does this before POST):contentReference[oaicite:2]{index=2}
//     const payload = {
//       ...p,
//       name: p.translations.en.name,
//       description: p.translations.en.description,
//       highlights: p.translations.en.highlights,
//     };

//     try {
//       const res = await fetch(`${apiBase}/api/products`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) {
//         const msg = await res.text();
//         console.error(`❌ [${i + 1}/${products.length}] ${p.sku} failed`, msg);
//       } else {
//         console.log(`✅ [${i + 1}/${products.length}] ${p.sku} created`);
//       }
//     } catch (e) {
//       console.error(`⚠️ [${i + 1}/${products.length}] ${p.sku} error`, e);
//     }

//     await delay(1000); // 1s between calls
//   }
//   console.log("🎉 Product seeding complete");
// }

// // Auto-run when imported in a browser page (optional)
// if (typeof window !== "undefined") {
//   // Run once per browser to avoid duplicates
//   const KEY = "sellerProductsSeeded";
//   if (!localStorage.getItem(KEY)) {
//     seedSellerProducts().then(() => localStorage.setItem(KEY, "true"));
//   }
// }
// seed-products.ts

// seed-products.ts
// seed-products.ts
import { products } from "./products-data";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function seedSellerProducts(apiBase = "") {
  console.log(`🚀 Seeding ${products.length} products...`);

  // Fetch valid category IDs once
  const catRes = await fetch(`${apiBase}/api/categories`, { credentials: "include" });
  const validCats = catRes.ok ? (await catRes.json()).map((c: any) => c.id) : [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // 🧩 1️⃣ Validate category existence
    if (!validCats.includes(p.categoryId)) {
      console.warn(
        `⚠️ [${i + 1}] Skipped ${p.sku}: category ${p.categoryId} not found.`
      );
      await wait(2000); // Wait 2s before next product
      continue;
    }

    // 🧩 2️⃣ Skip if SKU already exists
    try {
      const checkRes = await fetch(`${apiBase}/api/products?sku=${p.sku}`, {
        credentials: "include",
      });
      if (checkRes.ok) {
        const existing = await checkRes.json();
        if (Array.isArray(existing) && existing.length > 0) {
          console.warn(`⚠️ [${i + 1}] Skipped ${p.sku}: SKU already exists.`);
          await wait(2000); // Wait 2s before next product
          continue;
        }
      }
    } catch (err) {
      console.error(`⚠️ [${i + 1}] Error checking SKU ${p.sku}`, err);
      await wait(2000);
      continue;
    }

    // 🧩 3️⃣ Construct payload
    const payload = {
      ...p,
      name: p.translations.en.name,
      description: p.translations.en.description,
      highlights: p.translations.en.highlights,
    };

    // 🧩 4️⃣ Attempt product creation
    try {
      const res = await fetch(`${apiBase}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error(`❌ [${i + 1}] ${p.sku} failed → ${msg}`);
        await wait(2000); // 2s before next on failure
      } else {
        console.log(`✅ [${i + 1}] ${p.sku} created successfully`);
      }
    } catch (e) {
      console.error(`⚠️ [${i + 1}] ${p.sku} error`, e);
      await wait(2000);
    }
  }

  console.log("🎉 Product seeding complete");
}

// Auto-run when loaded in browser (only once)
if (typeof window !== "undefined") {
  const KEY = "sellerProductsSeeded";
  if (!localStorage.getItem(KEY)) {
    seedSellerProducts().then(() => localStorage.setItem(KEY, "true"));
  }
}
