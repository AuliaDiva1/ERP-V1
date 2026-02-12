// routes/batchKaryawanRoutes.js
import express from "express";
import * as BatchKaryawanController from "../controllers/batchKaryawanController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();

// ✅ Semua route memerlukan autentikasi
router.use(verifyToken);

// ✅ GET: Ambil karyawan by batch
router.get(
  "/batch/:batchId",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"]),
  BatchKaryawanController.getKaryawanByBatch
);

// ✅ GET: Ambil batch by karyawan
router.get(
  "/karyawan/:karyawanId",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"]),
  BatchKaryawanController.getBatchByKaryawan
);

// ✅ GET: Ambil semua batch karyawan
router.get(
  "/",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI"]),
  BatchKaryawanController.getAllBatchKaryawan
);

// ✅ POST: Assign karyawan ke batch
router.post(
  "/",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI"]),
  BatchKaryawanController.assignKaryawanToBatch
);

// ✅ PATCH: Update status karyawan dalam batch
router.patch(
  "/:id/status",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI"]),
  BatchKaryawanController.updateStatusKaryawanBatch
);

// ✅ DELETE: Remove karyawan dari batch
router.delete(
  "/:id",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI"]),
  BatchKaryawanController.removeKaryawanFromBatch
);

export default router;