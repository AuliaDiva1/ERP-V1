// controllers/masterGajiJabatanController.js
import * as Model from "../models/masterGajiJabatanModel.js";
import { datetime, status } from "../utils/general.js";

export const getAll = async (req, res) => {
  try {
    const data = await Model.getAll(req.query.status || null);
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), total: data.length, data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await Model.getById(req.params.id);
    if (!data) return res.status(404).json({ status: status.GAGAL, message: "Data tidak ditemukan", datetime: datetime() });
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const getDistinctJabatan = async (req, res) => {
  try {
    const data = await Model.getDistinctJabatan();
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const create = async (req, res) => {
  try {
    if (!req.body.JABATAN) return res.status(400).json({ status: status.BAD_REQUEST, message: "JABATAN wajib diisi", datetime: datetime() });
    const data = await Model.create(req.body);
    return res.status(201).json({ status: status.SUKSES, message: "Berhasil disimpan", datetime: datetime(), data });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ status: status.GAGAL, message: "Jabatan & Departemen sudah ada", datetime: datetime() });
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const update = async (req, res) => {
  try {
    const existing = await Model.getById(req.params.id);
    if (!existing) return res.status(404).json({ status: status.GAGAL, message: "Data tidak ditemukan", datetime: datetime() });
    const data = await Model.update(req.params.id, req.body);
    return res.json({ status: status.SUKSES, message: "Berhasil diupdate", datetime: datetime(), data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const remove = async (req, res) => {
  try {
    const existing = await Model.getById(req.params.id);
    if (!existing) return res.status(404).json({ status: status.GAGAL, message: "Data tidak ditemukan", datetime: datetime() });
    await Model.remove(req.params.id);
    return res.json({ status: status.SUKSES, message: "Berhasil dihapus", datetime: datetime() });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};