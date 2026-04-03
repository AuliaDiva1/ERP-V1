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

  const [masterData, setMasterData] = useState({
    vendors: [],
    barangs: [],
    gudangs: [],
    raks: [],
    jenisBarangs: [],
  });

  const [formVisible, setFormVisible] = useState(false);
  const [lunasVisible, setLunasVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItems, setDetailItems] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);
  const [adjustPrintDialog, setAdjustPrintDialog] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (t) {
      setToken(t);
      fetchPembelian(t);
      fetchMasterData(t);
    }
  }, []);

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
        jenisBarangs: j.data.data || [],
      });
    } catch (err) {
      console.error("Master Data Load Error", err);
    }
  };

  const fetchPembelian = async (t) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/inv-pembelian`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      setDataList(res.data.data || []);
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal mengambil data transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================================
  // FETCH DETAIL & PAYMENT HISTORY — bisa dipanggil ulang setelah bayar
  // =====================================================================
  const fetchDetailAndHistory = async (noInvoice) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const [resDetail, resHistory] = await Promise.all([
      axios.get(`${API_URL}/inv-pembelian/detail/${encodeURIComponent(noInvoice)}`, config),
      axios
        .get(`${API_URL}/pembayaran-beli/history/${encodeURIComponent(noInvoice)}`, config)
        .catch(() => ({ data: { data: [] } })),
    ]);
    return { resDetail, resHistory };
  };

  const handleShowDetail = async (rowData) => {
    setIsLoading(true);
    try {
      const { resDetail, resHistory } = await fetchDetailAndHistory(rowData.NO_INVOICE_BELI);
      if (resDetail.data.status === "00") {
        setDetailItems(resDetail.data.data);
        setPaymentHistory(resHistory.data.data || []);
        setSelectedInvoice(rowData);
        setDetailVisible(true);
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal mengambil data detail lengkap");
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================================
  // BUKA FORM BAYAR — bisa dari tabel MAUPUN dari dalam modal detail
  // =====================================================================
  const handleOpenBayar = (invoiceRow) => {
    setSelectedInvoice(invoiceRow);
    setLunasVisible(true);
  };

  const handleSave = async (payload) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/inv-pembelian/full`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00" || res.status === 201) {
        if (payload.items && payload.items.length > 0) {
          const syncPromises = payload.items.map((item) => {
            const payloadBM = {
              NO_MASUK: String(payload.header.NO_INVOICE_BELI),
              BARANG_KODE: item.BARANG_KODE,
              KODE_GUDANG: item.KODE_GUDANG,
              KODE_RAK: item.KODE_RAK,
              QTY: parseFloat(item.QTY_BELI || 0),
              BATCH_NO: String(item.BATCH_NO || "1"),
              TGL_KADALUARSA: item.TGL_KADALUARSA || null,
            };
            return axios
              .post(`${API_URL}/tr-barang-masuk`, payloadBM, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .catch((e) => console.error("Gagal sync stok", item.BARANG_KODE));
          });
          await Promise.all(syncPromises);
        }
        toastRef.current?.showToast("00", "Transaksi & Stok Berhasil Disimpan!");
        fetchPembelian(token);
        setFormVisible(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Gagal menyimpan transaksi";
      toastRef.current?.showToast("01", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================================
  // SAVE PELUNASAN — setelah sukses, refresh list + selectedInvoice + detail
  // =====================================================================
  const handleSavePelunasan = async (finalData) => {
    try {
      const res = await axios.post(`${API_URL}/pembayaran-beli`, finalData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.status === "00") {
        toastRef.current?.showToast("00", "Pembayaran Berhasil!");
        setLunasVisible(false);

        // 1. Refresh list tabel utama
        const resAll = await axios.get(`${API_URL}/inv-pembelian`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const freshList = resAll.data.data || [];
        setDataList(freshList);

        // 2. Cari data invoice terbaru dari list (agar SISA_TAGIHAN update)
        const freshInvoice = freshList.find(
          (d) => d.NO_INVOICE_BELI === finalData.NO_INVOICE_BELI
        );
        if (freshInvoice) {
          setSelectedInvoice(freshInvoice);
        }

        // 3. Jika modal detail sedang terbuka → refresh riwayat bayar juga
        if (detailVisible) {
          const { resDetail, resHistory } = await fetchDetailAndHistory(
            finalData.NO_INVOICE_BELI
          );
          if (resDetail.data.status === "00") {
            setDetailItems(resDetail.data.data);
            setPaymentHistory(resHistory.data.data || []);
          }
        }
      }
    } catch (err) {
      toastRef.current?.showToast("01", "Gagal mencatat pembayaran");
    }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Hapus invoice ${rowData.NO_INVOICE_BELI}? Stok akan ditarik kembali!`,
      header: "Konfirmasi VOID",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await axios.delete(
            `${API_URL}/inv-pembelian/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toastRef.current?.showToast("00", "Invoice Berhasil di-VOID");
          fetchPembelian(token);
        } catch (err) {
          toastRef.current?.showToast(
            "01",
            "Gagal hapus: Data sudah ada relasi pembayaran"
          );
        }
      },
    });
  };

  const handlePrintDetail = async (rowData) => {
    setIsLoading(true);
    try {
      const vLengkap = masterData.vendors.find(
        (v) =>
          v.VENDOR_ID === rowData.VENDOR_ID || v.NAMA_VENDOR === rowData.NAMA_VENDOR
      );
      const dataWithVendor = {
        ...rowData,
        ALAMAT_VENDOR: vLengkap?.ALAMAT_VENDOR || "Alamat tidak tersedia",
      };

      const [resDetail, resHistory] = await Promise.all([
        axios.get(
          `${API_URL}/inv-pembelian/detail/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios
          .get(
            `${API_URL}/pembayaran-beli/history/${encodeURIComponent(rowData.NO_INVOICE_BELI)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch(() => ({ data: { data: [] } })),
      ]);

      if (resDetail.data.status === "00") {
        const doc = generateFakturPDF(
          dataWithVendor,
          resDetail.data.data,
          resHistory.data.data || []
        );
        setPdfUrl(doc.output("datauristring"));
        setFileName(`Faktur_${rowData.NO_INVOICE_BELI}.pdf`);
        setJsPdfPreviewOpen(true);
      }
    } catch (e) {
      toastRef.current?.showToast("01", "Gagal memproses cetak faktur");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { field: "NO_INVOICE_BELI", header: "No. Invoice", sortable: true },
    { field: "NAMA_VENDOR", header: "Vendor", sortable: true },
    {
      field: "STATUS_BAYAR",
      header: "Status",
      body: (r) => {
        const s = r.STATUS_BAYAR || "BELUM LUNAS";
        let sev =
          s.toUpperCase() === "LUNAS"
            ? "success"
            : s.toUpperCase() === "CICIL"
            ? "info"
            : "warning";
        return <Tag value={s.toUpperCase()} severity={sev} />;
      },
      sortable: true,
    },
    {
      field: "SISA_TAGIHAN",
      header: "Sisa Tagihan",
      body: (r) => (
        <span
          className={`font-bold ${
            r.SISA_TAGIHAN > 0 ? "text-red-500" : "text-green-600"
          }`}
        >
          Rp {new Intl.NumberFormat("id-ID").format(r.SISA_TAGIHAN)}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Aksi",
      body: (r) => (
        <div className="flex gap-2">
          <Button
            icon="pi pi-eye"
            rounded
            text
            onClick={() => handleShowDetail(r)}
            tooltip="Lihat Detail"
          />
          {parseFloat(r.SISA_TAGIHAN) > 0 && (
            <Button
              icon="pi pi-credit-card"
              rounded
              severity="success"
              onClick={() => handleOpenBayar(r)}
              tooltip="Bayar"
            />
          )}
          <Button
            icon="pi pi-file-pdf"
            rounded
            text
            severity="help"
            onClick={() => handlePrintDetail(r)}
            tooltip="Cetak PDF"
          />
          <Button
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            onClick={() => handleDelete(r)}
            tooltip="Void"
          />
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
          <h2 className="font-bold m-0 text-primary">Manajemen Pembelian</h2>
          <span className="text-500">Monitor stok & hutang vendor</span>
        </div>
        <div className="flex gap-2">
          <Button
            label="Transaksi Baru"
            icon="pi pi-plus"
            severity="success"
            onClick={() => setFormVisible(true)}
          />
          <Button
            label="Cetak Rekap"
            icon="pi pi-print"
            severity="secondary"
            outlined
            onClick={() => setAdjustPrintDialog(true)}
          />
        </div>
      </div>

      <CustomDataTable data={dataList} columns={columns} loading={isLoading} />

      <FormPembelian
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSave={handleSave}
        {...masterData}
      />

      {/* 
        DetailPage sekarang menerima prop onBayar 
        agar tombol bayar bisa diakses dari dalam modal detail 
      */}
      <PembelianDetailDialog
        visible={detailVisible}
        onHide={() => setDetailVisible(false)}
        dataInvoice={selectedInvoice}
        dataDetail={detailItems}
        dataPembayaran={paymentHistory}
        masterData={masterData}
        onBayar={handleOpenBayar}
      />

      <FormPelunasan
        visible={lunasVisible}
        onHide={() => setLunasVisible(false)}
        invoiceData={selectedInvoice}
        onSave={handleSavePelunasan}
      />

      <Dialog
        visible={jsPdfPreviewOpen}
        onHide={() => setJsPdfPreviewOpen(false)}
        maximizable
        modal
        style={{ width: "85vw" }}
        header={`Preview: ${fileName}`}
      >
        {pdfUrl && <PDFViewer pdfUrl={pdfUrl} fileName={fileName} />}
      </Dialog>

      <AdjustPrintLaporan
        adjustDialog={adjustPrintDialog}
        setAdjustDialog={setAdjustPrintDialog}
        dataToPrint={dataList}
        masterData={masterData}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
        judulLaporan="LAPORAN DATA PEMBELIAN"
        columnOptions={[
          { name: "No. Invoice", value: "NO_INVOICE_BELI" },
          { name: "Vendor", value: "NAMA_VENDOR" },
          { name: "Alamat Vendor", value: "ALAMAT_VENDOR" },
          { name: "Status", value: "STATUS_BAYAR" },
          { name: "Sisa Tagihan", value: "SISA_TAGIHAN" },
        ]}
      />
    </div>
  );
}
