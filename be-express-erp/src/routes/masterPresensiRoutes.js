import express from "express";
import * as PresensiController from "../controllers/masterPresensiController.js";
import { uploadPresensi } from "../middleware/upload-foto.js";

const router = express.Router();

/* ===========================================================
 * PUBLIC ROUTES (Tanpa Token - untuk Kios / Dashboard Admin)
 * =========================================================== */

// GET  /api/master-presensi/list-karyawan
router.get("/list-karyawan", PresensiController.getListKaryawan);

// GET  /api/master-presensi/status?karyawan_id=KRY-0001
router.get("/status", PresensiController.cekStatusHarian);

// POST /api/master-presensi/masuk  (field file: FOTO_MASUK)
router.post(
  "/masuk",
  uploadPresensi.single("FOTO_MASUK"),
  PresensiController.presensiMasuk
);

// POST /api/master-presensi/pulang  (field file: FOTO_KELUAR)
router.post(
  "/pulang",
  uploadPresensi.single("FOTO_KELUAR"),
  PresensiController.presensiPulang
);

/* ===========================================================
 * PROTECTED ROUTES
 * =========================================================== */

// GET    /api/master-presensi/rekap
router.get("/rekap", PresensiController.getRekap);

// DELETE /api/master-presensi/:id  ← konsisten dengan frontend
router.delete("/:id", PresensiController.remove);

export default router;