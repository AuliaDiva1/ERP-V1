import express from "express";
import * as Controller from "../controllers/masterGajiJabatanController.js";
import { verifyToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/roleCheck.js";

const router = express.Router();
router.use(verifyToken);

const ADMIN = ["SUPERADMIN", "HR"];
const ALL   = ["SUPERADMIN", "HR", "PRODUKSI", "GUDANG", "KEUANGAN"];

router.get("/distinct-jabatan", checkRole(ALL),  Controller.getDistinctJabatan);
router.get("/",                 checkRole(ALL),  Controller.getAll);
router.get("/:id",              checkRole(ALL),  Controller.getById);
router.post("/",                checkRole(ADMIN), Controller.create);
router.put("/:id",              checkRole(ADMIN), Controller.update);
router.delete("/:id",           checkRole(ADMIN), Controller.remove);

export default router;