import { db } from "../core/config/knex.js";

// GET ALL
export const getAllPengajuan = async () => {
  return db("master_pengajuan as mp")
    .select("mp.*")
    .orderBy("mp.KODE_PENGAJUAN", "asc");
};

// GET BY ID
export const getPengajuanById = async (ID) => {
  return db("master_pengajuan as mp")
    .select("mp.*")
    .where("mp.ID", ID)
    .first();
};

// CREATE
export const createPengajuan = async (data) => {
  const [ID] = await db("master_pengajuan").insert({
    ...data,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });
  return getPengajuanById(ID);
};

// UPDATE
export const updatePengajuan = async (ID, data) => {
  await db("master_pengajuan")
    .where({ ID })
    .update({
      ...data,
      updated_at: db.fn.now(),
    });
  return getPengajuanById(ID);
};

// DELETE (hard delete)
export const deletePengajuan = async (ID) => {
  return db("master_pengajuan").where({ ID }).del();
};