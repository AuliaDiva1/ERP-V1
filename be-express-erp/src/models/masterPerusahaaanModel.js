import { db } from "../core/config/knex.js";

// 1. Ambil semua data (List)
export const getAllPerusahaan = async () => {
  return await db("master_perusahaan")
    .select("*")
    .orderBy("ID_PERUSAHAAN", "desc");
};

// 2. Ambil satu data berdasarkan ID (Penting: Gunakan ID_PERUSAHAAN)
export const getPerusahaanById = async (id) => {
  return await db("master_perusahaan")
    .where("ID_PERUSAHAAN", id)
    .first();
};

// 3. Tambah data baru (CREATE)
export const createPerusahaan = async (data) => {
  // Destructuring untuk memastikan ID dan timestamp tidak diinput manual
  const { ID_PERUSAHAAN, created_at, updated_at, ...payload } = data;
  
  const [newId] = await db("master_perusahaan").insert({
    ...payload,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });
  
  // Mengembalikan data yang baru saja dibuat
  return await getPerusahaanById(newId);
};

// 4. Update data (EDIT)
export const updatePerusahaan = async (id, data) => {
  const { ID_PERUSAHAAN, created_at, updated_at, ...payload } = data;
  
  await db("master_perusahaan")
    .where("ID_PERUSAHAAN", id)
    .update({
      ...payload,
      updated_at: db.fn.now(),
    });
    
  return await getPerusahaanById(id);
};

// 5. Hapus data (DELETE)
export const deletePerusahaan = async (id) => {
  return await db("master_perusahaan")
    .where("ID_PERUSAHAAN", id)
    .del();
};