import { db } from "../core/config/knex.js";

const table = "master_hari";

// Ambil semua hari (diurutkan berdasarkan kolom URUTAN)
export const getAllHari = async () => {
  return db(table).select("*").orderBy("URUTAN", "asc");
};

// Ambil hari berdasarkan ID (Primary Key)
export const getHariById = async (id) => {
  return db(table).where({ ID: id }).first();
};

// Ambil hari berdasarkan HARI_ID (Unique Identifier)
export const getHariByHariId = async (hariId) => {
  return db(table).where({ HARI_ID: hariId }).first();
};

// Tambah hari baru
export const createHari = async (data) => {
  // Mengembalikan array ID yang baru dibuat
  const [id] = await db(table).insert(data);
  return getHariById(id);
};

// Update hari berdasarkan ID
export const updateHari = async (id, data) => {
  const hari = await getHariById(id);
  if (!hari) return null;

  await db(table)
    .where({ ID: id })
    .update({
      ...data,
      updated_at: db.fn.now(), // Memastikan timestamp update terpanggil
    });

  return getHariById(id);
};

// Hapus hari berdasarkan ID
export const deleteHari = async (id) => {
  const hari = await getHariById(id);
  if (!hari) return null;

  await db(table).where({ ID: id }).del();
  return hari;
};