import express from "express";
import * as PayCtrl from "../controllers/pembayaranBeliController.js";

const router = express.Router();

router.post("/", PayCtrl.createPembayaran);
router.get("/history/:no_invoice", PayCtrl.getHistory);
router.delete("/:id", PayCtrl.deletePay);

export default router;