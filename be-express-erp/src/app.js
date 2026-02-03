import cors from "cors";
import express from "express";
import logger from "morgan";
import path from "path";
import { setResponseHeader } from "./middleware/set-headers.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import masterVendorRoutes from "./routes/masterVendorRoutes.js";
import masterHariRoutes from "./routes/masterHariRoutes.js";

// Import Rute Baru untuk Inventaris
import masterJenisBarangRoutes from "./routes/masterJenisBarangRoutes.js";
import masterSatuanBarangRoutes from "./routes/masterSatuanBarangRoutes.js";
import masterBarangRoutes from "./routes/masterBarangRoutes.js";

import masterGudangRoutes from "./routes/masterGudangRoutes.js";
import masterRakRoutes from "./routes/masterRakRoutes.js";
import stokLokasiRoutes from "./routes/stokLokasiRoutes.js";

// --- TAMBAHAN BARU: TRANSAKSI & INVOICE ---
import trBarangMasukRoutes from "./routes/trBarangMasukRoutes.js";
import trBarangKeluarRoutes from "./routes/trBarangKeluarRoutes.js";
import invPembelianRoutes from "./routes/invPembelianRoutes.js";
import invPengirimanRoutes from "./routes/invPengirimanRoutes.js"; // Header
import invPengirimanDRoutes from "./routes/invPengirimanDRoutes.js"; // Detail
import pembayaranBeliRoutes from "./routes/pembayaranBeliRoutes.js";
import customerRoutes from "./routes/masterCustomerRoutes.js";

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const allowedOrigins = ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Timestamp", "X-Signature"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionSuccessStatus: 200,
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", [setResponseHeader], (req, res) => {
  return res.status(200).json(`Welcome to the server! ${new Date().toLocaleString()}`);
});

// Routes Dasar
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/master-vendor", masterVendorRoutes);
app.use("/api/master-hari", masterHariRoutes);

// Routes Master Inventaris
app.use("/api/master-jenis-barang", masterJenisBarangRoutes);
app.use("/api/master-satuan-barang", masterSatuanBarangRoutes);
app.use("/api/master-barang", masterBarangRoutes);
app.use("/api/master-gudang", masterGudangRoutes);
app.use("/api/master-rak", masterRakRoutes);
app.use("/api/stok-lokasi", stokLokasiRoutes);

// --- ROUTES TRANSAKSI & OPERASIONAL ---
app.use("/api/tr-barang-masuk", trBarangMasukRoutes);     // Tambah stok
app.use("/api/tr-barang-keluar", trBarangKeluarRoutes);   // Kurangi stok
app.use("/api/inv-pembelian", invPembelianRoutes);       // Tagihan Vendor
app.use("/api/inv-pengiriman", invPengirimanRoutes);     // SJ Header
app.use("/api/inv-pengiriman-detail", invPengirimanDRoutes); // SJ Detail Items
app.use("/api/pembayaran-beli", pembayaranBeliRoutes);    // Pelunasan Hutang
app.use("/api/master-customer", customerRoutes);

export default app;