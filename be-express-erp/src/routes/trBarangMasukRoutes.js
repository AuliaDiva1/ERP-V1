import express from "express";
import * as TrBarangMasukController from "../controllers/trBarangMasukController.js";

const router = express.Router();

router.get("/", TrBarangMasukController.getAllBarangMasuk);
router.post("/", TrBarangMasukController.createBarangMasuk);
router.delete("/:id", TrBarangMasukController.deleteBarangMasuk);

export default router;