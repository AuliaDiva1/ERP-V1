/**
 * Migration: Tambah kolom SHIFT_SNAPSHOT ke master_presensi
 *
 * Kenapa perlu SHIFT_SNAPSHOT?
 * Jika shift karyawan diubah di kemudian hari, rekap presensi lama
 * tetap mencerminkan shift yang berlaku SAAT karyawan absen.
 * Ini mencegah data historis "berubah sendiri" karena perubahan master shift.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.table("master_presensi", (table) => {
    // Nama shift saat absen (snapshot, tidak ikut berubah jika master shift diubah)
    table
      .string("SHIFT_SNAPSHOT", 20)
      .nullable()
      .after("KETERANGAN")
      .comment("Nama shift karyawan saat absen — snapshot, tidak berubah jika master shift diubah");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table("master_presensi", (table) => {
    table.dropColumn("SHIFT_SNAPSHOT");
  });
}