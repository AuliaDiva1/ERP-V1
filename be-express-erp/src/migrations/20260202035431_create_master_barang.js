/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_barang", (table) => {
    table.increments("ID").primary();
    
    table.string("BARANG_KODE", 50).notNullable().unique(); 
    table.string("NAMA_BARANG", 200).notNullable();
    
    // Foreign Key ke Jenis Barang
    table.integer("JENIS_ID").unsigned().references("ID").inTable("master_jenis_barang").onDelete("SET NULL");
    
    // Foreign Key ke Satuan Barang
    table.integer("SATUAN_ID").unsigned().references("ID").inTable("master_satuan_barang").onDelete("SET NULL");

    table.integer("STOK_MINIMAL").defaultTo(0);
    table.integer("STOK_SAAT_INI").defaultTo(0);
    table.decimal("HARGA_BELI_TERAKHIR", 15, 2).defaultTo(0);
    
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_barang");
}