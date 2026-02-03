import { db } from "../core/config/knex.js";

/**
 * Mengambil semua data header + Nama Customer dari tabel Master
 */
export const getAll = async () => {
  return db("inv_pengiriman_h as h")
    .select(
      "h.*", 
      "c.NAMA_CUSTOMER", 
      "c.ALAMAT as ALAMAT_CUSTOMER_MASTER"
    )
    .leftJoin("master_customer as c", "h.KODE_PELANGGAN", "c.KODE_CUSTOMER")
    .orderBy("h.created_at", "desc");
};

/**
 * Mengambil satu data lengkap dengan info Customer
 */
export const getById = async (id) => {
  return db("inv_pengiriman_h as h")
    .select("h.*", "c.NAMA_CUSTOMER")
    .leftJoin("master_customer as c", "h.KODE_PELANGGAN", "c.KODE_CUSTOMER")
    .where({ "h.ID_PENGIRIMAN_H": id })
    .first();
};

/**
 * Validasi NO_PENGIRIMAN
 */
export const getPengirimanHByNo = async (noPengiriman) => {
  return db("inv_pengiriman_h").where({ NO_PENGIRIMAN: noPengiriman }).first();
};

/**
 * Simpan data baru
 */
export const create = async (data) => {
  // 1. Validasi dulu apakah Customer-nya ada di master_customer
  const customerExist = await db("master_customer")
    .where({ KODE_CUSTOMER: data.KODE_PELANGGAN })
    .first();

  if (!customerExist) {
    throw new Error(`Customer dengan kode ${data.KODE_PELANGGAN} tidak ditemukan di master data!`);
  }

  const [id] = await db("inv_pengiriman_h").insert({
    NO_PENGIRIMAN: data.NO_PENGIRIMAN,
    KODE_PELANGGAN: data.KODE_PELANGGAN,
    TGL_KIRIM: data.TGL_KIRIM,
    ALAMAT_TUJUAN: data.ALAMAT_TUJUAN || null,
    STATUS_KIRIM: data.STATUS_KIRIM || 'Diproses',
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
  
  return getById(id);
};

/**
 * Hapus data berdasarkan ID
 */
export const deleteHeader = async (id) => {
  return db("inv_pengiriman_h").where({ ID_PENGIRIMAN_H: id }).del();
};