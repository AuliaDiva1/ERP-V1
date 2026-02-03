import { db } from "../core/config/knex.js";

export const createPengirimanDetails = async (items) => {
  return db.transaction(async (trx) => {
    for (const item of items) {
      // 1. Cek stok di tabel stok_lokasi (Per Gudang & Rak)
      const stokLokasi = await trx("stok_lokasi")
        .where({ 
          BARANG_KODE: item.BARANG_KODE, 
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK 
        })
        .first();

      if (!stokLokasi || stokLokasi.QTY < item.QTY) {
        throw new Error(`Stok ${item.BARANG_KODE} tidak cukup di lokasi tersebut!`);
      }

      // 2. POTONG STOK di stok_lokasi
      await trx("stok_lokasi")
        .where({ 
          BARANG_KODE: item.BARANG_KODE, 
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK 
        })
        .decrement("QTY", item.QTY);

      // 3. POTONG STOK di master_barang (Stok Global)
      await trx("master_barang")
        .where({ BARANG_KODE: item.BARANG_KODE })
        .decrement("STOK_SAAT_INI", item.QTY);

      // 4. Simpan ke Detail Pengiriman (inv_pengiriman_d)
      await trx("inv_pengiriman_d").insert({
        NO_PENGIRIMAN: item.NO_PENGIRIMAN,
        BARANG_KODE: item.BARANG_KODE,
        KODE_GUDANG: item.KODE_GUDANG,
        KODE_RAK: item.KODE_RAK,
        QTY: item.QTY,
        BATCH_NO: item.BATCH_NO || '-',
        created_at: db.fn.now(),
        updated_at: db.fn.now()
      });
    }
  });
};

export const deleteDetail = async (id) => {
  return db.transaction(async (trx) => {
    const item = await trx("inv_pengiriman_d").where({ ID_PENGIRIMAN_D: id }).first();
    
    if (item) {
      // 1. Kembalikan Stok ke stok_lokasi
      await trx("stok_lokasi")
        .where({ 
          BARANG_KODE: item.BARANG_KODE, 
          KODE_GUDANG: item.KODE_GUDANG,
          KODE_RAK: item.KODE_RAK 
        })
        .increment("QTY", item.QTY);

      // 2. Kembalikan Stok ke master_barang
      await trx("master_barang")
        .where({ BARANG_KODE: item.BARANG_KODE })
        .increment("STOK_SAAT_INI", item.QTY);
        
      // 3. Hapus baris detail
      return trx("inv_pengiriman_d").where({ ID_PENGIRIMAN_D: id }).del();
    }
  });
};

// Fungsi pendukung lainnya tetap sama
export const getDetailsByNoPengiriman = async (no_pengiriman) => {
  return db("inv_pengiriman_d").where({ NO_PENGIRIMAN: no_pengiriman });
};

export const getDetailById = async (id) => {
  return db("inv_pengiriman_d").where({ ID_PENGIRIMAN_D: id }).first();
};