/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("inv_pembelian", (table) => {
    // 1. ID Utama (Primary Key)
    table.increments("ID_INV_BELI").primary(); 

    // 2. Nomor Invoice (Unik)
    table.string("NO_INVOICE_BELI", 50).notNullable().unique(); 

    // 3. Relasi ke Vendor (Hasil Rename tadi)
    // Sesuaikan panjang varchar(10) sesuai capture phpMyAdmin kamu
    table.string("VENDOR_ID", 10).notNullable(); 

    // 4. Data Transaksi
    table.date("TGL_INVOICE").notNullable();
    
    // Menggunakan decimal(15,2) untuk akurasi uang
    table.decimal("TOTAL_BAYAR", 15, 2).defaultTo(0.00);
    table.decimal("SISA_TAGIHAN", 15, 2).defaultTo(0.00);

    // 5. Status Pembayaran
    table.enu("STATUS_BAYAR", ["Belum Lunas", "Cicil", "Lunas"])
         .defaultTo("Belum Lunas");

    // 6. Audit Trail
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Opsional: Tambahkan Foreign Key langsung jika master_vendor sudah ada
    table.foreign('VENDOR_ID')
         .references('VENDOR_ID')
         .inTable('master_vendor')
         .onUpdate('CASCADE')
         .onDelete('RESTRICT');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("inv_pembelian");
}