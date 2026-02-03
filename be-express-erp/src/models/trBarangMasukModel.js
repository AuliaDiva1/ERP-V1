import { db } from "../core/config/knex.js";
import { updateSaldoStok } from "./stokLokasiModel.js";

export const getAllBarangMasuk = async () => {
  return await db("TR_BARANG_MASUK")
    .join("master_barang", "TR_BARANG_MASUK.BARANG_KODE", "master_barang.BARANG_KODE")
    .select("TR_BARANG_MASUK.*", "master_barang.NAMA_BARANG")
    .orderBy("created_at", "desc");
};

export const createBarangMasuk = async (data) => {
  return db.transaction(async (trx) => {
    const [ID_MASUK] = await trx("TR_BARANG_MASUK").insert({
      NO_MASUK: data.NO_MASUK,
      BARANG_KODE: data.BARANG_KODE,
      KODE_GUDANG: data.KODE_GUDANG,
      KODE_RAK: data.KODE_RAK,
      QTY: data.QTY,
      BATCH_NO: data.BATCH_NO,
      TGL_KADALUARSA: data.TGL_KADALUARSA,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });

    await updateSaldoStok(trx, {
      BARANG_KODE: data.BARANG_KODE,
      KODE_GUDANG: data.KODE_GUDANG,
      KODE_RAK: data.KODE_RAK,
      BATCH_NO: data.BATCH_NO,
      TGL_KADALUARSA: data.TGL_KADALUARSA,
      QTY: data.QTY
    });

    await trx("master_barang")
      .where("BARANG_KODE", data.BARANG_KODE)
      .increment("STOK_SAAT_INI", data.QTY);

    return trx("TR_BARANG_MASUK").where({ ID_MASUK }).first();
  });
};

export const deleteBarangMasuk = async (id) => {
  return db.transaction(async (trx) => {
    const row = await trx("TR_BARANG_MASUK").where({ ID_MASUK: id }).first();
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

    return trx("TR_BARANG_MASUK").where({ ID_MASUK: id }).del();
  });
};