import { db } from "../core/config/knex.js";

/**
 * MENDAPATKAN SEMUA STOK (Untuk Tabel & Laporan PDF)
 * Ditambahkan agar Controller bisa ambil data untuk ditampilkan
 **/
export const getCurrentStok = async (filters = {}) => {
  const query = db("STOK_LOKASI as s")
    .select(
      "s.*",
      "b.NAMA_BARANG",
      "g.NAMA_GUDANG",
      "r.NAMA_RAK"
    )
    .leftJoin("master_barang as b", "s.BARANG_KODE", "b.BARANG_KODE")
    .leftJoin("MASTER_GUDANG as g", "s.KODE_GUDANG", "g.KODE_GUDANG")
    .leftJoin("MASTER_RAK as r", "s.KODE_RAK", "r.KODE_RAK");

  // Filter dinamis jika diperlukan
  if (filters.KODE_GUDANG) query.where("s.KODE_GUDANG", filters.KODE_GUDANG);
  if (filters.BARANG_KODE) query.where("s.BARANG_KODE", filters.BARANG_KODE);

  return query.orderBy("s.UPDATED_AT", "desc");
};

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