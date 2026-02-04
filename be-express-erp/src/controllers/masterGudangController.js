import * as MasterGudangModel from "../models/masterGudangModel.js";

/**
 * GET semua gudang
 */
export const getAllGudang = async (req, res) => {
  try {
    const data = await MasterGudangModel.getAllGudang();
    return res.status(200).json({
      status: "00",
      message: data.length > 0 ? "Data gudang berhasil diambil" : "Belum ada data gudang",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal mengambil data gudang", error: err.message });
  }
};

/**
 * CREATE gudang baru
 */
export const createGudang = async (req, res) => {
  try {
    const { KODE_GUDANG, NAMA_GUDANG, ALAMAT, STATUS } = req.body;

    if (!KODE_GUDANG || !NAMA_GUDANG) {
      return res.status(400).json({ status: "01", message: "KODE_GUDANG dan NAMA_GUDANG wajib diisi" });
    }

    // Cek duplikat KODE_GUDANG
    const existing = await MasterGudangModel.getGudangByKode(KODE_GUDANG);
    if (existing) {
      return res.status(409).json({ status: "02", message: `Gudang dengan kode ${KODE_GUDANG} sudah ada` });
    }

    const newGudang = await MasterGudangModel.createGudang({ KODE_GUDANG, NAMA_GUDANG, ALAMAT, STATUS });
    return res.status(201).json({ status: "00", message: "Gudang berhasil ditambahkan", data: newGudang });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal menambahkan gudang", error: err.message });
  }
};

/**
 * UPDATE gudang
 */
export const updateGudang = async (req, res) => {
  try {
    // Ambil ID dari params. Pastikan di routes penulisan :id sesuai
    const { id } = req.params; 

    if (!id || id === "undefined") {
      return res.status(400).json({ status: "01", message: "ID Gudang tidak valid" });
    }

    const existing = await MasterGudangModel.getGudangById(id);
    if (!existing) {
      return res.status(404).json({ status: "04", message: "Gudang tidak ditemukan" });
    }

    // Filter body untuk memastikan tidak mencoba update primary key (ID_GUDANG)
    const { ID_GUDANG, ...updateData } = req.body;

    const updated = await MasterGudangModel.updateGudang(id, updateData);
    return res.status(200).json({ status: "00", message: "Gudang berhasil diperbarui", data: updated });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal memperbarui gudang", error: err.message });
  }
};

/**
 * DELETE gudang
 */
export const deleteGudang = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ status: "01", message: "ID Gudang tidak valid" });
    }

    const existing = await MasterGudangModel.getGudangById(id);
    if (!existing) {
      return res.status(404).json({ status: "04", message: "Gudang tidak ditemukan" });
    }

    await MasterGudangModel.deleteGudang(id);
    return res.status(200).json({ status: "00", message: "Gudang berhasil dihapus" });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal menghapus gudang", error: err.message });
  }
};