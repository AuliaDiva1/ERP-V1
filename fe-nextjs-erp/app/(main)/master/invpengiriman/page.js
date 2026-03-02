"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import dynamic from "next/dynamic";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";

// Import Komponen & Fungsi
import { generateSuratJalan } from "./print/PengirimanPDF";
import PengirimanDetailDialog from "./components/PengirimanDetailDialog";
import FormPengiriman from "./components/FormPengiriman";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PengirimanPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState("");
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [masterBarang, setMasterBarang] = useState([]);
  const [perusahaan, setPerusahaan] = useState(null);

  // UI State
  const [pdfUrl, setPdfUrl] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // Data Selection State
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]); 
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (t) {
      setToken(t);
      refreshData(t);
    } else {
      window.location.href = "/login";
    }
  }, []);

  const refreshData = async (t) => {
    setIsLoading(true);
    try {
      const [resPengiriman, resCust, resBarang, resPerusahaan] = await Promise.all([
        axios.get(`${API_URL}/inv-pengiriman`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_URL}/master-customer`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_URL}/master-barang`, { headers: { Authorization: `Bearer ${t}` } }),
        axios.get(`${API_URL}/master-perusahaan`, { headers: { Authorization: `Bearer ${t}` } }) 
      ]);

      setDataList(resPengiriman.data.data || []);
      setCustomers(resCust.data.data || []);
      setMasterBarang(resBarang.data.data || []);
      
      const dataP = resPerusahaan.data.data;
      setPerusahaan(Array.isArray(dataP) ? dataP[0] : dataP);
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal sinkronisasi data dengan server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = async (rowData) => {
    setSelectedShipment(rowData);
    setDetails([]); 
    setDetailVisible(true);
    try {
      const noSjSafe = encodeURIComponent(rowData.NO_PENGIRIMAN);
      const res = await axios.get(`${API_URL}/inv-pengiriman/detail/${noSjSafe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetails(res.data.data || []);
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal memuat rincian barang");
    }
  };

  const handlePrintSJ = async (rowData) => {
    setIsLoading(true);
    try {
      const noSjSafe = encodeURIComponent(rowData.NO_PENGIRIMAN);
      const res = await axios.get(`${API_URL}/inv-pengiriman/detail/${noSjSafe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.data.data || res.data.data.length === 0) {
        toastRef.current?.showToast("01", "Barang kosong, cetak dibatalkan");
        return;
      }

      // MENCARI DATA LENGKAP DARI master_customer
      const custFullInfo = customers.find(c => c.KODE_CUSTOMER === rowData.KODE_PELANGGAN);
      
      const doc = generateSuratJalan(
        { 
          ...rowData, 
          // Ambil data detail dari master_customer jika ditemukan
          NAMA_CUSTOMER: custFullInfo?.NAMA_CUSTOMER || rowData.NAMA_CUSTOMER || "General Customer",
          ALAMAT: custFullInfo?.ALAMAT || rowData.ALAMAT_TUJUAN,
          NO_TELP: custFullInfo?.NO_TELP || "-",
          EMAIL: custFullInfo?.EMAIL || "-"
        }, 
        res.data.data,
        perusahaan 
      );
      
      setPdfUrl(doc.output("datauristring"));
      setJsPdfPreviewOpen(true);
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal mengolah dokumen PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Hapus permanent SJ: ${rowData.NO_PENGIRIMAN}?`,
      header: 'Konfirmasi Pembatalan',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteData(rowData.ID_PENGIRIMAN_H)
    });
  };

  const deleteData = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/inv-pengiriman/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toastRef.current?.showToast("00", "Data dihapus");
      refreshData(token);
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal hapus data");
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveNewPengiriman = async (payload) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/inv-pengiriman/full`, payload, { headers: { Authorization: `Bearer ${token}` } });
      toastRef.current?.showToast("00", "SJ Berhasil Dibuat!");
      setFormVisible(false);
      refreshData(token);
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal menyimpan");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { selectionMode: "multiple", style: { width: "3rem" } },
    { field: "NO_PENGIRIMAN", header: "No. Surat Jalan", sortable: true, filter: true },
    { field: "NAMA_CUSTOMER", header: "Pelanggan", body: (r) => r.NAMA_CUSTOMER || r.KODE_PELANGGAN },
    { 
      field: "TGL_KIRIM", 
      header: "Tgl Kirim", 
      body: (r) => new Date(r.TGL_KIRIM).toLocaleDateString("id-ID") 
    },
    { 
      header: "Aksi", 
      style: { width: '12rem' },
      body: (r) => (
        <div className="flex gap-1">
            <Button icon="pi pi-search" rounded text severity="info" onClick={() => handleViewDetail(r)} />
            <Button icon="pi pi-print" rounded text severity="help" onClick={() => handlePrintSJ(r)} />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDelete(r)} />
        </div>
      )
    }
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      
      <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="font-bold text-primary m-0">Logistik: Pengiriman Barang</h2>
            <small className="text-gray-500">Perusahaan: {perusahaan?.NAMA_PERUSAHAAN}</small>
          </div>
          <Button label="Buat Pengiriman" icon="pi pi-plus" severity="success" onClick={() => setFormVisible(true)} />
      </div>

      <CustomDataTable data={dataList} columns={columns} loading={isLoading} selection={selectedRows} onSelectionChange={(e) => setSelectedRows(e.value)} paginator rows={10} />

      <Dialog visible={formVisible} onHide={() => setFormVisible(false)} header="Input Baru" style={{ width: '90vw' }} modal maximizable>
          <FormPengiriman masterData={{ customers, barangs: masterBarang }} onSave={onSaveNewPengiriman} onCancel={() => setFormVisible(false)} loading={isLoading} />
      </Dialog>

      <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} maximizable modal style={{ width: '80vw' }} header="Surat Jalan">
        {pdfUrl ? <PDFViewer pdfUrl={pdfUrl} /> : <div className="text-center">Loading...</div>}
      </Dialog>

      <PengirimanDetailDialog visible={detailVisible} onHide={() => setDetailVisible(false)} dataPengiriman={selectedShipment} dataDetail={details} />
    </div>
  );
}