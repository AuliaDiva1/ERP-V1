// migrations/XXXXXX_create_logbook_revisi.js
export async function up(knex) {
  return knex.schema.createTable("logbook_revisi", (table) => {
    table.increments("ID").primary();
    
    // ✅ PERBAIKAN: Relasi ke LOGBOOK_ID (string)
    table.string("LOGBOOK_ID", 20).notNullable();
    table.foreign("LOGBOOK_ID").references("LOGBOOK_ID").inTable("logbook_pekerjaan")
      .onUpdate("CASCADE").onDelete("CASCADE");
    
    table.integer("REVISI_KE").notNullable();
    
    table.enu("STATUS_SEBELUM", ["Draft", "Submitted", "Approved", "Rejected"]).notNullable();
    table.enu("STATUS_SESUDAH", ["Draft", "Submitted", "Approved", "Rejected"]).notNullable();
    
    // ✅ PERBAIKAN: Gunakan TEXT untuk JSON (lebih kompatibel)
    table.text("DATA_SEBELUM").nullable();
    table.text("DATA_SESUDAH").nullable();
    
    // ✅ PERBAIKAN: Gunakan KARYAWAN_ID
    table.string("REVISED_BY_KARYAWAN", 20).notNullable();
    table.foreign("REVISED_BY_KARYAWAN").references("KARYAWAN_ID").inTable("master_karyawan")
      .onUpdate("CASCADE").onDelete("CASCADE");
    
    table.text("ALASAN_REVISI").nullable();
    
    table.timestamp("created_at").defaultTo(knex.fn.now());
    
    table.index(["LOGBOOK_ID", "REVISI_KE"]);
    table.index("LOGBOOK_ID");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("logbook_revisi");
}