// controllers/masterBatchController.js
import * as BatchModel from "../models/masterBatchModel.js";
import { db } from "../core/config/knex.js";
import { datetime, status } from "../utils/general.js";

/**
 * 🔹 Helper: Get KARYAWAN_ID dari user_id
 */
const getKaryawanIdFromUserId = async (userId) => {
  const karyawan = await db("master_karyawan")
    .leftJoin("users", "master_karyawan.EMAIL", "users.email")
    .select("master_karyawan.KARYAWAN_ID")
    .where("users.id", userId)
    .first();
  
  return karyawan?.KARYAWAN_ID || null;
};

/**
 * 🔹 Get all batch
 */
export const getAllBatch = async (req, res) => {
  try {
    const data = await BatchModel.getAllBatch();
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data batch berhasil diambil",
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getAllBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get batch by ID
 */
export const getBatchById = async (req, res) => {
  try {
    const data = await BatchModel.getBatchById(req.params.id);
    
    if (!data) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Batch tidak ditemukan",
        datetime: datetime(),
      });
    }
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data batch ditemukan",
      datetime: datetime(),
      data,
    });
  } catch (err) {
    console.error("Error getBatchById:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get batch by BATCH_ID
 */
export const getBatchByBatchId = async (req, res) => {
  try {
    const data = await BatchModel.getBatchByBatchId(req.params.batchId);
    
    if (!data) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Batch tidak ditemukan",
        datetime: datetime(),
      });
    }
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data batch ditemukan",
      datetime: datetime(),
      data,
    });
  } catch (err) {
    console.error("Error getBatchByBatchId:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get batch by status
 */
export const getBatchByStatus = async (req, res) => {
  try {
    const { status: batchStatus } = req.params;
    const data = await BatchModel.getBatchByStatus(batchStatus);
    
    return res.status(200).json({
      status: status.SUKSES,
      message: `Data batch dengan status ${batchStatus} berhasil diambil`,
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getBatchByStatus:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Create batch
 */
export const createBatch = async (req, res) => {
  try {
    const {
      nama_batch,
      jenis_batch,
      kategori_produk,
      kode_produk,
      target_jumlah,
      satuan,
      spesifikasi,
      tanggal_mulai,
      tanggal_target_selesai,
      estimasi_jam_kerja,
      jumlah_karyawan_dibutuhkan,
      catatan,
    } = req.body;

    // ✅ Validasi field wajib
    if (!nama_batch || !jenis_batch || !target_jumlah) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Nama batch, jenis batch, dan target jumlah wajib diisi",
        datetime: datetime(),
      });
    }

    // ✅ Generate BATCH_ID otomatis
    const batchId = await BatchModel.generateBatchId(jenis_batch);

    // ✅ Ambil KARYAWAN_ID dari user yang login
    const userId = req.user?.userId;
    const createdByKaryawan = await getKaryawanIdFromUserId(userId);

    const batchData = {
      BATCH_ID: batchId,
      NAMA_BATCH: nama_batch,
      JENIS_BATCH: jenis_batch,
      KATEGORI_PRODUK: kategori_produk || null,
      KODE_PRODUK: kode_produk || null,
      TARGET_JUMLAH: target_jumlah,
      SATUAN: satuan || null,
      SPESIFIKASI: spesifikasi || null,
      TANGGAL_MULAI: tanggal_mulai || null,
      TANGGAL_TARGET_SELESAI: tanggal_target_selesai || null,
      ESTIMASI_JAM_KERJA: estimasi_jam_kerja || null,
      JUMLAH_KARYAWAN_DIBUTUHKAN: jumlah_karyawan_dibutuhkan || null,
      CATATAN: catatan || null,
      CREATED_BY_KARYAWAN: createdByKaryawan,
      STATUS_BATCH: "Pending", // ✅ PAKSA DARI BACKEND - FE TIDAK BISA OVERRIDE
    };

    const newBatch = await BatchModel.createBatch(batchData);

    return res.status(201).json({
      status: status.SUKSES,
      message: "Batch berhasil dibuat",
      datetime: datetime(),
      batch_id: batchId,
      data: newBatch,
    });
  } catch (err) {
    console.error("Error createBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Update batch
 */
export const updateBatch = async (req, res) => {
  try {
    const batchId = req.params.id;
    const existingBatch = await BatchModel.getBatchById(batchId);

    if (!existingBatch) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Batch tidak ditemukan",
        datetime: datetime(),
      });
    }

    const {
      nama_batch,
      kategori_produk,
      kode_produk,
      target_jumlah,
      satuan,
      spesifikasi,
      tanggal_mulai,
      tanggal_target_selesai,
      tanggal_selesai_aktual,  // ⚠️ INI MUNGKIN MASALAH
      estimasi_jam_kerja,
      jumlah_karyawan_dibutuhkan,
      status_batch,
      catatan,
    } = req.body;

    // ✅ PENTING: TANGGAL_SELESAI_AKTUAL TIDAK BOLEH MANUAL UPDATE
    // Hanya boleh di-set otomatis oleh sistem saat status Completed

    const batchData = {
      NAMA_BATCH: nama_batch || existingBatch.NAMA_BATCH,
      KATEGORI_PRODUK: kategori_produk !== undefined ? kategori_produk : existingBatch.KATEGORI_PRODUK,
      KODE_PRODUK: kode_produk !== undefined ? kode_produk : existingBatch.KODE_PRODUK,
      TARGET_JUMLAH: target_jumlah || existingBatch.TARGET_JUMLAH,
      SATUAN: satuan !== undefined ? satuan : existingBatch.SATUAN,
      SPESIFIKASI: spesifikasi !== undefined ? spesifikasi : existingBatch.SPESIFIKASI,
      TANGGAL_MULAI: tanggal_mulai !== undefined ? tanggal_mulai : existingBatch.TANGGAL_MULAI,
      TANGGAL_TARGET_SELESAI: tanggal_target_selesai !== undefined ? tanggal_target_selesai : existingBatch.TANGGAL_TARGET_SELESAI,
      // ❌ JANGAN UPDATE TANGGAL_SELESAI_AKTUAL MANUAL
      // TANGGAL_SELESAI_AKTUAL hanya boleh di-set oleh sistem
      ESTIMASI_JAM_KERJA: estimasi_jam_kerja !== undefined ? estimasi_jam_kerja : existingBatch.ESTIMASI_JAM_KERJA,
      JUMLAH_KARYAWAN_DIBUTUHKAN: jumlah_karyawan_dibutuhkan !== undefined ? jumlah_karyawan_dibutuhkan : existingBatch.JUMLAH_KARYAWAN_DIBUTUHKAN,
      STATUS_BATCH: status_batch || existingBatch.STATUS_BATCH,
      CATATAN: catatan !== undefined ? catatan : existingBatch.CATATAN,
    };

    const updatedBatch = await BatchModel.updateBatch(batchId, batchData);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Batch berhasil diperbarui",
      datetime: datetime(),
      data: updatedBatch,
    });
  } catch (err) {
    console.error("Error updateBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Delete batch
 */
export const deleteBatch = async (req, res) => {
  try {
    const batch = await BatchModel.deleteBatch(req.params.id);
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Batch berhasil dihapus",
      datetime: datetime(),
      data: batch,
    });
  } catch (err) {
    console.error("Error deleteBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Update status batch
 */
export const updateStatusBatch = async (req, res) => {
  try {
    const batchId = req.params.id;
    const { status_batch } = req.body;

    if (!status_batch) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Status batch wajib diisi",
        datetime: datetime(),
      });
    }

    const existingBatch = await BatchModel.getBatchById(batchId);
    if (!existingBatch) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Batch tidak ditemukan",
        datetime: datetime(),
      });
    }

    const updatedBatch = await BatchModel.updateBatch(batchId, {
      STATUS_BATCH: status_batch,
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: `Status batch berhasil diubah menjadi ${status_batch}`,
      datetime: datetime(),
      data: updatedBatch,
    });
  } catch (err) {
    console.error("Error updateStatusBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Auto-update status batch berdasarkan progress
 */
export const autoUpdateStatusBatch = async (req, res) => {
  try {
    const batchId = req.params.batchId;
    
    const newStatus = await BatchModel.autoUpdateBatchStatus(batchId);
    
    if (!newStatus) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Batch tidak ditemukan",
        datetime: datetime(),
      });
    }

    const updatedBatch = await BatchModel.getBatchByBatchId(batchId);

    return res.status(200).json({
      status: status.SUKSES,
      message: `Status batch: ${newStatus}`,
      datetime: datetime(),
      data: updatedBatch,
    });
  } catch (err) {
    console.error("Error autoUpdateStatusBatch:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Recalculate batch progress (Fix corrupted data)
 */
export const recalculateBatchProgress = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await db("master_batch")
      .where("BATCH_ID", batchId)
      .first();

    if (!batch) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Batch tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ Hitung ulang dari SUM logbook approved
    const result = await db("logbook_pekerjaan")
      .where({
        BATCH_ID: batchId,
        STATUS: "Approved"
      })
      .sum("JUMLAH_OUTPUT as total");

    const correctTotal = parseInt(result[0]?.total) || 0;

    // Update batch dengan total yang benar
    await db("master_batch")
      .where("BATCH_ID", batchId)
      .update({
        JUMLAH_SELESAI: correctTotal,
        updated_at: db.fn.now(),
      });

    // Auto-update status
    let newStatus = batch.STATUS_BATCH;
    if (correctTotal >= batch.TARGET_JUMLAH && batch.STATUS_BATCH !== "Completed") {
      newStatus = "Completed";
      await db("master_batch")
        .where("BATCH_ID", batchId)
        .update({
          STATUS_BATCH: "Completed",
          TANGGAL_SELESAI_AKTUAL: db.fn.now(),
        });
    } else if (correctTotal > 0 && batch.STATUS_BATCH === "Pending") {
      newStatus = "In Progress";
      await db("master_batch")
        .where("BATCH_ID", batchId)
        .update({
          STATUS_BATCH: "In Progress",
        });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Batch progress berhasil di-recalculate",
      datetime: datetime(),
      data: {
        batch_id: batchId,
        old_jumlah_selesai: batch.JUMLAH_SELESAI,
        correct_jumlah_selesai: correctTotal,
        difference: batch.JUMLAH_SELESAI - correctTotal,
        old_status: batch.STATUS_BATCH,
        new_status: newStatus,
      },
    });
  } catch (err) {
    console.error("Error recalculateBatchProgress:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Recalculate ALL batches
 */
export const recalculateAllBatches = async (req, res) => {
  try {
    const batches = await db("master_batch").select("BATCH_ID");
    
    const results = [];

    for (const batch of batches) {
      const result = await db("logbook_pekerjaan")
        .where({
          BATCH_ID: batch.BATCH_ID,
          STATUS: "Approved"
        })
        .sum("JUMLAH_OUTPUT as total");

      const correctTotal = parseInt(result[0]?.total) || 0;

      await db("master_batch")
        .where("BATCH_ID", batch.BATCH_ID)
        .update({
          JUMLAH_SELESAI: correctTotal,
          updated_at: db.fn.now(),
        });

      results.push({
        batch_id: batch.BATCH_ID,
        recalculated_total: correctTotal,
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: `${batches.length} batch berhasil di-recalculate`,
      datetime: datetime(),
      data: results,
    });
  } catch (err) {
    console.error("Error recalculateAllBatches:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};