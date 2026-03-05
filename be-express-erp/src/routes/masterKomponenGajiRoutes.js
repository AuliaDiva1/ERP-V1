import express from "express";
import * as Controller from "../controllers/masterKomponenGajiController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();
router.use(verifyToken);

const ADMIN = ["SUPERADMIN", "HR"];
const ALL   = ["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"];

router.get("/",                       checkRole(ADMIN), Controller.getAll);
router.get("/:karyawan_id",           checkRole(ALL),   Controller.getByKaryawan);
router.post("/:karyawan_id",          checkRole(ADMIN), Controller.upsert);
router.put("/:karyawan_id",           checkRole(ADMIN), Controller.upsert);
router.delete("/:karyawan_id",        checkRole(ADMIN), Controller.remove);

export default router;