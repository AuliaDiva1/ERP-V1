// models/masterBatchModel.js
import { db } from "../core/config/knex.js";

/**
 * 🔹 Generate BATCH_ID otomatis
 */
export const generateBatchId = async (jenisBatch) => {
  const prefix = jenisBatch === "Khusus" ? "CUSTOM" : "BATCH";
  
  const lastBatch = await db("master_batch")
    .where("BATCH_ID", "like", `${prefix}-%`)
    .orderBy("ID", "desc")
    .first();

  if (!lastBatch) {
    return `${prefix}-001`;
  }

  const lastNumber = parseInt(lastBatch.BATCH_ID.split("-")[1]);
  const newNumber = lastNumber + 1;

  return `${prefix}-${String(newNumber).padStart(3, "0")}`;
};

/**
 * 🔹 Generate KODE_PRODUK otomatis
 * Format: PRD-001, PRD-002, dst.
 */
export const generateKodeProduk = async () => {
  const lastBatch = await db("master_batch")
    .where("KODE_PRODUK", "like", "PRD-%")
    .orderBy("ID", "desc")
    .first();

  if (!lastBatch || !lastBatch.KODE_PRODUK) {
    return "PRD-001";
  }

  const lastNumber = parseInt(lastBatch.KODE_PRODUK.split("-")[1]);
  const newNumber = lastNumber + 1;

  return `PRD-${String(newNumber).padStart(3, "0")}`;
};

/**
 * 🔹 Get all batch
 */
export const getAllBatch = async () => {
  return db("master_batch as b")
    .leftJoin("master_satuan_barang as s", "b.SATUAN", "s.KODE_SATUAN")
    .leftJoin("master_karyawan as k", "b.CREATED_BY_KARYAWAN", "k.KARYAWAN_ID")
    .select(
      "b.*",
      "s.NAMA_SATUAN",
      "k.NAMA as CREATED_BY_NAMA"
    )
    .orderBy("b.created_at", "desc");
};

/**
 * 🔹 Get batch by ID
 */
export const getBatchById = async (id) => {
  return db("master_batch as b")
    .leftJoin("master_satuan_barang as s", "b.SATUAN", "s.KODE_SATUAN")
    .leftJoin("master_karyawan as k", "b.CREATED_BY_KARYAWAN", "k.KARYAWAN_ID")
    .select(
      "b.*",
      "s.NAMA_SATUAN",
      "k.NAMA as CREATED_BY_NAMA"
    )
    .where("b.ID", id)
    .first();
};

/**
 * 🔹 Get batch by BATCH_ID
 */
export const getBatchByBatchId = async (batchId) => {
  return db("master_batch as b")
    .leftJoin("master_satuan_barang as s", "b.SATUAN", "s.KODE_SATUAN")
    .leftJoin("master_karyawan as k", "b.CREATED_BY_KARYAWAN", "k.KARYAWAN_ID")
    .select(
      "b.*",
      "s.NAMA_SATUAN",
      "k.NAMA as CREATED_BY_NAMA"
    )
    .where("b.BATCH_ID", batchId)
    .first();
};

/**
 * 🔹 Get batch by status
 */
export const getBatchByStatus = async (status) => {
  return db("master_batch as b")
    .leftJoin("master_satuan_barang as s", "b.SATUAN", "s.KODE_SATUAN")
    .select("b.*", "s.NAMA_SATUAN")
    .where("b.STATUS_BATCH", status)
    .orderBy("b.created_at", "desc");
};

/**
 * 🔹 Create batch
 */
export const createBatch = async (data) => {
  const [id] = await db("master_batch").insert(data);
  return getBatchById(id);
};

/**
 * 🔹 Update batch
 */
export const updateBatch = async (id, data) => {
  await db("master_batch")
    .where({ ID: id })
    .update({
      ...data,
      updated_at: db.fn.now(),
    });

  return getBatchById(id);
};

/**
 * 🔹 Delete batch
 */
export const deleteBatch = async (id) => {
  const batch = await getBatchById(id);
  if (!batch) throw new Error("Batch tidak ditemukan");

  await db("master_batch").where("ID", id).del();
  return batch;
};

/**
 * 🔹 Update progress batch (JUMLAH_SELESAI)
 */
export const updateBatchProgress = async (batchId, jumlahTambahan) => {
  await db("master_batch")
    .where("BATCH_ID", batchId)
    .increment("JUMLAH_SELESAI", jumlahTambahan);
};

/**
 * 🔹 Check apakah BATCH_ID sudah ada
 */
export const checkBatchIdExists = async (batchId) => {
  const result = await db("master_batch").where("BATCH_ID", batchId).first();
  return !!result;
};

/**
 * 🔹 Auto-update status batch berdasarkan progress
 * Status logic:
 * - Pending → In Progress (saat ada output pertama)
 * - In Progress → Completed (saat output >= target)
 */
export const autoUpdateBatchStatus = async (batchId) => {
  const batch = await db("master_batch")
    .where("BATCH_ID", batchId)
    .first();
  
  if (!batch) return null;

  let shouldUpdate = false;
  let newStatus = batch.STATUS_BATCH;
  let additionalUpdates = {};

  // ✅ Jika jumlah selesai >= target dan status belum Completed
  if (batch.JUMLAH_SELESAI >= batch.TARGET_JUMLAH && batch.STATUS_BATCH !== "Completed") {
    newStatus = "Completed";
    additionalUpdates.TANGGAL_SELESAI_AKTUAL = db.fn.now();  // ✅ BENAR - AKTUAL, BUKAN TARGET
    shouldUpdate = true;
  }
  // ✅ Jika ada progress tapi belum selesai dan status masih Pending
  else if (batch.JUMLAH_SELESAI > 0 && batch.STATUS_BATCH === "Pending") {
    newStatus = "In Progress";
    shouldUpdate = true;
  }

  // ✅ Update jika ada perubahan status
  if (shouldUpdate) {
    await db("master_batch")
      .where("BATCH_ID", batchId)
      .update({
        STATUS_BATCH: newStatus,
        ...additionalUpdates,
        updated_at: db.fn.now(),
      });
  }

  return newStatus;
};