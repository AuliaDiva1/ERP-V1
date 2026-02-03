import { db } from "../core/config/knex.js";

export const getAll = async () => {
  return db("master_customer").select("*").orderBy("NAMA_CUSTOMER", "asc");
};

export const getById = async (id) => {
  return db("master_customer").where({ ID_CUSTOMER: id }).first();
};

export const getByKode = async (kode) => {
  return db("master_customer").where({ KODE_CUSTOMER: kode }).first();
};

export const create = async (data) => {
  const [id] = await db("master_customer").insert({
    KODE_CUSTOMER: data.KODE_CUSTOMER,
    NAMA_CUSTOMER: data.NAMA_CUSTOMER,
    ALAMAT: data.ALAMAT,
    NO_TELP: data.NO_TELP,
    EMAIL: data.EMAIL,
    STATUS: data.STATUS || 'Aktif',
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
  return getById(id);
};

export const update = async (id, data) => {
  await db("master_customer").where({ ID_CUSTOMER: id }).update({
    ...data,
    updated_at: db.fn.now()
  });
  return getById(id);
};

export const destroy = async (id) => {
  return db("master_customer").where({ ID_CUSTOMER: id }).del();
};