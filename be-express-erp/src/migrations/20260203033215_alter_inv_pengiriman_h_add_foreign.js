export const up = function(knex) {
  return knex.schema.alterTable('inv_pengiriman_h', (table) => {
    // Menambahkan Foreign Key Constraint
    // Pastikan tipe data dan panjangnya sama (Varchar 50)
    table.foreign('KODE_PELANGGAN')
         .references('KODE_CUSTOMER')
         .inTable('master_customer')
         .onUpdate('CASCADE') // Jika kode di master berubah, di sini ikut berubah
         .onDelete('RESTRICT'); // Tidak boleh hapus customer jika sudah ada transaksi
  });
};

export const down = function(knex) {
  return knex.schema.alterTable('inv_pengiriman_h', (table) => {
    table.dropForeign('KODE_PELANGGAN');
  });
};