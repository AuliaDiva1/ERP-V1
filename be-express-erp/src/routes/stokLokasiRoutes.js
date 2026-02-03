import express from "express";
import * as StokLokasiController from "../controllers/stokLokasiController.js";

const router = express.Router();

router.get("/", StokLokasiController.getAllStok);           // Lihat semua saldo stok
router.get("/filter", StokLokasiController.getStokByFilter); // Lihat stok per Gudang/Rak

export default router;