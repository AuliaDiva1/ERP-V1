import express from "express";
import * as InvController from "../controllers/invPembelianController.js";

const router = express.Router();

router.get("/", InvController.getAllInvPembelian);
router.get("/:id", InvController.getInvPembelianById);
router.post("/", InvController.createInvPembelian);
router.put("/:id", InvController.updateInvPembelian);
router.delete("/:id", InvController.deleteInvPembelian);

export default router;