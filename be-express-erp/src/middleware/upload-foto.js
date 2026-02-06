import multer from "multer";
import path from "path";
import fs from "fs";

// Folder khusus karyawan
const uploadDir = "./uploads/foto_karyawan";

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
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

const upload = multer({ storage, fileFilter });

// Export khusus register karyawan
export const uploadKaryawan = upload;
export default upload;
