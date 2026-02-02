import { db } from "../core/config/knex.js";

export const getAllSatuanBarang = async () => {
  return db("master_satuan_barang").select("*").orderBy("KODE_SATUAN", "asc");
};

export const getSatuanBarangById = async (ID) => {
  return db("master_satuan_barang").where({ ID }).first();
};

export const createSatuanBarang = async ({ KODE_SATUAN, NAMA_SATUAN, STATUS }) => {
  const [ID] = await db("master_satuan_barang").insert({
    KODE_SATUAN,
    NAMA_SATUAN,
    STATUS: STATUS ?? "Aktif",
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });
  return getSatuanBarangById(ID);
};

export const updateSatuanBarang = async (ID, data) => {
  await db("master_satuan_barang").where({ ID }).update({
    ...data,
    updated_at: db.fn.now(),
  });
  return getSatuanBarangById(ID);
};

export const deleteSatuanBarang = async (ID) => {
  return db("master_satuan_barang").where({ ID }).del();
};