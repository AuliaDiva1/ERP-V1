import cors from "cors";
import express from "express";
import logger from "morgan";
import path from "path";
import { setResponseHeader } from "./middleware/set-headers.js";

// ── Auth & User
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// ── Master Data
import masterVendorRoutes from "./routes/masterVendorRoutes.js";
import masterHariRoutes from "./routes/masterHariRoutes.js";
import masterKaryawanRoutes from "./routes/masterKaryawanRoutes.js";
import masterPerusahaanRoutes from "./routes/masterPerusahaanRoutes.js";
import masterPengajuanRoutes from "./routes/masterPengajuanRoutes.js";
import masterCustomerRoutes from "./routes/masterCustomerRoutes.js";

// ── SDM
import batchRoutes from "./routes/masterBatchRoutes.js";
import batchKaryawanRoutes from "./routes/batchKaryawanRoutes.js";
import logbookRoutes from "./routes/logbookPekerjaanRoutes.js";
import rekapitulasiKinerjaRoutes from "./routes/rekapitulasiKinerjaRoutes.js";
import masterPresensiRoutes from "./routes/masterPresensiRoutes.js";
import masterShiftRoutes from "./routes/masterShiftRoutes.js";

// ── PAYROLL (baru)
import masterGajiJabatanRoutes from "./routes/masterGajiJabatanRoutes.js";
import masterKomponenGajiRoutes from "./routes/masterKomponenGajiRoutes.js";
import masterPayrollRoutes from "./routes/masterPayrollRoutes.js";

// ── Inventaris
import masterJenisBarangRoutes from "./routes/masterJenisBarangRoutes.js";
import masterSatuanBarangRoutes from "./routes/masterSatuanBarangRoutes.js";
import masterBarangRoutes from "./routes/masterBarangRoutes.js";
import masterGudangRoutes from "./routes/masterGudangRoutes.js";
import masterRakRoutes from "./routes/masterRakRoutes.js";
import stokLokasiRoutes from "./routes/stokLokasiRoutes.js";

// ── Transaksi
import trBarangMasukRoutes from "./routes/trBarangMasukRoutes.js";
import trBarangKeluarRoutes from "./routes/trBarangKeluarRoutes.js";
import invPembelianRoutes from "./routes/invPembelianRoutes.js";
import invPengirimanRoutes from "./routes/invPengirimanRoutes.js";
import pembayaranBeliRoutes from "./routes/pembayaranBeliRoutes.js";

const app = express();

// ── Static Files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ── CORS (DIUBAH AGAR MENERIMA AKSES VERCEL)
app.use(cors({
  origin: "*", // Mengizinkan semua domain (termasuk frontend Vercel kamu)
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Timestamp", "X-Signature"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  optionsSuccessStatus: 200,
}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Index Route
app.get("/", [setResponseHeader], (req, res) => {
  return res.status(200).json(`Welcome to the server! ${new Date().toLocaleString()}`);
});

// ════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════

// Auth & User
app.use("/api/auth",           authRoutes);
app.use("/api/users",          userRoutes);

// Master Data
app.use("/api/master-vendor",     masterVendorRoutes);
app.use("/api/master-hari",       masterHariRoutes);
app.use("/api/master-karyawan",   masterKaryawanRoutes);
app.use("/api/master-perusahaan", masterPerusahaanRoutes);
app.use("/api/master-pengajuan",  masterPengajuanRoutes);
app.use("/api/master-customer",   masterCustomerRoutes);

// SDM
app.use("/api/master-batch",           batchRoutes);
app.use("/api/batch-karyawan",         batchKaryawanRoutes);
app.use("/api/logbook-pekerjaan",      logbookRoutes);
app.use("/api/rekapitulasi-kinerja",   rekapitulasiKinerjaRoutes);
app.use("/api/master-presensi",       masterPresensiRoutes);
app.use("/api/master-shift",           masterShiftRoutes);

// PAYROLL
app.use("/api/master-gaji-jabatan",   masterGajiJabatanRoutes);
app.use("/api/master-komponen-gaji",  masterKomponenGajiRoutes);
app.use("/api/master-payroll",        masterPayrollRoutes);

// Inventaris
app.use("/api/master-jenis-barang",   masterJenisBarangRoutes);
app.use("/api/master-satuan-barang",  masterSatuanBarangRoutes);
app.use("/api/master-barang",         masterBarangRoutes);
app.use("/api/master-gudang",         masterGudangRoutes);
app.use("/api/master-rak",            masterRakRoutes);
app.use("/api/stok-lokasi",           stokLokasiRoutes);

// Transaksi
app.use("/api/barang-masuk",      trBarangMasukRoutes);
app.use("/api/tr-barang-keluar",  trBarangKeluarRoutes);
app.use("/api/inv-pembelian",     invPembelianRoutes);
app.use("/api/inv-pengiriman",    invPengirimanRoutes);
app.use("/api/pembayaran-beli",   pembayaranBeliRoutes);

export default app;