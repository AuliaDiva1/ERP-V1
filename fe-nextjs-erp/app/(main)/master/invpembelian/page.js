"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import dynamic from "next/dynamic";

// Import Komponen Pendukung
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import AdjustPrintLaporan from "./print/AdjustPrintLaporan";
import { generateFakturPDF } from "./print/PrintDetailInvoice";
import FormPembelian from "./components/FormPembelian";
import FormPelunasan from "./components/FormPelunasan"; // Komponen Pelunasan Pro Om

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PembelianPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState("");
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State Master Data
  const [masterData, setMasterData] = useState({
    vendors: [],
    barangs: [],
    gudangs: [],
    raks: []
  });

  // State Modal & PDF
  const [formVisible, setFormVisible] = useState(false);
  const [lunasVisible, setLunasVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [adjustPrintDialog, setAdjustPrintDialog] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (t) { 
      setToken(t); 
      fetchPembelian(t);
      fetchMasterData(t);
    }
  }, []);

  // 2. Fungsi Ambil Data
  const fetchMasterData = async (t) => {
    try {
      const config = { headers: { Authorization: `Bearer ${t}` } };
      const [v, b, g, r] = await Promise.all([
        axios.get(`${API_URL}/master-vendor`, config),
        axios.get(`${API_URL}/master-barang`, config),
        axios.get(`${API_URL}/master-gudang`, config),
        axios.get(`${API_URL}/master-rak`, config),
      ]);
      setMasterData({
        vendors: v.data.data || [],
        barangs: b.data.data || [],
        gudangs: g.data.data || [],
        raks: r.data.data || []
      });
    } catch (err) { console.error("Master Data Load Error", err); }
  };

  const fetchPembelian = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/inv-pembelian`, { 
        headers: { Authorization: `Bearer ${t}` } 
      });
      setDataList(res.data.data || []);
    } catch (err) { 
      toastRef.current?.showToast("01", "Gagal mengambil data transaksi"); 
    } finally { setIsLoading(false); }
  };

  /**
   * 3. OPERASI SAVE: Transaksi Pembelian Baru
   * Sekaligus menambah stok di backend (Knex Transaction)
   */
  const handleSave = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/inv-pembelian/full`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Transaksi Berhasil Disimpan & Stok Bertambah!");
        fetchPembelian(token);
        setFormVisible(false);
      }
    } catch (err) { 
        const msg = err.response?.data?.message || "Gagal menyimpan transaksi";
        toastRef.current?.showToast("01", msg); 
    }
  };

  /**
   * 4. OPERASI PELUNASAN: Hit API Cicilan/Pelunasan Hutang
   * Menggunakan payload dari FormPelunasan yang Om kasih tadi
   */
  const handleSavePelunasan = async (finalData) => {
    try {
      const res = await axios.post(`${API_URL}/pembayaran-beli`, finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", `Pembayaran ${finalData.NO_KWITANSI} Berhasil!`);
        setLunasVisible(false);
        fetchPembelian(token); // Refresh table biar sisa tagihan ter-update
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal mencatat pembayaran";
      toastRef.current?.showToast("01", msg);
    }
  };

  const openLunasForm = (rowData) => {
    setSelectedInvoice(rowData);
    setLunasVisible(true);
  };

  // 5. Operasi Hapus (VOID Invoice)
  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Hapus invoice ${rowData.NO_INVOICE_BELI}? Stok yang sudah masuk akan ditarik kembali!`,
      header: 'Konfirmasi VOID Invoice',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          const safeId = encodeURIComponent(rowData.NO_INVOICE_BELI);
          await axios.delete(`${API_URL}/inv-pembelian/${safeId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toastRef.current?.showToast("00", "Invoice Berhasil di-VOID & Stok Dikurangi");
          fetchPembelian(token);
        } catch (err) { 
            toastRef.current?.showToast("01", "Gagal hapus: Invoice sudah ada pembayaran atau data tidak valid"); 
        }
      }
    });
  };

  // 6. Fungsi Cetak Faktur (Detail)
  const handlePrintDetail = async (rowData) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/inv-pembelian/detail/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "00") {
        const doc = generateFakturPDF(rowData, res.data.data);
        setPdfUrl(doc.output("datauristring"));
        setFileName(`Faktur_${rowData.NO_INVOICE_BELI}.pdf`);
        setJsPdfPreviewOpen(true);
      }
    } catch (e) { toastRef.current?.showToast("01", "Gagal ambil detail faktur"); }
    finally { setIsLoading(false); }
  };

  // 7. Template Tabel
  const statusBodyTemplate = (rowData) => {
    const s = rowData.STATUS_BAYAR || "BELUM LUNAS";
    let color = "warning"; // Default Orange
    if (s.toUpperCase() === "LUNAS") color = "success"; // Hijau
    if (s.toUpperCase() === "CICIL") color = "info"; // Biru
    return <Tag value={s.toUpperCase()} severity={color} style={{ minWidth: '80px' }} />;
  };

  const columns = [
    { field: "NO_INVOICE_BELI", header: "No. Invoice", sortable: true },
    { field: "NAMA_VENDOR", header: "Vendor", sortable: true },
    { field: "STATUS_BAYAR", header: "Status", body: statusBodyTemplate, sortable: true },
    { 
      field: "SISA_TAGIHAN", 
      header: "Sisa Tagihan", 
      body: (r) => <span className={`font-bold ${r.SISA_TAGIHAN > 0 ? 'text-red-500' : 'text-green-600'}`}>
        Rp {new Intl.NumberFormat("id-ID").format(r.SISA_TAGIHAN)}
      </span>,
      sortable: true 
    },
    {
      header: "Aksi",
      body: (r) => (
        <div className="flex gap-2">
          {/* Tombol Bayar Muncul jika masih ada sisa hutang */}
          {parseFloat(r.SISA_TAGIHAN) > 0 && (
            <Button icon="pi pi-credit-card" rounded severity="success" onClick={() => openLunasForm(r)} tooltip="Bayar/Cicil" />
          )}
          <Button icon="pi pi-file-pdf" rounded text severity="help" onClick={() => handlePrintDetail(r)} tooltip="Cetak Faktur" />
          <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(r)} tooltip="Hapus/Void" />
        </div>
      ),
    },
  ];

  return (
    <div className="card p-4 shadow-1 border-round">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
           <h2 className="font-bold m-0 text-primary">Manajemen Pembelian</h2>
           <span className="text-500">Monitoring stok masuk dan pelunasan vendor secara real-time</span>
        </div>
        <div className="flex gap-2">
          <Button label="Transaksi Baru" icon="pi pi-plus" severity="success" raised onClick={() => setFormVisible(true)} />
          <Button label="Cetak Rekap" icon="pi pi-print" severity="secondary" outlined onClick={() => setAdjustPrintDialog(true)} />
        </div>
      </div>

      <CustomDataTable data={dataList} columns={columns} loading={isLoading} />

      {/* MODAL: TRANSAKSI BARU */}
      <FormPembelian 
        visible={formVisible} 
        onHide={() => setFormVisible(false)} 
        onSave={handleSave} 
        {...masterData} 
      />

      {/* MODAL: PELUNASAN HUTANG (KOMPONEN PRO OM) */}
      <FormPelunasan 
        visible={lunasVisible} 
        onHide={() => setLunasVisible(false)} 
        invoiceData={selectedInvoice} 
        onSave={handleSavePelunasan} 
      />

      {/* DIALOG: PDF PREVIEW */}
      <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} maximizable modal style={{ width: '85vw' }} header={`Preview: ${fileName}`}>
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>

      {/* MODAL: ADJUST LAPORAN REKAP */}
      <AdjustPrintLaporan 
        adjustDialog={adjustPrintDialog} 
        setAdjustDialog={setAdjustPrintDialog} 
        dataToPrint={dataList} 
        setPdfUrl={setPdfUrl} 
        setFileName={setFileName} 
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        judulLaporan="LAPORAN DATA PEMBELIAN"
        columnOptions={[
          { name: "No. Invoice", value: "NO_INVOICE_BELI" },
          { name: "Vendor", value: "NAMA_VENDOR" },
          { name: "Status", value: "STATUS_BAYAR" },
          { name: "Sisa Tagihan", value: "SISA_TAGIHAN" }
        ]}
      />
    </div>
  );
}