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
 */
export const getLogbookById = async (id) => {
  const result = await db("logbook_pekerjaan as l")
    .leftJoin("master_karyawan as k", "l.KARYAWAN_ID", "k.KARYAWAN_ID")
    .leftJoin("master_batch as b", "l.BATCH_ID", "b.BATCH_ID")
    .leftJoin("master_karyawan as creator", "l.CREATED_BY_KARYAWAN", "creator.KARYAWAN_ID")
    .select(
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
      "k.NAMA as NAMA_KARYAWAN",
      "k.NIK as NIK",
      "k.EMAIL as EMAIL",
      "k.DEPARTEMEN as DEPARTEMEN",
      "k.JABATAN as JABATAN",
      "k.NO_TELP as NO_TELP",
      "b.NAMA_BATCH as NAMA_BATCH",
      "b.KATEGORI_PRODUK as KATEGORI_PRODUK",
      "b.TARGET_JUMLAH as TARGET_JUMLAH",
      "b.SATUAN as SATUAN",
      "creator.NAMA as CREATED_BY_NAMA"
    )
    .where("l.ID", id)
    .first();

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
 * ✅ SOLUSI 1: Update DATA_SESUDAH saat submit ulang setelah revisi
 */
export const submitLogbook = async (id) => {
  return await db.transaction(async (trx) => {
    // 1. Get logbook data
    const logbook = await trx("logbook_pekerjaan")
      .where("ID", id)
      .first();

    if (!logbook) {
      throw new Error("Logbook tidak ditemukan");
    }

    if (logbook.STATUS !== "Draft") {
      throw new Error("Hanya logbook Draft yang bisa di-submit");
    }

    // 2. Update status ke Submitted
    await trx("logbook_pekerjaan")
      .where("ID", id)
      .update({
        STATUS: "Submitted",
        updated_at: trx.fn.now(),
      });

    // 3. Update DATA_SESUDAH di revisi terakhir (jika ada)
    const lastRevisi = await trx("logbook_revisi")
      .where({
        LOGBOOK_ID: logbook.LOGBOOK_ID,
        STATUS_SESUDAH: "Draft"
      })
      .orderBy("REVISI_KE", "desc")
      .first();

    if (lastRevisi && !lastRevisi.DATA_SESUDAH) {
      const dataSesudah = JSON.stringify({
        TANGGAL: logbook.TANGGAL,
        JAM_MULAI: logbook.JAM_MULAI,
        JAM_SELESAI: logbook.JAM_SELESAI,
        JAM_KERJA: logbook.JAM_KERJA,
        AKTIVITAS: logbook.AKTIVITAS,
        DESKRIPSI: logbook.DESKRIPSI,
        JUMLAH_OUTPUT: logbook.JUMLAH_OUTPUT,
        KENDALA: logbook.KENDALA,
        FOTO_BUKTI: logbook.FOTO_BUKTI,
      });

      await trx("logbook_revisi")
        .where("ID", lastRevisi.ID)
        .update({
          DATA_SESUDAH: dataSesudah,
        });

      console.log(`✅ DATA_SESUDAH updated for revision ${lastRevisi.REVISI_KE} of ${logbook.LOGBOOK_ID}`);
    }

    return getLogbookById(id);
  });
};

/**
 * 🔹 Approve/Reject logbook
 */
export const validateLogbook = async (logbookId, validatorKaryawanId, aksi, catatan) => {
  return await db.transaction(async (trx) => {
    const logbook = await trx("logbook_pekerjaan")
      .where("LOGBOOK_ID", logbookId)
      .first();

    if (!logbook) {
      throw new Error("Logbook tidak ditemukan");
    }

    if (logbook.STATUS === "Approved" && aksi === "Approved") {
      throw new Error("Logbook ini sudah di-approve sebelumnya");
    }

    const newStatus = aksi === "Approved" ? "Approved" : "Rejected";
    await trx("logbook_pekerjaan")
      .where("LOGBOOK_ID", logbookId)
      .update({
        STATUS: newStatus,
        updated_at: trx.fn.now(),
      });

    await trx("logbook_validasi").insert({
      LOGBOOK_ID: logbookId,
      AKSI: aksi,
      VALIDATOR_KARYAWAN_ID: validatorKaryawanId,
      CATATAN: catatan,
    });

    if (aksi === "Approved") {
      const batch = await trx("master_batch")
        .where("BATCH_ID", logbook.BATCH_ID)
        .first();

      if (batch) {
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

    if (aksi === "Rejected" && logbook.STATUS === "Approved") {
      const batch = await trx("master_batch")
        .where("BATCH_ID", logbook.BATCH_ID)
        .first();

      if (batch) {
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

  return `${hours}:${String(minutes).padStart(2, '0')}`;
};

/**
 * 🔹 Revise logbook (untuk logbook yang rejected)
 */
export const reviseLogbook = async (id, karyawanId, alasanRevisi) => {
  return await db.transaction(async (trx) => {
    const logbook = await trx("logbook_pekerjaan")
      .where("ID", id)
      .first();

    if (!logbook) {
      throw new Error("Logbook tidak ditemukan");
    }

    if (logbook.STATUS !== "Rejected") {
      throw new Error("Hanya logbook dengan status Rejected yang bisa direvisi");
    }

    const revisiCount = await trx("logbook_revisi")
      .where("LOGBOOK_ID", logbook.LOGBOOK_ID)
      .count("ID as total");
    
    const revisiKe = parseInt(revisiCount[0]?.total || 0) + 1;

    await trx("logbook_revisi").insert({
      LOGBOOK_ID: logbook.LOGBOOK_ID,
      REVISI_KE: revisiKe,
      STATUS_SEBELUM: "Rejected",
      STATUS_SESUDAH: "Draft",
      DATA_SEBELUM: JSON.stringify({
        TANGGAL: logbook.TANGGAL,
        JAM_MULAI: logbook.JAM_MULAI,
        JAM_SELESAI: logbook.JAM_SELESAI,
        JAM_KERJA: logbook.JAM_KERJA,
        AKTIVITAS: logbook.AKTIVITAS,
        DESKRIPSI: logbook.DESKRIPSI,
        JUMLAH_OUTPUT: logbook.JUMLAH_OUTPUT,
        KENDALA: logbook.KENDALA,
        FOTO_BUKTI: logbook.FOTO_BUKTI,
      }),
      DATA_SESUDAH: null,
      REVISED_BY_KARYAWAN: karyawanId,
      ALASAN_REVISI: alasanRevisi,
    });

    await trx("logbook_pekerjaan")
      .where("ID", id)
      .update({
        STATUS: "Draft",
        UPDATED_BY_KARYAWAN: karyawanId,
        updated_at: trx.fn.now(),
      });

    console.log(`✅ Logbook ${logbook.LOGBOOK_ID} direvisi (revisi ke-${revisiKe})`);

    return getLogbookById(id);
  });
};

/**
 * 🔹 Get history revisi logbook
 */
export const getLogbookRevisi = async (logbookId) => {
  return db("logbook_revisi as lr")
    .leftJoin("master_karyawan as k", "lr.REVISED_BY_KARYAWAN", "k.KARYAWAN_ID")
    .select(
      "lr.*",
      "k.NAMA as REVISED_BY_NAMA",
      "k.JABATAN as REVISED_BY_JABATAN"
    )
    .where("lr.LOGBOOK_ID", logbookId)
    .orderBy("lr.REVISI_KE", "asc");
};