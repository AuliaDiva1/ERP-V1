import { db } from "../core/config/knex.js";

/**
 * Mendapatkan semua invoice pembelian dengan nama vendor
 */
export const getAllInvPembelian = async () => {
  return db("inv_pembelian as i")
    .select("i.*", "v.NAMA_VENDOR")
    .leftJoin("master_vendor as v", "i.VENDOR_ID", "v.VENDOR_ID")
    .orderBy("i.created_at", "desc");
};

/**
 * Mendapatkan satu invoice berdasarkan nomor
 */
export const getInvPembelianByNo = async (noInvoice) => {
  return db("inv_pembelian").where({ NO_INVOICE_BELI: noInvoice }).first();
};

/**
 * SUPER CREATE: Simpan Header + Detail + Stok + Pembayaran (Transaction)
 * Menjamin data masuk ke: inv_pembelian, inv_pembelian_detail, STOK_LOKASI, master_barang, dan pembayaran_beli
 */
export const saveFullPurchase = async (header, items) => {
  return db.transaction(async (trx) => {
    // 1. Insert Header ke inv_pembelian
    await trx("inv_pembelian").insert({
      ...header,
      created_at: db.fn.now()
    });

    // 2. Loop Items untuk rincian, stok, dan master barang
    for (const item of items) {
      const subtotal = item.QTY_BELI * item.HARGA_SATUAN;

      // A. Insert ke inv_pembelian_detail
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

      // B. Update/Insert ke STOK_LOKASI (Stok per Gudang/Rak/Batch)
      const exist = await trx("STOK_LOKASI").where({
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        BATCH_NO: item.BATCH_NO
      }).first();

      if (exist) {
        await trx("STOK_LOKASI")
          .where({ ID_STOK_LOKASI: exist.ID_STOK_LOKASI })
          .increment("QTY", item.QTY_BELI);
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

      // C. Update Total Stok di master_barang
      await trx("master_barang")
        .where({ BARANG_KODE: item.BARANG_KODE })
        .increment("STOK_SAAT_INI", item.QTY_BELI);
    }

    // 3. Insert ke pembayaran_beli (Hanya jika ada nominal pembayaran/DP)
    if (header.JUMLAH_BAYAR > 0) {
      await trx("pembayaran_beli").insert({
        NO_KWITANSI: `KW-${Date.now()}`, // Auto generate nomor kwitansi
        NO_INVOICE_BELI: header.NO_INVOICE_BELI,
        NOMINAL_BAYAR: header.JUMLAH_BAYAR,
        TGL_BAYAR: header.TGL_INVOICE, // Default pakai tanggal invoice
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
    }
  });
};

/**
 * SUPER DELETE: Hapus Semua & Balikin Stok (Transaction)
 */
export const deleteFullPurchase = async (noInvoice) => {
  return db.transaction(async (trx) => {
    // 1. Ambil semua detail item untuk mengembalikan stok
    const items = await trx("inv_pembelian_detail").where({ NO_INVOICE_BELI: noInvoice });

    for (const item of items) {
      // A. Kurangi stok di lokasi berdasarkan batch
      await trx("STOK_LOKASI")
        .where({
          BARANG_KODE: item.BARANG_KODE,
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK,
          BATCH_NO: item.BATCH_NO
        })
        .decrement("QTY", item.QTY_BELI);

      // B. Kurangi stok di master barang
      await trx("master_barang")
        .where({ BARANG_KODE: item.BARANG_KODE })
        .decrement("STOK_SAAT_INI", item.QTY_BELI);
    }

    // 2. Hapus Riwayat Pembayaran
    await trx("pembayaran_beli").where({ NO_INVOICE_BELI: noInvoice }).del();
    
    // 3. Hapus Detail Item
    await trx("inv_pembelian_detail").where({ NO_INVOICE_BELI: noInvoice }).del();

    // 4. Hapus Header Invoice
    await trx("inv_pembelian").where({ NO_INVOICE_BELI: noInvoice }).del();
  });
};