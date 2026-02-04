import * as MasterRakModel from "../models/masterRakModel.js";
import * as MasterGudangModel from "../models/masterGudangModel.js";

// 1. GET ALL RAK (Biasanya dengan Join ke Gudang)
export const getAllRak = async (req, res) => {
  try {
    const data = await MasterRakModel.getAllRak();
    return res.status(200).json({ 
      status: "00", 
      message: data.length > 0 ? "Data rak berhasil diambil" : "Belum ada data rak",
      data 
    });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal mengambil data rak", error: err.message });
  }
};

// 2. GET RAK BERDASARKAN KODE GUDANG
export const getRakByGudang = async (req, res) => {
  try {
    const { kode_gudang } = req.params;
    if (!kode_gudang || kode_gudang === "undefined") {
        return res.status(400).json({ status: "01", message: "Kode gudang tidak valid" });
    }
    const data = await MasterRakModel.getRakByGudang(kode_gudang);
    return res.status(200).json({ status: "00", data });
  } catch (err) {
    return res.status(500).json({ status: "99", error: err.message });
  }
};

// 3. CREATE RAK BARU
export const createRak = async (req, res) => {
  try {
    const { KODE_GUDANG, KODE_RAK, NAMA_RAK } = req.body;

    // Validasi input wajib
    if (!KODE_GUDANG || !KODE_RAK) {
      return res.status(400).json({ status: "01", message: "KODE_GUDANG dan KODE_RAK wajib diisi" });
    }

    // Cek apakah kode rak sudah ada (Unique constraint)
    const existing = await MasterRakModel.getRakByKode(KODE_RAK);
    if (existing) {
      return res.status(409).json({ status: "02", message: `Kode Rak ${KODE_RAK} sudah terdaftar` });
    }

    const result = await MasterRakModel.createRak({ KODE_GUDANG, KODE_RAK, NAMA_RAK });
    return res.status(201).json({ 
      status: "00", 
      message: "Data rak berhasil ditambahkan", 
      data: result 
    });
  } catch (err) {
    return res.status(500).json({ status: "99", message: "Gagal menambah rak", error: err.message });
  }
};

// 4. UPDATE RAK (Perbaikan Log - - ms)
export const updateRak = async (req, res) => {
  try {
    const { id } = req.params; // ID_RAK dari URL

    // 1. Validasi ID
    if (!id || id === "undefined") {
      return res.status(400).json({ status: "01", message: "ID Rak tidak ditemukan atau tidak valid" });
    }

    // 2. Cek apakah data ada
    const existing = await MasterRakModel.getRakById(id);
    if (!existing) {
      return res.status(404).json({ status: "04", message: "Data rak tidak ditemukan di database" });
    }

    // 3. Pisahkan ID_RAK agar tidak ikut ter-update (menghindari error primary key)
    const { ID_RAK, ...updateData } = req.body;

    const result = await MasterRakModel.updateRak(id, updateData);
    
    // 4. Kirim respons balik (PENTING: Agar log tidak - - ms)
    return res.status(200).json({ 
      status: "00", 
      message: "Data rak berhasil diperbarui",
      data: result 
    });

  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ status: "99", message: "Gagal memperbarui rak", error: err.message });
  }
};

// 5. DELETE RAK (Perbaikan Error 500)
export const deleteRak = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ status: "01", message: "ID Rak tidak valid untuk dihapus" });
    }

    const existing = await MasterRakModel.getRakById(id);
    if (!existing) {
      return res.status(404).json({ status: "04", message: "Data rak tidak ditemukan" });
    }

    await MasterRakModel.deleteRak(id);
    
    return res.status(200).json({ 
      status: "00", 
      message: "Data rak berhasil dihapus" 
    });
  } catch (err) {
    console.error("Delete Error:", err);
    // Jika error 500, biasanya karena ID_RAK ini sedang dipakai di tabel transaksi/barang
    return res.status(500).json({ 
      status: "99", 
      message: "Gagal menghapus data. Pastikan rak tidak sedang digunakan di data lain.", 
      error: err.message 
    });
  }
};