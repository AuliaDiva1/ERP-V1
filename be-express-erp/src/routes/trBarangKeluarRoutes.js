import express from "express";
import * as TrBarangKeluarController from "../controllers/trBarangKeluarController.js";

const router = express.Router();

router.get("/", TrBarangKeluarController.getAllBarangKeluar);
router.post("/", TrBarangKeluarController.createBarangKeluar);
router.delete("/:id", TrBarangKeluarController.deleteBarangKeluar);

export default router;