import express from "express";
import * as Controller from "../controllers/masterPerusahaanController.js";

const router = express.Router();

/**
 * @route   GET /api/perusahaan
 * @desc    Ambil semua data master perusahaan
 */
router.get("/", Controller.getAll);

/**
 * @route   GET /api/perusahaan/:id
 * @desc    Ambil satu data perusahaan berdasarkan ID
 */
router.get("/:id", Controller.getById);

/**
 * @route   POST /api/perusahaan
 * @desc    Tambah data perusahaan baru
 */
router.post("/", Controller.create);

/**
 * @route   PUT /api/perusahaan/:id
 * @desc    Update data perusahaan berdasarkan ID
 */
router.put("/:id", Controller.update);

/**
 * @route   DELETE /api/perusahaan/:id
 * @desc    Hapus data perusahaan berdasarkan ID
 */
router.delete("/:id", Controller.remove);

export default router;