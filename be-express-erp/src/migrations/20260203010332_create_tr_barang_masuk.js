export async function up(knex) {
  return knex.schema.createTable("TR_BARANG_MASUK", (table) => {
    table.increments("ID_MASUK").primary();
    table.string("NO_MASUK", 50).notNullable().unique();
    table.string("BARANG_KODE", 50).references("BARANG_KODE").inTable("master_barang");
    table.string("KODE_GUDANG", 50).references("KODE_GUDANG").inTable("MASTER_GUDANG");
    table.string("KODE_RAK", 50).nullable().references("KODE_RAK").inTable("MASTER_RAK");
    table.float("QTY").notNullable();
    table.string("BATCH_NO", 100).nullable();
    table.date("TGL_KADALUARSA").nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("TR_BARANG_MASUK");
}