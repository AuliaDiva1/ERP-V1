import express from "express";
import * as MasterRakController from "../controllers/masterRakController.js";

const router = express.Router();

/**
 * Pastikan penamaan fungsi di bawah ini 
 * SAMA PERSIS dengan nama fungsi di MasterRakController.js
 */

// Menampilkan semua rak
router.get("/", MasterRakController.getAllRak); 

// Menampilkan rak berdasarkan kode gudang
router.get("/gudang/:kode_gudang", MasterRakController.getRakByGudang);

// Menambah rak baru
router.post("/", MasterRakController.createRak);

// Update rak (menggunakan :id sebagai parameter ID_RAK)
router.put("/:id", MasterRakController.updateRak);

// Hapus rak
router.delete("/:id", MasterRakController.deleteRak);

export default router;