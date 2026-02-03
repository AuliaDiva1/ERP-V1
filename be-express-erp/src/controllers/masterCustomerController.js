import * as CustomerModel from "../models/masterCustomerModel.js";

export const getCustomers = async (req, res) => {
  try {
    const data = await CustomerModel.getAll();
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { KODE_CUSTOMER, NAMA_CUSTOMER } = req.body;
    if (!KODE_CUSTOMER || !NAMA_CUSTOMER) {
      return res.status(400).json({ status: "01", message: "Kode & Nama wajib diisi" });
    }

    const exist = await CustomerModel.getByKode(KODE_CUSTOMER);
    if (exist) return res.status(400).json({ status: "01", message: "Kode Customer sudah terdaftar" });

    const data = await CustomerModel.create(req.body);
    res.status(201).json({ status: "00", message: "Customer berhasil ditambah", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const data = await CustomerModel.update(req.params.id, req.body);
    res.status(200).json({ status: "00", message: "Customer berhasil diupdate", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    await CustomerModel.destroy(req.params.id);
    res.status(200).json({ status: "00", message: "Customer berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};