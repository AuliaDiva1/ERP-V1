import { db } from "../core/config/knex.js";
import { updateSaldoStok } from "./stokLokasiModel.js";

export const getAllBarangKeluar = async () => {
  return await db("TR_BARANG_KELUAR")
    .join("master_barang", "TR_BARANG_KELUAR.BARANG_KODE", "master_barang.BARANG_KODE")
    .select("TR_BARANG_KELUAR.*", "master_barang.NAMA_BARANG")
    .orderBy("created_at", "desc");
};

export const createBarangKeluar = async (data) => {
  return db.transaction(async (trx) => {
    // 1. Cek Stok di Lokasi
    const stokCurrent = await trx("STOK_LOKASI").where({
      BARANG_KODE: data.BARANG_KODE,
      KODE_GUDANG: data.KODE_GUDANG,
      KODE_RAK: data.KODE_RAK,
      BATCH_NO: data.BATCH_NO
    }).first();

    if (!stokCurrent || stokCurrent.QTY < data.QTY) {
      throw new Error(`Stok tidak cukup! Sisa stok: ${stokCurrent ? stokCurrent.QTY : 0}`);
    }

    // 2. Simpan Transaksi Keluar
    const [ID_KELUAR] = await trx("TR_BARANG_KELUAR").insert({
      NO_KELUAR: data.NO_KELUAR,
      NO_PENGIRIMAN: data.NO_PENGIRIMAN,
      BARANG_KODE: data.BARANG_KODE,
      KODE_GUDANG: data.KODE_GUDANG,
      KODE_RAK: data.KODE_RAK,
      QTY: data.QTY,
      BATCH_NO: data.BATCH_NO,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });

    // 3. Potong Stok Lokasi
    await updateSaldoStok(trx, {
      BARANG_KODE: data.BARANG_KODE,
      KODE_GUDANG: data.KODE_GUDANG,
      KODE_RAK: data.KODE_RAK,
      BATCH_NO: data.BATCH_NO,
      QTY: -data.QTY // Negatif untuk potong
    });

    // 4. Potong Stok Master
    await trx("master_barang")
      .where("BARANG_KODE", data.BARANG_KODE)
      .decrement("STOK_SAAT_INI", data.QTY);

    return trx("TR_BARANG_KELUAR").where({ ID_KELUAR }).first();
  });
};

export const deleteBarangKeluar = async (id) => {
  return db.transaction(async (trx) => {
    const row = await trx("TR_BARANG_KELUAR").where({ ID_KELUAR: id }).first();
    if (!row) throw new Error("Data tidak ditemukan");

    // 1. Balikin Stok Master (Tambah lagi)
    await trx("master_barang")
      .where("BARANG_KODE", row.BARANG_KODE)
      .increment("STOK_SAAT_INI", row.QTY);

    // 2. Balikin Stok Lokasi (QTY Positif)
    await updateSaldoStok(trx, {
      BARANG_KODE: row.BARANG_KODE,
      KODE_GUDANG: row.KODE_GUDANG,
      KODE_RAK: row.KODE_RAK,
      BATCH_NO: row.BATCH_NO,
      QTY: row.QTY
    });

    // 3. Hapus Log
    return trx("TR_BARANG_KELUAR").where({ ID_KELUAR: id }).del();
  });
};