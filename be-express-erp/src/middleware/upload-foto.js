// middleware/upload-foto.js
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * 🔹 Universal upload function dengan custom folder
 */
const createUpload = (folderName, filePrefix = "") => {
  const uploadDir = `./uploads/${folderName}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Buat folder jika belum ada
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Nama file unik
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const prefix = filePrefix ? `${filePrefix}-` : "";
      cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    },
  });

  // Filter hanya gambar
  const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file gambar yang diizinkan (jpg, jpeg, png, gif)"));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  });
};

// ✅ Export untuk berbagai keperluan
export const uploadKaryawan = createUpload("foto_karyawan", "karyawan");
export const uploadLogbook = createUpload("foto_logbook", "logbook");
export const uploadBatch = createUpload("foto_batch", "batch");

// Default export untuk backward compatibility
export default uploadKaryawan;