import { db } from "../core/config/knex.js";

/**
 * Get all rak - DENGAN JOIN GUDANG
 **/
export const getAllRak = async () => {
  return db("MASTER_RAK")
    .leftJoin("MASTER_GUDANG", "MASTER_RAK.KODE_GUDANG", "MASTER_GUDANG.KODE_GUDANG")
    .select(
      "MASTER_RAK.*",                // Ambil semua kolom dari tabel Rak
      "MASTER_GUDANG.NAMA_GUDANG",   // Ambil Nama Gudang
      "MASTER_GUDANG.ALAMAT"         // Ambil Alamat Gudang (Opsional)
    )
    .orderBy("MASTER_RAK.KODE_RAK", "asc");
};

/**
 * Get rak by ID - DENGAN JOIN GUDANG
 **/
export const getRakById = async (ID_RAK) => {
  return db("MASTER_RAK")
    .leftJoin("MASTER_GUDANG", "MASTER_RAK.KODE_GUDANG", "MASTER_GUDANG.KODE_GUDANG")
    .select("MASTER_RAK.*", "MASTER_GUDANG.NAMA_GUDANG")
    .where("MASTER_RAK.ID_RAK", ID_RAK)
    .first();
};

/**
 * Get rak by KODE_RAK
 **/
export const getRakByKode = async (kode) => {
  return db("MASTER_RAK").where({ KODE_RAK: kode }).first();
};

/**
 * Get all rak based on a specific gudang
 **/
export const getRakByGudang = async (kodeGudang) => {
  return db("MASTER_RAK")
    .leftJoin("MASTER_GUDANG", "MASTER_RAK.KODE_GUDANG", "MASTER_GUDANG.KODE_GUDANG")
    .select("MASTER_RAK.*", "MASTER_GUDANG.NAMA_GUDANG")
    .where("MASTER_RAK.KODE_GUDANG", kodeGudang)
    .orderBy("MASTER_RAK.KODE_RAK", "asc");
};

/**
 * Create new rak
 **/
export const createRak = async ({
  KODE_GUDANG,
  KODE_RAK,
  NAMA_RAK,
}) => {
  if (!KODE_GUDANG || !KODE_RAK) {
    throw new Error("KODE_GUDANG dan KODE_RAK wajib diisi");
  }

  // Cek apakah gudang yang dituju ada
  const gudangExist = await db("MASTER_GUDANG").where({ KODE_GUDANG }).first();
  if (!gudangExist) {
    throw new Error("KODE_GUDANG tidak terdaftar");
  }

  // Gunakan transaction atau insert biasa
  const [insertedId] = await db("MASTER_RAK").insert({
    KODE_GUDANG,
    KODE_RAK,
    NAMA_RAK: NAMA_RAK ?? null,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  // Ambil data yang baru dibuat menggunakan ID yang diinsert
  return getRakById(insertedId);
};

/**
 * Update rak
 **/
export const updateRak = async (
  ID_RAK,
  { KODE_GUDANG, KODE_RAK, NAMA_RAK }
) => {
  const dataToUpdate = {
    updated_at: db.fn.now(),
  };

  if (KODE_GUDANG) dataToUpdate.KODE_GUDANG = KODE_GUDANG;
  if (KODE_RAK) dataToUpdate.KODE_RAK = KODE_RAK;
  if (NAMA_RAK !== undefined) dataToUpdate.NAMA_RAK = NAMA_RAK;

  await db("MASTER_RAK").where({ ID_RAK }).update(dataToUpdate);

  return getRakById(ID_RAK);
};

/**
 * Delete rak
 **/
export const deleteRak = async (ID_RAK) => {
  return db("MASTER_RAK").where({ ID_RAK }).del();
};