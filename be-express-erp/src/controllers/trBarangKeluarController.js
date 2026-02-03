import * as TrBarangKeluarModel from "../models/trBarangKeluarModel.js";

export const getAllBarangKeluar = async (req, res) => {
  try {
    const data = await TrBarangKeluarModel.getAllBarangKeluar();
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const createBarangKeluar = async (req, res) => {
  try {
    const { NO_KELUAR, NO_PENGIRIMAN, BARANG_KODE, KODE_GUDANG, KODE_RAK, QTY, BATCH_NO } = req.body;

    if (!NO_KELUAR || !BARANG_KODE || !KODE_GUDANG || !QTY) {
      return res.status(400).json({ status: "01", message: "Data tidak lengkap!" });
    }

    const payload = {
      NO_KELUAR,
      NO_PENGIRIMAN: NO_PENGIRIMAN || null,
      BARANG_KODE,
      KODE_GUDANG,
      KODE_RAK: KODE_RAK || null,
      QTY: parseFloat(QTY),
      BATCH_NO: BATCH_NO || null
    };

    const result = await TrBarangKeluarModel.createBarangKeluar(payload);
    res.status(201).json({ status: "00", message: "Barang keluar berhasil!", data: result });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const deleteBarangKeluar = async (req, res) => {
  try {
    const { id } = req.params;
    await TrBarangKeluarModel.deleteBarangKeluar(id);
    res.status(200).json({ status: "00", message: "Transaksi VOID berhasil, stok dikembalikan" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};