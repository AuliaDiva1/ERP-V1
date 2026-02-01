import express from "express";
import * as MasterVendorController from "../controllers/masterVendorController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();

// Semua route memerlukan autentikasi
router.use(verifyToken);

// Ambil semua vendor - Hanya SUPERADMIN yang bisa akses
router.get("/", checkRole(["SUPERADMIN"]), MasterVendorController.getAllVendor);

// Ambil vendor by ID - Hanya SUPERADMIN yang bisa akses
router.get("/:id", checkRole(["SUPERADMIN"]), MasterVendorController.getVendorById);

// Tambah vendor - Hanya SUPERADMIN yang bisa akses
router.post("/", checkRole(["SUPERADMIN"]), MasterVendorController.createVendor);

// Update vendor - Hanya SUPERADMIN yang bisa akses
router.put("/:id", checkRole(["SUPERADMIN"]), MasterVendorController.updateVendor);

// Hapus vendor - Hanya SUPERADMIN yang bisa akses
router.delete("/:id", checkRole(["SUPERADMIN"]), MasterVendorController.deleteVendor);

export default router;