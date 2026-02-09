// models/karyawanModel.js
import { db } from "../core/config/knex.js";

/**
 * 🔹 Ambil semua karyawan + data user
 */
export const getAllKaryawanWithUser = async () => {
  return db("master_karyawan as k")
    .leftJoin("users as u", "k.EMAIL", "u.email")
    .select(
      "k.ID",
      "k.KARYAWAN_ID",
      "k.EMAIL",
      "k.NIK",
      "k.NAMA",
      "k.GENDER",
      "k.TEMPAT_LAHIR",
      "k.TGL_LAHIR",
      "k.ALAMAT",
      "k.NO_TELP",
      "k.DEPARTEMEN",
      "k.JABATAN",
      "k.TANGGAL_MASUK",
      "k.STATUS_KARYAWAN",
      "k.STATUS_AKTIF",
      "k.SHIFT",
      "k.PENDIDIKAN_TERAKHIR",
      "k.FOTO",
      "k.created_at",
      "k.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    )
    .orderBy("k.created_at", "desc");
};

/**
 * 🔹 Ambil karyawan by ID + data user
 */
export const getKaryawanByIdWithUser = async (id) => {
  return db("master_karyawan as k")
    .leftJoin("users as u", "k.EMAIL", "u.email")
    .select(
      "k.ID",
      "k.KARYAWAN_ID",
      "k.EMAIL",
      "k.NIK",
      "k.NAMA",
      "k.GENDER",
      "k.TEMPAT_LAHIR",
      "k.TGL_LAHIR",
      "k.ALAMAT",
      "k.NO_TELP",
      "k.DEPARTEMEN",
      "k.JABATAN",
      "k.TANGGAL_MASUK",
      "k.STATUS_KARYAWAN",
      "k.STATUS_AKTIF",
      "k.SHIFT",
      "k.PENDIDIKAN_TERAKHIR",
      "k.FOTO",
      "k.created_at",
      "k.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    )
    .where("k.ID", id)
    .first();
};

/**
 * 🔹 Ambil karyawan by KARYAWAN_ID (KRY-0001)
 */
export const getKaryawanByKaryawanId = async (karyawanId) => {
  return db("master_karyawan as k")
    .leftJoin("users as u", "k.EMAIL", "u.email")
    .select(
      "k.ID",
      "k.KARYAWAN_ID",
      "k.EMAIL",
      "k.NIK",
      "k.NAMA",
      "k.GENDER",
      "k.TEMPAT_LAHIR",
      "k.TGL_LAHIR",
      "k.ALAMAT",
      "k.NO_TELP",
      "k.DEPARTEMEN",
      "k.JABATAN",
      "k.TANGGAL_MASUK",
      "k.STATUS_KARYAWAN",
      "k.STATUS_AKTIF",
      "k.SHIFT",
      "k.PENDIDIKAN_TERAKHIR",
      "k.FOTO",
      "k.created_at",
      "k.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    )
    .where("k.KARYAWAN_ID", karyawanId)
    .first();
};

/**
 * 🔹 Ambil karyawan by EMAIL
 */
export const getKaryawanByEmail = async (email) => {
  return db("master_karyawan as k")
    .leftJoin("users as u", "k.EMAIL", "u.email")
    .select(
      "k.ID",
      "k.KARYAWAN_ID",
      "k.EMAIL",
      "k.NIK",
      "k.NAMA",
      "k.DEPARTEMEN",
      "k.JABATAN",
      "k.STATUS_AKTIF",
      "u.role as user_role"
    )
    .where("k.EMAIL", email)
    .first();
};

/**
 * 🔹 Ambil karyawan berdasarkan DEPARTEMEN
 */
export const getKaryawanByDepartemen = async (departemen) => {
  return db("master_karyawan as k")
    .leftJoin("users as u", "k.EMAIL", "u.email")
    .select(
      "k.ID",
      "k.KARYAWAN_ID",
      "k.NIK",
      "k.NAMA",
      "k.EMAIL",
      "k.DEPARTEMEN",
      "k.JABATAN",
      "k.STATUS_AKTIF",
      "u.role as user_role"
    )
    .where("k.DEPARTEMEN", departemen)
    .andWhere("k.STATUS_AKTIF", "Aktif")
    .orderBy("k.NAMA", "asc");
};

/**
 * 🔹 Ambil karyawan berdasarkan JABATAN
 */
export const getKaryawanByJabatan = async (jabatan) => {
  return db("master_karyawan as k")
    .leftJoin("users as u", "k.EMAIL", "u.email")
    .select(
      "k.ID",
      "k.KARYAWAN_ID",
      "k.NIK",
      "k.NAMA",
      "k.EMAIL",
      "k.DEPARTEMEN",
      "k.JABATAN",
      "k.STATUS_AKTIF",
      "u.role as user_role"
    )
    .where("k.JABATAN", jabatan)
    .andWhere("k.STATUS_AKTIF", "Aktif")
    .orderBy("k.NAMA", "asc");
};

/**
 * 🔹 Update data karyawan
 */
export const updateKaryawan = async (id, data) => {
  await db("master_karyawan")
    .where({ ID: id })
    .update({
      ...data,
      updated_at: db.fn.now(),
    });

  return getKaryawanByIdWithUser(id);
};

/**
 * 🔹 Hapus karyawan + user-nya
 */
export const deleteKaryawan = async (id) => {
  const karyawan = await db("master_karyawan").where("ID", id).first();
  if (!karyawan) throw new Error("Karyawan tidak ditemukan");

  // Hapus karyawan (user akan terhapus otomatis karena ON DELETE CASCADE)
  await db("master_karyawan").where("ID", id).del();

  return karyawan;
};

/**
 * 🔹 Check apakah NIK sudah digunakan (untuk validasi update)
 */
export const checkNikExistsExclude = async (nik, excludeId) => {
  const result = await db("master_karyawan")
    .where("NIK", nik)
    .andWhere("ID", "!=", excludeId)
    .first();
  return !!result;
};

/**
 * 🔹 Check apakah EMAIL sudah digunakan (untuk validasi update)
 */
export const checkEmailExistsExclude = async (email, excludeId) => {
  const result = await db("master_karyawan")
    .where("EMAIL", email)
    .andWhere("ID", "!=", excludeId)
    .first();
  return !!result;
};