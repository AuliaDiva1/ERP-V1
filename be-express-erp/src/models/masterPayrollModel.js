// models/masterPayrollModel.js
import { db } from "../core/config/knex.js";
import { resolveKomponenGaji } from "./masterKomponenGajiModel.js";
import { getRekapitulasiKinerja } from "./rekapitulasiKinerjaModel.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const toDateStr = (d) => {
  if (!d) return null;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

const fmt = (n) => parseFloat(parseFloat(n || 0).toFixed(2));

// 0=Minggu,1=Senin,...,6=Sabtu
const HARI_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/**
 * Ambil konfigurasi shift dari DB
 * Return { hariKerjaSet: Set<string>, jamMasuk: "07:00", jamKeluar: "15:00" }
 * Fallback: Senin-Sabtu jika shift tidak ditemukan
 */
const getShiftConfig = async (namaShift) => {
  const fallback = {
    hariKerjaSet: new Set(["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]),
    jamMasuk: "07:00",
    jamKeluar: "16:00",
  };

  if (!namaShift) return fallback;

  try {
    const shift = await db("master_shift")
      .where("NAMA_SHIFT", namaShift)
      .where("STATUS", "Aktif")
      .first();

    if (!shift) return fallback;

    const hariKerjaSet = new Set(
      shift.HARI_KERJA.split(",").map((h) => h.trim())
    );

    return {
      hariKerjaSet,
      jamMasuk: String(shift.JAM_MASUK).substring(0, 5),
      jamKeluar: String(shift.JAM_KELUAR).substring(0, 5),
    };
  } catch {
    return fallback;
  }
};

/**
 * Hitung jumlah hari kerja dalam rentang tanggal
 * berdasarkan Set hari kerja dari shift
 */
const hitungHariKerja = (startDate, endDate, hariKerjaSet) => {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  let count   = 0;
  const cur   = new Date(start);

  while (cur <= end) {
    const namaHari = HARI_ID[cur.getDay()];
    if (hariKerjaSet.has(namaHari)) count++;
    cur.setDate(cur.getDate() + 1);
  }

  return count;
};

/**
 * Hitung jumlah hari karyawan HARUSNYA masuk tapi tidak ada presensi
 * = hari kerja dalam rentang MINUS hari yang sudah ada di master_presensi
 * (apapun statusnya — Hadir/Sakit/Izin/Cuti/Dinas Luar/Alpa)
 * Hari tanpa record presensi sama sekali = Alpa otomatis
 */
const hitungAlpaTambahan = (startDate, endDate, hariKerjaSet, presensiTanggalSet) => {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  let count   = 0;
  const cur   = new Date(start);

  // Hitung semua hari kerja dalam periode — termasuk hari yang belum terjadi
  // karena payroll di-generate di akhir bulan / setelah periode selesai
  while (cur <= end) {
    const namaHari   = HARI_ID[cur.getDay()];
    const tanggalStr = cur.toISOString().split("T")[0];

    if (hariKerjaSet.has(namaHari) && !presensiTanggalSet.has(tanggalStr)) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count;
};

/**
 * Hitung PPh21 sederhana (tarif progresif tahunan → bulanan)
 * PKP = (Gaji Pokok × 12) - 54.000.000 (PTKP TK/0)
 */
const hitungPph21 = (gajiPokok, isKenaPph) => {
  if (!isKenaPph) return 0;
  const gajiTahunan = gajiPokok * 12;
  const ptkp = 54_000_000;
  const pkp  = Math.max(0, gajiTahunan - ptkp);

  let pajakTahunan = 0;
  if      (pkp <= 60_000_000)  pajakTahunan = pkp * 0.05;
  else if (pkp <= 250_000_000) pajakTahunan = 3_000_000 + (pkp - 60_000_000)  * 0.15;
  else if (pkp <= 500_000_000) pajakTahunan = 31_500_000 + (pkp - 250_000_000) * 0.25;
  else                         pajakTahunan = 94_000_000 + (pkp - 500_000_000) * 0.30;

  return fmt(pajakTahunan / 12);
};

/**
 * Generate kode payroll: PAY-202603-KRY0001
 */
const generateKodePayroll = (karyawanId, periode) => {
  const d  = new Date(periode);
  const ym = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `PAY-${ym}-${karyawanId.replace(/-/g, "")}`; // replace SEMUA tanda "-"
};

// ─────────────────────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────────────────────
export const getAll = async ({ periode, status, departemen } = {}) => {
  let q = db("master_payroll as p")
    .join("master_karyawan as k", "p.KARYAWAN_ID", "k.KARYAWAN_ID")
    .select("p.*", "k.NAMA", "k.JABATAN", "k.DEPARTEMEN", "k.FOTO")
    .orderBy("p.PERIODE", "desc")
    .orderBy("k.NAMA", "asc");

  if (periode)    q = q.where("p.PERIODE", periode);
  if (status)     q = q.where("p.STATUS", status);
  if (departemen) q = q.where("k.DEPARTEMEN", departemen);

  return q;
};

// ─────────────────────────────────────────────────────────────
// GET BY ID
// ─────────────────────────────────────────────────────────────
export const getById = async (id) => {
  return db("master_payroll as p")
    .join("master_karyawan as k", "p.KARYAWAN_ID", "k.KARYAWAN_ID")
    .where("p.ID", id)
    .select("p.*", "k.NAMA", "k.JABATAN", "k.DEPARTEMEN", "k.FOTO", "k.NIK", "k.NO_TELP")
    .first();
};

// ─────────────────────────────────────────────────────────────
// GET BY KARYAWAN + PERIODE
// ─────────────────────────────────────────────────────────────
export const getByKaryawanPeriode = async (karyawanId, periode) => {
  return db("master_payroll")
    .where("KARYAWAN_ID", karyawanId)
    .where("PERIODE", periode)
    .first();
};

// ─────────────────────────────────────────────────────────────
// HITUNG PAYROLL (core logic)
// ─────────────────────────────────────────────────────────────
export const hitungPayroll = async (karyawanId, periodeStart, periodeEnd) => {
  const sd = toDateStr(periodeStart);
  const ed = toDateStr(periodeEnd);

  // 1. Resolve komponen gaji (jabatan + override)
  const komponen = await resolveKomponenGaji(karyawanId);

  // 2. Ambil shift karyawan
  const shiftNama = komponen.karyawan?.SHIFT || null;
  const shiftConfig = await getShiftConfig(shiftNama);

  // 3. Hitung total hari kerja sesuai shift
  const totalHariKerjaShift = hitungHariKerja(sd, ed, shiftConfig.hariKerjaSet);

  // 4. Ambil rekapitulasi kinerja (presensi + logbook)
  const rekap = await getRekapitulasiKinerja(karyawanId, sd, ed);
  const { presensi, produktivitas, performance_score } = rekap.summary;

  // 5. Hitung alpa tambahan: hari kerja yang tidak ada presensi ATAU presensi Alpa
  // Hari yang "sudah tercatat" = ada presensi dengan status BUKAN Alpa
  // (Hadir, Sakit, Izin, Cuti, Dinas Luar = tidak dihitung alpa tambahan)
  const STATUS_BUKAN_ALPA = new Set(["Hadir", "Sakit", "Izin", "Cuti", "Dinas Luar"]);
  const presensiTanggalSet = new Set(
    rekap.daily_data
      .filter((d) => d.presensi !== null && STATUS_BUKAN_ALPA.has(d.presensi.STATUS))
      .map((d) => new Date(d.tanggal).toISOString().split("T")[0])
  );

  const alpaTambahan = hitungAlpaTambahan(sd, ed, shiftConfig.hariKerjaSet, presensiTanggalSet);

  // 6. Total alpa = alpa dari presensi + hari tanpa presensi sama sekali
  const totalAlpa = presensi.alpa + alpaTambahan;

  // 6b. Hitung ulang performance score pakai totalAlpa yang benar
  let correctedScore = 100;
  correctedScore -= totalAlpa            * 10; // -10 per hari alpa
  correctedScore -= presensi.terlambat   * 2;  // -2 per kejadian terlambat
  correctedScore -= presensi.pulang_awal * 1;  // -1 per kejadian pulang awal

  // Bonus output
  const totalHariKerja = Math.max(presensi.total_hari_kerja, 1);
  const avgOutput = produktivitas.total_output / totalHariKerja;
  if (avgOutput >= 10) correctedScore += 5;
  if (avgOutput >= 20) correctedScore += 5;

  const finalScore = Math.max(0, Math.min(100, Math.round(correctedScore)));

  // 7. Hitung menit terlambat (15 menit flat per kejadian)
  const totalTerlambatMenit = presensi.terlambat * 15;

  // 8. Tentukan % bonus berdasarkan performance score
  let bonusPersen = 0;
  if      (finalScore >= 90) bonusPersen = komponen.BONUS_SCORE_90;
  else if (finalScore >= 75) bonusPersen = komponen.BONUS_SCORE_75;
  else if (finalScore >= 60) bonusPersen = komponen.BONUS_SCORE_60;

  // 9. Komponen pendapatan
  const gajiPokok       = fmt(komponen.GAJI_POKOK);
  const tunjTransport   = fmt(komponen.TUNJANGAN_TRANSPORT);
  const tunjMakan       = fmt(komponen.TUNJANGAN_MAKAN);
  const tunjJabatan     = fmt(komponen.TUNJANGAN_JABATAN);
  const tunjLainnya     = fmt(komponen.TUNJANGAN_LAINNYA);
  const bonusKinerja    = fmt((bonusPersen / 100) * gajiPokok);
  const totalPendapatan = fmt(gajiPokok + tunjTransport + tunjMakan + tunjJabatan + tunjLainnya + bonusKinerja);

  // 10. Komponen potongan
  const potonganTerlambat = fmt(totalTerlambatMenit * komponen.POTONGAN_TERLAMBAT_PER_MENIT);
  const potonganAlpa      = fmt(totalAlpa * komponen.POTONGAN_ALPA_PER_HARI);
  const bpjsKesehatan     = fmt((komponen.BPJS_KESEHATAN_PERSEN / 100) * gajiPokok);
  const bpjsTk            = fmt((komponen.BPJS_TK_PERSEN / 100) * gajiPokok);
  const pph21             = hitungPph21(gajiPokok, komponen.IS_KENA_PPH21);
  const totalPotongan     = fmt(potonganTerlambat + potonganAlpa + bpjsKesehatan + bpjsTk + pph21);

  // 11. Take Home Pay
  const takeHomePay = fmt(Math.max(0, totalPendapatan - totalPotongan));

  return {
    karyawan    : rekap.karyawan,
    sumber_gaji : komponen.sumber_gaji,
    shift       : shiftNama,
    periode     : { start: sd, end: ed },
    kehadiran: {
      hari_kerja_normal          : totalHariKerjaShift,
      hari_hadir                 : presensi.hadir,
      hari_alpa                  : totalAlpa,           // alpa presensi + alpa tanpa presensi
      hari_alpa_presensi         : presensi.alpa,       // alpa dari record presensi STATUS='Alpa'
      hari_alpa_tanpa_presensi   : alpaTambahan,        // hari kerja tanpa record presensi sama sekali
      hari_sakit                 : presensi.sakit,
      hari_izin                  : presensi.izin,
      hari_cuti                  : presensi.cuti,
      hari_dinas_luar            : presensi.dinas_luar,
      total_terlambat_menit      : totalTerlambatMenit,
      total_kejadian_terlambat   : presensi.terlambat,
      total_pulang_awal          : presensi.pulang_awal,
    },
    kinerja: {
      performance_score   : finalScore,
      total_output        : produktivitas.total_output,
      total_jam_produktif : produktivitas.total_jam_produktif,
      total_logbook       : produktivitas.total_logbook_approved,
      bonus_persen        : bonusPersen,
    },
    pendapatan: {
      gaji_pokok          : gajiPokok,
      tunjangan_transport : tunjTransport,
      tunjangan_makan     : tunjMakan,
      tunjangan_jabatan   : tunjJabatan,
      tunjangan_lainnya   : tunjLainnya,
      bonus_kinerja       : bonusKinerja,
      total_pendapatan    : totalPendapatan,
    },
    potongan: {
      potongan_terlambat  : potonganTerlambat,
      potongan_alpa       : potonganAlpa,
      bpjs_kesehatan      : bpjsKesehatan,
      bpjs_tk             : bpjsTk,
      pph21               : pph21,
      total_potongan      : totalPotongan,
    },
    take_home_pay: takeHomePay,
  };
};

// ─────────────────────────────────────────────────────────────
// GENERATE & SIMPAN PAYROLL
// ─────────────────────────────────────────────────────────────
export const generatePayroll = async (karyawanId, periodeStart, periodeEnd) => {
  const sd      = toDateStr(periodeStart);
  const periode = sd.substring(0, 7) + "-01";

  const existing = await getByKaryawanPeriode(karyawanId, periode);
  if (existing) throw new Error(`Payroll ${karyawanId} periode ${periode} sudah ada (ID: ${existing.ID})`);

  const hasil = await hitungPayroll(karyawanId, periodeStart, periodeEnd);
  const kode  = generateKodePayroll(karyawanId, periode);

  const [id] = await db("master_payroll").insert({
    KODE_PAYROLL                : kode,
    KARYAWAN_ID                 : karyawanId,
    PERIODE                     : periode,
    JABATAN_SNAPSHOT            : hasil.karyawan.JABATAN,
    DEPARTEMEN_SNAPSHOT         : hasil.karyawan.DEPARTEMEN,
    SUMBER_GAJI                 : hasil.sumber_gaji,
    HARI_KERJA_NORMAL           : hasil.kehadiran.hari_kerja_normal,
    HARI_HADIR                  : hasil.kehadiran.hari_hadir,
    HARI_ALPA                   : hasil.kehadiran.hari_alpa,
    HARI_SAKIT                  : hasil.kehadiran.hari_sakit,
    HARI_IZIN                   : hasil.kehadiran.hari_izin,
    HARI_CUTI                   : hasil.kehadiran.hari_cuti,
    HARI_DINAS_LUAR             : hasil.kehadiran.hari_dinas_luar,
    TOTAL_TERLAMBAT_MENIT       : hasil.kehadiran.total_terlambat_menit,
    TOTAL_KEJADIAN_TERLAMBAT    : hasil.kehadiran.total_kejadian_terlambat,
    TOTAL_PULANG_AWAL           : hasil.kehadiran.total_pulang_awal,
    PERFORMANCE_SCORE           : hasil.kinerja.performance_score,
    TOTAL_OUTPUT                : hasil.kinerja.total_output,
    TOTAL_JAM_PRODUKTIF         : hasil.kinerja.total_jam_produktif,
    TOTAL_LOGBOOK_APPROVED      : hasil.kinerja.total_logbook,
    GAJI_POKOK                  : hasil.pendapatan.gaji_pokok,
    TUNJANGAN_TRANSPORT         : hasil.pendapatan.tunjangan_transport,
    TUNJANGAN_MAKAN             : hasil.pendapatan.tunjangan_makan,
    TUNJANGAN_JABATAN           : hasil.pendapatan.tunjangan_jabatan,
    TUNJANGAN_LAINNYA           : hasil.pendapatan.tunjangan_lainnya,
    BONUS_KINERJA               : hasil.pendapatan.bonus_kinerja,
    BONUS_PERSEN_DIPAKAI        : hasil.kinerja.bonus_persen,
    TOTAL_PENDAPATAN            : hasil.pendapatan.total_pendapatan,
    POTONGAN_TERLAMBAT          : hasil.potongan.potongan_terlambat,
    POTONGAN_ALPA               : hasil.potongan.potongan_alpa,
    POTONGAN_BPJS_KESEHATAN     : hasil.potongan.bpjs_kesehatan,
    POTONGAN_BPJS_TK            : hasil.potongan.bpjs_tk,
    POTONGAN_PPH21              : hasil.potongan.pph21,
    TOTAL_POTONGAN              : hasil.potongan.total_potongan,
    TAKE_HOME_PAY               : hasil.take_home_pay,
    STATUS                      : "Draft",
  });

  return getById(id);
};

// ─────────────────────────────────────────────────────────────
// GENERATE BULK
// ─────────────────────────────────────────────────────────────
export const generatePayrollBulk = async (periodeStart, periodeEnd) => {
  const karyawanList = await db("master_karyawan")
    .where("STATUS_AKTIF", "Aktif")
    .select("KARYAWAN_ID", "NAMA");

  const results = [];
  for (const k of karyawanList) {
    try {
      const payroll = await generatePayroll(k.KARYAWAN_ID, periodeStart, periodeEnd);
      results.push({ status: "success", karyawan_id: k.KARYAWAN_ID, nama: k.NAMA, payroll_id: payroll.ID });
    } catch (err) {
      results.push({ status: "skipped", karyawan_id: k.KARYAWAN_ID, nama: k.NAMA, reason: err.message });
    }
  }
  return results;
};

// ─────────────────────────────────────────────────────────────
// APPROVE
// ─────────────────────────────────────────────────────────────
export const approvePayroll = async (id, approvedBy) => {
  const payroll = await getById(id);
  if (!payroll) throw new Error("Payroll tidak ditemukan");
  if (payroll.STATUS !== "Draft") throw new Error(`Payroll sudah berstatus ${payroll.STATUS}`);

  await db("master_payroll").where("ID", id).update({
    STATUS      : "Approved",
    APPROVED_BY : approvedBy,
    APPROVED_AT : db.fn.now(),
    updated_at  : db.fn.now(),
  });
  return getById(id);
};

// ─────────────────────────────────────────────────────────────
// MARK AS PAID
// ─────────────────────────────────────────────────────────────
export const markAsPaid = async (id, paidBy) => {
  const payroll = await getById(id);
  if (!payroll) throw new Error("Payroll tidak ditemukan");
  if (payroll.STATUS !== "Approved") throw new Error("Payroll harus Approved sebelum Paid");

  await db("master_payroll").where("ID", id).update({
    STATUS    : "Paid",
    PAID_BY   : paidBy,
    PAID_AT   : db.fn.now(),
    updated_at: db.fn.now(),
  });
  return getById(id);
};

// ─────────────────────────────────────────────────────────────
// DELETE (hanya Draft)
// ─────────────────────────────────────────────────────────────
export const remove = async (id) => {
  const payroll = await getById(id);
  if (!payroll) throw new Error("Payroll tidak ditemukan");
  if (payroll.STATUS !== "Draft") throw new Error("Hanya payroll Draft yang bisa dihapus");
  return db("master_payroll").where("ID", id).delete();
};

// ─────────────────────────────────────────────────────────────
// PREVIEW (hitung tanpa simpan)
// ─────────────────────────────────────────────────────────────
export const previewPayroll = async (karyawanId, periodeStart, periodeEnd) => {
  return hitungPayroll(karyawanId, periodeStart, periodeEnd);
};

// ─────────────────────────────────────────────────────────────
// SUMMARY PERIODE
// ─────────────────────────────────────────────────────────────
export const getSummaryPeriode = async (periode) => {
  const data = await db("master_payroll").where("PERIODE", periode);
  return {
    total_karyawan  : data.length,
    total_draft     : data.filter((d) => d.STATUS === "Draft").length,
    total_approved  : data.filter((d) => d.STATUS === "Approved").length,
    total_paid      : data.filter((d) => d.STATUS === "Paid").length,
    total_pendapatan: fmt(data.reduce((s, d) => s + parseFloat(d.TOTAL_PENDAPATAN || 0), 0)),
    total_potongan  : fmt(data.reduce((s, d) => s + parseFloat(d.TOTAL_POTONGAN || 0), 0)),
    total_thp       : fmt(data.reduce((s, d) => s + parseFloat(d.TAKE_HOME_PAY || 0), 0)),
  };
};
