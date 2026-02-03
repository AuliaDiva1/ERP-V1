import * as TrBarangMasukModel from "../models/trBarangMasukModel.js";

export const getAllBarangMasuk = async (req, res) => {
  try {
    const data = await TrBarangMasukModel.getAllBarangMasuk();
    return res.status(200).json({ status: "00", data });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};

export const createBarangMasuk = async (req, res) => {
  try {
    const { NO_MASUK, BARANG_KODE, KODE_GUDANG, KODE_RAK, QTY, BATCH_NO, TGL_KADALUARSA } = req.body;

    if (!NO_MASUK || !BARANG_KODE || !KODE_GUDANG || !QTY) {
      return res.status(400).json({ 
        status: "01", 
        message: "Field NO_MASUK, BARANG_KODE, KODE_GUDANG, dan QTY wajib diisi" 
      });
    }

    const payload = {
      NO_MASUK,
      BARANG_KODE,
      KODE_GUDANG,
      KODE_RAK: KODE_RAK || null,
      QTY: parseFloat(QTY),
      BATCH_NO: BATCH_NO || null,
      TGL_KADALUARSA: TGL_KADALUARSA || null
    };

    const result = await TrBarangMasukModel.createBarangMasuk(payload);
    return res.status(201).json({ status: "00", message: "Berhasil catat barang masuk", data: result });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};

export const deleteBarangMasuk = async (req, res) => {
  try {
    const { id } = req.params;
    await TrBarangMasukModel.deleteBarangMasuk(id);
    return res.status(200).json({ status: "00", message: "Transaksi dibatalkan & stok dikurangi" });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};