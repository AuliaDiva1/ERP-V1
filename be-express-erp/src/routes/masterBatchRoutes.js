// routes/masterBatchRoutes.js
import express from "express";
import * as BatchController from "../controllers/masterBatchController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();

// ✅ Semua route memerlukan autentikasi
router.use(verifyToken);

// ✅ GET: Ambil batch by status (HARUS SEBELUM /:id)
router.get(
  "/status/:status",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"]),
  BatchController.getBatchByStatus
);

// ✅ GET: Ambil batch by BATCH_ID (HARUS SEBELUM /:id)
router.get(
  "/batch/:batchId",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"]),
  BatchController.getBatchByBatchId
);

// ✅ GET: Ambil semua batch
router.get(
  "/",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"]),
  BatchController.getAllBatch
);

// ✅ POST: Buat batch baru
router.post(
  "/",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI"]),
  BatchController.createBatch
);

// ✅ PATCH: Update status batch
router.patch(
  "/:id/status",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI"]),
  BatchController.updateStatusBatch
);

// ✅ PUT: Update batch
router.put(
  "/:id",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI"]),
  BatchController.updateBatch
);

// ✅ DELETE: Hapus batch
router.delete(
  "/:id",
  checkRole(["SUPERADMIN", "HR"]),
  BatchController.deleteBatch
);

// ✅ PATCH: Recalculate single batch
router.patch(
  "/:batchId/recalculate",
  checkRole(["SUPERADMIN", "HR"]),
  BatchController.recalculateBatchProgress
);

// ✅ POST: Recalculate ALL batches
router.post(
  "/recalculate-all",
  checkRole(["SUPERADMIN"]),
  BatchController.recalculateAllBatches
);

// ✅ GET: Ambil batch by ID (HARUS PALING BAWAH)
router.get(
  "/:id",
  checkRole(["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"]),
  BatchController.getBatchById
);

export default router;