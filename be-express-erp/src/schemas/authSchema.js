import { z } from "zod";

/**
 * Schema validasi untuk register
 */
export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(
    [
      "SUPERADMIN",
      "GUDANG",
      "PRODUKSI",
      "HR",
      "KEUANGAN",
    ],
    { message: "Role tidak valid" }
  ).default("GUDANG"),
});

/**
 * Schema validasi untuk login
 */
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export const registerKaryawanSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["HR", "PRODUKSI", "GUDANG", "KEUANGAN"]),
  
  nik: z.string().min(1, "NIK wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  gender: z.enum(["L", "P"]),
  
  tempat_lahir: z.string().optional(),
  tgl_lahir: z.string().optional(), // format: YYYY-MM-DD
  alamat: z.string().optional(),
  no_telp: z.string().optional(),
  
  departemen: z.string().min(1, "Departemen wajib diisi"),
  jabatan: z.string().min(1, "Jabatan wajib diisi"),
  tanggal_masuk: z.string().optional(),
  
  status_karyawan: z.enum(["Tetap", "Kontrak", "Magang"]).optional(),
  shift: z.enum(["Pagi", "Siang", "Malam"]).optional(),
  pendidikan_terakhir: z.string().optional(),
});