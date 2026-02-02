/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_hari", (table) => {
    // Menambahkan ID standar di awal
    table.increments("ID").primary(); 
    
    // Tetap mempertahankan HARI_ID (bisa dijadikan integer unik)
    table.integer("HARI_ID").notNullable().unique(); 
    
    table.string("NAMA_HARI", 20).notNullable().unique(); 
    table.integer("URUTAN").notNullable(); 
    
    table.time("JAM_MASUK_DEFAULT").defaultTo("08:00:00");
    table.time("JAM_PULANG_DEFAULT").defaultTo("17:00:00");
    table.boolean("IS_HARI_KERJA").defaultTo(true); 
    
    table.enu("STATUS", ["Aktif", "Tidak Aktif"]).defaultTo("Aktif");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_hari");
}