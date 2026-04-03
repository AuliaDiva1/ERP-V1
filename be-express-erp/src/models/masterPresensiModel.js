import { db } from "../core/config/knex.js";

/* ============================================================
 * HELPER: Hitung jarak GPS (Haversine formula) → meter
 * ============================================================ */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R    = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ============================================================
 * HELPER: Konversi "HH:MM" atau "HH:MM:SS" → total menit
 * Aman untuk perbandingan numerik, menghindari string comparison
 * ============================================================ */
const toMenit = (timeStr) => {
  if (!timeStr) return null;
  const parts = String(timeStr).split(":");
  const jam   = parseInt(parts[0], 10) || 0;
  const menit = parseInt(parts[1], 10) || 0;
  return jam * 60 + menit;
};

/* ============================================================
 * HELPER: Ambil setting perusahaan
 * Fallback jam kerja: JAM_MASUK_NORMAL, JAM_PULANG_NORMAL
 * ============================================================ */
export const getSettingPerusahaan = async () => {
  return db("master_perusahaan")
    .select(
      "LAT_KANTOR",
      "LON_KANTOR",
      "RADIUS_METER",
      "NAMA_PERUSAHAAN",
      "JAM_MASUK_NORMAL",   // fallback jika karyawan tidak punya shift
      "JAM_PULANG_NORMAL"   // fallback jika karyawan tidak punya shift
    )
    .first();
};

/* ============================================================
 * HELPER: Ambil shift karyawan
 * Jika karyawan tidak punya shift → return null (pakai fallback)
 * ============================================================ */
const getShiftKaryawan = async (karyawanId) => {
  const karyawan = await db("master_karyawan")
    .select("SHIFT")
    .where("KARYAWAN_ID", karyawanId)
    .first();
  if (!karyawan?.SHIFT) return null;
  return db("master_shift")
    .where("NAMA_SHIFT", karyawan.SHIFT)
    .where("STATUS", "Aktif")
    .first();
};

/* ============================================================
 * HELPER: Resolve jam masuk & jam pulang yang berlaku
 * Prioritas: shift karyawan → fallback master_perusahaan
 * ============================================================ */
const resolveJamKerja = (shift, setting) => {
  const jamMasuk  = shift?.JAM_MASUK  || setting?.JAM_MASUK_NORMAL  || null;
  const jamPulang = shift?.JAM_KELUAR || setting?.JAM_PULANG_NORMAL || null;
  return { jamMasuk, jamPulang };
};

/* ============================================================
 * HELPER: Deteksi shift malam (JAM_KELUAR < JAM_MASUK)
 * Contoh: Malam 23:00 → 07:00 = lintas tengah malam
 * ============================================================ */
const isShiftMalam = (jamMasuk, jamKeluar) => {
  const mMasuk  = toMenit(jamMasuk);
  const mKeluar = toMenit(jamKeluar);
  if (mMasuk === null || mKeluar === null) return false;
  return mKeluar < mMasuk;
};

/* ============================================================
 * 1. GET LIST KARYAWAN AKTIF
 * ============================================================ */
export const getListKaryawan = async () => {
  return db("master_karyawan")
    .select("KARYAWAN_ID", "NAMA", "JABATAN", "DEPARTEMEN", "SHIFT")
    .where("STATUS_AKTIF", "Aktif")
    .orderBy("NAMA", "asc");
};

/* ============================================================
 * 2. CEK PRESENSI HARI INI
 * ============================================================ */
export const getTodayPresensi = async (karyawanId, tanggal) => {
  return db("master_presensi")
    .where({ KARYAWAN_ID: karyawanId, TANGGAL: tanggal })
    .first();
};

/* ============================================================
 * 3. GET BY ID
 * ============================================================ */
export const getPresensiById = async (id) => {
  return db("master_presensi").where("ID", id).first();
};

/* ============================================================
 * 4. ABSEN MASUK
 *
 *  Alur validasi:
 *  1. Geofencing  → RADIUS_METER dari master_perusahaan
 *  2. Terlambat   → jam masuk shift karyawan
 *                   fallback → JAM_MASUK_NORMAL master_perusahaan
 *  3. Jika tidak ada keduanya → IS_TERLAMBAT = 0
 * ============================================================ */
export const checkIn = async (payload) => {
  const [setting, shift] = await Promise.all([
    getSettingPerusahaan(),
    getShiftKaryawan(payload.KARYAWAN_ID),
  ]);

  // ── 1. Validasi Geofencing ────────────────────────────────
  if (
    setting?.LAT_KANTOR &&
    setting?.LON_KANTOR &&
    payload.LAT_INPUT &&
    payload.LON_INPUT
  ) {
    const radius = setting.RADIUS_METER || 500;
    const jarak  = calculateDistance(
      parseFloat(payload.LAT_INPUT),
      parseFloat(payload.LON_INPUT),
      parseFloat(setting.LAT_KANTOR),
      parseFloat(setting.LON_KANTOR)
    );
    if (jarak !== null && jarak > radius) {
      throw new Error(
        `GEOFENCE_ERROR: Anda berada ${Math.round(jarak)}m dari kantor. ` +
        `Maksimal radius absen: ${radius}m. Pastikan Anda berada di lokasi kerja.`
      );
    }
  }

  // ── 2. Deteksi Terlambat (perbandingan numerik, bukan string) ──
  let isTerlambat = 0;
  const { jamMasuk: jamMasukAcuan } = resolveJamKerja(shift, setting);

  if (jamMasukAcuan && payload.JAM_MASUK) {
    const menitAbsen = toMenit(payload.JAM_MASUK);
    const menitAcuan = toMenit(jamMasukAcuan);
    if (menitAbsen !== null && menitAcuan !== null) {
      // Toleransi 0 menit — bisa ubah jadi > menitAcuan + TOLERANSI_MENIT
      isTerlambat = menitAbsen > menitAcuan ? 1 : 0;
    }
  }

  // ── 3. Insert data presensi masuk ────────────────────────────
  const finalData = {
    KODE_PRESENSI:  payload.KODE_PRESENSI || `PRS-${Date.now()}`,
    KARYAWAN_ID:    payload.KARYAWAN_ID,
    TANGGAL:        payload.TANGGAL,
    JAM_MASUK:      payload.JAM_MASUK,
    LOKASI_MASUK:   payload.LOKASI_MASUK  || "Input Admin",
    FOTO_MASUK:     payload.FOTO_MASUK    || null,
    STATUS:         payload.STATUS        || "Hadir",
    KETERANGAN:     payload.KETERANGAN    || "Input via Admin",
    SHIFT_SNAPSHOT: shift?.NAMA_SHIFT     || null, // simpan nama shift saat absen
    IS_TERLAMBAT:   isTerlambat,
    IS_PULANG_AWAL: 0,
    created_at:     db.fn.now(),
    updated_at:     db.fn.now(),
  };

  const [newId] = await db("master_presensi").insert(finalData);
  return db("master_presensi").where("ID", newId).first();
};

/* ============================================================
 * 5. ABSEN PULANG
 *
 *  Alur validasi:
 *  1. Geofencing   → RADIUS_METER dari master_perusahaan
 *  2. Pulang Awal  → jam pulang shift karyawan
 *                    fallback → JAM_PULANG_NORMAL master_perusahaan
 *  3. Shift malam (lintas tengah malam) → skip cek pulang awal
 *     karena jam pulang numeriknya lebih kecil dari jam masuk
 * ============================================================ */
export const checkOut = async (karyawanId, tanggal, data) => {
  const [setting, shift] = await Promise.all([
    getSettingPerusahaan(),
    getShiftKaryawan(karyawanId),
  ]);

  // ── 1. Validasi Geofencing ────────────────────────────────
  if (
    setting?.LAT_KANTOR &&
    setting?.LON_KANTOR &&
    data.LAT_INPUT &&
    data.LON_INPUT
  ) {
    const radius = setting.RADIUS_METER || 500;
    const jarak  = calculateDistance(
      parseFloat(data.LAT_INPUT),
      parseFloat(data.LON_INPUT),
      parseFloat(setting.LAT_KANTOR),
      parseFloat(setting.LON_KANTOR)
    );
    if (jarak !== null && jarak > radius) {
      throw new Error(
        `GEOFENCE_ERROR: Anda berada ${Math.round(jarak)}m dari kantor. ` +
        `Maksimal radius absen: ${radius}m.`
      );
    }
  }

  // ── 2. Deteksi Pulang Awal (perbandingan numerik) ─────────
  let isPulangAwal = 0;
  const { jamMasuk: jamMasukAcuan, jamPulang: jamPulangAcuan } = resolveJamKerja(shift, setting);

  if (jamPulangAcuan && data.JAM_KELUAR) {
    // Skip pengecekan jika shift malam (lintas tengah malam)
    // karena menitKeluar < menitMasuk secara numerik
    const shiftMalam = isShiftMalam(jamMasukAcuan, jamPulangAcuan);

    if (!shiftMalam) {
      const menitAbsen = toMenit(data.JAM_KELUAR);
      const menitAcuan = toMenit(jamPulangAcuan);
      if (menitAbsen !== null && menitAcuan !== null) {
        isPulangAwal = menitAbsen < menitAcuan ? 1 : 0;
      }
    }
    // Untuk shift malam: pulang awal lebih kompleks (butuh konteks lintas hari)
    // Di-skip dulu, bisa dikembangkan dengan logika +24jam jika diperlukan
  }

  // ── 3. Update data presensi pulang ───────────────────────
  await db("master_presensi")
    .where({ KARYAWAN_ID: karyawanId, TANGGAL: tanggal })
    .update({
      JAM_KELUAR:     data.JAM_KELUAR,
      LOKASI_KELUAR:  data.LOKASI_KELUAR  || "Input Admin",
      FOTO_KELUAR:    data.FOTO_KELUAR    || null,
      IS_PULANG_AWAL: isPulangAwal,
      updated_at:     db.fn.now(),
    });

  return getTodayPresensi(karyawanId, tanggal);
};

/* ============================================================
 * 6. GET REKAP — include info shift karyawan
 * ============================================================ */
export const getAllPresensi = async (params = {}) => {
  const startDate  = params.start_date  || params.startDate  || null;
  const endDate    = params.end_date    || params.endDate    || null;
  const karyawanId = params.karyawan_id || params.karyawanId || null;

  const query = db("master_presensi as p")
    .leftJoin("master_karyawan as k", "p.KARYAWAN_ID", "k.KARYAWAN_ID")
    .leftJoin("master_shift as s",    "k.SHIFT",       "s.NAMA_SHIFT")
    .select(
      "p.*",
      "k.NAMA        as NAMA_KARYAWAN",
      "k.JABATAN     as NAMA_JABATAN",
      "k.DEPARTEMEN",
      "k.SHIFT       as NAMA_SHIFT",
      "s.JAM_MASUK   as SHIFT_JAM_MASUK",
      "s.JAM_KELUAR  as SHIFT_JAM_KELUAR",
      "s.HARI_KERJA  as SHIFT_HARI_KERJA"
    );

  if (startDate && endDate) query.whereBetween("p.TANGGAL", [startDate, endDate]);
  if (karyawanId)           query.where("p.KARYAWAN_ID", karyawanId);

  return query
    .orderBy("p.TANGGAL",   "desc")
    .orderBy("p.JAM_MASUK", "desc");
};

/* ============================================================
 * 7. DELETE
 * ============================================================ */
export const deletePresensi = async (id) => {
  return db("master_presensi").where("ID", id).del();
};
