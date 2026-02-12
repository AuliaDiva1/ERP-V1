// migrations/XXXXXX_create_logbook_validasi.js
export async function up(knex) {
  return knex.schema.createTable("logbook_validasi", (table) => {
    table.increments("ID").primary();
    
    // ✅ PERBAIKAN: Relasi ke LOGBOOK_ID (string), bukan ID (integer)
    table.string("LOGBOOK_ID", 20).notNullable();
    table.foreign("LOGBOOK_ID").references("LOGBOOK_ID").inTable("logbook_pekerjaan")
      .onUpdate("CASCADE").onDelete("CASCADE");
    
    table.enu("AKSI", ["Approved", "Rejected"]).notNullable();
    
    // ✅ SEDERHANAKAN: Cukup KARYAWAN_ID saja (bisa ambil user_id dari join)
    table.string("VALIDATOR_KARYAWAN_ID", 20).notNullable();
    table.foreign("VALIDATOR_KARYAWAN_ID").references("KARYAWAN_ID").inTable("master_karyawan")
      .onUpdate("CASCADE").onDelete("CASCADE");
    
    table.text("CATATAN").nullable();
    
    table.timestamp("created_at").defaultTo(knex.fn.now());
    
    table.index(["LOGBOOK_ID", "created_at"]);
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("logbook_validasi");
}