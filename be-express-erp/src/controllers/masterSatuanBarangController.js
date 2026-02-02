import * as Model from "../models/masterSatuanBarangModel.js";

export const getAllSatuan = async (req, res) => {
  try {
    const data = await Model.getAllSatuanBarang();
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const getSatuanById = async (req, res) => {
  try {
    const data = await Model.getSatuanBarangById(req.params.id);
    if (!data) return res.status(404).json({ status: "04", message: "Not Found" });
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const createSatuan = async (req, res) => {
  try {
    const { KODE_SATUAN, NAMA_SATUAN } = req.body;
    if (!KODE_SATUAN || !NAMA_SATUAN) return res.status(400).json({ status: "01", message: "Field wajib diisi" });
    const data = await Model.createSatuanBarang(req.body);
    return res.status(201).json({ status: "00", message: "Created", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const updateSatuan = async (req, res) => {
  try {
    const data = await Model.updateSatuanBarang(req.params.id, req.body);
    return res.status(200).json({ status: "00", message: "Updated", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const deleteSatuan = async (req, res) => {
  try {
    await Model.deleteSatuanBarang(req.params.id);
    return res.status(200).json({ status: "00", message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};