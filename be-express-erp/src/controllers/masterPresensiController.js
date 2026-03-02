import * as PresensiModel from "../models/masterPresensiModel.js";
import fs from "fs";

export const cekStatusHarian = async (req, res) => {
    const { karyawan_id } = req.query;
    const today = new Date().toISOString().split('T')[0];
    if (!karyawan_id) return res.status(400).json({ status: "error", message: "ID diperlukan" });

    try {
        const data = await PresensiModel.getTodayPresensi(karyawan_id, today);
        if (!data) return res.json({ status: "success", step: "BELUM_PRESENSI", data: null });
        if (data.STATUS === 'Hadir' && !data.JAM_KELUAR) return res.json({ status: "success", step: "SUDAH_MASUK", data: data });
        return res.json({ status: "success", step: "SELESAI", data: data });
    } catch (error) {
        return res.status(500).json({ status: "error", message: error.message });
    }
};

export const presensiMasuk = async (req, res) => {
    const { KARYAWAN_ID, STATUS, KETERANGAN, LATITUDE, LONGITUDE } = req.body;
    if (!KARYAWAN_ID || !STATUS || !req.file) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ status: "error", message: "Data atau Foto tidak lengkap" });
    }

    try {
        const result = await PresensiModel.checkIn({
            KARYAWAN_ID,
            TANGGAL: new Date().toISOString().split('T')[0],
            STATUS,
            JAM_MASUK: new Date().toTimeString().split(' ')[0],
            LOKASI_MASUK: `${LATITUDE}, ${LONGITUDE}`,
            FOTO_MASUK: `/uploads/presensi/${req.file.filename}`,
            KETERANGAN: KETERANGAN || "-",
            LAT_USER: parseFloat(LATITUDE),
            LON_USER: parseFloat(LONGITUDE)
        });
        return res.json({ status: "success", data: result });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ status: "error", message: error.message });
    }
};

export const presensiPulang = async (req, res) => {
    const { KARYAWAN_ID, LATITUDE, LONGITUDE } = req.body;
    if (!req.file) return res.status(400).json({ status: "error", message: "Foto pulang wajib" });

    try {
        const result = await PresensiModel.checkOut(KARYAWAN_ID, new Date().toISOString().split('T')[0], {
            JAM_KELUAR: new Date().toTimeString().split(' ')[0],
            LOKASI_KELUAR: `${LATITUDE}, ${LONGITUDE}`,
            FOTO_KELUAR: `/uploads/presensi/${req.file.filename}`,
            LAT_USER: parseFloat(LATITUDE),
            LON_USER: parseFloat(LONGITUDE)
        });
        return res.json({ status: "success", data: result });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ status: "error", message: error.message });
    }
};

export const getRekap = async (req, res) => {
    try {
        const data = await PresensiModel.getAllPresensi(req.query);
        res.json({ status: "success", data });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        await PresensiModel.deletePresensi(req.params.id);
        res.json({ status: "success" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};