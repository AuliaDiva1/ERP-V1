import express from "express";
import * as InvController from "../controllers/invPembelianController.js";
// IMPORT CONTROLLER PEMBAYARANNYA DISINI OM
import * as PayController from "../controllers/pembayaranBeliController.js"; 

const router = express.Router();

/** * ==========================================
 * ROUTES: INVOICE PEMBELIAN (HEADER)
 * ==========================================
 */
router.get("/", InvController.getAllInvPembelian);
router.get("/:id", InvController.getInvPembelianById);
router.post("/", InvController.createInvPembelian);
router.put("/:id", InvController.updateInvPembelian);
router.delete("/:id", InvController.deleteInvPembelian);


/** * ==========================================
 * ROUTES: DETAIL PEMBELIAN (ITEMS & STOK)
 * ==========================================
 */
router.get("/detail/:noInvoice", InvController.getDetailByInvoice);
router.post("/detail", InvController.addItemsToInvoice);
router.delete("/detail/:idDetail", InvController.deleteDetailItem);


/** * ==========================================
 * ROUTES: TRANSACTIONAL (HEADER + DETAIL)
 * ==========================================
 */
router.post("/full", InvController.createFullPurchase);


/** * ==========================================
 * ROUTES: PAYMENT (PELUNASAN HUTANG)
 * Ditambahkan untuk handle FormPelunasan Om
 * ==========================================
 */

// 1. Simpan Pembayaran Baru (Cicil/Lunas)
// Digunakan oleh handleSavePelunasan di Frontend
router.post("/payment", PayController.createPembayaran);

// 2. Ambil Riwayat Pembayaran berdasarkan No Invoice
router.get("/payment/history/:no_invoice", PayController.getHistory);

// 3. Batalkan/Hapus Pembayaran (VOID)
router.delete("/payment/:id", PayController.deletePay);


export default router;