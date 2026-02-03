export const up = function(knex) {
  return knex.schema.createTable('master_customer', (table) => {
    table.increments('ID_CUSTOMER').primary();
    table.string('KODE_CUSTOMER', 50).unique().notNullable();
    table.string('NAMA_CUSTOMER', 150).notNullable();
    table.text('ALAMAT');
    table.string('NO_TELP', 20);
    table.string('EMAIL', 100);
    table.enum('STATUS', ['Aktif', 'Non-Aktif']).defaultTo('Aktif');
    table.timestamps(true, true);
  });
};

export const down = function(knex) {
  return knex.schema.dropTable('master_customer');
};