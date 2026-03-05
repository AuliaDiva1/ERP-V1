/**
 * Migration: Buat tabel master_shift + hubungkan ke master_karyawan.SHIFT
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Buat tabel master_shift
  await knex.schema.createTable("master_shift", (table) => {
    table.increments("ID").primary();
    table.string("NAMA_SHIFT", 20).notNullable().unique();
    table.time("JAM_MASUK").notNullable().comment("Jam masuk standar, misal 07:00:00");
    table.time("JAM_KELUAR").notNullable().comment("Jam keluar standar, misal 15:00:00");
    table
      .string("HARI_KERJA", 100)
      .notNullable()
      .defaultTo("Senin,Selasa,Rabu,Kamis,Jumat,Sabtu")
      .comment("Hari kerja dipisah koma");
    table.enum("STATUS", ["Aktif", "Nonaktif"]).notNullable().defaultTo("Aktif");
    table.timestamps(true, true);
  });

  // 2. Insert data shift default — sesuaikan jam sebelum migrate!
  await knex("master_shift").insert([
    { NAMA_SHIFT: "Pagi",  JAM_MASUK: "07:00:00", JAM_KELUAR: "15:00:00", HARI_KERJA: "Senin,Selasa,Rabu,Kamis,Jumat,Sabtu", STATUS: "Aktif" },
    { NAMA_SHIFT: "Siang", JAM_MASUK: "15:00:00", JAM_KELUAR: "23:00:00", HARI_KERJA: "Senin,Selasa,Rabu,Kamis,Jumat,Sabtu", STATUS: "Aktif" },
    { NAMA_SHIFT: "Malam", JAM_MASUK: "23:00:00", JAM_KELUAR: "07:00:00", HARI_KERJA: "Senin,Selasa,Rabu,Kamis,Jumat,Sabtu", STATUS: "Aktif" },
  ]);

  // 3. Ubah SHIFT di master_karyawan dari ENUM → VARCHAR supaya bisa FK
  await knex.schema.table("master_karyawan", (table) => {
    table.string("SHIFT", 20).nullable().alter();
  });

  // 4. Tambah FK master_karyawan.SHIFT → master_shift.NAMA_SHIFT
  await knex.schema.table("master_karyawan", (table) => {
    table
      .foreign("SHIFT")
      .references("NAMA_SHIFT")
      .inTable("master_shift")
      .onUpdate("CASCADE")   // nama shift diubah → otomatis update di karyawan
      .onDelete("SET NULL"); // shift dihapus → SHIFT karyawan jadi NULL
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Balik urutan: hapus FK dulu, baru drop tabel
  await knex.schema.table("master_karyawan", (table) => {
    table.dropForeign("SHIFT");
    table.enum("SHIFT", ["Pagi", "Siang", "Malam"]).nullable().alter();
  });

  await knex.schema.dropTableIfExists("master_shift");
}
