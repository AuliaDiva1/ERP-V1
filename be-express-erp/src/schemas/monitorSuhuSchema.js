import { z } from "zod";

export const addMonitorSuhuSchema = z.object({
  id_mesin: z.number("Kode Mesin wajib di isi"),
  tanggal_input: z.string(),
  // waktu_input: z.date("Waktu wajib di isi"),
  keterangan_suhu: z.number("Suhu harus berupa angka"),
});
