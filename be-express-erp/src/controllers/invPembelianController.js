import * as InvPembelianModel from "../models/invPembelianModel.js";

/**
 * Mendapatkan semua data invoice pembelian
 */
export const getAllInvPembelian = async (req, res) => {
  try {
    const data = await InvPembelianModel.getAllInvPembelian();
    res.status(200).json({
      status: "00",
      message: "Berhasil mengambil semua data invoice",
      data
    });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * Mendapatkan satu invoice berdasarkan ID
 */
export const getInvPembelianById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await InvPembelianModel.getInvPembelianById(id);
    
    if (!data) {
      return res.status(404).json({ status: "01", message: "Invoice tidak ditemukan" });
    }

    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * Membuat invoice pembelian baru
 */
export const createInvPembelian = async (req, res) => {
  try {
    const { NO_INVOICE_BELI, KODE_VENDOR, TGL_INVOICE, TOTAL_BAYAR } = req.body;

    // Validasi input manual di controller sebelum ke model
    if (!NO_INVOICE_BELI || !KODE_VENDOR || !TGL_INVOICE || !TOTAL_BAYAR) {
      return res.status(400).json({
        status: "01",
        message: "Data wajib diisi: NO_INVOICE_BELI, KODE_VENDOR, TGL_INVOICE, TOTAL_BAYAR"
      });
    }

    // Panggil fungsi createInvPembelian dari Model
    const result = await InvPembelianModel.createInvPembelian(req.body);

    res.status(201).json({
      status: "00",
      message: "Invoice pembelian berhasil dibuat",
      data: result
    });
  } catch (err) {
    // Menangkap error dari database atau error "Data wajib diisi" dari Model
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * Mengupdate data invoice
 */
export const updateInvPembelian = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah data ada
    const exist = await InvPembelianModel.getInvPembelianById(id);
    if (!exist) {
      return res.status(404).json({ status: "01", message: "Data tidak ditemukan" });
    }

    const result = await InvPembelianModel.updateInvPembelian(id, req.body);
    res.status(200).json({
      status: "00",
      message: "Invoice berhasil diupdate",
      data: result
    });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * Menghapus invoice
 */
export const deleteInvPembelian = async (req, res) => {
  try {
    const { id } = req.params;
    
    const exist = await InvPembelianModel.getInvPembelianById(id);
    if (!exist) {
      return res.status(404).json({ status: "01", message: "Data tidak ditemukan" });
    }

    await InvPembelianModel.deleteInvPembelian(id);
    res.status(200).json({
      status: "00",
      message: "Invoice berhasil dihapus"
    });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};