/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. HEADER PENGIRIMAN (Induk)
  await knex.schema.createTable("INV_PENGIRIMAN_H", (table) => {
    table.increments("ID_PENGIRIMAN_H").primary();
    table.string("NO_PENGIRIMAN", 50).notNullable().unique(); // Kunci Relasi
    table.string("KODE_PELANGGAN", 50).notNullable(); 
    table.date("TGL_KIRIM").notNullable();
    table.string("ALAMAT_TUJUAN").notNullable();
    table.enum("STATUS_KIRIM", ["Diproses", "Dikirim", "Diterima"]).defaultTo("Diproses");
    table.timestamps(true, true);
  });

  // 2. DETAIL PENGIRIMAN (Anak)
  await knex.schema.createTable("INV_PENGIRIMAN_D", (table) => {
    table.increments("ID_PENGIRIMAN_D").primary();
    
    // Relasi ke Header (Cascade Delete: Jika Header dihapus, Detail ikut hapus)
    table.string("NO_PENGIRIMAN", 50)
      .references("NO_PENGIRIMAN").inTable("INV_PENGIRIMAN_H")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    // Relasi ke Master Barang
    table.string("BARANG_KODE", 50).notNullable()
      .references("BARANG_KODE").inTable("master_barang")
      .onUpdate("CASCADE");

    // Relasi ke Lokasi Pengambilan (Gudang & Rak)
    table.string("KODE_GUDANG", 50).notNullable();
    table.string("KODE_RAK", 50).notNullable();
    
    table.float("QTY").notNullable();
    table.string("BATCH_NO", 100).nullable();
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Hapus Anak dulu baru Induk agar tidak error foreign key
  await knex.schema.dropTableIfExists("INV_PENGIRIMAN_D");
  await knex.schema.dropTableIfExists("INV_PENGIRIMAN_H");
}