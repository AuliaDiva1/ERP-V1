import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * 🔹 Universal upload function dengan custom folder
 */
const createUpload = (folderName, filePrefix = "") => {
  // Folder akan dibuat di dalam directory 'uploads'
  const uploadDir = `./uploads/${folderName}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Buat folder secara otomatis jika belum ada (recursive: true)
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Format: prefix-timestamp-random.ext
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const prefix = filePrefix ? `${filePrefix}-` : "";
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    },
  });

  // Filter hanya menerima file gambar
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;

    // Validasi double: cek ekstensi dan mimetype
    if (allowedTypes.test(ext) && allowedTypes.test(mimeType)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diizinkan (jpg, jpeg, png, gif)"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024 // Batas maksimal 5MB per file
    }, 
  });
};

/**
 * ✅ EXPORT UNTUK BERBAGAI KEPERLUAN
 * Gunakan ini di file Routes masing-masing
 */

// 1. Untuk modul Presensi (Karyawan Absen)
export const uploadPresensi = createUpload("presensi", "presensi");

// 2. Untuk modul Master Karyawan (Foto Profil)
export const uploadKaryawan = createUpload("foto_karyawan", "karyawan");

// 3. Untuk modul Logbook / Aktivitas
export const uploadLogbook = createUpload("foto_logbook", "logbook");

// 4. Untuk modul Batch / Produksi (jika ada)
export const uploadBatch = createUpload("foto_batch", "batch");

// Default export (optional)
export default uploadKaryawan;