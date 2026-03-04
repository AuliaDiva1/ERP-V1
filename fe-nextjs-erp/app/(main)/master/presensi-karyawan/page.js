"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";

import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import HeaderBar from "../../../components/headerbar";
import FormPresensiMasuk from "./components/FormPresensiMasuk";
import FormPresensiPulang from "./components/FormPresensiPulang";
import DetailPresensiKaryawan from "./components/DetailPresensiKaryawan";
import AdjustPrintPresensiKaryawan from "./print/AdjustPrintPresensiKaryawan";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api").replace(/\/+$/g, "");

export default function PresensiKaryawanPage() {
  const toastRef  = useRef(null);
  const isMounted = useRef(true);

  const [dataList, setDataList]               = useState([]);
  const [originalData, setOriginalData]       = useState([]);
  const [isLoading, setIsLoading]             = useState(false);
  const [selectedData, setSelectedData]       = useState(null);
  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [modals, setModals] = useState({
    masuk: false, pulang: false, detail: false, print: false,
  });
  const [pdfUrl, setPdfUrl]                     = useState(null);
  const [fileName, setFileName]                 = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  const stats = {
    total:       dataList.length,
    hadir:       dataList.filter((d) => d.STATUS === "Hadir").length,
    izin:        dataList.filter((d) => d.STATUS === "Izin").length,
    sakit:       dataList.filter((d) => d.STATUS === "Sakit").length,
    belumPulang: dataList.filter((d) => d.JAM_MASUK && !d.JAM_KELUAR).length,
    terlambat:   dataList.filter((d) => d.IS_TERLAMBAT == 1).length,
  };

  useEffect(() => {
    fetchData();
    fetchKaryawanList();
    return () => { isMounted.current = false; };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-presensi/rekap`);
      if (res.data.status === "success") {
        setDataList(res.data.data || []);
        setOriginalData(res.data.data || []);
      }
    } catch {
      toastRef.current?.showToast("01", "Gagal memuat data presensi");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const fetchKaryawanList = async () => {
    try {
      const res = await axios.get(`${API_URL}/master-presensi/list-karyawan`, {
        params: { _t: Date.now() },
      });
      if (res.data.status === "success") {
        setKaryawanOptions(
          res.data.data.map((k) => ({
            label: `${k.NAMA}${k.JABATAN ? " — " + k.JABATAN : ""}`,
            value: k.KARYAWAN_ID,
          }))
        );
      }
    } catch { console.error("Gagal load karyawan"); }
  };

  const handleSearch = (keyword) => {
    if (!keyword) { setDataList(originalData); return; }
    const kw = keyword.toLowerCase();
    setDataList(
      originalData.filter((v) =>
        v.NAMA_KARYAWAN?.toLowerCase().includes(kw) ||
        v.KARYAWAN_ID?.toLowerCase().includes(kw) ||
        v.STATUS?.toLowerCase().includes(kw)
      )
    );
  };

  const handleSaveMasuk = async (formData) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/master-presensi/masuk`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "success") {
        toastRef.current?.showToast("00", "Presensi masuk berhasil dicatat");
        setModals((p) => ({ ...p, masuk: false }));
        fetchData();
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal simpan");
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal simpan presensi masuk");
    } finally { setIsLoading(false); }
  };

  const handleSavePulang = async (formData) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/master-presensi/pulang`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "success") {
        toastRef.current?.showToast("00", "Presensi pulang berhasil dicatat");
        setModals((p) => ({ ...p, pulang: false }));
        fetchData();
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal simpan");
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal simpan presensi pulang");
    } finally { setIsLoading(false); }
  };

  const handleDelete = (rowData) => {
    confirmDialog({
      message: `Hapus data presensi "${rowData.NAMA_KARYAWAN}" tanggal ${new Date(rowData.TANGGAL).toLocaleDateString("id-ID")}?`,
      header: "Konfirmasi Penghapusan",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Ya, Hapus",
      rejectLabel: "Batal",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          const res = await axios.delete(`${API_URL}/master-presensi/${rowData.ID}`);
          if (res.data.status === "success") {
            toastRef.current?.showToast("00", "Data berhasil dihapus");
            fetchData();
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal menghapus");
          }
        } catch {
          toastRef.current?.showToast("01", "Terjadi kesalahan saat menghapus");
        }
      },
    });
  };

  /* ---- STAT CARD ---- */
  const StatCard = ({ label, value, icon, borderColor, bgColor, desc }) => (
    <div className="col-6 md:col-2">
      <div
        className={`${bgColor} border-round-xl p-3 shadow-1 h-full`}
        style={{ borderLeft: `4px solid ${borderColor}` }}
      >
        <div className="flex justify-content-between align-items-start">
          <div>
            <div className="text-3xl font-black text-900 mb-1">
              {isLoading ? <Skeleton width="2rem" height="1.8rem" /> : value}
            </div>
            <div className="text-xs font-bold text-500 uppercase">{label}</div>
            {desc && <div className="text-xs text-400 mt-1 italic">{desc}</div>}
          </div>
          <i className={`${icon} text-2xl`} style={{ color: borderColor }}></i>
        </div>
      </div>
    </div>
  );

  /* ---- COLUMNS ---- */
  const columns = [
    {
      field: "KARYAWAN_ID",
      header: "ID Karyawan",
      sortable: true,
      body: (r) => (
        <code className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 border-round">
          {r.KARYAWAN_ID}
        </code>
      ),
    },
    { field: "NAMA_KARYAWAN", header: "Nama Karyawan", sortable: true },
    {
      field: "TANGGAL",
      header: "Tanggal",
      sortable: true,
      body: (r) =>
        new Date(r.TANGGAL).toLocaleDateString("id-ID", {
          weekday: "short", day: "2-digit", month: "short", year: "numeric",
        }),
    },
    {
      header: "Jam Masuk",
      body: (r) => (
        <div className="flex align-items-center gap-1">
          <i className="pi pi-sign-in text-teal-500 text-xs"></i>
          <span className="font-mono font-bold text-teal-700">
            {r.JAM_MASUK?.substring(0, 5) || "-"}
          </span>
          {r.IS_TERLAMBAT == 1 && (
            <Tag value="Terlambat" severity="danger" className="text-xs ml-1" />
          )}
        </div>
      ),
    },
    {
      header: "Jam Pulang",
      body: (r) => (
        <div className="flex align-items-center gap-1">
          <i className={`pi pi-sign-out text-xs ${r.JAM_KELUAR ? "text-orange-500" : "text-300"}`}></i>
          <span className={`font-mono font-bold ${r.JAM_KELUAR ? "text-orange-700" : "text-400 italic"}`}>
            {r.JAM_KELUAR?.substring(0, 5) || "Belum Pulang"}
          </span>
          {r.IS_PULANG_AWAL == 1 && (
            <Tag value="Awal" severity="warning" className="text-xs ml-1" />
          )}
        </div>
      ),
    },
    {
      header: "Durasi",
      body: (r) => {
        if (!r.JAM_MASUK || !r.JAM_KELUAR)
          return <span className="text-400 text-xs italic">—</span>;
        const [hM, mM] = r.JAM_MASUK.split(":").map(Number);
        const [hK, mK] = r.JAM_KELUAR.split(":").map(Number);
        const total = hK * 60 + mK - (hM * 60 + mM);
        if (total <= 0) return <span className="text-400 text-xs italic">—</span>;
        return (
          <span className="font-mono text-sm font-bold text-indigo-600">
            {Math.floor(total / 60)}j {total % 60}m
          </span>
        );
      },
    },
    {
      field: "STATUS",
      header: "Status",
      sortable: true,
      body: (r) => (
        <Tag
          value={r.STATUS}
          severity={
            r.STATUS === "Hadir"      ? "success" :
            r.STATUS === "Sakit"      ? "warning" :
            r.STATUS === "Izin"       ? "info"    : "danger"
          }
          rounded
        />
      ),
    },
    {
      header: "Keterangan",
      body: (r) => (
        <span className="text-xs text-600 italic">
          {r.KETERANGAN || <span className="text-300">—</span>}
        </span>
      ),
    },
    {
      header: "Aksi",
      style: { width: "120px" },
      body: (rowData) => (
        <div className="flex gap-1">
          {!rowData.JAM_KELUAR && (
            <Button
              icon="pi pi-sign-out"
              size="small"
              severity="warning"
              tooltip="Absen Pulang"
              tooltipOptions={{ position: "top" }}
              onClick={() => {
                setSelectedData(rowData);
                setModals((p) => ({ ...p, pulang: true }));
              }}
            />
          )}
          <Button
            icon="pi pi-eye"
            size="small"
            severity="info"
            tooltip="Lihat Detail"
            tooltipOptions={{ position: "top" }}
            onClick={() => {
              setSelectedData(rowData);
              setModals((p) => ({ ...p, detail: true }));
            }}
          />
          <Button
            icon="pi pi-trash"
            size="small"
            severity="danger"
            tooltip="Hapus Data"
            tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(rowData)}
          />
        </div>
      ),
    },
  ];

  /* ---- RENDER ---- */
  return (
    <div className="flex flex-column gap-3 p-3 md:p-4">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      {/* ===== PAGE HEADER ===== */}
      <div className="surface-0 border-round-2xl shadow-2 p-4"
           style={{ borderLeft: "5px solid #6366f1" }}>
        <div className="flex flex-column md:flex-row md:align-items-center justify-content-between gap-3">
          <div>
            <div className="flex align-items-center gap-2 mb-1">
              <i className="pi pi-calendar-clock text-indigo-600 text-2xl"></i>
              <h2 className="m-0 text-2xl font-black text-900">Manajemen Presensi Karyawan</h2>
            </div>
            {/* ← Deskripsi tanpa nama perusahaan */}
            <p className="m-0 text-500 text-sm mt-1">
              Kelola data kehadiran, jam masuk, jam pulang, dan rekap harian karyawan secara terpusat.
            </p>
            <div className="flex align-items-center gap-2 mt-2 text-400 text-xs">
              <i className="pi pi-calendar"></i>
              <span>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long", day: "2-digit", month: "long", year: "numeric",
                })}
              </span>
              <span className="mx-1">·</span>
              <i className="pi pi-database"></i>
              <span>{stats.total} total record</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              icon="pi pi-print"
              label="Cetak Laporan"
              severity="secondary"
              outlined
              onClick={() => setModals((p) => ({ ...p, print: true }))}
            />
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              severity="secondary"
              outlined
              loading={isLoading}
              onClick={fetchData}
            />
            <Button
              icon="pi pi-plus"
              label="Catat Absen Masuk"
              severity="success"
              onClick={() => {
                setSelectedData(null);
                setModals((p) => ({ ...p, masuk: true }));
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== STATISTIK ===== */}
      <div className="grid m-0 gap-2">
        <StatCard label="Total Record"   value={stats.total}       icon="pi pi-list"               borderColor="#6366f1" bgColor="surface-0"    desc="Semua data" />
        <StatCard label="Hadir"          value={stats.hadir}       icon="pi pi-check-circle"       borderColor="#22c55e" bgColor="bg-green-50"  desc="Status hadir" />
        <StatCard label="Izin"           value={stats.izin}        icon="pi pi-file-edit"          borderColor="#3b82f6" bgColor="bg-blue-50"   desc="Izin resmi" />
        <StatCard label="Sakit"          value={stats.sakit}       icon="pi pi-heart"              borderColor="#f97316" bgColor="bg-orange-50" desc="Surat sakit" />
        <StatCard label="Belum Pulang"   value={stats.belumPulang} icon="pi pi-clock"              borderColor="#eab308" bgColor="bg-yellow-50" desc="Masih bekerja" />
        <StatCard label="Terlambat"      value={stats.terlambat}   icon="pi pi-exclamation-circle" borderColor="#ef4444" bgColor="bg-red-50"    desc="Lewat jam masuk" />
      </div>

      {/* ===== TABEL ===== */}
      <div className="surface-0 border-round-xl shadow-2 overflow-hidden">
        <div className="flex align-items-center justify-content-between px-4 py-3 border-bottom-1 border-200">
          <div className="flex align-items-center gap-2">
            <i className="pi pi-table text-indigo-500"></i>
            <span className="font-bold text-900">Data Rekap Presensi</span>
            <Tag value={`${dataList.length} data`} severity="info" rounded />
          </div>
        </div>

        <div className="px-4 pt-3">
          <HeaderBar
            onSearch={handleSearch}
            showAddButton={false}
            placeholder="Cari nama, ID, atau status karyawan..."
          />
        </div>

        <CustomDataTable
          data={dataList}
          loading={isLoading}
          columns={columns}
          emptyMessage="Tidak ada data presensi. Gunakan tombol 'Catat Absen Masuk' di atas."
        />
      </div>

      {/* ===== DIALOGS ===== */}
      <FormPresensiMasuk
        visible={modals.masuk}
        onHide={() => setModals((p) => ({ ...p, masuk: false }))}
        onSave={handleSaveMasuk}
        isLoading={isLoading}
        karyawanOptions={karyawanOptions}
      />
      <FormPresensiPulang
        visible={modals.pulang}
        onHide={() => setModals((p) => ({ ...p, pulang: false }))}
        onSave={handleSavePulang}
        isLoading={isLoading}
        userKaryawanId={selectedData?.KARYAWAN_ID}
      />
      <DetailPresensiKaryawan
        visible={modals.detail}
        onHide={() => setModals((p) => ({ ...p, detail: false }))}
        data={selectedData}
      />
      <AdjustPrintPresensiKaryawan
        visible={modals.print}
        onHide={() => setModals((p) => ({ ...p, print: false }))}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* ===== PDF PREVIEW ===== */}
      {jsPdfPreviewOpen && pdfUrl && (
        <div
          className="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 9999 }}
        >
          <div
            className="bg-white border-round-xl shadow-8 overflow-hidden flex flex-column"
            style={{ width: "92vw", height: "92vh" }}
          >
            <div className="flex align-items-center justify-content-between p-3 border-bottom-1 border-200 surface-50">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-file-pdf text-red-500 text-xl"></i>
                <span className="font-bold text-900">{fileName}</span>
              </div>
              <div className="flex gap-2">
                <a href={pdfUrl} download={fileName}>
                  <Button icon="pi pi-download" label="Unduh PDF" severity="success" size="small" />
                </a>
                <Button
                  icon="pi pi-times"
                  severity="secondary"
                  size="small"
                  onClick={() => setJsPdfPreviewOpen(false)}
                />
              </div>
            </div>
            <iframe src={pdfUrl} className="flex-1 w-full" style={{ border: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
}