import { Router } from "express";
import {
  createMonitorSuhu,
  destroyMonitorSuhu,
  fetchAllMonitorSuhu,
  fetchMonitorSuhuById,
  importDataFromExcel,
  updateMonitorSuhu,
} from "../controllers/monitorSuhuController.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/", fetchAllMonitorSuhu);
router.post("/import", upload.single("file"), importDataFromExcel);
router.post("/create", createMonitorSuhu);
router.put("/edit/:id", updateMonitorSuhu);
router.delete("/delete/:id", destroyMonitorSuhu);
router.get("/:id", fetchMonitorSuhuById);

export default router;
