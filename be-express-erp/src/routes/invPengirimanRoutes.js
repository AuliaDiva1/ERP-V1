import express from "express";
import * as InvPengirimanHController from "../controllers/invPengirimanHController.js";

const router = express.Router();

router.get("/", InvPengirimanHController.getAllPengirimanH);
router.get("/:id", InvPengirimanHController.getPengirimanHById); // Tadi salah di sini
router.post("/", InvPengirimanHController.createPengirimanH);
router.delete("/:id", InvPengirimanHController.deletePengirimanH);

export default router;