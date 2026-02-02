import { db } from "../core/config/knex.js";

export const getAllJenisBarang = async () => {
  return db("master_jenis_barang").select("*").orderBy("KODE_JENIS", "asc");
};

export const getJenisBarangById = async (ID) => {
  return db("master_jenis_barang").where({ ID }).first();
};

export const createJenisBarang = async ({ KODE_JENIS, NAMA_JENIS, STATUS }) => {
  const [ID] = await db("master_jenis_barang").insert({
    KODE_JENIS,
    NAMA_JENIS,
    STATUS: STATUS ?? "Aktif",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });
  return getJenisBarangById(ID);
};

export const updateJenisBarang = async (ID, data) => {
  await db("master_jenis_barang").where({ ID }).update({
    ...data,
    updated_at: db.fn.now(),
  });
  return getJenisBarangById(ID);
};

export const deleteJenisBarang = async (ID) => {
  return db("master_jenis_barang").where({ ID }).del();
};