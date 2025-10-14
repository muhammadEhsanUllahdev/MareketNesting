import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../shared/schema";
import pg from "pg";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
const { Client } = pg;
const connectionString = process.env.DATABASE_URL!;

async function runSeed(db: any) {
  console.log("Running seeders...");
  // 👉 Put your seeding logic here
  await execPromise("npm run seed");
  console.log("Seeding complete ✅");
}

export async function initDatabase() {
  try {
    console.log("Attempting to connect to database...");
    
    // Test connection first
    const testClient = new Client({ 
      connectionString,
      ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 10000
    });
    
    await testClient.connect();
    console.log("Database connection test successful ✅");
    await testClient.end();
    
    // For Neon databases, we don't need to create the database manually
    // as it's already provisioned. Skip the database creation step.
    const isNeonDatabase = connectionString.includes('neon.tech');
    
    if (isNeonDatabase) {
      console.log("Detected Neon database, skipping database creation step...");
      
      // Connect directly to the target database
      const client = new Client({ 
        connectionString,
        ssl: { rejectUnauthorized: false } // Add SSL configuration for Neon
      });
      await client.connect();
      console.log("Connected to database successfully ✅");

      const db = drizzle(client, { schema });

      console.log("Running migrations...");
      await migrate(db, { migrationsFolder: "./drizzle" });
      console.log("Migrations complete ✅");

      // For Neon databases, always run seeding to ensure data exists
      try {
        await runSeed(db);
      } catch (seedError) {
        console.warn("Seeding failed, but database is ready:", seedError);
      }

      return db;
    } else {
      // Original logic for non-Neon databases
      const url = new URL(connectionString);
      const dbName = url.pathname.replace("/", "");

      // Default postgres connection (to create DB if missing)
      const defaultUrl = new URL(connectionString);
      defaultUrl.pathname = "/postgres";

      const defaultClient = new Client({ connectionString: defaultUrl.toString() });
      await defaultClient.connect();

      const res = await defaultClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );

      let freshDb = false;

      if (res.rowCount === 0) {
        console.log(`Database "${dbName}" does not exist. Creating...`);
        await defaultClient.query(`CREATE DATABASE "${dbName}"`);
        freshDb = true;
      } else {
        console.log(`Database "${dbName}" already exists ✅`);
      }

      await defaultClient.end();

      // Connect to target DB
      const client = new Client({ connectionString });
      await client.connect();

      const db = drizzle(client, { schema });

      console.log("Running migrations...");
      await migrate(db, { migrationsFolder: "./drizzle" });
      console.log("Migrations complete ✅");

      if (freshDb) {
        try {
          await runSeed(db);
        } catch (seedError) {
          console.warn("Seeding failed, but database is ready:", seedError);
        }
      }

      return db;
    }
  } catch (error) {
    console.error("Database initialization failed:", error);
    console.log("Note: The application will attempt to continue with limited functionality.");
    console.log("Some features may not work properly without a database connection.");
    
    // Don't throw the error, let the app continue
    return null;
  }
}
