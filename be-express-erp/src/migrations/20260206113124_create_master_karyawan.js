/**
 * Migration: Master Karyawan
 * Relasi ke users menggunakan EMAIL (konsisten dengan master_siswa & master_guru)
 * Semua role masuk sini: HR, Produksi, Gudang, Finance, dll
 * Superadmin biasanya tidak perlu dimasukkan
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_karyawan", (table) => {
    // Primary Key
    table.bigIncrements("KARYAWAN_ID").primary();

    // ✅ Relasi ke tabel users (pakai EMAIL seperti master_siswa & master_guru)
    table.string("EMAIL", 120)
      .notNullable()
      .unique()
      .references("email")
      .inTable("users")
      .onDelete("CASCADE");

    // Identitas Karyawan
    table.string("NIK", 30).notNullable().unique();
    table.string("NAMA", 150).notNullable();
    table.enu("GENDER", ["L", "P"]).notNullable();
    table.string("TEMPAT_LAHIR", 100).nullable();
    table.date("TGL_LAHIR").nullable();
    table.text("ALAMAT").nullable();
    table.string("NO_TELP", 20).nullable();

    // Struktur Organisasi
    table.string("DEPARTEMEN", 100).notNullable();
    // contoh: HR, PRODUKSI, GUDANG, FINANCE
    table.string("JABATAN", 100).notNullable();
    // contoh: Staff, Operator, Supervisor, Manager
    table.date("TANGGAL_MASUK").nullable();

    // Status kerja
    table.enu("STATUS_KARYAWAN", ["Tetap", "Kontrak", "Magang"]).defaultTo("Kontrak");
    table.enu("STATUS_AKTIF", ["Aktif", "Nonaktif"]).defaultTo("Aktif");

    // Khusus produksi (opsional)
    table.enu("SHIFT", ["Pagi", "Siang", "Malam"]).nullable();

    // Data tambahan
    table.string("PENDIDIKAN_TERAKHIR", 100).nullable();
    table.string("FOTO", 255).nullable();

    // Audit
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Index untuk pencarian cepat
    table.index(["DEPARTEMEN", "JABATAN"]);
    table.index("EMAIL");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_karyawan");
}