// controllers/masterKomponenGajiController.js
import * as Model from "../models/masterKomponenGajiModel.js";
import { datetime, status } from "../utils/general.js";

export const getAll = async (req, res) => {
  try {
    const data = await Model.getAll();
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), total: data.length, data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const getByKaryawan = async (req, res) => {
  try {
    const data = await Model.resolveKomponenGaji(req.params.karyawan_id);
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), data });
  } catch (err) {
    return res.status(404).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const upsert = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    if (!karyawan_id) return res.status(400).json({ status: status.BAD_REQUEST, message: "karyawan_id wajib", datetime: datetime() });
    const data = await Model.upsert(karyawan_id, req.body);
    return res.json({ status: status.SUKSES, message: "Komponen gaji berhasil disimpan", datetime: datetime(), data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const remove = async (req, res) => {
  try {
    await Model.remove(req.params.karyawan_id);
    return res.json({ status: status.SUKSES, message: "Override berhasil dihapus (akan kembali ke default jabatan)", datetime: datetime() });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};