import * as Model from "../models/masterPerusahaaanModel.js";

export const getAll = async (req, res) => {
  try {
    const data = await Model.getAllPerusahaan();
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    console.error("GET_ALL_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await Model.getPerusahaanById(req.params.id);
    if (!data) return res.status(404).json({ status: "04", message: "Not Found" });
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const data = await Model.createPerusahaan(req.body);
    return res.status(201).json({ status: "00", message: "Created Success", data });
  } catch (err) {
    console.error("CREATE_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const data = await Model.updatePerusahaan(req.params.id, req.body);
    return res.status(200).json({ status: "00", message: "Updated Success", data });
  } catch (err) {
    console.error("UPDATE_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    await Model.deletePerusahaan(req.params.id);
    return res.status(200).json({ status: "00", message: "Deleted Success" });
  } catch (err) {
    console.error("DELETE_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};