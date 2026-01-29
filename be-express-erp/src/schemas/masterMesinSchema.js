import { z } from "zod";

export const addMasterMesinSchema = z.object({
  kode_mesin: z
    .string()
    .min(3, "Kode mesin minimal 3 karakter")
    .max(100, "Kode mesin maksimal 100 karakter"),
  nama_mesin: z
    .string()
    .min(3, "Nama mesin minimal 3 karakter")
    .max(100, "Nama mesin maksimal 100 karakter"),
  suhu_maksimal: z.number("Suhu maksimal harus berupa angka"),
});

export const updateMasterMesinSchema = z.object({
  kode_mesin: z
    .string()
    .min(3, "Kode mesin minimal 3 karakter")
    .max(100, "Kode mesin maksimal 100 karakter")
    .optional(),
  nama_mesin: z
    .string()
    .min(3, "Nama mesin minimal 3 karakter")
    .max(100, "Nama mesin maksimal 100 karakter")
    .optional(),
  suhu_maksimal: z.number("Suhu maksimal harus berupa angka").optional(),
});
