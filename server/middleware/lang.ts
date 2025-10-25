import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

declare namespace Express {
  interface Request {
    userLanguage?: string;
  }
}

export async function languageMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Default language if not authenticated
    req.userLanguage = "en";

    if (req.isAuthenticated() && req.user?.id) {
      const [user] = await db
        .select({ preferredLanguage: users.preferredLanguage })
        .from(users)
        .where(eq(users.id, req.user.id));

      if (user?.preferredLanguage) {
        req.userLanguage = user.preferredLanguage;
      }
    }
    
    next();
  } catch (error) {
    console.error("Error in language middleware:", error);
    next();
  }
}