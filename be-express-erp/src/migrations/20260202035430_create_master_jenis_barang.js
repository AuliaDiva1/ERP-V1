/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_jenis_barang", (table) => {
    table.increments("ID").primary();
    
    table.string("KODE_JENIS", 20).notNullable().unique(); // Contoh: ELK, ATK
    table.string("NAMA_JENIS", 100).notNullable();
    
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_jenis_barang");
}