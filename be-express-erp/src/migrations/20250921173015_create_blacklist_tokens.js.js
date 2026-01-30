/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('blacklist_tokens', (table) => {
    table.increments('id').primary();          // ID auto increment
    table.text('token').notNullable();         // Token JWT
    table.timestamp('created_at').defaultTo(knex.fn.now()); // Waktu token ditambahkan
    table.timestamp('expired_at').notNullable(); // Waktu token kadaluarsa
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists('blacklist_tokens');
}
