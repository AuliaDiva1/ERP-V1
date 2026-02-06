import { Router } from "express";
import * as AuthController from "../controllers/authController.js";
import { verifyToken } from "../middleware/jwt.js";
import { optionalAuth } from "../middleware/optionalAuth.js";
import upload from "../middleware/upload-foto.js";

const router = Router();

/**
 * PUBLIC ROUTES
 */
router.post("/login", AuthController.login);

/**
 * CONDITIONAL ROUTES
 */
// Register - Public untuk SUPERADMIN pertama, Protected setelahnya
router.post("/register", optionalAuth, AuthController.register);

// REGISTER KARYAWAN + FOTO
router.post(
  "/register-karyawan",
  upload.single("foto"),
  AuthController.registerKaryawan
);

/**
 * PROTECTED ROUTES
 */
router.post("/logout", verifyToken, AuthController.logout);
router.get("/profile", verifyToken, AuthController.getProfile);

export default router;