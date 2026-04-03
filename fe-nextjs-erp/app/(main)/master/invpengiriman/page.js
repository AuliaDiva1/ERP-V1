"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import dynamic from "next/dynamic";

import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import { generateSuratJalan } from "./print/PengirimanPDF";
import PengirimanDetailDialog from "./components/PengirimanDetailDialog";
import FormPengiriman from "./components/FormPengiriman";
import AdjustPrintPengiriman from "./print/AdjustPrintPengiriman";

const PDFViewer = dynamic(() => import("./print/PDFViewer"), { ssr: false });
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PengirimanPage() {
  const toastRef = useRef(null);
  const [token, setToken] = useState("");
  const [dataList, setDataList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [masterBarang, setMasterBarang] = useState([]);
  const [masterGudang, setMasterGudang] = useState([]);
  const [masterRak, setMasterRak] = useState([]);
  const [stokLokasi, setStokLokasi] = useState([]);
  const [perusahaan, setPerusahaan] = useState(null);

  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [adjustPrintDialog, setAdjustPrintDialog] = useState(false);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (t) { setToken(t); refreshData(t); }
    else window.location.href = "/login";
  }, []);

  const refreshData = async (t) => {
    setIsLoading(true);
    try {
      const [resPengiriman, resCust, resBarang, resPerusahaan, resStok, resGudang, resRak] =
        await Promise.all([
          axios.get(`${API_URL}/inv-pengiriman`,       { headers: { Authorization: `Bearer ${t}` } }),
          axios.get(`${API_URL}/master-customer`,      { headers: { Authorization: `Bearer ${t}` } }),
          axios.get(`${API_URL}/master-barang`,        { headers: { Authorization: `Bearer ${t}` } }),
          axios.get(`${API_URL}/master-perusahaan`,    { headers: { Authorization: `Bearer ${t}` } }),
          axios.get(`${API_URL}/stok-lokasi`,          { headers: { Authorization: `Bearer ${t}` } }),
          axios.get(`${API_URL}/master-gudang`,        { headers: { Authorization: `Bearer ${t}` } }),
          axios.get(`${API_URL}/master-rak`,           { headers: { Authorization: `Bearer ${t}` } }),
        ]);

      setDataList(resPengiriman.data.data || []);
      setCustomers(resCust.data.data || []);
      setMasterBarang(resBarang.data.data || []);
      setStokLokasi(resStok.data.data || []);
      setMasterGudang(resGudang.data.data || []);
      setMasterRak(resRak.data.data || []);
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
      const res = await axios.get(
        `${API_URL}/inv-pengiriman/detail/${encodeURIComponent(rowData.NO_PENGIRIMAN)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetails(res.data.data || []);
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal memuat rincian barang");
    }
  };

  const handlePrintSJ = async (rowData) => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/inv-pengiriman/detail/${encodeURIComponent(rowData.NO_PENGIRIMAN)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.data.data || res.data.data.length === 0) {
        toastRef.current?.showToast("01", "Barang kosong, cetak dibatalkan");
        return;
      }
      const custFullInfo = customers.find(c => c.KODE_CUSTOMER === rowData.KODE_PELANGGAN);
      const doc = generateSuratJalan(
        {
          ...rowData,
          NAMA_CUSTOMER: custFullInfo?.NAMA_CUSTOMER || rowData.NAMA_CUSTOMER || "General Customer",
          ALAMAT: custFullInfo?.ALAMAT || rowData.ALAMAT_TUJUAN,
          NO_TELP: custFullInfo?.NO_TELP || "-",
          EMAIL: custFullInfo?.EMAIL || "-",
        },
        res.data.data,
        perusahaan
      );
      setPdfUrl(doc.output("datauristring"));
      setFileName(`SJ_${rowData.NO_PENGIRIMAN}.pdf`);
      setJsPdfPreviewOpen(true);
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal mengolah dokumen PDF");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (rowData) => {
    confirmDialog({
      message: `Hapus permanent SJ: ${rowData.NO_PENGIRIMAN}? Stok akan dikembalikan.`,
      header: "Konfirmasi Pembatalan",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => deleteData(rowData.ID_PENGIRIMAN_H),
    });
  };

  const deleteData = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/inv-pengiriman/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toastRef.current?.showToast("00", "Data dihapus & stok dikembalikan");
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
      await axios.post(`${API_URL}/inv-pengiriman/full`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toastRef.current?.showToast("00", "Surat Jalan Berhasil Dibuat!");
      setFormVisible(false);
      refreshData(token);
    } catch (e) {
      const msg = e.response?.data?.message || "Gagal menyimpan — cek stok barang";
      toastRef.current?.showToast("01", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "diterima": return "success";
      case "dikirim":  return "info";
      case "diproses": return "warning";
      default:         return "secondary";
    }
  };

  const columns = [
    { field: "NO_PENGIRIMAN", header: "No. Surat Jalan", sortable: true, filter: true },
    { field: "NAMA_CUSTOMER", header: "Pelanggan", body: (r) => r.NAMA_CUSTOMER || r.KODE_PELANGGAN, sortable: true },
    {
      field: "TGL_KIRIM", header: "Tgl Kirim", sortable: true,
      body: (r) => r.TGL_KIRIM ? new Date(r.TGL_KIRIM).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-",
    },
    {
      field: "STATUS_KIRIM", header: "Status",
      body: (r) => <Tag value={r.STATUS_KIRIM || "Diproses"} severity={getStatusSeverity(r.STATUS_KIRIM)} />,
      sortable: true,
    },
    {
      header: "Aksi", style: { width: "10rem" },
      body: (r) => (
        <div className="flex gap-1">
          <Button icon="pi pi-eye"   rounded text severity="info"   onClick={() => handleViewDetail(r)} tooltip="Lihat Detail" />
          <Button icon="pi pi-print" rounded text severity="help"   onClick={() => handlePrintSJ(r)}   tooltip="Cetak SJ" />
          <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDelete(r)}    tooltip="Hapus" />
        </div>
      ),
    },
  ];

  return (
    <div className="card p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="font-bold text-primary m-0">Logistik: Pengiriman Barang</h2>
          <small className="text-gray-500">Perusahaan: {perusahaan?.NAMA_PERUSAHAAN || "-"}</small>
        </div>
        <div className="flex gap-2">
          <Button label="Buat Pengiriman" icon="pi pi-plus" severity="success" onClick={() => setFormVisible(true)} />
          <Button label="Cetak Rekap"     icon="pi pi-print" severity="secondary" outlined onClick={() => setAdjustPrintDialog(true)} />
        </div>
      </div>

      <CustomDataTable
        data={dataList} columns={columns} loading={isLoading}
        selection={selectedRows} onSelectionChange={(e) => setSelectedRows(e.value)}
        paginator rows={10}
      />

      <Dialog visible={formVisible} onHide={() => setFormVisible(false)} header="Buat Surat Jalan Baru" style={{ width: "90vw" }} modal maximizable>
        <FormPengiriman
          masterData={{ customers, barangs: masterBarang, gudangs: masterGudang, raks: masterRak, stokLokasi }}
          onSave={onSaveNewPengiriman}
          onCancel={() => setFormVisible(false)}
          loading={isLoading}
        />
      </Dialog>

      <PengirimanDetailDialog
        visible={detailVisible}
        onHide={() => setDetailVisible(false)}
        dataPengiriman={selectedShipment}
        dataDetail={details}
        customers={customers}
        perusahaan={perusahaan}
        onPrint={handlePrintSJ}
      />

      <Dialog visible={jsPdfPreviewOpen} onHide={() => setJsPdfPreviewOpen(false)} maximizable modal style={{ width: "80vw" }} header={`Preview: ${fileName}`}>
        {pdfUrl ? <PDFViewer pdfUrl={pdfUrl} fileName={fileName} /> : <div className="text-center p-4">Loading...</div>}
      </Dialog>

      <AdjustPrintPengiriman
        adjustDialog={adjustPrintDialog} setAdjustDialog={setAdjustPrintDialog}
        dataToPrint={dataList} setPdfUrl={setPdfUrl} setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />
    </div>
  );
}
