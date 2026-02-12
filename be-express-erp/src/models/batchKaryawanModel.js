// models/batchKaryawanModel.js
import { db } from "../core/config/knex.js";

/**
 * 🔹 Get all batch karyawan
 */
export const getAllBatchKaryawan = async () => {
  return db("batch_karyawan as bk")
    .leftJoin("master_batch as b", "bk.BATCH_ID", "b.BATCH_ID")
    .leftJoin("master_karyawan as k", "bk.KARYAWAN_ID", "k.KARYAWAN_ID")
    .select(
      "bk.*",
      "b.NAMA_BATCH",
      "b.STATUS_BATCH",
      "k.NAMA as NAMA_KARYAWAN",
      "k.NIK",
      "k.DEPARTEMEN"
    )
    .orderBy("bk.created_at", "desc");
};

/**
 * 🔹 Get karyawan by batch
 */
export const getKaryawanByBatch = async (batchId) => {
  return db("batch_karyawan as bk")
    .leftJoin("master_karyawan as k", "bk.KARYAWAN_ID", "k.KARYAWAN_ID")
    .select(
      "bk.*",
      "k.NAMA as NAMA_KARYAWAN",
      "k.NIK",
      "k.EMAIL",
      "k.DEPARTEMEN",
      "k.JABATAN"
    )
    .where("bk.BATCH_ID", batchId)
    .orderBy("bk.ROLE_DALAM_BATCH", "desc"); // Leader dulu
};

/**
 * 🔹 Get batch by karyawan
 */
export const getBatchByKaryawan = async (karyawanId) => {
  return db("batch_karyawan as bk")
    .leftJoin("master_batch as b", "bk.BATCH_ID", "b.BATCH_ID")
    .select(
      "bk.*",
      "b.NAMA_BATCH",
      "b.KATEGORI_PRODUK",
      "b.TARGET_JUMLAH",
      "b.JUMLAH_SELESAI",
      "b.STATUS_BATCH"
    )
    .where("bk.KARYAWAN_ID", karyawanId)
    .orderBy("bk.created_at", "desc");
};

/**
 * 🔹 Assign karyawan ke batch
 */
export const assignKaryawanToBatch = async (data) => {
  const [id] = await db("batch_karyawan").insert(data);
  return db("batch_karyawan").where("ID", id).first();
};

/**
 * 🔹 Update status karyawan dalam batch
 */
export const updateStatusKaryawanBatch = async (id, status) => {
  await db("batch_karyawan")
    .where("ID", id)
    .update({ STATUS: status });

  return db("batch_karyawan").where("ID", id).first();
};

/**
 * 🔹 Remove karyawan dari batch
 */
export const removeKaryawanFromBatch = async (id) => {
  const batchKaryawan = await db("batch_karyawan").where("ID", id).first();
  if (!batchKaryawan) throw new Error("Data tidak ditemukan");

  await db("batch_karyawan").where("ID", id).del();
  return batchKaryawan;
};

/**
 * 🔹 Check duplikasi assignment
 */
export const checkDuplicateAssignment = async (batchId, karyawanId) => {
  const result = await db("batch_karyawan")
    .where({ BATCH_ID: batchId, KARYAWAN_ID: karyawanId })
    .first();
  return !!result;
};