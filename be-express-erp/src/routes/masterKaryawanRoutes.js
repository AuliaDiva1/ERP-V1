// routes/karyawanRoutes.js
import express from "express";
import * as KaryawanController from "../controllers/masterKaryawanController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";
import upload from "../middleware/upload-foto.js";

const router = express.Router();

// ✅ Semua route memerlukan autentikasi
router.use(verifyToken);

// ✅ GET: Ambil karyawan by DEPARTEMEN
router.get("/departemen/:departemen", 
  checkRole(["SUPERADMIN", "HR"]), 
  KaryawanController.getKaryawanByDepartemenController
);

// ✅ GET: Ambil karyawan by JABATAN
router.get("/jabatan/:jabatan", 
  checkRole(["SUPERADMIN", "HR"]), 
  KaryawanController.getKaryawanByJabatanController
);

// ✅ GET: Ambil semua karyawan
router.get("/", 
  checkRole(["SUPERADMIN", "HR"]), 
  KaryawanController.getAllKaryawan
);

// ✅ GET: Ambil karyawan by ID (HARUS di bawah route spesifik)
router.get("/:id", 
  checkRole(["SUPERADMIN", "HR"]), 
  KaryawanController.getKaryawanById
);

// ✅ POST: Tambah karyawan baru
router.post("/", 
  checkRole(["SUPERADMIN", "HR"]), 
  upload.single("foto"), 
  KaryawanController.createKaryawan
);

// ✅ PUT: Update karyawan
router.put("/:id", 
  checkRole(["SUPERADMIN", "HR"]), 
  upload.single("foto"), 
  KaryawanController.updateKaryawan
);

// ✅ PATCH: Toggle status aktif
router.patch("/:id/toggle-status", 
  checkRole(["SUPERADMIN", "HR"]), 
  KaryawanController.toggleStatusKaryawan
);

// ✅ DELETE: Hapus karyawan
router.delete("/:id", 
  checkRole(["SUPERADMIN"]), 
  KaryawanController.deleteKaryawan
);

export default router;