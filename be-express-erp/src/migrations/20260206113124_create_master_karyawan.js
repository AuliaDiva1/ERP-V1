/**
 * Migration: Master Karyawan
 * Struktur:
 * - ID: Primary Key auto increment (untuk relasi internal sistem)
 * - KARYAWAN_ID: Unique code (untuk relasi ke tabel lain, seperti VENDOR_ID)
 * - EMAIL: Relasi ke users
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_karyawan", (table) => {
    // ✅ Primary Key (Auto Increment)
    table.increments("ID").primary();

    // ✅ Kode Karyawan Unik (untuk join ke tabel lain)
    table.string("KARYAWAN_ID", 20).notNullable().unique();
    // Format contoh: KRY-0001, KRY-0002, dll

    // ✅ Relasi ke tabel users (pakai EMAIL)
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
    table.string("JABATAN", 100).notNullable();
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
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Index untuk pencarian cepat
    table.index(["KARYAWAN_ID", "NAMA"]);
    table.index(["DEPARTEMEN", "JABATAN"]);
    table.index("EMAIL");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_karyawan");
}