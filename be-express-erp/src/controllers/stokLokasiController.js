import * as StokLokasiModel from "../models/stokLokasiModel.js";

export const getAllStok = async (req, res) => {
  try {
    const data = await StokLokasiModel.getCurrentStok({});
    return res.status(200).json({
      status: "00",
      message: data.length > 0 ? "Data stok berhasil diambil" : "Stok kosong",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal mengambil data stok", error: err.message });
  }
};

export const getStokByFilter = async (req, res) => {
  try {
    // Bisa filter lewat query: ?KODE_GUDANG=G01&BARANG_KODE=B001
    const data = await StokLokasiModel.getCurrentStok(req.query);
    return res.status(200).json({
      status: "00",
      message: "Data stok hasil filter berhasil diambil",
      data: data,
    });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal memfilter stok", error: err.message });
  }
};