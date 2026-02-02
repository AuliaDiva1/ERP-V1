import express from "express";
import * as MasterJenisController from "../controllers/masterJenisBarangController.js";

const router = express.Router();

// Ambil semua jenis barang
router.get("/", MasterJenisController.getAllJenis);

// Ambil jenis barang by ID
router.get("/:id", MasterJenisController.getJenisById);

// Tambah jenis barang
router.post("/", MasterJenisController.createJenis);

// Update jenis barang
router.put("/:id", MasterJenisController.updateJenis);

// Hapus jenis barang
router.delete("/:id", MasterJenisController.deleteJenis);

export default router;