// controllers/masterPayrollController.js
import * as Model from "../models/masterPayrollModel.js";
import { datetime, status } from "../utils/general.js";

export const getAll = async (req, res) => {
  try {
    const { periode, status: sts, departemen } = req.query;
    const data = await Model.getAll({ periode, status: sts, departemen });
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), total: data.length, data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const getById = async (req, res) => {
  try {
    const data = await Model.getById(req.params.id);
    if (!data) return res.status(404).json({ status: status.GAGAL, message: "Payroll tidak ditemukan", datetime: datetime() });
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const getSummary = async (req, res) => {
  try {
    const { periode } = req.query;
    if (!periode) return res.status(400).json({ status: status.BAD_REQUEST, message: "periode wajib (YYYY-MM-DD)", datetime: datetime() });
    const data = await Model.getSummaryPeriode(periode);
    return res.json({ status: status.SUKSES, message: "Berhasil", datetime: datetime(), data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const preview = async (req, res) => {
  try {
    const { karyawan_id, start_date, end_date } = req.query;
    if (!karyawan_id || !start_date || !end_date)
      return res.status(400).json({ status: status.BAD_REQUEST, message: "karyawan_id, start_date, end_date wajib", datetime: datetime() });
    const data = await Model.previewPayroll(karyawan_id, start_date, end_date);
    return res.json({ status: status.SUKSES, message: "Preview berhasil", datetime: datetime(), data });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const generate = async (req, res) => {
  try {
    const { karyawan_id, start_date, end_date } = req.body;
    if (!karyawan_id || !start_date || !end_date)
      return res.status(400).json({ status: status.BAD_REQUEST, message: "karyawan_id, start_date, end_date wajib", datetime: datetime() });
    const data = await Model.generatePayroll(karyawan_id, start_date, end_date);
    return res.status(201).json({ status: status.SUKSES, message: "Payroll berhasil digenerate", datetime: datetime(), data });
  } catch (err) {
    if (err.message.includes("sudah ada"))
      return res.status(400).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const generateBulk = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;
    if (!start_date || !end_date)
      return res.status(400).json({ status: status.BAD_REQUEST, message: "start_date dan end_date wajib", datetime: datetime() });
    const results = await Model.generatePayrollBulk(start_date, end_date);
    const berhasil = results.filter((r) => r.status === "success").length;
    const dilewati = results.filter((r) => r.status === "skipped").length;
    return res.json({
      status: status.SUKSES,
      message: `Generate selesai: ${berhasil} berhasil, ${dilewati} dilewati`,
      datetime: datetime(),
      summary: { berhasil, dilewati },
      data: results,
    });
  } catch (err) {
    return res.status(500).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const approve = async (req, res) => {
  try {
    const approvedBy = req.user?.karyawan_id || req.user?.email || "SYSTEM";
    const data = await Model.approvePayroll(req.params.id, approvedBy);
    return res.json({ status: status.SUKSES, message: "Payroll berhasil diapprove", datetime: datetime(), data });
  } catch (err) {
    return res.status(400).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const markPaid = async (req, res) => {
  try {
    const paidBy = req.user?.karyawan_id || req.user?.email || "SYSTEM";
    const data = await Model.markAsPaid(req.params.id, paidBy);
    return res.json({ status: status.SUKSES, message: "Payroll ditandai sudah dibayar", datetime: datetime(), data });
  } catch (err) {
    return res.status(400).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};

export const remove = async (req, res) => {
  try {
    await Model.remove(req.params.id);
    return res.json({ status: status.SUKSES, message: "Payroll berhasil dihapus", datetime: datetime() });
  } catch (err) {
    return res.status(400).json({ status: status.GAGAL, message: err.message, datetime: datetime() });
  }
};