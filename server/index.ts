

// import express, { type Request, Response, NextFunction } from "express";
// import cors from "cors";
// import { registerRoutes } from "./routes"; // your registerRoutes includes setupAuth(app)
// import { setupVite, serveStatic, log } from "./vite"; // if you use them
// // other imports as needed...

// const app = express();

// (async () => {
//   // Body parsing - must be before routes
//   app.use(express.json({ limit: "50mb" }));
//   app.use(express.urlencoded({ extended: false, limit: "50mb" }));

//   // CORS - must allow credentials and the exact front-end origin
//   app.use(
//     cors({
//       origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", // change to your client
//       credentials: true,
//     })
//   );

//   // Optional: small debug to show incoming cookies during development
//   if (process.env.NODE_ENV !== "production") {
//     app.use((req, _res, next) => {
//       console.log("[DBG] incoming cookies:", req.headers.cookie);
//       next();
//     });
//   }

//   // Register routes (registerRoutes will call setupAuth(app) internally)
//   const server = await registerRoutes(app);

//   // global error handler (if you have one)
//   app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
//     const status = err.status || err.statusCode || 500;
//     const message = err.message || "Internal Server Error";
//     res.status(status).json({ message });
//     throw err;
//   });

//   if (app.get("env") === "development") {
//     const { setupVite } = await import("./vite");
//     await setupVite(app, server);
//   } else {
//     serveStatic(app);
//   }

//   const port = parseInt(process.env.PORT || "5000", 10);
//   server.listen({ port, host: "localhost", }, () => {
//     log(`serving on port ${port}`);
//   });
// })();


// server/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import { pool } from "./db";
import { registerRoutes } from "./routes";   // your existing registerRoutes(app)
import { setupVite, serveStatic, log } from "./vite"; // Vite helpers
import { languageMiddleware } from "./middleware/lang";
dotenv.config();

const app = express();

(async () => {
  // -------------------- Base Middleware --------------------
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: false, limit: "50mb" }));

  // -------------------- CORS --------------------
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5103",
      credentials: true,
    })
  );

  // -------------------- Debug cookies (dev only) --------------------
  if (process.env.NODE_ENV !== "production") {
    app.use((req, _res, next) => {
      console.log("[DBG] incoming cookies:", req.headers.cookie);
      next();
    });
  }

  await pool.connect()
    .then(c => { console.log("✅ PostgreSQL ready"); c.release(); })
    .catch(err => {
      console.error("❌ DB not ready:", err);
      process.exit(1);
    });


  // -------------------- Session --------------------
  const PgSession = connectPgSimple(session);

  // Wait for Postgres to be ready before using connect-pg-simple
  // await pool.connect()
  //   .then((client) => {
  //     console.log("✅ PostgreSQL is ready for sessions");
  //     client.release();
  //   })
  //   .catch((err) => {
  //     console.error("❌ PostgreSQL connection failed:", err);
  //     process.exit(1); // stop container early if DB not ready
  //   });

  app.set("trust proxy", 1);

  let store: session.Store;
  try {
    store = new PgSession({ pool, tableName: "user_sessions" });
  } catch (err) {
    console.error("Postgres store failed, using MemoryStore:", err);
    store = new session.MemoryStore();
  }

  // app.use(session({ store, secret: ..., resave: false, ... }));

  app.set("trust proxy", 1); // ✅ needed behind HTTPS proxy in case of production
  // app.use(
  //   session({
  //     store: new PgSession({
  //       pool, // ✅ reuse shared pool from db.ts
  //       tableName: "user_sessions",
  //       createTableIfMissing: true,
  //     }),
  //     secret: process.env.SESSION_SECRET || "dev-secret",
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       secure: process.env.COOKIE_SECURE === "true",  // ✅ override easily per env
  //       httpOnly: true,
  //       sameSite: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE === "true"
  //         ? "none"
  //         : "lax",
  //       path: "/",
  //       maxAge: 24 * 60 * 60 * 1000,
  //     },

  //     // cookie: {
  //     //   // secure: process.env.NODE_ENV === "production" ? true : false,
  //     //   secure: false,
  //     //   httpOnly: true,
  //     //  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  //     //   path: "/",
  //     //   maxAge: 24 * 60 * 60 * 1000, // 1 day
  //     // },
  //   })
  // );
// app.use(
//   session({
//     store: new PgSession({
//       pool,
//       tableName: "user_sessions",
//       createTableIfMissing: true,
//     }),
//     secret: process.env.SESSION_SECRET || "dev-secret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: process.env.COOKIE_SECURE === "true",  // ✅ configurable
//       httpOnly: true,
//       sameSite:
//         process.env.COOKIE_SECURE === "true"
//           ? "none" // needed for HTTPS (cross-origin)
//           : "lax", // needed for local HTTP
//       path: "/",
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//     },
//   })
// );

const isProduction = process.env.NODE_ENV === "production";
const isSecure = process.env.COOKIE_SECURE === "true";

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isSecure,                        // false for local docker
      httpOnly: true,
      sameSite: isSecure ? "none" : "lax",     // lax for local HTTP
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,             // 1 day
      domain: isProduction ? "cebleu.devnaza.com" : undefined, // ✅ leave undefined locally
    },
  })
);


  // -------------------- Passport --------------------
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(languageMiddleware);
  // import "./passport";  // only if you have a separate file defining strategies

  // -------------------- Register backend routes --------------------
  const server = await registerRoutes(app);

  // -------------------- Error handler --------------------
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("Global Error:", err);
  });

  // -------------------- Frontend: Vite dev or static build --------------------
  if (app.get("env") === "development") {
    // ✅ use Vite middleware
    await setupVite(app, server);
  } else {
    // ✅ serve compiled /dist assets in production
    serveStatic(app);
  }

  app.get("api/health", async (_req, res) => {
    try {
      await pool.query("SELECT 1"); // test DB
      res.status(200).json({ status: "ok", db: "connected" });
    } catch {
      res.status(500).json({ status: "error", db: "disconnected" });
    }
  });
  // -------------------- Start server --------------------
  const port = parseInt(process.env.PORT || "5000", 10);
  //  server.listen({ port, host: "localhost", }, () => {
  //     log(`serving on port ${port}`);
  //   });
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
