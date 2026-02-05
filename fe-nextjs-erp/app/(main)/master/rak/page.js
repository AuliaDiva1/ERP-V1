"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";
import FormRak from "./components/FormRak"; 
import AdjustPrintLaporan from "./print/AdjustPrintLaporan";

// Import PDFViewer secara dinamis untuk menghindari error SSR (Server Side Rendering)
const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="4" />
    </div>
  ),
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RakPage() {
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  // --- DATA STATES ---
  const [token, setToken] = useState("");
  const [rak, setRak] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [gudangList, setGudangList] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- DIALOG & SELECTION STATES ---
  const [selectedRak, setSelectedRak] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 

  // --- PRINT & PDF STATES (SOLUSI ERROR REFERENCEERROR) ---
  const [adjustPrintDialog, setAdjustPrintDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // 1. Fungsi Fetch Data (Gunakan useCallback agar tidak looping)
  const fetchData = useCallback(async (t) => {
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${t}` } };
      
      // Ambil data rak dan gudang secara paralel
      const [resRak, resGudang] = await Promise.all([
        axios.get(`${API_URL}/master-rak`, config),
        axios.get(`${API_URL}/master-gudang`, config)
      ]);

      if (isMounted.current) {
        const dataRak = resRak.data.data || [];
        setOriginalData(dataRak);
        setGudangList(resGudang.data.data || []);
        
        // Tetap terapkan filter jika user sedang mencari sesuatu
        if (searchTerm) {
          const low = searchTerm.toLowerCase();
          const filtered = dataRak.filter(x => 
            x.KODE_RAK?.toLowerCase().includes(low) || 
            x.NAMA_RAK?.toLowerCase().includes(low) ||
            x.NAMA_GUDANG?.toLowerCase().includes(low)
          );
          setRak(filtered);
        } else {
          setRak(dataRak);
        }
      }
    } catch (err) {
      if (err.response?.status === 401) {
        window.location.href = "/";
      }
      toastRef.current?.showToast("01", "Gagal mengambil data dari server");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) {
      window.location.href = "/";
    } else {
      setToken(t);
      fetchData(t);
    }
    return () => { isMounted.current = false; };
  }, [fetchData]);

  // 2. Handle Simpan (Tambah/Edit)
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const res = selectedRak
        ? await axios.put(`${API_URL}/master-rak/${selectedRak.ID_RAK}`, data, config)
        : await axios.post(`${API_URL}/master-rak`, data, config);

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Data rak berhasil disimpan");
        setDialogVisible(false);
        fetchData(token);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal menyimpan data");
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Definisi Kolom Tabel
  const rakColumns = [
    { field: "KODE_RAK", header: "Kode Rak", sortable: true },
    { field: "NAMA_RAK", header: "Nama Rak", body: (r) => r.NAMA_RAK || "-" },
    { field: "KODE_GUDANG", header: "Kode Gudang", sortable: true },
    { 
      field: "NAMA_GUDANG", 
      header: "Lokasi Gudang", 
      sortable: true,
      body: (r) => (
        <span className="font-bold text-blue-600">
          {r.NAMA_GUDANG || "Gudang Tidak Ditemukan"}
        </span>
      )
    },
    {
      header: "Aksi",
      body: (r) => (
        <div className="flex gap-2">
          <Button 
            icon="pi pi-pencil" 
            size="small" 
            severity="warning" 
            onClick={() => { setSelectedRak(r); setDialogVisible(true); }} 
          />
          <Button 
            icon="pi pi-trash" 
            size="small" 
            severity="danger" 
            onClick={() => {
              confirmDialog({
                message: `Hapus rak ${r.KODE_RAK}?`,
                header: "Konfirmasi",
                acceptClassName: "p-button-danger",
                accept: async () => {
                  try {
                    await axios.delete(`${API_URL}/master-rak/${r.ID_RAK}`, { 
                      headers: { Authorization: `Bearer ${token}` } 
                    });
                    toastRef.current?.showToast("00", "Berhasil dihapus");
                    fetchData(token);
                  } catch (e) {
                    toastRef.current?.showToast("01", e.response?.data?.message || "Gagal menghapus");
                  }
                },
              });
            }} 
          />
        </div>
      ),
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      
      <div className="flex align-items-center justify-content-between mb-4">
        <h3 className="text-xl font-bold m-0">Master Rak</h3>
      </div>

      <div className="flex flex-column md:flex-row justify-content-between gap-4 mb-4">
        <div className="flex align-items-center gap-2">
          <Button 
            icon="pi pi-print" 
            severity="secondary" 
            tooltip="Cetak PDF" 
            onClick={() => setAdjustPrintDialog(true)} 
            disabled={rak.length === 0}
            className="p-button-outlined"
            style={{ height: '43px' }}
          />
          <HeaderBar 
            placeholder="Cari Rak, Gudang..."
            onSearch={(kw) => {
              setSearchTerm(kw);
              const low = kw.toLowerCase();
              setRak(originalData.filter(x => 
                x.KODE_RAK?.toLowerCase().includes(low) || 
                x.NAMA_RAK?.toLowerCase().includes(low) ||
                x.NAMA_GUDANG?.toLowerCase().includes(low)
              ));
            }} 
            onAddClick={() => { setSelectedRak(null); setDialogVisible(true); }} 
          />
        </div>
      </div>

      <CustomDataTable 
        data={rak} 
        loading={isLoading} 
        columns={rakColumns} 
        rows={10}
      />

      {/* Form Dialog */}
      <FormRak 
        visible={dialogVisible} 
        onHide={() => setDialogVisible(false)} 
        selectedData={selectedRak} 
        onSave={handleSubmit} 
        gudangList={gudangList}
        loading={isSubmitting}
      />

      {/* Print Setup Dialog */}
      <AdjustPrintLaporan 
        adjustDialog={adjustPrintDialog} 
        setAdjustDialog={setAdjustPrintDialog} 
        dataToPrint={rak} 
        judulLaporan="LAPORAN DATA MASTER RAK"
        setPdfUrl={setPdfUrl} 
        setFileName={setFileName} 
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        namaPenandatangan="" 
      />

      {/* Preview PDF Dialog */}
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