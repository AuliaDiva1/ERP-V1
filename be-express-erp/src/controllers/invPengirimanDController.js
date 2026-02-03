import * as InvPengirimanDModel from "../models/invPengirimanDModel.js";

/**
 * POST: Menyimpan rincian barang (Bulk Insert)
 * Menangani pengurangan stok otomatis di Model
 */
export const createDetails = async (req, res) => {
  try {
    const { items } = req.body;

    // Validasi input
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        status: "01", 
        message: "Data items harus berupa array dan tidak boleh kosong" 
      });
    }

    // Eksekusi bulk insert & potong stok di Model
    await InvPengirimanDModel.createPengirimanDetails(items);

    res.status(201).json({ 
      status: "00", 
      message: "Item pengiriman berhasil disimpan & stok terpotong otomatis" 
    });
  } catch (err) {
    // Menangkap error jika stok tidak cukup atau barang tidak ditemukan
    res.status(500).json({ 
      status: "99", 
      message: "Gagal simpan detail pengiriman", 
      error: err.message 
    });
  }
};

/**
 * GET: Ambil rincian barang berdasarkan Nomor SJ
 */
export const getDetailsByNo = async (req, res) => {
  try {
    const { no_pengiriman } = req.params;
    const data = await InvPengirimanDModel.getDetailsByNoPengiriman(no_pengiriman);
    
    res.status(200).json({ 
      status: "00", 
      message: `Berhasil mengambil detail untuk SJ: ${no_pengiriman}`,
      data 
    });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * DELETE: Hapus rincian barang per ID
 * Menangani pengembalian stok (Restock) otomatis di Model
 */
export const deleteDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Pastikan data detail ada sebelum dihapus
    const existing = await InvPengirimanDModel.getDetailById(id);
    if (!existing) {
      return res.status(404).json({ 
        status: "04", 
        message: "Data detail barang tidak ditemukan" 
      });
    }

    // Eksekusi hapus & kembalikan stok
    await InvPengirimanDModel.deleteDetail(id);

    res.status(200).json({ 
      status: "00", 
      message: "Item berhasil dihapus dan stok telah dikembalikan" 
    });
  } catch (err) {
    res.status(500).json({ 
      status: "99", 
      message: "Gagal menghapus item", 
      error: err.message 
    });
  }
};