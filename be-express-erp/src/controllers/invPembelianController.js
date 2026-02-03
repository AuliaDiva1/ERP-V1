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
    const { NO_INVOICE_BELI, VENDOR_ID, TGL_INVOICE, TOTAL_BAYAR } = req.body;

    // 1. Validasi input (Ganti KODE_VENDOR jadi VENDOR_ID)
    if (!NO_INVOICE_BELI || !VENDOR_ID || !TGL_INVOICE || !TOTAL_BAYAR) {
      return res.status(400).json({
        status: "01",
        message: "Data wajib diisi: NO_INVOICE_BELI, VENDOR_ID, TGL_INVOICE, TOTAL_BAYAR"
      });
    }

    // 2. Cek apakah nomor invoice sudah pernah terdaftar
    const checkDuplicate = await InvPembelianModel.getInvPembelianByNo(NO_INVOICE_BELI);
    if (checkDuplicate) {
      return res.status(400).json({
        status: "01",
        message: `Nomor Invoice ${NO_INVOICE_BELI} sudah ada di sistem!`
      });
    }

    // 3. Panggil Model
    const result = await InvPembelianModel.createInvPembelian(req.body);

    res.status(201).json({
      status: "00",
      message: "Invoice pembelian berhasil dibuat",
      data: result
    });
  } catch (err) {
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