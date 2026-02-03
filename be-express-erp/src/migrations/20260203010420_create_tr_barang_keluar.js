export async function up(knex) {
  return knex.schema.createTable("TR_BARANG_KELUAR", (table) => {
    table.increments("ID_KELUAR").primary();
    table.string("NO_KELUAR", 50).notNullable().unique();
    table.string("NO_PENGIRIMAN", 50).nullable()
      .references("NO_PENGIRIMAN").inTable("INV_PENGIRIMAN_H")
      .onUpdate("CASCADE").onDelete("SET NULL");
    table.string("BARANG_KODE", 50).notNullable();
    table.string("KODE_GUDANG", 50).notNullable();
    table.string("KODE_RAK", 50).notNullable();
    table.float("QTY").notNullable();
    table.string("BATCH_NO", 100).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("TR_BARANG_KELUAR");
}