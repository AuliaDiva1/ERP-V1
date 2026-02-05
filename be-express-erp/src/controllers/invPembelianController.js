import * as InvPembelianModel from "../models/invPembelianModel.js";
import * as InvPembelianDModel from "../models/invPembelianDModel.js";
import * as PembayaranBeliModel from "../models/pembayaranBeliModel.js"; // <--- TAMBAHKAN IMPORT INI

/**
 * ==========================================================
 * Bagian 1: HEADER (Invoice Utama)
 * ==========================================================
 */

export const getAllInvPembelian = async (req, res) => {
  try {
    const data = await InvPembelianModel.getAllInvPembelian();
    res.status(200).json({ status: "00", message: "Success", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const getInvPembelianById = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    const data = await InvPembelianModel.getInvPembelianById(decodedId);
    if (!data) return res.status(404).json({ status: "01", message: "Tidak ditemukan" });
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const createInvPembelian = async (req, res) => {
  try {
    const { NO_INVOICE_BELI } = req.body;
    
    if (!NO_INVOICE_BELI) {
      return res.status(400).json({ status: "01", message: "Nomor Invoice wajib diisi manual!" });
    }

    const check = await InvPembelianModel.getInvPembelianByNo(NO_INVOICE_BELI);
    if (check) return res.status(400).json({ status: "01", message: "Nomor Invoice sudah terdaftar di sistem" });

    const result = await InvPembelianModel.createInvPembelian(req.body);
    res.status(201).json({ status: "00", message: "Header Berhasil Dibuat", data: result });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const updateInvPembelian = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    await InvPembelianModel.updateInvPembelian(decodedId, req.body);
    res.status(200).json({ status: "00", message: "Update Berhasil" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const deleteInvPembelian = async (req, res) => {
  try {
    const { id } = req.params;
    const decodedId = decodeURIComponent(id);
    
    const exist = await InvPembelianModel.getInvPembelianByNo(decodedId);
    if (!exist) return res.status(404).json({ status: "01", message: "Invoice tdk ditemukan" });

    await InvPembelianModel.deleteFullPurchase(decodedId);
    
    res.status(200).json({ status: "00", message: "Invoice & Relasi Berhasil Dihapus" });
  } catch (err) {
    res.status(500).json({ status: "99", error: "Gagal Hapus: " + err.message });
  }
};

/**
 * ==========================================================
 * Bagian 2: DETAIL (Barang & Stok)
 * ==========================================================
 */

export const getDetailByInvoice = async (req, res) => {
  try {
    const { noInvoice } = req.params;
    const decodedNo = decodeURIComponent(noInvoice);
    const data = await InvPembelianDModel.getDetailByInvoice(decodedNo);
    res.status(200).json({ status: "00", data });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const addItemsToInvoice = async (req, res) => {
  try {
    const { items } = req.body;
    await InvPembelianDModel.createInvPembelianD(items);
    res.status(201).json({ status: "00", message: "Item ditambahkan" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

export const deleteDetailItem = async (req, res) => {
  try {
    const { idDetail } = req.params;
    await InvPembelianDModel.deleteInvPembelianD(idDetail);
    res.status(200).json({ status: "00", message: "Item terhapus" });
  } catch (err) {
    res.status(500).json({ status: "99", error: err.message });
  }
};

/**
 * ==========================================================
 * Bagian 3: SUPER CREATE (Header + Items + Payment dalam satu transaksi)
 * ==========================================================
 */
export const createFullPurchase = async (req, res) => {
  try {
    const { header, items } = req.body;

    if (!header.NO_INVOICE_BELI) {
      return res.status(400).json({ status: "01", message: "Nomor Invoice (Header) wajib diisi!" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ status: "01", message: "Minimal harus ada 1 barang dalam invoice" });
    }

    const checkDuplicate = await InvPembelianModel.getInvPembelianByNo(header.NO_INVOICE_BELI);
    if (checkDuplicate) {
      return res.status(400).json({ status: "01", message: `Nomor Invoice ${header.NO_INVOICE_BELI} sudah pernah diinput!` });
    }

    // 1. MAPPING DATA HEADER
    const finalHeader = {
      NO_INVOICE_BELI: header.NO_INVOICE_BELI,
      VENDOR_ID: header.VENDOR_ID,
      TGL_INVOICE: header.TGL_INVOICE,
      TOTAL_BAYAR: parseFloat(header.TOTAL_BAYAR) || 0,
      SISA_TAGIHAN: parseFloat(header.SISA_TAGIHAN) || 0,
      STATUS_BAYAR: header.STATUS_BAYAR || "Belum Lunas",
    };

    // 2. MAPPING DATA ITEMS
    const finalItems = items.map((item) => ({
      NO_INVOICE_BELI: header.NO_INVOICE_BELI,
      BARANG_KODE: item.BARANG_KODE,
      QTY_BELI: parseFloat(item.QTY_BELI) || 0,
      HARGA_SATUAN: parseFloat(item.HARGA_SATUAN) || 0,
      SUBTOTAL: parseFloat(item.SUBTOTAL) || 0,
      KODE_GUDANG: item.KODE_GUDANG,
      KODE_RAK: item.KODE_RAK,
      BATCH_NO: item.BATCH_NO || "",
      TGL_KADALUARSA: item.TGL_KADALUARSA || null
    }));

    // 3. LOGIKA PEMBAYARAN (DP)
    let paymentData = null;
    const nominalBayar = parseFloat(header.JUMLAH_BAYAR) || 0;
    
    if (nominalBayar > 0) {
      paymentData = {
        NO_KWITANSI: `KW-${Date.now()}`, // Generate kwitansi otomatis
        NO_INVOICE_BELI: header.NO_INVOICE_BELI,
        TGL_BAYAR: header.TGL_INVOICE, // Default tanggal invoice
        NOMINAL_BAYAR: nominalBayar,
        KETERANGAN: "Uang Muka (DP) Transaksi Baru"
      };
    }

    // 4. SIMPAN SEMUA (Update Model Anda untuk menerima data payment ini)
    // Jika model saveFullPurchase belum support parameter ke-3, 
    // Anda bisa memanggil PembayaranBeliModel secara manual di sini.
    await InvPembelianModel.saveFullPurchase(finalHeader, finalItems);
    
    if (paymentData) {
      await PembayaranBeliModel.createPembayaran(paymentData);
    }

    res.status(201).json({ status: "00", message: "Transaksi & Pembayaran Berhasil Disimpan!" });
  } catch (err) {
    console.error("DEBUG ERROR API:", err);
    res.status(500).json({ 
      status: "99", 
      message: "Gagal Simpan: " + (err.sqlMessage || err.message) 
    });
  }
};