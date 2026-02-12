// models/logbookPekerjaanModel.js - UPDATED WITH FIX
import { db } from "../core/config/knex.js";

/**
 * 🔹 Generate LOGBOOK_ID otomatis
 */
export const generateLogbookId = async () => {
  const lastLogbook = await db("logbook_pekerjaan")
    .orderBy("ID", "desc")
    .first();

  if (!lastLogbook) {
    return "LOG-0001";
  }

  const lastNumber = parseInt(lastLogbook.LOGBOOK_ID.split("-")[1]);
  const newNumber = lastNumber + 1;

  return `LOG-${String(newNumber).padStart(4, "0")}`;
};

/**
 * 🔹 Get all logbook
 */
export const getAllLogbook = async (filters = {}) => {
  let query = db("logbook_pekerjaan as l")
    .leftJoin("master_karyawan as k", "l.KARYAWAN_ID", "k.KARYAWAN_ID")
    .leftJoin("master_batch as b", "l.BATCH_ID", "b.BATCH_ID")
    .select(
      "l.*",
      "k.NAMA as NAMA_KARYAWAN",
      "k.NIK",
      "k.EMAIL",
      "k.DEPARTEMEN",
      "k.JABATAN",
      "b.NAMA_BATCH",
      "b.KATEGORI_PRODUK"
    )
    .orderBy("l.TANGGAL", "desc")
    .orderBy("l.created_at", "desc");

  // Apply filters
  if (filters.karyawanId) {
    query = query.where("l.KARYAWAN_ID", filters.karyawanId);
  }
  if (filters.batchId) {
    query = query.where("l.BATCH_ID", filters.batchId);
  }
  if (filters.status) {
    query = query.where("l.STATUS", filters.status);
  }
  if (filters.tanggalMulai && filters.tanggalSelesai) {
    query = query.whereBetween("l.TANGGAL", [filters.tanggalMulai, filters.tanggalSelesai]);
  }

  return query;
};

/**
 * 🔹 Get logbook by ID
 * ✅ FIXED: Explicit column selection to avoid l.* override issue
 */
export const getLogbookById = async (id) => {
  const result = await db("logbook_pekerjaan as l")
    .leftJoin("master_karyawan as k", "l.KARYAWAN_ID", "k.KARYAWAN_ID")
    .leftJoin("master_batch as b", "l.BATCH_ID", "b.BATCH_ID")
    .leftJoin("master_karyawan as creator", "l.CREATED_BY_KARYAWAN", "creator.KARYAWAN_ID")
    .select(
      // ========================================
      // LOGBOOK PEKERJAAN COLUMNS (EXPLICIT)
      // ========================================
      "l.ID as ID",
      "l.LOGBOOK_ID as LOGBOOK_ID",
      "l.KARYAWAN_ID as KARYAWAN_ID",
      "l.BATCH_ID as BATCH_ID",
      "l.TANGGAL as TANGGAL",
      "l.JAM_MULAI as JAM_MULAI",
      "l.JAM_SELESAI as JAM_SELESAI",
      "l.JAM_KERJA as JAM_KERJA",
      "l.AKTIVITAS as AKTIVITAS",
      "l.DESKRIPSI as DESKRIPSI",
      "l.JUMLAH_OUTPUT as JUMLAH_OUTPUT",
      "l.KENDALA as KENDALA",
      "l.FOTO_BUKTI as FOTO_BUKTI",
      "l.STATUS as STATUS",
      "l.CREATED_BY_KARYAWAN as CREATED_BY_KARYAWAN",
      "l.UPDATED_BY_KARYAWAN as UPDATED_BY_KARYAWAN",
      "l.created_at as created_at",
      "l.updated_at as updated_at",
      
      // ========================================
      // MASTER KARYAWAN COLUMNS (EXPLICIT)
      // ========================================
      "k.NAMA as NAMA_KARYAWAN",
      "k.NIK as NIK",
      "k.EMAIL as EMAIL",                    // ✅ CRITICAL - EXPLICIT
      "k.DEPARTEMEN as DEPARTEMEN",          // ✅ CRITICAL - EXPLICIT
      "k.JABATAN as JABATAN",                // ✅ CRITICAL - EXPLICIT
      "k.NO_TELP as NO_TELP",
      
      // ========================================
      // MASTER BATCH COLUMNS (EXPLICIT)
      // ========================================
      "b.NAMA_BATCH as NAMA_BATCH",
      "b.KATEGORI_PRODUK as KATEGORI_PRODUK",
      "b.TARGET_JUMLAH as TARGET_JUMLAH",
      "b.SATUAN as SATUAN",
      
      // ========================================
      // CREATOR INFO
      // ========================================
      "creator.NAMA as CREATED_BY_NAMA"
    )
    .where("l.ID", id)
    .first();

  // ✅ Debug log
  if (result) {
    console.log("🔍 getLogbookById - EMAIL:", result.EMAIL, "| JABATAN:", result.JABATAN);
  }

  return result;
};

/**
 * 🔹 Get logbook by LOGBOOK_ID
 */
export const getLogbookByLogbookId = async (logbookId) => {
  return db("logbook_pekerjaan as l")
    .leftJoin("master_karyawan as k", "l.KARYAWAN_ID", "k.KARYAWAN_ID")
    .leftJoin("master_batch as b", "l.BATCH_ID", "b.BATCH_ID")
    .select(
      "l.*",
      "k.NAMA as NAMA_KARYAWAN",
      "k.NIK",
      "b.NAMA_BATCH"
    )
    .where("l.LOGBOOK_ID", logbookId)
    .first();
};

/**
 * 🔹 Create logbook
 */
export const createLogbook = async (data) => {
  const [id] = await db("logbook_pekerjaan").insert(data);
  return getLogbookById(id);
};

/**
 * 🔹 Update logbook
 */
export const updateLogbook = async (id, data) => {
  await db("logbook_pekerjaan")
    .where({ ID: id })
    .update({
      ...data,
      updated_at: db.fn.now(),
    });

  return getLogbookById(id);
};

/**
 * 🔹 Delete logbook
 */
export const deleteLogbook = async (id) => {
  const logbook = await getLogbookById(id);
  if (!logbook) throw new Error("Logbook tidak ditemukan");

  await db("logbook_pekerjaan").where("ID", id).del();
  return logbook;
};

/**
 * 🔹 Submit logbook (ubah status dari Draft ke Submitted)
 */
export const submitLogbook = async (id) => {
  await db("logbook_pekerjaan")
    .where({ ID: id })
    .update({
      STATUS: "Submitted",
      updated_at: db.fn.now(),
    });

  return getLogbookById(id);
};

/**
 * 🔹 Approve/Reject logbook
 * ✅ FIXED: Anti double-count dengan SUM dari logbook approved
 */
export const validateLogbook = async (logbookId, validatorKaryawanId, aksi, catatan) => {
  return await db.transaction(async (trx) => {
    // 1. Cek logbook yang akan divalidasi
    const logbook = await trx("logbook_pekerjaan")
      .where("LOGBOOK_ID", logbookId)
      .first();

    if (!logbook) {
      throw new Error("Logbook tidak ditemukan");
    }

    // ✅ CRITICAL: Cegah double approve
    if (logbook.STATUS === "Approved" && aksi === "Approved") {
      throw new Error("Logbook ini sudah di-approve sebelumnya");
    }

    // 2. Update status logbook
    const newStatus = aksi === "Approved" ? "Approved" : "Rejected";
    await trx("logbook_pekerjaan")
      .where("LOGBOOK_ID", logbookId)
      .update({
        STATUS: newStatus,
        updated_at: trx.fn.now(),
      });

    // 3. Insert ke logbook_validasi
    await trx("logbook_validasi").insert({
      LOGBOOK_ID: logbookId,
      AKSI: aksi,
      VALIDATOR_KARYAWAN_ID: validatorKaryawanId,
      CATATAN: catatan,
    });

    // 4. Jika approved, RECALCULATE total dari SUM
    if (aksi === "Approved") {
      const batch = await trx("master_batch")
        .where("BATCH_ID", logbook.BATCH_ID)
        .first();

      if (batch) {
        // ========================================
        // ✅ SOLUSI ANTI DOUBLE-COUNT
        // ========================================
        // Hitung ULANG total output dari semua logbook approved
        const result = await trx("logbook_pekerjaan")
          .where({
            BATCH_ID: logbook.BATCH_ID,
            STATUS: "Approved"
          })
          .sum("JUMLAH_OUTPUT as total");

        const totalApproved = parseInt(result[0]?.total) || 0;

        console.log("=== RECALCULATE BATCH PROGRESS ===");
        console.log("Batch ID:", logbook.BATCH_ID);
        console.log("Old JUMLAH_SELESAI:", batch.JUMLAH_SELESAI);
        console.log("New JUMLAH_SELESAI (from SUM):", totalApproved);
        console.log("==================================");

        // Update dengan total yang BENAR
        await trx("master_batch")
          .where("BATCH_ID", logbook.BATCH_ID)
          .update({
            JUMLAH_SELESAI: totalApproved,
          });

        // ✅ Auto-update status batch
        let newBatchStatus = batch.STATUS_BATCH;
        let additionalUpdates = {};

        if (totalApproved >= batch.TARGET_JUMLAH && batch.STATUS_BATCH !== "Completed") {
          newBatchStatus = "Completed";
          additionalUpdates.TANGGAL_SELESAI_AKTUAL = trx.fn.now();
        } else if (totalApproved > 0 && batch.STATUS_BATCH === "Pending") {
          newBatchStatus = "In Progress";
        }

        if (newBatchStatus !== batch.STATUS_BATCH) {
          await trx("master_batch")
            .where("BATCH_ID", logbook.BATCH_ID)
            .update({
              STATUS_BATCH: newBatchStatus,
              ...additionalUpdates,
              updated_at: trx.fn.now(),
            });
        }
      }
    }

    // ✅ BONUS: Jika di-reject setelah approved, RECALCULATE juga
    if (aksi === "Rejected" && logbook.STATUS === "Approved") {
      const batch = await trx("master_batch")
        .where("BATCH_ID", logbook.BATCH_ID)
        .first();

      if (batch) {
        // Hitung ulang total setelah reject
        const result = await trx("logbook_pekerjaan")
          .where({
            BATCH_ID: logbook.BATCH_ID,
            STATUS: "Approved"
          })
          .sum("JUMLAH_OUTPUT as total");

        const totalApproved = parseInt(result[0]?.total) || 0;

        await trx("master_batch")
          .where("BATCH_ID", logbook.BATCH_ID)
          .update({
            JUMLAH_SELESAI: totalApproved,
          });

        console.log("=== RECALCULATE AFTER REJECT ===");
        console.log("Batch ID:", logbook.BATCH_ID);
        console.log("New JUMLAH_SELESAI:", totalApproved);
        console.log("================================");
      }
    }

    return getLogbookByLogbookId(logbookId);
  });
};

/**
 * 🔹 Get history validasi logbook
 */
export const getLogbookValidasi = async (logbookId) => {
  return db("logbook_validasi as lv")
    .leftJoin("master_karyawan as k", "lv.VALIDATOR_KARYAWAN_ID", "k.KARYAWAN_ID")
    .select(
      "lv.*",
      "k.NAMA as VALIDATOR_NAMA",
      "k.JABATAN as VALIDATOR_JABATAN"
    )
    .where("lv.LOGBOOK_ID", logbookId)
    .orderBy("lv.created_at", "desc");
};

/**
 * 🔹 Calculate JAM_KERJA dari JAM_MULAI dan JAM_SELESAI
 * ✅ Format: HH:MM (jam dan menit)
 */
export const calculateJamKerja = (jamMulai, jamSelesai) => {
  if (!jamMulai || !jamSelesai) return "0:00";

  const [startHour, startMinute] = jamMulai.split(':').map(Number);
  const [endHour, endMinute] = jamSelesai.split(':').map(Number);

  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  const diffMinutes = Math.max(0, endTotalMinutes - startTotalMinutes);
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  // ✅ Format: "5:17" (5 jam 17 menit)
  return `${hours}:${String(minutes).padStart(2, '0')}`;
};