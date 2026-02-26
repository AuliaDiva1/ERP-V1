import { db } from "../core/config/knex.js";

// ==========================================
// SECTION: INV PENGIRIMAN (TRANSAKSI)
// ==========================================

/**
 * [GET] Mengambil semua daftar pengiriman dengan nama customer
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
 * [GET] Detail Header berdasarkan ID
 */
export const getById = async (id) => {
  return db("inv_pengiriman_h as h")
    .select("h.*", "c.NAMA_CUSTOMER")
    .leftJoin("master_customer as c", "h.KODE_PELANGGAN", "c.KODE_CUSTOMER")
    .where({ "h.ID_PENGIRIMAN_H": id })
    .first();
};

/**
 * [GET] Detail Header berdasarkan Nomor Pengiriman
 */
export const getByNo = async (noPengiriman) => {
  return db("inv_pengiriman_h").where({ NO_PENGIRIMAN: noPengiriman }).first();
};

/**
 * [CREATE] Simpan Transaksi Lengkap & Potong Stok
 */
export const saveFullTransaction = async (header, items) => {
  return await db.transaction(async (trx) => {
    const customer = await trx("master_customer").where({ KODE_CUSTOMER: header.KODE_PELANGGAN }).first();
    if (!customer) throw new Error(`Customer ${header.KODE_PELANGGAN} tidak ditemukan.`);

    const formattedDate = header.TGL_KIRIM ? header.TGL_KIRIM.split('T')[0] : new Date().toISOString().split('T')[0];

    await trx("inv_pengiriman_h").insert({
      NO_PENGIRIMAN: header.NO_PENGIRIMAN,
      KODE_PELANGGAN: header.KODE_PELANGGAN,
      TGL_KIRIM: formattedDate,
      ALAMAT_TUJUAN: header.ALAMAT_TUJUAN || customer.ALAMAT,
      STATUS_KIRIM: header.STATUS_KIRIM || 'Diproses',
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    });

    for (const item of items) {
      const qty = parseFloat(item.QTY) || 0;
      const stokLokasi = await trx("stok_lokasi")
        .where({ 
          BARANG_KODE: item.BARANG_KODE, 
          KODE_GUDANG: item.KODE_GUDANG, 
          KODE_RAK: item.KODE_RAK 
        }).first();

      if (!stokLokasi) throw new Error(`Data stok tidak ditemukan untuk Barang: ${item.BARANG_KODE}`);
      if (stokLokasi.QTY < qty) throw new Error(`Stok ${item.BARANG_KODE} tidak cukup!`);

      await trx("stok_lokasi").where({ ID_STOK_LOKASI: stokLokasi.ID_STOK_LOKASI }).decrement("QTY", qty);
      await trx("master_barang").where("BARANG_KODE", item.BARANG_KODE).decrement("STOK_SAAT_INI", qty);

      await trx("inv_pengiriman_d").insert({
        NO_PENGIRIMAN: header.NO_PENGIRIMAN,
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        QTY: qty,
        BATCH_NO: item.BATCH_NO || '-',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
    }
    return header.NO_PENGIRIMAN;
  });
};

/**
 * [UPDATE] Update Transaksi (Restore Stok Lama -> Potong Stok Baru)
 */
export const updateFullTransaction = async (id, header, items) => {
  return await db.transaction(async (trx) => {
    const oldHeader = await trx("inv_pengiriman_h").where({ ID_PENGIRIMAN_H: id }).first();
    if (!oldHeader) throw new Error("Data transaksi tidak ditemukan.");

    const oldDetails = await trx("inv_pengiriman_d").where({ NO_PENGIRIMAN: oldHeader.NO_PENGIRIMAN });
    for (const oldItem of oldDetails) {
      await trx("stok_lokasi").where({ BARANG_KODE: oldItem.BARANG_KODE, KODE_GUDANG: oldItem.KODE_GUDANG, KODE_RAK: oldItem.KODE_RAK }).increment("QTY", oldItem.QTY);
      await trx("master_barang").where("BARANG_KODE", oldItem.BARANG_KODE).increment("STOK_SAAT_INI", oldItem.QTY);
    }

    await trx("inv_pengiriman_d").where({ NO_PENGIRIMAN: oldHeader.NO_PENGIRIMAN }).del();

    const formattedDate = header.TGL_KIRIM ? header.TGL_KIRIM.split('T')[0] : oldHeader.TGL_KIRIM;

    await trx("inv_pengiriman_h").where({ ID_PENGIRIMAN_H: id }).update({
      KODE_PELANGGAN: header.KODE_PELANGGAN,
      TGL_KIRIM: formattedDate,
      ALAMAT_TUJUAN: header.ALAMAT_TUJUAN,
      STATUS_KIRIM: header.STATUS_KIRIM,
      updated_at: db.fn.now()
    });

    for (const item of items) {
      const qty = parseFloat(item.QTY) || 0;
      const stokLokasi = await trx("stok_lokasi").where({ BARANG_KODE: item.BARANG_KODE, KODE_GUDANG: item.KODE_GUDANG, KODE_RAK: item.KODE_RAK }).first();

      if (!stokLokasi || stokLokasi.QTY < qty) throw new Error(`Update Gagal: Stok ${item.BARANG_KODE} tidak mencukupi.`);

      await trx("stok_lokasi").where({ ID_STOK_LOKASI: stokLokasi.ID_STOK_LOKASI }).decrement("QTY", qty);
      await trx("master_barang").where("BARANG_KODE", item.BARANG_KODE).decrement("STOK_SAAT_INI", qty);

      await trx("inv_pengiriman_d").insert({
        NO_PENGIRIMAN: oldHeader.NO_PENGIRIMAN,
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        QTY: qty,
        BATCH_NO: item.BATCH_NO || '-',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
    }
  });
};

/**
 * [DELETE] Hapus Total & Restore Stok
 */
export const deleteFullTransaction = async (id) => {
  return await db.transaction(async (trx) => {
    const header = await trx("inv_pengiriman_h").where({ ID_PENGIRIMAN_H: id }).first();
    if (!header) throw new Error("Data tidak ditemukan.");

    const details = await trx("inv_pengiriman_d").where({ NO_PENGIRIMAN: header.NO_PENGIRIMAN });

    for (const item of details) {
      await trx("stok_lokasi").where({ BARANG_KODE: item.BARANG_KODE, KODE_GUDANG: item.KODE_GUDANG, KODE_RAK: item.KODE_RAK }).increment("QTY", item.QTY);
      await trx("master_barang").where("BARANG_KODE", item.BARANG_KODE).increment("STOK_SAAT_INI", item.QTY);
    }

    await trx("inv_pengiriman_d").where({ NO_PENGIRIMAN: header.NO_PENGIRIMAN }).del();
    await trx("inv_pengiriman_h").where({ ID_PENGIRIMAN_H: id }).del();
  });
};

// ==========================================
// SECTION: MASTER PERUSAHAAN (DATA PROFILE)
// ==========================================

/**
 * [GET] Mengambil Profil Perusahaan (Hanya 1 data teratas)
 */
export const getMasterPerusahaan = async () => {
  return db("master_perusahaan")
    .select(
      "NAMA_PERUSAHAAN",
      "ALAMAT_KANTOR",
      "ALAMAT_GUDANG",
      "TELEPON",
      "WA_HOTLINE",
      "EMAIL",
      "WEBSITE",
      "KOTA_TERBIT",
      "NAMA_PIMPINAN",
      "JABATAN_PIMPINAN",
      "LOGO_PATH"
    )
    .first();
};

/**
 * [GET] KOMPILASI DATA CETAK SURAT JALAN
 * Fungsi ini mengambil semua data yang dibutuhkan untuk PDF sekaligus
 */
export const getPrintData = async (idHeader) => {
  // 1. Ambil Header Pengiriman & Nama Customer
  const header = await db("inv_pengiriman_h as h")
    .select("h.*", "c.NAMA_CUSTOMER", "c.ALAMAT as ALAMAT_MASTER_CUSTOMER")
    .leftJoin("master_customer as c", "h.KODE_PELANGGAN", "c.KODE_CUSTOMER")
    .where("h.ID_PENGIRIMAN_H", idHeader)
    .first();

  if (!header) throw new Error("Data Pengiriman tidak ditemukan.");

  // 2. Ambil Detail Barang
  const details = await db("inv_pengiriman_d as d")
    .select("d.*", "b.NAMA_BARANG", "b.KODE_SATUAN")
    .leftJoin("master_barang as b", "d.BARANG_KODE", "b.BARANG_KODE")
    .where("d.NO_PENGIRIMAN", header.NO_PENGIRIMAN);

  // 3. Ambil Profil Perusahaan
  const perusahaan = await getMasterPerusahaan();

  return { header, details, perusahaan };
};