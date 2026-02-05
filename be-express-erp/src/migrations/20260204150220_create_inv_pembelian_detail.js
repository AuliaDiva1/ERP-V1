/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("inv_pembelian_detail", (table) => {
    table.increments("ID_BELI_DETAIL").primary();

    // 1. Relasi ke Header Invoice
    table.string("NO_INVOICE_BELI", 50).notNullable()
      .references("NO_INVOICE_BELI").inTable("inv_pembelian")
      .onUpdate("CASCADE").onDelete("CASCADE");

    // 2. Relasi ke Master Barang
    table.string("BARANG_KODE", 50).notNullable()
      .references("BARANG_KODE").inTable("master_barang")
      .onUpdate("CASCADE");

    // 3. Relasi ke Gudang & Rak (Agar Stok Masuk ke Lokasi yang Tepat)
    table.string("KODE_GUDANG", 50).notNullable()
      .references("KODE_GUDANG").inTable("MASTER_GUDANG")
      .onUpdate("CASCADE");
    table.string("KODE_RAK", 50).nullable()
      .references("KODE_RAK").inTable("MASTER_RAK")
      .onUpdate("CASCADE");

    // 4. Data Transaksi Barang
    table.decimal("QTY_BELI", 15, 2).notNullable().defaultTo(0);
    table.decimal("HARGA_SATUAN", 15, 2).notNullable().defaultTo(0);
    table.decimal("SUBTOTAL", 15, 2).notNullable().defaultTo(0);
    
    // 5. Informasi Batch (Konek ke STOK_LOKASI)
    table.string("BATCH_NO", 100).nullable();
    table.date("TGL_KADALUARSA").nullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("inv_pembelian_detail");
}