export async function up(knex) {
  return knex.schema.createTable("MASTER_GUDANG", (table) => {
    table.increments("ID_GUDANG").primary();
    table.string("KODE_GUDANG", 50).notNullable().unique();
    table.string("NAMA_GUDANG", 100).notNullable();
    table.text("ALAMAT").nullable();
    table.string("STATUS", 20).defaultTo("Aktif");
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("MASTER_GUDANG");
}