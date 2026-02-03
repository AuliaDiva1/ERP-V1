/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_vendor", (table) => {
    // Primary key internal
    table.increments("ID").primary(); // ID auto increment untuk sistem

    // Kode vendor unik (bisa dipakai untuk relasi)
    table.string("VENDOR_ID", 10).notNullable().unique();

    // Data utama vendor
    table.string("NAMA_VENDOR", 100).notNullable();
    table.string("ALAMAT_VENDOR", 255).notNullable();
    
    // PIC (Person In Charge)
    table.string("PIC", 100).notNullable();
    table.string("NO_TELP_PIC", 20).nullable();
    table.string("EMAIL_PIC", 100).nullable();

    // Status ketersediaan barang
    table
      .enum("KETERSEDIAAN_BARANG", ["Tersedia", "Tidak Tersedia"])
      .notNullable()
      .defaultTo("Tersedia");

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Index tambahan
    table.index(["VENDOR_ID", "NAMA_VENDOR"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_vendor");
}