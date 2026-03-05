import express from "express";
import * as Controller from "../controllers/masterPayrollController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();
router.use(verifyToken);

const ADMIN = ["SUPERADMIN", "HR"];
const ALL   = ["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"];

// ── Static routes HARUS sebelum /:id ──────────────────────────
// Summary & Preview
router.get("/summary",          checkRole(ADMIN), Controller.getSummary);
router.get("/preview",          checkRole(ADMIN), Controller.preview);

// Generate (POST — pindah ke atas sebelum /:id)
router.post("/generate",        checkRole(ADMIN), Controller.generate);
router.post("/generate-bulk",   checkRole(ADMIN), Controller.generateBulk);

// ── Dynamic routes (:id) SETELAH semua static routes ──────────
// List & Detail
router.get("/",                 checkRole(ALL),   Controller.getAll);
router.get("/:id",              checkRole(ALL),   Controller.getById);

// Status Transitions
router.patch("/:id/approve",    checkRole(ADMIN), Controller.approve);
router.patch("/:id/paid",       checkRole(ADMIN), Controller.markPaid);

// Delete
router.delete("/:id",           checkRole(ADMIN), Controller.remove);

export default router;
