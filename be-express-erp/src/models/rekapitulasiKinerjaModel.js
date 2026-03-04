// models/rekapitulasiKinerjaModel.js — FINAL PATCHED
// Fix 1: handle JAM_KERJA format campuran ("12.00", "6:05", 5.17)
// Fix 2: toDateStr() agar whereBetween selalu valid
// Fix 3: IS_TERLAMBAT MySQL tinyint → bisa 0/1 bukan true/false
// Fix 4: bulk query agar tidak N+1

import { db } from "../core/config/knex.js";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Normalisasi ke "YYYY-MM-DD" — aman untuk MySQL whereBetween
 */
const toDateStr = (d) => {
  if (!d) return null;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

/**
 * Konversi JAM_KERJA → desimal jam
 *
 * Format di DB Anda:
 *   "12.00"  → 12.0    (decimal string lama)
 *   "5.17"   → 5.17    (decimal, bukan 5 jam 17 menit!)
 *   "6:05"   → 6.0833  (H:MM dari calculateJamKerja())
 *   "1:25"   → 1.4166
 *   6        → 6.0     (number)
 *   null     → 0
 */
const jamKerjaToDecimal = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const str = String(val).trim();
  if (!str) return 0;

  if (str.includes(":")) {
    const [h, m] = str.split(":").map((v) => parseInt(v) || 0);
    return h + m / 60;
  }

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};

/**
 * Konversi JAM_MASUK/JAM_KELUAR ("HH:MM:SS") → desimal jam
 */
const jamPresensiToDecimal = (jamMasuk, jamKeluar) => {
  if (!jamMasuk || !jamKeluar) return 0;
  const toMin = (t) => {
    const [h, m] = String(t).split(":").map((v) => parseInt(v) || 0);
    return h * 60 + m;
  };
  const diff = Math.max(0, toMin(jamKeluar) - toMin(jamMasuk));
  return parseFloat((diff / 60).toFixed(4));
};

/**
 * MySQL tinyint bisa datang sebagai 0/1 (integer) atau true/false (boolean)
 */
const isTruthy = (v) => v === 1 || v === true || v === "1";

/**
 * Hitung Performance Score 0–100
 */
const hitungScore = ({ totalAlpa, totalTerlambat, totalPulangAwal, totalOutput, totalHariKerja }) => {
  let score = 100;
  score -= totalAlpa       * 10;
  score -= totalTerlambat  * 2;
  score -= totalPulangAwal * 1;

  if (totalHariKerja > 0) {
    const avg = totalOutput / totalHariKerja;
    if (avg >= 10) score += 5;
    if (avg >= 20) score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

// ─────────────────────────────────────────────────────────────
// REKAP SATU KARYAWAN
// ─────────────────────────────────────────────────────────────
export const getRekapitulasiKinerja = async (karyawanId, startDate, endDate) => {
  const sd = toDateStr(startDate);
  const ed = toDateStr(endDate);
  if (!sd || !ed) throw new Error("Format tanggal tidak valid");

  // 1. Data karyawan
  const karyawan = await db("master_karyawan")
    .where("KARYAWAN_ID", karyawanId)
    .select("KARYAWAN_ID", "NAMA", "NIK", "DEPARTEMEN", "JABATAN", "EMAIL", "SHIFT", "STATUS_AKTIF", "FOTO")
    .first();

  if (!karyawan) throw new Error(`Karyawan '${karyawanId}' tidak ditemukan`);

  // 2. Presensi dalam periode
  const presensiRows = await db("master_presensi")
    .where("KARYAWAN_ID", karyawanId)
    .whereBetween("TANGGAL", [sd, ed])
    .select(
      "ID", "KODE_PRESENSI", "TANGGAL", "STATUS",
      "JAM_MASUK", "JAM_KELUAR",
      "IS_TERLAMBAT", "IS_PULANG_AWAL",
      "FOTO_MASUK", "FOTO_KELUAR"
    )
    .orderBy("TANGGAL", "asc");

  // 3. Logbook Approved dalam periode
  const logbookRows = await db("logbook_pekerjaan as l")
    .leftJoin("master_batch as b", "l.BATCH_ID", "b.BATCH_ID")
    .where("l.KARYAWAN_ID", karyawanId)
    .where("l.STATUS", "Approved")
    .whereBetween("l.TANGGAL", [sd, ed])
    .select(
      "l.ID", "l.LOGBOOK_ID", "l.BATCH_ID",
      "l.TANGGAL", "l.JAM_MULAI", "l.JAM_SELESAI",
      "l.JAM_KERJA", "l.JUMLAH_OUTPUT",
      "l.AKTIVITAS", "l.DESKRIPSI", "l.STATUS",
      "b.NAMA_BATCH", "b.KATEGORI_PRODUK", "b.SATUAN"
    )
    .orderBy("l.TANGGAL", "asc");

  // 4. Summary presensi
  const cnt = (s) => presensiRows.filter((p) => p.STATUS === s).length;
  const totalAlpa      = cnt("Alpa");
  const totalTerlambat = presensiRows.filter((p) => isTruthy(p.IS_TERLAMBAT)).length;
  const totalPulangAwal= presensiRows.filter((p) => isTruthy(p.IS_PULANG_AWAL)).length;
  const totalJamKerjaPresensi = presensiRows.reduce(
    (s, p) => s + jamPresensiToDecimal(p.JAM_MASUK, p.JAM_KELUAR), 0
  );

  // 5. Summary logbook
  const totalOutput       = logbookRows.reduce((s, l) => s + parseFloat(l.JUMLAH_OUTPUT || 0), 0);
  const totalJamProduktif = logbookRows.reduce((s, l) => s + jamKerjaToDecimal(l.JAM_KERJA), 0);
  const batchList         = [...new Set(logbookRows.map((l) => l.BATCH_ID).filter(Boolean))];

  // 6. Daily map — gabungkan presensi & logbook per hari
  const dailyMap = {};

  for (const p of presensiRows) {
    const key = new Date(p.TANGGAL).toISOString().split("T")[0];
    dailyMap[key] = {
      tanggal : p.TANGGAL,
      presensi: p,
      logbook : [],
      summary : {
        jam_kerja_presensi: jamPresensiToDecimal(p.JAM_MASUK, p.JAM_KELUAR),
        jumlah_logbook: 0, total_output: 0, jam_produktif: 0,
      },
    };
  }

  for (const l of logbookRows) {
    const key = new Date(l.TANGGAL).toISOString().split("T")[0];
    if (!dailyMap[key]) {
      dailyMap[key] = {
        tanggal : l.TANGGAL,
        presensi: null,
        logbook : [],
        summary : { jam_kerja_presensi: 0, jumlah_logbook: 0, total_output: 0, jam_produktif: 0 },
      };
    }
    dailyMap[key].logbook.push(l);
    dailyMap[key].summary.jumlah_logbook  += 1;
    dailyMap[key].summary.total_output    += parseFloat(l.JUMLAH_OUTPUT || 0);
    dailyMap[key].summary.jam_produktif   += jamKerjaToDecimal(l.JAM_KERJA);
  }

  const totalHariKerja = Math.max(presensiRows.length, logbookRows.length > 0 ? 1 : 0);

  return {
    karyawan: {
      KARYAWAN_ID : karyawan.KARYAWAN_ID,
      NAMA        : karyawan.NAMA,
      NIK         : karyawan.NIK,
      DEPARTEMEN  : karyawan.DEPARTEMEN,
      JABATAN     : karyawan.JABATAN,
      EMAIL       : karyawan.EMAIL,
      SHIFT       : karyawan.SHIFT,
      FOTO        : karyawan.FOTO,
      STATUS_AKTIF: karyawan.STATUS_AKTIF,
    },
    periode: {
      start     : sd,
      end       : ed,
      total_hari: Object.keys(dailyMap).length,
    },
    summary: {
      presensi: {
        total_hari_kerja: presensiRows.length,
        hadir      : cnt("Hadir"),
        alpa       : totalAlpa,
        izin       : cnt("Izin"),
        sakit      : cnt("Sakit"),
        cuti       : cnt("Cuti"),
        dinas_luar : cnt("Dinas Luar"),
        terlambat  : totalTerlambat,
        pulang_awal: totalPulangAwal,
        total_jam_kerja: parseFloat(totalJamKerjaPresensi.toFixed(2)),
      },
      produktivitas: {
        total_logbook_approved: logbookRows.length,
        total_output          : parseFloat(totalOutput.toFixed(2)),
        total_jam_produktif   : parseFloat(totalJamProduktif.toFixed(2)),
        batch_dikerjakan      : batchList.length,
        batch_list            : batchList,
      },
      performance_score: hitungScore({ totalAlpa, totalTerlambat, totalPulangAwal, totalOutput, totalHariKerja }),
    },
    daily_data: Object.values(dailyMap).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)),
  };
};

// ─────────────────────────────────────────────────────────────
// REKAP SEMUA KARYAWAN — 2 bulk query, tidak N+1
// ─────────────────────────────────────────────────────────────
export const getRekapitulasiAll = async (startDate, endDate, departemen = null) => {
  const sd = toDateStr(startDate);
  const ed = toDateStr(endDate);
  if (!sd || !ed) throw new Error("Format tanggal tidak valid");

  let q = db("master_karyawan")
    .where("STATUS_AKTIF", "Aktif")
    .select("KARYAWAN_ID", "NAMA", "NIK", "DEPARTEMEN", "JABATAN", "EMAIL", "FOTO");
  if (departemen) q = q.where("DEPARTEMEN", departemen);

  const karyawanList = await q;
  if (!karyawanList.length) return [];

  const ids = karyawanList.map((k) => k.KARYAWAN_ID);

  const [allPresensi, allLogbook] = await Promise.all([
    db("master_presensi")
      .whereIn("KARYAWAN_ID", ids)
      .whereBetween("TANGGAL", [sd, ed])
      .select("ID", "KARYAWAN_ID", "TANGGAL", "STATUS",
        "JAM_MASUK", "JAM_KELUAR", "IS_TERLAMBAT", "IS_PULANG_AWAL")
      .orderBy("TANGGAL", "asc"),

    db("logbook_pekerjaan as l")
      .leftJoin("master_batch as b", "l.BATCH_ID", "b.BATCH_ID")
      .whereIn("l.KARYAWAN_ID", ids)
      .where("l.STATUS", "Approved")
      .whereBetween("l.TANGGAL", [sd, ed])
      .select("l.KARYAWAN_ID", "l.LOGBOOK_ID", "l.BATCH_ID",
        "l.TANGGAL", "l.JAM_KERJA", "l.JUMLAH_OUTPUT",
        "l.AKTIVITAS", "b.NAMA_BATCH")
      .orderBy("l.TANGGAL", "asc"),
  ]);

  // Group by karyawan_id
  const pMap = {};
  const lMap = {};
  for (const p of allPresensi) {
    (pMap[p.KARYAWAN_ID] ??= []).push(p);
  }
  for (const l of allLogbook) {
    (lMap[l.KARYAWAN_ID] ??= []).push(l);
  }

  const results = karyawanList.map((k) => {
    const pRows = pMap[k.KARYAWAN_ID] || [];
    const lRows = lMap[k.KARYAWAN_ID] || [];

    const cnt = (s) => pRows.filter((p) => p.STATUS === s).length;
    const totalAlpa      = cnt("Alpa");
    const totalTerlambat = pRows.filter((p) => isTruthy(p.IS_TERLAMBAT)).length;
    const totalPulangAwal= pRows.filter((p) => isTruthy(p.IS_PULANG_AWAL)).length;
    const totalJamKerja  = pRows.reduce((s, p) => s + jamPresensiToDecimal(p.JAM_MASUK, p.JAM_KELUAR), 0);
    const totalOutput    = lRows.reduce((s, l) => s + parseFloat(l.JUMLAH_OUTPUT || 0), 0);
    const totalJamProd   = lRows.reduce((s, l) => s + jamKerjaToDecimal(l.JAM_KERJA), 0);
    const batchList      = [...new Set(lRows.map((l) => l.BATCH_ID).filter(Boolean))];

    // Daily map
    const dailyMap = {};
    for (const p of pRows) {
      const key = new Date(p.TANGGAL).toISOString().split("T")[0];
      dailyMap[key] = {
        tanggal: p.TANGGAL, presensi: p, logbook: [],
        summary: { jam_kerja_presensi: jamPresensiToDecimal(p.JAM_MASUK, p.JAM_KELUAR), jumlah_logbook: 0, total_output: 0, jam_produktif: 0 },
      };
    }
    for (const l of lRows) {
      const key = new Date(l.TANGGAL).toISOString().split("T")[0];
      if (!dailyMap[key]) {
        dailyMap[key] = {
          tanggal: l.TANGGAL, presensi: null, logbook: [],
          summary: { jam_kerja_presensi: 0, jumlah_logbook: 0, total_output: 0, jam_produktif: 0 },
        };
      }
      dailyMap[key].logbook.push(l);
      dailyMap[key].summary.jumlah_logbook  += 1;
      dailyMap[key].summary.total_output    += parseFloat(l.JUMLAH_OUTPUT || 0);
      dailyMap[key].summary.jam_produktif   += jamKerjaToDecimal(l.JAM_KERJA);
    }

    const totalHariKerja = Math.max(pRows.length, lRows.length > 0 ? 1 : 0);

    return {
      karyawan: { KARYAWAN_ID: k.KARYAWAN_ID, NAMA: k.NAMA, NIK: k.NIK, DEPARTEMEN: k.DEPARTEMEN, JABATAN: k.JABATAN, EMAIL: k.EMAIL, FOTO: k.FOTO },
      periode : { start: sd, end: ed },
      summary : {
        presensi: {
          total_hari_kerja: pRows.length,
          hadir      : cnt("Hadir"),
          alpa       : totalAlpa,
          izin       : cnt("Izin"),
          sakit      : cnt("Sakit"),
          cuti       : cnt("Cuti"),
          dinas_luar : cnt("Dinas Luar"),
          terlambat  : totalTerlambat,
          pulang_awal: totalPulangAwal,
          total_jam_kerja: parseFloat(totalJamKerja.toFixed(2)),
        },
        produktivitas: {
          total_logbook_approved: lRows.length,
          total_output          : parseFloat(totalOutput.toFixed(2)),
          total_jam_produktif   : parseFloat(totalJamProd.toFixed(2)),
          batch_dikerjakan      : batchList.length,
          batch_list            : batchList,
        },
        performance_score: hitungScore({ totalAlpa, totalTerlambat, totalPulangAwal, totalOutput, totalHariKerja }),
      },
      daily_data: Object.values(dailyMap).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)),
    };
  });

  return results.sort((a, b) => b.summary.performance_score - a.summary.performance_score);
};

// ─────────────────────────────────────────────────────────────
// RANKING
// ─────────────────────────────────────────────────────────────
export const getPerformanceRanking = async (startDate, endDate, departemen = null) => {
  const rekap = await getRekapitulasiAll(startDate, endDate, departemen);

  return rekap.map((item, i) => ({
    rank               : i + 1,
    karyawan_id        : item.karyawan.KARYAWAN_ID,
    nama               : item.karyawan.NAMA,
    departemen         : item.karyawan.DEPARTEMEN,
    jabatan            : item.karyawan.JABATAN,
    foto               : item.karyawan.FOTO,
    performance_score  : item.summary.performance_score,
    total_output       : item.summary.produktivitas.total_output,
    total_hadir        : item.summary.presensi.hadir,
    total_alpa         : item.summary.presensi.alpa,
    total_terlambat    : item.summary.presensi.terlambat,
    total_logbook      : item.summary.produktivitas.total_logbook_approved,
    total_jam_produktif: item.summary.produktivitas.total_jam_produktif,
  }));
};

// ─────────────────────────────────────────────────────────────
// EXPORT EXCEL
// ─────────────────────────────────────────────────────────────
export const exportRekapitulasiToExcel = async (karyawanId, startDate, endDate) => {
  const rekap = await getRekapitulasiKinerja(karyawanId, startDate, endDate);

  return {
    karyawan: rekap.karyawan,
    periode : rekap.periode,
    summary : rekap.summary,
    data: rekap.daily_data.map((day) => ({
      Tanggal           : new Date(day.tanggal).toLocaleDateString("id-ID"),
      Status_Kehadiran  : day.presensi?.STATUS || "-",
      Jam_Masuk         : day.presensi?.JAM_MASUK  ? String(day.presensi.JAM_MASUK).substring(0, 5)  : "-",
      Jam_Keluar        : day.presensi?.JAM_KELUAR ? String(day.presensi.JAM_KELUAR).substring(0, 5) : "-",
      Jam_Kerja_Presensi: day.summary.jam_kerja_presensi,
      Terlambat         : isTruthy(day.presensi?.IS_TERLAMBAT)  ? "Ya" : "Tidak",
      Pulang_Awal       : isTruthy(day.presensi?.IS_PULANG_AWAL) ? "Ya" : "Tidak",
      Jumlah_Logbook    : day.summary.jumlah_logbook,
      Total_Output      : day.summary.total_output,
      Jam_Produktif     : parseFloat(day.summary.jam_produktif.toFixed(2)),
    })),
  };
};