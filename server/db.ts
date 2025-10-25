
// import { drizzle } from "drizzle-orm/node-postgres";
// import * as schema from "@shared/schema";
// import dotenv from "dotenv";
// import pkg from "pg";

// dotenv.config();

// const { Pool } = pkg;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?"
//   );
// }

// const connectionString = process.env.DATABASE_URL;
// const isNeonDatabase = connectionString.includes("neon.tech");

// declare global {
//   // eslint-disable-next-line no-var
//   var __pgPool: import("pg").Pool | undefined;
//   // eslint-disable-next-line no-var
//   var __drizzleDb: ReturnType<typeof drizzle> | undefined;
// }

// // Create or reuse a single pool across HMR/dev restarts
// const pool =
//   global.__pgPool ??
//   new Pool({
//     connectionString,
//     ssl: isNeonDatabase ? { rejectUnauthorized: false } : undefined,
//     connectionTimeoutMillis: 10000,
//     idleTimeoutMillis: 30000,
//     max: 4, // adjust to your DB limits
//   });

// if (!global.__pgPool) global.__pgPool = pool;

// // Create or reuse drizzle instance
// const db = global.__drizzleDb ?? drizzle(pool, { schema });
// if (!global.__drizzleDb) global.__drizzleDb = db;

// // Gracefully close on process exit (dev safety)
// process.once("SIGINT", async () => {
//   try {
//     await pool.end();
//     // eslint-disable-next-line no-console
//     console.log("Postgres pool closed (SIGINT).");
//   } catch (e) {
//     // eslint-disable-next-line no-console
//     console.error("Error closing pool:", e);
//   } finally {
//     process.exit(0);
//   }
// });

// export { pool, db };


// import { drizzle } from "drizzle-orm/node-postgres";
// import * as schema from "@shared/schema";
// import dotenv from "dotenv";
// import pkg from "pg";

// dotenv.config(); // loads DATABASE_URL from .env

// const { Pool } = pkg;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?"
//   );
// }

// let pool: typeof Pool.prototype | null = null;
// let db: ReturnType<typeof drizzle> | null = null;

// // Initialize database connection with error handling
// try {
//   const connectionString = process.env.DATABASE_URL;
//   const isNeonDatabase = connectionString.includes('neon.tech');
  
//   pool = new Pool({
//     connectionString: connectionString,
//     ssl: isNeonDatabase ? { rejectUnauthorized: false } : undefined,
//     connectionTimeoutMillis: 10000,
//     idleTimeoutMillis: 30000,
//     max: 10
//   });
  
//   db = drizzle(pool, { schema });
  
//   // Test the connection
//   pool.connect().then(client => {
//     console.log("Database connection established successfully ✅");
//     client.release();
//   }).catch(error => {
//     console.error("Database connection test failed:", error);
//     console.log("The application will continue with limited functionality.");
//     db = null;
//     pool = null;
//   });
  
// } catch (error) {
//   console.error("Failed to initialize database connection:", error);
//   console.log("The application will continue with limited functionality.");
//   db = null;
//   pool = null;
// }

// export { pool, db };

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set in .env");
}

// Reuse the same pool & drizzle instance across all imports (hot reload safe)
const g = globalThis as unknown as {
  __pgPool?: InstanceType<typeof Pool>;
  __drizzleDb?: ReturnType<typeof drizzle>;
};

if (!g.__pgPool) {
  g.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : undefined,
    max: 8,                 // keep conservative
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 15000,
  });
}

if (!g.__drizzleDb) {
  g.__drizzleDb = drizzle(g.__pgPool, { schema });
}

export const pool = g.__pgPool!;
export const db = g.__drizzleDb!;

// (Optional) graceful shutdown for local dev
process.once("SIGINT", async () => {
  try {
    await pool.end();
  } finally {
    process.exit(0);
  }
});
