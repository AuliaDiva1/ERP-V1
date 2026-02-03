import { db } from "../core/config/knex.js";

/**
 * Mendapatkan stok spesifik di satu lokasi
 **/
export const getStokByDetail = async (BARANG_KODE, KODE_GUDANG, KODE_RAK, BATCH_NO) => {
  return db("STOK_LOKASI").where({
    BARANG_KODE,
    KODE_GUDANG,
    KODE_RAK,
    BATCH_NO
  }).first();
};

/**
 * Fungsi Internal: Update Saldo (Tambah/Kurang)
 * Digunakan oleh model Barang Masuk & Keluar
 **/
export const updateSaldoStok = async (trx, { BARANG_KODE, KODE_GUDANG, KODE_RAK, BATCH_NO, QTY, TGL_KADALUARSA }) => {
  const existing = await trx("STOK_LOKASI").where({
    BARANG_KODE,
    KODE_GUDANG,
    KODE_RAK,
    BATCH_NO
  }).first();

  if (existing) {
    // Jika data ada, update QTY (tambah/kurang)
    return trx("STOK_LOKASI").where({ ID_STOK_LOKASI: existing.ID_STOK_LOKASI }).update({
      QTY: existing.QTY + QTY,
      UPDATED_AT: db.fn.now()
    });
  } else {
    // Jika data belum ada, insert baru
    return trx("STOK_LOKASI").insert({
      BARANG_KODE,
      KODE_GUDANG,
      KODE_RAK,
      BATCH_NO,
      QTY,
      TGL_KADALUARSA,
      UPDATED_AT: db.fn.now()
    });
  }
};