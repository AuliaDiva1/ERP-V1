import * as InvPengirimanHModel from "../models/invPengirimanHModel.js";

/**
 * CREATE: Membuat header baru
 */
export const createPengirimanH = async (req, res) => {
  try {
    const { NO_PENGIRIMAN, TGL_KIRIM, KODE_PELANGGAN } = req.body;

    // Validasi input wajib sesuai kolom DB
    if (!NO_PENGIRIMAN || !TGL_KIRIM || !KODE_PELANGGAN) {
      return res.status(400).json({ 
        status: "01", 
        message: "Data wajib diisi: NO_PENGIRIMAN, TGL_KIRIM, KODE_PELANGGAN" 
      });
    }

    const result = await InvPengirimanHModel.create(req.body);
    res.status(201).json({
      status: "00",
      message: "Header pengiriman berhasil dibuat",
      data: result
    });
  } catch (err) {
    res.status(500).json({ status: "99", message: "Gagal membuat header", error: err.message });
  }
};

/**
 * GET BY ID: Mengambil satu data header
 */
export const getPengirimanHById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await InvPengirimanHModel.getById(id);
    
    if (!data) {
      return res.status(404).json({ status: "04", message: "Data tidak ditemukan" });
    }

    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * DELETE: Menghapus header
 */
export const deletePengirimanH = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await InvPengirimanHModel.getById(id);
    if (!existing) {
      return res.status(404).json({ status: "04", message: "Data tidak ditemukan" });
    }

    await InvPengirimanHModel.deleteHeader(id);
    res.status(200).json({ status: "00", message: "Header pengiriman berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", message: "Gagal menghapus header", error: err.message });
  }
};

/**
 * GET ALL: Ambil semua data
 */
export const getAllPengirimanH = async (req, res) => {
  try {
    const data = await InvPengirimanHModel.getAll();
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};