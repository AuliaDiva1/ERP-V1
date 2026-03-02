import * as HeaderModel from "../models/invPengirimanHModel.js";
import * as DetailModel from "../models/invPengirimanDModel.js";

/**
 * [GET] Mengambil semua daftar pengiriman (Header Only)
 */
export const getAllPengiriman = async (req, res) => {
    try {
        const data = await HeaderModel.getAll();
        res.status(200).json({ status: "00", data });
    } catch (err) {
        console.error("GET_ALL_ERROR:", err.message);
        res.status(500).json({ status: "99", message: err.message });
    }
};

/**
 * [GET] Mengambil data lengkap untuk Cetak Surat Jalan
 * Menggabungkan Perusahaan + Header + Details
 */
export const getPrintData = async (req, res) => {
    try {
        const { id } = req.params; // ID_PENGIRIMAN_H
        
        // Memanggil fungsi kompilasi di model
        const result = await HeaderModel.getPrintData(id);

        res.status(200).json({ 
            status: "00", 
            data: result 
        });
    } catch (err) {
        console.error("GET_PRINT_DATA_ERROR:", err.message);
        res.status(500).json({ 
            status: "99", 
            message: "Gagal mengambil data cetak: " + err.message 
        });
    }
};

/**
 * [GET] Mengambil detail berdasarkan Nomor Pengiriman
 */
export const getDetailsByNo = async (req, res) => {
    try {
        const { no_pengiriman } = req.params;
        const decodedNo = decodeURIComponent(no_pengiriman);
        const data = await DetailModel.getDetailsByNoPengiriman(decodedNo);
        
        res.status(200).json({ 
            status: "00", 
            data: data || [] 
        });
    } catch (err) {
        console.error("GET_DETAIL_ERROR:", err.message);
        res.status(500).json({ 
            status: "99", 
            message: "Gagal mengambil detail: " + err.message 
        });
    }
};

/**
 * [POST] Simpan Full (Header + Detail + Potong Stok)
 */
export const createFullPengiriman = async (req, res) => {
    try {
        const { header, items } = req.body;

        if (!header || !items || items.length === 0) {
            return res.status(400).json({ 
                status: "01", 
                message: "Data tidak lengkap." 
            });
        }

        const result = await HeaderModel.saveFullTransaction(header, items);

        res.status(201).json({ 
            status: "00", 
            message: "Transaksi berhasil disimpan!",
            no_pengiriman: result 
        });
    } catch (err) {
        console.error("CREATE_ERROR:", err.message);
        res.status(500).json({ 
            status: "99", 
            message: err.message 
        });
    }
};

/**
 * [PUT] Update Full
 */
export const updateFullPengiriman = async (req, res) => {
    try {
        const { id } = req.params;
        const { header, items } = req.body;

        await HeaderModel.updateFullTransaction(id, header, items);

        res.status(200).json({ 
            status: "00", 
            message: "Data berhasil diperbarui." 
        });
    } catch (err) {
        console.error("UPDATE_ERROR:", err.message);
        res.status(500).json({ status: "99", message: err.message });
    }
};

/**
 * [DELETE] Hapus & Restock
 */
export const deletePengiriman = async (req, res) => {
    try {
        const { id } = req.params;
        await HeaderModel.deleteFullTransaction(id);
        res.status(200).json({ 
            status: "00", 
            message: "Data dihapus dan stok dikembalikan." 
        });
    } catch (err) {
        console.error("DELETE_ERROR:", err.message);
        res.status(500).json({ status: "99", message: err.message });
    }
};