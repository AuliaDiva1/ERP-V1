import * as Model from "../models/masterPerusahaaanModel.js";

// Ambil Semua Data
export const getAll = async (req, res) => {
  try {
    const data = await Model.getAllPerusahaan();
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    console.error("GET_ALL_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};

// Ambil Berdasarkan ID
export const getById = async (req, res) => {
  try {
    const data = await Model.getPerusahaanById(req.params.id);
    if (!data) return res.status(404).json({ status: "04", message: "Data Tidak Ditemukan" });
    return res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    return res.status(500).json({ status: "99", message: err.message });
  }
};

// Tambah Data (Create)
export const create = async (req, res) => {
  try {
    // --- VALIDASI DATA AGAR TIDAK ADA KOLOM ASING ---
    const payload = filterPerusahaanFields(req.body);

    const data = await Model.createPerusahaan(payload);
    return res.status(201).json({ status: "00", message: "Created Success", data });
  } catch (err) {
    console.error("CREATE_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};

// Update Data (Edit)
export const update = async (req, res) => {
  try {
    // --- VALIDASI DATA AGAR TIDAK ADA KOLOM ASING ---
    const payload = filterPerusahaanFields(req.body);

    const data = await Model.updatePerusahaan(req.params.id, payload);
    return res.status(200).json({ status: "00", message: "Updated Success", data });
  } catch (err) {
    console.error("UPDATE_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};

// Hapus Data
export const remove = async (req, res) => {
  try {
    const data = await Model.getPerusahaanById(req.params.id);
    if (!data) return res.status(404).json({ status: "04", message: "Data tidak ada" });

    await Model.deletePerusahaan(req.params.id);
    return res.status(200).json({ status: "00", message: "Deleted Success" });
  } catch (err) {
    console.error("DELETE_ERROR:", err.message);
    return res.status(500).json({ status: "99", message: err.message });
  }
};

/**
 * HELPER: Menyaring field agar hanya kolom master_perusahaan yang masuk ke database
 * Ini mencegah error "Unknown Column" jika user mengirim data sembarangan (seperti invoice)
 */
const filterPerusahaanFields = (body) => {
  const allowed = [
    "NAMA_PERUSAHAAN", "ALAMAT_KANTOR", "LAT_KANTOR", "LON_KANTOR", 
    "RADIUS_METER", "JAM_MASUK_NORMAL", "JAM_PULANG_NORMAL", 
    "ALAMAT_GUDANG", "TELEPON", "WA_HOTLINE", "EMAIL", "WEBSITE", 
    "NPWP", "KOTA_TERBIT", "NAMA_BANK", "NOMOR_REKENING", 
    "ATAS_NAMA_BANK", "NAMA_PIMPINAN", "JABATAN_PIMPINAN", "LOGO_PATH"
  ];

  const filtered = {};
  allowed.forEach((key) => {
    if (body[key] !== undefined) filtered[key] = body[key];
  });
  return filtered;
};