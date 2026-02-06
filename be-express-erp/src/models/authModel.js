import { db } from "../core/config/knex.js";
import { hashPassword } from "../utils/hash.js";

/**
 * COUNT SUPER ADMIN
 */
export const countSuperAdmin = async () => {
  const result = await db("users")
    .where({ role: "SUPERADMIN" })
    .count("id as total");
  return result[0].total;
};

/**
 * GET USER PROFILE BY ID
 */
export const getUserProfileById = async (userId) => {
  const user = await db("users")
    .where({ id: userId })
    .select("id", "name", "email", "role", "created_at", "updated_at")
    .first();

  if (!user) return null;

  // Jika HR, PRODUKSI, GUDANG, KEUANGAN
  if (["HR", "PRODUKSI", "GUDANG", "KEUANGAN"].includes(user.role)) {
    const karyawanData = await db("master_karyawan")
      .where("EMAIL", user.email)
      .select(
        "ID",
        "KARYAWAN_ID", // ✅ TAMBAHKAN INI
        "EMAIL",
        "NIK",
        "NAMA",
        "GENDER",
        "TEMPAT_LAHIR",
        "TGL_LAHIR",
        "ALAMAT",
        "NO_TELP",
        "DEPARTEMEN",
        "JABATAN",
        "TANGGAL_MASUK",
        "STATUS_KARYAWAN",
        "STATUS_AKTIF",
        "SHIFT",
        "PENDIDIKAN_TERAKHIR",
        "FOTO"
      )
      .first();

    return { ...user, karyawan: karyawanData };
  }

  return user;
};

/**
 * BLACKLIST TOKEN
 */
export const blacklistToken = async (token, expiredAt) => {
  return await db("blacklist_tokens").insert({
    token,
    expired_at: expiredAt,
  });
};

/**
 * CHECK EMAIL EXISTS
 */
export const checkEmailExists = async (email) => {
  return await db("users").where({ email }).first();
};

/**
 * CHECK NIK EXISTS
 */
export const checkNikExists = async (nik) => {
  return await db("master_karyawan").where({ NIK: nik }).first();
};

/**
 * ✅ GENERATE KARYAWAN_ID OTOMATIS
 * Format: KRY-0001, KRY-0002, dst
 */
export const generateKaryawanId = async () => {
  // Ambil karyawan terakhir
  const lastKaryawan = await db("master_karyawan")
    .orderBy("ID", "desc")
    .first();

  if (!lastKaryawan) {
    return "KRY-0001"; // Karyawan pertama
  }

  // Ambil nomor dari KARYAWAN_ID terakhir (contoh: KRY-0001 -> 0001)
  const lastNumber = parseInt(lastKaryawan.KARYAWAN_ID.split("-")[1]);
  const newNumber = lastNumber + 1;

  // Format dengan padding 0 (4 digit)
  return `KRY-${String(newNumber).padStart(4, "0")}`;
};

/**
 * CREATE KARYAWAN
 */
export const createKaryawan = async (karyawanData, userData) => {
  const hashedPassword = await hashPassword(userData.password);

  return await db.transaction(async (trx) => {
    // 1. Generate KARYAWAN_ID
    const karyawanId = await generateKaryawanId();

    // 2. Insert ke users
    const [userId] = await trx("users").insert({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role,
    });

    // 3. Insert ke master_karyawan
    const [id] = await trx("master_karyawan").insert({
      KARYAWAN_ID: karyawanId, // ✅ TAMBAHKAN INI
      EMAIL: karyawanData.EMAIL,
      NIK: karyawanData.NIK,
      NAMA: karyawanData.NAMA,
      GENDER: karyawanData.GENDER,
      TEMPAT_LAHIR: karyawanData.TEMPAT_LAHIR,
      TGL_LAHIR: karyawanData.TGL_LAHIR,
      ALAMAT: karyawanData.ALAMAT,
      NO_TELP: karyawanData.NO_TELP,
      DEPARTEMEN: karyawanData.DEPARTEMEN,
      JABATAN: karyawanData.JABATAN,
      TANGGAL_MASUK: karyawanData.TANGGAL_MASUK,
      STATUS_KARYAWAN: karyawanData.STATUS_KARYAWAN,
      STATUS_AKTIF: karyawanData.STATUS_AKTIF,
      SHIFT: karyawanData.SHIFT,
      PENDIDIKAN_TERAKHIR: karyawanData.PENDIDIKAN_TERAKHIR,
      FOTO: karyawanData.FOTO,
    });

    return { userId, karyawanId, id }; // ✅ Return karyawanId juga
  });
};