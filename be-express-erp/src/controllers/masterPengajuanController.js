import * as Model from "../models/masterPengajuanModel.js";

// GET ALL
export const getAllPengajuan = async (req, res) => {
  try {
    const data = await Model.getAllPengajuan();
    return res.status(200).json({
      status: "00",
      message: "Success",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: err.message,
    });
  }
};

// GET BY ID
export const getPengajuanById = async (req, res) => {
  try {
    const data = await Model.getPengajuanById(req.params.id);
    if (!data) {
      return res.status(404).json({
        status: "04",
        message: "Pengajuan Not Found",
      });
    }
    return res.status(200).json({
      status: "00",
      message: "Success",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: err.message,
    });
  }
};

// CREATE
export const createPengajuan = async (req, res) => {
  try {
    const { KODE_PENGAJUAN, NAMA_PENGAJUAN, KATEGORI } = req.body;

    // Validasi mandatory
    if (!KODE_PENGAJUAN || !NAMA_PENGAJUAN || !KATEGORI) {
      return res.status(400).json({
        status: "01",
        message: "Data mandatori wajib diisi",
      });
    }

    const data = await Model.createPengajuan(req.body);
    return res.status(201).json({
      status: "00",
      message: "Created",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: err.message,
    });
  }
};

// UPDATE
export const updatePengajuan = async (req, res) => {
  try {
    const data = await Model.updatePengajuan(req.params.id, req.body);
    return res.status(200).json({
      status: "00",
      message: "Updated",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: err.message,
    });
  }
};

// DELETE
export const deletePengajuan = async (req, res) => {
  try {
    await Model.deletePengajuan(req.params.id);
    return res.status(200).json({
      status: "00",
      message: "Deleted",
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: err.message,
    });
  }
};