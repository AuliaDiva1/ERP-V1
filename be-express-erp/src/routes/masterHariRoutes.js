import express from "express";
import * as MasterHariController from "../controllers/masterHariController.js";

const router = express.Router();

// Ambil semua hari
router.get("/", MasterHariController.getAllHari);

// Ambil hari by ID (Primary Key: ID)
router.get("/:id", MasterHariController.getHariById);

// Tambah hari (Payload: HARI_ID, NAMA_HARI, URUTAN, dll)
router.post("/", MasterHariController.createHari);

// Update hari by ID
router.put("/:id", MasterHariController.updateHari);

// Hapus hari by ID
router.delete("/:id", MasterHariController.deleteHari);

export default router;