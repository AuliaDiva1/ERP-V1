"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext"; // Pakai InputText langsung agar lebih fleksibel
import dynamic from "next/dynamic";

// Import Komponen Pendukung
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import { generateStokPDF } from "./print/PrintStok";

const PDFViewer = dynamic(() => import("../../master/stok-lokasi/print/PDFViewer"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function StokLokasiPage() {
  const toastRef = useRef(null);
  const [dataList, setDataList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const fetchStok = async () => {
    setIsLoading(true);
    try {
      const t = localStorage.getItem("TOKEN");
      const res = await axios.get(`${API_URL}/stok-lokasi`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const data = res.data.data || [];
      setDataList(data);
      setOriginalData(data);
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal mengambil data stok");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStok();
  }, []);

  // Fungsi Search Langsung
  const onSearch = (e) => {
    const val = e.target.value;
    setGlobalFilter(val);
    if (!val) {
      setDataList(originalData);
    } else {
      const filtered = originalData.filter((item) =>
        Object.values(item).some((v) => String(v).toLowerCase().includes(val.toLowerCase()))
      );
      setDataList(filtered);
    }
  };

  const handlePrint = () => {
    if (dataList.length === 0) return toastRef.current?.showToast("01", "Tidak ada data");
    const doc = generateStokPDF(dataList);
    setPdfUrl(doc.output("datauristring"));
    setJsPdfPreviewOpen(true);
  };

  const columns = [
    { field: "BARANG_KODE", header: "Kode", sortable: true, style: { width: '120px' } },
    { field: "NAMA_BARANG", header: "Nama Barang", sortable: true },
    { field: "NAMA_GUDANG", header: "Gudang", sortable: true },
    { field: "NAMA_RAK", header: "Rak", sortable: true },
    { field: "BATCH_NO", header: "Batch No", body: (r) => <span className="font-mono text-sm">{r.BATCH_NO || "-"}</span> },
    { 
      field: "QTY", 
      header: "Stok", 
      body: (r) => (
        <div className={`p-2 text-center border-round font-bold ${r.QTY <= 5 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`} style={{ minWidth: '50px' }}>
          {r.QTY}
        </div>
      ),
      sortable: true,
      style: { width: '80px' }
    },
    { 
      field: "TGL_KADALUARSA", 
      header: "Exp Date", 
      body: (r) => r.TGL_KADALUARSA ? <span className={new Date(r.TGL_KADALUARSA) < new Date() ? 'text-red-500 font-bold' : ''}>{new Date(r.TGL_KADALUARSA).toLocaleDateString("id-ID")}</span> : "-" 
    },
  ];

  return (
    <div className="card p-4 shadow-2 border-round-xl bg-white">
      <ToastNotifier ref={toastRef} />
      
      {/* JUDUL HALAMAN */}
      <div className="flex align-items-center gap-3 mb-4">
        <div className="bg-orange-500 p-3 border-round-lg shadow-2">
          <i className="pi pi-box text-white text-2xl"></i>
        </div>
        <div>
          <h2 className="font-bold m-0 text-900 text-2xl">Stok Per Lokasi</h2>
          <span className="text-600 font-medium">Monitoring inventory Stok Lokasi</span>
        </div>
      </div>

      {/* TOOLBAR: SEARCH & PRINT DALAM SATU BARIS */}
      <div className="flex flex-column md:flex-row justify-content-between align-items-center gap-3 mb-4 p-3 bg-gray-50 border-round-lg">
        
        {/* Kolom Pencarian */}
        <span className="p-input-icon-left w-full md:w-30rem">
          <i className="pi pi-search" />
          <InputText 
            value={globalFilter} 
            onChange={onSearch} 
            placeholder="Cari berdasarkan Kode, Nama, Gudang atau Batch..." 
            className="w-full border-round-lg"
          />
        </span>

        {/* Tombol Aksi */}
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            icon="pi pi-refresh" 
            className="p-button-outlined p-button-secondary border-round-lg" 
            onClick={fetchStok} 
            loading={isLoading} 
          />
          <Button 
            icon="pi pi-print" 
            severity="warning" 
            raised 
            className="font-bold border-round-lg shadow-2 flex-grow-1 md:flex-grow-0"
            onClick={handlePrint} 
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <CustomDataTable 
        data={dataList} 
        columns={columns} 
        loading={isLoading} 
        stripedRows 
        rowHover
        emptyMessage="Data stok tidak ditemukan"
      />

      {/* PREVIEW DIALOG */}
      <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} maximizable modal style={{ width: '85vw' }} header="Preview Laporan Stok">
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName="Laporan_Stok.pdf" />}
      </Dialog>
    </div>
  );
}