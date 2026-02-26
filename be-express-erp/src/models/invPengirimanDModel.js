import { db } from "../core/config/knex.js";

/**
 * [GET] Mengambil semua detail berdasarkan Nomor Pengiriman
 * Join dengan master_barang dan master_satuan_barang agar detail item lengkap
 */
export const getDetailsByNoPengiriman = async (no_pengiriman) => {
  try {
    return await db("inv_pengiriman_d as d")
      .select(
        "d.ID_PENGIRIMAN_D",
        "d.NO_PENGIRIMAN",
        "d.BARANG_KODE",
        "d.KODE_GUDANG",
        "d.KODE_RAK",
        "d.QTY",
        "d.BATCH_NO",
        "d.created_at",
        "d.updated_at",
        "b.NAMA_BARANG",
        "s.KODE_SATUAN" // Diambil dari master_satuan_barang melalui b.SATUAN_ID
      )
      .leftJoin("master_barang as b", "d.BARANG_KODE", "b.BARANG_KODE")
      .leftJoin("master_satuan_barang as s", "b.SATUAN_ID", "s.ID")
      .where("d.NO_PENGIRIMAN", no_pengiriman)
      .orderBy("d.ID_PENGIRIMAN_D", "asc");
  } catch (error) {
    console.error("DATABASE_QUERY_ERROR (Detail):", error.message);
    throw error;
  }
};

/**
 * [GET] Mengambil satu detail berdasarkan ID
 */
export const getDetailById = async (id) => {
  return db("inv_pengiriman_d").where({ ID_PENGIRIMAN_D: id }).first();
};

/**
 * [CREATE] Simpan detail item ke pengiriman dan potong stok (Double-Cut)
 * Memastikan stok di rak spesifik dan stok total barang berkurang
 */
export const createPengirimanDetails = async (items) => {
  return db.transaction(async (trx) => {
    for (const item of items) {
      const qty = parseFloat(item.QTY) || 0;

      // 1. Cek ketersediaan stok di lokasi (Gudang & Rak)
      const stokLokasi = await trx("stok_lokasi")
        .where({ 
          BARANG_KODE: item.BARANG_KODE, 
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK 
        })
        .first();

      if (!stokLokasi || stokLokasi.QTY < qty) {
        throw new Error(
          `Stok [${item.BARANG_KODE}] tidak cukup di ${item.KODE_GUDANG}-${item.KODE_RAK}. ` +
          `Tersedia: ${stokLokasi ? stokLokasi.QTY : 0}, Diminta: ${qty}`
        );
      }

      // 2. Potong stok di tabel stok_lokasi (stok fisik rak)
      await trx("stok_lokasi")
        .where({ 
            BARANG_KODE: item.BARANG_KODE, 
            KODE_GUDANG: item.KODE_GUDANG, 
            KODE_RAK: item.KODE_RAK 
        })
        .decrement("QTY", qty);

      // 3. Potong stok di tabel master_barang (stok global)
      await trx("master_barang")
        .where({ BARANG_KODE: item.BARANG_KODE })
        .decrement("STOK_SAAT_INI", qty);

      // 4. Masukkan ke tabel detail pengiriman
      await trx("inv_pengiriman_d").insert({
        NO_PENGIRIMAN: item.NO_PENGIRIMAN,
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        QTY: qty,
        BATCH_NO: item.BATCH_NO || '-',
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  });
};

/**
 * [DELETE] Hapus satu baris detail dan kembalikan stoknya (Rollback)
 */
export const deleteDetail = async (id) => {
  return db.transaction(async (trx) => {
    // Ambil data detail sebelum dihapus untuk tahu berapa qty yang harus dikembalikan
    const item = await trx("inv_pengiriman_d").where({ ID_PENGIRIMAN_D: id }).first();
    
    if (!item) throw new Error("Data detail tidak ditemukan.");

    // 1. Kembalikan stok ke lokasi rak semula
    await trx("stok_lokasi")
      .where({ 
          BARANG_KODE: item.BARANG_KODE, 
          KODE_GUDANG: item.KODE_GUDANG, 
          KODE_RAK: item.KODE_RAK 
      })
      .increment("QTY", item.QTY);

    // 2. Kembalikan stok ke master_barang
    await trx("master_barang")
      .where({ BARANG_KODE: item.BARANG_KODE })
      .increment("STOK_SAAT_INI", item.QTY);
      
    // 3. Hapus baris detail
    return trx("inv_pengiriman_d").where({ ID_PENGIRIMAN_D: id }).del();
  });
};