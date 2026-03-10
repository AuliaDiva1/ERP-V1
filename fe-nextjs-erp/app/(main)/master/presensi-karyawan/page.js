"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Card } from "primereact/card";
import { ProgressBar } from "primereact/progressbar";
import { Avatar } from "primereact/avatar";
import ToastNotifier from "../../../components/ToastNotifier";
import CustomDataTable from "../../../components/DataTable";
import HeaderBar from "../../../components/headerbar";
import FormPresensiMasuk from "./components/FormPresensiMasuk";
import FormPresensiPulang from "./components/FormPresensiPulang";
import DetailPresensiKaryawan from "./components/DetailPresensiKaryawan";
import AdjustPrintPresensiKaryawan from "./print/AdjustPrintPresensiKaryawan";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api").replace(/\/+$/g, "");

const toYMD = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const getStatusSeverity = (status) => {
  if (status === "Hadir") return "success";
  if (status === "Sakit") return "warning";
  if (status === "Izin")  return "info";
  return "danger";
};

// Generate daftar 12 bulan terakhir + bulan depan untuk dropdown
const generateBulanOptions = () => {
  const now = new Date();
  const options = [];
  // dari 11 bulan lalu sampai bulan ini (12 total)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      year: d.getFullYear(),
      month: d.getMonth(), // 0-indexed
    });
  }
  return options;
};

export default function PresensiKaryawanPage() {
  const router    = useRouter();
  const toastRef  = useRef(null);
  const isMounted = useRef(true);

  const [token,           setToken]           = useState("");
  const [dataList,        setDataList]        = useState([]);
  const [originalData,    setOriginalData]    = useState([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [selectedData,    setSelectedData]    = useState(null);
  const [karyawanOptions, setKaryawanOptions] = useState([]);
  const [modals, setModals] = useState({
    masuk: false, pulang: false, detail: false, print: false,
  });
  const [pdfUrl,           setPdfUrl]           = useState(null);
  const [fileName,         setFileName]         = useState("");
  const [jsPdfPreviewOpen, setJsPdfPreviewOpen] = useState(false);

  // ─── Bulan dropdown ─────────────────────────────────────────
  const bulanOptions = generateBulanOptions();

  // Default: bulan berjalan
  const now = new Date();
  const defaultBulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedBulan, setSelectedBulan] = useState(defaultBulan);

  // Hitung startDate & endDate dari selectedBulan
  const getDateRange = (bulanValue) => {
    const [year, month] = bulanValue.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 0); // hari terakhir bulan
    return { start, end };
  };

  // ─── Stats ─────────────────────────────────────────────────
  const stats = {
    total:       dataList.length,
    hadir:       dataList.filter((d) => d.STATUS === "Hadir").length,
    izin:        dataList.filter((d) => d.STATUS === "Izin").length,
    sakit:       dataList.filter((d) => d.STATUS === "Sakit").length,
    cuti:        dataList.filter((d) => d.STATUS === "Cuti").length,
    alpa:        dataList.filter((d) => d.STATUS === "Alpa").length,
    belumPulang: dataList.filter((d) => d.JAM_MASUK && !d.JAM_KELUAR).length,
    terlambat:   dataList.filter((d) => d.IS_TERLAMBAT == 1).length,
    pulangAwal:  dataList.filter((d) => d.IS_PULANG_AWAL == 1).length,
  };

  const perKaryawan = Object.values(
    dataList.reduce((acc, row) => {
      const id = row.KARYAWAN_ID;
      if (!acc[id]) acc[id] = { id, nama: row.NAMA_KARYAWAN, hadir: 0, alpa: 0, terlambat: 0 };
      if (row.STATUS === "Hadir") acc[id].hadir++;
      if (row.STATUS === "Alpa")  acc[id].alpa++;
      if (row.IS_TERLAMBAT == 1)  acc[id].terlambat++;
      return acc;
    }, {})
  );
  const topHadir     = [...perKaryawan].sort((a, b) => b.hadir - a.hadir).slice(0, 5);
  const topTerlambat = [...perKaryawan].filter((k) => k.terlambat > 0).sort((a, b) => b.terlambat - a.terlambat).slice(0, 5);

  // ─── Init: ambil token ────────────────────────────────────
  useEffect(() => {
    const t = localStorage.getItem("TOKEN");
    if (!t) {
      router.push("/");
      return;
    }
    setToken(t);
    return () => { isMounted.current = false; };
  }, [router]);

  // ─── Fetch saat token pertama kali tersedia (pakai bulan default) ──
  useEffect(() => {
    if (token) {
      const { start, end } = getDateRange(selectedBulan);
      doFetch(start, end, token);
      fetchKaryawanList(token);
    }
  }, [token]);

  // ─── Fetch ulang setiap kali dropdown bulan berubah ──────
  useEffect(() => {
    if (!token) return;
    const { start, end } = getDateRange(selectedBulan);
    doFetch(start, end, token);
  }, [selectedBulan]);

  // ─── Fetch rekap (protected) ─────────────────────────────
  const doFetch = async (sd, ed, t = token) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/master-presensi/rekap`, {
        params: { start_date: toYMD(sd), end_date: toYMD(ed) },
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.data.status === "success") {
        setDataList(res.data.data || []);
        setOriginalData(res.data.data || []);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        toastRef.current?.showToast("01", "Sesi habis, silakan login kembali");
        router.push("/");
      } else {
        toastRef.current?.showToast("01", "Gagal memuat data presensi");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // ─── Fetch list karyawan ──────────────────────────────────
  const fetchKaryawanList = async () => {
    try {
      const res = await axios.get(`${API_URL}/master-presensi/list-karyawan`);
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

  // ─── Save masuk ───────────────────────────────────────────
  const handleSaveMasuk = async (formData) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/master-presensi/masuk`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "success") {
        toastRef.current?.showToast("00", "Presensi masuk berhasil dicatat");
        setModals((p) => ({ ...p, masuk: false }));
        const { start, end } = getDateRange(selectedBulan);
        doFetch(start, end, token);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal simpan");
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal simpan presensi masuk");
    } finally { setIsLoading(false); }
  };

  // ─── Save pulang ──────────────────────────────────────────
  const handleSavePulang = async (formData) => {
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/master-presensi/pulang`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.status === "success") {
        toastRef.current?.showToast("00", "Presensi pulang berhasil dicatat");
        setModals((p) => ({ ...p, pulang: false }));
        const { start, end } = getDateRange(selectedBulan);
        doFetch(start, end, token);
      } else {
        toastRef.current?.showToast("01", res.data.message || "Gagal simpan");
      }
    } catch (err) {
      toastRef.current?.showToast("01", err.response?.data?.message || "Gagal simpan presensi pulang");
    } finally { setIsLoading(false); }
  };

  // ─── Delete ───────────────────────────────────────────────
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
          const res = await axios.delete(`${API_URL}/master-presensi/${rowData.ID}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.status === "success") {
            toastRef.current?.showToast("00", "Data berhasil dihapus");
            const { start, end } = getDateRange(selectedBulan);
            doFetch(start, end, token);
          } else {
            toastRef.current?.showToast("01", res.data.message || "Gagal menghapus");
          }
        } catch (err) {
          if (err.response?.status === 403) {
            toastRef.current?.showToast("01", "Anda tidak memiliki izin untuk menghapus data");
          } else {
            toastRef.current?.showToast("01", "Terjadi kesalahan saat menghapus");
          }
        }
      },
    });
  };

  const openModal  = (key, row) => { if (row !== undefined) setSelectedData(row); setModals((p) => ({ ...p, [key]: true })); };
  const closeModal = (key) => setModals((p) => ({ ...p, [key]: false }));

  // ─── Columns ─────────────────────────────────────────────
  const columns = [
    {
      field: "KARYAWAN_ID", header: "ID Karyawan", sortable: true,
      body: (r) => <span>{r.KARYAWAN_ID}</span>,
    },
    { field: "NAMA_KARYAWAN", header: "Nama Karyawan", sortable: true },
    {
      field: "TANGGAL", header: "Tanggal", sortable: true,
      body: (r) => new Date(r.TANGGAL).toLocaleDateString("id-ID", {
        weekday: "short", day: "2-digit", month: "short", year: "numeric",
      }),
    },
    {
      header: "Jam Masuk",
      body: (r) => (
        <div className="flex align-items-center gap-1">
          <i className="pi pi-sign-in text-teal-500 text-xs" />
          <span className="font-mono font-bold text-teal-700">{r.JAM_MASUK?.substring(0, 5) || "—"}</span>
          {r.IS_TERLAMBAT == 1 && <Tag value="Terlambat" severity="danger" className="text-xs ml-1" />}
        </div>
      ),
    },
    {
      header: "Jam Pulang",
      body: (r) => (
        <div className="flex align-items-center gap-1">
          <i className={`pi pi-sign-out text-xs ${r.JAM_KELUAR ? "text-orange-500" : "text-300"}`} />
          <span className={`font-mono font-bold ${r.JAM_KELUAR ? "text-orange-700" : "text-400 italic"}`}>
            {r.JAM_KELUAR?.substring(0, 5) || "Belum Pulang"}
          </span>
          {r.IS_PULANG_AWAL == 1 && <Tag value="Awal" severity="warning" className="text-xs ml-1" />}
        </div>
      ),
    },
    {
      header: "Durasi",
      body: (r) => {
        if (!r.JAM_MASUK || !r.JAM_KELUAR) return <span className="text-400 text-xs italic">—</span>;
        const [hM, mM] = r.JAM_MASUK.split(":").map(Number);
        const [hK, mK] = r.JAM_KELUAR.split(":").map(Number);
        const total = hK * 60 + mK - (hM * 60 + mM);
        if (total <= 0) return <span className="text-400 text-xs italic">—</span>;
        return <span className="font-mono text-sm font-bold text-indigo-600">{Math.floor(total / 60)}j {total % 60}m</span>;
      },
    },
    {
      field: "STATUS", header: "Status", sortable: true,
      body: (r) => <Tag value={r.STATUS} rounded severity={getStatusSeverity(r.STATUS)} />,
    },
    {
      header: "Keterangan",
      body: (r) => <span>{r.KETERANGAN || "—"}</span>,
    },
    {
      header: "Aksi", style: { width: "120px" },
      body: (r) => (
        <div className="flex gap-1">
          {!r.JAM_KELUAR && (
            <Button icon="pi pi-sign-out" size="small" severity="warning"
              tooltip="Absen Pulang" tooltipOptions={{ position: "top" }}
              onClick={() => openModal("pulang", r)} />
          )}
          <Button icon="pi pi-eye" size="small" severity="info"
            tooltip="Lihat Detail" tooltipOptions={{ position: "top" }}
            onClick={() => openModal("detail", r)} />
          <Button icon="pi pi-trash" size="small" severity="danger"
            tooltip="Hapus Data" tooltipOptions={{ position: "top" }}
            onClick={() => handleDelete(r)} />
        </div>
      ),
    },
  ];

  // ─── Label bulan aktif untuk badge ───────────────────────
  const activeBulanLabel = bulanOptions.find((b) => b.value === selectedBulan)?.label || "";
  const { start: activeStart, end: activeEnd } = getDateRange(selectedBulan);

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="card p-0">
      <ToastNotifier ref={toastRef} />
      <ConfirmDialog />

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3 border-bottom-1 surface-border">
        <div className="flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <div className="flex align-items-center gap-2 mb-1">
              <i className="pi pi-calendar-clock text-primary text-2xl" />
              <h2 className="m-0 text-2xl font-bold text-900">Manajemen Presensi Karyawan</h2>
            </div>
            <p className="m-0 text-500 text-sm mt-1">
              Kelola data kehadiran, jam masuk, jam pulang, dan rekap harian karyawan secara terpusat.
            </p>
          </div>
        </div>

        {/* ── Filter Bulan + Aksi ── */}
        <div className="flex align-items-end justify-content-between gap-3 mt-4 flex-wrap">
          <div className="flex align-items-end gap-3 flex-wrap">

            {/* Dropdown pilih bulan */}
            <div>
              <label className="block text-sm font-medium text-700 mb-2">
                <i className="pi pi-calendar mr-1" />
                Pilih Bulan
              </label>
              <Dropdown
                value={selectedBulan}
                options={bulanOptions}
                onChange={(e) => setSelectedBulan(e.value)}
                optionLabel="label"
                optionValue="value"
                placeholder="Pilih bulan..."
                className="w-15rem"
              />
            </div>

            {/* Badge rentang tanggal aktif */}
            <div className="flex align-items-center gap-2 pb-1">
              <Tag
                value={`${activeStart.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })} — ${activeEnd.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`}
                severity="info"
                icon="pi pi-calendar"
                rounded
              />
              <Button
                icon="pi pi-refresh"
                size="small"
                severity="secondary"
                outlined
                loading={isLoading}
                tooltip="Refresh Data"
                tooltipOptions={{ position: "top" }}
                onClick={() => {
                  const { start, end } = getDateRange(selectedBulan);
                  doFetch(start, end, token);
                }}
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex align-items-end gap-2 flex-wrap">
            <Button icon="pi pi-print" label="Cetak Laporan" severity="secondary" outlined
              onClick={() => openModal("print")} />
            <Button icon="pi pi-plus" label="Catat Absen Masuk"
              onClick={() => openModal("masuk", null)} />
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="grid">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="col-12 md:col-4"><Skeleton height="100px" className="border-round-xl" /></div>
            ))}
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid mb-4">
              {[
                { icon: "pi pi-list",               color: "#6366f1", label: "Total Record",  value: stats.total,       sub: "Semua data" },
                { icon: "pi pi-check-circle",       color: "#22c55e", label: "Hadir",          value: stats.hadir,       sub: "Status hadir" },
                { icon: "pi pi-file-edit",          color: "#3b82f6", label: "Izin",           value: stats.izin,        sub: "Izin resmi" },
                { icon: "pi pi-heart",              color: "#f59e0b", label: "Sakit",          value: stats.sakit,       sub: "Surat sakit" },
                { icon: "pi pi-clock",              color: "#eab308", label: "Belum Pulang",   value: stats.belumPulang, sub: "Masih bekerja" },
                { icon: "pi pi-exclamation-circle", color: "#ef4444", label: "Terlambat",      value: stats.terlambat,   sub: "Lewat jam masuk" },
              ].map((kpi) => (
                <div key={kpi.label} className="col-12 md:col-4 lg:col-2">
                  <div className="surface-card border-round-xl shadow-2 p-4" style={{ borderLeft: `4px solid ${kpi.color}` }}>
                    <div className="flex align-items-center gap-2 mb-2">
                      <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }} />
                      <span className="text-500 text-xs font-medium uppercase">{kpi.label}</span>
                    </div>
                    <div className="font-bold text-2xl text-900">{kpi.value}</div>
                    <div className="text-500 text-xs mt-1">{kpi.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Distribusi + Top Karyawan ── */}
            <div className="grid mb-4">
              <div className="col-12 md:col-4">
                <Card title="Distribusi Status" className="shadow-2 h-full">
                  <div className="flex flex-column gap-3">
                    {[
                      { label: "Hadir", value: stats.hadir,  color: "#22c55e" },
                      { label: "Alpa",  value: stats.alpa,   color: "#ef4444" },
                      { label: "Izin",  value: stats.izin,   color: "#3b82f6" },
                      { label: "Sakit", value: stats.sakit,  color: "#f59e0b" },
                      { label: "Cuti",  value: stats.cuti,   color: "#8b5cf6" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-content-between align-items-center mb-1">
                          <span className="text-600 text-sm">{item.label}</span>
                          <span className="font-bold" style={{ color: item.color }}>{item.value}</span>
                        </div>
                        <ProgressBar value={stats.total ? Math.round((item.value / stats.total) * 100) : 0}
                          showValue={false} style={{ height: 8, borderRadius: 4 }}
                          pt={{ value: { style: { background: item.color, borderRadius: 4 } } }} />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="col-12 md:col-4">
                <Card title={<div className="flex align-items-center gap-2"><span className="text-xl">🏆</span><span>Kehadiran Tertinggi</span></div>} className="shadow-2 h-full">
                  {topHadir.length === 0 ? (
                    <p className="text-500 text-center py-4">Tidak ada data</p>
                  ) : topHadir.map((item, idx) => (
                    <div key={item.id} className="flex align-items-center gap-3 mb-3 p-2 surface-50 border-round">
                      <div className="flex align-items-center justify-content-center border-round-full flex-shrink-0"
                        style={{ width: 32, height: 32, minWidth: 32, background: "#22c55e22" }}>
                        <span className="text-green-600 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <Avatar label={item.nama?.charAt(0)} size="normal" shape="circle"
                        style={{ background: "#22c55e22", color: "#22c55e" }} />
                      <div className="flex-1">
                        <div className="font-semibold text-900 text-sm">{item.nama}</div>
                        <div className="text-500 text-xs">{item.hadir} hari hadir</div>
                      </div>
                      <span className="font-bold text-lg text-green-600">{item.hadir}</span>
                    </div>
                  ))}
                </Card>
              </div>

              <div className="col-12 md:col-4">
                <Card title={<div className="flex align-items-center gap-2"><span className="text-xl">⚠️</span><span>Sering Terlambat</span></div>} className="shadow-2 h-full">
                  {topTerlambat.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="pi pi-check-circle text-3xl text-green-400 mb-2 block" />
                      <p className="text-500 text-sm">Tidak ada keterlambatan</p>
                    </div>
                  ) : topTerlambat.map((item, idx) => (
                    <div key={item.id} className="flex align-items-center gap-3 mb-3 p-2 surface-50 border-round">
                      <div className="flex align-items-center justify-content-center border-round-full flex-shrink-0"
                        style={{ width: 32, height: 32, minWidth: 32, background: "#ef444422" }}>
                        <span className="text-red-600 font-bold text-sm">{idx + 1}</span>
                      </div>
                      <Avatar label={item.nama?.charAt(0)} size="normal" shape="circle"
                        style={{ background: "#ef444422", color: "#ef4444" }} />
                      <div className="flex-1">
                        <div className="font-semibold text-900 text-sm">{item.nama}</div>
                        <div className="text-500 text-xs">{item.terlambat}× terlambat</div>
                      </div>
                      <span className="font-bold text-lg text-red-500">{item.terlambat}</span>
                    </div>
                  ))}
                </Card>
              </div>
            </div>

            {/* ── Alert Belum Pulang ── */}
            {stats.belumPulang > 0 && (
              <div className="mb-4">
                <div className="surface-card border-round-xl shadow-2 p-4" style={{ border: "1px solid #eab30840" }}>
                  <div className="flex align-items-center gap-3">
                    <div className="flex align-items-center justify-content-center border-round-full"
                      style={{ width: 44, height: 44, background: "#eab30822", flexShrink: 0 }}>
                      <i className="pi pi-clock text-yellow-600 text-xl" />
                    </div>
                    <div>
                      <div className="font-bold text-900">{stats.belumPulang} Karyawan Belum Absen Pulang</div>
                      <div className="text-500 text-sm">Sudah absen masuk tapi belum mencatat jam pulang pada periode ini</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Tabel ── */}
            <Card className="shadow-2">
              <div className="flex align-items-center justify-content-between mb-3">
                <div className="flex align-items-center gap-2">
                  <i className="pi pi-table text-primary" />
                  <span className="font-semibold text-700">Data Presensi</span>
                  <Tag value={`${dataList.length} data`} severity="info" rounded />
                  <Tag value={activeBulanLabel} severity="secondary" rounded icon="pi pi-calendar" />
                </div>
              </div>
              <HeaderBar
                onSearch={handleSearch}
                showAddButton={false}
                placeholder="Cari nama, ID, atau status karyawan..."
              />
              <CustomDataTable
                data={dataList}
                loading={isLoading}
                columns={columns}
                emptyMessage="Tidak ada data presensi. Gunakan tombol 'Catat Absen Masuk' di atas."
              />
            </Card>
          </>
        )}
      </div>

      {/* ── Dialogs ── */}
      <FormPresensiMasuk
        visible={modals.masuk}
        onHide={() => closeModal("masuk")}
        onSave={handleSaveMasuk}
        isLoading={isLoading}
        karyawanOptions={karyawanOptions}
      />
      <FormPresensiPulang
        visible={modals.pulang}
        onHide={() => closeModal("pulang")}
        onSave={handleSavePulang}
        isLoading={isLoading}
        userKaryawanId={selectedData?.KARYAWAN_ID}
      />
      <DetailPresensiKaryawan
        visible={modals.detail}
        onHide={() => closeModal("detail")}
        data={selectedData}
      />
      <AdjustPrintPresensiKaryawan
        visible={modals.print}
        onHide={() => closeModal("print")}
        setPdfUrl={setPdfUrl}
        setFileName={setFileName}
        setJsPdfPreviewOpen={setJsPdfPreviewOpen}
      />

      {/* ── PDF Preview Overlay ── */}
      {jsPdfPreviewOpen && pdfUrl && (
        <div className="fixed top-0 left-0 w-full h-full flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", zIndex: 9999 }}>
          <div className="bg-white border-round-xl shadow-8 overflow-hidden flex flex-column"
            style={{ width: "92vw", height: "92vh" }}>
            <div className="flex align-items-center justify-content-between p-3 border-bottom-1 surface-border surface-50">
              <div className="flex align-items-center gap-2">
                <i className="pi pi-file-pdf text-red-500 text-xl" />
                <span className="font-bold text-900">{fileName}</span>
              </div>
              <div className="flex gap-2">
                <a href={pdfUrl} download={fileName}>
                  <Button icon="pi pi-download" label="Unduh PDF" severity="success" size="small" />
                </a>
                <Button icon="pi pi-times" severity="secondary" size="small" onClick={() => setJsPdfPreviewOpen(false)} />
              </div>
            </div>
            <iframe src={pdfUrl} className="flex-1 w-full" style={{ border: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
}
