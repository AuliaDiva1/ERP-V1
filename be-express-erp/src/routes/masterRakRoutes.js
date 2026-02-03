import express from "express";
import * as MasterRakController from "../controllers/masterRakController.js";

const router = express.Router();

// Pastikan nama setelah MasterRakController. SAMA PERSIS dengan di controller
router.get("/", MasterRakController.getAllRak); // <-- Baris 6 (Sering jadi penyebab error)
router.get("/gudang/:kode_gudang", MasterRakController.getRakByGudang);
router.post("/", MasterRakController.createRak);
router.put("/:id", MasterRakController.updateRak);
router.delete("/:id", MasterRakController.deleteRak);

export default router;