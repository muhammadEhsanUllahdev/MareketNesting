import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { emailService } from "./emailService";
import { createNotification } from "./routes";
import { Router } from "express";
// import connectPgSimple from "connect-pg-simple";
// import { pool } from "./db";
declare global {
  namespace Express {
    interface User extends SelectUser { }
    interface Request {
      userLanguage?: string;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Your custom checks
    if (!user.emailVerified) {
      return res.status(403).json({ success: false, message: "Verify your email" });
    }
    if ((user.status && user.status !== "Active") || (!user.status && !user.isActive)) {
      return res.status(403).json({ success: false, message: "Account inactive/blocked" });
    }
    if (user.role === "seller" && user.sellerStatus !== "approved") {
      const msg = user.sellerStatus === "rejected"
        ? "Seller application rejected"
        : "Seller account pending approval";
      return res.status(403).json({ success: false, message: msg, needsApproval: true });
    }

    // if user.role === "seller" then fetch and attach the store info
    if (user.role === "seller") {
      try {
        const storeInfo = await storage.getStoreInfoByUserId(user.id);
        if (!storeInfo) {
          return res.status(404).json({ success: false, message: "Store not found" });
        }
        user.store = storeInfo;
      } catch (fetchErr) {
        console.error("Failed to fetch store info for login:", fetchErr);
        return res.status(500).json({ success: false, message: "Failed to fetch store info" });
      }
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);

      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("❌ Session save failed:", saveErr);
          return res.status(500).json({ success: false, message: "Session not saved" });
        }

        const { password, resetToken, resetTokenExpiry, emailVerificationToken, ...safeUser } = user;
        console.log("✅ User logged in & session saved:", user.username);
        return res.json({ user: safeUser });
      });
    });


    // Use passport's req.login (this persists the session)
    // req.login(user, (loginErr) => {
    //   if (loginErr) return next(loginErr);

    //   // Return sanitized user object (NEVER send password or sensitive fields)
    //   console.log("✅ User logged in:", user);
    //   const { password, resetToken, resetTokenExpiry, emailVerificationToken, ...safeUser } = user;
    //   return res.json(safeUser);

    // });
  })(req, res, next);
});

router.get("/debug-session", (req, res) => {
  res.json({
    session: req.session,
    user: req.user,
    authenticated: req.isAuthenticated(),
  });
});


router.post("/logout", (req, res) => {
  try {
    if (!req.session) return res.json({ success: true });

    const sid = req.session.id;
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ success: false, message: "Logout failed" });
      }
      // Cookie name is connect.sid by default; path must match session cookie
      res.clearCookie("connect.sid", { path: "/" });
      console.log("Session destroyed:", sid);
      return res.json({ success: true });
    });
  } catch (e) {
    console.error("Logout fatal error:", e);
    res.status(500).json({ success: false });
  }
});
export function setupAuth(app: Express) {
  // Session and passport are now configured in server/index.ts
  // This function just sets up the passport strategy

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));

  // passport.deserializeUser(async (id: string, done) => {
  //   try {
  //     const user = await storage.getUser(id);

  //     if (!user) {
  //       return done(null, false); // no user found, force re-login
  //     }

  //     return done(null, user);
  //   } catch (err) {
  //     console.error("❌ Failed to deserialize user:", err);

  //     // Instead of crashing, treat as unauthenticated
  //     return done(null, false);
  //   }
  // });
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);

      if (!user) {
        console.warn(`⚠️ No user found for session ID: ${id}`);
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      console.error("❌ Failed to deserialize user:", err);
      // Do NOT drop session entirely if DB is temporarily slow
      return done(null, false);
    }
  });

  // Import multer configuration from routes for file upload
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.originalname);
        const filename = `${timestamp}_${randomString}${extension}`;
        cb(null, filename);
      },
    }),
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
  // app.post("/api/register", upload.single("avatar"), async (req, res, next) => {
  //   try {
  //     // Prevent admin registration
  //     if (req.body.role === "admin") {
  //       return res
  //         .status(403)
  //         .json({ error: "Admin registration is not allowed" });
  //     }

  //     // Check if username already exists
  //     const existingUser = await storage.getUserByUsername(req.body.username);
  //     if (existingUser) {
  //       return res.status(400).json({ error: "Username already exists" });
  //     }

  //     // Check if email already exists
  //     const existingEmail = await storage.getUserByEmail(req.body.email);
  //     if (existingEmail) {
  //       return res.status(400).json({ error: "Email already exists" });
  //     }

  //     // Handle avatar file upload
  //     let avatarPath = null;
  //     if (req.file) {
  //       avatarPath = `/uploads/${req.file.filename}`;
  //     }

  //     // Create user data object
  //     const userData = {
  //       username: req.body.username,
  //       email: req.body.email,
  //       password: await hashPassword(req.body.password),
  //       firstName: req.body.firstName,
  //       lastName: req.body.lastName,
  //       role: req.body.role,
  //       avatar: avatarPath,
  //       // Seller-specific fields (only if role is seller)
  //       ...(req.body.role === "seller" && {
  //         storeName: req.body.storeName,
  //         storeDescription: req.body.storeDescription,
  //         businessType: req.body.businessType,
  //         businessAddress: req.body.businessAddress,
  //         businessPhone: req.body.businessPhone,
  //         businessWebsite: req.body.businessWebsite,
  //         taxId: req.body.taxId,
  //       }),
  //     };

  //     const user = await storage.createUser(userData);

  //     // Generate email verification token
  //     const verificationToken = emailService.generateVerificationToken();
  //     await storage.setEmailVerificationToken(user.id, verificationToken);

  //     // Send verification email instead of welcome email
  //     try {
  //       await emailService.sendEmailVerification(
  //         user.email,
  //         user.firstName,
  //         verificationToken
  //       );
  //       console.log(`Verification email sent to ${user.email}`);
  //     } catch (emailError) {
  //       console.error("Failed to send verification email:", emailError);
  //       return res
  //         .status(500)
  //         .json({ error: "Failed to send verification email" });
  //     }

  //     // Create notification for new user registration
  //     try {
  //       if (user.role === "seller") {
  //         // Notify admins about new seller registration
  //         await createNotification({
  //           userId: null, // Global notification for admins
  //           type: "seller_registration",
  //           title: "New Seller Registration",
  //           message: `${user.firstName} ${user.lastName} has registered as a seller and is awaiting approval`,
  //           data: {
  //             userId: user.id,
  //             userEmail: user.email,
  //             userRole: user.role,
  //           },
  //           isRead: false,
  //         });
  //       } else {
  //         // Notify admins about new user registration
  //         await createNotification({
  //           userId: null, // Global notification for admins
  //           type: "user_registration",
  //           title: "New User Registration",
  //           message: `${user.firstName} ${user.lastName} has registered as a ${user.role}`,
  //           data: {
  //             userId: user.id,
  //             userEmail: user.email,
  //             userRole: user.role,
  //           },
  //           isRead: false,
  //         });
  //       }
  //     } catch (notificationError) {
  //       console.error("Failed to create notification:", notificationError);
  //       // Don't fail registration if notification fails
  //     }

  //     res.status(201).json({
  //       message:
  //         "Registration successful! Please check your email to verify your account.",
  //       userId: user.id,
  //       emailSent: true,
  //     });
  //   } catch (error) {
  //     console.error("Registration error:", error);
  //     res.status(500).json({ error: "Registration failed" });
  //   }
  // });

  app.post("/api/register", upload.single("avatar"), async (req, res, next) => {
    try {
      // Prevent admin registration
      if (req.body.role === "admin") {
        return res
          .status(403)
          .json({ error: "Admin registration is not allowed" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }

      // Handle avatar file upload
      let avatarPath = null;
      if (req.file) {
        avatarPath = `/uploads/${req.file.filename}`;
      }

      // Step 1: Create user
      const userData = {
        username: req.body.username,
        email: req.body.email,
        password: await hashPassword(req.body.password),
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        avatar: avatarPath,
      };

      const user = await storage.createUser(userData);

      const businessAddress = {
        street: req.body.businessAddressStreet || "",
        city: req.body.businessAddressCity || "",
        zipCode: req.body.businessAddressZipCode || "",
        country: req.body.businessAddressCountry || "",
      };

      // Step 2: If seller → create store entry
      if (user.role === "seller") {
        const storeData = {
          ownerId: user.id,
          storeName: req.body.storeName,
          codeStore: req.body.codeStore || null,
          storeDescription: req.body.storeDescription,
          businessPhone: req.body.businessPhone,
          businessWebsite: req.body.businessWebsite,
          taxId: req.body.taxId,
          businessAddress,
        };
        await storage.createStore(storeData);
      }

      // Step 3: Generate email verification token
      const verificationToken = emailService.generateVerificationToken();
      await storage.setEmailVerificationToken(user.id, verificationToken);

      try {
        await emailService.sendEmailVerification(
          user.email,
          user.firstName,
          verificationToken
        );
        console.log(`Verification email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        return res
          .status(500)
          .json({ error: "Failed to send verification email" });
      }

      // Step 4: Create notifications
      try {
        if (user.role === "seller") {
          await createNotification({
            userId: null, // Global for admins
            type: "seller_registration",
            title: "New Seller Registration",
            message: `${user.firstName} ${user.lastName} has registered as a seller and is awaiting approval`,
            data: {
              userId: user.id,
              userEmail: user.email,
              userRole: user.role,
            },
            isRead: false,
          });
        } else {
          await createNotification({
            userId: null,
            type: "user_registration",
            title: "New User Registration",
            message: `${user.firstName} ${user.lastName} has registered as a ${user.role}`,
            data: {
              userId: user.id,
              userEmail: user.email,
              userRole: user.role,
            },
            isRead: false,
          });
        }
      } catch (notificationError) {
        console.error("Failed to create notification:", notificationError);
      }

      res.status(201).json({
        message:
          "Registration successful! Please check your email to verify your account.",
        userId: user.id,
        emailSent: true,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // app.post("/api/login", (req, res, next) => {
  //   passport.authenticate("local", (err: any, user: any, info: any) => {
  //     if (err) return next(err);
  //     if (!user) {
  //       return res.status(401).json({ error: "Invalid credentials" });
  //     }

  //     // Check email verification
  //     if (!user.emailVerified) {
  //       return res
  //         .status(403)
  //         .send("Please verify your email address before logging in");
  //     }

  //     // Check user status - block inactive users
  //     if (user.status && user.status !== "Active") {
  //       return res.status(403).json({
  //         error:
  //           "Now You can't use your dashboard more, Please Contact to Admin",
  //         userStatus: user.status,
  //         blocked: true,
  //       });
  //     }

  //     // Fallback check for users without status field (backward compatibility)
  //     if (!user.status && !user.isActive) {
  //       return res.status(403).json({
  //         error:
  //           "Now You can't use your dashboard more, Please Contact to Admin",
  //         userStatus: "Inactive",
  //         blocked: true,
  //       });
  //     }

  //     // For sellers, check approval status
  //     if (user.role === "seller" && user.sellerStatus !== "approved") {
  //       let message = "Your seller account is pending approval";
  //       if (user.sellerStatus === "rejected") {
  //         message =
  //           "Your seller application was rejected. Please contact support.";
  //       }
  //       return res.status(403).json({
  //         error: message,
  //         needsApproval: true,
  //         sellerStatus: user.sellerStatus,
  //       });
  //     }

  //     req.login(user, (err) => {
  //       if (err) return next(err);

  //       // ensure session persisted before sending response
  //       req.session.save((saveErr) => {
  //         if (saveErr) {
  //           console.error("Session save error:", saveErr);
  //           // return an error or still return user, depending on desired behavior
  //           return res.status(500).json({ error: "Failed to save session" });
  //         }

  //         // send user object (omit sensitive fields)
  //         res.status(200).json(user);
  //       });
  //     });
  //     // req.login(user, (err) => {
  //     //   if (err) return next(err);
  //     //   res.status(200).json(user);
  //     // });
  //   })(req, res, next);
  // });

  // app.post("/api/logout", (req, res, next) => {
  //   req.logout((err) => {
  //     if (err) return next(err);
  //     res.sendStatus(200);
  //   });
  // });



  // app.post("/logout", (req, res, next) => {
  //   req.logout(function (err) {
  //     if (err) {
  //       return next(err);
  //     }
  //     res.redirect("/");
  //   });
  // });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Sanitize user object before sending (NEVER send password or sensitive fields)
    const user = req.user;
    if (user) {
      const { password, resetToken, resetTokenExpiry, emailVerificationToken, ...safeUser } = user;
      return res.json(safeUser);
    }
    return res.sendStatus(401);
  });

  // Forgot password route
  app.post("/api/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          message:
            "If an account with this email exists, you will receive a password reset email.",
        });
      }

      // Generate reset token
      const resetToken = emailService.generateResetToken();
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save reset token to database
      const tokenSaved = await storage.setPasswordResetToken(
        email,
        resetToken,
        expiry
      );
      if (!tokenSaved) {
        return res
          .status(500)
          .json({ error: "Failed to generate reset token" });
      }

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken);
        console.log(`Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
        return res.status(500).json({ error: "Failed to send reset email" });
      }

      res.json({
        message:
          "If an account with this email exists, you will receive a password reset email.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Reset password route
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res
          .status(400)
          .json({ error: "Token and password are required" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      // Find user by reset token
      const user = await storage.getUserByResetToken(token);
      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired reset token" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);

      // Update password
      const passwordUpdated = await storage.updatePassword(
        user.id,
        hashedPassword
      );
      if (!passwordUpdated) {
        return res.status(500).json({ error: "Failed to update password" });
      }

      // Clear reset token
      await storage.clearPasswordResetToken(user.id);

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Email verification route
  app.get("/api/verify-email", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res
          .status(400)
          .json({ error: "Verification token is required" });
      }

      const user = await storage.verifyEmail(token as string);
      if (!user) {
        return res
          .status(400)
          .json({ error: "Invalid or expired verification token" });
      }

      // Send welcome email after verification
      try {
        await emailService.sendWelcomeEmail(user.email, user.firstName);
        console.log(`Welcome email sent to ${user.email} after verification`);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Don't fail verification if welcome email fails
      }

      res.json({
        message: "Email verified successfully!",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        },
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin routes for seller management
  app.get("/api/admin/pending-sellers", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const pendingSellers = await storage.getPendingSellers();
      res.json(pendingSellers);
    } catch (error) {
      console.error("Error fetching pending sellers:", error);
      res.status(500).json({ error: "Failed to fetch pending sellers" });
    }
  });

  app.post("/api/admin/approve-seller", async (req, res) => {
    if (!req.isAuthenticated() || req.user?.role !== "admin") {
      return res.sendStatus(401);
    }

    try {
      const { userId, approved } = req.body;

      if (!userId || typeof approved !== "boolean") {
        return res.status(400).json({ error: "Invalid request parameters" });
      }

      const status = approved ? "approved" : "rejected";
      const success = await storage.updateSellerStatus(userId, status);

      if (!success) {
        return res
          .status(500)
          .json({ error: "Failed to update seller status" });
      }

      // Get user details for email notification
      const user = await storage.getUser(userId);
      if (user) {
        try {
          await emailService.sendSellerApprovalNotification(
            user.email,
            user.firstName,
            approved
          );
          console.log(
            `Seller ${approved ? "approval" : "rejection"} email sent to ${user.email
            }`
          );
        } catch (emailError) {
          console.error("Failed to send seller approval email:", emailError);
          // Don't fail the approval if email fails
        }
      }

      res.json({
        message: `Seller ${approved ? "approved" : "rejected"} successfully`,
        status,
      });
    } catch (error) {
      console.error("Error updating seller status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Resend verification email
  app.post("/api/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists
        return res.json({
          message:
            "If an account with this email exists, a verification email has been sent.",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({ error: "Email is already verified" });
      }

      // Generate new verification token
      const verificationToken = emailService.generateVerificationToken();
      await storage.setEmailVerificationToken(user.id, verificationToken);

      // Send verification email
      try {
        await emailService.sendEmailVerification(
          user.email,
          user.firstName,
          verificationToken
        );
        console.log(`Verification email resent to ${user.email}`);
      } catch (emailError) {
        console.error("Failed to resend verification email:", emailError);
        return res
          .status(500)
          .json({ error: "Failed to send verification email" });
      }

      res.json({
        message:
          "If an account with this email exists, a verification email has been sent.",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

// Export password hashing functions for use in other modules
export { hashPassword, comparePasswords };
export default router;