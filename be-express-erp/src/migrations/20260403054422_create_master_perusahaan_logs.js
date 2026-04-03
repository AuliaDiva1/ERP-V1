/**
 * Migration: Membuat tabel audit log untuk Master Perusahaan
 * Menyimpan riwayat CREATE, UPDATE, DELETE beserta diff field-nya
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_perusahaan_logs", (table) => {
    table.increments("ID_LOG").primary();

    // Referensi ke tabel utama (nullable karena data bisa saja sudah dihapus)
    table.integer("ID_PERUSAHAAN").unsigned().nullable()
      .references("ID_PERUSAHAAN").inTable("master_perusahaan").onDelete("SET NULL");

    // Tipe aksi: CREATE | UPDATE | DELETE
    table.enum("ACTION", ["CREATE", "UPDATE", "DELETE"]).notNullable();

    // Snapshot data SEBELUM perubahan (JSON string) — null jika CREATE
    table.json("DATA_BEFORE").nullable();

    // Snapshot data SESUDAH perubahan (JSON string) — null jika DELETE
    table.json("DATA_AFTER").nullable();

    // Array perubahan field per field [{ field, old_value, new_value }] — opsional, untuk display diff
    table.json("CHANGES").nullable();

    // Catatan tambahan (opsional, bisa diisi manual atau dari sistem)
    table.string("NOTE", 255).nullable();

    // Identitas pelaku perubahan
    table.integer("USER_ID").unsigned().nullable();
    table.string("USER_NAME", 100).nullable();

    // Timestamp otomatis
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Index untuk query cepat berdasarkan perusahaan dan waktu
    table.index(["ID_PERUSAHAAN"]);
    table.index(["ACTION"]);
    table.index(["created_at"]);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_perusahaan_logs");
}
