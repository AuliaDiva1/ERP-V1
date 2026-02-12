// controllers/logbookPekerjaanController.js - UPDATED WITH BATCH VALIDATION
import * as LogbookModel from "../models/logbookPekerjaanModel.js";
import { datetime, status } from "../utils/general.js";
import { db } from "../core/config/knex.js";

/**
 * 🔹 Helper: Check if karyawan is assigned to batch
 */
const checkBatchAssignment = async (batchId, karyawanId) => {
  const assignment = await db("batch_karyawan")
    .where({
      BATCH_ID: batchId,
      KARYAWAN_ID: karyawanId,
      STATUS: "Aktif" // ✅ Hanya yang masih aktif
    })
    .first();

  return assignment;
};

/**
 * 🔹 Get all logbook (HR bisa lihat semua, departemen lain hanya lihat miliknya)
 */
export const getAllLogbook = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const karyawanId = req.user?.karyawan_id;

    const filters = {};

    // ✅ Jika bukan HR, hanya bisa lihat logbook miliknya sendiri
    if (userRole !== "HR" && userRole !== "SUPERADMIN") {
      filters.karyawanId = karyawanId;
    }

    // ✅ Filter tambahan dari query params
    if (req.query.batch_id) {
      filters.batchId = req.query.batch_id;
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.tanggal_mulai && req.query.tanggal_selesai) {
      filters.tanggalMulai = req.query.tanggal_mulai;
      filters.tanggalSelesai = req.query.tanggal_selesai;
    }

    const data = await LogbookModel.getAllLogbook(filters);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data logbook berhasil diambil",
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getAllLogbook:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get logbook by ID
 */
export const getLogbookById = async (req, res) => {
  try {
    const data = await LogbookModel.getLogbookById(req.params.id);

    if (!data) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Logbook tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ Validasi akses: hanya pemilik atau HR yang bisa lihat detail
    const userRole = req.user?.role;
    const karyawanId = req.user?.karyawan_id;

    if (
      userRole !== "HR" &&
      userRole !== "SUPERADMIN" &&
      data.KARYAWAN_ID !== karyawanId
    ) {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Anda tidak memiliki akses ke logbook ini",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data logbook ditemukan",
      datetime: datetime(),
      data,
    });
  } catch (err) {
    console.error("Error getLogbookById:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Create logbook (hanya PRODUKSI, GUDANG, KEUANGAN)
 * ✅ UPDATED: Validasi assignment ke batch
 */
export const createLogbook = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const karyawanId = req.user?.karyawan_id;

    // ✅ Validasi role: hanya PRODUKSI, GUDANG, KEUANGAN yang bisa create
    if (!["PRODUKSI", "GUDANG", "KEUANGAN"].includes(userRole)) {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Hanya departemen PRODUKSI, GUDANG, dan KEUANGAN yang dapat membuat logbook",
        datetime: datetime(),
      });
    }

    const {
      batch_id,
      tanggal,
      jam_mulai,
      jam_selesai,
      aktivitas,
      deskripsi,
      jumlah_output,
      kendala,
    } = req.body;

    // ✅ Validasi field wajib
    if (!batch_id || !tanggal || !jam_mulai || !aktivitas) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Batch ID, Tanggal, Jam Mulai, dan Aktivitas wajib diisi",
        datetime: datetime(),
      });
    }

    // ========================================
    // ✅ CRITICAL: Validasi assignment ke batch
    // ========================================
    const assignment = await checkBatchAssignment(batch_id, karyawanId);
    
    if (!assignment) {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Anda tidak terdaftar dalam batch ini. Silakan hubungi admin untuk assign ke batch terlebih dahulu.",
        datetime: datetime(),
        details: {
          batch_id,
          karyawan_id: karyawanId,
          hint: "Pastikan Anda sudah di-assign ke batch melalui menu Batch Management"
        }
      });
    }

    // ✅ Cek status batch
    const batch = await db("master_batch")
      .where("BATCH_ID", batch_id)
      .first();

    if (!batch) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Batch tidak ditemukan",
        datetime: datetime(),
      });
    }

    if (batch.STATUS_BATCH === "Completed") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Batch sudah selesai, tidak dapat menambah logbook",
        datetime: datetime(),
      });
    }

    if (batch.STATUS_BATCH === "Cancelled") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Batch sudah dibatalkan, tidak dapat menambah logbook",
        datetime: datetime(),
      });
    }

    // ✅ Generate LOGBOOK_ID otomatis
    const logbookId = await LogbookModel.generateLogbookId();

    // ✅ Hitung JAM_KERJA otomatis
    const jamKerja = jam_selesai
      ? LogbookModel.calculateJamKerja(jam_mulai, jam_selesai)
      : 0;

    // ✅ Handle foto upload (menggunakan middleware uploadLogbook)
    const fotoBukti = req.file
      ? `/uploads/foto_logbook/${req.file.filename}`
      : null;

    const logbookData = {
      LOGBOOK_ID: logbookId,
      KARYAWAN_ID: karyawanId,
      BATCH_ID: batch_id,
      TANGGAL: tanggal,
      JAM_MULAI: jam_mulai,
      JAM_SELESAI: jam_selesai || null,
      JAM_KERJA: jamKerja,
      AKTIVITAS: aktivitas,
      DESKRIPSI: deskripsi || null,
      JUMLAH_OUTPUT: jumlah_output || 0,
      KENDALA: kendala || null,
      FOTO_BUKTI: fotoBukti,
      CREATED_BY_KARYAWAN: karyawanId,
    };

    const newLogbook = await LogbookModel.createLogbook(logbookData);

    // ✅ Log assignment info untuk audit
    console.log(`✅ Logbook created by ${karyawanId} for batch ${batch_id} (Role: ${assignment.ROLE_DALAM_BATCH})`);

    return res.status(201).json({
      status: status.SUKSES,
      message: "Logbook berhasil dibuat",
      datetime: datetime(),
      logbook_id: logbookId,
      data: newLogbook,
      assignment_info: {
        role: assignment.ROLE_DALAM_BATCH,
        status: assignment.STATUS
      }
    });
  } catch (err) {
    console.error("Error createLogbook:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Update logbook (hanya pemilik yang bisa edit, dan hanya jika status masih Draft)
 */
export const updateLogbook = async (req, res) => {
  try {
    const logbookId = req.params.id;
    const karyawanId = req.user?.karyawan_id;

    const existingLogbook = await LogbookModel.getLogbookById(logbookId);

    if (!existingLogbook) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Logbook tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ Validasi: hanya pemilik yang bisa edit
    if (existingLogbook.KARYAWAN_ID !== karyawanId) {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Anda tidak memiliki izin untuk mengubah logbook ini",
        datetime: datetime(),
      });
    }

    // ✅ Validasi: hanya bisa edit jika status masih Draft
    if (existingLogbook.STATUS !== "Draft") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: `Logbook dengan status ${existingLogbook.STATUS} tidak dapat diubah`,
        datetime: datetime(),
      });
    }

    const {
      tanggal,
      jam_mulai,
      jam_selesai,
      aktivitas,
      deskripsi,
      jumlah_output,
      kendala,
    } = req.body;

    // ✅ Hitung ulang JAM_KERJA jika ada perubahan
    const jamKerja =
      jam_mulai && jam_selesai
        ? LogbookModel.calculateJamKerja(jam_mulai, jam_selesai)
        : existingLogbook.JAM_KERJA;

    // ✅ Handle foto upload baru (menggunakan middleware uploadLogbook)
    let fotoBukti = existingLogbook.FOTO_BUKTI;
    if (req.file) {
      fotoBukti = `/uploads/foto_logbook/${req.file.filename}`;
    }

    const logbookData = {
      TANGGAL: tanggal || existingLogbook.TANGGAL,
      JAM_MULAI: jam_mulai || existingLogbook.JAM_MULAI,
      JAM_SELESAI: jam_selesai !== undefined ? jam_selesai : existingLogbook.JAM_SELESAI,
      JAM_KERJA: jamKerja,
      AKTIVITAS: aktivitas || existingLogbook.AKTIVITAS,
      DESKRIPSI: deskripsi !== undefined ? deskripsi : existingLogbook.DESKRIPSI,
      JUMLAH_OUTPUT: jumlah_output !== undefined ? jumlah_output : existingLogbook.JUMLAH_OUTPUT,
      KENDALA: kendala !== undefined ? kendala : existingLogbook.KENDALA,
      FOTO_BUKTI: fotoBukti,
      UPDATED_BY_KARYAWAN: karyawanId,
    };

    const updatedLogbook = await LogbookModel.updateLogbook(logbookId, logbookData);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Logbook berhasil diperbarui",
      datetime: datetime(),
      data: updatedLogbook,
    });
  } catch (err) {
    console.error("Error updateLogbook:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Submit logbook (ubah status dari Draft ke Submitted)
 */
export const submitLogbook = async (req, res) => {
  try {
    const logbookId = req.params.id;
    const karyawanId = req.user?.karyawan_id;

    const existingLogbook = await LogbookModel.getLogbookById(logbookId);

    if (!existingLogbook) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Logbook tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ Validasi: hanya pemilik yang bisa submit
    if (existingLogbook.KARYAWAN_ID !== karyawanId) {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Anda tidak memiliki izin untuk submit logbook ini",
        datetime: datetime(),
      });
    }

    // ✅ Validasi: hanya Draft yang bisa di-submit
    if (existingLogbook.STATUS !== "Draft") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: `Logbook dengan status ${existingLogbook.STATUS} tidak dapat di-submit`,
        datetime: datetime(),
      });
    }

    const submitted = await LogbookModel.submitLogbook(logbookId);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Logbook berhasil di-submit untuk validasi",
      datetime: datetime(),
      data: submitted,
    });
  } catch (err) {
    console.error("Error submitLogbook:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Validate logbook - Approve/Reject (HANYA HR)
 */
export const validateLogbook = async (req, res) => {
  try {
    const userRole = req.user?.role;
    const userEmail = req.user?.email;

    // ✅ Validasi role: hanya HR yang bisa validasi
    if (userRole !== "HR" && userRole !== "SUPERADMIN") {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Hanya departemen HR yang dapat melakukan validasi logbook",
        datetime: datetime(),
      });
    }

    // ✅ QUERY KARYAWAN_ID dari EMAIL
    const validator = await db("master_karyawan")
      .where("EMAIL", userEmail)
      .select("KARYAWAN_ID")
      .first();

    if (!validator) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Data karyawan HR tidak ditemukan. Hubungi SUPERADMIN.",
        datetime: datetime(),
      });
    }

    const validatorKaryawanId = validator.KARYAWAN_ID;

    const { logbook_id } = req.params;
    const { aksi, catatan } = req.body;

    console.log("=== DEBUG VALIDATE LOGBOOK ===");
    console.log("userEmail:", userEmail);
    console.log("validatorKaryawanId:", validatorKaryawanId);
    console.log("logbook_id:", logbook_id);
    console.log("aksi:", aksi);
    console.log("==============================");

    // ✅ Validasi field wajib
    if (!aksi || !["Approved", "Rejected"].includes(aksi)) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Aksi harus berisi 'Approved' atau 'Rejected'",
        datetime: datetime(),
      });
    }

    // ✅ Cek apakah logbook ada
    const existingLogbook = await LogbookModel.getLogbookByLogbookId(logbook_id);

    if (!existingLogbook) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Logbook tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ Validasi: hanya Submitted yang bisa divalidasi
    if (existingLogbook.STATUS !== "Submitted") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: `Logbook dengan status ${existingLogbook.STATUS} tidak dapat divalidasi`,
        datetime: datetime(),
      });
    }

    const validated = await LogbookModel.validateLogbook(
      logbook_id,
      validatorKaryawanId,
      aksi,
      catatan || null
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: `Logbook berhasil di-${aksi === "Approved" ? "approve" : "reject"}`,
      datetime: datetime(),
      data: validated,
    });
  } catch (err) {
    console.error("Error validateLogbook:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get history validasi logbook
 */
export const getLogbookValidasi = async (req, res) => {
  try {
    const { logbook_id } = req.params;
    const data = await LogbookModel.getLogbookValidasi(logbook_id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "History validasi berhasil diambil",
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getLogbookValidasi:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Delete logbook (hanya pemilik dan hanya jika masih Draft)
 */
export const deleteLogbook = async (req, res) => {
  try {
    const logbookId = req.params.id;
    const karyawanId = req.user?.karyawan_id;
    const userRole = req.user?.role;

    const existingLogbook = await LogbookModel.getLogbookById(logbookId);

    if (!existingLogbook) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Logbook tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ Validasi: hanya pemilik atau SUPERADMIN yang bisa hapus
    if (
      existingLogbook.KARYAWAN_ID !== karyawanId &&
      userRole !== "SUPERADMIN"
    ) {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Anda tidak memiliki izin untuk menghapus logbook ini",
        datetime: datetime(),
      });
    }

    // ✅ Validasi: hanya Draft yang bisa dihapus
    if (existingLogbook.STATUS !== "Draft") {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: `Logbook dengan status ${existingLogbook.STATUS} tidak dapat dihapus`,
        datetime: datetime(),
      });
    }

    const deleted = await LogbookModel.deleteLogbook(logbookId);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Logbook berhasil dihapus",
      datetime: datetime(),
      data: deleted,
    });
  } catch (err) {
    console.error("Error deleteLogbook:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * ✅ NEW: Get karyawan's assigned batches
 */
export const getMyAssignedBatches = async (req, res) => {
  try {
    const karyawanId = req.user?.karyawan_id;

    const batches = await db("batch_karyawan as bk")
      .leftJoin("master_batch as b", "bk.BATCH_ID", "b.BATCH_ID")
      .where({
        "bk.KARYAWAN_ID": karyawanId,
        "bk.STATUS": "Aktif"
      })
      .whereIn("b.STATUS_BATCH", ["Pending", "In Progress"]) // ✅ Hanya batch yang masih berjalan
      .select(
        "b.BATCH_ID",
        "b.NAMA_BATCH",
        "b.KATEGORI_PRODUK",
        "b.STATUS_BATCH",
        "b.TANGGAL_MULAI",
        "b.TANGGAL_TARGET_SELESAI",
        "b.TARGET_JUMLAH",
        "b.JUMLAH_SELESAI",
        "b.SATUAN",
        "bk.ROLE_DALAM_BATCH",
        "bk.STATUS as ASSIGNMENT_STATUS"
      )
      .orderBy("b.TANGGAL_MULAI", "desc");

    return res.status(200).json({
      status: status.SUKSES,
      message: "Batch assignments berhasil diambil",
      datetime: datetime(),
      total: batches.length,
      data: batches,
    });
  } catch (err) {
    console.error("Error getMyAssignedBatches:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};