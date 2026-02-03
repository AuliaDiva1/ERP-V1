import * as HariModel from "../models/masterHariModel.js";

/** Ambil semua hari */
export const getAllHari = async (req, res) => {
  try {
    const data = await HariModel.getAllHari();
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Ambil hari by ID (Primary Key) */
export const getHariById = async (req, res) => {
  try {
    const data = await HariModel.getHariById(req.params.id);
    if (!data) return res.status(404).json({ status: "error", message: "Hari tidak ditemukan" });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Tambah hari */
export const createHari = async (req, res) => {
  try {
    const { 
      HARI_ID, 
      NAMA_HARI, 
      URUTAN, 
      JAM_MASUK_DEFAULT, 
      JAM_PULANG_DEFAULT, 
      IS_HARI_KERJA, 
      STATUS 
    } = req.body;

    // Validasi field wajib sesuai schema migrasi
    if (!HARI_ID || !NAMA_HARI || URUTAN === undefined) {
      return res.status(400).json({ 
        status: "error", 
        message: "Field HARI_ID, NAMA_HARI, dan URUTAN wajib diisi" 
      });
    }

    const hari = await HariModel.createHari({ 
      HARI_ID, 
      NAMA_HARI, 
      URUTAN, 
      JAM_MASUK_DEFAULT, 
      JAM_PULANG_DEFAULT, 
      IS_HARI_KERJA, 
      STATUS 
    });

    res.status(201).json({ status: "success", data: hari });
  } catch (err) {
    // Menangani error unique constraint (HARI_ID atau NAMA_HARI ganda)
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: "error", message: "HARI_ID atau NAMA_HARI sudah ada" });
    }
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Update hari */
export const updateHari = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      HARI_ID,
      NAMA_HARI, 
      URUTAN, 
      JAM_MASUK_DEFAULT, 
      JAM_PULANG_DEFAULT, 
      IS_HARI_KERJA, 
      STATUS 
    } = req.body;

    const hari = await HariModel.updateHari(id, { 
      HARI_ID,
      NAMA_HARI, 
      URUTAN, 
      JAM_MASUK_DEFAULT, 
      JAM_PULANG_DEFAULT, 
      IS_HARI_KERJA, 
      STATUS 
    });

    if (!hari) return res.status(404).json({ status: "error", message: "Hari tidak ditemukan" });

    res.status(200).json({ status: "success", data: hari });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** Hapus hari */
export const deleteHari = async (req, res) => {
  try {
    const deleted = await HariModel.deleteHari(req.params.id);
    if (!deleted) return res.status(404).json({ status: "error", message: "Hari tidak ditemukan" });
    res.status(200).json({ status: "success", message: "Hari berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};