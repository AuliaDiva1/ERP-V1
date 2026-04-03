import express from "express";
import * as PresensiController from "../controllers/masterPresensiController.js";
import { uploadPresensi } from "../middleware/upload-foto.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();

/* ============================================================
 * PUBLIC ROUTES (Tanpa Token — untuk Kios / Absen Mandiri)
 * ============================================================ */

// GET /api/master-presensi/list-karyawan
router.get("/list-karyawan", PresensiController.getListKaryawan);

// GET /api/master-presensi/karyawan-info?id=KRY-0008
router.get("/karyawan-info", PresensiController.getKaryawanInfo);

// GET /api/master-presensi/status?karyawan_id=KRY-0001
router.get("/status", PresensiController.cekStatusHarian);

// GET /api/master-presensi/setting
// Mengembalikan: LAT_KANTOR, LON_KANTOR, RADIUS_METER
// Public agar kios absen mandiri bisa akses
router.get("/setting", PresensiController.getSettingPresensi);

// POST /api/master-presensi/masuk
router.post(
  "/masuk",
  uploadPresensi.single("FOTO_MASUK"),
  PresensiController.presensiMasuk
);

// POST /api/master-presensi/pulang
router.post(
  "/pulang",
  uploadPresensi.single("FOTO_KELUAR"),
  PresensiController.presensiPulang
);

/* ============================================================
 * PROTECTED ROUTES (Wajib Token + Role)
 * ============================================================ */

// GET /api/master-presensi/rekap
router.get(
  "/rekap",
  verifyToken,
  checkRole(["SUPERADMIN", "HR"]),
  PresensiController.getRekap
);

// DELETE /api/master-presensi/:id
router.delete(
  "/:id",
  verifyToken,
  checkRole(["SUPERADMIN", "HR"]),
  PresensiController.remove
);

export default router;
