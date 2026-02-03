import { db } from "../core/config/knex.js";

/**
 * Get all rak
 **/
export const getAllRak = async () => {
  return db("MASTER_RAK").select("*").orderBy("KODE_RAK", "asc");
};

/**
 * Get rak by ID
 **/
export const getRakById = async (ID_RAK) => {
  return db("MASTER_RAK").where({ ID_RAK }).first();
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
  return db("MASTER_RAK").where({ KODE_GUDANG: kodeGudang }).orderBy("KODE_RAK", "asc");
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

  const [ID_RAK] = await db("MASTER_RAK").insert({
    KODE_GUDANG,
    KODE_RAK,
    NAMA_RAK: NAMA_RAK ?? null,
    CREATED_AT: db.fn.now(),
    UPDATED_AT: db.fn.now(),
  });

  return db("MASTER_RAK").where({ ID_RAK }).first();
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

  return db("MASTER_RAK").where({ ID_RAK }).first();
};

/**
 * Delete rak
 **/
export const deleteRak = async (ID_RAK) => {
  return db("MASTER_RAK").where({ ID_RAK }).del();
};