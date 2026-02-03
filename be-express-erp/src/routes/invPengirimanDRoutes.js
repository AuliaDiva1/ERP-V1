import express from "express";
import * as InvPengirimanDController from "../controllers/invPengirimanDController.js";

const router = express.Router();

router.get("/:no_pengiriman", InvPengirimanDController.getDetailsByNo);
router.post("/", InvPengirimanDController.createDetails);
router.delete("/:id", InvPengirimanDController.deleteDetail); // Tambahkan ini untuk pembatalan per item

export default router;