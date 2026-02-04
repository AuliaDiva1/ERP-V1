import { db } from "../core/config/knex.js";

export const getAllInvPembelian = async () => {
  return db("inv_pembelian as i")
    .select("i.*", "v.NAMA_VENDOR")
    .leftJoin("master_vendor as v", "i.VENDOR_ID", "v.VENDOR_ID")
    .orderBy("i.created_at", "desc");
};

export const getInvPembelianByNo = async (noInvoice) => {
  return db("inv_pembelian").where({ NO_INVOICE_BELI: noInvoice }).first();
};

/**
 * SUPER CREATE: Simpan Header + Detail + Stok (Transaction)
 */
export const saveFullPurchase = async (header, items) => {
  return db.transaction(async (trx) => {
    // 1. Insert Header
    await trx("inv_pembelian").insert({
      ...header,
      created_at: db.fn.now()
    });

    // 2. Loop Items (Gunakan logika yang sama dengan createInvPembelianD)
    for (const item of items) {
      const subtotal = item.QTY_BELI * item.HARGA_SATUAN;

      // A. Insert Detail
      await trx("inv_pembelian_detail").insert({
        NO_INVOICE_BELI: header.NO_INVOICE_BELI,
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

      // B. Update Stok Lokasi
      const exist = await trx("STOK_LOKASI").where({
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        BATCH_NO: item.BATCH_NO
      }).first();

      if (exist) {
        await trx("STOK_LOKASI").where({ ID_STOK_LOKASI: exist.ID_STOK_LOKASI }).increment("QTY", item.QTY_BELI);
      } else {
        await trx("STOK_LOKASI").insert({
          BARANG_KODE: item.BARANG_KODE,
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK,
          QTY: item.QTY_BELI,
          BATCH_NO: item.BATCH_NO,
          TGL_KADALUARSA: item.TGL_KADALUARSA
        });
      }

      // C. Update Master Barang
      await trx("master_barang").where({ BARANG_KODE: item.BARANG_KODE }).increment("STOK_SAAT_INI", item.QTY_BELI);
    }
  });
};

/**
 * SUPER DELETE: Hapus Semua & Balikin Stok (Transaction)
 */
export const deleteFullPurchase = async (noInvoice) => {
  return db.transaction(async (trx) => {
    // 1. Ambil semua item dulu buat tau berapa stok yang harus dikurangi
    const items = await trx("inv_pembelian_detail").where({ NO_INVOICE_BELI: noInvoice });

    for (const item of items) {
      // A. Kurangi stok di lokasi
      await trx("STOK_LOKASI")
        .where({
          BARANG_KODE: item.BARANG_KODE,
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK,
          BATCH_NO: item.BATCH_NO
        })
        .decrement("QTY", item.QTY_BELI);

      // B. Kurangi stok di master
      await trx("master_barang").where({ BARANG_KODE: item.BARANG_KODE }).decrement("STOK_SAAT_INI", item.QTY_BELI);
    }

    // 2. Hapus Pembayaran (Jika ada)
    await trx("pembayaran_beli").where({ NO_INVOICE_BELI: noInvoice }).del();
    
    // 3. Hapus Detail
    await trx("inv_pembelian_detail").where({ NO_INVOICE_BELI: noInvoice }).del();

    // 4. Hapus Header
    await trx("inv_pembelian").where({ NO_INVOICE_BELI: noInvoice }).del();
  });
};