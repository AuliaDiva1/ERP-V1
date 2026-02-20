// migrations/XXXXXX_create_master_pengajuan.js
export async function up(knex) {
  return knex.schema.createTable("master_pengajuan", (table) => {
    table.increments("ID").primary();

    table.string("KODE_PENGAJUAN", 20).notNullable().unique();
    table.string("NAMA_PENGAJUAN", 150).notNullable();

    table.enu("KATEGORI", ["Kinerja", "Operasional"])
      .notNullable();

    table.text("KETERANGAN").nullable();

    table.enu("STATUS", ["Aktif", "Tidak aktif"])
      .notNullable()
      .defaultTo("Aktif");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // Index yang BENAR
    table.index(["KODE_PENGAJUAN", "KATEGORI"]);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_pengajuan");
}