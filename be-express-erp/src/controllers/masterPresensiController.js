import * as PresensiModel from "../models/masterPresensiModel.js";
import fs from "fs";
import path from "path";

/* ===========================================================
 * 0. LIST KARYAWAN
 * =========================================================== */
export const getListKaryawan = async (req, res) => {
  try {
    const rows = await PresensiModel.getListKaryawan();
    return res.json({ status: "success", data: rows });
  } catch (error) {
    console.error("getListKaryawan error:", error);
    return res.status(500).json({ status: "error", message: "Gagal memuat data karyawan" });
  }
};

/* ===========================================================
 * 1. CEK STATUS PRESENSI HARI INI
 * =========================================================== */
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

/* ===========================================================
 * 2. PRESENSI MASUK
 * =========================================================== */
export const presensiMasuk = async (req, res) => {
  const { KARYAWAN_ID, STATUS, KETERANGAN, LATITUDE, LONGITUDE, TANGGAL, JAM_MASUK } = req.body;

  if (!KARYAWAN_ID) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ status: "error", message: "ID Karyawan wajib diisi!" });
  }

  const fotoPath = req.file ? `/uploads/presensi/${req.file.filename}` : null;

  try {
    const today = TANGGAL || new Date().toISOString().split("T")[0];
    const jamInput = JAM_MASUK || new Date().toLocaleTimeString("it-IT");

    // Cek duplikat presensi
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
      TANGGAL: today,
      JAM_MASUK: jamInput,
      LOKASI_MASUK:
        LATITUDE && LONGITUDE ? `${LATITUDE}, ${LONGITUDE}` : "Input Admin",
      FOTO_MASUK: fotoPath,
      STATUS: STATUS || "Hadir",
      KETERANGAN: KETERANGAN || "Input oleh Admin",
    };

    const result = await PresensiModel.checkIn(payload);
    return res.json({ status: "success", message: "Presensi masuk berhasil", data: result });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("presensiMasuk error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/* ===========================================================
 * 3. PRESENSI PULANG
 * =========================================================== */
export const presensiPulang = async (req, res) => {
  const { KARYAWAN_ID, LATITUDE, LONGITUDE, JAM_KELUAR, TANGGAL } = req.body;

  if (!KARYAWAN_ID) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ status: "error", message: "ID Karyawan wajib diisi!" });
  }

  try {
    const tglPresensi = TANGGAL || new Date().toISOString().split("T")[0];
    const jamInput = JAM_KELUAR || new Date().toLocaleTimeString("it-IT");
    const fotoPath = req.file ? `/uploads/presensi/${req.file.filename}` : null;

    // Pastikan data absen masuk ada
    const existing = await PresensiModel.getTodayPresensi(KARYAWAN_ID, tglPresensi);
    if (!existing) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: "error", message: "Data absen masuk tidak ditemukan!" });
    }

    // Cegah double absen pulang
    if (existing.JAM_KELUAR) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ status: "error", message: "Sudah melakukan absen pulang!" });
    }

    const dataUpdate = {
      JAM_KELUAR: jamInput,
      LOKASI_KELUAR:
        LATITUDE && LONGITUDE ? `${LATITUDE}, ${LONGITUDE}` : "Input Admin",
      FOTO_KELUAR: fotoPath,
    };

    const result = await PresensiModel.checkOut(KARYAWAN_ID, tglPresensi, dataUpdate);
    return res.json({ status: "success", message: "Presensi pulang berhasil", data: result });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    console.error("presensiPulang error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/* ===========================================================
 * 4. GET REKAP (Admin View)
 * =========================================================== */
export const getRekap = async (req, res) => {
  try {
    const data = await PresensiModel.getAllPresensi(req.query);
    return res.json({ status: "success", data });
  } catch (error) {
    console.error("getRekap error:", error);
    return res.status(500).json({ status: "error", message: "Gagal mengambil data rekap." });
  }
};

/* ===========================================================
 * 5. HAPUS DATA
 * =========================================================== */
export const remove = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await PresensiModel.getPresensiById(id);
    if (!data)
      return res.status(404).json({ status: "error", message: "Data tidak ditemukan" });

    await PresensiModel.deletePresensi(id);

    // Hapus file foto jika ada
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