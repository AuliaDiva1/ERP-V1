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