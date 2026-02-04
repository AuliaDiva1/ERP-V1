/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable("STOK_LOKASI", (table) => {
    // 1. Ubah QTY dari float ke decimal agar presisi
    table.decimal("QTY", 15, 2).defaultTo(0).alter();

    // 2. Tambahkan CREATED_AT jika belum ada (opsional tapi disarankan)
    table.timestamp("CREATED_AT").defaultTo(knex.fn.now()).after("TGL_KADALUARSA");
    
    // 3. Pastikan UPDATED_AT juga konsisten
    table.timestamp("UPDATED_AT").defaultTo(knex.fn.now()).alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("STOK_LOKASI", (table) => {
    // Kembalikan ke float jika diperlukan (opsional)
    table.float("QTY").defaultTo(0).alter();
    table.dropColumn("CREATED_AT");
  });
}