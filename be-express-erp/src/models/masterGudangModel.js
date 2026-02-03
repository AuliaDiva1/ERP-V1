import { db } from "../core/config/knex.js";

/**
 * Get all gudang
 **/
export const getAllGudang = async () => {
  return db("MASTER_GUDANG").select("*").orderBy("KODE_GUDANG", "asc");
};

/**
 * Get gudang by ID (Primary Key)
 **/
export const getGudangById = async (ID_GUDANG) => {
  return db("MASTER_GUDANG").where({ ID_GUDANG }).first();
};

/**
 * Get gudang by KODE_GUDANG (kode unik)
 **/
export const getGudangByKode = async (kode) => {
  return db("MASTER_GUDANG").where({ KODE_GUDANG: kode }).first();
};

/**
 * Create new gudang
 **/
export const createGudang = async ({
  KODE_GUDANG,
  NAMA_GUDANG,
  ALAMAT,
  STATUS,
}) => {
  if (!KODE_GUDANG || !NAMA_GUDANG) {
    throw new Error("KODE_GUDANG dan NAMA_GUDANG wajib diisi");
  }

  const [ID_GUDANG] = await db("MASTER_GUDANG").insert({
    KODE_GUDANG,
    NAMA_GUDANG,
    ALAMAT: ALAMAT ?? null,
    STATUS: STATUS ?? "Aktif",
    CREATED_AT: db.fn.now(),
    UPDATED_AT: db.fn.now(),
  });

  return db("MASTER_GUDANG").where({ ID_GUDANG }).first();
};

/**
 * Update gudang
 **/
export const updateGudang = async (
  ID_GUDANG,
  { KODE_GUDANG, NAMA_GUDANG, ALAMAT, STATUS }
) => {
  const dataToUpdate = {
    updated_at: db.fn.now(),
  };

  if (KODE_GUDANG) dataToUpdate.KODE_GUDANG = KODE_GUDANG;
  if (NAMA_GUDANG) dataToUpdate.NAMA_GUDANG = NAMA_GUDANG;
  if (ALAMAT !== undefined) dataToUpdate.ALAMAT = ALAMAT;
  if (STATUS !== undefined) dataToUpdate.STATUS = STATUS;

  await db("MASTER_GUDANG").where({ ID_GUDANG }).update(dataToUpdate);

  return db("MASTER_GUDANG").where({ ID_GUDANG }).first();
};

/**
 * Delete gudang
 **/
export const deleteGudang = async (ID_GUDANG) => {
  return db("MASTER_GUDANG").where({ ID_GUDANG }).del();
};