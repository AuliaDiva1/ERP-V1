import { db } from "../core/config/knex.js";

/**
 * READ: Mengambil semua item dalam satu invoice (Detail View)
 * Lengkap dengan join nama barang, gudang, dan rak
 */
export const getDetailByInvoice = async (noInvoice) => {
  return db("inv_pembelian_detail as d")
    .select(
      "d.*", 
      "b.NAMA_BARANG", 
      "g.NAMA_GUDANG", 
      "r.NAMA_RAK"
    )
    .leftJoin("master_barang as b", "d.BARANG_KODE", "b.BARANG_KODE")
    .leftJoin("MASTER_GUDANG as g", "d.KODE_GUDANG", "g.KODE_GUDANG")
    .leftJoin("MASTER_RAK as r", "d.KODE_RAK", "r.KODE_RAK")
    .where({ "d.NO_INVOICE_BELI": noInvoice });
};

/**
 * CREATE: Simpan Item Detail & Update Stok Fisik (Transaction)
 * Menambah stok di STOK_LOKASI dan STOK_SAAT_INI di master_barang
 */
export const createInvPembelianD = async (items) => {
  return db.transaction(async (trx) => {
    const results = [];

    // Pastikan items selalu dalam bentuk array
    const itemsArray = Array.isArray(items) ? items : [items];

    for (const item of itemsArray) {
      const subtotal = item.QTY_BELI * item.HARGA_SATUAN;

      // 1. Simpan baris detail barang
      const [idDetail] = await trx("inv_pembelian_detail").insert({
        NO_INVOICE_BELI: item.NO_INVOICE_BELI,
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        QTY_BELI: item.QTY_BELI,
        HARGA_SATUAN: item.HARGA_SATUAN,
        SUBTOTAL: subtotal,
        BATCH_NO: item.BATCH_NO,
        TGL_KADALUARSA: item.TGL_KADALUARSA,
        created_at: db.fn.now()
      });

      // 2. Update STOK_LOKASI (Tambah stok di rak tertentu)
      const existingStok = await trx("STOK_LOKASI")
        .where({
          BARANG_KODE: item.BARANG_KODE,
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK,
          BATCH_NO: item.BATCH_NO
        })
        .first();

      if (existingStok) {
        await trx("STOK_LOKASI")
          .where({ ID_STOK_LOKASI: existingStok.ID_STOK_LOKASI })
          .increment("QTY", item.QTY_BELI);
      } else {
        await trx("STOK_LOKASI").insert({
          BARANG_KODE: item.BARANG_KODE,
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK,
          QTY: item.QTY_BELI,
          BATCH_NO: item.BATCH_NO,
          TGL_KADALUARSA: item.TGL_KADALUARSA,
          UPDATED_AT: db.fn.now()
        });
      }

      // 3. Update master_barang (Update Stok Total & Harga Beli Terakhir)
      await trx("master_barang")
        .where({ BARANG_KODE: item.BARANG_KODE })
        .update({
          HARGA_BELI_TERAKHIR: item.HARGA_SATUAN,
          updated_at: db.fn.now()
        })
        .increment("STOK_SAAT_INI", item.QTY_BELI);

      results.push(idDetail);
    }

    return results;
  });
};

/**
 * DELETE: Hapus Item Detail & Kurangi Stok (Rollback Stok)
 * Digunakan jika ingin menghapus satu per satu item di dalam invoice
 */
export const deleteInvPembelianD = async (idDetail) => {
  return db.transaction(async (trx) => {
    // Cari data detailnya dulu buat ambil info QTY dan Kode Barang
    const item = await trx("inv_pembelian_detail")
      .where({ ID_BELI_DETAIL: idDetail }) // Sesuaikan nama kolom ID di tabelmu
      .first();
    
    if (!item) throw new Error("Item detail tidak ditemukan");

    // 1. Tarik kembali stok dari STOK_LOKASI (Kurangi)
    await trx("STOK_LOKASI")
      .where({
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        BATCH_NO: item.BATCH_NO
      })
      .decrement("QTY", item.QTY_BELI);

    // 2. Kurangi stok global di master_barang
    await trx("master_barang")
      .where({ BARANG_KODE: item.BARANG_KODE })
      .decrement("STOK_SAAT_INI", item.QTY_BELI);

    // 3. Hapus data detail
    return trx("inv_pembelian_detail").where({ ID_BELI_DETAIL: idDetail }).del();
  });
};