/**
 * Migration: Create Tabel Master Gaji Jabatan
 * Gaji default per jabatan — dipakai sebagai template payroll
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_gaji_jabatan", (table) => {
    // 1. Primary Key
    table.increments("ID").primary();

    // 2. Identitas Jabatan
    table.string("JABATAN", 100).notNullable();
    table.string("DEPARTEMEN", 100).nullable();

    // 3. Komponen Pendapatan
    table.decimal("GAJI_POKOK", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_TRANSPORT", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_MAKAN", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_JABATAN", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_LAINNYA", 15, 2).notNullable().defaultTo(0);

    // 4. Komponen Potongan
    table.decimal("POTONGAN_TERLAMBAT_PER_MENIT", 10, 2).notNullable().defaultTo(500);
    table.decimal("POTONGAN_ALPA_PER_HARI", 10, 2).notNullable().defaultTo(0);

    // 5. BPJS & Pajak (dalam persen)
    table.decimal("BPJS_KESEHATAN_PERSEN", 5, 2).notNullable().defaultTo(1.00);
    table.decimal("BPJS_TK_PERSEN", 5, 2).notNullable().defaultTo(2.00);
    table.boolean("IS_KENA_PPH21").notNullable().defaultTo(false);

    // 6. Bonus Kinerja berdasarkan Performance Score
    // Score 90-100 → bonus X% dari gaji pokok
    table.decimal("BONUS_SCORE_90", 5, 2).notNullable().defaultTo(15.00);
    // Score 75-89  → bonus X% dari gaji pokok
    table.decimal("BONUS_SCORE_75", 5, 2).notNullable().defaultTo(10.00);
    // Score 60-74  → bonus X% dari gaji pokok
    table.decimal("BONUS_SCORE_60", 5, 2).notNullable().defaultTo(5.00);
    // Score < 60   → tidak ada bonus

    // 7. Status
    table.enum("STATUS", ["Aktif", "Nonaktif"]).notNullable().defaultTo("Aktif");

    // 8. Metadata
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // 9. Constraint — kombinasi jabatan + departemen harus unik
    table.unique(["JABATAN", "DEPARTEMEN"], "uniq_jabatan_departemen");
    table.index("JABATAN");
    table.index("STATUS");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_gaji_jabatan");
}