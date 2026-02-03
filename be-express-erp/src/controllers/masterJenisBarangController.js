import * as Model from "../models/masterJenisBarangModel.js";

export const getAllJenis = async (req, res) => {
  try {
    const data = await Model.getAllJenisBarang();
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const getJenisById = async (req, res) => {
  try {
    const data = await Model.getJenisBarangById(req.params.id);
    if (!data) return res.status(404).json({ status: "04", message: "Not Found" });
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const createJenis = async (req, res) => {
  try {
    const { KODE_JENIS, NAMA_JENIS } = req.body;
    if (!KODE_JENIS || !NAMA_JENIS) return res.status(400).json({ status: "01", message: "Field wajib diisi" });
    const data = await Model.createJenisBarang(req.body);
    return res.status(201).json({ status: "00", message: "Created", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const updateJenis = async (req, res) => {
  try {
    const data = await Model.updateJenisBarang(req.params.id, req.body);
    return res.status(200).json({ status: "00", message: "Updated", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const deleteJenis = async (req, res) => {
  try {
    await Model.deleteJenisBarang(req.params.id);
    return res.status(200).json({ status: "00", message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};