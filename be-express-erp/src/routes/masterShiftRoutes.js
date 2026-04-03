import express from "express";
import * as ShiftController from "../controllers/masterShiftController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();

/* ============================================================
 * PUBLIC — dropdown form karyawan / form absen
 * ============================================================ */

// GET /api/master-shift/aktif
router.get("/aktif", ShiftController.getAktif);

/* ============================================================
 * PROTECTED — CRUD hanya admin
 * ============================================================ */

// GET /api/master-shift
router.get(
  "/",
  verifyToken,
  checkRole(["SUPERADMIN", "HR"]),
  ShiftController.getAll
);

// POST /api/master-shift
router.post(
  "/",
  verifyToken,
  checkRole(["SUPERADMIN", "HR"]),
  ShiftController.create
);

// PUT /api/master-shift/:id
router.put(
  "/:id",
  verifyToken,
  checkRole(["SUPERADMIN", "HR"]),
  ShiftController.update
);

// DELETE /api/master-shift/:id
router.delete(
  "/:id",
  verifyToken,
  checkRole(["SUPERADMIN", "HR"]),
  ShiftController.remove
);

export default router;
