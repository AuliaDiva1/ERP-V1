import { db } from "../core/config/knex.js";

/**
 * Get all master mesin
 **/
export const getAllMasterMesin = async () => db("master_mesin").select("*");

/**
 * Get mesin by ID
 **/
export const getMasterMesinById = async (kode_mesin) =>
  db("master_mesin").where({ kode_mesin }).first();

/**
 * Create new mesin
 **/
export const addMasterMesin = async ({
  kode_mesin,
  nama_mesin,
  suhu_maksimal,
}) => {
  const [id] = await db("master_mesin").insert({
    kode_mesin,
    nama_mesin,
    suhu_maksimal,
  });
  return db("master_mesin").where({ id }).first();
};

/**
 * Update existing mesin
 **/
export const editMasterMesin = async ({
  id,
  kode_mesin,
  nama_mesin,
  suhu_maksimal,
}) => {
  await db("master_mesin")
    .where({ id })
    .update({ kode_mesin, nama_mesin, suhu_maksimal });
  return db("master_mesin").where({ id }).first();
};

/**
 * Delete existing mesin
 **/
export const removeMasterMesin = async (id) => {
  await db("master_mesin").where({ id }).delete();
  return db("master_mesin").where({ id }).first();
};
