export async function up(knex) {
  return knex.schema.createTable("STOK_LOKASI", (table) => {
    table.increments("ID_STOK_LOKASI").primary();
    table.string("BARANG_KODE", 50).notNullable()
      .references("BARANG_KODE").inTable("master_barang").onUpdate("CASCADE");
    table.string("KODE_GUDANG", 50).notNullable()
      .references("KODE_GUDANG").inTable("MASTER_GUDANG").onUpdate("CASCADE");
    table.string("KODE_RAK", 50).nullable()
      .references("KODE_RAK").inTable("MASTER_RAK").onUpdate("CASCADE");
    table.float("QTY").defaultTo(0);
    table.string("BATCH_NO", 100).nullable();
    table.date("TGL_KADALUARSA").nullable();
    table.unique(["BARANG_KODE", "KODE_GUDANG", "KODE_RAK", "BATCH_NO"]);
    table.timestamp("UPDATED_AT").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("STOK_LOKASI");
}