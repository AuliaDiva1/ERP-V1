import { db } from "../core/config/knex.js";

/**
 * READ: Mengambil semua data pembelian + Nama Vendor
 */
export const getAllInvPembelian = async () => {
  return db("inv_pembelian as p")
    .select("p.*", "v.NAMA_VENDOR")
    .leftJoin("master_vendor as v", "p.VENDOR_ID", "v.VENDOR_ID")
    .orderBy("p.created_at", "desc");
};

/**
 * READ: Mengambil satu data berdasarkan ID
 */
export const getInvPembelianById = async (id) => {
  return db("inv_pembelian as p")
    .select("p.*", "v.NAMA_VENDOR")
    .leftJoin("master_vendor as v", "p.VENDOR_ID", "v.VENDOR_ID")
    .where({ "p.ID_INV_BELI": id })
    .first();
};

/**
 * CREATE: Simpan data invoice baru
 */
export const createInvPembelian = async (data) => {
  const [id] = await db("inv_pembelian").insert({
    NO_INVOICE_BELI: data.NO_INVOICE_BELI,
    VENDOR_ID: data.VENDOR_ID, 
    TGL_INVOICE: data.TGL_INVOICE,
    TOTAL_BAYAR: data.TOTAL_BAYAR || 0,
    SISA_TAGIHAN: data.TOTAL_BAYAR || 0, // Awalnya sisa tagihan = total bayar
    STATUS_BAYAR: data.STATUS_BAYAR || "Belum Lunas",
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });

  return getInvPembelianById(id);
};

/**
 * UPDATE: Mengubah data invoice yang sudah ada
 */
export const updateInvPembelian = async (id, data) => {
  await db("inv_pembelian")
    .where({ ID_INV_BELI: id })
    .update({
      NO_INVOICE_BELI: data.NO_INVOICE_BELI,
      VENDOR_ID: data.VENDOR_ID,
      TGL_INVOICE: data.TGL_INVOICE,
      TOTAL_BAYAR: data.TOTAL_BAYAR,
      SISA_TAGIHAN: data.SISA_TAGIHAN,
      STATUS_BAYAR: data.STATUS_BAYAR,
      updated_at: db.fn.now()
    });

  return getInvPembelianById(id);
};

/**
 * DELETE: Menghapus data invoice
 */
export const deleteInvPembelian = async (id) => {
  return db("inv_pembelian").where({ ID_INV_BELI: id }).del();
};

/**
 * VALIDASI: Cek nomor invoice (agar tidak double)
 */
export const getInvPembelianByNo = async (noInvoice) => {
  return db("inv_pembelian").where({ NO_INVOICE_BELI: noInvoice }).first();
};