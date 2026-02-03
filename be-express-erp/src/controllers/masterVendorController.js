import * as MasterVendorModel from "../models/masterVendorModel.js";

/**
 * GET semua vendor
 */
export const getAllVendor = async (req, res) => {
  try {
    const vendor = await MasterVendorModel.getAllVendor();

    return res.status(200).json({
      status: "00",
      message:
        vendor.length > 0
          ? "Data vendor berhasil diambil"
          : "Belum ada data vendor",
      data: vendor,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data vendor",
      error: err.message,
    });
  }
};

/**
 * GET vendor by ID
 */
export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await MasterVendorModel.getVendorById(id);

    if (!vendor) {
      return res.status(404).json({
        status: "04",
        message: "Vendor tidak ditemukan",
      });
    }

    return res.status(200).json({
      status: "00",
      message: "Data vendor berhasil diambil",
      data: vendor,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat mengambil data vendor",
      error: err.message,
    });
  }
};

/**
 * CREATE vendor baru
 */
export const createVendor = async (req, res) => {
  try {
    let { 
      VENDOR_ID, 
      NAMA_VENDOR, 
      ALAMAT_VENDOR, 
      PIC,
      NO_TELP_PIC,
      EMAIL_PIC,
      KETERSEDIAAN_BARANG 
    } = req.body;

    // Validasi field wajib
    if (!NAMA_VENDOR || !ALAMAT_VENDOR || !PIC) {
      return res.status(400).json({
        status: "01",
        message: "NAMA_VENDOR, ALAMAT_VENDOR, dan PIC wajib diisi",
      });
    }

    // Validasi email jika diisi
    if (EMAIL_PIC) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(EMAIL_PIC)) {
        return res.status(400).json({
          status: "01",
          message: "Format EMAIL_PIC tidak valid",
        });
      }
    }

    // Validasi KETERSEDIAAN_BARANG
    if (
      KETERSEDIAAN_BARANG &&
      !["Tersedia", "Tidak Tersedia"].includes(KETERSEDIAAN_BARANG)
    ) {
      return res.status(400).json({
        status: "01",
        message: "KETERSEDIAAN_BARANG harus berisi 'Tersedia' atau 'Tidak Tersedia'",
      });
    }

    // Auto-generate VENDOR_ID jika tidak dikirim
    if (!VENDOR_ID) {
      const lastVendor = await MasterVendorModel.getLastVendor();
      const nextNumber = lastVendor
        ? parseInt(lastVendor.VENDOR_ID.replace("V", "")) + 1
        : 1;
      VENDOR_ID = "V" + nextNumber.toString().padStart(4, "0");
    }

    // Cek duplikat VENDOR_ID
    const existing = await MasterVendorModel.getVendorByKode(VENDOR_ID);
    if (existing) {
      return res.status(409).json({
        status: "02",
        message: `VENDOR_ID ${VENDOR_ID} sudah terdaftar`,
      });
    }

    const newVendor = await MasterVendorModel.createVendor({
      VENDOR_ID,
      NAMA_VENDOR,
      ALAMAT_VENDOR,
      PIC,
      NO_TELP_PIC,
      EMAIL_PIC,
      KETERSEDIAAN_BARANG,
    });

    return res.status(201).json({
      status: "00",
      message: "Vendor berhasil ditambahkan",
      data: newVendor,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menambahkan vendor",
      error: err.message,
    });
  }
};

/**
 * UPDATE vendor
 */
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      VENDOR_ID, 
      NAMA_VENDOR, 
      ALAMAT_VENDOR, 
      PIC,
      NO_TELP_PIC,
      EMAIL_PIC,
      KETERSEDIAAN_BARANG 
    } = req.body;

    // Validasi field wajib
    if (!NAMA_VENDOR || !ALAMAT_VENDOR || !PIC) {
      return res.status(400).json({
        status: "01",
        message: "NAMA_VENDOR, ALAMAT_VENDOR, dan PIC wajib diisi",
      });
    }

    // Validasi email jika diisi
    if (EMAIL_PIC) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(EMAIL_PIC)) {
        return res.status(400).json({
          status: "01",
          message: "Format EMAIL_PIC tidak valid",
        });
      }
    }

    // Validasi KETERSEDIAAN_BARANG
    if (
      KETERSEDIAAN_BARANG &&
      !["Tersedia", "Tidak Tersedia"].includes(KETERSEDIAAN_BARANG)
    ) {
      return res.status(400).json({
        status: "01",
        message: "KETERSEDIAAN_BARANG harus berisi 'Tersedia' atau 'Tidak Tersedia'",
      });
    }

    const existing = await MasterVendorModel.getVendorById(id);
    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Vendor tidak ditemukan untuk diperbarui",
      });
    }

    const updatedVendor = await MasterVendorModel.updateVendor(id, {
      VENDOR_ID,
      NAMA_VENDOR,
      ALAMAT_VENDOR,
      PIC,
      NO_TELP_PIC,
      EMAIL_PIC,
      KETERSEDIAAN_BARANG,
    });

    return res.status(200).json({
      status: "00",
      message: "Vendor berhasil diperbarui",
      data: updatedVendor,
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat memperbarui vendor",
      error: err.message,
    });
  }
};

/**
 * DELETE vendor
 */
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await MasterVendorModel.getVendorById(id);

    if (!existing) {
      return res.status(404).json({
        status: "04",
        message: "Vendor tidak ditemukan untuk dihapus",
      });
    }

    await MasterVendorModel.deleteVendor(id);

    return res.status(200).json({
      status: "00",
      message: "Vendor berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({
      status: "99",
      message: "Terjadi kesalahan saat menghapus vendor",
      error: err.message,
    });
  }
};