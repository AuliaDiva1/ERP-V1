// models/masterKomponenGajiModel.js
import { db } from "../core/config/knex.js";

// ─────────────────────────────────────────────────────────────
// GET ALL (join karyawan)
// ─────────────────────────────────────────────────────────────
export const getAll = async () => {
  return db("master_komponen_gaji as kg")
    .join("master_karyawan as k", "kg.KARYAWAN_ID", "k.KARYAWAN_ID")
    .select(
      "kg.*",
      "k.NAMA",
      "k.JABATAN",
      "k.DEPARTEMEN",
      "k.STATUS_AKTIF"
    )
    .orderBy("k.NAMA", "asc");
};

// ─────────────────────────────────────────────────────────────
// GET BY KARYAWAN ID
// ─────────────────────────────────────────────────────────────
export const getByKaryawanId = async (karyawanId) => {
  return db("master_komponen_gaji").where("KARYAWAN_ID", karyawanId).first();
};

// ─────────────────────────────────────────────────────────────
// HELPER: Cari default jabatan dengan fallback bertingkat
// Urutan prioritas:
//   1. Exact match JABATAN + DEPARTEMEN
//   2. Exact match JABATAN saja (tanpa departemen)
//   3. LIKE match — master jabatan mengandung kata karyawan (misal "Staff" → "Staff PRODUKSI")
//   4. LIKE match — nama karyawan mengandung kata master jabatan (sebaliknya)
// ─────────────────────────────────────────────────────────────
const findDefaultJabatan = async (jabatan, departemen) => {
  // 1. Exact match + departemen
  if (departemen) {
    const exact = await db("master_gaji_jabatan")
      .where("JABATAN", jabatan)
      .where("DEPARTEMEN", departemen)
      .where("STATUS", "Aktif")
      .first();
    if (exact) return exact;
  }

  // 2. Exact match jabatan saja
  const exactNoDept = await db("master_gaji_jabatan")
    .where("JABATAN", jabatan)
    .where("STATUS", "Aktif")
    .first();
  if (exactNoDept) return exactNoDept;

  // 3. Master jabatan mengandung kata dari jabatan karyawan
  //    Contoh: karyawan="Staff", master="Staff PRODUKSI" → cocok
  const likeForward = await db("master_gaji_jabatan")
    .whereRaw("JABATAN LIKE ?", [`%${jabatan}%`])
    .where("STATUS", "Aktif")
    .modify((q) => {
      if (departemen) q.where("DEPARTEMEN", departemen);
    })
    .orderByRaw("LENGTH(JABATAN) ASC") // pilih yang paling pendek / paling dekat
    .first();
  if (likeForward) return likeForward;

  // 4. Jabatan karyawan mengandung kata dari master jabatan
  //    Contoh: karyawan="Staff Gudang Senior", master="Staff Gudang" → cocok
  //    Fetch semua kandidat aktif lalu filter di JS (LIKE param dinamis)
  const candidates = await db("master_gaji_jabatan")
    .where("STATUS", "Aktif")
    .modify((q) => {
      if (departemen) q.where("DEPARTEMEN", departemen);
    })
    .select("*");

  const matched = candidates.find((c) =>
    jabatan.toLowerCase().includes(c.JABATAN.toLowerCase())
  );
  if (matched) return matched;

  // 5. Tidak ditemukan sama sekali
  return null;
};

// ─────────────────────────────────────────────────────────────
// UPSERT (insert or update)
// ─────────────────────────────────────────────────────────────
export const upsert = async (karyawanId, payload) => {
  const existing = await getByKaryawanId(karyawanId);

  const data = {
    KARYAWAN_ID                 : karyawanId,
    GAJI_POKOK                  : payload.GAJI_POKOK ?? null,
    TUNJANGAN_TRANSPORT         : payload.TUNJANGAN_TRANSPORT ?? null,
    TUNJANGAN_MAKAN             : payload.TUNJANGAN_MAKAN ?? null,
    TUNJANGAN_JABATAN           : payload.TUNJANGAN_JABATAN ?? null,
    TUNJANGAN_LAINNYA           : payload.TUNJANGAN_LAINNYA ?? null,
    POTONGAN_TERLAMBAT_PER_MENIT: payload.POTONGAN_TERLAMBAT_PER_MENIT ?? null,
    POTONGAN_ALPA_PER_HARI      : payload.POTONGAN_ALPA_PER_HARI ?? null,
    BPJS_KESEHATAN_PERSEN       : payload.BPJS_KESEHATAN_PERSEN ?? null,
    BPJS_TK_PERSEN              : payload.BPJS_TK_PERSEN ?? null,
    IS_KENA_PPH21               : payload.IS_KENA_PPH21 != null
                                    ? (payload.IS_KENA_PPH21 ? 1 : 0)
                                    : null,
    BONUS_SCORE_90              : payload.BONUS_SCORE_90 ?? null,
    BONUS_SCORE_75              : payload.BONUS_SCORE_75 ?? null,
    BONUS_SCORE_60              : payload.BONUS_SCORE_60 ?? null,
    CATATAN                     : payload.CATATAN ?? null,
    updated_at                  : db.fn.now(),
  };

  if (existing) {
    await db("master_komponen_gaji").where("KARYAWAN_ID", karyawanId).update(data);
  } else {
    await db("master_komponen_gaji").insert(data);
  }

  return getByKaryawanId(karyawanId);
};

// ─────────────────────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────────────────────
export const remove = async (karyawanId) => {
  return db("master_komponen_gaji").where("KARYAWAN_ID", karyawanId).delete();
};

// ─────────────────────────────────────────────────────────────
// RESOLVE KOMPONEN GAJI
// Ambil nilai final dengan fallback jabatan → override individu
// Return juga SUMBER_GAJI: "Jabatan" | "Override"
// ─────────────────────────────────────────────────────────────
export const resolveKomponenGaji = async (karyawanId) => {
  // 1. Ambil data karyawan
  const karyawan = await db("master_karyawan")
    .where("KARYAWAN_ID", karyawanId)
    .select("KARYAWAN_ID", "NAMA", "JABATAN", "DEPARTEMEN")
    .first();

  if (!karyawan) throw new Error(`Karyawan ${karyawanId} tidak ditemukan`);

  // 2. Ambil default dari jabatan — pakai helper dengan fallback bertingkat
  const defaultGaji = await findDefaultJabatan(karyawan.JABATAN, karyawan.DEPARTEMEN);

  // 3. Ambil override per individu
  const override = await getByKaryawanId(karyawanId);

  // 4. Merge: override menang jika tidak NULL
  const pick = (field) =>
    override?.[field] != null ? override[field] : (defaultGaji?.[field] ?? 0);

  const adaOverride = override != null;
  const punyaOverrideBeda = adaOverride && Object.keys(override).some(
    (k) => !["ID", "KARYAWAN_ID", "CATATAN", "created_at", "updated_at"].includes(k)
         && override[k] != null
  );

  return {
    karyawan,
    sumber_gaji          : punyaOverrideBeda ? "Override" : "Jabatan",
    default_jabatan      : defaultGaji || null,
    override_individu    : override || null,
    GAJI_POKOK                  : parseFloat(pick("GAJI_POKOK")),
    TUNJANGAN_TRANSPORT         : parseFloat(pick("TUNJANGAN_TRANSPORT")),
    TUNJANGAN_MAKAN             : parseFloat(pick("TUNJANGAN_MAKAN")),
    TUNJANGAN_JABATAN           : parseFloat(pick("TUNJANGAN_JABATAN")),
    TUNJANGAN_LAINNYA           : parseFloat(pick("TUNJANGAN_LAINNYA")),
    POTONGAN_TERLAMBAT_PER_MENIT: parseFloat(pick("POTONGAN_TERLAMBAT_PER_MENIT")),
    POTONGAN_ALPA_PER_HARI      : parseFloat(pick("POTONGAN_ALPA_PER_HARI")),
    BPJS_KESEHATAN_PERSEN       : parseFloat(pick("BPJS_KESEHATAN_PERSEN")),
    BPJS_TK_PERSEN              : parseFloat(pick("BPJS_TK_PERSEN")),
    IS_KENA_PPH21               : pick("IS_KENA_PPH21") ? 1 : 0,
    BONUS_SCORE_90              : parseFloat(pick("BONUS_SCORE_90")),
    BONUS_SCORE_75              : parseFloat(pick("BONUS_SCORE_75")),
    BONUS_SCORE_60              : parseFloat(pick("BONUS_SCORE_60")),
  };
};
