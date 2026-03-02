/**
 * Migration: Menambahkan kolom Geofencing dan Jam Kerja
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.table("master_perusahaan", (table) => {
    // Menambahkan kolom koordinat (Decimal 10,8 dan 11,8 adalah standar GPS)
    table.decimal("LAT_KANTOR", 10, 8).nullable().after("ALAMAT_KANTOR");
    table.decimal("LON_KANTOR", 11, 8).nullable().after("LAT_KANTOR");
    
    // Radius dalam meter (default 500m)
    table.integer("RADIUS_METER").defaultTo(500).after("LON_KANTOR");
    
    // Jam kerja default untuk validasi Terlambat & Pulang Awal
    table.time("JAM_MASUK_NORMAL").defaultTo("08:00").after("RADIUS_METER");
    table.time("JAM_PULANG_NORMAL").defaultTo("17:00").after("JAM_MASUK_NORMAL");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.table("master_perusahaan", (table) => {
    table.dropColumns(
      "LAT_KANTOR", 
      "LON_KANTOR", 
      "RADIUS_METER", 
      "JAM_MASUK_NORMAL", 
      "JAM_PULANG_NORMAL"
    );
  });
}