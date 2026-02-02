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

export default app;