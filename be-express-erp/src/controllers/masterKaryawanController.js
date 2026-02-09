// controllers/masterKaryawanController.js
import * as KaryawanModel from "../models/masterKaryawanModel.js";
import { db } from "../core/config/knex.js";
import { datetime, status } from "../utils/general.js";
import { 
  createKaryawan as createKaryawanFromAuth, // ✅ Rename untuk clarity
  checkEmailExists, 
  checkNikExists 
} from "../models/authModel.js";

/**
 * 🔹 Tambah karyawan baru (Khusus SUPERADMIN/HR)
 */
export const createKaryawan = async (req, res) => {
  try {
    const {
      nik, nama, gender, tempat_lahir, tgl_lahir, alamat, no_telp,
      email, password, departemen, jabatan, tanggal_masuk, 
      status_karyawan, shift, pendidikan_terakhir,
    } = req.body;

    // ✅ Validasi field wajib
    if (!nik || !nama || !gender || !email || !password || !departemen || !jabatan) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NIK, Nama, Gender, Email, Password, Departemen, dan Jabatan wajib diisi",
        datetime: datetime(),
      });
    }

    // ✅ Cek duplikasi email
    const existingEmail = await checkEmailExists(email);
    if (existingEmail) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    // ✅ Cek duplikasi NIK
    const existingNik = await checkNikExists(nik);
    if (existingNik) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "NIK sudah terdaftar",
        datetime: datetime(),
      });
    }

    // ✅ Handle foto upload
    const fotoFile = req.file ? `/uploads/foto_karyawan/${req.file.filename}` : null;

    // ✅ Gunakan fungsi dari authModel (sudah auto hash password + generate KARYAWAN_ID)
    const { userId, karyawanId, id } = await createKaryawanFromAuth(
      {
        EMAIL: email,
        NIK: nik,
        NAMA: nama,
        GENDER: gender,
        TEMPAT_LAHIR: tempat_lahir || null,
        TGL_LAHIR: tgl_lahir || null,
        ALAMAT: alamat || null,
        NO_TELP: no_telp || null,
        DEPARTEMEN: departemen,
        JABATAN: jabatan,
        TANGGAL_MASUK: tanggal_masuk || new Date(),
        STATUS_KARYAWAN: status_karyawan || 'Kontrak',
        STATUS_AKTIF: 'Aktif',
        SHIFT: shift || null,
        PENDIDIKAN_TERAKHIR: pendidikan_terakhir || null,
        FOTO: fotoFile,
      },
      {
        name: nama,
        email: email,
        password: password, // ✅ Akan di-hash otomatis di authModel
        role: departemen, // ✅ Role = departemen (HR, PRODUKSI, GUDANG, KEUANGAN)
      }
    );

    return res.status(201).json({
      status: status.SUKSES,
      message: "Karyawan berhasil ditambahkan",
      datetime: datetime(),
      karyawan_id: karyawanId, // ✅ Return KARYAWAN_ID (KRY-0001)
      user: {
        id: userId,
        name: nama,
        email: email,
        role: departemen,
      },
    });
  } catch (err) {
    console.error("Error createKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Ambil semua karyawan
 */
export const getAllKaryawan = async (req, res) => {
  try {
    const data = await KaryawanModel.getAllKaryawanWithUser();
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data karyawan berhasil diambil",
      datetime: datetime(),
      total: data.length,
      data,
    });
  } catch (err) {
    console.error("Error getAllKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Ambil karyawan by ID
 */
export const getKaryawanById = async (req, res) => {
  try {
    const data = await KaryawanModel.getKaryawanByIdWithUser(req.params.id);
    
    if (!data) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Karyawan tidak ditemukan",
        datetime: datetime(),
      });
    }
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Data karyawan ditemukan",
      datetime: datetime(),
      data,
    });
  } catch (err) {
    console.error("Error getKaryawanById:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Ambil karyawan berdasarkan DEPARTEMEN
 */
export const getKaryawanByDepartemenController = async (req, res) => {
  try {
    const { departemen } = req.params;
    const karyawanList = await KaryawanModel.getKaryawanByDepartemen(departemen);

    if (!karyawanList || karyawanList.length === 0) {
      return res.status(404).json({
        status: status.GAGAL,
        message: `Tidak ditemukan karyawan di departemen ${departemen}`,
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data karyawan ditemukan",
      datetime: datetime(),
      total: karyawanList.length,
      data: karyawanList,
    });
  } catch (err) {
    console.error("Error getKaryawanByDepartemen:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Ambil karyawan berdasarkan JABATAN
 */
export const getKaryawanByJabatanController = async (req, res) => {
  try {
    const { jabatan } = req.params;
    const karyawanList = await KaryawanModel.getKaryawanByJabatan(jabatan);

    if (!karyawanList || karyawanList.length === 0) {
      return res.status(404).json({
        status: status.GAGAL,
        message: `Tidak ditemukan karyawan dengan jabatan ${jabatan}`,
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data karyawan ditemukan berdasarkan jabatan",
      datetime: datetime(),
      total: karyawanList.length,
      data: karyawanList,
    });
  } catch (err) {
    console.error("Error getKaryawanByJabatan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Update karyawan
 */
export const updateKaryawan = async (req, res) => {
  try {
    const karyawanId = req.params.id;
    const existingKaryawan = await db("master_karyawan").where("ID", karyawanId).first();

    if (!existingKaryawan) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Karyawan tidak ditemukan",
        datetime: datetime(),
      });
    }

    const {
      nik, nama, gender, tempat_lahir, tgl_lahir, alamat, no_telp,
      email, departemen, jabatan, tanggal_masuk, status_karyawan,
      status_aktif, shift, pendidikan_terakhir,
    } = req.body;

    // ✅ Cek duplikasi NIK (exclude ID yang sedang di-update)
    if (nik && nik !== existingKaryawan.NIK) {
      const nikExists = await KaryawanModel.checkNikExistsExclude(nik, karyawanId);
      if (nikExists) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: "NIK sudah digunakan oleh karyawan lain",
          datetime: datetime(),
        });
      }
    }

    // ✅ Cek duplikasi EMAIL (exclude ID yang sedang di-update)
    if (email && email !== existingKaryawan.EMAIL) {
      const emailExists = await KaryawanModel.checkEmailExistsExclude(email, karyawanId);
      if (emailExists) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: "Email sudah digunakan oleh karyawan lain",
          datetime: datetime(),
        });
      }
    }

    // ✅ Update email & role di tabel users (PERBAIKAN: role ikut update)
    const updateData = {
      name: nama || existingKaryawan.NAMA,
    };

    // Jika email berubah, update email
    if (email && email !== existingKaryawan.EMAIL) {
      updateData.email = email;
    }

    // ✅ PENTING: Update role jika departemen berubah
    if (departemen && departemen !== existingKaryawan.DEPARTEMEN) {
      updateData.role = departemen;
    }

    // Update users table
    await db("users")
      .where("email", existingKaryawan.EMAIL)
      .update(updateData);

    // ✅ Handle foto upload
    let fotoFile = existingKaryawan.FOTO;
    if (req.file) {
      fotoFile = `/uploads/foto_karyawan/${req.file.filename}`;
    }

    const karyawanData = {
      NIK: nik || existingKaryawan.NIK,
      NAMA: nama || existingKaryawan.NAMA,
      GENDER: gender || existingKaryawan.GENDER,
      TEMPAT_LAHIR: tempat_lahir,
      TGL_LAHIR: tgl_lahir,
      ALAMAT: alamat,
      NO_TELP: no_telp,
      EMAIL: email || existingKaryawan.EMAIL,
      DEPARTEMEN: departemen || existingKaryawan.DEPARTEMEN,
      JABATAN: jabatan || existingKaryawan.JABATAN,
      TANGGAL_MASUK: tanggal_masuk,
      STATUS_KARYAWAN: status_karyawan || existingKaryawan.STATUS_KARYAWAN,
      STATUS_AKTIF: status_aktif || existingKaryawan.STATUS_AKTIF,
      SHIFT: shift,
      PENDIDIKAN_TERAKHIR: pendidikan_terakhir,
      FOTO: fotoFile,
    };

    const updatedKaryawan = await KaryawanModel.updateKaryawan(karyawanId, karyawanData);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Karyawan berhasil diperbarui",
      datetime: datetime(),
      data: updatedKaryawan,
    });
  } catch (err) {
    console.error("Error updateKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Hapus karyawan (CASCADE ke tabel users)
 */
export const deleteKaryawan = async (req, res) => {
  try {
    const karyawanId = req.params.id;
    
    // Ambil data karyawan terlebih dahulu
    const karyawan = await db("master_karyawan").where("ID", karyawanId).first();
    
    if (!karyawan) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Karyawan tidak ditemukan",
        datetime: datetime(),
      });
    }

    // ✅ Hapus user berdasarkan EMAIL
    await db("users").where("email", karyawan.EMAIL).del();
    
    // ✅ Hapus karyawan
    await db("master_karyawan").where("ID", karyawanId).del();
    
    return res.status(200).json({
      status: status.SUKSES,
      message: "Karyawan dan user terkait berhasil dihapus",
      datetime: datetime(),
      data: karyawan,
    });
  } catch (err) {
    console.error("Error deleteKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * 🔹 Toggle status aktif karyawan (Aktif <-> Nonaktif)
 */
export const toggleStatusKaryawan = async (req, res) => {
  try {
    const karyawanId = req.params.id;
    const existingKaryawan = await db("master_karyawan").where("ID", karyawanId).first();

    if (!existingKaryawan) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "Karyawan tidak ditemukan",
        datetime: datetime(),
      });
    }

    const newStatus = existingKaryawan.STATUS_AKTIF === "Aktif" ? "Nonaktif" : "Aktif";

    const updatedKaryawan = await KaryawanModel.updateKaryawan(karyawanId, {
      STATUS_AKTIF: newStatus,
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: `Status karyawan berhasil diubah menjadi ${newStatus}`,
      datetime: datetime(),
      data: updatedKaryawan,
    });
  } catch (err) {
    console.error("Error toggleStatusKaryawan:", err);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${err.message}`,
      datetime: datetime(),
    });
  }
};