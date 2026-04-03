import { db } from "../core/config/knex.js";

/* ============================================================
 * 1. GET ALL SHIFT
 * ============================================================ */
export const getAllShift = async () => {
  return db("master_shift").orderBy("JAM_MASUK", "asc");
};

/* ============================================================
 * 2. GET SHIFT AKTIF (untuk dropdown form karyawan)
 * ============================================================ */
export const getShiftAktif = async () => {
  return db("master_shift")
    .where("STATUS", "Aktif")
    .orderBy("JAM_MASUK", "asc");
};

/* ============================================================
 * 3. GET BY ID
 * ============================================================ */
export const getShiftById = async (id) => {
  return db("master_shift").where("ID", id).first();
};

/* ============================================================
 * 4. GET BY NAMA (lookup dari SHIFT karyawan)
 * ============================================================ */
export const getShiftByNama = async (namaShift) => {
  return db("master_shift").where("NAMA_SHIFT", namaShift).first();
};

/* ============================================================
 * 5. CREATE
 * ============================================================ */
export const createShift = async (data) => {
  const [newId] = await db("master_shift").insert({
    NAMA_SHIFT: data.NAMA_SHIFT,
    JAM_MASUK:  data.JAM_MASUK,
    JAM_KELUAR: data.JAM_KELUAR,
    HARI_KERJA: data.HARI_KERJA || "Senin,Selasa,Rabu,Kamis,Jumat,Sabtu",
    STATUS:     data.STATUS     || "Aktif",
  });
  return getShiftById(newId);
};

/* ============================================================
 * 6. UPDATE
 * ============================================================ */
export const updateShift = async (id, data) => {
  await db("master_shift").where("ID", id).update({
    NAMA_SHIFT: data.NAMA_SHIFT,
    JAM_MASUK:  data.JAM_MASUK,
    JAM_KELUAR: data.JAM_KELUAR,
    HARI_KERJA: data.HARI_KERJA || "Senin,Selasa,Rabu,Kamis,Jumat,Sabtu",
    STATUS:     data.STATUS     || "Aktif",
    updated_at: db.fn.now(),
  });
  return getShiftById(id);
};

/* ============================================================
 * 7. DELETE — proteksi jika shift masih dipakai karyawan
 * ============================================================ */
export const deleteShift = async (id) => {
  const shift = await getShiftById(id);
  if (!shift) throw new Error("Shift tidak ditemukan");

  const { total } = await db("master_karyawan")
    .where("SHIFT", shift.NAMA_SHIFT)
    .count("KARYAWAN_ID as total")
    .first();

  if (parseInt(total) > 0) {
    throw new Error(
      `SHIFT_IN_USE: Shift "${shift.NAMA_SHIFT}" masih digunakan oleh ${total} karyawan. Pindahkan karyawan ke shift lain terlebih dahulu.`
    );
  }

  return db("master_shift").where("ID", id).del();
};
