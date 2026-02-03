import express from "express";
import * as MasterSatuanController from "../controllers/masterSatuanBarangController.js";

const router = express.Router();

// Ambil semua satuan
router.get("/", MasterSatuanController.getAllSatuan);

// Ambil satuan by ID
router.get("/:id", MasterSatuanController.getSatuanById);

// Tambah satuan
router.post("/", MasterSatuanController.createSatuan);

// Update satuan
router.put("/:id", MasterSatuanController.updateSatuan);

// Hapus satuan
router.delete("/:id", MasterSatuanController.deleteSatuan);

export default router;