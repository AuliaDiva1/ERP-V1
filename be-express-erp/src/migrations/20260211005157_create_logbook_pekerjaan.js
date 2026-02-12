// migrations/XXXXXX_create_logbook_pekerjaan.js
export async function up(knex) {
  return knex.schema.createTable("logbook_pekerjaan", (table) => {
    table.increments("ID").primary();
    
    table.string("LOGBOOK_ID", 20).notNullable().unique();
    
    table.string("KARYAWAN_ID", 20).notNullable();
    table.foreign("KARYAWAN_ID").references("KARYAWAN_ID").inTable("master_karyawan")
      .onUpdate("CASCADE").onDelete("CASCADE");
    
    table.string("BATCH_ID", 20).notNullable();
    table.foreign("BATCH_ID").references("BATCH_ID").inTable("master_batch")
      .onUpdate("CASCADE").onDelete("RESTRICT");
    
    // Data waktu kerja
    table.date("TANGGAL").notNullable();
    table.time("JAM_MULAI").notNullable();
    table.time("JAM_SELESAI").nullable();
    
    // ✅ PERBAIKAN: Gunakan DECIMAL untuk jam kerja (bisa 7.5 jam)
    table.decimal("JAM_KERJA", 5, 2).notNullable().defaultTo(0);
    
    // Aktivitas & Progress
    table.string("AKTIVITAS", 500).notNullable();
    table.text("DESKRIPSI").nullable();
    
    // ✅ TAMBAHAN: Bisa desimal (misal 2.5 unit)
    table.decimal("JUMLAH_OUTPUT", 10, 2).notNullable().defaultTo(0);
    
    table.text("KENDALA").nullable();
    
    // ✅ TAMBAHAN: Foto bukti pekerjaan (opsional)
    table.string("FOTO_BUKTI", 255).nullable();
    
    // Status workflow
    table.enu("STATUS", ["Draft", "Submitted", "Approved", "Rejected"])
      .notNullable().defaultTo("Draft");
    
    // ✅ PERBAIKAN: Gunakan KARYAWAN_ID untuk audit trail
    table.string("CREATED_BY_KARYAWAN", 20).nullable();
    table.foreign("CREATED_BY_KARYAWAN").references("KARYAWAN_ID").inTable("master_karyawan")
      .onUpdate("CASCADE").onDelete("SET NULL");
    
    table.string("UPDATED_BY_KARYAWAN", 20).nullable();
    table.foreign("UPDATED_BY_KARYAWAN").references("KARYAWAN_ID").inTable("master_karyawan")
      .onUpdate("CASCADE").onDelete("SET NULL");
    
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );
    
    // ✅ TAMBAHAN: Index untuk performa query
    table.index(["KARYAWAN_ID", "TANGGAL"]);
    table.index(["BATCH_ID", "TANGGAL"]);
    table.index(["STATUS", "TANGGAL"]);
    table.index("TANGGAL");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("logbook_pekerjaan");
}