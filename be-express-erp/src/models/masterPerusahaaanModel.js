import { db } from "../core/config/knex.js";

// Ambil semua data perusahaan (List)
export const getAllPerusahaan = async () => {
  return await db("master_perusahaan").select("*").orderBy("ID_PERUSAHAAN", "desc");
};

// Ambil satu data berdasarkan ID
export const getPerusahaanById = async (id) => {
  return await db("master_perusahaan").where({ ID_PERUSAHAAN: id }).first();
};

// Tambah data baru (CREATE)
export const createPerusahaan = async (data) => {
  const { ID_PERUSAHAAN, created_at, updated_at, ...payload } = data;
  const [id] = await db("master_perusahaan").insert({
    ...payload,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });
  return getPerusahaanById(id);
};

// Update data (EDIT)
export const updatePerusahaan = async (id, data) => {
  const { ID_PERUSAHAAN, created_at, updated_at, ...payload } = data;
  await db("master_perusahaan")
    .where({ ID_PERUSAHAAN: id })
    .update({
      ...payload,
      updated_at: db.fn.now(),
    });
  return getPerusahaanById(id);
};

// Hapus data (DELETE)
export const deletePerusahaan = async (id) => {
  return await db("master_perusahaan").where({ ID_PERUSAHAAN: id }).del();
};