import { db } from "../core/config/knex.js";

export const getAllInvPembelian = async () => {
  return db("INV_PEMBELIAN").select("*").orderBy("created_at", "desc");
};

export const getInvPembelianById = async (id) => {
  return db("INV_PEMBELIAN").where({ ID_INV_BELI: id }).first();
};

// FUNGSI KRUSIAL: Untuk dicek oleh sistem pembayaran
export const getInvPembelianByNo = async (noInvoice) => {
  return db("INV_PEMBELIAN").where({ NO_INVOICE_BELI: noInvoice }).first();
};

export const createInvPembelian = async (data) => {
  const [id] = await db("INV_PEMBELIAN").insert({
    NO_INVOICE_BELI: data.NO_INVOICE_BELI,
    KODE_VENDOR: data.KODE_VENDOR,
    TGL_INVOICE: data.TGL_INVOICE,
    TOTAL_BAYAR: data.TOTAL_BAYAR,
    SISA_TAGIHAN: data.TOTAL_BAYAR,
    STATUS_BAYAR: "Belum Lunas",
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
  return db("INV_PEMBELIAN").where({ ID_INV_BELI: id }).first();
};