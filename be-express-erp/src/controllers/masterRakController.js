import * as MasterRakModel from "../models/masterRakModel.js";
import * as MasterGudangModel from "../models/masterGudangModel.js";

// 1. GET ALL
export const getAllRak = async (req, res) => {
  try {
    const data = await MasterRakModel.getAllRak();
    return res.status(200).json({ status: "00", data });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};

// 2. GET BY GUDANG
export const getRakByGudang = async (req, res) => {
  try {
    const { kode_gudang } = req.params;
    const data = await MasterRakModel.getRakByGudang(kode_gudang);
    return res.status(200).json({ status: "00", data });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};

// 3. CREATE
export const createRak = async (req, res) => {
  try {
    const { KODE_GUDANG, KODE_RAK, NAMA_RAK } = req.body;
    // Validasi dasar...
    const result = await MasterRakModel.createRak(req.body);
    return res.status(201).json({ status: "00", message: "Berhasil", data: result });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};

// 4. UPDATE (Fungsi yang kamu kirim tadi)
export const updateRak = async (req, res) => {
  // ... isi kode yang kamu kirim di atas ...
};

// 5. DELETE
export const deleteRak = async (req, res) => {
  try {
    const { id } = req.params;
    await MasterRakModel.deleteRak(id);
    return res.status(200).json({ status: "00", message: "Data rak berhasil dihapus" });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};