import { db } from "../core/config/knex.js";
import { updateSaldoStok } from "./stokLokasiModel.js";

const TABLE = "TR_BARANG_MASUK"; 

export const getAllBarangMasuk = async () => {
  return await db(TABLE)
    .leftJoin("master_barang", `${TABLE}.BARANG_KODE`, "master_barang.BARANG_KODE")
    .leftJoin("master_gudang", `${TABLE}.KODE_GUDANG`, "master_gudang.KODE_GUDANG")
    .leftJoin("master_rak", `${TABLE}.KODE_RAK`, "master_rak.KODE_RAK")
    .select(
      `${TABLE}.*`, 
      "master_barang.NAMA_BARANG",
      "master_gudang.NAMA_GUDANG", 
      "master_rak.NAMA_RAK"
    )
    .orderBy(`${TABLE}.created_at`, "desc"); // Tambahkan nama tabel agar tidak Error 500
};

export const createBarangMasuk = async (data) => {
  return db.transaction(async (trx) => {
    // Insert data (tetap menyimpan KODE)
    const [ID_MASUK] = await trx(TABLE).insert({
      NO_MASUK: data.NO_MASUK,
      BARANG_KODE: data.BARANG_KODE,
      KODE_GUDANG: data.KODE_GUDANG,
      KODE_RAK: data.KODE_RAK || null,
      QTY: data.QTY,
      BATCH_NO: data.BATCH_NO || null,
      TGL_KADALUARSA: data.TGL_KADALUARSA || null,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });

    // Update stok lokasi
    await updateSaldoStok(trx, {
      BARANG_KODE: data.BARANG_KODE,
      KODE_GUDANG: data.KODE_GUDANG,
      KODE_RAK: data.KODE_RAK,
      BATCH_NO: data.BATCH_NO,
      TGL_KADALUARSA: data.TGL_KADALUARSA,
      QTY: data.QTY
    });

    // Update stok master
    await trx("master_barang")
      .where("BARANG_KODE", data.BARANG_KODE)
      .increment("STOK_SAAT_INI", data.QTY);

    return trx(TABLE).where({ ID_MASUK }).first();
  });
};

export const deleteBarangMasuk = async (id) => {
  return db.transaction(async (trx) => {
    const row = await trx(TABLE).where({ ID_MASUK: id }).first();
    if (!row) throw new Error("Data tidak ditemukan");

    await trx("master_barang")
      .where("BARANG_KODE", row.BARANG_KODE)
      .decrement("STOK_SAAT_INI", row.QTY);

    await updateSaldoStok(trx, {
      BARANG_KODE: row.BARANG_KODE,
      KODE_GUDANG: row.KODE_GUDANG,
      KODE_RAK: row.KODE_RAK,
      BATCH_NO: row.BATCH_NO,
      TGL_KADALUARSA: row.TGL_KADALUARSA,
      QTY: -row.QTY
    });

    return trx(TABLE).where({ ID_MASUK: id }).del();
  });
};