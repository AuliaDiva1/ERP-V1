/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  const exists = await knex.schema.hasTable("monitor_suhu");
  if (!exists) {
    return await knex.schema.createTable("monitor_suhu", (table) => {
      table.bigIncrements("id").primary();
      table
        .bigInteger("id_mesin")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("master_mesin")
        .onDelete("CASCADE")
        .index();

      table.datetime("tanggal_input").notNullable();
      // table.time("waktu_input").notNullable();
      table.float("keterangan_suhu", 10, 2).notNullable();

      // table
      //   .foreign("kode_mesin")
      //   .references("id")
      //   .inTable("master_mesin")
      //   .onDelete("CASCADE");
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  return await knex.schema.dropTableIfExists("monitor_suhu");
};
