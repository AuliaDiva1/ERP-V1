import express from "express";
import * as Controller from "../controllers/masterPresensiController.js";
import { uploadPresensi } from "../middleware/upload-foto.js";

const router = express.Router();

router.get("/status", Controller.cekStatusHarian);
router.post("/masuk", uploadPresensi.single("FOTO_MASUK"), Controller.presensiMasuk);
router.post("/pulang", uploadPresensi.single("FOTO_KELUAR"), Controller.presensiPulang);
router.get("/rekap", Controller.getRekap);
router.delete("/:id", Controller.remove);

export default router;