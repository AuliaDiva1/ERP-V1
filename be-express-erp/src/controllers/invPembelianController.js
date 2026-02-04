import * as InvPembelianModel from "../models/invPembelianModel.js";
import * as InvPembelianDModel from "../models/invPembelianDModel.js";

/**
 * ==========================================================
 * Bagian 1: HEADER (Invoice Utama)
 * ==========================================================
 */

export const getAllInvPembelian = async (req, res) => {
  try {
    const data = await InvPembelianModel.getAllInvPembelian();
    res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const getInvPembelianById = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    const data = await InvPembelianModel.getInvPembelianById(decodedId);
    if (!data) return res.status(404).json({ status: "01", message: "Tidak ditemukan" });
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const createInvPembelian = async (req, res) => {
  try {
    const { NO_INVOICE_BELI } = req.body;
    const check = await InvPembelianModel.getInvPembelianByNo(NO_INVOICE_BELI);
    if (check) return res.status(400).json({ status: "01", message: "Nomor Invoice sdh ada" });

    const result = await InvPembelianModel.createInvPembelian(req.body);
    res.status(201).json({ status: "00", message: "Header Dibuat", data: result });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const updateInvPembelian = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    await InvPembelianModel.updateInvPembelian(decodedId, req.body);
    res.status(200).json({ status: "00", message: "Updated" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

// Hapus sampe ke akar
export const deleteInvPembelian = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    
    const exist = await InvPembelianModel.getInvPembelianByNo(decodedId);
    if (!exist) return res.status(404).json({ status: "01", message: "Invoice tdk ditemukan" });

    await InvPembelianModel.deleteFullPurchase(decodedId);
    
    res.status(200).json({ status: "00", message: "Invoice & Relasi Berhasil Dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", error: "Gagal Hapus: " + err.message });
  }
};

/**
 * ==========================================================
 * Bagian 2: DETAIL (Barang & Stok)
 * ==========================================================
 */

export const getDetailByInvoice = async (req, res) => {
  try {
    const { noInvoice } = req.params;
    const decodedNo = decodeURIComponent(noInvoice);
    const data = await InvPembelianDModel.getDetailByInvoice(decodedNo);
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const addItemsToInvoice = async (req, res) => {
  try {
    const { items } = req.body;
    await InvPembelianDModel.createInvPembelianD(items);
    res.status(201).json({ status: "00", message: "Item ditambahkan" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const deleteDetailItem = async (req, res) => {
  try {
    const { idDetail } = req.params;
    await InvPembelianDModel.deleteInvPembelianD(idDetail);
    res.status(200).json({ status: "00", message: "Item terhapus" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * ==========================================================
 * Bagian 3: SUPER CREATE (LOGIC TAMBAHAN TANPA UBAH MODEL)
 * ==========================================================
 */
export const createFullPurchase = async (req, res) => {
  try {
    const { header, items } = req.body;

    // VALIDASI DASAR
    if (!header.NO_INVOICE_BELI || !items || items.length === 0) {
      return res.status(400).json({ status: "01", message: "Data tidak lengkap" });
    }

    // MAPPING DATA (Supaya pas dengan kolom PHPMyAdmin Om)
    const finalHeader = {
      NO_INVOICE_BELI: header.NO_INVOICE_BELI,
      VENDOR_ID: header.VENDOR_ID,
      TGL_INVOICE: header.TGL_INVOICE,
      TOTAL_BAYAR: parseFloat(header.TOTAL_BAYAR) || 0,
      SISA_TAGIHAN: parseFloat(header.SISA_TAGIHAN) || 0,
      STATUS_BAYAR: header.STATUS_BAYAR || "Belum Lunas",
    };

    const finalItems = items.map((item) => ({
      NO_INVOICE_BELI: header.NO_INVOICE_BELI,
      BARANG_KODE: item.BARANG_KODE,
      QTY_BELI: parseFloat(item.QTY_BELI) || 0,
      HARGA_SATUAN: parseFloat(item.HARGA_SATUAN) || 0,
      SUBTOTAL: parseFloat(item.SUBTOTAL) || 0,
      KODE_GUDANG: item.KODE_GUDANG,
      KODE_RAK: item.KODE_RAK,
      BATCH_NO: item.BATCH_NO || "",
      TGL_KADALUARSA: item.TGL_KADALUARSA || null
    }));

    // Eksekusi Model dengan Transaksi
    // Pastikan di InvPembelianModel.saveFullPurchase menangkap (finalHeader, finalItems)
    await InvPembelianModel.saveFullPurchase(finalHeader, finalItems);

    res.status(201).json({ status: "00", message: "Transaksi Lengkap Berhasil!" });
  } catch (err) {
    console.error("DEBUG ERROR API:", err);
    res.status(500).json({ 
      status: "99", 
      message: "Server Error: " + (err.sqlMessage || err.message) 
    });
  }
};