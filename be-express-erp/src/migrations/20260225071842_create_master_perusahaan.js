/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_perusahaan", (table) => {
    // Primary key internal
    table.increments("ID_PERUSAHAAN").primary();

    // Data Identitas Utama
    table.string("NAMA_PERUSAHAAN", 150).notNullable();
    table.text("ALAMAT_KANTOR").notNullable();
    table.text("ALAMAT_GUDANG").nullable();
    
    // Kontak Resmi
    table.string("TELEPON", 20).nullable();
    table.string("WA_HOTLINE", 20).nullable();
    table.string("EMAIL", 100).nullable();
    table.string("WEBSITE", 100).nullable();

    // Data Legalitas & Pajak
    table.string("NPWP", 30).nullable();
    table.string("KOTA_TERBIT", 50).notNullable(); // Untuk lokasi ttd (Contoh: Bekasi)

    // Data Perbankan (Untuk Invoice)
    table.string("NAMA_BANK", 50).nullable();
    table.string("NOMOR_REKENING", 50).nullable();
    table.string("ATAS_NAMA_BANK", 150).nullable();

    // Person In Charge / Pimpinan (Untuk Tanda Tangan PDF)
    table.string("NAMA_PIMPINAN", 150).nullable();
    table.string("JABATAN_PIMPINAN", 100).nullable();

    // File Logo (Path)
    table.string("LOGO_PATH", 255).nullable();

    // Timestamps
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table
      .timestamp("updated_at")
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));

    // Index untuk pencarian cepat
    table.index(["NAMA_PERUSAHAAN"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_perusahaan");
}