"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormGudang from "./components/FormGudang";
import AdjustPrintLaporan from "./print/AdjustPrintLaporan";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GudangPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [gudang, setGudang] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGudang, setSelectedGudang] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const [adjustPrintDialog, setAdjustPrintDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState(null);

  const statusOptions = [
    { label: "Aktif", value: "Aktif" },
    { label: "Tidak Aktif", value: "Tidak Aktif" },
  ];

  const fetchGudang = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-gudang`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (isMounted.current && res.data.status === "00") {
        const data = res.data.data || [];
        setOriginalData(data);
        setGudang(data);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal mengambil data gudang");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchGudang(t);
    }
    return () => { isMounted.current = false; };
  }, []);

  const applyFilters = (status) => {
    let filtered = [...originalData];
    if (status) {
      filtered = filtered.filter((x) => x.STATUS === status);
    }
    setGudang(filtered);
  };

  const handleSubmit = async (data) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      /** * PERBAIKAN DI SINI:
       * Menggunakan selectedGudang.ID_GUDANG sesuai migration database
       */
      const res = selectedGudang
        ? await axios.put(`${API_URL}/master-gudang/${selectedGudang.ID_GUDANG}`, data, config)
        : await axios.post(`${API_URL}/master-gudang`, data, config);

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Data gudang berhasil disimpan");
        setDialogVisible(false);
        fetchGudang(token);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal menyimpan data");
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Terjadi kesalahan pada server");
    }
  };

  const gudangColumns = [
    { field: "KODE_GUDANG", header: "Kode", sortable: true },
    { field: "NAMA_GUDANG", header: "Nama Gudang", sortable: true },
    { field: "ALAMAT", header: "Alamat", body: (r) => r.ALAMAT || "-" },
    { 
      field: "STATUS", 
      header: "Status", 
      body: (r) => (
        <span className={`px-2 py-1 border-round text-xs font-bold ${r.STATUS === 'Aktif' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {r.STATUS}
        </span>
      ) 
    },
    {
      header: "Aksi",
      body: (r) => (
        <div className="flex gap-2">
          <Button icon="pi pi-pencil" size="small" severity="warning" tooltip="Edit" onClick={() => { setSelectedGudang(r); setDialogVisible(true); }} />
          <Button icon="pi pi-trash" size="small" severity="danger" tooltip="Hapus" onClick={() => {
            confirmDialog({
              message: `Hapus gudang ${r.NAMA_GUDANG}?`,
              header: "Konfirmasi",
              icon: "pi pi-exclamation-triangle",
              acceptClassName: "p-button-danger",
              accept: async () => {
                try {
                  /** * PERBAIKAN DI SINI:
                   * Menggunakan r.ID_GUDANG sesuai migration database
                   */
                  await axios.delete(`${API_URL}/master-gudang/${r.ID_GUDANG}`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                  });
                  toastRef.current?.showToast("00", "Gudang berhasil dihapus");
                  fetchGudang(token);
                } catch (e) { toastRef.current?.showToast("01", "Gagal menghapus data"); }
              },
            });
          }} />
        </div>
      ),
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      
      <h3 className="text-xl font-bold mb-4">Master Gudang</h3>

      <div className="flex flex-column md:flex-row justify-content-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2 align-items-center">
          <Dropdown 
            value={statusFilter} 
            options={statusOptions} 
            onChange={(e) => { setStatusFilter(e.value); applyFilters(e.value); }} 
            placeholder="Filter Status" 
            className="w-full md:w-12rem" 
            showClear 
          />
          <Button 
            icon="pi pi-filter-slash" 
            severity="secondary" 
            text 
            tooltip="Reset Filter"
            onClick={() => { setStatusFilter(null); setGudang(originalData); }} 
          />
        </div>

        <div className="flex align-items-center gap-2">
          {/* Tombol Print Tanpa Tulisan Orange (Sudah Secondary & Tanpa Label) */}
          <Button 
            icon="pi pi-print" 
            severity="secondary" 
            tooltip="Cetak Laporan" 
            tooltipOptions={{ position: 'top' }}
            onClick={() => setAdjustPrintDialog(true)} 
            disabled={gudang.length === 0}
            style={{ height: '43px', minWidth: '45px' }} 
          />
          <HeaderBar 
            placeholder="Cari Gudang..."
            onSearch={(kw) => {
              const low = kw.toLowerCase();
              setGudang(originalData.filter(x => 
                x.NAMA_GUDANG.toLowerCase().includes(low) || 
                x.KODE_GUDANG.toLowerCase().includes(low) ||
                (x.ALAMAT && x.ALAMAT.toLowerCase().includes(low))
              ));
            }} 
            onAddClick={() => { setSelectedGudang(null); setDialogVisible(true); }} 
          />
        </div>
      </div>

      <CustomDataTable data={gudang} loading={isLoading} columns={gudangColumns} />

      <FormGudang 
        visible={dialogVisible} 
        onHide={() => setDialogVisible(false)} 
        selectedGudang={selectedGudang} 
        onSave={handleSubmit} 
      />

      <AdjustPrintLaporan 
        adjustDialog={adjustPrintDialog} 
        setAdjustDialog={setAdjustPrintDialog} 
        dataToPrint={gudang} 
        judulLaporan="LAPORAN DATA MASTER GUDANG"
        setPdfUrl={setPdfUrl} 
        setFileName={setFileName} 
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        namaPenandatangan="" 
      />

      <Dialog 
        visible={jsPdfPreviewOpen} 
        onHide={() => { setJsPdfPreviewOpen(false); setPdfUrl(""); }} 
        modal 
        maximizable 
        style={{ width: "95vw", height: "95vh" }} 
        header={`Preview - ${fileName}`}
      >
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>
    </div>
  );
}