import { db } from "../core/config/knex.js";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getTodayPresensi = async (karyawanId, tanggal) => {
  return await db("master_presensi").where({ KARYAWAN_ID: karyawanId, TANGGAL: tanggal }).first();
};

export const checkIn = async (data) => {
  const { LAT_USER, LON_USER, ...insertData } = data;
  
  // Mengambil setting perusahaan yang paling terakhir ditambahkan
  const setting = await db("master_perusahaan").orderBy("ID_PERUSAHAAN", "desc").first();
  
  if (!setting) throw new Error("Setting perusahaan tidak ditemukan.");

  const jarakMeter = calculateDistance(LAT_USER, LON_USER, setting.LAT_KANTOR, setting.LON_KANTOR);
  if (jarakMeter > setting.RADIUS_METER) {
    throw new Error(`Posisi di luar radius kantor.`);
  }

  const isTerlambat = insertData.JAM_MASUK > setting.JAM_MASUK_NORMAL;
  const count = await db("master_presensi").count("ID as total").first();
  const kode = `PRS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${(parseInt(count.total) + 1).toString().padStart(4, "0")}`;

  const [id] = await db("master_presensi").insert({
    KODE_PRESENSI: kode,
    ...insertData,
    IS_TERLAMBAT: isTerlambat,
    created_at: db.fn.now(),
    updated_at: db.fn.now(),
  });

  return await db("master_presensi").where("ID", id).first();
};

export const checkOut = async (karyawanId, tanggal, data) => {
  const { LAT_USER, LON_USER, ...updateData } = data;
  
  // Mengambil setting perusahaan yang paling terakhir ditambahkan
  const setting = await db("master_perusahaan").orderBy("ID_PERUSAHAAN", "desc").first();
  
  const jarakMeter = calculateDistance(LAT_USER, LON_USER, setting.LAT_KANTOR, setting.LON_KANTOR);
  if (jarakMeter > setting.RADIUS_METER) {
    throw new Error(`Posisi di luar radius kantor.`);
  }

  const isPulangAwal = updateData.JAM_KELUAR < setting.JAM_PULANG_NORMAL;
  await db("master_presensi").where({ KARYAWAN_ID: karyawanId, TANGGAL: tanggal }).update({
    ...updateData,
    IS_PULANG_AWAL: isPulangAwal,
    updated_at: db.fn.now(),
  });

  return await getTodayPresensi(karyawanId, tanggal);
};

export const getAllPresensi = async (filters = {}) => {
  const query = db("master_presensi as p")
    .leftJoin("master_karyawan as k", "p.KARYAWAN_ID", "k.KARYAWAN_ID")
    .select("p.*", "k.NAMA_KARYAWAN", "k.JABATAN");

  if (filters.startDate && filters.endDate) query.whereBetween("p.TANGGAL", [filters.startDate, filters.endDate]);
  if (filters.karyawanId) query.where("p.KARYAWAN_ID", filters.karyawanId);

  return await query.orderBy("p.TANGGAL", "desc").orderBy("p.JAM_MASUK", "desc");
};

export const deletePresensi = async (id) => {
  return await db("master_presensi").where("ID", id).del();
};