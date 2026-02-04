/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. Cek dulu apakah kolom HARGA_JUAL sudah ada
  const hasHargaJual = await knex.schema.hasColumn("master_barang", "HARGA_JUAL");

  // 2. Lakukan perubahan tabel
  await knex.schema.alterTable("master_barang", (table) => {
    // Ubah tipe data STOK agar bisa desimal
    table.decimal("STOK_MINIMAL", 15, 2).defaultTo(0).alter();
    table.decimal("STOK_SAAT_INI", 15, 2).defaultTo(0).alter();

    // Tambahkan field Harga Jual jika belum ada
    if (!hasHargaJual) {
      table.decimal("HARGA_JUAL", 15, 2).defaultTo(0).after("HARGA_BELI_TERAKHIR");
    }

    // Tambahkan Index pada BARANG_KODE
    table.index("BARANG_KODE");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable("master_barang", (table) => {
    table.dropIndex("BARANG_KODE");
    table.dropColumn("HARGA_JUAL");
  });
}