/**
 * Migration: Create Tabel Master Payroll
 * Hasil perhitungan Take Home Pay per karyawan per bulan
 * Sumber data: master_gaji_jabatan / master_komponen_gaji
 *            + master_presensi (kehadiran, terlambat)
 *            + rekapitulasi_kinerja (performance_score → bonus)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable("master_payroll", (table) => {
    // 1. Primary Key
    table.increments("ID").primary();

    // 2. Kode Payroll (PAY-202603-KRY0001)
    table.string("KODE_PAYROLL", 30).notNullable().unique();

    // 3. Relasi
    table.string("KARYAWAN_ID", 20)
      .notNullable()
      .references("KARYAWAN_ID")
      .inTable("master_karyawan")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.integer("USER_ID").unsigned().nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL")
      .onUpdate("CASCADE");

    // 4. Periode (simpan sebagai awal bulan: 2026-03-01)
    table.date("PERIODE").notNullable();

    // 5. Snapshot Jabatan saat payroll dibuat
    table.string("JABATAN_SNAPSHOT", 100).nullable();
    table.string("DEPARTEMEN_SNAPSHOT", 100).nullable();
    table.enum("SUMBER_GAJI", ["Jabatan", "Override"]).notNullable().defaultTo("Jabatan");

    // 6. Data Kehadiran (dari master_presensi)
    table.integer("HARI_KERJA_NORMAL").notNullable().defaultTo(0);
    table.integer("HARI_HADIR").notNullable().defaultTo(0);
    table.integer("HARI_ALPA").notNullable().defaultTo(0);
    table.integer("HARI_SAKIT").notNullable().defaultTo(0);
    table.integer("HARI_IZIN").notNullable().defaultTo(0);
    table.integer("HARI_CUTI").notNullable().defaultTo(0);
    table.integer("HARI_DINAS_LUAR").notNullable().defaultTo(0);
    table.integer("TOTAL_TERLAMBAT_MENIT").notNullable().defaultTo(0);
    table.integer("TOTAL_KEJADIAN_TERLAMBAT").notNullable().defaultTo(0);
    table.integer("TOTAL_PULANG_AWAL").notNullable().defaultTo(0);

    // 7. Data Kinerja (dari rekapitulasi_kinerja)
    table.integer("PERFORMANCE_SCORE").notNullable().defaultTo(0);
    table.decimal("TOTAL_OUTPUT", 15, 2).notNullable().defaultTo(0);
    table.decimal("TOTAL_JAM_PRODUKTIF", 10, 2).notNullable().defaultTo(0);
    table.integer("TOTAL_LOGBOOK_APPROVED").notNullable().defaultTo(0);

    // 8. Komponen Pendapatan (snapshot nilai saat dihitung)
    table.decimal("GAJI_POKOK", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_TRANSPORT", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_MAKAN", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_JABATAN", 15, 2).notNullable().defaultTo(0);
    table.decimal("TUNJANGAN_LAINNYA", 15, 2).notNullable().defaultTo(0);
    table.decimal("BONUS_KINERJA", 15, 2).notNullable().defaultTo(0);
    table.decimal("BONUS_PERSEN_DIPAKAI", 5, 2).notNullable().defaultTo(0); // % bonus yg aktif
    table.decimal("TOTAL_PENDAPATAN", 15, 2).notNullable().defaultTo(0);

    // 9. Komponen Potongan
    table.decimal("POTONGAN_TERLAMBAT", 15, 2).notNullable().defaultTo(0);
    table.decimal("POTONGAN_ALPA", 15, 2).notNullable().defaultTo(0);
    table.decimal("POTONGAN_BPJS_KESEHATAN", 15, 2).notNullable().defaultTo(0);
    table.decimal("POTONGAN_BPJS_TK", 15, 2).notNullable().defaultTo(0);
    table.decimal("POTONGAN_PPH21", 15, 2).notNullable().defaultTo(0);
    table.decimal("TOTAL_POTONGAN", 15, 2).notNullable().defaultTo(0);

    // 10. Take Home Pay
    table.decimal("TAKE_HOME_PAY", 15, 2).notNullable().defaultTo(0);

    // 11. Status & Approval
    table.enum("STATUS", ["Draft", "Approved", "Paid"])
      .notNullable()
      .defaultTo("Draft");
    table.string("APPROVED_BY", 20).nullable();
    table.timestamp("APPROVED_AT").nullable();
    table.string("PAID_BY", 20).nullable();
    table.timestamp("PAID_AT").nullable();

    // 12. Keterangan
    table.text("KETERANGAN").nullable();

    // 13. Metadata
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(
      knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    );

    // 14. Constraint & Index
    // Satu karyawan hanya boleh punya 1 payroll per periode
    table.unique(["KARYAWAN_ID", "PERIODE"], "uniq_payroll_karyawan_periode");
    table.index("PERIODE");
    table.index("STATUS");
    table.index("KARYAWAN_ID");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTableIfExists("master_payroll");
}