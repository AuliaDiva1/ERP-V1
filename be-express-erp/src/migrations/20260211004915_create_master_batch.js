// migrations/XXXXXX_create_master_batch.js
export async function up(knex) {
  return knex.schema.createTable("master_batch", (table) => {
    table.increments("ID").primary();
    
    table.string("BATCH_ID", 20).notNullable().unique();
    
    table.string("NAMA_BATCH", 200).notNullable();
    
    table.enu("JENIS_BATCH", ["Standar", "Khusus"]).notNullable().defaultTo("Standar");
    
    table.string("KATEGORI_PRODUK", 100).nullable();
    
    table.string("KODE_PRODUK", 50).nullable();
    
    table.integer("TARGET_JUMLAH").notNullable().defaultTo(0);
    table.integer("JUMLAH_SELESAI").notNullable().defaultTo(0);
    table.integer("JUMLAH_KARYAWAN_DIBUTUHKAN").nullable();
    
    // ✅ PERBAIKAN: Relasi ke master_satuan_barang
    table.string("SATUAN", 20).nullable();
    table.foreign("SATUAN").references("KODE_SATUAN").inTable("master_satuan_barang")
      .onUpdate("CASCADE").onDelete("SET NULL");
    
    table.text("SPESIFIKASI").nullable();
    
    table.date("TANGGAL_MULAI").nullable();
    table.date("TANGGAL_TARGET_SELESAI").nullable();
    table.date("TANGGAL_SELESAI_AKTUAL").nullable();
    
    table.decimal("ESTIMASI_JAM_KERJA", 8, 2).nullable();
    
    table.enu("STATUS_BATCH", [
      "Pending",
      "In Progress",
      "Completed",
      "On Hold",
      "Cancelled"
    ]).notNullable().defaultTo("Pending");
    
    table.text("CATATAN").nullable();
    
    table.string("CREATED_BY_KARYAWAN", 20).nullable();
    table.foreign("CREATED_BY_KARYAWAN").references("KARYAWAN_ID").inTable("master_karyawan")
      .onUpdate("CASCADE").onDelete("SET NULL");
    
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );
    
    table.index(["BATCH_ID", "STATUS_BATCH"]);
    table.index(["JENIS_BATCH", "KATEGORI_PRODUK"]);
    table.index("STATUS_BATCH");
  });
}

export async function down(knex) {
  return knex.schema.dropTableIfExists("master_batch");
}
