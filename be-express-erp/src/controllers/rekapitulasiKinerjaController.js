import * as RekapModel from "../models/rekapitulasiKinerjaModel.js";
import { datetime, status } from "../utils/general.js";

/**
 * 🔹 Get Rekapitulasi Kinerja (Karyawan melihat miliknya sendiri)
 */
export const getMyRekapitulasi = async (req, res) => {
  try {
    const karyawanId = req.user?.karyawan_id;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "start_date dan end_date wajib diisi (format: YYYY-MM-DD)",
        datetime: datetime(),
      });
    }

    const rekap = await RekapModel.getRekapitulasiKinerja(
      karyawanId,
      start_date,
      end_date
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "Rekapitulasi kinerja berhasil diambil",
      datetime: datetime(),
      data: rekap,
    });
  } catch (err) {
    console.error("Error getMyRekapitulasi:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get Rekapitulasi Semua Karyawan (HR only)
 */
export const getAllRekapitulasi = async (req, res) => {
  try {
    const { start_date, end_date, departemen } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "start_date dan end_date wajib diisi (format: YYYY-MM-DD)",
        datetime: datetime(),
      });
    }

    const rekap = await RekapModel.getRekapitulasiAll(
      start_date,
      end_date,
      departemen || null
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "Rekapitulasi semua karyawan berhasil diambil",
      datetime: datetime(),
      total: rekap.length,
      data: rekap,
    });
  } catch (err) {
    console.error("Error getAllRekapitulasi:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get Rekapitulasi by Karyawan ID (HR only)
 */
export const getRekapitulasiByKaryawan = async (req, res) => {
  try {
    const { karyawan_id } = req.params;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "start_date dan end_date wajib diisi (format: YYYY-MM-DD)",
        datetime: datetime(),
      });
    }

    const rekap = await RekapModel.getRekapitulasiKinerja(
      karyawan_id,
      start_date,
      end_date
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "Rekapitulasi kinerja karyawan berhasil diambil",
      datetime: datetime(),
      data: rekap,
    });
  } catch (err) {
    console.error("Error getRekapitulasiByKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Get Performance Ranking
 */
export const getPerformanceRanking = async (req, res) => {
  try {
    const { start_date, end_date, departemen } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "start_date dan end_date wajib diisi (format: YYYY-MM-DD)",
        datetime: datetime(),
      });
    }

    const ranking = await RekapModel.getPerformanceRanking(
      start_date,
      end_date,
      departemen || null
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "Performance ranking berhasil diambil",
      datetime: datetime(),
      total: ranking.length,
      data: ranking,
    });
  } catch (err) {
    console.error("Error getPerformanceRanking:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Export Rekapitulasi to Excel
 */
export const exportRekapitulasi = async (req, res) => {
  try {
    const karyawanId = req.user?.karyawan_id;
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "start_date dan end_date wajib diisi (format: YYYY-MM-DD)",
        datetime: datetime(),
      });
    }

    const excelData = await RekapModel.exportRekapitulasiToExcel(
      karyawanId,
      start_date,
      end_date
    );

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data export berhasil digenerate",
      datetime: datetime(),
      data: excelData,
    });
  } catch (err) {
    console.error("Error exportRekapitulasi:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};