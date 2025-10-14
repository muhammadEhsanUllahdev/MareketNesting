

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
dotenv.config();

const app = express();

(async () => {
  // -------------------- Base Middleware --------------------
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: false, limit: "50mb" }));

  // -------------------- CORS --------------------
  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
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

  // -------------------- Session --------------------
  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({
        pool, // ✅ reuse shared pool from db.ts
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production" ? true : false,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    })
  );

  // -------------------- Passport --------------------
  app.use(passport.initialize());
  app.use(passport.session());
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

  // -------------------- Start server --------------------
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "localhost" }, () => {
    log(`✅ Server running at http://localhost:${port}`);
  });
})();
