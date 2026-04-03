import * as InvPengirimanHModel from "../models/invPengirimanHModel.js";
import * as InvPengirimanDModel from "../models/invPengirimanDModel.js";

/**
 * GET ALL: Ambil semua data pengiriman (dipanggil dari invPengirimanRoutes GET /)
 */
export const getAllPengiriman = async (req, res) => {
  try {
    const data = await InvPengirimanHModel.getAll();
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * GET DETAIL BY NO: Ambil detail barang berdasarkan NO_PENGIRIMAN
 * (dipanggil dari invPengirimanRoutes GET /detail/:no_pengiriman)
 */
export const getDetailsByNo = async (req, res) => {
  try {
    const { no_pengiriman } = req.params;
    const data = await InvPengirimanDModel.getDetailsByNoPengiriman(no_pengiriman);
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * POST FULL: Simpan Header + Detail sekaligus + potong stok
 * (dipanggil dari invPengirimanRoutes POST /full)
 */
export const createFullPengiriman = async (req, res) => {
  try {
    const { header, items } = req.body;

    if (!header || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "01",
        message: "Data header dan minimal 1 item wajib dikirim",
      });
    }

    if (!header.NO_PENGIRIMAN || !header.KODE_PELANGGAN || !header.TGL_KIRIM) {
      return res.status(400).json({
        status: "01",
        message: "NO_PENGIRIMAN, KODE_PELANGGAN, dan TGL_KIRIM wajib diisi",
      });
    }

    const noPengiriman = await InvPengirimanHModel.saveFullTransaction(header, items);

    res.status(201).json({
      status: "00",
      message: "Pengiriman berhasil dibuat dan stok terpotong",
      data: { NO_PENGIRIMAN: noPengiriman },
    });
  } catch (err) {
    // Tangkap error stok tidak cukup dari model
    const isStokError = err.message?.toLowerCase().includes("stok");
    res.status(isStokError ? 422 : 500).json({
      status: "99",
      message: err.message || "Gagal membuat pengiriman",
      error: err.message,
    });
  }
};

/**
 * PUT FULL: Update Header + Detail (restore stok lama → potong stok baru)
 * (dipanggil dari invPengirimanRoutes PUT /:id)
 */
export const updateFullPengiriman = async (req, res) => {
  try {
    const { id } = req.params;
    const { header, items } = req.body;

    if (!header || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: "01",
        message: "Data header dan minimal 1 item wajib dikirim",
      });
    }

    await InvPengirimanHModel.updateFullTransaction(id, header, items);

    res.status(200).json({
      status: "00",
      message: "Pengiriman berhasil diperbarui",
    });
  } catch (err) {
    const isStokError = err.message?.toLowerCase().includes("stok");
    res.status(isStokError ? 422 : 500).json({
      status: "99",
      message: err.message || "Gagal memperbarui pengiriman",
      error: err.message,
    });
  }
};

/**
 * DELETE: Hapus pengiriman berdasarkan ID header + kembalikan stok
 * (dipanggil dari invPengirimanRoutes DELETE /:id)
 */
export const deletePengiriman = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await InvPengirimanHModel.getById(id);
    if (!existing) {
      return res.status(404).json({ status: "04", message: "Data tidak ditemukan" });
    }

    await InvPengirimanHModel.deleteFullTransaction(id);

    res.status(200).json({
      status: "00",
      message: "Pengiriman berhasil dihapus dan stok dikembalikan",
    });
  } catch (err) {
    res.status(500).json({
      status: "99",
      message: "Gagal menghapus pengiriman",
      error: err.message,
    });
  }
};

// ── Legacy controllers (dipakai oleh invPengirimanDRoutes jika diperlukan) ──

export const createPengirimanH = async (req, res) => {
  try {
    const { NO_PENGIRIMAN, TGL_KIRIM, KODE_PELANGGAN } = req.body;
    if (!NO_PENGIRIMAN || !TGL_KIRIM || !KODE_PELANGGAN) {
      return res.status(400).json({
        status: "01",
        message: "Data wajib diisi: NO_PENGIRIMAN, TGL_KIRIM, KODE_PELANGGAN",
      });
    }
    const result = await InvPengirimanHModel.saveFullTransaction(req.body, []);
    res.status(201).json({ status: "00", message: "Header berhasil dibuat", data: result });
  } catch (err) {
    res.status(500).json({ status: "99", message: "Gagal membuat header", error: err.message });
  }
};

export const getPengirimanHById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await InvPengirimanHModel.getById(id);
    if (!data) return res.status(404).json({ status: "04", message: "Data tidak ditemukan" });
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const getAllPengirimanH = async (req, res) => {
  try {
    const data = await InvPengirimanHModel.getAll();
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};
