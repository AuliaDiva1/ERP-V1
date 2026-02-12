// controllers/batchKaryawanController.js
import * as BatchKaryawanModel from "../models/batchKaryawanModel.js";
import { datetime, status } from "../utils/general.js";

/**
 * 🔹 Get all batch karyawan
 */
export const getAllBatchKaryawan = async (req, res) => {
  try {
    const data = await BatchKaryawanModel.getAllBatchKaryawan();
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data batch karyawan berhasil diambil",
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getAllBatchKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get karyawan by batch
 */
export const getKaryawanByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const data = await BatchKaryawanModel.getKaryawanByBatch(batchId);
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data karyawan dalam batch berhasil diambil",
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getKaryawanByBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get batch by karyawan
 */
export const getBatchByKaryawan = async (req, res) => {
  try {
    const { karyawanId } = req.params;
    const data = await BatchKaryawanModel.getBatchByKaryawan(karyawanId);
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data batch karyawan berhasil diambil",
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getBatchByKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Assign karyawan ke batch
 */
export const assignKaryawanToBatch = async (req, res) => {
  try {
    const { batch_id, karyawan_id, role_dalam_batch } = req.body;

    // ✅ Validasi field wajib
    if (!batch_id || !karyawan_id) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Batch ID dan Karyawan ID wajib diisi",
        datetime: datetime(),
      });
    }

    // ✅ Check duplikasi
    const isDuplicate = await BatchKaryawanModel.checkDuplicateAssignment(
      batch_id,
      karyawan_id
    );

    if (isDuplicate) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Karyawan sudah terdaftar dalam batch ini",
        datetime: datetime(),
      });
    }

    const data = {
      BATCH_ID: batch_id,
      KARYAWAN_ID: karyawan_id,
      ROLE_DALAM_BATCH: role_dalam_batch || "Member",
    };

    const newAssignment = await BatchKaryawanModel.assignKaryawanToBatch(data);

    return res.status(201).json({
      status: status.SUKSES,
      message: "Karyawan berhasil ditambahkan ke batch",
      datetime: datetime(),
      data: newAssignment,
    });
  } catch (err) {
    console.error("Error assignKaryawanToBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Update status karyawan dalam batch
 */
export const updateStatusKaryawanBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: statusBaru } = req.body;

    if (!statusBaru) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Status wajib diisi",
        datetime: datetime(),
      });
    }

    const updated = await BatchKaryawanModel.updateStatusKaryawanBatch(id, statusBaru);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Status karyawan dalam batch berhasil diperbarui",
      datetime: datetime(),
      data: updated,
    });
  } catch (err) {
    console.error("Error updateStatusKaryawanBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Remove karyawan from batch
 */
export const removeKaryawanFromBatch = async (req, res) => {
  try {
    const removed = await BatchKaryawanModel.removeKaryawanFromBatch(req.params.id);
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Karyawan berhasil dihapus dari batch",
      datetime: datetime(),
      data: removed,
    });
  } catch (err) {
    console.error("Error removeKaryawanFromBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};