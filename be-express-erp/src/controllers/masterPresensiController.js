import * as PresensiModel from "../models/masterPresensiModel.js";
import { db } from "../core/config/knex.js";
import fs from "fs";
import path from "path";

/* ============================================================
 * HELPER — default bulan berjalan
 * ============================================================ */
const getDefaultDateRange = () => {
  const today   = new Date();
  const year    = today.getFullYear();
  const month   = String(today.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
  return {
    start: `${year}-${month}-01`,
    end:   `${year}-${month}-${lastDay}`,
  };
};

/* ============================================================
 * 0. LIST KARYAWAN
 * ============================================================ */
export const getListKaryawan = async (req, res) => {
  try {
    const rows = await PresensiModel.getListKaryawan();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.error("getListKaryawan error:", error);
    return res.status(500).json({ status: "error", message: "Gagal memuat data karyawan" });
  }
};

/* ============================================================
 * 0b. GET SETTING PERUSAHAAN (untuk frontend geofencing)
 *     Mengembalikan: LAT_KANTOR, LON_KANTOR, RADIUS_METER
 *     Route ini PUBLIC agar kios absen mandiri bisa akses
 * ============================================================ */
export const getSettingPresensi = async (req, res) => {
  try {
    const setting = await PresensiModel.getSettingPerusahaan();
    if (!setting) {
      return res.json({
        status: "success",
        data: { LAT_KANTOR: null, LON_KANTOR: null, RADIUS_METER: 500 },
      });
    }
    return res.json({ status: "success", data: setting });
  } catch (error) {
    console.error("getSettingPresensi error:", error);
    return res.status(500).json({ status: "error", message: "Gagal memuat setting presensi" });
  }
};

/* ============================================================
 * 0c. GET INFO KARYAWAN BY ID
 * ============================================================ */
export const getKaryawanInfo = async (req, res) => {
  const { id } = req.query;
  if (!id)
    return res.status(400).json({ status: "error", message: "ID Karyawan diperlukan" });
  try {
    const row = await db("master_karyawan")
      .select("KARYAWAN_ID", "NAMA", "JABATAN", "DEPARTEMEN", "FOTO", "SHIFT")
      .where("KARYAWAN_ID", id)
      .first();
    return res.json({ status: "success", data: row || null });
  } catch (error) {
    console.error("getKaryawanInfo error:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil data karyawan" });
  }
};

/* ============================================================
 * 1. CEK STATUS PRESENSI HARI INI
 * ============================================================ */
export const cekStatusHarian = async (req, res) => {
  const { karyawan_id } = req.query;
  const today = new Date().toISOString().split("T")[0];

  if (!karyawan_id)
    return res.status(400).json({ status: "error", message: "ID Karyawan diperlukan" });

  try {
    const data = await PresensiModel.getTodayPresensi(karyawan_id, today);
    if (!data)
      return res.json({ status: "success", step: "BELUM_PRESENSI", data: null });
    if (data.JAM_MASUK && !data.JAM_KELUAR)
      return res.json({ status: "success", step: "SUDAH_MASUK", data });
    return res.json({ status: "success", step: "SELESAI", data });
  } catch (error) {
    console.error("cekStatusHarian error:", error);
    return res.status(500).json({ status: "error", message: "Database Error" });
  }
};

/* ============================================================
 * 2. PRESENSI MASUK
 * ============================================================ */
export const presensiMasuk = async (req, res) => {
  const { KARYAWAN_ID, STATUS, KETERANGAN, LATITUDE, LONGITUDE, TANGGAL, JAM_MASUK } = req.body;

  if (!KARYAWAN_ID) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ status: "error", message: "ID Karyawan wajib diisi!" });
  }

  const fotoPath = req.file ? `/uploads/presensi/${req.file.filename}` : null;

  try {
    const today    = TANGGAL   || new Date().toISOString().split("T")[0];
    const jamInput = JAM_MASUK || new Date().toLocaleTimeString("it-IT");

    const existing = await PresensiModel.getTodayPresensi(KARYAWAN_ID, today);
    if (existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        status: "error",
        message: "Karyawan sudah ada data presensi hari ini!",
      });
    }

    const idSuffix = KARYAWAN_ID.split("-")[1] || Math.floor(Math.random() * 1000);

    const payload = {
      KODE_PRESENSI: `PRS-${today.replace(/-/g, "")}-${idSuffix}`,
      KARYAWAN_ID,
      TANGGAL:      today,
      JAM_MASUK:    jamInput,
      LAT_INPUT:    LATITUDE  || null,
      LON_INPUT:    LONGITUDE || null,
      LOKASI_MASUK: LATITUDE && LONGITUDE ? `${LATITUDE}, ${LONGITUDE}` : "Input Admin",
      FOTO_MASUK:   fotoPath,
      STATUS:       STATUS    || "Hadir",
      KETERANGAN:   KETERANGAN || "Input oleh Admin",
    };

    const result = await PresensiModel.checkIn(payload);
    return res.json({ status: "success", message: "Presensi masuk berhasil", data: result });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("presensiMasuk error:", error);
    if (error.message?.startsWith("GEOFENCE_ERROR:")) {
      return res.status(403).json({
        status:  "error",
        code:    "GEOFENCE_ERROR",
        message: error.message.replace("GEOFENCE_ERROR: ", ""),
      });
    }
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/* ============================================================
 * 3. PRESENSI PULANG
 * ============================================================ */
export const presensiPulang = async (req, res) => {
  const { KARYAWAN_ID, LATITUDE, LONGITUDE, JAM_KELUAR, TANGGAL } = req.body;

  if (!KARYAWAN_ID) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ status: "error", message: "ID Karyawan wajib diisi!" });
  }

  try {
    const tglPresensi = TANGGAL    || new Date().toISOString().split("T")[0];
    const jamInput    = JAM_KELUAR || new Date().toLocaleTimeString("it-IT");
    const fotoPath    = req.file   ? `/uploads/presensi/${req.file.filename}` : null;

    const existing = await PresensiModel.getTodayPresensi(KARYAWAN_ID, tglPresensi);
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: "error", message: "Data absen masuk tidak ditemukan!" });
    }
    if (existing.JAM_KELUAR) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: "error", message: "Sudah melakukan absen pulang!" });
    }

    const dataUpdate = {
      JAM_KELUAR:    jamInput,
      LAT_INPUT:     LATITUDE  || null,
      LON_INPUT:     LONGITUDE || null,
      LOKASI_KELUAR: LATITUDE && LONGITUDE ? `${LATITUDE}, ${LONGITUDE}` : "Input Admin",
      FOTO_KELUAR:   fotoPath,
    };

    const result = await PresensiModel.checkOut(KARYAWAN_ID, tglPresensi, dataUpdate);
    return res.json({ status: "success", message: "Presensi pulang berhasil", data: result });

  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("presensiPulang error:", error);
    if (error.message?.startsWith("GEOFENCE_ERROR:")) {
      return res.status(403).json({
        status:  "error",
        code:    "GEOFENCE_ERROR",
        message: error.message.replace("GEOFENCE_ERROR: ", ""),
      });
    }
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/* ============================================================
 * 4. GET REKAP (Admin)
 * ============================================================ */
export const getRekap = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const { start: defaultStart, end: defaultEnd } = getDefaultDateRange();
    const sd = start_date || defaultStart;
    const ed = end_date   || defaultEnd;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(sd) || !dateRegex.test(ed)) {
      return res.status(400).json({ status: "error", message: "Format tanggal tidak valid. Gunakan YYYY-MM-DD" });
    }
    if (new Date(sd) > new Date(ed)) {
      return res.status(400).json({ status: "error", message: "start_date tidak boleh lebih besar dari end_date" });
    }

    const data = await PresensiModel.getAllPresensi({ ...req.query, start_date: sd, end_date: ed });
    return res.json({ status: "success", data });
  } catch (error) {
    console.error("getRekap error:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil data rekap." });
  }
};

/* ============================================================
 * 5. HAPUS DATA
 * ============================================================ */
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await PresensiModel.getPresensiById(id);
    if (!data)
      return res.status(404).json({ status: "error", message: "Data tidak ditemukan" });

    await PresensiModel.deletePresensi(id);

    [data.FOTO_MASUK, data.FOTO_KELUAR].forEach((foto) => {
      if (foto) {
        const filePath = path.join(process.cwd(), "public", foto);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    return res.json({ status: "success", message: "Data presensi berhasil dihapus" });
  } catch (error) {
    console.error("remove error:", error);
    return res.status(500).json({ status: "error", message: "Gagal menghapus data" });
  }
};
