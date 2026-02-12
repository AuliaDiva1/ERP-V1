// migrations/XXXXXX_create_batch_karyawan.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("batch_karyawan", (table) => {
    // Primary Key
    table.increments("ID").primary();

    // Relasi ke Batch
    table.string("BATCH_ID", 20).notNullable();
    table.foreign("BATCH_ID").references("BATCH_ID").inTable("master_batch")
      .onUpdate("CASCADE").onDelete("CASCADE");

    // Relasi ke Karyawan
    table.string("KARYAWAN_ID", 20).notNullable();
    table.foreign("KARYAWAN_ID").references("KARYAWAN_ID").inTable("master_karyawan")
      .onUpdate("CASCADE").onDelete("CASCADE");

    // Role dalam batch
    table.enu("ROLE_DALAM_BATCH", ["Leader", "Member"]).notNullable().defaultTo("Member");

    // Status
    table.enu("STATUS", ["Aktif", "Selesai", "Keluar"]).notNullable().defaultTo("Aktif");

    // Audit
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Unique constraint: 1 karyawan tidak bisa assign 2x di batch yang sama
    table.unique(["BATCH_ID", "KARYAWAN_ID"]);

    // Index
    table.index(["BATCH_ID", "STATUS"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("batch_karyawan");
}