import express from "express";
import * as MasterPengajuanController from "../controllers/masterPengajuanController.js";

const router = express.Router();

// Ambil semua master pengajuan
router.get("/", MasterPengajuanController.getAllPengajuan);

// Ambil master pengajuan by ID
router.get("/:id", MasterPengajuanController.getPengajuanById);

// Tambah master pengajuan baru
router.post("/", MasterPengajuanController.createPengajuan);

// Update master pengajuan
router.put("/:id", MasterPengajuanController.updatePengajuan);

// Hapus master pengajuan
router.delete("/:id", MasterPengajuanController.deletePengajuan);

export default router;