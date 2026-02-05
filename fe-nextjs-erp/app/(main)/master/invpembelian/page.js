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
import FormPelunasan from "./components/FormPelunasan";
import PembelianDetailDialog from "./components/DetailPage";

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
    raks: [],
    jenisBarangs: [] 
  });

  // State Modal & PDF
  const [formVisible, setFormVisible] = useState(false);
  const [lunasVisible, setLunasVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [adjustPrintDialog, setAdjustPrintDialog] = useState(false);

  // State Untuk Detail Page
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItems, setDetailItems] = useState([]);
  const [detailPayments, setDetailPayments] = useState([]);

  // 1. Initial Load
  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (t) { 
      setToken(t); 
      fetchPembelian(t);
      fetchMasterData(t);
    }
  }, []);

  // 2. Ambil Data Master
  const fetchMasterData = async (t) => {
    try {
      const config = { headers: { Authorization: `Bearer ${t}` } };
      const [v, b, g, r, j] = await Promise.all([
        axios.get(`${API_URL}/master-vendor`, config),
        axios.get(`${API_URL}/master-barang`, config),
        axios.get(`${API_URL}/master-gudang`, config),
        axios.get(`${API_URL}/master-rak`, config),
        axios.get(`${API_URL}/master-jenis-barang`, config),
      ]);
      
      setMasterData({
        vendors: v.data.data || [],
        barangs: b.data.data || [],
        gudangs: g.data.data || [],
        raks: r.data.data || [],
        jenisBarangs: j.data.data || []
      });
    } catch (err) { 
        console.error("Master Data Load Error", err); 
    }
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

  // 3. Fungsi Buka Detail
  const handleOpenDetail = async (rowData) => {
    setIsLoading(true);
    try {
      const vLengkap = (masterData.vendors || []).find(v => 
        v.VENDOR_ID === rowData.VENDOR_ID || v.NAMA_VENDOR === rowData.NAMA_VENDOR
      );
      
      const updatedInvoice = {
        ...rowData,
        ALAMAT_VENDOR: vLengkap ? vLengkap.ALAMAT_VENDOR : "Alamat tidak ditemukan"
      };
      
      setSelectedInvoice(updatedInvoice);

      const [resDetail, resPay] = await Promise.all([
        axios.get(`${API_URL}/inv-pembelian/detail/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/pembayaran-beli/history/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { data: [] } })) 
      ]);

      setDetailItems(resDetail.data.data || []);
      setDetailPayments(resPay.data.data || []);
      setDetailVisible(true);
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal memuat rincian transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/inv-pembelian/full`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Transaksi Berhasil!");
        fetchPembelian(token);
        setFormVisible(false);
      }
    } catch (err) { toastRef.current?.showToast("01", "Gagal simpan"); }
  };

  const handleSavePelunasan = async (finalData) => {
    try {
      const res = await axios.post(`${API_URL}/pembayaran-beli`, finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", `Pembayaran Berhasil!`);
        setLunasVisible(false);
        fetchPembelian(token);
      }
    } catch (err) { toastRef.current?.showToast("01", "Gagal bayar"); }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Hapus invoice ${rowData.NO_INVOICE_BELI}? Stok akan dikurangi!`,
      header: 'Konfirmasi VOID',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await axios.delete(`${API_URL}/inv-pembelian/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toastRef.current?.showToast("00", "Invoice di-VOID");
          fetchPembelian(token);
        } catch (err) { toastRef.current?.showToast("01", "Gagal VOID"); }
      }
    });
  };

  const handlePrintDetail = async (rowData) => {
    setIsLoading(true);
    try {
      const vLengkap = (masterData.vendors || []).find(v => v.VENDOR_ID === rowData.VENDOR_ID);
      const resDetail = await axios.get(`${API_URL}/inv-pembelian/detail/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let dataHistoriBayar = [];
      try {
        const resPay = await axios.get(`${API_URL}/pembayaran-beli/history/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        dataHistoriBayar = resPay.data.data || [];
      } catch (e) { console.warn("No payment history"); }

      if (resDetail.data.status === "00") {
        const payloadInvoice = { ...rowData, ALAMAT_VENDOR: vLengkap?.ALAMAT_VENDOR || "Alamat tidak ditemukan" };
        const doc = generateFakturPDF(payloadInvoice, resDetail.data.data, dataHistoriBayar);
        setPdfUrl(doc.output("datauristring"));
        setFileName(`Faktur_${rowData.NO_INVOICE_BELI}.pdf`);
        setJsPdfPreviewOpen(true);
      }
    } catch (e) { toastRef.current?.showToast("01", "Gagal cetak"); } 
    finally { setIsLoading(false); }
  };

  const statusBodyTemplate = (rowData) => {
    const s = rowData.STATUS_BAYAR || "BELUM LUNAS";
    let color = s.toUpperCase() === "LUNAS" ? "success" : s.toUpperCase() === "CICIL" ? "info" : "warning";
    return <Tag value={s.toUpperCase()} severity={color} />;
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
          <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleOpenDetail(r)} tooltip="Lihat Detail" />
          {parseFloat(r.SISA_TAGIHAN) > 0 && (
            <Button icon="pi pi-credit-card" rounded severity="success" onClick={() => { setSelectedInvoice(r); setLunasVisible(true); }} tooltip="Bayar" />
          )}
          <Button icon="pi pi-file-pdf" rounded text severity="help" onClick={() => handlePrintDetail(r)} tooltip="Cetak" />
          <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(r)} tooltip="Hapus" />
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
           <span className="text-500">Monitoring stok dan pelunasan vendor</span>
        </div>
        <div className="flex gap-2">
          <Button label="Transaksi Baru" icon="pi pi-plus" severity="success" raised onClick={() => setFormVisible(true)} />
          <Button label="Cetak Rekap" icon="pi pi-print" severity="secondary" outlined onClick={() => setAdjustPrintDialog(true)} />
        </div>
      </div>

      <CustomDataTable data={dataList} columns={columns} loading={isLoading} />

      <FormPembelian visible={formVisible} onHide={() => setFormVisible(false)} onSave={handleSave} {...masterData} />
      <FormPelunasan visible={lunasVisible} onHide={() => setLunasVisible(false)} invoiceData={selectedInvoice} onSave={handleSavePelunasan} />

      <PembelianDetailDialog 
        visible={detailVisible} 
        onHide={() => setDetailVisible(false)}
        dataInvoice={selectedInvoice}
        dataDetail={detailItems}
        dataPembayaran={detailPayments}
        masterData={masterData}
        onPrint={() => handlePrintDetail(selectedInvoice)}
      />

      <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} maximizable modal style={{ width: '85vw' }} header={`Preview: ${fileName}`}>
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>

      <AdjustPrintLaporan 
        adjustDialog={adjustPrintDialog} 
        setAdjustDialog={setAdjustPrintDialog} 
        dataToPrint={dataList.map(item => {
          const vLengkap = (masterData.vendors || []).find(v => v.VENDOR_ID === item.VENDOR_ID);
          return {
            ...item,
            ALAMAT_VENDOR: vLengkap ? vLengkap.ALAMAT_VENDOR : "-"
          };
        })}
        setPdfUrl={setPdfUrl} 
        setFileName={setFileName} 
        setJsPdfPreviewOpen={setJsPdfPreviewOpen} 
        judulLaporan="LAPORAN DATA PEMBELIAN"
        columnOptions={[
          { name: "No. Invoice", value: "NO_INVOICE_BELI" },
          { name: "Vendor", value: "NAMA_VENDOR" },
          { name: "Alamat Vendor", value: "ALAMAT_VENDOR" },
          { name: "Status", value: "STATUS_BAYAR" },
          { name: "Sisa Tagihan", value: "SISA_TAGIHAN" }
        ]}
      />
    </div>
  );
}