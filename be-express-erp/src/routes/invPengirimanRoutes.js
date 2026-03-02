import express from "express";
const router = express.Router();
import * as Ctrl from "../controllers/invPengirimanController.js";

// [GET] Ambil semua list pengiriman (Header)
router.get("/", Ctrl.getAllPengiriman);

// [GET] Ambil detail (Gunakan wildcard (*) agar tanda / tidak 404)
router.get("/detail/:no_pengiriman(*)", Ctrl.getDetailsByNo);

// [POST] Simpan baru (Header + Detail)
router.post("/full", Ctrl.createFullPengiriman);

// [PUT] Update data (Header + Detail) - TAMBAHKAN INI
router.put("/:id", Ctrl.updateFullPengiriman);

// [DELETE] Hapus (Berdasarkan ID Header)
router.delete("/:id", Ctrl.deletePengiriman);

export default router;