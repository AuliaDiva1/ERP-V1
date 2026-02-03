import * as PembayaranBeliModel from "../models/pembayaranBeliModel.js";
import * as InvPembelianModel from "../models/invPembelianModel.js";

export const createPembayaran = async (req, res) => {
  try {
    const { NO_KWITANSI, NO_INVOICE_BELI, NOMINAL_BAYAR } = req.body;

    if (!NO_KWITANSI || !NO_INVOICE_BELI || !NOMINAL_BAYAR) {
      return res.status(400).json({ status: "01", message: "Data tidak lengkap" });
    }

    const invoice = await InvPembelianModel.getInvPembelianByNo(NO_INVOICE_BELI);
    if (!invoice) {
      return res.status(404).json({ status: "04", message: "Invoice tidak ditemukan" });
    }

    if (parseFloat(NOMINAL_BAYAR) > parseFloat(invoice.SISA_TAGIHAN)) {
      return res.status(400).json({ status: "01", message: "Nominal melebihi sisa tagihan" });
    }

    const result = await PembayaranBeliModel.createPembayaran(req.body);
    res.status(201).json({ status: "00", message: "Sukses", data: result });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const data = await PembayaranBeliModel.getHistoryByInvoice(req.params.no_invoice);
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const deletePay = async (req, res) => {
  try {
    await PembayaranBeliModel.deletePembayaran(req.params.id);
    res.status(200).json({ status: "00", message: "Pembayaran di-VOID" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};