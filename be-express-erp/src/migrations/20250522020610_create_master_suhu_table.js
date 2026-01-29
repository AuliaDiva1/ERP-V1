/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  const exists = await knex.schema.hasTable("master_mesin");
  if (!exists) {
    return await knex.schema.createTable("master_mesin", (table) => {
      table.bigIncrements("id").primary();
      table.string("kode_mesin", 100).notNullable().unique();
      table.string("nama_mesin", 100).notNullable();
      table.float("suhu_maksimal", 10, 2).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  return await knex.schema.dropTableIfExists("master_mesin");
};
