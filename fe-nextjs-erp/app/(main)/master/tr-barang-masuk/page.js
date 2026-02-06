"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import dynamic from "next/dynamic";

import ToastNotifier from "../../../components/ToastNotifier";
import HeaderBar from "../../../components/headerbar";
import CustomDataTable from "../../../components/DataTable";

// Import Komponen (Pastikan Path Benar)
import FormBarangMasuk from "./components/FormBarangMasuk"; 
import AdjustPrintLaporanBarangMasuk from "./print/AdjustPrintLaporanBarangMasuk"; 

const PDFViewer = dynamic(() => import("./print/PDFViewer"), {
  loading: () => <ProgressSpinner style={{ width: "50px", height: "50px" }} />,
  ssr: false,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BarangMasukPage() {
  const router = useRouter();
  const toastRef = useRef(null);
  const isMounted = useRef(true);

  const [token, setToken] = useState("");
  const [listMasuk, setListMasuk] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [masterBarang, setMasterBarang] = useState([]);
  const [masterGudang, setMasterGudang] = useState([]);
  const [masterRak, setMasterRak] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [adjustPrintDialog, setAdjustPrintDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) { router.push("/"); } else { setToken(t); }
    return () => { isMounted.current = false; };
  }, [router]);

  const fetchInitialData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resMasuk, resBarang, resGudang, resRak] = await Promise.all([
        axios.get(`${API_URL}/tr-barang-masuk`, { headers }),
        axios.get(`${API_URL}/master-barang`, { headers }),
        axios.get(`${API_URL}/master-gudang`, { headers }),
        axios.get(`${API_URL}/master-rak`, { headers }),
      ]);

      if (isMounted.current && resMasuk.data.status === "00") {
        setListMasuk(resMasuk.data.data || []);
        setOriginalData(resMasuk.data.data || []);
        setMasterBarang(resBarang.data.data || []);
        setMasterGudang(resGudang.data.data || []);
        setMasterRak(resRak.data.data || []);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal fetch data");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSave = async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/tr-barang-masuk`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Data berhasil disimpan");
        setDialogVisible(false);
        fetchInitialData();
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal simpan data");
    }
  };

  const columns = [
    { field: "NO_MASUK", header: "No. Transaksi", sortable: true },
    { field: "NAMA_BARANG", header: "Barang" },
    { field: "QTY", header: "Qty", body: (r) => <b>{r.QTY}</b> },
    { field: "NAMA_GUDANG", header: "Gudang" },
    { field: "BATCH_NO", header: "Batch" },
    { 
      header: "Aksi", 
      body: (r) => (
        <Button icon="pi pi-trash" severity="danger" size="small" 
          onClick={() => confirmDialog({
            message: `Hapus ${r.NO_MASUK}?`,
            accept: () => axios.delete(`${API_URL}/tr-barang-masuk/${r.ID_MASUK}`, { headers: { Authorization: `Bearer ${token}` }}).then(fetchInitialData)
          })} 
        />
      ) 
    }
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />
      <h3 className="text-xl font-semibold mb-3">Transaksi Barang Masuk</h3>

      <div className="flex gap-2 mb-4">
        <div className="flex-grow-1">
          <HeaderBar 
            placeholder="Cari..." 
            onSearch={(k) => setListMasuk(originalData.filter(i => i.NAMA_BARANG.toLowerCase().includes(k.toLowerCase())))} 
            onAddClick={() => setDialogVisible(true)} 
            showAddButton={true} 
          />
        </div>
        <Button icon="pi pi-print" severity="success" onClick={() => setAdjustPrintDialog(true)} style={{ height: '43px' }} />
      </div>

      <CustomDataTable data={listMasuk} loading={isLoading} columns={columns} />

      {/* RENDER DENGAN PROTEKSI TYPE CHECK */}
      {typeof FormBarangMasuk === 'function' && (
        <FormBarangMasuk
          visible={dialogVisible}
          onHide={() => setDialogVisible(false)}
          onSave={handleSave}
          masterBarang={masterBarang}
          masterGudang={masterGudang}
          masterRak={masterRak}
        />
      )}

      {/* BAGIAN YANG SERING ERROR: Pastikan Export Default di filenya! */}
      {typeof AdjustPrintLaporanBarangMasuk === 'function' && (
        <AdjustPrintLaporanBarangMasuk
          adjustDialog={adjustPrintDialog}
          setAdjustDialog={setAdjustPrintDialog}
          dataToPrint={listMasuk}
          setPdfUrl={setPdfUrl}
          setFileName={setFileName}
          setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        />
      )}

      <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} maximizable modal style={{ width: '95vw', height: '95vh' }} header="Preview Laporan">
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>
    </div>
  );
}