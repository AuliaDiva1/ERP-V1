/**
 * Migration: Create Tabel Master Komponen Gaji
 * Override gaji per individu karyawan
 * Semua kolom nullable — kalau NULL → pakai dari master_gaji_jabatan
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_komponen_gaji", (table) => {
    // 1. Primary Key
    table.increments("ID").primary();

    // 2. Relasi ke Master Karyawan (1 row per karyawan)
    table.string("KARYAWAN_ID", 20)
      .notNullable()
      .unique()
      .references("KARYAWAN_ID")
      .inTable("master_karyawan")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    // 3. Override Komponen Pendapatan (nullable = pakai default jabatan)
    table.decimal("GAJI_POKOK", 15, 2).nullable();
    table.decimal("TUNJANGAN_TRANSPORT", 15, 2).nullable();
    table.decimal("TUNJANGAN_MAKAN", 15, 2).nullable();
    table.decimal("TUNJANGAN_JABATAN", 15, 2).nullable();
    table.decimal("TUNJANGAN_LAINNYA", 15, 2).nullable();

    // 4. Override Komponen Potongan (nullable = pakai default jabatan)
    table.decimal("POTONGAN_TERLAMBAT_PER_MENIT", 10, 2).nullable();
    table.decimal("POTONGAN_ALPA_PER_HARI", 10, 2).nullable();

    // 5. Override BPJS & Pajak (nullable = pakai default jabatan)
    table.decimal("BPJS_KESEHATAN_PERSEN", 5, 2).nullable();
    table.decimal("BPJS_TK_PERSEN", 5, 2).nullable();
    table.boolean("IS_KENA_PPH21").nullable();

    // 6. Override Bonus Kinerja (nullable = pakai default jabatan)
    table.decimal("BONUS_SCORE_90", 5, 2).nullable();
    table.decimal("BONUS_SCORE_75", 5, 2).nullable();
    table.decimal("BONUS_SCORE_60", 5, 2).nullable();

    // 7. Catatan override
    table.text("CATATAN").nullable();

    // 8. Metadata
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // 9. Index
    table.index("KARYAWAN_ID");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_komponen_gaji");
}