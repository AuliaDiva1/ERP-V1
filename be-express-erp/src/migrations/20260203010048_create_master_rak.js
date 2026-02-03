export async function up(knex) {
  return knex.schema.createTable("MASTER_RAK", (table) => {
    table.increments("ID_RAK").primary();
    table.string("KODE_GUDANG", 50).notNullable()
      .references("KODE_GUDANG").inTable("MASTER_GUDANG")
      .onUpdate("CASCADE").onDelete("CASCADE");
    table.string("KODE_RAK", 50).notNullable().unique();
    table.string("NAMA_RAK", 100).nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("MASTER_RAK");
}